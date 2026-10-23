import { useState } from 'react';
import { borrarProgresoNube, guardarPerfil, mensajeDeError, salir, borrarCuenta } from '../nube/cuenta.js';
import { sincronizar } from '../nube/sincronizar.js';
import { borrarLocal, cargar } from '../lib/saberStorage.js';
import Politica from './Politica.jsx';

const PRUEBAS = [
    { id: 'saber11', nombre: 'Saber 11' },
    { id: 'saberpro', nombre: 'Saber Pro' },
];

/** Datos de la cuenta, cierre de sesión y borrado de datos. */
export default function Cuenta({ sesion, onSalio }) {
    const { db, usuario, perfil, setPerfil } = sesion;
    const [d, setD] = useState({ nombre: perfil.nombre, apodo: perfil.apodo, prueba: perfil.prueba, institucion: perfil.institucion, ciudad: perfil.ciudad, grado: perfil.grado });
    const [msg, setMsg] = useState({ tipo: '', texto: '' });
    const [ocupada, setOcupada] = useState(false);
    const [confirmar, setConfirmar] = useState(null); // 'salir-sin-guardar' | 'borrar-progreso' | 'borrar-cuenta'
    const set = (c) => (e) => setD((x) => ({ ...x, [c]: e.target.value }));
    const decir = (tipo, texto) => setMsg({ tipo, texto });

    async function guardar(e) {
        e.preventDefault();
        if (d.nombre.trim().length < 2 || d.apodo.trim().length < 2 || d.apodo.trim().length > 24)
            return decir('mal', 'Revisa tu nombre y tu apodo (2 a 24 letras).');
        setOcupada(true);
        try {
            setPerfil(await guardarPerfil(db, usuario.id, d));
            decir('bien', 'Datos guardados.');
        }
        catch (err) {
            console.error(err);
            decir('mal', mensajeDeError(err));
        }
        finally {
            setOcupada(false);
        }
    }

    async function cerrarSesion(forzar = false) {
        setOcupada(true);
        setConfirmar(null);
        try {
            if (!forzar) {
                // Antes de salir se guardan los últimos cambios de este dispositivo.
                await sincronizar({ db, uid: usuario.id, local: cargar(usuario.id) });
            }
            borrarLocal(usuario.id); // no dejar datos en un equipo compartido
            await salir(db);
            onSalio?.();
        }
        catch (err) {
            console.error(err);
            if (!forzar) {
                setConfirmar('salir-sin-guardar');
                decir('mal', 'No pudimos guardar tus últimos cambios en tu cuenta.');
            }
            else
                decir('mal', mensajeDeError(err));
        }
        finally {
            setOcupada(false);
        }
    }

    async function borrarProgreso() {
        setOcupada(true);
        setConfirmar(null);
        try {
            await borrarProgresoNube(db, usuario.id);
            borrarLocal(usuario.id);
            decir('bien', 'Borramos tu progreso. Al volver a tu ruta empiezas de cero.');
        }
        catch (err) {
            console.error(err);
            decir('mal', mensajeDeError(err));
        }
        finally {
            setOcupada(false);
        }
    }

    async function eliminarCuenta() {
        setOcupada(true);
        setConfirmar(null);
        try {
            await borrarCuenta(db);
            borrarLocal(usuario.id);
            await salir(db).catch(() => { });
            onSalio?.();
        }
        catch (err) {
            console.error(err);
            decir('mal', 'No pudimos eliminar tu cuenta. Inténtalo de nuevo.');
        }
        finally {
            setOcupada(false);
        }
    }

    return (<section className="cuenta">
      <h1>Mi cuenta</h1>
      <p className="sub">Tu correo es <strong>{usuario.email}</strong>. Tu progreso se guarda en tu cuenta y lo ves desde cualquier dispositivo.</p>

      <form className="formulario" onSubmit={guardar}>
        <div className="campo">
          <label htmlFor="cu-nombre">Nombre completo</label>
          <input id="cu-nombre" type="text" autoComplete="name" maxLength={80} required value={d.nombre} onChange={set('nombre')}/>
        </div>
        <div className="campo">
          <label htmlFor="cu-apodo">¿Cómo te decimos?</label>
          <input id="cu-apodo" type="text" autoComplete="nickname" minLength={2} maxLength={24} required value={d.apodo} onChange={set('apodo')}/>
        </div>
        <fieldset className="campo">
          <legend>Prueba</legend>
          <div className="eleccion">
            {PRUEBAS.map((p) => (<label key={p.id}>
                <input type="radio" name="cu-prueba" value={p.id} checked={d.prueba === p.id} onChange={set('prueba')}/>
                <span><strong>{p.nombre}</strong></span>
              </label>))}
          </div>
        </fieldset>
        <div className="campo">
          <label htmlFor="cu-institucion">Colegio o universidad <span className="opcional">(opcional)</span></label>
          <input id="cu-institucion" type="text" autoComplete="organization" maxLength={120} value={d.institucion} onChange={set('institucion')}/>
        </div>
        <div className="fila-campos">
          <div className="campo">
            <label htmlFor="cu-ciudad">Ciudad <span className="opcional">(opcional)</span></label>
            <input id="cu-ciudad" type="text" autoComplete="address-level2" maxLength={100} value={d.ciudad} onChange={set('ciudad')}/>
          </div>
          <div className="campo">
            <label htmlFor="cu-grado">Grado o semestre <span className="opcional">(opcional)</span></label>
            <input id="cu-grado" type="text" maxLength={40} value={d.grado} onChange={set('grado')}/>
          </div>
        </div>
        <div className="acciones">
          <button className="boton" type="submit" disabled={ocupada}>Guardar cambios</button>
        </div>
      </form>

      <p className={`respaldo-mensaje ${msg.tipo}`} role="status" aria-live="polite">{msg.texto}</p>

      <div className="zona-sesion">
        <h2>Sesión</h2>
        <div className="acciones">
          <button className="boton boton-suave" type="button" disabled={ocupada} onClick={() => cerrarSesion(false)}>
            Cerrar sesión
          </button>
        </div>
        {confirmar === 'salir-sin-guardar' && (<div className="respaldo-confirmar" role="alertdialog" aria-labelledby="cu-conf-salir">
            <h3 id="cu-conf-salir">¿Salir sin guardar los últimos cambios?</h3>
            <p>Lo que hiciste en este dispositivo desde la última vez que se guardó se perderá.</p>
            <div className="acciones">
              <button className="boton" type="button" onClick={() => cerrarSesion(true)}>Salir de todos modos</button>
              <button className="boton boton-suave" type="button" onClick={() => setConfirmar(null)}>Cancelar</button>
            </div>
          </div>)}
      </div>

      <div className="zona-datos">
        <h2>Tus datos</h2>
        <Politica />
        <div className="acciones" style={{ marginTop: 14 }}>
          <button className="boton boton-suave" type="button" disabled={ocupada} onClick={() => setConfirmar('borrar-progreso')}>
            Borrar mi progreso
          </button>
          <button className="boton boton-peligro" type="button" disabled={ocupada} onClick={() => setConfirmar('borrar-cuenta')}>
            Eliminar mi cuenta
          </button>
        </div>
        {confirmar === 'borrar-progreso' && (<div className="respaldo-confirmar" role="alertdialog" aria-labelledby="cu-conf-prog">
            <h3 id="cu-conf-prog">¿Borrar todo tu progreso?</h3>
            <p>Se borran tus diagnósticos, práctica y medallas, también de tu cuenta. Tu cuenta y tus datos personales se quedan.</p>
            <div className="acciones">
              <button className="boton boton-peligro" type="button" onClick={borrarProgreso}>Sí, borrar mi progreso</button>
              <button className="boton boton-suave" type="button" onClick={() => setConfirmar(null)}>Cancelar</button>
            </div>
          </div>)}
        {confirmar === 'borrar-cuenta' && (<div className="respaldo-confirmar" role="alertdialog" aria-labelledby="cu-conf-cuenta">
            <h3 id="cu-conf-cuenta">¿Eliminar tu cuenta para siempre?</h3>
            <p>Se borran tu cuenta, tus datos personales y todo tu progreso. No se puede deshacer.</p>
            <div className="acciones">
              <button className="boton boton-peligro" type="button" onClick={eliminarCuenta}>Sí, eliminar mi cuenta</button>
              <button className="boton boton-suave" type="button" onClick={() => setConfirmar(null)}>Cancelar</button>
            </div>
          </div>)}
      </div>
    </section>);
}
