# Atomami ⚛️

Duelo de estrategia por turnos para iPhone. Juega **online con amigos**, **contra la IA** o **2 jugadores en el mismo iPhone**.

Es una web app (PWA): se abre en Safari y se instala en la pantalla de inicio como si fuera una app, sin pasar por la App Store.

## Cómo se juega (reglas clásicas)

- Tablero de 5×5. Cada equipo tiene **1 líder** y **4 piezas** más.
- Hay 16 cartas de movimiento; en cada partida se usan 5: 2 para cada jugador y 1 en **Siguiente**.
- En tu turno usas una de tus cartas para mover una pieza. Si caes sobre una pieza rival, la capturas.
- La carta que usaste pasa a **Siguiente** y tú te quedas con la que estaba allí. Después de su jugada, tu rival se queda con la carta que usaste.
- **Ganas** si capturas al líder rival, o si llevas tu líder a la casilla donde empezó el líder rival (está marcada en el tablero).

Las reglas completas están dentro de la app, en «Cómo jugar».

## Temas

El tema solo cambia el aspecto; las reglas son las mismas. Se elige en la pantalla de inicio o en el menú de la partida. En online cada jugador ve el tema que haya elegido.

- **Mistborn (fan)** (por defecto): la Banda (Kelsier, Vin, Sazed, Brisa y Ham) contra el Imperio Final (el Lord Legislador y cuatro Inquisidores de Acero). La casilla del Imperio es Kredik Shaw. Las 16 cartas son los 16 metales. Es un tema hecho por fans, no oficial y para uso personal: Mistborn y sus personajes son de Brandon Sanderson. Los dibujos son originales y sencillos; no incluye arte, logotipos ni textos de los libros.
- **Medianoche**: la Casa del Sol contra la Casa de la Luna, con alquimistas, gólems y las cartas de la alquimia clásica.
- **Átomos**: Ámbar contra Cobalto, con Núcleos, Átomos y cartas de partículas.

Los temas están en `public/js/themes.js` (nombres, textos, piezas en SVG y cartas). Los colores y el estilo, en `public/style.css`.

## Ponerlo online (gratis, ~5 minutos)

El modo online necesita un pequeño servidor. Lo más fácil es [Render](https://render.com) (tiene plan gratis):

1. Crea una cuenta en render.com y conecta tu GitHub.
2. Pulsa **New → Blueprint** y elige el repositorio `Game-atomami`. Render lee el archivo `render.yaml` y lo configura solo.
3. Pulsa **Apply / Deploy**. En un par de minutos te da una dirección del tipo `https://atomami-xxxx.onrender.com`.

O directamente con este botón:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/michelstenopichardo-web/Game-atomami)

> En el plan gratis de Render el servidor «se duerme» tras 15 minutos sin uso. La primera vez que alguien entra después tarda ~1 minuto en despertar; luego va normal. Si quieres que esté siempre despierto, usa un plan de pago o el `Dockerfile` en otro servicio (Fly.io, Railway…).

### Instalarlo en el iPhone

1. Abre la dirección de Render en **Safari**.
2. Toca **Compartir** (el cuadrado con la flecha) → **Añadir a pantalla de inicio**.
3. Ya tienes el icono de Atomami; se abre a pantalla completa como una app.

### Jugar con amigos

- **Crear sala privada** → te da un código de 4 letras. Toca **Invitar** para mandarle el enlace por WhatsApp/iMessage. Tu amigo lo abre, pone su nombre y toca **Unirse**.
- **Unirse**: escribe el código que te pasaron.
- **Partida rápida**: te empareja con quien esté buscando partida en ese momento.

Si el iPhone se bloquea o cambias de app a mitad de partida, al volver se reconecta solo a la misma partida. Al terminar podéis pedir **Revancha**.

## Desarrollo

Necesitas Node.js 18 o superior.

```bash
npm install
npm start          # http://localhost:3000
npm test           # reglas, IA y servidor online
```

Para probar desde el iPhone en tu misma red Wi-Fi, abre `http://IP-de-tu-ordenador:3000`.

`node scripts/build-offline.mjs` genera `dist/atomami-offline.html`: un único archivo con los modos sin conexión (contra la IA y 2 jugadores en el mismo iPhone), útil como demo sin servidor.

### Estructura

| Archivo | Qué hace |
| --- | --- |
| `public/js/game.js` | Reglas del juego (compartidas por la app y el servidor) |
| `public/js/ai.js` | IA (búsqueda alfa-beta) con 3 dificultades; corre en un Web Worker |
| `public/js/app.js` | Pantallas, tablero, gestos y conexión online |
| `public/js/i18n.js` | Textos en español e inglés |
| `public/js/themes.js` | Temas visuales (Mistborn fan, Medianoche y Átomos) |
| `server/index.js` | Servidor web + salas online por WebSocket (valida cada jugada) |
| `scripts/selfplay.mjs` | La IA juega contra sí misma para revisar el equilibrio |
| `scripts/make-icons.cjs` | Genera los iconos PNG a partir de `scripts/icon.svg` |
| `scripts/build-offline.mjs` | Crea la versión de un solo archivo sin modo online |

---

## English

Atomami is a turn-based strategy duel for iPhone with classic card-passing rules, installable as a PWA. It ships with three looks: an unofficial Mistborn fan theme for personal use, Midnight Alchemy, and Atoms. Play online with friends (private rooms with invite links, or quick match), against a 3-level AI, or pass-and-play on one phone. Deploy the server for free on Render with the included `render.yaml` (New → Blueprint), or anywhere that runs Docker. Run locally with `npm install && npm start`; tests with `npm test`.
