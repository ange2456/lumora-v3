import { useEffect, useRef, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { salir } from "./saber/nube/cuenta.js";
import { sincronizar } from "./saber/nube/sincronizar.js";
import { borrarLocal, cargar } from "./saber/lib/saberStorage.js";

/** Avatar con menú pequeño: Mi cuenta y Cerrar sesión (para quien tiene cuenta de Lumora). */
export default function MenuPerfil({ sesion, apodo, onMiCuenta, onSalio }) {
  const [abierto, setAbierto] = useState(false);
  const [ocupada, setOcupada] = useState(false);
  const [error, setError] = useState("");
  const caja = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => caja.current && !caja.current.contains(e.target) && setAbierto(false);
    const tecla = (e) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("mousedown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  async function cerrar(forzar = false) {
    const { db, usuario } = sesion;
    setOcupada(true);
    setError("");
    try {
      // Antes de salir se guardan los últimos cambios de este dispositivo.
      if (!forzar) await sincronizar({ db, uid: usuario.id, local: cargar(usuario.id) });
      borrarLocal(usuario.id);
      await salir(db);
      setAbierto(false);
      onSalio?.();
    } catch (e) {
      console.error(e);
      setOcupada(false);
      setError(forzar ? "No se pudo cerrar la sesión. Inténtalo de nuevo." : "sin-guardar");
    }
  }

  return (
    <div className="menu-perfil" ref={caja}>
      <button
        className="profile-button"
        type="button"
        aria-haspopup="menu"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
        title="Mi perfil"
      >
        <span className="profile-avatar">{apodo.slice(0, 1).toUpperCase()}</span>
        <span>{apodo}</span>
      </button>
      {abierto && (
        <div className="menu-perfil-lista" role="menu">
          <p className="menu-perfil-nombre">{apodo}</p>
          <button type="button" role="menuitem" onClick={() => { setAbierto(false); onMiCuenta(); }}>
            <UserRound size={17} aria-hidden="true" /> Mi cuenta
          </button>
          <button type="button" role="menuitem" className="menu-perfil-salir" disabled={ocupada} onClick={() => cerrar(false)}>
            <LogOut size={17} aria-hidden="true" /> {ocupada ? "Saliendo…" : "Cerrar sesión"}
          </button>
          {error === "sin-guardar" && (
            <div className="menu-perfil-aviso" role="alert">
              <p>No pudimos guardar tus últimos cambios en tu cuenta.</p>
              <button type="button" disabled={ocupada} onClick={() => cerrar(true)}>Salir de todos modos</button>
            </div>
          )}
          {error && error !== "sin-guardar" && <p className="menu-perfil-aviso" role="alert">{error}</p>}
        </div>
      )}
    </div>
  );
}
