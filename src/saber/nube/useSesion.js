import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { cargarPerfil } from './cuenta.js'

/** Texto para cuando falla la carga del perfil (lo más común: falta aplicar la migración). */
function explicar(e) {
  const m = String(e?.message ?? '').toLowerCase()
  if (e?.code === '42P01' || e?.code === 'PGRST205' || m.includes('does not exist') || m.includes('schema cache')) {
    return 'La base de datos todavía no tiene las tablas de Lumora Saber. Hay que aplicar la migración de Supabase (está en la guía de configuración).'
  }
  if (m.includes('fetch') || m.includes('network')) return 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.'
  return 'No pudimos cargar tu perfil. Inténtalo de nuevo en un momento.'
}

/**
 * Estado de la cuenta.
 * fase: 'local' (sin Supabase configurado) | 'cargando' | 'anonimo' | 'activa' | 'error'
 */
export function useSesion() {
  const db = supabase
  const [fase, setFase] = useState(db ? 'cargando' : 'local')
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [recuperando, setRecuperando] = useState(false)
  const [error, setError] = useState('')
  const uidRef = useRef(null)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!db) return undefined
    let activo = true
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((evento, sesion) => {
      if (evento === 'PASSWORD_RECOVERY') setRecuperando(true)
      if (!sesion) {
        uidRef.current = null
        setUsuario(null)
        setPerfil(null)
        setError('')
        setFase('anonimo')
        return
      }
      const u = { id: sesion.user.id, email: sesion.user.email ?? '', nombre: sesion.user.user_metadata?.display_name ?? '' }
      if (uidRef.current === u.id) return // renovación del token: no hay nada que recargar
      uidRef.current = u.id
      setUsuario(u)
      // Supabase pide no llamar a su cliente dentro de este callback.
      setTimeout(async () => {
        try {
          const p = await cargarPerfil(db, u)
          if (!activo || uidRef.current !== u.id) return
          setPerfil(p)
          setError('')
          setFase('activa')
        } catch (e) {
          console.error('No se pudo cargar el perfil:', e)
          if (!activo || uidRef.current !== u.id) return
          setError(explicar(e))
          setFase('error')
        }
      }, 0)
    })
    return () => {
      activo = false
      uidRef.current = null
      subscription.unsubscribe()
    }
  }, [db, intento])

  const reintentar = useCallback(() => {
    setFase('cargando')
    setIntento((n) => n + 1)
  }, [])

  return { db, fase, usuario, perfil, setPerfil, recuperando, setRecuperando, error, reintentar }
}
