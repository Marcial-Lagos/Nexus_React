import { Link, NavLink } from "react-router";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../styles/admin.css";

const icons=["grid-1x2","box-seam","tags","people","receipt","bar-chart","person-circle"];
export default function AdminLayout({ title, links, onLogout, logoutLabel="Cerrar sesión", children, refresh, demo=false }){
  return <main className="nx-admin">
    <aside className="nx-admin-sidebar">
      <Link to="/admin" className="nx-brand" aria-label="Nexus administración"><i className="bi bi-lightning-charge-fill" aria-hidden="true"/>NEXUS<span className="nx-eyebrow">ADMIN</span></Link>
      <nav aria-label="Administración">
        {links.map(([ruta,etiqueta],i)=><NavLink key={ruta} end to={ruta} className={({isActive})=>"nav-link"+(isActive?" active":"")}><i className={"bi bi-"+icons[i]} aria-hidden="true"/>{etiqueta}</NavLink>)}
      </nav>
      <div className="nx-sidebar-bottom"><Link to="/tienda" className="btn btn-outline-info"><i className="bi bi-shop me-2" aria-hidden="true"/>Ver tienda</Link><button className="btn btn-outline-secondary" onClick={onLogout}><i className="bi bi-box-arrow-right me-2" aria-hidden="true"/>{logoutLabel}</button></div>
    </aside>
    <div className="nx-admin-main"><header className="nx-admin-header"><div><span className="nx-eyebrow">ESPACIO ADMINISTRATIVO</span><h1>{title}</h1></div><div className="d-flex align-items-center gap-2">{refresh&&<button className="btn btn-outline-info btn-sm" onClick={refresh}><i className="bi bi-arrow-clockwise me-1" aria-hidden="true"/>Actualizar</button>}<span className="nx-source"><span/>{demo?"Demo":"Administrador"}</span></div></header>{children}</div>
  </main>;
}
