// Preguntas de Ciencias naturales, Sociales y ciudadanas e Inglés.
// A diferencia de cuantitativo y lectura crítica, aquí cada pregunta es una ficha revisada a mano
// (no se sortean números). Cada opción incorrecta está ligada a un tipo de error.
// Contenido original: no proviene de pruebas del ICFES.

const POR_DEFECTO = {
  variables: 'Confunde qué se cambia, qué se mide o qué debe mantenerse igual en un experimento.',
  grafica: 'No coincide con lo que muestran los datos de la tabla.',
  concepto: 'Aplica mal el concepto científico.',
  fenomeno: 'Esa causa no explica el fenómeno.',
  conclusion: 'Los datos no alcanzan para concluir eso.',
  derechos: 'Confunde un derecho, un deber o la acción que sirve para protegerlos.',
  perspectiva: 'No reconoce el punto de vista de quien habla.',
  hechoopinion: 'Confunde lo que se puede comprobar con lo que es una valoración.',
  mecanismo: 'Ese mecanismo no corresponde a lo que describe la situación.',
  consecuencia: 'No es una causa o consecuencia razonable de lo que se describe.',
  vocabulario: 'Confunde el significado de la palabra (cuidado con los falsos amigos).',
  gramatica: 'La forma verbal no concuerda con el tiempo o con el sujeto.',
  textocorto: 'No coincide con lo que dice el texto.',
  funcion: 'No cumple la función comunicativa de la situación.',
  conector: 'Ese conector o preposición no encaja en la oración.',
}

/** d: { q enunciado, x texto?, t tabla?, p pista, c correcta, m [[texto, tipoDeError, porqué?]×3], e explicación } */
function ficha(competencia, tipo, id, d, transferencia = false) {
  return {
    id,
    tipo,
    competencia,
    ...(transferencia ? { transferencia: true } : {}),
    generar: () => ({
      enunciado: d.q,
      ...(d.x ? { texto: d.x } : {}),
      ...(d.t ? { tabla: d.t } : {}),
      pista: d.p,
      correcta: { texto: d.c },
      incorrectas: d.m.map(([texto, error, porque]) => ({ texto, error, porque: porque ?? POR_DEFECTO[error] })),
      explicacion: `La respuesta es «${d.c}». ${d.e}`,
    }),
  }
}
const N = (tipo, id, d, tr) => ficha('naturales', tipo, id, d, tr)
const C = (tipo, id, d, tr) => ficha('ciudadanas', tipo, id, d, tr)
const E = (tipo, id, d, tr) => ficha('ingles', tipo, id, d, tr)

