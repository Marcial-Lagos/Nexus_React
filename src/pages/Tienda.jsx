import { Link } from 'react-router';
import ImagenProducto from '../components/ImagenProducto.jsx';
import { productos, precioCLP } from '../data/nexus.js';

export default function Tienda({ carrito = [], onRemove, onEmpty }) {
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  return (
    <main className="pagina-tienda contenedor-contenido">
      <h1 className="titulo-tienda">Tienda Nexus</h1>
      <div className="contenedor-productos">{productos.map((producto) => <article className="producto-card" key={producto.id}>
        <ImagenProducto producto={producto} /><h3>{producto.nombre}</h3><p>{precioCLP(producto.precio)}</p>
        <Link className="boton boton-primario" to={`/producto?producto=${encodeURIComponent(producto.nombre)}`} aria-label={`Comprar ${producto.nombre}`}>Comprar</Link>
      </article>)}</div>
      <section className="tarjeta-panel carrito-panel" aria-label="Carrito de demostración">
        <h2>Tu carrito</h2><p>Demostración local. No se procesan pagos ni pedidos.</p>
        {carrito.length === 0 ? <p>Tu carrito está vacío.</p> : <>
          <ul className="lista-carrito">{carrito.map((item) => <li key={item.id}><span>{item.nombre} × {item.cantidad}</span><strong>{precioCLP(item.precio * item.cantidad)}</strong><button className="boton boton-suave" onClick={() => onRemove(item.id)} aria-label={`Quitar ${item.nombre}`}>Quitar</button></li>)}</ul>
          <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap"><strong>Total: {precioCLP(total)}</strong><button className="boton boton-secundario" onClick={onEmpty}>Vaciar carrito</button></div>
        </>}
      </section>
    </main>
  );
}

