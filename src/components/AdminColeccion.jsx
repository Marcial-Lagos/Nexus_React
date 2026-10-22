import { useState } from "react";
const vacio = {
  nombre: "",
  precio: "",
  precioOferta: "",
  stock: "",
  categoria: "",
  descripcion: "",
  correo: "",
};
export default function AdminColeccion({ tipo, datos, onSave, onDelete }) {
  const [edicion, setEdicion] = useState(null);
  const [pendiente, setPendiente] = useState(null);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const producto = tipo === "productos",
    usuario = tipo === "usuarios";
  const lista = datos[tipo].filter((r) =>
    (r.nombre + " " + (r.correo || ""))
      .toLocaleLowerCase("es")
      .includes(busqueda.trim().toLocaleLowerCase("es")),
  );
  function campo(id, etiqueta, type = "text") {
    return (
      <div className="mb-3">
        <label className="form-label" htmlFor={id}>
          {etiqueta}
        </label>
        <input
          className="form-control"
          id={id}
          type={type}
          required
          value={edicion[id]}
          onChange={(e) => setEdicion({ ...edicion, [id]: e.target.value })}
        />
      </div>
    );
  }
  return (
    <section aria-label={`Gestión de ${tipo}`}>
      <div className="d-flex gap-3 align-items-center flex-wrap mb-3">
        <h2 className="me-auto">
          {tipo === "productos"
            ? "Productos"
            : tipo === "categorias"
              ? "Categorías"
              : "Usuarios"}
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setEdicion({ ...vacio, categoria: datos.categorias[0]?.id || "" });
            setError("");
            setMensaje("");
          }}
        >
          Crear registro
        </button>
      </div>
      {usuario && (
        <p>
          Directorio de clientes de demostración. No crea credenciales ni
          permite asignar administradores.
        </p>
      )}
      <label htmlFor="buscarAdmin">Buscar registros</label>
      <input
        id="buscarAdmin"
        className="form-control my-2"
        type="search"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />
      {mensaje && <p role="status">{mensaje}</p>}
      {error && <p role="alert">{error}</p>}
      {edicion && (
        <form
          className="border rounded p-3 my-3"
          aria-label="Editar registro"
          onSubmit={(e) => {
            e.preventDefault();
            try {
              onSave(tipo, edicion);
              setEdicion(null);
              setError("");
              setMensaje("Registro guardado.");
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          <h3>{edicion.id ? "Editar registro" : "Nuevo registro"}</h3>
          {campo("nombre", "Nombre")}
          {producto && (
            <>
              {campo("precio", "Precio CLP", "number")}
              <label htmlFor="precioOferta">
                Precio de oferta CLP (opcional)
              </label>
              <input
                id="precioOferta"
                className="form-control mb-3"
                type="number"
                min="1"
                step="1"
                value={edicion.precioOferta ?? ""}
                onChange={(e) =>
                  setEdicion({ ...edicion, precioOferta: e.target.value })
                }
              />
              <p>
                Debe ser menor al precio normal. Deja vacío para quitar la
                oferta.
              </p>
              {campo("stock", "Stock", "number")}
              <label htmlFor="categoria">Categoría</label>
              <select
                className="form-select mb-3"
                id="categoria"
                required
                value={edicion.categoria}
                onChange={(e) =>
                  setEdicion({ ...edicion, categoria: e.target.value })
                }
              >
                <option value="">Seleccionar</option>
                {datos.categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                className="form-control mb-3"
                id="descripcion"
                value={edicion.descripcion || ""}
                onChange={(e) =>
                  setEdicion({ ...edicion, descripcion: e.target.value })
                }
              />
            </>
          )}
          {usuario && campo("correo", "Correo electrónico", "email")}
          <button className="btn btn-success me-2" type="submit">
            Guardar registro
          </button>
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() => {
              setEdicion(null);
              setError("");
            }}
          >
            Cancelar edición
          </button>
        </form>
      )}
      <div className="table-responsive">
        <table className="table table-dark table-striped align-middle">
          <thead>
            <tr>
              <th>Nombre</th>
              {producto && (
                <>
                  <th>Precio CLP</th>
                  <th>Stock</th>
                </>
              )}
              {usuario && <th>Correo</th>}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((r) => (
              <tr key={r.id}>
                <td>{r.nombre}</td>
                {producto && (
                  <>
                    <td>{r.precio}</td>
                    <td>{r.stock}</td>
                  </>
                )}
                {usuario && <td>{r.correo}</td>}
                <td>
                  <button
                    className="btn btn-sm btn-outline-info me-2"
                    aria-label={`Editar ${r.nombre}`}
                    onClick={() => {
                      setEdicion({ ...vacio, ...r });
                      setError("");
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    aria-label={`Eliminar ${r.nombre}`}
                    onClick={() => {
                      setPendiente(r);
                      setError("");
                    }}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!lista.length && <p>No hay registros para mostrar.</p>}
      {pendiente && (
        <div className="alert alert-warning" role="alert">
          <p>
            ¿Eliminar {pendiente.nombre}? Esta acción elimina el registro local.
          </p>
          <button
            className="btn btn-danger me-2"
            onClick={() => {
              try {
                onDelete(tipo, pendiente.id);
                setPendiente(null);
                setMensaje("Registro eliminado.");
                setError("");
              } catch (err) {
                setPendiente(null);
                setError(err.message);
              }
            }}
          >
            Confirmar eliminación
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setPendiente(null)}
          >
            Conservar registro
          </button>
        </div>
      )}
    </section>
  );
}
