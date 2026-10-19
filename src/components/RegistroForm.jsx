import { useEffect, useRef, useState } from 'react';
import CampoFormulario from './CampoFormulario.jsx';
import { sinErrores, validarRegistro } from '../utils/validaciones.js';

const inicial = { nombre: '', apellido: '', usuario: '', correo: '', nacimiento: '', contrasena: '', confirmacion: '', terminos: false };

export default function RegistroForm({ onRegistered, onShowLogin, activo = false }) {
  const [datos, setDatos] = useState(inicial);
  const [tocados, setTocados] = useState({});
  const [enviado, setEnviado] = useState(false);
  const nombreRef = useRef(null);
  useEffect(() => { if (activo) nombreRef.current?.focus(); }, [activo]);
  const errores = validarRegistro(datos);
  function cambiar(campo, valor) {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    setTocados((actual) => ({ ...actual, [campo]: true }));
  }
  function campo(id, label, type = 'text', extra = {}) {
    return <CampoFormulario id={id + 'Registro'} label={label} type={type} inputRef={id === 'nombre' ? nombreRef : undefined} required value={datos[id]} error={tocados[id] || enviado ? errores[id] : ''} onChange={(e) => cambiar(id, e.target.value)} onBlur={() => setTocados((actual) => ({ ...actual, [id]: true }))} {...extra} />;
  }
  function enviar(evento) {
    evento.preventDefault();
    setEnviado(true);
    if (!sinErrores(errores)) return;
    // El registro original también es simulado; no se guardan credenciales.
    onRegistered({ correo: datos.correo.trim(), usuario: datos.usuario.trim() });
    setDatos(inicial);
    setTocados({});
    setEnviado(false);
  }
  return (
    <form className="tarjeta-inicio-sesion cara-tarjeta cara-trasera" noValidate onSubmit={enviar} inert={!activo} aria-hidden={!activo} aria-label="Registro de usuarios">
      <span className="indicador-estado">● Únete a Nexus</span><h2>Crea tu cuenta</h2><p className="atenuado">Completa tus datos.</p>
      <div className="fila-campos-registro">{campo('nombre', 'Nombre', 'text', { autoComplete: 'given-name', maxLength: 30, placeholder: 'Ej: Daniel' })}{campo('apellido', 'Apellido', 'text', { autoComplete: 'family-name', maxLength: 30, placeholder: 'Ej: Riquelme' })}</div>
      {campo('usuario', 'Nombre de usuario', 'text', { autoComplete: 'username', minLength: 4, maxLength: 16, ayuda: 'Entre 4 y 16 caracteres. Solo letras, números y guion bajo.' })}
      {campo('correo', 'Correo electrónico', 'email', { autoComplete: 'email', placeholder: 'nombre@correo.cl' })}
      {campo('nacimiento', 'Fecha de nacimiento', 'date', { autoComplete: 'bday', min: '1900-01-01' })}
      <div className="fila-campos-registro">{campo('contrasena', 'Contraseña', 'password', { autoComplete: 'new-password', ayuda: 'Mayúscula, minúscula, número y carácter especial.' })}{campo('confirmacion', 'Confirmar contraseña', 'password', { autoComplete: 'new-password' })}</div>
      <div className={`grupo-campo grupo-terminos${(tocados.terminos || enviado) && errores.terminos ? ' campo-error' : ''}`}>
        <label className="etiqueta-checkbox" htmlFor="terminosRegistro"><input id="terminosRegistro" type="checkbox" checked={datos.terminos} onChange={(e) => cambiar('terminos', e.target.checked)} aria-describedby="terminos-error" /><span>Acepto divertirme, reír, valorar y respetar las reglas de Nexus.</span></label>
        <small id="terminos-error" className="mensaje-error" aria-live="polite">{(tocados.terminos || enviado) && errores.terminos}</small>
      </div>
      {enviado && !sinErrores(errores) && <p className="mensaje-formulario error" role="alert">Revisa los campos marcados antes de crear tu cuenta.</p>}
      <p className="nota-demo">Registro de demostración. No crea una cuenta en un servidor.</p>
      <button className="boton boton-primario boton-bloque" type="submit">Crear cuenta</button>
      <p className="pequeno atenuado centrado texto-cambio-formulario">¿Ya tienes una cuenta? <button className="enlace-cambio" type="button" onClick={onShowLogin}>Inicia sesión</button></p>
    </form>
  );
}

