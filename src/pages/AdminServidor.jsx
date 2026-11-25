import { useEffect, useState } from "react";
import { useParams } from "react-router";
import AdminLayout from "../components/AdminLayout.jsx";
import AdminDashboard from "../components/AdminDashboard.jsx";
import {
  API_PATHS,
  apiRequest,
  normalizeOrder,
  obtenerProductos,
} from "../api/client.js";
import { precioCLP } from "../data/nexus.js";

const vacio = {
  nombre: "",
  descripcion: "",
  categoria: "",
  precio: "",
  precioOferta: "",
  stock: "",
  imagen: "",
};
const secciones = [
  "resumen",
  "productos",
  "categorias",
  "usuarios",
  "ordenes",
  "reportes",
];
const titulos = [
  "Resumen",
  "Productos",
  "Categorías",
  "Clientes",
  "Pedidos",
  "Inventario",
];
const siguiente = {
  PENDIENTE: "CONFIRMADO",
  CONFIRMADO: "EN_PREPARACION",
  EN_PREPARACION: "EN_CAMINO",
  EN_CAMINO: "ENTREGADO",
};

async function cargarDatos(signal) {
  const [productos, usuarios, ordenes] = await Promise.all([
    obtenerProductos({ signal }),
    apiRequest("/api/v1/usuarios", { signal }),
    apiRequest(API_PATHS.orders, { signal }),
  ]);
  return { productos, usuarios, ordenes: ordenes.map(normalizeOrder) };
}

