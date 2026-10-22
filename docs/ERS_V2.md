# NEXUS — Especificación de Requisitos de Software (ERS V2)
**Proyecto:** DSY1104, Desarrollo Fullstack II · **Versión:** 2.0 · **Fecha:** 22/10/2026
**Autores de la ERS original:** Marcial Lagos y Ángel Martínez
**Estado:** Documento de revisión técnica, pendiente de validación docente
**Base:** ERS V1 del 10/09/2026 y código de la rama `cleanup/navegacion-simplificada`.
**Marco documental:** estructura de IEEE 830 utilizada en la versión inicial.

## Ficha de control de cambios
| Versión | Fecha | Alcance |
| --- | --- | --- |
| 1.0 | 10/09/2026 | Especificación inicial del prototipo HTML/CSS/JS |
| 2.0 | 22/10/2026 | Migración a React, fuente de datos JS con CRUD, persistencia local, roles demo, catálogo filtrable, carrito, checkout, pedidos y pruebas |

## 1. Introducción
### 1.1 Propósito
Definir de forma verificable el alcance y los requisitos de NEXUS en su segunda entrega, incluyendo funcionalidades terminadas, restricciones del prototipo y aspectos pendientes.

### 1.2 Ámbito del sistema
NEXUS es una aplicación web académica de comunidades, transmisiones simuladas y tienda de productos de demostración. Su frontend se implementó en React y Vite, con navegación React Router, componentes reutilizables y diseño Bootstrap/CSS. Contiene un catálogo editable, carrito y operaciones de compra **simuladas**. Los datos del catálogo y pedidos se guardan en el almacenamiento del navegador; no hay backend, base de datos remota, proveedores de pago ni servicios de streaming/chat en tiempo real.

### 1.3 Definiciones
- **ERS:** Especificación de Requisitos de Software.
- **CRUD:** Crear, leer, actualizar y eliminar registros.
- **Props / state:** entradas de un componente React y su estado de interfaz.
- **LocalStorage:** almacenamiento persistente del mismo navegador/origen.
- **SessionStorage:** almacenamiento de la sesión de la pestaña.
- **Checkout:** formulario de confirmación de pedido simulado.
- **Coverage:** proporción del código instrumentado ejecutado por los tests.

### 1.4 Referencias
- ERS inicial, `DSY1104_Anexo_4_ERS_Nexus_FINAL.docx`, 10/09/2026.
- Planilla inicial, `DSY1104_Anexo_2_Planilla_Requerimientos_Nexus_FINAL.xlsx` (R.1–R.15).
- Pauta de la Evaluación Parcial 2 y su Anexo 1.
- Código: https://github.com/Marcial-Lagos/Nexus_React/tree/cleanup/navegacion-simplificada
- Documentación del repositorio: `README.md`, `docs/ADMIN.md`, `docs/CATALOGO.md`, `docs/COMPRAS.md`, `docs/PRUEBAS.md`.

### 1.5 Organización
Secciones 2 (contexto), 3 (interfaces y requisitos), 4 (matriz de trazabilidad), 5 (validación y límites) y 6 (mejoras futuras).

## 2. Descripción general
### 2.1 Perspectiva
Aplicación de página única (SPA): `src/main.jsx` monta React y React Router; `src/App.jsx` integra estado y rutas. `src/pages/` contiene vistas; `src/components/` elementos reutilizables; `src/data/` reglas del catálogo, CRUD y pedidos; `src/utils/` validaciones y sesión.

### 2.2 Funciones
- Ingreso local con validaciones, registro simulado, acceso invitado y acceso administrativo de demostración.
- Navegación, búsqueda de transmisiones, comunidad y chat local, perfil editable y formulario de contacto validado.
- Catálogo de productos, filtro por nombre/descripción, categorías, disponibilidad y ofertas; ordenamiento y detalle.
- Carrito en memoria, selección de cantidad, checkout con retiro o domicilio, aprobación/rechazo simulado y comprobante.
- Administración de productos, categorías y directorio de usuarios; seguimiento y cancelación de órdenes, restitución de stock, reportes locales.

### 2.3 Actores
**Visitante:** acceso, registro demostrativo y contacto. **Cliente/invitado:** consulta de contenido, comunidad, catálogo, carrito y compra de prueba. **Administrador demo:** uso de panel CRUD y operaciones de pedidos. **Equipo de desarrollo/docente:** mantenimiento y verificación.

### 2.4 Restricciones
No existe autenticación real de clientes; el acceso administrativo se valida únicamente en el frontend y no es seguro para producción. Los registros de clientes del panel son un directorio, no credenciales utilizables. El almacenamiento es local por navegador y puede bloquearse o alterarse; no hay transacciones concurrentes entre dispositivos. Video, chats y pagos son simulaciones. Los datos de compras no constituyen comprobantes tributarios. El carrito se pierde al recargar; el perfil y la sesión usan sessionStorage y los productos/pedidos localStorage.

### 2.5 Dependencias
Navegador compatible con React/JS moderno, almacenamiento web habilitado para persistencia, `npm` para compilación local; Bootstrap y CSS. Fuentes/iconos externos pueden depender de conectividad.

