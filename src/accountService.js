import { supabase } from "./supabaseClient";
import { supabaseConfigured } from "./supabaseConfig";

function requireSupabase() {
  if (!supabaseConfigured || !supabase) {
    throw new Error("Supabase aún no está configurado.");
  }
}

export async function registerAccount({
  displayName,
  email,
  password,
  role,
  institution,
  countryCity,
}) {
  requireSupabase();

  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        display_name: displayName.trim(),
        requested_role: role,
        institution: role === "teacher" ? institution.trim() : "",
        country_city: role === "teacher" ? countryCity.trim() : "",
      },
    },
  });

  if (error) throw error;
  return {
    user: data.user,
    needsEmailConfirmation: !data.session,
  };
}

export async function signInAccount(email, password) {
  requireSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function sendPasswordReset(email) {
  requireSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    { redirectTo: window.location.origin }
  );
  if (error) throw error;
}

export async function updateAccountPassword(password) {
  requireSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
