# Lumora

Lumora es una aplicación educativa web hecha con React y Vite. Incluye retos
adaptativos, cuentas separadas para estudiantes y docentes, progreso individual,
clases con códigos de acceso y recursos compartidos por el docente.

## Modos de la app

`src/config.js` tiene un único interruptor, `MODO_SABER`:

- `true` (actual): Lumora es la ruta Saber. La primera pantalla es **Inicio**; el
  botón «Empezar mi ruta Saber» lleva a probar **sin crear cuenta**; la cuenta se
  ofrece después del primer resultado, para guardar el avance.
  Se ocultan las clases, las actividades genéricas y el espacio docente.
  - **Con Supabase configurado** (variables `VITE_SUPABASE_URL` y
    `VITE_SUPABASE_PUBLISHABLE_KEY`): cuentas con correo y contraseña, datos de
    perfil, y el progreso se guarda en la base de datos y se ve desde cualquier
    dispositivo. Guía en `SUPABASE_PASO_A_PASO.md`.
  - **Sin variables de entorno**: funciona sin cuenta y el progreso queda solo en
    el dispositivo (con exportar e importar un `.json`).
  Se despliega como sitio estático (Vercel: `npm run build`, carpeta `dist`).
- `false`: la app completa de antes. Nada se borró del código.

Para recuperar el progreso en otro dispositivo, la ruta tiene **Guardar mi
progreso** (descarga un `.json`) y **Cargar un progreso**. Al cargar se valida el
archivo y se recalculan los resultados a partir de las respuestas.

## Ruta Saber (reto de Educación)

La sección **Mi ruta Saber** es el recorrido principal para estudiantes de 11° y
universitarios que se preparan para Saber 11 y Saber Pro. Con `MODO_SABER`
activo funciona sin cuenta ni credenciales.

1. **Diagnóstico** de 10 preguntas en cinco competencias a elegir: razonamiento
   cuantitativo, lectura crítica, ciencias naturales, sociales y ciudadanas e
   inglés (cada una con su diagnóstico, su mapa y su
   historial). Antes de ver el resultado, la persona marca qué tan segura está (segura, dudo, adiviné).
2. **Mapa de errores** por tipo (base equivocada, proporción mal aplicada,
   conversión de unidades, lectura de datos, operación incompleta; en lectura
   crítica: información que el texto no dice, detalle en vez de idea principal,
   inferencia exagerada, relación entre ideas invertida, intención mal leída),
   que cruza el error con la seguridad para detectar los puntos ciegos.
3. **Práctica dirigida** por tipo de error: lección corta, 3 ejercicios con pista
   y explicación, y una frase propia sobre por qué se falló.
4. **Problema nuevo** en otro contexto de la vida real para comprobar que la
   persona puede usar lo aprendido. Con 2 de 3 ejercicios y el problema nuevo
   bien, el tipo queda como dominado.
5. **Meta diaria** (4 ejercicios) y racha de días.
6. **Motivación**: puntos (10 por ejercicio, 30 por diagnóstico, 50 por tipo dominado), 6 niveles y 10 medallas, todo calculado desde el progreso guardado (`src/saber/lib/logros.js`), más un mapa de habilidades (radar) que compara tu primer diagnóstico con tu estado actual.
7. **Nia**, guía sin servidor: responde con palabras clave usando solo tu
   diagnóstico, tu avance y las lecciones. No es una IA libre, no da respuestas
   de ejercicios ni cifras oficiales del ICFES (`src/saber/lib/nia.js`).

Las preguntas se generan con valores al azar (70 plantillas, 35 por
competencia). Accesibilidad: auditada con axe-core en todas las pantallas (móvil
y escritorio) sin violaciones, foco al título al cambiar de pantalla, objetivos
táctiles de 44 px, movimiento reducido respetado.

El contenido de `src/saber/data` es original y no proviene de pruebas del ICFES.

### Cuentas y sincronización

- Tablas `saber_perfiles` y `saber_progreso` con seguridad por filas (RLS): cada
  persona solo ve y escribe lo suyo. Migración en
  `supabase/migrations/20261023000000_saber_cuentas.sql`.
- Al abrir la app se trae el progreso de la cuenta, se **fusiona** con el del
  dispositivo (nunca se pierde nada: se une todo y se queda con lo más avanzado)
  y se sube. Después se guarda solo, unos segundos tras cada cambio. Sin
  conexión, los cambios se quedan en el dispositivo y se suben al volver.
