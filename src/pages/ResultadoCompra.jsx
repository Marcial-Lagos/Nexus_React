import { Link, useLocation, useParams } from 'react-router';
import { esAdmin } from '../data/administracion.js';
import { precioCLP } from '../data/nexus.js';
export default function ResultadoCompra({ usuario, ordenes }) {
  const { id } = useParams(); const ubicacion = useLocation();
  if (id === 'rechazada' && ubicacion.state?.rechazo) return <main className="container py-5"><h1>Pago simulado rechazado</h1><p>No se creó un pedido ni se descontó stock. Tu carrito se conserva.</p><Link to="/checkout">Volver a intentar</Link></main>;
  const pedido = ordenes.find((o) => o.id === id && (o.sesionId === usuario?.id || esAdmin(usuario)));
  if (!pedido) return <main className="container py-5"><h1>Compra no disponible</h1><Link to="/tienda">Volver a la tienda</Link></main>;
  return <main className="container py-5"><h1>Compra simulada confirmada</h1><p>Pedido: {pedido.id}</p><p>Estado: {pedido.estado}</p><p>Confirmación de demostración; no es una boleta tributaria ni un cobro real.</p><ul>{pedido.items.map((i) => <li key={i.id}>{i.nombre} × {i.cantidad}: {precioCLP(i.precio * i.cantidad)}</li>)}</ul><p>Envío: {precioCLP(pedido.envio)}</p><strong>Total: {precioCLP(pedido.total)}</strong><p>Entrega: {pedido.cliente.entrega === 'retiro' ? 'Retiro' : `${pedido.cliente.direccion}, ${pedido.cliente.comuna}`}</p><Link to="/tienda">Seguir comprando</Link></main>;
}
