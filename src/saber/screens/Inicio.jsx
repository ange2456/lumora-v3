import { useState } from 'react';
import Respaldo from './Respaldo.jsx';
import Historia from './Historia.jsx';
const PRUEBAS = [
    { id: 'saber11', nombre: 'Saber 11', detalle: 'Estoy en 11° o terminando el bachillerato' },
    { id: 'saberpro', nombre: 'Saber Pro', detalle: 'Estoy en la universidad' },
];
const COMPETENCIAS_INICIO = [
    { id: 'cuantitativo', nombre: 'Razonamiento cuantitativo', detalle: 'Porcentajes, proporciones, tablas' },
    { id: 'critica', nombre: 'Lectura crítica', detalle: 'Textos, ideas y argumentos' },
];
// Lo que alguien dice que le pasa y lo que Lumora hace de verdad al respecto.
const DIFICULTADES = [
    { id: 'porque', texto: 'Me equivoco y no sé por qué', ayuda: 'El mapa de errores te muestra qué tipo de error cometes más.' },
    { id: 'seguro', texto: 'Me equivoco aunque estaba convencido de mi respuesta', ayuda: 'Marcas qué tan seguro estás y Lumora encuentra tus puntos ciegos.' },
    { id: 'aplicar', texto: 'Entiendo en el momento, pero luego no sé usarlo en otro problema', ayuda: 'Cada práctica termina con un problema nuevo para comprobar que ya puedes aplicarlo.' },
    { id: 'constancia', texto: 'Me cuesta ser constante', ayuda: 'Una meta diaria corta, una racha y medallas te ayudan a volver.' },
];
const PASOS = [
    ['Diagnóstico', '10 preguntas para ver qué errores repites y con cuánta seguridad.'],
    ['Práctica dirigida', 'Una lección corta y ejercicios solo del error que más te cuesta.'],
    ['Problema nuevo', 'Un caso distinto de la vida real para comprobar que ya puedes usarlo.'],
];
export default function Inicio({ onCrear, onImportar, nombreInicial = '', invitado = false }) {
    const [apodo, setApodo] = useState(nombreInicial);
    const [prueba, setPrueba] = useState('saber11');
    const [competencia, setCompetencia] = useState('cuantitativo');
    const [dificultades, setDificultades] = useState([]);
    const alternar = (id) => setDificultades((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
    const puede = apodo.trim().length >= 2;
    return (<section className="hero">
      <h1>Un buen puntaje en Saber abre puertas. Llega sabiendo qué te falta.</h1>
      <p className="sub">
        Lumora descubre qué errores repites, te hace practicar justo eso y te pone a prueba con problemas nuevos. Es para
        quien está en 11° y para quien está en la universidad. Sesiones cortas, desde el celular. En unos 5 minutos
        tienes tu mapa de errores{invitado ? ', sin crear cuenta' : ''}.
      </p>

      <ol className="pasos">
        {PASOS.map(([titulo, texto], i) => (<li key={titulo}>
            <span className="paso-num" aria-hidden="true">
              {i + 1}
            </span>
            <span>
              <strong>{titulo}</strong>
              <span className="ayuda"> {texto}</span>
            </span>
          </li>))}
      </ol>

      <Historia />

      <form className="formulario" onSubmit={(e) => {
            e.preventDefault();
            if (puede)
                onCrear({ apodo: apodo.trim(), prueba }, competencia);
        }}>
        <div className="campo">
          <label htmlFor="apodo">¿Cómo te decimos?</label>
          <input id="apodo" type="text" value={apodo} maxLength={24} autoComplete="off" placeholder="Un apodo o tu nombre" onChange={(e) => setApodo(e.target.value)}/>
          <p className="ayuda">Con un apodo basta. Para empezar no pedimos correo ni datos personales.</p>
        </div>

        <fieldset className="campo">
          <legend>¿Para qué prueba te preparas?</legend>
          <div className="eleccion">
            {PRUEBAS.map((p) => (<label key={p.id}>
                <input type="radio" name="prueba" value={p.id} checked={prueba === p.id} onChange={() => setPrueba(p.id)}/>
                <span>
                  <strong>{p.nombre}</strong>
                  <br />
                  <span className="ayuda">{p.detalle}</span>
                </span>
              </label>))}
          </div>
        </fieldset>

        <fieldset className="campo">
          <legend>¿Qué quieres practicar primero?</legend>
          <div className="eleccion">
            {COMPETENCIAS_INICIO.map((c) => (<label key={c.id}>
                <input type="radio" name="competencia" value={c.id} checked={competencia === c.id} onChange={() => setCompetencia(c.id)}/>
                <span>
                  <strong>{c.nombre}</strong>
                  <br />
                  <span className="ayuda">{c.detalle}</span>
                </span>
              </label>))}
          </div>
        </fieldset>

        <fieldset className="campo">
          <legend>¿Qué te pasa cuando practicas? <span className="opcional">(opcional, puedes marcar varias)</span></legend>
          <div className="eleccion eleccion-columna">
            {DIFICULTADES.map((d) => (<label key={d.id}>
                <input type="checkbox" checked={dificultades.includes(d.id)} onChange={() => alternar(d.id)}/>
                <span>{d.texto}</span>
              </label>))}
          </div>
          <div className="asi-te-ayuda" aria-live="polite">
            {dificultades.length > 0 && (<>
                <strong>Así te ayuda Lumora</strong>
                <ul>
                  {DIFICULTADES.filter((d) => dificultades.includes(d.id)).map((d) => (<li key={d.id}>{d.ayuda}</li>))}
                </ul>
              </>)}
          </div>
          <p className="ayuda">Estas respuestas no se guardan: solo sirven para mostrarte esto.</p>
        </fieldset>

        <div className="acciones">
          <button className="boton" type="submit" disabled={!puede}>
            Crear mi espacio
          </button>
        </div>
      </form>

      <p className="privacidad">
        {invitado
            ? 'Mientras no tengas cuenta, tu progreso se guarda solo en este dispositivo. Cuando quieras, creas una cuenta y se suma sin perder nada. '
            : 'Tu progreso se guarda solo en este dispositivo. '}
        Las preguntas son de práctica y no son material oficial del ICFES.
      </p>

      {onImportar && <Respaldo soloCargar onImportar={onImportar}/>}
    </section>);
}
