import { NavLink } from 'react-router';
export default function BarraServidores({ cantidadCarrito = 0 }) {
  return <aside className="barra-servidores" aria-label="Accesos rápidos">
    <NavLink className="logo-servidor" to="/principal" aria-label="Nexus inicio">N</NavLink>
    <div className="linea-barra" />
    <NavLink to="/comunidad" className={({ isActive }) => `icono-servidor${isActive ? ' activo' : ''}`} title="Comunidades" aria-label="Comunidades">☷</NavLink>
    <NavLink to="/tienda" className={({ isActive }) => `icono-servidor carrito-compras${isActive ? ' activo' : ''}`} aria-label={`Tienda y carrito, ${cantidadCarrito} productos`}>
      <i className="fa-solid fa-cart-shopping" aria-hidden="true" />{cantidadCarrito > 0 && <small className="contador-carrito">{cantidadCarrito}</small>}
    </NavLink>
  </aside>;
}
