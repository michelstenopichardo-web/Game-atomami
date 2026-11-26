// Atomami — app controller (screens, board UI, AI and online play).
import { newGame, legalMoves, applyMove, resign, targetsFor, pieceAt, sameMove, CARDS, CARD_IDS, REACTOR, SIZE } from './game.js';
import { t, setLang, getLang } from './i18n.js';
import { play, unlockAudio, setSoundEnabled, soundEnabled } from './sound.js';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

// ---------------- storage (never required to work) ----------------
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('atomami.' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      if (value === undefined) localStorage.removeItem('atomami.' + key);
      else localStorage.setItem('atomami.' + key, JSON.stringify(value));
    } catch {
      /* private mode etc. */
    }
  },
};

// ---------------- app state ----------------
const app = {
  mode: null, // 'ai' | 'local' | 'online'
  level: 'normal',
  game: null,
  me: 0,
  names: ['', ''],
  aiBusy: false,
  viewing: false,
  ui: { card: null, piece: null, pending: null, chooseCard: null },
  online: {
    ws: null,
    connected: false,
    wanted: false, // keep the socket alive / reconnect
    queued: null, // message to send once connected
    room: null,
    token: null,
    seat: 0,
    players: [null, null],
    rematch: [],
    games: 0,
    quick: false,
    retry: 0,
    retryTimer: null,
    pingTimer: null,
    resuming: false,
  },
};

function myName() {
  return ($('#input-name').value || '').trim().slice(0, 16);
}

// ---------------- screens ----------------
function show(id) {
  $$('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + id));
  window.scrollTo(0, 0);
}

function toast(text, ms = 2200) {
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => (el.hidden = true), ms);
}

function openOverlay(id) {
  $('#' + id).hidden = false;
}
function closeOverlay(id) {
  $('#' + id).hidden = true;
}

// ---------------- i18n ----------------
function applyTexts() {
  $$('[data-i18n]').forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $('#btn-lang').textContent = getLang().toUpperCase();
  $('#input-name').placeholder = getLang() === 'es' ? 'Jugador' : 'Player';
  updateRecord();
  updateResume();
  buildRules();
  if (app.game) render();
}

function buildRules() {
  const body = $('#rules-body');
  body.innerHTML = t('rulesHtml');
  const gallery = document.createElement('div');
  gallery.className = 'card-gallery';
  for (const id of CARD_IDS) gallery.appendChild(cardEl(id, { view: 'up' }));
  body.appendChild(gallery);
}

function updateRecord() {
  const r = store.get('record', { w: 0, l: 0 });
  $('#ai-record').textContent = r.w + r.l > 0 ? t('aiRecord', r) : '';
}

// ---------------- perspective ----------------
const flip = () => app.mode === 'online' && app.me === 1;
const bottomSeat = () => (flip() ? 1 : 0);
const topSeat = () => 1 - bottomSeat();
const toScreen = (x, y) => (flip() ? { x: SIZE - 1 - x, y: SIZE - 1 - y } : { x, y });

function isMyTurn() {
  const g = app.game;
  if (!g || g.winner !== null || app.aiBusy) return false;
  if (app.mode === 'local') return true;
  if (app.mode === 'online' && !app.online.connected) return false;
  return g.turn === app.me;
}

function mustPass() {
  const moves = legalMoves(app.game);
  return moves.length > 0 && moves.every((m) => m.pass);
}

// ---------------- rendering ----------------
/**
 * Build a card element.
 * view 'up'   → pattern drawn with forward = up the screen
 * view 'down' → pattern rotated 180° (an opponent's card seen from across the table)
 */
function cardEl(cardId, { view = 'up', owner = null } = {}) {
  const card = CARDS[cardId];
  const el = document.createElement('div');
  el.className = 'card' + (owner === null ? '' : ' team' + owner);
  el.dataset.card = cardId;
  const mini = document.createElement('div');
  mini.className = 'mini';
  const go = new Set(card.moves.map(([dx, dy]) => (view === 'up' ? `${2 + dx},${2 + dy}` : `${2 - dx},${2 - dy}`)));
  for (let y = 0; y < 5; y++) {
    for (let x = 0; x < 5; x++) {
      const i = document.createElement('i');
      if (x === 2 && y === 2) i.className = 'me';
      else if (go.has(`${x},${y}`)) i.className = 'go';
      mini.appendChild(i);
    }
  }
  const label = document.createElement('div');
  label.className = 'label';
  label.innerHTML = `<span class="sym"></span><span class="cname"></span>`;
  label.querySelector('.sym').textContent = card.symbol;
  label.querySelector('.cname').textContent = card[getLang()] || card.es;
  el.append(mini, label);
  return el;
}

