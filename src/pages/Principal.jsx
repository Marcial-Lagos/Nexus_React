import { Link } from "react-router";
import Footer from "../components/Footer.jsx";
import TarjetaTransmision from "../components/TarjetaTransmision.jsx";
import { transmisiones } from "../data/nexus.js";

export default function Principal({ busqueda = "", onClearSearch }) {
  const texto = busqueda.trim().toLocaleLowerCase("es");
  const canales = transmisiones.filter((canal) =>
    (canal.busqueda + " " + canal.titulo)
      .toLocaleLowerCase("es")
      .includes(texto),
  );
  return (
    <main className="principal-aplicacion">
      <div className="contenedor-contenido">
        <section className="destacado">
          <div className="texto-destacado">
            <span className="insignia-en-vivo">● EN VIVO</span>
            <h1>
              Aprende código
              <br />
              sin quedarte dormido.
            </h1>
            <p>
              <strong>lLGNDl</strong> está creando una web desde cero y
              respondiendo preguntas del chat.
            </p>
            <div className="acciones-destacado">
              <Link className="boton boton-primario" to="/stream">
                Ver transmisión
              </Link>
              <Link className="boton boton-suave" to="/comunidad">
                Entrar a la comunidad
              </Link>
            </div>
          </div>
          <Link
            className="imagen-destacada"
            to="/stream"
            aria-label="Abrir transmisión destacada"
          >
            <img
              src="/img/img_carrusel_1.png"
              alt="Transmisión destacada de programación"
            />
            <span className="contador-espectadores">● 6767 espectadores</span>
          </Link>
        </section>
        <section className="bloque-seccion" id="explorar">
          <div className="titulo-seccion">
            <div>
              <span className="subtitulo">PARA TI</span>
              <h2>Canales recomendados</h2>
            </div>
            <button className="enlace-cambio" onClick={onClearSearch}>
              Ver todos
            </button>
          </div>
          <div className="cuadricula-transmisiones">
            {canales.map((canal) => (
              <TarjetaTransmision key={canal.id} canal={canal} />
            ))}
          </div>
          {canales.length === 0 && (
            <p className="busqueda-vacia visible" role="status">
              No existen canales con esa búsqueda.
            </p>
          )}
        </section>
      </div>
      <Footer />
    </main>
  );
}
