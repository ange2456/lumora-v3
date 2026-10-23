// Cuenta del estudiante en Supabase: registro, acceso, perfil y borrado de datos.
// Cada función recibe el cliente `db` para poder probarse sin red.

const msg = (e) => String(e?.message ?? '').toLowerCase()

/** Texto en español para los errores de Supabase Auth. */
export function mensajeDeError(e) {
  const m = msg(e)
  if (m.includes('invalid login credentials') || m.includes('invalid_credentials')) return 'El correo o la contraseña no son correctos.'
  if (m.includes('already registered') || m.includes('user_already_exists')) return 'Ese correo ya tiene una cuenta. Prueba iniciar sesión.'
  if (m.includes('email not confirmed')) return 'Falta confirmar tu correo. Abre el enlace que te enviamos y vuelve a entrar.'
  if (m.includes('password') && (m.includes('6') || m.includes('8') || m.includes('weak') || m.includes('short'))) return 'La contraseña es muy corta o muy débil. Usa al menos 8 caracteres.'
  if (m.includes('valid email') || m.includes('invalid email')) return 'Ese correo no parece válido.'
  if (e?.status === 429 || m.includes('rate limit') || m.includes('too many')) return 'Hubo varios intentos seguidos. Espera un momento y vuelve a probar.'
  if (m.includes('network') || m.includes('fetch') || m.includes('failed to')) return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.'
  return 'No se pudo completar la solicitud. Inténtalo de nuevo en un momento.'
}

export async function registrar(db, d) {
  const { data, error } = await db.auth.signUp({
    email: d.correo.trim().toLowerCase(),
    password: d.clave,
    options: {
      emailRedirectTo: typeof window === 'undefined' ? undefined : window.location.origin,
      data: {
        display_name: d.nombre.trim(),
        requested_role: 'student',
        saber_apodo: d.apodo.trim(),
        saber_prueba: d.prueba,
        saber_institucion: (d.institucion ?? '').trim(),
        saber_ciudad: (d.ciudad ?? '').trim(),
        saber_grado: (d.grado ?? '').trim(),
        saber_acepta: d.acepta ? 'true' : 'false',
      },
    },
  })
  if (error) throw error
  // Con confirmación de correo activa, un correo ya registrado no da error: devuelve un usuario sin identidades.
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw Object.assign(new Error('User already registered'), { status: 422 })
  }
  return { necesitaConfirmar: !data.session }
}

export async function entrar(db, correo, clave) {
  const { error } = await db.auth.signInWithPassword({ email: correo.trim().toLowerCase(), password: clave })
  if (error) throw error
}

export async function salir(db) {
  const { error } = await db.auth.signOut()
  if (error) throw error
}

export async function pedirRecuperacion(db, correo) {
  const { error } = await db.auth.resetPasswordForEmail(correo.trim().toLowerCase(), { redirectTo: window.location.origin })
  if (error) throw error
}

export async function cambiarClave(db, clave) {
  const { error } = await db.auth.updateUser({ password: clave })
  if (error) throw error
}

const COLUMNAS = 'user_id,nombre,apodo,prueba,institucion,ciudad,grado,acepto_datos_en'

/** Perfil guardado. Si la cuenta es anterior a la migración y no lo tiene, se crea con lo que se sabe de ella. */
export async function cargarPerfil(db, usuario) {
  const { data, error } = await db.from('saber_perfiles').select(COLUMNAS).eq('user_id', usuario.id).maybeSingle()
  if (error) throw error
  if (data) return data
  const nombre = String(usuario.nombre || usuario.email?.split('@')[0] || 'Estudiante').slice(0, 80)
  const apodo = nombre.split(' ')[0].slice(0, 24)
  const nuevo = { user_id: usuario.id, nombre, apodo: apodo.length >= 2 ? apodo : 'Estudiante', prueba: 'saber11', institucion: '', ciudad: '', grado: '' }
  const { error: e2 } = await db.from('saber_perfiles').insert(nuevo)
  if (e2) throw e2
  return { ...nuevo, acepto_datos_en: null }
}

export async function guardarPerfil(db, uid, cambios) {
  const fila = {
    nombre: cambios.nombre.trim(),
    apodo: cambios.apodo.trim(),
    prueba: cambios.prueba,
    institucion: (cambios.institucion ?? '').trim(),
    ciudad: (cambios.ciudad ?? '').trim(),
    grado: (cambios.grado ?? '').trim(),
  }
  const { data, error } = await db.from('saber_perfiles').update(fila).eq('user_id', uid).select(COLUMNAS).maybeSingle()
  if (error) throw error
  if (!data) throw new Error('No se encontró tu perfil.')
  return data
}

export async function borrarProgresoNube(db, uid) {
  const { error } = await db.from('saber_progreso').delete().eq('user_id', uid)
  if (error) throw error
}

/** Borra la cuenta completa (usuario, perfil y progreso) con la función de la base de datos. */
export async function borrarCuenta(db) {
  const { error } = await db.rpc('saber_borrar_mi_cuenta')
  if (error) throw error
}
