import { Link, NavLink, Navigate, Route, Routes } from "react-router";
import AdminOrdenes from "../components/AdminOrdenes.jsx";
import AdminColeccion from "../components/AdminColeccion.jsx";
import { esAdmin } from "../data/administracion.js";
import { precioCLP } from "../data/nexus.js";
export default function Admin({
  usuario,
  datos,
  onSave,
  onDelete,
  onLogout,
  aviso,
  onChangeEstado,
}) {
  if (!esAdmin(usuario)) return <Navigate to="/admin/login" replace />;
  const criticos = datos.productos.filter((p) => p.stock <= 5);
  const resumen = (
    <section>
      <h2>Resumen del negocio</h2>
      <div className="row g-3 mb-4">
        {[
          ["Productos", datos.productos.length],
          ["Categorías", datos.categorias.length],
          ["Clientes", datos.usuarios.length],
          ["Órdenes", datos.ordenes.length],
        ].map(([titulo, valor]) => (
          <div className="col-6 col-lg-3" key={titulo}>
            <div className="border rounded p-3">
              <h3 className="h6">{titulo}</h3>
              <strong className="fs-3">{valor}</strong>
            </div>
          </div>
        ))}
      </div>
      <h3>Productos con stock crítico</h3>
      {criticos.length ? (
        <ul>
          {criticos.map((p) => (
            <li key={p.id}>
              {p.nombre}: {p.stock} unidades
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay productos con stock crítico (5 unidades o menos).</p>
      )}
    </section>
  );
  return (
    <main className="container py-4">
      <header className="d-flex justify-content-between gap-3 flex-wrap mb-4">
        <div>
          <p className="text-info">NEXUS / ADMINISTRACIÓN</p>
          <h1>Panel de administración</h1>
        </div>
        <div>
          <Link className="btn btn-outline-info me-2" to="/tienda">
            Ver tienda
          </Link>
          <button className="btn btn-outline-light" onClick={onLogout}>
            Cerrar sesión de administrador
          </button>
        </div>
      </header>
      <p>
        Datos de demostración guardados en este navegador. No se procesan pagos
        ni se crean cuentas reales.
      </p>
      {aviso && <p role="alert">{aviso}</p>}
      <nav
        className="nav nav-pills gap-2 flex-wrap mb-4"
        aria-label="Administración"
      >
        {[
          ["", "Resumen"],
          ["productos", "Productos"],
          ["categorias", "Categorías"],
          ["usuarios", "Usuarios"],
          ["ordenes", "Órdenes"],
          ["reportes", "Reportes"],
          ["perfil", "Perfil"],
        ].map(([ruta, etiqueta]) => (
          <NavLink
            end
            key={ruta}
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            to={`/admin${ruta ? "/" + ruta : ""}`}
          >
            {etiqueta}
          </NavLink>
        ))}
      </nav>
      <Routes>
        <Route index element={resumen} />
        {["productos", "categorias", "usuarios"].map((tipo) => (
          <Route
            key={tipo}
            path={tipo}
            element={
              <AdminColeccion
                key={tipo}
                tipo={tipo}
                datos={datos}
                onSave={onSave}
                onDelete={onDelete}
              />
            }
          />
        ))}
        <Route
          path="ordenes"
          element={
            <AdminOrdenes
              ordenes={datos.ordenes}
              onChangeEstado={onChangeEstado}
            />
          }
        />
        <Route
          path="reportes"
          element={
            <section>
              <h2>Reporte de inventario</h2>
              <p>
                Valor del inventario:{" "}
                {precioCLP(
                  datos.productos.reduce((s, p) => s + p.precio * p.stock, 0),
                )}
              </p>
              <p>Productos con stock crítico: {criticos.length}</p>
              <p>
                Pedidos activos simulados:{" "}
                {datos.ordenes.filter((o) => o.estado !== "cancelado").length}.
                Total simulado:{" "}
                {precioCLP(
                  datos.ordenes
                    .filter((o) => o.estado !== "cancelado")
                    .reduce((total, o) => total + o.total, 0),
                )}
                . No representa ingresos reales.
              </p>
            </section>
          }
        />
        <Route
          path="perfil"
          element={
            <section>
              <h2>Perfil administrador</h2>
              <p>{usuario.nombre}</p>
              <p>{usuario.correo}</p>
              <p>Rol: administrador de demostración</p>
            </section>
          }
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </main>
  );
}
