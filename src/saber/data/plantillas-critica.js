// Plantillas de lectura crítica. Cada pregunta se arma a partir de una ficha (fichas-critica.js):
// el texto, la respuesta correcta y los distractores salen de la misma ficha, y cada distractor
// está ligado a un tipo de error. Contenido original: no proviene de pruebas del ICFES.

import { barajar, elige } from '../lib/generador.js'
import { FICHAS, LUGARES, NUEVAS } from './fichas-critica.js'

const ok = (texto) => ({ texto })
const mal = (texto, error, porque) => ({ texto, error, porque })
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
const decap = (s) => s.charAt(0).toLowerCase() + s.slice(1)
const sinPunto = (s) => s.replace(/\.$/, '')

const PQ = {
  ajena: 'Puede sonar razonable, pero el texto no lo dice en ninguna parte.',
  exagerada: 'Va más lejos que el texto: generaliza o promete más de lo que se afirma.',
  invertida: 'No coincide con la relación del texto: cambia qué causa qué.',
  detalle: 'Es un ejemplo o un dato que apoya la idea, pero no es la idea principal.',
  valida: 'Esa conclusión sí se apoya en el texto.',
  dicha: 'Eso sí lo dice el texto.',
}

/** Oración del ejemplo, con la cifra y el lugar sorteados. */
const ejemplo = (c, n, lugar) => `${c.obs.intro(lugar)}, ${n} de cada 10 ${c.obs.sujeto} ${c.obs.verboP} ${c.obs.complemento}.`

/** Texto completo. «inicio»: tesis primero. «final»: la tesis llega al cierre. */
function texto(c, { n, lugar, orden = 'inicio', contexto = '' }) {
  const partes =
    orden === 'final'
      ? [ejemplo(c, n, lugar), c.apoyo, `En resumen, ${decap(c.tesis)}`]
      : [c.tesis, c.apoyo, ejemplo(c, n, lugar), cap(c.efecto), c.limite]
  return (contexto ? `${contexto} ` : '') + partes.join(' ')
}

/** Ficha, cifra y lugar al azar, más las demás fichas barajadas (para distractores de otros temas). */
function contexto(r, fichas, nuevas) {
  const c = elige(r, fichas)
  return {
    c,
    n: elige(r, [6, 7, 8]),
    lugar: elige(r, LUGARES),
    otras: barajar(r, fichas.filter((x) => x !== c)),
    ctx: nuevas ? c.contexto : '',
  }
}

const afirmaciones = (c) => ({
  mayoria: `La mayoría ${c.obs.art === 'las' ? 'de las' : 'de los'} ${c.obs.sujeto} ${c.obs.verboS} ${c.obs.complemento}.`,
  todos: `${c.obs.art === 'las' ? 'Todas las' : 'Todos los'} ${c.obs.sujeto} ${c.obs.verboP} ${c.obs.complemento}.`,
  minoria: `Menos de la mitad ${c.obs.art === 'las' ? 'de las' : 'de los'} ${c.obs.sujeto} ${c.obs.verboS} ${c.obs.complemento}.`,
})

// ---------------------------------------------------------------------------------------------
// Constructores de pregunta. Cada uno recibe (r, fichas, nuevas) y devuelve la pregunta lista.
// ---------------------------------------------------------------------------------------------

const idea = (orden) => (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, orden, contexto: ctx }),
    enunciado: '¿Cuál es la idea principal del texto?',
    pista: 'La idea principal es la que sostiene todo lo demás. Un ejemplo o un dato no la reemplaza.',
    correcta: ok(c.tesis),
    incorrectas: [
      mal(ejemplo(c, n, lugar), 'detalle', PQ.detalle),
      mal(c.exagerada, 'inferencia', PQ.exagerada),
      mal(c.ajena, 'literal', PQ.ajena),
    ],
    explicacion: `La idea que sostiene todo el texto es «${c.tesis}». Lo demás la explica o la ilustra.`,
  }
}

const titulo = (r, fichas, nuevas) => {
  const { c, n, lugar, otras, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Qué título resume mejor el texto?',
    pista: 'Un buen título cubre la idea de todo el texto, no solo un dato.',
    correcta: ok(c.titulo),
    incorrectas: [
      mal(c.tituloDetalle, 'detalle', 'Solo nombra el ejemplo; el texto trata de algo más amplio.'),
      mal(otras[0].titulo, 'literal', 'Ese título corresponde a otro tema distinto del texto.'),
      mal(otras[1].titulo, 'literal', 'Ese título corresponde a otro tema distinto del texto.'),
    ],
    explicacion: `El título «${c.titulo}» abarca la idea principal: «${c.tesis}»`,
  }
}

