# Pruebas de Nexus: organización según el ejemplo de clase

Referencia: [MiPrimerProyectoReact del profesor](https://github.com/ArkDerr/2026_2_DSY1104-016V/tree/main/ProyectoEjemploReact/MiPrimerProyectoReact).

## Convenciones

- Cada componente y página tiene su archivo `.test.jsx` junto al código.
- `describe('Componente Nombre', ...)` o `describe('Página Nombre', ...)` agrupa los casos; `test('comportamiento esperado', ...)` identifica cada prueba.
- Se importan explícitamente `describe`, `test`, `expect` y, cuando corresponde, `vi` desde Vitest.
- `render` monta el componente; `screen.getByRole` y `screen.getByLabelText` permiten encontrar controles por su función o etiqueta.
- Cada prueba interactiva crea `const user = userEvent.setup()` y espera las acciones con `await user.click(...)`, `await user.type(...)`, etc.
- `vi.fn()` representa una función recibida por props para comprobar si fue llamada y con qué datos.
- Las pruebas de LoginForm y Modal separan renderizado, validación e interacciones en casos independientes. Las pruebas de integración conservan recorridos completos, como confirmar una compra y gestionar su pedido.

## Qué conserva Nexus además del ejemplo

`vite.config.js` contiene `environment: 'jsdom'` y `setupFiles: './src/test/setup.js'`, igual que la referencia. Nexus añade coverage V8 e informes de texto, HTML, JSON y LCOV. Incluye todo el código de `src`, aunque no se importe en una prueba, excepto pruebas, preparación del entorno y el punto de montaje `main.jsx`.

`src/test/setup.js` importa `@testing-library/jest-dom/vitest` y ejecuta `cleanup()` después de cada prueba, como el profesor. Además limpia localStorage y sessionStorage y restaura mocks para aislar los casos. Incluye adaptaciones de diálogo y desplazamiento que necesita Nexus porque jsdom no implementa esas funciones nativas. El nombre `jest-dom` corresponde a los verificadores del DOM; el ejecutor sigue siendo Vitest.

Los componentes con enlaces se prueban dentro de `MemoryRouter`. Las pruebas de datos y reglas de negocio usan `.test.js`; `App.test.jsx`, `Compra.test.jsx` y los recorridos de administración verifican integración. Las pruebas parametrizadas usan `test.each` para comprobar múltiples entradas inválidas sin duplicar código.

No se eliminaron pruebas para imitar el tamaño del ejemplo. Se mantiene la configuración de coverage y la lógica de la aplicación.

## Ejecutar desde la carpeta que contiene package.json

En PowerShell:

```powershell
npm.cmd run test:run -- --coverage
```

Para practicar con el ejemplo de login:

```powershell
npm.cmd run test:run -- src/components/LoginForm.test.jsx
```

El informe visual se genera en `coverage/index.html`. Se puede abrir desde PowerShell con `Start-Process .\coverage\index.html`. No se sube la carpeta coverage al repositorio.

## Resultado de esta revisión

158 pruebas aprobadas en 30 archivos; ESLint correcto. Cobertura: 97,29 % sentencias, 95,54 % ramas, 99,22 % funciones y 99,76 % líneas. El aumento desde 149 casos se debe a la separación y ampliación de verificaciones de LoginForm y Modal; los porcentajes de cobertura se mantienen.
