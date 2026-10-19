import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import BarraServidores from '../components/BarraServidores.jsx';

const mensajesIniciales = [
  { nombre: 'KiraPlay', iniciales: 'K', color: 'azul', hora: 'Hoy, 15:49', texto: '¿Alguien se conecta a jugar esta tarde? 🎮' },
  { nombre: 'AlexMusic', iniciales: 'A', color: 'naranja', hora: 'Hoy, 15:44', texto: 'Yo después de las 18:00. Primero tengo que terminar un trabajo 😭' },
  { nombre: 'MarcialDev', iniciales: 'M', color: 'morado', hora: 'Hoy, 15:41', texto: 'Estoy armando el stream de programación. Después me sumo.', enlace: true },
];
const canales = ['reglas', 'anuncios', 'general', 'juegos', 'memes', 'programación', 'musica', 'Sala general', 'Ranked'];

export default function Comunidad({ usuario, cantidadCarrito = 0 }) {
  const [parametros, setParametros] = useSearchParams();
  const solicitado = parametros.get('canal');
  const canal = canales.includes(solicitado) ? solicitado : 'general';
  const [mensajes, setMensajes] = useState({ general: mensajesIniciales });
  const [texto, setTexto] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [buscar, setBuscar] = useState(false);
  const [miembros, setMiembros] = useState(true);
  const [menu, setMenu] = useState(false);
  const [aviso, setAviso] = useState('');
  const final = useRef(null);
  useEffect(() => {
    if (mensajes[canal]?.at(-1)?.hora === 'Ahora') final.current?.scrollIntoView?.({ behavior: 'smooth', block: 'end' });
  }, [mensajes, canal]);
  function cambiarCanal(nombre) { setParametros({ canal: nombre }); setTexto(''); setBusqueda(''); setMenu(false); setAviso(nombre === 'Sala general' || nombre === 'Ranked' ? 'Sala de voz de demostración. No se transmite audio.' : ''); }
  function enviar(evento) {
    evento.preventDefault();
    if (!texto.trim()) return;
    setMensajes((actual) => ({ ...actual, [canal]: [...(actual[canal] || []), { nombre: usuario.nombre, iniciales: usuario.nombre.slice(0, 2).toUpperCase(), color: 'verde', hora: 'Ahora', texto: texto.trim() }] }));
    setTexto('');
  }
  const lista = (mensajes[canal] || []).filter((m) => (m.texto + m.nombre).toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es')));
  return (
    <div className={`cuerpo-comunidad${miembros ? '' : ' sin-miembros'}`}>
      <BarraServidores cantidadCarrito={cantidadCarrito} />
      <aside className={`barra-lateral-canales${menu ? ' abierto' : ''}`}>
        <div className="titulo-comunidad"><div><span className="avatar avatar-azul">G</span><span><strong>Gaming Chile</strong><small>Comunidad pública</small></span></div><Link to="/principal" aria-label="Volver al inicio">⌄</Link></div>
        <nav className="desplazamiento-canales" aria-label="Canales de la comunidad">
          <p className="encabezado-lateral">INFORMACIÓN</p>
          {canales.map((nombre, i) => <div key={nombre}>{i === 2 && <p className="encabezado-lateral">CANALES DE TEXTO</p>}{i === 7 && <p className="encabezado-lateral">VOZ</p>}<button className={`elemento-canal${canal === nombre ? ' activo' : ''}`} onClick={() => cambiarCanal(nombre)}>{i >= 7 ? '🔊' : '#'} {nombre}</button></div>)}
        </nav>
        <div className="perfil-mini"><span className="avatar avatar-verde">{usuario.nombre.slice(0, 2).toUpperCase()}</span><span><strong>{usuario.nombre}</strong><small>En línea</small></span><Link to="/perfil" aria-label="Editar mi perfil">⚙</Link></div>
      </aside>
      <main className="principal-chat">
        <header className="encabezado-chat">
          <button className="menu-movil" aria-label="Abrir canales" aria-expanded={menu} onClick={() => setMenu(!menu)}>☰</button>
          <div><strong># {canal}</strong><span>Conversación {canal === 'general' ? 'general de la comunidad' : 'del canal'}</span></div>
          <div className="herramientas-chat"><button aria-label="Llamada de voz" onClick={() => setAviso('Llamada de demostración. No se transmite audio.')}>☏</button><button aria-label="Mostrar u ocultar miembros" aria-pressed={miembros} onClick={() => setMiembros(!miembros)}>◉</button><button aria-label="Buscar mensajes" aria-expanded={buscar} onClick={() => setBuscar(!buscar)}>⌕</button></div>
        </header>
        {buscar && <input className="busqueda-chat" aria-label="Buscar en el canal" type="search" placeholder="Buscar mensajes" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />}
        {aviso && <p className="aviso-local" role="status">{aviso}</p>}
        <section className="mensajes" aria-label="Mensajes del canal" aria-live="polite">
          <div className="introduccion-canal"><div className="circulo-numeral">#</div><h1>Te damos la bienvenida a #{canal}</h1><p>Este es el comienzo del canal {canal} de Gaming Chile.</p></div>
          {canal === 'reglas' && <p>Respeta a las personas de la comunidad. Comparte, diviértete y evita el spam.</p>}
          {canal === 'anuncios' && <p>Bienvenid@ a Gaming Chile. Las novedades de la comunidad se publican aquí.</p>}
          {lista.map((m, indice) => <article className="mensaje" key={indice}><span className={`avatar avatar-${m.color}`}>{m.iniciales}</span><div><p className="metadatos-mensaje"><strong>{m.nombre}</strong><time>{m.hora}</time></p><p>{m.texto}</p>{m.enlace && <Link className="tarjeta-enlace-mensaje" to="/stream"><span>EN VIVO</span><strong>Creando una web desde cero</strong><small>nexus.tv/MarcialDev</small></Link>}</div></article>)}
          {busqueda && lista.length === 0 && <p role="status">No hay mensajes con esa búsqueda.</p>}
          <div ref={final} />
        </section>
        <form className="caja-mensaje" onSubmit={enviar}>
          <button type="button" aria-label="Adjuntar archivo" onClick={() => setAviso('Los archivos adjuntos requieren un servidor; este chat permite mensajes de texto locales.')}>＋</button>
          <input autoComplete="off" aria-label="Mensaje para la comunidad" placeholder={`Enviar mensaje a #${canal}`} value={texto} onChange={(e) => setTexto(e.target.value)} maxLength={2000} />
          <button type="button" aria-label="Añadir emoji" onClick={() => setTexto((t) => t + ' 😊')}>☺</button><button type="submit" aria-label="Enviar mensaje a la comunidad">➤</button>
        </form>
      </main>
      {miembros && <aside className="barra-lateral-miembros">
        <p className="encabezado-lateral">EN LÍNEA — 4</p>
        {[[usuario.nombre, 'Estudiando', 'verde', usuario.nombre.slice(0, 2).toUpperCase()], ['lLGNDl', 'En directo', 'morado', 'LG'], ['KiraPlay', 'Jugando Overwatch', 'azul', 'K'], ['AlexMusic', 'Escuchando música', 'naranja', 'A']].map(([nombre, estado, color, iniciales], indice) => <div className="miembro" key={indice}><span className={`avatar avatar-${color}`}>{iniciales}</span><span><strong>{nombre}</strong><small>{estado}</small></span></div>)}
        <p className="encabezado-lateral">DESCONECTADOS — 2</p>{['Carlos', 'Sofía'].map((nombre) => <div className="miembro desconectado" key={nombre}><span className="avatar">{nombre[0]}</span><span><strong>{nombre}</strong></span></div>)}
      </aside>}
    </div>
  );
}

