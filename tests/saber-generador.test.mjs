// Verifica el generador de preguntas aleatorias, el diagnóstico y la racha.
// Uso: node tests/saber-generador.test.mjs
import { TODAS_LAS_PLANTILLAS as PLANTILLAS, TOTAL_DIAGNOSTICO, generarDiagnostico, generarSesion } from '../src/saber/data/banco.js'
import { FICHAS, NUEVAS } from '../src/saber/data/fichas-critica.js'
import { LECCIONES } from '../src/saber/data/practice.js'
import { COMPETENCIAS, COMPETENCIAS_POR_PRUEBA, TIPOS_ERROR, tiposDe } from '../src/saber/data/questions.js'
import { armar, crearRng } from '../src/saber/lib/generador.js'
import { calcularDiagnostico } from '../src/saber/lib/diagnosis.js'
import { calcularRacha, claveDia } from '../src/saber/lib/saberStorage.js'
import { fusionar, mismoContenido, paraNube } from '../src/saber/lib/fusion.js'
import { ErrorNube, sincronizar, validarEstado } from '../src/saber/nube/sincronizar.js'
import { mensajeDeError } from '../src/saber/nube/cuenta.js'
import { MEDALLAS, calcularPuntos, medallas, nivelDe, recompensa } from '../src/saber/lib/logros.js'
import { nivelAhora, nivelesDeDiagnostico } from '../src/saber/lib/mapa.js'
import { detectarTema, responder } from '../src/saber/lib/nia.js'
import { exportarProgreso, leerProgreso, nombreArchivo } from '../src/saber/lib/respaldo.js'

const SEMILLAS = 400
const TIPOS = Object.keys(TIPOS_ERROR)
let fallos = 0
const ok = (c, m) => {
  if (!c) {
    fallos++
    if (fallos <= 25) console.error('FALLA:', m)
  }
}
// "$1.250,5" -> 1250.5
const num = (t) => Number(t.replace(/[$%]/g, '').replace(/\./g, '').replace(',', '.'))
const nums = (t) => (t.match(/\d[\d.]*(?:,\d+)?/g) ?? []).map(num)
const digitosTexto = (t) => t.match(/\d[\d.]*(?:,\d+)?/g) ?? []

// 1. Estructura de cada plantilla en muchas semillas
const porTipo = Object.fromEntries(TIPOS.map((t) => [t, { normal: 0, nueva: 0 }]))
for (const p of PLANTILLAS) {
  porTipo[p.tipo][p.transferencia ? 'nueva' : 'normal']++
  for (let s = 1; s <= SEMILLAS; s++) {
    let q
    try {
      q = armar(p, crearRng(s))
    } catch (e) {
      ok(false, `${p.id} semilla ${s}: ${e.message}`)
      break
    }
    ok(q.opciones.length === 4, `${p.id}/${s}: debe tener 4 opciones`)
    ok(q.opciones.filter((o) => !o.error).length === 1, `${p.id}/${s}: debe haber 1 correcta`)
    ok(new Set(q.opciones.map((o) => o.texto)).size === 4, `${p.id}/${s}: opciones repetidas`)
    ok(q.opciones.map((o) => o.id).join('') === 'abcd', `${p.id}/${s}: ids a-d`)
    for (const o of q.opciones.filter((o) => o.error)) {
      ok(o.error in TIPOS_ERROR && !!o.porque, `${p.id}/${s}: distractor mal formado`)
    }
    ok(!!q.pista && !!q.explicacion && !!q.enunciado, `${p.id}/${s}: falta pista, explicación o enunciado`)
    // La explicación debe contener el resultado correcto
    const c = q.opciones.find((o) => !o.error).texto
    const d = digitosTexto(c)
    if (d.length > 0) ok(d.some((x) => q.explicacion.includes(x)), `${p.id}/${s}: explicación no contiene "${c}": ${q.explicacion}`)
    else ok(q.explicacion.toLowerCase().includes(c.toLowerCase().replace(/^el /, '')), `${p.id}/${s}: explicación no menciona "${c}"`)
    // Los tipos de error de los distractores deben incluir al menos uno del tipo de la plantilla
    // (para que la práctica de ese tipo tenga sentido)
    ok(q.opciones.some((o) => o.error === p.tipo), `${p.id}/${s}: ningún distractor del tipo ${p.tipo}`)
  }
}
for (const t of TIPOS) {
  // Las dos competencias con números/fichas sorteados tienen más plantillas; las demás son fichas revisadas a mano.
  const [minNormal, minNueva] = ['cuantitativo', 'critica'].includes(TIPOS_ERROR[t].competencia) ? [5, 2] : [4, 1]
  ok(porTipo[t].normal >= minNormal && porTipo[t].nueva >= minNueva, `${t}: necesita ≥${minNormal} normales y ≥${minNueva} de problema nuevo (hay ${porTipo[t].normal}/${porTipo[t].nueva})`)
}
ok(PLANTILLAS.length === new Set(PLANTILLAS.map((p) => p.id)).size, 'ids de plantilla repetidos')