let cellEls = [];
const pieceEls = new Map();
let lastHands = { top: '', bottom: '', flux: '' };

function buildBoard() {
  const cells = $('#cells');
  cells.innerHTML = '';
  cellEls = [];
  for (let sy = 0; sy < SIZE; sy++) {
    for (let sx = 0; sx < SIZE; sx++) {
      const c = document.createElement('div');
      c.className = 'cell' + ((sx + sy) % 2 ? ' alt' : '');
      c.dataset.sx = sx;
      c.dataset.sy = sy;
      cells.appendChild(c);
      cellEls.push(c);
    }
  }
  $('#pieces').innerHTML = '';
  pieceEls.clear();
  lastHands = { top: '', bottom: '', flux: '' };
}

const CORE_SVG = `<svg viewBox="0 0 100 100" aria-hidden="true"><g class="spin"><ellipse cx="50" cy="50" rx="46" ry="16"/><ellipse cx="50" cy="50" rx="46" ry="16" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="46" ry="16" transform="rotate(120 50 50)"/></g></svg>`;

function renderPieces() {
  const g = app.game;
  const alive = new Set();
  for (const p of g.pieces) {
    alive.add(p.id);
    let el = pieceEls.get(p.id);
    if (!el) {
      el = document.createElement('div');
      el.innerHTML = (p.kind === 'core' ? CORE_SVG : '') + '<div class="orb"></div>';
      $('#pieces').appendChild(el);
      pieceEls.set(p.id, el);
    }
    const s = toScreen(p.x, p.y);
    el.style.setProperty('--x', s.x);
    el.style.setProperty('--y', s.y);
    const onReactor = p.kind === 'core' && p.x === REACTOR.x && p.y === REACTOR.y;
    el.className = `piece ${p.kind} team${p.owner}` + (app.ui.piece === p.id ? ' selected' : '') + (onReactor ? ' fusing' : '');
  }
  for (const [id, el] of pieceEls) {
    if (alive.has(id) || el.classList.contains('dying')) continue;
    el.classList.add('dying');
    setTimeout(() => {
      el.remove();
      if (pieceEls.get(id) === el) pieceEls.delete(id);
    }, 350);
  }
}

function currentTargets() {
  const g = app.game;
  const { piece, card } = app.ui;
  if (!piece || !isMyTurn()) return new Map();
  const cards = card ? [card] : g.hands[g.turn];
  const map = new Map(); // key -> {capture, count}
  for (const c of [...new Set(cards)]) {
    for (const tg of targetsFor(g, piece, c)) {
      const k = `${tg.x},${tg.y}`;
      const prev = map.get(k);
      map.set(k, { capture: tg.capture, count: (prev?.count || 0) + 1 });
    }
  }
  return map;
}

function renderCells() {
  const g = app.game;
  const targets = currentTargets();
  const last = g.lastMove;
  const charged = g.fusion[0] > 0 || g.fusion[1] > 0;
  const turnTeam = 'team' + g.turn;
  for (const c of cellEls) {
    const sx = +c.dataset.sx;
    const sy = +c.dataset.sy;
    const b = toScreen(sx, sy); // toScreen is its own inverse
    const k = `${b.x},${b.y}`;
    const cls = ['cell'];
    if ((sx + sy) % 2) cls.push('alt');
    if (b.x === REACTOR.x && b.y === REACTOR.y) {
      cls.push('reactor');
      if (charged) cls.push('charged');
    }
    if (last && !last.pass && ((last.from.x === b.x && last.from.y === b.y) || (last.to.x === b.x && last.to.y === b.y))) cls.push('last');
    const tg = targets.get(k);
    if (tg) {
      cls.push('target', turnTeam);
      if (tg.capture) cls.push('capture');
      else if (tg.count > 1 && !app.ui.card) cls.push('both');
    }
    const pend = app.ui.pending || app.ui.chooseCard;
    if (pend && pend.to && pend.to.x === b.x && pend.to.y === b.y) cls.push('pending');
    c.className = cls.join(' ');
  }
}

