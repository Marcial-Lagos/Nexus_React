import { useEffect, useRef } from "react";
export default function Modal({ titulo, onClose, children }) {
  const dialogo = useRef(null);
  useEffect(() => {
    const elemento = dialogo.current;
    elemento.showModal();
    return () => elemento.close();
  }, []);
  return (
    <dialog
      ref={dialogo}
      className="dialogo-perfil"
      aria-label={titulo}
      onCancel={onClose}
    >
      <div className="encabezado-dialogo">
        <h2>{titulo}</h2>
        <button type="button" aria-label="Cerrar ventana" onClick={onClose}>
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