// 2. Cálculo independiente de la respuesta correcta (lee las cifras del enunciado)
const correcta = (id, s) => armar(PLANTILLAS.find((p) => p.id === id), crearRng(s))
for (let s = 1; s <= SEMILLAS; s++) {
  {
    const q = correcta('base-descuentos', s)
    const [precio] = nums(q.enunciado)
    const [d1, d2] = q.enunciado.match(/(\d+)%/g).map(num)
    const esperado = Math.round(precio * (1 - d1 / 100) * (1 - d2 / 100))
    ok(num(q.opciones.find((o) => !o.error).texto) === esperado, `base-descuentos/${s}`)
  }
  {
    const q = correcta('inc-taxi', s)
    const [b, t, km] = nums(q.enunciado)
    ok(num(q.opciones.find((o) => !o.error).texto) === b + t * km, `inc-taxi/${s}`)
  }
  {
    const q = correcta('prop-obreros', s)
    const [a, d, b] = nums(q.enunciado)
    ok(nums(q.opciones.find((o) => !o.error).texto)[0] === (a * d) / b, `prop-obreros/${s}`)
  }
  {
    const q = correcta('lec-cuotas', s)
    const [i, k, c] = nums(q.enunciado)
    ok(num(q.opciones.find((o) => !o.error).texto) === i + k * c, `lec-cuotas/${s}`)
  }
  {
    const q = correcta('conv-pelicula', s)
    const m = q.enunciado.match(/(\d+) h (\d+) min .* (\d+):(\d+) p\. m\./)
    const fin = Number(m[3]) * 60 + Number(m[4]) + Number(m[1]) * 60 + Number(m[2])
    const esp = `${Math.floor(fin / 60)}:${String(fin % 60).padStart(2, '0')} p. m.`
    ok(q.opciones.find((o) => !o.error).texto === esp, `conv-pelicula/${s}: ${q.enunciado}`)
  }
  {
    const q = correcta('inc-vuelto', s)
    const [n, precio, billete] = nums(q.enunciado.replace(/^\S+ compra /, ''))
    ok(num(q.opciones.find((o) => !o.error).texto) === billete - n * precio, `inc-vuelto/${s}`)
  }
  {
    const q = correcta('lec-votos', s)
    const filas = q.tabla.filas.map((f) => [f[0], f.slice(1).map(Number).reduce((a, b) => a + b, 0)])
    const mejor = filas.sort((a, b) => b[1] - a[1])[0]
    ok(q.opciones.find((o) => !o.error).texto === `${mejor[0]}, con ${mejor[1]} votos`, `lec-votos/${s}`)
  }
  {
    const q = correcta('lec-planes', s)
    const filas = q.tabla.filas.map((f) => [f[0], num(f[1]) / Number(f[2].replace(' GB', ''))])
    const mejor = filas.sort((a, b) => a[1] - b[1])[0]
    ok(q.opciones.find((o) => !o.error).texto === `El plan ${mejor[0]}`, `lec-planes/${s}`)
  }
}

// 3. Determinismo y variedad
for (let s = 1; s <= 50; s++) {
  ok(JSON.stringify(generarDiagnostico(s)) === JSON.stringify(generarDiagnostico(s)), `diagnóstico no determinista (${s})`)
  ok(JSON.stringify(generarSesion('base', s)) === JSON.stringify(generarSesion('base', s)), `sesión no determinista (${s})`)
}
const distintos = new Set(Array.from({ length: 50 }, (_, i) => JSON.stringify(generarDiagnostico(i + 1))))
ok(distintos.size === 50, `50 semillas deben dar 50 diagnósticos distintos (dieron ${distintos.size})`)
const enunciados = new Set()
for (let s = 1; s <= 30; s++) generarDiagnostico(s).forEach((q) => enunciados.add(q.enunciado))
ok(enunciados.size > 150, `poca variedad de enunciados: ${enunciados.size}`)

// 4. Composición del diagnóstico y de las sesiones, por competencia
for (const comp of Object.keys(COMPETENCIAS)) {
  for (let s = 1; s <= 200; s++) {
    const d = generarDiagnostico(s, comp)
    ok(d.length === TOTAL_DIAGNOSTICO && TOTAL_DIAGNOSTICO === 10, `${comp}: el diagnóstico debe tener 10 preguntas`)
    ok(new Set(d.map((q) => q.id)).size === d.length, `${comp}: ids repetidos en diagnóstico ${s}`)
    ok(d.every((q) => !q.transferencia), `${comp}: el diagnóstico no usa problemas nuevos`)
    ok(d.every((q) => TIPOS_ERROR[q.tipo].competencia === comp), `${comp}: preguntas de otra competencia`)
    for (const t of tiposDe(comp)) {
      const delTipo = d.filter((q) => q.tipo === t)
      ok(delTipo.length === 2 && new Set(delTipo.map((q) => q.plantilla)).size === 2, `${comp} diagnóstico ${s}: 2 plantillas distintas de ${t}`)
      const ses = generarSesion(t, s)
      ok(ses.length === 4 && ses.every((q) => q.tipo === t), `sesión ${t}/${s}: 4 del mismo tipo`)
      ok(ses.slice(0, 3).every((q) => !q.transferencia) && ses[3].transferencia, `sesión ${t}/${s}: 3 + 1 problema nuevo`)
      ok(new Set(ses.map((q) => q.plantilla)).size === 4, `sesión ${t}/${s}: plantillas repetidas`)
    }
  }
}
ok(JSON.stringify(generarDiagnostico(9)) === JSON.stringify(generarDiagnostico(9, 'cuantitativo')), 'la competencia por defecto es cuantitativo')
ok(JSON.stringify(generarDiagnostico(9, 'critica')) !== JSON.stringify(generarDiagnostico(9, 'cuantitativo')), 'las competencias dan preguntas distintas')
for (const t of TIPOS) ok(!!LECCIONES[t]?.titulo && !!LECCIONES[t]?.idea && !!LECCIONES[t]?.ejemplo && !!LECCIONES[t]?.chequeo, `${t}: lección incompleta`)

