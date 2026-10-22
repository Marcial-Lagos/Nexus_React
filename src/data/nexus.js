export const biografiaOriginal =
  "Estudiante de ingenieria informatica en DUOCUC, fan de la tecnología, los juegos y los proyectos que terminan funcionando cinco minutos antes de la entrega.";
export const transmisiones = [
  {
    id: "codigo",
    nombre: "lLGNDl",
    iniciales: "LG",
    color: "morado",
    titulo: "Creando una web desde cero",
    categoria: "Programación",
    espectadores: "6767",
    simbolo: "</>",
    busqueda:
      "programacion código codigo marcial desarrollo web llgndl programación",
  },
  {
    id: "juego",
    nombre: "KiraPlay",
    iniciales: "K",
    color: "azul",
    titulo: "Ranked hasta llegar a Champions",
    categoria: "Overwatch",
    espectadores: "1.2K",
    simbolo: "🎮",
    busqueda: "overwatch gaming ranked kira esports kiraplay",
  },
  {
    id: "musica",
    nombre: "AlexMusic",
    iniciales: "A",
    color: "naranja",
    titulo: "Música y charla de domingo",
    categoria: "Música",
    espectadores: "727",
    simbolo: "♫",
    busqueda: "musica música charla alex guitar just chatting",
  },
];
export const productos = [
  {
    id: "teclado",
    nombre: "Teclado Gamer",
    precio: 49990,
    imagen: "/img/teclado.jpg",
    icono: "keyboard",
    modelo: "Nexus KX-400",
    descripcion:
      "Lleva tu juego al siguiente nivel con el Teclado Gamer Nexus KX-400. Diseñado para entregar una respuesta rápida y una experiencia cómoda durante largas sesiones de juego.",
    caracteristicas: [
      "Switches mecánicos de alta respuesta",
      "Iluminación RGB personalizable",
      "Diseño ergonómico y resistente",
      "Conexión USB Plug & Play",
      "Compatible con Windows, Mac y Linux",
    ],
  },
  {
    id: "mouse",
    nombre: "Mouse Gamer",
    precio: 59990,
    icono: "computer-mouse",
  },
  {
    id: "audifonos",
    nombre: "Audífonos Gamer",
    precio: 69990,
    icono: "headphones",
  },
  { id: "producto4", nombre: "Producto 4", precio: 79990, icono: "gamepad" },
  { id: "producto5", nombre: "Producto 5", precio: 89990, icono: "desktop" },
  { id: "producto6", nombre: "Producto 6", precio: 99990, icono: "microphone" },
];
export const precioCLP = (valor) =>
  "$" + new Intl.NumberFormat("es-CL").format(valor);
export const canalesContacto = [
  {
    nombre: "Instagram",
    detalle: "@nexus",
    href: "https://www.instagram.com/__lgnd___/",
    icono: "fa-brands fa-instagram",
    clase: "instagram",
  },
  {
    nombre: "GitHub",
    detalle: "Proyecto NEXUS",
    href: "https://github.com/Marcial-Lagos",
    icono: "fa-brands fa-github",
    clase: "github",
  },
  {
    nombre: "Discord",
    detalle: "Comunidad NEXUS",
    href: "https://discord.gg/F3k3abUMs",
    icono: "fa-brands fa-discord",
    clase: "discord",
  },
  {
    nombre: "Correo",
    detalle: "contacto@nexus.cl",
    href: "mailto:contacto@nexus.cl",
    icono: "fa-solid fa-envelope",
    clase: "correo",
  },
];
