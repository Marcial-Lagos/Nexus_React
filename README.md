# Nexus React

Migración del proyecto universitario Nexus al proyecto React + Vite existente. Conserva el diseño original, Bootstrap 5, Font Awesome y Google Fonts (Inter y Orbitron).

Para iniciar, abre una terminal en esta carpeta y ejecuta:

```sh
npm install
npm run dev
```

Si ya está instalado, basta con `npm run dev`. En PowerShell, si la política bloquea `npm.ps1`, usa `npm.cmd` en los mismos comandos; no necesitas cambiar la política del sistema.

Sin configurar API puedes entrar como invitado o usar cualquier correo con formato válido y una contraseña de al menos cuatro caracteres. Ese modo es una demostración local. Para conectar el Gateway, copia `.env.example` a `.env.local`, configura `VITE_API_BASE_URL` y reinicia Vite.

El registro conserva los campos y reglas originales: nombre, apellido, usuario de 4 a 16 caracteres, correo, edad mínima de 13 años, contraseña con mayúscula, minúscula, número y carácter especial, confirmación y aceptación de reglas. En modo Gateway la cuenta se registra en el servidor; nunca se persiste la contraseña. Si el registro no devuelve un token, inicia sesión con la cuenta creada.

## Integración opcional con Gateway

`src/api/client.js` centraliza las solicitudes, los errores HTTP, la sesión bearer y la normalización de respuestas. La sesión API conserva el token solo en `sessionStorage`; no se guarda en el perfil Nexus ni en `localStorage`. El logout y los errores 401 eliminan el token. La API solo se activa cuando `VITE_API_BASE_URL` está configurado.

| Flujo | Endpoints existentes |
| --- | --- |
| Login / registro | `POST /api/v1/auth/login`, `POST /api/v1/auth/register` |
| Catálogo / detalle | `GET /api/v1/productos`, `GET /api/v1/productos/{id}` |
| Perfil | `GET /api/v1/usuarios/{id}`, `PUT /api/v1/usuarios/{id}` |
| Historial / pedidos | `GET /api/v1/pedidos/usuario/{uid}`, `POST /api/v1/pedidos` |

El cliente consume el Gateway y no usa puertos de microservicios. La identidad para perfil e historial se toma del ID en la respuesta de autenticación o de claims del JWT emitido por el servidor; sin ID no se hacen esas solicitudes. La decodificación del JWT en el navegador no valida su firma. El Gateway/backend debe validar el token y autorizar cada operación. La auditoría no encontró CORS explícito: si el frontend y Gateway usan distintos orígenes, el Gateway debe permitir el origen del frontend.

El inventario de integración fija las rutas y los DTO (`LoginRequest`, `RegisterRequest`, `AuthResponse`, `UsuarioRequestDTO`, `ProductoDTO`, `PedidoRequestDTO`), pero no documenta sus campos. El mapeo de este cliente usa las convenciones del frontend/API en español (`correo`, `contrasena`, `usuarioId`, `items[].productoId`, etc.); confirma esos nombres con los DTO del backend desplegado y ajústalos aquí si difieren. No se envían importes calculados por el navegador al crear un pedido. Los campos de despacho del checkout todavía no se envían porque el contrato auditado no define datos de envío. El endpoint de pagos no se invoca: la UI no tiene un flujo de pago real.

El catálogo, ficha, perfil editable y pedidos/historial se conectan cuando se configura el Gateway. Filtros, carrito y datos de entrega mantienen el alcance local existente. Contacto, categorías, comunidad/chat, streaming, reseñas, notificaciones, cupones y envíos no se simulan como APIs ni se conectan sin un flujo/contrato compatible. La administración continúa siendo local a propósito: el backend auditado no aplica autorización de rol admin, así que nunca se envían operaciones CRUD admin al servidor ni se presenta el rol cliente-side como seguridad.

## Organización para aprender React

- `src/main.jsx` monta React y carga Bootstrap y el CSS global. `BrowserRouter` envuelve la aplicación una sola vez.
- `src/App.jsx` define las rutas y comparte la sesión, el perfil, la búsqueda y el carrito con props y callbacks.
- `src/pages/` contiene las ocho pantallas completas.
- `src/components/` contiene formularios, navegación y elementos reutilizables.
- `src/data/nexus.js` conserva el catálogo, canales y contenido de ejemplo del original.
- `src/utils/` contiene validaciones y lectura/escritura de los datos públicos de sesión.
- Cada componente y pantalla tiene una prueba junto a su archivo. `src/test/setup.js` prepara React Testing Library.

