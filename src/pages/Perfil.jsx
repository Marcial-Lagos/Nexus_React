import { useState } from "react";
import { Link } from "react-router";
import Modal from "../components/Modal.jsx";
import CampoFormulario from "../components/CampoFormulario.jsx";
import { precioCLP } from "../data/nexus.js";

export default function Perfil({
  usuario,
  onUpdate,
  apiMode = false,
  cargando = false,
  error = "",
  pedidos = [],
  errorPedidos = "",
}) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario.nombre);
  const [biografia, setBiografia] = useState(usuario.biografia);
  const [aviso, setAviso] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(false);
  function editar() {
    setNombre(usuario.nombre);
    setBiografia(usuario.biografia);
    setEditando(true);
  }
  async function guardar(evento) {
    evento.preventDefault();
    setGuardando(true);
    setAviso("");
    setErrorGuardado(false);
    try {
      await onUpdate({
        nombre: nombre.trim() || usuario.nombre,
        biografia: biografia.trim(),
      });
      setEditando(false);
      setAviso(
        apiMode
          ? "Perfil actualizado en el servidor."
          : "Perfil actualizado en esta sesión de demostración.",
      );
    } catch (err) {
      setAviso(err.message || "No se pudo actualizar el perfil.");
      setErrorGuardado(true);
    } finally {
      setGuardando(false);
    }
  }
  return (
    <main className="contenido-perfil">
      <section className="banner-perfil" aria-label="Banner del perfil">
        <div className="forma-banner uno" />
        <div className="forma-banner dos" />
      </section>
      <section className="tarjeta-encabezado-perfil">
        <div className="avatar-perfil-xl">
          {usuario.nombre.slice(0, 2).toUpperCase()}
          <span />
        </div>
        <div className="identidad-perfil">
          <h1>{usuario.nombre}</h1>
          <p>
            @{usuario.correo?.split("@")[0] || "invitado"} · Miembro desde 2026
          </p>
          <div className="estadisticas-perfil">
            <span>
              <strong>67000</strong> seguidores
            </span>
            <span>
              <strong>46</strong> siguiendo
            </span>
            <span>
              <strong>3</strong> comunidades
            </span>
          </div>
        </div>
        <button className="boton boton-primario" onClick={editar}>
          Editar perfil
        </button>
      </section>
      {aviso && (
        <p
          className={`mensaje-formulario ${errorGuardado ? "error" : "exito"}`}
          role={errorGuardado ? "alert" : "status"}
        >
          {aviso}
        </p>
      )}
      {cargando && <p role="status">Cargando perfil e historial…</p>}
      {error && (
        <p className="alert alert-warning" role="alert">
          No se pudo recuperar el perfil del servidor: {error}
        </p>
      )}
      <div className="columnas-perfil">
        <section className="tarjeta-panel">
          <h2>Acerca de mí</h2>
          <p>{usuario.biografia}</p>
          <div className="fila-informacion">
            <span>📍</span>
            <div>
              <small>Ubicación</small>
              <strong>Chile</strong>
            </div>
          </div>
          <div className="fila-informacion">
            <span>🎮</span>
            <div>
              <small>Intereses</small>
              <strong>Gaming · Programación · Música</strong>
            </div>
          </div>
        </section>
        <section className="tarjeta-panel panel-actividad">
          <div className="titulo-seccion titulo-compacto">
            <div>
              <h2>Actividad reciente</h2>
            </div>
            <Link to="/comunidad">Ver todo</Link>
          </div>
          {[
            [
              "💬",
              "Escribiste en Gaming Chile",
              "“Estoy armando el stream de programación...”",
              "Hace 20 minutos",
            ],
            [
              "♥",
              "Seguiste a KiraPlay",
              "Canal de Overwatch y contenido competitivo.",
              "Ayer",
            ],
            ["🎮", "Te uniste a una comunidad", "Gaming Chile", "Hace 3 días"],
          ].map(([icono, titulo, texto, fecha]) => (
            <article className="elemento-actividad" key={titulo}>
              <span className="icono-actividad">{icono}</span>
              <div>
                <strong>{titulo}</strong>
                <p>{texto}</p>
                <small>{fecha}</small>
              </div>
            </article>
          ))}
          <p className="nota-demo">
            Estadísticas y actividad de ejemplo del prototipo original.
          </p>
        </section>
      </div>
      {apiMode && (
        <section
          className="tarjeta-panel mt-4"
          aria-label="Historial de pedidos"
        >
          <h2>Mis pedidos</h2>
          {errorPedidos && (
            <p className="alert alert-warning" role="alert">
              No se pudo cargar el historial: {errorPedidos}
            </p>
          )}
          {!errorPedidos && pedidos.length === 0 && !cargando && (
            <p>Aún no hay pedidos registrados para esta cuenta.</p>
          )}
          {pedidos.map((pedido) => (
            <article
              key={pedido.id}
              className="d-flex justify-content-between gap-3 border-bottom py-2"
            >
              <div>
                <Link to={"/compra/" + pedido.id}>Pedido {pedido.id}</Link>
                <p className="mb-0">
                  {pedido.fecha
                    ? new Date(pedido.fecha).toLocaleDateString()
                    : "Fecha no disponible"}
                  {" · "}
                  {pedido.estado}
                </p>
              </div>
              <strong>
                {pedido.total == null
                  ? "Monto no disponible"
                  : precioCLP(pedido.total)}
              </strong>
            </article>
          ))}
        </section>
      )}
      {editando && (
        <Modal titulo="Editar perfil" onClose={() => setEditando(false)}>
          <form onSubmit={guardar}>
            <CampoFormulario
              id="editarNombre"
              label="Nombre"
              value={nombre}
              maxLength={30}
              onChange={(e) => setNombre(e.target.value)}
            />
            <CampoFormulario
              id="editarBiografia"
              label="Biografía"
              multilinea
              rows={4}
              maxLength={500}
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
            />
            <div className="acciones-dialogo">
              <button
                className="boton boton-suave"
                type="button"
                onClick={() => setEditando(false)}
                disabled={guardando}
              >
                Cancelar
              </button>
              <button
                className="boton boton-primario"
                type="submit"
                disabled={guardando}
              >
                {guardando ? "Guardando…" : "Guardar cambios"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
