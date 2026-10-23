import { supabase } from "./supabaseClient";

export function observeAccount(onProfile, onError, onPasswordRecovery = () => {}) {
  let active = true;
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY" && active) {
      onPasswordRecovery();
    }

    if (!session) {
      if (active) onProfile(null);
      return;
    }

    const user = session.user;
    queueMicrotask(async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();
        if (!active || currentSession?.user.id !== user.id) return;

        const { data: savedProfile, error } = await supabase
          .from("profiles")
          .select("id,email,display_name,role,institution,country_city")
          .eq("id", user.id)
          .maybeSingle();

        if (!active) return;
        if (error) {
          onError(error);
          return;
        }
        if (!savedProfile) {
          onError(
            new Error(
              "Tu cuenta existe, pero no encontramos el perfil. Confirma el correo si Supabase te lo solicitó y vuelve a iniciar sesión."
            )
          )
          return;
        }
        if (
          !["student", "teacher", "pending_teacher"].includes(savedProfile.role)
        ) {
          onError(new Error("El perfil de esta cuenta no tiene un rol válido."));
          return;
        }

        onProfile({
          id: savedProfile.id,
          name: savedProfile.display_name,
          email: savedProfile.email || user.email,
          role: savedProfile.role,
          institution: savedProfile.institution || "",
          countryCity: savedProfile.country_city || "",
        });
      } catch (error) {
        if (active) onError(error);
      }
    });
  });

  return () => {
    active = false;
    subscription.unsubscribe();
  };
}

export async function signOutAccount() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
