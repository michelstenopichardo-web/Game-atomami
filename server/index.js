// Atomami — web + online multiplayer server.
// Serves the app (public/) and runs online rooms over WebSocket at /ws.
// The server holds the authoritative game state and validates every move.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { WebSocketServer } from 'ws';
import { newGame, isLegal, applyMove, resign } from '../public/js/game.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const PORT = process.env.PORT !== undefined && process.env.PORT !== '' ? Number(process.env.PORT) : 3000;
const ROOM_IDLE_MS = 6 * 60 * 60 * 1000; // forget rooms untouched for 6h
const MAX_ROOMS = 5000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

// ---------------- static files ----------------

function serveStatic(req, res) {
  let urlPath;
  try {
    urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (urlPath === '/healthz') {
    res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
    return;
  }
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const file = path.join(ROOT, urlPath);
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      // Unknown paths fall back to the app shell (e.g. /r/ABCD style links).
      if (!path.extname(urlPath)) return sendFile(res, path.join(ROOT, 'index.html'));
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
      return;
    }
    sendFile(res, file);
  });
}

function sendFile(res, file) {
  const ext = path.extname(file).toLowerCase();
  const headers = {
    'content-type': MIME[ext] || 'application/octet-stream',
    'x-content-type-options': 'nosniff',
    // Always revalidate so updates reach players quickly; the service worker handles offline.
    'cache-control': ext === '.png' ? 'public, max-age=86400' : 'no-cache',
  };
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(serveStatic);

// ---------------- rooms ----------------

/**
 * room = {
 *   code, seats: [seat|null, seat|null], state, createdAt, touched,
 *   rematch: Set<seatIndex>, public: boolean
 * }
 * seat = { token, name, ws|null }
 */
const rooms = new Map();
let waiting = null; // room code waiting for a quick-match opponent

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function makeCode() {
  for (;;) {
    let code = '';
    for (let i = 0; i < 4; i++) code += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
    if (!rooms.has(code)) return code;
  }
}

function cleanName(name) {
  const s = String(name ?? '')
    .replace(/[\u0000-\u001f<>]/g, '')
    .trim()
    .slice(0, 16);
  return s || 'Jugador';
}

function createRoom({ isPublic = false } = {}) {
  if (rooms.size >= MAX_ROOMS) return null;
  const room = {
    code: makeCode(),
    seats: [null, null],
    state: null,
    createdAt: Date.now(),
    touched: Date.now(),
    rematch: new Set(),
    public: isPublic,
    games: 0,
    fresh: false,
  };
  rooms.set(room.code, room);
  return room;
}

function startGame(room) {
  room.state = newGame();
  room.rematch.clear();
  room.games += 1;
}

function publicView(room, seatIndex) {
  const { seen, ...state } = room.state || {};
  return {
    type: 'state',
    room: room.code,
    you: seatIndex,
    players: room.seats.map((seat) =>
      seat ? { name: seat.name, online: !!(seat.ws && seat.ws.readyState === 1) } : null,
    ),
    state: room.state ? state : null,
    rematch: [...room.rematch],
    games: room.games,
  };
}

function send(ws, msg) {
  if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
}

function broadcast(room) {
  room.seats.forEach((seat, i) => {
    if (seat && seat.ws) send(seat.ws, publicView(room, i));
  });
}

function seatPlayer(room, ws, name, token) {
  // Re-join an existing seat with the same token (reconnect after the phone slept).
  let index = room.seats.findIndex((s) => s && s.token === token);
  if (index === -1) {
    index = room.seats.findIndex((s) => s === null);
    if (index === -1) return -1;
    room.seats[index] = { token: crypto.randomUUID(), name: cleanName(name), ws: null };
  } else if (name) {
    room.seats[index].name = cleanName(name);
  }
  const seat = room.seats[index];
  if (seat.ws && seat.ws !== ws) {
    send(seat.ws, { type: 'kicked' });
    seat.ws.close();
  }
  seat.ws = ws;
  ws.room = room.code;
  ws.seat = index;
  room.touched = Date.now();
  send(ws, { type: 'joined', room: room.code, seat: index, token: seat.token });
  if (room.seats[0] && room.seats[1] && (!room.state || room.fresh)) {
    room.fresh = false;
    startGame(room);
  }
  broadcast(room);
  return index;
}

function leaveCurrent(ws) {
  const room = rooms.get(ws.room);
  ws.room = null;
  if (!room) return;
  const seat = room.seats[ws.seat];
  if (seat && seat.ws === ws) {
    // Leaving on purpose gives up the seat (and the game, if one is running).
    if (room.state && room.state.winner === null) room.state = resign(room.state, ws.seat);
    room.seats[ws.seat] = null;
    room.rematch.clear();
  }
  if (waiting === room.code) waiting = null;
  if (!room.seats[0] && !room.seats[1]) rooms.delete(room.code);
  else {
    room.fresh = true; // whoever sits down next starts a new game
    broadcast(room);
  }
}

function handle(ws, msg) {
  switch (msg.type) {
    case 'create': {
      if (ws.room) leaveCurrent(ws);
      const room = createRoom();
      if (!room) return send(ws, { type: 'error', code: 'full' });
      seatPlayer(room, ws, msg.name);
      return;
    }
    case 'join': {
      const code = String(msg.room || '').toUpperCase().trim();
      const room = rooms.get(code);
      if (!room) return send(ws, { type: 'error', code: 'no-room' });
      if (ws.room && ws.room !== code) leaveCurrent(ws);
      const seat = seatPlayer(room, ws, msg.name, msg.token);
      if (seat === -1) send(ws, { type: 'error', code: 'room-full' });
      return;
    }
    case 'quick': {
      if (ws.room) leaveCurrent(ws);
      const open = waiting && rooms.get(waiting);
      if (open && open.seats.some((s) => s === null) && open.seats.some((s) => s && s.ws && s.ws.readyState === 1)) {
        waiting = null;
        seatPlayer(open, ws, msg.name);
      } else {
        const room = createRoom({ isPublic: true });
        if (!room) return send(ws, { type: 'error', code: 'full' });
        waiting = room.code;
        seatPlayer(room, ws, msg.name);
      }
      return;
    }
    case 'move': {
      const room = rooms.get(ws.room);
      if (!room || !room.state) return;
      if (room.state.winner !== null || room.state.turn !== ws.seat) return send(ws, { type: 'error', code: 'not-your-turn' });
      if (!isLegal(room.state, msg.move)) return send(ws, { type: 'error', code: 'illegal' });
      const m = msg.move;
      const move = m.pass
        ? { card: m.card, pass: true }
        : { card: m.card, piece: m.piece, to: { x: m.to.x, y: m.to.y } };
      room.state = applyMove(room.state, move);
      room.touched = Date.now();
      broadcast(room);
      return;
    }
    case 'resign': {
      const room = rooms.get(ws.room);
      if (!room || !room.state || room.state.winner !== null) return;
      room.state = resign(room.state, ws.seat);
      broadcast(room);
      return;
    }
    case 'rematch': {
      const room = rooms.get(ws.room);
      if (!room || !room.state || room.state.winner === null) return;
      room.rematch.add(ws.seat);
      if (room.rematch.size === 2) startGame(room);
      broadcast(room);
      return;
    }
    case 'emote': {
      const room = rooms.get(ws.room);
      if (!room) return;
      const emote = String(msg.emote || '').slice(0, 8);
      room.seats.forEach((seat, i) => {
        if (seat && i !== ws.seat) send(seat.ws, { type: 'emote', emote });
      });
      return;
    }
    case 'leave':
      leaveCurrent(ws);
      send(ws, { type: 'left' });
      return;
    case 'ping':
      send(ws, { type: 'pong' });
      return;
    default:
      send(ws, { type: 'error', code: 'unknown' });
  }
}

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4096 });

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.room = null;
  ws.seat = -1;
  ws.budget = { tokens: 30, at: Date.now() };
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.on('message', (data) => {
    // simple rate limit: ~10 messages/second sustained
    const b = ws.budget;
    const now = Date.now();
    b.tokens = Math.min(30, b.tokens + ((now - b.at) / 1000) * 10);
    b.at = now;
    if (b.tokens < 1) {
      send(ws, { type: 'error', code: 'rate' });
      return;
    }
    b.tokens -= 1;
    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch {
      return;
    }
    if (!msg || typeof msg !== 'object') return;
    try {
      handle(ws, msg);
    } catch (err) {
      console.error('handler error', err);
      send(ws, { type: 'error', code: 'server' });
    }
  });
  ws.on('close', () => {
    const room = rooms.get(ws.room);
    if (!room) return;
    const seat = room.seats[ws.seat];
    if (seat && seat.ws === ws) {
      seat.ws = null; // keep the seat so the player can reconnect
      if (room.public && !room.state && waiting === room.code) {
        // nobody to wait for any more
        room.seats[ws.seat] = null;
        waiting = null;
        if (!room.seats[0] && !room.seats[1]) rooms.delete(room.code);
        return;
      }
      broadcast(room);
    }
  });
});

// Keep connections alive through proxies and drop dead sockets.
const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
  const now = Date.now();
  for (const [code, room] of rooms) {
    const someoneHere = room.seats.some((s) => s && s.ws && s.ws.readyState === 1);
    if (!someoneHere && now - room.touched > ROOM_IDLE_MS) rooms.delete(code);
  }
}, 25000);
wss.on('close', () => clearInterval(heartbeat));

server.listen(PORT, () => {
  console.log(`Atomami listening on http://localhost:${PORT}`);
});

export { server, wss, rooms };
