import { describe, expect, test, vi } from "vitest";
import { servidoresIce, verDirecto } from "./directos.js";

describe("ICE y reconexion", () => {
  test("valida la configuracion de servidores", () => {
    expect(servidoresIce()).toEqual([]);
    const config = [{ urls: "stun:example.org:3478" }];
    expect(servidoresIce(JSON.stringify(config))).toEqual(config);
    expect(() => servidoresIce("broken")).toThrow(/ICE/);
    expect(() => servidoresIce('[{"urls":"https://example.org"}]')).toThrow(/ICE/);
  });

  function escenario(status) {
    const s = { fin: false, peers: new Map() };
    const peer = () => ({
      addTransceiver: vi.fn(), close: vi.fn(), connectionState: "connected",
      setRemoteDescription: vi.fn()
    });
    const conexion = vi.fn(peer);
    const apiRequest = vi.fn().mockRejectedValueOnce(Object.assign(new Error("red"), { status }))
      .mockResolvedValueOnce(null).mockImplementation(async () => { s.fin = true; return {}; });
    const setFase = vi.fn();
    return { s, canal: { id: "abc", titulo: "Prueba" }, conexion,
      descripcion: vi.fn().mockResolvedValue("v=0"), apiRequest, base: "/directos",
      pausa: vi.fn().mockResolvedValue(), setFase, video: { current: {} } };
  }

  test("reintenta con una oferta nueva ante un fallo de red", async () => {
    const ctx = escenario(0);
    await verDirecto(ctx);
    expect(ctx.conexion).toHaveBeenCalledTimes(2);
    expect(ctx.setFase).toHaveBeenCalledWith("Reconectando (1/3)");
    expect(ctx.s.peers.size).toBe(0);
  });

  test("no reintenta si el canal ha terminado", async () => {
    const ctx = escenario(410);
    await expect(verDirecto(ctx)).rejects.toMatchObject({ status: 410 });
    expect(ctx.conexion).toHaveBeenCalledTimes(1);
  });

  test("limita los intentos y libera cada conexion", async () => {
    const ctx = escenario(0);
    ctx.apiRequest.mockReset().mockRejectedValue(Object.assign(new Error("red"), { status: 0 }));
    await expect(verDirecto(ctx)).rejects.toThrow("red");
    expect(ctx.conexion).toHaveBeenCalledTimes(4);
    expect(ctx.s.peers.size).toBe(0);
    expect(ctx.pausa.mock.calls).toEqual([[1000], [2000], [4000]]);
  });
});
