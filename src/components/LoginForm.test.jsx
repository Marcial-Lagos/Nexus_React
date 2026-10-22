import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';
import LoginForm from './LoginForm.jsx';
it('valida campos vacíos, correo y longitud de contraseña antes de llamar onLogin', async () => {
  const user = userEvent.setup();
  const login = vi.fn();
  render(<MemoryRouter><LoginForm onLogin={login} /></MemoryRouter>);
  await user.click(screen.getByRole('button', { name: 'Entrar a Nexus' }));
  expect(screen.getByText('Ingresa tu correo electrónico.')).toBeInTheDocument();
  expect(login).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText('Correo electrónico'), 'mal');
  await user.type(screen.getByLabelText('Contraseña'), '123');
  expect(screen.getByText(/Escribe un correo válido/)).toBeInTheDocument();
  expect(screen.getByText(/al menos 4/)).toBeInTheDocument();
  await user.clear(screen.getByLabelText('Correo electrónico'));
  await user.type(screen.getByLabelText('Correo electrónico'), 'ana@gmail.com');
  await user.type(screen.getByLabelText('Contraseña'), '4');
  await user.click(screen.getByRole('button', { name: 'Entrar a Nexus' }));
  expect(login).toHaveBeenCalledWith({ correo: 'ana@gmail.com' });
});
it('ejecuta los callbacks de invitado y registro y explica la recuperación', async () => {
  const invitado = vi.fn(), registro = vi.fn();
  render(<MemoryRouter><LoginForm onGuest={invitado} onShowRegistro={registro} aviso="Registro listo" /></MemoryRouter>);
  await userEvent.click(screen.getByRole('button', { name: 'Entrar como invitado' }));
  await userEvent.click(screen.getByRole('button', { name: 'Registrarte' }));
  await userEvent.click(screen.getByRole('button', { name: /Olvidaste/ }));
  expect(invitado).toHaveBeenCalledOnce();
  expect(registro).toHaveBeenCalledOnce();
  expect(within(screen.getByRole('form')).getByText(/No hay recuperación/)).toBeInTheDocument();
});


