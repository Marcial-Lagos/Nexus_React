import { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router";
import Navbar from "./components/Navbar.jsx";
import BarraServidores from "./components/BarraServidores.jsx";
import Login from "./pages/Login.jsx";
import Principal from "./pages/Principal.jsx";
import Comunidad from "./pages/Comunidad.jsx";
import Contacto from "./pages/Contacto.jsx";
import Perfil from "./pages/Perfil.jsx";
import Tienda from "./pages/Tienda.jsx";
import Producto from "./pages/Producto.jsx";
import Stream from "./pages/Stream.jsx";
import { biografiaOriginal } from "./data/nexus.js";
import { guardarSesion, leerSesion } from "./utils/sesion.js";
import "./App.css";
import Checkout from "./pages/Checkout.jsx";
import ResultadoCompra from "./pages/ResultadoCompra.jsx";
import {
  crearPedido,
  prepararCompra,
  cambiarEstadoPedido,
  validarEntrega,
} from "./data/pedidos.js";
import Admin from "./pages/Admin.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import {
  leerAdministracion,
  guardarAdministracion,
  guardarEntidad,
  eliminarEntidad,
  esAdmin,
} from "./data/administracion.js";

import { precioVenta } from "./data/catalogo.js";
import {
  actualizarPerfil,
  apiConfigured,
  clearAccessToken,
  crearPedidoApi,
  obtenerPedidos,
  obtenerPerfil,
  obtenerProducto,
  obtenerProductos,
  registrarUsuarioApi,
  iniciarSesionApi,
  usuarioDesdeToken,
} from "./api/client.js";

