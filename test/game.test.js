import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, legalMoves, applyMove, isLegal, cardOffsets, CARDS, CARD_IDS, REACTOR, resign } from '../public/js/game.js';
import { chooseMove } from '../public/js/ai.js';

const fixed = (first = 0) => newGame({ first, cards: ['proton', 'photon', 'boson', 'quark', 'gluon', 'muon'] });

test('16 unique cards with on-board offsets', () => {
  assert.equal(CARD_IDS.length, 16);
  const patterns = new Set(CARD_IDS.map((id) => JSON.stringify(CARDS[id].moves.slice().sort())));
  assert.equal(patterns.size, 16);
  for (const id of CARD_IDS) {
    for (const [dx, dy] of CARDS[id].moves) {
      assert.ok(Math.abs(dx) <= 2 && Math.abs(dy) <= 2 && (dx || dy));
    }
  }
});

test('setup: 5 pieces each, 6 distinct cards in play', () => {
  const s = newGame({ seed: 42 });
  assert.equal(s.pieces.length, 10);
  assert.equal(s.pieces.filter((p) => p.kind === 'core').length, 2);
  const cards = [...s.hands[0], ...s.hands[1], ...s.flux];
  assert.equal(new Set(cards).size, 6);
  assert.ok(s.turn === 0 || s.turn === 1);
});

test('player 1 sees cards rotated 180 degrees', () => {
  assert.deepEqual(cardOffsets('lepton', 0), [[-2, -1], [1, 1]]);
  assert.deepEqual(cardOffsets('lepton', 1), [[2, 1], [-1, -1]]);
});

test('moves include a draft choice and respect the board', () => {
  const s = fixed(0);
  const moves = legalMoves(s);
  assert.ok(moves.length > 0);
  for (const m of moves) {
    assert.ok(['gluon', 'muon'].includes(m.take));
    assert.ok(['proton', 'photon'].includes(m.card));
    assert.ok(m.to.x >= 0 && m.to.x < 5 && m.to.y >= 0 && m.to.y < 5);
  }
  // pieces on the back row can't move backwards off the board, and can't land on friends
  assert.ok(!moves.some((m) => m.card === 'photon' && m.to.y === 5));
  assert.ok(!moves.some((m) => m.card === 'proton' && m.to.y === 4));
});

test('card flow: played card goes to the Flux, drafted card joins the hand', () => {
  const s = fixed(0);
  const m = { card: 'photon', piece: '02', to: { x: 2, y: 2 }, take: 'muon' };
  assert.ok(isLegal(s, m));
  const n = applyMove(s, m);
  assert.deepEqual(n.hands[0].sort(), ['muon', 'proton']);
  assert.deepEqual(n.flux.sort(), ['gluon', 'photon']);
  assert.equal(n.turn, 1);
  assert.equal(n.pieces.find((p) => p.id === '02').y, 2);
});

test('capturing the enemy Core wins (fission)', () => {
  let s = fixed(0);
  // put enemy core right in front of our atom
  s.pieces.find((p) => p.id === '12').y = 3;
  s.pieces.find((p) => p.id === '12').x = 1;
  const m = { card: 'proton', piece: '01', to: { x: 1, y: 3 }, take: 'gluon' };
  assert.ok(isLegal(s, m));
  s = applyMove(s, m);
  assert.equal(s.winner, 0);
  assert.equal(s.reason, 'fission');
  assert.deepEqual(legalMoves(s), []);
});

test('holding the Reactor for two enemy turns wins (fusion)', () => {
  let s = fixed(0);
  s = applyMove(s, { card: 'photon', piece: '02', to: { x: 2, y: 2 }, take: 'muon' });
  assert.equal(s.fusion[0], 0);
  // opponent makes a harmless move far away
  const harmless = (st) => legalMoves(st).find((m) => !m.pass && !(m.to.x === REACTOR.x && m.to.y === REACTOR.y));
  s = applyMove(s, harmless(s));
  assert.equal(s.fusion[0], 1, 'first turn starting on the reactor');
  // we move something else
  const other = legalMoves(s).find((m) => m.piece !== '02');
  s = applyMove(s, other);
  if (s.winner === null) {
    const h = harmless(s);
    s = applyMove(s, h);
  }
  assert.equal(s.winner, 0);
  assert.equal(s.reason, 'fusion');
});

test('leaving the Reactor resets the fusion counter', () => {
  let s = fixed(0);
  s = applyMove(s, { card: 'photon', piece: '02', to: { x: 2, y: 2 }, take: 'muon' });
  s = applyMove(s, legalMoves(s).find((m) => !m.pass && !(m.to.x === 2 && m.to.y === 2)));
  assert.equal(s.fusion[0], 1);
  const leave = legalMoves(s).find((m) => m.piece === '02');
  s = applyMove(s, leave);
  s = applyMove(s, legalMoves(s).find((m) => !m.pass));
  assert.equal(s.fusion[0], 0);
});

test('pass move when no piece can move', () => {
  let s = fixed(0);
  // player 0 has only its Core, in the corner, with cards that all point off the board
  s.pieces = s.pieces.filter((p) => p.owner === 1 || p.id === '02');
  const core = s.pieces.find((p) => p.id === '02');
  core.x = 0;
  core.y = 0;
  s.pieces = s.pieces.filter((p) => !(p.owner === 1 && p.x === 0 && p.y === 0));
  s.hands[0] = ['neutrino', 'hadron'];
  const moves = legalMoves(s);
  assert.ok(moves.length > 0 && moves.every((m) => m.pass));
  const n = applyMove(s, moves[0]);
  assert.equal(n.turn, 1);
  assert.ok(n.hands[0].includes(moves[0].take));
  assert.ok(n.flux.includes(moves[0].card));
  assert.deepEqual(n.pieces.find((p) => p.id === '02'), { ...core });
});

test('resign gives the win to the other player', () => {
  const s = resign(fixed(0), 0);
  assert.equal(s.winner, 1);
  assert.equal(s.reason, 'resign');
});

test('AI always returns a legal move and finishes games', () => {
  for (let seed = 1; seed <= 3; seed++) {
    let s = newGame({ seed });
    while (s.winner === null) {
      const m = chooseMove(s, 'easy');
      assert.ok(isLegal(s, m));
      s = applyMove(s, m);
    }
    assert.ok(s.winner === 0 || s.winner === 1 || s.winner === 'draw');
  }
});

test('AI takes an immediate Core capture', () => {
  const s = fixed(0);
  const core = s.pieces.find((p) => p.id === '12');
  core.x = 1;
  core.y = 3;
  const m = chooseMove(s, 'normal');
  const n = applyMove(s, m);
  assert.equal(n.winner, 0);
});