// 5. Lógica del diagnóstico
const preguntas = generarDiagnostico(123)
const resp = (q, fn, confianza) => ({ preguntaId: q.id, opcionId: fn(q), confianza })
const buena = (q) => q.opciones.find((o) => !o.error).id
const malaDe = (tipo) => (q) => q.opciones.find((o) => o.error === tipo)?.id
let d = calcularDiagnostico(preguntas.map((q) => resp(q, buena, 'segura')), preguntas)
ok(d.aciertos === 10 && d.prioridad === null && d.puntosCiegos === 0, 'diagnóstico perfecto')
d = calcularDiagnostico(preguntas.map((q) => resp(q, buena, 'adivine')), preguntas)
ok(d.aciertosFragiles === 10, 'aciertos adivinados son frágiles')
{
  const a = preguntas.find((q) => q.opciones.some((o) => o.error === 'base'))
  const [b1, b2] = preguntas.filter((q) => q.opciones.some((o) => o.error === 'lectura'))
  // base: 1 error seguro (peso 3); lectura: 2 errores con duda (peso 4) → gana lectura
  d = calcularDiagnostico([resp(a, malaDe('base'), 'segura'), resp(b1, malaDe('lectura'), 'dudo'), resp(b2, malaDe('lectura'), 'dudo')], preguntas)
  ok(d.prioridad === 'lectura' && d.puntosCiegos === 1, `prioridad esperada lectura, fue ${d.prioridad}`)
  // base: 1 seguro (3) vs lectura: 1 duda (2) → gana base
  d = calcularDiagnostico([resp(a, malaDe('base'), 'segura'), resp(b1, malaDe('lectura'), 'dudo')], preguntas)
  ok(d.prioridad === 'base', `prioridad esperada base, fue ${d.prioridad}`)
}

// 6. Racha
const dia = (n) => {
  const x = new Date(2026, 5, 20)
  x.setDate(x.getDate() - n)
  return claveDia(x)
}
const hoy = new Date(2026, 5, 20)
ok(calcularRacha({}, hoy) === 0, 'racha sin actividad')
ok(calcularRacha({ [dia(0)]: 2, [dia(1)]: 1, [dia(2)]: 4 }, hoy) === 3, 'racha de 3')
ok(calcularRacha({ [dia(1)]: 1, [dia(2)]: 1 }, hoy) === 2, 'racha cuenta desde ayer si hoy no hay')
ok(calcularRacha({ [dia(0)]: 1, [dia(2)]: 1 }, hoy) === 1, 'racha se corta con un día vacío')

