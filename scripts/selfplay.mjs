// Quick balance check: let the AI play itself and report results.
import { newGame, applyMove } from '../public/js/game.js';
import { chooseMove } from '../public/js/ai.js';
const games = Number(process.argv[2] || 20);
const lvl = process.argv[3] || 'normal';
const stats = { wins: [0, 0], firstWins: 0, draws: 0, reasons: {}, plies: 0 };
for (let i = 0; i < games; i++) {
  let s = newGame({ seed: 1000 + i });
  while (s.winner === null) s = applyMove(s, chooseMove(s, lvl));
  stats.plies += s.ply;
  stats.reasons[s.reason] = (stats.reasons[s.reason] || 0) + 1;
  if (s.winner === 'draw') stats.draws++;
  else { stats.wins[s.winner]++; if (s.winner === s.first) stats.firstWins++; }
}
stats.avgPlies = stats.plies / games;
console.log(JSON.stringify(stats));
