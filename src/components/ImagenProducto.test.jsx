import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import ImagenProducto from "./ImagenProducto.jsx";
import { productos } from "../data/nexus.js";
describe("Componente ImagenProducto", () => {
  test("utiliza la fotografía original cuando existe", () => {
    render(<ImagenProducto producto={productos[0]} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/img/teclado.jpg");
  });
  test("ofrece una ilustración accesible para productos sin fotografía original", () => {
    render(<ImagenProducto producto={productos[1]} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(
      /Mouse Gamer: ilustración/,
    );
    expect(screen.getByText("Ilustración")).toBeInTheDocument();
  });
});
