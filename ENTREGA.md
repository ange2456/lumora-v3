# Borrador de entrega: Lumora (reto de Educación)

Revisa y ajusta cada parte con tus palabras. Lo marcado con **[VERIFICAR]** o
**[COMPLETAR]** necesita que lo confirmes tú antes de enviar.

## 1. Problema y persona usuaria

**Persona:** estudiante de 11° (o universitario) que se prepara para Saber 11 o
Saber Pro, estudia desde el celular, con poco tiempo y a veces con internet
inestable.

**Problema:** al practicar con simulacros solo recibe «correcto» o «incorrecto».
No entiende qué tipo de error comete, no sabe con cuánta seguridad se equivoca y
no tiene cómo comprobar si lo aprendido le sirve en un caso distinto.

## 2. Referencia verificable

El ICFES publica los resultados por niveles de desempeño, no solo un puntaje.
Cifras revisadas contra el texto de los informes oficiales (octubre de 2026):

- **Saber 11, 2023** (ICFES, informe nacional, calendario A, p. 25):
  https://www.icfes.gov.co/wp-content/uploads/2025/04/Informe_Saber11_2023.pdf
  - «El 84 % de las y los estudiantes se ubicaron en los niveles 2 y 3» de
    Matemáticas.
  - Las regiones Caribe (15 %) y Pacífico (13 %) tienen la mayor proporción de
    jóvenes en el nivel 1.
  - Lectura para Lumora: la mayoría está en los niveles intermedios, justo donde
    saber *qué tipo de error* se comete ayuda a subir de nivel.
- **Saber Pro, 2023** (ICFES, informe nacional, Razonamiento Cuantitativo, pp. 21-22):
  https://www.icfes.gov.co/wp-content/uploads/2025/07/Informe_SUPERIOR_2023.pdf
  - Solo el **3 %** alcanzó el nivel 4. Esta cifra aparece igual en el texto y en
    la figura 12.
  - **No cito otros porcentajes de este informe:** al revisarlo, el texto da 65 %
    para los niveles 2 y 3 y la figura 12 suma 83 % (59 % + 24 %). Si quieres usar
    más cifras, ábrelo y míralas tú en la figura 12.
- **Retroalimentación:** Hattie, J. y Timperley, H. (2007). *The Power of
  Feedback*. Review of Educational Research, 77(1), 81-112.
  https://doi.org/10.3102/003465430298487
  El artículo la describe como «una de las influencias más poderosas en el
  aprendizaje y el logro», pero dice que su efecto puede ser positivo o negativo
  según cómo se dé. Por eso Lumora explica cada error en vez de solo marcar
  incorrecto. Sobre el artículo solo pude leer el resumen, no el texto completo.

**Antes de enviar:** abre los dos PDF del ICFES y mira tú la página citada (25 en
Saber 11; 21-22 en Saber Pro). Yo las leí a través de una herramienta que extrae
texto, no con mis propios ojos sobre el PDF.

## 3. Solución

Lumora convierte la práctica de Saber en una ruta: diagnostica el tipo de error
y la seguridad con la que se comete, ofrece práctica dirigida y cierra con un
problema nuevo para que la persona vea por sí misma que ya puede usarlo.

## 4. MVP y recorrido principal

Acceso: abrir el enlace. La primera pantalla es **Inicio**. Con «Empezar mi ruta
Saber» se puede probar **sin crear cuenta**: el primer resultado llega antes del
registro, y la cuenta se ofrece después, para guardar el avance.

**Cuenta de demostración para quien evalúe (opcional, para ver una cuenta con sus datos):** correo **[COMPLETAR]**, contraseña
**[COMPLETAR]** (créala tú en tu proyecto y no uses datos personales reales). Quien
prefiera puede crear su propia cuenta con cualquier correo.

1. Bienvenida: apodo, prueba (Saber 11 o Saber Pro), qué competencia practicar
   primero y, de forma opcional, qué le pasa al practicar. La competencia elegida
   cambia la ruta, y las dificultades marcadas muestran cómo ayuda Lumora.
