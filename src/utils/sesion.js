import { biografiaOriginal } from '../data/nexus.js';
// Solo datos públicos de una sesión de demostración. Nunca se reciben contraseñas.
export function leerSesion() {
  try {
    const datos = JSON.parse(sessionStorage.getItem('nexus.sesion'));
    return datos && typeof datos.nombre === 'string' && datos.nombre.trim()
      ? { id: typeof datos.id === 'string' ? datos.id : undefined, nombre: datos.nombre, correo: typeof datos.correo === 'string' ? datos.correo : '', invitado: Boolean(datos.invitado), rol: datos.rol === 'admin' && datos.correo === 'admin@nexus.cl' ? 'admin' : 'cliente', biografia: typeof datos.biografia === 'string' ? datos.biografia : biografiaOriginal }
      : null;
  } catch { return null; }
}
export function guardarSesion(usuario) {
  try {
    if (!usuario) sessionStorage.removeItem('nexus.sesion');
    else sessionStorage.setItem('nexus.sesion', JSON.stringify({ id: usuario.id, rol: usuario.rol === 'admin' ? 'admin' : 'cliente', nombre: usuario.nombre, correo: usuario.correo, invitado: usuario.invitado, biografia: usuario.biografia }));
  } catch { /* Con almacenamiento bloqueado se mantiene la sesión en memoria. */ }
}