export default function AdminServidor({ onLogout }) {
  const { "*": ruta } = useParams();
  const seccion = secciones.includes(ruta) ? ruta : "resumen";
  const [datos, setDatos] = useState(null);
  const [busqueda,setBusqueda]=useState("");
  const [filtro,setFiltro]=useState("");
  const coincide=(...valores)=>valores.join(" ").toLocaleLowerCase("es").includes(busqueda.toLocaleLowerCase("es"));
  const [edicion, setEdicion] = useState(null);
  const [quitar, setQuitar] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    cargarDatos(controller.signal)
      .then((res) => {
        if (!controller.signal.aborted) setDatos(res);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, []);
  async function ejecutar(accion, confirmacion) {
    if (ocupado) return;
    setOcupado(true);
    setError("");
    setMensaje("");
    try {
      await accion();
      setEdicion(null);
      setQuitar("");
      setMensaje(confirmacion);
      setDatos(await cargarDatos());
    } catch (e) {
      setError(e.message);
    } finally {
      setOcupado(false);
    }
  }
  function guardar(e) {
    e.preventDefault();
    const p = edicion;
    const body = {
      nombre: p.nombre.trim(),
      descripcion: p.descripcion.trim(),
      categoria: p.categoria.trim(),
      precio: Number(p.precio),
      precioOferta: p.precioOferta ? Number(p.precioOferta) : null,
      stock: Number(p.stock),
      imagenUrl: p.imagen?.trim() || null,
    };
    const url = p.id ? API_PATHS.products + "/" + p.id : API_PATHS.products;
    ejecutar(
      () => apiRequest(url, { method: p.id ? "PUT" : "POST", body }),
      "Producto guardado.",
    );
  }
  const categorias = [
    ...new Set(datos?.productos.map((p) => p.categoria).filter(Boolean)),
  ].sort();
  const productosVisibles=(datos?.productos||[]).filter(p=>coincide(p.nombre,p.categoria)&&(!filtro||p.categoria===filtro));
  const usuariosVisibles=(datos?.usuarios||[]).filter(u=>coincide(u.nombre,u.email,u.correo));
  const ordenesVisibles=(datos?.ordenes||[]).filter(o=>coincide(o.id,o.cliente?.nombre,o.cliente?.correo)&&(!filtro||o.estado===filtro));
  useEffect(()=>{setBusqueda("");setFiltro("");},[seccion]);
  function campo(nombre, etiqueta, tipo = "text", requerido = true) {
    return (
      <label className="d-block mb-2" key={nombre}>
        {etiqueta}
        <input
          className="form-control"
          type={tipo}
          value={edicion[nombre] ?? ""}
          required={requerido}
          min={tipo === "number" ? (nombre === "stock" ? 0 : 1) : undefined}
          step={tipo === "number" ? 1 : undefined}
          list={nombre === "categoria" ? "categorias-disponibles" : undefined}
          onChange={(e) => setEdicion({ ...edicion, [nombre]: e.target.value })}
        />
      </label>
    );
  }
  return (
    <AdminLayout title="Administración de Nexus" links={secciones.map((s,i)=>[s==="resumen"?"/admin":"/admin/"+s,titulos[i]])} onLogout={onLogout} refresh={()=>ejecutar(()=>Promise.resolve(),"Datos actualizados.")}>
      {error && (
        <p role="alert">
          {error}{" "}
          <button
            className="btn btn-link"
            onClick={() => ejecutar(() => Promise.resolve(), "")}
          >
            Actualizar datos
          </button>
        </p>
      )}
      {mensaje && <p role="status">{mensaje}</p>}
      {!datos && !error && (
        <p role="status">Cargando los datos de la tienda…</p>
      )}
      {datos && (
        <>
          {seccion === "resumen" && <AdminDashboard datos={datos} />}
          {seccion === "productos" && (
            <section>
              <h2>Catálogo de productos</h2>
              <button
                className="btn btn-primary my-2"
                onClick={() => setEdicion({ ...vacio })}
              >
                Nuevo producto
              </button>
              {edicion && (
                <form
                  onSubmit={guardar}
                  className="border rounded p-3 my-3"
                  style={{ maxWidth: 600 }}
                >
                  <h3>{edicion.id ? "Editar producto" : "Crear producto"}</h3>
                  {campo("nombre", "Nombre")}
                  {campo("categoria", "Categoría")}
                  <datalist id="categorias-disponibles">
                    {categorias.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </datalist>
                  {campo("descripcion", "Descripción", "text", false)}
                  {campo("precio", "Precio en pesos", "number")}
                  {campo(
                    "precioOferta",
                    "Precio de oferta (opcional)",
                    "number",
                    false,
                  )}
                  {campo("stock", "Unidades disponibles", "number")}
                  {campo(
                    "imagen",
                    "Ruta o URL de imagen (opcional)",
                    "text",
                    false,
                  )}
                  <button className="btn btn-primary me-2" disabled={ocupado}>
                    Guardar
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEdicion(null)}
                  >
                    Cancelar
                  </button>
                </form>
              )}
              <div className="nx-filter"><input className="form-control" aria-label="Buscar productos" placeholder="Buscar por nombre o categoría" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/><select className="form-select" aria-label="Filtrar categoría" value={filtro} onChange={e=>setFiltro(e.target.value)}><option value="">Todas las categorías</option>{categorias.map(c=><option key={c}>{c}</option>)}</select></div>
              <div className="nx-panel table-responsive"><table className="table table-hover align-middle mb-0"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead><tbody>
              {productosVisibles.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.nombre}</strong></td><td>{p.categoria}</td><td>{precioCLP(p.precio)}</td><td><span className={"nx-badge "+(p.stock<=5?"warning":"ok")}>{p.stock} un.</span></td><td>
                  <button
                    className="btn btn-sm btn-outline-info me-2"
                    onClick={() => setEdicion({ ...vacio, ...p })}
                  >
                    Editar
                  </button>
                  {quitar === p.id ? (
                    <>
                      <button
                        className="btn btn-sm btn-danger me-2"
                        disabled={ocupado}
                        onClick={() =>
                          ejecutar(
                            () =>
                              apiRequest(API_PATHS.products + "/" + p.id, {
                                method: "DELETE",
                              }),
                            "Producto retirado.",
                          )
                        }
                      >
                        Confirmar retiro
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setQuitar("")}
                      >
                        Conservar
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setQuitar(p.id)}
                    >
                      Retirar del catálogo
                    </button>
                  )}
                  </td>
                </tr>
              ))}
              </tbody></table>{!productosVisibles.length&&<p className="nx-empty">No hay productos para esta búsqueda.</p>}</div>
            </section>
          )}
          {seccion === "categorias" && (
            <section>
              <h2>Categorías del catálogo</h2>
              <p>Asigna o cambia la categoría al editar un producto.</p>
              <ul>
                {categorias.map((c) => (
                  <li key={c}>
                    {c} ·{" "}
                    {datos.productos.filter((p) => p.categoria === c).length}{" "}
                    productos
                  </li>
                ))}
              </ul>
            </section>
          )}
          {seccion === "usuarios" && (
            <section>
              <h2>Cuentas registradas</h2>
              <div className="nx-filter"><input className="form-control" aria-label="Buscar clientes" placeholder="Buscar por nombre o correo" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/></div><div className="nx-panel table-responsive"><table className="table mb-0"><thead><tr><th>Nombre</th><th>Correo</th></tr></thead><tbody>
                {usuariosVisibles.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td><td>{u.email||u.correo}</td>
                  </tr>
                ))}
