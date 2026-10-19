import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router';
import Navbar from './components/Navbar.jsx';
import BarraServidores from './components/BarraServidores.jsx';
import Login from './pages/Login.jsx';
import Principal from './pages/Principal.jsx';
import Comunidad from './pages/Comunidad.jsx';
import Contacto from './pages/Contacto.jsx';
import Perfil from './pages/Perfil.jsx';
import Tienda from './pages/Tienda.jsx';
import Producto from './pages/Producto.jsx';
import Stream from './pages/Stream.jsx';
import { biografiaOriginal } from './data/nexus.js';
import { guardarSesion, leerSesion } from './utils/sesion.js';
import './App.css';

export default function App() {
  const [usuario, setUsuario] = useState(leerSesion);
  const [carrito, setCarrito] = useState([]);
  const [menu, setMenu] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const ubicacion = useLocation();
  useEffect(() => { guardarSesion(usuario); }, [usuario]);
  function iniciarSesion(datos) { setUsuario({ nombre: datos.nombre, correo: datos.correo, invitado: false, biografia: biografiaOriginal }); }
  function invitado() { setUsuario({ nombre: 'Invitado', correo: '', invitado: true, biografia: biografiaOriginal }); }
  function salir() { setUsuario(null); setCarrito([]); setMenu(false); setBusqueda(''); }
  function agregar(producto, cantidad) {
    setCarrito((actual) => {
      const existente = actual.find((item) => item.id === producto.id);
      return existente ? actual.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item) : [...actual, { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad }];
    });
  }
  const cantidadCarrito = carrito.reduce((suma, item) => suma + item.cantidad, 0);
  const lateral = usuario && ['/principal', '/tienda', '/producto'].includes(ubicacion.pathname);
  const simple = usuario && ['/perfil', '/stream'].includes(ubicacion.pathname);
  const proteger = (pantalla) => usuario ? pantalla : <Navigate to="/login" replace />;
  const titulos = { '/principal': 'Principal', '/comunidad': 'Comunidad', '/contacto': 'Contacto', '/perfil': 'Perfil', '/tienda': 'Tienda', '/producto': 'Producto', '/stream': 'Stream' };
  return (
    <div className={lateral ? 'cuerpo-aplicacion' : ubicacion.pathname === '/perfil' ? 'pagina-perfil' : ubicacion.pathname === '/stream' ? 'cuerpo-transmision' : ''}>
      <title>Nexus | {titulos[ubicacion.pathname] || 'Inicio de sesión'}</title>
      {lateral && <>
        <BarraServidores cantidadCarrito={cantidadCarrito} />
        <Navbar usuario={usuario} onLogout={salir} abierto={menu} onNavigate={() => setMenu(false)} />
        <header className="barra-superior">
          <button className="menu-movil" aria-label="Abrir menú" aria-expanded={menu} aria-controls="navegacionNexus" onClick={() => setMenu(!menu)}>☰</button>
          {ubicacion.pathname === '/principal' ? <div className="contenedor-busqueda"><span aria-hidden="true">⌕</span><input type="search" aria-label="Buscar streams, categorías o personas" placeholder="Buscar streams, categorías o personas" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} /></div> : <Link className="marca" to="/principal">NEXUS</Link>}
          <div className="acciones-superiores"><Link className="boton-icono" to="/contacto" aria-label="Contacto">♢</Link><Link className="avatar avatar-verde" to="/perfil" aria-label="Mi perfil">{usuario.nombre.slice(0, 2).toUpperCase()}</Link></div>
        </header>
      </>}
      {simple && <Navbar simple stream={ubicacion.pathname === '/stream'} onSearch={setBusqueda} usuario={usuario} onLogout={salir} />}
      <Routes>
        <Route path="/" element={usuario ? <Navigate to="/principal" replace /> : <Login onLogin={iniciarSesion} onGuest={invitado} />} />
        <Route path="/login" element={usuario ? <Navigate to="/principal" replace /> : <Login onLogin={iniciarSesion} onGuest={invitado} />} />
        <Route path="/principal" element={proteger(<Principal busqueda={busqueda} onClearSearch={() => setBusqueda('')} />)} />
        <Route path="/comunidad" element={proteger(<Comunidad usuario={usuario} cantidadCarrito={cantidadCarrito} />)} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/perfil" element={proteger(usuario && <Perfil usuario={usuario} onUpdate={(cambios) => setUsuario((actual) => ({ ...actual, ...cambios }))} />)} />
        <Route path="/tienda" element={proteger(<Tienda carrito={carrito} onRemove={(id) => setCarrito((actual) => actual.filter((item) => item.id !== id))} onEmpty={() => setCarrito([])} />)} />
        <Route path="/producto" element={proteger(<Producto key={ubicacion.search} onAdd={agregar} />)} />
        <Route path="/stream" element={proteger(<Stream usuario={usuario} />)} />
        <Route path="*" element={<Navigate to={usuario ? '/principal' : '/login'} replace />} />
      </Routes>
    </div>
  );
}

