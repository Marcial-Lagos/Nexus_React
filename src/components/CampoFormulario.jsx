export default function CampoFormulario({
  id,
  label,
  error,
  ayuda,
  inputRef,
  multilinea = false,
  ...props
}) {
  const Control = multilinea ? "textarea" : "input";
  return (
    <div className={`grupo-campo${error ? " campo-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <Control
        ref={inputRef}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={`${id}-error${ayuda ? ` ${id}-ayuda` : ""}`}
        {...props}
      />
      {ayuda && (
        <small className="sugerencia-campo" id={`${id}-ayuda`}>
          {ayuda}
        </small>
      )}
      <small className="mensaje-error" id={`${id}-error`} aria-live="polite">
        {error}
      </small>
    </div>
  );
}
