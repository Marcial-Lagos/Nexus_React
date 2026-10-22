import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { describe, expect, test } from "vitest";
import ResultadoCompra from "./ResultadoCompra.jsx";
describe("Página ResultadoCompra", () => {
  test("no revela detalles de una compra de otra sesión", () => {
    render(
      <MemoryRouter initialEntries={["/compra/privada"]}>
        <Routes>
          <Route
            path="/compra/:id"
            element={
              <ResultadoCompra
                usuario={{ id: "otro" }}
                ordenes={[{ id: "privada", sesionId: "original" }]}
              />
            }
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Compra no disponible" }),
    ).toBeInTheDocument();
  });
});
