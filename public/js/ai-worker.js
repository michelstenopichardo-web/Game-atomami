// Runs the AI search off the main thread so the board stays smooth.
import { chooseMove } from './ai.js';

self.onmessage = (event) => {
  const { id, state, level } = event.data;
  let move = null;
  try {
    move = chooseMove(state, level);
  } catch (err) {
    self.postMessage({ id, error: String(err) });
    return;
  }
  self.postMessage({ id, move });
};
