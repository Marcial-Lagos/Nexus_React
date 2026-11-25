const TOKEN_KEY = "nexus.api.token";

export const API_PATHS = Object.freeze({
  login: "/api/v1/auth/login",
  register: "/api/v1/auth/register",
  products: "/api/v1/productos",
  profile: (id) => `/api/v1/usuarios/${encodeURIComponent(id)}`,
  ordersForUser: (id) =>
    `/api/v1/pedidos/usuario/${encodeURIComponent(id)}`,
  orders: "/api/v1/pedidos",
});

export class ApiError extends Error {
  constructor(message, status = 0, body = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function apiConfigured() {
  return Boolean(import.meta.env.VITE_API_BASE_URL?.trim());
}

export function saveAccessToken(token) {
  if (!token) {
    clearAccessToken();
    return;
  }
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    throw new ApiError(
      "No se pudo guardar la sesión en esta pestaña. Habilita el almacenamiento e inténtalo otra vez.",
    );
  }
}

export function clearAccessToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem("nexus.intento");
    sessionStorage.removeItem("nexus.entrega");
  } catch {
    // La sesión en memoria sigue siendo válida hasta cerrar o recargar la página.
  }
}

export function readAccessToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

export function decodeTokenClaims(token = readAccessToken()) {
  try {
    const segment = token.split(".")[1];
    if (!segment) return {};
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(
      decodeURIComponent(
        Array.from(decoded, (char) =>
          `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`,
        ).join(""),
      ),
    );
  } catch {
    return {};
  }
}

function messageFromBody(body, status) {
  const message =
    body && typeof body === "object"
      ? body.message || body.mensaje || body.error || body.detail
      : "";
  return (
    (typeof message === "string" && message.trim()) ||
    (status ? `El servidor respondió con error (${status}).` : "No se pudo conectar con el servidor.")
  );
}

export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/+$/, "");
  const headers = { Accept: "application/json" };
  const token = readAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError("No fue posible conectar con el servidor. Inténtalo nuevamente.");
  }

  const raw = response.status === 204 ? "" : await response.text();
  let data = null;
  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = raw;
    }
  }
  if (!response.ok) {
    if (response.status === 401) {
      clearAccessToken();
      window.dispatchEvent(new CustomEvent("nexus:session-expired"));
    }
    throw new ApiError(messageFromBody(data, response.status), response.status, data);
  }
  return data;
}

function firstValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== "") ?? values.at(-1);
}

function unwrap(value) {
  return value?.data ?? value?.content ?? value;
}

export function normalizeProduct(input = {}) {
  const product = unwrap(input) || {};
  const category = firstValue(product.categoria, product.category, product.categoriaId);
  return {
    ...product,
    id: String(firstValue(product.id, product.productoId, product._id, "")),
    nombre: String(firstValue(product.nombre, product.name, product.nombreProducto, "Producto")),
    descripcion: String(firstValue(product.descripcion, product.description, "")),
    precio: Number(firstValue(product.precio, product.price, 0)),
    precioOferta: firstValue(product.precioOferta, product.offerPrice, null),
    stock: Number(firstValue(product.stock, product.cantidadStock, 0)),
    categoria:
      typeof category === "object"
        ? String(firstValue(category.id, category.categoriaId, category.nombre, ""))
        : String(category ?? ""),
    icono: product.icono || "gamepad",
    imagen: firstValue(product.imagenUrl, product.imagen, product.image, product.urlImagen, ""),
  };
}

export function normalizeProducts(response) {
  const data = unwrap(response);
  const rows = Array.isArray(data)
    ? data
    : data?.content || data?.productos || data?.items || data?.results || [];
  return rows.map(normalizeProduct);
}

export function normalizeProfile(input = {}) {
  const profile = unwrap(input) || {};
  return {
    id: String(firstValue(profile.id, profile.usuarioId, profile.userId, "")),
    nombre: String(firstValue(profile.nombre, profile.name, "")),
    correo: String(firstValue(profile.correo, profile.email, "")),
    biografia: String(firstValue(profile.biografia, profile.bio, "")),
  };
}

export function normalizeOrder(input = {}) {
  const order = unwrap(input) || {};
  const lines = firstValue(order.items, order.detalles, order.productos, order.orderItems, []);
  const items = (Array.isArray(lines) ? lines : []).map((line) => {
    const product = line.producto || line.product || {};
    return {
      id: String(firstValue(line.productoId, line.productId, product.id, line.id, "")),
      nombre: String(firstValue(line.nombre, line.nombreProducto, product.nombre, product.name, "Producto")),
      precio: Number(firstValue(line.precioUnitario, line.precio, line.price, product.precio, product.price, 0)),
      cantidad: Number(firstValue(line.cantidad, line.quantity, 1)),
    };
  });
  const customer = order.cliente || order.usuario || {};
  const rawTotal = firstValue(order.total, order.montoTotal, order.amount);
  return {
    ...order,
    id: String(firstValue(order.id, order.pedidoId, order.orderId, "")),
    sesionId: String(firstValue(order.usuarioId, order.userId, customer.id, "")),
    fecha: firstValue(order.fecha, order.createdAt, order.fechaCreacion, ""),
    estado: String(firstValue(order.estado, order.status, "pendiente")),
    items,
    total: rawTotal === undefined ? null : Number(rawTotal),
    envio: Number(firstValue(order.envio, order.costoEnvio, 0)),
    cliente: {
      nombre: String(firstValue(order.nombreContacto, customer.nombre, customer.name, "")),
      correo: String(firstValue(order.correoContacto, customer.correo, customer.email, "")),
      entrega: firstValue(order.tipoEntrega, order.entrega, order.deliveryType, "retiro"),
      direccion: String(firstValue(order.direccion, order.direccionEntrega, order.address, "")),
      comuna: String(firstValue(order.comuna, "")),
    },
  };
}