// 7. Respaldo: exportar e importar
{
  const qs = generarDiagnostico(777)
  const intento = (confianza) => {
    const respuestas = qs.map((q) => ({ preguntaId: q.id, opcionId: q.opciones.find((o) => !o.error).id, confianza }))
    const dd = calcularDiagnostico(respuestas, qs)
    return { fecha: '2026-10-23T10:00:00.000Z', competencia: 'cuantitativo', semilla: 777, aciertos: dd.aciertos, total: dd.total, puntosCiegos: dd.puntosCiegos, prioridad: dd.prioridad, respuestas }
  }
  const estado = {
    perfil: { apodo: 'Alexandra', prueba: 'saberpro' },
    intentos: [intento('segura')],
    progreso: { lectura: { sesiones: 2, ultimaPractica: 3, ultimaTransferencia: true, dominado: true } },
    actividad: { '2026-10-22': 4, '2026-10-23': 2 },
    enCurso: { semilla: 1, respuestas: [] },
  }
  const txt = exportarProgreso(estado)
  let r = leerProgreso(txt)
  ok(r.ok, `ida y vuelta: ${r.error}`)
  ok(r.ok && JSON.stringify(r.estado.intentos) === JSON.stringify(estado.intentos), 'los intentos deben volver idénticos')
  ok(r.ok && JSON.stringify(r.estado.progreso) === JSON.stringify(estado.progreso) && r.estado.perfil.apodo === 'Alexandra', 'progreso y perfil deben volver idénticos')
  ok(r.ok && !('enCurso' in r.estado) && !txt.includes('enCurso'), 'un diagnóstico a medias no se exporta')

  const mod = (fn) => { const o = JSON.parse(txt); fn(o); return leerProgreso(JSON.stringify(o)) }
  ok(mod((o) => { o.estado.intentos[0].aciertos = 10; o.estado.intentos[0].respuestas[0].opcionId = qs[0].opciones.find((x) => x.error).id }).estado.intentos[0].aciertos === 9, 'los aciertos se recalculan, no se confía en el archivo')
  ok(mod((o) => { o.estado.intentos[0].prioridad = 'base'; o.estado.intentos[0].puntosCiegos = 99 }).estado.intentos[0].puntosCiegos === 0, 'puntos ciegos y prioridad se recalculan')
  ok(mod((o) => { o.estado.extra = 'x'; o.estado.perfil.rol = 'admin'; o.estado.intentos[0].otro = 1 }).estado.perfil.rol === undefined, 'los campos desconocidos se descartan')
  // Competencias: un diagnóstico antiguo (sin competencia) es cuantitativo; uno de lectura crítica se valida con sus preguntas
  {
    const viejo = JSON.parse(txt)
    delete viejo.estado.intentos[0].competencia
    const rv = leerProgreso(JSON.stringify(viejo))
    ok(rv.ok && rv.estado.intentos[0].competencia === 'cuantitativo', 'sin competencia se asume cuantitativo')
    const qc = generarDiagnostico(4321, 'critica')
    const resp = qc.map((q) => ({ preguntaId: q.id, opcionId: q.opciones.find((o) => !o.error).id, confianza: 'segura' }))
    const dc = calcularDiagnostico(resp, qc)
    const critico = { ...JSON.parse(txt) }
    critico.estado.intentos = [{ fecha: '2026-10-23T11:00:00.000Z', competencia: 'critica', semilla: 4321, aciertos: dc.aciertos, total: dc.total, puntosCiegos: dc.puntosCiegos, prioridad: dc.prioridad, respuestas: resp }]
    critico.estado.progreso = { intencion: { sesiones: 1, ultimaPractica: 3, ultimaTransferencia: true, dominado: true } }
    critico.estado.competencia = 'critica'
    const rc = leerProgreso(JSON.stringify(critico))
    ok(rc.ok && rc.estado.intentos[0].competencia === 'critica' && rc.estado.intentos[0].aciertos === 10, `lectura crítica ida y vuelta: ${rc.error}`)
    ok(rc.ok && rc.estado.progreso.intencion?.dominado === true && rc.estado.competencia === 'critica', 'el avance de lectura crítica y la competencia activa se conservan')
    // Las mismas respuestas atribuidas a la competencia equivocada no cuadran con sus preguntas
    critico.estado.intentos[0].competencia = 'cuantitativo'
    ok(!leerProgreso(JSON.stringify(critico)).ok, 'respuestas de lectura crítica marcadas como cuantitativo deben rechazarse')
    critico.estado.intentos[0].competencia = 'musica'
    ok(!leerProgreso(JSON.stringify(critico)).ok, 'competencia desconocida debe rechazarse')
  }
  const malos = {
    'formato': (o) => { o.formato = 'otra-app' },
    'versión': (o) => { o.version = 1 },
    'sin perfil': (o) => { delete o.estado.perfil },
    'prueba inválida': (o) => { o.estado.perfil.prueba = 'saber9' },
    'apodo vacío': (o) => { o.estado.perfil.apodo = ' ' },
    'semilla negativa': (o) => { o.estado.intentos[0].semilla = -5 },
    'semilla de texto': (o) => { o.estado.intentos[0].semilla = '777' },
    'pregunta ajena': (o) => { o.estado.intentos[0].respuestas[3].preguntaId = 'd9-base-cambio' },
    'faltan respuestas': (o) => { o.estado.intentos[0].respuestas.pop() },
    'opción inválida': (o) => { o.estado.intentos[0].respuestas[0].opcionId = 'z' },
    'confianza inválida': (o) => { o.estado.intentos[0].respuestas[0].confianza = 'quizás' },
    'fecha basura': (o) => { o.estado.intentos[0].fecha = 'ayer' },
    'intentos no es lista': (o) => { o.estado.intentos = {} },
    'sesiones fuera de rango': (o) => { o.estado.progreso.lectura.sesiones = -1 },
    'práctica fuera de rango': (o) => { o.estado.progreso.lectura.ultimaPractica = 7 },
    'progreso es lista': (o) => { o.estado.progreso = [] },
    'día inválido': (o) => { o.estado.actividad['hoy'] = 1 },
    'actividad enorme': (o) => { o.estado.actividad['2026-10-23'] = 1e9 },
    'actividad nula': (o) => { o.estado.actividad = null },
  }
  for (const [nombre, fn] of Object.entries(malos)) ok(!mod(fn).ok, `debe rechazar: ${nombre}`)
  for (const [nombre, crudo] of Object.entries({ vacío: '', 'no es JSON': '{oops', número: '42', nulo: 'null', lista: '[]', 'demasiado grande': ' '.repeat(600000) })) {
    ok(!leerProgreso(crudo).ok, `debe rechazar: ${nombre}`)
  }
  ok(leerProgreso(JSON.stringify({ formato: 'lumora-saber', version: 2, estado: { perfil: { apodo: 'Ana', prueba: 'saber11' }, intentos: [] } })).ok, 'un estado nuevo sin progreso ni actividad es válido')
  ok(nombreArchivo('Álex Ñandú!', new Date(2026, 9, 3)) === 'lumora-progreso-alex-nandu-2026-10-03.json', 'nombre de archivo sin tildes ni símbolos')
  ok(nombreArchivo('???', new Date(2026, 9, 3)) === 'lumora-progreso-estudiante-2026-10-03.json', 'nombre de archivo por defecto')
}

