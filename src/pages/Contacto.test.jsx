import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import Contacto from './Contacto.jsx';
it('valida nombre, comentario y dominio de correo sin simular un envío real', async () => {
  const user = userEvent.setup();
  render(<MemoryRouter><Contacto /></MemoryRouter>);
  await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  expect(screen.getByRole('status')).toHaveTextContent(/Revisa los campos/);
  await user.type(screen.getByLabelText('Nombre'), 'Marcial');
  await user.type(screen.getByLabelText(/Correo electrónico/), 'marcial@otro.com');
  expect(screen.getByText(/Solo se permiten correos/)).toBeInTheDocument();
  await user.clear(screen.getByLabelText(/Correo electrónico/));
  await user.type(screen.getByLabelText('Comentario'), 'Me gusta Nexus');
  await user.click(screen.getByRole('button', { name: 'Enviar mensaje' }));
  expect(screen.getByRole('status')).toHaveTextContent(/no se ha enviado a un servidor/);
  expect(screen.getByLabelText('Nombre')).toHaveValue('');
});