2. Diagnóstico de 10 preguntas con selector de seguridad. Las preguntas se generan con números al azar en razonamiento cuantitativo y lectura crítica a partir de 70 plantillas con números y textos al azar; en ciencias naturales, sociales y ciudadanas e inglés, a partir de 75 preguntas redactadas y revisadas a mano (cada opción incorrecta corresponde a un tipo de error). En las dos primeras cada intento es distinto; en las otras tres el banco es más pequeño y las preguntas se pueden repetir al volver a practicar.
3. Mapa de errores con el punto ciego principal. Se puede repetir en las otras competencias con el selector de la ruta.
4. Práctica dirigida del tipo de error prioritario.
5. Problema nuevo y resultado (dominado o por repasar).
6. Meta diaria y racha.
7. **Guardar el avance (opcional, después del primer resultado):** crear una cuenta
   (nombre, apodo, correo, contraseña, prueba, y de forma opcional colegio o
   universidad, ciudad y grado) o entrar a una existente. Lo que ya se hizo como
   invitado se suma a la cuenta, sin perder nada. Con la cuenta, al iniciar sesión
   desde otro dispositivo se ve el mismo avance. Además se puede guardar en un
   archivo como copia de seguridad.
8. Mapa de habilidades, nivel, puntos y medallas que se actualizan con el avance.

### Onboarding: cómo se adaptó la guía de 14 etapas

La guía permite adaptar u omitir etapas con una justificación. Lumora llega al
primer valor, el mapa de errores, en unos 5 minutos y sin crear cuenta.

| Etapa | Qué se hizo en Lumora |
|---|---|
| 1. Bienvenida con resultado | Inicio dice qué se obtiene: «en unos 5 minutos tienes tu mapa de errores». |
| 2. Objetivo | Se elige la prueba (Saber 11 o Saber Pro) y qué competencia practicar primero. Esta respuesta cambia la ruta. |
| 3. Fricciones | Pregunta opcional: «¿Qué te pasa cuando practicas?», con cuatro opciones. |
| 4. Prueba social | **Omitida:** todavía no hay testimonios reales de estudiantes, y no se inventan. |
| 5. Tarjetas | **Omitida:** las fricciones ya se marcan con casillas, que son accesibles con teclado. |
| 6. Solución según respuestas | Al marcar dificultades aparece «Así te ayuda Lumora», solo con funciones que existen. Esas respuestas no se guardan. |
| 7. Comparación | **Omitida:** no hay alternativas propias que comparar con afirmaciones que se puedan sustentar. |
| 8. Preferencias | La competencia elegida cambia lo que se ve. La meta diaria es fija (4 ejercicios) en esta versión. |
| 9. Permisos | **Omitida:** Lumora no pide ningún permiso del dispositivo. |
| 10. Procesamiento | **Omitida:** no hay un proceso real que mostrar; los resultados son inmediatos. |
| 11. Demostración interactiva | El diagnóstico es la demostración real: responde y marca la seguridad. |
| 12. Primer valor | El mapa de errores, con el punto ciego principal. |
| 13. Registro después del valor | La cuenta es opcional y se ofrece tras el primer resultado. El avance de invitado se conserva y se suma a la cuenta. |
| 14. Planes | **Omitida:** Lumora no tiene planes ni cobro. |

## 5. Aporte propio

**Borrador en primera persona. Léelo, cambia lo que no sea cierto y déjalo con tus
palabras.** Lo marcado con **[CONFIRMA]** solo lo sabes tú.

