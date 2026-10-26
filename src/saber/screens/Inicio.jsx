import { useState } from 'react';
import { BookOpen, Calculator, Clock, Compass, FlaskConical, Flame, GraduationCap, Landmark, Languages, Repeat, School, Search, Gauge, Smartphone, Sparkles, Target, Trophy, UserRound } from 'lucide-react';
import { COMPETENCIAS_POR_PRUEBA } from '../data/questions.js';
import Respaldo from './Respaldo.jsx';
import Historia from './Historia.jsx';
const PRUEBAS = [
    { id: 'saber11', nombre: 'Saber 11', detalle: 'Estoy en 11° o terminando el bachillerato', icono: School },
    { id: 'saberpro', nombre: 'Saber Pro', detalle: 'Estoy en la universidad', icono: GraduationCap },
];
const COMPETENCIAS_INICIO = [
    { id: 'cuantitativo', nombre: 'Razonamiento cuantitativo', detalle: 'Porcentajes, proporciones, tablas', icono: Calculator },
    { id: 'critica', nombre: 'Lectura crítica', detalle: 'Textos, ideas y argumentos', icono: BookOpen },
    { id: 'naturales', nombre: 'Ciencias naturales', detalle: 'Experimentos, datos y fenómenos', icono: FlaskConical },
    { id: 'ciudadanas', nombre: 'Sociales y ciudadanas', detalle: 'Derechos, participación y fuentes', icono: Landmark },
    { id: 'ingles', nombre: 'Inglés', detalle: 'Vocabulario, gramática y lectura corta', icono: Languages },
];
// Lo que alguien dice que le pasa y lo que Lumora hace de verdad al respecto.
const DIFICULTADES = [
    { id: 'porque', icono: Search, texto: 'Me equivoco y no sé por qué', ayuda: 'El mapa de errores te muestra qué tipo de error cometes más.' },
    { id: 'seguro', icono: Gauge, texto: 'Me equivoco aunque estaba convencido de mi respuesta', ayuda: 'Marcas qué tan seguro estás y Lumora encuentra tus puntos ciegos.' },
    { id: 'aplicar', icono: Repeat, texto: 'Entiendo en el momento, pero luego no sé usarlo en otro problema', ayuda: 'Cada práctica termina con un problema nuevo para comprobar que ya puedes aplicarlo.' },
    { id: 'constancia', icono: Flame, texto: 'Me cuesta ser constante', ayuda: 'Una meta diaria corta, una racha y medallas te ayudan a volver.' },
];
const PASOS = [
    ['Diagnóstico', '10 preguntas para ver qué errores repites y con cuánta seguridad.', Compass, 'morado'],
    ['Práctica dirigida', 'Una lección corta y ejercicios solo del error que más te cuesta.', Target, 'verde'],
    ['Problema nuevo', 'Un caso distinto de la vida real para comprobar que ya puedes usarlo.', Trophy, 'naranja'],
];
export default function Inicio({ onCrear, onImportar, nombreInicial = '', invitado = false }) {
    const [apodo, setApodo] = useState(nombreInicial);
    const [prueba, setPrueba] = useState('saber11');
    const [competencia, setCompetencia] = useState('cuantitativo');
    const [dificultades, setDificultades] = useState([]);
    const alternar = (id) => setDificultades((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
    const puede = apodo.trim().length >= 2;
    const disponibles = COMPETENCIAS_INICIO.filter((c) => COMPETENCIAS_POR_PRUEBA[prueba].includes(c.id));
    const elegirPrueba = (id) => {
        setPrueba(id);
        if (!COMPETENCIAS_POR_PRUEBA[id].includes(competencia)) setCompetencia('cuantitativo');
    };
    return (<section className="hero inicio">
      <header className="ruta-hero inicio-banner">
        <p className="ruta-kicker">
          <Sparkles size={15} aria-hidden="true"/> Tu ruta para Saber 11 y Saber Pro
        </p>
        <h1 className="titulo-ruta">Llega a Saber sabiendo qué te falta.</h1>
        <p className="inicio-banner-texto">
          Lumora descubre qué errores repites, te hace practicar justo eso y te pone a prueba con problemas nuevos. Es para
          quien está en 11° y para quien está en la universidad.
        </p>
        <ul className="inicio-chips">
          <li><Clock size={15} aria-hidden="true"/> Tu mapa de errores en unos 5 minutos</li>
          <li><Smartphone size={15} aria-hidden="true"/> Sesiones cortas, desde el celular</li>
          {invitado && (<li><UserRound size={15} aria-hidden="true"/> Sin crear cuenta</li>)}
        </ul>
      </header>

      <ol className="pasos-tarjetas">
        {PASOS.map(([titulo, texto, Icono, color], i) => (<li key={titulo}>
            <span className={`paso-icono ${color}`} aria-hidden="true">
              <Icono size={22}/>
            </span>
            <span className="paso-texto">
              <span className="paso-etiqueta">Paso {i + 1}</span>
              <strong>{titulo}</strong>
              <span className="ayuda">{texto}</span>
            </span>
          </li>))}
      </ol>

      <Historia />

      <form className="formulario inicio-form" onSubmit={(e) => {
            e.preventDefault();
            if (puede)
                onCrear({ apodo: apodo.trim(), prueba }, competencia);
        }}>
        <h2 className="inicio-form-titulo">Arma tu ruta</h2>
        <p className="ayuda inicio-form-sub">Tres preguntas cortas. Con tus respuestas, Lumora te muestra por dónde empezar.</p>

        <div className="bloque">
          <div className="campo">
            <label htmlFor="apodo"><span className="bloque-num" aria-hidden="true">1</span> ¿Cómo te decimos?</label>
            <input id="apodo" type="text" value={apodo} maxLength={24} autoComplete="off" placeholder="Un apodo o tu nombre" onChange={(e) => setApodo(e.target.value)}/>
            <p className="ayuda">Con un apodo basta. Para empezar no pedimos correo ni datos personales.</p>
          </div>

          <fieldset className="campo">
            <legend>¿Para qué prueba te preparas?</legend>
            <div className="eleccion">
              {PRUEBAS.map((p) => (<label key={p.id}>
                  <input type="radio" name="prueba" value={p.id} checked={prueba === p.id} onChange={() => elegirPrueba(p.id)}/>
                  <span className="eleccion-icono" aria-hidden="true"><p.icono size={20}/></span>
                  <span>
                    <strong>{p.nombre}</strong>
                    <br />
                    <span className="ayuda">{p.detalle}</span>
                  </span>
                </label>))}
            </div>
          </fieldset>
        </div>

        <div className="bloque">
          <fieldset className="campo">
            <legend><span className="bloque-num" aria-hidden="true">2</span> ¿Qué quieres practicar primero?</legend>
            <div className="eleccion">
              {disponibles.map((c) => (<label key={c.id}>
                  <input type="radio" name="competencia" value={c.id} checked={competencia === c.id} onChange={() => setCompetencia(c.id)}/>
                  <span className="eleccion-icono" aria-hidden="true"><c.icono size={20}/></span>
                  <span>
                    <strong>{c.nombre}</strong>
                    <br />
                    <span className="ayuda">{c.detalle}</span>
                  </span>
                </label>))}
            </div>
          </fieldset>
        </div>

        <div className="bloque">
          <fieldset className="campo">
            <legend><span className="bloque-num" aria-hidden="true">3</span> ¿Qué te pasa cuando practicas? <span className="opcional">(opcional, puedes marcar varias)</span></legend>
            <div className="eleccion eleccion-columna">
              {DIFICULTADES.map((d) => (<label key={d.id}>
                  <input type="checkbox" checked={dificultades.includes(d.id)} onChange={() => alternar(d.id)}/>
                  <span className="eleccion-icono" aria-hidden="true"><d.icono size={20}/></span>
                  <span>{d.texto}</span>
                </label>))}
            </div>
            <div className="asi-te-ayuda" aria-live="polite">
              {dificultades.length > 0 && (<>
                  <strong><Sparkles size={16} aria-hidden="true"/> Así te ayuda Lumora</strong>
                  <ul>
                    {DIFICULTADES.filter((d) => dificultades.includes(d.id)).map((d) => (<li key={d.id}>{d.ayuda}</li>))}
                  </ul>
                </>)}
            </div>
            <p className="ayuda">Estas respuestas no se guardan: solo sirven para mostrarte esto.</p>
          </fieldset>
        </div>

        <div className="acciones">
          <button className="boton boton-grande" type="submit" disabled={!puede}>
            Crear mi espacio
          </button>
          {!puede && <p className="ayuda">Escribe tu apodo para continuar.</p>}
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
