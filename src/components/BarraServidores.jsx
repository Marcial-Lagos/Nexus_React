import { Link, NavLink, useLocation } from 'react-router';
export default function BarraServidores({ cantidadCarrito = 0 }) {
  const { pathname, search } = useLocation();
  const canal = new URLSearchParams(search).get('canal');
  return <aside className="barra-servidores" aria-label="Accesos rápidos">
    <NavLink className="logo-servidor" to="/principal" aria-label="Nexus inicio">N</NavLink><div className="linea-barra" />
    {[
      ['/principal', 'Inicio', '⌂'], ['/comunidad', 'Gaming', '🎮'],
      ['/comunidad?canal=programación', 'Código', '⌘'], ['/comunidad?canal=musica', 'Música', '𝄞'],
    ].map(([to, titulo, simbolo]) => {
      const activo = titulo === 'Inicio' ? pathname === '/principal' : pathname === '/comunidad' && (titulo === 'Código' ? canal === 'programación' : titulo === 'Música' ? canal === 'musica' : !['programación', 'musica'].includes(canal));
      return <Link key={titulo} to={to} title={titulo} aria-label={titulo} aria-current={activo ? 'page' : undefined} className={`icono-servidor${activo ? ' activo' : ''}`}>{simbolo}</Link>;
    })}
    <NavLink to="/comunidad" className="icono-servidor agregar-servidor" title="Explorar comunidades" aria-label="Explorar comunidades">＋</NavLink>
    <NavLink to="/tienda" className={({ isActive }) => `icono-servidor carrito-compras${isActive ? ' activo' : ''}`} aria-label={`Tienda y carrito, ${cantidadCarrito} productos`}>
      <i className="fa-solid fa-cart-shopping" aria-hidden="true" />{cantidadCarrito > 0 && <small className="contador-carrito">{cantidadCarrito}</small>}
    </NavLink>
  </aside>;
}
