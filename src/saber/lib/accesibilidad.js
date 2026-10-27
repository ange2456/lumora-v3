/**
 * Preferencias de accesibilidad de Lumora.
 * Viven solo en el dispositivo de cada persona (localStorage) y se aplican como
 * atributos data-a11y-* en <html>; el CSS (src/accesibilidad.css) hace el resto.
 */
export const CLAVE = 'lumora.accesibilidad.v1';

export const TEXTOS = ['normal', 'grande', 'muy-grande'];

export const PREFS_BASE = {
    texto: 'normal', // normal | grande | muy-grande
    contraste: false, // alto contraste
    fuente: false, // letra de lectura fácil
    espacio: false, // más espacio entre líneas y letras
    movimiento: false, // menos movimiento
};

/** Limpia lo que venga del almacenamiento: solo valores conocidos. */
export function normalizar(crudo) {
    const p = { ...PREFS_BASE };
    if (!crudo || typeof crudo !== 'object')
        return p;
    if (TEXTOS.includes(crudo.texto))
        p.texto = crudo.texto;
    for (const k of ['contraste', 'fuente', 'espacio', 'movimiento']) {
        if (typeof crudo[k] === 'boolean')
            p[k] = crudo[k];
    }
    return p;
}

/** Atributos que se ponen en <html> para unas preferencias dadas. */
export function atributos(p) {
    return {
        'data-a11y-texto': p.texto,
        'data-a11y-contraste': p.contraste ? 'alto' : 'normal',
        'data-a11y-fuente': p.fuente ? 'legible' : 'normal',
        'data-a11y-espacio': p.espacio ? 'amplio' : 'normal',
        'data-a11y-movimiento': p.movimiento ? 'reducido' : 'normal',
    };
}

export function aplicar(p, raiz = typeof document !== 'undefined' ? document.documentElement : null) {
    if (!raiz)
        return;
    for (const [k, v] of Object.entries(atributos(p)))
        raiz.setAttribute(k, v);
}

/** Si nunca eligió nada, se respetan los ajustes del sistema (menos movimiento, más contraste). */
export function inicial() {
    try {
        const guardado = window.localStorage.getItem(CLAVE);
        if (guardado)
            return normalizar(JSON.parse(guardado));
    }
    catch {
        /* sin almacenamiento: seguimos con los valores del sistema */
    }
    const p = { ...PREFS_BASE };
    try {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
            p.movimiento = true;
        if (window.matchMedia('(prefers-contrast: more)').matches)
            p.contraste = true;
    }
    catch {
        /* navegador sin matchMedia */
    }
    return p;
}

export function guardar(p) {
    try {
        window.localStorage.setItem(CLAVE, JSON.stringify(p));
    }
    catch {
        /* modo privado o almacenamiento bloqueado: la preferencia vale solo en esta visita */
    }
}

/** Se llama una vez al arrancar, antes de pintar, para que no haya parpadeo. */
export function iniciarAccesibilidad() {
    const p = inicial();
    aplicar(p);
    return p;
}
