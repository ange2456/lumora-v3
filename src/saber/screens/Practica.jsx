import { useMemo, useState } from 'react';
import { LECCIONES } from '../data/practice.js';
import { generarSesion } from '../data/banco.js';
import { TIPOS_ERROR } from '../data/questions.js';
import Texto from './Texto.jsx';
import { Recompensa } from './Motivacion.jsx';
const LETRAS = ['A', 'B', 'C', 'D'];
const TOTAL = 4;
export default function Practica({ tipo, semilla, recompensa, erroresDiagnostico, onEjercicio, onTerminar, onRepetir, onSalir }) {
    const info = TIPOS_ERROR[tipo];
    const leccion = LECCIONES[tipo];
    // Ejercicios con números al azar; la misma semilla da la misma sesión.
    const ejercicios = useMemo(() => generarSesion(tipo, semilla), [tipo, semilla]);
    /** -1 = lección, 0..3 = ejercicios, 4 = cierre */
    const [paso, setPaso] = useState(-1);
    const [opcionId, setOpcionId] = useState(null);
    const [comprobado, setComprobado] = useState(false);
    const [pistaVista, setPistaVista] = useState(false);
    const [propia, setPropia] = useState('');
    const [verExplicacion, setVerExplicacion] = useState(false);
    const [resultados, setResultados] = useState([]);
    const ejercicio = paso >= 0 && paso < TOTAL ? ejercicios[paso] : null;
    const opciones = ejercicio ? ejercicio.opciones : [];
    const elegida = ejercicio?.opciones.find((o) => o.id === opcionId);
    const acierto = !!elegida && !elegida.error;
    const mostrarExplicacion = comprobado && (acierto || verExplicacion);
    const comprobar = () => {
        if (!opcionId)
            return;
        setComprobado(true);
        onEjercicio();
    };
    const siguiente = () => {
        const nuevos = [...resultados, acierto];
        setResultados(nuevos);
        setOpcionId(null);
        setComprobado(false);
        setPistaVista(false);
        setPropia('');
        setVerExplicacion(false);
        if (paso + 1 >= TOTAL) {
            onTerminar({
                tipo,
                aciertos: nuevos.slice(0, 3).filter(Boolean).length,
                transferencia: nuevos[3] === true,
            });
        }
        setPaso(paso + 1);
        window.scrollTo(0, 0);
    };
    // ---------- Lección ----------
    if (paso === -1) {
        return (<section>
        <p className="etiqueta-seccion">Práctica dirigida</p>
        <h1 className="titulo-leccion">{info.nombre}</h1>
        {erroresDiagnostico > 0 && (<p className="sub">
            En tu diagnóstico fallaste {erroresDiagnostico} {erroresDiagnostico === 1 ? 'vez' : 'veces'} por esto. Vamos a
            trabajarlo.
          </p>)}

        <div className="leccion">
          <h2>{leccion.titulo}</h2>
          <p>{leccion.idea}</p>
          <div className="ejemplo">
            <span className="etiqueta-seccion">Ejemplo resuelto</span>
            <p>{leccion.ejemplo}</p>
          </div>
          <div className="chequeo">
            <span className="etiqueta-seccion">Truco para revisar</span>
            <p>{leccion.chequeo}</p>
          </div>
        </div>

        <p className="ayuda" style={{ marginTop: 18 }}>
          Siguen 3 ejercicios y un problema nuevo. Puedes pedir una pista cuando la necesites.
        </p>
        <div className="acciones" style={{ marginTop: 18 }}>
          <button className="boton" type="button" onClick={() => setPaso(0)}>
            Empezar los ejercicios
          </button>
          <button className="boton boton-suave" type="button" onClick={onSalir}>
            Volver a mi ruta
          </button>
        </div>
      </section>);
    }
    // ---------- Cierre ----------
    if (paso >= TOTAL) {
        const aciertos = resultados.slice(0, 3).filter(Boolean).length;
        const transfer = resultados[3] === true;
        const dominado = transfer && aciertos >= 2;
        return (<section className="resultado">
        <p className="etiqueta-seccion">Sesión terminada</p>
        <h1>
          {dominado
                ? 'Lo lograste también en un caso nuevo.'
                : transfer
                    ? 'Resolviste el problema nuevo. Falta afianzar la práctica.'
                    : 'Aún no es tuyo del todo, y eso es normal.'}
        </h1>
        <div className="cifras">
          <div className="cifra">
            <b>{aciertos}/3</b>
            <span>ejercicios de práctica</span>
          </div>
          <div className="cifra">
            <b>{transfer ? 'Sí' : 'Aún no'}</b>
            <span>problema nuevo resuelto</span>
          </div>
        </div>
        <Recompensa r={recompensa}/>
        <div className={`prioridad${dominado ? ' lograda' : ''}`}>
          <h2>{info.nombre}</h2>
          <p>
            {dominado
                ? 'Marcado como dominado. Vuelve a repasarlo en unos días para que se quede.'
                : transfer
                    ? 'Para marcarlo como dominado necesitas acertar al menos 2 de 3 ejercicios y el problema nuevo. Repite la sesión cuando quieras.'
                    : 'El problema nuevo es la prueba de que ya puedes usarlo fuera del ejercicio. Repasa el truco de revisión y vuelve a intentarlo.'}
          </p>
        </div>
        <div className="chequeo" style={{ marginTop: 18 }}>
          <span className="etiqueta-seccion">Recuerda</span>
          <p>{leccion.chequeo}</p>
        </div>
        <div className="acciones fin-acciones">
          <button className="boton" type="button" onClick={onSalir}>
            Volver a mi ruta
          </button>
          <button className="boton boton-suave" type="button" onClick={onRepetir}>
            Repetir esta práctica
          </button>
        </div>
      </section>);
    }
    // ---------- Ejercicio ----------
    const esNuevo = !!ejercicio.transferencia;
    const progreso = (paso / TOTAL) * 100;
    return (<section>
      <div className="progreso">
        <div className="progreso-barra" aria-hidden="true">
          <span style={{ width: `${progreso}%` }}/>
        </div>
        <p className="progreso-texto" aria-live="polite">
          {esNuevo ? 'Problema nuevo' : `Ejercicio ${paso + 1} de 3`}
        </p>
      </div>

      {esNuevo && (<div className="aviso-nuevo">
          <strong>Problema nuevo.</strong> Es una situación distinta a los ejercicios. Aplica lo que practicaste.
        </div>)}

      <p className="etiqueta-seccion">{info.nombre}</p>
      <Texto texto={ejercicio.texto}/>
      <h1 className="enunciado" style={{ fontFamily: 'var(--font-body)', letterSpacing: 0 }}>
        {ejercicio.enunciado}
      </h1>

      {ejercicio.tabla && (<div className="tabla-caja" role="region" aria-label="Tabla de datos" tabIndex={0}>
          <table>
            <thead>
              <tr>
                {ejercicio.tabla.encabezados.map((h) => (<th key={h} scope="col">
                    {h}
                  </th>))}
              </tr>
            </thead>
            <tbody>
              {ejercicio.tabla.filas.map((fila) => (<tr key={fila[0]}>
                  {fila.map((celda, i) => (<td key={i}>{celda}</td>))}
                </tr>))}
            </tbody>
          </table>
        </div>)}

      <fieldset className="opciones" disabled={comprobado}>
        <legend className="ayuda" style={{ padding: 0, marginBottom: 2 }}>
          Elige una respuesta
        </legend>
        {opciones.map((o, i) => {
            const marca = comprobado ? (!o.error ? ' correcta' : o.id === opcionId ? ' incorrecta' : '') : '';
            return (<label className={`opcion${marca}`} key={o.id}>
              <input type="radio" name={`ej-${ejercicio.id}`} value={o.id} checked={opcionId === o.id} onChange={() => setOpcionId(o.id)}/>
              <span className="letra" aria-hidden="true">
                {LETRAS[i]}
              </span>
              <span>{o.texto}</span>
              {comprobado && !o.error && <span className="sello ok">Correcta</span>}
              {comprobado && o.error && o.id === opcionId && <span className="sello mal">Tu respuesta</span>}
            </label>);
        })}
      </fieldset>

      {!comprobado && (<>
          {pistaVista ? (<div className="pista">
              <span className="etiqueta-seccion">Pista</span>
              <p>{ejercicio.pista}</p>
            </div>) : (<button className="enlace" type="button" onClick={() => setPistaVista(true)}>
              Necesito una pista
            </button>)}
          <div className="pie-pregunta">
            <button className="boton" type="button" disabled={!opcionId} onClick={comprobar}>
              Comprobar
            </button>
          </div>
        </>)}

      {comprobado && (<div className={`retro ${acierto ? 'bien' : 'mal'}`} aria-live="polite">
          <h2>{acierto ? 'Correcto.' : 'No es esa, y de eso se aprende.'}</h2>

          {!acierto && !verExplicacion && (<div className="propia">
              <label htmlFor="propia">En una frase, ¿por qué crees que elegiste esa? (opcional)</label>
              <input id="propia" type="text" value={propia} maxLength={140} autoComplete="off" placeholder="Escríbelo con tus palabras" onChange={(e) => setPropia(e.target.value)}/>
              <p className="ayuda">Ponerlo en palabras ayuda a que el error no se repita.</p>
              <button className="boton boton-suave" type="button" onClick={() => setVerExplicacion(true)}>
                Ver la explicación
              </button>
            </div>)}

          {mostrarExplicacion && (<div className="explicacion">
              {!acierto && propia.trim() && (<p>
                  <b>Tú pensaste:</b> «{propia.trim()}»
                </p>)}
              {!acierto && elegida?.error && (<p>
                  <b>Tipo de error:</b> {TIPOS_ERROR[elegida.error].nombre}. {elegida.porque}
                </p>)}
              <p>
                <b>Cómo se resuelve:</b> {ejercicio.explicacion}
              </p>
            </div>)}

          {mostrarExplicacion && (<div className="pie-pregunta">
              <button className="boton" type="button" onClick={siguiente}>
                {paso + 1 === TOTAL ? 'Ver mi resultado' : paso + 1 === 3 ? 'Ir al problema nuevo' : 'Siguiente ejercicio'}
              </button>
            </div>)}
        </div>)}
    </section>);
}
