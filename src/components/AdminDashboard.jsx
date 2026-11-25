import { Link } from "react-router";
import { precioCLP } from "../data/nexus.js";

const labels={PENDIENTE:"Pendientes",CONFIRMADO:"Confirmados",EN_PREPARACION:"En preparación",EN_CAMINO:"En camino",ENTREGADO:"Entregados",CANCELADO:"Cancelados"};
const colors=["#a78bfa","#60a5fa","#22d3ee","#34d399","#fbbf24","#fb7185"];
const estado=o=>String(o.estado||"").toUpperCase();
const numero=v=>Number.isFinite(Number(v))?Number(v):0;
const fecha=o=>{const d=new Date(o.fecha);return o.fecha&&!Number.isNaN(d.valueOf())?d:null;};

export default function AdminDashboard({datos, demo=false}){
  const {productos,usuarios,ordenes}=datos;
  const activos=ordenes.filter(o=>estado(o)!=="CANCELADO");
  const total=activos.reduce((s,o)=>s+numero(o.total),0);
  const criticos=productos.filter(p=>numero(p.stock)<=5).sort((a,b)=>a.stock-b.stock);
  const estados=Object.entries(labels).map(([k,t],i)=>({t,n:ordenes.filter(o=>estado(o)===k).length,c:colors[i]}));
  const otros=ordenes.length-estados.reduce((s,e)=>s+e.n,0);
  if(otros)estados.push({t:"Otros",n:otros,c:"#94a3b8"});
  const dias=Array.from({length:7},(_,i)=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-6+i);const fin=new Date(d);fin.setDate(fin.getDate()+1);const lista=activos.filter(o=>fecha(o)>=d&&fecha(o)<fin);return {label:d.toLocaleDateString("es-CL",{weekday:"short",day:"numeric"}),n:lista.length,valor:lista.reduce((s,o)=>s+numero(o.total),0)};});
  const max=Math.max(1,...dias.map(d=>d.n));
  const recientes=[...ordenes].sort((a,b)=>(fecha(b)?.valueOf()||0)-(fecha(a)?.valueOf()||0)).slice(0,5);
  const ventas=new Map();
  activos.forEach(o=>(o.items||[]).forEach(i=>{const k=i.id||i.nombre;const v=ventas.get(k)||{nombre:i.nombre,unidades:0};v.unidades+=numero(i.cantidad);ventas.set(k,v);}));
  const populares=[...ventas.values()].sort((a,b)=>b.unidades-a.unidades).slice(0,5);
  const cards=[["Valor de pedidos",precioCLP(total),"bag-check","Pedidos no cancelados","purple"],["Pedidos",ordenes.length,"receipt","Todos los estados","blue"],["Cuentas",usuarios.length,"people","Usuarios registrados","cyan"],["Productos",productos.length,"box-seam",criticos.length+" con stock bajo","amber"]];
  return <section className="nx-dashboard">
    <div className="nx-admin-intro"><div><span className="nx-eyebrow">CENTRO DE CONTROL</span><h2>{demo?"Resumen del negocio":"Resumen de la tienda"}</h2><p>Supervisa el rendimiento y administra tu catálogo desde un solo lugar.</p></div><span className="nx-source"><span/> {demo?"Modo demostración":"Datos del servidor"}</span></div>
    <div className="nx-kpis">{cards.map(([t,v,icon,sub,tone])=><article className="nx-panel nx-kpi" key={t}><div className="nx-kpi-top"><span>{t}</span><i aria-hidden="true" className={"bi bi-"+icon+" nx-icon "+tone}/></div><strong>{v}</strong><small>{sub}</small></article>)}</div>
    <p className="nx-admin-note">Los importes corresponden al valor de los pedidos registrados, no a ingresos bancarios ni pagos reales.</p>
    <div className="nx-dashboard-grid">
      <article className="nx-panel"><div className="nx-panel-title"><div><h3>Actividad de pedidos</h3><small>Últimos 7 días · no cancelados</small></div><i className="bi bi-bar-chart" aria-hidden="true"/></div><div className="nx-chart" role="img" aria-label={dias.map(d=>d.label+": "+d.n+" pedidos").join(", ")}>{dias.map(d=><div className="nx-chart-col" key={d.label}><strong>{d.n}</strong><div className="nx-chart-track"><div style={{height:(d.n/max*100)+"%"}} title={precioCLP(d.valor)}/></div><span>{d.label}</span></div>)}</div></article>
      <article className="nx-panel"><div className="nx-panel-title"><h3>Estado de pedidos</h3><i className="bi bi-pie-chart" aria-hidden="true"/></div>{!ordenes.length?<p className="nx-empty">Todavía no hay pedidos registrados.</p>:<div className="nx-status-track" aria-hidden="true">{estados.filter(e=>e.n).map(e=><span key={e.t} style={{flex:e.n,background:e.c}}/>)}</div>}<div className="nx-status-list">{estados.map(e=><div key={e.t}><span><i style={{background:e.c}}/>{e.t}</span><strong>{e.n}</strong></div>)}</div></article>
      <article className="nx-panel"><div className="nx-panel-title"><h3>Actividad reciente</h3><Link to="/admin/ordenes">Ver pedidos</Link></div>{recientes.length?<div className="nx-mini-list">{recientes.map(o=><div key={o.id}><div><strong>Pedido #{o.id}</strong><small>{o.cliente?.nombre||"Cliente"} · {labels[estado(o)]||o.estado}</small></div><strong>{precioCLP(numero(o.total))}</strong></div>)}</div>:<p className="nx-empty">Los próximos pedidos aparecerán aquí.</p>}</article>
      <article className="nx-panel"><div className="nx-panel-title"><h3>Alertas de inventario</h3><Link to="/admin/productos">Gestionar</Link></div>{criticos.length?<div className="nx-mini-list">{criticos.slice(0,5).map(p=><div key={p.id}><strong>{p.nombre}</strong><span className="nx-badge warning">{p.stock} un.</span></div>)}</div>:<p className="nx-empty">No hay productos con stock crítico (5 unidades o menos).</p>}</article>
      <article className="nx-panel nx-wide"><div className="nx-panel-title"><h3>Productos más solicitados</h3><small>Unidades en pedidos no cancelados</small></div>{populares.length?<div className="nx-mini-list">{populares.map(p=><div key={p.nombre}><strong>{p.nombre}</strong><span>{p.unidades} unidades</span></div>)}</div>:<p className="nx-empty">Sin ventas registradas para elaborar un ranking.</p>}</article>
    </div>
  </section>;
}
