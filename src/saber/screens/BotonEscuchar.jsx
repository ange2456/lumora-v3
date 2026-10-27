import { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { leer, parar, puedeLeer } from '../lib/leer.js';

/** Lee en voz alta lo que se le pase. Si el navegador no puede, no se muestra. */
export default function BotonEscuchar({ partes, etiqueta = 'Escuchar' }) {
    // Se guarda qué contenido se está leyendo: si cambia (otra pregunta), deja de contar como 'leyendo'.
    const clave = partes.map((p) => p.texto).join('|');
    const [leyendoClave, setLeyendoClave] = useState(null);
    const leyendo = leyendoClave === clave;
    // Al cambiar de contenido o salir de la pantalla se corta la lectura.
    useEffect(() => () => parar(), [clave]);
    if (!puedeLeer())
        return null;
    return (<button type="button" className="boton-escuchar" aria-pressed={leyendo} onClick={() => {
            if (leyendo) {
                parar();
                setLeyendoClave(null);
            }
            else {
                setLeyendoClave(clave);
                leer(partes, () => setLeyendoClave((k) => (k === clave ? null : k)));
            }
        }}>
      {leyendo ? <Square size={16} aria-hidden="true"/> : <Volume2 size={18} aria-hidden="true"/>}
      <span>{leyendo ? 'Detener' : etiqueta}</span>
    </button>);
}
