import { expect, test, vi } from "vitest";
import { consultarVoz } from "./voz.js";

test("recupera la presencia tras un fallo temporal sin duplicar la sesion",async()=>{
  const request=vi.fn().mockRejectedValueOnce(Object.assign(Error("red"),{status:0})).mockResolvedValue({miembros:[],senales:[]});
  const estado=vi.fn(), pausa=vi.fn().mockResolvedValue();
  expect(await consultarVoz(request,{hablando:false,silencio:false},{pausa,activo:()=>true,estado})).toEqual({miembros:[],senales:[]});
  expect(pausa).toHaveBeenCalledWith(1000);
  expect(estado).toHaveBeenCalledWith("Conectado");
  expect(request).toHaveBeenCalledTimes(2);
});
test("no reintenta una sesion expirada",async()=>{
  const request=vi.fn().mockRejectedValue(Object.assign(Error("expirada"),{status:410}));
  await expect(consultarVoz(request,{}, {pausa:vi.fn(),activo:()=>true,estado:vi.fn()})).rejects.toMatchObject({status:410});
  expect(request).toHaveBeenCalledTimes(1);
});
test("limita los reintentos",async()=>{
  const request=vi.fn().mockRejectedValue(Object.assign(Error("red"),{status:0}));
  const pausa=vi.fn().mockResolvedValue();
  await expect(consultarVoz(request,{}, {pausa,activo:()=>true,estado:vi.fn()})).rejects.toThrow("red");
  expect(pausa.mock.calls).toEqual([[1000],[2000],[4000]]);
});