- Si lo guardado en la cuenta no se puede leer, no se pisa: se avisa.
- Quien llega sin cuenta practica como **invitado** (progreso en el dispositivo). Al crear una cuenta o entrar a una existente, ese avance se suma a la cuenta y la copia de invitado se borra (`src/saber/lib/invitado.js`).
- Al cerrar sesión se borra la copia local del equipo.
- «Mi cuenta»: editar datos, borrar el progreso o eliminar la cuenta completa.

Pruebas de la migración (necesita PostgreSQL instalado, usa una base temporal):

```sh
scripts/probar-saber-sql.sh
```

Pruebas de la lógica y del contenido (sin dependencias extra):

```sh
node tests/saber-generador.test.mjs
node tests/a11y-prefs.test.mjs
```

## Accesibilidad

Lumora se puede usar de formas distintas. Arriba, junto al avatar, está el botón **Accesibilidad** (icono de persona) con:

- **Tamaño del texto:** normal, grande o muy grande.
- **Alto contraste:** letras negras sobre fondo blanco y bordes marcados.
- **Letra de lectura fácil:** Atkinson Hyperlegible.
- **Más espacio al leer:** más espacio entre líneas, letras y palabras.
- **Menos movimiento:** sin animaciones ni transiciones.
- **Escuchar:** botón en cada pregunta, lección y explicación que las lee en voz alta con la voz del dispositivo (Web Speech API; no se envía nada a ningún servidor). Si el navegador no tiene voces, el botón no aparece.

Las preferencias se guardan en el dispositivo (`localStorage`) y se aplican como atributos `data-a11y-*` en `<html>` antes de pintar. Si la persona no ha elegido nada, se respetan los ajustes del sistema (menos movimiento y más contraste). Además: enlace «Saltar al contenido», panel operable con teclado (Escape cierra y devuelve el foco), etiquetas en todos los controles y los tipos de error marcados con letra además de color.

Código: `src/BotonAccesibilidad.jsx`, `src/accesibilidad.css`, `src/saber/lib/accesibilidad.js`, `src/saber/lib/leer.js`, `src/saber/screens/BotonEscuchar.jsx`. Prueba: `node tests/a11y-prefs.test.mjs`.

## Ejecutar la aplicación

```sh
npm install
npm run dev
```

Sin configuración de Supabase, Lumora ofrece el modo prototipo. Sus perfiles,
clases y resultados se guardan en `localStorage`: solo existen en ese navegador
y no deben considerarse datos privados ni sincronizados.

## Configurar Supabase

