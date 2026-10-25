/** Después de ver su primer resultado, se ofrece (sin obligar) guardar el avance en una cuenta. */
export default function GuardarAvance({ onCrearCuenta, onEntrar }) {
    return (<aside className="guardar-avance" aria-label="Guardar tu avance">
      <div>
        <strong>¿Quieres guardar tu avance?</strong>
        <p>Ahora vive solo en este dispositivo. Con una cuenta lo ves desde el celular y el computador, y no se pierde nada de lo que ya hiciste.</p>
      </div>
      <div className="acciones">
        <button className="boton" type="button" onClick={onCrearCuenta}>Crear cuenta</button>
        <button className="boton boton-suave" type="button" onClick={onEntrar}>Ya tengo cuenta</button>
      </div>
    </aside>);
}
