import { CORTO } from '../lib/mapa.js';

const CX = 190;
const CY = 150;
const R = 92;
const punto = (i, n, valor) => {
    const a = (-90 + (360 / n) * i) * (Math.PI / 180);
    return [CX + Math.cos(a) * R * valor, CY + Math.sin(a) * R * valor];
};
const poligono = (valores) => valores.map((v, i) => punto(i, valores.length, v).join(',')).join(' ');

/**
 * Radar de habilidades. `antes` es opcional (primer diagnóstico); `ahora` es obligatorio.
 * El texto de abajo (camino) dice lo mismo con palabras, así que el dibujo no es la única vía.
 */
export default function MapaAvance({ tipos, antes, ahora, nombreCompetencia }) {
    const n = tipos.length;
    const vAhora = tipos.map((t) => Math.max(ahora[t] ?? 0, 0.06));
    const vAntes = antes ? tipos.map((t) => Math.max(antes[t] ?? 0, 0.06)) : null;
    const descripcion = `Mapa de habilidades de ${nombreCompetencia}. ` + tipos.map((t) => `${CORTO[t]} ${Math.round((ahora[t] ?? 0) * 100)} por ciento`).join(', ') + '.';
    return (<figure className="mapa-avance">
      <svg viewBox="0 0 380 300" role="img" aria-label={descripcion}>
        {[0.25, 0.5, 0.75, 1].map((r) => (<polygon key={r} points={poligono(tipos.map(() => r))} className="radar-anillo"/>))}
        {tipos.map((t, i) => {
            const [x, y] = punto(i, n, 1);
            return <line key={t} x1={CX} y1={CY} x2={x} y2={y} className="radar-eje"/>;
        })}
        {vAntes && <polygon points={poligono(vAntes)} className="radar-antes"/>}
        <polygon points={poligono(vAhora)} className="radar-ahora"/>
        {vAhora.map((v, i) => {
            const [x, y] = punto(i, n, v);
            return <circle key={tipos[i]} cx={x} cy={y} r="4.5" className="radar-punto"/>;
        })}
        {tipos.map((t, i) => {
            const [x, y] = punto(i, n, 1.2);
            const ancla = Math.abs(x - CX) < 8 ? 'middle' : x > CX ? 'start' : 'end';
            return (<text key={t} x={x} y={y + 4} textAnchor={ancla} className="radar-texto">
              {CORTO[t]}
            </text>);
        })}
      </svg>
      <figcaption className="radar-leyenda">
        <span><i className="llave ahora" aria-hidden="true"/> Ahora</span>
        {vAntes && (<span><i className="llave antes" aria-hidden="true"/> Primer diagnóstico</span>)}
      </figcaption>
    </figure>);
}
