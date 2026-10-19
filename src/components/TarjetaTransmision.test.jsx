import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import TarjetaTransmision from './TarjetaTransmision.jsx';
import { transmisiones } from '../data/nexus.js';
it.each(transmisiones)('muestra el canal $nombre recibido por props', (canal) => {
  render(<MemoryRouter><TarjetaTransmision canal={canal} /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: canal.titulo })).toBeInTheDocument();
  expect(screen.getByRole('link')).toHaveAttribute('href', '/stream');
  expect(screen.getByText(canal.espectadores + ' espectadores')).toBeInTheDocument();
});

