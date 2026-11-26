# Atomami ⚛️

Duelo de estrategia por turnos para iPhone. Juega **online con amigos**, **contra la IA** o **2 jugadores en el mismo iPhone**.

Es una web app (PWA): se abre en Safari y se instala en la pantalla de inicio como si fuera una app, sin pasar por la App Store.

## Cómo se juega

- Tablero de 5×5. Cada equipo (Ámbar y Cobalto) tiene **1 Núcleo** y **4 Átomos**.
- Hay 16 cartas de movimiento (Protón, Fotón, Quark, Gluón…). En cada partida se usan 6: 2 para cada jugador y 2 en el **Flujo**.
- En tu turno usas una de tus cartas para mover una pieza. Si caes sobre una pieza rival, la capturas.
- **Draft del Flujo:** la carta que usaste va al Flujo y te quedas con una de las 2 que había allí. Tu rival puede llevarse la carta que acabas de usar.
- **Ganas por Fisión** (capturas el Núcleo rival) **o por Fusión** (tu Núcleo empieza 2 de tus turnos seguidos en el Reactor, la casilla central).

Las reglas completas están dentro de la app, en «Cómo jugar».

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
| `server/index.js` | Servidor web + salas online por WebSocket (valida cada jugada) |
| `scripts/selfplay.mjs` | La IA juega contra sí misma para revisar el equilibrio |
| `scripts/make-icons.cjs` | Genera los iconos PNG a partir de `scripts/icon.svg` |
| `scripts/build-offline.mjs` | Crea la versión de un solo archivo sin modo online |

---

## English

Atomami is a turn-based strategy duel for iPhone, installable as a PWA. Play online with friends (private rooms with invite links, or quick match), against a 3-level AI, or pass-and-play on one phone. Deploy the server for free on Render with the included `render.yaml` (New → Blueprint), or anywhere that runs Docker. Run locally with `npm install && npm start`; tests with `npm test`.
