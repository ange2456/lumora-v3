import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { responder } from '../lib/nia.js';

const SALUDO = {
    de: 'nia',
    texto: 'Hola. Soy Nia, tu guía en la ruta. Pregúntame lo que quieras sobre tu avance o sobre los tipos de error.',
    sugerencias: ['¿Cómo voy?', '¿Qué practico primero?', '¿Qué es un punto ciego?'],
};

export default function Nia({ contexto, onPracticar }) {
    const [abierta, setAbierta] = useState(false);
    const [mensajes, setMensajes] = useState([SALUDO]);
    const [texto, setTexto] = useState('');
    const botonRef = useRef(null);
    const inputRef = useRef(null);
    const finRef = useRef(null);

    useEffect(() => {
        if (abierta)
            inputRef.current?.focus();
    }, [abierta]);
    useEffect(() => {
        finRef.current?.scrollIntoView?.({ block: 'end' });
    }, [mensajes]);

    const cerrar = () => {
        setAbierta(false);
        botonRef.current?.focus();
    };
    const preguntar = (pregunta) => {
        const q = pregunta.trim();
        if (!q)
            return;
        const r = responder(q, contexto);
        setMensajes((m) => [...m, { de: 'tu', texto: q }, { de: 'nia', ...r }]);
        setTexto('');
    };
    const ultimo = mensajes[mensajes.length - 1];

    return (<>
      <button ref={botonRef} type="button" className="nia-boton" aria-expanded={abierta} aria-controls="nia-panel" onClick={() => (abierta ? cerrar() : setAbierta(true))}>
        <MessageCircle size={20} aria-hidden="true"/> Nia
      </button>

      {abierta && (<div id="nia-panel" className="nia-panel" role="dialog" aria-labelledby="nia-titulo" onKeyDown={(e) => e.key === 'Escape' && cerrar()}>
          <div className="nia-cabecera">
            <span className="nia-avatar" aria-hidden="true"><Sparkles size={24}/></span>
            <div className="nia-titulo">
              <h2 id="nia-titulo">Nia, tu guía</h2>
              <p><span className="nia-en-linea" aria-hidden="true"/> Lista para ayudarte</p>
            </div>
            <button type="button" className="nia-cerrar" onClick={cerrar} aria-label="Cerrar a Nia">
              <X size={22} aria-hidden="true"/>
            </button>
          </div>
          <p className="nia-aviso"><Sparkles size={16} aria-hidden="true"/> Te acompaño con ideas sobre tu ruta y tus prácticas.</p>

          <div className="nia-mensajes" role="log" aria-live="polite" aria-label="Conversación con Nia">
            {mensajes.map((m, i) => (<div key={i} className={`nia-msg ${m.de}`}>
                <span className="nia-quien">{m.de === 'nia' ? 'Nia' : 'Tú'}</span>
                {m.texto.split('\n').map((l, j) => (l ? <p key={j}>{l}</p> : <br key={j}/>))}
                {m.accion && i === mensajes.length - 1 && (<button type="button" className="boton nia-accion" onClick={() => {
                        onPracticar(m.accion.valor);
                        cerrar();
                    }}>
                    {m.accion.etiqueta}
                  </button>)}
              </div>))}
            <div ref={finRef}/>
          </div>

          <div className="nia-chips" aria-label="Preguntas sugeridas">
            {(ultimo.sugerencias ?? []).map((s) => (<button key={s} type="button" onClick={() => preguntar(s)}>
                <Sparkles size={15} aria-hidden="true"/> {s}
              </button>))}
          </div>

          <form className="nia-form" onSubmit={(e) => {
                e.preventDefault();
                preguntar(texto);
            }}>
            <label htmlFor="nia-entrada" className="solo-lectores">
              Escribe tu pregunta
            </label>
            <input id="nia-entrada" ref={inputRef} type="text" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Escribe tu pregunta" maxLength={200} autoComplete="off"/>
            <button type="submit" className="nia-enviar" disabled={!texto.trim()} aria-label="Enviar pregunta">
              <Send size={18} aria-hidden="true"/>
            </button>
          </form>
          <p className="nia-pie">Guía de apoyo · No es una IA libre</p>
        </div>)}
    </>);
}
