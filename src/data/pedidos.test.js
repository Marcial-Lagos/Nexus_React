import { describe, expect, test } from "vitest";
import { datosIniciales, eliminarEntidad } from "./administracion.js";
import {
  COSTO_ENVIO,
  validarEntrega,
  prepararCompra,
  crearPedido,
  cambiarEstadoPedido,
} from "./pedidos.js";
const cliente = { id: "cliente1" },
  admin = { rol: "admin" };
const entrega = { nombre: "Ana", correo: "ana@gmail.com", entrega: "retiro" };
const carrito = [{ id: "teclado", precio: 49990, cantidad: 2 }];
describe("Lógica pedidos", () => {
  test("valida campos y exige dirección/comuna únicamente para domicilio", () => {
    expect(validarEntrega(entrega)).toEqual({});
    expect(validarEntrega({ ...entrega, entrega: "domicilio" })).toEqual(
      expect.objectContaining({
        direccion: expect.any(String),
        comuna: expect.any(String),
      }),
    );
    expect(
      validarEntrega({ nombre: "", correo: "mal", entrega: "otro" }),
    ).toHaveProperty("correo");
  });
  test("calcula subtotal, despacho y total desde catálogo, acumulando cantidades duplicadas", () => {
    expect(prepararCompra(datosIniciales(), carrito, "domicilio")).toEqual(
      expect.objectContaining({
        subtotal: 99980,
        envio: COSTO_ENVIO,
        total: 103970,
      }),
    );
    expect(
      prepararCompra(datosIniciales(), [...carrito, ...carrito], "retiro")
        .items[0].cantidad,
    ).toBe(4);
  });
  test.each([
    [],
    [{ id: "teclado", cantidad: 11, precio: 49990 }],
    [{ id: "ausente", cantidad: 1 }],
    [{ id: "teclado", cantidad: -1 }],
    [{ id: "teclado", cantidad: 1.5 }],
    [{ id: "teclado", cantidad: 1, precio: 1 }],
  ])("rechaza carritos inválidos %j", (items) => {
    expect(() => prepararCompra(datosIniciales(), items, "retiro")).toThrow();
  });
  test("crea un pedido inmutable, descuenta stock y evita duplicarlo", () => {
    const inicial = datosIniciales();
    const compra = crearPedido(inicial, carrito, entrega, cliente, "pedido1");
    expect(compra.datos.productos[0].stock).toBe(8);
    expect(inicial.productos[0].stock).toBe(10);
    expect(compra.pedido.total).toBe(99980);
    const repetido = crearPedido(
      compra.datos,
      carrito,
      entrega,
      cliente,
      "pedido1",
    );
    expect(repetido.datos.ordenes).toHaveLength(1);
    expect(repetido.datos.productos[0].stock).toBe(8);
  });
  test("impide confirmar sin sesión o con datos inválidos", () => {
    expect(() =>
      crearPedido(datosIniciales(), carrito, entrega, null, "x"),
    ).toThrow(/sesión/);
    expect(() =>
      crearPedido(
        datosIniciales(),
        carrito,
        { ...entrega, nombre: "" },
        cliente,
        "x",
      ),
    ).toThrow(/datos/);
  });
  test("restaura stock una sola vez al cancelar y bloquea otras transiciones", () => {
    const compra = crearPedido(
      datosIniciales(),
      carrito,
      entrega,
      cliente,
      "p1",
    );
    const preparando = cambiarEstadoPedido(
      compra.datos,
      "p1",
      "preparando",
      admin,
    );
    expect(() =>
      eliminarEntidad(preparando, "productos", "teclado", admin),
    ).toThrow(/pedidos activos/);
    const cancelado = cambiarEstadoPedido(preparando, "p1", "cancelado", admin);
    expect(cancelado.productos[0].stock).toBe(10);
    expect(
      cambiarEstadoPedido(cancelado, "p1", "cancelado", admin).productos[0]
        .stock,
    ).toBe(10);
    expect(() =>
      cambiarEstadoPedido(cancelado, "p1", "enviado", admin),
    ).toThrow(/no permitido/);
    expect(() =>
      cambiarEstadoPedido(compra.datos, "p1", "cancelado", cliente),
    ).toThrow(/reservado/);
  });
  test("permite despachar desde preparando y no cancelar un pedido enviado", () => {
    const compra = crearPedido(
      datosIniciales(),
      carrito,
      entrega,
      cliente,
      "p1",
    );
    expect(() =>
      cambiarEstadoPedido(compra.datos, "p1", "enviado", admin),
    ).toThrow();
    const enviado = cambiarEstadoPedido(
      cambiarEstadoPedido(compra.datos, "p1", "preparando", admin),
      "p1",
      "enviado",
      admin,
    );
    expect(enviado.productos[0].stock).toBe(8);
    expect(() =>
      cambiarEstadoPedido(enviado, "p1", "cancelado", admin),
    ).toThrow();
  });
});
