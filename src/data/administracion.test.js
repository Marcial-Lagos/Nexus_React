import { describe, expect, test, vi } from 'vitest';
import { ADMIN_CORREO, ADMIN_CLAVE, CLAVE_DATOS, autenticarAdmin, datosIniciales, leerAdministracion, guardarAdministracion, guardarEntidad, eliminarEntidad } from './administracion.js';
const admin = { rol: 'admin' };
describe('Lógica administracion', () => {
  test('autentica solo la credencial demo correcta', () => {
    expect(autenticarAdmin(ADMIN_CORREO, 'incorrecta')).toBeNull();
    expect(autenticarAdmin('otro@gmail.com', ADMIN_CLAVE)).toBeNull();
    expect(autenticarAdmin(' ADMIN@NEXUS.CL ', ADMIN_CLAVE)).toEqual(expect.objectContaining({ rol: 'admin' }));
  });
  test('persiste CRUD sin alterar los datos originales', () => {
    const original = datosIniciales();
    const creado = guardarEntidad(original, 'productos', { nombre: 'Monitor', precio: '125000', stock: '4', categoria: 'gaming' }, admin);
    const monitor = creado.productos.at(-1);
    expect(original.productos).toHaveLength(6);
    const editado = guardarEntidad(creado, 'productos', { ...monitor, stock: '8' }, admin);
    expect(editado.productos.at(-1).stock).toBe(8);
    expect(guardarAdministracion(editado)).toBe(true);
    expect(leerAdministracion()).toEqual(editado);
    expect(eliminarEntidad(editado, 'productos', monitor.id, admin).productos).toHaveLength(6);
  });
  test('bloquea escrituras sin rol admin y eliminación de categorías utilizadas', () => {
    const datos = datosIniciales();
    expect(() => guardarEntidad(datos, 'categorias', { nombre: 'Otra' }, { rol: 'cliente' })).toThrow(/reservado/);
    expect(() => eliminarEntidad(datos, 'productos', 'teclado', null)).toThrow(/reservado/);
    expect(() => eliminarEntidad(datos, 'categorias', 'gaming', admin)).toThrow(/tiene productos/);
  });
  test.each([{ precio: -1, stock: 2 }, { precio: '', stock: 2 }, { precio: 100, stock: -1 }, { precio: 100, stock: 1.5 }, { precio: 100, stock: '' }])('rechaza precio o stock inválidos: %j', (valores) => {
    expect(() => guardarEntidad(datosIniciales(), 'productos', { nombre: 'Nuevo', categoria: 'gaming', ...valores }, admin)).toThrow();
  });
  test('valida categorías, nombres duplicados y correos reservados', () => {
    const datos = datosIniciales();
    expect(() => guardarEntidad(datos, 'categorias', { nombre: 'Gaming' }, admin)).toThrow(/Ya existe/);
    expect(() => guardarEntidad(datos, 'productos', { nombre: 'Nuevo', precio: 100, stock: 2, categoria: 'ausente' }, admin)).toThrow(/categoría válida/);
    expect(() => guardarEntidad(datos, 'usuarios', { nombre: 'Admin', correo: ADMIN_CORREO }, admin)).toThrow(/reservado/);
    expect(() => guardarEntidad(datos, 'usuarios', { nombre: 'Ana', correo: 'mal' }, admin)).toThrow(/correo válido/);
    const actualizado = guardarEntidad(datos, 'usuarios', { nombre: 'Ana', correo: 'ana@gmail.com', rol: 'admin' }, admin);
    expect(actualizado.usuarios[0].rol).toBe('cliente');
  });
  test('tolera datos corruptos y almacenamiento bloqueado', () => {
    localStorage.setItem(CLAVE_DATOS, '{mal');
    expect(leerAdministracion()).toEqual(datosIniciales());
    localStorage.setItem(CLAVE_DATOS, JSON.stringify({ productos: [] }));
    expect(leerAdministracion()).toEqual(datosIniciales());
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Bloqueado'); });
    expect(guardarAdministracion(datosIniciales())).toBe(false);
  });
});
