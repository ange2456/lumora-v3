// Competencias y tipos de error del diagnóstico de Lumora.
// Las preguntas se generan con valores al azar en plantillas (plantillas.js y
// plantillas-critica.js); cada opción incorrecta corresponde a uno de estos tipos,
// así el diagnóstico es explicable.

export const COMPETENCIAS = {
    cuantitativo: {
        id: 'cuantitativo',
        nombre: 'Razonamiento cuantitativo',
        corto: 'Cuantitativo',
        tipos: ['base', 'proporcion', 'conversion', 'lectura', 'incompleta'],
    },
    critica: {
        id: 'critica',
        nombre: 'Lectura crítica',
        corto: 'Lectura crítica',
        tipos: ['literal', 'detalle', 'inferencia', 'relacion', 'intencion'],
    },
    naturales: {
        id: 'naturales',
        nombre: 'Ciencias naturales',
        corto: 'Naturales',
        tipos: ['variables', 'grafica', 'concepto', 'fenomeno', 'conclusion'],
    },
    ciudadanas: {
        id: 'ciudadanas',
        nombre: 'Sociales y ciudadanas',
        corto: 'Ciudadanas',
        tipos: ['derechos', 'perspectiva', 'hechoopinion', 'mecanismo', 'consecuencia'],
    },
    ingles: {
        id: 'ingles',
        nombre: 'Inglés',
        corto: 'Inglés',
        tipos: ['vocabulario', 'gramatica', 'textocorto', 'funcion', 'conector'],
    },
};

// Qué competencias evalúa cada prueba en Lumora (Saber Pro no incluye ciencias naturales).
export const COMPETENCIAS_POR_PRUEBA = {
    saber11: ['cuantitativo', 'critica', 'naturales', 'ciudadanas', 'ingles'],
    saberpro: ['cuantitativo', 'critica', 'ciudadanas', 'ingles'],
};

export const COMPETENCIA_INICIAL = 'cuantitativo';
export const esCompetencia = (c) => typeof c === 'string' && Object.prototype.hasOwnProperty.call(COMPETENCIAS, c);
export const tiposDe = (competencia) => COMPETENCIAS[competencia]?.tipos ?? [];

const TIPOS = {
    // ---- Razonamiento cuantitativo ----
    base: {
        nombre: 'Base equivocada',
        descripcion: 'Calculas el porcentaje o la comparación sobre una cantidad que no es la correcta.',
    },
    proporcion: {
        nombre: 'Proporción mal aplicada',
        descripcion: 'Tratas como directa una relación inversa (o al revés), o armas mal la regla de tres.',
    },
    conversion: {
        nombre: 'Conversión de unidades o tiempo',
        descripcion: 'Mezclas unidades (litros y mililitros, horas y minutos) sin convertirlas bien.',
    },
    lectura: {
        nombre: 'Lectura de datos',
        descripcion: 'Tomas mal una cifra de la tabla o del enunciado, o respondes otra pregunta distinta.',
    },
    incompleta: {
        nombre: 'Operación incompleta',
        descripcion: 'Haces bien una parte del procedimiento, pero te detienes antes de terminar.',
    },
    // ---- Lectura crítica ----
    literal: {
        nombre: 'Información que el texto no dice',
        descripcion: 'Eliges una idea que suena razonable, pero que el texto no afirma.',
    },
    detalle: {
        nombre: 'Detalle en vez de idea principal',
        descripcion: 'Te quedas con un ejemplo o un dato en lugar de la idea que sostiene todo el texto.',
    },
    inferencia: {
        nombre: 'Inferencia exagerada',
        descripcion: 'Concluyes más de lo que el texto permite, por ejemplo con «todos», «siempre» o «nunca».',
    },
    relacion: {
        nombre: 'Relación entre ideas invertida',
        descripcion: 'Confundes causa con consecuencia o no ves cómo se conectan las ideas.',
    },
    intencion: {
        nombre: 'Intención del texto mal leída',
        descripcion: 'No identificas para qué se escribió el texto, a quién le habla o qué función cumple una parte.',
    },
    // ---- Ciencias naturales ----
    variables: {
        nombre: 'Variables del experimento confundidas',
        descripcion: 'Confundes qué se cambia, qué se mide y qué debe mantenerse igual en un experimento.',
    },
    grafica: {
        nombre: 'Datos de la tabla mal leídos',
        descripcion: 'Tomas un valor de la tabla como si fuera el cambio, o comparas mal dos valores.',
    },
    concepto: {
        nombre: 'Concepto científico mal aplicado',
        descripcion: 'Confundes conceptos parecidos (masa y peso, calor y temperatura, cambio físico y químico).',
    },
    fenomeno: {
        nombre: 'Causa equivocada del fenómeno',
        descripcion: 'Explicas un fenómeno con una causa que suena razonable pero no es la que lo produce.',
    },
    conclusion: {
        nombre: 'Conclusión que los datos no permiten',
        descripcion: 'Generalizas de más, o confundes dos cosas que ocurren juntas con una que causa la otra.',
    },
    // ---- Sociales y ciudadanas ----
    derechos: {
        nombre: 'Derechos y deberes confundidos',
        descripcion: 'Mezclas lo que se puede exigir (derechos), lo que se debe hacer (deberes) y qué acción protege cada cosa.',
    },
    perspectiva: {
        nombre: 'Punto de vista no reconocido',
        descripcion: 'No identificas desde qué posición o interés habla cada persona o fuente.',
    },
    hechoopinion: {
        nombre: 'Hecho y opinión mezclados',
        descripcion: 'Tomas una valoración como si fuera un dato comprobable, o al revés.',
    },
    mecanismo: {
        nombre: 'Mecanismo de participación confundido',
        descripcion: 'Confundes mecanismos y acciones parecidos (plebiscito, referendo, revocatoria, tutela, acción popular…).',
    },
    consecuencia: {
        nombre: 'Causa o consecuencia poco razonable',
        descripcion: 'Eliges una causa o consecuencia que no se deriva de la situación descrita.',
    },
    // ---- Inglés ----
    vocabulario: {
        nombre: 'Falsos amigos y vocabulario',
        descripcion: 'Entiendes una palabra por su parecido con el español, pero significa otra cosa.',
    },
    gramatica: {
        nombre: 'Tiempo verbal equivocado',
        descripcion: 'Escoges una forma del verbo que no concuerda con el sujeto o con la pista de tiempo.',
    },
    textocorto: {
        nombre: 'Dato del texto corto mal leído',
        descripcion: 'Tomas un dato que está en el texto pero que responde otra pregunta.',
    },
    funcion: {
        nombre: 'Respuesta que no cumple la función',
        descripcion: 'Eliges una respuesta correcta en inglés, pero que no responde a lo que la situación pide.',
    },
    conector: {
        nombre: 'Conector o preposición equivocada',
        descripcion: 'Usas un conector o una preposición que no encaja con la relación entre las ideas.',
    },
};

// Cada tipo sabe a qué competencia pertenece (los ids son únicos entre competencias).
export const TIPOS_ERROR = Object.fromEntries(
    Object.entries(COMPETENCIAS).flatMap(([competencia, c]) =>
        c.tipos.map((id) => [id, { id, competencia, ...TIPOS[id] }]),
    ),
);
