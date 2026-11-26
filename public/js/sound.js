// Tiny synthesized sound effects (no audio files needed).
let ctx = null;
let enabled = true;

export function setSoundEnabled(on) {
  enabled = !!on;
}
export function soundEnabled() {
  return enabled;
}

/** iOS only allows audio after a user gesture: call this from a tap handler. */
export function unlockAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return;
  }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    ctx = new AC();
  } catch {
    ctx = null;
  }
}

function tone(freq, start, dur, { type = 'sine', vol = 0.12, slide = 0 } = {}) {
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const SOUNDS = {
  select: () => tone(880, 0, 0.06, { type: 'triangle', vol: 0.06 }),
  card: () => tone(660, 0, 0.05, { type: 'triangle', vol: 0.05 }),
  move: () => {
    tone(420, 0, 0.12, { type: 'sine', vol: 0.12, slide: 220 });
  },
  capture: () => {
    tone(300, 0, 0.18, { type: 'square', vol: 0.06, slide: -180 });
    tone(150, 0.05, 0.22, { type: 'sawtooth', vol: 0.05, slide: -90 });
  },
  fusion: () => {
    tone(520, 0, 0.25, { type: 'sine', vol: 0.08, slide: 260 });
    tone(780, 0.08, 0.25, { type: 'sine', vol: 0.06, slide: 390 });
  },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.25, { type: 'triangle', vol: 0.1 })),
  lose: () => [440, 370, 311, 262].forEach((f, i) => tone(f, i * 0.13, 0.28, { type: 'sine', vol: 0.09 })),
  notify: () => {
    tone(740, 0, 0.09, { type: 'sine', vol: 0.08 });
    tone(988, 0.1, 0.12, { type: 'sine', vol: 0.08 });
  },
};

export function play(name) {
  if (!enabled || !ctx || ctx.state !== 'running') return;
  const fn = SOUNDS[name];
  if (fn) {
    try {
      fn();
    } catch {
      /* ignore audio errors */
    }
  }
}