// 8. Lectura crítica: fichas completas y distractores que no aparecen escritos en el texto
{
  const CAMPOS = ['tesis', 'apoyo', 'efecto', 'limite', 'resumen', 'titulo', 'tituloDetalle', 'exagerada', 'invertida', 'ajena', 'inferenciaOk', 'inferenciaMal', 'condNo', 'siNo', 'propositoTxt', 'publico', 'recomendacion', 'recomendacionMal', 'actitud']
  const ABSOLUTAS = /garantiza|nunca|jamás|cualquier|elimina|asegura|todos|todas|\btodo\b|sin excepción|siempre|ya no habrá|evita que vuelvan/i
  for (const [lista, nombre] of [[FICHAS, 'ficha'], [NUEVAS, 'nueva']]) {
    ok(lista.length >= 4, `${nombre}s: hacen falta al menos 4`)
    ok(new Set(lista.map((f) => f.id)).size === lista.length, `${nombre}s: ids repetidos`)
    for (const f of lista) {
      for (const k of CAMPOS) ok(typeof f[k] === 'string' && f[k].trim().length > 3, `${f.id}.${k} vacío`)
      ok(!!f.obs && typeof f.obs.intro === 'function' && ['los', 'las'].includes(f.obs.art) && f.obs.sujeto && f.obs.verboS && f.obs.verboP && f.obs.complemento, `${f.id}.obs incompleto`)
      ok(f.efecto === f.efecto.toLowerCase().charAt(0) + f.efecto.slice(1) && f.efecto[0] === f.efecto[0].toLowerCase(), `${f.id}.efecto debe empezar en minúscula`)
      ok(ABSOLUTAS.test(f.exagerada), `${f.id}.exagerada debe llevar una palabra absoluta`)
      ok(ABSOLUTAS.test(f.inferenciaMal), `${f.id}.inferenciaMal debe llevar una palabra absoluta`)
      ok(!ABSOLUTAS.test(f.inferenciaOk) && !ABSOLUTAS.test(f.siNo) && !ABSOLUTAS.test(f.resumen), `${f.id}: las conclusiones válidas no deben exagerar`)
      const dist = ['exagerada', 'invertida', 'ajena', 'inferenciaMal', 'inferenciaOk', 'siNo', 'resumen', 'titulo', 'tituloDetalle', 'recomendacion', 'recomendacionMal'].map((k) => f[k])
      ok(new Set(dist).size === dist.length, `${f.id}: textos de opciones repetidos`)
      ok(f.contexto === undefined || nombre === 'nueva', `${f.id}: solo las fichas nuevas llevan contexto`)
      ok(nombre === 'ficha' || (typeof f.contexto === 'string' && f.contexto.endsWith(':')), `${f.id}: la ficha nueva necesita contexto`)
    }
  }
  ok(FICHAS.every((f) => f.contexto === undefined), 'las fichas normales no llevan contexto')
  const prohibidas = [...FICHAS, ...NUEVAS].flatMap((f) => [f.ajena, f.exagerada, f.invertida, f.inferenciaMal])
  for (const p of PLANTILLAS.filter((x) => x.competencia === 'critica')) {
    for (let s = 1; s <= 120; s++) {
      const q = armar(p, crearRng(s))
      ok(typeof q.texto === 'string' && q.texto.length > 120, `${p.id}/${s}: falta el texto`)
      const donde = prohibidas.find((x) => q.texto.includes(x))
      ok(!donde, `${p.id}/${s}: el texto contiene un distractor: ${donde}`)
      ok(q.transferencia === p.transferencia, `${p.id}: transferencia mal marcada`)
      if (p.transferencia) ok(/^[A-ZÁÉÍÓÚ][^:]{3,40}:/.test(q.texto), `${p.id}/${s}: el problema nuevo debe tener contexto de género`)
    }
  }
  for (const p of PLANTILLAS.filter((x) => x.competencia === 'cuantitativo')) ok(armar(p, crearRng(1)).texto === undefined, `${p.id}: cuantitativo no lleva texto`)
}

// ---------- 9. Nia ----------
{
  const casos = {
    saludo: ['hola', 'Buenas tardes', '¿qué puedes hacer?'],
    progreso: ['¿Cómo voy?', 'cuál es mi racha', 'cuántos ejercicios llevo hoy'],
    prioridad: ['qué practico primero', 'por dónde empiezo', 'qué error repito'],
    puntosCiegos: ['qué es un punto ciego'],
    respuesta: ['dime la respuesta correcta', 'cuál es la correcta'],
    icfes: ['cuándo es el ICFES', 'cuántas preguntas tiene Saber 11'],
    limites: ['¿eres una IA?'],
    base: ['cómo calculo un descuento', 'porcentaje'],
    proporcion: ['regla de tres', 'proporción inversa'],
    conversion: ['litros y mililitros'],
    inferencia: ['inferencia exagerada'],
    relacion: ['causa y consecuencia'],
    intencion: ['cuál es la intención del texto'],
    detalle: ['idea principal'],
  }
  for (const [tema, frases] of Object.entries(casos)) {
    for (const f of frases) ok(detectarTema(f) === tema, `Nia: «${f}» debía ser ${tema} y fue ${detectarTema(f)}`)
  }
  for (const f of ['receta de arepas', 'xyz', '', '   ', '¿quién ganó el partido?']) {
    ok(detectarTema(f) === null, `Nia: «${f}» no debía entenderse`)
    ok(/prefiero decírtelo|no estoy segura/.test(responder(f, {}).texto), `Nia: debe admitir que no entiende «${f}»`)
  }
  ok(detectarTema('no entiendo', 'base') === 'base', 'Nia: en práctica, «no entiendo» se refiere al tema actual')
  ok(detectarTema('no entiendo') === null, 'Nia: fuera de práctica «no entiendo» no es un tema')

  // Cada tipo de error tiene respuesta con su lección y un botón para practicarlo
  for (const tipo of TIPOS) {
    const r = responder(`explícame ${TIPOS_ERROR[tipo].nombre}`, { competencia: TIPOS_ERROR[tipo].competencia })
    ok(r.texto.includes(LECCIONES[tipo].chequeo) && r.accion?.valor === tipo, `Nia: la explicación de «${tipo}» debe traer el truco y la acción`)
  }

  // No revela respuestas ni inventa datos oficiales
  const r1 = responder('dame la respuesta', { tipoActual: 'base' })
  ok(/No te voy a dar la respuesta/.test(r1.texto) && !r1.accion, 'Nia: no debe dar respuestas de ejercicios')
  const r2 = responder('cuándo es el icfes', {}).texto
  ok(/icfes\.gov\.co/.test(r2) && !/\d{4}/.test(r2), 'Nia: no debe dar fechas ni cifras oficiales y sí remitir al ICFES')

  // Usa datos reales del estudiante
  const preguntas = generarDiagnostico(7, 'critica')
  const respuestas = preguntas.map((q) => ({ preguntaId: q.id, opcionId: q.opciones.find((o) => o.error)?.id ?? 'a', confianza: 'segura' }))
  const diag = calcularDiagnostico(respuestas, preguntas)
  const pr = responder('qué practico primero', { competencia: 'critica', diag })
  ok(pr.accion?.tipo === 'practicar' && TIPOS_ERROR[pr.accion.valor].competencia === 'critica', 'Nia: la prioridad debe ser un tipo de la competencia actual')
  const hoy = claveDia()
  const pg = responder('cómo voy', { competencia: 'critica', diag, actividad: { [hoy]: 3 }, progreso: { literal: { dominado: true } } })
  ok(/3 de 4/.test(pg.texto) && /1 de 5/.test(pg.texto) && new RegExp(`${diag.aciertos}/${diag.total}`).test(pg.texto), 'Nia: el progreso debe reflejar los datos reales')
  const sin = responder('qué practico primero', { competencia: 'cuantitativo', diag: null })
  ok(/diagnóstico/.test(sin.texto) && !sin.accion, 'Nia: sin diagnóstico debe pedirlo, no inventar prioridad')

  // Toda respuesta ofrece sugerencias o una acción para seguir
  for (const f of Object.values(casos).flat()) {
    const r = responder(f, { competencia: 'cuantitativo' })
    ok(typeof r.texto === 'string' && r.texto.length > 20 && (r.sugerencias?.length > 0 || r.accion), `Nia: «${f}» debe dejar un siguiente paso`)
  }
}

