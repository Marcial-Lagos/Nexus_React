import { useState } from 'react';
import { Link } from 'react-router';
import { ADMIN_CORREO, ADMIN_CLAVE, autenticarAdmin } from '../data/administracion.js';
export default function AdminLogin({ onLogin }) {
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  return <main className="container py-5" style={{ maxWidth: 560 }}>
    <h1>Acceso administrador</h1><p>Panel de demostración local de Nexus.</p>
    <form onSubmit={(e) => { e.preventDefault(); const usuario = autenticarAdmin(correo, clave); if (!usuario) { setError('Credenciales de administrador incorrectas.'); return; } onLogin(usuario); }}>
      <label className="form-label" htmlFor="adminCorreo">Correo administrador</label><input className="form-control mb-3" id="adminCorreo" type="email" autoComplete="username" required value={correo} onChange={(e) => setCorreo(e.target.value)} />
      <label className="form-label" htmlFor="adminClave">Contraseña administrador</label><input className="form-control mb-3" id="adminClave" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
      {error && <p role="alert">{error}</p>}<button className="btn btn-primary" type="submit">Ingresar al panel</button>
    </form>
    <details className="my-3"><summary>Credenciales de demostración</summary><p>Correo: {ADMIN_CORREO}<br />Contraseña: {ADMIN_CLAVE}</p></details>
    <p>Este acceso no protege datos reales: la autenticación y los permisos deben validarse en un servidor en producción.</p><Link to="/login">Volver al acceso de usuarios</Link>
  </main>;
}
