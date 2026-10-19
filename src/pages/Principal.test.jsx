import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, it, vi } from 'vitest';
import Principal from './Principal.jsx';
it('filtra por la búsqueda y permite restaurar los canales', async () => {
  const limpiar = vi.fn();
  const { rerender } = render(<MemoryRouter><Principal busqueda="kira" onClearSearch={limpiar} /></MemoryRouter>);
  expect(screen.getByRole('heading', { name: /Ranked/ })).toBeInTheDocument();
  expect(screen.queryByRole('heading', { name: /Música y charla/ })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Ver todos' }));
  expect(limpiar).toHaveBeenCalledOnce();
  rerender(<MemoryRouter><Principal busqueda="no-existe" /></MemoryRouter>);
  expect(screen.getByRole('status')).toHaveTextContent(/No existen canales/);
});

