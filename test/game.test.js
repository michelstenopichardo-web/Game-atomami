import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newGame, legalMoves, applyMove, isLegal, cardOffsets, CARDS, CARD_IDS, GATES, resign } from '../public/js/game.js';
import { chooseMove } from '../public/js/ai.js';

const fixed = (first = 0) => newGame({ first, cards: ['proton', 'photon', 'boson', 'quark', 'gluon'] });

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

test('setup: 5 pieces each, 5 distinct cards in play', () => {
  const s = newGame({ seed: 42 });
  assert.equal(s.pieces.length, 10);
  assert.equal(s.pieces.filter((p) => p.kind === 'core').length, 2);
  const cards = [...s.hands[0], ...s.hands[1], s.side];
  assert.equal(new Set(cards).size, 5);
  assert.ok(s.turn === 0 || s.turn === 1);
});

test('player 1 sees cards rotated 180 degrees', () => {
  assert.deepEqual(cardOffsets('lepton', 0), [[-2, -1], [1, 1]]);
  assert.deepEqual(cardOffsets('lepton', 1), [[2, 1], [-1, -1]]);
});

test('moves respect the board and your own pieces', () => {
  const moves = legalMoves(fixed(0));
  assert.ok(moves.length > 0);
  for (const m of moves) {
    assert.ok(['proton', 'photon'].includes(m.card));
    assert.ok(m.to.x >= 0 && m.to.x < 5 && m.to.y >= 0 && m.to.y < 5);
    assert.equal(m.take, undefined);
  }
  assert.ok(!moves.some((m) => m.card === 'proton' && m.to.y === 4), 'cannot land on a friend');
});

test('classic card flow: used card goes to the side, side card joins the hand, then the opponent gets it', () => {
  let s = fixed(0);
  s = applyMove(s, { card: 'photon', piece: '01', to: { x: 1, y: 2 } });
  assert.deepEqual(s.hands[0].sort(), ['gluon', 'proton']);
  assert.equal(s.side, 'photon');
  assert.equal(s.turn, 1);
  const reply = legalMoves(s).find((m) => m.card === 'quark');
  s = applyMove(s, reply);
  assert.deepEqual(s.hands[1].sort(), ['boson', 'photon'], 'opponent receives the card I used');
  assert.equal(s.side, 'quark');
});

test('capturing the enemy leader wins', () => {
  let s = fixed(0);
  const enemyCore = s.pieces.find((p) => p.id === '12');
  enemyCore.x = 1;
  enemyCore.y = 3;
  const m = { card: 'proton', piece: '01', to: { x: 1, y: 3 } };
  assert.ok(isLegal(s, m));
  s = applyMove(s, m);
  assert.equal(s.winner, 0);
  assert.equal(s.reason, 'capture');
  assert.deepEqual(legalMoves(s), []);
});

test("moving your leader onto the enemy leader's starting square wins", () => {
  let s = fixed(0);
  // clear the way: put our leader two steps from the enemy gate and remove the enemy leader from it
  const core = s.pieces.find((p) => p.id === '02');
  core.x = 2;
  core.y = 2;
  const enemyCore = s.pieces.find((p) => p.id === '12');
  enemyCore.x = 4;
  enemyCore.y = 2;
  s.pieces = s.pieces.filter((p) => p.id !== '14');
  const m = { card: 'photon', piece: '02', to: { x: GATES[1].x, y: GATES[1].y } };
  assert.ok(isLegal(s, m));
  s = applyMove(s, m);
  assert.equal(s.winner, 0);
  assert.equal(s.reason, 'gate');
});

test('an ordinary piece on the enemy gate does not win', () => {
  let s = fixed(0);
  const atom = s.pieces.find((p) => p.id === '01');
  atom.x = 2;
  atom.y = 2;
  const enemyCore = s.pieces.find((p) => p.id === '12');
  enemyCore.x = 4;
  enemyCore.y = 2;
  s.pieces = s.pieces.filter((p) => p.id !== '14');
  s = applyMove(s, { card: 'photon', piece: '01', to: { x: 2, y: 0 } });
  assert.equal(s.winner, null);
});

test('pass move when no piece can move', () => {
  const s = fixed(0);
  // player 0 has only its leader, in the corner, with cards that all point off the board
  s.pieces = s.pieces.filter((p) => (p.owner === 1 && !(p.x === 0 && p.y === 0)) || p.id === '02');
  const core = s.pieces.find((p) => p.id === '02');
  core.x = 0;
  core.y = 0;
  s.hands[0] = ['neutrino', 'hadron'];
  const moves = legalMoves(s);
  assert.ok(moves.length === 2 && moves.every((m) => m.pass));
  const n = applyMove(s, moves[0]);
  assert.equal(n.turn, 1);
  assert.equal(n.side, moves[0].card);
  assert.ok(n.hands[0].includes(s.side));
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

test('AI takes an immediate leader capture', () => {
  const s = fixed(0);
  const core = s.pieces.find((p) => p.id === '12');
  core.x = 1;
  core.y = 3;
  const n = applyMove(s, chooseMove(s, 'normal'));
  assert.equal(n.winner, 0);
});

test('AI does not leave its leader hanging', () => {
  // An enemy pawn stands right in front of our leader and can take it next turn.
  const s = newGame({ first: 0, cards: ['proton', 'photon', 'boson', 'graviton', 'quark'] });
  const attacker = s.pieces.find((p) => p.id === '10');
  attacker.x = 2;
  attacker.y = 3;
  for (const level of ['normal', 'hard']) {
    const n = applyMove(s, chooseMove(s, level));
    const losses = legalMoves(n).map((m) => applyMove(n, m)).filter((x) => x.winner === 1);
    assert.equal(losses.length, 0, level);
  }
});
