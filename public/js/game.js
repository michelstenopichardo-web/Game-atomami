// Atomami — rules engine (classic card-passing rules).
// Pure functions over plain JSON state, shared by the browser client,
// the AI worker and the online server (which is the authority in online games).
//
// Rules in short:
// - 5x5 board, each player has 1 leader ("core") and 4 pawns ("atoms").
// - 5 movement cards per game: 2 in each hand and 1 on the side.
// - On your turn you use one of your cards to move one piece. The card you used
//   goes to the side and you take the side card, so your opponent receives the
//   card you used after their next move.
// - Win by capturing the enemy leader, or by moving your leader onto the square
//   where the enemy leader started (their "gate").

export const SIZE = 5;
export const MAX_PLIES = 200; // safety net: game is a draw after this many moves
/** Starting square of each player's leader: the square the other player must reach. */
export const GATES = [
  { x: 2, y: SIZE - 1 },
  { x: 2, y: 0 },
];

// Move offsets are written from the point of view of the player using the card:
// dy < 0 means "forward" (towards the opponent), dx > 0 means "to the right".
// Player 1 sits on the other side of the table, so offsets are rotated 180°.
export const CARDS = {
  proton:    { symbol: 'p⁺', es: 'Protón',    en: 'Proton',    moves: [[0, -1], [-1, 0], [1, 0]] },
  neutron:   { symbol: 'n⁰', es: 'Neutrón',   en: 'Neutron',   moves: [[-1, -1], [1, -1], [0, 1]] },
  electron:  { symbol: 'e⁻', es: 'Electrón',  en: 'Electron',  moves: [[-2, 0], [2, 0], [0, -1]] },
  photon:    { symbol: 'γ',  es: 'Fotón',     en: 'Photon',    moves: [[0, -2], [0, 1]] },
  quark:     { symbol: 'q',  es: 'Quark',     en: 'Quark',     moves: [[-1, -1], [1, 1]] },
  antiquark: { symbol: 'q̄',  es: 'Antiquark', en: 'Antiquark', moves: [[1, -1], [-1, 1]] },
  cation:    { symbol: '+',  es: 'Catión',    en: 'Cation',    moves: [[1, 0], [-1, -1], [-1, 1]] },
  anion:     { symbol: '−',  es: 'Anión',     en: 'Anion',     moves: [[-1, 0], [1, -1], [1, 1]] },
  muon:      { symbol: 'μ',  es: 'Muón',      en: 'Muon',      moves: [[-1, -2], [1, -2], [0, 1]] },
  gluon:     { symbol: 'g',  es: 'Gluón',     en: 'Gluon',     moves: [[-1, -1], [1, -1], [-1, 1], [1, 1]] },
  boson:     { symbol: 'B',  es: 'Bosón',     en: 'Boson',     moves: [[0, -1], [0, 1], [-1, 0], [1, 0]] },
  positron:  { symbol: 'e⁺', es: 'Positrón',  en: 'Positron',  moves: [[0, -1], [-1, 1], [1, 1]] },
  lepton:    { symbol: 'ℓ',  es: 'Leptón',    en: 'Lepton',    moves: [[-2, -1], [1, 1]] },
  hadron:    { symbol: 'h',  es: 'Hadrón',    en: 'Hadron',    moves: [[2, -1], [-1, 1]] },
  neutrino:  { symbol: 'ν',  es: 'Neutrino',  en: 'Neutrino',  moves: [[-1, -1], [0, -2], [1, -1]] },
  graviton:  { symbol: 'G',  es: 'Gravitón',  en: 'Graviton',  moves: [[-1, 0], [1, 0], [-1, 1], [1, 1]] },
};
export const CARD_IDS = Object.keys(CARDS);

/** Offsets of a card as seen on the board for a given player. */
export function cardOffsets(cardId, player) {
  const card = CARDS[cardId];
  if (!card) return [];
  return player === 0 ? card.moves : card.moves.map(([dx, dy]) => [-dx, -dy]);
}

// ---------- random helpers ----------

