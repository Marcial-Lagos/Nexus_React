# Inventario y migración de Nexus

Se trabajó sobre `nexus-react/`, sin crear otro proyecto ni modificar el repositorio original.

Referencias: [Nexus, revisión f8655c9](https://github.com/Marcial-Lagos/Nexus/tree/f8655c9d2a82af109251885f01202c6f967df8fe) y [ejemplo React del profesor](https://github.com/ArkDerr/2026_2_DSY1104-016V/tree/main/ProyectoEjemploReact/MiPrimerProyectoReact).

## Estado encontrado

Las ocho rutas y sus archivos existían. En la primera etapa las páginas solo contenían títulos, los formularios estaban vacíos y el footer devolvía null. Ya estaban instalados React, React Router, Bootstrap, Vitest, jsdom y React Testing Library. Se reutilizó esa base.

El original contiene ocho HTML, cuatro JavaScript (producto.js vacío), tres CSS con contenido y styleT.css vacío. También incluye siete imágenes únicas; las variantes con “(1)” son duplicados.

## Equivalencia entre original y React

| Original | Destino | Contenido y comportamiento |
| --- | --- | --- |
| index.html | pages/Login.jsx, components/LoginForm.jsx, components/RegistroForm.jsx | Panel promocional, tarjeta giratoria, validaciones de acceso y registro, invitado y regreso al login con correo completado |
| pages/principal.html | pages/Principal.jsx | Destacado, imagen, tres transmisiones, búsqueda, estado sin resultados, categorías y dock de contacto |
| pages/comunidad.html | pages/Comunidad.jsx | Panel de servidores, canales, mensajes iniciales, envío local, miembros y menú móvil |
| pages/contacto.html | pages/Contacto.jsx | Canales sociales, nombre obligatorio de hasta 100 caracteres, correo opcional con dominios permitidos y comentario obligatorio de hasta 500 |
| pages/perfil.html | pages/Perfil.jsx | Fondo, banner, avatar, estadísticas, biografía, intereses, actividad y edición modal |
| pages/tienda.html | pages/Tienda.jsx | Los seis productos y precios originales, enlaces al producto y resumen del carrito |
| pages/producto.html | pages/Producto.jsx | Ruta de navegación, fotografía/ilustración, selección de vista, ficha, cantidad, carrito y beneficios |
| pages/stream.html | pages/Stream.jsx | Vídeo simulado, creador, etiquetas, seguimiento, compartir, búsqueda en el encabezado y chat |
| js/app.js | Componentes y hooks de React | Se reemplazan listeners, creación de nodos y cambios de clases por estado, eventos JSX, arrays y referencias |
| js/contacto.js | utils/validaciones.js, pages/Contacto.jsx | Reglas originales, errores por campo y confirmación local explícita |
| js/tienda.js | pages/Tienda.jsx, pages/Producto.jsx | Link con parámetro de producto y lectura con useSearchParams |
| js/producto.js (vacío) | pages/Producto.jsx, App.jsx | Se completan cantidad, selección y carrito local funcional |
| css/style.css | styles/styles.css | CSS original completo; rutas de imágenes corregidas a /img/ |
| css/styleC.css | styles/contacto.css | Estilos originales de contacto, limitados a esa pantalla |
| css/styleP.css | styles/producto.css | Estilos originales de detalle del producto |

En el original varios enlaces apuntaban a “#” o botones no tenían comportamiento. Se conectaron a rutas existentes, canales locales o información explícita de demostración. El enlace sin destino de LinkedIn dirige a Contacto. No se inventaron cuentas ni servicios externos.

## Arquitectura

`main.jsx` conserva StrictMode, BrowserRouter, Bootstrap y el montaje de React. El único `document.getElementById` es el de `#root`, igual que en el profesor.

App conserva Routes, Route y Navigate, y centraliza sesión, carrito y búsqueda. Las páginas reciben datos y callbacks mediante props. El estado público del perfil se guarda en sessionStorage con una lista explícita de campos; las contraseñas permanecen únicamente en los estados de los formularios mientras se escriben. No se usa localStorage en el código de la aplicación.

Los demás estados son locales: giro del login, validación, formularios, canal seleccionado, mensajes, seguimiento, diálogo, vista y cantidad. Los mensajes se renderizan como texto de JSX, sin innerHTML.

El diálogo usa showModal/close mediante una referencia de React. No usa selectores globales, listeners manuales ni cambios de clase. Las referencias de los chats solo se emplean para desplazarse tras nuevos mensajes.

## Archivos modificados respecto de la primera etapa

- `.gitignore`: excluye coverage.
- `README.md`: instrucciones de uso, explicación para aprender React y límites.
- `eslint.config.js`: excluye los reportes generados de cobertura.
- `index.html`: título general y descripción.
- `package.json`: script test:coverage y proveedor compatible de cobertura.
- `package-lock.json`: bloqueo de las dependencias.
- `vite.config.js`: configuración de cobertura v8.
- `src/App.jsx`: sesión, estado compartido, estructura y rutas completas.
- `src/App.css`: integración con Bootstrap, interfaz nueva y ajustes responsive.
- `src/App.test.jsx`: navegación completa, sesión, perfil y carrito compartido.
- `src/index.css`: única cadena de carga de las hojas de estilos.
- `src/styles/styles.css`: versión completa del CSS original y rutas de recursos.
- `src/test/setup.js`: aislamiento de almacenamiento y adaptaciones de dialog/scroll para jsdom.
- `src/components/Footer.jsx`
- `src/components/LoginForm.jsx`
- `src/components/Navbar.jsx`
- `src/components/Navbar.test.jsx`
- `src/components/RegistroForm.jsx`
- `src/pages/Login.jsx`
- `src/pages/Principal.jsx`
- `src/pages/Comunidad.jsx`
- `src/pages/Contacto.jsx`
- `src/pages/Perfil.jsx`
- `src/pages/Tienda.jsx`
- `src/pages/Producto.jsx`
- `src/pages/Stream.jsx`

`src/main.jsx` se revisó y conserva su comportamiento; no fue necesario modificar su arquitectura.

## Archivos creados

- `docs/MIGRACION.md`
- `src/data/nexus.js`
- `src/utils/validaciones.js`
- `src/utils/validaciones.test.js`
- `src/utils/sesion.js`
- `src/utils/sesion.test.js`
- `src/components/BarraServidores.jsx`
- `src/components/BarraServidores.test.jsx`
- `src/components/CampoFormulario.jsx`
- `src/components/CampoFormulario.test.jsx`
- `src/components/ImagenProducto.jsx`
- `src/components/ImagenProducto.test.jsx`
- `src/components/Modal.jsx`
- `src/components/Modal.test.jsx`
- `src/components/TarjetaTransmision.jsx`
- `src/components/TarjetaTransmision.test.jsx`
- `src/components/Footer.test.jsx`
- `src/components/LoginForm.test.jsx`
- `src/components/RegistroForm.test.jsx`
- `src/pages/Login.test.jsx`
- `src/pages/Principal.test.jsx`
- `src/pages/Comunidad.test.jsx`
- `src/pages/Contacto.test.jsx`
- `src/pages/Perfil.test.jsx`
- `src/pages/Tienda.test.jsx`
- `src/pages/Producto.test.jsx`
- `src/pages/Stream.test.jsx`
- `src/styles/contacto.css`
- `src/styles/producto.css`
- `public/img/cursor-click.png`
- `public/img/cursor_40x40.png`
- `public/img/fondo-perfil.jpg`
- `public/img/img_carrusel_1.png`
- `public/img/img_carrusel_2.png`
- `public/img/img_carrusel_3.png`
- `public/img/teclado.jpg`

Los archivos de referencia, capturas y comprobaciones del navegador están en `../.reference/`, fuera del código de la aplicación. `dist/` y `coverage/` son salidas generadas.

## Verificación y límites

Resultado final del 19 de octubre de 2026:

| Comando | Resultado |
| --- | --- |
| npm run build | Correcto, sin advertencias de imports o recursos |
| npm run lint | Correcto, sin errores ni advertencias |
| npm run test:run | 86 pruebas aprobadas en 20 archivos |
| npm run test:coverage | 86 pruebas aprobadas; reporte HTML, JSON y LCOV generado |

Cobertura: 99,68 % de sentencias, 99,36 % de ramas, 99,31 % de funciones y 99,57 % de líneas. Informe navegable en `../coverage/index.html` desde esta carpeta, o en `coverage/index.html` desde la raíz del proyecto.

Chrome: las ocho rutas se comprobaron en 320, 390, 768 y 1440 píxeles. No se detectaron desbordamientos horizontales, imágenes rotas ni excepciones. Además, 18 comprobaciones del recorrido interactivo móvil terminaron correctamente, sin respuestas HTTP fallidas. Los informes originales están en `../.reference/browser-report.json` y `../.reference/browser-interactions.json` respecto de la raíz del proyecto.

Cada uno de los nueve componentes reutilizables, las ocho páginas y App tiene pruebas. Las funciones de validación y sesión también cuentan con pruebas, incluidos fecha futura, edad límite de 13 años, correos permitidos, almacenamiento corrupto/bloqueado y ausencia de contraseñas persistidas.

La cobertura incluye todo el JavaScript/JSX de src salvo los propios tests, su configuración y main.jsx, que únicamente inicia la aplicación. El CSS y los recursos gráficos no se incluyen en la métrica de cobertura.

También se verificaron las ocho rutas en Chrome, con comprobación de imágenes, errores de JavaScript y comportamiento móvil. Se probaron registro, sesión, menú, chats, seguimiento, edición del perfil, producto, carrito, contacto y salida.

No quedan pantallas pendientes de implementar. Los límites reales proceden del original: no hay backend, transmisión ni pagos reales. Faltan las fotografías de cinco productos y sus fichas; se conservan las denominaciones originales, se muestran ilustraciones y se indica el carácter de demostración. Los datos públicos de sesión duran en la pestaña; los demás estados no sobreviven a una recarga completa. Los mensajes de chat y el seguimiento también se reinician al abandonar su pantalla, como ocurría al navegar entre los HTML originales.

