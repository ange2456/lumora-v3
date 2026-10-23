// Plantillas de preguntas de razonamiento cuantitativo de Lumora.
// Cada plantilla sortea sus cifras y arma 1 respuesta correcta y 3 incorrectas.
// Cada incorrecta corresponde a un tipo de error concreto (base, proporcion, conversion,
// lectura, incompleta), así el diagnóstico es explicable.
// Contenido original: no proviene de pruebas del ICFES.

import { barajar, dec, elige, ent, miles, pad2, pesos, porcentaje } from '../lib/generador.js'

const ok = (texto) => ({ texto })
const mal = (texto, error, porque) => ({ texto, error, porque })

export const PLANTILLAS = [
  // =====================================================================
  // BASE EQUIVOCADA
  // =====================================================================
  {
    id: 'base-descuentos',
    tipo: 'base',
    generar(r) {
      const precio = elige(r, [60000, 80000, 100000, 120000, 150000, 200000])
      const [d1, d2] = elige(r, [[20, 10], [25, 10], [30, 10], [25, 20], [40, 10], [50, 10], [20, 20]])
      const articulo = elige(r, ['Una camiseta', 'Una chaqueta', 'Un pantalón', 'Un par de tenis'])
      const p1 = (precio * (100 - d1)) / 100
      const fin = (p1 * (100 - d2)) / 100
      if (!Number.isInteger(p1) || !Number.isInteger(fin)) return null
      return {
        enunciado: `${articulo} cuesta ${pesos(precio)} y tiene ${d1}% de descuento. Por pagar en efectivo te hacen otro ${d2}% de descuento sobre el precio ya rebajado. ¿Cuánto pagas?`,
        pista: 'El segundo descuento se calcula sobre el precio que ya quedó rebajado.',
        correcta: ok(pesos(fin)),
        incorrectas: [
          mal(
            pesos((precio * (100 - d1 - d2)) / 100),
            'base',
            `Sumaste ${d1}% + ${d2}% = ${d1 + d2}% y lo aplicaste al precio original. El segundo descuento se calcula sobre el precio ya rebajado.`,
          ),
          mal(pesos(p1), 'incompleta', 'Calculaste solo el primer descuento y olvidaste el segundo.'),
          mal(pesos((precio * (100 - d2)) / 100), 'incompleta', `Aplicaste solo el ${d2}% y no el ${d1}%.`),
        ],
        explicacion: `Primero: ${pesos(precio)} × ${dec((100 - d1) / 100)} = ${pesos(p1)}. Luego: ${pesos(p1)} × ${dec((100 - d2) / 100)} = ${pesos(fin)}.`,
      }
    },
  },
  {
    id: 'base-cambio',
    tipo: 'base',
    generar(r) {
      const base = elige(r, [80000, 100000, 120000, 150000, 200000, 250000, 400000])
      const pct = elige(r, [10, 20, 25, 30, 40, 50])
      const sube = r() < 0.5
      const objeto = elige(r, ['un celular', 'una bicicleta', 'unos tenis', 'una licuadora'])
      const delta = (base * pct) / 100
      if (!Number.isInteger(delta)) return null
      const nuevo = sube ? base + delta : base - delta
      const sobreNuevo = (delta / nuevo) * 100
      const queda = (nuevo / base) * 100
      return {
        enunciado: `El precio de ${objeto} ${sube ? 'subió' : 'bajó'} de ${pesos(base)} a ${pesos(nuevo)}. ¿En qué porcentaje ${sube ? 'aumentó' : 'disminuyó'} el precio?`,
        pista: `¿Desde cuál valor ${sube ? 'subió' : 'bajó'} el precio? Ese valor va abajo en la división.`,
        correcta: ok(`${pct}%`),
        incorrectas: [
          mal(
            porcentaje(sobreNuevo),
            'base',
            `Dividiste el cambio (${pesos(delta)}) entre el precio nuevo. El porcentaje de cambio se mide sobre el precio de partida (${pesos(base)}).`,
          ),
          mal(
            `${Math.round(queda)}%`,
            'incompleta',
            `Calculaste el precio nuevo como porcentaje del inicial (${Math.round(queda)}%), pero faltó compararlo con el 100%.`,
          ),
          mal(pesos(delta), 'incompleta', 'Calculaste cuánto cambió en pesos. La pregunta pedía un porcentaje.'),
        ],
        explicacion: `${sube ? 'Subió' : 'Bajó'} ${pesos(delta)}. La base es ${pesos(base)}. ${pesos(delta)} ÷ ${pesos(base)} = ${dec(delta / base)} = ${pct}%.`,
      }
    },
  },
  {
    id: 'base-complemento',
    tipo: 'base',
    generar(r) {
      const total = elige(r, [200, 250, 300, 400, 500, 600, 800])
      const pct = elige(r, [10, 15, 20, 25, 30, 35, 40, 45, 60, 65, 70])
      const [lugar, plural, singularVerbo, pluralVerbo] = elige(r, [
        ['un colegio', 'estudiantes', 'viene en bus', 'vienen en bus'],
        ['un barrio', 'familias', 'tiene mascota', 'tienen mascota'],
        ['una empresa', 'empleados', 'llega en moto', 'llegan en moto'],
        ['un curso', 'estudiantes', 'usa bicicleta', 'usan bicicleta'],
      ])
      const parte = (total * pct) / 100
      if (!Number.isInteger(parte)) return null
      return {
        enunciado: `En ${lugar} hay ${total} ${plural} y el ${pct}% ${singularVerbo}. ¿Cuántos NO ${pluralVerbo}?`,
        pista: `Primero calcula cuántos sí ${pluralVerbo}. Luego, cuántos faltan para llegar a ${total}.`,
        correcta: ok(`${miles(total - parte)} ${plural}`),
        incorrectas: [
          mal(
            `${miles(parte)} ${plural}`,
            'incompleta',
            `Calculaste cuántos sí ${pluralVerbo} (el ${pct}% de ${total}). Faltó restarlos del total.`,
          ),
          mal(
            `${miles(total - pct)} ${plural}`,
            'base',
            `Restaste ${pct} ${plural}, pero el ${pct}% es una parte de ${total}, no son ${pct} personas.`,
          ),
          mal(
            `${100 - pct} ${plural}`,
            'incompleta',
            `Calculaste el porcentaje que no ${singularVerbo.replace(/^\S+/, (v) => v)} (${100 - pct}%), pero faltó convertirlo en ${plural}.`,
          ),
        ],
        explicacion: `${pct}% de ${total} = ${parte} ${plural} sí ${pluralVerbo}. ${total} − ${parte} = ${total - parte}.`,
      }
    },
  },
  {
    id: 'base-aprobacion',
    tipo: 'base',
    generar(r) {
      const total = elige(r, [20, 25, 40, 50, 80])
      const pct = elige(r, [30, 35, 40, 45, 55, 60, 65, 70, 75, 80])
      const k = (total * pct) / 100
      if (!Number.isInteger(k)) return null
      const materia = elige(r, ['matemáticas', 'inglés', 'física', 'química'])
      return {
        enunciado: `En un salón de ${total} estudiantes, ${k} aprobaron ${materia}. ¿Qué porcentaje del salón aprobó?`,
        pista: 'El porcentaje se calcula sobre el total del salón.',
        correcta: ok(`${pct}%`),
        incorrectas: [
          mal(`${100 - pct}%`, 'lectura', 'Calculaste el porcentaje de quienes NO aprobaron, no de quienes aprobaron.'),
          mal(`${k}%`, 'incompleta', `Tomaste el número ${k} como si ya fuera el porcentaje.`),
          mal(
            porcentaje((total / k) * 100),
            'base',
            `Dividiste ${total} ÷ ${k}: la base del porcentaje es el total del salón (${total}), no quienes aprobaron.`,
          ),
        ],
        explicacion: `${k} ÷ ${total} = ${dec(k / total)} = ${pct}%.`,
      }
    },
  },
  {
    id: 'base-sube-baja',
    tipo: 'base',
    generar(r) {
      const base = elige(r, [50000, 80000, 100000, 120000, 200000])
      const p = elige(r, [10, 20, 25, 30, 40, 50])
      const sube = (base * (100 + p)) / 100
      const fin = (sube * (100 - p)) / 100
      if (!Number.isInteger(sube) || !Number.isInteger(fin)) return null
      return {
        enunciado: `Un producto de ${pesos(base)} sube ${p}% y la semana siguiente baja ${p}%. ¿Cuánto cuesta al final?`,
        pista: `El segundo ${p}% se calcula sobre el precio que ya subió.`,
        correcta: ok(pesos(fin)),
        incorrectas: [
          mal(
            pesos(base),
            'base',
            `Creíste que se cancelan. La bajada del ${p}% se calcula sobre ${pesos(sube)}, no sobre ${pesos(base)}.`,
          ),
          mal(pesos((base * (100 - p)) / 100), 'incompleta', 'Solo aplicaste la bajada.'),
          mal(pesos(sube), 'incompleta', 'Solo aplicaste la subida.'),
        ],
        explicacion: `Sube: ${pesos(base)} × ${dec(1 + p / 100)} = ${pesos(sube)}. Baja: ${pesos(sube)} × ${dec(1 - p / 100)} = ${pesos(fin)}.`,
      }
    },
  },
  {
    id: 'base-recibo',
    tipo: 'base',
    transferencia: true,
    generar(r) {
      const a = elige(r, [100000, 120000, 150000, 200000])
      const pct = elige(r, [10, 20, 25, 30, 40, 50])
      const delta = (a * pct) / 100
      if (!Number.isInteger(delta)) return null
      const nuevo = a + delta
      const b = Number(((delta / nuevo) * 100).toFixed(1))
      if (b === pct) return null
      const correctoPrimero = r() < 0.5
      const primero = correctoPrimero ? pct : b
      const segundo = correctoPrimero ? b : pct
      return {
        enunciado: `Tu recibo de energía pasó de ${pesos(a)} a ${pesos(nuevo)}. Un amigo dice que subió ${dec(primero)}% y otro dice que subió ${dec(segundo)}%. ¿Quién tiene razón?`,
        pista: 'Un aumento se compara con el valor del que partió.',
        correcta: ok(correctoPrimero ? `El primero: subió ${pct}%` : `El segundo: subió ${pct}%`),
        incorrectas: [
          mal(
            correctoPrimero ? `El segundo: subió ${dec(b)}%` : `El primero: subió ${dec(b)}%`,
            'base',
            `Dividiste el aumento entre ${pesos(nuevo)}, el valor nuevo. La base es el recibo anterior.`,
          ),
          mal(
            'Los dos tienen razón',
            'lectura',
            'Los dos resultados no pueden ser ciertos a la vez. Revisa cuál base corresponde a «subió».',
          ),
          mal(
            `Ninguno: subió ${pesos(delta)}`,
            'incompleta',
            `${pesos(delta)} es lo que subió en pesos, no el porcentaje.`,
          ),
        ],
        explicacion: `Subió ${pesos(delta)}. La base es ${pesos(a)}. ${pesos(delta)} ÷ ${pesos(a)} = ${dec(delta / a)} = ${pct}%.`,
      }
    },
  },
  {
    id: 'base-descuento-real',
    tipo: 'base',
    transferencia: true,
    generar(r) {
      const precio = elige(r, [100000, 150000, 200000, 300000])
      const d1 = elige(r, [20, 30, 40, 50])
      const d2 = elige(r, [10, 20])
      const paga = (precio * (100 - d1) * (100 - d2)) / 10000
      const ahorro = precio - paga
      if (!Number.isInteger(paga)) return null
      return {
        enunciado: `Una tienda anuncia «${d1}% de descuento y, con el cupón, ${d2}% más». Un amigo dice que el descuento total es de ${d1 + d2}%. En un artículo de ${pesos(precio)}, ¿cuánto te ahorras en realidad?`,
        pista: 'El descuento del cupón se aplica sobre el precio que ya está rebajado.',
        correcta: ok(pesos(ahorro)),
        incorrectas: [
          mal(
            pesos((precio * (d1 + d2)) / 100),
            'base',
            `Sumaste los porcentajes. El segundo descuento se aplica sobre el precio ya rebajado, así que el descuento total es menor que ${d1 + d2}%.`,
          ),
          mal(pesos((precio * d1) / 100), 'incompleta', 'Solo calculaste el primer descuento.'),
          mal(pesos(paga), 'incompleta', 'Calculaste cuánto pagas, no cuánto te ahorras.'),
        ],
        explicacion: `Pagas ${pesos(precio)} × ${dec((100 - d1) / 100)} × ${dec((100 - d2) / 100)} = ${pesos(paga)}. Ahorras ${pesos(precio)} − ${pesos(paga)} = ${pesos(ahorro)}.`,
      }
    },
  },

  // =====================================================================
  // PROPORCIÓN MAL APLICADA
  // =====================================================================
  {
    id: 'prop-obreros',
    tipo: 'proporcion',
    generar(r) {
      const a = elige(r, [3, 4, 5, 6])
      const d = elige(r, [6, 8, 10, 12, 15, 20])
      const b = elige(r, [6, 8, 9, 10, 12, 15])
      const [plural, tarea] = elige(r, [
        ['obreros', 'terminan un muro'],
        ['pintores', 'pintan una casa'],
        ['jardineros', 'arreglan un parque'],
        ['voluntarios', 'organizan la biblioteca'],
      ])
      if (b <= a || (a * d) % b !== 0) return null
      const res = (a * d) / b
      if (d - b < 1) return null
      return {
        enunciado: `${a} ${plural} ${tarea} en ${d} días. Si trabajan ${b} ${plural} con el mismo ritmo, ¿en cuántos días lo terminan?`,
        pista: 'Con más personas trabajando, ¿el trabajo tarda más o menos? ¿Es relación directa o inversa?',
        correcta: ok(`${res} días`),
        incorrectas: [
          mal(
            `${dec((d * b) / a)} días`,
            'proporcion',
            `Lo trataste como directa. Con más ${plural} no se tarda más, se tarda menos.`,
          ),
          mal(`${d - b} días`, 'proporcion', `Restaste ${d} − ${b}. Entre ${plural} y días no hay una resta.`),
          mal(
            `${d * b} días`,
            'proporcion',
            `Multiplicaste ${d} × ${b}, como si cada integrante extra sumara días.`,
          ),
        ],
        explicacion: `El trabajo total es ${a} × ${d} = ${a * d} días-persona. Con ${b}: ${a * d} ÷ ${b} = ${res} días.`,
      }
    },
  },
  {
    id: 'prop-cuadernos',
    tipo: 'proporcion',
    generar(r) {
      const u = elige(r, [1200, 1500, 2000, 2500, 3000, 4000])
      const n1 = elige(r, [4, 5, 6, 8])
      const n2 = n1 + ent(r, 2, 6)
      const item = elige(r, ['cuadernos', 'lápices', 'panes', 'empanadas'])
      const total1 = u * n1
      const invertido = Math.round((total1 * n1) / n2 / 100) * 100
      return {
        enunciado: `${n1} ${item} iguales cuestan ${pesos(total1)}. ¿Cuánto cuestan ${n2} ${item}?`,
        pista: 'Calcula primero cuánto cuesta uno.',
        correcta: ok(pesos(u * n2)),
        incorrectas: [
          mal(
            pesos(total1 * n2),
            'proporcion',
            `Multiplicaste ${pesos(total1)} × ${n2} sin dividir antes entre los ${n1} ${item}.`,
          ),
          mal(
            pesos(invertido),
            'proporcion',
            `Invertiste la regla de tres. Con más ${item} pagas más, no menos.`,
          ),
          mal(pesos(u), 'incompleta', `Calculaste el precio de uno, pero faltó multiplicarlo por ${n2}.`),
        ],
        explicacion: `Uno: ${pesos(total1)} ÷ ${n1} = ${pesos(u)}. Para ${n2}: ${pesos(u)} × ${n2} = ${pesos(u * n2)}.`,
      }
    },
  },
  {
    id: 'prop-grifo',
    tipo: 'proporcion',
    generar(r) {
      const l = elige(r, [2, 3, 4, 5])
      const h = elige(r, [2, 3, 4, 6])
      const H = elige(r, [12, 24, 48])
      if (H % h !== 0) return null
      const grupos = H / h
      const horizonte = H === 24 ? 'un día completo (24 horas)' : H === 48 ? 'dos días (48 horas)' : '12 horas'
      return {
        enunciado: `Un grifo gotea ${l} litros cada ${h} horas. ¿Cuántos litros gotea en ${horizonte}?`,
        pista: `¿Cuántas veces cabe un periodo de ${h} horas en ${H} horas?`,
        correcta: ok(`${grupos * l} litros`),
        incorrectas: [
          mal(
            `${dec((l * h) / H)} litros`,
            'proporcion',
            'Invertiste la relación. En más tiempo cae más agua, no menos.',
          ),
          mal(
            `${l * H} litros`,
            'proporcion',
            `Multiplicaste ${l} × ${H} y olvidaste que esos ${l} litros corresponden a ${h} horas, no a 1.`,
          ),
          mal(
            `${grupos} litros`,
            'incompleta',
            `Calculaste cuántos grupos de ${h} horas hay, pero faltó multiplicar por ${l} litros.`,
          ),
        ],
        explicacion: `${H} ÷ ${h} = ${grupos} grupos de ${h} horas. ${grupos} × ${l} = ${grupos * l} litros.`,
      }
    },
  },
  {
    id: 'prop-receta',
    tipo: 'proporcion',
    generar(r) {
      const ing = elige(r, ['arroz', 'harina', 'lentejas', 'pasta'])
      const p1 = elige(r, [4, 6, 8])
      const p2 = p1 + elige(r, [2, 4, 6, 8])
      const pp = elige(r, [50, 60, 75, 80, 100])
      const cant1 = pp * p1
      return {
        enunciado: `Una receta para ${p1} personas usa ${miles(cant1)} g de ${ing}. ¿Cuántos gramos se necesitan para ${p2} personas?`,
        pista: 'Calcula primero cuántos gramos corresponden a una persona.',
        correcta: ok(`${miles(pp * p2)} g`),
        incorrectas: [
          mal(
            `${miles(Math.round((cant1 * p1) / p2))} g`,
            'proporcion',
            `Invertiste la regla de tres: para más personas necesitas más ${ing}, no menos.`,
          ),
          mal(
            `${miles(cant1 + (p2 - p1))} g`,
            'proporcion',
            `Sumaste la diferencia de personas (${p2 - p1}) a los gramos en lugar de escalar la cantidad.`,
          ),
          mal(
            `${miles(cant1 * p2)} g`,
            'proporcion',
            `Multiplicaste ${miles(cant1)} × ${p2} sin dividir entre las ${p1} personas de la receta.`,
          ),
        ],
        explicacion: `Por persona: ${miles(cant1)} ÷ ${p1} = ${pp} g. Para ${p2}: ${pp} × ${p2} = ${miles(pp * p2)} g.`,
      }
    },
  },
  {
    id: 'prop-maquinas',
    tipo: 'proporcion',
    generar(r) {
      const m1 = elige(r, [2, 3, 4, 5])
      const q = elige(r, [10, 20, 30, 40])
      const m2 = m1 + ent(r, 1, 4)
      const h2 = elige(r, [2, 3, 4])
      const n = m1 * q
      return {
        enunciado: `${m1} máquinas iguales hacen ${n} piezas en 1 hora. ¿Cuántas piezas harán ${m2} máquinas en ${h2} horas?`,
        pista: 'Averigua cuántas piezas hace una sola máquina en una hora.',
        correcta: ok(`${miles(m2 * q * h2)} piezas`),
        incorrectas: [
          mal(
            `${miles(q * m2)} piezas`,
            'incompleta',
            `Calculaste las piezas de ${m2} máquinas en 1 hora, pero olvidaste las ${h2} horas.`,
          ),
          mal(
            `${miles(n * h2)} piezas`,
            'incompleta',
            `Usaste las ${h2} horas, pero no ajustaste de ${m1} a ${m2} máquinas.`,
          ),
          mal(
            `${miles(n * m2 * h2)} piezas`,
            'proporcion',
            `Multiplicaste todo sin dividir entre las ${m1} máquinas de la primera cifra.`,
          ),
        ],
        explicacion: `Una máquina hace ${n} ÷ ${m1} = ${q} piezas por hora. ${m2} máquinas × ${q} × ${h2} horas = ${miles(m2 * q * h2)} piezas.`,
      }
    },
  },
  {
    id: 'prop-bus',
    tipo: 'proporcion',
    transferencia: true,
    generar(r) {
      const [v1, t1, v2] = elige(r, [[60, 3, 90], [60, 4, 80], [40, 3, 60], [80, 3, 120], [50, 4, 100], [60, 2, 120], [90, 4, 120]])
      const d = v1 * t1
      const t2 = d / v2
      if (!Number.isInteger(t2)) return null
      return {
        enunciado: `Un bus va a ${v1} km/h y tarda ${t1} horas en llegar a su destino. Si arreglan la vía y puede ir a ${v2} km/h, ¿cuánto tarda?`,
        pista: 'Primero averigua qué distancia recorre el bus.',
        correcta: ok(`${t2} ${t2 === 1 ? 'hora' : 'horas'}`),
        incorrectas: [
          mal(
            `${dec((t1 * v2) / v1)} horas`,
            'proporcion',
            'Lo trataste como directa. Con más velocidad el tiempo baja, no sube.',
          ),
          mal(
            `${dec(v2 / v1)} horas`,
            'proporcion',
            `Dividiste ${v2} ÷ ${v1}, que dice cuántas veces más rápido va, pero no lo usaste para repartir el tiempo.`,
          ),
          mal(`${t1} horas`, 'lectura', 'No tuviste en cuenta el dato de la nueva velocidad.'),
        ],
        explicacion: `Distancia: ${v1} × ${t1} = ${d} km. Tiempo nuevo: ${d} ÷ ${v2} = ${t2} ${t2 === 1 ? 'hora' : 'horas'}.`,
      }
    },
  },
  {
    id: 'prop-impresoras',
    tipo: 'proporcion',
    transferencia: true,
    generar(r) {
      const a = elige(r, [3, 4, 5, 6])
      const k = elige(r, [2, 3])
      const m = elige(r, [5, 6, 8, 10])
      const total = a * k * m
      return {
        enunciado: `Una impresora imprime ${a} páginas por minuto. Tienes un trabajo de ${total} páginas y puedes usar ${k} impresoras iguales a la vez. ¿Cuántos minutos tardan en terminarlo?`,
        pista: 'Calcula cuántas páginas imprimen todas las impresoras juntas en un minuto.',
        correcta: ok(`${m} minutos`),
        incorrectas: [
          mal(
            `${total / a} minutos`,
            'proporcion',
            `Calculaste el tiempo con una sola impresora. Con ${k} trabajando a la vez, tardan menos.`,
          ),
          mal(
            `${(total * k) / a} minutos`,
            'proporcion',
            `Multiplicaste por ${k} en lugar de dividir: más impresoras significa menos tiempo.`,
          ),
          mal(
            `${a * k} minutos`,
            'incompleta',
            `Calculaste cuántas páginas imprimen las ${k} impresoras en un minuto (${a * k}), pero faltó dividir el trabajo total entre esa cifra.`,
          ),
        ],
        explicacion: `Juntas imprimen ${a} × ${k} = ${a * k} páginas por minuto. ${total} ÷ ${a * k} = ${m} minutos.`,
      }
    },
  },

  // =====================================================================
  // CONVERSIÓN DE UNIDADES O TIEMPO
  // =====================================================================
  {
    id: 'conv-pelicula',
    tipo: 'conversion',
    generar(r) {
      const h0 = ent(r, 5, 8)
      const m0 = elige(r, [35, 40, 45, 50, 55])
      const dh = elige(r, [1, 2])
      const dm = elige(r, [20, 25, 30, 35, 40, 45, 50])
      if (m0 + dm < 60) return null
      const fmt = (min) => `${Math.floor(min / 60)}:${pad2(min % 60)} p. m.`
      const inicio = h0 * 60 + m0
      const fin = inicio + dh * 60 + dm
      return {
        enunciado: `Una película dura ${dh} h ${dm} min y empieza a las ${h0}:${pad2(m0)} p. m. ¿A qué hora termina?`,
        pista: 'Suma primero las horas y luego los minutos. Al pasar de 60 minutos, pasas a la siguiente hora.',
        correcta: ok(fmt(fin)),
        incorrectas: [
          mal(
            `${h0 + dh}:${m0 + dm} p. m.`,
            'conversion',
            `Sumaste ${m0} + ${dm} = ${m0 + dm} minutos sin pasar a la siguiente hora. 60 minutos hacen una hora.`,
          ),
          mal(fmt(inicio + dm), 'incompleta', `Sumaste solo los ${dm} minutos.`),
          mal(
            fmt(inicio + dh * 60),
            'incompleta',
            `Sumaste ${dh === 1 ? 'la hora' : 'las horas'} pero olvidaste los ${dm} minutos.`,
          ),
        ],
        explicacion: `${h0}:${pad2(m0)} + ${dh} h = ${h0 + dh}:${pad2(m0)}. Luego + ${dm} min = ${fmt(fin)}.`,
      }
    },
  },
  {
    id: 'conv-cinta',
    tipo: 'conversion',
    generar(r) {
      const L = elige(r, [1.2, 1.8, 2.4, 3, 3.6, 4.5])
      const trozo = elige(r, [20, 30, 40, 45, 60])
      const cm = Math.round(L * 100)
      if (cm % trozo !== 0) return null
      return {
        enunciado: `Una cinta mide ${dec(L)} metros. Se cortan trozos de ${trozo} centímetros. ¿Cuántos trozos salen?`,
        pista: 'Lleva los metros a centímetros antes de dividir.',
        correcta: ok(`${cm / trozo} trozos`),
        incorrectas: [
          mal(
            `${dec(L / trozo)} trozos`,
            'conversion',
            `Dividiste ${dec(L)} entre ${trozo} sin pasar las dos medidas a la misma unidad.`,
          ),
          mal(
            `${dec(L * trozo)} trozos`,
            'conversion',
            `Multiplicaste ${dec(L)} × ${trozo}. Metros y centímetros no se operan directo.`,
          ),
          mal(
            `${miles((cm * 10) / trozo)} trozos`,
            'conversion',
            `Convertiste ${dec(L)} m en ${miles(cm * 10)} cm. Un metro tiene 100 cm, así que son ${cm} cm.`,
          ),
        ],
        explicacion: `${dec(L)} m = ${cm} cm. ${cm} ÷ ${trozo} = ${cm / trozo} trozos.`,
      }
    },
  },
  {
    id: 'conv-harina',
    tipo: 'conversion',
    generar(r) {
      const kg = elige(r, [0.5, 0.75, 1.2, 1.5, 2.5])
      const taza = elige(r, [100, 125, 150, 200, 250, 300])
      const ing = elige(r, ['harina', 'azúcar', 'arroz', 'avena'])
      const g = Math.round(kg * 1000)
      if (g % taza !== 0) return null
      const mult = kg * taza
      return {
        enunciado: `Una receta pide ${dec(kg)} kg de ${ing} y tu taza llena mide ${taza} g. ¿Cuántas tazas llenas necesitas?`,
        pista: `¿Cuántos gramos son ${dec(kg)} kg?`,
        correcta: ok(`${g / taza} tazas`),
        incorrectas: [
          mal(
            `${dec(kg / taza)} tazas`,
            'conversion',
            `Dividiste ${dec(kg)} entre ${taza} sin convertir kilos a gramos.`,
          ),
          mal(
            Number.isInteger(mult) ? `${mult} tazas` : `Cerca de ${Math.round(mult)} tazas`,
            'conversion',
            `Multiplicaste ${dec(kg)} × ${taza}. Unidades distintas no se operan así.`,
          ),
          mal(
            `${miles(g)} tazas`,
            'incompleta',
            `Convertiste a gramos (${miles(g)} g) pero faltó dividir entre los ${taza} g de cada taza.`,
          ),
        ],
        explicacion: `${dec(kg)} kg = ${miles(g)} g. ${miles(g)} ÷ ${taza} = ${g / taza} tazas.`,
      }
    },
  },
  {
    id: 'conv-velocidad',
    tipo: 'conversion',
    generar(r) {
      const v = elige(r, [48, 60, 72, 80, 100])
      const [h, m] = elige(r, [[1, 30], [2, 30], [1, 15]])
      const dur = h + m / 60
      const D = v * dur
      if (!Number.isInteger(D)) return null
      const mal1 = D / (h + m / 100)
      const mal2 = D / (h + 1)
      const aprox = (x) => (Number.isInteger(x) ? `${x} km/h` : `Aproximadamente ${Math.round(x)} km/h`)
      return {
        enunciado: `Un carro recorre ${D} km en ${h} ${h === 1 ? 'hora' : 'horas'} y ${m} minutos. ¿A qué velocidad promedio viajó, en km/h?`,
        pista: `Pasa ${h} h ${m} min a horas antes de dividir.`,
        correcta: ok(`${v} km/h`),
        incorrectas: [
          mal(
            aprox(mal1),
            'conversion',
            `Leíste ${h} h ${m} min como ${h},${m} horas. ${m} minutos no son 0,${m} horas.`,
          ),
          mal(aprox(mal2), 'conversion', `Redondeaste ${h} h ${m} min a ${h + 1} horas.`),
          mal(`${D} km/h`, 'incompleta', 'Dejaste la distancia sin dividir entre el tiempo.'),
        ],
        explicacion: `${m} min = ${dec(m / 60)} h, así que ${h} h ${m} min = ${dec(dur)} h. Velocidad = ${D} ÷ ${dec(dur)} = ${v} km/h.`,
      }
    },
  },
  {
    id: 'conv-vasos',
    tipo: 'conversion',
    generar(r) {
      const L = elige(r, [1.5, 2, 2.5, 3, 4.5])
      const vaso = elige(r, [150, 200, 250, 300])
      const beb = elige(r, ['jugo', 'limonada', 'leche', 'agua'])
      const ml = Math.round(L * 1000)
      if (ml % vaso !== 0) return null
      return {
        enunciado: `Un recipiente tiene ${dec(L)} litros de ${beb}. Si cada vaso se llena con ${vaso} mililitros, ¿cuántos vasos se pueden servir?`,
        pista: `Pasa los ${dec(L)} litros a mililitros.`,
        correcta: ok(`${ml / vaso} vasos`),
        incorrectas: [
          mal(
            `${dec((L * 100) / vaso)} vasos`,
            'conversion',
            'Convertiste mal: 1 litro son 1.000 ml, no 100 ml.',
          ),
          mal(
            `${miles(L * vaso)} vasos`,
            'conversion',
            `Multiplicaste ${dec(L)} × ${vaso}. Litros y mililitros no se operan directo.`,
          ),
          mal(
            `${dec(L)} vasos`,
            'incompleta',
            'Dejaste la cantidad en litros sin dividirla entre el tamaño del vaso.',
          ),
        ],
        explicacion: `${dec(L)} L = ${miles(ml)} ml. ${miles(ml)} ÷ ${vaso} = ${ml / vaso} vasos.`,
      }
    },
  },
  {
    id: 'conv-datos',
    tipo: 'conversion',
    transferencia: true,
    generar(r) {
      const G = elige(r, [1, 2, 3, 5])
      const n = elige(r, [3, 4, 5, 6, 8])
      const s = elige(r, [250, 300, 350, 400, 450, 500, 600])
      const uso = n * s
      const resto = G * 1000 - uso
      if (resto <= 0) return null
      return {
        enunciado: `Tu plan tiene ${G} GB de datos. Descargas ${n} videos de ${s} MB cada uno (1 GB = 1.000 MB). ¿Te alcanza el plan?`,
        pista: `Lleva los ${G} GB a MB, o los MB a GB, antes de comparar.`,
        correcta: ok(`Sí: usas ${miles(uso)} MB y te quedan ${miles(resto)} MB`),
        incorrectas: [
          mal(`No: ${miles(uso)} es mayor que ${G}`, 'conversion', 'Comparaste megas con gigas sin convertir.'),
          mal(
            `Sí: te quedan ${dec(resto / 1000)} MB`,
            'conversion',
            `Restaste en gigas (${G} − ${dec(uso / 1000)} = ${dec(resto / 1000)}) pero lo leíste como megas. Son ${dec(resto / 1000)} GB, o sea ${miles(resto)} MB.`,
          ),
          mal(`No: necesitas ${miles(uso)} GB`, 'conversion', 'Dejaste el resultado en GB cuando eran megas.'),
        ],
        explicacion: `${n} × ${s} = ${miles(uso)} MB. ${G} GB = ${miles(G * 1000)} MB. Te quedan ${miles(resto)} MB.`,
      }
    },
  },
  {
    id: 'conv-serie',
    tipo: 'conversion',
    transferencia: true,
    generar(r) {
      const n = elige(r, [4, 5, 6, 8])
      const m = elige(r, [35, 40, 45, 50, 55])
      const total = n * m
      const h = Math.floor(total / 60)
      const rest = total % 60
      if (rest < 10 || h < 1) return null
      return {
        enunciado: `Una serie tiene ${n} episodios de ${m} minutos cada uno. Si la ves completa, ¿cuánto tiempo dedicas en total?`,
        pista: 'Calcula los minutos totales y conviértelos a horas y minutos. Una hora tiene 60 minutos.',
        correcta: ok(`${h} h ${rest} min`),
        incorrectas: [
          mal(
            `${Math.floor(total / 100)} h ${total % 100} min`,
            'conversion',
            'Dividiste los minutos entre 100 en lugar de entre 60.',
          ),
          mal(`${total} horas`, 'conversion', `Dejaste los ${total} minutos como si fueran horas.`),
          mal(
            `${h},${rest} horas`,
            'conversion',
            `Pusiste los minutos sobrantes como decimales de hora. ${rest} minutos no son 0,${rest} horas.`,
          ),
        ],
        explicacion: `${n} × ${m} = ${total} min. ${total} ÷ 60 = ${h} h y sobran ${rest} min: ${h} h ${rest} min.`,
      }
    },
  },

  // =====================================================================
  // LECTURA DE DATOS
  // =====================================================================
  {
    id: 'lec-votos',
    tipo: 'lectura',
    generar(r) {
      const sabores = barajar(r, ['Fresa', 'Mango', 'Limón', 'Mora', 'Coco', 'Maracuyá']).slice(0, 3)
      const dias = ['Lunes', 'Martes', 'Miércoles']
      const votos = sabores.map(() => dias.map(() => ent(r, 6, 25)))
      const totales = votos.map((fila) => fila.reduce((a, b) => a + b, 0))
      if (new Set(totales).size < 3) return null
      const orden = [0, 1, 2].sort((a, b) => totales[b] - totales[a])
      const [W, R] = orden
      const maxCelda = Math.max(...votos.flat())
      const M = votos.findIndex((fila) => fila.includes(maxCelda))
      const ultimo = votos.map((fila) => fila[2])
      const L = ultimo.indexOf(Math.max(...ultimo))
      if (M === W || L === W) return null
      return {
        enunciado: 'La tabla muestra los votos por sabor en tres días. ¿Qué sabor tuvo más votos en total?',
        tabla: {
          encabezados: ['Sabor', ...dias],
          filas: sabores.map((s, i) => [s, ...votos[i].map(String)]),
        },
        pista: 'Suma cada fila antes de comparar.',
        correcta: ok(`${sabores[W]}, con ${totales[W]} votos`),
        incorrectas: [
          mal(
            `${sabores[M]}, con ${maxCelda} votos`,
            'lectura',
            'Tomaste el dato más alto de una sola celda. Piden el total de los tres días.',
          ),
          mal(
            `${sabores[L]}, porque ganó el ${dias[2].toLowerCase()}`,
            'lectura',
            'Miraste un solo día. Piden el total.',
          ),
          mal(
            `${sabores[R]}, con ${totales[R]} votos`,
            'incompleta',
            `Sumaste bien ${sabores[R]}, pero no calculaste los totales de los otros sabores para comparar.`,
          ),
        ],
        explicacion: `${sabores.map((s, i) => `${s}: ${totales[i]}`).join('. ')}. Gana ${sabores[W]}.`,
      }
    },
  },
  {
    id: 'lec-precios',
    tipo: 'lectura',
    generar(r) {
      const catalogo = [['Papa', 3000], ['Cebolla', 2500], ['Tomate', 4000], ['Zanahoria', 2000], ['Yuca', 1800], ['Plátano', 2800]]
      const orden = barajar(r, catalogo).slice(0, 3)
      const [P1, P2, P3] = orden
      const k1 = elige(r, [2, 3])
      const k2 = elige(r, [1, 2])
      const total = k1 * P1[1] + k2 * P2[1]
      return {
        enunciado: `Con los precios de la tabla, compras ${k1} kg de ${P1[0].toLowerCase()} y ${k2} kg de ${P2[0].toLowerCase()}. ¿Cuánto pagas?`,
        tabla: {
          encabezados: ['Producto', 'Precio por kg'],
          filas: orden.map(([nombre, precio]) => [nombre, pesos(precio)]),
        },
        pista: 'Subraya qué productos compras y cuántos kilos de cada uno.',
        correcta: ok(pesos(total)),
        incorrectas: [
          mal(
            pesos(P1[1] + P2[1] + P3[1]),
            'lectura',
            `Sumaste un kilo de cada producto, incluido ${P3[0].toLowerCase()}, que no compraste.`,
          ),
          mal(
            pesos(k1 * P1[1] + k2 * P3[1]),
            'lectura',
            `Usaste ${P3[0].toLowerCase()} en lugar de ${P2[0].toLowerCase()}.`,
          ),
          mal(
            pesos(P1[1] + k2 * P2[1]),
            'lectura',
            `Contaste solo 1 kg de ${P1[0].toLowerCase()}. Son ${k1} kg.`,
          ),
        ],
        explicacion: `${P1[0]}: ${k1} × ${pesos(P1[1])} = ${pesos(k1 * P1[1])}. ${P2[0]}: ${k2} × ${pesos(P2[1])} = ${pesos(k2 * P2[1])}. Total: ${pesos(total)}.`,
      }
    },
  },
  {
    id: 'lec-dato-sobrante',
    tipo: 'lectura',
    generar(r) {
      const [nombre, pariente] = elige(r, [['Carlos', 'su hermana'], ['Camila', 'su hermano'], ['Mateo', 'su prima'], ['Valentina', 'su primo']])
      const obj = elige(r, ['lápices', 'stickers', 'canicas', 'tarjetas'])
      const c = elige(r, [2, 3, 4, 5])
      const n = elige(r, [10, 12, 15, 20])
      const regala = elige(r, [5, 6, 8, 9, 10])
      const h = elige(r, [15, 18, 20, 25, 30])
      const tiene = c * n
      if (h - regala < 1) return null
      return {
        enunciado: `${nombre} tiene ${c} cajas con ${n} ${obj} cada una y regala ${regala}. ${pariente.charAt(0).toUpperCase() + pariente.slice(1)} tiene ${h} ${obj}. ¿Cuántos ${obj} le quedan a ${nombre}?`,
        pista: 'Hay un dato que no sirve para esta pregunta. ¿Cuál es?',
        correcta: ok(`${tiene - regala} ${obj}`),
        incorrectas: [
          mal(
            `${h - regala} ${obj}`,
            'lectura',
            `Usaste los ${h} ${obj} de ${pariente}. La pregunta es por ${nombre}.`,
          ),
          mal(
            `${tiene + h} ${obj}`,
            'lectura',
            `Sumaste los ${obj} de ${nombre} y los de ${pariente}.`,
          ),
          mal(
            `${tiene} ${obj}`,
            'incompleta',
            `Calculaste cuántos tenía, pero olvidaste restar los ${regala} que regaló.`,
          ),
        ],
        explicacion: `${c} × ${n} = ${tiene}. ${tiene} − ${regala} = ${tiene - regala}.`,
      }
    },
  },
  {
    id: 'lec-trimestre',
    tipo: 'lectura',
    generar(r) {
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril']
      const v = meses.map(() => ent(r, 8, 18) * 10)
      if (new Set(v).size < 4) return null
      const suma3 = v[0] + v[1] + v[2]
      return {
        enunciado: `La tabla muestra las unidades que vendió una tienda cada mes. ¿Cuántas unidades vendió en los tres primeros meses de la tabla (${meses[0].toLowerCase()}, ${meses[1].toLowerCase()} y ${meses[2].toLowerCase()})?`,
        tabla: {
          encabezados: ['Mes', 'Unidades'],
          filas: meses.map((m, i) => [m, String(v[i])]),
        },
        pista: 'Fíjate en qué meses piden y suma solo esos.',
        correcta: ok(`${suma3} unidades`),
        incorrectas: [
          mal(
            `${suma3 + v[3]} unidades`,
            'lectura',
            `Incluiste ${meses[3].toLowerCase()}, que no hace parte de los tres meses pedidos.`,
          ),
          mal(
            `${v[0] + v[1]} unidades`,
            'incompleta',
            `Sumaste solo ${meses[0].toLowerCase()} y ${meses[1].toLowerCase()}.`,
          ),
          mal(
            `${v[1] + v[2] + v[3]} unidades`,
            'lectura',
            `Tomaste ${meses[3].toLowerCase()} en lugar de ${meses[0].toLowerCase()}.`,
          ),
        ],
        explicacion: `${meses[0]} + ${meses[1]} + ${meses[2]} = ${v[0]} + ${v[1]} + ${v[2]} = ${suma3}.`,
      }
    },
  },
  {
    id: 'lec-planes',
    tipo: 'lectura',
    generar(r) {
      const gbs = [5, 8, 10, 15, 20, 25, 30, 40]
      const us = [1000, 1200, 1500, 1800, 2000, 2500, 3000]
      const nombres = ['A', 'B', 'C']
      const planes = nombres.map((n) => {
        const gb = elige(r, gbs)
        const u = elige(r, us)
        return { n, gb, u, precio: gb * u }
      })
      if (new Set(planes.map((p) => p.u)).size < 3 || new Set(planes.map((p) => p.gb)).size < 3) return null
      const porUnidad = [...planes].sort((a, b) => a.u - b.u)
      const mejor = porUnidad[0]
      const segundo = porUnidad[1]
      const baratoTotal = [...planes].sort((a, b) => a.precio - b.precio)[0]
      if (new Set(planes.map((p) => p.precio)).size < 3 || baratoTotal.n === mejor.n) return null
      return {
        enunciado: 'Una empresa ofrece tres planes de datos móviles. ¿Cuál plan cuesta menos por cada GB?',
        tabla: {
          encabezados: ['Plan', 'Precio mensual', 'Datos'],
          filas: planes.map((p) => [p.n, pesos(p.precio), `${p.gb} GB`]),
        },
        pista: 'Divide el precio de cada plan entre sus GB.',
        correcta: ok(`El plan ${mejor.n}`),
        incorrectas: [
          mal(
            `El plan ${baratoTotal.n}, porque es el más barato`,
            'lectura',
            'Respondiste cuál es el más barato en total, no cuál cuesta menos por GB.',
          ),
          mal(
            `El plan ${segundo.n}, porque da más GB que el más barato`,
            'incompleta',
            'No calculaste el precio por GB de los tres planes antes de comparar.',
          ),
          mal(
            'Los tres cuestan lo mismo por GB',
            'proporcion',
            'Asumiste que el precio crece en proporción directa con los GB, pero no es así.',
          ),
        ],
        explicacion: `${planes.map((p) => `Plan ${p.n}: ${pesos(p.precio)} ÷ ${p.gb} = ${pesos(p.u)} por GB`).join('. ')}. El más barato por GB es el plan ${mejor.n}.`,
      }
    },
  },
  {
    id: 'lec-cuotas',
    tipo: 'lectura',
    transferencia: true,
    generar(r) {
      const i = elige(r, [100000, 150000, 200000, 250000])
      const k = elige(r, [6, 8, 10, 12])
      const c = elige(r, [60000, 75000, 80000, 90000, 100000, 120000])
      const total = i + k * c
      return {
        enunciado: `Compras un celular a cuotas: cuota inicial de ${pesos(i)} y ${k} cuotas mensuales de ${pesos(c)}. ¿Cuánto pagas en total?`,
        pista: '¿Cuántas veces se paga la inicial y cuántas veces la cuota?',
        correcta: ok(pesos(total)),
        incorrectas: [
          mal(pesos(k * c), 'incompleta', `Calculaste las ${k} cuotas pero olvidaste la cuota inicial.`),
          mal(pesos(i + c), 'lectura', `Sumaste la inicial y una sola cuota. Son ${k} cuotas.`),
          mal(
            pesos((i + c) * k),
            'lectura',
            'Sumaste la inicial a cada cuota. La inicial se paga una sola vez.',
          ),
        ],
        explicacion: `${k} × ${pesos(c)} = ${pesos(k * c)}. Más la inicial de ${pesos(i)}: ${pesos(total)}.`,
      }
    },
  },
  {
    id: 'lec-plan-anual',
    tipo: 'lectura',
    transferencia: true,
    generar(r) {
      const x = elige(r, [12000, 15000, 18000, 20000, 25000])
      const s = elige(r, [2000, 3000, 4000, 5000])
      const anual = 12 * (x - s)
      return {
        enunciado: `Una app cuesta ${pesos(x)} al mes o ${pesos(anual)} por todo el año. ¿Cuánto te ahorras en un año si pagas el plan anual?`,
        pista: 'Compara lo que pagarías mes a mes durante un año con el precio del plan anual.',
        correcta: ok(pesos(12 * s)),
        incorrectas: [
          mal(
            pesos(12 * x),
            'incompleta',
            'Calculaste cuánto pagarías mes a mes en un año, pero faltó restar lo que cuesta el plan anual.',
          ),
          mal(
            pesos(anual),
            'lectura',
            'Diste el precio del plan anual. La pregunta es cuánto te ahorras.',
          ),
          mal(
            pesos(s),
            'incompleta',
            'Calculaste cuánto ahorras por mes, pero piden el ahorro de todo el año.',
          ),
        ],
        explicacion: `Mes a mes: 12 × ${pesos(x)} = ${pesos(12 * x)}. Plan anual: ${pesos(anual)}. Ahorro: ${pesos(12 * x)} − ${pesos(anual)} = ${pesos(12 * s)}.`,
      }
    },
  },

  // =====================================================================
  // OPERACIÓN INCOMPLETA
  // =====================================================================
  {
    id: 'inc-vuelto',
    tipo: 'incompleta',
    generar(r) {
      const [obj, cadaUna, nombre] = elige(r, [['camisetas', 'cada una', 'Pedro'], ['gorras', 'cada una', 'Laura'], ['libros', 'cada uno', 'Andrés'], ['balones', 'cada uno', 'Sofía']])
      const n = elige(r, [3, 4, 5, 6])
      const precio = elige(r, [12000, 15000, 18000, 25000, 35000])
      const billete = elige(r, [100000, 200000])
      const total = n * precio
      if (total >= billete) return null
      return {
        enunciado: `${nombre} compra ${n} ${obj} de ${pesos(precio)} ${cadaUna} y paga con ${pesos(billete)}. ¿Cuánto le devuelven?`,
        pista: 'Son dos pasos: primero el total de la compra, luego el vuelto.',
        correcta: ok(pesos(billete - total)),
        incorrectas: [
          mal(
            pesos(total),
            'incompleta',
            `Calculaste lo que cuestan los ${obj}, pero faltó el último paso: restarlo de ${pesos(billete)}.`,
          ),
          mal(
            pesos(billete - precio),
            'lectura',
            `Restaste el precio de un solo elemento. Compró ${n}.`,
          ),
          mal(
            pesos(billete + total),
            'incompleta',
            'Sumaste en lugar de restar. El vuelto es lo que sobra del billete.',
          ),
        ],
        explicacion: `${n} × ${pesos(precio)} = ${pesos(total)}. ${pesos(billete)} − ${pesos(total)} = ${pesos(billete - total)}.`,
      }
    },
  },
  {
    id: 'inc-filtros',
    tipo: 'incompleta',
    generar(r) {
      const f = elige(r, [2, 3, 4, 5])
      const l = elige(r, [200, 300, 400, 500, 600])
      const h = elige(r, [2, 3, 4])
      const res = f * l * h
      return {
        enunciado: `Una piscina tiene ${f} filtros. Cada filtro limpia ${l} litros por hora. ¿Cuántos litros limpian los filtros en ${h} horas?`,
        pista: 'Cuenta cuántos factores intervienen: filtros, litros por hora y horas.',
        correcta: ok(`${miles(res)} litros`),
        incorrectas: [
          mal(`${miles(l * h)} litros`, 'incompleta', `Multiplicaste ${l} × ${h} pero olvidaste los ${f} filtros.`),
          mal(`${miles(l * f)} litros`, 'incompleta', `Multiplicaste ${l} × ${f} pero olvidaste las ${h} horas.`),
          mal(`${miles(l)} litros`, 'lectura', 'Tomaste solo un filtro durante una hora.'),
        ],
        explicacion: `${l} × ${f} filtros = ${miles(l * f)} L por hora. Por ${h} horas: ${miles(res)} L.`,
      }
    },
  },
  {
    id: 'inc-taxi',
    tipo: 'incompleta',
    generar(r) {
      const b = elige(r, [3000, 4000, 5000])
      const t = elige(r, [1000, 1200, 1500, 1800, 2000])
      const km = elige(r, [4, 5, 6, 7, 8, 10])
      const res = b + t * km
      return {
        enunciado: `Un taxi cobra ${pesos(b)} de banderazo y ${pesos(t)} por cada kilómetro. ¿Cuánto cuesta un viaje de ${km} km?`,
        pista: '¿Qué se paga una sola vez y qué se paga por cada kilómetro?',
        correcta: ok(pesos(res)),
        incorrectas: [
          mal(pesos(t * km), 'incompleta', 'Calculaste los kilómetros pero olvidaste el banderazo.'),
          mal(pesos((b + t) * km), 'proporcion', 'Cobraste el banderazo en cada kilómetro. Se paga una sola vez.'),
          mal(pesos(b + t), 'incompleta', `Sumaste el banderazo y un solo kilómetro. Son ${km}.`),
        ],
        explicacion: `${km} × ${pesos(t)} = ${pesos(t * km)}. Más el banderazo de ${pesos(b)}: ${pesos(res)}.`,
      }
    },
  },
  {
    id: 'inc-compra-mixta',
    tipo: 'incompleta',
    generar(r) {
      const nombre = elige(r, ['Ana', 'Luis', 'Marta', 'Camilo'])
      const n1 = elige(r, [2, 3, 4, 5])
      const p1 = elige(r, [3500, 4000, 4500, 5000])
      const n2 = elige(r, [2, 3, 4])
      const p2 = elige(r, [800, 1000, 1200, 1500])
      const billete = elige(r, [20000, 30000, 50000])
      const total = n1 * p1 + n2 * p2
      if (total >= billete) return null
      return {
        enunciado: `${nombre} compra ${n1} cuadernos de ${pesos(p1)} cada uno y ${n2} lápices de ${pesos(p2)} cada uno. Paga con ${pesos(billete)}. ¿Cuánto dinero le devuelven?`,
        pista: 'Calcula cuánto cuestan los cuadernos, cuánto los lápices, y solo al final el vuelto.',
        correcta: ok(pesos(billete - total)),
        incorrectas: [
          mal(
            pesos(billete - n1 * p1),
            'incompleta',
            'Restaste solo el valor de los cuadernos y olvidaste los lápices.',
          ),
          mal(
            pesos(total),
            'incompleta',
            `Calculaste lo que cuesta la compra, pero no restaste ese total de ${pesos(billete)}.`,
          ),
          mal(
            pesos(billete - p1 - p2),
            'lectura',
            `Tomaste 1 cuaderno y 1 lápiz en lugar de ${n1} y ${n2}.`,
          ),
        ],
        explicacion: `Cuadernos: ${n1} × ${pesos(p1)} = ${pesos(n1 * p1)}. Lápices: ${n2} × ${pesos(p2)} = ${pesos(n2 * p2)}. Total: ${pesos(total)}. Vuelto: ${pesos(billete)} − ${pesos(total)} = ${pesos(billete - total)}.`,
      }
    },
  },
  {
    id: 'inc-libro',
    tipo: 'incompleta',
    generar(r) {
      const nombre = elige(r, ['Camila', 'Daniel', 'Sara', 'Julián'])
      const v = elige(r, [15, 20, 24, 25, 30])
      const q = elige(r, [2, 3, 4])
      const d = elige(r, [4, 5, 6, 8, 10])
      const leidas = v * q
      const T = leidas + v * d
      return {
        enunciado: `${nombre} lee ${v} páginas por día. Ya leyó ${leidas} páginas de un libro de ${T}. ¿Cuántos días más necesita para terminarlo?`,
        pista: 'Primero averigua cuántas páginas le faltan.',
        correcta: ok(`${d} días`),
        incorrectas: [
          mal(
            `${dec(T / v)} días`,
            'incompleta',
            `Dividiste las ${T} páginas del libro entre ${v}, sin descontar lo que ya leyó.`,
          ),
          mal(
            `${q} días`,
            'lectura',
            `Usaste las ${leidas} páginas que ya leyó en lugar de las que le faltan.`,
          ),
          mal(
            `${T - leidas} páginas`,
            'incompleta',
            'Calculaste cuántas páginas le faltan, pero piden días.',
          ),
        ],
        explicacion: `Le faltan ${T} − ${leidas} = ${T - leidas} páginas. ${T - leidas} ÷ ${v} = ${d} días.`,
      }
    },
  },
  {
    id: 'inc-ahorro',
    tipo: 'incompleta',
    transferencia: true,
    generar(r) {
      const a = elige(r, [10000, 15000, 20000, 25000])
      const y = elige(r, [20000, 30000, 40000, 50000])
      const w = elige(r, [4, 5, 6, 7, 8])
      const obj = elige(r, ['unos audífonos', 'una bicicleta', 'una tablet', 'unos tenis'])
      const P = y + a * w
      const aprox = (x) => (Number.isInteger(x) ? `${x} semanas` : `Cerca de ${Math.round(x)} semanas`)
      return {
        enunciado: `Ahorras ${pesos(a)} por semana y ya tienes ${pesos(y)}. Quieres comprar ${obj} de ${pesos(P)}. ¿Cuántas semanas más debes ahorrar?`,
        pista: 'Primero averigua cuánto dinero te falta.',
        correcta: ok(`${w} semanas`),
        incorrectas: [
          mal(
            aprox(P / a),
            'incompleta',
            `Dividiste el precio completo entre ${pesos(a)}, sin descontar lo que ya tienes.`,
          ),
          mal(
            aprox(y / a),
            'lectura',
            `Usaste los ${pesos(y)} que ya tienes en lugar de lo que te falta.`,
          ),
          mal(pesos(P - y), 'incompleta', 'Calculaste lo que te falta en pesos, pero piden semanas.'),
        ],
        explicacion: `Faltan ${pesos(P)} − ${pesos(y)} = ${pesos(P - y)}. Y ${pesos(P - y)} ÷ ${pesos(a)} = ${w} semanas.`,
      }
    },
  },
  {
    id: 'inc-bicicleta',
    tipo: 'incompleta',
    transferencia: true,
    generar(r) {
      const i = elige(r, [100000, 150000, 200000])
      const k = elige(r, [6, 8, 10, 12])
      const c = elige(r, [50000, 60000, 70000, 80000, 90000])
      const q = elige(r, [2, 3, 4])
      return {
        enunciado: `Compras una bicicleta con cuota inicial de ${pesos(i)} y ${k} cuotas mensuales de ${pesos(c)}. Ya pagaste la inicial y ${q} cuotas. ¿Cuánto te falta por pagar?`,
        pista: '¿Cuántas cuotas faltan y qué ya está pagado?',
        correcta: ok(pesos((k - q) * c)),
        incorrectas: [
          mal(pesos(k * c), 'incompleta', `Calculaste todas las cuotas sin descontar las ${q} que ya pagaste.`),
          mal(
            pesos((k - q) * c + i),
            'lectura',
            'Sumaste la cuota inicial, pero ya la pagaste.',
          ),
          mal(
            pesos(q * c),
            'lectura',
            'Calculaste lo que ya pagaste en cuotas, no lo que falta.',
          ),
        ],
        explicacion: `Faltan ${k} − ${q} = ${k - q} cuotas. ${k - q} × ${pesos(c)} = ${pesos((k - q) * c)}.`,
      }
    },
  },
]
