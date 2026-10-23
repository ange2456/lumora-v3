// Utilidades para generar preguntas con números al azar, de forma reproducible.
// La misma semilla produce siempre las mismas preguntas, así el repaso de un intento
// se puede reconstruir sin guardar cada pregunta.

/** Generador pseudoaleatorio mulberry32: devuelve una función que da números en [0, 1). */
export function crearRng(semilla) {
  let a = semilla >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Entero al azar entre a y b, ambos incluidos. */
export const ent = (r, a, b) => a + Math.floor(r() * (b - a + 1))

/** Elemento al azar de una lista. */
export const elige = (r, lista) => lista[Math.floor(r() * lista.length)]

/** Copia de la lista en orden aleatorio. */
export function barajar(r, lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

/** Número con formato colombiano: punto para miles y coma para decimales. */
export function miles(n) {
  const limpio = Number(Number(n).toFixed(4))
  const negativo = limpio < 0
  const [entera, decimal] = String(Math.abs(limpio)).split('.')
  const conPuntos = entera.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  return (negativo ? '-' : '') + conPuntos + (decimal ? ',' + decimal : '')
}

export const pesos = (n) => '$' + miles(n)

/** Igual que miles, pensado para decimales cortos (1,5 · 0,25). */
export const dec = (n) => miles(n)

export const pad2 = (n) => String(n).padStart(2, '0')

/** «25%» si es exacto; «Cerca del 33%» si hubo que redondear. */
export function porcentaje(valor) {
  const redondo = Math.round(valor)
  return Math.abs(valor - redondo) < 1e-9 ? `${redondo}%` : `Cerca del ${redondo}%`
}

/**
 * Convierte una plantilla en una pregunta concreta.
 * La plantilla devuelve { enunciado, tabla?, pista, correcta, incorrectas[3], explicacion }
 * o null si los números sorteados no sirven (se vuelve a sortear).
 */
export function armar(plantilla, r) {
  for (let intento = 0; intento < 80; intento++) {
    const q = plantilla.generar(r)
    if (!q) continue

    const todas = [q.correcta, ...q.incorrectas]
    const textos = todas.map((o) => o.texto)
    const valida =
      q.incorrectas.length === 3 &&
      new Set(textos).size === 4 &&
      textos.every((t) => typeof t === 'string' && t.length > 0 && !/NaN|undefined|Infinity|-\d/.test(t)) &&
      q.incorrectas.every((o) => o.error && o.porque) &&
      !/NaN|undefined|Infinity/.test(q.enunciado + q.explicacion)
    if (!valida) continue

    const orden = barajar(r, todas)
    const letras = ['a', 'b', 'c', 'd']
    return {
      plantilla: plantilla.id,
      tipo: plantilla.tipo,
      transferencia: !!plantilla.transferencia,
      enunciado: q.enunciado,
      texto: q.texto,
      tabla: q.tabla,
      pista: q.pista,
      explicacion: q.explicacion,
      opciones: orden.map((o, i) => ({
        id: letras[i],
        texto: o.texto,
        ...(o === q.correcta ? {} : { error: o.error, porque: o.porque }),
      })),
    }
  }
  throw new Error(`La plantilla ${plantilla.id} no logró generar una pregunta válida`)
}