// ======================================= CIENCIAS NATURALES =======================================
const naturales = [
  // ---- variables ----
  N('variables', 'nat-var-luz', {
    q: 'Una estudiante quiere saber si la cantidad de luz afecta el crecimiento del fríjol. Pone 4 matas en un lugar con luz y 4 en un lugar oscuro, y mide la altura de cada mata cada semana. ¿Cuál es la variable independiente?',
    p: 'La variable independiente es la que la persona cambia a propósito para ver su efecto.',
    c: 'La cantidad de luz',
    m: [['La altura de las matas', 'variables', 'La altura es lo que se mide como resultado: es la variable dependiente.'], ['El número de semanas', 'variables'], ['El tipo de planta (fríjol)', 'variables', 'El tipo de planta es igual en todos los grupos: es una variable controlada.']],
    e: 'Se cambia la luz a propósito; la altura es lo que se mide para ver el efecto.',
  }),
  N('variables', 'nat-var-abono', {
    q: 'Para probar si un abono acelera la germinación de semillas, se usan tres grupos de semillas: uno sin abono y dos con distinta cantidad de abono. ¿Qué debe mantenerse igual en los tres grupos?',
    p: 'Si cambian varias cosas a la vez, no sabrás cuál produjo el resultado.',
    c: 'El tipo de semilla, la cantidad de agua y la temperatura',
    m: [['La cantidad de abono que recibe cada grupo', 'variables', 'La cantidad de abono es justo lo que se quiere comparar, así que debe cambiar.'], ['El día en que germina cada semilla de cada grupo', 'variables', 'Eso es lo que se mide como resultado: no se puede mantener igual.'], ['Nada: cada grupo debe tener condiciones distintas', 'conclusion', 'Si todo cambia, no se puede saber qué causó la diferencia.']],
    e: 'Solo debe cambiar el abono; todo lo demás se mantiene igual para que la comparación sea justa.',
  }),
  N('variables', 'nat-var-tableta', {
    q: 'Un grupo mide cuánto tarda en disolverse una tableta efervescente en agua a 10 °C, 30 °C y 50 °C. ¿Cuál es la variable dependiente?',
    p: 'La variable dependiente es la que se mide como resultado del experimento.',
    c: 'El tiempo que tarda en disolverse',
    m: [['La temperatura del agua en cada vaso', 'variables', 'La temperatura es la que se cambia a propósito: es la independiente.'], ['La cantidad de agua que se usa en cada prueba', 'variables'], ['El tipo de tableta que se disuelve', 'variables']],
    e: 'El tiempo de disolución depende de la temperatura; por eso es la variable que se mide.',
  }),
  N('variables', 'nat-var-rampa', {
    q: 'Pedro quiere saber si la longitud de una rampa cambia la distancia que recorre un carrito. Usa una rampa corta con un carrito liviano y una rampa larga con un carrito pesado. ¿Qué problema tiene el experimento?',
    p: 'Cuenta cuántas cosas cambian entre un grupo y otro.',
    c: 'Cambian dos cosas a la vez (la rampa y el carrito), y no se sabe cuál causó la diferencia',
    m: [['Ninguno: las rampas son distintas, así que la comparación es válida', 'conclusion'], ['Que solo se usan dos rampas para comparar la longitud', 'variables', 'Dos rampas bastan para comparar; el problema es otro.'], ['Que se mide la distancia que recorre cada carrito en lugar de otra variable', 'variables']],
    e: 'Para comparar la rampa, el carrito debe ser el mismo en las dos pruebas.',
  }),
  N('variables', 'nat-var-pan', {
    q: 'Una cocinera prueba si el tiempo de reposo de la masa cambia el tamaño del pan. Hornea tres panes con reposo de 30, 60 y 90 minutos, con la misma receta y el mismo horno. ¿Cuál es la variable independiente y cuál la dependiente?',
    p: 'Independiente: lo que cambia a propósito. Dependiente: lo que se mide al final.',
    c: 'Independiente: el tiempo de reposo; dependiente: el tamaño del pan',
    m: [['Independiente: el tamaño del pan; dependiente: el tiempo de reposo', 'variables', 'Está al revés: el tamaño se mide, el reposo se cambia.'], ['Independiente: la receta; dependiente: el horno', 'variables', 'La receta y el horno son iguales en los tres panes: se mantienen controlados.'], ['Independiente: el horno; dependiente: la receta', 'variables']],
    e: 'La cocinera cambia el reposo y mide el tamaño que resulta.',
  }, true),

  // ---- grafica ----
  N('grafica', 'nat-gra-agua', {
    q: 'La tabla muestra la temperatura del agua mientras se calienta. ¿Cuántos grados aumenta la temperatura cada 2 minutos?',
    t: { encabezados: ['Minuto', 'Temperatura (°C)'], filas: [['0', '20'], ['2', '35'], ['4', '50'], ['6', '65'], ['8', '80']] },
    p: 'Resta dos valores seguidos de la columna de temperatura.',
    c: '15 °C cada 2 minutos',
    m: [['7,5 °C cada 2 minutos', 'grafica', 'Eso sería lo que aumenta cada minuto, no cada 2 minutos.'], ['60 °C cada 2 minutos', 'grafica', 'Eso es lo que aumentó en total, en 8 minutos.'], ['80 °C cada 2 minutos', 'grafica', 'Esa es la temperatura final, no el aumento.']],
    e: 'De 20 a 35, de 35 a 50, de 50 a 65: sube 15 °C en cada intervalo de 2 minutos.',
  }),
  N('grafica', 'nat-gra-planta', {
    q: 'La tabla muestra la altura de una planta. ¿Qué ocurrió entre la semana 4 y la semana 5?',
    t: { encabezados: ['Semana', 'Altura (cm)'], filas: [['1', '2'], ['2', '5'], ['3', '9'], ['4', '12'], ['5', '12']] },
    p: 'Compara los dos valores y fíjate si cambió o no.',
    c: 'La planta dejó de crecer: su altura siguió en 12 cm',
    m: [['La planta creció 12 cm más durante esa semana', 'grafica', 'Esos 12 cm son la altura total, no lo que creció esa semana.'], ['La planta se encogió un poco, porque la altura bajó', 'grafica'], ['La planta creció más rápido que antes', 'grafica']],
    e: 'La altura fue 12 cm en la semana 4 y 12 cm en la semana 5; no hubo cambio.',
  }),
  N('grafica', 'nat-gra-lluvia', {
    q: 'La tabla muestra la lluvia de un municipio. ¿En qué mes llovió más y cuánto más que el mes anterior?',
    t: { encabezados: ['Mes', 'Lluvia (mm)'], filas: [['Enero', '40'], ['Febrero', '55'], ['Marzo', '120'], ['Abril', '210'], ['Mayo', '180']] },
    p: 'Primero encuentra el mes con el valor más alto; luego réstale el valor del mes anterior.',
    c: 'Abril, 90 mm más que marzo',
    m: [['Abril, 210 mm más que marzo', 'grafica', 'Esos 210 mm son lo que llovió en abril, no la diferencia con marzo.'], ['Mayo, 60 mm más que abril', 'grafica', 'En mayo llovió menos que en abril.'], ['Marzo, 65 mm más que febrero', 'grafica', 'Marzo no es el mes con más lluvia de la tabla.']],
    e: 'El mayor valor es abril (210 mm). 210 menos 120 da 90 mm de diferencia con marzo.',
  }),
  N('grafica', 'nat-gra-solub', {
    q: 'La tabla muestra, de forma aproximada, cuántos gramos de cada sustancia se disuelven en 100 mL de agua. Al subir la temperatura de 20 °C a 60 °C, ¿qué sustancia cambió más su solubilidad?',
    t: { encabezados: ['Temperatura (°C)', 'Sal (g)', 'Azúcar (g)'], filas: [['20', '36', '204'], ['40', '36', '238'], ['60', '37', '287']] },
    p: 'Mira cuánto cambia cada columna, no cuál número es más grande.',
    c: 'El azúcar: aumentó 83 g',
    m: [['La sal: aumentó 37 g', 'grafica', 'Esos 37 g son el valor a 60 °C, no lo que aumentó.'], ['El azúcar: aumentó 287 g', 'grafica', 'Esos 287 g son el valor final, no el aumento.'], ['Las dos cambiaron igual porque ambas aumentan', 'conclusion', 'Ambas aumentan, pero el azúcar aumenta muchísimo más que la sal.']],
    e: 'El azúcar pasó de 204 g a 287 g (83 g más); la sal solo pasó de 36 g a 37 g.',
  }),
  N('grafica', 'nat-gra-bici', {
    q: 'La tabla muestra la distancia que recorre una bicicleta que va siempre a la misma velocidad. ¿Cuál es su velocidad?',
    t: { encabezados: ['Tiempo (s)', 'Distancia (m)'], filas: [['0', '0'], ['5', '20'], ['10', '40'], ['15', '60']] },
    p: 'Velocidad es la distancia dividida entre el tiempo.',
    c: '4 m/s',
    m: [['60 m/s', 'grafica', 'Esos 60 m son la distancia final; falta dividirla entre el tiempo.'], ['0,25 m/s', 'grafica', 'Dividiste al revés: el tiempo entre la distancia.'], ['20 m/s', 'grafica', 'Esos 20 m se recorren en 5 segundos; falta dividir entre 5.']],
    e: '60 m entre 15 s dan 4 m/s; también 20 m entre 5 s.',
  }, true),

  // ---- concepto ----
  N('concepto', 'nat-con-masa', {
    q: 'Un astronauta lleva una piedra a la Luna, donde la gravedad es menor que en la Tierra. ¿Qué pasa con la masa y el peso de la piedra?',
    p: 'La masa es la cantidad de materia; el peso depende de la gravedad.',
    c: 'La masa es igual y el peso es menor',
    m: [['La masa y el peso son iguales', 'concepto', 'El peso depende de la gravedad, y en la Luna es menor.'], ['La masa es menor y el peso es igual', 'concepto', 'Está al revés: la masa no cambia, el peso sí.'], ['La masa y el peso son menores', 'concepto', 'La cantidad de materia de la piedra no cambia al viajar.']],
    e: 'La piedra tiene la misma cantidad de materia, pero la Luna la atrae con menos fuerza.',
  }),
  N('concepto', 'nat-con-calor', {
    q: 'Una taza de agua y una olla grande con agua están a la misma temperatura, 90 °C. ¿Cuál tiene más energía térmica total?',
    p: 'Temperatura y cantidad de energía no son lo mismo: piensa en cuánta agua hay.',
    c: 'La olla, porque tiene más agua a la misma temperatura',
    m: [['La taza, porque es más pequeña', 'concepto'], ['Las dos tienen la misma energía porque tienen la misma temperatura', 'concepto', 'La temperatura no mide la cantidad total de energía; también importa cuánta materia hay.'], ['Ninguna, porque el agua caliente no guarda energía', 'concepto']],
    e: 'Con la misma temperatura, más agua significa más energía térmica total.',
  }),
  N('concepto', 'nat-con-foto', {
    q: 'Durante la fotosíntesis, una planta usa luz, agua y dióxido de carbono. ¿Qué produce?',
    p: 'Piensa en lo que la planta fabrica para alimentarse y en lo que libera al aire.',
    c: 'Glucosa y oxígeno',
    m: [['Dióxido de carbono y agua', 'concepto', 'Eso es lo que producen las células al respirar, no al hacer fotosíntesis.'], ['Glucosa y dióxido de carbono', 'concepto', 'El dióxido de carbono es lo que la planta usa, no lo que produce.'], ['Nitrógeno y oxígeno', 'concepto']],
    e: 'La planta fabrica glucosa (su alimento) y libera oxígeno.',
  }),
  N('concepto', 'nat-con-hielo', {
    q: 'Un cubo de hielo se derrite y queda agua líquida. ¿Qué tipo de cambio es?',
    p: 'Pregúntate si aparece una sustancia nueva o si sigue siendo la misma.',
    c: 'Un cambio físico: sigue siendo agua',
    m: [['Un cambio químico: se forma una sustancia nueva', 'concepto', 'No se forma ninguna sustancia nueva: sigue siendo H2O.'], ['Un cambio químico: cambió de forma', 'concepto', 'Cambiar de forma o de estado no es, por sí solo, un cambio químico.'], ['No hay cambio: la masa se conserva', 'concepto', 'Sí hay cambio (de estado), aunque la masa se conserve.']],
    e: 'Pasa de estado sólido a líquido, pero la sustancia no cambia.',
  }),
  N('concepto', 'nat-con-circuito', {
    q: 'En un circuito en serie con dos bombillos iguales, uno se quema. ¿Qué pasa con el otro?',
    p: 'En serie, la corriente tiene un solo camino.',
    c: 'Se apaga, porque el circuito queda abierto',
    m: [['Sigue prendido igual, porque cada bombillo funciona solo', 'concepto', 'Eso pasaría en un circuito en paralelo, no en serie.'], ['Brilla más, porque le llega toda la corriente', 'concepto'], ['Brilla menos, porque la corriente se reparte', 'concepto']],
    e: 'En serie hay un solo camino: si un bombillo se quema, la corriente se interrumpe y el otro se apaga.',
  }, true),

  // ---- fenomeno ----
  N('fenomeno', 'nat-fen-estaciones', {
    q: '¿Por qué hay estaciones (verano, invierno) en lugares alejados del ecuador?',
    p: 'Piensa en cómo está inclinado el eje de la Tierra mientras da la vuelta al Sol.',
    c: 'Porque el eje de la Tierra está inclinado y cada zona recibe distinta luz solar durante el año',
    m: [['Porque la Tierra se acerca y se aleja mucho del Sol', 'fenomeno', 'La distancia cambia muy poco; lo que importa es la inclinación del eje.'], ['Porque la Tierra gira sobre su eje cada 24 horas', 'fenomeno', 'Esa rotación produce el día y la noche, no las estaciones.'], ['Porque la Luna tapa la luz del Sol durante varios meses', 'fenomeno']],
    e: 'La inclinación del eje cambia cuánta luz recibe cada hemisferio a lo largo del año.',
  }),
  N('fenomeno', 'nat-fen-sudor', {
    q: '¿Por qué sudar nos refresca cuando hace calor?',
    p: 'Piensa en qué le pasa al agua del sudor sobre la piel.',
    c: 'Porque al evaporarse el sudor toma calor de la piel',
    m: [['Porque el sudor es más frío que el cuerpo', 'fenomeno', 'El sudor sale casi a la temperatura del cuerpo; lo que enfría es su evaporación.'], ['Porque al sudar el cuerpo produce menos calor', 'fenomeno'], ['Porque el sudor tapa los poros y bloquea el calor', 'fenomeno']],
    e: 'Evaporarse requiere energía, y el sudor la toma de la piel, que se enfría.',
  }),
  N('fenomeno', 'nat-fen-vaso', {
    q: 'En un día caluroso, un vaso con agua fría se llena de gotas por fuera. ¿Por qué?',
    p: 'Piensa en el vapor de agua que ya está en el aire.',
    c: 'El vapor de agua del aire se condensa al tocar el vidrio frío',
    m: [['El agua del vaso atraviesa poco a poco el vidrio', 'fenomeno', 'El vidrio no deja pasar el agua.'], ['El vidrio produce agua cuando se enfría', 'fenomeno'], ['El agua del vaso se evapora y se pega por fuera', 'fenomeno', 'Esa agua sigue dentro del vaso; las gotas vienen del aire.']],
    e: 'El vapor del aire se enfría al tocar el vidrio y vuelve a estado líquido.',
  }),
  N('fenomeno', 'nat-fen-trueno', {
    q: 'Durante una tormenta vemos primero el relámpago y después oímos el trueno. ¿Por qué?',
    p: 'Compara qué tan rápido viaja la luz y qué tan rápido viaja el sonido.',
    c: 'Porque la luz viaja mucho más rápido que el sonido',
    m: [['Porque el sonido viaja más rápido que la luz', 'fenomeno', 'Es al revés: la luz es muchísimo más rápida.'], ['Porque el rayo primero produce luz y solo después produce ruido', 'fenomeno', 'La luz y el ruido se producen al mismo tiempo; llegan en momentos distintos.'], ['Porque el trueno ocurre siempre después del relámpago', 'fenomeno']],
    e: 'Ambos ocurren a la vez, pero la luz llega casi al instante y el sonido tarda más.',
  }),
  N('fenomeno', 'nat-fen-cuchara', {
    q: 'Una cuchara de metal metida en una sopa caliente se calienta mucho más rápido que una de madera. ¿Por qué?',
    p: 'Piensa en qué materiales dejan pasar mejor el calor.',
    c: 'Porque el metal conduce mejor el calor que la madera',
    m: [['Porque el metal produce calor por sí mismo', 'fenomeno', 'El metal no fabrica calor: lo recibe de la sopa.'], ['Porque la sopa solo calienta los metales', 'fenomeno'], ['Porque la madera transmite el frío hacia la sopa', 'fenomeno', 'El frío no se transmite: el calor pasa del cuerpo más caliente al más frío.']],
    e: 'El metal transmite el calor con facilidad; la madera es mal conductora.',
  }, true),

  // ---- conclusion ----
  N('conclusion', 'nat-con-fertil', {
    q: 'Se probó un fertilizante en 10 matas y todas crecieron más que otras 10 sin fertilizante. ¿Qué conclusión apoyan los datos?',
    p: 'Concluye solo lo que los datos permiten, sin generalizar de más.',
    c: 'El fertilizante parece ayudar a estas matas, pero habría que repetir la prueba',
    m: [['El fertilizante funciona en todas las plantas del mundo', 'conclusion', 'Se probó en 10 matas de un tipo: no se puede generalizar a todas.'], ['El fertilizante es el único factor que hace crecer a las plantas', 'conclusion', 'El agua, la luz y el suelo también influyen.'], ['El fertilizante no tuvo ningún efecto sobre el crecimiento de las matas', 'conclusion', 'Los datos muestran lo contrario.']],
    e: 'Los datos sugieren un efecto en este caso, pero son pocos para generalizar.',
  }),
  N('conclusion', 'nat-con-helado', {
    q: 'En una ciudad, en los meses en que se vende más helado también hay más ahogamientos en piscinas. ¿Qué conclusión es válida?',
    p: 'Dos cosas que ocurren juntas no siempre se causan entre sí.',
    c: 'Ambos aumentan en los meses de calor; comer helado no causa los ahogamientos',
    m: [['Comer helado causa ahogamientos, porque ambos suben juntos', 'conclusion', 'Que dos cosas coincidan no prueba que una cause la otra.'], ['Los ahogamientos hacen que se venda más helado', 'conclusion'], ['Prohibir la venta de helado reduciría los ahogamientos en piscinas', 'conclusion']],
    e: 'El calor explica ambos aumentos: más gente come helado y más gente va a las piscinas.',
  }),
  N('conclusion', 'nat-con-rios', {
    q: 'Se midió el oxígeno disuelto en tres ríos: el río A tiene 8 mg/L, el río B tiene 4 mg/L y el río C tiene 7 mg/L. ¿Qué conclusión se apoya en estos datos?',
    p: 'Elige la afirmación que se puede comprobar con esos tres números.',
    c: 'El río B tiene menos oxígeno disuelto que los ríos A y C',
    m: [['El río B está contaminado por actividad humana', 'conclusion', 'Los datos muestran menos oxígeno, pero no prueban por sí solos que haya contaminación.'], ['El río A es el río más limpio de todo el país', 'conclusion', 'Solo se midieron tres ríos.'], ['Los tres ríos tienen peces y plantas en buen estado', 'conclusion', 'No se midió nada sobre peces.']],
    e: 'Solo se puede afirmar lo que muestran los números: 4 mg/L es menor que 8 y que 7.',
  }),
  N('conclusion', 'nat-con-jarabe', {
    q: 'Probaron un jarabe con solo 3 personas y a 2 se les quitó la tos. Un anuncio dice: «Comprobado: 2 de cada 3 personas se curan». ¿Qué problema tiene esa conclusión?',
    p: 'Piensa en cuántas personas se probaron y con qué se compararon.',
    c: 'Con solo 3 personas y sin comparación no se puede concluir que el jarabe cure',
    m: [['Ninguno: 2 de 3 es mayoría y eso prueba el efecto', 'conclusion', 'Con tan pocos casos, el resultado puede ser casualidad.'], ['Que 3 personas son demasiadas para hacer una prueba confiable', 'conclusion'], ['Que las personas probadas no tenían tos desde antes', 'conclusion']],
    e: 'La muestra es muy pequeña y la tos también puede quitarse sola.',
  }),
  N('conclusion', 'nat-con-encuesta', {
    q: 'En una encuesta a 15 estudiantes de un salón, 12 prefieren el fútbol. Un periodista escribe: «A los jóvenes de Colombia les gusta más el fútbol». ¿Qué falla?',
    p: 'Compara el tamaño de la muestra con el grupo al que se generaliza.',
    c: 'Generaliza a todo un país a partir de un solo salón pequeño',
    m: [['Que 12 de 15 no es una mayoría en ese salón', 'conclusion', '12 de 15 sí es mayoría, pero solo en ese salón.'], ['Que el fútbol no es un deporte que les guste a los jóvenes', 'conclusion'], ['Que los jóvenes no pueden responder encuestas sobre deportes', 'conclusion']],
    e: 'Una muestra pequeña de un solo grupo no representa a todos los jóvenes del país.',
  }, true),
]