export default function App() {
  const apiMode = apiConfigured();
  const [usuario, setUsuario] = useState(() => {
    const autenticado = usuarioDesdeToken();
    if (autenticado) return autenticado;
    const sesion = leerSesion();
    if (apiMode && sesion?.autenticadoApi) return null;
    return sesion ? { ...sesion, id: sesion.id || crypto.randomUUID() } : null;
  });
  const [administracion, setAdministracion] = useState(leerAdministracion);
  const [avisoAdmin, setAvisoAdmin] = useState("");
  const [productosApi, setProductosApi] = useState([]);
  const [cargandoProductos, setCargandoProductos] = useState(apiMode);
  const [errorProductos, setErrorProductos] = useState("");
  const [productoDetalleApi, setProductoDetalleApi] = useState(null);
  const [errorDetalleApi, setErrorDetalleApi] = useState(null);
  const [pedidosApi, setPedidosApi] = useState([]);
  const [idPerfilCargado, setIdPerfilCargado] = useState("");
  const [errorPerfil, setErrorPerfil] = useState("");
  const [errorPedidos, setErrorPedidos] = useState("");
  function actualizarDatos(nuevos) {
    const persistido = guardarAdministracion(nuevos);
    setAdministracion(nuevos);
    setAvisoAdmin(
      persistido
        ? ""
        : "El navegador bloqueó el almacenamiento. Los cambios solo durarán mientras esta página esté abierta.",
    );
  }
  const [carrito, setCarrito] = useState([]);
  const [menu, setMenu] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const ubicacion = useLocation();
  const productoSeleccionado =
    new URLSearchParams(ubicacion.search).get("producto");
  const detalleVisible =
    ubicacion.pathname === "/producto" &&
    productoDetalleApi?.id === productoSeleccionado
      ? productoDetalleApi
      : null;
  const productos = apiMode
    ? productosApi.map((producto) =>
        producto.id === detalleVisible?.id ? detalleVisible : producto,
      )
    : administracion.productos;
  const cargandoPerfil = Boolean(
    apiMode &&
      usuario?.id &&
      !usuario.invitado &&
      idPerfilCargado !== usuario.id,
  );
  const errorDetalleVisible =
    errorDetalleApi?.id === productoSeleccionado
      ? errorDetalleApi.message
      : "";
  const categorias = apiMode
    ? [...new Set(productosApi.map((producto) => producto.categoria).filter(Boolean))].map(
        (id) => ({ id, nombre: id }),
      )
    : administracion.categorias;

  useEffect(() => {
    guardarSesion(usuario);
  }, [usuario]);
  useEffect(() => {
    if (!apiMode) return undefined;
    const controller = new AbortController();
    obtenerProductos({ signal: controller.signal })
      .then((catalogo) => {
        setProductosApi(catalogo);
        setErrorProductos("");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setErrorProductos(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargandoProductos(false);
      });
    return () => controller.abort();
  }, [apiMode]);
  useEffect(() => {
    if (!apiMode || ubicacion.pathname !== "/producto") return undefined;
    const producto = productosApi.find(
      (item) => item.id === productoSeleccionado,
    );
    if (!producto) return undefined;
    const controller = new AbortController();
    obtenerProducto(producto.id, { signal: controller.signal })
      .then((detalle) => {
        setProductoDetalleApi(detalle);
        setErrorDetalleApi(null);
      })
      .catch((error) => {
        if (error.name !== "AbortError")
          setErrorDetalleApi({ id: producto.id, message: error.message });
      });
    return () => controller.abort();
  }, [apiMode, ubicacion.pathname, productoSeleccionado, productosApi]);
  useEffect(() => {
    if (!apiMode || !usuario?.id || usuario.invitado) return undefined;
    const controller = new AbortController();
    Promise.allSettled([
      obtenerPerfil(usuario.id, { signal: controller.signal }),
      obtenerPedidos(usuario.id, { signal: controller.signal }),
    ]).then(([perfil, pedidos]) => {
      if (controller.signal.aborted) return;
      if (perfil.status === "fulfilled") {
        setErrorPerfil("");
        setUsuario((actual) => ({
          ...actual,
          nombre: perfil.value.nombre || actual.nombre,
          correo: perfil.value.correo || actual.correo,
          biografia: perfil.value.biografia || actual.biografia,
        }));
      } else {
        setErrorPerfil(perfil.reason.message);
      }
      if (pedidos.status === "fulfilled") {
        setErrorPedidos("");
        setPedidosApi(pedidos.value);
      } else {
        setErrorPedidos(pedidos.reason.message);
      }
      setIdPerfilCargado(usuario.id);
    });
    return () => controller.abort();
  }, [apiMode, usuario?.id, usuario?.invitado]);
  useEffect(() => {
    function cerrarSesionExpirada() {
      setUsuario(null);
      setCarrito([]);
    }
    window.addEventListener("nexus:session-expired", cerrarSesionExpirada);
    return () =>
      window.removeEventListener("nexus:session-expired", cerrarSesionExpirada);
  }, []);
  function iniciarSesion(datos) {
    setUsuario({
      id: crypto.randomUUID(),
      nombre: datos.nombre,
      correo: datos.correo,
      invitado: false,
      rol: esAdmin(datos) ? "admin" : "cliente",
      biografia: biografiaOriginal,
    });
  }
  async function autenticar(datos) {
    const autenticado = await iniciarSesionApi(datos.correo, datos.contrasena);
    setUsuario(autenticado);
  }
  async function registrar(datos) {
    const resultado = await registrarUsuarioApi(datos);
    if (resultado.autenticado) setUsuario(resultado.usuario);
    return resultado;
  }
  function invitado() {
    setUsuario({
      id: crypto.randomUUID(),
      nombre: "Invitado",
      correo: "",
      invitado: true,
      rol: "cliente",
      biografia: biografiaOriginal,
    });
  }
  function salir() {
    clearAccessToken();
    setUsuario(null);
    setCarrito([]);
    setMenu(false);
    setBusqueda("");
  }
  function confirmarCompra(entrega, pago, id) {
    if (apiMode) {
      return (async () => {
        if (!usuario?.id || usuario.invitado)
          throw new Error("Inicia sesión con una cuenta del servidor para crear un pedido.");
        if (Object.keys(validarEntrega(entrega)).length)
          throw new Error("Revisa los datos de entrega.");
        if (pago === "rechazado")
          throw new Error("Los pagos reales no están conectados; no se envió el pedido.");
        const pedido = await crearPedidoApi(usuario.id, carrito);
        if (!pedido.id)
          throw new Error(
            "El servidor recibió la solicitud, pero no devolvió el identificador del pedido. Revisa tu historial antes de volver a intentarlo.",
          );
        setPedidosApi((actuales) => [
          pedido,
          ...actuales.filter((existente) => existente.id !== pedido.id),
        ]);
        setCarrito([]);
        obtenerPedidos(usuario.id)
          .then(setPedidosApi)
          .catch((error) => setErrorPedidos(error.message));
        obtenerProductos()
          .then(setProductosApi)
          .catch((error) => setErrorProductos(error.message));
        return { pedido, remoto: true };
      })();
    }
    const actuales = leerAdministracion();
    if (Object.keys(validarEntrega(entrega)).length)
      throw new Error("Revisa los datos de entrega.");
    if (pago === "rechazado") {
      prepararCompra(actuales, carrito, entrega.entrega);
      return { rechazado: true };
    }
    if (pago !== "aprobado") throw new Error("Resultado de pago inválido.");
    const resultado = crearPedido(actuales, carrito, entrega, usuario, id);
    if (!guardarAdministracion(resultado.datos))
      throw new Error(
        "No se pudo guardar el pedido. Habilita el almacenamiento del navegador e intenta nuevamente. No se confirmó la compra.",
      );
    setAdministracion(resultado.datos);
    setCarrito([]);
    return { pedido: resultado.pedido };
  }
  function actualizarPedido(id, estado) {
    const nuevos = cambiarEstadoPedido(
      leerAdministracion(),
      id,
      estado,
      usuario,
    );
    if (!guardarAdministracion(nuevos))
      throw new Error("No se pudo guardar el cambio de estado.");
    setAdministracion(nuevos);
  }
  function agregar(producto, cantidad) {
    const actual = productos.find((p) => p.id === producto.id);
    const acumulado =
      (carrito.find((p) => p.id === producto.id)?.cantidad || 0) + cantidad;
    if (
      !actual ||
      !Number.isSafeInteger(cantidad) ||
      cantidad < 1 ||
      acumulado > actual.stock
    )
      throw new Error("No hay stock suficiente para agregar esa cantidad.");
    setCarrito((actual) => {
      const existente = actual.find((item) => item.id === producto.id);
      return existente
        ? actual.map((item) =>
            item.id === producto.id
              ? { ...item, cantidad: item.cantidad + cantidad }
              : item,
          )
        : [
            ...actual,
            {
              id: producto.id,
              nombre: producto.nombre,
              precio: precioVenta(producto),
              cantidad,
            },
          ];
    });
  }
  function cambiarCantidad(id, diferencia) {
    const stock =
      productos.find((producto) => producto.id === id)?.stock ?? 0;
    setCarrito((actual) =>
      actual.map((item) => {
        if (item.id !== id) return item;
        const cantidad = item.cantidad + diferencia;
        if (cantidad < 1 || (diferencia > 0 && cantidad > stock)) {
          return item;
        }
        return { ...item, cantidad };
      }),
    );
  }
  const cantidadCarrito = carrito.reduce(
    (suma, item) => suma + item.cantidad,
    0,
  );
  const lateral =
    usuario &&
    ["/principal", "/tienda", "/producto"].includes(ubicacion.pathname);
  const simple =
    usuario && ["/perfil", "/stream", "/checkout"].includes(ubicacion.pathname);
  const proteger = (pantalla) =>
    usuario ? pantalla : <Navigate to="/login" replace />;
  const titulos = {
    "/principal": "Principal",
    "/comunidad": "Comunidad",
    "/contacto": "Contacto",
    "/perfil": "Perfil",
    "/tienda": "Tienda",
    "/producto": "Producto",
    "/stream": "Stream",
  };
  if (ubicacion.pathname.startsWith("/admin"))
    return (
      <Routes>
        <Route
          path="/admin/login"
          element={
            esAdmin(usuario) ? (
              <Navigate to="/admin" replace />
            ) : (
              <AdminLogin
                onLogin={(datos) =>
                  setUsuario({ ...datos, id: crypto.randomUUID() })
                }
              />
            )
          }
        />
        <Route
          path="/admin/*"
          element={
            <Admin
              onChangeEstado={actualizarPedido}
              usuario={usuario}
              datos={administracion}
              aviso={
                apiMode
                  ? "El panel sigue siendo una demostración local. El backend no expone autorización de administrador; estos cambios no tienen efecto en el servidor."
                  : avisoAdmin
              }
              onLogout={salir}
              onSave={(tipo, registro) =>
                actualizarDatos(
                  guardarEntidad(administracion, tipo, registro, usuario),
                )
              }
              onDelete={(tipo, id) =>
                actualizarDatos(
                  eliminarEntidad(administracion, tipo, id, usuario),
                )
              }
            />
          }
        />
      </Routes>
    );
  return (
    <div
      className={
        lateral
          ? "cuerpo-aplicacion"
          : ubicacion.pathname === "/perfil"
            ? "pagina-perfil"
            : ubicacion.pathname === "/stream"
              ? "cuerpo-transmision"
              : ""
      }
    >
      <title>Nexus | {titulos[ubicacion.pathname] || "Inicio de sesión"}</title>
      {lateral && (
        <>
          <BarraServidores cantidadCarrito={cantidadCarrito} />
          <Navbar
            usuario={usuario}
            onLogout={salir}
            abierto={menu}
            onNavigate={() => setMenu(false)}
          />
          <header className="barra-superior">
            <button
              className="menu-movil"
              aria-label="Abrir menú"
              aria-expanded={menu}
              aria-controls="navegacionNexus"
              onClick={() => setMenu(!menu)}
            >
              ☰
            </button>
            {ubicacion.pathname === "/principal" ? (
              <div className="contenedor-busqueda">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  aria-label="Buscar streams, categorías o personas"
                  placeholder="Buscar streams, categorías o personas"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            ) : (
              <Link className="marca" to="/principal">
                NEXUS
              </Link>
            )}
            <div className="acciones-superiores">
              <Link
                className="boton-icono"
                to="/contacto"
                aria-label="Contacto"
              >
                ♢
              </Link>
              <Link
                className="avatar avatar-verde"
                to="/perfil"
                aria-label="Mi perfil"
              >
                {usuario.nombre.slice(0, 2).toUpperCase()}
              </Link>
            </div>
          </header>
        </>
      )}
      {simple && (
        <Navbar
          simple
          stream={ubicacion.pathname === "/stream"}
          onSearch={setBusqueda}
          usuario={usuario}
          onLogout={salir}
        />
      )}
      <Routes>
        <Route
          path="/checkout"
          element={proteger(
            <Checkout
              usuario={usuario}
              datos={{ ...administracion, productos }}
              carrito={carrito}
              onConfirm={confirmarCompra}
              apiMode={apiMode}
            />,
          )}
        />
        <Route
          path="/compra/:id"
          element={proteger(
            <ResultadoCompra
              usuario={usuario}
              ordenes={apiMode ? pedidosApi : administracion.ordenes}
              apiMode={apiMode}
              cargando={cargandoPerfil}
            />,
          )}
        />
        <Route
          path="/"
          element={
            usuario ? (
              <Navigate
                to={esAdmin(usuario) ? "/admin" : "/principal"}
                replace
              />
            ) : (
              <Login
                onLogin={iniciarSesion}
                onGuest={invitado}
                onAuthenticate={apiMode ? autenticar : undefined}
                onRegister={apiMode ? registrar : undefined}
                apiMode={apiMode}
              />
            )
          }
        />
        <Route
          path="/login"
          element={
            usuario ? (
              <Navigate
                to={esAdmin(usuario) ? "/admin" : "/principal"}
                replace
              />
            ) : (
              <Login
                onLogin={iniciarSesion}
                onGuest={invitado}
                onAuthenticate={apiMode ? autenticar : undefined}
                onRegister={apiMode ? registrar : undefined}
                apiMode={apiMode}
              />
            )
          }
        />
        <Route
          path="/principal"
          element={proteger(
            <Principal
              busqueda={busqueda}
              onClearSearch={() => setBusqueda("")}
            />,
          )}
        />
        <Route
          path="/comunidad"
          element={proteger(
            <Comunidad usuario={usuario} cantidadCarrito={cantidadCarrito} />,
          )}
        />
        <Route path="/contacto" element={<Contacto />} />
        <Route
          path="/perfil"
          element={proteger(
            usuario && (
              <Perfil
                usuario={usuario}
                apiMode={apiMode}
                cargando={cargandoPerfil}
                error={errorPerfil}
                pedidos={pedidosApi}
                errorPedidos={errorPedidos}
                onUpdate={async (cambios) => {
                  if (apiMode) {
                    if (!usuario?.id || usuario.invitado)
                      throw new Error("No se pudo identificar la cuenta del servidor.");
                    const perfil = await actualizarPerfil(usuario.id, cambios, usuario);
                    setUsuario((actual) => ({
                      ...actual,
                      nombre: perfil.nombre || cambios.nombre,
                      biografia: cambios.biografia,
                    }));
                  } else {
                    setUsuario((actual) => ({ ...actual, ...cambios }));
                  }
                }}
              />
            ),
          )}
        />
        <Route
          path="/tienda"
          element={proteger(
            <Tienda
              categorias={categorias}
              productos={productos}
              apiMode={apiMode}
              cargando={cargandoProductos}
              error={errorProductos}
              carrito={carrito}
              onChangeQuantity={cambiarCantidad}
              onRemove={(id) =>
                setCarrito((actual) => actual.filter((item) => item.id !== id))
              }
              onEmpty={() => setCarrito([])}
            />,
          )}
        />
        <Route
          path="/producto"
          element={proteger(
            <Producto
              categorias={categorias}
              productos={productos}
              cargando={cargandoProductos}
              errorApi={errorProductos || errorDetalleVisible}
              apiMode={apiMode}
              key={ubicacion.search}
              onAdd={agregar}
            />,
          )}
        />
        <Route
          path="/stream"
          element={proteger(<Stream usuario={usuario} />)}
        />
        <Route
          path="*"
          element={
            <Navigate
              to={
                usuario
                  ? esAdmin(usuario)
                    ? "/admin"
                    : "/principal"
                  : "/login"
              }
              replace
            />
          }
        />
      </Routes>
    </div>
  );
}
