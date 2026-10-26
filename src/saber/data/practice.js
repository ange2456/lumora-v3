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
    // ---- Ciencias naturales ----
    variables: {
        titulo: 'En un experimento cambia una sola cosa',
        idea: 'La variable independiente es la que tú cambias a propósito; la dependiente es la que mides como resultado; y las controladas se mantienen iguales para que la comparación sea justa.',
        ejemplo: 'Quieres saber si la luz afecta a una planta: cambias la luz (independiente), mides la altura (dependiente) y mantienes igual el agua y la tierra (controladas).',
        chequeo: 'Pregúntate: ¿qué cambio yo?, ¿qué mido?, ¿qué dejo igual? Si cambian dos cosas a la vez, no podrás saber cuál causó el resultado.',
    },
    grafica: {
        titulo: 'Lee el cambio, no solo el valor',
        idea: 'En una tabla, un valor no es lo mismo que el cambio entre dos valores. Para saber cuánto aumentó algo, resta; para saber cuánto en cada intervalo, fíjate en el tamaño del intervalo.',
        ejemplo: 'Si una planta mide 9 cm en la semana 3 y 12 cm en la 4, creció 3 cm esa semana; no creció 12 cm.',
        chequeo: 'Antes de responder, escribe qué dos valores comparas y qué operación haces con ellos.',
    },
    concepto: {
        titulo: 'Conceptos parecidos no son lo mismo',
        idea: 'Muchos errores vienen de mezclar conceptos que suenan parecido: masa y peso, calor y temperatura, cambio físico y cambio químico. Cada uno mide o describe algo distinto.',
        ejemplo: 'Tu masa es la misma en la Tierra y en la Luna; tu peso cambia porque depende de la gravedad.',
        chequeo: 'Pregúntate qué mide exactamente cada concepto y si en la situación cambia eso o no.',
    },
    fenomeno: {
        titulo: 'Busca la causa que realmente produce el fenómeno',
        idea: 'Una explicación que «suena bien» puede no ser la causa. Pregúntate qué proceso físico, químico o biológico ocurre de verdad y si tu explicación lo incluye.',
        ejemplo: 'El vaso frío se moja por fuera porque el vapor del aire se condensa en el vidrio, no porque el agua atraviese el vidrio.',
        chequeo: 'Comprueba si tu explicación se puede describir paso a paso, sin saltarte ningún proceso.',
    },
    conclusion: {
        titulo: 'Concluye solo lo que los datos permiten',
        idea: 'Pocos datos o dos cosas que ocurren juntas no bastan para concluir que una causa la otra, ni para generalizar a todos los casos.',
        ejemplo: 'Si en verano suben las ventas de helado y los ahogamientos, no es el helado el culpable: el calor explica ambos.',
        chequeo: 'Pregúntate: ¿cuántos casos hay?, ¿con qué se comparó?, ¿hay otra causa que explique ambos datos?',
    },
    // ---- Sociales y ciudadanas ----
    derechos: {
        titulo: 'Distingue derecho, deber y acción',
        idea: 'Un derecho es lo que puedes exigir; un deber es lo que debes hacer; y una acción (como la tutela o el derecho de petición) es el camino para proteger un derecho. Tus derechos terminan donde empiezan los de los demás.',
        ejemplo: 'Opinar libremente es un derecho; respetar los derechos ajenos es un deber; la tutela es la acción que protege un derecho fundamental en riesgo.',
        chequeo: 'Pregúntate si la opción habla de algo que puedo exigir, de algo que debo hacer o de la acción para protegerlo.',
    },
    perspectiva: {
        titulo: 'Pregúntate quién habla y qué le conviene',
        idea: 'Cada persona o fuente habla desde una posición y unos intereses. Entender por qué alguien piensa así no es estar de acuerdo, es leer mejor la situación.',
        ejemplo: 'Los comerciantes y los ciclistas pueden opinar distinto sobre cerrar una calle al tráfico porque cada grupo mira lo que gana o pierde.',
        chequeo: 'Antes de elegir, escribe: ¿quién habla?, ¿qué quiere o teme?, ¿qué ganaría o perdería?',
    },
    hechoopinion: {
        titulo: 'Un hecho se puede comprobar; una opinión se valora',
        idea: 'Un hecho se puede verificar con datos o documentos. Una opinión expresa una valoración («mejor», «malo», «injusto») y depende de quien habla.',
        ejemplo: '«La Constitución es de 1991» es un hecho; «es la mejor» es una opinión.',
        chequeo: 'Pregúntate: ¿cómo comprobaría esto? Si no hay forma de medirlo, probablemente es una opinión.',
    },
    mecanismo: {
        titulo: 'Cada mecanismo sirve para algo distinto',
        idea: 'El plebiscito apoya o rechaza una decisión del Ejecutivo; el referendo aprueba o rechaza una norma; la revocatoria termina el mandato de un alcalde o gobernador; el cabildo abierto es una reunión pública; la tutela y las acciones populares protegen derechos.',
        ejemplo: 'Si quieren votar para terminar el mandato de un alcalde, el mecanismo es la revocatoria del mandato.',
        chequeo: 'Subraya qué se quiere lograr (aprobar una norma, terminar un mandato, proteger un derecho) y elige el mecanismo hecho para eso.',
    },
    consecuencia: {
        titulo: 'Una consecuencia debe salir de la situación',
        idea: 'Para elegir una causa o consecuencia razonable, pregúntate qué pasa de verdad cuando ocurre lo que describe el enunciado, sin inventar ni exagerar.',
        ejemplo: 'Si se cierra la única fábrica de un pueblo, lo razonable es que haya más desempleo y menos ventas en el comercio.',
        chequeo: 'Comprueba que tu opción se deriva del enunciado y que no usa palabras como «siempre» o «nunca» sin necesidad.',
    },
    // ---- Inglés ----
    vocabulario: {
        titulo: 'Cuidado con los falsos amigos',
        idea: 'Algunas palabras en inglés se parecen al español pero significan otra cosa. Si una palabra «te suena», comprueba que tenga sentido en la oración.',
        ejemplo: '«Actually» significa en realidad (no actualmente) y «embarrassed» significa avergonzado (no embarazado).',
        chequeo: 'Lee la oración completa con el significado que elegiste. Si no tiene sentido, probablemente es un falso amigo.',
    },
    gramatica: {
        titulo: 'La pista de tiempo decide el verbo',
        idea: 'Palabras como yesterday, now, every day o since te dicen el tiempo verbal. Con he, she o it el verbo en presente lleva -s.',
        ejemplo: 'Every day she goes; yesterday she went; right now she is going.',
        chequeo: 'Busca la pista de tiempo en la oración y revisa quién es el sujeto antes de elegir.',
    },
    textocorto: {
        titulo: 'Responde con el dato exacto del texto',
        idea: 'En un aviso o mensaje corto hay varios datos parecidos (días, horas, precios). Antes de elegir, ubica qué dato te piden y vuelve a leer esa parte.',
        ejemplo: 'Si un aviso dice «todo con 30% de descuento, zapatos con 50%», el descuento de los zapatos es 50%.',
        chequeo: 'Pon el dedo en la frase del texto que respalda tu respuesta. Si no la encuentras, cambia de opción.',
    },
    funcion: {
        titulo: 'Responde a lo que la situación pide',
        idea: 'Una respuesta puede estar bien escrita en inglés y aun así no responder a la pregunta. Identifica qué función cumple la situación: ofrecer, agradecer, pedir indicaciones, mostrar empatía.',
        ejemplo: 'Si alguien dice «I have a headache», una respuesta como «I’m sorry to hear that» cumple la función de mostrar empatía.',
        chequeo: 'Pregúntate: ¿qué está haciendo la otra persona con esa frase (preguntar, ofrecer, quejarse)? Mi respuesta debe corresponder.',
    },
    conector: {
        titulo: 'El conector depende de cómo se relacionan las ideas',
        idea: 'But marca contraste, because marca razón, so marca consecuencia. Con los días se usa on, con las horas exactas at y con ciudades o países in.',
        ejemplo: 'It was raining, so we took an umbrella (consecuencia). We took an umbrella because it was raining (razón).',
        chequeo: 'Pregúntate si la segunda idea es un contraste, una razón o un resultado, y elige el conector que lo dice.',
    },
};
