import { describe, expect, test } from 'vitest';
import { precioVenta, filtrarCatalogo } from './catalogo.js';
import { datosIniciales, guardarEntidad } from './administracion.js';
import { prepararCompra } from './pedidos.js';
const productos = [
  { id: 'a', nombre: 'Audífonos', descripcion: 'Sonido', categoria: 'audio', stock: 2, precio: 100, precioOferta: 40 },
  { id: 'b', nombre: 'Teclado', categoria: 'gaming', stock: 0, precio: 70 },
];
describe('Lógica catalogo', () => {
  test('combina búsqueda sin tildes, categoría, stock y oferta sin alterar catálogo', () => {
    expect(filtrarCatalogo(productos, new URLSearchParams('q=AUDIFONOS&categoria=audio&stock=1&ofertas=1'))).toEqual([productos[0]]);
    expect(filtrarCatalogo(productos, new URLSearchParams('q=sonido'))).toEqual([productos[0]]);
    expect(filtrarCatalogo(productos, new URLSearchParams('categoria=gaming&stock=1'))).toEqual([]);
    expect(filtrarCatalogo(productos, new URLSearchParams('orden=precio-desc'))).toEqual([productos[1], productos[0]]);
    expect(filtrarCatalogo(productos, new URLSearchParams('orden=precio-asc'))).toEqual(productos);
    expect(filtrarCatalogo(productos, new URLSearchParams('orden=nombre'))).toEqual(productos);
    expect(productos[0].id).toBe('a');
  });
  test.each([undefined, null, 0, -1, 100, 101, 1.5, '30'])('ignora un precio de oferta inválido: %s', (precioOferta) => {
    expect(precioVenta({ precio: 100, precioOferta })).toBe(100);
  });
  test('valida ofertas al guardar y permite retirarlas sin perder productos existentes', () => {
    const datos = datosIniciales(), p = datos.productos[0], admin = { rol: 'admin' };
    for (const precioOferta of [0, -1, 1.5, p.precio, p.precio + 1, 'abc']) {
      expect(() => guardarEntidad(datos, 'productos', { ...p, precioOferta }, admin)).toThrow(/precio de oferta/);
    }
    const oferta = guardarEntidad(datos, 'productos', { ...p, precioOferta: '20000' }, admin);
    expect(oferta.productos[0].precioOferta).toBe(20000);
    expect(guardarEntidad(oferta, 'productos', { ...oferta.productos[0], precioOferta: '' }, admin).productos[0].precioOferta).toBeNull();
    expect(datos.productos[0].precioOferta).toBeUndefined();
  });
  test('cobra la oferta y exige aceptar el nuevo precio cuando cambia o se retira', () => {
    const datos = { productos }, carrito = [{ id: 'a', cantidad: 2, precio: 40 }];
    expect(prepararCompra(datos, carrito, 'retiro').total).toBe(80);
    expect(() => prepararCompra({ productos: [{ ...productos[0], precioOferta: null }] }, carrito, 'retiro')).toThrow(/precio.*cambió/);
    expect(() => prepararCompra(datos, [{ ...carrito[0], precio: 100 }], 'retiro')).toThrow(/precio.*cambió/);
  });
});
