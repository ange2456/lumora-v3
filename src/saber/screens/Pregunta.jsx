import { useState } from 'react';
import Texto from './Texto.jsx';
const LETRAS = ['A', 'B', 'C', 'D'];
const NIVELES = [
    { id: 'segura', titulo: 'Segura', detalle: 'Lo tengo claro' },
    { id: 'dudo', titulo: 'Dudo', detalle: 'Creo que sí, pero no estoy segura' },
    { id: 'adivine', titulo: 'Adiviné', detalle: 'No sabía, escogí una' },
];
export default function Pregunta({ pregunta, indice, total, onConfirmar }) {
    const [opcionId, setOpcionId] = useState(null);
    const [confianza, setConfianza] = useState(null);
    const opciones = pregunta.opciones; // ya vienen en orden aleatorio desde el generador
    const progreso = (indice / total) * 100;
    return (<section>
      <div className="progreso">
        <div className="progreso-barra" aria-hidden="true">
          <span style={{ width: `${progreso}%` }}/>
        </div>
        <p className="progreso-texto" aria-live="polite">
          Pregunta {indice + 1} de {total}
        </p>
      </div>

      <Texto texto={pregunta.texto}/>

      <h1 className="enunciado" style={{ fontFamily: 'var(--font-body)', letterSpacing: 0 }}>
        {pregunta.enunciado}
      </h1>

      {pregunta.tabla && (<div className="tabla-caja" role="region" aria-label="Tabla de datos" tabIndex={0}>
          <table>
            <thead>
              <tr>
                {pregunta.tabla.encabezados.map((h) => (<th key={h} scope="col">
                    {h}
                  </th>))}
              </tr>
            </thead>
            <tbody>
              {pregunta.tabla.filas.map((fila) => (<tr key={fila[0]}>
                  {fila.map((celda, i) => (<td key={i}>{celda}</td>))}
                </tr>))}
            </tbody>
          </table>
        </div>)}

      <fieldset className="opciones">
        <legend className="ayuda" style={{ padding: 0, marginBottom: 2 }}>
          Elige una respuesta
        </legend>
        {opciones.map((o, i) => (<label className="opcion" key={o.id}>
            <input type="radio" name={`pregunta-${pregunta.id}`} value={o.id} checked={opcionId === o.id} onChange={() => setOpcionId(o.id)}/>
            <span className="letra" aria-hidden="true">
              {LETRAS[i]}
            </span>
            <span>{o.texto}</span>
          </label>))}
      </fieldset>

      {opcionId && (<div className="bloque-confianza">
          <h2>¿Qué tan segura estás de esa respuesta?</h2>
          <fieldset className="confianza">
            <legend className="ayuda" style={{ padding: 0 }}>
              Antes de ver el resultado, marca cómo te sientes
            </legend>
            {NIVELES.map((n) => (<label key={n.id}>
                <input type="radio" name={`confianza-${pregunta.id}`} value={n.id} checked={confianza === n.id} onChange={() => setConfianza(n.id)}/>
                <strong>{n.titulo}</strong>
                <span>{n.detalle}</span>
              </label>))}
          </fieldset>
        </div>)}

      <div className="pie-pregunta">
        <button className="boton" type="button" disabled={!opcionId || !confianza} onClick={() => opcionId && confianza && onConfirmar(opcionId, confianza)}>
          {indice + 1 === total ? 'Ver mi mapa de errores' : 'Confirmar y seguir'}
        </button>
      </div>
    </section>);
}
