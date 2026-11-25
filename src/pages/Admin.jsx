import { Navigate, Route, Routes } from "react-router";
import AdminLayout from "../components/AdminLayout.jsx";
import AdminDashboard from "../components/AdminDashboard.jsx";
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
  const resumen = <AdminDashboard datos={datos} demo />;
  return (
    <AdminLayout title="Panel de administración" links={[["/admin","Resumen"],["/admin/productos","Productos"],["/admin/categorias","Categorías"],["/admin/usuarios","Usuarios"],["/admin/ordenes","Órdenes"],["/admin/reportes","Reportes"],["/admin/perfil","Perfil"]]} onLogout={onLogout} logoutLabel="Cerrar sesión de administrador" demo>
      {aviso && <p role="alert">{aviso}</p>}
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
    </AdminLayout>
  );
}
