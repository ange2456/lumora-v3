import { useState } from "react";
import { BrainCircuit, GraduationCap, Users } from "lucide-react";
import "./AuthScreen.css";

function getAuthMessage(error) {
  const message = String(error.message || "").toLowerCase();
  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid_credentials")
  ) {
    return "El correo o la contraseña no son correctos.";
  }
  if (message.includes("already registered")) {
    return "Ese correo ya tiene una cuenta. Intenta iniciar sesión.";
  }
  if (message.includes("email not confirmed")) {
    return "Confirma tu correo desde el enlace que te enviamos y vuelve a iniciar sesión.";
  }
  if (message.includes("password") && message.includes("8")) {
    return "La contraseña debe tener al menos 8 caracteres.";
  }
  if (error.status === 429) {
    return "Hubo varios intentos seguidos. Espera un momento y vuelve a probar.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.";
  }
  return "No se pudo completar la solicitud. Revisa los datos y la configuración de Supabase.";
}

export default function AuthScreen({
  configured,
  onContinueDemo,
  profileError = "",
  onSignOut,
  recoveryMode = false,
  onPasswordUpdated,
}) {
  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdated, setPasswordUpdated] = useState(false);
  const [institution, setInstitution] = useState("");
  const [countryCity, setCountryCity] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!configured) {
      setError(
        "Agrega la configuración de Supabase para crear o iniciar sesión en una cuenta."
      );
      return;
    }

    if (mode === "register" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    setBusy(true);

    try {
      const { registerAccount, signInAccount } = await import(
        "./accountService"
      );

      if (mode === "register") {
        const registration = await registerAccount({
          displayName,
          email,
          password,
          role,
          institution,
          countryCity,
        });
        if (registration.needsEmailConfirmation) {
          setMessage(
            "Cuenta creada. Revisa tu correo y confirma la dirección antes de iniciar sesión."
          );
        } else if (role === "teacher") {
          setMessage(
            "Cuenta docente creada y activada. Ya puedes usar tu espacio docente."
          );
        }
      } else {
        await signInAccount(email, password);
      }
    } catch (authError) {
      console.error("No se pudo completar la autenticación:", authError);
      setError(getAuthMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Escribe tu correo para enviarte el enlace de recuperación.");
      return;
    }

    setBusy(true);

    try {
      const { sendPasswordReset } = await import("./accountService");
      await sendPasswordReset(email);
      setMessage("Si el correo está registrado, recibirás un enlace para cambiar tu contraseña.");
    } catch (authError) {
      console.error("No se pudo enviar el correo de recuperación:", authError);
      setError(getAuthMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  async function saveNewPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);
    try {
      const { updateAccountPassword } = await import("./accountService");
      await updateAccountPassword(newPassword);
      window.history.replaceState(
        {},
        document.title,
        `${window.location.pathname}${window.location.search}`
      );
      setPasswordUpdated(true);
      setMessage("Tu contraseña se actualizó correctamente.");
    } catch (authError) {
      console.error("No se pudo actualizar la contraseña:", authError);
      setError(getAuthMessage(authError));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="auth-brand" href="/" aria-label="Lumora">
          <span className="auth-brand-mark">
            <BrainCircuit size={27} />
          </span>
          <span>
            <strong>Lumora</strong>
            <small>Aprende a tu manera</small>
          </span>
        </a>

        {recoveryMode ? (
          <>
            <div className="auth-heading">
              <span className="auth-kicker">RECUPERACIÓN DE CUENTA</span>
              <h1>Elige una contraseña nueva</h1>
              <p>
                Usa al menos 8 caracteres para proteger tu cuenta de Lumora.
              </p>
            </div>
            {passwordUpdated ? (
              <>
                <p className="auth-message success" role="status">
                  {message}
                </p>
                <button
                  className="auth-primary"
                  type="button"
                  onClick={onPasswordUpdated}
                >
                  Continuar a Lumora
                </button>
              </>
            ) : (
              <form className="auth-form" onSubmit={saveNewPassword}>
                <label htmlFor="newPassword">Nueva contraseña</label>
                <input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
                <label htmlFor="confirmPassword">
                  Confirma la nueva contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
                {error && (
                  <p className="auth-message error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  className="auth-primary"
                  type="submit"
                  disabled={busy}
                >
                  {busy ? "Actualizando..." : "Guardar contraseña"}
                </button>
              </form>
            )}
          </>
        ) : !configured ? (
          <>
            <div className="auth-heading">
              <span className="auth-kicker">CUENTAS Y PERFILES</span>
              <h1>Conectemos Lumora</h1>
              <p>
                Para habilitar cuentas sincronizadas, configura las variables
                de Supabase en el archivo <code>.env.local</code>.
              </p>
            </div>
            <div className="auth-info" role="status">
              Supabase todavía no está configurado en este proyecto. Puedes
              continuar usando el prototipo local; sus datos no se sincronizan
              ni deben considerarse privados.
            </div>
            <button
              className="auth-primary"
              type="button"
              onClick={onContinueDemo}
            >
              Continuar en modo prototipo
            </button>
          </>
        ) : (
          <>
            <div className="auth-heading">
              <span className="auth-kicker">
                {mode === "login" ? "QUÉ BUENO VERTE" : "EMPIEZA TU CAMINO"}
              </span>
              <h1>
                {mode === "login" ? "Entra a tu espacio" : "Crea tu cuenta"}
              </h1>
              <p>
                {mode === "login"
                  ? "Accede a tu perfil personal de Lumora."
                  : "Usamos tu perfil para personalizar tu experiencia."}
              </p>
            </div>
            {profileError && (
              <div className="auth-message error" role="alert">
                {profileError}
                {onSignOut && (
                  <button
                    className="auth-text-button"
                    type="button"
                    onClick={onSignOut}
                  >
                    Cerrar sesión e intentar con otra cuenta
                  </button>
                )}
              </div>
            )}

            <div className="auth-mode-switch" role="group" aria-label="Tipo de cuenta">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setError("");
                  setMessage("");
                }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                className={mode === "register" ? "active" : ""}
                onClick={() => {
                  setMode("register");
                  setError("");
                  setMessage("");
                }}
              >
                Crear cuenta
              </button>
            </div>

            <form className="auth-form" onSubmit={submit}>
              {mode === "register" && (
                <>
                  <label htmlFor="displayName">Nombre para mostrar</label>
                  <input
                    id="displayName"
                    autoComplete="name"
                    maxLength={80}
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />

                  <fieldset className="auth-role-options">
                    <legend>¿Cómo usarás Lumora?</legend>
                    <button
                      type="button"
                      className={role === "student" ? "selected" : ""}
                      onClick={() => setRole("student")}
                    >
                      <GraduationCap size={19} />
                      Estudiante
                    </button>
                    <button
                      type="button"
                      className={role === "teacher" ? "selected" : ""}
                      onClick={() => setRole("teacher")}
                    >
                      <Users size={19} />
                      Docente
                    </button>
                  </fieldset>

                  {role === "teacher" && (
                    <>
                      <label htmlFor="institution">Institución (opcional)</label>
                      <input
                        id="institution"
                        autoComplete="organization"
                        maxLength={120}
                        value={institution}
                        onChange={(event) =>
                          setInstitution(event.target.value)
                        }
                      />
                      <label htmlFor="countryCity">
                        País o ciudad (opcional)
                      </label>
                      <input
                        id="countryCity"
                        autoComplete="address-level2"
                        maxLength={100}
                        value={countryCity}
                        onChange={(event) => setCountryCity(event.target.value)}
                      />
                      <small>
                        No se requiere código de invitación para crear una
                        cuenta docente.
                      </small>
                    </>
                  )}
                </>
              )}

              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />

              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={mode === "register" ? 8 : undefined}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />

              {error && (
                <p className="auth-message error" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p className="auth-message success" role="status">
                  {message}
                </p>
              )}

              <button className="auth-primary" type="submit" disabled={busy}>
                {busy
                  ? "Un momento..."
                  : mode === "login"
                    ? "Iniciar sesión"
                    : "Crear cuenta"}
              </button>
            </form>

            {mode === "login" && (
              <button
                className="auth-text-button"
                type="button"
                onClick={resetPassword}
                disabled={busy}
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
            <button
              className="auth-demo-button"
              type="button"
              onClick={onContinueDemo}
            >
              Continuar en modo prototipo local
            </button>
          </>
        )}
      </section>
    </main>
  );
}