1. Crea un proyecto en el [panel de Supabase](https://supabase.com/dashboard).
   El plan Free tiene límites y puede pausar proyectos inactivos; consulta las
   [condiciones actuales](https://supabase.com/pricing).
2. En **Project Settings → API**, copia la URL del proyecto y la clave
   **Publishable**. No uses ni compartas la clave `secret` o `service_role`.
3. Abre **SQL Editor** y ejecuta, en orden, el contenido completo de estas
   migraciones:
   `supabase/migrations/20261021000000_lumora_schema.sql`,
   `supabase/migrations/20261021160000_teacher_invites.sql`,
   `supabase/migrations/20261021170000_teacher_invite_email_requests.sql`,
   `supabase/migrations/20261021180000_classroom_content_storage.sql`,
   `supabase/migrations/20261021190000_class_learning_content.sql`,
   `supabase/migrations/20261021200000_teacher_self_registration.sql` y
   `supabase/migrations/20261022120000_student_class_quizzes.sql` y
   `supabase/migrations/20261023000000_saber_cuentas.sql`.
   No vuelvas a ejecutar las que ya aplicaste.
4. En **Authentication → URL Configuration**, define el URL local
   `http://localhost:5173` como sitio permitido. Para despliegue, añade también
   el dominio final de Lumora.
5. En **Authentication → Providers → Email**, habilita correo y contraseña.
   Para pruebas puedes desactivar la confirmación de correo; antes de usar
   Lumora con usuarios reales, configura el proveedor de correo y habilítala.
6. Copia `.env.example` a `.env.local` y configura:

   ```text
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=tu-clave-publishable
   ```

7. Reinicia `npm run dev`, crea una cuenta de prueba y verifica Auth y las
   tablas en el panel de Supabase.

Para publicar en Vercel y configurar las variables, el dominio y los redirect
URLs de Supabase Auth, sigue la [guía paso a paso](./SUPABASE_PASO_A_PASO.md).
La app desplegada necesita recompilarse después de añadir o cambiar variables.

La clave publishable está diseñada para uso en el navegador. La seguridad de
los datos depende de las políticas RLS de la migración. Nunca pongas claves
`secret` o `service_role` en variables `VITE_*`, en el repositorio ni en el
frontend.

## Cuentas y roles

- Las cuentas de estudiante y docente se crean con Supabase Auth.
- Al elegir “Docente” durante el registro, la cuenta recibe inmediatamente el
  rol `teacher`; ya no se solicita código ni verificación docente.
- Cualquier persona puede registrarse como docente. Las políticas RLS siguen
  separando los datos por cuenta y solo permiten administrar las clases propias.
- La última migración convierte a docente los perfiles que estaban pendientes
  y desactiva el antiguo flujo de invitaciones. Las migraciones anteriores de
  invitaciones se conservan para que una instalación nueva pueda ejecutarlas
  en orden; no hace falta configurar Resend para crear cuentas docentes.
- Las contraseñas son gestionadas por Supabase Auth; Lumora no las guarda en
  sus tablas.

## Clases, recursos y progreso

- Docentes crean clases con descripción e indicaciones y comparten el
  código generado.
- Cada estudiante puede unirse a varias clases y cambiar entre ellas para
  consultar el contenido que comparte cada docente.
- Los docentes publican texto, enlaces `https` y archivos PDF, imágenes JPG,
  PNG o WEBP, texto plano y documentos Office. Los archivos se guardan en el
  bucket privado `class-resources`, con un máximo de 5 MB por archivo y acceso
  mediante enlaces temporales.
- El panel docente muestra los estudiantes de cada clase, su porcentaje y
  número de retos, además del historial individual de intentos, errores y
  habilidades reforzadas.
- En los detalles de cada clase, el docente puede compartir actividades con
  instrucciones y enlaces, y crear retos con preguntas de opción múltiple,
  respuesta correcta y explicación. Los estudiantes pueden consultar las
  actividades, resolver cada reto una vez y revisar su resultado y explicación
  al enviarlo. La calificación se calcula en Supabase; las respuestas correctas
  no se incluyen en el contenido que recibe el estudiante antes de responder.
- Los intentos de retos de clase se guardan por estudiante y reto. El estudiante
  solo puede consultar su propio resultado; el docente puede ver los resultados
  de los miembros de sus clases.
- Los intentos se guardan en `challenge_attempts`; cada estudiante consulta
  únicamente los suyos y el docente consulta los intentos de miembros de sus
  propias clases. La recuperación de contraseña se completa desde el enlace
  enviado por Supabase Auth.
- Al archivar una clase se desactiva su código, preservando el historial y los
  materiales. El docente puede consultar la clase archivada y sus datos en
  modo de solo lectura; ya no puede publicar ni eliminar recursos.

Las tablas tienen Row Level Security. La migración instala políticas, permisos
de tabla y funciones internas; no desactives RLS ni expongas claves de servidor.
Antes de usar Lumora con estudiantes reales, revisa los requisitos de privacidad
y protección de datos aplicables a estudiantes e instituciones.
El registro docente está abierto por decisión de producto actual: cualquier
persona puede elegir ese rol. Si la app se usará en una institución, configura
un proceso de aprobación docente antes de habilitar cuentas reales.

## Pruebas locales de RLS

Con Docker instalado y ejecutándose, inicia Supabase local y ejecuta las pruebas
de PostgreSQL:

```sh
npx supabase start
npx supabase test db
```

Los casos de prueba están en `supabase/tests/rls.test.sql`. Los secretos locales
no deben copiarse al repositorio.

## Proyecto Firebase anterior

Firebase no se usa en esta versión de la aplicación. El proyecto Firebase
`lumora-5779e` no se modifica ni se elimina; puedes conservarlo como respaldo
mientras verificas Supabase.

## Comandos

- `npm run dev`: inicia Vite en modo desarrollo.
- `npm run build`: crea el paquete de producción.
- `npm run preview`: previsualiza el paquete de producción.
- `npm run lint`: analiza el código con Oxlint.
