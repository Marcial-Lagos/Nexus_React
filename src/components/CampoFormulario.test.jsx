import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, it, vi } from 'vitest';
import CampoFormulario from './CampoFormulario.jsx';
it('relaciona etiqueta, ayuda y error con el campo y notifica cambios', async () => {
  const cambiar = vi.fn();
  render(<CampoFormulario id="nombre" label="Nombre" error="Es obligatorio" ayuda="Tu nombre" onChange={cambiar} />);
  const campo = screen.getByLabelText('Nombre');
  expect(campo).toHaveAccessibleDescription('Es obligatorio Tu nombre');
  expect(campo).toHaveAttribute('aria-invalid', 'true');
  await userEvent.type(campo, 'Ana');
  expect(cambiar).toHaveBeenCalledTimes(3);
});
it('renderiza un textarea cuando se solicita', () => {
  render(<CampoFormulario id="bio" label="Biografía" multilinea />);
  expect(screen.getByLabelText('Biografía').tagName).toBe('TEXTAREA');
});

