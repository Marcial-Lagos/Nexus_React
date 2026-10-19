import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import BarraServidores from './BarraServidores.jsx';
it('muestra enlaces a las comunidades y la cantidad compartida del carrito', () => {
  render(<MemoryRouter><BarraServidores cantidadCarrito={3} /></MemoryRouter>);
  expect(screen.getByRole('link', { name: 'Código' })).toHaveAttribute('href', '/comunidad?canal=programación');
  expect(screen.getByRole('link', { name: 'Tienda y carrito, 3 productos' })).toHaveTextContent('3');
});

