import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, test, vi } from 'vitest';
import Login from './Login.jsx';
describe('Página Login', () => {
  test('gira la tarjeta y vuelve a mostrar el acceso', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Login /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Registrarte' }));
    expect(screen.getByRole('form', { name: 'Registro de usuarios' })).not.toHaveAttribute('inert');
    expect(screen.queryByRole('form', { name: 'Inicio de sesión' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Inicia sesión' }));
    expect(screen.getByRole('form', { name: 'Inicio de sesión' })).toBeInTheDocument();
  });
  test('registra, completa el correo del login e inicia con el nombre elegido', async () => {
    const user = userEvent.setup(), login = vi.fn();
    render(<MemoryRouter><Login onLogin={login} /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Registrarte' }));
    const registro = within(screen.getByRole('form', { name: 'Registro de usuarios' }));
    for (const [campo, valor] of [['Nombre', 'Ana'], ['Apellido', 'Lagos'], ['Nombre de usuario', 'NexusAna'], ['Correo electrónico', 'ana@gmail.com'], ['Contraseña', 'Clave123!'], ['Confirmar contraseña', 'Clave123!']]) {
      fireEvent.change(registro.getByLabelText(campo, { exact: true }), { target: { value: valor } });
    }
    fireEvent.change(registro.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-02-15' } });
    await user.click(registro.getByRole('checkbox'));
    await user.click(registro.getByRole('button', { name: 'Crear cuenta' }));
    const acceso = within(screen.getByRole('form', { name: 'Inicio de sesión' }));
    expect(acceso.getByLabelText('Correo electrónico')).toHaveValue('ana@gmail.com');
    expect(acceso.getByRole('status')).toHaveTextContent(/Cuenta validada/);
    await user.type(acceso.getByLabelText('Contraseña'), 'demo');
    await user.click(acceso.getByRole('button', { name: 'Entrar a Nexus' }));
    expect(login).toHaveBeenCalledWith({ correo: 'ana@gmail.com', nombre: 'NexusAna' });
  });
});
