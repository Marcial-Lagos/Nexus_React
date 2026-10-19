import { expect, it, vi } from 'vitest';
import { guardarSesion, leerSesion } from './sesion.js';

it('descarta datos corruptos o sin un nombre válido', () => {
  sessionStorage.setItem('nexus.sesion', '{mal');
  expect(leerSesion()).toBeNull();
  sessionStorage.setItem('nexus.sesion', JSON.stringify({ nombre: 123 }));
  expect(leerSesion()).toBeNull();
});
it('restaura datos públicos y usa valores de respaldo para los campos ausentes', () => {
  sessionStorage.setItem('nexus.sesion', JSON.stringify({ nombre: 'Marcial' }));
  expect(leerSesion()).toEqual(expect.objectContaining({ nombre: 'Marcial', correo: '', invitado: false, biografia: expect.any(String) }));
});
it('guarda solo campos permitidos y elimina la sesión al salir', () => {
  guardarSesion({ nombre: 'Ana', correo: 'ana@gmail.com', invitado: false, biografia: 'React', contrasena: 'no-debe-guardarse' });
  expect(sessionStorage.getItem('nexus.sesion')).not.toContain('no-debe-guardarse');
  expect(leerSesion().nombre).toBe('Ana');
  guardarSesion(null);
  expect(leerSesion()).toBeNull();
});
it('tolera el almacenamiento bloqueado por el navegador', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('Bloqueado'); });
  expect(leerSesion()).toBeNull();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Bloqueado'); });
  expect(() => guardarSesion({ nombre: 'Ana' })).not.toThrow();
});
