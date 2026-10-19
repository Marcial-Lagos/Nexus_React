import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import RegistroForm from './RegistroForm.jsx';

it('muestra todas las validaciones al enviar vacío', async () => {
  const registrar = vi.fn();
  render(<RegistroForm activo onRegistered={registrar} />);
  await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/Revisa los campos/);
  expect(screen.getByText('El nombre es obligatorio.')).toBeInTheDocument();
  expect(screen.getByText('Debes aceptar los términos y condiciones.')).toBeInTheDocument();
  expect(registrar).not.toHaveBeenCalled();
});
it('valida confirmación y entrega solo correo y usuario, sin contraseñas', async () => {
  const user = userEvent.setup(), registrar = vi.fn();
  render(<RegistroForm activo onRegistered={registrar} />);
  for (const [etiqueta, valor] of [['Nombre', 'Ana'], ['Apellido', 'Lagos'], ['Nombre de usuario', 'Ana_dev'], ['Correo electrónico', 'ana@gmail.com'], ['Contraseña', 'Clave123!'], ['Confirmar contraseña', 'Diferente1!']]) {
    await user.type(screen.getByLabelText(etiqueta, { exact: true }), valor);
  }
  fireEvent.change(screen.getByLabelText('Fecha de nacimiento'), { target: { value: '2000-05-15' } });
  expect(screen.getByText('Las contraseñas no coinciden.')).toBeInTheDocument();
  await user.clear(screen.getByLabelText('Confirmar contraseña'));
  await user.type(screen.getByLabelText('Confirmar contraseña'), 'Clave123!');
  await user.click(screen.getByRole('checkbox'));
  await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
  expect(registrar).toHaveBeenCalledWith({ correo: 'ana@gmail.com', usuario: 'Ana_dev' });
  expect(screen.getByLabelText('Contraseña', { exact: true })).toHaveValue('');
});
it('permite volver al login', async () => {
  const volver = vi.fn();
  render(<RegistroForm activo onShowLogin={volver} />);
  await userEvent.click(screen.getByRole('button', { name: 'Inicia sesión' }));
  expect(volver).toHaveBeenCalledOnce();
});

