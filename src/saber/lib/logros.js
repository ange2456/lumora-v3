// Puntos, niveles y medallas. Todo se calcula desde el progreso guardado:
// no se guarda nada nuevo, así que no hay nada que se pueda desincronizar ni falsear al importar.

import { COMPETENCIA_INICIAL } from '../data/questions.js'
import { META_DIARIA, calcularRacha, claveDia } from './saberStorage.js'

export const PUNTOS = { ejercicio: 10, diagnostico: 30, dominado: 50 }

export const NIVELES = [
  { min: 0, nombre: 'Curiosidad' },
  { min: 60, nombre: 'Constancia' },
  { min: 150, nombre: 'Método' },
  { min: 300, nombre: 'Criterio' },
  { min: 500, nombre: 'Dominio' },
  { min: 800, nombre: 'Maestría' },
]

const comp = (i) => i.competencia ?? COMPETENCIA_INICIAL

export function calcularPuntos(estado) {
  const ejercicios = Object.values(estado.actividad ?? {}).reduce((a, n) => a + (Number.isFinite(n) ? n : 0), 0)
  const dominados = Object.values(estado.progreso ?? {}).filter((g) => g?.dominado).length
  return ejercicios * PUNTOS.ejercicio + (estado.intentos?.length ?? 0) * PUNTOS.diagnostico + dominados * PUNTOS.dominado
}

/** Nivel actual y cuánto falta para el siguiente. */
export function nivelDe(puntos) {
  let i = 0
  while (i + 1 < NIVELES.length && puntos >= NIVELES[i + 1].min) i++
  const actual = NIVELES[i]
  const siguiente = NIVELES[i + 1] ?? null
  return {
    numero: i + 1,
    nombre: actual.nombre,
    siguiente: siguiente?.nombre ?? null,
    faltan: siguiente ? siguiente.min - puntos : 0,
    pct: siguiente ? Math.round(((puntos - actual.min) / (siguiente.min - actual.min)) * 100) : 100,
  }
}

const porCompetencia = (estado) => {
  const m = {}
  for (const it of estado.intentos ?? []) (m[comp(it)] ??= []).push(it)
  return m
}

export const MEDALLAS = [
  { id: 'primer-paso', nombre: 'Primer paso', como: 'Haz tu primer diagnóstico.', ok: (e) => (e.intentos?.length ?? 0) >= 1 },
  { id: 'punto-ciego', nombre: 'Descubriste un punto ciego', como: 'Encuentra una respuesta que marcaste con seguridad y estaba mal. Eso es ganar información.', ok: (e) => (e.intentos ?? []).some((i) => i.puntosCiegos > 0) },
  { id: 'primer-ejercicio', nombre: 'A practicar', como: 'Termina un ejercicio de práctica.', ok: (e) => Object.values(e.actividad ?? {}).some((n) => n > 0) },
  { id: 'meta-dia', nombre: 'Meta del día', como: `Haz ${META_DIARIA} ejercicios en un mismo día.`, ok: (e) => Object.values(e.actividad ?? {}).some((n) => n >= META_DIARIA) },
  { id: 'caso-nuevo', nombre: 'Lo usaste en un caso nuevo', como: 'Resuelve un problema nuevo, en un contexto distinto.', ok: (e) => Object.values(e.progreso ?? {}).some((g) => g?.ultimaTransferencia) },
  { id: 'dominado', nombre: 'Tipo dominado', como: 'Domina un tipo de error: 2 de 3 ejercicios y el problema nuevo.', ok: (e) => Object.values(e.progreso ?? {}).some((g) => g?.dominado) },
  { id: 'racha-3', nombre: 'Tres días seguidos', como: 'Practica tres días seguidos.', ok: (e) => calcularRacha(e.actividad ?? {}) >= 3 },
  { id: 'subiste', nombre: 'Subiste tu puntaje', como: 'Repite un diagnóstico y acierta más que en el primero.', ok: (e) => Object.values(porCompetencia(e)).some((l) => l.length >= 2 && l[l.length - 1].aciertos > l[0].aciertos) },
  { id: 'sin-ciegos', nombre: 'Sin puntos ciegos', como: 'Haz un diagnóstico sin ningún error con seguridad.', ok: (e) => (e.intentos ?? []).some((i) => i.puntosCiegos === 0) },
  { id: 'dos-competencias', nombre: 'Dos miradas', como: 'Haz el diagnóstico de dos competencias distintas (por ejemplo, cuantitativo y lectura crítica).', ok: (e) => Object.keys(porCompetencia(e)).length >= 2 },
]

/** Todas las medallas con su estado. */
export function medallas(estado) {
  return MEDALLAS.map(({ ok, ...m }) => ({ ...m, lograda: !!ok(estado) }))
}

/** Lo que ganó entre un estado y otro: puntos, medallas nuevas y si subió de nivel. */
export function recompensa(antes, despues) {
  const a = new Set(medallas(antes).filter((m) => m.lograda).map((m) => m.id))
  const nuevas = medallas(despues).filter((m) => m.lograda && !a.has(m.id))
  const pa = calcularPuntos(antes)
  const pd = calcularPuntos(despues)
  const na = nivelDe(pa)
  const nd = nivelDe(pd)
  return { puntos: pd - pa, medallas: nuevas, subioNivel: nd.numero > na.numero ? nd.nombre : null }
}

export { claveDia }
