import { TIPOS_ERROR } from '../data/questions.js';
const PESO_ERROR = {
    segura: 3, // seguro y equivocado: el más grave
    dudo: 2,
    adivine: 1,
};
export function calcularDiagnostico(respuestas, preguntas) {
    const acumulado = new Map();
    let aciertos = 0;
    let aciertosFragiles = 0;
    let puntosCiegos = 0;
    for (const r of respuestas) {
        const pregunta = preguntas.find((p) => p.id === r.preguntaId);
        const opcion = pregunta?.opciones.find((o) => o.id === r.opcionId);
        if (!pregunta || !opcion)
            continue;
        if (!opcion.error) {
            aciertos++;
            if (r.confianza === 'adivine')
                aciertosFragiles++;
            continue;
        }
        const actual = acumulado.get(opcion.error) ?? {
            tipo: opcion.error,
            errores: 0,
            puntosCiegos: 0,
            peso: 0,
            porConfianza: { segura: 0, dudo: 0, adivine: 0 },
        };
        actual.errores++;
        actual.porConfianza[r.confianza]++;
        actual.peso += PESO_ERROR[r.confianza];
        if (r.confianza === 'segura') {
            actual.puntosCiegos++;
            puntosCiegos++;
        }
        acumulado.set(opcion.error, actual);
    }
    const porTipo = [...acumulado.values()].sort((a, b) => b.peso - a.peso || b.errores - a.errores || a.tipo.localeCompare(b.tipo));
    return {
        total: respuestas.length,
        aciertos,
        aciertosFragiles,
        puntosCiegos,
        porTipo,
        prioridad: porTipo[0]?.tipo ?? null,
    };
}
export function mensajePrioridad(d) {
    if (!d.prioridad) {
        return d.aciertosFragiles > 0
            ? 'No tuviste errores, pero algunos aciertos fueron adivinados. Vale la pena afianzarlos.'
            : 'Resolviste todo bien y con seguridad. ¡Gran base!';
    }
    const info = TIPOS_ERROR[d.prioridad];
    const resumen = d.porTipo[0];
    if (resumen.puntosCiegos > 0) {
        return `Tu punto ciego principal es «${info.nombre}»: te equivocaste con seguridad. Empecemos por ahí.`;
    }
    return `Lo primero a trabajar es «${info.nombre}». Aún dudas en esto, y se puede mejorar con práctica dirigida.`;
}