const resumen = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Cuál de estas frases resume mejor el texto?',
    pista: 'Un buen resumen recoge la idea central y su razón, sin quedarse en un solo dato.',
    correcta: ok(c.resumen),
    incorrectas: [
      mal(ejemplo(c, n, lugar), 'detalle', PQ.detalle),
      mal(c.exagerada, 'inferencia', PQ.exagerada),
      mal(c.invertida, 'relacion', PQ.invertida),
    ],
    explicacion: `El resumen correcto es «${c.resumen}». Recoge la idea principal sin cambiar lo que el texto dice.`,
  }
}

const funcionEjemplo = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  const frase = ejemplo(c, n, lugar)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: `¿Qué función cumple esta oración del texto: «${frase}»?`,
    pista: 'Pregúntate si esa oración presenta la idea central o si la respalda con un caso.',
    correcta: ok('Ilustrar con un caso concreto la idea principal'),
    incorrectas: [
      mal('Presentar la idea principal del texto', 'detalle', 'El ejemplo apoya la idea principal, pero no es la idea principal.'),
      mal('Cambiar de tema para hablar de otro asunto', 'literal', 'El ejemplo habla del mismo tema: lo ilustra con un caso.'),
      mal('Contradecir lo que se dijo antes', 'relacion', 'El ejemplo no contradice nada: respalda lo dicho antes.'),
    ],
    explicacion: `La oración «${frase}» es un caso concreto: su función es ilustrar con un caso concreto la idea principal.`,
  }
}

const afirma = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  const dicha = elige(r, [c.apoyo, cap(c.efecto), c.limite])
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Cuál de estas afirmaciones aparece en el texto?',
    pista: 'Busca la opción que puedas señalar en el texto. Si tienes que suponerla, descártala.',
    correcta: ok(dicha),
    incorrectas: [
      mal(c.ajena, 'literal', PQ.ajena),
      mal(c.exagerada, 'inferencia', PQ.exagerada),
      mal(c.invertida, 'relacion', PQ.invertida),
    ],
    explicacion: `El texto dice: «${dicha}»`,
  }
}

const noAfirma = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  const dichas = barajar(r, [c.tesis, c.apoyo, cap(c.efecto), c.limite]).slice(0, 3)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Cuál de estas afirmaciones NO aparece en el texto?',
    pista: 'Aquí se busca la opción que el texto no dice. Las otras tres sí están.',
    correcta: ok(c.ajena),
    incorrectas: dichas.map((d) => mal(d, 'literal', 'Esa sí aparece en el texto; la pregunta pedía la que no aparece.')),
    explicacion: `«${c.ajena}» no aparece en el texto. Las otras tres opciones sí se dicen en él.`,
  }
}

const dato = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  const cuantos = c.obs.art === 'las' ? 'cuántas' : 'cuántos'
  const real = `${n} de cada 10`
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: `Según el texto, ¿${cuantos} de cada 10 ${c.obs.sujeto} ${c.obs.verboP} ${c.obs.complemento}?`,
    pista: 'Vuelve al texto y busca la cifra exacta.',
    correcta: ok(real),
    incorrectas: [
      mal(`${10 - n} de cada 10`, 'literal', `Tomaste el complemento de la cifra. El texto dice ${real}.`),
      mal(`${n + 1} de cada 10`, 'literal', `La cifra no coincide con el texto, que dice ${real}.`),
      mal(`${n} de cada 100`, 'literal', `Cambiaste el total: el texto habla de ${real}, no de cada 100.`),
    ],
    explicacion: `El texto dice ${real} ${c.obs.sujeto}. Esa es la cifra: ${real}.`,
  }
}

const ejemploMencionado = (r, fichas, nuevas) => {
  const { c, n, lugar, otras, ctx } = contexto(r, fichas, nuevas)
  const propio = ejemplo(c, n, lugar)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Cuál de estas situaciones se menciona como ejemplo en el texto?',
    pista: 'Busca el caso concreto con una cifra y comprueba que el tema sea el mismo del texto.',
    correcta: ok(propio),
    incorrectas: otras.slice(0, 3).map((o) => mal(ejemplo(o, n, lugar), 'literal', 'Ese ejemplo pertenece a otro texto y a otro tema.')),
    explicacion: `El ejemplo del texto es «${propio}»`,
  }
}

