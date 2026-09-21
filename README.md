# Jardín

Sitio estático (HTML + CSS + JS). No requiere build ni dependencias.

## Qué poner y dónde
- `assets/audio/cancion.mp3`  → tu canción
- `assets/cover/portada.jpg`  → portada (cuadrada, 600×600 o más)
- `assets/img/foto-1.jpg` … `foto-6.jpg` → las 6 imágenes (mejor 800×900, ~200 KB c/u)
- `js/config.js` → textos, título, artista, tiempos y BPM (único archivo a editar)

Si un archivo no existe, se muestra un marcador de posición y todo sigue funcionando.

## Probar rápido
Agrega `?speed=6` a la URL para ver todo el recorrido más veloz.
En local usa un servidor (`npx serve .`) o abre `index.html` directo.

## Subir a Vercel
1. Sube la carpeta a un repo de GitHub e impórtalo en vercel.com (Framework: "Other"), o
2. Desde la carpeta: `npx vercel --prod`

## Al terminar
El texto final sube, el reproductor pasa al centro con la portada y el título en grande,
y las 6 fotos se pueden arrastrar (mouse o dedo). "Ver de nuevo" reinicia todo.
El texto del botón y de la ayuda se cambian en `ui` dentro de `js/config.js`.

## Al terminar
- El último texto sube, el reproductor se vuelve una tarjeta central con la portada y el título en grande, y aparece "Ver de nuevo".
- Las 6 fotos se pueden mover: mantén pulsado (mouse o dedo) y arrastra. La foto que tomas queda encima de las demás.
- Los textos de esa pantalla se cambian en `js/config.js` (`ui.replay`, `ui.dragHint`).

## Notas
- Los navegadores bloquean el audio automático: por eso existe el botón "Comenzar".
- Para que las flores caigan al compás: pon `bpm` y `beatsPerStep` en `config.js`.
- Para repartir los textos a lo largo de toda la canción: `fitToSong: true`.
