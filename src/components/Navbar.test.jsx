import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { expect, it, vi } from 'vitest';
import Navbar from './Navbar.jsx';

it('navega a Comunidades y llama al callback para cerrar el menú móvil', async () => {
  const user = userEvent.setup();
  const onNavigate = vi.fn();
  render(<MemoryRouter><Navbar usuario={{ nombre: 'Marcial', invitado: true }} onNavigate={onNavigate} abierto /><Routes><Route path="/" element={<h1>Inicio</h1>} /><Route path="/comunidad" element={<h1>Comunidad</h1>} /></Routes></MemoryRouter>);
  await user.click(screen.getByRole('link', { name: /Comunidades/ }));
  expect(screen.getByRole('heading', { name: 'Comunidad' })).toBeInTheDocument();
  expect(onNavigate).toHaveBeenCalledOnce();
});
it('la navegación simple permite cerrar sesión', async () => {
  const salir = vi.fn();
  render(<MemoryRouter><Navbar simple onLogout={salir} /></MemoryRouter>);
  await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(salir).toHaveBeenCalledOnce();
  expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
});
it('busca desde el stream y vuelve a Principal con la consulta', async () => {
  const user = userEvent.setup(), buscar = vi.fn();
  render(<MemoryRouter><Navbar simple stream usuario={{ nombre: 'Ana' }} onSearch={buscar} /><Routes><Route path="/" element={<h1>Stream</h1>} /><Route path="/principal" element={<h1>Canales</h1>} /></Routes></MemoryRouter>);
  await user.type(screen.getByRole('searchbox'), 'Kira{Enter}');
  expect(buscar).toHaveBeenCalledWith('Kira');
  expect(screen.getByRole('heading', { name: 'Canales' })).toBeInTheDocument();
});

