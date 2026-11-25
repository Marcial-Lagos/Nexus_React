import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import SalaVoz from "./SalaVoz.jsx";
import { apiRequest } from "../api/client.js";
vi.mock("../api/client.js",()=>({apiRequest:vi.fn()}));
afterEach(()=>{cleanup();vi.unstubAllGlobals();vi.clearAllMocks();});
test("solicita permiso y no registra presencia si el usuario lo deniega",async()=>{
  const capture=vi.fn().mockRejectedValue(new Error("Sin permiso"));
  vi.stubGlobal("navigator",Object.assign(Object.create(window.navigator),{mediaDevices:{getUserMedia:capture}}));
  const user=userEvent.setup();
  render(<SalaVoz sala="general" usuario={{id:1,nombre:"Ana"}}/>);
  expect(apiRequest).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button",{name:"Conectar voz"}));
  expect(await screen.findByRole("alert")).toHaveTextContent("Sin permiso");
  expect(capture).toHaveBeenCalledWith({audio:true});
  expect(apiRequest).not.toHaveBeenCalled();
});
