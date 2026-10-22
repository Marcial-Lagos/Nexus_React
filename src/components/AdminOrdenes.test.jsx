import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import AdminOrdenes from "./AdminOrdenes.jsx";
const orden = {
  id: "p1",
  fecha: "2026-10-22T12:00:00Z",
  cliente: { nombre: "Ana", correo: "ana@gmail.com", entrega: "retiro" },
  estado: "pendiente",
  items: [],
  envio: 0,
  total: 1000,
};
describe("Componente AdminOrdenes", () => {
  test("exige confirmación para cancelar y permite conservar el pedido", async () => {
    const user = userEvent.setup(),
      cambiar = vi.fn();
    render(<AdminOrdenes ordenes={[orden]} onChangeEstado={cambiar} />);
    await user.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    await user.click(screen.getByRole("button", { name: "Conservar pedido" }));
    expect(cambiar).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Cancelar pedido" }));
    await user.click(
      screen.getByRole("button", { name: "Confirmar cancelación" }),
    );
    expect(cambiar).toHaveBeenCalledWith("p1", "cancelado");
  });
  test("muestra errores al cambiar el estado", async () => {
    const user = userEvent.setup();
    render(
      <AdminOrdenes
        ordenes={[orden]}
        onChangeEstado={() => {
          throw new Error("No se pudo guardar");
        }}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Marcar preparando" }));
    expect(screen.getByRole("alert")).toHaveTextContent("No se pudo guardar");
  });
});
