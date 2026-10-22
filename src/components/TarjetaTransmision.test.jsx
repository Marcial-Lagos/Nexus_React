import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, test } from "vitest";
import TarjetaTransmision from "./TarjetaTransmision.jsx";
import { transmisiones } from "../data/nexus.js";
describe("Componente TarjetaTransmision", () => {
  test.each(transmisiones)(
    "muestra el canal $nombre recibido por props",
    (canal) => {
      render(
        <MemoryRouter>
          <TarjetaTransmision canal={canal} />
        </MemoryRouter>,
      );
      expect(
        screen.getByRole("heading", { name: canal.titulo }),
      ).toBeInTheDocument();
      expect(screen.getByRole("link")).toHaveAttribute("href", "/stream");
      expect(
        screen.getByText(canal.espectadores + " espectadores"),
      ).toBeInTheDocument();
    },
  );
});
