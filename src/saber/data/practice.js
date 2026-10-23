// Lecciones cortas de Lumora, una por tipo de error.
// Los ejercicios (3 de práctica + 1 problema nuevo) se generan en banco.js.
// Todo el contenido es original, no proviene de pruebas del ICFES.
export const LECCIONES = {
    base: {
        titulo: 'Un porcentaje siempre se mide sobre algo',
        idea: 'Antes de calcular, pregúntate: ¿sobre qué cantidad? Cuando algo subió o bajó, la base es el valor del que partió, no el valor al que llegó.',
        ejemplo: 'Un libro pasa de $40.000 a $50.000. Subió $10.000. La base es $40.000, el precio inicial. 10.000 ÷ 40.000 = 0,25, o sea 25%.',
        chequeo: 'Escribe «sobre cuánto» antes de dividir. Si dudas entre dos cantidades, la base es la que había primero.',
    },
    proporcion: {
        titulo: 'Decide si es directa o inversa antes de calcular',
        idea: 'Pregúntate si al aumentar una cantidad la otra también aumenta (directa) o disminuye (inversa). Recién ahí armas la regla de tres.',
        ejemplo: '3 pintores terminan una casa en 8 días. ¿Y 6 pintores? Más pintores, menos días: es inversa. 3 × 8 = 24 y 24 ÷ 6 = 4 días.',
        chequeo: 'Mira tu resultado: ¿tiene sentido que sea mayor o menor que el dato inicial? Si no, probablemente invertiste la relación.',
    },
    conversion: {
        titulo: 'Misma unidad antes de operar',
        idea: 'No sumes, restes ni dividas cantidades en unidades distintas. Llévalas primero a una sola. Y recuerda que las horas se dividen en 60 minutos, no en 100.',
        ejemplo: '1 h 30 min = 1 + 30/60 = 1,5 h. Y 2,5 litros = 2.500 mililitros.',
        chequeo: 'Subraya las unidades del enunciado y las de tu respuesta. Si no coinciden, falta convertir.',
    },
    lectura: {
        titulo: 'Responde justo lo que preguntan',
        idea: 'Muchos errores no son de cálculo sino de lectura: tomar el dato equivocado o responder otra pregunta. Lee la pregunta de último y subraya qué piden y qué datos sobran.',
        ejemplo: 'Una tabla muestra tres meses y piden «el total del trimestre». Hay que sumar los tres meses, no escoger el mayor.',
        chequeo: 'Antes de confirmar, relee la pregunta: ¿mi respuesta contesta eso exactamente?',
    },
    incompleta: {
        titulo: 'Los pasos se pierden al final',
        idea: 'En problemas de varios pasos es fácil detenerse a la mitad. Antes de empezar, cuenta cuántos pasos necesitas y verifica que el último responda la pregunta.',
        ejemplo: 'Compras 2 cuadernos de $3.000 y pagas con $10.000. Paso 1: total, 2 × 3.000 = 6.000. Paso 2: vuelto, 10.000 − 6.000 = 4.000.',
        chequeo: 'Escribe «paso 1, paso 2…» y ve tachando. No termines hasta que el último paso responda la pregunta.',
    },
    // ---- Lectura crítica ----
    literal: {
        titulo: 'Responde con lo que el texto dice, no con lo que crees',
        idea: 'Una respuesta literal se puede señalar en el texto. Si para aceptarla tienes que suponer algo o recordar lo que sabes de fuera, no es literal.',
        ejemplo: 'Un texto dice que conviene guardar agua en recipientes limpios. La opción «el agua de lluvia es más limpia» puede ser cierta en la vida real, pero ese texto no lo dice.',
        chequeo: 'Para cada opción pregúntate: ¿en qué parte del texto lo dice? Si no la encuentras, descártala.',
    },
    detalle: {
        titulo: 'La idea principal sostiene todo el texto',
        idea: 'La idea principal es la que explica por qué existen las demás. Un ejemplo o un dato la apoya, pero por sí solo no la reemplaza.',
        ejemplo: 'Un texto cuenta que en un colegio 7 de cada 10 estudiantes recordaron la lección y concluye que dormir bien ayuda a estudiar. El caso del colegio es el ejemplo; la idea principal es que dormir bien ayuda a estudiar.',
        chequeo: 'Tapa la oración que dudas con la mano. Si el texto sigue teniendo sentido, esa parte era un detalle y no la idea principal.',
    },
    inferencia: {
        titulo: 'Concluye solo lo que el texto permite',
        idea: 'Inferir es sacar una conclusión a partir de lo que el texto dice, sin inventar. Las palabras como «siempre», «nunca», «todos» o «garantiza» suelen ir más lejos que el texto.',
        ejemplo: 'Si un texto dice que dormir bien ayuda a recordar, puedes concluir que desvelarse puede perjudicar el recuerdo. No puedes concluir que quien duerme bien «nunca» se equivoca.',
        chequeo: 'Busca en cada opción las palabras absolutas (todos, siempre, nunca, garantiza). Suelen exagerar.',
    },
    relacion: {
        titulo: 'Fíjate en qué causa qué',
        idea: 'Un texto puede decir que una cosa produce otra. Si cambias el orden, cambias el sentido. Pregunta: ¿cuál ocurre primero y cuál es el resultado?',
        ejemplo: '«Como llovió mucho, el río creció.» La lluvia es la causa y el río crecido es la consecuencia. Decir «llovió porque el río creció» invierte la relación.',
        chequeo: 'Escribe la relación con «porque» y comprueba que lo que va después de «porque» sea la causa.',
    },
    intencion: {
        titulo: 'Pregúntate para qué se escribió',
        idea: 'Cada texto tiene un propósito: informar, advertir, recomendar, convencer… Fíjate en a quién le habla, qué pide y cómo cierra, no solo en el tema.',
        ejemplo: 'Un aviso que explica por qué cerrar la llave y termina con «cierra la llave cuando no la uses» busca recomendar y llamar a actuar, no solo informar del tema.',
        chequeo: 'Pregúntate: ¿qué quiere el autor que yo piense o haga después de leer?',
    },
};
