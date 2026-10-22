import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import Checkout from "./Checkout.jsx";
import { datosIniciales } from "../data/administracion.js";
const carrito = [{ id: "teclado", precio: 49990, cantidad: 1 }];
describe("Página Checkout", () => {
  test("precarga el perfil y exige dirección para despacho", async () => {
    const user = userEvent.setup(),
      confirmar = vi.fn();
    render(
      <MemoryRouter>
        <Checkout
          usuario={{ nombre: "Ana", correo: "ana@gmail.com" }}
          datos={datosIniciales()}
          carrito={carrito}
          onConfirm={confirmar}
        />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText("Nombre completo")).toHaveValue("Ana");
    await user.selectOptions(
      screen.getByLabelText("Forma de entrega"),
      "domicilio",
    );
    expect(screen.getByText("Total: $53.980")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    expect(
      screen.getByText("Ingresa una dirección de hasta 200 caracteres."),
    ).toBeInTheDocument();
    expect(confirmar).not.toHaveBeenCalled();
  });
  test("muestra error de persistencia sin perder los campos del formulario", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Checkout
          usuario={{ nombre: "Ana", correo: "ana@gmail.com" }}
          datos={datosIniciales()}
          carrito={carrito}
          onConfirm={() => {
            throw new Error("No se pudo guardar");
          }}
        />
      </MemoryRouter>,
    );
    await user.click(
      screen.getByRole("button", { name: "Confirmar compra simulada" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar");
    expect(screen.getByLabelText("Nombre completo")).toHaveValue("Ana");
  });
  test("no permite confirmar un carrito vacío", () => {
    render(
      <MemoryRouter>
        <Checkout datos={datosIniciales()} carrito={[]} />
      </MemoryRouter>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "El carrito está vacío.",
    );
    expect(
      screen.queryByRole("button", { name: "Confirmar compra simulada" }),
    ).not.toBeInTheDocument();
  });
});