// ================================= SOCIALES Y CIUDADANAS =================================
const ciudadanas = [
  // ---- derechos ----
  C('derechos', 'ciu-der-tutela', {
    q: 'A una persona le niegan una atención médica urgente y no tiene otra forma rápida de proteger su derecho a la salud y a la vida. ¿Qué acción puede usar?',
    p: 'Piensa en la acción creada para proteger derechos fundamentales de forma rápida.',
    c: 'Una acción de tutela',
    m: [['Una revocatoria del mandato', 'mecanismo', 'La revocatoria sirve para terminar el mandato de un alcalde o gobernador, no para proteger un derecho.'], ['Un referendo', 'mecanismo', 'El referendo sirve para aprobar o rechazar una norma.'], ['Esperar a que termine el año para volver a pedir el servicio', 'derechos', 'Un derecho fundamental en riesgo se puede proteger de inmediato.']],
    e: 'La tutela protege derechos fundamentales cuando están amenazados y el juez debe decidir con rapidez.',
  }),
  C('derechos', 'ciu-der-deber', {
    q: '¿Cuál de las siguientes opciones es un deber de las personas según la Constitución de 1991?',
    p: 'Un deber es algo que debo hacer; un derecho es algo que puedo exigir.',
    c: 'Respetar los derechos ajenos y no abusar de los propios',
    m: [['Expresar libremente su opinión sin censura previa', 'derechos', 'Es un derecho, no un deber.'], ['Circular libremente por el territorio nacional', 'derechos', 'Es un derecho, no un deber.'], ['Que el Estado le garantice un empleo a toda persona que lo pida', 'derechos', 'La Constitución no garantiza un empleo a cada persona.']],
    e: 'Es uno de los deberes de la persona y del ciudadano en la Constitución.',
  }),
  C('derechos', 'ciu-der-peticion', {
    q: '¿Qué permite el derecho de petición?',
    p: 'Pedir no es lo mismo que obligar a que acepten.',
    c: 'Pedir algo con respeto a las autoridades y recibir una respuesta',
    m: [['Obligar a la autoridad a aceptar lo que se pide', 'derechos', 'Obliga a responder, no a aceptar.'], ['Pedirle a un juez que anule una ley o una sentencia', 'derechos', 'Eso corresponde a otras acciones, no al derecho de petición.'], ['Exigir que un funcionario renuncie a su cargo si no responde', 'derechos']],
    e: 'La autoridad debe contestar de fondo y a tiempo, aunque la respuesta sea negativa.',
  }),
  C('derechos', 'ciu-der-titulares', {
    q: '¿Quiénes tienen derechos fundamentales en Colombia?',
    p: 'Los derechos fundamentales se reconocen por ser persona.',
    c: 'Todas las personas, incluidos niños y niñas',
    m: [['Solo los mayores de edad que votan', 'derechos', 'Los niños y niñas también tienen derechos, y con especial protección.'], ['Solo quienes tienen cédula o documento de identidad', 'derechos'], ['Solo quienes nacieron en Colombia y viven aquí', 'derechos']],
    e: 'Los derechos fundamentales se reconocen a todas las personas por su dignidad.',
  }),
  C('derechos', 'ciu-der-vecino', {
    q: 'En un conjunto residencial, un vecino pone música muy fuerte toda la noche y dice: «En mi casa hago lo que quiera». ¿Qué principio ignora?',
    p: 'Piensa en dónde terminan los derechos de una persona.',
    c: 'Que sus derechos terminan donde empiezan los de los demás: debe respetar el descanso',
    m: [['Ninguno: dentro de su casa puede hacer lo que quiera sin límites', 'derechos', 'Nadie puede ejercer sus derechos afectando los de los demás.'], ['Que los vecinos deben irse del conjunto si no soportan el ruido', 'derechos'], ['Que la música está prohibida en todos los edificios del país', 'derechos']],
    e: 'Ejercer un derecho no autoriza a afectar los derechos de otros.',
  }, true),

  // ---- perspectiva ----
  C('perspectiva', 'ciu-per-represa', {
    q: 'Una empresa quiere construir una represa para producir energía. Los pescadores de la zona se oponen. ¿Por qué se oponen, probablemente?',
    p: 'Pregúntate qué podría perder cada grupo.',
    c: 'Porque puede afectar los peces de los que depende su trabajo',
    m: [['Porque no les gusta la energía eléctrica', 'perspectiva'], ['Porque la represa mejora la pesca', 'perspectiva', 'Si la mejorara, no se opondrían.'], ['Porque solo quieren que la empresa no gane dinero', 'perspectiva', 'Eso supone una intención que la situación no muestra.']],
    e: 'Su oposición tiene que ver con su forma de vida, que depende del río.',
  }),
  C('perspectiva', 'ciu-per-peaton', {
    q: 'Un texto dice: «Los comerciantes temen que peatonalizar el centro baje sus ventas; los peatones y ciclistas creen que lo hará más seguro y agradable». ¿Qué muestra el texto?',
    p: 'Mira qué quiere o teme cada grupo.',
    c: 'Que dos grupos con intereses distintos ven distinta la misma medida',
    m: [['Que la medida es mala para toda la ciudad', 'perspectiva', 'El texto no da un veredicto sobre la medida.'], ['Que todos los habitantes de la ciudad piensan igual sobre la medida', 'perspectiva'], ['Que los comerciantes no quieren seguridad', 'perspectiva', 'Su preocupación es por las ventas, no contra la seguridad.']],
    e: 'Cada grupo mira la medida desde lo que le conviene o le preocupa.',
  }),
  C('perspectiva', 'ciu-per-fuentes', {
    q: 'Un cronista español y un cacique indígena de la época cuentan de forma distinta la llegada de los españoles a América. ¿Cómo se explica?',
    p: 'Pregúntate desde dónde habla cada autor.',
    c: 'Cada autor cuenta desde su posición, por eso conviene contrastar fuentes',
    m: [['Una de las dos miente y la otra es completamente neutral', 'perspectiva', 'Ninguna fuente es completamente neutral; todas hablan desde un lugar.'], ['Las fuentes antiguas nunca sirven para estudiar la historia', 'perspectiva'], ['Esos hechos nunca ocurrieron, solo son leyendas', 'perspectiva']],
    e: 'Comparar fuentes con puntos de vista distintos permite acercarse mejor a lo ocurrido.',
  }),
  C('perspectiva', 'ciu-per-plastico', {
    q: 'En un debate sobre prohibir el plástico de un solo uso, un fabricante dice que se perderán empleos y una ambientalista dice que contamina los mares. ¿Qué tienen en común sus argumentos?',
    p: 'Busca qué defiende cada persona.',
    c: 'Ambos defienden algo que consideran valioso: el empleo y el ambiente',
    m: [['Ninguno de los dos tiene argumentos válidos para el debate', 'perspectiva'], ['Los dos creen que el plástico debe prohibirse', 'perspectiva', 'El fabricante se opone a prohibirlo.'], ['Los dos desconocen el problema del que están hablando', 'perspectiva']],
    e: 'Cada uno protege un valor distinto, y ese es el origen del desacuerdo.',
  }),
  C('perspectiva', 'ciu-per-jornada', {
    q: 'En un colegio proponen que la jornada empiece más tarde. Los estudiantes dicen que dormirán mejor; los transportadores escolares dicen que no podrán cubrir sus rutas. ¿Qué haría un diálogo respetuoso?',
    p: 'Un buen diálogo reconoce las razones de todos los involucrados.',
    c: 'Escuchar a ambos grupos y buscar una solución que atienda las dos necesidades',
    m: [['Imponer lo que decida quien tenga más votos sin escuchar a los demás', 'perspectiva'], ['Descartar a los transportadores porque no son estudiantes', 'perspectiva', 'Los transportadores también se ven afectados por la decisión.'], ['Elegir la opción más rápida sin conversar', 'perspectiva']],
    e: 'Dialogar es escuchar las razones de cada parte y buscar acuerdos.',
  }, true),

  // ---- hechoopinion ----
  C('hechoopinion', 'ciu-hec-const', {
    q: '¿Cuál de las siguientes afirmaciones es un hecho que se puede verificar?',
    p: 'Un hecho se puede comprobar con datos o documentos; una opinión depende de quien habla.',
    c: 'La Constitución Política vigente de Colombia fue promulgada en 1991',
    m: [['La Constitución de 1991 es la mejor que ha tenido el país', 'hechoopinion', '«La mejor» es una valoración, no algo que se compruebe con un dato.'], ['Todos los colombianos deberían leerla cada día', 'hechoopinion'], ['Fue un error cambiar la Constitución anterior', 'hechoopinion']],
    e: 'La fecha de promulgación se puede comprobar en documentos oficiales.',
  }),
  C('hechoopinion', 'ciu-hec-transporte', {
    q: 'La frase «El transporte público de la ciudad es muy malo» es:',
    p: 'Pregúntate si se puede medir o si depende de la valoración de quien habla.',
    c: 'Una opinión, porque depende de la valoración de quien habla',
    m: [['Un hecho, porque la mayoría lo piensa', 'hechoopinion', 'Que muchos lo piensen no la convierte en un hecho comprobable.'], ['Un hecho, porque la dijo un periodista', 'hechoopinion'], ['Una ley aprobada por el Congreso', 'hechoopinion']],
    e: '«Muy malo» es una valoración; para volverla un hecho habría que medir algo, como tiempos de espera.',
  }),
  C('hechoopinion', 'ciu-hec-magdalena', {
    q: '¿Cuál de estas oraciones mezcla un hecho con una opinión?',
    p: 'Busca la oración que tenga una parte comprobable y otra que sea una valoración.',
    c: 'El río Magdalena es el más largo de Colombia, y por eso es el más hermoso',
    m: [['El río Magdalena nace en el Macizo Colombiano', 'hechoopinion', 'Es un hecho comprobable, sin opinión.'], ['El río Magdalena desemboca en el mar Caribe', 'hechoopinion', 'Es un hecho comprobable, sin opinión.'], ['Colombia tiene costas sobre el mar Caribe y sobre el océano Pacífico', 'hechoopinion', 'Es un hecho comprobable, sin opinión.']],
    e: 'Lo de «más largo» se comprueba; lo de «más hermoso» es una opinión.',
  }),
  C('hechoopinion', 'ciu-hec-impuesto', {
    q: 'Un titular dice: «El nuevo impuesto es injusto con los pobres». ¿Qué se necesita para convertirlo en un hecho verificable?',
    p: 'Piensa en qué datos permitirían comprobarlo.',
    c: 'Cambiarlo por datos comprobables, como cuánto paga cada grupo de ingresos',
    m: [['Repetirlo muchas veces en distintos medios', 'hechoopinion', 'Repetir una frase no la vuelve verdadera.'], ['Que un político famoso lo apoye en televisión', 'hechoopinion'], ['Escribirlo en letras grandes y en el titular', 'hechoopinion']],
    e: 'Un hecho se apoya en datos que cualquiera puede revisar.',
  }),
  C('hechoopinion', 'ciu-hec-red', {
    q: 'En una red social lees: «El 60% de los estudiantes del colegio usa bus, según una encuesta». ¿Cómo puedes saber si es confiable?',
    p: 'Revisa de dónde sale el dato, no cuánta gente lo comparte.',
    c: 'Revisando la fuente: cómo se hizo la encuesta y qué datos hay',
    m: [['Mirando si la publicación tiene muchos «me gusta» y comentarios', 'hechoopinion', 'La popularidad no prueba que un dato sea cierto.'], ['Comprobando que la cifra sea redonda y fácil de recordar', 'hechoopinion'], ['Verificando que la publicación sea corta y esté bien escrita', 'hechoopinion']],
    e: 'Un dato confiable tiene fuente clara y método que se pueden revisar.',
  }, true),

  // ---- mecanismo ----
  C('mecanismo', 'ciu-mec-cabildo', {
    q: 'Los habitantes de un barrio quieren participar directamente en una sesión pública del concejo municipal para discutir un asunto de interés de su comunidad. ¿Qué mecanismo de participación usan?',
    p: 'Piensa en el mecanismo que consiste en una reunión pública abierta a la ciudadanía.',
    c: 'Cabildo abierto',
    m: [['Revocatoria del mandato', 'mecanismo'], ['Plebiscito', 'mecanismo'], ['Iniciativa popular legislativa', 'mecanismo']],
    e: 'El cabildo abierto es la reunión pública del concejo, de la asamblea o de la junta administradora local en la que la comunidad discute asuntos de su interés.',
  }),
  C('mecanismo', 'ciu-mec-revoca', {
    q: 'Un grupo de ciudadanos considera que un alcalde incumplió su programa de gobierno y quiere votar para terminar su mandato antes de tiempo. ¿Qué mecanismo es?',
    p: 'Busca el mecanismo que permite terminar un mandato por voto.',
    c: 'Revocatoria del mandato',
    m: [['Cabildo abierto', 'mecanismo'], ['Acción de tutela', 'mecanismo', 'La tutela protege derechos fundamentales; no termina mandatos.'], ['Iniciativa popular legislativa', 'mecanismo']],
    e: 'La revocatoria del mandato permite a los votantes terminar el mandato de un alcalde o gobernador.',
  }),
  C('mecanismo', 'ciu-mec-plebiscito', {
    q: 'El presidente convoca al pueblo para que apoye o rechace una decisión política del gobierno. ¿Qué mecanismo es?',
    p: 'No se vota una norma ni a una persona, sino una decisión del Ejecutivo.',
    c: 'Plebiscito',
    m: [['Referendo', 'mecanismo', 'El referendo se usa para aprobar o rechazar una norma.'], ['Revocatoria del mandato', 'mecanismo'], ['Cabildo abierto', 'mecanismo']],
    e: 'El plebiscito es el pronunciamiento del pueblo convocado por el presidente para apoyar o rechazar una decisión del Ejecutivo.',
  }),
  C('mecanismo', 'ciu-mec-peticion', {
    q: 'Una ciudadana quiere saber en qué se gastó el presupuesto de su municipio y le escribe una solicitud a la alcaldía. ¿Qué derecho está ejerciendo?',
    p: 'Piensa en el derecho de pedir información o solucionar algo a una autoridad.',
    c: 'El derecho de petición',
    m: [['La revocatoria del mandato', 'mecanismo'], ['El plebiscito', 'mecanismo'], ['El cabildo abierto', 'mecanismo']],
    e: 'El derecho de petición permite pedir información y soluciones a las autoridades, y obliga a responder.',
  }),
  C('mecanismo', 'ciu-mec-popular', {
    q: 'Quienes viven junto a una laguna contaminada quieren acudir a un juez para proteger el ambiente sano, un derecho colectivo de toda la comunidad. ¿Qué acción pueden usar?',
    p: 'Es una acción para derechos de toda una comunidad, no de una sola persona.',
    c: 'Una acción popular',
    m: [['Una acción de tutela', 'mecanismo', 'La tutela protege derechos fundamentales de personas concretas; la situación habla de un derecho colectivo.'], ['Una revocatoria del mandato', 'mecanismo'], ['Una iniciativa popular', 'mecanismo']],
    e: 'Las acciones populares protegen los derechos e intereses colectivos, como el ambiente sano.',
  }, true),

  // ---- consecuencia ----
  C('consecuencia', 'ciu-cons-ciudad', {
    q: 'Cuando una ciudad crece muy rápido y sin planeación, ¿cuál es una consecuencia probable?',
    p: 'Piensa en qué necesita más gente viviendo en el mismo lugar.',
    c: 'Más presión sobre el transporte, el agua y otros servicios públicos',
    m: [['Menos necesidad de servicios públicos, porque la gente comparte', 'consecuencia', 'Más habitantes necesitan más servicios, no menos.'], ['Menos contaminación del aire y del agua en todos los casos', 'consecuencia'], ['Más zonas verdes y parques disponibles para cada habitante', 'consecuencia']],
    e: 'Más habitantes demandan más transporte, agua, vivienda y otros servicios.',
  }),
  C('consecuencia', 'ciu-cons-1991', {
    q: 'La Constitución de 1991 reconoció que Colombia es un país pluriétnico y multicultural. ¿Qué consecuencia tuvo?',
    p: 'Busca lo que se deriva de reconocer la diversidad.',
    c: 'Se reconocieron derechos especiales de los pueblos indígenas y afrodescendientes',
    m: [['Se prohibieron las lenguas distintas al español en todo el país', 'consecuencia', 'La Constitución reconoce las lenguas de los grupos étnicos en sus territorios.'], ['Se declaró una sola religión oficial para todo el país', 'consecuencia', 'Al contrario: se reconoció la libertad de cultos.'], ['Se eliminaron los territorios indígenas para integrarlos al Estado', 'consecuencia']],
    e: 'Reconocer la diversidad llevó a proteger derechos y territorios de estos pueblos.',
  }),
  C('consecuencia', 'ciu-cons-fabrica', {
    q: 'En un municipio se cierra la única fábrica. ¿Cuál es una consecuencia social probable?',
    p: 'Piensa en qué pasa con el empleo y con los negocios que dependen de él.',
    c: 'Más desempleo y menos ingresos para los comercios cercanos',
    m: [['Más empleos formales en la zona y mayores salarios', 'consecuencia'], ['Aumenta el ingreso de las familias que trabajaban allí', 'consecuencia'], ['Aumenta la producción local de bienes en el municipio', 'consecuencia']],
    e: 'Sin la fábrica hay menos empleo, y con menos ingresos los comercios venden menos.',
  }),
  C('consecuencia', 'ciu-cons-desplaz', {
    q: '¿Cuál ha sido una causa del desplazamiento forzado interno en Colombia?',
    p: 'Piensa en situaciones que obligan a las familias a irse de su territorio.',
    c: 'La violencia del conflicto armado, que obliga a familias a dejar su territorio',
    m: [['Un decreto que obliga a todos a vivir en las ciudades', 'consecuencia', 'Ese decreto no existe.'], ['El interés de las familias por cambiar de paisaje y de clima', 'consecuencia', 'El desplazamiento forzado no es una decisión voluntaria.'], ['Una celebración tradicional que se hace cada año en las veredas', 'consecuencia']],
    e: 'El desplazamiento forzado ocurre cuando la violencia obliga a las familias a irse.',
  }),
  C('consecuencia', 'ciu-cons-recreo', {
    q: 'Un colegio quita los descansos para tener más tiempo de clase. ¿Cuál es una consecuencia probable?',
    p: 'Piensa en qué pierden los estudiantes sin ese espacio.',
    c: 'Menos espacio para descansar y socializar, lo que puede afectar la convivencia',
    m: [['Mejor convivencia, porque hay menos contacto entre estudiantes', 'consecuencia'], ['Más descanso para los estudiantes durante la jornada', 'consecuencia'], ['Ningún cambio en el ánimo ni en la atención de los estudiantes', 'consecuencia']],
    e: 'Los descansos sirven para recuperar energía y convivir; sin ellos se pierden esos beneficios.',
  }, true),
]