const concluir = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Qué conclusión se puede sacar a partir del texto?',
    pista: 'Elige la conclusión que el texto permite, sin palabras absolutas como «nunca» o «garantiza».',
    correcta: ok(c.inferenciaOk),
    incorrectas: [
      mal(c.exagerada, 'inferencia', PQ.exagerada),
      mal(c.inferenciaMal, 'inferencia', 'Usa una palabra absoluta que el texto no autoriza.'),
      mal(c.ajena, 'literal', PQ.ajena),
    ],
    explicacion: `Se puede concluir que «${c.inferenciaOk}» porque se apoya en lo que dice el texto, sin ir más lejos.`,
  }
}

const noConcluir = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  const { mayoria } = afirmaciones(c)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Cuál de estas conclusiones NO se puede sacar del texto?',
    pista: 'Tres conclusiones se apoyan en el texto; una va más lejos. Busca la que exagera.',
    correcta: ok(c.inferenciaMal),
    incorrectas: [
      mal(c.inferenciaOk, 'inferencia', PQ.valida),
      mal(c.resumen, 'inferencia', PQ.valida),
      mal(mayoria, 'inferencia', PQ.valida),
    ],
    explicacion: `«${c.inferenciaMal}» no se puede concluir: el texto no llega tan lejos. Las otras tres sí se apoyan en él.`,
  }
}

const siNo = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: `Según el texto, ¿qué pasaría si ${c.condNo}?`,
    pista: 'Piensa qué dice el texto que ocurre gracias a esa condición y qué pasaría sin ella.',
    correcta: ok(c.siNo),
    incorrectas: [
      mal(c.exagerada, 'inferencia', PQ.exagerada),
      mal(c.invertida, 'relacion', PQ.invertida),
      mal(c.ajena, 'literal', PQ.ajena),
    ],
    explicacion: `Si ${c.condNo}, el texto permite concluir: «${c.siNo}»`,
  }
}

const generaliza = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Cuál de estas frases dice más de lo que el texto permite afirmar?',
    pista: 'Fíjate en las palabras absolutas: «todos», «siempre», «nunca», «garantiza».',
    correcta: ok(c.exagerada),
    incorrectas: [
      mal(c.resumen, 'inferencia', 'Esa idea sí está sostenida por el texto.'),
      mal(c.inferenciaOk, 'inferencia', 'Esa conclusión sí se apoya en el texto, sin ir más lejos.'),
      mal(afirmaciones(c).mayoria, 'inferencia', 'Esa afirmación sí coincide con el dato del texto.'),
    ],
    explicacion: `«${c.exagerada}» generaliza: el texto no promete algo tan absoluto.`,
  }
}

const datoInferencia = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  const { mayoria, todos, minoria } = afirmaciones(c)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: 'Con base en el dato del ejemplo, ¿cuál afirmación es correcta?',
    pista: 'Compara la cifra del texto con la mitad, que sería 5 de cada 10.',
    correcta: ok(mayoria),
    incorrectas: [
      mal(todos, 'inferencia', `Con ${n} de cada 10 no se puede decir «todos»: faltan algunos.`),
      mal(minoria, 'literal', `${n} de cada 10 es más de la mitad, no menos.`),
      mal(c.inferenciaMal, 'inferencia', 'Usa una palabra absoluta que el dato no autoriza.'),
    ],
    explicacion: `${n} de cada 10 es más de la mitad. Por eso se puede decir: «${mayoria}»`,
  }
}

const razon = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Qué razón da el texto para sostener su idea principal?',
    pista: 'Busca la oración que explica por qué la idea principal es cierta.',
    correcta: ok(c.apoyo),
    incorrectas: [
      mal(c.limite, 'relacion', 'Es una aclaración sobre hasta dónde vale la idea, no la razón que la sostiene.'),
      mal(c.invertida, 'relacion', PQ.invertida),
      mal(c.ajena, 'literal', PQ.ajena),
    ],
    explicacion: `La razón que da el texto es: «${c.apoyo}»`,
  }
}

const consecuencia = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Cuál de estas frases describe lo que pasa cuando NO se hace lo que propone el texto?',
    pista: 'Busca la oración que cuenta el resultado de no seguir la idea principal.',
    correcta: ok(cap(c.efecto)),
    incorrectas: [
      mal(c.limite, 'relacion', 'Es una aclaración sobre hasta dónde vale la idea, no un resultado de no seguirla.'),
      mal(c.invertida, 'relacion', PQ.invertida),
      mal(c.ajena, 'literal', PQ.ajena),
    ],
    explicacion: `La consecuencia que señala el texto es: «${cap(c.efecto)}»`,
  }
}

