import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import App from "./App.jsx";
import { biografiaOriginal } from "./data/nexus.js";

const cuenta = {
  nombre: "lLGNDl",
  correo: "marcial@gmail.com",
  invitado: false,
  biografia: biografiaOriginal,
};
function abrir(ruta = "/", sesion = false) {
  if (sesion) sessionStorage.setItem("nexus.sesion", JSON.stringify(cuenta));
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  );
}
describe("Rutas y sesión de Nexus", () => {
  test.each([
    ["/principal", /Aprende código/],
    ["/comunidad", /bienvenida a #general/],
    ["/perfil", "lLGNDl"],
    ["/tienda", "Tienda Nexus"],
    ["/producto", "Teclado Gamer"],
    ["/stream", "Creando una web desde cero"],
    ["/contacto", "Hablemos."],
  ])("muestra la pantalla completa en %s", (ruta, titulo) => {
    abrir(ruta, true);
    expect(screen.getByRole("heading", { name: titulo })).toBeInTheDocument();
  });
  test.each([
    "/",
    "/login",
    "/principal",
    "/perfil",
    "/comunidad",
    "/tienda",
    "/producto",
    "/stream",
    "/no-existe",
  ])("muestra acceso sin sesión en %s", (ruta) => {
    abrir(ruta);
    expect(
      screen.getByRole("form", { name: "Inicio de sesión" }),
    ).toBeInTheDocument();
  });
  test.each(["/", "/login", "/no-existe"])(
    "redirige al inicio con sesión en %s",
    (ruta) => {
      abrir(ruta, true);
      expect(
        screen.getByRole("heading", { name: /Aprende código/ }),
      ).toBeInTheDocument();
    },
  );
  test("permite entrar como invitado, buscar y cerrar sesión", async () => {
    const user = userEvent.setup();
    abrir();
    await user.click(
      screen.getByRole("button", { name: "Entrar como invitado" }),
    );
    expect(JSON.parse(sessionStorage.getItem("nexus.sesion")).invitado).toBe(
      true,
    );
    const buscar = screen.getByRole("searchbox", { name: /Buscar streams/ });
    await user.type(buscar, "ninguno");
    expect(
      screen.getByText("No existen canales con esa búsqueda."),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Ver todos" }));
    expect(buscar).toHaveValue("");
    const menu = screen.getByRole("button", { name: "Abrir menú" });
    await user.click(menu);
    expect(menu).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(sessionStorage.getItem("nexus.sesion")).toBeNull();
    expect(
      screen.getByRole("form", { name: "Inicio de sesión" }),
    ).toBeInTheDocument();
  });
  test("inicia una sesión de demostración y no persiste la contraseña", async () => {
    const user = userEvent.setup();
    abrir();
    const form = within(screen.getByRole("form", { name: "Inicio de sesión" }));
    await user.type(
      form.getByLabelText("Correo electrónico"),
      "marcial@gmail.com",
    );
    await user.type(form.getByLabelText("Contraseña"), "Clave-PRIVADA1!");
    await user.click(form.getByRole("button", { name: "Entrar a Nexus" }));
    expect(
      screen.getByRole("heading", { name: /Aprende código/ }),
    ).toBeInTheDocument();
    expect(sessionStorage.getItem("nexus.sesion")).not.toContain(
      "Clave-PRIVADA1!",
    );
    expect(localStorage.length).toBe(0);
  });
  test("comparte carrito entre rutas, acumula cantidades y permite quitar o vaciar", async () => {
    const user = userEvent.setup();
    abrir("/producto", true);
    await user.click(
      screen.getByRole("button", { name: /Agregar al carrito/ }),
    );
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(
      screen.getByRole("button", { name: /Agregar al carrito/ }),
    );
    await user.click(screen.getByRole("link", { name: "Ver carrito" }));
    expect(screen.getByText("Teclado Gamer × 3")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Comprar Mouse Gamer" }));
    expect(
      screen.getByRole("heading", { name: "Mouse Gamer" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: /Agregar al carrito/ }),
    );
    await user.click(screen.getByRole("link", { name: "Ver carrito" }));
    await user.click(
      screen.getByRole("button", { name: "Quitar Mouse Gamer" }),
    );
    expect(screen.queryByText("Mouse Gamer × 1")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Vaciar carrito" }));
    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
  });
  test("actualiza el perfil compartido y conserva la sesión al navegar", async () => {
    const user = userEvent.setup();
    abrir("/perfil", true);
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    const nombre = within(screen.getByRole("dialog")).getByLabelText("Nombre");
    await user.clear(nombre);
    await user.type(nombre, "NexusDev");
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(JSON.parse(sessionStorage.getItem("nexus.sesion")).nombre).toBe(
      "NexusDev",
    );
    await user.click(screen.getByRole("link", { name: "Inicio" }));
    expect(screen.getByText("NexusDev")).toBeInTheDocument();
  });
});
