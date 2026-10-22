import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import ImagenProducto from "../components/ImagenProducto.jsx";
import { productos as catalogoInicial, precioCLP } from "../data/nexus.js";

import { precioVenta, tieneOferta } from "../data/catalogo.js";

export default function Producto({
  onAdd,
  categorias = [],
  productos = catalogoInicial,
}) {
  const [parametros] = useSearchParams();
  const nombre = parametros.get("producto");
  const producto =
    productos.find((item) => item.nombre === nombre || item.id === nombre) ||
    (!nombre ? productos[0] : null);
  // La clave de la ruta en App reinicia cantidad y selección al cambiar de producto.
  const [cantidad, setCantidad] = useState(1);
  const [vista, setVista] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const limite = Math.min(99, producto?.stock ?? 99);
  if (!producto)
    return (
      <main className="pagina-producto">
        <h1>Producto no encontrado</h1>
        <p>El producto solicitado no está en el catálogo de Nexus.</p>
        <Link className="boton boton-primario" to="/tienda">
          Volver a la tienda
        </Link>
      </main>
    );
  return (
    <main className="pagina-producto">
      <nav className="ruta-producto" aria-label="Ruta del producto">
        <Link to="/principal">Inicio</Link>
        <span>›</span>
        <Link to="/tienda">Tienda</Link>
        <span>›</span>
        <span>{producto.nombre}</span>
      </nav>
      <section className="detalle-producto">
        <div className="zona-imagen-producto">
          <div className={`imagen-producto-grande vista-${vista}`}>
            <ImagenProducto producto={producto} />
          </div>
          <div className="miniaturas-producto">
            {[0, 1, 2].map((indice) => (
              <button
                key={indice}
                className={`miniatura-producto${vista === indice ? " activa" : ""}`}
                onClick={() => setVista(indice)}
                aria-label={`Vista ${indice + 1}`}
                aria-pressed={vista === indice}
              >
                <ImagenProducto producto={producto} />
              </button>
            ))}
          </div>
        </div>
        <div className="informacion-detalle-producto">
          <span className="categoria-producto">
            {categorias.find((c) => c.id === producto.categoria)?.nombre ||
              "NEXUS GAMING"}
          </span>
          <h1>{producto.nombre}</h1>
          {producto.modelo && (
            <p className="modelo-producto">{producto.modelo}</p>
          )}
          <div className="valoracion-producto">
            <span>★ ★ ★ ★ ☆</span>
            <small>4.8 (256 reseñas de demostración)</small>
          </div>
          <div className="fila-precio-producto">
            {tieneOferta(producto) && (
              <span>
                <span className="badge text-bg-success">Oferta</span>{" "}
                <del aria-label="Precio normal">
                  {precioCLP(producto.precio)}
                </del>
              </span>
            )}
            <p className="precio-producto">
              {precioCLP(precioVenta(producto))}
            </p>
            <span className="producto-disponible">
              {producto.stock === 0 ? "Sin stock" : "En stock · demo"}
            </span>
          </div>
          <p className="descripcion-producto">
            {producto.descripcion ||
              "Artículo del catálogo de demostración original de Nexus. La fotografía y la ficha técnica no fueron incluidas en el proyecto original."}
          </p>
          {producto.caracteristicas && (
            <ul className="caracteristicas-producto">
              {producto.caracteristicas.map((texto) => (
                <li key={texto}>✓ {texto}</li>
              ))}
            </ul>
          )}
          <div className="acciones-producto">
            <div className="selector-cantidad">
              <button
                onClick={() => setCantidad((n) => Math.max(1, n - 1))}
                aria-label="Disminuir cantidad"
                disabled={cantidad === 1}
              >
                −
              </button>
              <span role="status" aria-label="Cantidad">
                {cantidad}
              </span>
              <button
                onClick={() => setCantidad((n) => Math.min(limite, n + 1))}
                aria-label="Aumentar cantidad"
                disabled={cantidad >= limite}
              >
                +
              </button>
            </div>
            <button
              className="boton boton-primario boton-agregar-producto"
              disabled={producto.stock === 0}
              onClick={() => {
                try {
                  onAdd(producto, cantidad);
                  setError("");
                  setMensaje(
                    `¡${cantidad} × ${producto.nombre} agregado al carrito de demostración!`,
                  );
                } catch (err) {
                  setMensaje("");
                  setError(err.message);
                }
              }}
            >
              🛒 Agregar al carrito
            </button>
          </div>
          {error && <p role="alert">{error}</p>}
          {mensaje && (
            <p className="mensaje-formulario exito" role="status">
              {mensaje} <Link to="/tienda">Ver carrito</Link>
            </p>
          )}
          <p className="nota-demo">
            Catálogo de demostración: las condiciones comerciales siguientes son
            contenido del prototipo; los pagos y pedidos son simulados.
          </p>
          <div className="beneficios-producto">
            {[
              ["🚚", "Envío a todo Chile", "Recibe en 3 - 5 días"],
              ["🛡", "Garantía Nexus", "6 meses de garantía"],
              ["💳", "Pago seguro", "Múltiples métodos"],
            ].map(([icono, titulo, texto]) => (
              <div className="beneficio-producto" key={titulo}>
                <span>{icono}</span>
                <div>
                  <strong>{titulo}</strong>
                  <small>{texto}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
