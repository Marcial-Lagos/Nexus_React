import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import Modal from './Modal.jsx';
it('abre el diálogo, muestra el contenido y permite cerrar o cancelar', async () => {
  const cerrar = vi.fn();
  render(<Modal titulo="Editar" onClose={cerrar}><p>Contenido del diálogo</p></Modal>);
  const dialogo = screen.getByRole('dialog', { name: 'Editar' });
  expect(dialogo).toHaveAttribute('open');
  expect(screen.getByText('Contenido del diálogo')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar ventana' }));
  fireEvent(dialogo, new Event('cancel', { bubbles: true }));
  expect(cerrar).toHaveBeenCalledTimes(2);
});

