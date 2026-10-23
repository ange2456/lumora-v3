// Interruptor del modo del producto.
//
// true  → Lumora es la ruta Saber: se abre directo en "Mi ruta Saber", sin login ni Supabase,
//         y se ocultan las secciones de clases, actividades genéricas y espacio docente.
// false → la app completa de antes (login con Supabase, espacio docente, actividades, etc.).
//
// Nada se borró: el código del resto de la app sigue intacto para retomarlo después.
export const MODO_SABER = true
