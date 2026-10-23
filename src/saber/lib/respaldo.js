// Exportar e importar el progreso de la ruta Saber como un archivo .json.
// Al importar no se confía en el archivo: se valida cada campo, se descartan los que sobran
// y los resultados (aciertos, puntos ciegos, prioridad) se recalculan a partir de las respuestas.

import { TOTAL_DIAGNOSTICO, generarDiagnostico } from '../data/banco.js'
import { COMPETENCIA_INICIAL, TIPOS_ERROR, esCompetencia } from '../data/questions.js'
import { calcularDiagnostico } from './diagnosis.js'

export const FORMATO = 'lumora-saber'
export const VERSION = 2
const MAX_BYTES = 500_000
const PRUEBAS = ['saber11', 'saberpro']
const CONFIANZAS = ['segura', 'dudo', 'adivine']
const OPCIONES = ['a', 'b', 'c', 'd']
const DIA = /^\d{4}-\d{2}-\d{2}$/

const entero = (v, min, max) => Number.isInteger(v) && v >= min && v <= max
const texto = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max

/** Texto JSON listo para guardar. Solo incluye lo que se puede restaurar. */
export function exportarProgreso(estado) {
  const { perfil, intentos, progreso, actividad, competencia } = estado
  return JSON.stringify(
    { formato: FORMATO, version: VERSION, exportado: new Date().toISOString(), estado: { perfil, intentos, progreso, actividad, competencia } },
    null,
    2,
  )
}

/** Nombre de archivo seguro: lumora-progreso-ana-2026-10-23.json */
export function nombreArchivo(apodo, fecha = new Date()) {
  const base =
    String(apodo ?? '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'estudiante'
  const d = [fecha.getFullYear(), String(fecha.getMonth() + 1).padStart(2, '0'), String(fecha.getDate()).padStart(2, '0')].join('-')
  return `lumora-progreso-${base}-${d}.json`
}

const falla = (error) => ({ ok: false, error })

/** Valida el texto de un archivo. Devuelve { ok: true, estado } o { ok: false, error }. */
export function leerProgreso(crudo) {
  if (typeof crudo !== 'string' || crudo.length === 0) return falla('El archivo está vacío.')
  if (crudo.length > MAX_BYTES) return falla('El archivo es demasiado grande para ser un progreso de Lumora.')

  let obj
  try {
    obj = JSON.parse(crudo)
  } catch {
    return falla('Ese archivo no se pudo leer. Elige el que descargaste desde Lumora.')
  }
  if (!obj || typeof obj !== 'object' || obj.formato !== FORMATO) return falla('Ese archivo no es un progreso de Lumora.')
  if (obj.version !== VERSION) return falla('Este progreso viene de otra versión de Lumora y no se puede cargar.')

  const e = obj.estado
  if (!e || typeof e !== 'object') return falla('El archivo no trae progreso.')

  // Perfil
  const p = e.perfil
  if (!p || typeof p !== 'object') return falla('Al archivo le falta el perfil.')
  const apodo = typeof p.apodo === 'string' ? p.apodo.trim() : ''
  if (apodo.length < 2 || apodo.length > 24 || !PRUEBAS.includes(p.prueba)) return falla('El perfil del archivo no es válido.')
  const perfil = { apodo, prueba: p.prueba }

  // Intentos: se comprueban contra las preguntas que genera su propia semilla
  if (!Array.isArray(e.intentos) || e.intentos.length > 200) return falla('Los diagnósticos del archivo no son válidos.')
  const intentos = []
  for (const it of e.intentos) {
    if (!it || typeof it !== 'object' || !entero(it.semilla, 0, 2 ** 31) || !texto(it.fecha, 40) || Number.isNaN(Date.parse(it.fecha))) {
      return falla('Un diagnóstico del archivo está dañado.')
    }
    // Los diagnósticos guardados antes de existir la lectura crítica no traen competencia.
    const competencia = it.competencia === undefined ? COMPETENCIA_INICIAL : it.competencia
    if (!esCompetencia(competencia)) return falla('Un diagnóstico del archivo es de una competencia desconocida.')
    if (!Array.isArray(it.respuestas) || it.respuestas.length !== TOTAL_DIAGNOSTICO) return falla('Un diagnóstico del archivo está incompleto.')
    const preguntas = generarDiagnostico(it.semilla, competencia)
    const respuestas = []
    for (let i = 0; i < TOTAL_DIAGNOSTICO; i++) {
      const r = it.respuestas[i]
      if (!r || r.preguntaId !== preguntas[i].id || !OPCIONES.includes(r.opcionId) || !CONFIANZAS.includes(r.confianza)) {
        return falla('Las respuestas de un diagnóstico no corresponden a sus preguntas.')
      }
      respuestas.push({ preguntaId: r.preguntaId, opcionId: r.opcionId, confianza: r.confianza })
    }
    const d = calcularDiagnostico(respuestas, preguntas)
    intentos.push({
      fecha: it.fecha,
      competencia,
      semilla: it.semilla,
      aciertos: d.aciertos,
      total: d.total,
      puntosCiegos: d.puntosCiegos,
      prioridad: d.prioridad,
      respuestas,
    })
  }

  // Progreso por tipo
  const progreso = {}
  if (e.progreso !== undefined && (e.progreso === null || typeof e.progreso !== 'object' || Array.isArray(e.progreso))) {
    return falla('El avance por tipo de error no es válido.')
  }
  for (const tipo of Object.keys(TIPOS_ERROR)) {
    const g = e.progreso?.[tipo]
    if (g === undefined) continue
    if (!g || typeof g !== 'object' || !entero(g.sesiones, 0, 9999) || !entero(g.ultimaPractica, 0, 3)) {
      return falla('El avance por tipo de error no es válido.')
    }
    progreso[tipo] = {
      sesiones: g.sesiones,
      ultimaPractica: g.ultimaPractica,
      ultimaTransferencia: g.ultimaTransferencia === true,
      dominado: g.dominado === true,
    }
  }

  // Actividad diaria
  const actividad = {}
  const dias = Object.entries(e.actividad ?? {})
  if (e.actividad !== undefined && (e.actividad === null || typeof e.actividad !== 'object' || Array.isArray(e.actividad))) {
    return falla('La actividad diaria no es válida.')
  }
  if (dias.length > 800) return falla('La actividad diaria no es válida.')
  for (const [dia, n] of dias) {
    if (!DIA.test(dia) || !entero(n, 0, 999)) return falla('La actividad diaria no es válida.')
    actividad[dia] = n
  }

  return { ok: true, estado: { perfil, intentos, progreso, actividad, ...(esCompetencia(e.competencia) ? { competencia: e.competencia } : {}) } }
}
