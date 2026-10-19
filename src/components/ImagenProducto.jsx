export default function ImagenProducto({ producto }) {
  return producto.imagen ? <img src={producto.imagen} alt={producto.nombre} /> : <div className="ilustracion-producto" role="img" aria-label={`${producto.nombre}: ilustración, fotografía no disponible en el original`}><i className={`fa-solid fa-${producto.icono}`} aria-hidden="true" /><small>Ilustración</small></div>;
}
