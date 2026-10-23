import { useCallback, useEffect, useRef, useState } from 'react'
import { fusionar, huella } from '../lib/fusion.js'
import { ErrorNube, sincronizar } from './sincronizar.js'

const PAUSA_GUARDADO = 1500

/**
 * Mantiene el progreso de este dispositivo y el de la cuenta iguales.
 * - Al abrir: trae lo de la cuenta, lo une con lo local y sube el resultado.
 * - Al cambiar algo: espera un momento y vuelve a sincronizar.
 * - Si no hay conexión: reintenta solo, y al volver a la pestaña o recuperar la red.
 * Devuelve { fase, mensaje, reintentar }.
 */
export function useSincronizacion(nube, estado, setEstado) {
  const [estadoNube, setEstadoNube] = useState(nube ? { fase: 'sincronizando' } : null)
  const estadoRef = useRef(estado)
  const ultima = useRef(null) // huella de lo último confirmado en la nube (null = aún no hay primera sincronización)
  const corriendo = useRef(false)
  const temporizador = useRef(null)
  const reintentos = useRef(0)
  const hora = useRef(0)

  useEffect(() => {
    estadoRef.current = estado
  }, [estado])

  const programar = useCallback((ms, ejecutar) => {
    clearTimeout(temporizador.current)
    temporizador.current = setTimeout(ejecutar, ms)
  }, [])

  const sincronizarYa = useCallback(async () => {
    if (!nube || corriendo.current) return
    corriendo.current = true
    setEstadoNube((p) => ({ ...p, fase: 'sincronizando' }))
    let siguiente = null
    try {
      const r = await sincronizar({ db: nube.db, uid: nube.uid, local: estadoRef.current })
      ultima.current = huella(r.estado)
      if (r.cambioLocal) setEstado((prev) => fusionar(prev, r.estado))
      reintentos.current = 0
      hora.current = Date.now()
      setEstadoNube({ fase: 'ok' })
    } catch (e) {
      console.error('No se pudo sincronizar:', e)
      if (e instanceof ErrorNube) {
        setEstadoNube({ fase: 'bloqueado', mensaje: e.message })
      } else {
        setEstadoNube({ fase: 'error' })
        siguiente = Math.min(60_000, 5_000 * 3 ** reintentos.current++)
      }
    } finally {
      corriendo.current = false
      // Si mientras se sincronizaba hubo cambios nuevos, se vuelve a sincronizar.
      if (siguiente === null && ultima.current !== null && huella(estadoRef.current) !== ultima.current) siguiente = 400
      if (siguiente !== null) programar(siguiente, sincronizarYa)
    }
  }, [nube, setEstado, programar])

  // Primera sincronización al abrir.
  useEffect(() => {
    if (!nube) return undefined
    sincronizarYa()
    return () => clearTimeout(temporizador.current)
  }, [nube, sincronizarYa])

  // Cambios locales: se guardan tras una pausa.
  useEffect(() => {
    if (!nube || ultima.current === null) return undefined
    if (huella(estado) === ultima.current) return undefined
    setEstadoNube((p) => (p?.fase === 'ok' ? { fase: 'pendiente' } : p))
    programar(PAUSA_GUARDADO, sincronizarYa)
    return undefined
  }, [estado, nube, sincronizarYa, programar])

  // Volver a la red o a la pestaña: se pone al día con lo que hizo otro dispositivo.
  useEffect(() => {
    if (!nube) return undefined
    const alVolver = () => {
      if (document.visibilityState === 'visible' && Date.now() - hora.current > 20_000) sincronizarYa()
    }
    window.addEventListener('online', sincronizarYa)
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      window.removeEventListener('online', sincronizarYa)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [nube, sincronizarYa])

  return { ...estadoNube, reintentar: sincronizarYa }
}
