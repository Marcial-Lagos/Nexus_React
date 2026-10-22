# NEXUS React — Informe de revisión y cobertura de pruebas
**Asignatura:** DSY1104, Desarrollo Fullstack II · **Evaluación Parcial 2**
**Fecha:** 22/10/2026 · **Versión del informe:** 1.0
**Repositorio:** https://github.com/Marcial-Lagos/Nexus_React · **Rama:** `cleanup/navegacion-simplificada`
**Herramientas utilizadas:** Vitest, React Testing Library, `@testing-library/user-event`, jsdom, `@vitest/coverage-v8`, ESLint y Vite.

## 1. Objetivo
Contrastar implementación y alcance de la tienda NEXUS con los requerimientos de la entrega 2 y explicar el proceso de pruebas, cobertura, limitaciones y acciones faltantes. Se analizaron el código publicado y documentos de la rama. **No se ejecutaron nuevas pruebas ni navegación automatizada en esta revisión.** Las estadísticas reflejan el último reporte registrado en `docs/PRUEBAS.md`, que debe reproducirse antes de entregar.

## 2. Revisión punto por punto de la entrega
| Ítem | Evidencia técnica verificada | Evaluación |
| --- | --- | --- |
| Migración HTML a React | `src/main.jsx`, `src/App.jsx`, páginas en `src/pages/` y componentes reutilizables | Implementado |
| Props, eventos y estado | `useState`, `useEffect`, props, callbacks; `App.jsx` coordina sesión, datos y carrito | Implementado |
| Navegación integrada | React Router: login, principal, comunidad, stream, perfil, contacto, tienda, detalle, checkout, resultado y admin | Implementado |
| Responsividad Bootstrap | Dependencia Bootstrap 5, grid `row`/`col-*`, `table-responsive`, clases responsive y CSS propio | Evidencia en código; pendiente revisión visual reciente |
| Fuente JavaScript / CRUD | `src/data/administracion.js`, funciones de lectura, guardado y eliminación | Implementado para demo |
| Persistencia integrada con React | `localStorage` para datos de administración y pedidos; `sessionStorage` para sesión | Implementado con limitaciones locales |
| Vista administrativa | `Admin.jsx`: resumen, productos, categorías, usuarios, órdenes, reportes y perfil | Implementado |
| Catálogo por categorías | `/tienda?categoria=...`, selector y filtros | Implementado como filtro; sin vista independiente |
| Vista de ofertas | `/tienda?ofertas=1`, administración de precio de oferta | Implementado como filtro; sin vista independiente |
| Carrito | Suma, eliminación, vaciado, stock y total | Implementado en memoria |
| Checkout | Formulario, datos precargados, retiro/despacho y total | Implementado, pago simulado |
| Resultado de compra | Éxito, rechazo y comprobante de prueba | Implementado |
| Gestión de órdenes | Estados, cancelación y restitución de stock | Implementado |
| Pruebas unitarias e integración | Archivos `.test.jsx` / `.test.js` junto al código; `describe`, `test`, `expect` | Implementado |
| Mocks y simulación | `vi.fn()`, `MemoryRouter`, `userEvent.setup()` y adaptadores DOM en setup | Implementado |
| Cobertura instrumentada | `vite.config.js` y salida V8 HTML/texto/JSON/LCOV | Implementado |
| ERS actualizada | `docs/ERS_V2.md` y versión Word complementaria | Preparada |
| ZIP de entrega | No se adjunta ZIP en el repositorio | Pendiente de generación |
| Presentación de 15 minutos | Material de exposición y demostración en vivo | Pendiente |

## 3. Estrategia de testing
### 3.1 Entorno
`vite.config.js` establece `test.environment = 'jsdom'`, `setupFiles = './src/test/setup.js'` y coverage V8. `src/test/setup.js` añade matchers de DOM, ejecuta cleanup, limpia localStorage/sessionStorage y restaura mocks. Los métodos de `dialog` y scroll se sustituyen en test porque jsdom no ofrece su implementación real.

### 3.2 Tipos de prueba
- **Renderizado:** componentes, encabezados, campos, listas y estados vacíos visibles.
- **Props:** textos recibidos, callbacks y argumentos verificados con `vi.fn()`.
- **State:** abrir/cerrar formularios, cambiar filtros, editar perfiles, alternar chat y estados.
- **Eventos:** `userEvent.setup()`, clics, escritura, selección y envío de formularios.
- **Lógica aislada:** validación, administración, catálogo, precios y pedidos.
- **Integración:** rutas, sesión, CRUD reflejado en tienda y compra → orden → stock → comprobante.

