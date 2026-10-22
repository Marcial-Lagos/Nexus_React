# Administración de Nexus

## Acceso

Usar el mismo formulario de inicio de sesión que los clientes. Las credenciales siguientes abren automáticamente `/admin`; los demás usuarios van a `/principal`. `/admin/login` se conserva como acceso directo compatible. Un intento fallido con el correo reservado del administrador muestra un error y no crea una sesión de cliente.

- Correo: `admin@nexus.cl`
- Contraseña pública de demostración: `NexusAdmin123!`

La ruta `/admin/*` comprueba el rol y redirige al acceso administrativo a invitados y clientes. El registro normal no asigna privilegios. La sesión no almacena la contraseña.

## Funciones

- Resumen con cantidades de productos, categorías, clientes y órdenes; stock crítico de hasta 5 unidades.
- Productos: crear, consultar/buscar, editar precio, stock, categoría y descripción, eliminar con confirmación. Los cambios se reflejan en Tienda y Producto.
- Categorías: CRUD y restricción de eliminación cuando tienen productos asociados.
- Usuarios: directorio CRUD de clientes de demostración, sin credenciales ni posibilidad de asignar el rol admin.
- Reportes: valor del inventario y número de productos con stock crítico.
- Órdenes: estado vacío explícito. No existen checkout, emisión de boletas, ventas ni historial de compras real.
- Perfil: consulta del administrador. Cierre de sesión y navegación a la tienda.

Datos en `src/data/administracion.js`, guardados bajo `nexus.administracion.v1` en localStorage. Si no se puede guardar, la interfaz avisa que los cambios duran solo en memoria. Los datos se conservan al cerrar la sesión en el mismo navegador. No son compartidos entre dispositivos.

## Alcance de seguridad

Prototipo frontend académico. La contraseña demo es pública y tanto el rol como los datos del navegador pueden manipularse. No constituye autenticación ni autorización segura. Para datos reales se requiere backend, validación de permisos en cada operación y almacenamiento seguro de credenciales. El directorio no crea cuentas autenticables. El stock del catálogo no constituye reserva de inventario ni control transaccional.

## Pruebas

Ejecutar `npm ci` y `npm run test:run -- --coverage` desde la raíz del repositorio. En PowerShell con scripts bloqueados, usar `npm.cmd`.

Las pruebas verifican autenticación demo correcta e incorrecta, restricción de rutas, cierre de sesión, CRUD persistente, categorías utilizadas, precios y stocks inválidos, errores de almacenamiento y actualización de la tienda.

## Relación con la evaluación parcial 2

El anexo pide fuente de datos JS con CRUD, persistencia integrada con componentes, vistas administrativas y diseño responsivo Bootstrap. Se implementan en este módulo mediante props, estado compartido y formularios/tablas Bootstrap.

La rúbrica y el anexo mencionan explícitamente **Jasmine y Karma**. Este proyecto utiliza **Vitest y React Testing Library**, conforme al flujo previo de trabajo. No se ha reemplazado la herramienta ni se considera acreditado ese indicador: confirmar con el docente si acepta Vitest; si exige Jasmine/Karma se debe adaptar el entorno.

Esta entrega no completa por sí sola toda la evaluación. Quedan por revisar las vistas públicas de categorías/ofertas, checkout, resultado de compra, ERS V2, informe de pruebas y presentación. Las categorías populares de streams retiradas anteriormente no equivalían a las categorías de productos solicitadas en el anexo.