// ---------- 10. Puntos, niveles, medallas y mapa ----------
{
  const vacio = { intentos: [], progreso: {}, actividad: {} }
  ok(calcularPuntos(vacio) === 0 && nivelDe(0).numero === 1 && nivelDe(0).nombre === 'Curiosidad', 'logros: estado vacío = 0 puntos, nivel 1')
  ok(medallas(vacio).every((m) => !m.lograda) && medallas(vacio).length === MEDALLAS.length, 'logros: sin progreso no hay medallas')
  ok(new Set(MEDALLAS.map((m) => m.id)).size === MEDALLAS.length, 'logros: ids de medalla únicos')
  ok(MEDALLAS.every((m) => m.como.length > 10 && m.nombre.length > 3), 'logros: cada medalla dice cómo conseguirla')

  // niveles: monótonos, sin saltos raros, y el último no tiene siguiente
  let previo = 0
  for (let p = 0; p <= 1500; p += 5) {
    const n = nivelDe(p)
    ok(n.numero >= previo && n.pct >= 0 && n.pct <= 100 && n.faltan >= 0, `nivel: valores inválidos en ${p}`)
    previo = n.numero
  }
  ok(nivelDe(60).numero === 2 && nivelDe(59).numero === 1 && nivelDe(800).siguiente === null && nivelDe(800).pct === 100, 'nivel: umbrales')

  // puntos y recompensa con un caso armado
  const preguntas = generarDiagnostico(3, 'cuantitativo')
  const resp = preguntas.map((q) => ({ preguntaId: q.id, opcionId: q.opciones.find((o) => o.error).id, confianza: 'segura' }))
  const d = calcularDiagnostico(resp, preguntas)
  const intento = { fecha: new Date().toISOString(), competencia: 'cuantitativo', semilla: 3, aciertos: d.aciertos, total: d.total, puntosCiegos: d.puntosCiegos, prioridad: d.prioridad, respuestas: resp }
  const tras = { ...vacio, intentos: [intento] }
  const r = recompensa(vacio, tras)
  ok(r.puntos === 30, `recompensa: un diagnóstico vale 30 y fue ${r.puntos}`)
  const ids = r.medallas.map((m) => m.id)
  ok(ids.includes('primer-paso') && ids.includes('punto-ciego') && !ids.includes('sin-ciegos'), `recompensa: medallas de un diagnóstico todo mal con seguridad: ${ids}`)
  ok(recompensa(tras, tras).puntos === 0 && recompensa(tras, tras).medallas.length === 0, 'recompensa: sin cambios no suma')

  // «Subiste tu puntaje» solo si mejora dentro de la misma competencia
  const mejor = { ...intento, aciertos: intento.aciertos + 2 }
  ok(medallas({ ...vacio, intentos: [intento, mejor] }).find((m) => m.id === 'subiste').lograda, 'medalla: subiste en la misma competencia')
  ok(!medallas({ ...vacio, intentos: [intento, { ...mejor, competencia: 'critica' }] }).find((m) => m.id === 'subiste').lograda, 'medalla: no se compara entre competencias')
  ok(medallas({ ...vacio, intentos: [intento, { ...mejor, competencia: 'critica' }] }).find((m) => m.id === 'dos-competencias').lograda, 'medalla: dos competencias')
  // intento antiguo sin competencia cuenta como cuantitativo
  const { competencia: _c, ...antiguo } = intento
  ok(medallas({ ...vacio, intentos: [antiguo, mejor] }).find((m) => m.id === 'subiste').lograda, 'medalla: intento antiguo = cuantitativo')

  // dominar suma 50 y la práctica 10 por ejercicio
  const dom = { ...vacio, progreso: { base: { sesiones: 1, ultimaPractica: 3, ultimaTransferencia: true, dominado: true } }, actividad: { '2026-10-01': 4 } }
  ok(calcularPuntos(dom) === 90, `puntos: 4 ejercicios + dominado = 90 y fue ${calcularPuntos(dom)}`)
  ok(medallas(dom).filter((m) => m.lograda).map((m) => m.id).sort().join() === 'caso-nuevo,dominado,meta-dia,primer-ejercicio', 'medallas: práctica y dominio')

  // mapa
  const niv = nivelesDeDiagnostico(intento, 'cuantitativo')
  ok(Object.keys(niv).length === 5 && Object.values(niv).every((v) => v >= 0 && v <= 1), 'mapa: 5 tipos con valores 0..1')
  ok(Math.min(...Object.values(niv)) < 1, 'mapa: un diagnóstico todo mal debe mostrar errores')
  ok(nivelAhora(0.5, { dominado: true }) === 1 && nivelAhora(0.5, undefined) === 0.5, 'mapa: dominado = 1; sin práctica = base')
  ok(nivelAhora(0, { sesiones: 1, ultimaPractica: 3, ultimaTransferencia: true, dominado: false }) === 0.9, 'mapa: práctica perfecta sin dominar = 0,9')
  ok(nivelAhora(0.5, { sesiones: 1, ultimaPractica: 0, ultimaTransferencia: false, dominado: false }) === 0.5, 'mapa: practicar mal no baja el nivel del diagnóstico')
}