const conector = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: `¿Qué expresión completa mejor el espacio? «${sinPunto(c.apoyo)}; ____ ${decap(sinPunto(c.tesis))}.»`,
    pista: 'La primera parte es la causa y la segunda lo que se concluye de ella.',
    correcta: ok('por eso'),
    incorrectas: [
      mal('aunque', 'relacion', '«Aunque» expresa oposición; aquí la primera idea explica la segunda.'),
      mal('sin embargo', 'relacion', '«Sin embargo» marca contraste, y aquí hay causa y resultado.'),
      mal('en cambio', 'relacion', '«En cambio» compara dos cosas opuestas; no es el caso.'),
    ],
    explicacion: 'La primera parte es la causa y la segunda su resultado, así que la expresión que las une es «por eso».',
  }
}

const invierte = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Cuál de estas frases invierte la relación entre causa y consecuencia que plantea el texto?',
    pista: 'Tres frases respetan lo que el texto dice; una cambia qué produce qué.',
    correcta: ok(c.invertida),
    incorrectas: [
      mal(c.apoyo, 'relacion', 'Esa frase respeta la relación del texto.'),
      mal(cap(c.efecto), 'relacion', 'Esa frase respeta la relación del texto.'),
      mal(c.tesis, 'relacion', 'Esa frase respeta la relación del texto.'),
    ],
    explicacion: `«${c.invertida}» cambia el orden: pone como causa lo que en el texto es el resultado, o al revés.`,
  }
}

const relacionOraciones = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Qué relación hay entre la primera y la segunda oración del texto?',
    pista: 'Lee las dos oraciones y pregúntate qué hace la segunda con respecto a la primera.',
    correcta: ok('La segunda oración explica la razón de la primera.'),
    incorrectas: [
      mal('La segunda oración contradice a la primera.', 'relacion', 'No hay contradicción: la segunda respalda a la primera.'),
      mal('La segunda oración cambia de tema.', 'relacion', 'Sigue hablando del mismo tema.'),
      mal('La segunda oración repite la primera con un ejemplo.', 'relacion', 'La segunda da una razón; el ejemplo viene después.'),
    ],
    explicacion: `La primera oración plantea la idea («${c.tesis}»). En ese caso, la segunda oración explica la razón de la primera.`,
  }
}

const proposito = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Con qué propósito se escribió el texto?',
    pista: 'Pregúntate qué quiere el autor que el lector sepa o haga después de leer.',
    correcta: ok(c.propositoTxt),
    incorrectas: [
      mal('Contar una anécdota personal del autor', 'intencion', 'El texto no cuenta una experiencia personal.'),
      mal('Vender un producto o un servicio', 'intencion', 'El texto no ofrece ni promociona nada para comprar.'),
      mal('Criticar a una persona o a una institución', 'intencion', 'El texto no señala ni culpa a nadie.'),
    ],
    explicacion: `El propósito del texto es: «${c.propositoTxt}».`,
  }
}

const publico = (r, fichas, nuevas) => {
  const { c, n, lugar, otras, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿A quién va dirigido principalmente el texto?',
    pista: 'Fíjate a quién le sirve lo que el texto explica o pide.',
    correcta: ok(c.publico),
    incorrectas: otras.slice(0, 3).map((o) => mal(o.publico, 'intencion', 'Ese público corresponde a otro tema, no al de este texto.')),
    explicacion: `El texto habla de un tema que le sirve a este público: «${c.publico}».`,
  }
}

const funcionLimite = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: `¿Qué función cumple la última oración del texto: «${c.limite}»?`,
    pista: 'Esa oración empieza negando algo: ¿qué hace con la idea anterior?',
    correcta: ok('Aclarar hasta dónde vale la idea anterior'),
    incorrectas: [
      mal('Dar un ejemplo concreto que apoya la idea', 'intencion', 'No da un caso concreto: pone un límite.'),
      mal('Presentar un tema nuevo que no tiene relación', 'intencion', 'Sigue hablando del mismo tema.'),
      mal('Repetir la idea principal con otras palabras', 'intencion', 'No la repite: la limita.'),
    ],
    explicacion: `La oración «${c.limite}» cumple esta función: aclarar hasta dónde vale la idea anterior.`,
  }
}

const recomienda = (r, fichas, nuevas) => {
  const { c, n, lugar, otras, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Qué le recomendaría el autor a una persona que acaba de leer el texto?',
    pista: 'Piensa qué haría el autor si pudiera darle un consejo al lector.',
    correcta: ok(c.recomendacion),
    incorrectas: [
      mal(c.recomendacionMal, 'intencion', 'Es lo contrario de lo que el texto sostiene.'),
      mal(otras[0].recomendacion, 'intencion', 'Ese consejo corresponde a otro texto y a otro tema.'),
      mal(otras[1].recomendacion, 'intencion', 'Ese consejo corresponde a otro texto y a otro tema.'),
    ],
    explicacion: `Lo que el texto sostiene lleva a recomendar: «${c.recomendacion}»`,
  }
}

