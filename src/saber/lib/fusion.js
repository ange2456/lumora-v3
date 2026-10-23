// Fusión del progreso de dos dispositivos. Nunca se pierde nada: se une todo y, donde hay
// dos versiones del mismo dato, se queda con la más avanzada. Es segura de repetir
// (fusionar(a, fusionar(a, b)) = fusionar(a, b)) y por eso se puede sincronizar sin conflictos.

const MAX_INTENTOS = 200
const MAX_DIAS = 800

const clave = (i) => `${i.fecha}|${i.competencia ?? 'cuantitativo'}|${i.semilla}`

function fusionarProgreso(a = {}, b = {}) {
  const r = {}
  for (const tipo of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[tipo]
    const y = b[tipo]
    if (!x || !y) {
      r[tipo] = { ...(x ?? y) }
      continue
    }
    const base = y.sesiones > x.sesiones ? y : x
    r[tipo] = {
      sesiones: Math.max(x.sesiones, y.sesiones),
      ultimaPractica: base.ultimaPractica,
      ultimaTransferencia: base.ultimaTransferencia === true,
      dominado: x.dominado === true || y.dominado === true,
    }
  }
  return r
}

/** `local` manda en lo que solo existe en este dispositivo (enCurso, competencia elegida). */
export function fusionar(local, remoto) {
  const porClave = new Map()
  for (const i of [...(remoto.intentos ?? []), ...(local.intentos ?? [])]) porClave.set(clave(i), i)
  const intentos = [...porClave.values()].sort((p, q) => Date.parse(p.fecha) - Date.parse(q.fecha)).slice(-MAX_INTENTOS)

  const actividad = {}
  for (const src of [remoto.actividad ?? {}, local.actividad ?? {}]) {
    for (const [dia, n] of Object.entries(src)) actividad[dia] = Math.max(actividad[dia] ?? 0, n)
  }
  const dias = Object.keys(actividad).sort()
  for (const d of dias.slice(0, Math.max(0, dias.length - MAX_DIAS))) delete actividad[d]

  const fusion = {
    perfil: local.perfil ?? remoto.perfil,
    intentos,
    progreso: fusionarProgreso(local.progreso, remoto.progreso),
    actividad,
  }
  const competencia = local.competencia ?? remoto.competencia
  if (competencia) fusion.competencia = competencia
  if (local.enCurso) fusion.enCurso = local.enCurso
  return fusion
}

/** Lo que se sube a la nube: sin el diagnóstico a medias, que es solo de este dispositivo. */
export function paraNube(estado) {
  const { enCurso: _enCurso, ...resto } = estado
  return resto
}

const ordenado = (v) => {
  if (Array.isArray(v)) return v.map(ordenado)
  if (v && typeof v === 'object') return Object.fromEntries(Object.keys(v).sort().map((k) => [k, ordenado(v[k])]))
  return v
}

/** ¿Tienen el mismo contenido que se guarda en la nube? (ignora enCurso y el orden de las claves) */
export function mismoContenido(a, b) {
  const { competencia: _c1, ...x } = paraNube(a)
  const { competencia: _c2, ...y } = paraNube(b)
  return JSON.stringify(ordenado(x)) === JSON.stringify(ordenado(y))
}

/** Huella del contenido que se sincroniza: si no cambia, no hay nada que subir. */
export function huella(estado) {
  const { competencia: _c, ...x } = paraNube(estado)
  return JSON.stringify(ordenado(x))
}
