/** Lectura en voz alta con la voz del propio dispositivo (Web Speech API). No envía nada a ningún servidor. */
export const puedeLeer = () => typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance !== 'undefined';

function elegirVoz(lang) {
    const voces = window.speechSynthesis.getVoices?.() ?? [];
    const base = lang.slice(0, 2).toLowerCase();
    return (voces.find((v) => v.lang?.replace('_', '-').toLowerCase() === lang.toLowerCase()) ||
        voces.find((v) => v.lang?.toLowerCase().startsWith(base)) ||
        null);
}

/** Cada parte: { texto, lang }. Se leen en orden; `alTerminar` se llama al acabar o al cortar. */
export function leer(partes, alTerminar) {
    if (!puedeLeer())
        return;
    window.speechSynthesis.cancel();
    const lista = partes.filter((p) => p && p.texto && p.texto.trim());
    lista.forEach((p, i) => {
        const u = new window.SpeechSynthesisUtterance(p.texto);
        u.lang = p.lang || 'es-CO';
        const voz = elegirVoz(u.lang);
        if (voz)
            u.voice = voz;
        u.rate = 0.95;
        if (i === lista.length - 1) {
            u.onend = () => alTerminar?.();
            u.onerror = () => alTerminar?.();
        }
        window.speechSynthesis.speak(u);
    });
    if (lista.length === 0)
        alTerminar?.();
}

export function parar() {
    if (puedeLeer())
        window.speechSynthesis.cancel();
}

const LETRAS = ['A', 'B', 'C', 'D'];

/** Arma lo que se lee de una pregunta: texto (en su idioma), enunciado, tabla y opciones. */
export function partesDePregunta({ texto, enunciado, tabla, opciones }, esIngles = false) {
    const partes = [];
    if (texto)
        partes.push({ texto: `Texto. ${texto}`, lang: esIngles ? 'en-US' : 'es-CO' });
    partes.push({ texto: enunciado, lang: 'es-CO' });
    if (tabla) {
        const filas = tabla.filas.map((f) => f.map((c, i) => `${tabla.encabezados[i]}: ${c}`).join(', ')).join('. ');
        partes.push({ texto: `Tabla. ${filas}`, lang: 'es-CO' });
    }
    partes.push({
        texto: opciones.map((o, i) => `Opción ${LETRAS[i]}. ${o.texto}`).join('. '),
        lang: 'es-CO',
    });
    return partes;
}
