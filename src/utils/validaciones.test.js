import { describe, expect, it } from 'vitest';
import { sinErrores, validarContacto, validarNacimiento, validarRegistro } from './validaciones.js';

const registro = { nombre: 'Ana', apellido: 'Lagos', usuario: 'Ana_dev', correo: 'ana@gmail.com', nacimiento: '2000-10-18', contrasena: 'Clave123!', confirmacion: 'Clave123!', terminos: true };
describe('Reglas originales de los formularios', () => {
  it.each([
    ['', /Selecciona/], ['1800-01-01', /no es válida/], ['incorrecta', /no es válida/],
    ['2030-01-01', /futura/], ['2014-01-01', /mínimo 13/], ['2013-10-19', /mínimo 13/],
    ['2013-11-01', /mínimo 13/],
  ])('rechaza fecha %s con fecha actual fija', (fecha, error) => {
    expect(validarNacimiento(fecha, new Date(2026, 9, 18))).toMatch(error);
  });
  it('acepta exactamente trece años y fechas adultas', () => {
    expect(validarNacimiento('2013-10-18', new Date(2026, 9, 18))).toBe('');
    expect(validarNacimiento('2000-01-01', new Date(2026, 9, 18))).toBe('');
  });
  it.each([
    ['nombre', 'Ana1', /solo puede/], ['nombre', 'A-', /mínimo 2/], ['nombre', 'a'.repeat(31), /30 caracteres/],
    ['apellido', '123', /solo puede/], ['usuario', 'a*', /4 y 16/], ['correo', 'ana@', /correo válido/],
    ['contrasena', 'abcdefg', /mayúscula/], ['confirmacion', 'Otra123!', /no coinciden/],
  ])('valida %s con valor inválido', (campo, valor, mensaje) => {
    expect(validarRegistro({ ...registro, [campo]: valor })[campo]).toMatch(mensaje);
  });
  it('acepta nombres con tildes, apóstrofes y guiones', () => {
    expect(sinErrores(validarRegistro({ ...registro, nombre: 'María-José', apellido: "O'Neill" }))).toBe(true);
  });
  it.each(['ana@duoc.cl', 'ana@profesor.duoc.cl', 'ana@gmail.com', '', 'Ana@GMAIL.COM'])('acepta correo de contacto %s', (correo) => {
    expect(sinErrores(validarContacto({ nombre: 'Ana', correo, comentario: 'Hola' }))).toBe(true);
  });
  it('aplica límites de longitud en nombre, correo y comentario', () => {
    const errores = validarContacto({ nombre: 'a'.repeat(101), correo: 'a'.repeat(101), comentario: 'a'.repeat(501) });
    expect(errores.nombre).toMatch(/100 caracteres/);
    expect(errores.correo).toMatch(/100 caracteres/);
    expect(errores.comentario).toMatch(/500 caracteres/);
  });
});
