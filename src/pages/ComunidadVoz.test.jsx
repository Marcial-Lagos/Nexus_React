import { render, screen, within, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import Comunidad from "./Comunidad.jsx";
import { apiRequest } from "../api/client.js";
vi.mock("../api/client.js",()=>({apiRequest:vi.fn()}));
const usuario={nombre:"Ana",id:1,autenticadoApi:true};
const track={enabled:true,stop:vi.fn()};
const stream={getTracks:()=>[track],getAudioTracks:()=>[track]};
beforeEach(()=>{
  track.enabled=true;
  vi.stubGlobal("navigator",Object.assign(Object.create(window.navigator),{mediaDevices:{getUserMedia:vi.fn().mockResolvedValue(stream)}}));
  apiRequest.mockImplementation(async(path,opts)=>{
    if(path.endsWith("/estado"))return {miembros:[{id:"1",nombre:"Ana",hablando:false,silencio:!track.enabled}],senales:[]};
    if(path==="/api/v1/voz/general"&&!opts?.method)return [{id:"2",nombre:"Luis",hablando:true,silencio:false}];
    return [];
  });
});
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.clearAllMocks();});
test("muestra participantes antes de conectar y conserva la llamada en canales de texto",async()=>{
  const user=userEvent.setup();
  render(<MemoryRouter initialEntries={["/comunidad?canal=Sala%20general"]}><Comunidad usuario={usuario}/></MemoryRouter>);
  const stage=screen.getByRole("region",{name:"Sala de voz Sala general"});
  expect(await within(stage).findByText("Luis")).toBeInTheDocument();
  expect(within(stage).getByText("Hablando")).toBeInTheDocument();
  await user.click(within(stage).getByRole("button",{name:"Unirse al canal de voz"}));
  const dock=screen.getByRole("region",{name:"Sala de voz"});
  await within(dock).findByText("Voz conectada");
  await user.click(screen.getByRole("button",{name:"# juegos"}));
  expect(screen.queryByRole("region",{name:"Sala de voz Sala general"})).not.toBeInTheDocument();
  expect(within(dock).getByText("Voz conectada")).toBeInTheDocument();
  expect(track.stop).not.toHaveBeenCalled();
  await user.click(within(dock).getByRole("button",{name:"Silenciar micrófono"}));
  expect(track.enabled).toBe(false);
  await user.click(within(dock).getByRole("button",{name:"Desconectar voz"}));
  await waitFor(()=>expect(track.stop).toHaveBeenCalledTimes(1));
  expect(apiRequest).toHaveBeenCalledWith("/api/v1/voz/general",{method:"DELETE"});
});
