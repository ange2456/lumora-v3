// Sincroniza el progreso con la base de datos: lee lo guardado, lo fusiona con lo de este
// dispositivo y sube el resultado si hace falta. `db` es el cliente de Supabase.

import { FORMATO, VERSION, leerProgreso } from '../lib/respaldo.js'
import { fusionar, mismoContenido, paraNube } from '../lib/fusion.js'

export class ErrorNube extends Error {
  constructor(codigo, mensaje) {
    super(mensaje)
    this.codigo = codigo
  }
}

/** Valida un estado (de la nube o local) con las mismas reglas que un archivo importado. */
export function validarEstado(estado) {
  return leerProgreso(JSON.stringify({ formato: FORMATO, version: VERSION, estado }))
}

export async function leerNube(db, uid) {
  const { data, error } = await db.from('saber_progreso').select('estado').eq('user_id', uid).maybeSingle()
  if (error) throw error
  if (!data) return null
  const r = validarEstado(data.estado)
  if (!r.ok) throw new ErrorNube('invalido', `El progreso guardado en tu cuenta no se pudo leer: ${r.error}`)
  return r.estado
}

export async function subirNube(db, uid, estado) {
  const { error } = await db.from('saber_progreso').upsert({ user_id: uid, estado: paraNube(estado) }, { onConflict: 'user_id' })
  if (error) throw error
}

/**
 * Devuelve { estado, cambioLocal, subido }.
 * Si lo guardado en la cuenta es ilegible, NO lo pisa: lanza un error para que la persona decida.
 */
export async function sincronizar({ db, uid, local }) {
  const remoto = await leerNube(db, uid)

  // Si lo local estuviera dañado se descarta antes que arriesgar lo de la nube.
  const localValido = validarEstado(local).ok ? local : null
  let fusion
  if (remoto && localValido) fusion = fusionar(localValido, remoto)
  else if (remoto) fusion = { ...remoto, ...(local.enCurso ? { enCurso: local.enCurso } : {}) }
  else if (localValido) fusion = local
  else throw new ErrorNube('local-invalido', 'El progreso de este dispositivo no es válido y no hay nada guardado en tu cuenta.')

  const comprobada = validarEstado(fusion)
  if (!comprobada.ok) throw new ErrorNube('fusion-invalida', `No se pudo combinar tu progreso: ${comprobada.error}`)

  const subir = !remoto || !mismoContenido(fusion, remoto)
  if (subir) await subirNube(db, uid, fusion)
  return { estado: fusion, cambioLocal: !mismoContenido(fusion, local) || (fusion.competencia ?? null) !== (local.competencia ?? null), subido: subir }
}
