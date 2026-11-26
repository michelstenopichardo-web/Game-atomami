import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import { once } from 'node:events';
import { legalMoves } from '../public/js/game.js';

process.env.PORT = '0';
const { server, wss, rooms } = await import('../server/index.js');
if (!server.listening) await once(server, 'listening');
const port = server.address().port;
const base = `http://localhost:${port}`;

after(() => {
  for (const c of wss.clients) c.terminate();
  wss.close();
  server.close();
});

/** A tiny test client that remembers every message it got. */
async function client() {
  const ws = new WebSocket(`ws://localhost:${port}/ws`);
  const inbox = [];
  const taken = new Set();
  const waiters = [];
  ws.on('message', (d) => {
    const msg = JSON.parse(d.toString());
    inbox.push(msg);
    for (const w of [...waiters]) {
      if (!taken.has(msg) && w.pred(msg)) {
        waiters.splice(waiters.indexOf(w), 1);
        taken.add(msg);
        w.resolve(msg);
      }
    }
  });
  await once(ws, 'open');
  return {
    ws,
    inbox,
    send: (m) => ws.send(JSON.stringify(m)),
    next(pred, ms = 2000) {
      // look at messages that already arrived but nobody consumed yet
      const hit = inbox.find((m) => !taken.has(m) && pred(m));
      if (hit) {
        taken.add(hit);
        return Promise.resolve(hit);
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout waiting for message: ' + pred.toString().slice(0, 120))), ms);
        waiters.push({ pred, resolve: (m) => (clearTimeout(timer), resolve(m)) });
      });
    },
    close: () => ws.close(),
  };
}

test('serves the app and health check', async () => {
  const home = await fetch(base + '/');
  assert.equal(home.status, 200);
  assert.match(await home.text(), /ATOMAMI/);
  const js = await fetch(base + '/js/game.js');
  assert.match(js.headers.get('content-type'), /javascript/);
  assert.equal((await fetch(base + '/healthz')).status, 200);
  assert.equal((await fetch(base + '/nope.png')).status, 404);
  const traversal = await fetch(base + '/..%2fpackage.json');
  assert.notEqual(traversal.status, 200);
});

test('create room, join, play a full game, rematch, reconnect', async () => {
  const a = await client();
  const b = await client();
  a.send({ type: 'create', name: 'Ana' });
  const joinedA = await a.next((m) => m.type === 'joined');
  assert.match(joinedA.room, /^[A-Z2-9]{4}$/);
  const waitingState = await a.next((m) => m.type === 'state');
  assert.equal(waitingState.state, null);

  b.send({ type: 'join', room: joinedA.room.toLowerCase(), name: 'Beto<script>' });
  const joinedB = await b.next((m) => m.type === 'joined');
  assert.equal(joinedB.seat, 1);
  let st = await b.next((m) => m.type === 'state' && m.state);
  assert.deepEqual(st.players.map((p) => p.name), ['Ana', 'Betoscript']);
  assert.equal(st.state.seen, undefined, 'internal bookkeeping is not sent');

  const players = { 0: a, 1: b };
  // wrong player trying to move is rejected
  const notTurn = players[1 - st.state.turn];
  notTurn.send({ type: 'move', move: legalMoves({ ...st.state, turn: 1 - st.state.turn, seen: {} })[0] });
  await notTurn.next((m) => m.type === 'error' && m.code === 'not-your-turn');
  // garbage move is rejected
  players[st.state.turn].send({ type: 'move', move: { card: 'boson', piece: '02', to: { x: 9, y: 9 }, take: 'x' } });
  await players[st.state.turn].next((m) => m.type === 'error' && m.code === 'illegal');

  // play random legal moves (at most 40, like a real game would pace them), then resign
  let guard = 0;
  while (st.state.winner === null && guard++ < 40) {
    const mover = players[st.state.turn];
    const moves = legalMoves({ ...st.state, seen: {} });
    const ply = st.state.ply;
    mover.send({ type: 'move', move: moves[Math.floor(Math.random() * moves.length)] });
    st = await a.next((m) => m.type === 'state' && m.state && m.state.ply === ply + 1);
  }
  if (st.state.winner === null) {
    players[st.state.turn].send({ type: 'resign' });
    st = await a.next((m) => m.type === 'state' && m.state && m.state.winner !== null);
  }
  assert.notEqual(st.state.winner, null);

  // reconnect: B drops and comes back with its token
  b.close();
  await a.next((m) => m.type === 'state' && m.players[1] && m.players[1].online === false);
  const b2 = await client();
  b2.send({ type: 'join', room: joinedA.room, token: joinedB.token });
  const back = await b2.next((m) => m.type === 'joined');
  assert.equal(back.seat, 1);
  await b2.next((m) => m.type === 'state' && m.state && m.state.winner !== null);

  // rematch needs both players
  a.send({ type: 'rematch' });
  await b2.next((m) => m.type === 'state' && m.rematch.includes(0));
  b2.send({ type: 'rematch' });
  const fresh = await a.next((m) => m.type === 'state' && m.games === 2);
  assert.equal(fresh.state.ply, 0);
  assert.equal(fresh.state.winner, null);

  // a third player cannot take a seat
  const c = await client();
  c.send({ type: 'join', room: joinedA.room, name: 'Carla' });
  await c.next((m) => m.type === 'error' && m.code === 'room-full');

  // leaving mid-game resigns
  a.send({ type: 'leave' });
  const after = await b2.next((m) => m.type === 'state' && m.state && m.state.winner === 1);
  assert.equal(after.state.reason, 'resign');
  assert.equal(after.players[0], null);

  a.close();
  b2.close();
  c.close();
});

test('joining an unknown room fails cleanly', async () => {
  const a = await client();
  a.send({ type: 'join', room: 'ZZZZ', name: 'x' });
  await a.next((m) => m.type === 'error' && m.code === 'no-room');
  a.close();
});

test('quick match pairs two players', async () => {
  const a = await client();
  const b = await client();
  a.send({ type: 'quick', name: 'A' });
  const ja = await a.next((m) => m.type === 'joined');
  b.send({ type: 'quick', name: 'B' });
  const jb = await b.next((m) => m.type === 'joined');
  assert.equal(ja.room, jb.room);
  const st = await a.next((m) => m.type === 'state' && m.state);
  assert.equal(st.players.length, 2);
  assert.ok(rooms.get(ja.room).public);
  a.close();
  b.close();
});

test('emotes reach the other player only', async () => {
  const a = await client();
  const b = await client();
  a.send({ type: 'create', name: 'A' });
  const { room } = await a.next((m) => m.type === 'joined');
  b.send({ type: 'join', room, name: 'B' });
  await b.next((m) => m.type === 'state' && m.state);
  a.send({ type: 'emote', emote: '🔥' });
  const e = await b.next((m) => m.type === 'emote');
  assert.equal(e.emote, '🔥');
  assert.ok(!a.inbox.some((m) => m.type === 'emote'));
  a.close();
  b.close();
});
