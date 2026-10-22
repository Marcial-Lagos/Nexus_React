import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import CampoFormulario from "../components/CampoFormulario.jsx";
import { validarEntrega, prepararCompra } from "../data/pedidos.js";
import { precioCLP } from "../data/nexus.js";
export default function Checkout({ usuario, datos, carrito, onConfirm }) {
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
  function confirmar(e) {
    e.preventDefault();
    if (ocupado.current) return;
    const validaciones = validarEntrega(form);
    setErrores(validaciones);
    if (Object.keys(validaciones).length) return;
    ocupado.current = true;
    try {
      const resultado = onConfirm(form, pago, compraId.current);
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
    }
  }
  return (
    <main className="container py-4" style={{ maxWidth: 900 }}>
      <Link to="/tienda">Volver al carrito</Link>
      <h1 className="my-3">Finalizar compra</h1>
      <p>
        Compra de demostración. No se cobran pagos reales ni se solicitan datos
        bancarios.
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
              {error && <p role="alert">{error}</p>}
              <button className="btn btn-primary mt-3" type="submit">
                Confirmar compra simulada
              </button>
            </form>
          </section>
          <section className="col-md-5" aria-label="Resumen de compra">
            <h2>Resumen</h2>
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