export function makeRng(seed) {
  // mulberry32
  let a = seed >>> 0;
  return function rng() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle(list, rng) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---------- state ----------

/**
 * Create a new game.
 * @param {object} [opts]
 * @param {number} [opts.seed]   deterministic shuffle / first player
 * @param {0|1}    [opts.first]  force the first player
 * @param {string[]} [opts.cards] force the 5 cards: [p0, p0, p1, p1, side]
 */
export function newGame(opts = {}) {
  const seed = opts.seed ?? Math.floor(Math.random() * 2 ** 31);
  const rng = makeRng(seed);
  const deck = opts.cards ? opts.cards.slice() : shuffle(CARD_IDS, rng).slice(0, 5);
  const first = opts.first ?? (rng() < 0.5 ? 0 : 1);

  const pieces = [];
  for (const owner of [0, 1]) {
    const y = owner === 0 ? SIZE - 1 : 0;
    for (let x = 0; x < SIZE; x++) {
      pieces.push({
        id: `${owner}${x}`,
        owner,
        kind: x === 2 ? 'core' : 'atom',
        x,
        y,
      });
    }
  }

  const state = {
    v: 2,
    pieces,
    hands: [[deck[0], deck[1]], [deck[2], deck[3]]],
    side: deck[4],
    turn: first,
    first,
    ply: 0,
    winner: null, // 0 | 1 | 'draw'
    reason: null, // 'capture' | 'gate' | 'repetition' | 'limit' | 'resign'
    lastMove: null,
    seen: {},
  };
  state.seen[positionKey(state)] = 1;
  return state;
}

export function clone(state) {
  return {
    ...state,
    pieces: state.pieces.map((p) => ({ ...p })),
    hands: [state.hands[0].slice(), state.hands[1].slice()],
    lastMove: state.lastMove ? { ...state.lastMove } : null,
    seen: { ...state.seen },
  };
}

export function pieceAt(state, x, y) {
  return state.pieces.find((p) => p.x === x && p.y === y) || null;
}

export function inside(x, y) {
  return x >= 0 && y >= 0 && x < SIZE && y < SIZE;
}

function positionKey(state) {
  const cells = new Array(SIZE * SIZE).fill('.');
  for (const p of state.pieces) {
    cells[p.y * SIZE + p.x] = p.kind === 'core' ? (p.owner ? 'C' : 'c') : p.owner ? 'A' : 'a';
  }
  const hand = (h) => h.slice().sort().join(',');
  return `${cells.join('')}|${hand(state.hands[0])}|${hand(state.hands[1])}|${state.side}|${state.turn}`;
}

// ---------- moves ----------

/**
 * Every legal move for the player to move.
 * A move is { card, piece, to: {x, y} } or, when no piece can move at all,
 * { card, pass: true } (the player still gives up that card).
 */
export function legalMoves(state) {
  if (state.winner !== null) return [];
  const player = state.turn;
  const moves = [];
  const hand = [...new Set(state.hands[player])];
  for (const card of hand) {
    for (const piece of state.pieces) {
      if (piece.owner !== player) continue;
      for (const [dx, dy] of cardOffsets(card, player)) {
        const x = piece.x + dx;
        const y = piece.y + dy;
        if (!inside(x, y)) continue;
        const target = pieceAt(state, x, y);
        if (target && target.owner === player) continue;
        moves.push({ card, piece: piece.id, to: { x, y } });
      }
    }
  }
  if (moves.length === 0) {
    for (const card of hand) moves.push({ card, pass: true });
  }
  return moves;
}

/** Destinations a piece could reach with a card (ignores whose turn it is). */
export function targetsFor(state, pieceId, card) {
  const piece = state.pieces.find((p) => p.id === pieceId);
  if (!piece) return [];
  const out = [];
  for (const [dx, dy] of cardOffsets(card, piece.owner)) {
    const x = piece.x + dx;
    const y = piece.y + dy;
    if (!inside(x, y)) continue;
    const target = pieceAt(state, x, y);
    if (target && target.owner === piece.owner) continue;
    out.push({ x, y, capture: !!target });
  }
  return out;
}

export function isLegal(state, move) {
  if (!move || typeof move !== 'object') return false;
  return legalMoves(state).some((m) => sameMove(m, move));
}

export function sameMove(a, b) {
  if (!a || !b) return false;
  if (a.card !== b.card) return false;
  if (a.pass || b.pass) return !!a.pass === !!b.pass;
  return a.piece === b.piece && !!a.to && !!b.to && a.to.x === b.to.x && a.to.y === b.to.y;
}

/**
 * Apply a move and return the new state. Does NOT validate legality
 * (call isLegal first when the move comes from an untrusted source).
 * Pass { track: false } to skip repetition bookkeeping (used by the AI).
 */
export function applyMove(state, move, { track = true } = {}) {
  const s = clone(state);
  const player = s.turn;
  const opponent = 1 - player;
  let captured = null;
  let from = null;
  let moved = null;

  if (!move.pass) {
    moved = s.pieces.find((p) => p.id === move.piece);
    from = { x: moved.x, y: moved.y };
    const target = pieceAt(s, move.to.x, move.to.y);
    if (target) {
      captured = { id: target.id, kind: target.kind, owner: target.owner };
      s.pieces = s.pieces.filter((p) => p !== target);
    }
    moved.x = move.to.x;
    moved.y = move.to.y;
  }

  // Card flow: the used card goes to the side, the side card joins the hand.
  const received = s.side;
  const hand = s.hands[player];
  hand.splice(hand.indexOf(move.card), 1);
  hand.push(received);
  s.side = move.card;

  s.lastMove = {
    player,
    card: move.card,
    received,
    piece: move.piece ?? null,
    from,
    to: move.pass ? null : { ...move.to },
    pass: !!move.pass,
    captured,
  };
  s.ply += 1;
  s.turn = opponent;

  if (captured && captured.kind === 'core') {
    s.winner = player;
    s.reason = 'capture';
    return s;
  }
  const gate = GATES[opponent];
  if (moved && moved.kind === 'core' && moved.x === gate.x && moved.y === gate.y) {
    s.winner = player;
    s.reason = 'gate';
    return s;
  }

  if (track) {
    const key = positionKey(s);
    s.seen[key] = (s.seen[key] || 0) + 1;
    if (s.seen[key] >= 3) {
      s.winner = 'draw';
      s.reason = 'repetition';
      return s;
    }
  }
  if (s.ply >= MAX_PLIES) {
    s.winner = 'draw';
    s.reason = 'limit';
  }
  return s;
}

export function resign(state, player) {
  const s = clone(state);
  s.winner = 1 - player;
  s.reason = 'resign';
  return s;
}

/** True if any enemy piece could capture this player's leader next turn (ignoring whose turn it is). */
export function coreThreatened(state, player) {
  const core = state.pieces.find((p) => p.owner === player && p.kind === 'core');
  if (!core) return true;
  const enemy = 1 - player;
  for (const card of state.hands[enemy]) {
    for (const p of state.pieces) {
      if (p.owner !== enemy) continue;
      for (const [dx, dy] of cardOffsets(card, enemy)) {
        if (p.x + dx === core.x && p.y + dy === core.y) return true;
      }
    }
  }
  return false;
}