function authParts(response) {
  const data = unwrap(response) || {};
  const nestedUser = data.usuario || data.user || data.perfil || {};
  const token = firstValue(
    data.accessToken,
    data.access_token,
    data.token,
    data.jwt,
    data.bearerToken,
  );
  const claims = decodeTokenClaims(token || "");
  const user = normalizeProfile(nestedUser);
  const id = firstValue(
    data.usuarioId,
    data.userId,
    data.id,
    nestedUser.usuarioId,
    nestedUser.userId,
    nestedUser.id,
    claims.usuarioId,
    claims.userId,
    claims.id,
  );
  return {
    token: typeof token === "string" ? token : "",
    usuario: {
      id: id === undefined ? "" : String(id),
      nombre: String(firstValue(data.nombre, data.name, user.nombre, claims.nombre, claims.name, (data.email || claims.sub || "").split("@")[0], "")),
      correo: String(firstValue(data.correo, data.email, user.correo, claims.correo, claims.email, claims.sub, "")),
      biografia: user.biografia,
      invitado: false,
      rol: (data.rol || claims.rol) === "ADMIN" ? "admin" : "cliente",
      autenticadoApi: true,
    },
  };
}

export async function iniciarSesionApi(correo, contrasena) {
  const response = await apiRequest(API_PATHS.login, {
    method: "POST",
    body: { email: correo.trim(), password: contrasena },
  });
  const result = authParts(response);
  if (!result.token) {
    throw new ApiError("La respuesta de autenticación no incluyó un token de acceso.");
  }
  saveAccessToken(result.token);
  return result.usuario;
}

export async function registrarUsuarioApi(datos) {
  const response = await apiRequest(API_PATHS.register, {
    method: "POST",
    body: {
      nombre: [datos.nombre, datos.apellido].filter(Boolean).map((s) => s.trim()).join(" "),
      email: datos.correo.trim(),
      password: datos.contrasena,
    },
  });
  const result = authParts(response);
  if (result.token) {
    saveAccessToken(result.token);
    return { usuario: result.usuario, autenticado: true };
  }
  return {
    usuario: {
      ...result.usuario,
      correo: datos.correo.trim(),
      nombre: datos.nombre.trim(),
    },
    autenticado: false,
  };
}

export function usuarioDesdeToken() {
  const token = readAccessToken();
  if (!token) return null;
  const claims = decodeTokenClaims(token);
  if (Number.isFinite(Number(claims.exp)) && Number(claims.exp) * 1000 <= Date.now()) {
    clearAccessToken();
    return null;
  }
  const { usuario } = authParts({ token });
  if (usuario.id && usuario.correo) return usuario;
  clearAccessToken();
  return null;
}

export async function obtenerProductos(options = {}) {
  return normalizeProducts(await apiRequest(API_PATHS.products, options));
}

export async function obtenerProducto(id, options = {}) {
  return normalizeProduct(
    await apiRequest(`${API_PATHS.products}/${encodeURIComponent(id)}`, options),
  );
}

export async function obtenerPerfil(id, options = {}) {
  return normalizeProfile(await apiRequest(API_PATHS.profile(id), options));
}

export async function actualizarPerfil(id, cambios) {
  const actualizado = await apiRequest(API_PATHS.profile(id), {
    method: "PATCH",
    body: {
      nombre: cambios.nombre.trim(),
      biografia: cambios.biografia.trim(),
    },
  });
  return normalizeProfile(actualizado);
}

export async function obtenerPedidos(id, options = {}) {
  const response = unwrap(
    await apiRequest(API_PATHS.ordersForUser(id), options),
  );
  const rows = Array.isArray(response)
    ? response
    : response?.content || response?.pedidos || response?.items || [];
  return rows.map(normalizeOrder);
}

export async function crearPedidoApi(id, carrito, entrega, metodoPago, solicitudId) {
  const response = await apiRequest(API_PATHS.orders, {
    method: "POST",
    body: {
      usuarioId: Number(id),
      solicitudId,
      tipoEntrega: entrega.entrega,
      direccionEntrega: entrega.entrega === "retiro" ? "Retiro en tienda" : [entrega.direccion.trim(), entrega.comuna.trim()].join(", "),
      nombreContacto: entrega.nombre.trim(),
      correoContacto: entrega.correo.trim(),
      metodoPago,
      items: carrito.map((item) => ({
        productoId: Number(item.id),
        cantidad: item.cantidad,
      })),
    },
  });
  return normalizeOrder(response);
}
