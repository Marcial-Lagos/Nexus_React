import { useState } from "react";
import { TRANSICIONES } from "../data/pedidos.js";
import { precioCLP } from "../data/nexus.js";
export default function AdminOrdenes({ ordenes, onChangeEstado }) {
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cancelar, setCancelar] = useState(null);
  function cambiar(id, estado) {
    try {
      onChangeEstado(id, estado);
      setError("");
      setMensaje("Estado del pedido actualizado.");
    } catch (err) {
      setError(err.message);
    }
    setCancelar(null);
  }
  return (
    <section>
      <h2>Órdenes y comprobantes</h2>
      <p>
        Pedidos locales con pago simulado. Los comprobantes no son boletas
        tributarias.
      </p>
      {error && <p role="alert">{error}</p>}
      {mensaje && <p role="status">{mensaje}</p>}
      {!ordenes.length && <p>No hay órdenes registradas.</p>}
      {ordenes.map((o) => (
        <article
          className="border rounded p-3 my-3"
          key={o.id}
          aria-label={`Pedido ${o.id}`}
        >
          <h3 className="h5">Pedido {o.id}</h3>
          <p>
            {new Date(o.fecha).toLocaleString("es-CL")} — {o.cliente.nombre} (
            {o.cliente.correo})
          </p>
          <p>
            Estado: <strong>{o.estado}</strong>
          </p>
          <details>
            <summary>Ver detalle y entrega</summary>
            <ul>
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.nombre} × {i.cantidad}: {precioCLP(i.precio * i.cantidad)}
                </li>
              ))}
            </ul>
            <p>
              Entrega:{" "}
              {o.cliente.entrega === "retiro"
                ? "Retiro"
                : `${o.cliente.direccion}, ${o.cliente.comuna}`}
            </p>
            <p>Envío: {precioCLP(o.envio)}</p>
          </details>
          <p>Total: {precioCLP(o.total)}</p>
          {(TRANSICIONES[o.estado] || []).map((estado) => (
            <button
              className="btn btn-outline-info me-2 mb-2"
              key={estado}
              onClick={() =>
                estado === "cancelado"
                  ? setCancelar(o.id)
                  : cambiar(o.id, estado)
              }
            >
              {estado === "cancelado" ? "Cancelar pedido" : `Marcar ${estado}`}
            </button>
          ))}
        </article>
      ))}
      {cancelar && (
        <div role="alert" className="alert alert-warning">
          <p>¿Cancelar este pedido y devolver sus unidades al stock?</p>
          <button
            className="btn btn-danger me-2"
            onClick={() => cambiar(cancelar, "cancelado")}
          >
            Confirmar cancelación
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setCancelar(null)}
          >
            Conservar pedido
          </button>
        </div>
      )}
    </section>
  );
}
