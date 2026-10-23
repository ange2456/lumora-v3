import { useState } from 'react';
import Respaldo from './Respaldo.jsx';
import Historia from './Historia.jsx';
const PRUEBAS = [
    { id: 'saber11', nombre: 'Saber 11', detalle: 'Estoy en 11° o terminando el bachillerato' },
    { id: 'saberpro', nombre: 'Saber Pro', detalle: 'Estoy en la universidad' },
];
const PASOS = [
    ['Diagnóstico', '10 preguntas para ver qué errores repites y con cuánta seguridad.'],
    ['Práctica dirigida', 'Una lección corta y ejercicios solo del error que más te cuesta.'],
    ['Problema nuevo', 'Un caso distinto de la vida real para comprobar que ya puedes usarlo.'],
];
export default function Inicio({ onCrear, onImportar, nombreInicial = '' }) {
    const [apodo, setApodo] = useState(nombreInicial);
    const [prueba, setPrueba] = useState('saber11');
    const puede = apodo.trim().length >= 2;
    return (<section className="hero">
      <h1>Un buen puntaje en Saber abre puertas. Llega sabiendo qué te falta.</h1>
      <p className="sub">
        Lumora descubre qué errores repites, te hace practicar justo eso y te pone a prueba con problemas nuevos. Es para
        quien está en 11° y para quien está en la universidad, haya hecho un preicfes o no. Sesiones cortas, desde el
        celular y sin cuenta.
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
                onCrear({ apodo: apodo.trim(), prueba });
        }}>
        <div className="campo">
          <label htmlFor="apodo">¿Cómo te decimos?</label>
          <input id="apodo" type="text" value={apodo} maxLength={24} autoComplete="off" placeholder="Un apodo o tu nombre" onChange={(e) => setApodo(e.target.value)}/>
          <p className="ayuda">Con un apodo basta. No pedimos correo ni datos personales.</p>
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

        <div className="acciones">
          <button className="boton" type="submit" disabled={!puede}>
            Crear mi espacio
          </button>
        </div>
      </form>

      <p className="privacidad">
        Tu progreso se guarda solo en este dispositivo. Las preguntas son de práctica y no son material oficial del ICFES.
      </p>

      {onImportar && <Respaldo soloCargar onImportar={onImportar}/>}
    </section>);
}