function renderHand(container, cards, { seat, view, key, playable }) {
  const sig = cards.join(',') + '|' + view + '|' + getLang();
  const fresh = lastHands[key] && lastHands[key] !== sig ? cards.filter((c) => !lastHands[key].split('|')[0].split(',').includes(c)) : [];
  if (lastHands[key] !== sig) {
    container.innerHTML = '';
    for (const c of cards) {
      const el = cardEl(c, { view, owner: seat });
      if (fresh.includes(c)) el.classList.add('fresh');
      container.appendChild(el);
    }
    lastHands[key] = sig;
  }
  for (const el of container.children) {
    const c = el.dataset.card;
    el.classList.toggle('playable', !!playable);
    el.classList.toggle('selected', !!playable && (app.ui.card === c || app.ui.pending?.card === c));
    el.classList.toggle('pick', !!playable && !!app.ui.chooseCard && targetsFor(app.game, app.ui.chooseCard.piece, c).some((tg) => tg.x === app.ui.chooseCard.to.x && tg.y === app.ui.chooseCard.to.y));
    el.classList.toggle('dim', !!playable && !!app.ui.pending && app.ui.pending.card !== c);
  }
}

function renderPanels() {
  const g = app.game;
  const local = app.mode === 'local';
  for (const [pos, seat] of [
    ['top', topSeat()],
    ['bottom', bottomSeat()],
  ]) {
    const panel = $('#panel-' + pos);
    panel.className = `player ${pos} team${seat}` + (g.winner === null && g.turn === seat ? ' turn' : '') + (local && pos === 'top' ? ' rot' : '');
    panel.querySelector('.name').textContent = app.names[seat] || '—';
    const fb = panel.querySelector('.badge.fusion');
    fb.hidden = !(g.fusion[seat] > 0);
    fb.textContent = t('fusionBadge', { n: g.fusion[seat] });
    const off = panel.querySelector('.badge.off');
    off.hidden = !(app.mode === 'online' && app.online.players[seat] && !app.online.players[seat].online);
    const playable = local ? isMyTurn() && g.turn === seat : isMyTurn() && seat === app.me;
    const view = pos === 'bottom' || local ? 'up' : 'down';
    renderHand($('#hand-' + pos), g.hands[seat], { seat, view, key: pos, playable });
  }
  const flux = $('#flux');
  const rotFlux = local && g.turn === topSeat() && g.winner === null;
  flux.classList.toggle('rot', rotFlux);
  renderHand(flux, g.flux, { seat: null, view: 'up', key: 'flux', playable: false });
  for (const el of flux.children) el.classList.toggle('pick', !!app.ui.pending && isMyTurn());
}

function statusText() {
  const g = app.game;
  if (g.winner !== null) return { text: endTitle(), cls: '' };
  if (app.mode === 'online' && !app.online.connected) return { text: t('reconnecting'), cls: 'wait' };
  if (app.mode === 'online' && !app.online.players[1 - app.me]) return { text: t('waitingOpponent'), cls: 'wait' };
  if (isMyTurn()) {
    if (app.ui.pending) return { text: t('pickFlux'), cls: 'mine' };
    if (app.ui.chooseCard) return { text: t('pickCard'), cls: 'mine' };
    if (mustPass()) return { text: t('mustPass'), cls: 'mine' };
    return { text: app.mode === 'local' ? t('yourTurnLocal', { name: app.names[g.turn] }) : t('yourTurn'), cls: 'mine' };
  }
  if (app.mode === 'ai') return { text: t('aiThinking'), cls: 'wait' };
  return { text: t('theirTurn', { name: app.names[g.turn] }), cls: 'wait' };
}

function render() {
  const g = app.game;
  if (!g) return;
  renderPieces();
  renderCells();
  renderPanels();
  const st = statusText();
  const el = $('#status');
  el.textContent = st.text;
  el.className = 'status ' + st.cls;
  $('#btn-emote').hidden = app.mode !== 'online';
}

// ---------------- input ----------------
function resetUi() {
  app.ui = { card: null, piece: null, pending: null, chooseCard: null };
}

