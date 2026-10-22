# Compra y gestión de pedidos de demostración

## Recorrido

1. Entrar como cliente o invitado y abrir Tienda.
2. Abrir un producto, elegir cantidad y agregar al carrito.
3. Seleccionar Finalizar compra. El formulario precarga nombre y correo de la sesión; completar o corregir según corresponda.
4. Elegir retiro gratuito o despacho a domicilio por $3.990 CLP. Para despacho son obligatorias dirección y comuna.
5. Seleccionar pago simulado aprobado o rechazado y confirmar. Nunca se solicitan tarjetas o datos bancarios.
6. Si se aprueba, se guarda el pedido junto con el nuevo stock, se vacía el carrito y se muestra un comprobante local con su identificador, artículos y total. No es una boleta tributaria.
7. Si se rechaza, no se genera pedido ni se descuenta stock y se puede reintentar con el carrito conservado.
8. Cerrar sesión, entrar con admin@nexus.cl / NexusAdmin123! y abrir Órdenes. Los pedidos del cliente siguen guardados en este navegador.

## Estados administrativos

- Pendiente → preparando o cancelado.
- Preparando → enviado o cancelado.
- Enviado y cancelado son estados finales.
- Cancelar exige confirmación y devuelve las unidades una sola vez.
- No se permite eliminar productos vinculados a pedidos pendientes o preparando.
- El pedido conserva precio, nombre y datos de entrega históricos aunque cambie después el catálogo.
- Reportes muestra cantidad y total de pedidos no cancelados, siempre identificados como simulados.

## Validaciones y persistencia

`src/data/pedidos.js` contiene validación de entrega, cálculo de totales, creación idempotente de pedidos y transiciones de estado. Los datos continúan en `nexus.administracion.v1`.

Antes de confirmar se vuelve a leer el catálogo local para validar disponibilidad, stock y precio. Un precio cambiado obliga a quitar y volver a agregar el producto para aceptar el nuevo valor. Las cantidades repetidas se acumulan para comprobar el stock. Se bloquean cantidades inválidas y productos agotados. Si no se puede guardar el pedido, no se confirma ni se descuenta stock en memoria y el carrito se conserva.

Cada envío tiene un identificador; repetir la misma confirmación no crea otra orden ni vuelve a descontar stock. Una referencia interna de sesión permite recuperar el comprobante al recargar y limita su consulta desde otras sesiones en la interfaz. El administrador puede consultar todas las órdenes.

Limitaciones: el prototipo usa datos locales, sin backend ni pago real. localStorage no ofrece transacciones entre pestañas ni autorización segura; la revalidación detecta cambios anteriores al envío, pero no garantiza compras simultáneas en distintos procesos. El carrito se mantiene en memoria y se pierde si se recarga la página o se cierra sesión; los pedidos confirmados y su stock sí persisten. No se crean cuentas de clientes ni se implementan devoluciones monetarias, boletas tributarias o sincronización entre dispositivos.

## Pruebas

Vitest + React Testing Library, con coverage V8. Ejecutar:

```sh
npm ci
npm run test:run -- --coverage
npm run lint
npm run build
```

Casos: totales y despacho, datos de entrega, compra aprobada/rechazada, doble clic e idempotencia, stock insuficiente o cambiado, precio alterado, carrito vacío, persistencia bloqueada, resultado de otra sesión, estados administrativos, cancelación y restitución de stock. Cada nuevo componente cuenta con pruebas.
