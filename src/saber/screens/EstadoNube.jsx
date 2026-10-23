/** Una línea que dice si el progreso ya está en la cuenta. */
export default function EstadoNube({ fase, mensaje, reintentar }) {
    if (!fase)
        return null;
    const textos = {
        sincronizando: 'Guardando en tu cuenta…',
        ok: 'Guardado en tu cuenta',
        pendiente: 'Cambios sin guardar…',
        error: 'No pudimos conectar con tu cuenta. Tus cambios siguen aquí y se guardarán solos cuando haya conexión.',
        bloqueado: `${mensaje ?? 'No pudimos leer tu progreso guardado.'} No se guardó nada nuevo en tu cuenta para no pisar tus datos.`,
    };
    return (<p className={`estado-nube ${fase}`} role="status" aria-live="polite">
      <span className="punto" aria-hidden="true"/>
      {textos[fase]}
      {(fase === 'error' || fase === 'bloqueado') && (<button type="button" className="enlace" onClick={reintentar}>
          Reintentar
        </button>)}
    </p>);
}
