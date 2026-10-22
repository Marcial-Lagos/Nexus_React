import { useState } from "react";
import { Link } from "react-router";
import LoginForm from "../components/LoginForm.jsx";
import RegistroForm from "../components/RegistroForm.jsx";
import Footer from "../components/Footer.jsx";

export default function Login({ onLogin, onGuest }) {
  const [registro, setRegistro] = useState(false);
  const [cuenta, setCuenta] = useState(null);
  function registrado(datos) {
    setCuenta(datos);
    setRegistro(false);
  }
  return (
    <main className="cuerpo-inicio-sesion diseno-inicio-sesion">
      <section className="promocion-inicio-sesion">
        <Link className="marca marca-grande" to="/">
          <span className="simbolo-marca">N</span>
          <span>NEXUS</span>
        </Link>
        <div className="texto-promocion">
          <span className="subtitulo">COMUNIDADES - STREAMS - AMIGOS</span>
          <h1>Tu lugar favorito para ver transmisiones, hablar y compartir.</h1>
          <p>
            Descubre transmisiones, comunidades y personas con tus mismos gustos
            e intereses.
          </p>
          <div className="etiquetas-promocion">
            {["gaming", "programación", "música", "universidad"].map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>
        <Footer compacto />
      </section>
      <section className="panel-inicio-sesion" aria-label="Acceso a Nexus">
        <div
          className={`contenedor-tarjeta-giratoria${registro ? " modo-registro" : ""}`}
        >
          <div className={`tarjeta-giratoria${registro ? " girada" : ""}`}>
            <LoginForm
              key={cuenta?.correo || "login"}
              activo={!registro}
              correoInicial={cuenta?.correo}
              aviso={
                cuenta
                  ? "Cuenta validada correctamente en modo demostración. Ya puedes iniciar sesión."
                  : ""
              }
              onLogin={(datos) =>
                onLogin({
                  ...datos,
                  nombre:
                    cuenta?.correo === datos.correo
                      ? cuenta.usuario
                      : datos.correo.split("@")[0],
                })
              }
              onGuest={onGuest}
              onShowRegistro={() => setRegistro(true)}
            />
            <RegistroForm
              activo={registro}
              onRegistered={registrado}
              onShowLogin={() => setRegistro(false)}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
