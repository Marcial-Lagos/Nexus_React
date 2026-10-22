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
import Checkout from './pages/Checkout.jsx';
import ResultadoCompra from './pages/ResultadoCompra.jsx';
import { crearPedido, prepararCompra, cambiarEstadoPedido, validarEntrega } from './data/pedidos.js';
import Admin from './pages/Admin.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import { leerAdministracion, guardarAdministracion, guardarEntidad, eliminarEntidad, esAdmin } from './data/administracion.js';

export default function App() {
  const [usuario, setUsuario] = useState(() => { const sesion = leerSesion(); return sesion ? { ...sesion, id: sesion.id || crypto.randomUUID() } : null; });
  const [administracion, setAdministracion] = useState(leerAdministracion);
  const [avisoAdmin, setAvisoAdmin] = useState('');
  function actualizarDatos(nuevos) {
    const persistido = guardarAdministracion(nuevos);
    setAdministracion(nuevos);
    setAvisoAdmin(persistido ? '' : 'El navegador bloqueó el almacenamiento. Los cambios solo durarán mientras esta página esté abierta.');
  }
  const [carrito, setCarrito] = useState([]);
  const [menu, setMenu] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const ubicacion = useLocation();
  useEffect(() => { guardarSesion(usuario); }, [usuario]);
  function iniciarSesion(datos) { setUsuario({ id: crypto.randomUUID(), nombre: datos.nombre, correo: datos.correo, invitado: false, rol: esAdmin(datos) ? 'admin' : 'cliente', biografia: biografiaOriginal }); }
  function invitado() { setUsuario({ id: crypto.randomUUID(), nombre: 'Invitado', correo: '', invitado: true, rol: 'cliente', biografia: biografiaOriginal }); }
  function salir() { setUsuario(null); setCarrito([]); setMenu(false); setBusqueda(''); }
  function confirmarCompra(entrega, pago, id) {
    const actuales = leerAdministracion();
    if (Object.keys(validarEntrega(entrega)).length) throw new Error('Revisa los datos de entrega.');
    if (pago === 'rechazado') { prepararCompra(actuales, carrito, entrega.entrega); return { rechazado: true }; }
    if (pago !== 'aprobado') throw new Error('Resultado de pago inválido.');
    const resultado = crearPedido(actuales, carrito, entrega, usuario, id);
    if (!guardarAdministracion(resultado.datos)) throw new Error('No se pudo guardar el pedido. Habilita el almacenamiento del navegador e intenta nuevamente. No se confirmó la compra.');
    setAdministracion(resultado.datos); setCarrito([]);
    return { pedido: resultado.pedido };
  }
  function actualizarPedido(id, estado) {
    const nuevos = cambiarEstadoPedido(leerAdministracion(), id, estado, usuario);
    if (!guardarAdministracion(nuevos)) throw new Error('No se pudo guardar el cambio de estado.');
    setAdministracion(nuevos);
  }
  function agregar(producto, cantidad) {
    const actual = administracion.productos.find((p) => p.id === producto.id);
    const acumulado = (carrito.find((p) => p.id === producto.id)?.cantidad || 0) + cantidad;
    if (!actual || !Number.isSafeInteger(cantidad) || cantidad < 1 || acumulado > actual.stock) throw new Error('No hay stock suficiente para agregar esa cantidad.');
    setCarrito((actual) => {
      const existente = actual.find((item) => item.id === producto.id);
      return existente ? actual.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item) : [...actual, { id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad }];
    });
  }
  const cantidadCarrito = carrito.reduce((suma, item) => suma + item.cantidad, 0);
  const lateral = usuario && ['/principal', '/tienda', '/producto'].includes(ubicacion.pathname);
  const simple = usuario && ['/perfil', '/stream', '/checkout'].includes(ubicacion.pathname);
  const proteger = (pantalla) => usuario ? pantalla : <Navigate to="/login" replace />;
  const titulos = { '/principal': 'Principal', '/comunidad': 'Comunidad', '/contacto': 'Contacto', '/perfil': 'Perfil', '/tienda': 'Tienda', '/producto': 'Producto', '/stream': 'Stream' };
  if (ubicacion.pathname.startsWith('/admin')) return <Routes>
    <Route path="/admin/login" element={esAdmin(usuario) ? <Navigate to="/admin" replace /> : <AdminLogin onLogin={(datos) => setUsuario({ ...datos, id: crypto.randomUUID() })} />} />
    <Route path="/admin/*" element={<Admin onChangeEstado={actualizarPedido} usuario={usuario} datos={administracion} aviso={avisoAdmin} onLogout={salir} onSave={(tipo, registro) => actualizarDatos(guardarEntidad(administracion, tipo, registro, usuario))} onDelete={(tipo, id) => actualizarDatos(eliminarEntidad(administracion, tipo, id, usuario))} />} />
  </Routes>;
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
        <Route path="/checkout" element={proteger(<Checkout usuario={usuario} datos={administracion} carrito={carrito} onConfirm={confirmarCompra} />)} />
        <Route path="/compra/:id" element={proteger(<ResultadoCompra usuario={usuario} ordenes={administracion.ordenes} />)} />
        <Route path="/" element={usuario ? <Navigate to={esAdmin(usuario) ? "/admin" : "/principal"} replace /> : <Login onLogin={iniciarSesion} onGuest={invitado} />} />
        <Route path="/login" element={usuario ? <Navigate to={esAdmin(usuario) ? "/admin" : "/principal"} replace /> : <Login onLogin={iniciarSesion} onGuest={invitado} />} />
        <Route path="/principal" element={proteger(<Principal busqueda={busqueda} onClearSearch={() => setBusqueda('')} />)} />
        <Route path="/comunidad" element={proteger(<Comunidad usuario={usuario} cantidadCarrito={cantidadCarrito} />)} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/perfil" element={proteger(usuario && <Perfil usuario={usuario} onUpdate={(cambios) => setUsuario((actual) => ({ ...actual, ...cambios }))} />)} />
        <Route path="/tienda" element={proteger(<Tienda productos={administracion.productos} carrito={carrito} onRemove={(id) => setCarrito((actual) => actual.filter((item) => item.id !== id))} onEmpty={() => setCarrito([])} />)} />
        <Route path="/producto" element={proteger(<Producto productos={administracion.productos} key={ubicacion.search} onAdd={agregar} />)} />
        <Route path="/stream" element={proteger(<Stream usuario={usuario} />)} />
        <Route path="*" element={<Navigate to={usuario ? esAdmin(usuario) ? '/admin' : '/principal' : '/login'} replace />} />
      </Routes>
    </div>
  );
}