function onCellTap(sx, sy) {
  if (!isMyTurn()) return;
  const g = app.game;
  const b = toScreen(sx, sy);
  if (app.ui.pending || app.ui.chooseCard) {
    app.ui.pending = null;
    app.ui.chooseCard = null;
  }
  const piece = pieceAt(g, b.x, b.y);
  if (piece && piece.owner === g.turn) {
    app.ui.piece = app.ui.piece === piece.id ? null : piece.id;
    play('select');
    render();
    return;
  }
  if (!app.ui.piece) return render();
  const cards = app.ui.card ? [app.ui.card] : [...new Set(g.hands[g.turn])];
  const matching = cards.filter((c) => targetsFor(g, app.ui.piece, c).some((tg) => tg.x === b.x && tg.y === b.y));
  if (matching.length === 0) {
    app.ui.piece = null;
  } else if (matching.length === 1) {
    startPending({ card: matching[0], piece: app.ui.piece, to: b });
    return;
  } else {
    app.ui.chooseCard = { piece: app.ui.piece, to: b };
  }
  render();
}

function startPending(move) {
  app.ui.pending = move;
  app.ui.chooseCard = null;
  play('card');
  render();
}

function onHandTap(seat, card) {
  const g = app.game;
  if (!isMyTurn() || seat !== g.turn) return;
  if (mustPass()) {
    startPending({ card, pass: true });
    return;
  }
  if (app.ui.chooseCard) {
    const { piece, to } = app.ui.chooseCard;
    if (targetsFor(g, piece, card).some((tg) => tg.x === to.x && tg.y === to.y)) startPending({ card, piece, to });
    return;
  }
  app.ui.pending = null;
  app.ui.card = app.ui.card === card ? null : card;
  play('select');
  render();
}

function onFluxTap(card) {
  if (!isMyTurn()) return;
  if (!app.ui.pending) {
    toast(t('yourTurn'));
    return;
  }
  const move = { ...app.ui.pending, take: card };
  commit(move);
}

function commit(move) {
  const legal = legalMoves(app.game).find((m) => sameMove(m, move));
  if (!legal) {
    resetUi();
    render();
    return;
  }
  resetUi();
  if (app.mode === 'online') {
    sendOnline({ type: 'move', move: legal });
    // optimistic update; the server's state replaces it
    setGame(applyMove(app.game, legal));
    return;
  }
  setGame(applyMove(app.game, legal));
}

/** Replace the game state, play feedback, and continue the flow. */
function setGame(next, { fresh = false } = {}) {
  const prev = app.game;
  app.game = next;
  if (fresh || !prev) {
    buildBoard();
    resetUi();
  }
  const moved = prev && !fresh && next.ply > prev.ply;
  if (moved) {
    const lm = next.lastMove;
    if (lm?.captured) play('capture');
    else play('move');
    if (next.fusion.some((f, i) => f > (prev.fusion[i] || 0)) && next.winner === null) setTimeout(() => play('fusion'), 150);
  }
  render();
  if (next.winner !== null && (!prev || prev.winner === null || fresh)) {
    setTimeout(showEnd, moved ? 700 : 150);
  }
  if (app.mode === 'ai' && next.winner === null && next.turn !== app.me) runAI();
}

// ---------------- AI ----------------
let worker = null;
let workerSeq = 0;
function getWorker() {
  if (worker !== null) return worker;
  try {
    worker = new Worker(new URL('./ai-worker.js', import.meta.url), { type: 'module' });
  } catch {
    worker = false;
  }
  return worker;
}

async function aiMove(state, level) {
  const w = getWorker();
  if (w) {
    const id = ++workerSeq;
    try {
      return await new Promise((resolve, reject) => {
        const onMsg = (e) => {
          if (e.data.id !== id) return;
          w.removeEventListener('message', onMsg);
          w.removeEventListener('error', onErr);
          if (e.data.error) reject(new Error(e.data.error));
          else resolve(e.data.move);
        };
        const onErr = (e) => {
          w.removeEventListener('message', onMsg);
          w.removeEventListener('error', onErr);
          reject(e);
        };
        w.addEventListener('message', onMsg);
        w.addEventListener('error', onErr);
        w.postMessage({ id, state, level });
      });
    } catch {
      worker = false; // fall back to the main thread from now on
    }
  }
  const { chooseMove } = await import('./ai.js');
  await new Promise((r) => setTimeout(r, 30));
  return chooseMove(state, level);
}

