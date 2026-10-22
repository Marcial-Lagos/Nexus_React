import { useState } from "react";
import { Link } from "react-router";
import CampoFormulario from "../components/CampoFormulario.jsx";
import { canalesContacto } from "../data/nexus.js";
import { sinErrores, validarContacto } from "../utils/validaciones.js";

const inicial = { nombre: "", correo: "", comentario: "" };
export default function Contacto() {
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  function cambiar(campo, valor) {
    const nuevos = { ...datos, [campo]: valor };
    setDatos(nuevos);
    setErrores((actual) => ({
      ...actual,
      [campo]: validarContacto(nuevos)[campo],
    }));
    setMensaje("");
  }
  function enviar(evento) {
    evento.preventDefault();
    const resultado = validarContacto(datos);
    setErrores(resultado);
    if (!sinErrores(resultado)) {
      setMensaje("⚠ Revisa los campos antes de enviar");
      return;
    }
    setMensaje(
      "✓ Mensaje validado correctamente. Demostración local: no se ha enviado a un servidor.",
    );
    setDatos(inicial);
  }
  return (
    <main className="pagina-contacto">
      <Link className="volver-contacto" to="/principal">
        <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Volver a
        Nexus
      </Link>
      <section className="encabezado-contacto">
        <span className="subtitulo">CONTACTO</span>
        <h1>
          Hablemos<span>.</span>
        </h1>
        <p>
          ¿Tienes dudas, sugerencias o quieres colaborar con NEXUS? Envíanos un
          mensaje y te responderemos lo antes posible.
        </p>
      </section>
      <section className="contenido-contacto">
        <article className="tarjeta-canales">
          <div className="encabezado-tarjeta-contacto">
            <span className="icono-titulo-contacto">
              <i className="fa-solid fa-share-nodes" aria-hidden="true" />
            </span>
            <div>
              <h2>Encuéntranos</h2>
              <p>También puedes contactarnos mediante nuestros canales.</p>
            </div>
          </div>
          {canalesContacto.map((canal) => (
            <a
              key={canal.nombre}
              className={`canal-contacto ${canal.clase}`}
              href={canal.href}
              target={canal.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
            >
              <span className="icono-canal">
                <i className={canal.icono} aria-hidden="true" />
              </span>
              <div>
                <strong>{canal.nombre}</strong>
                <span>{canal.detalle}</span>
              </div>
              <i
                className="fa-solid fa-arrow-up-right-from-square flecha-canal"
                aria-hidden="true"
              />
            </a>
          ))}
        </article>
        <article className="tarjeta-formulario-contacto">
          <div className="encabezado-tarjeta-contacto">
            <span className="icono-titulo-contacto">
              <i className="fa-regular fa-paper-plane" aria-hidden="true" />
            </span>
            <div>
              <h2>Envíanos un mensaje</h2>
              <p>Completa los siguientes datos.</p>
            </div>
          </div>
          <form
            noValidate
            onSubmit={enviar}
            aria-label="Formulario de contacto"
          >
            <CampoFormulario
              id="nombreContacto"
              label="Nombre"
              autoComplete="name"
              maxLength={100}
              placeholder="Escribe tu nombre"
              required
              value={datos.nombre}
              error={errores.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
            />
            <CampoFormulario
              id="correoContacto"
              label={
                <>
                  Correo electrónico{" "}
                  <span className="campo-opcional">Opcional</span>
                </>
              }
              type="email"
              autoComplete="email"
              maxLength={100}
              placeholder="nombre@duoc.cl"
              value={datos.correo}
              error={errores.correo}
              onChange={(e) => cambiar("correo", e.target.value)}
            />
            <CampoFormulario
              id="comentarioContacto"
              label="Comentario"
              multilinea
              rows={6}
              maxLength={500}
              placeholder="Escribe tu mensaje..."
              required
              value={datos.comentario}
              error={errores.comentario}
              ayuda={`${datos.comentario.length}/500 caracteres`}
              onChange={(e) => cambiar("comentario", e.target.value)}
            />
            <button
              className="boton boton-primario boton-bloque boton-enviar-contacto"
              type="submit"
            >
              <i className="fa-regular fa-paper-plane" aria-hidden="true" />{" "}
              Enviar mensaje
            </button>
            <p
              id="mensajeContacto"
              className={
                mensaje.startsWith("✓") ? "exito" : mensaje ? "error" : ""
              }
              role="status"
            >
              {mensaje}
            </p>
          </form>
        </article>
      </section>
    </main>
  );
}
