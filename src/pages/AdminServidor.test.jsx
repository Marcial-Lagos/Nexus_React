import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { beforeEach, expect, test, vi } from "vitest";
import AdminServidor from "./AdminServidor.jsx";
import { apiRequest, obtenerProductos } from "../api/client.js";
vi.mock("../api/client.js",async(importOriginal)=>({...await importOriginal(),apiRequest:vi.fn(),obtenerProductos:vi.fn()}));
const productos=[{id:"1",nombre:"Monitor",categoria:"Gaming",precio:100000,stock:2},{id:"2",nombre:"Teclado",categoria:"Accesorios",precio:30000,stock:15}];
beforeEach(()=>{
  obtenerProductos.mockResolvedValue(productos);
  apiRequest.mockImplementation(async path=>path==="/api/v1/usuarios"?[{id:1,nombre:"Ana",email:"ana@example.test"}]:[{id:9,estado:"CONFIRMADO",total:100000,fecha:new Date().toISOString(),cliente:{nombre:"Ana"},items:[{id:1,nombre:"Monitor",cantidad:1}]}]);
});
function abrir(ruta="/admin"){return render(<MemoryRouter initialEntries={[ruta]}><Routes><Route path="/admin/*" element={<AdminServidor onLogout={()=>{}}/>}/></Routes></MemoryRouter>);}
test("muestra indicadores con datos del servidor y gráficos sin ingresos ficticios",async()=>{
  abrir();
  expect(await screen.findByRole("heading",{name:"Resumen de la tienda"})).toBeInTheDocument();
  expect(screen.getByText("Datos del servidor")).toBeInTheDocument();
  expect(screen.getByRole("heading",{name:"Actividad de pedidos"})).toBeInTheDocument();
  expect(screen.getByRole("heading",{name:"Alertas de inventario"})).toBeInTheDocument();
  expect(screen.getByText("2 un.")).toBeInTheDocument();
  expect(screen.getByText(/no a ingresos bancarios/)).toBeInTheDocument();
});
test("filtra el catálogo y conserva el formulario de edición",async()=>{
  const user=userEvent.setup();abrir("/admin/productos");
  const row=await screen.findByRole("row",{name:/Monitor/});
  await user.type(screen.getByRole("textbox",{name:"Buscar productos"}),"Monitor");
  expect(screen.queryByRole("row",{name:/Teclado/})).not.toBeInTheDocument();
  await user.click(within(row).getByRole("button",{name:"Editar"}));
  expect(screen.getByRole("heading",{name:"Editar producto"})).toBeInTheDocument();
  expect(screen.getByLabelText("Nombre")).toHaveValue("Monitor");
});
