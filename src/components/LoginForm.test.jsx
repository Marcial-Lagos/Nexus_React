import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { MemoryRouter } from "react-router";
import LoginForm from "./LoginForm.jsx";

describe("Componente LoginForm", () => {
  test("muestra los campos de correo y contraseña", () => {
    render(
      <MemoryRouter>
        <LoginForm onLogin={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
  });

  test("impide iniciar sesión con los campos vacíos", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(
      <MemoryRouter>
        <LoginForm onLogin={onLogin} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Entrar a Nexus" }));

    expect(
      screen.getByText("Ingresa tu correo electrónico."),
    ).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  test("muestra un error cuando el correo tiene un formato inválido", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(
      <MemoryRouter>
        <LoginForm onLogin={onLogin} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Correo electrónico"), "mal");
    await user.type(screen.getByLabelText("Contraseña"), "1234");
    await user.click(screen.getByRole("button", { name: "Entrar a Nexus" }));

    expect(screen.getByText(/Escribe un correo válido/)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  test("muestra un error cuando la contraseña es demasiado corta", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(
      <MemoryRouter>
        <LoginForm onLogin={onLogin} />
      </MemoryRouter>,
    );

    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "ana@gmail.com",
    );
    await user.type(screen.getByLabelText("Contraseña"), "123");
    await user.click(screen.getByRole("button", { name: "Entrar a Nexus" }));

    expect(screen.getByText(/al menos 4/)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  test("entrega el correo al corregir los datos y enviar el formulario", async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    render(
      <MemoryRouter>
        <LoginForm onLogin={onLogin} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Correo electrónico"), "mal");
    await user.type(screen.getByLabelText("Contraseña"), "123");
    await user.clear(screen.getByLabelText("Correo electrónico"));
    await user.type(
      screen.getByLabelText("Correo electrónico"),
      "ana@gmail.com",
    );
    await user.type(screen.getByLabelText("Contraseña"), "4");
    await user.click(screen.getByRole("button", { name: "Entrar a Nexus" }));

    expect(onLogin).toHaveBeenCalledWith({ correo: "ana@gmail.com" });
  });

  test("ejecuta el acceso de invitado", async () => {
    const user = userEvent.setup();
    const onGuest = vi.fn();
    render(
      <MemoryRouter>
        <LoginForm onGuest={onGuest} />
      </MemoryRouter>,
    );

    await user.click(
      screen.getByRole("button", { name: "Entrar como invitado" }),
    );

    expect(onGuest).toHaveBeenCalledOnce();
  });

  test("solicita mostrar el formulario de registro", async () => {
    const user = userEvent.setup();
    const onShowRegistro = vi.fn();
    render(
      <MemoryRouter>
        <LoginForm onShowRegistro={onShowRegistro} />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: "Registrarte" }));

    expect(onShowRegistro).toHaveBeenCalledOnce();
  });

  test("explica la limitación de recuperación de contraseña", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", { name: /Olvidaste/ }));

    expect(
      within(screen.getByRole("form")).getByText(/No hay recuperación/),
    ).toBeInTheDocument();
  });

  test("muestra el aviso recibido por props", () => {
    render(
      <MemoryRouter>
        <LoginForm aviso="Registro listo" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Registro listo")).toBeInTheDocument();
  });
});
