// Datos del mapa de habilidades: qué tan bien va cada tipo de error (0 a 1).

import { generarDiagnostico } from '../data/banco.js'
import { tiposDe } from '../data/questions.js'
import { POR_TIPO_DIAGNOSTICO } from '../data/banco.js'
import { calcularDiagnostico } from './diagnosis.js'

export const CORTO = {
  base: 'Base',
  proporcion: 'Proporción',
  conversion: 'Unidades',
  lectura: 'Datos',
  incompleta: 'Operación',
  literal: 'Literal',
  detalle: 'Idea principal',
  inferencia: 'Inferencia',
  relacion: 'Relación',
  intencion: 'Intención',
  variables: 'Variables',
  grafica: 'Tablas',
  concepto: 'Conceptos',
  fenomeno: 'Fenómenos',
  conclusion: 'Conclusiones',
  derechos: 'Derechos',
  perspectiva: 'Perspectivas',
  hechoopinion: 'Hecho/opinión',
  mecanismo: 'Mecanismos',
  consecuencia: 'Consecuencias',
  vocabulario: 'Vocabulario',
  gramatica: 'Gramática',
  textocorto: 'Texto corto',
  funcion: 'Función',
  conector: 'Conectores',
}

/** Nivel por tipo según un diagnóstico: sin errores = 1, un error = 0,5, todos mal = 0. */
export function nivelesDeDiagnostico(intento, competencia) {
  const d = calcularDiagnostico(intento.respuestas, generarDiagnostico(intento.semilla, competencia))
  return Object.fromEntries(
    tiposDe(competencia).map((t) => {
      const errores = d.porTipo.find((x) => x.tipo === t)?.errores ?? 0
      // Los errores se cuentan por el tipo de la opción elegida, así que un tipo puede pasar de 2: se limita a 0.
      return [t, Math.max(0, 1 - errores / POR_TIPO_DIAGNOSTICO)]
    }),
  )
}

/** Nivel de ahora: el del último diagnóstico, o lo que muestra la práctica si es más. Dominado = 1. */
export function nivelAhora(base, prog) {
  if (prog?.dominado) return 1
  if (!prog || prog.sesiones < 1) return base
  const practica = (prog.ultimaPractica / 3) * 0.8 + (prog.ultimaTransferencia ? 0.1 : 0)
  return Math.max(base, practica)
}
