import { useEffect, useRef, useState } from 'react';

const iniciales = [
  ['CodeMaster', 'morado', 'quedó mucho mejor el menú'],
  ['Suzu', 'azul', '¿eso está hecho solo con CSS?'],
  ['ArkDerr', 'naranja', 'sí, se ve limpio'],
  ['Cristal_dev', 'verde', 'prueba el responsive ahora'],
  ['pixelcat', 'morado', 'jajaj el bug volvió'],
];
export default function Stream({ usuario }) {
  const [siguiendo, setSiguiendo] = useState(false);
  const [mensajes, setMensajes] = useState(iniciales);
  const [texto, setTexto] = useState('');
  const [pausado, setPausado] = useState(false);
  const [silencio, setSilencio] = useState(false);
  const [ampliado, setAmpliado] = useState(false);
  const [aviso, setAviso] = useState('');
  const final = useRef(null);
  useEffect(() => {
    if (mensajes.length > iniciales.length) final.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [mensajes]);
  function enviar(evento) {
    evento.preventDefault();
    if (!texto.trim()) return;
    setMensajes((actual) => [...actual, [usuario.nombre, 'verde', texto.trim()]]);
    setTexto('');
  }
  return (
    <main className={`diseno-visualizacion${ampliado ? ' modo-cine' : ''}`}>
      <section className="columna-visualizacion">
        <div className={`escenario-video${pausado ? ' video-pausado' : ''}`}>
          <div className="video-simulado">
            <div className="ventana-codigo"><div className="puntos-codigo">● ● ●</div><pre><span>&lt;section</span>{' class="hero">\n  <h1>Hola Nexus!</h1>\n  <p>Creamos comunidad.</p>\n'}<span>&lt;/section&gt;</span></pre></div>
            <div className="tarjeta-camara"><span className="avatar avatar-morado extra-grande">LG</span><strong>lLGNDl</strong><small>{pausado ? 'PAUSA' : 'LIVE'}</small></div>
          </div>
          <div className="controles-video">
            <button aria-label={pausado ? 'Reanudar simulación' : 'Pausar simulación'} onClick={() => setPausado(!pausado)}>{pausado ? '▶' : 'Ⅱ'}</button>
            <button aria-label={silencio ? 'Activar sonido simulado' : 'Silenciar simulación'} aria-pressed={silencio} onClick={() => setSilencio(!silencio)}>{silencio ? '🔇' : '🔊'}</button>
            <span className="insignia-en-vivo pequeno">EN VIVO · DEMO</span><span className="expandir" />
            <button aria-label="Información del reproductor" onClick={() => setAviso('Vídeo y audio simulados, igual que en el prototipo original. No hay transmisión real.')}>⚙</button>
            <button aria-label="Modo cine" aria-pressed={ampliado} onClick={() => setAmpliado(!ampliado)}>⛶</button>
          </div>
        </div>
        <div className="detalle-transmision">
          <div className="fila-creador"><span className="avatar avatar-morado grande">LG</span><div><h1>Creando una web desde cero</h1><p><strong>lLGNDl</strong> · Programación</p><div>{['HTML', 'CSS', 'JavaScript'].map((tag) => <span className="etiqueta-categoria" key={tag}>{tag}</span>)}</div></div>
            <div className="acciones-transmision"><button className={`boton boton-primario${siguiendo ? ' siguiendo' : ''}`} aria-pressed={siguiendo} onClick={() => setSiguiendo(!siguiendo)}>{siguiendo ? '✓ Siguiendo' : '♡ Seguir'}</button><button className="boton boton-suave" onClick={() => setAviso(`Comparte este enlace: ${window.location.origin}/stream`)}>↗ Compartir</button></div>
          </div>
          {aviso && <p className="aviso-local" role="status">{aviso}</p>}
          <div className="tarjeta-acerca"><div><h2>Acerca de lLGNDl</h2><p>Programación, proyectos universitarios y desarrollo web sin complicarlo más de la cuenta.</p></div><strong>{siguiendo ? '6.7K + 1' : '6.7K'} seguidores</strong></div>
        </div>
      </section>
      <aside className="chat-transmision">
        <header>CHAT EN VIVO <button aria-label="Información del chat" onClick={() => setAviso('Chat local de demostración. Tus mensajes son visibles solo en esta pestaña.')}>⋮</button></header>
        <div className="lista-chat-en-vivo" aria-label="Mensajes del stream" aria-live="polite">{mensajes.map(([nombre, color, mensaje], i) => <p key={i}><strong className={`nombre-${color}`}>{nombre}: </strong>{mensaje}</p>)}<div ref={final} /></div>
        <form className="formulario-chat-en-vivo" onSubmit={enviar}><input aria-label="Mensaje para el stream" placeholder="Enviar un mensaje" value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={2000} /><div><button type="button" className="boton-sin-fondo" aria-label="Añadir emoji al chat" onClick={() => setTexto((t) => t + ' 😊')}>☺</button><button className="boton boton-primario" type="submit">Chat</button></div></form>
      </aside>
    </main>
  );
}

