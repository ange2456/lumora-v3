# Conectar Lumora a Supabase, paso a paso

Son unos 10 a 15 minutos. Al final, las cuentas y el progreso quedan guardados en
una base de datos y se ven desde cualquier dispositivo.

Todo esto se hace en tu cuenta de Supabase y de Vercel. Nunca compartas con
nadie (ni conmigo) la clave **service_role** ni la contraseña de la base de datos.

## 1. Crear el proyecto

1. Entra a <https://supabase.com/dashboard> e inicia sesión.
2. **New project**. Nombre: `lumora`. Región: la más cercana a tus estudiantes
   (por ejemplo *South America (São Paulo)*).
3. Elige una contraseña de base de datos fuerte y guárdala en un gestor de
   contraseñas. No la vas a necesitar en la app.
4. Espera a que termine de crearse (1 o 2 minutos).

## 2. Crear las tablas

1. En el menú izquierdo abre **SQL Editor** y pulsa **New query**.
2. Abre en tu computador el archivo
   `supabase/migrations/20261023000000_saber_cuentas.sql`, copia **todo** su
   contenido y pégalo en el editor.
3. Pulsa **Run**. Debe decir *Success. No rows returned*.
4. Comprueba en **Table Editor** que aparecen `saber_perfiles` y `saber_progreso`.

Se puede ejecutar más de una vez sin problema.

Las otras migraciones de la carpeta son de la versión con clases y docentes y
**no hacen falta** para la ruta Saber.

## 3. Configurar el acceso con correo

1. **Authentication → Providers → Email**: debe estar activado.
2. En **Authentication → Sign In / Providers** (o *Providers → Email*) desactiva
   **Confirm email** para el reto. Motivo: el correo que trae Supabase por defecto
   envía muy pocos mensajes por hora, así que con confirmación activa la gente se
   quedaría esperando un correo que no llega. Para uso real, configura un
   servicio de correo propio y vuelve a activarla.
3. Largo mínimo de la contraseña: **Authentication → Policies (o Passwords)** →
   8 caracteres.
4. **Authentication → URL Configuration**: después de publicar en Vercel,
   configura aquí el dominio de producción. Vuelve a este paso al terminar el 6.

## 4. Copiar la dirección y la clave pública

1. **Project Settings → API** (o *API Keys*).
2. Copia:
   - **Project URL**, algo como `https://abcdefgh.supabase.co`
   - La clave pública: **anon / publishable key** (empieza por `sb_publishable_`
     o `eyJ…`). Es pública por diseño: la seguridad la dan las reglas de la base
     de datos.
3. **No copies** la clave `service_role` ni `secret`.

## 5. Ponerlas en Vercel

1. Si el proyecto aún no está en GitHub, crea un repositorio y sube el código.
   No incluyas `.env.local` ni claves en el repositorio; `.gitignore` ya excluye
   los archivos `.env`.
2. Entra a <https://vercel.com>, elige **Add New → Project** e importa el
   repositorio de Lumora.
3. Vercel detecta Vite automáticamente. Revisa estos valores:

   | Ajuste | Valor |
   |---|---|
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |
   | Install Command | `npm install` |

4. En **Environment Variables**, agrega estas variables y habilítalas para
   *Production*, *Preview* y *Development*:

   | Nombre | Valor |
   |---|---|
   | `VITE_SUPABASE_URL` | tu Project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | tu clave pública |

5. Pulsa **Deploy**. Al terminar, copia el dominio de producción que Vercel
   asignó (por ejemplo `https://lumora.vercel.app`).
6. Regresa a Supabase → **Authentication → URL Configuration**:
   - *Site URL*: pega el dominio de producción.
   - *Redirect URLs*: agrega el dominio exacto y, si quieres que los enlaces de
     recuperación también funcionen en previews, agrega las URLs de preview de
     tu propio proyecto (no uses un comodín general para todos los dominios
     `vercel.app`).
7. Si agregaste o cambiaste variables después de desplegar, ve a **Deployments**,
   abre el despliegue más reciente y pulsa **Redeploy** para recompilar.

Para probar en tu computador: copia `.env.example` a `.env.local`, pon los mismos
dos valores y ejecuta `npm install` y `npm run dev`.

## 6. Probar que funciona

1. Abre tu página, pulsa **Empezar mi ruta Saber** y crea una cuenta.
2. Haz un diagnóstico. Debajo del título debe decir **«Guardado en tu cuenta»**.
3. En Supabase, **Table Editor → saber_progreso**: debe haber una fila.
4. Abre la página en otro navegador (o en el celular), entra con el mismo
   correo y comprueba que ves el mismo avance.

## 7. Cuenta de demostración para el reto

1. En la página, crea una cuenta con un correo que sea solo para la demo, por
   ejemplo `demo.lumora@tudominio.com`, y una contraseña que no uses en ningún
   otro sitio.
2. Haz un diagnóstico y algo de práctica para que la cuenta tenga avance.
3. Escribe ese correo y esa contraseña en `ENTREGA.md` (sección 4).
4. No pongas datos personales reales en esa cuenta.

## Si algo falla

- **«La base de datos todavía no tiene las tablas…»**: falta el paso 2.
- **«El correo o la contraseña no son correctos»** al crear y entrar enseguida:
  revisa el paso 3 (confirmación de correo).
- **La página abre sin pedir cuenta**: revisa las variables del paso 5 y vuelve
  a desplegar para recompilar.
- **El enlace de recuperar contraseña lleva a otra página**: revisa *Site URL* y
  *Redirect URLs* del paso 3.

## Seguridad en pocas líneas

- Las reglas (RLS) están en la migración: cada persona solo lee y escribe sus
  propias filas y nadie sin sesión ve nada. Hay una prueba automática
  (`scripts/probar-saber-sql.sh`).
- Quien administra el proyecto de Supabase sí puede ver la base de datos. Díselo a
  quien se registre (ya está en «Cómo cuidamos tus datos»).
- Cada persona puede borrar su progreso o eliminar su cuenta desde **Mi cuenta**.
