import { esAdmin } from './administracion.js';
export const COSTO_ENVIO = 3990;
export function validarEntrega(datos) {
  const errores = {};
  if (!datos.nombre?.trim() || datos.nombre.trim().length > 100) errores.nombre = 'Ingresa un nombre de hasta 100 caracteres.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.correo?.trim() || '')) errores.correo = 'Ingresa un correo válido.';
  if (!['retiro', 'domicilio'].includes(datos.entrega)) errores.entrega = 'Selecciona una forma de entrega.';
  if (datos.entrega === 'domicilio') {
    if (!datos.direccion?.trim() || datos.direccion.trim().length > 200) errores.direccion = 'Ingresa una dirección de hasta 200 caracteres.';
    if (!datos.comuna?.trim() || datos.comuna.trim().length > 100) errores.comuna = 'Ingresa una comuna de hasta 100 caracteres.';
  }
  return errores;
}
export function prepararCompra(datos, carrito, entrega) {
  if (!carrito.length) throw new Error('El carrito está vacío.');
  const cantidades = new Map();
  for (const item of carrito) {
    if (!Number.isSafeInteger(item.cantidad) || item.cantidad <= 0) throw new Error('Cantidad inválida.');
    cantidades.set(item.id, (cantidades.get(item.id) || 0) + item.cantidad);
  }
  const items = [...cantidades].map(([id, cantidad]) => {
    const producto = datos.productos.find((p) => p.id === id);
    if (!producto) throw new Error('Un producto ya no está disponible. Quítalo del carrito.');
    if (!Number.isSafeInteger(producto.stock) || cantidad > producto.stock) throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}.`);
    if (!Number.isSafeInteger(producto.precio) || producto.precio <= 0) throw new Error('Precio inválido en el catálogo.');
    if (carrito.some((p) => p.id === id && p.precio !== producto.precio)) throw new Error(`El precio de ${producto.nombre} cambió. Quítalo y agrégalo nuevamente para aceptar el precio actualizado.`);
    return { id, nombre: producto.nombre, precio: producto.precio, cantidad };
  });
  const subtotal = items.reduce((s, p) => s + p.precio * p.cantidad, 0);
  const envio = entrega === 'domicilio' ? COSTO_ENVIO : 0;
  if (!Number.isSafeInteger(subtotal + envio)) throw new Error('El total supera el valor permitido.');
  return { items, subtotal, envio, total: subtotal + envio };
}
export function crearPedido(datos, carrito, entrega, usuario, id) {
  if (!usuario?.id) throw new Error('Inicia sesión antes de comprar.');
  const existente = datos.ordenes.find((o) => o.id === id);
  if (existente) {
    if (existente.sesionId !== usuario.id) throw new Error('Identificador de compra no disponible.');
    return { datos, pedido: existente };
  }
  if (Object.keys(validarEntrega(entrega)).length) throw new Error('Revisa los datos de entrega.');
  const resumen = prepararCompra(datos, carrito, entrega.entrega);
  const pedido = { id, sesionId: usuario.id, fecha: new Date().toISOString(), estado: 'pendiente', pago: 'simulado aprobado', cliente: { nombre: entrega.nombre.trim(), correo: entrega.correo.trim(), entrega: entrega.entrega, direccion: entrega.entrega === 'domicilio' ? entrega.direccion.trim() : '', comuna: entrega.entrega === 'domicilio' ? entrega.comuna.trim() : '' }, ...resumen };
  return { pedido, datos: { ...datos, ordenes: [...datos.ordenes, pedido], productos: datos.productos.map((p) => ({ ...p, stock: p.stock - (resumen.items.find((i) => i.id === p.id)?.cantidad || 0) })) } };
}
export const TRANSICIONES = { pendiente: ['preparando', 'cancelado'], preparando: ['enviado', 'cancelado'], enviado: [], cancelado: [] };
export function cambiarEstadoPedido(datos, id, estado, usuario) {
  if (!esAdmin(usuario)) throw new Error('Acceso reservado a administradores.');
  const pedido = datos.ordenes.find((o) => o.id === id);
  if (!pedido) throw new Error('Pedido no encontrado.');
  if (pedido.estado === estado) return datos;
  if (!TRANSICIONES[pedido.estado]?.includes(estado)) throw new Error('Cambio de estado no permitido.');
  if (estado === 'cancelado' && pedido.items.some((i) => !datos.productos.some((p) => p.id === i.id))) throw new Error('Falta un producto para devolver su stock.');
  return { ...datos, ordenes: datos.ordenes.map((o) => o.id === id ? { ...o, estado } : o), productos: estado === 'cancelado' ? datos.productos.map((p) => ({ ...p, stock: p.stock + (pedido.items.find((i) => i.id === p.id)?.cantidad || 0) })) : datos.productos };
}
