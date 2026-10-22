import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import Modal from './Modal.jsx';

describe('Componente Modal', () => {
  test('abre el diálogo con el título y contenido recibidos', () => {
    render(<Modal titulo="Editar" onClose={vi.fn()}><p>Contenido del diálogo</p></Modal>);

    expect(screen.getByRole('dialog', { name: 'Editar' })).toHaveAttribute('open');
    expect(screen.getByText('Contenido del diálogo')).toBeInTheDocument();
  });

  test('notifica el cierre al presionar el botón', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Modal titulo="Editar" onClose={onClose}><p>Contenido</p></Modal>);

    await user.click(screen.getByRole('button', { name: 'Cerrar ventana' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  test('notifica la cancelación nativa del diálogo', () => {
    const onClose = vi.fn();
    render(<Modal titulo="Editar" onClose={onClose}><p>Contenido</p></Modal>);

    // jsdom no reproduce la cancelación nativa de <dialog> al pulsar Escape.
    fireEvent(screen.getByRole('dialog', { name: 'Editar' }), new Event('cancel', { bubbles: true }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
