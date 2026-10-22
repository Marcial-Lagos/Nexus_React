import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { describe, expect, test, vi } from "vitest";
import Perfil from "./Perfil.jsx";
const usuario = {
  nombre: "Marcial",
  correo: "marcial@gmail.com",
  biografia: "Me gusta React",
};
describe("Página Perfil", () => {
  test("edita nombre y biografía y llama al estado compartido mediante props", async () => {
    const user = userEvent.setup(),
      actualizar = vi.fn();
    render(
      <MemoryRouter>
        <Perfil usuario={usuario} onUpdate={actualizar} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    const dialogo = within(screen.getByRole("dialog"));
    await user.clear(dialogo.getByLabelText("Nombre"));
    await user.type(dialogo.getByLabelText("Nombre"), "Ana");
    await user.clear(dialogo.getByLabelText("Biografía"));
    await user.type(dialogo.getByLabelText("Biografía"), "Nueva biografía");
    await user.click(dialogo.getByRole("button", { name: "Guardar cambios" }));
    expect(actualizar).toHaveBeenCalledWith({
      nombre: "Ana",
      biografia: "Nueva biografía",
    });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  test("descarta cambios con cancelar y cerrar", async () => {
    const user = userEvent.setup(),
      actualizar = vi.fn();
    render(
      <MemoryRouter>
        <Perfil usuario={{ ...usuario, correo: "" }} onUpdate={actualizar} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    await user.clear(screen.getByLabelText("Nombre"));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    expect(screen.getByLabelText("Nombre")).toHaveValue("Marcial");
    await user.click(screen.getByRole("button", { name: "Cerrar ventana" }));
    expect(actualizar).not.toHaveBeenCalled();
  });
  test("usa el nombre original de respaldo cuando se guarda vacío", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Perfil usuario={usuario} onUpdate={vi.fn()} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole("button", { name: "Editar perfil" }));
    await user.clear(screen.getByLabelText("Nombre"));
    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));
    expect(screen.getByRole("status")).toHaveTextContent(/Perfil actualizado/);
  });
});
