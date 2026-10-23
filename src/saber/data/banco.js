// Arma diagnósticos y sesiones de práctica a partir de las plantillas.
// La misma semilla (y la misma competencia) produce siempre las mismas preguntas.

import { armar, barajar, crearRng } from '../lib/generador.js'
import { COMPETENCIA_INICIAL, TIPOS_ERROR, tiposDe } from './questions.js'
import { PLANTILLAS } from './plantillas.js'
import { PLANTILLAS_CRITICA } from './plantillas-critica.js'

export const TODAS_LAS_PLANTILLAS = [
  ...PLANTILLAS.map((p) => ({ competencia: 'cuantitativo', ...p })),
  ...PLANTILLAS_CRITICA,
]

export const POR_TIPO_DIAGNOSTICO = 2
export const TIPOS_POR_COMPETENCIA = 5
export const TOTAL_DIAGNOSTICO = TIPOS_POR_COMPETENCIA * POR_TIPO_DIAGNOSTICO

const normales = (tipo) => TODAS_LAS_PLANTILLAS.filter((p) => p.tipo === tipo && !p.transferencia)
const nuevas = (tipo) => TODAS_LAS_PLANTILLAS.filter((p) => p.tipo === tipo && p.transferencia)

/** 10 preguntas: 2 plantillas distintas por tipo de error de la competencia, en orden mezclado. */
export function generarDiagnostico(semilla, competencia = COMPETENCIA_INICIAL) {
  const r = crearRng(semilla)
  const lista = []
  for (const tipo of tiposDe(competencia)) {
    barajar(r, normales(tipo))
      .slice(0, POR_TIPO_DIAGNOSTICO)
      .forEach((p) => lista.push(p))
  }
  return barajar(r, lista).map((p, i) => ({ ...armar(p, r), id: `d${i + 1}-${p.id}` }))
}

/** 4 ejercicios para un tipo: 3 distintos de práctica y 1 problema nuevo (contexto distinto). */
export function generarSesion(tipo, semilla) {
  if (!TIPOS_ERROR[tipo]) throw new Error(`Tipo de error desconocido: ${tipo}`)
  const r = crearRng(semilla)
  const practica = barajar(r, normales(tipo)).slice(0, 3)
  const transfer = barajar(r, nuevas(tipo))[0]
  return [...practica, transfer].map((p, i) => ({ ...armar(p, r), id: `s${i + 1}-${p.id}` }))
}
