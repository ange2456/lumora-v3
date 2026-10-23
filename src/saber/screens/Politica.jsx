/** Resumen claro de qué datos se guardan y cómo se cuidan. */
export default function Politica() {
    return (<details className="politica">
      <summary>Cómo cuidamos tus datos</summary>
      <div>
        <p>
          <strong>Qué guardamos.</strong> Tu nombre, apodo, correo, la prueba que presentas y, si quieres, tu colegio o
          universidad, ciudad y grado. Además, tus diagnósticos, tu práctica y tu actividad diaria.
        </p>
        <p>
          <strong>Para qué.</strong> Solo para mostrarte tu avance desde cualquier dispositivo. No usamos tus datos para
          publicidad ni los vendemos, y ningún otro estudiante puede verlos.
        </p>
        <p>
          <strong>Quién puede verlos.</strong> Solo tú, dentro de Lumora. Quien administra el proyecto puede acceder a la
          base de datos para mantenerla.
        </p>
        <p>
          <strong>Tus derechos.</strong> Puedes corregir tus datos, borrar tu progreso guardado o eliminar tu cuenta
          completa cuando quieras, desde «Mi cuenta».
        </p>
        <p className="ayuda">
          Las preguntas son de práctica y no son material oficial del ICFES. Este resumen no es asesoría legal.
        </p>
      </div>
    </details>);
}