async function runAI() {
  if (app.aiBusy) return;
  app.aiBusy = true;
  render();
  const game = app.game;
  const started = Date.now();
  let move = null;
  try {
    move = await aiMove(game, app.level);
  } catch (err) {
    console.error(err);
  }
  const wait = 550 - (Date.now() - started);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  app.aiBusy = false;
  if (app.game !== game || app.mode !== 'ai') return; // game was abandoned meanwhile
  if (!move) move = legalMoves(game)[0];
  setGame(applyMove(game, move));
}

// ---------------- end of game ----------------
function endTitle() {
  const g = app.game;
  if (g.winner === 'draw') return t('draw');
  if (app.mode === 'local') return t('winsName', { name: app.names[g.winner] });
  return g.winner === app.me ? t('youWin') : t('youLose');
}

function showEnd() {
  const g = app.game;
  if (!g || g.winner === null || app.viewing) return;
  const won = app.mode !== 'local' && g.winner === app.me;
  const lost = app.mode !== 'local' && g.winner !== 'draw' && g.winner !== app.me;
  $('#end-title').textContent = endTitle();
  let reason = t('reason_' + g.reason);
  if (g.reason === 'resign') {
    if (app.mode === 'local') reason = t('reason_resign_name', { name: app.names[1 - g.winner] });
    else reason = g.winner === app.me ? t('reason_resign_them') : t('reason_resign_you');
  }
  if (app.mode === 'online' && !app.online.players[1 - app.me]) reason = t('opponentLeft');
  $('#end-reason').textContent = reason;
  $('#end-burst').textContent = g.winner === 'draw' ? '🤝' : lost ? '💥' : '🏆';
  updateAgainButton();
  if (!showEnd.shownFor || showEnd.shownFor !== g) {
    showEnd.shownFor = g;
    if (won || app.mode === 'local') play('win');
    else if (lost) play('lose');
    if (app.mode === 'ai' && g.winner !== 'draw') {
      const r = store.get('record', { w: 0, l: 0 });
      if (won) r.w++;
      else r.l++;
      store.set('record', r);
      updateRecord();
    }
  }
  openOverlay('overlay-end');
}

function updateAgainButton() {
  const btn = $('#btn-again');
  const label = $('#btn-again-label');
  if (app.mode === 'online') {
    const opp = app.online.players[1 - app.me];
    const asked = app.online.rematch.includes(app.me);
    btn.disabled = !opp || asked;
    label.textContent = asked ? t('waitingRematch') : t('playAgain');
  } else {
    btn.disabled = false;
    label.textContent = t('playAgain');
  }
}

// ---------------- game starters ----------------
function startAI(level) {
  stopOnline();
  app.mode = 'ai';
  app.level = level;
  app.me = 0;
  app.names = [myName() || t('you'), `${t('ai')} · ${t(level)}`];
  app.viewing = false;
  closeOverlay('overlay-end');
  show('game');
  app.game = null;
  setGame(newGame(), { fresh: true });
}

function startLocal() {
  stopOnline();
  app.mode = 'local';
  app.me = 0;
  app.names = [t('amber'), t('cobalt')];
  app.viewing = false;
  closeOverlay('overlay-end');
  show('game');
  app.game = null;
  setGame(newGame(), { fresh: true });
}

function exitToMenu() {
  if (app.mode === 'online') {
    sendOnline({ type: 'leave' });
    clearSession();
    stopOnline();
  }
  app.mode = null;
  app.game = null;
  app.aiBusy = false;
  closeOverlay('overlay-end');
  closeOverlay('overlay-menu');
  show('home');
  updateResume();
}

