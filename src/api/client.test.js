import { afterEach, describe, expect, test, vi } from "vitest";
import {
  API_PATHS,
  apiRequest,
  crearPedidoApi,
  iniciarSesionApi,
  normalizeOrder,
  normalizeProducts,
  registrarUsuarioApi,
  readAccessToken,
} from "./client.js";

const response = (body, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (body === null ? "" : JSON.stringify(body)),
});

describe("cliente API Nexus", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test("mapea login al endpoint Gateway y guarda solo el token de sesión", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080/");
    const token = `x.${btoa(
      JSON.stringify({ sub: "usuario-42", nombre: "Ana", email: "ana@example.com" }),
    )}.x`;
    const fetch = vi.fn().mockResolvedValue(
      response({ token, usuario: { nombre: "Ana", correo: "ana@example.com" } }),
    );
    vi.stubGlobal("fetch", fetch);

    const usuario = await iniciarSesionApi(" ana@example.com ", "NoPersistir123!");

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:8080${API_PATHS.login}`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          correo: "ana@example.com",
          contrasena: "NoPersistir123!",
        }),
      }),
    );
    expect(usuario).toMatchObject({
      id: "usuario-42",
      nombre: "Ana",
      correo: "ana@example.com",
      rol: "cliente",
    });
    expect(readAccessToken()).toBe(token);
    expect(sessionStorage.getItem("nexus.sesion")).toBeNull();
  });

  test("normaliza el catálogo y las líneas de pedido sin alterar los endpoints", () => {
    expect(
      normalizeProducts({
        data: [{ productoId: 7, name: "Mouse", price: 2500, cantidadStock: 4 }],
      }),
    ).toEqual([
      expect.objectContaining({
        id: "7",
        nombre: "Mouse",
        precio: 2500,
        stock: 4,
      }),
    ]);
    expect(API_PATHS.products).toBe("/api/v1/productos");
    expect(API_PATHS.profile("id/1")).toBe("/api/v1/usuarios/id%2F1");
    expect(
      normalizeOrder({
        pedidoId: 9,
        items: [{ productoId: 7, nombre: "Mouse", cantidad: 2, precio: 2500 }],
        total: 5000,
      }),
    ).toMatchObject({
      id: "9",
      total: 5000,
      items: [{ id: "7", nombre: "Mouse", cantidad: 2, precio: 2500 }],
    });
  });

  test("mapea el checkout a productos/cantidades y no confía en precios del navegador", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
    sessionStorage.setItem("nexus.api.token", "jwt");
    const fetch = vi.fn().mockResolvedValue(
      response({ pedidoId: 31, usuarioId: "usuario-42", total: 7000 }),
    );
    vi.stubGlobal("fetch", fetch);

    await crearPedidoApi("usuario-42", [
      { id: "p-7", cantidad: 2, precio: 3500 },
    ]);

    expect(fetch).toHaveBeenCalledWith(
      `http://localhost:8080${API_PATHS.orders}`,
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer jwt" }),
        body: JSON.stringify({
          usuarioId: "usuario-42",
          items: [{ productoId: "p-7", cantidad: 2 }],
        }),
      }),
    );
  });

  test("envía registro al Gateway sin conservar contraseña ni confirmación", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "http://localhost:8080");
    const fetch = vi.fn().mockResolvedValue(response({ message: "Cuenta creada" }));
    vi.stubGlobal("fetch", fetch);

    const resultado = await registrarUsuarioApi({
      nombre: "Ana",
      apellido: "Lagos",
      usuario: "ana_dev",
      correo: "ana@example.com",
      nacimiento: "2000-01-01",
      contrasena: "ClaveSecreta1!",
      confirmacion: "ClaveSecreta1!",
      terminos: true,
    });

    expect(fetch.mock.calls[0][0]).toBe(
      `http://localhost:8080${API_PATHS.register}`,
    );
    expect(fetch.mock.calls[0][1].body).not.toContain("confirmacion");
    expect(fetch.mock.calls[0][1].body).not.toContain("terminos");
    expect(sessionStorage.getItem("nexus.api.token")).toBeNull();
    expect(resultado.autenticado).toBe(false);
  });

  test("expone errores del servidor y limpia la sesión al recibir 401", async () => {
    vi.stubEnv("VITE_API_BASE_URL", "https://gateway.example");
    sessionStorage.setItem("nexus.api.token", "expired");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(response({ message: "Token vencido" }, 401)),
    );
    const expiracion = vi.fn();
    window.addEventListener("nexus:session-expired", expiracion);

    await expect(apiRequest(API_PATHS.products)).rejects.toMatchObject({
      message: "Token vencido",
      status: 401,
    });

    expect(readAccessToken()).toBe("");
    expect(expiracion).toHaveBeenCalledOnce();
    window.removeEventListener("nexus:session-expired", expiracion);
  });
});
