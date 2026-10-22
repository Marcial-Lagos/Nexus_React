import { Link } from "react-router";
export default function TarjetaTransmision({ canal }) {
  return (
    <article className="tarjeta-transmision">
      <Link
        className={`miniatura miniatura-${canal.id}`}
        to="/stream"
        aria-label={`Ver ${canal.titulo}`}
      >
        <span className="insignia-en-vivo pequeno">EN VIVO</span>
        <span
          className={
            canal.id === "codigo"
              ? "texto-miniatura-codigo"
              : "emoji-miniatura-grande"
          }
        >
          {canal.simbolo}
        </span>
        <small>{canal.espectadores} espectadores</small>
      </Link>
      <div className="informacion-transmision">
        <span className={`avatar avatar-${canal.color}`}>
          {canal.iniciales}
        </span>
        <div>
          <h3>{canal.titulo}</h3>
          <p>{canal.nombre}</p>
          <span className="etiqueta-categoria">{canal.categoria}</span>
        </div>
      </div>
    </article>
  );
}
