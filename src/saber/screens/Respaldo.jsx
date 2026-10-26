import { useRef, useState } from 'react';
import { exportarProgreso, leerProgreso, nombreArchivo } from '../lib/respaldo.js';

export default function Respaldo({ estado, onImportar, soloCargar = false, combinar = false }) {
    const entrada = useRef(null);
    const [mensaje, setMensaje] = useState(null); // { tipo: 'bien' | 'mal', texto }
    const [pendiente, setPendiente] = useState(null); // estado leído, esperando confirmación

    const descargar = () => {
        const blob = new Blob([exportarProgreso(estado)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo(estado.perfil?.apodo);
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setMensaje({ tipo: 'bien', texto: 'Listo. Guarda ese archivo: con él puedes seguir en otro dispositivo.' });
    };

    const elegirArchivo = async (e) => {
        const archivo = e.target.files?.[0];
        e.target.value = '';
        if (!archivo) return;
        setPendiente(null);
        let crudo;
        try {
            crudo = await archivo.text();
        }
        catch {
            setMensaje({ tipo: 'mal', texto: 'No se pudo leer ese archivo.' });
            return;
        }
        const r = leerProgreso(crudo);
        if (!r.ok) {
            setMensaje({ tipo: 'mal', texto: r.error });
            return;
        }
        setMensaje(null);
        setPendiente(r.estado);
    };

    const confirmar = () => {
        onImportar(pendiente);
        setPendiente(null);
        setMensaje({ tipo: 'bien', texto: 'Progreso cargado.' });
    };

    return (<div className="respaldo">
      <h2>{soloCargar ? '¿Ya tienes un progreso guardado?' : combinar ? 'Copia de seguridad' : 'Llévate tu progreso'}</h2>
      <p className="ayuda">
        {soloCargar
            ? 'Si lo descargaste desde Lumora en otro dispositivo, cárgalo aquí y sigues donde lo dejaste.'
            : combinar
                ? 'Tu progreso ya se guarda en tu cuenta y lo ves desde cualquier dispositivo. Este archivo es una copia extra, por si quieres tener la tuya.'
                : 'Tu progreso vive en este dispositivo. Si vas a cambiar de celular o limpiar el navegador, guárdalo en un archivo y cárgalo después.'}
      </p>
      <div className="acciones" style={{ marginTop: 14 }}>
        {!soloCargar && (<button className="boton boton-suave" type="button" onClick={descargar}>
            Guardar mi progreso
          </button>)}
        <button className="boton boton-suave" type="button" onClick={() => entrada.current?.click()}>
          Cargar un progreso
        </button>
        <input ref={entrada} type="file" accept=".json,application/json" hidden onChange={elegirArchivo} aria-label="Archivo de progreso de Lumora"/>
      </div>

      {pendiente && (<div className="respaldo-confirmar" role="alertdialog" aria-labelledby="respaldo-titulo">
          <h3 id="respaldo-titulo">Encontré el progreso de «{pendiente.perfil.apodo}»</h3>
          <p>
            {pendiente.intentos.length} {pendiente.intentos.length === 1 ? 'diagnóstico' : 'diagnósticos'} y{' '}
            {Object.values(pendiente.progreso).filter((g) => g.dominado).length} tipos dominados. {combinar
                ? 'Si lo cargas, se suma al progreso de tu cuenta: no se pierde nada.'
                : 'Si lo cargas, reemplaza el progreso que tienes ahora en este dispositivo.'}
          </p>
          <div className="acciones">
            <button className="boton" type="button" onClick={confirmar}>
              {combinar ? 'Sumar a mi cuenta' : 'Reemplazar y cargar'}
            </button>
            <button className="boton boton-suave" type="button" onClick={() => setPendiente(null)}>
              Cancelar
            </button>
          </div>
        </div>)}

      <p className={`respaldo-mensaje ${mensaje?.tipo ?? ''}`} role="status" aria-live="polite">
        {mensaje?.texto ?? ''}
      </p>
    </div>);
}