// ---------- 11. Fusión y sincronización con la nube ----------
const pruebasNube = async () => {
  const perfil = { apodo: 'Ana', prueba: 'saber11' }
  const hacerIntento = (semilla, competencia, pos = 0, fecha = '2026-10-01T10:00:00.000Z') => {
    const preguntas = generarDiagnostico(semilla, competencia)
    const respuestas = preguntas.map((q, i) => ({ preguntaId: q.id, opcionId: i < pos ? q.opciones.find((o) => !o.error).id : q.opciones.find((o) => o.error).id, confianza: 'dudo' }))
    const d = calcularDiagnostico(respuestas, preguntas)
    return { fecha, competencia, semilla, aciertos: d.aciertos, total: d.total, puntosCiegos: d.puntosCiegos, prioridad: d.prioridad, respuestas }
  }
  const celular = { perfil, intentos: [hacerIntento(11, 'cuantitativo', 3, '2026-10-01T10:00:00.000Z')], progreso: { base: { sesiones: 1, ultimaPractica: 2, ultimaTransferencia: false, dominado: false } }, actividad: { '2026-10-01': 4, '2026-10-02': 1 }, competencia: 'cuantitativo' }
  const portatil = { perfil, intentos: [hacerIntento(12, 'critica', 5, '2026-10-03T10:00:00.000Z')], progreso: { base: { sesiones: 3, ultimaPractica: 3, ultimaTransferencia: true, dominado: true }, literal: { sesiones: 1, ultimaPractica: 1, ultimaTransferencia: false, dominado: false } }, actividad: { '2026-10-02': 3, '2026-10-03': 2 }, competencia: 'critica' }

  const f = fusionar(celular, portatil)
  ok(f.intentos.length === 2 && f.intentos[0].semilla === 11 && f.intentos[1].semilla === 12, 'fusión: une los diagnósticos de los dos dispositivos, en orden')
  ok(f.progreso.base.dominado && f.progreso.base.sesiones === 3 && f.progreso.base.ultimaPractica === 3 && f.progreso.literal.sesiones === 1, 'fusión: conserva lo más avanzado por tipo')
  ok(f.actividad['2026-10-01'] === 4 && f.actividad['2026-10-02'] === 3 && f.actividad['2026-10-03'] === 2, 'fusión: actividad = máximo por día')
  ok(f.competencia === 'cuantitativo', 'fusión: la competencia elegida es la de este dispositivo')
  ok(validarEstado(f).ok, 'fusión: el resultado pasa la validación')
  ok(mismoContenido(fusionar(celular, f), f) && mismoContenido(fusionar(f, f), f), 'fusión: repetirla no cambia nada')
  ok(mismoContenido(fusionar(celular, portatil), fusionar(portatil, celular)), 'fusión: el contenido no depende de quién fusiona')
  ok(calcularPuntos(f) >= Math.max(calcularPuntos(celular), calcularPuntos(portatil)), 'fusión: los puntos nunca bajan')
  ok(fusionar({ ...celular, enCurso: { semilla: 1, respuestas: [] } }, portatil).enCurso?.semilla === 1 && !('enCurso' in paraNube({ ...celular, enCurso: {} })), 'fusión: el diagnóstico a medias es solo local y no se sube')

  // Cliente falso con la forma del de Supabase
  const hacerDb = (filas = {}, falla = {}) => {
    const llamadas = []
    return {
      llamadas,
      filas,
      from: (tabla) => ({
        select: () => ({ eq: (_c, uid) => ({ maybeSingle: async () => (falla.leer ? { data: null, error: new Error('red') } : { data: filas[uid] ? { estado: filas[uid] } : null, error: null }) }) }),
        upsert: async (fila) => {
          llamadas.push({ tabla, fila })
          if (falla.subir) return { error: new Error('red') }
          filas[fila.user_id] = fila.estado
          return { error: null }
        },
      }),
    }
  }

  // Primera vez: no hay nada en la nube → se sube lo del dispositivo
  let db = hacerDb()
  let r = await sincronizar({ db, uid: 'u1', local: celular })
  ok(r.subido && !r.cambioLocal && db.filas.u1.intentos.length === 1, 'nube: la primera vez sube el progreso local')

  // Segundo dispositivo, vacío: baja lo de la nube sin subir nada
  const vacio = { perfil, intentos: [], progreso: {}, actividad: {} }
  r = await sincronizar({ db, uid: 'u1', local: vacio })
  ok(!r.subido && r.cambioLocal && r.estado.intentos.length === 1 && r.estado.actividad['2026-10-01'] === 4, 'nube: un dispositivo nuevo recibe el progreso de la cuenta')

  // Dos dispositivos con avances distintos: se unen y la nube queda con todo
  r = await sincronizar({ db, uid: 'u1', local: portatil })
  ok(r.subido && r.cambioLocal && r.estado.intentos.length === 2 && db.filas.u1.intentos.length === 2 && db.filas.u1.progreso.base.dominado, 'nube: avances de dos dispositivos se unen')
  const n = db.llamadas.length
  r = await sincronizar({ db, uid: 'u1', local: r.estado })
  ok(!r.subido && !r.cambioLocal && db.llamadas.length === n, 'nube: sin cambios no escribe')
  ok(!('enCurso' in db.filas.u1), 'nube: nunca se sube el diagnóstico a medias')

  // Fallos: no se pierde nada ni se pisa lo guardado
  for (const [falla, texto] of [[{ leer: true }, 'no se puede leer'], [{ subir: true }, 'no se puede subir']]) {
    db = hacerDb({}, falla)
    let lanzo = false
    try { await sincronizar({ db, uid: 'u1', local: celular }) } catch { lanzo = true }
    ok(lanzo, `nube: si ${texto}, lanza error (el estado local queda intacto)`)
  }
  db = hacerDb({ u1: { intentos: 'basura', perfil: 5 } })
  let codigo = ''
  try { await sincronizar({ db, uid: 'u1', local: celular }) } catch (e) { codigo = e instanceof ErrorNube ? e.codigo : 'otro' }
  ok(codigo === 'invalido' && db.llamadas.length === 0, 'nube: datos ilegibles en la cuenta no se pisan')
  db = hacerDb({ u1: portatil })
  r = await sincronizar({ db, uid: 'u1', local: { perfil: 3, intentos: 'x', progreso: {}, actividad: {} } })
  ok(r.estado.intentos.length === 1 && !r.subido, 'nube: un estado local dañado se descarta y se usa el de la cuenta')

  // Mensajes de error en español, sin filtrar detalles técnicos
  ok(/no son correctos/.test(mensajeDeError({ message: 'Invalid login credentials' })) && /ya tiene una cuenta/.test(mensajeDeError({ message: 'User already registered' })), 'errores: mensajes claros')
  ok(!/supabase|jwt|postgres/i.test(mensajeDeError({ message: 'JWT expired at postgres' })), 'errores: no se muestran detalles técnicos')
}
await pruebasNube()