> Lumora nació de algo que quiero dejar al terminar Ingeniería de Sistemas: una
> herramienta que ayude a que más estudiantes lleguen bien preparados a Saber 11
> y Saber Pro, tengan o no la plata para un preicfes. Un buen puntaje abre becas y
> oportunidades, y quise que Lumora sirviera igual a quien puede pagar un preicfes
> y a quien no.
>
> **Lo que decidí y diseñé yo:**
> - **El problema y el enfoque:** que el estudiante no se quede solo con «correcto»
>   o «incorrecto», sino que entienda *qué tipo de error* comete y con cuánta
>   seguridad se equivoca, y que lo compruebe con un problema nuevo.
> - **A quién va dirigido:** estudiantes de 11° y universitarios, accesible para
>   todos. Decidí que la historia no hablara de «gratis», para no excluir a
>   quienes sí pueden pagar un preicfes.
> - **Que motive:** el mapa de habilidades, los niveles, las medallas, la meta
>   diaria y la racha salieron de mi pedido de que a un estudiante le dieran ganas
>   de volver, porque la primera versión me pareció «muy básica».
> - **Las cuentas:** que cada estudiante pueda iniciar sesión y ver su avance
>   desde cualquier dispositivo, y que la primera pantalla sea Inicio.
> - **El diseño visual:** rediseñé la pantalla de la ruta de aprendizaje y el chat
>   de Nia para que sigan el diseño principal de la plataforma. **[CONFIRMA]**
>   cómo lo hiciste (por ejemplo, en qué herramienta) y qué más diseñaste tú.
> - **Revisión y pruebas:** probé la plataforma y pedí los cambios que ves.
>   **[CONFIRMA]** qué probaste tú y con qué personas.
>
> **Uso de IA (declarado):** usé Claude (Anthropic) como asistente. Escribió la
> mayor parte del código (React y Supabase), las 70 plantillas de preguntas, los
> textos de la app y las pruebas automáticas. Yo dirigí el producto, tomé las
> decisiones anteriores y revisé el resultado. **[CONFIRMA]** si escribiste o
> cambiaste código tú misma, y qué parte.

**Qué no hay en esta versión:** el espacio docente quedó como siguiente paso.

## 6. Límites

- Las preguntas son de práctica, originales y no son material oficial del ICFES.
- Lumora no predice puntajes ni sustituye a un docente.
- Las cuentas y el progreso se guardan en una base de datos (Supabase) con
  seguridad por filas: cada persona ve solo lo suyo. Quien administra el proyecto
  puede acceder a la base de datos.
- Muchos estudiantes de Saber 11 son menores de edad. La pantalla de registro pide
  aceptar el uso de datos y dice que, si es menor, su acudiente lo sabe, pero eso
  **no reemplaza** un consentimiento formal del acudiente. Antes de abrir Lumora a
  menores de forma masiva conviene revisar con asesoría legal las reglas de
  protección de datos en Colombia (Ley 1581 de 2012) **[VERIFICAR]**.
- El servicio de correo por defecto de Supabase es limitado: para el reto se deja
  sin confirmación de correo; para uso real hay que configurar un servicio de
  correo propio.
- Sin conexión se puede seguir practicando, pero crear la cuenta o entrar necesita
  internet.
- Cubre cinco competencias: razonamiento cuantitativo, lectura crítica, ciencias naturales (solo Saber 11), sociales y ciudadanas, e inglés. Falta comunicación escrita (Saber Pro), porque se califica con rúbrica. Las preguntas de naturales, ciudadanas e inglés son pocas (25 por área) y se revisaron a mano; conviene que un docente las valide antes de usarlas a gran escala.
- Nia es una guía con respuestas programadas, no un modelo de lenguaje: no inventa, no da respuestas de ejercicios ni datos oficiales del ICFES.
- Los textos de lectura son originales y cortos; las plantillas son fichas escritas a mano, así que la variedad de temas es limitada (11 ciudades, 7 temas más 4 géneros para el problema nuevo).

## 7. Guion del video (máximo 5 min)

1. 0:00 a 0:30. El problema: practicar sin saber por qué se falla.
2. 0:30 a 1:00. Abrir el enlace, pulsar «Empezar mi ruta Saber» (sin cuenta), elegir la prueba y la competencia, y crear el espacio.
3. 1:00 a 2:00. Diagnóstico: responder y marcar la seguridad en cada pregunta.
4. 2:00 a 2:40. Mapa de errores y punto ciego.
5. 2:40 a 4:15. Práctica: lección, un error a propósito, la frase propia, el
   problema nuevo.
6. 4:15 a 5:00. Ruta con tipo dominado, meta diaria y qué sigue.

No muestres datos personales reales ni claves en el video.
