# Categorías, filtros y ofertas

## Uso

1. En Administración → Categorías, crear o editar una categoría.
2. En Administración → Productos, asignarla al producto. Los cambios se reflejan en la tienda y en la ficha del producto.
3. Para una oferta, indicar «Precio de oferta CLP (opcional)», un entero positivo inferior al precio normal. Dejarlo vacío retira la oferta. Si se baja el precio normal por debajo de la oferta, corregir o retirar la oferta antes de guardar.
4. En Tienda, combinar búsqueda por nombre/descripción (sin distinguir tildes ni mayúsculas), categoría, solo disponibles y solo ofertas. Ordenar por precio efectivo o nombre. «Limpiar filtros» restaura el catálogo completo.

Los filtros están en los parámetros de la URL: `q`, `categoria`, `stock=1`, `ofertas=1`, `orden=precio-asc|precio-desc|nombre`. Por ejemplo, `/tienda?ofertas=1&stock=1` abre los productos disponibles en oferta. No se agregan accesos duplicados a la barra lateral. Una categoría eliminada en una URL antigua muestra cero resultados y permite limpiar filtros.

Las ofertas no se activan automáticamente en los productos iniciales ni alteran datos ya guardados. Los registros anteriores sin precio de oferta conservan su precio normal. Para probar varias categorías, crearlas y reasignar productos desde el panel.

## Consistencia de la compra

`src/data/catalogo.js` centraliza el precio efectivo. Tienda y ficha muestran el precio normal tachado cuando hay oferta. Carrito y checkout cobran el mismo precio efectivo. Al confirmar se consulta otra vez el catálogo persistido: si cambió el precio, se pide quitar y agregar el artículo para aceptar el importe actualizado. El pedido conserva una copia del precio pagado, independiente de cambios posteriores del catálogo.

El almacenamiento y los permisos siguen siendo de demostración en el navegador. Las ofertas se activan y retiran manualmente, sin fechas de vencimiento. No hay pagos reales.

## Validación

- `src/data/catalogo.test.js`: filtros combinados, orden por precio efectivo, importes inválidos, retiro de oferta y revalidación de precios al comprar.
- `src/pages/Tienda.test.jsx`: filtros desde URL, controles, estado vacío, limpieza y categoría eliminada.
- `src/Compra.test.jsx`: categoría creada en administración → producto en oferta → filtro público → ficha → carrito → pedido con precio rebajado y descuento de stock.
- Ejecución: `npm run test:run -- --coverage` (PowerShell: `npm.cmd run test:run -- --coverage`).
- Resultado de esta entrega: 149 pruebas en 30 archivos; 97,29 % sentencias, 95,54 % ramas, 99,22 % funciones y 99,76 % líneas.
- ESLint y compilación de producción verificados. No se realizó comprobación visual en navegador automatizado en este entorno; la copia local carece de algunos recursos binarios del repositorio y Vite avisa de sus rutas al compilar.
