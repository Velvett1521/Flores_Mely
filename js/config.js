/* ==========================================================================
   CONFIGURACIÓN — este es el único archivo que necesitas editar.
   ========================================================================== */

window.CONFIG = {

  /* Título de la pestaña del navegador (si lo dejas vacío usa el de la canción) */
  pageTitle: "",

  /* ---------- CANCIÓN ---------- */
  song: {
    title:  "La Stella Piu Fragile Dell'Universo",
    artist: "ULTIMO",
    src:    "assets/audio/La Stella Piu Fragile Dell'Universo [lk3bkbpN00Y].m4a",   // tu audio (mp3 o m4a)
    cover:  "assets/cover/portada.avif",   // portada cuadrada, mínimo 600×600
    volume: 0.85,                          // 0 a 1
    loop:   false                           // repetir la canción al terminar
  },

  /* ---------- TEXTOS (10 de muestra, puedes poner más o menos) ---------- */
  texts: [
    "Esto no debe sorprenderte, tu sabes como crearlo probablemente.",
    "Pero para mi, construir algo yo mismo para alguien que me importa es muy valioso.",
    "No son las flores amarillas que esperas, pero son las que pude construir.",
    "Aunque llevamos poco tiempo de conocernos te has ganado un lugar muy especial en mi vida.",
    "He aprendido bastante de ti, de tus gustos, de tu forma de pensar y otras cosas más.",
    "Tambien aprendí que sientes mucho las cosas y que te afectan bastante, y que a veces no tienes a alguien con quien compartir tus sentimientos.",
    "Quiero que sepas que aunque no lo parezca, puedes confiar en mí, cada vez que me necesites ahi voy a estar.",
    "Y que no olvides que vales mucho y que lo más importante es que tu estés feliz.",
    "Gracias por tu amistad Mely... y por ser mi complice en algo que para mi era tan importante.",
    "Espero poder estar ahí cada vez que me necesites porque para mi tú eres..."
  ],

  /* ---------- IMÁGENES (hay espacio para 6) ----------
     Si una imagen no existe todavía, se muestra un marcador de posición.
     "caption" es opcional: el texto que se escribe en el borde blanco de la foto. */
  images: [
    { src: "assets/img/foto-1.jpg", alt: "Foto 1", caption: "" },
    { src: "assets/img/foto-2.jpg", alt: "Foto 2", caption: "" },
    { src: "assets/img/foto-3.jpg", alt: "Foto 3", caption: "" },
    { src: "assets/img/foto-4.jpg", alt: "Foto 4", caption: "" },
    { src: "assets/img/foto-5.jpg", alt: "Foto 5", caption: "" },
    { src: "assets/img/foto-6.jpg", alt: "Foto 6", caption: "" }
  ],

  /* En qué texto (empezando en 0) aparece cada foto.
     null = se reparten solas a lo largo de todos los textos.
     Ejemplo manual: [0, 1, 3, 4, 6, 8] */
  imageSteps: null,

  /* ---------- TIEMPOS ---------- */
  timing: {
    stepMs: 12000,        // cuánto dura cada texto (mínimo recomendado: 5000)
    pulsesPerStep: 6,    // cuántos "latidos" de flores hay por texto

    /* Para que las flores caigan EXACTO en el compás de tu canción:
       pon los BPM reales y cuántos tiempos dura cada texto.
       Con bpm: 76 y beatsPerStep: 8 cada texto dura ≈ 6.3 s.
       Si bpm es null se usan stepMs y pulsesPerStep de arriba. */
    bpm: null,
    beatsPerStep: 8,

    /* true = reparte los textos a lo largo de TODA la canción
       (cada texto dura duración ÷ cantidad de textos). */
    fitToSong: false,

    /* false = al terminar se queda el último texto con el jardín completo
       y aparece un botón para repetir.  true = reinicia solo. */
    loop: false
  },

  /* ---------- JARDÍN ---------- */
  garden: {
    density: 0.5,        // 0.2 (pocas flores) a 0.9 (muy denso)
    maxFlowers: 230      // tope para no saturar celulares viejos
  },

  /* ---------- TEXTOS DE LA INTERFAZ ---------- */
  ui: {
    start:  "Comenzar",
    hint:   "Sube el volumen un poco o colocate audífonos para escuchar la canción.",
    replay: "Ver de nuevo",
    dragHint: "Arrastra las fotos para moverlas"
  }
};
