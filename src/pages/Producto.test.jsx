import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, test, vi } from 'vitest';
import Producto from './Producto.jsx';
describe('Página Producto', () => {
  test('selecciona el producto de la URL, cambia vista y cantidad y añade al carrito', async () => {
    const user = userEvent.setup(), agregar = vi.fn();
    render(<MemoryRouter initialEntries={['/producto?producto=Mouse%20Gamer']}><Producto onAdd={agregar} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Mouse Gamer' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Disminuir cantidad' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));
    await user.click(screen.getByRole('button', { name: 'Disminuir cantidad' }));
    await user.click(screen.getByRole('button', { name: 'Aumentar cantidad' }));
    await user.click(screen.getByRole('button', { name: 'Vista 2' }));
    expect(screen.getByRole('button', { name: 'Vista 2' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: /Agregar al carrito/ }));
    expect(agregar).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Mouse Gamer', precio: 59990 }), 2);
    expect(screen.getByText(/agregado al carrito de demostración/)).toBeInTheDocument();
  });
  test('muestra el teclado predeterminado y sus características', () => {
    render(<MemoryRouter><Producto /></MemoryRouter>);
    expect(screen.getByText('Nexus KX-400')).toBeInTheDocument();
    expect(screen.getByText(/Switches mecánicos/)).toBeInTheDocument();
  });
  test('resuelve un identificador de producto y permite volver si no existe', () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/producto?producto=audifonos']}><Producto /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Audífonos Gamer' })).toBeInTheDocument();
    unmount();
    render(<MemoryRouter initialEntries={['/producto?producto=no-existe']}><Producto /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Producto no encontrado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver a la tienda' })).toHaveAttribute('href', '/tienda');
  });


  test('bloquea agregar un producto sin stock', () => {
    render(<MemoryRouter><Producto productos={[{ id: 'agotado', nombre: 'Agotado', precio: 1000, stock: 0, icono: 'keyboard' }]} onAdd={vi.fn()} /></MemoryRouter>);
    expect(screen.getByText('Sin stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Agregar al carrito/ })).toBeDisabled();
  });
  test('muestra un error de stock al rechazar el agregado y no anuncia éxito', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Producto onAdd={() => { throw new Error('No hay stock suficiente'); }} /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: /Agregar al carrito/ }));
    expect(screen.getByRole('alert')).toHaveTextContent('No hay stock suficiente');
    expect(screen.queryByText(/agregado al carrito de demostración/)).not.toBeInTheDocument();
  });
});
