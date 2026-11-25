import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Directos from "./Directos.jsx";
import { apiRequest } from "../api/client.js";

vi.mock("../api/client.js", () => ({ apiRequest: vi.fn() }));
const usuario = { id: 1, autenticadoApi: true };
beforeEach(() => { apiRequest.mockReset(); apiRequest.mockResolvedValue([]); });
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("Directos reales", () => {
  test("no consulta canales sin autenticacion", () => {
    render(<Directos usuario={{}} />);
    expect(screen.getByText(/Inicia sesi/)).toBeInTheDocument();
    expect(apiRequest).not.toHaveBeenCalled();
  });
  test("lista canales recibidos desde la API", async () => {
    apiRequest.mockResolvedValue([{ id: "abc", titulo: "Nexus Live" }]);
    render(<Directos usuario={usuario} />);
    expect(await screen.findByRole("button", { name: "Ver Nexus Live" })).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith("/api/v1/directos");
  });
  test("impide publicar un titulo vacio y muestra errores de permisos", async () => {
    const user = userEvent.setup();
    const capture = vi.fn().mockRejectedValue(new Error("Permiso denegado"));
    vi.stubGlobal("navigator", Object.assign(Object.create(window.navigator), { mediaDevices: { getUserMedia: capture } }));
    render(<Directos usuario={usuario} />);
    const button = screen.getByRole("button", { name: /Iniciar transmisi/ });
    expect(button).toBeDisabled();
    await user.type(screen.getByRole("textbox"), "Prueba");
    await user.click(button);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Permiso denegado"));
    expect(capture).toHaveBeenCalledWith({ audio: true, video: true });
    expect(apiRequest.mock.calls.some(([, options]) => options?.method === "POST")).toBe(false);
  });
});
