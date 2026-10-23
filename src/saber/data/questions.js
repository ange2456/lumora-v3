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
};

// Cada tipo sabe a qué competencia pertenece (los ids son únicos entre competencias).
export const TIPOS_ERROR = Object.fromEntries(
    Object.entries(COMPETENCIAS).flatMap(([competencia, c]) =>
        c.tipos.map((id) => [id, { id, competencia, ...TIPOS[id] }]),
    ),
);
