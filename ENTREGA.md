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
Referencias oficiales encontradas:

- Informe nacional de resultados Saber 11, 2023 (ICFES):
  https://www.icfes.gov.co/wp-content/uploads/2025/04/Informe_Saber11_2023.pdf
  Según el texto del informe (p. 25, calendario A), el 84 % de los estudiantes
  se ubicó en los niveles 2 y 3 de Matemáticas, y las regiones Caribe (15 %) y
  Pacífico (13 %) tienen la mayor proporción en el nivel 1. La distribución
  nacional por nivel está en la figura 9b (p. 26). **[VERIFICAR]** las cifras en
  el PDF antes de citarlas.
- Informe nacional Saber Pro y Saber TyT, 2023 (ICFES):
  https://www.icfes.gov.co/wp-content/uploads/2025/07/Informe_SUPERIOR_2023.pdf
  La sección 3.3.1 (p. 22, figura 12) muestra la distribución de Razonamiento
  Cuantitativo por niveles. **[VERIFICAR]** los porcentajes leyendo la figura:
  no pude confirmarlos desde el PDF y no los cito aquí.

Una referencia sobre aprender del error y la retroalimentación formativa
reforzaría la parte pedagógica. **[COMPLETAR]**

## 3. Solución

Lumora convierte la práctica de Saber en una ruta: diagnostica el tipo de error
y la seguridad con la que se comete, ofrece práctica dirigida y cierra con un
problema nuevo para que la persona vea por sí misma que ya puede usarlo.

## 4. MVP y recorrido principal

Acceso: abrir el enlace. La primera pantalla es **Inicio**. Con «Empezar mi ruta
Saber» (o desde el menú) se crea una cuenta o se inicia sesión.

**Cuenta de demostración para quien evalúe:** correo **[COMPLETAR]**, contraseña
**[COMPLETAR]** (créala tú en tu proyecto y no uses datos personales reales). Quien
prefiera puede crear su propia cuenta con cualquier correo.

1. Crear la cuenta (nombre, apodo, correo, contraseña, prueba, y de forma
   opcional colegio o universidad, ciudad y grado) y aceptar el uso de los datos.
2. Diagnóstico de 10 preguntas con selector de seguridad. Las preguntas se generan con números al azar a partir de 70 plantillas, 35 de razonamiento cuantitativo y 35 de lectura crítica (cada opción incorrecta corresponde a un tipo de error), así que cada intento es distinto y la mejora entre diagnósticos no se debe a memorizar respuestas.
3. Mapa de errores con el punto ciego principal. Se puede repetir en la otra competencia (lectura crítica) con el selector de la ruta.
4. Práctica dirigida del tipo de error prioritario.
5. Problema nuevo y resultado (dominado o por repasar).
6. Meta diaria y racha.
7. El progreso queda en la cuenta: al iniciar sesión desde otro dispositivo se ve el mismo avance. Además se puede guardar en un archivo como copia de seguridad.
8. Mapa de habilidades, nivel, puntos y medallas que se actualizan con el avance.

## 5. Aporte propio

El reto permite asistentes de código y pide explicar el aporte propio.
**[COMPLETAR]** con lo que diseñaste y decidiste tú: el enfoque, los tipos de
error, el selector de seguridad y el problema nuevo, y el diseño visual de la ruta
y de Nia. El espacio docente quedó como siguiente paso, fuera de esta versión. Si usaste una IA para escribir parte del código, dilo con claridad.

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
- Hoy cubre dos competencias: razonamiento cuantitativo y lectura crítica. Las demás son un paso futuro.
- Nia es una guía con respuestas programadas, no un modelo de lenguaje: no inventa, no da respuestas de ejercicios ni datos oficiales del ICFES.
- Los textos de lectura son originales y cortos; las plantillas son fichas escritas a mano, así que la variedad de temas es limitada (11 ciudades, 7 temas más 4 géneros para el problema nuevo).

## 7. Guion del video (máximo 5 min)

1. 0:00 a 0:30. El problema: practicar sin saber por qué se falla.
2. 0:30 a 1:00. Abrir el enlace: entra directo a Mi ruta Saber y crear el espacio.
3. 1:00 a 2:00. Diagnóstico: responder y marcar la seguridad en cada pregunta.
4. 2:00 a 2:40. Mapa de errores y punto ciego.
5. 2:40 a 4:15. Práctica: lección, un error a propósito, la frase propia, el
   problema nuevo.
6. 4:15 a 5:00. Ruta con tipo dominado, meta diaria y qué sigue.

No muestres datos personales reales ni claves en el video.