</tbody></table>{!usuariosVisibles.length&&<p className="nx-empty">No hay cuentas para esta búsqueda.</p>}</div>
            </section>
          )}
          {seccion === "ordenes" && (
            <section>
              <h2>Pedidos</h2>
              {!datos.ordenes.length && <p>Aún no hay pedidos.</p>}
              <div className="nx-filter"><input className="form-control" aria-label="Buscar pedidos" placeholder="Buscar por pedido o cliente" value={busqueda} onChange={e=>setBusqueda(e.target.value)}/><select className="form-select" aria-label="Filtrar estado" value={filtro} onChange={e=>setFiltro(e.target.value)}><option value="">Todos los estados</option>{[...new Set(datos.ordenes.map(o=>o.estado))].map(e=><option key={e}>{e}</option>)}</select></div>
              {ordenesVisibles.map((o) => (
                <article className="nx-panel mb-3" key={o.id}>
                  <h3 className="h5">
                    Pedido {o.id} <span className="nx-badge">{o.estado.replaceAll("_"," ")}</span>
                  </h3>
                  <p>
                    {o.cliente.nombre} · {o.cliente.correo} ·{" "}
                    {o.cliente.direccion}
                  </p>
                  <ul>
                    {o.items.map((i) => (
                      <li key={i.id}>
                        {i.nombre} × {i.cantidad}
                      </li>
                    ))}
                  </ul>
                  <p>Total {precioCLP(o.total)}</p>
                  {siguiente[o.estado] && (
                    <button
                      className="btn btn-outline-info"
                      disabled={ocupado}
                      onClick={() =>
                        ejecutar(
                          () =>
                            apiRequest(
                              API_PATHS.orders +
                                "/" +
                                o.id +
                                "/estado?estado=" +
                                siguiente[o.estado],
                              { method: "PATCH" },
                            ),
                          "Estado actualizado.",
                        )
                      }
                    >
                      Marcar{" "}
                      {siguiente[o.estado].toLowerCase().replaceAll("_", " ")}
                    </button>
                  )}
                </article>
              ))}
            </section>
          )}
          {seccion === "reportes" && (
            <section>
              <h2>Inventario y pedidos</h2>
              <p>
                Valor del inventario a precio de lista ·{" "}
                {precioCLP(
                  datos.productos.reduce((s, p) => s + p.stock * p.precio, 0),
                )}
              </p>
              <p>
                Pedidos con pago simulado aprobado ·{" "}
                {datos.ordenes.filter((o) => o.referenciaPago).length}
              </p>
              <h3 className="h5">Productos con cinco unidades o menos</h3>
              {datos.productos.every((p) => p.stock > 5) ? (
                <p>Sin productos con stock bajo.</p>
              ) : (
                <ul>
                  {datos.productos
                    .filter((p) => p.stock <= 5)
                    .map((p) => (
                      <li key={p.id}>
                        {p.nombre} · {p.stock}
                      </li>
                    ))}
                </ul>
              )}
            </section>
          )}
        </>
      )}
    </AdminLayout>
  );
}
