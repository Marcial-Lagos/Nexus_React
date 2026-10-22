import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import Stream from "./Stream.jsx";
describe("Página Stream", () => {
  test("alterna seguimiento y los controles del reproductor simulado", async () => {
    const user = userEvent.setup();
    render(<Stream usuario={{ nombre: "Ana" }} />);
    await user.click(screen.getByRole("button", { name: /Seguir/ }));
    expect(screen.getByRole("button", { name: /Siguiendo/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: /Siguiendo/ }));
    await user.click(screen.getByRole("button", { name: "Pausar simulación" }));
    expect(screen.getByText("PAUSA")).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "Reanudar simulación" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Silenciar simulación" }),
    );
    expect(
      screen.getByRole("button", { name: "Activar sonido simulado" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Modo cine" }));
    expect(screen.getByRole("button", { name: "Modo cine" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(
      screen.getByRole("button", { name: "Información del reproductor" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      /Vídeo y audio simulados/,
    );
    await user.click(screen.getByRole("button", { name: /Compartir/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      /Comparte este enlace/,
    );
    await user.click(
      screen.getByRole("button", { name: "Información del chat" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/Chat local/);
  });
  test("ignora mensajes vacíos y añade texto con el nombre de la sesión", async () => {
    const user = userEvent.setup();
    render(<Stream usuario={{ nombre: "Ana" }} />);
    const lista = within(screen.getByLabelText("Mensajes del stream"));
    await user.click(screen.getByRole("button", { name: "Chat", exact: true }));
    expect(lista.getAllByRole("paragraph")).toHaveLength(5);
    await user.type(screen.getByRole("textbox"), "Hola stream");
    await user.click(screen.getByRole("button", { name: "Chat", exact: true }));
    expect(lista.getByText("Ana:")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("");
    await user.click(
      screen.getByRole("button", { name: "Añadir emoji al chat" }),
    );
    expect(screen.getByRole("textbox")).toHaveValue(" 😊");
  });
});
