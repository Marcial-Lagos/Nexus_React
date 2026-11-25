# Nexus React

Migración del proyecto universitario Nexus al proyecto React + Vite existente. Conserva el diseño original, Bootstrap 5, Font Awesome y Google Fonts (Inter y Orbitron).

Para iniciar, abre una terminal en esta carpeta y ejecuta:

```sh
npm install
npm run dev
```

Si ya está instalado, basta con `npm run dev`. En PowerShell, si la política bloquea `npm.ps1`, usa `npm.cmd` en los mismos comandos; no necesitas cambiar la política del sistema.

Sin configurar API puedes entrar como invitado o usar cualquier correo con formato válido y una contraseña de al menos cuatro caracteres. Ese modo es una demostración local. Para conectar el Gateway, copia `.env.example` a `.env.local`, configura `VITE_API_BASE_URL` y reinicia Vite.

## Tienda conectada al Gateway

Con `VITE_API_BASE_URL=/`, Vite y el contenedor web reenvían `/api/` al Gateway. El registro y el login usan `email` y `password`. El JWT firmado identifica el perfil mediante `usuarioId` y contiene el rol. La pestaña conserva el token en `sessionStorage`.

| Pantalla | Persistencia |
| --- | --- |
| Tienda y detalle | Catálogo, precios, ofertas, existencias e imágenes del servicio de productos |
| Perfil | Nombre y biografía mediante `PATCH /api/v1/usuarios/{id}` |
| Checkout | Reserva de stock, dirección, despacho, pago de prueba y comprobante |
| Mis pedidos | Historial de la cuenta y detalle desde MySQL |
| Administración | Productos, categorías asignadas, inventario, consulta de cuentas y cambio de estado del pedido |

El modo independiente conserva los formularios, el catálogo y los datos de demostración originales. En el proyecto completo, las credenciales de administración pertenecen a cada instalación.

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

## Funciones locales

El chat de comunidad, los controles de streaming y el formulario de contacto conservan su comportamiento de demostración. El checkout conectado registra pagos simulados y el historial de la cuenta. La ruta de administración utiliza el rol verificado por el servidor.

El inventario de funciones y el listado exacto de archivos están en [docs/MIGRACION.md](docs/MIGRACION.md).

Fuentes: [Nexus original](https://github.com/Marcial-Lagos/Nexus/tree/f8655c9d2a82af109251885f01202c6f967df8fe) y [ejemplo del profesor](https://github.com/ArkDerr/2026_2_DSY1104-016V/tree/main/ProyectoEjemploReact/MiPrimerProyectoReact).

## WebRTC: conectividad y reconexion

`VITE_ICE_SERVERS` accepts a JSON array of RTCIceServer objects. Default `[]` only uses local ICE candidates; configure your own STUN/TURN service for different networks. In Compose, set the variable in the root `.env` and rebuild the frontend (`docker compose build frontend`). In Vite development, configure it in the frontend `.env.local`. Never embed permanent TURN credentials in Vite variables: these are public in the browser bundle. For production, use a backend endpoint issuing short-lived TURN credentials; this is not implemented yet.

Viewers retry transient signaling failures and failed media connections at most three times, with 1/2/4-second backoff; a closed channel (HTTP 410) is not retried. Test with two physical devices on distinct networks before relying on remote streaming.

## Voz y chat multimedia (experimental)

Con una cuenta real, entra en Comunidades > Sala general o Ranked y pulsa Conectar voz. Cada sala admite hasta seis participantes; la presencia y actividad de voz se actualizan por consultas HTTP y las conexiones de audio usan WebRTC entre pares. El chat de directos conserva hasta 100 mensajes en memoria por canal; el contador representa espectadores registrados en la señalizacion, no una medicion garantizada de reproduccion. Los directos permiten elegir los dispositivos que el navegador expone, silenciar el microfono, desactivar video y usar pantalla completa. Se requiere HTTPS o localhost. No hay persistencia de chat, moderacion avanzada, ni garantia de conectividad entre NAT sin STUN/TURN. Falta validar audio real de salas de voz y varios espectadores con dispositivos fisicos, asi como revisar autorizacion HTTP y comportamiento con perdida de red. Las salas de voz no tienen reconexion automatica todavia.

### Actualizacion: chat persistente y recuperacion de presencia

El chat real de comunidades y directos ya utiliza MySQL. Los usuarios autenticados pueden leer el archivo de directos publicos; los invitados conservan el modo de demostracion. Se consultan los ultimos 100 mensajes y se pueden cargar anteriores. La busqueda de comunidad filtra los mensajes cargados. Los historiales no se eliminan al cerrar un directo. No se conservan grabaciones de audio o video. Los mensajes previos que existian solo en memoria no se migran. Los reintentos de presencia de voz recuperan fallos HTTP transitorios (1/2/4 segundos); no recuperan una sala expirada ni garantizan renegociacion de cada conexion WebRTC. Todavia se requiere validacion entre dispositivos y TURN de produccion.