### 3.3 Matriz de escenarios relevantes
| Grupo | Escenario y expectativa | Archivo representativo |
| --- | --- | --- |
| Autenticación | Correo/clave válidos e inválidos, invitado y admin demo | `LoginForm.test.jsx`, `Admin.test.jsx` |
| Registro | Edad menor de 13, contraseñas y términos | `validaciones.test.js`, `RegistroForm.test.jsx` |
| Navegación | Acceso a páginas protegido y redirecciones | `App.test.jsx` |
| Comunidad/stream | Mensajes no vacíos y cambios de interfaz | `Comunidad.test.jsx`, `Stream.test.jsx` |
| Formularios | Errores por campo y edición del perfil | `Contacto.test.jsx`, `Perfil.test.jsx` |
| CRUD | Agregar/editar/eliminar, duplicados y restricciones | `administracion.test.js`, `Admin.test.jsx` |
| Catálogo | Ofertas, búsqueda normalizada y filtros combinados | `catalogo.test.js`, `Tienda.test.jsx` |
| Compra | Montos, dirección de entrega, stock y precio actualizado | `pedidos.test.js`, `Checkout.test.jsx` |
| Resultado de pago | Pedido aprobado/rechazado y acceso al comprobante | `Compra.test.jsx`, `ResultadoCompra.test.jsx` |
| Órdenes | Cambios permitidos, cancelación y stock restaurado una vez | `pedidos.test.js`, `AdminOrdenes.test.jsx` |

## 4. Métricas de cobertura documentadas
Fuente: `docs/PRUEBAS.md` de la rama consultada. **Resultados históricos documentados, pendientes de reproducción con el HEAD de la entrega.**
| Indicador | Porcentaje |
| --- | ---: |
| Sentencias (statements) | 97,29 % |
| Ramas (branches) | 95,54 % |
| Funciones (functions) | 99,22 % |
| Líneas (lines) | 99,76 % |

**Ejecución informada:** 158 pruebas aprobadas, 30 archivos. Estos números no significan que se haya certificado seguridad, compatibilidad multiplataforma o ausencia de defectos. La cobertura de ramas es la más baja y merece especial atención. Los porcentajes no incluyen CSS ni imágenes; se excluyen tests, `src/test/**` y `src/main.jsx` conforme a `vite.config.js`.

## 5. Ejecución reproducible para entrega
Abrir PowerShell en la carpeta que contiene `package.json`.
```powershell
git checkout cleanup/navegacion-simplificada
git pull origin cleanup/navegacion-simplificada
npm.cmd ci
npm.cmd run lint
npm.cmd run build
npm.cmd run test:run -- --coverage
Start-Process .\coverage\index.html
```
Registrar en el anexo final: fecha/hora, commit `git rev-parse --short HEAD`, versión de Node (`node -v`), número de tests y resultados reales. Conservar una captura del resumen Vitest y al menos una del reporte HTML. Si aparece un fallo, no usar los valores previos como resultado vigente.

## 6. Riesgos y limitaciones identificados
1. **Alto, seguridad:** rol admin y contraseña pública resueltos en frontend; no usar con información real. El control de rutas no protege API ni datos en servidor.
2. **Medio, persistencia:** localStorage es manipulable, local y no transaccional entre pestañas/dispositivos; una orden no es comprobante tributario ni pago real.
3. **Medio, alcance formal:** categorías y ofertas carecen de rutas/páginas independientes; pueden requerir ajuste para concordar literalmente con el diseño de la entrega.
4. **Medio, evidencia:** no hay nueva revisión visual automatizada de administración, checkout y vistas incorporadas; probar móvil (320/390 px), tablet (768 px) y escritorio (1440 px) con capturas.
5. **Bajo/medio, documentación:** `docs/MIGRACION.md` contiene resultados antiguos de una etapa con menos pruebas; prevalece el reporte más reciente, siempre sujeto a repetición.
6. **Medio, pruebas:** una cobertura alta no sustituye una prueba manual de interfaz y flujos de extremo a extremo en un navegador real.

## 7. Conclusión y acciones finales
La rama exhibe implementación sustancial de la migración a React, interacciones, CRUD y recorrido de compra de demostración. El testing dispone de una base amplia, descrita por 158 casos aprobados y cobertura superior al 95 % en las cuatro métricas documentadas. Para cerrar la entrega: ejecutar y adjuntar evidencia actualizada; decidir si crear rutas de categorías/ofertas; comprobar responsividad nueva; preparar ZIP y presentación; revisar y validar la ERS V2. **No se fusionó a `main` ni se modificó código funcional en esta revisión.**
