import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import CampoFormulario from './CampoFormulario.jsx';
import { sinErrores, validarLogin } from '../utils/validaciones.js';

export default function LoginForm({ onLogin, onGuest, onShowRegistro, correoInicial = '', aviso = '', activo = true }) {
  const [datos, setDatos] = useState({ correo: correoInicial, contrasena: '' });
  const [errores, setErrores] = useState({});
  const [recuperacion, setRecuperacion] = useState(false);
  const correoRef = useRef(null);
  useEffect(() => { if (activo) correoRef.current?.focus(); }, [activo]);
  function cambiar(campo, valor) {
    const nuevos = { ...datos, [campo]: valor };
    setDatos(nuevos);
    setErrores((actual) => ({ ...actual, [campo]: validarLogin(nuevos)[campo] }));
  }
  function enviar(evento) {
    evento.preventDefault();
    const resultado = validarLogin(datos);
    setErrores(resultado);
    // La contraseña solo valida el formato en memoria; no se pasa al estado compartido.
    if (sinErrores(resultado)) onLogin({ correo: datos.correo.trim() });
  }
  return (
    <form className="tarjeta-inicio-sesion cara-tarjeta cara-frontal" noValidate onSubmit={enviar} inert={!activo} aria-hidden={!activo} aria-label="Inicio de sesión">
      <p><Link to="/admin/login">Acceso administrador</Link></p>
      <div className="marca-movil"><span className="simbolo-marca">N</span><span>NEXUS</span></div>
      <span className="indicador-estado">● Comunidad online</span>
      <h2>Bienvenid@ a nuestra comunidad</h2><p className="atenuado">Inicia sesión para entrar a Nexus.</p>
      <p className="nota-demo">Demostración local: se valida el formato, sin autenticar una cuenta real.</p>
      {aviso && <p className="mensaje-formulario exito" role="status">{aviso}</p>}
      <CampoFormulario id="correo" label="Correo electrónico" type="email" autoComplete="email" placeholder="nombre@correo.cl" required value={datos.correo} error={errores.correo} onChange={(e) => cambiar('correo', e.target.value)} inputRef={correoRef} />
      <CampoFormulario id="contrasena" label="Contraseña" type="password" autoComplete="current-password" placeholder="••••••••" minLength={4} required value={datos.contrasena} error={errores.contrasena} onChange={(e) => cambiar('contrasena', e.target.value)} />
      <button type="button" className="enlace-cambio" onClick={() => setRecuperacion(!recuperacion)}>¿Olvidaste tu contraseña?</button>
      {recuperacion && <p className="nota-demo" role="status">No hay recuperación de cuentas en esta demostración. Puedes entrar como invitado.</p>}
      <button className="boton boton-primario boton-bloque" type="submit">Entrar a Nexus</button>
      <button className="boton boton-secundario boton-bloque" type="button" onClick={onGuest}>Entrar como invitado</button>
      <p className="pequeno atenuado centrado texto-cambio-formulario">¿Aún no tienes una cuenta? <button className="enlace-cambio" type="button" onClick={onShowRegistro}>Registrarte</button></p>
    </form>
  );
}


