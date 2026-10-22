import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';
import BarraServidores from './BarraServidores.jsx';
describe('Componente BarraServidores', () => {
  test('ofrece un solo acceso por destino y marca la comunidad activa en sus canales', () => {
    render(<MemoryRouter initialEntries={['/comunidad?canal=musica']}><BarraServidores cantidadCarrito={3} /></MemoryRouter>);
    const barra = within(screen.getByLabelText('Accesos rápidos'));
    const enlaces = barra.getAllByRole('link');
    expect(enlaces).toHaveLength(3);
    expect(new Set(enlaces.map((enlace) => enlace.getAttribute('href'))).size).toBe(3);
    expect(barra.getByRole('link', { name: 'Comunidades' })).toHaveAttribute('aria-current', 'page');
    expect(barra.getByRole('link', { name: 'Tienda y carrito, 3 productos' })).toHaveTextContent('3');
  });
});
