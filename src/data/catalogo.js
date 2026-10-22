export function tieneOferta(p) {
  return (
    Number.isSafeInteger(p.precioOferta) &&
    p.precioOferta > 0 &&
    p.precioOferta < p.precio
  );
}
export const precioVenta = (p) => (tieneOferta(p) ? p.precioOferta : p.precio);
const normalizar = (s) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
export function filtrarCatalogo(productos, parametros) {
  const texto = normalizar((parametros.get("q") || "").trim());
  const categoria = parametros.get("categoria");
  const resultado = productos.filter(
    (p) =>
      (!texto ||
        normalizar(p.nombre + " " + (p.descripcion || "")).includes(texto)) &&
      (!categoria || p.categoria === categoria) &&
      (parametros.get("stock") !== "1" || p.stock > 0) &&
      (parametros.get("ofertas") !== "1" || tieneOferta(p)),
  );
  switch (parametros.get("orden")) {
    case "precio-asc":
      return resultado.sort((a, b) => precioVenta(a) - precioVenta(b));
    case "precio-desc":
      return resultado.sort((a, b) => precioVenta(b) - precioVenta(a));
    case "nombre":
      return resultado.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
    default:
      return resultado;
  }
}
