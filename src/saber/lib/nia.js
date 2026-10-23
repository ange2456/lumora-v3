// Nia: tutora guiada, sin servidor y sin modelo de lenguaje.
// Entiende palabras clave (sin tildes ni mayúsculas) y responde SOLO con lo que la app sabe:
// tu diagnóstico, tu avance y las lecciones de Lumora. No inventa datos ni da respuestas de ejercicios.

import { LECCIONES } from '../data/practice.js'
import { COMPETENCIAS, TIPOS_ERROR } from '../data/questions.js'
import { mensajePrioridad } from './diagnosis.js'
import { META_DIARIA, calcularRacha, claveDia } from './saberStorage.js'

export const normalizar = (t) =>
  String(t ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

// Palabras clave por tema. Una frase con varias palabras pesa más que una sola.
const TEMAS = {
  saludo: ['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'ayuda', 'que puedes', 'que haces', 'quien eres', 'como funcionas'],
  gracias: ['gracias', 'muchas gracias', 'listo', 'perfecto', 'vale'],
  progreso: ['como voy', 'mi progreso', 'avance', 'racha', 'meta', 'hoy', 'cuanto llevo', 'cuantos ejercicios', 'dominados'],
  prioridad: ['que practico', 'que practicar', 'por donde empiezo', 'por donde', 'que hago', 'siguiente', 'recomiendas', 'recomienda', 'prioridad', 'que error repito', 'mi error', 'mis errores', 'empiezo'],
  diagnostico: ['diagnostico', 'para que sirve', 'que es esto', 'selector', 'que tan segura', 'segura dudo adivine', 'confianza'],
  puntosCiegos: ['punto ciego', 'puntos ciegos', 'seguridad equivocada', 'con seguridad'],
  truco: ['truco', 'trucos', 'como reviso', 'revisar', 'chequeo', 'consejo', 'tip'],
  respuesta: ['respuesta correcta', 'cual es la correcta', 'dime la respuesta', 'dame la respuesta', 'solucion', 'que opcion', 'cual opcion', 'cual es la respuesta', 'resuelve'],
  icfes: ['icfes', 'saber 11', 'saber pro', 'puntaje', 'cuantas preguntas', 'fecha del examen', 'cuando es el examen', 'inscripcion', 'oficial', 'cuanto vale'],
  competencias: ['competencia', 'competencias', 'lectura critica', 'razonamiento cuantitativo', 'cuantitativo', 'que areas', 'que evaluan'],
  progresoPrivacidad: ['privacidad', 'mis datos', 'donde se guarda', 'guarda mi', 'otro celular', 'cambiar de celular', 'exportar', 'importar', 'respaldo', 'copia'],
  limites: ['eres una ia', 'eres ia', 'eres real', 'chatgpt', 'inteligencia artificial', 'robot', 'eres humana', 'eres humano'],
  // tipos de error
  base: ['base equivocada', 'porcentaje', 'porcentajes', 'descuento', 'aumento', 'sobre cuanto'],
  proporcion: ['proporcion', 'regla de tres', 'inversa', 'directa', 'proporcional'],
  conversion: ['conversion', 'unidades', 'litros', 'mililitros', 'horas y minutos', 'convertir'],
  lectura: ['tabla', 'leer datos', 'lectura de datos', 'cifra', 'datos de la tabla'],
  incompleta: ['incompleta', 'operacion incompleta', 'me detengo', 'ultimo paso', 'terminar la operacion'],
  literal: ['literal', 'no dice el texto', 'texto no dice', 'informacion que el texto', 'explicito'],
  detalle: ['idea principal', 'detalle', 'ejemplo del texto', 'tesis'],
  inferencia: ['inferencia', 'inferir', 'concluir', 'conclusion', 'exagerada', 'siempre nunca', 'palabras absolutas'],
  relacion: ['causa', 'consecuencia', 'conector', 'relacion entre ideas', 'por que ocurre'],
  intencion: ['intencion', 'proposito', 'a quien va dirigido', 'funcion de la oracion', 'para que se escribio'],
}

const ES_TIPO = new Set(Object.keys(TIPOS_ERROR))

function puntuar(texto, palabras) {
  const t = ` ${texto} `
  let total = 0
  for (const p of palabras) {
    if (t.includes(` ${p} `) || (p.length > 4 && t.includes(p))) total += p.split(' ').length
  }
  return total
}

/** Devuelve el tema con más coincidencias, o null si no se entendió nada. */
export function detectarTema(entrada, tipoActual = null) {
  const t = normalizar(entrada)
  if (!t) return null
  let mejor = null
  let mejorPuntaje = 0
  for (const [tema, palabras] of Object.entries(TEMAS)) {
    const base = puntuar(t, palabras)
    const p = base > 0 && ES_TIPO.has(tema) ? base + 0.5 : base // un tema concreto gana a uno genérico
    if (p > mejorPuntaje) {
      mejor = tema
      mejorPuntaje = p
    }
  }
  if (mejorPuntaje === 0) {
    // Preguntas sueltas durante una práctica: «no entiendo», «explícame» se refieren a la lección actual.
    if (tipoActual && /entiend|explic|ayud|no se|dudo|confund|perdid/.test(t)) return tipoActual
    return null
  }
  return mejor
}

const SUGERENCIAS_BASE = ['¿Cómo voy?', '¿Qué practico primero?', '¿Qué es un punto ciego?']

function resumenTipo(tipo, c) {
  const info = TIPOS_ERROR[tipo]
  const leccion = LECCIONES[tipo]
  const errores = c.diag?.porTipo.find((x) => x.tipo === tipo)?.errores
  const prog = c.progreso?.[tipo]
  const partes = [`«${info.nombre}»: ${info.descripcion}`, '', leccion.idea, '', `Truco para revisar: ${leccion.chequeo}`]
  if (errores) partes.push('', `En tu diagnóstico fallaste ${errores} ${errores === 1 ? 'vez' : 'veces'} por esto.`)
  if (prog?.dominado) partes.push('', 'Este ya lo tienes dominado. Un repaso corto de vez en cuando lo mantiene.')
  return {
    texto: partes.join('\n'),
    accion: { tipo: 'practicar', valor: tipo, etiqueta: `Practicar «${info.nombre}»` },
    sugerencias: ['¿Qué practico primero?', '¿Cómo voy?'],
  }
}

/**
 * Respuesta de Nia.
 * contexto: { perfil, competencia, diag, progreso, actividad, tipoActual, hoy? }
 */
export function responder(entrada, contexto = {}) {
  const { competencia = 'cuantitativo', diag = null, progreso = {}, actividad = {}, tipoActual = null, perfil = null } = contexto
  const c = { diag, progreso }
  const comp = COMPETENCIAS[competencia]
  const tema = detectarTema(entrada, tipoActual)
  const nombre = perfil?.apodo ? `, ${perfil.apodo}` : ''

  if (tema === null) {
    return {
      tema: 'nada',
      texto:
        'Eso se me escapa, y prefiero decírtelo antes que inventar. Yo te ayudo con tu ruta de Lumora: cómo vas, qué practicar, y qué significa cada tipo de error. Prueba con una de estas:',
      sugerencias: SUGERENCIAS_BASE,
    }
  }

  if (ES_TIPO.has(tema)) return { tema, ...resumenTipo(tema, c) }

  switch (tema) {
    case 'saludo':
      return {
        tema,
        texto: `Hola${nombre}. Soy Nia, la guía de tu ruta. Te puedo contar cómo vas, qué te conviene practicar y explicarte cualquier tipo de error. Tú marcas el ritmo.`,
        sugerencias: SUGERENCIAS_BASE,
      }
    case 'gracias':
      return { tema, texto: 'Con gusto. Cuando quieras seguir, aquí estoy.', sugerencias: ['¿Qué practico primero?'] }
    case 'progreso': {
      const hoy = actividad[claveDia()] ?? 0
      const racha = calcularRacha(actividad)
      const dominados = comp.tipos.filter((t) => progreso[t]?.dominado).length
      const lineas = [
        hoy >= META_DIARIA
          ? `Hoy ya hiciste ${hoy} ejercicios: la meta de ${META_DIARIA} está cumplida.`
          : hoy > 0
            ? `Hoy llevas ${hoy} de ${META_DIARIA} ejercicios. Cada uno cuenta.`
            : `Hoy todavía no empiezas, y no pasa nada: la meta son ${META_DIARIA} ejercicios, unos 10 minutos.`,
        racha > 0 ? `Tu racha es de ${racha} ${racha === 1 ? 'día' : 'días'}.` : 'Aún no tienes racha; empieza con el primer día.',
        `En ${comp.nombre.toLowerCase()} tienes ${dominados} de ${comp.tipos.length} tipos dominados.`,
      ]
      if (diag) lineas.push(`Tu último diagnóstico fue ${diag.aciertos}/${diag.total}.`)
      return { tema, texto: lineas.join('\n'), sugerencias: ['¿Qué practico primero?', '¿Qué es un punto ciego?'] }
    }
    case 'prioridad': {
      if (!diag) {
        return {
          tema,
          texto: `Para decirte por dónde empezar necesito conocer tus errores. El diagnóstico de ${comp.nombre.toLowerCase()} son ${comp.tipos.length * 2} preguntas, unos 5 minutos. Después te armo el orden.`,
          sugerencias: ['¿Qué es el diagnóstico?', '¿Cómo voy?'],
        }
      }
      if (!diag.prioridad) return { tema, texto: mensajePrioridad(diag), sugerencias: ['¿Cómo voy?'] }
      return {
        tema,
        texto: `${mensajePrioridad(diag)} Es una sola cosa a la vez: con una sesión corta ya avanzas.`,
        accion: { tipo: 'practicar', valor: diag.prioridad, etiqueta: `Practicar «${TIPOS_ERROR[diag.prioridad].nombre}»` },
        sugerencias: ['¿Cómo voy?', '¿Qué es un punto ciego?'],
      }
    }
    case 'diagnostico':
      return {
        tema,
        texto:
          'El diagnóstico te hace preguntas y, antes de ver el resultado, te pide marcar qué tan segura estás: segura, dudo o adiviné. Con eso separo dos cosas distintas: lo que no sabes y lo que crees saber pero está mal. La segunda es la más útil para mejorar.',
        sugerencias: ['¿Qué es un punto ciego?', '¿Qué practico primero?'],
      }
    case 'puntosCiegos':
      return {
        tema,
        texto:
          'Un punto ciego es una respuesta equivocada que marcaste con seguridad. Es lo más valioso del mapa: si dudabas, ya sabías que ahí había algo; si estabas segura, nadie te avisó. Por eso la práctica empieza por ahí.',
        sugerencias: ['¿Qué practico primero?', '¿Cómo voy?'],
      }
    case 'truco': {
      if (tipoActual) {
        return { tema, texto: `Para «${TIPOS_ERROR[tipoActual].nombre}»: ${LECCIONES[tipoActual].chequeo}`, sugerencias: ['No entiendo este tema'] }
      }
      return {
        tema,
        texto: 'Cada tipo de error tiene su truco de revisión. Dime cuál te interesa, por ejemplo «porcentaje» o «inferencia», y te lo cuento.',
        sugerencias: ['Porcentaje', 'Inferencia', 'Regla de tres'],
      }
    }
    case 'respuesta':
      return {
        tema,
        texto:
          'No te voy a dar la respuesta, porque aprender es llegar tú. Lo que sí puedo hacer: recordarte el truco de revisión, o explicarte la idea del tema. Y al comprobar, siempre ves por qué cada opción es correcta o no.',
        sugerencias: tipoActual ? ['No entiendo este tema', 'Dame el truco'] : SUGERENCIAS_BASE,
      }
    case 'icfes':
      return {
        tema,
        texto:
          'De la prueba oficial (fechas, puntajes, número de preguntas) no tengo datos confiables aquí, y no quiero darte cifras que puedan estar mal. Mira la información vigente en icfes.gov.co. Los ejercicios de Lumora son originales: sirven para practicar el tipo de razonamiento, no son preguntas reales del examen.',
        sugerencias: ['¿Qué competencias hay?', '¿Cómo voy?'],
      }
    case 'competencias':
      return {
        tema,
        texto: `Por ahora hay dos: razonamiento cuantitativo (porcentajes, proporciones, unidades, tablas) y lectura crítica (qué dice el texto, ideas principales, inferencias, relaciones e intención). Cada una tiene su diagnóstico y sus cinco tipos de error. Ahora estás en ${comp.nombre.toLowerCase()}.`,
        sugerencias: ['¿Qué practico primero?', '¿Cómo voy?'],
      }
    case 'progresoPrivacidad':
      return {
        tema,
        texto:
          'Tu progreso se guarda solo en este dispositivo; no se envía a ningún servidor. Si cambias de celular o limpias el navegador, usa «Guardar mi progreso» al final de tu ruta y luego «Cargar un progreso» en el nuevo.',
        sugerencias: ['¿Cómo voy?'],
      }
    case 'limites':
      return {
        tema,
        texto:
          'Soy una guía programada dentro de Lumora, no una inteligencia artificial libre ni una persona. Respondo con lo que sé de tu ruta y de las lecciones. Si me preguntas algo fuera de eso, te lo digo.',
        sugerencias: SUGERENCIAS_BASE,
      }
    default:
      return { tema: 'nada', texto: 'No estoy segura de haberte entendido. Prueba con una de estas:', sugerencias: SUGERENCIAS_BASE }
  }
}
