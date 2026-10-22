import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { expect, it } from 'vitest';
import App from '../App.jsx';
import { ADMIN_CORREO, ADMIN_CLAVE, CLAVE_DATOS } from '../data/administracion.js';
function abrir(ruta = '/admin') { return render(<MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>); }
function sesionAdmin() { sessionStorage.setItem('nexus.sesion', JSON.stringify({ nombre: 'Administrador', correo: ADMIN_CORREO, rol: 'admin' })); }
it('bloquea acceso directo de invitados y clientes', () => {
  const { unmount } = abrir('/admin/productos');
  expect(screen.getByRole('heading', { name: 'Acceso administrador' })).toBeInTheDocument();
  unmount();
  sessionStorage.setItem('nexus.sesion', JSON.stringify({ nombre: 'Ana', correo: 'ana@gmail.com', rol: 'cliente' }));
  abrir('/admin/usuarios');
  expect(screen.getByRole('heading', { name: 'Acceso administrador' })).toBeInTheDocument();
});
it('rechaza credenciales incorrectas, permite admin y cierra su sesión', async () => {
  const user = userEvent.setup(); abrir('/admin/login');
  await user.type(screen.getByLabelText('Correo administrador'), ADMIN_CORREO);
  await user.type(screen.getByLabelText('Contraseña administrador'), 'incorrecta');
  await user.click(screen.getByRole('button', { name: 'Ingresar al panel' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/incorrectas/);
  await user.clear(screen.getByLabelText('Contraseña administrador'));
  await user.type(screen.getByLabelText('Contraseña administrador'), ADMIN_CLAVE);
  await user.click(screen.getByRole('button', { name: 'Ingresar al panel' }));
  expect(screen.getByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument();
  expect(sessionStorage.getItem('nexus.sesion')).not.toContain(ADMIN_CLAVE);
  await user.click(screen.getByRole('button', { name: 'Cerrar sesión de administrador' }));
  expect(sessionStorage.getItem('nexus.sesion')).toBeNull();
  expect(screen.getByRole('heading', { name: 'Acceso administrador' })).toBeInTheDocument();
});
it('crea un producto persistente y lo muestra en la tienda y su detalle', async () => {
  const user = userEvent.setup(); sesionAdmin(); abrir('/admin/productos');
  await user.click(screen.getByRole('button', { name: 'Crear registro' }));
  await user.type(screen.getByLabelText('Nombre'), 'Monitor Nexus');
  await user.type(screen.getByLabelText('Precio CLP'), '125000');
  await user.type(screen.getByLabelText('Stock', { exact: true }), '4');
  await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
  expect(JSON.parse(localStorage.getItem(CLAVE_DATOS)).productos.at(-1).nombre).toBe('Monitor Nexus');
  await user.click(screen.getByRole('link', { name: 'Ver tienda' }));
  await user.click(screen.getByRole('link', { name: 'Comprar Monitor Nexus' }));
  expect(screen.getByRole('heading', { name: 'Monitor Nexus' })).toBeInTheDocument();
  expect(screen.getByText('$125.000')).toBeInTheDocument();
});
it('edita, cancela y elimina registros con confirmación, y protege categorías usadas', async () => {
  const user = userEvent.setup(); sesionAdmin(); abrir('/admin/categorias');
  await user.click(screen.getByRole('button', { name: 'Eliminar Gaming' }));
  await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/tiene productos/);
  await user.click(screen.getByRole('button', { name: 'Crear registro' }));
  await user.type(screen.getByLabelText('Nombre'), 'Accesorios');
  await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
  await user.click(screen.getByRole('button', { name: 'Editar Accesorios' }));
  await user.clear(screen.getByLabelText('Nombre'));
  await user.type(screen.getByLabelText('Nombre'), 'Tecnología');
  await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
  await user.click(screen.getByRole('button', { name: 'Eliminar Tecnología' }));
  await user.click(screen.getByRole('button', { name: 'Conservar registro' }));
  expect(screen.getByRole('button', { name: 'Editar Tecnología' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Eliminar Tecnología' }));
  await user.click(screen.getByRole('button', { name: 'Confirmar eliminación' }));
  expect(screen.queryByRole('button', { name: 'Editar Tecnología' })).not.toBeInTheDocument();
});
it('ofrece reportes de inventario, órdenes vacías y perfil sin simular ventas', async () => {
  const user = userEvent.setup(); sesionAdmin(); abrir();
  await user.click(within(screen.getByRole('navigation', { name: 'Administración' })).getByRole('link', { name: 'Reportes' }));
  expect(screen.getByRole('heading', { name: 'Reporte de inventario' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Órdenes' }));
  expect(screen.getByText(/No hay órdenes registradas/)).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Perfil' }));
  expect(screen.getByRole('heading', { name: 'Perfil administrador' })).toBeInTheDocument();
});
it('conserva catálogo y rol al recargar la aplicación', async () => {
  const user = userEvent.setup(); sesionAdmin();
  const vista = abrir('/admin/productos');
  await user.click(screen.getByRole('button', { name: 'Editar Teclado Gamer' }));
  await user.clear(screen.getByLabelText('Precio CLP'));
  await user.type(screen.getByLabelText('Precio CLP'), '1000');
  await user.click(screen.getByRole('button', { name: 'Guardar registro' }));
  vista.unmount();
  abrir('/admin/productos');
  expect(screen.getByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument();
  expect(screen.getByRole('row', { name: /Teclado Gamer/ })).toHaveTextContent('1000');
});
