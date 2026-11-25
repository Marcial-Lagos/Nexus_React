import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import ChatDirecto from "./ChatDirecto.jsx";
import { apiRequest } from "../api/client.js";
vi.mock("../api/client.js",()=>({apiRequest:vi.fn()}));
afterEach(()=>{cleanup();vi.clearAllMocks();});
test("muestra y envia mensajes al canal",async()=>{
  apiRequest.mockImplementation(async (_path, opts)=>opts?.method==="POST"?{id:2,usuario:"1",texto:opts.body.texto}:[{id:1,usuario:"2",texto:"Hola"}]);
  const user=userEvent.setup();
  render(<ChatDirecto id="abc"/>);
  expect(await screen.findByText("Hola")).toBeInTheDocument();
  await user.type(screen.getByRole("textbox"),"Buenas");
  await user.click(screen.getByRole("button",{name:"Enviar"}));
  expect(await screen.findByText("Buenas")).toBeInTheDocument();
  expect(apiRequest).toHaveBeenCalledWith("/api/v1/directos/abc/chat",expect.objectContaining({method:"POST",body:{texto:"Buenas"}}));
});

test("historial archivado es de solo lectura",async()=>{
  apiRequest.mockResolvedValue([{id:7,usuario:"2",texto:"Archivado"}]);
  render(<ChatDirecto id="abc" soloLectura/>);
  expect(await screen.findByText("Archivado")).toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});
test("consulta el canal de comunidad y filtra los mensajes cargados",async()=>{
  apiRequest.mockResolvedValue([{id:1,usuario:"2",texto:"Hola"},{id:2,usuario:"3",texto:"Otro"}]);
  render(<ChatDirecto canal="Sala general" busqueda="Hola"/>);
  expect(await screen.findByText("Hola")).toBeInTheDocument();
  expect(screen.queryByText("Otro")).not.toBeInTheDocument();
  expect(apiRequest).toHaveBeenCalledWith("/api/v1/comunidad/chat?canal=Sala%20general",expect.anything());
});
