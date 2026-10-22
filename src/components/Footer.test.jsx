import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import Footer from "./Footer.jsx";
describe("Componente Footer", () => {
  test("muestra canales externos y navegación interna de contacto", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/__lgnd___/",
    );
    expect(screen.getByRole("link", { name: "Contactar" })).toHaveAttribute(
      "href",
      "/contacto",
    );
  });
  test("conserva el pie original del acceso", () => {
    render(<Footer compacto />);
    expect(screen.getByText(/© 2026 NEXUS/)).toBeInTheDocument();
  });
});
