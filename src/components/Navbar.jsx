import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { transmisiones } from '../data/nexus.js';

export default function Navbar({ usuario, onLogout, simple = false, stream = false, onSearch, abierto = false, onNavigate }) {
  const [consulta, setConsulta] = useState('');
  const navegar = useNavigate();
  if (simple) return (
    <header className="barra-superior-simple">
      <Link className="marca" to="/principal"><span className="simbolo-marca mini">N</span><strong>NEXUS</strong></Link>
      <nav aria-label="Navegación principal"><Link to="/principal">Inicio</Link><Link to="/comunidad">Comunidades</Link><Link to="/tienda">Tienda</Link><Link to="/contacto">Contacto</Link></nav>
      {stream ? <>
        <form className="contenedor-busqueda compacto" role="search" onSubmit={(evento) => { evento.preventDefault(); onSearch(consulta); navegar('/principal'); }}>
          <span aria-hidden="true">⌕</span><input type="search" aria-label="Buscar en Nexus" placeholder="Buscar" value={consulta} onChange={(evento) => setConsulta(evento.target.value)} />
        </form>
        <Link className="avatar avatar-verde" to="/perfil" aria-label="Mi perfil">{usuario.nombre.slice(0, 2).toUpperCase()}</Link>
      </> : <button className="boton boton-suave" onClick={onLogout}>Cerrar sesión</button>}
    </header>
  );
  return (
    <aside id="navegacionNexus" className={`navegacion-lateral${abierto ? ' abierto' : ''}`}>
      <div className="marca-lateral"><span className="simbolo-marca mini">N</span><strong>NEXUS</strong></div>
      <nav aria-label="Navegación principal" onClick={onNavigate}>
        {[
          ['/principal', '⌂', 'Inicio'], ['/principal#explorar', '⌕', 'Explorar'],
          ['/comunidad', '☷', 'Comunidades'], ['/perfil', '♙', 'Mi perfil'],
          ['/tienda', '🛒', 'Tienda'], ['/contacto', '✉', 'Contacto'],
        ].map(([to, icono, texto]) => <NavLink key={texto} to={to} className={({ isActive }) => `elemento-navegacion${isActive && texto !== 'Explorar' ? ' activo' : ''}`}><span>{icono}</span>{texto}</NavLink>)}
      </nav>
      <p className="encabezado-lateral">TRANSMISIÓN DESTACADA</p>
      {transmisiones.slice(0, 1).map((canal) => <Link className="usuario-en-vivo" key={canal.id} to="/stream" onClick={onNavigate}>
        <span className={`avatar avatar-${canal.color}`}>{canal.iniciales}</span>
        <span><strong>{canal.nombre}</strong><small>{canal.categoria}</small></span><b>● {canal.espectadores}</b>
      </Link>)}
      <div className="perfil-mini">
        <Link to="/perfil" className="avatar avatar-verde" aria-label="Ver mi perfil">{usuario?.nombre.slice(0, 2).toUpperCase()}</Link>
        <span><strong>{usuario?.nombre}</strong><small>{usuario?.invitado ? 'Invitado' : 'En línea'}</small></span>
        <button className="boton-sin-fondo" onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión">↪</button>
      </div>
    </aside>
  );
}


