import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import CampoFormulario from "../components/CampoFormulario.jsx";
import { validarEntrega, prepararCompra } from "../data/pedidos.js";
import { precioCLP } from "../data/nexus.js";
export default function Checkout({
  usuario,
  datos,
  carrito,
  onConfirm,
  apiMode = false,
  onGuestLogin,
}) {
  const [borrador] = useState(() => {
    if (!apiMode || !usuario?.autenticadoApi) return null;
    try {
      const previo = JSON.parse(sessionStorage.getItem("nexus.entrega"));
      return previo?.usuarioId === usuario.id ? previo : null;
    } catch { return null; }
  });
  const [form, setForm] = useState(() => borrador?.form || {
    nombre: usuario?.nombre || "",
    correo: usuario?.correo || "",
    direccion: "",
    comuna: "",
    entrega: "retiro",
  });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [pago, setPago] = useState(borrador?.pago || (apiMode ? "TARJETA" : "aprobado"));
  useEffect(() => {
    if (!apiMode || !usuario?.autenticadoApi) return;
    try { sessionStorage.setItem("nexus.entrega", JSON.stringify({ usuarioId: usuario.id, form, pago })); }
    catch { /* El formulario sigue disponible mientras está abierto. */ }
  }, [apiMode, usuario?.id, usuario?.autenticadoApi, form, pago]);
  const [enviando, setEnviando] = useState(false);
  const compraId = useRef(crypto.randomUUID());
  const ocupado = useRef(false);
  const navegar = useNavigate();
  let resumen, errorCarrito;
  try {
    resumen = prepararCompra(datos, carrito, form.entrega);
  } catch (err) {
    errorCarrito = err.message;
  }
  function campo(id, label, type = "text") {
    return (
      <CampoFormulario
        id={id}
        label={label}
        type={type}
        required
        value={form[id]}
        error={errores[id]}
        onChange={(e) => {
          setForm({ ...form, [id]: e.target.value });
          setError("");
        }}
      />
    );
  }
  async function confirmar(e) {
    e.preventDefault();
    if (ocupado.current || enviando) return;
    const validaciones = validarEntrega(form);
    setErrores(validaciones);
    if (Object.keys(validaciones).length) return;
    ocupado.current = true;
    setEnviando(true);
    try {
      let intento = compraId.current;
      if (apiMode) {
        const firma = JSON.stringify([usuario.id, carrito.map((i) => [i.id, i.cantidad]), form, pago]);
        const previo = JSON.parse(sessionStorage.getItem("nexus.intento") || "null");
        intento = previo?.firma === firma ? previo.id : crypto.randomUUID();
        sessionStorage.setItem("nexus.intento", JSON.stringify({ firma, id: intento }));
      }
      const resultado = apiMode
        ? await onConfirm(form, pago, intento)
        : onConfirm(form, pago, compraId.current);
      if (apiMode) {
        sessionStorage.removeItem("nexus.intento");
        sessionStorage.removeItem("nexus.entrega");
      }
      navegar(
        resultado.rechazado
          ? "/compra/rechazada"
          : `/compra/${resultado.pedido.id}`,
        {
          replace: true,
          state: resultado.rechazado ? { rechazo: true } : null,
        },
      );
    } catch (err) {
      setError(err.message);
      ocupado.current = false;
    } finally {
      setEnviando(false);
    }
  }
  return (
    <main className="container py-4" style={{ maxWidth: 900 }}>
      <Link to="/tienda">Volver al carrito</Link>
      <h1 className="my-3">Finalizar compra</h1>
      <p>
        {apiMode
          ? "Guardaremos el pedido y la entrega en tu cuenta. El pago es simulado."
          : "Compra de demostración. No se cobran pagos reales ni se solicitan datos bancarios."}
      </p>
      {apiMode && usuario?.invitado ? (
        <p><Link className="btn btn-primary" to="/login" state={{ volver: "/checkout" }} onClick={onGuestLogin}>Inicia sesión para confirmar tu carrito</Link></p>
      ) : errorCarrito ? (
        <p role="alert">{errorCarrito}</p>
      ) : (
        <div className="row g-4">
          <section className="col-md-7">
            <h2>Datos de entrega</h2>
            <form noValidate onSubmit={confirmar} aria-label="Checkout">
              {campo("nombre", "Nombre completo")}
              {campo("correo", "Correo de contacto", "email")}
              <label htmlFor="entrega">Forma de entrega</label>
              <select
                id="entrega"
                className="form-select my-2"
                value={form.entrega}
                onChange={(e) => setForm({ ...form, entrega: e.target.value })}
              >
                <option value="retiro">Retiro sin costo</option>
                <option value="domicilio">Despacho a domicilio — $3.990</option>
              </select>
              {form.entrega === "domicilio" && (
                <>
                  {campo("direccion", "Dirección")}
                  {campo("comuna", "Comuna")}
                </>
              )}
              {apiMode && (<>
                <label htmlFor="metodoPago">Método de pago simulado</label>
                <select id="metodoPago" className="form-select my-2" value={pago} onChange={(e) => setPago(e.target.value)}>
                  <option value="TARJETA">Tarjeta de prueba</option>
                  <option value="TRANSFERENCIA">Transferencia de prueba</option>
                  <option value="EFECTIVO">Efectivo de prueba</option>
                </select>
              </>)}
              {!apiMode && (
                <>
                  <label htmlFor="pagoSimulado">Resultado del pago de prueba</label>
                  <select
                    id="pagoSimulado"
                    className="form-select my-2"
                    value={pago}
                    onChange={(e) => setPago(e.target.value)}
                  >
                    <option value="aprobado">Simular pago aprobado</option>
                    <option value="rechazado">Simular pago rechazado</option>
                  </select>
                </>
              )}
              {error && <p role="alert">{error}</p>}
              <button
                className="btn btn-primary mt-3"
                type="submit"
                disabled={enviando}
              >
                {enviando
                  ? "Enviando pedido…"
                  : apiMode
                    ? "Crear pedido"
                    : "Confirmar compra simulada"}
              </button>
            </form>
          </section>
          <section className="col-md-5" aria-label="Resumen de compra">
            <h2>{apiMode ? "Estimación del catálogo" : "Resumen"}</h2>
            <ul>
              {resumen.items.map((i) => (
                <li key={i.id}>
                  {i.nombre} × {i.cantidad}: {precioCLP(i.precio * i.cantidad)}
                </li>
              ))}
            </ul>
            <p>Subtotal: {precioCLP(resumen.subtotal)}</p>
            <p>Envío: {precioCLP(resumen.envio)}</p>
            <strong>Total: {precioCLP(resumen.total)}</strong>
          </section>
        </div>
      )}
    </main>
  );
}
