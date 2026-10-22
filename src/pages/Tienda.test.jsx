import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, test, vi } from 'vitest';
import Tienda from './Tienda.jsx';
describe('Página Tienda', () => {
  test('muestra los seis productos y conserva la selección en el enlace', () => {
    render(<MemoryRouter><Tienda /></MemoryRouter>);
    expect(screen.getAllByRole('article')).toHaveLength(6);
    expect(screen.getByRole('link', { name: 'Comprar Audífonos Gamer' })).toHaveAttribute('href', '/producto?producto=Aud%C3%ADfonos%20Gamer');
    expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument();
  });
  test('calcula el total y permite quitar productos y vaciar', async () => {
    const user = userEvent.setup();
    const quitar = vi.fn(), vaciar = vi.fn();
    render(<MemoryRouter><Tienda carrito={[{ id: 'teclado', nombre: 'Teclado Gamer', precio: 49990, cantidad: 2 }]} onRemove={quitar} onEmpty={vaciar} /></MemoryRouter>);
    expect(screen.getByText('Total: $99.980')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Quitar Teclado Gamer' }));
    expect(quitar).toHaveBeenCalledWith('teclado');
    await user.click(screen.getByRole('button', { name: 'Vaciar carrito' }));
    expect(vaciar).toHaveBeenCalledOnce();
  });


  test('restaura filtros desde URL, combina controles y limpia resultados vacíos', async () => {
    const user = userEvent.setup();
    const productos = [
      { id: 'a', nombre: 'Audio', categoria: 'audio', stock: 2, precio: 100, precioOferta: 50 },
      { id: 'b', nombre: 'Teclado', categoria: 'gaming', stock: 0, precio: 70 },
    ];
    render(<MemoryRouter initialEntries={['/tienda?ofertas=1']}><Tienda productos={productos} categorias={[{ id: 'audio', nombre: 'Audio' }, { id: 'gaming', nombre: 'Gaming' }]} /></MemoryRouter>);
    expect(screen.getByLabelText('Solo ofertas')).toBeChecked();
    expect(screen.getAllByRole('article')).toHaveLength(1);
    expect(screen.getByLabelText('Precio normal')).toHaveTextContent('$100');
    await user.click(screen.getByLabelText('Solo ofertas'));
    await user.selectOptions(screen.getByLabelText('Ordenar por'), 'precio-desc');
    expect(screen.getAllByRole('article')[0]).toHaveTextContent('Teclado');
    await user.selectOptions(screen.getByLabelText('Categoría'), 'gaming');
    await user.click(screen.getByLabelText('Solo disponibles'));
    expect(screen.getByText('No hay productos que coincidan con los filtros.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(screen.getAllByRole('article')).toHaveLength(2);
    await user.type(screen.getByLabelText('Buscar productos'), 'audio');
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
  test('muestra una categoría eliminada de una URL antigua sin mostrar productos ajenos', () => {
    render(<MemoryRouter initialEntries={['/tienda?categoria=eliminada']}><Tienda /></MemoryRouter>);
    expect(screen.getByRole('option', { name: 'Categoría no disponible' })).toBeInTheDocument();
    expect(screen.queryAllByRole('article')).toHaveLength(0);
  });
});
