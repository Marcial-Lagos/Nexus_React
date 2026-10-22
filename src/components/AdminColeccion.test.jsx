import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import AdminColeccion from './AdminColeccion.jsx';
import { datosIniciales } from '../data/administracion.js';
describe('Componente AdminColeccion', () => {
  test('filtra clientes, valida errores y permite cancelar una edición', async () => {
    const user = userEvent.setup(), guardar = vi.fn(() => { throw new Error('Correo duplicado'); });
    const datos = { ...datosIniciales(), usuarios: [{ id: 'ana', nombre: 'Ana', correo: 'ana@gmail.com' }] };
    render(<AdminColeccion tipo="usuarios" datos={datos} onSave={guardar} />);
    await user.type(screen.getByLabelText('Buscar registros'), 'inexistente');
    expect(screen.getByText('No hay registros para mostrar.')).toBeInTheDocument();
    await user.clear(screen.getByLabelText('Buscar registros'));
    await user.click(screen.getByRole('button', { name: 'Editar Ana' }));
    await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Correo duplicado');
    await user.click(screen.getByRole('button', { name: 'Cancelar edición' }));
    expect(screen.queryByRole('form')).not.toBeInTheDocument();
  });
  test('envía categoría y descripción del producto mediante props', async () => {
    const user = userEvent.setup(), guardar = vi.fn();
    const datos = datosIniciales(); datos.categorias.push({ id: 'otra', nombre: 'Otra' });
    render(<AdminColeccion tipo="productos" datos={datos} onSave={guardar} />);
    await user.click(screen.getByRole('button', { name: 'Editar Teclado Gamer' }));
    await user.selectOptions(screen.getByLabelText('Categoría'), 'otra');
    await user.clear(screen.getByLabelText('Descripción'));
    await user.type(screen.getByLabelText('Descripción'), 'Descripción actualizada');
    await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
    expect(guardar).toHaveBeenCalledWith('productos', expect.objectContaining({ categoria: 'otra', descripcion: 'Descripción actualizada' }));
  });
});