const actitud = (r, fichas, nuevas) => {
  const { c, n, lugar, ctx } = contexto(r, fichas, nuevas)
  return {
    texto: texto(c, { n, lugar, contexto: ctx }),
    enunciado: '¿Qué actitud muestra el autor frente al tema?',
    pista: 'Fíjate en cómo habla: ¿explica con calma, se preocupa, anima?',
    correcta: ok(cap(c.actitud)),
    incorrectas: [
      mal('Burlona y sarcástica', 'intencion', 'No hay burla ni sarcasmo en el texto.'),
      mal('Desinteresada, como si no importara', 'intencion', 'El autor sí muestra interés: explica y orienta.'),
      mal('Enojada y agresiva', 'intencion', 'El tono del texto es respetuoso.'),
    ],
    explicacion: `El tono del texto es ${c.actitud}.`,
  }
}

// ---------------------------------------------------------------------------------------------
// Registro: 5 plantillas de práctica y 2 de problema nuevo por tipo de error.
// ---------------------------------------------------------------------------------------------

const normal = (id, tipo, build) => ({
  id, tipo, competencia: 'critica', transferencia: false,
  generar: (r) => build(r, FICHAS, false),
})
const nueva = (id, tipo, build) => ({
  id, tipo, competencia: 'critica', transferencia: true,
  generar: (r) => build(r, NUEVAS, true),
})

export const PLANTILLAS_CRITICA = [
  // Detalle en vez de idea principal
  normal('det-idea-inicio', 'detalle', idea('inicio')),
  normal('det-idea-final', 'detalle', idea('final')),
  normal('det-titulo', 'detalle', titulo),
  normal('det-resumen', 'detalle', resumen),
  normal('det-func-ejemplo', 'detalle', funcionEjemplo),
  nueva('det-t-idea', 'detalle', idea('inicio')),
  nueva('det-t-titulo', 'detalle', titulo),
  // Información que el texto no dice
  normal('lit-afirma', 'literal', afirma),
  normal('lit-noafirma', 'literal', noAfirma),
  normal('lit-dato', 'literal', dato),
  normal('lit-ejemplo', 'literal', ejemploMencionado),
  normal('lit-coincide', 'literal', (r, f, nv) => {
    // «Cuál de estas ideas sí dice el texto» con el resumen como única opción fiel
    const { c, n, lugar, ctx } = contexto(r, f, nv)
    return {
      texto: texto(c, { n, lugar, contexto: ctx }),
      enunciado: '¿Cuál de estas frases coincide con lo que dice el texto?',
      pista: 'Descarta lo que el texto no afirma, aunque suene razonable.',
      correcta: ok(c.resumen),
      incorrectas: [
        mal(c.ajena, 'literal', PQ.ajena),
        mal(c.exagerada, 'inferencia', PQ.exagerada),
        mal(c.invertida, 'relacion', PQ.invertida),
      ],
      explicacion: `La frase «${c.resumen}» coincide con lo que dice el texto.`,
    }
  }),
  nueva('lit-t-afirma', 'literal', afirma),
  nueva('lit-t-dato', 'literal', dato),
  // Inferencia exagerada
  normal('inf-concluir', 'inferencia', concluir),
  normal('inf-noconcluir', 'inferencia', noConcluir),
  normal('inf-sino', 'inferencia', siNo),
  normal('inf-generaliza', 'inferencia', generaliza),
  normal('inf-dato', 'inferencia', datoInferencia),
  nueva('inf-t-concluir', 'inferencia', concluir),
  nueva('inf-t-noconcluir', 'inferencia', noConcluir),
  // Relación entre ideas invertida
  normal('rel-razon', 'relacion', razon),
  normal('rel-consecuencia', 'relacion', consecuencia),
  normal('rel-conector', 'relacion', conector),
  normal('rel-invierte', 'relacion', invierte),
  normal('rel-oraciones', 'relacion', relacionOraciones),
  nueva('rel-t-razon', 'relacion', razon),
  nueva('rel-t-consecuencia', 'relacion', consecuencia),
  // Intención del texto mal leída
  normal('int-proposito', 'intencion', proposito),
  normal('int-publico', 'intencion', publico),
  normal('int-func-limite', 'intencion', funcionLimite),
  normal('int-recomienda', 'intencion', recomienda),
  normal('int-actitud', 'intencion', actitud),
  nueva('int-t-proposito', 'intencion', proposito),
  nueva('int-t-publico', 'intencion', publico),
]
