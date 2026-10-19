import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import Tienda from './Tienda.jsx';
it('muestra los seis productos y conserva la selección en el enlace', () => {
  render(<MemoryRouter><Tienda /></MemoryRouter>);
  expect(screen.getAllByRole('article')).toHaveLength(6);
  expect(screen.getByRole('link', { name: 'Comprar Audífonos Gamer' })).toHaveAttribute('href', '/producto?producto=Aud%C3%ADfonos%20Gamer');
  expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
});
it('calcula el total y permite quitar productos y vaciar', async () => {
  const quitar = vi.fn(), vaciar = vi.fn();
  render(<MemoryRouter><Tienda carrito={[{ id: 'teclado', nombre: 'Teclado Gamer', precio: 49990, cantidad: 2 }]} onRemove={quitar} onEmpty={vaciar} /></MemoryRouter>);
  expect(screen.getByText('Total: $99.980')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Quitar Teclado Gamer' }));
  expect(quitar).toHaveBeenCalledWith('teclado');
  await userEvent.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
  expect(vaciar).toHaveBeenCalledOnce();
});

