import { productos } from "./nexus.js";
export const CLAVE_DATOS = "nexus.administracion.v1";
export const ADMIN_CORREO = "admin@nexus.cl";
// Credencial pública de demostración, nunca utilizar para datos reales.
export const ADMIN_CLAVE = "NexusAdmin123!";
export function autenticarAdmin(correo, clave) {
  return correo.trim().toLowerCase() === ADMIN_CORREO && clave === ADMIN_CLAVE
    ? {
        nombre: "Administrador",
        correo: ADMIN_CORREO,
        rol: "admin",
        invitado: false,
        biografia: "Administración de Nexus",
      }
    : null;
}
export const esAdmin = (usuario) => usuario?.rol === "admin";
export function datosIniciales() {
  return {
    productos: productos.map((p) => ({ ...p, categoria: "gaming", stock: 10 })),
    categorias: [{ id: "gaming", nombre: "Gaming" }],
    usuarios: [],
    ordenes: [],
  };
}
export function leerAdministracion() {
  try {
    const datos = JSON.parse(localStorage.getItem(CLAVE_DATOS));
    if (
      datos &&
      ["productos", "categorias", "usuarios", "ordenes"].every((k) =>
        Array.isArray(datos[k]),
      )
    )
      return datos;
  } catch {
    /* Se utiliza el catálogo inicial si no hay datos legibles. */
  }
  return datosIniciales();
}
export function guardarAdministracion(datos) {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(datos));
    return true;
  } catch {
    return false;
  }
}
export function guardarEntidad(datos, tipo, entrada, usuario) {
  if (!esAdmin(usuario)) throw new Error("Acceso reservado a administradores.");
  if (!["productos", "categorias", "usuarios"].includes(tipo))
    throw new Error("Sección no editable.");
  const nombre = entrada.nombre?.trim();
  if (!nombre || nombre.length > 100)
    throw new Error("Ingresa un nombre de hasta 100 caracteres.");
  const repetido = datos[tipo].some(
    (item) =>
      item.id !== entrada.id &&
      item.nombre.toLowerCase() === nombre.toLowerCase(),
  );
  if (repetido) throw new Error("Ya existe un registro con ese nombre.");
  const registro = { id: entrada.id || crypto.randomUUID(), nombre };
  if (entrada.id && !datos[tipo].some((item) => item.id === entrada.id))
    throw new Error("El registro ya no existe.");
  if (tipo === "productos") {
    if (
      String(entrada.precio).trim() === "" ||
      !Number.isSafeInteger(Number(entrada.precio)) ||
      Number(entrada.precio) <= 0
    )
      throw new Error("El precio debe ser un entero positivo en CLP.");
    if (
      String(entrada.stock).trim() === "" ||
      !Number.isSafeInteger(Number(entrada.stock)) ||
      Number(entrada.stock) < 0
    )
      throw new Error("El stock debe ser un entero mayor o igual a cero.");
    if (!datos.categorias.some((c) => c.id === entrada.categoria))
      throw new Error("Selecciona una categoría válida.");
    const precioOferta =
      entrada.precioOferta == null || String(entrada.precioOferta).trim() === ""
        ? null
        : Number(entrada.precioOferta);
    if (
      precioOferta !== null &&
      (!Number.isSafeInteger(precioOferta) ||
        precioOferta <= 0 ||
        precioOferta >= Number(entrada.precio))
    )
      throw new Error(
        "El precio de oferta debe ser un entero positivo menor al precio normal.",
      );
    Object.assign(registro, {
      precioOferta,
      precio: Number(entrada.precio),
      stock: Number(entrada.stock),
      categoria: entrada.categoria,
      descripcion: (entrada.descripcion || "").trim(),
    });
  }
  if (tipo === "usuarios") {
    const correo = (entrada.correo || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo))
      throw new Error("Ingresa un correo válido.");
    if (
      correo === ADMIN_CORREO ||
      datos.usuarios.some((u) => u.id !== entrada.id && u.correo === correo)
    )
      throw new Error("Ese correo ya está reservado o registrado.");
    Object.assign(registro, { correo, rol: "cliente" });
  }
  return {
    ...datos,
    [tipo]: entrada.id
      ? datos[tipo].map((item) =>
          item.id === entrada.id ? { ...item, ...registro } : item,
        )
      : [...datos[tipo], registro],
  };
}
export function eliminarEntidad(datos, tipo, id, usuario) {
  if (!esAdmin(usuario)) throw new Error("Acceso reservado a administradores.");
  if (!["productos", "categorias", "usuarios"].includes(tipo))
    throw new Error("Sección no editable.");
  if (
    tipo === "productos" &&
    datos.ordenes.some(
      (o) =>
        ["pendiente", "preparando"].includes(o.estado) &&
        o.items.some((i) => i.id === id),
    )
  )
    throw new Error(
      "El producto tiene pedidos activos; cancélalos o despáchalos antes de eliminarlo.",
    );
  if (tipo === "categorias" && datos.productos.some((p) => p.categoria === id))
    throw new Error(
      "La categoría tiene productos; reasígnalos antes de eliminarla.",
    );
  return { ...datos, [tipo]: datos[tipo].filter((item) => item.id !== id) };
}
