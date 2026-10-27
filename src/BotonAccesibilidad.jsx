import { useEffect, useRef, useState } from "react";
import { Accessibility, X } from "lucide-react";
import { PREFS_BASE, aplicar, guardar, inicial } from "./saber/lib/accesibilidad";

const TAMANOS = [
  { id: "normal", etiqueta: "Normal", muestra: "A" },
  { id: "grande", etiqueta: "Grande", muestra: "A" },
  { id: "muy-grande", etiqueta: "Muy grande", muestra: "A" },
];

const INTERRUPTORES = [
  { id: "contraste", titulo: "Alto contraste", detalle: "Letras negras sobre fondo blanco y bordes marcados." },
  { id: "fuente", titulo: "Letra de lectura fácil", detalle: "Una letra más clara, pensada para leer con menos esfuerzo." },
  { id: "espacio", titulo: "Más espacio al leer", detalle: "Más aire entre líneas, letras y palabras." },
  { id: "movimiento", titulo: "Menos movimiento", detalle: "Quita animaciones y transiciones." },
];

export default function BotonAccesibilidad() {
  const [abierto, setAbierto] = useState(false);
  const [prefs, setPrefs] = useState(() => inicial());
  const raiz = useRef(null);
  const boton = useRef(null);
  const primero = useRef(null);

  // Cada cambio se aplica al instante y queda guardado en este dispositivo.
  const cambiar = (parcial) => {
    const nuevas = { ...prefs, ...parcial };
    setPrefs(nuevas);
    aplicar(nuevas);
    guardar(nuevas);
  };

  useEffect(() => {
    if (!abierto) return undefined;
    primero.current?.focus();
    const alTeclear = (e) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    const alClicFuera = (e) => {
      if (raiz.current && !raiz.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("keydown", alTeclear);
    document.addEventListener("mousedown", alClicFuera);
    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.removeEventListener("mousedown", alClicFuera);
    };
  }, [abierto]);

  return (
    <div className="a11y-wrap" ref={raiz}>
      <button
        ref={boton}
        type="button"
        className="icon-button a11y-boton"
        aria-label="Accesibilidad"
        aria-expanded={abierto}
        aria-controls="panel-accesibilidad"
        title="Accesibilidad"
        onClick={() => setAbierto(!abierto)}
      >
        <Accessibility size={20} aria-hidden="true" />
      </button>
      {abierto && (
        <div id="panel-accesibilidad" className="a11y-panel" role="dialog" aria-labelledby="a11y-titulo">
          <div className="a11y-cabecera">
            <h2 id="a11y-titulo">Accesibilidad</h2>
            <button
              type="button"
              className="icon-button a11y-cerrar"
              aria-label="Cerrar accesibilidad"
              onClick={() => {
                setAbierto(false);
                boton.current?.focus();
              }}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <p className="a11y-nota">Elige lo que te ayude. Se guarda en este dispositivo.</p>

          <fieldset className="a11y-grupo">
            <legend>Tamaño del texto</legend>
            <div className="a11y-tamanos">
              {TAMANOS.map((t, i) => (
                <label key={t.id} className={prefs.texto === t.id ? "activo" : ""}>
                  <input
                    ref={i === 0 ? primero : null}
                    type="radio"
                    name="a11y-texto"
                    value={t.id}
                    checked={prefs.texto === t.id}
                    onChange={() => cambiar({ texto: t.id })}
                  />
                  <span className={`a11y-muestra a11y-muestra-${t.id}`} aria-hidden="true">
                    {t.muestra}
                  </span>
                  <span>{t.etiqueta}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="a11y-lista">
            {INTERRUPTORES.map((s) => (
              <label key={s.id} className="a11y-fila">
                <span className="a11y-texto">
                  <strong>{s.titulo}</strong>
                  <small>{s.detalle}</small>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={prefs[s.id]}
                  onChange={(e) => cambiar({ [s.id]: e.target.checked })}
                />
                <span className="a11y-pastilla" aria-hidden="true" />
              </label>
            ))}
          </div>

          <p className="a11y-nota">
            En las preguntas encuentras el botón <strong>Escuchar</strong>, que las lee en voz alta con la voz de tu dispositivo.
          </p>

          <button type="button" className="a11y-reset" onClick={() => cambiar({ ...PREFS_BASE })}>
            Volver a lo normal
          </button>
        </div>
      )}
    </div>
  );
}