// ======================================== INGLÉS ========================================
const ingles = [
  // ---- vocabulario ----
  E('vocabulario', 'ing-voc-library', {
    q: 'Completa: «I need to borrow a book, so I am going to the ______.»',
    p: 'Piensa en el lugar donde se prestan libros (borrow).',
    c: 'library',
    m: [['bookstore', 'vocabulario', '«Bookstore» es librería, donde se compran libros; «library» es biblioteca.'], ['bakery', 'vocabulario'], ['pharmacy', 'vocabulario']],
    e: '«Library» significa biblioteca, el lugar donde se prestan libros.',
  }),
  E('vocabulario', 'ing-voc-actually', {
    q: 'En «Actually, I don’t like pizza», ¿qué significa «actually»?',
    p: 'Es un falso amigo: no se parece a «actualmente».',
    c: 'En realidad',
    m: [['Actualmente', 'vocabulario', 'Es un falso amigo: «actualmente» en inglés es «currently».'], ['Por supuesto', 'vocabulario'], ['Rápidamente', 'vocabulario']],
    e: '«Actually» significa «en realidad».',
  }),
  E('vocabulario', 'ing-voc-embarrassed', {
    q: '«She felt embarrassed when she fell in front of everyone.» ¿Qué significa «embarrassed»?',
    p: 'Cuidado con los falsos amigos: no se parece a lo que suena.',
    c: 'Avergonzada',
    m: [['Embarazada', 'vocabulario', 'Es un falso amigo: «embarazada» se dice «pregnant».'], ['Enojada', 'vocabulario'], ['Cansada', 'vocabulario']],
    e: '«Embarrassed» significa avergonzado o avergonzada.',
  }),
  E('vocabulario', 'ing-voc-sensible', {
    q: '«My parents are very sensible people.» ¿Qué significa «sensible» en esta oración?',
    p: 'En inglés, «sensible» no es lo mismo que «sensible» en español.',
    c: 'Sensatos',
    m: [['Sensibles (se emocionan con facilidad)', 'vocabulario', 'Eso se dice «sensitive» en inglés.'], ['Estrictos', 'vocabulario'], ['Ricos', 'vocabulario']],
    e: '«Sensible» en inglés significa sensato; «sensitive» es sensible.',
  }),
  E('vocabulario', 'ing-voc-success', {
    q: '«The movie was a success, but the dinner was a disaster.» ¿Qué significa «success»?',
    p: 'No lo confundas con una palabra parecida en español.',
    c: 'Éxito',
    m: [['Suceso (algo que ocurrió)', 'vocabulario', 'Es un falso amigo: suceso se dice «event» o «incident».'], ['Sucesión', 'vocabulario'], ['Susto', 'vocabulario']],
    e: '«Success» significa éxito.',
  }, true),

  // ---- gramatica ----
  E('gramatica', 'ing-gra-goes', {
    q: 'Completa: «She ______ to school every day.»',
    p: 'Con she, he o it el verbo en presente lleva una terminación especial.',
    c: 'goes',
    m: [['go', 'gramatica', 'Con «she» el verbo lleva -es: goes.'], ['going', 'gramatica'], ['gone', 'gramatica']],
    e: 'En presente simple, con he, she o it, el verbo termina en -s o -es.',
  }),
  E('gramatica', 'ing-gra-watched', {
    q: 'Completa: «Yesterday, we ______ a football game.»',
    p: 'Fíjate en la palabra «yesterday».',
    c: 'watched',
    m: [['watch', 'gramatica', '«Yesterday» pide el verbo en pasado.'], ['watching', 'gramatica'], ['will watch', 'gramatica', '«Will watch» habla del futuro, y «yesterday» es pasado.']],
    e: '«Yesterday» indica pasado, así que el verbo va en pasado simple: watched.',
  }),
  E('gramatica', 'ing-gra-playing', {
    q: 'Completa: «Look! The children ______ in the park right now.»',
    p: '«Right now» habla de algo que está pasando en este momento.',
    c: 'are playing',
    m: [['play', 'gramatica'], ['played', 'gramatica', '«Played» es pasado; la oración habla de este momento.'], ['plays', 'gramatica', '«Plays» es para una sola persona (he, she, it).']],
    e: 'Para una acción que ocurre ahora se usa presente continuo: are playing.',
  }),
  E('gramatica', 'ing-gra-since', {
    q: 'Completa: «I have lived in Medellín ______ 2015.»',
    p: 'Piensa si «2015» es un momento de inicio o una duración.',
    c: 'since',
    m: [['for', 'gramatica', '«For» se usa con una duración (for five years), no con una fecha de inicio.'], ['ago', 'gramatica'], ['during', 'gramatica']],
    e: '«Since» se usa con el momento en que empezó algo (2015); «for» con una duración.',
  }),
  E('gramatica', 'ing-gra-will', {
    q: 'Completa: «If it rains tomorrow, we ______ at home.»',
    p: 'Es una condición posible en el futuro.',
    c: 'will stay',
    m: [['stayed', 'gramatica', '«Stayed» es pasado; la oración habla de mañana.'], ['staying', 'gramatica'], ['stays', 'gramatica']],
    e: 'Si la condición está en presente (rains), el resultado va con will + verbo: will stay.',
  }, true),

  // ---- textocorto ----
  E('textocorto', 'ing-txt-wet', {
    q: '¿Qué significa este aviso?',
    x: 'CAUTION: Wet floor. Please walk slowly.',
    p: 'Busca las palabras que ya conoces: wet, walk, slowly.',
    c: 'Hay que caminar despacio porque el piso está mojado',
    m: [['Está prohibido entrar', 'textocorto'], ['El piso es nuevo', 'textocorto'], ['Hay que correr rápido', 'textocorto', '«Slowly» significa despacio, no rápido.']],
    e: '«Wet floor» es piso mojado y «walk slowly» es caminar despacio.',
  }),
  E('textocorto', 'ing-txt-library', {
    q: 'Una persona va a la biblioteca el domingo a las 10 de la mañana. ¿Qué pasa?',
    x: 'Library hours: Monday to Friday, 8:00 a.m. to 6:00 p.m. Saturday, 9:00 a.m. to 1:00 p.m. Closed on Sundays.',
    p: 'Busca la información sobre el domingo.',
    c: 'La biblioteca está cerrada',
    m: [['Puede entrar hasta la 1:00 p. m.', 'textocorto', 'Ese horario es el del sábado.'], ['Puede entrar hasta las 6:00 p. m.', 'textocorto', 'Ese horario es el de lunes a viernes.'], ['Solo puede entrar con carné', 'textocorto', 'El texto no menciona ningún carné.']],
    e: '«Closed on Sundays» significa que los domingos está cerrada.',
  }),
  E('textocorto', 'ing-txt-email', {
    q: '¿Qué le propone Carlos a Laura?',
    x: 'Hi Laura, I can’t go to the cinema on Friday because I have a dentist appointment. Can we go on Saturday afternoon instead? Tell me if that works for you. Carlos',
    p: 'Fíjate en la palabra «instead» (en lugar de eso).',
    c: 'Ir al cine el sábado por la tarde',
    m: [['Ir al cine el viernes por la noche', 'textocorto', 'El viernes es el día en que no puede ir.'], ['Ir juntos al dentista', 'textocorto'], ['Cancelar el plan del cine', 'textocorto', 'Propone cambiar el día, no cancelar.']],
    e: 'Carlos propone cambiar el plan al sábado por la tarde.',
  }),
  E('textocorto', 'ing-txt-tom', {
    q: '¿Qué hace Tom después del colegio?',
    x: 'Tom is 12 years old. He gets up at 6:30, has breakfast, and walks to school with his sister. After school he plays soccer with his friends. At night, he does his homework and goes to bed at 9:00.',
    p: 'Busca la frase que empieza con «After school».',
    c: 'Juega fútbol con sus amigos',
    m: [['Hace la tarea', 'textocorto', 'La tarea la hace en la noche, no justo después del colegio.'], ['Desayuna', 'textocorto', 'Desayuna antes del colegio.'], ['Camina con su hermana al colegio', 'textocorto', 'Eso lo hace antes de las clases.']],
    e: '«After school he plays soccer with his friends» significa que después del colegio juega fútbol.',
  }),
  E('textocorto', 'ing-txt-sale', {
    q: 'Una persona compra zapatos. ¿Cuánto descuento tiene?',
    x: 'SALE! Everything 30% off this weekend only. Shoes are 50% off. No returns.',
    p: 'Una frase general y otra específica: ¿cuál aplica a los zapatos?',
    c: '50%',
    m: [['30%', 'textocorto', 'Ese descuento es el general; los zapatos tienen uno especial.'], ['80%', 'textocorto', 'Los descuentos no se suman.'], ['No tienen descuento', 'textocorto']],
    e: '«Shoes are 50% off» indica que los zapatos tienen 50% de descuento.',
  }, true),

  // ---- funcion ----
  E('funcion', 'ing-fun-price', {
    q: 'Completa el diálogo: «How much is this shirt?» — «______»',
    p: 'La pregunta es sobre el precio.',
    c: 'It’s twenty dollars.',
    m: [['It’s blue.', 'funcion', 'Responde sobre el color, no sobre el precio.'], ['Yes, I like it.', 'funcion'], ['At the store.', 'funcion']],
    e: '«How much» pregunta por el precio, y «twenty dollars» lo responde.',
  }),
  E('funcion', 'ing-fun-coffee', {
    q: 'Completa el diálogo: «Would you like some coffee?» — «______»',
    p: 'Es una oferta: ¿cuál es una respuesta natural?',
    c: 'Yes, please.',
    m: [['Yes, I am.', 'funcion'], ['It’s Tuesday.', 'funcion'], ['Nice to meet you.', 'funcion']],
    e: '«Yes, please» acepta amablemente una oferta.',
  }),
  E('funcion', 'ing-fun-directions', {
    q: 'Quieres preguntar cómo llegar al banco. ¿Qué dices?',
    p: '«How can I get to…?» sirve para pedir indicaciones.',
    c: 'Excuse me, how can I get to the bank?',
    m: [['Excuse me, what time is the bank?', 'funcion', 'Eso no pregunta cómo llegar.'], ['Excuse me, how much is the bank?', 'funcion'], ['Excuse me, who is the bank?', 'funcion']],
    e: '«How can I get to…?» es la forma de pedir indicaciones.',
  }),
  E('funcion', 'ing-fun-headache', {
    q: 'Tu amigo dice: «I have a terrible headache.» ¿Cuál es la mejor respuesta?',
    p: 'Responde a lo que siente tu amigo.',
    c: 'I’m sorry to hear that. Why don’t you take a rest?',
    m: [['Congratulations! That’s great news.', 'funcion', 'Un dolor de cabeza no es una buena noticia.'], ['Thank you very much.', 'funcion'], ['See you tomorrow, then.', 'funcion']],
    e: 'Muestra empatía y ofrece una sugerencia.',
  }),
  E('funcion', 'ing-fun-phone', {
    q: 'Completa la llamada: «Hello, can I speak to Mr. Pérez, please?» — «______»',
    p: 'Piensa en lo que se dice cuando la persona no está.',
    c: 'I’m sorry, he’s not here right now. Can I take a message?',
    m: [['Nice to meet you, too.', 'funcion'], ['I’m fine, thanks.', 'funcion', 'Responde a «How are you?», no a lo que se pidió.'], ['He is Colombian.', 'funcion']],
    e: 'Informa que no está y ofrece tomar un mensaje.',
  }, true),

  // ---- conector ----
  E('conector', 'ing-con-but', {
    q: 'Completa: «I like tea, ______ I don’t like coffee.»',
    p: 'Las dos ideas se contrastan.',
    c: 'but',
    m: [['because', 'conector', '«Because» introduce una razón, no un contraste.'], ['so', 'conector', '«So» introduce una consecuencia.'], ['or', 'conector']],
    e: '«But» une dos ideas que se contrastan.',
  }),
  E('conector', 'ing-con-because', {
    q: 'Completa: «He was late ______ the bus was full and didn’t stop.»',
    p: 'La segunda parte explica la razón.',
    c: 'because',
    m: [['but', 'conector'], ['so', 'conector', '«So» introduce una consecuencia, y aquí la segunda parte es la causa.'], ['or', 'conector']],
    e: '«Because» introduce la razón de que llegara tarde.',
  }),
  E('conector', 'ing-con-on-at', {
    q: 'Completa: «The meeting is ______ Monday ______ 9:00 a.m.»',
    p: 'Una preposición va con días y otra con horas.',
    c: 'on / at',
    m: [['in / on', 'conector'], ['at / in', 'conector'], ['on / in', 'conector']],
    e: 'Con los días se usa «on» y con la hora exacta se usa «at».',
  }),
  E('conector', 'ing-con-so', {
    q: 'Completa: «It was raining, ______ we took an umbrella.»',
    p: 'Lo segundo es la consecuencia de lo primero.',
    c: 'so',
    m: [['because', 'conector', '«Because» explicaría la lluvia, no el paraguas.'], ['but', 'conector'], ['or', 'conector']],
    e: '«So» introduce el resultado: llovía, entonces llevaron paraguas.',
  }),
  E('conector', 'ing-con-in-in', {
    q: 'Completa: «My brother lives ______ Bogotá, ______ the north of the city.»',
    p: 'Usa la misma preposición para ciudades y para zonas de una ciudad.',
    c: 'in / in',
    m: [['at / on', 'conector'], ['on / at', 'conector'], ['in / at', 'conector']],
    e: 'Se dice «in Bogotá» y «in the north».',
  }, true),
]

export const PLANTILLAS_SABERES = [...naturales, ...ciudadanas, ...ingles]
