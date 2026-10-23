/** Texto de lectura crítica. Solo se muestra si la pregunta trae un texto. */
export default function Texto({ texto }) {
    if (!texto)
        return null;
    return (<figure className="texto-lectura">
      <figcaption className="etiqueta-seccion">Lee el texto</figcaption>
      <blockquote>
        <p>{texto}</p>
      </blockquote>
    </figure>);
}
