import { Link } from "react-router";
import { canalesContacto } from "../data/nexus.js";

export default function Footer({ compacto = false }) {
  if (compacto)
    return (
      <p className="pie-inicio-sesion">
        © 2026 NEXUS. Todos los derechos a la derecha y los izquierdos a la
        izquierda.
      </p>
    );
  const enlaces = [
    ...canalesContacto.slice(0, 3),
    { nombre: "Email", href: "/contacto", icono: "fa-regular fa-envelope" },
    {
      nombre: "LinkedIn",
      href: "/contacto",
      icono: "fa-brands fa-linkedin-in",
    },
    {
      nombre: "X",
      href: "https://x.com/LEGEND93051975",
      icono: "fa-brands fa-x-twitter",
    },
    { nombre: "Contactar", href: "/contacto", icono: "fa-solid fa-plus" },
  ];
  return (
    <footer className="seccion-contacto">
      <p className="subtitulo">¿QUIERES HABLAR CON NOSOTROS?</p>
      <h2>Contacto</h2>
      <p className="texto-contacto">
        Elige uno de nuestros canales o envíanos un mensaje.
      </p>
      <div className="dock-contacto">
        {enlaces.map((enlace, indice) => {
          const contenido = (
            <>
              <span className="cara-letra">{"CONTACT"[indice]}</span>
              <span className="cara-icono">
                <i className={enlace.icono} aria-hidden="true" />
              </span>
              <span className="nombre-contacto">{enlace.nombre}</span>
            </>
          );
          return enlace.href.startsWith("/") ? (
            <Link
              className="tecla-contacto"
              key={enlace.nombre}
              to={enlace.href}
              aria-label={enlace.nombre}
            >
              {contenido}
            </Link>
          ) : (
            <a
              className="tecla-contacto"
              key={enlace.nombre}
              href={enlace.href}
              aria-label={enlace.nombre}
            >
              {contenido}
            </a>
          );
        })}
      </div>
    </footer>
  );
}
