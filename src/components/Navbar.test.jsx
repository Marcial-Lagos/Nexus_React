import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, test, vi } from 'vitest';
import Navbar from './Navbar.jsx';

describe('Componente Navbar', () => {
  test('navega a Comunidades y llama al callback para cerrar el menú móvil', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(<MemoryRouter><Navbar usuario={{ nombre: 'Marcial', invitado: true }} onNavigate={onNavigate} abierto /><Routes><Route path="/" element={<h1>Inicio</h1>} /><Route path="/comunidad" element={<h1>Comunidad</h1>} /></Routes></MemoryRouter>);
    await user.click(screen.getByRole('link', { name: /Comunidades/ }));
    expect(screen.getByRole('heading', { name: 'Comunidad' })).toBeInTheDocument();
    expect(onNavigate).toHaveBeenCalledOnce();
  });
  test('la navegación simple permite cerrar sesión', async () => {
    const user = userEvent.setup();
    const salir = vi.fn();
    render(<MemoryRouter><Navbar simple onLogout={salir} /></MemoryRouter>);
    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }));
    expect(salir).toHaveBeenCalledOnce();
    expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contacto');
  });
  test('busca desde el stream y vuelve a Principal con la consulta', async () => {
    const user = userEvent.setup(), buscar = vi.fn();
    render(<MemoryRouter><Navbar simple stream usuario={{ nombre: 'Ana' }} onSearch={buscar} /><Routes><Route path="/" element={<h1>Stream</h1>} /><Route path="/principal" element={<h1>Canales</h1>} /></Routes></MemoryRouter>);
    await user.type(screen.getByRole('searchbox'), 'Kira{Enter}');
    expect(buscar).toHaveBeenCalledWith('Kira');
    expect(screen.getByRole('heading', { name: 'Canales' })).toBeInTheDocument();
  });



  test('muestra una única transmisión destacada en la navegación lateral', () => {
    render(<MemoryRouter><Navbar usuario={{ nombre: 'Ana' }} /></MemoryRouter>);
    expect(screen.getByText('TRANSMISIÓN DESTACADA')).toBeInTheDocument();
    const streams = screen.getAllByRole('link').filter((enlace) => enlace.getAttribute('href') === '/stream');
    expect(streams).toHaveLength(1);
    expect(streams[0]).toHaveTextContent('lLGNDl');
  });
});
