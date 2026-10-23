import Acceso from './screens/Acceso.jsx';
import SaberApp from './SaberApp.jsx';
import { salir } from './nube/cuenta.js';

/** Decide qué ve la persona en «Mi ruta Saber»: cargando, iniciar sesión, un error o su ruta. */
export default function SaberGate({ sesion, nombreLocal, usuarioLocalId, modoInicial }) {
    const { fase, db, usuario, perfil, recuperando, setRecuperando, error, reintentar } = sesion;
    if (recuperando && fase !== 'cargando') {
        return (<div className="saber">
        <Acceso db={db} recuperando onClaveCambiada={() => setRecuperando(false)}/>
      </div>);
    }
    if (fase === 'activa') {
        return <SaberApp key={usuario.id} usuarioId={usuario.id} nombre={perfil.apodo} nube={{ db, uid: usuario.id, perfil }}/>;
    }
    if (fase === 'local') {
        return <SaberApp key={usuarioLocalId} usuarioId={usuarioLocalId} nombre={nombreLocal}/>;
    }
    return (<div className="saber">
      {fase === 'cargando' && (<p className="ayuda" role="status" aria-live="polite">
          Cargando tu cuenta…
        </p>)}
      {fase === 'anonimo' && <Acceso db={db} modoInicial={modoInicial}/>}
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
