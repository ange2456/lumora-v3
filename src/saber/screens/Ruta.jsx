import { Sparkles } from 'lucide-react';
import { COMPETENCIAS, COMPETENCIAS_POR_PRUEBA, TIPOS_ERROR } from '../data/questions.js';
import { TOTAL_DIAGNOSTICO } from '../data/banco.js';
import Respaldo from './Respaldo.jsx';
import MapaAvance from './MapaAvance.jsx';
import { Medallas, Nivel } from './Motivacion.jsx';
import { calcularPuntos } from '../lib/logros.js';
import { CORTO, nivelAhora, nivelesDeDiagnostico } from '../lib/mapa.js';
import { META_DIARIA, calcularRacha, claveDia, } from '../lib/saberStorage.js';
export default function Ruta({ combinar, estado, competencia, onCompetencia, intentos, diag, hayDiagnosticoEnCurso, onDiagnostico, onContinuarDiagnostico, onVerResultado, onPracticar, onImportar }) {
    const { perfil, progreso, actividad } = estado;
    const hoy = actividad[claveDia()] ?? 0;
    const racha = calcularRacha(actividad);
    const metaCumplida = hoy >= META_DIARIA;
    const pct = Math.min(100, (hoy / META_DIARIA) * 100);
    const prueba = perfil?.prueba === 'saberpro' ? 'Saber Pro' : 'Saber 11';
    const todos = COMPETENCIAS[competencia].tipos;
    // Solo las competencias de tu prueba (y la que tengas abierta, aunque venga de un respaldo).
    const lista = Object.values(COMPETENCIAS).filter((c) => (COMPETENCIAS_POR_PRUEBA[perfil?.prueba] ?? COMPETENCIAS_POR_PRUEBA.saber11).includes(c.id) || c.id === competencia);
    const orden = diag
        ? [...diag.porTipo.map((t) => t.tipo), ...todos.filter((t) => !diag.porTipo.some((x) => x.tipo === t))]
        : todos;
    const dominados = todos.filter((t) => progreso[t]?.dominado).length;
    // Mapa: primer diagnóstico (si hay más de uno) frente a cómo vas ahora.
    const ultimo = intentos[intentos.length - 1];
    const base = ultimo ? nivelesDeDiagnostico(ultimo, competencia) : null;
    const ahora = base ? Object.fromEntries(todos.map((t) => [t, nivelAhora(base[t], progreso[t])])) : null;
    const antes = intentos.length > 1 ? nivelesDeDiagnostico(intentos[0], competencia) : null;
    return (<section>
      <header className="ruta-hero">
        <p className="ruta-kicker"><Sparkles size={15} aria-hidden="true"/> Tu espacio de aprendizaje</p>
        <h1 className="titulo-ruta">Hola, {perfil?.apodo}. Esta es tu ruta para {prueba}.</h1>
        <p className="ruta-sub">Avanza a tu ritmo: descubre qué reforzar y convierte cada práctica en un paso hacia tu meta.</p>
      </header>

      <p className="etiqueta-seccion etiqueta-practica" id="etiqueta-competencia">¿Qué quieres practicar hoy?</p>
      <div className="selector-competencia selector-grande" role="group" aria-labelledby="etiqueta-competencia">
        {lista.map((c) => (<button key={c.id} type="button" aria-pressed={c.id === competencia} onClick={() => onCompetencia(c.id)}>
            {c.nombre}
          </button>))}
      </div>

      <div className="hoy">
        <div className="hoy-fila">
          <div>
            <h2>Meta de hoy</h2>
            <p className="ayuda">
              {metaCumplida ? 'Cumplida. Lo que sigas es ganancia.' : `${META_DIARIA} ejercicios, unos 10 minutos.`}
            </p>
          </div>
          <div className="hoy-cifras">
            <b>
              {Math.min(hoy, 99)}/{META_DIARIA}
            </b>
            <span>{racha > 0 ? `Racha de ${racha} ${racha === 1 ? 'día' : 'días'}` : 'Sin racha aún'}</span>
          </div>
        </div>
        <div className="progreso-barra" role="progressbar" aria-valuemin={0} aria-valuemax={META_DIARIA} aria-valuenow={Math.min(hoy, META_DIARIA)} aria-label="Ejercicios de hoy">
          <span style={{ width: `${pct}%` }}/>
        </div>
      </div>

      <Nivel puntos={calcularPuntos(estado)}/>

      {!diag && (<div className="paso-inicial">
          <h2>Primer paso: tu diagnóstico</h2>
          <p>
            {TOTAL_DIAGNOSTICO} preguntas de {COMPETENCIAS[competencia].nombre.toLowerCase()}, unos 5 minutos. Te muestra qué error cometes más y cuál es tu punto ciego, para que
            la práctica empiece donde más te sirve.
          </p>
          <div className="acciones">
            {hayDiagnosticoEnCurso ? (<>
                <button className="boton" type="button" onClick={onContinuarDiagnostico}>
                  Continuar mi diagnóstico
                </button>
                <button className="boton boton-suave" type="button" onClick={onDiagnostico}>
                  Empezar de nuevo
                </button>
              </>) : (<button className="boton" type="button" onClick={onDiagnostico}>
                Hacer el diagnóstico
              </button>)}
          </div>
        </div>)}

      {ahora && (<div className="mapa-habilidades">
          <h2>Tu mapa de habilidades</h2>
          <p className="ayuda">
            Cuanto más lejos del centro, mejor lo manejas. Se mueve con tus diagnósticos y con tu práctica.
          </p>
          <MapaAvance tipos={todos} antes={antes} ahora={ahora} nombreCompetencia={COMPETENCIAS[competencia].nombre}/>
          <ol className="camino">
            {todos.map((t) => {
                const dom = progreso[t]?.dominado;
                const proc = !dom && progreso[t];
                return (<li key={t} className={dom ? 'dominado' : proc ? 'proceso' : 'pendiente'}>
                  <span className="nodo" aria-hidden="true">{dom ? '★' : proc ? '●' : '○'}</span>
                  <span>
                    <strong>{CORTO[t]}</strong>
                    <span className="ayuda"> {Math.round(ahora[t] * 100)}% · {dom ? 'Dominado' : proc ? 'En proceso' : ahora[t] >= 1 ? 'Sin errores en el diagnóstico' : 'Por practicar'}</span>
                  </span>
                </li>);
            })}
          </ol>
        </div>)}

      <div className="ruta-lista">
        <div className="ruta-encabezado">
          <h2>{diag ? 'Qué practicar, en orden' : 'Lo que vas a practicar'}</h2>
          <span className="conteo">
            {dominados} de {todos.length} dominados
          </span>
        </div>
        {!diag && (<p className="ayuda">Puedes entrar a cualquiera ya, pero el orden se ajusta a tus errores cuando hagas el diagnóstico.</p>)}

        {orden.map((tipo, i) => {
            const info = TIPOS_ERROR[tipo];
            const prog = progreso[tipo];
            const resumen = diag?.porTipo.find((t) => t.tipo === tipo);
            const sinErrores = diag && !resumen;
            const estadoTxt = prog?.dominado ? 'Dominado' : prog ? 'En proceso' : sinErrores ? 'Sin errores' : 'Por practicar';
            const clase = prog?.dominado ? 'dominado' : prog ? 'proceso' : 'pendiente';
            const empiezaAqui = diag && i === 0 && !prog?.dominado && !sinErrores;
            return (<article key={tipo} className={`tarjeta-tipo${empiezaAqui ? ' es-prioridad' : ''}`}>
              <div className="fila-cabecera">
                <h3>{info.nombre}</h3>
                <span className={`pildora ${clase}`}>{estadoTxt}</span>
              </div>
              <p className="desc">{info.descripcion}</p>
              <p className="meta-tipo">
                {resumen
                    ? `${resumen.errores} ${resumen.errores === 1 ? 'error' : 'errores'} en tu diagnóstico${resumen.puntosCiegos > 0 ? `, ${resumen.puntosCiegos} con seguridad` : ''}`
                    : diag
                        ? 'No fallaste aquí en el diagnóstico'
                        : ''}
                {prog && (<>
                    {resumen || diag ? ' · ' : ''}
                    Última práctica: {prog.ultimaPractica}/3
                    {prog.ultimaTransferencia ? ' y problema nuevo resuelto' : ', problema nuevo pendiente'}
                  </>)}
              </p>
              <div className="acciones" style={{ marginTop: 12 }}>
                <button className={empiezaAqui ? 'boton' : 'boton boton-suave'} type="button" onClick={() => onPracticar(tipo)}>
                  {prog ? 'Practicar otra vez' : empiezaAqui ? 'Empezar aquí' : 'Practicar'}
                </button>
              </div>
            </article>);
        })}
      </div>

      <Medallas estado={estado}/>

      <div className="mi-progreso">
        <h2>Tu progreso</h2>
        {intentos.length === 0 ? (<p className="ayuda" style={{ marginTop: 8 }}>
            Cuando hagas tu primer diagnóstico, aquí verás cómo cambia con el tiempo.
          </p>) : (<>
            <ul className="historial">
              {intentos.map((it, i) => (<li key={it.fecha}>
                  <span>Diagnóstico {i + 1}</span>
                  <b>
                    {it.aciertos}/{it.total}
                  </b>
                  <span className="ayuda">{it.puntosCiegos} con seguridad equivocada</span>
                </li>))}
            </ul>
            <div className="acciones" style={{ marginTop: 16 }}>
              <button className="boton boton-suave" type="button" onClick={onVerResultado}>
                Ver mi mapa de errores
              </button>
              <button className="boton boton-suave" type="button" onClick={onDiagnostico}>
                {intentos.length > 0 ? 'Repetir el diagnóstico' : 'Hacer el diagnóstico'}
              </button>
            </div>
            {intentos.length === 1 && (<p className="ayuda" style={{ marginTop: 10 }}>
                Practica unos días y repite el diagnóstico: así ves tu mejora con tus propios números.
              </p>)}
          </>)}
      </div>

      <Respaldo estado={estado} onImportar={onImportar} combinar={combinar}/>
    </section>);
}
