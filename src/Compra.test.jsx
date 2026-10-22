import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import App from "./App.jsx";
import {
  CLAVE_DATOS,
  ADMIN_CORREO,
  datosIniciales,
} from "./data/administracion.js";
function abrir(ruta) {
  return render(
    <MemoryRouter initialEntries={[ruta]}>
      <App />
    </MemoryRouter>,
  );
}
function cliente() {
  sessionStorage.setItem(
    "nexus.sesion",
    JSON.stringify({ id: "ana", nombre: "Ana", correo: "ana@gmail.com" }),
  );
}
async function checkout(user) {
  cliente();
  const vista = abrir("/producto");
  await user.click(screen.getByRole("button", { name: /Agregar al carrito/ }));
  await user.click(screen.getByRole("link", { name: "Ver carrito" }));
  await user.click(screen.getByRole("link", { name: "Finalizar compra" }));
  return vista;
}
describe("Integración Compra", () => {
  test("compra, persiste pedido, vacía carrito, confirma al recargar y permite gestión admin", async () => {
    const user = userEvent.setup();
    const vista = await checkout(user);
    await user.dblClick(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    expect(
      screen.getByRole("heading", { name: "Compra simulada confirmada" }),
    ).toBeInTheDocument();
    let datos = JSON.parse(localStorage.getItem(CLAVE_DATOS));
    expect(datos.ordenes).toHaveLength(1);
    expect(datos.productos[0].stock).toBe(9);
    const id = datos.ordenes[0].id;
    vista.unmount();
    const resultado = abrir("/compra/" + id);
    expect(screen.getByText("Total: $49.990")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Seguir comprando" }));
    expect(screen.getByText("Tu carrito está vacío.")).toBeInTheDocument();
    resultado.unmount();
    sessionStorage.setItem(
      "nexus.sesion",
      JSON.stringify({
        id: "admin",
        nombre: "Administrador",
        correo: ADMIN_CORREO,
        rol: "admin",
      }),
    );
    abrir("/admin/ordenes");
    const pedido = within(
      screen.getByRole("article", { name: `Pedido ${id}` }),
    );
    expect(pedido.getByText(/Ana/)).toBeInTheDocument();
    await user.click(pedido.getByRole("button", { name: "Marcar preparando" }));
    expect(pedido.getByText("preparando")).toBeInTheDocument();
    await user.click(pedido.getByRole("button", { name: "Cancelar pedido" }));
    await user.click(
      screen.getByRole("button", { name: "Confirmar cancelación" }),
    );
    datos = JSON.parse(localStorage.getItem(CLAVE_DATOS));
    expect(datos.productos[0].stock).toBe(10);
    expect(datos.ordenes[0].estado).toBe("cancelado");
  });
  test("rechaza pago sin crear pedido ni descontar stock y conserva carrito para reintentar", async () => {
    const user = userEvent.setup();
    await checkout(user);
    await user.selectOptions(
      screen.getByLabelText("Resultado del pago de prueba"),
      "rechazado",
    );
    await user.click(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    expect(
      screen.getByRole("heading", { name: "Pago simulado rechazado" }),
    ).toBeInTheDocument();
    expect(localStorage.getItem(CLAVE_DATOS)).toBeNull();
    await user.click(screen.getByRole("link", { name: "Volver a intentar" }));
    expect(screen.getByText("Teclado Gamer × 1: $49.990")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    expect(JSON.parse(localStorage.getItem(CLAVE_DATOS)).ordenes).toHaveLength(
      1,
    );
  });
  test("no confirma ni descuenta si falla el almacenamiento", async () => {
    const user = userEvent.setup();
    await checkout(user);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Bloqueado");
    });
    await user.click(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      /No se pudo guardar el pedido/,
    );
    expect(localStorage.getItem(CLAVE_DATOS)).toBeNull();
    await user.click(screen.getByRole("link", { name: "Volver al carrito" }));
    expect(screen.getByText("Teclado Gamer × 1")).toBeInTheDocument();
  });
  test("revalida stock actualizado por otra pestaña antes de confirmar", async () => {
    const user = userEvent.setup();
    await checkout(user);
    const datos = datosIniciales();
    datos.productos[0].stock = 0;
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
    await user.click(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/Stock insuficiente/);
    expect(JSON.parse(localStorage.getItem(CLAVE_DATOS)).ordenes).toHaveLength(
      0,
    );
  });
  test.each(["/checkout", "/compra/desconocido"])(
    "protege %s sin sesión",
    (ruta) => {
      abrir(ruta);
      expect(
        screen.getByRole("form", { name: "Inicio de sesión" }),
      ).toBeInTheDocument();
    },
  );
  test("guarda dirección de despacho, cobra envío simulado y mantiene el comprobante histórico", async () => {
    const user = userEvent.setup();
    await checkout(user);
    await user.selectOptions(
      screen.getByLabelText("Forma de entrega"),
      "domicilio",
    );
    await user.type(screen.getByLabelText("Dirección"), "Av. Principal 123");
    await user.type(screen.getByLabelText("Comuna"), "Paine");
    await user.click(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    expect(screen.getByText("Total: $53.980")).toBeInTheDocument();
    expect(
      screen.getByText("Entrega: Av. Principal 123, Paine"),
    ).toBeInTheDocument();
    const datos = JSON.parse(localStorage.getItem(CLAVE_DATOS));
    expect(datos.ordenes[0].envio).toBe(3990);
    expect(datos.ordenes[0].cliente).toEqual(
      expect.objectContaining({
        nombre: "Ana",
        correo: "ana@gmail.com",
        comuna: "Paine",
      }),
    );
  });
  test("conecta categorías y ofertas del administrador con tienda, carrito y pedido", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem(
      "nexus.sesion",
      JSON.stringify({
        id: "admin",
        nombre: "Administrador",
        correo: ADMIN_CORREO,
        rol: "admin",
      }),
    );
    abrir("/admin/categorias");
    await user.click(screen.getByRole("button", { name: "Crear registro" }));
    await user.type(screen.getByLabelText("Nombre"), "Periféricos");
    await user.click(screen.getByRole("button", { name: "Guardar registro" }));
    await user.click(screen.getByRole("link", { name: "Productos" }));
    await user.click(
      screen.getByRole("button", { name: "Editar Teclado Gamer" }),
    );
    await user.selectOptions(
      screen.getByLabelText("Categoría"),
      screen.getByRole("option", { name: "Periféricos" }),
    );
    await user.type(
      screen.getByLabelText("Precio de oferta CLP (opcional)"),
      "30000",
    );
    await user.click(screen.getByRole("button", { name: "Guardar registro" }));
    await user.click(screen.getByRole("link", { name: "Ver tienda" }));
    await user.selectOptions(
      screen.getByLabelText("Categoría"),
      screen.getByRole("option", { name: "Periféricos" }),
    );
    await user.click(screen.getByLabelText("Solo ofertas"));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await user.click(
      screen.getByRole("link", { name: "Comprar Teclado Gamer" }),
    );
    expect(screen.getByText("Periféricos")).toBeInTheDocument();
    expect(screen.getByLabelText("Precio normal")).toHaveTextContent("$49.990");
    await user.click(
      screen.getByRole("button", { name: /Agregar al carrito/ }),
    );
    await user.click(screen.getByRole("link", { name: "Ver carrito" }));
    expect(screen.getByText("Total: $30.000")).toBeInTheDocument();
    await user.click(screen.getByRole("link", { name: "Finalizar compra" }));
    await user.click(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    const datos = JSON.parse(localStorage.getItem(CLAVE_DATOS));
    expect(datos.ordenes[0].total).toBe(30000);
    expect(datos.ordenes[0].items[0].precio).toBe(30000);
    expect(datos.productos[0].stock).toBe(9);
  });
});
