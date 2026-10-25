import { Link, useSearchParams } from "react-router";
import ImagenProducto from "../components/ImagenProducto.jsx";
import { productos as catalogoInicial, precioCLP } from "../data/nexus.js";

import { filtrarCatalogo, precioVenta, tieneOferta } from "../data/catalogo.js";

export default function Tienda({
  categorias = [{ id: "gaming", nombre: "Gaming" }],
  productos = catalogoInicial,
  carrito = [],
  onChangeQuantity,
  onRemove,
  onEmpty,
}) {
  const [parametros, setParametros] = useSearchParams();
  const visibles = filtrarCatalogo(productos, parametros);
  function filtrar(clave, valor) {
    setParametros(
      (actuales) => {
        const nuevos = new URLSearchParams(actuales);
        if (valor) nuevos.set(clave, valor);
        else nuevos.delete(clave);
        return nuevos;
      },
      { replace: true },
    );
  }
  const total = carrito.reduce(
    (suma, item) => suma + item.precio * item.cantidad,
    0,
  );
  return (
    <main className="pagina-tienda contenedor-contenido">
      <h1 className="titulo-tienda">Tienda Nexus</h1>
      <section className="tarjeta-panel mb-4" aria-label="Filtros de productos">
        <div className="row g-3">
          <div className="col-12 col-md-6">
            <label htmlFor="buscarProducto">Buscar productos</label>
            <input
              id="buscarProducto"
              className="form-control"
              type="search"
              placeholder="Nombre o descripción"
              value={parametros.get("q") || ""}
              onChange={(e) => filtrar("q", e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="filtrarCategoria">Categoría</label>
            <select
              id="filtrarCategoria"
              className="form-select"
              value={parametros.get("categoria") || ""}
              onChange={(e) => filtrar("categoria", e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
              {parametros.get("categoria") &&
                !categorias.some(
                  (c) => c.id === parametros.get("categoria"),
                ) && (
                  <option value={parametros.get("categoria")}>
                    Categoría no disponible
                  </option>
                )}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label htmlFor="ordenProductos">Ordenar por</label>
            <select
              id="ordenProductos"
              className="form-select"
              value={parametros.get("orden") || ""}
              onChange={(e) => filtrar("orden", e.target.value)}
            >
              <option value="">Orden del catálogo</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
              <option value="nombre">Nombre</option>
            </select>
          </div>
        </div>
        <div className="d-flex gap-3 flex-wrap align-items-center mt-3">
          <label>
            <input
              type="checkbox"
              checked={parametros.get("stock") === "1"}
              onChange={(e) => filtrar("stock", e.target.checked ? "1" : "")}
            />{" "}
            Solo disponibles
          </label>
          <label>
            <input
              type="checkbox"
              checked={parametros.get("ofertas") === "1"}
              onChange={(e) => filtrar("ofertas", e.target.checked ? "1" : "")}
            />{" "}
            Solo ofertas
          </label>
          <button
            className="boton boton-secundario"
            onClick={() => setParametros({})}
          >
            Limpiar filtros
          </button>
        </div>
      </section>
      <p role="status">{visibles.length} productos encontrados</p>
      {!visibles.length && (
        <p>No hay productos que coincidan con los filtros.</p>
      )}
      <div className="contenedor-productos">
        {visibles.map((producto) => (
          <article className="producto-card" key={producto.id}>
            <ImagenProducto producto={producto} />
            <h3>{producto.nombre}</h3>
            {tieneOferta(producto) && (
              <p>
                <span className="badge text-bg-success">Oferta</span>{" "}
                <del aria-label="Precio normal">
                  {precioCLP(producto.precio)}
                </del>
              </p>
            )}
            <p>{precioCLP(precioVenta(producto))}</p>
            <p>
              {categorias.find((c) => c.id === producto.categoria)?.nombre ||
                "Sin categoría"}{" "}
              · {producto.stock === 0 ? "Sin stock" : "Disponible"}
            </p>
            <Link
              className="boton boton-primario"
              to={`/producto?producto=${encodeURIComponent(producto.nombre)}`}
              aria-label={`Comprar ${producto.nombre}`}
            >
              Comprar
            </Link>
          </article>
        ))}
      </div>
      <section
        className="tarjeta-panel carrito-panel"
        aria-label="Carrito de demostración"
      >
        <h2>Tu carrito</h2>
        <p>Demostración local. Los pedidos y pagos son simulados.</p>
        {carrito.length === 0 ? (
          <p>Tu carrito está vacío.</p>
        ) : (
          <>
            <ul className="lista-carrito">
              {carrito.map((item) => (
                <li key={item.id}>
                  <span>{item.nombre}</span>
                  <div className="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      className="boton boton-suave"
                      onClick={() => onChangeQuantity(item.id, -1)}
                      disabled={item.cantidad <= 1}
                      aria-label={`Disminuir cantidad de ${item.nombre}`}
                    >
                      −
                    </button>
                    <strong>{item.cantidad}</strong>
                    <button
                      type="button"
                      className="boton boton-suave"
                      onClick={() => onChangeQuantity(item.id, 1)}
                      disabled={
                        item.cantidad >=
                        (productos.find((p) => p.id === item.id)?.stock ?? 0)
                      }
                      aria-label={`Aumentar cantidad de ${item.nombre}`}
                    >
                      +
                    </button>
                  </div>
                  <strong>{precioCLP(item.precio * item.cantidad)}</strong>
                  <button
                    className="boton boton-suave"
                    onClick={() => onRemove(item.id)}
                    aria-label={`Quitar ${item.nombre}`}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              <strong>Total: {precioCLP(total)}</strong>
              <Link className="btn btn-primary" to="/checkout">
                Finalizar compra
              </Link>
              <button className="boton boton-secundario" onClick={onEmpty}>
                Vaciar carrito
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