### 2.6 Evolución prevista
Backend con autenticación, autorización, base de datos y pagos reales; persistencia remota; vistas independientes de categorías y ofertas; pruebas E2E/visuales y despliegue controlado.

## 3. Requisitos específicos
### 3.1 Interfaces
**Usuario:** login/registro, encabezado o menú lateral, vistas de comunidad, transmisiones, perfil, contacto y tienda, formularios de administración y de checkout. Diseño fluido mediante Bootstrap 5 y CSS. **Hardware:** computador/teléfono con navegador y entrada teclado/táctil. **Software:** React 19, Vite 8, React Router 8, Bootstrap 5, JavaScript; Vitest, React Testing Library y jsdom para testing. **Comunicación:** sin API propia; almacenamiento del lado del cliente; solicitudes HTTP para recursos estáticos externos.

### 3.2 Requisitos funcionales
La numeración R.1–R.12 conserva correspondencia con la planilla de la primera evaluación. Los R.16 en adelante representan ampliaciones de la segunda entrega.

| ID | Requisito verificable | Estado | Evidencia principal |
| --- | --- | --- | --- |
| R.1 | Validar formato de correo y clave mínima de cuatro caracteres en ingreso habitual | Implementado (demo) | `LoginForm.jsx`, `validaciones.js` |
| R.2 | Acceder como invitado a la aplicación | Implementado | `App.jsx`, `LoginForm.jsx` |
| R.3 | Alternar login y registro con tarjeta giratoria | Implementado | `Login.jsx` |
| R.4 | Validar registro: identidad, usuario, edad mínima 13, clave y términos | Implementado (no crea cuenta real) | `RegistroForm.jsx`, `validaciones.js` |
| R.5 | Navegar por módulos con rutas React y restringir vistas internas sin sesión | Implementado | `App.jsx`, `Navbar.jsx` |
| R.6 | Buscar transmisiones desde principal y mostrar vacío | Implementado | `Principal.jsx` |
| R.7 | Enviar mensajes no vacíos a canales locales | Implementado | `Comunidad.jsx` |
| R.8 | Enviar mensajes no vacíos al chat del stream simulado | Implementado | `Stream.jsx` |
| R.9 | Seguir/dejar de seguir stream en estado local | Implementado | `Stream.jsx` |
| R.10 | Editar nombre/biografía del perfil | Implementado; sessionStorage | `Perfil.jsx`, `sesion.js` |
| R.11 | Listar tienda y abrir detalle dinámico del producto seleccionado | Implementado | `Tienda.jsx`, `Producto.jsx` |
| R.12 | Validar formulario de contacto, sin envío real | Implementado | `Contacto.jsx`, `validaciones.js` |
| R.16 | CRUD de productos con nombre, precio, stock, categoría y descripción | Implementado (local) | `AdminColeccion.jsx`, `administracion.js` |
| R.17 | CRUD de categorías; impedir eliminar categorías ocupadas | Implementado (local) | `AdminColeccion.jsx`, `administracion.js` |
| R.18 | CRUD de directorio de clientes sin emisión de credenciales | Implementado (local) | `AdminColeccion.jsx` |
| R.19 | Restringir rutas administrativas a sesión de rol demo y permitir login admin | Implementado (solo interfaz) | `App.jsx`, `AdminLogin.jsx` |
| R.20 | Sincronizar en pantalla cambios locales del catálogo con la tienda | Implementado | `App.jsx`, `Tienda.jsx` |
| R.21 | Filtrar por nombre, descripción, categoría, stock y ofertas; ordenar productos | Implementado mediante filtros | `Tienda.jsx`, `catalogo.js` |
| R.22 | Mostrar precio de oferta inferior al normal y usarlo en carrito/checkout | Implementado | `AdminColeccion.jsx`, `catalogo.js`, `Checkout.jsx` |
| R.23 | Agregar productos al carrito, seleccionar cantidad y bloquear falta de stock | Implementado (carrito en memoria) | `App.jsx`, `Producto.jsx` |
| R.24 | Obtener datos de entrega, precargarlos desde sesión y calcular envío | Implementado (checkout demo) | `Checkout.jsx`, `pedidos.js` |
| R.25 | Simular pago aceptado o rechazado y mostrar resultado | Implementado | `Checkout.jsx`, `ResultadoCompra.jsx` |
| R.26 | Generar pedido local, descontar stock y prevenir duplicados por ID | Implementado (no transaccional) | `pedidos.js`, `App.jsx` |
| R.27 | Gestionar estados de órdenes y restaurar stock en cancelación válida | Implementado | `AdminOrdenes.jsx`, `pedidos.js` |
| R.28 | Exponer resumen y reportes locales de inventario y pedidos | Implementado | `Admin.jsx` |
| R.29 | Ofrecer página independiente de categorías y página independiente de ofertas | Pendiente; hoy son filtros en `/tienda` | `Tienda.jsx` |

**Criterios de aceptación principales:** datos válidos habilitan acciones; los inválidos presentan errores; cambiar un producto modifica el listado de tienda; filtros combinados producen resultados correctos; un pedido aprobado descuenta stock una vez; rechazo no crea pedido; cancelar antes de envío restaura stock una vez; cliente/invitado no abre el panel de administración; se informa claramente que los procesos son simulados.