console.log(fallos === 0 ? `✔ Todo verificado (${PLANTILLAS.length} plantillas × ${SEMILLAS} semillas)` : `✘ ${fallos} fallo(s)`)
process.exit(fallos === 0 ? 0 : 1)

// ---------- 12. Más competencias: naturales, ciudadanas e inglés ----------
{
  const NUEVAS_COMP = ['naturales', 'ciudadanas', 'ingles']
  ok(Object.keys(COMPETENCIAS).length === 5 && NUEVAS_COMP.every((c) => COMPETENCIAS[c]?.tipos.length === 5), 'competencias: deben ser 5 y las nuevas con 5 tipos')
  ok(COMPETENCIAS_POR_PRUEBA.saber11.length === 5 && COMPETENCIAS_POR_PRUEBA.saberpro.length === 4 && !COMPETENCIAS_POR_PRUEBA.saberpro.includes('naturales'), 'pruebas: Saber Pro no lleva ciencias naturales')
  for (const lista of Object.values(COMPETENCIAS_POR_PRUEBA)) ok(lista.every((c) => c in COMPETENCIAS), 'pruebas: competencia desconocida')
  for (const c of NUEVAS_COMP) {
    const delComp = PLANTILLAS.filter((p) => p.competencia === c)
    ok(delComp.length === 25, `${c}: deben ser 25 fichas (hay ${delComp.length})`)
    let masLarga = 0
    for (const p of delComp) {
      const q = armar(p, crearRng(1))
      const correcta = q.opciones.find((o) => !o.error).texto
      if (correcta.length > Math.max(...q.opciones.filter((o) => o.error).map((o) => o.texto.length))) masLarga++
      ok(q.explicacion.includes(correcta), `${p.id}: la explicación debe contener la respuesta`)
      // Los distractores nunca pueden repetirse dentro de la pregunta ni contener la respuesta correcta completa
      ok(q.opciones.every((o) => !o.error || o.texto !== correcta), `${p.id}: distractor igual a la correcta`)
    }
    ok(masLarga / delComp.length <= 0.7, `${c}: la correcta es la más larga en ${masLarga} de ${delComp.length} (se vuelve adivinable)`)
    for (let s = 1; s <= 50; s++) {
      const d = generarDiagnostico(s, c)
      ok(d.length === 10 && d.every((q) => TIPOS_ERROR[q.tipo].competencia === c), `${c}: diagnóstico con preguntas de otra competencia`)
    }
  }
  // Inglés: textos cortos llevan texto de lectura; tablas de naturales traen encabezados y filas
  for (const p of PLANTILLAS.filter((x) => x.tipo === 'textocorto')) ok(!!armar(p, crearRng(1)).texto, `${p.id}: el texto corto necesita texto`)
  for (const p of PLANTILLAS.filter((x) => x.tipo === 'grafica')) {
    const t = armar(p, crearRng(1)).tabla
    ok(t && t.encabezados.length >= 2 && t.filas.length >= 3 && t.filas.every((f) => f.length === t.encabezados.length), `${p.id}: tabla mal formada`)
    ok(new Set(t.filas.map((f) => f[0])).size === t.filas.length, `${p.id}: filas con la misma primera celda (key repetida)`)
  }
  ok(/inglés/.test(responder('¿qué competencias hay?', { competencia: 'ingles' }).texto) && /sociales y ciudadanas/.test(responder('¿qué competencias hay?', {}).texto), 'Nia: menciona las cinco competencias')
  ok(medallas({ intentos: [{ competencia: 'naturales', aciertos: 5, total: 10, puntosCiegos: 1 }, { competencia: 'ingles', aciertos: 5, total: 10, puntosCiegos: 1 }], progreso: {}, actividad: {} }).find((m) => m.id === 'dos-competencias').lograda, 'medalla: dos competencias cualquiera')
}
