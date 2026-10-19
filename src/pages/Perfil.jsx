import { useState } from 'react';
import { Link } from 'react-router';
import Modal from '../components/Modal.jsx';
import CampoFormulario from '../components/CampoFormulario.jsx';

export default function Perfil({ usuario, onUpdate }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(usuario.nombre);
  const [biografia, setBiografia] = useState(usuario.biografia);
  const [aviso, setAviso] = useState('');
  function editar() { setNombre(usuario.nombre); setBiografia(usuario.biografia); setEditando(true); }
  function guardar(evento) {
    evento.preventDefault();
    onUpdate({ nombre: nombre.trim() || 'Marcial', biografia: biografia.trim() });
    setEditando(false);
    setAviso('Perfil actualizado en esta sesión de demostración.');
  }
  return (
    <main className="contenido-perfil">
      <section className="banner-perfil" aria-label="Banner del perfil"><div className="forma-banner uno" /><div className="forma-banner dos" /></section>
      <section className="tarjeta-encabezado-perfil">
        <div className="avatar-perfil-xl">{usuario.nombre.slice(0, 2).toUpperCase()}<span /></div>
        <div className="identidad-perfil"><h1>{usuario.nombre}</h1><p>@{usuario.correo?.split('@')[0] || 'invitado'} · Miembro desde 2026</p><div className="estadisticas-perfil"><span><strong>67000</strong> seguidores</span><span><strong>46</strong> siguiendo</span><span><strong>3</strong> comunidades</span></div></div>
        <button className="boton boton-primario" onClick={editar}>Editar perfil</button>
      </section>
      {aviso && <p className="mensaje-formulario exito" role="status">{aviso}</p>}
      <div className="columnas-perfil">
        <section className="tarjeta-panel"><h2>Acerca de mí</h2><p>{usuario.biografia}</p><div className="fila-informacion"><span>📍</span><div><small>Ubicación</small><strong>Chile</strong></div></div><div className="fila-informacion"><span>🎮</span><div><small>Intereses</small><strong>Gaming · Programación · Música</strong></div></div></section>
        <section className="tarjeta-panel panel-actividad">
          <div className="titulo-seccion titulo-compacto"><div><h2>Actividad reciente</h2></div><Link to="/comunidad">Ver todo</Link></div>
          {[
            ['💬', 'Escribiste en Gaming Chile', '“Estoy armando el stream de programación...”', 'Hace 20 minutos'],
            ['♥', 'Seguiste a KiraPlay', 'Canal de Overwatch y contenido competitivo.', 'Ayer'],
            ['🎮', 'Te uniste a una comunidad', 'Gaming Chile', 'Hace 3 días'],
          ].map(([icono, titulo, texto, fecha]) => <article className="elemento-actividad" key={titulo}><span className="icono-actividad">{icono}</span><div><strong>{titulo}</strong><p>{texto}</p><small>{fecha}</small></div></article>)}
          <p className="nota-demo">Estadísticas y actividad de ejemplo del prototipo original.</p>
        </section>
      </div>
      {editando && <Modal titulo="Editar perfil" onClose={() => setEditando(false)}>
        <form onSubmit={guardar}>
          <CampoFormulario id="editarNombre" label="Nombre" value={nombre} maxLength={30} onChange={(e) => setNombre(e.target.value)} />
          <CampoFormulario id="editarBiografia" label="Biografía" multilinea rows={4} maxLength={500} value={biografia} onChange={(e) => setBiografia(e.target.value)} />
          <div className="acciones-dialogo"><button className="boton boton-suave" type="button" onClick={() => setEditando(false)}>Cancelar</button><button className="boton boton-primario" type="submit">Guardar cambios</button></div>
        </form>
      </Modal>}
    </main>
  );
}

