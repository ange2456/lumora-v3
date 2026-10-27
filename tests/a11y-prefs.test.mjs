// Verifica las preferencias de accesibilidad (sin navegador).
// Uso: node tests/a11y-prefs.test.mjs
import { PREFS_BASE, atributos, normalizar } from '../src/saber/lib/accesibilidad.js'
import { partesDePregunta } from '../src/saber/lib/leer.js'

let fallos = 0
const ok = (cond, msg) => { if (!cond) { fallos++; console.error('✘', msg) } }

// Lo desconocido o dañado vuelve a los valores base.
ok(JSON.stringify(normalizar(null)) === JSON.stringify(PREFS_BASE), 'null → base')
ok(JSON.stringify(normalizar('hola')) === JSON.stringify(PREFS_BASE), 'texto suelto → base')
ok(normalizar({ texto: 'gigante' }).texto === 'normal', 'tamaño desconocido → normal')
ok(normalizar({ contraste: 'si' }).contraste === false, 'valor no booleano → false')
const p = normalizar({ texto: 'muy-grande', contraste: true, fuente: true, espacio: true, movimiento: true, extra: 1 })
ok(p.texto === 'muy-grande' && p.contraste && p.fuente && p.espacio && p.movimiento, 'valores válidos se conservan')
ok(!('extra' in p), 'se descartan claves desconocidas')

// Atributos para <html>.
const a = atributos(p)
ok(a['data-a11y-texto'] === 'muy-grande' && a['data-a11y-contraste'] === 'alto', 'atributos de texto y contraste')
ok(a['data-a11y-fuente'] === 'legible' && a['data-a11y-espacio'] === 'amplio' && a['data-a11y-movimiento'] === 'reducido', 'atributos del resto')
const b = atributos(PREFS_BASE)
ok(Object.values(b).every((v) => v === 'normal'), 'base → todo normal')

// Lo que se lee en voz alta de una pregunta.
const q = { texto: 'Library hours: 8 to 6.', enunciado: '¿Qué pasa?', opciones: [{ texto: 'Abre' }, { texto: 'Cierra' }, { texto: 'Nada' }, { texto: 'Otra' }] }
const partes = partesDePregunta(q, true)
ok(partes[0].lang === 'en-US' && partes[0].texto.includes('Library'), 'el texto en inglés se lee en inglés')
ok(partes[1].lang === 'es-CO' && partes[1].texto === '¿Qué pasa?', 'el enunciado se lee en español')
ok(partes.at(-1).texto === 'Opción A. Abre. Opción B. Cierra. Opción C. Nada. Opción D. Otra', 'las opciones se leen con su letra')
const conTabla = partesDePregunta({ ...q, texto: undefined, tabla: { encabezados: ['Día', 'Lluvia'], filas: [['Lunes', '5 mm']] } })
ok(conTabla.some((x) => x.texto === 'Tabla. Día: Lunes, Lluvia: 5 mm'), 'la tabla se lee por filas con su encabezado')

if (fallos) { console.error(`✘ ${fallos} fallo(s)`); process.exit(1) }
console.log('✔ Accesibilidad verificada')