### 3.3 Requisitos no funcionales
| ID | Requisito | Criterio de aceptación / límite | Estado |
| --- | --- | --- | --- |
| R.13 | Responsividad | Diseño Bootstrap con filas/columnas variables y CSS adaptable en móvil, tableta y escritorio | Implementación evidenciada; revalidar visualmente cambios recientes |
| R.14 | Portabilidad | Ejecutar con navegador moderno y build Vite, sin dependencia de SO | Implementado; requiere servidor SPA en producción |
| R.15 | Mantenibilidad | Separar páginas, componentes, datos, estilos y pruebas | Implementado |
| RNF.1 | Integridad de datos de demostración | Validar precios, ofertas, stock y transiciones; informar fallos de guardado | Implementado según código; sin garantía multiusuario |
| RNF.2 | Seguridad de demostración | No guardar contraseñas en sesión; marcar límites explícitos | Implementado en frontend, **no apto para datos sensibles** |
| RNF.3 | Testeabilidad | Tests unitarios junto a componentes y reporte V8 reproducible | Implementado |
| RNF.4 | Usabilidad | Etiquetas, avisos y mensajes de validación legibles; navegación coherente | Evidencia en código; requiere revisión manual de accesibilidad |
| RNF.5 | Rendimiento | Reacción local fluida con volumen académico; sin SLA ni umbral cuantificado | No medido |
| RNF.6 | Disponibilidad | SPA local dependiente del entorno y archivos estáticos | Sin disponibilidad garantizada |

### 3.4 Reglas de negocio
1. Precio de producto: entero positivo; stock: entero mayor o igual que cero.
2. Oferta: precio entero positivo inferior al precio habitual; si no cumple, no se guarda.
3. Una categoría en uso no puede eliminarse; producto de orden activa tampoco.
4. Carrito no acepta cantidades negativas, nulas, fraccionarias ni superiores al stock disponible.
5. Confirmación revalida catálogo local; cambios de precio requieren aceptación agregando de nuevo el ítem.
6. Retiro sin costo; despacho de demostración CLP 3.990 y campos dirección/comuna obligatorios.
7. Orden creada solo tras pago simulado aprobado; estado inicial pendiente.
8. Flujo de orden: pendiente → preparando / cancelado; preparando → enviado / cancelado; enviados y cancelados finales.
9. Cancelación válida devuelve stock una sola vez; rechazo de pago no altera pedidos ni existencias.
10. Autorización administrativa es solo ilustrativa y depende de información del navegador.

## 4. Trazabilidad a pruebas
| Requisitos | Casos y archivos de pruebas |
| --- | --- |
| R.1–R.4 | `LoginForm.test.jsx`, `RegistroForm.test.jsx`, `Login.test.jsx`, `validaciones.test.js` |
| R.5–R.12 | `App.test.jsx`, `Comunidad.test.jsx`, `Stream.test.jsx`, `Perfil.test.jsx`, `Tienda.test.jsx`, `Producto.test.jsx`, `Contacto.test.jsx` |
| R.16–R.20 | `Admin.test.jsx`, `AdminColeccion.test.jsx`, `administracion.test.js` |
| R.21–R.22 | `catalogo.test.js`, `Tienda.test.jsx`, `Compra.test.jsx` |
| R.23–R.27 | `Compra.test.jsx`, `Checkout.test.jsx`, `ResultadoCompra.test.jsx`, `pedidos.test.js`, `AdminOrdenes.test.jsx` |
| RNF.3 | `vite.config.js`, `src/test/setup.js`, `docs/PRUEBAS.md` |

## 5. Validación y estado
La revisión se basa en el código de la rama y el resultado **documentado**, no reejecutado en esta revisión: `docs/PRUEBAS.md` registra **158 pruebas aprobadas en 30 archivos**, con cobertura V8 de **97,29 % sentencias; 95,54 % ramas; 99,22 % funciones; 99,76 % líneas**. Ejecutar de nuevo en el equipo de entrega:
```powershell
npm.cmd ci
npm.cmd run lint
npm.cmd run build
npm.cmd run test:run -- --coverage
```
La configuración real de pruebas está en `vite.config.js`, con `jsdom`, React Testing Library y Vitest; `coverage/index.html` permite inspeccionar ramas no cubiertas.

## 6. Pendientes y observaciones
- Crear rutas y vistas explícitas para **categorías** y **ofertas** si la evaluación interpreta «vista» como página independiente.
- Verificar visualmente layouts posteriores a la implementación de administración/checkout y adjuntar capturas verificables.
- Reejecutar tests, ESLint y build en la versión final y adjuntar resultados actualizados.
- Generar ZIP sin `node_modules`, `dist` ni `coverage`, y preparar presentación de demostración.
- No presentar como productivas las funciones de roles, pedidos ni almacenamiento local.

**Control de aprobación:** Documento preparado para revisión del equipo y validación posterior del docente; no implica aceptación académica ni certificación de producción.
