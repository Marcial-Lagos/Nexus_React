import { useRef, useState } from "react";
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
}) {
  const [form, setForm] = useState({
    nombre: usuario?.nombre || "",
    correo: usuario?.correo || "",
    direccion: "",
    comuna: "",
    entrega: "retiro",
  });
  const [errores, setErrores] = useState({});
  const [error, setError] = useState("");
  const [pago, setPago] = useState("aprobado");
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
      const resultado = apiMode
        ? await onConfirm(form, pago, compraId.current)
        : onConfirm(form, pago, compraId.current);
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
          ? "El pedido se enviará al servidor. Los campos de entrega se conservan solo en esta pantalla porque el contrato auditado no define datos de despacho; no se procesará un pago."
          : "Compra de demostración. No se cobran pagos reales ni se solicitan datos bancarios."}
      </p>
      {errorCarrito ? (
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
            {apiMode ? (
              <p>
                El servidor valida precios, stock y monto final. Esta estimación
                y los datos de entrega no se envían en el contrato disponible.
              </p>
            ) : (
              <>
                <p>Subtotal: {precioCLP(resumen.subtotal)}</p>
                <p>Envío: {precioCLP(resumen.envio)}</p>
                <strong>Total: {precioCLP(resumen.total)}</strong>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
