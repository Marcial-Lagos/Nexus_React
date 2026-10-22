import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import AdminLogin from './AdminLogin.jsx';
it('explica el modo demo, ofrece credenciales y permite volver al login normal', async () => {
  render(<MemoryRouter><AdminLogin onLogin={vi.fn()} /></MemoryRouter>);
  await userEvent.click(screen.getByText('Credenciales de demostración'));
  expect(screen.getByText(/Correo: admin@nexus.cl/)).toBeVisible();
  expect(screen.getByRole('link', { name: 'Volver al acceso de usuarios' })).toHaveAttribute('href', '/login');
  expect(screen.getByText(/no protege datos reales/)).toBeInTheDocument();
});
