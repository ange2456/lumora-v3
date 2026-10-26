import Acceso from './screens/Acceso.jsx';
import SaberApp from './SaberApp.jsx';
import { salir } from './nube/cuenta.js';
import { useState } from 'react';
import { cargar } from './lib/saberStorage.js';
import { INVITADO, pasarInvitadoACuenta, tieneAvance } from './lib/invitado.js';

/** Con la cuenta ya abierta: primero se suma el avance de invitado y luego se carga la ruta. */
function ConCuenta({ db, usuario, perfil }) {
    useState(() => pasarInvitadoACuenta(usuario.id));
    return <SaberApp usuarioId={usuario.id} nombre={perfil.apodo} nube={{ db, uid: usuario.id, perfil }}/>;
}

/** Decide qué ve la persona en «Mi ruta Saber»: cargando, iniciar sesión, un error o su ruta. */
export default function SaberGate({ sesion, nombreLocal, usuarioLocalId, modoInicial }) {
    // Quien llega sin cuenta empieza como invitado; la pantalla de acceso solo se abre si la pide.
    const [acceso, setAcceso] = useState(modoInicial === 'entrar' ? 'entrar' : null);
    const { fase, db, usuario, perfil, recuperando, setRecuperando, error, reintentar } = sesion;
    if (recuperando && fase !== 'cargando') {
        return (<div className="saber">
        <Acceso db={db} recuperando onClaveCambiada={() => setRecuperando(false)}/>
      </div>);
    }
    if (fase === 'activa') {
        return <ConCuenta key={usuario.id} db={db} usuario={usuario} perfil={perfil}/>;
    }
    if (fase === 'local') {
        return <SaberApp key={usuarioLocalId} usuarioId={usuarioLocalId} nombre={nombreLocal}/>;
    }
    if (fase === 'anonimo' && !acceso) {
        return <SaberApp key="invitado" usuarioId={INVITADO} nombre="" invitado={{ onCrearCuenta: () => setAcceso('registro'), onEntrar: () => setAcceso('entrar') }}/>;
    }
    return (<div className="saber">
      {fase === 'cargando' && (<p className="ayuda" role="status" aria-live="polite">
          Cargando tu cuenta…
        </p>)}
      {fase === 'anonimo' && acceso && (<>
          <button className="volver" type="button" onClick={() => setAcceso(null)}>
            ← Volver a probar sin cuenta
          </button>
          <Acceso db={db} modoInicial={acceso} inicial={cargar(INVITADO).perfil} sumarAvance={tieneAvance(cargar(INVITADO))}/>
        </>)}
      {fase === 'error' && (<section className="acceso">
          <h1>No pudimos abrir tu cuenta</h1>
          <p className="mensaje-error" role="alert">{error}</p>
          <div className="acciones">
            <button className="boton" type="button" onClick={reintentar}>Reintentar</button>
            <button className="boton boton-suave" type="button" onClick={() => salir(db).catch(() => { })}>Cerrar sesión</button>
          </div>
        </section>)}
    </div>);
}
