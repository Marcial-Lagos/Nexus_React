const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const nombreValido = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]+$/;
export function validarLogin(datos) {
  return {
    correo: !datos.correo.trim()
      ? "Ingresa tu correo electrónico."
      : !correoValido.test(datos.correo.trim())
        ? "Escribe un correo válido, por ejemplo nombre@correo.cl."
        : "",
    contrasena: !datos.contrasena
      ? "Ingresa tu contraseña."
      : datos.contrasena.length < 4
        ? "La contraseña debe tener al menos 4 caracteres."
        : "",
  };
}
export function validarNacimiento(valor, hoy = new Date()) {
  if (!valor) return "Selecciona tu fecha de nacimiento.";
  const nacimiento = new Date(`${valor}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime()) || nacimiento.getFullYear() < 1900)
    return "La fecha de nacimiento no es válida.";
  if (nacimiento > hoy) return "La fecha de nacimiento no puede ser futura.";
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  if (
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() < nacimiento.getDate())
  )
    edad--;
  return edad < 13 ? "Debes tener mínimo 13 años para registrarte." : "";
}
function validarNombre(valor, etiqueta) {
  if (!valor.trim()) return `${etiqueta} es obligatorio.`;
  if (!nombreValido.test(valor.trim()))
    return `${etiqueta} solo puede contener letras, espacios, apóstrofes o guiones.`;
  if ((valor.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length < 2)
    return `${etiqueta} debe contener como mínimo 2 letras.`;
  return valor.trim().length > 30
    ? `${etiqueta} no puede superar los 30 caracteres.`
    : "";
}
export function validarRegistro(datos) {
  return {
    nombre: validarNombre(datos.nombre, "El nombre"),
    apellido: validarNombre(datos.apellido, "El apellido"),
    usuario: !datos.usuario.trim()
      ? "El nombre de usuario es obligatorio."
      : !/^[A-Za-z0-9_]{4,16}$/.test(datos.usuario.trim())
        ? "Usa entre 4 y 16 caracteres: letras, números o guion bajo."
        : "",
    correo: !datos.correo.trim()
      ? "El correo electrónico es obligatorio."
      : !correoValido.test(datos.correo.trim())
        ? "Escribe un correo válido, por ejemplo nombre@correo.cl."
        : "",
    nacimiento: validarNacimiento(datos.nacimiento),
    contrasena: !datos.contrasena
      ? "La contraseña es obligatoria."
      : !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/.test(
            datos.contrasena,
          )
        ? "Debe tener 8 caracteres o más e incluir mayúscula, minúscula, número y carácter especial."
        : "",
    confirmacion: !datos.confirmacion
      ? "Repite tu contraseña."
      : datos.confirmacion !== datos.contrasena
        ? "Las contraseñas no coinciden."
        : "",
    terminos: datos.terminos ? "" : "Debes aceptar los términos y condiciones.",
  };
}
export function validarContacto(datos) {
  const correo = datos.correo.trim();
  return {
    nombre: !datos.nombre.trim()
      ? "El nombre es obligatorio"
      : datos.nombre.trim().length > 100
        ? "El nombre no puede superar los 100 caracteres"
        : "",
    correo:
      correo.length > 100
        ? "El correo no puede superar los 100 caracteres"
        : correo &&
            (!correoValido.test(correo) ||
              !/@(?:duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i.test(correo))
          ? "Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com"
          : "",
    comentario: !datos.comentario.trim()
      ? "El comentario es obligatorio"
      : datos.comentario.trim().length > 500
        ? "El comentario no puede superar los 500 caracteres"
        : "",
  };
}
export const sinErrores = (errores) =>
  Object.values(errores).every((error) => !error);