// ---------------- online ----------------
function wsUrl() {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws`;
}

function setConnStatus(text) {
  $('#conn-status').textContent = text || '';
}

function connect() {
  const o = app.online;
  o.wanted = true;
  if (o.ws && (o.ws.readyState === 0 || o.ws.readyState === 1)) return;
  clearTimeout(o.retryTimer);
  setConnStatus(t('connecting'));
  let ws;
  try {
    ws = new WebSocket(wsUrl());
  } catch {
    setConnStatus(t('connectFailed'));
    return;
  }
  o.ws = ws;
  ws.onopen = () => {
    if (o.ws !== ws) return;
    o.connected = true;
    o.retry = 0;
    setConnStatus(t('connected'));
    if (o.queued) {
      ws.send(JSON.stringify(o.queued));
      o.queued = null;
    } else if (o.room && o.token) {
      o.resuming = true;
      ws.send(JSON.stringify({ type: 'join', room: o.room, token: o.token, name: myName() }));
    }
    clearInterval(o.pingTimer);
    o.pingTimer = setInterval(() => sendOnline({ type: 'ping' }), 20000);
    if (app.game) render();
  };
  ws.onmessage = (e) => {
    if (o.ws !== ws) return;
    let msg;
    try {
      msg = JSON.parse(e.data);
    } catch {
      return;
    }
    onServer(msg);
  };
  ws.onclose = () => {
    if (o.ws !== ws) return;
    o.connected = false;
    o.ws = null;
    clearInterval(o.pingTimer);
    if (app.game) render();
    if (!o.wanted) return;
    const delay = Math.min(10000, 800 * 2 ** o.retry++);
    if (o.retry > 2) setConnStatus(t('connectFailed'));
    o.retryTimer = setTimeout(connect, delay);
  };
}

function sendOnline(msg) {
  const o = app.online;
  if (o.ws && o.ws.readyState === 1) o.ws.send(JSON.stringify(msg));
  else {
    if (msg.type !== 'ping' && msg.type !== 'leave' && msg.type !== 'move') o.queued = msg;
    if (o.wanted) connect();
  }
}

function stopOnline() {
  const o = app.online;
  o.wanted = false;
  clearTimeout(o.retryTimer);
  clearInterval(o.pingTimer);
  if (o.ws) {
    const ws = o.ws;
    o.ws = null;
    try {
      ws.close();
    } catch {
      /* ignore */
    }
  }
  o.connected = false;
  o.queued = null;
  o.room = null;
  o.token = null;
  o.players = [null, null];
  o.rematch = [];
  o.games = 0;
}

function saveSession() {
  const o = app.online;
  store.set('session', { room: o.room, token: o.token, at: Date.now() });
}
function clearSession() {
  store.set('session', undefined);
}
function getSession() {
  const s = store.get('session', null);
  if (!s || !s.room || !s.token || Date.now() - s.at > 6 * 3600 * 1000) return null;
  return s;
}
function updateResume() {
  const s = getSession();
  let btn = $('#btn-resume');
  if (!s) {
    if (btn) btn.remove();
    return;
  }
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'btn-resume';
    btn.className = 'btn primary';
    btn.addEventListener('click', () => resumeOnline(getSession()));
    $('.menu').prepend(btn);
  }
  btn.innerHTML = `<span class="ico">▶️</span><span></span>`;
  btn.lastChild.textContent = `${getLang() === 'es' ? 'Volver a la sala' : 'Back to room'} ${s.room}`;
}

function beginOnline(firstMessage, { quick = false } = {}) {
  stopOnline();
  app.mode = 'online';
  app.game = null;
  app.online.quick = quick;
  app.online.queued = firstMessage;
  connect();
}

function resumeOnline(session) {
  if (!session) return;
  stopOnline();
  app.mode = 'online';
  app.game = null;
  app.online.room = session.room;
  app.online.token = session.token;
  app.online.quick = false;
  connect();
  showWait();
}

function showWait() {
  const o = app.online;
  $('#wait-code').textContent = o.room || '····';
  $('#wait-text').textContent = o.quick ? t('waitingQuick') : t('waitingFriend');
  $('#btn-share').hidden = o.quick;
  $('#btn-copy').hidden = o.quick;
  $('#wait-code').hidden = o.quick;
  show('wait');
}

function inviteUrl() {
  return `${location.origin}${location.pathname}?room=${app.online.room}`;
}

function onServer(msg) {
  const o = app.online;
  switch (msg.type) {
    case 'joined':
      o.room = msg.room;
      o.seat = msg.seat;
      o.token = msg.token;
      app.me = msg.seat;
      saveSession();
      setConnStatus('');
      break;
    case 'state': {
      o.resuming = false;
      o.players = msg.players;
      o.rematch = msg.rematch || [];
      app.me = msg.you;
      const oppName = msg.players[1 - msg.you]?.name;
      app.names = msg.players.map((p, i) => (p ? p.name : i === msg.you ? myName() : '…'));
      if (!msg.state) {
        app.game = null;
        if (!$('#screen-wait').classList.contains('active')) showWait();
        else showWait();
        return;
      }
      const fresh = !app.game || msg.games !== o.games || msg.state.ply < app.game.ply;
      if (msg.games !== o.games && o.games) {
        app.viewing = false;
        closeOverlay('overlay-end');
      }
      o.games = msg.games;
      if (!$('#screen-game').classList.contains('active')) {
        show('game');
        if (oppName) play('notify');
      }
      const prev = app.game;
      const next = { ...msg.state, seen: {} };
      if (!fresh && prev && prev.ply === next.ply && prev.winner === next.winner) {
        // nothing new on the board (e.g. presence / rematch update)
        app.game = next;
        render();
        if (next.winner !== null && !$('#overlay-end').hidden) updateAgainButton();
        if (o.rematch.includes(1 - app.me) && !o.rematch.includes(app.me)) toast(t('rematchOffer', { name: oppName || '' }));
        return;
      }
      if (fresh) {
        app.game = null;
        app.viewing = false;
      }
      // keep the board UI selection if it's still our turn after a presence update
      setGame(next, { fresh });
      break;
    }
    case 'emote':
      showEmote(msg.emote);
      break;
    case 'error':
      toast(t('error_' + msg.code));
      if (msg.code === 'no-room' || msg.code === 'room-full') {
        if (o.resuming || $('#screen-wait').classList.contains('active') || app.mode === 'online') {
          clearSession();
          stopOnline();
          app.mode = null;
          show('online');
          updateResume();
        }
      } else if (msg.code === 'illegal' || msg.code === 'not-your-turn') {
        // resync with the server
        sendOnline({ type: 'join', room: o.room, token: o.token });
      }
      break;
    case 'kicked':
      toast(t('kicked'), 3500);
      stopOnline();
      app.mode = null;
      show('home');
      break;
    default:
      break;
  }
}

function showEmote(emote) {
  const el = $('#emote-pop');
  el.textContent = emote;
  el.classList.add('show');
  clearTimeout(showEmote.timer);
  showEmote.timer = setTimeout(() => el.classList.remove('show'), 1400);
}

// ---------------- wiring ----------------
function wire() {
  document.addEventListener('pointerdown', unlockAudio, { passive: true });

  $('#btn-lang').addEventListener('click', () => {
    setLang(getLang() === 'es' ? 'en' : 'es');
    store.set('lang', getLang());
    applyTexts();
  });
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled());
    store.set('sound', soundEnabled());
    $('#btn-sound').textContent = soundEnabled() ? '🔊' : '🔇';
    toast(soundEnabled() ? '🔊' : '🔇', 900);
  };
  $('#btn-sound').addEventListener('click', toggleSound);
  $('#btn-m-sound').addEventListener('click', toggleSound);

  $('#input-name').addEventListener('change', () => store.set('name', myName()));

  $('#btn-online').addEventListener('click', () => show('online'));
  $('#btn-ai').addEventListener('click', () => show('ai'));
  $('#btn-local').addEventListener('click', startLocal);
  $('#btn-rules').addEventListener('click', () => openOverlay('overlay-rules'));
  $$('[data-back]').forEach((b) => b.addEventListener('click', () => show('home')));
  $$('[data-level]').forEach((b) => b.addEventListener('click', () => startAI(b.dataset.level)));

  $('#btn-create').addEventListener('click', () => {
    store.set('name', myName());
    beginOnline({ type: 'create', name: myName() });
    app.online.room = null;
    showWait();
  });
  const join = () => {
    const code = $('#input-code').value.trim().toUpperCase();
    if (code.length !== 4) {
      toast(t('enterCode'));
      return;
    }
    store.set('name', myName());
    const session = getSession();
    const token = session && session.room === code ? session.token : undefined;
    beginOnline({ type: 'join', room: code, name: myName(), token });
    setConnStatus(t('connecting'));
  };
  $('#btn-join').addEventListener('click', join);
  $('#input-code').addEventListener('keydown', (e) => e.key === 'Enter' && join());
  $('#btn-quick').addEventListener('click', () => {
    store.set('name', myName());
    beginOnline({ type: 'quick', name: myName() }, { quick: true });
    app.online.room = null;
    showWait();
  });
  $('#btn-wait-back').addEventListener('click', exitToMenu);
  $('#btn-share').addEventListener('click', async () => {
    const url = inviteUrl();
    const text = t('shareText', { code: app.online.room });
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Atomami', text, url });
        return;
      } catch {
        /* cancelled */
      }
    } else copyLink();
  });
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl());
      toast(t('linkCopied'));
    } catch {
      toast(inviteUrl(), 4000);
    }
  };
  $('#btn-copy').addEventListener('click', copyLink);

  // board
  $('#cells').addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (cell) onCellTap(+cell.dataset.sx, +cell.dataset.sy);
  });
  $('#hand-bottom').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) onHandTap(bottomSeat(), card.dataset.card);
  });
  $('#hand-top').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card && app.mode === 'local') onHandTap(topSeat(), card.dataset.card);
  });
  $('#flux').addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (card) onFluxTap(card.dataset.card);
  });
  $('#status').addEventListener('click', () => {
    if (app.game && app.game.winner !== null) {
      app.viewing = false;
      showEnd();
    }
  });

  // menu & overlays
  $('#btn-menu').addEventListener('click', () => {
    $('#btn-m-resign').disabled = !app.game || app.game.winner !== null || (app.mode === 'online' && !app.online.connected);
    openOverlay('overlay-menu');
  });
  $$('[data-close]').forEach((b) => b.addEventListener('click', () => (b.closest('.overlay').hidden = true)));
  $$('.overlay').forEach((o) =>
    o.addEventListener('click', (e) => {
      if (e.target === o && o.id !== 'overlay-end') o.hidden = true;
    }),
  );
  $('#btn-m-rules').addEventListener('click', () => {
    closeOverlay('overlay-menu');
    openOverlay('overlay-rules');
  });
  $('#btn-m-resign').addEventListener('click', () => {
    if (!app.game || app.game.winner !== null) return;
    if (!confirm(t('confirmResign'))) return;
    closeOverlay('overlay-menu');
    if (app.mode === 'online') {
      sendOnline({ type: 'resign' });
      return;
    }
    const loser = app.mode === 'local' ? app.game.turn : app.me;
    app.aiBusy = false;
    setGame(resign(app.game, loser));
  });
  $('#btn-m-exit').addEventListener('click', exitToMenu);
  $('#btn-end-exit').addEventListener('click', exitToMenu);
  $('#btn-view').addEventListener('click', () => {
    app.viewing = true;
    closeOverlay('overlay-end');
  });
  $('#btn-again').addEventListener('click', () => {
    if (app.mode === 'ai') startAI(app.level);
    else if (app.mode === 'local') startLocal();
    else if (app.mode === 'online') {
      sendOnline({ type: 'rematch' });
      app.online.rematch = [...app.online.rematch, app.me];
      updateAgainButton();
    }
  });

  // emotes
  $('#btn-emote').addEventListener('click', () => {
    const tray = $('#emote-tray');
    tray.hidden = !tray.hidden;
  });
  $('#emote-tray').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    sendOnline({ type: 'emote', emote: b.textContent });
    showEmote(b.textContent);
    $('#emote-tray').hidden = true;
  });

  // phones suspend background tabs: reconnect as soon as we're visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && app.mode === 'online' && app.online.wanted) {
      const ws = app.online.ws;
      if (!ws || ws.readyState > 1) {
        app.online.retry = 0;
        connect();
      }
    }
  });
  window.addEventListener('online', () => {
    if (app.mode === 'online' && app.online.wanted) connect();
  });
}

function init() {
  const lang = store.get('lang', null) || ((navigator.language || 'es').toLowerCase().startsWith('es') ? 'es' : 'en');
  setLang(lang);
  setSoundEnabled(store.get('sound', true));
  $('#btn-sound').textContent = soundEnabled() ? '🔊' : '🔇';
  $('#input-name').value = store.get('name', '');
  wire();
  applyTexts();

  const standalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  $('#install-hint').hidden = !(ios && !standalone);

  // invite links: ?room=ABCD
  const params = new URLSearchParams(location.search);
  const room = (params.get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  if (room) {
    history.replaceState(null, '', location.pathname);
    $('#input-code').value = room;
    show('online');
    const session = getSession();
    const token = session && session.room === room ? session.token : undefined;
    if (myName() || token) beginOnline({ type: 'join', room, name: myName(), token });
    else {
      // first time here: let them type a name, then tap "Join"
      $('#input-name').focus();
      toast(t('enterName'), 3000);
    }
  }

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

init();

// exposed for automated tests
window.__atomami = app;