Cuando un usuario escribe, un evento como `onChange` actualiza un estado con `useState`. React vuelve a dibujar el contenido correspondiente. Cuando una página necesita cambiar datos compartidos, llama a una función recibida de App mediante props, por ejemplo `onUpdate` o `onAdd`.

La clase `girada` del login depende del estado `registro`; no se cambia con `classList`. Los chats dibujan arrays de mensajes. El diálogo de perfil usa una referencia y la API nativa de `dialog` para conservar el foco, el bloqueo modal y la tecla Escape.

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/`, `/login` | Login y registro; con sesión redirigen a Principal |
| `/principal` | Portada, búsqueda de canales y categorías |
| `/comunidad` | Canales y chat de comunidad |
| `/contacto` | Contacto público y validación del formulario |
| `/perfil` | Perfil y edición |
| `/tienda` | Catálogo y carrito |
| `/producto?producto=Teclado%20Gamer` | Producto seleccionado, cantidad y carrito |
| `/stream` | Reproductor simulado, seguimiento y chat |

Las pantallas internas requieren una sesión local, incluyendo la de invitado. Las rutas desconocidas redirigen al login o a Principal según el estado de sesión. Esta protección de interfaz no es una autorización de servidor.

## Estilos

`main.jsx` importa Bootstrap antes de `index.css`. Este último carga una sola vez las hojas originales general, contacto y producto. El CSS de contacto está limitado a `.pagina-contacto` para evitar que altere el login. `App.css` contiene los ajustes necesarios de integración y de tamaños móviles.

Los recursos originales están en `public/img/`. Los enlaces absolutos `/img/...` funcionan al navegar o recargar una ruta. Font Awesome y Google Fonts se mantienen mediante sus enlaces originales y requieren conexión a Internet.

## Verificaciones

```sh
npm run build
npm run lint
npm run test:run
npm run test:coverage
```

`npm test` abre Vitest en modo observación. Vitest y `@vitest/coverage-v8` usan exactamente la versión 5.0.5. La cobertura se genera en `coverage/index.html`, junto con `coverage/coverage-summary.json` y `coverage/lcov.info`. Los informes generados se excluyen de Git y ESLint.

Las pruebas usan jsdom, React Testing Library y user-event. Cubren formularios, reglas de edad y contraseña, callbacks, rutas protegidas, sesión sin contraseñas, búsqueda, mensajes, seguimiento, diálogo de perfil, selección de productos y carrito.

## Alcance de la demostración

- Sin `VITE_API_BASE_URL`, el login valida formato, como el original, y el registro solo simula una validación correcta. Con Gateway configurado, login, registro, catálogo, perfil y pedidos usan los endpoints de la tabla anterior.
- No hay API evidenciada para recuperación de contraseña, contacto, vídeo, voz ni chat multiusuario. Tampoco se procesa pago en el frontend.
- Solo se guardan nombre, correo, biografía e indicador de invitado en `sessionStorage`. El perfil dura durante la sesión de esa pestaña.
- El carrito conserva sus datos al navegar y se limpia al recargar o cerrar sesión. Los chats y el seguimiento son locales a su pantalla y se reinician al abandonarla o recargar.
- El formulario de contacto confirma una validación local y dice expresamente que no envió el mensaje.
- El vídeo y sus controles son una simulación. Los botones de voz y adjuntos explican sus límites.
- El original solo incluye la foto del teclado. Los otros cinco productos usan iconos con la etiqueta “Ilustración”; se conservan sus nombres y precios originales, incluidos Producto 4, Producto 5 y Producto 6.
- En un alojamiento de producción, configura el servidor para devolver `index.html` en rutas de React Router.

El inventario de funciones y el listado exacto de archivos están en [docs/MIGRACION.md](docs/MIGRACION.md).

Fuentes: [Nexus original](https://github.com/Marcial-Lagos/Nexus/tree/f8655c9d2a82af109251885f01202c6f967df8fe) y [ejemplo del profesor](https://github.com/ArkDerr/2026_2_DSY1104-016V/tree/main/ProyectoEjemploReact/MiPrimerProyectoReact).
