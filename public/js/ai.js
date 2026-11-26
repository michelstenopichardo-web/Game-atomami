// Atomami — computer opponent (alpha-beta search with iterative deepening).
import { legalMoves, applyMove, cardOffsets, GATES } from './game.js';

const WIN = 100000;

export const LEVELS = {
  easy: { maxDepth: 1, timeMs: 150, noise: 18 },
  normal: { maxDepth: 3, timeMs: 500, noise: 4 },
  hard: { maxDepth: 10, timeMs: 1300, noise: 0 },
};

/** How many ways `attacker` could hit square (x, y) with the cards in their hand. */
function attacks(state, attacker, x, y, onlyCore = false) {
  let n = 0;
  for (const card of state.hands[attacker]) {
    for (const p of state.pieces) {
      if (p.owner !== attacker || (onlyCore && p.kind !== 'core')) continue;
      for (const [dx, dy] of cardOffsets(card, attacker)) {
        if (p.x + dx === x && p.y + dy === y) n++;
      }
    }
  }
  return n;
}

function mobility(state, player) {
  let n = 0;
  const occupied = new Map();
  for (const p of state.pieces) occupied.set(p.y * 5 + p.x, p.owner);
  for (const card of state.hands[player]) {
    for (const p of state.pieces) {
      if (p.owner !== player) continue;
      for (const [dx, dy] of cardOffsets(card, player)) {
        const x = p.x + dx;
        const y = p.y + dy;
        if (x < 0 || y < 0 || x > 4 || y > 4) continue;
        if (occupied.get(y * 5 + x) === player) continue;
        n++;
      }
    }
  }
  return n;
}

/** Static evaluation from the point of view of `me`. */
function evaluate(state, me) {
  if (state.winner !== null) {
    if (state.winner === 'draw') return 0;
    return state.winner === me ? WIN : -WIN;
  }
  const foe = 1 - me;
  let score = 0;
  const cores = [null, null];
  for (const p of state.pieces) {
    const sign = p.owner === me ? 1 : -1;
    if (p.kind === 'core') {
      cores[p.owner] = p;
      continue;
    }
    score += 100 * sign;
    const dc = Math.abs(p.x - 2) + Math.abs(p.y - 2);
    score += (4 - dc) * 3 * sign;
  }
  for (const player of [me, foe]) {
    const core = cores[player];
    if (!core) continue;
    const sign = player === me ? 1 : -1;
    const gate = GATES[1 - player];
    const d = Math.abs(core.x - gate.x) + Math.abs(core.y - gate.y);
    score += (6 - d) * 5 * sign;
    // Danger: threats against this leader, and the enemy leader eyeing this player's gate.
    const enemy = 1 - player;
    const toMove = state.turn === enemy;
    const hits = attacks(state, enemy, core.x, core.y);
    const myGate = GATES[player];
    const raid = attacks(state, enemy, myGate.x, myGate.y, true);
    score -= (hits * (toMove ? 400 : 60) + raid * (toMove ? 400 : 50)) * sign;
  }
  score += (mobility(state, me) - mobility(state, foe)) * 2;
  return score;
}

function orderMoves(state, moves) {
  const occ = new Map();
  for (const p of state.pieces) occ.set(p.y * 5 + p.x, p);
  const gate = GATES[1 - state.turn];
  return moves
    .map((m) => {
      let k = 0;
      if (!m.pass) {
        const t = occ.get(m.to.y * 5 + m.to.x);
        if (t) k += t.kind === 'core' ? 10000 : 500;
        const piece = state.pieces.find((p) => p.id === m.piece);
        if (piece && piece.kind === 'core' && m.to.x === gate.x && m.to.y === gate.y) k += 9000;
      }
      return { m, k };
    })
    .sort((a, b) => b.k - a.k)
    .map((o) => o.m);
}

class Timeout extends Error {}

/**
 * Choose a move for the side to play.
 * @returns {object} move
 */
export function chooseMove(state, level = 'normal', rng = Math.random) {
  const cfg = LEVELS[level] || LEVELS.normal;
  const me = state.turn;
  const root = legalMoves(state);
  if (root.length === 0) return null;
  if (root.length === 1) return root[0];

  // Immediate win?
  for (const m of root) {
    const s = applyMove(state, m, { track: false });
    if (s.winner === me) return m;
  }

  const deadline = Date.now() + cfg.timeMs;
  let nodes = 0;

  function search(s, depth, alpha, beta) {
    if ((++nodes & 1023) === 0 && Date.now() > deadline) throw new Timeout();
    if (s.winner !== null || depth === 0) {
      const e = evaluate(s, s.turn);
      // prefer faster wins / slower losses
      return e >= WIN ? e - s.ply : e <= -WIN ? e + s.ply : e;
    }
    let best = -Infinity;
    for (const m of orderMoves(s, legalMoves(s))) {
      const child = applyMove(s, m, { track: false });
      const v = -search(child, depth - 1, -beta, -alpha);
      if (v > best) best = v;
      if (v > alpha) alpha = v;
      if (alpha >= beta) break;
    }
    return best;
  }

  let scored = orderMoves(state, root).map((m) => ({ m, v: 0 }));
  for (let depth = 1; depth <= cfg.maxDepth; depth++) {
    try {
      const next = [];
      let alpha = -Infinity;
      for (const { m } of scored) {
        const child = applyMove(state, m, { track: false });
        // With noise we need exact scores for every root move, so search with a full window.
        const v = cfg.noise > 0 ? -search(child, depth - 1, -Infinity, Infinity) : -search(child, depth - 1, -Infinity, -alpha + 1);
        next.push({ m, v });
        if (v > alpha) alpha = v;
      }
      next.sort((a, b) => b.v - a.v);
      scored = next;
      if (scored[0].v >= WIN - 1000) break; // forced win found
    } catch (e) {
      if (!(e instanceof Timeout)) throw e;
      break; // keep the result of the last fully searched depth
    }
  }

  if (cfg.noise > 0) {
    const noisy = scored.map(({ m, v }) => ({ m, v: v + (rng() * 2 - 1) * cfg.noise * 5 }));
    // never throw away a found win or walk into a forced loss because of noise
    noisy.sort((a, b) => b.v - a.v);
    const best = scored[0].v;
    const pick = noisy.find((o) => o.v > -WIN / 2 && (best < WIN / 2 || o.v >= WIN / 2));
    return (pick || scored[0]).m;
  }
  return scored[0].m;
}
