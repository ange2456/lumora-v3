import { COMPETENCIAS, TIPOS_ERROR } from '../data/questions.js';
import Texto from './Texto.jsx';
import { Recompensa } from './Motivacion.jsx';
import { mensajePrioridad } from '../lib/diagnosis.js';
const ETIQUETA = {
    segura: 'Segura',
    dudo: 'Dudo',
    adivine: 'Adiviné',
};
const INICIAL = { segura: 'S', dudo: 'D', adivine: 'A' };
export default function Resultado({ apodo, competencia, recompensa, intentos, preguntas, diag: d, onPracticar, onRuta, onRepetir }) {
    const ultimo = intentos[intentos.length - 1];
    const primero = intentos[0];
    const respuestas = ultimo.respuestas;
    const comparar = intentos.length > 1;
    const orden = [
        ...d.porTipo.map((t) => t.tipo),
        ...COMPETENCIAS[competencia].tipos.filter((t) => !d.porTipo.some((x) => x.tipo === t)),
    ];
    const prioridadNombre = d.prioridad ? TIPOS_ERROR[d.prioridad].nombre : null;
    return (<section className="resultado">
      <h1>{apodo}, este es tu mapa de errores.</h1>
      <p className="etiqueta-seccion">{COMPETENCIAS[competencia].nombre}</p>
      <p className="sub">
        No es una nota. Muestra qué tipo de error cometes y con cuánta seguridad, que es lo que más importa para mejorar.
      </p>

      <div className="cifras">
        <div className="cifra">
          <b>
            {d.aciertos}/{d.total}
          </b>
          <span>respuestas correctas</span>
        </div>
        <div className="cifra">
          <b>{d.puntosCiegos}</b>
          <span>errores con seguridad</span>
        </div>
        <div className="cifra">
          <b>{d.aciertosFragiles}</b>
          <span>aciertos adivinados</span>
        </div>
      </div>

      {comparar && (<div className="comparacion">
          <h2>Tu mejora</h2>
          <p>
            Primer diagnóstico: <b>{primero.aciertos}/{primero.total}</b> · Este: <b>{ultimo.aciertos}/{ultimo.total}</b>.{' '}
            Errores con seguridad: <b>{primero.puntosCiegos}</b> → <b>{ultimo.puntosCiegos}</b>.
          </p>
        </div>)}

      <Recompensa r={recompensa}/>

      <div className="prioridad">
        <h2>Por dónde empezar</h2>
        <p>{mensajePrioridad(d)}</p>
        {d.prioridad && (<div className="acciones" style={{ marginTop: 14 }}>
            <button className="boton" type="button" onClick={() => onPracticar(d.prioridad)}>
              Practicar «{prioridadNombre}» ahora
            </button>
          </div>)}
      </div>

      <div className="mapa">
        <h2>Tus tipos de error</h2>
        <div className="leyenda" aria-label="Leyenda de las fichas">
          <span>S = te equivocaste con seguridad</span>
          <span>D = dudabas</span>
          <span>A = adivinaste</span>
        </div>

        {orden.map((tipo) => {
            const info = TIPOS_ERROR[tipo];
            const r = d.porTipo.find((x) => x.tipo === tipo);
            const errores = r?.errores ?? 0;
            const fichas = r
                ? ['segura', 'dudo', 'adivine'].flatMap((c) => Array(r.porConfianza[c]).fill(c))
                : [];
            return (<article key={tipo} className={`fila-error${tipo === d.prioridad ? ' es-prioridad' : ''}`}>
              <div className="fila-cabecera">
                <h3>{info.nombre}</h3>
                <span className="conteo">
                  {errores === 0 ? 'Sin errores' : `${errores} ${errores === 1 ? 'error' : 'errores'}`}
                  {tipo === d.prioridad ? ' · empieza aquí' : ''}
                </span>
              </div>
              <p className="desc">{info.descripcion}</p>
              <div className="fichas">
                {fichas.length === 0 ? (<span className="sin-errores">Nada que corregir aquí</span>) : (fichas.map((c, i) => (<span key={i} className={`ficha ${c}`} title={ETIQUETA[c]}>
                      {INICIAL[c]}
                    </span>)))}
              </div>
            </article>);
        })}
      </div>

      <div className="revision">
        <h2>Revisa tus respuestas</h2>
        {preguntas.map((p, i) => {
            const r = respuestas.find((x) => x.preguntaId === p.id);
            if (!r)
                return null;
            const elegida = p.opciones.find((o) => o.id === r.opcionId);
            const correcta = p.opciones.find((o) => !o.error);
            const acierto = !elegida.error;
            return (<details key={p.id}>
              <summary>
                <span className="num">{i + 1}</span>
                <span>{p.enunciado.length > 56 ? `${p.enunciado.slice(0, 56)}…` : p.enunciado}</span>
                <span className={`estado ${acierto ? 'bien' : 'mal'}`}>{acierto ? 'Acierto' : 'Error'}</span>
              </summary>
              <div className="detalle">
                <Texto texto={p.texto}/>
                <p>{p.enunciado}</p>
                <p>
                  <b>Tu respuesta:</b> {elegida.texto} ({ETIQUETA[r.confianza].toLowerCase()})
                </p>
                {!acierto && (<>
                    <p>
                      <b>Tipo de error:</b> {TIPOS_ERROR[elegida.error].nombre}. {elegida.porque}
                    </p>
                    <p>
                      <b>Respuesta correcta:</b> {correcta.texto}
                    </p>
                  </>)}
                <p>
                  <b>Cómo se resuelve:</b> {p.explicacion}
                </p>
              </div>
            </details>);
        })}
      </div>

      <div className="acciones fin-acciones">
        <button className="boton" type="button" onClick={onRuta}>
          Ir a mi ruta de práctica
        </button>
        <button className="boton boton-suave" type="button" onClick={onRepetir}>
          Repetir el diagnóstico
        </button>
      </div>
    </section>);
}
