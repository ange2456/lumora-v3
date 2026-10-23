import { useState } from 'react';
import { cambiarClave, entrar, mensajeDeError, pedirRecuperacion, registrar } from '../nube/cuenta.js';
import Politica from './Politica.jsx';

const PRUEBAS = [
    { id: 'saber11', nombre: 'Saber 11', detalle: 'Estoy en 11° o terminando el bachillerato' },
    { id: 'saberpro', nombre: 'Saber Pro', detalle: 'Estoy en la universidad' },
];

/** Entrar, crear cuenta y recuperar contraseña. */
export default function Acceso({ db, recuperando, onClaveCambiada, modoInicial = 'entrar' }) {
    const [modo, setModo] = useState(recuperando ? 'nueva' : modoInicial);
    const [d, setD] = useState({ nombre: '', apodo: '', correo: '', clave: '', prueba: 'saber11', institucion: '', ciudad: '', grado: '', acepta: false });
    const [verClave, setVerClave] = useState(false);
    const [clave2, setClave2] = useState('');
    const [error, setError] = useState('');
    const [aviso, setAviso] = useState('');
    const [ocupada, setOcupada] = useState(false);
    const set = (campo) => (e) => setD((x) => ({ ...x, [campo]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    const cambiarModo = (m) => {
        setModo(m);
        setError('');
        setAviso('');
    };

    async function enviar(e) {
        e.preventDefault();
        setError('');
        setAviso('');
        if (modo === 'registro') {
            if (d.nombre.trim().length < 2)
                return setError('Escribe tu nombre.');
            if (d.apodo.trim().length < 2 || d.apodo.trim().length > 24)
                return setError('El apodo debe tener entre 2 y 24 letras.');
            if (d.clave.length < 8)
                return setError('La contraseña debe tener al menos 8 caracteres.');
            if (!d.acepta)
                return setError('Para crear la cuenta necesitas aceptar cómo cuidamos tus datos.');
        }
        if (modo === 'nueva') {
            if (d.clave.length < 8)
                return setError('La contraseña debe tener al menos 8 caracteres.');
            if (d.clave !== clave2)
                return setError('Las contraseñas no coinciden.');
        }
        setOcupada(true);
        try {
            if (modo === 'entrar') {
                await entrar(db, d.correo, d.clave);
            }
            else if (modo === 'registro') {
                const r = await registrar(db, d);
                if (r.necesitaConfirmar) {
                    setAviso('Cuenta creada. Te enviamos un correo: abre el enlace para confirmarlo y luego inicia sesión.');
                    setModo('entrar');
                    setD((x) => ({ ...x, clave: '' }));
                }
            }
            else if (modo === 'olvide') {
                await pedirRecuperacion(db, d.correo);
                setAviso('Si ese correo tiene cuenta, te enviamos un enlace para elegir una contraseña nueva.');
            }
            else if (modo === 'nueva') {
                await cambiarClave(db, d.clave);
                window.history.replaceState({}, document.title, window.location.pathname);
                onClaveCambiada?.();
            }
        }
        catch (err) {
            setError(mensajeDeError(err));
        }
        finally {
            setOcupada(false);
        }
    }

    const titulo = { entrar: 'Entra a tu ruta', registro: 'Crea tu cuenta', olvide: 'Recupera tu contraseña', nueva: 'Elige una contraseña nueva' }[modo];
    const sub = {
        entrar: 'Con tu cuenta ves tu avance desde cualquier dispositivo.',
        registro: 'Con tu cuenta tu progreso te sigue al celular, al computador o a donde entres.',
        olvide: 'Escribe tu correo y te enviamos un enlace.',
        nueva: 'Usa al menos 8 caracteres.',
    }[modo];

    return (<section className="acceso">
      <h1>{titulo}</h1>
      <p className="sub">{sub}</p>

      {(modo === 'entrar' || modo === 'registro') && (<div className="selector-competencia" role="group" aria-label="Elige una opción">
          <button type="button" aria-pressed={modo === 'entrar'} onClick={() => cambiarModo('entrar')}>
            Ya tengo cuenta
          </button>
          <button type="button" aria-pressed={modo === 'registro'} onClick={() => cambiarModo('registro')}>
            Crear cuenta
          </button>
        </div>)}

      <form className="formulario" onSubmit={enviar} noValidate={false}>
        {modo === 'registro' && (<>
            <div className="campo">
              <label htmlFor="ac-nombre">Nombre completo</label>
              <input id="ac-nombre" type="text" autoComplete="name" maxLength={80} required value={d.nombre} onChange={set('nombre')}/>
            </div>
            <div className="campo">
              <label htmlFor="ac-apodo">¿Cómo te decimos?</label>
              <input id="ac-apodo" type="text" autoComplete="nickname" minLength={2} maxLength={24} required value={d.apodo} onChange={set('apodo')} placeholder="Un apodo o tu primer nombre"/>
            </div>
          </>)}

        {(modo === 'entrar' || modo === 'registro' || modo === 'olvide') && (<div className="campo">
            <label htmlFor="ac-correo">Correo electrónico</label>
            <input id="ac-correo" type="email" autoComplete="email" inputMode="email" required value={d.correo} onChange={set('correo')}/>
          </div>)}

        {modo !== 'olvide' && (<div className="campo">
            <label htmlFor="ac-clave">{modo === 'nueva' ? 'Contraseña nueva' : 'Contraseña'}</label>
            <div className="campo-clave">
              <input id="ac-clave" type={verClave ? 'text' : 'password'} autoComplete={modo === 'entrar' ? 'current-password' : 'new-password'} minLength={modo === 'entrar' ? undefined : 8} required value={d.clave} onChange={set('clave')}/>
              <button type="button" className="enlace" aria-pressed={verClave} onClick={() => setVerClave((v) => !v)}>
                {verClave ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            {modo !== 'entrar' && <p className="ayuda">Al menos 8 caracteres.</p>}
          </div>)}

        {modo === 'nueva' && (<div className="campo">
            <label htmlFor="ac-clave2">Repite la contraseña</label>
            <input id="ac-clave2" type={verClave ? 'text' : 'password'} autoComplete="new-password" minLength={8} required value={clave2} onChange={(e) => setClave2(e.target.value)}/>
          </div>)}

        {modo === 'registro' && (<>
            <fieldset className="campo">
              <legend>¿Para qué prueba te preparas?</legend>
              <div className="eleccion">
                {PRUEBAS.map((p) => (<label key={p.id}>
                    <input type="radio" name="prueba" value={p.id} checked={d.prueba === p.id} onChange={set('prueba')}/>
                    <span>
                      <strong>{p.nombre}</strong>
                      <br />
                      <span className="ayuda">{p.detalle}</span>
                    </span>
                  </label>))}
              </div>
            </fieldset>

            <div className="campo">
              <label htmlFor="ac-institucion">Colegio o universidad <span className="opcional">(opcional)</span></label>
              <input id="ac-institucion" type="text" autoComplete="organization" maxLength={120} value={d.institucion} onChange={set('institucion')}/>
            </div>
            <div className="fila-campos">
              <div className="campo">
                <label htmlFor="ac-ciudad">Ciudad <span className="opcional">(opcional)</span></label>
                <input id="ac-ciudad" type="text" autoComplete="address-level2" maxLength={100} value={d.ciudad} onChange={set('ciudad')}/>
              </div>
              <div className="campo">
                <label htmlFor="ac-grado">Grado o semestre <span className="opcional">(opcional)</span></label>
                <input id="ac-grado" type="text" maxLength={40} value={d.grado} onChange={set('grado')} placeholder="11° o VII semestre"/>
              </div>
            </div>

            <div className="consentimiento">
              <label>
                <input type="checkbox" checked={d.acepta} onChange={set('acepta')} required/>
                <span>
                  Acepto que Lumora guarde estos datos y mi progreso para mostrármelos en cualquier dispositivo. Si soy menor
                  de edad, mi acudiente lo sabe.
                </span>
              </label>
              <Politica />
            </div>
          </>)}

        <p className="mensaje-error" role="alert">{error}</p>
        <p className="respaldo-mensaje bien" role="status" aria-live="polite">{aviso}</p>

        <div className="acciones">
          <button className="boton" type="submit" disabled={ocupada}>
            {ocupada ? 'Un momento…' : { entrar: 'Entrar', registro: 'Crear mi cuenta', olvide: 'Enviar enlace', nueva: 'Guardar contraseña' }[modo]}
          </button>
          {modo === 'entrar' && (<button type="button" className="enlace" onClick={() => cambiarModo('olvide')}>
              Olvidé mi contraseña
            </button>)}
          {modo === 'olvide' && (<button type="button" className="enlace" onClick={() => cambiarModo('entrar')}>
              Volver
            </button>)}
        </div>
      </form>
    </section>);
}
