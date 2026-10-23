import { medallas, nivelDe } from '../lib/logros.js';

/** Nivel y puntos. */
export function Nivel({ puntos }) {
    const n = nivelDe(puntos);
    return (<div className="nivel">
      <div className="nivel-fila">
        <div>
          <p className="etiqueta-seccion">Tu nivel</p>
          <h2>
            Nivel {n.numero} · {n.nombre}
          </h2>
        </div>
        <b className="nivel-puntos">{puntos} pts</b>
      </div>
      <div className="progreso-barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={n.pct} aria-label="Avance hacia el siguiente nivel">
        <span style={{ width: `${n.pct}%` }}/>
      </div>
      <p className="ayuda">
        {n.siguiente
            ? `Te faltan ${n.faltan} puntos para «${n.siguiente}». Sumas con cada ejercicio, diagnóstico y tipo dominado.`
            : 'Llegaste al nivel más alto. Gracias por no soltarlo.'}
      </p>
    </div>);
}

/** Medallas logradas y por lograr (cada una dice cómo conseguirla). */
export function Medallas({ estado }) {
    const lista = medallas(estado);
    const logradas = lista.filter((m) => m.lograda).length;
    return (<div className="medallas">
      <div className="ruta-encabezado">
        <h2>Tus medallas</h2>
        <span className="conteo">
          {logradas} de {lista.length}
        </span>
      </div>
      <ul className="medallas-lista">
        {lista.map((m) => (<li key={m.id} className={m.lograda ? 'lograda' : 'pendiente'}>
            <span className="medalla-icono" aria-hidden="true">
              {m.lograda ? '★' : '☆'}
            </span>
            <span>
              <strong>{m.nombre}</strong>
              <span className="ayuda"> {m.lograda ? 'Conseguida.' : m.como}</span>
            </span>
          </li>))}
      </ul>
    </div>);
}

/** Lo que ganaste justo ahora (se muestra al terminar un diagnóstico o una práctica). */
export function Recompensa({ r }) {
    if (!r || (r.puntos <= 0 && r.medallas.length === 0))
        return null;
    return (<div className="recompensa" role="status">
      <h2>Lo que sumaste</h2>
      <p>
        <b>+{r.puntos} puntos</b>
        {r.subioNivel ? ` · Subiste al nivel «${r.subioNivel}»` : ''}
      </p>
      {r.medallas.length > 0 && (<ul>
          {r.medallas.map((m) => (<li key={m.id}>
              <span aria-hidden="true">★ </span>
              Medalla nueva: <strong>{m.nombre}</strong>
            </li>))}
        </ul>)}
    </div>);
}
