// El progreso de la ruta Saber se guarda por cuenta, en este dispositivo.
const PREFIJO = 'lumora:saber:v2:';
export const META_DIARIA = 4;
export function claveDia(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}
/** Días seguidos con actividad. Si hoy aún no hay, cuenta desde ayer para no castigar la mañana. */
export function calcularRacha(actividad, hoy = new Date()) {
    const dia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    if (!actividad[claveDia(dia)])
        dia.setDate(dia.getDate() - 1);
    let racha = 0;
    while (actividad[claveDia(dia)] > 0) {
        racha++;
        dia.setDate(dia.getDate() - 1);
    }
    return racha;
}
export function cargar(usuarioId = 'anon') {
    try {
        const crudo = localStorage.getItem(PREFIJO + usuarioId);
        if (!crudo)
            return { intentos: [], progreso: {}, actividad: {} };
        const e = JSON.parse(crudo);
        return {
            ...e,
            intentos: Array.isArray(e.intentos) ? e.intentos : [],
            progreso: e.progreso ?? {},
            actividad: e.actividad ?? {},
        };
    }
    catch {
        return { intentos: [], progreso: {}, actividad: {} };
    }
}
export function guardar(usuarioId, e) {
    try {
        localStorage.setItem(PREFIJO + usuarioId, JSON.stringify(e));
    }
    catch {
        /* sin almacenamiento: la app sigue funcionando sin guardar */
    }
}
/** Quita la copia local (al cerrar sesión, para no dejar datos en un equipo compartido). */
export function borrarLocal(usuarioId) {
    try {
        localStorage.removeItem(PREFIJO + usuarioId);
    }
    catch {
        /* sin almacenamiento */
    }
}
export function nuevaSemilla() {
    return Math.floor(Math.random() * 2 ** 31);
}
/** Mezcla determinista (mulberry32) para que el orden de opciones sea estable por intento */
export function mezclar(items, semilla) {
    let a = semilla >>> 0;
    const rand = () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const copia = [...items];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}
