// Atomami — visual themes. A theme only changes names, pictures and colours;
// the rules (game.js) are the same for every theme.
import { CARDS } from './game.js';

const TEXT = '︎'; // ask iOS to draw symbols as text glyphs, not emoji
const column = (p) => Number(p.id[1]); // pieces keep the column they started in

// ---------------------------------------------------------------- Mistborn (fan)
// Unofficial fan theme for personal use. Mistborn and its characters belong to
// Brandon Sanderson / Dragonsteel; all drawings here are original and simple.
const CREW = [
  { letter: 'H', es: 'Ham', en: 'Ham' },
  { letter: 'V', es: 'Vin', en: 'Vin' },
  { letter: 'K', es: 'Kelsier', en: 'Kelsier' },
  { letter: 'S', es: 'Sazed', en: 'Sazed' },
  { letter: 'B', es: 'Brisa', en: 'Breeze' },
];
const EMPIRE = { leader: { es: 'Lord Legislador', en: 'Lord Ruler' }, pawn: { es: 'Inquisidor de Acero', en: 'Steel Inquisitor' } };

const ticks = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const r1 = 36;
  const r2 = 42;
  const f = (r, fn) => (50 + r * fn(a)).toFixed(1);
  return `<line x1="${f(r1, Math.cos)}" y1="${f(r1, Math.sin)}" x2="${f(r2, Math.cos)}" y2="${f(r2, Math.sin)}"/>`;
}).join('');

function mistbornPiece(p) {
  if (p.owner === 0) {
    const who = CREW[column(p)] || CREW[0];
    if (p.kind === 'core') {
      return `<svg class="tok lead" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="45" class="disc"/>
        <g class="seal ticks">${ticks}</g>
        <circle cx="50" cy="50" r="31" class="line"/>
        <text x="50" y="52" class="glyph letter big">${who.letter}</text>
      </svg>`;
    }
    return `<svg class="tok" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="40" class="coin"/>
      <circle cx="50" cy="50" r="32" class="rim"/>
      <text x="50" y="52" class="glyph letter">${who.letter}</text>
    </svg>`;
  }
  if (p.kind === 'core') {
    return `<svg class="tok lead" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="45" class="disc"/>
      <circle cx="50" cy="50" r="38" class="line"/>
      <path d="M27 64 L27 40 L38.5 52 L50 32 L61.5 52 L73 40 L73 64 Z" class="crown"/>
    </svg>`;
  }
  return `<svg class="tok" viewBox="0 0 100 100" aria-hidden="true">
    <polygon points="50,9 86,30 86,70 50,91 14,70 14,30" class="stone"/>
    <polygon points="50,19 77,35 77,65 50,81 23,65 23,35" class="rim"/>
    <path d="M33 42 L45 50 M67 42 L55 50" class="spike"/>
  </svg>`;
}

function mistbornName(p, lang) {
  if (p.owner === 0) return (CREW[column(p)] || CREW[0])[lang];
  return (p.kind === 'core' ? EMPIRE.leader : EMPIRE.pawn)[lang];
}

const MISTBORN_LOGO = `<svg viewBox="0 0 120 120" class="logo-atom still" aria-hidden="true">
  <defs><radialGradient id="mb-sun" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#ff7a5c"/><stop offset=".65" stop-color="#c4261f"/><stop offset="1" stop-color="#5e0d0d"/></radialGradient></defs>
  <g fill="#9a9a9e"><circle cx="20" cy="18" r="1.6"/><circle cx="96" cy="14" r="1.3"/><circle cx="84" cy="34" r="1.1"/><circle cx="30" cy="40" r="1.2"/><circle cx="104" cy="44" r="1.5"/><circle cx="12" cy="52" r="1.1"/><circle cx="58" cy="10" r="1.2"/></g>
  <circle cx="60" cy="56" r="30" fill="url(#mb-sun)"/>
  <g fill="none" stroke="#e9eef5" stroke-linecap="round">
    <path class="mist-band" d="M6 66 C26 57 44 75 64 66 S100 57 114 64" stroke-width="6" opacity=".8"/>
    <path class="mist-band b2" d="M14 81 C34 73 54 89 76 81 S104 75 112 79" stroke-width="4.5" opacity=".55"/>
    <path class="mist-band b3" d="M24 94 C42 88 58 100 82 94" stroke-width="3" opacity=".35"/>
  </g>
</svg>`;

const MISTBORN_CARDS = {
  graviton:  { symbol: 'Fe', es: 'Hierro',      en: 'Iron' },
  photon:    { symbol: 'St', es: 'Acero',       en: 'Steel' },
  neutron:   { symbol: 'Sn', es: 'Estaño',      en: 'Tin' },
  proton:    { symbol: 'Pw', es: 'Peltre',      en: 'Pewter' },
  electron:  { symbol: 'Zn', es: 'Zinc',        en: 'Zinc' },
  cation:    { symbol: 'Bs', es: 'Latón',       en: 'Brass' },
  quark:     { symbol: 'Cu', es: 'Cobre',       en: 'Copper' },
  antiquark: { symbol: 'Bz', es: 'Bronce',      en: 'Bronze' },
  boson:     { symbol: 'Al', es: 'Aluminio',    en: 'Aluminum' },
  gluon:     { symbol: 'Du', es: 'Duraluminio', en: 'Duralumin' },
  anion:     { symbol: 'Cr', es: 'Cromo',       en: 'Chromium' },
  neutrino:  { symbol: 'Nc', es: 'Nicrosil',    en: 'Nicrosil' },
  positron:  { symbol: 'Au', es: 'Oro',         en: 'Gold' },
  lepton:    { symbol: 'El', es: 'Electro',     en: 'Electrum' },
  hadron:    { symbol: 'Cd', es: 'Cadmio',      en: 'Cadmium' },
  muon:      { symbol: 'Bd', es: 'Bendaleo',    en: 'Bendalloy' },
};

// ---------------------------------------------------------------- Midnight Alchemy
const SUN = '☉' + TEXT;
const MOON = '☽' + TEXT;
const glyph = (owner) => (owner === 0 ? SUN : MOON);

function alchemyPiece(p) {
  if (p.kind === 'core') {
    return `<svg class="tok lead" viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="45" class="disc"/>
      <g class="seal"><circle cx="50" cy="50" r="39" class="line"/><polygon points="50,11 83.8,69.5 16.2,69.5" class="line"/><circle cx="50" cy="50" r="19.5" class="line"/></g>
      <text x="50" y="51" class="glyph">${glyph(p.owner)}</text>
    </svg>`;
  }
  return `<svg class="tok" viewBox="0 0 100 100" aria-hidden="true">
    <polygon points="32,10 68,10 90,32 90,68 68,90 32,90 10,68 10,32" class="stone"/>
    <polygon points="36,19 64,19 81,36 81,64 64,81 36,81 19,64 19,36" class="rim"/>
    <text x="50" y="52" class="glyph small">${glyph(p.owner)}</text>
  </svg>`;
}

const ALCHEMY_LOGO = `<svg viewBox="0 0 120 120" class="logo-atom slow" aria-hidden="true">
  <g fill="none" stroke-width="2.4">
    <circle cx="60" cy="60" r="55" stroke="#f2c14e"/>
    <circle cx="60" cy="60" r="48" stroke="#a9c6ff" stroke-dasharray="1.5 6" stroke-linecap="round"/>
    <polygon points="60,14 99.8,83 20.2,83" stroke="#ff8a4c"/>
    <circle cx="60" cy="60" r="23" stroke="#f2c14e"/>
  </g>
  <path d="M60 44 A16 16 0 0 0 60 76 Z" fill="#f2c14e"/>
  <path d="M60 44 A16 16 0 0 1 60 76 Z" fill="#c9d8ff"/>
</svg>`;

const ALCHEMY_CARDS = {
  proton:    { symbol: '☉' + TEXT, es: 'Oro',       en: 'Gold' },
  neutron:   { symbol: '☽' + TEXT, es: 'Plata',     en: 'Silver' },
  electron:  { symbol: '☿' + TEXT, es: 'Mercurio',  en: 'Mercury' },
  photon:    { symbol: '♀' + TEXT, es: 'Cobre',     en: 'Copper' },
  quark:     { symbol: '♂' + TEXT, es: 'Hierro',    en: 'Iron' },
  antiquark: { symbol: '♃' + TEXT, es: 'Estaño',    en: 'Tin' },
  cation:    { symbol: '♄' + TEXT, es: 'Plomo',     en: 'Lead' },
  anion:     { symbol: '♁' + TEXT, es: 'Antimonio', en: 'Antimony' },
  muon:      { symbol: '△', es: 'Fuego',     en: 'Fire' },
  gluon:     { symbol: '▽', es: 'Agua',      en: 'Water' },
  boson:     { symbol: '≋', es: 'Aire',      en: 'Air' },
  positron:  { symbol: '⊕', es: 'Tierra',    en: 'Earth' },
  lepton:    { symbol: '⊖', es: 'Sal',       en: 'Salt' },
  hadron:    { symbol: '✧', es: 'Éter',      en: 'Aether' },
  neutrino:  { symbol: 'ϟ', es: 'Rayo',      en: 'Bolt' },
  graviton:  { symbol: '◈', es: 'Piedra',    en: 'Stone' },
};

// ---------------------------------------------------------------- Atoms
const ATOM_LEADER = `<svg class="orbits" viewBox="0 0 100 100" aria-hidden="true"><g class="spin"><ellipse cx="50" cy="50" rx="46" ry="16"/><ellipse cx="50" cy="50" rx="46" ry="16" transform="rotate(60 50 50)"/><ellipse cx="50" cy="50" rx="46" ry="16" transform="rotate(120 50 50)"/></g></svg><div class="orb"></div>`;
const ATOM_PAWN = `<div class="orb"></div>`;

const ATOM_LOGO = `<svg viewBox="0 0 120 120" class="logo-atom" aria-hidden="true">
  <defs><radialGradient id="lg-core" cx="50%" cy="45%" r="55%"><stop offset="0%" stop-color="#fff3c4"/><stop offset="55%" stop-color="#ffb02e"/><stop offset="100%" stop-color="#b35a00"/></radialGradient></defs>
  <g fill="none" stroke-width="3">
    <ellipse cx="60" cy="60" rx="52" ry="18" stroke="#4cc9f0" opacity=".9"/>
    <ellipse cx="60" cy="60" rx="52" ry="18" stroke="#ffb02e" opacity=".9" transform="rotate(60 60 60)"/>
    <ellipse cx="60" cy="60" rx="52" ry="18" stroke="#b388ff" opacity=".9" transform="rotate(120 60 60)"/>
  </g>
  <circle cx="60" cy="60" r="13" fill="url(#lg-core)"/>
  <circle class="orbiter" cx="112" cy="60" r="5" fill="#4cc9f0"/>
</svg>`;

export const THEMES = {
  mistborn: {
    id: 'mistborn',
    icon: '✦' + TEXT,
    name: { es: 'Mistborn (fan)', en: 'Mistborn (fan)' },
    logo: MISTBORN_LOGO,
    piece: mistbornPiece,
    pieceName: mistbornName,
    cards: MISTBORN_CARDS,
    terms: {
      es: {
        tagline: 'Edición fan · la Banda contra el Imperio Final',
        team0: 'La Banda',
        team1: 'El Imperio',
        leader: 'líder',
        leaderHint: 'Kelsier en la Banda, el Lord Legislador en el Imperio',
        pawns: 'piezas',
        captureWin: 'Caída',
        gateWin: 'Infiltración',
        leaders: ['Kelsier', 'el Lord Legislador'],
        gates: ['la guarida de la Banda', 'Kredik Shaw'],
        lore: 'La Banda: Kelsier (líder), Vin, Sazed, Brisa y Ham. El Imperio Final: el Lord Legislador (líder) y cuatro Inquisidores de Acero. La Banda gana si derriba al Lord Legislador o si Kelsier se infiltra en Kredik Shaw; el Imperio, si atrapa a Kelsier o si el Lord Legislador asalta la guarida. Las cartas son los 16 metales. Tema hecho por fans, no oficial y para uso personal: Mistborn es obra de Brandon Sanderson.',
      },
      en: {
        tagline: 'Fan edition · the Crew vs the Final Empire',
        team0: 'The Crew',
        team1: 'The Empire',
        leader: 'leader',
        leaderHint: 'Kelsier for the Crew, the Lord Ruler for the Empire',
        pawns: 'pieces',
        captureWin: 'Downfall',
        gateWin: 'Infiltration',
        leaders: ['Kelsier', 'the Lord Ruler'],
        gates: ["the Crew's hideout", 'Kredik Shaw'],
        lore: "The Crew: Kelsier (leader), Vin, Sazed, Breeze and Ham. The Final Empire: the Lord Ruler (leader) and four Steel Inquisitors. The Crew wins by bringing down the Lord Ruler or getting Kelsier into Kredik Shaw; the Empire wins by catching Kelsier or raiding the Crew's hideout. The cards are the 16 metals. Unofficial fan theme for personal use: Mistborn is Brandon Sanderson's work.",
      },
    },
  },
  alchemy: {
    id: 'alchemy',
    icon: '☽' + TEXT,
    name: { es: 'Medianoche', en: 'Midnight' },
    logo: ALCHEMY_LOGO,
    piece: alchemyPiece,
    cards: ALCHEMY_CARDS,
    terms: {
      es: {
        tagline: 'Duelo de alquimistas a medianoche',
        team0: 'Sol',
        team1: 'Luna',
        leader: 'Alquimista',
        leaderHint: 'la pieza con el sello',
        pawns: 'Gólems',
        captureWin: 'Captura',
        gateWin: 'Asalto',
        leaders: ['el Alquimista del Sol', 'el Alquimista de la Luna'],
        gates: ['la Torre del Sol', 'la Torre de la Luna'],
        lore: 'Medianoche en la ciudad de las torres. Dos casas de alquimistas, la del Sol y la de la Luna, se disputan la ciudad.',
      },
      en: {
        tagline: 'A midnight duel of alchemists',
        team0: 'Sun',
        team1: 'Moon',
        leader: 'Alchemist',
        leaderHint: 'the piece with the seal',
        pawns: 'Golems',
        captureWin: 'Capture',
        gateWin: 'Assault',
        leaders: ['the Sun Alchemist', 'the Moon Alchemist'],
        gates: ['the Sun Tower', 'the Moon Tower'],
        lore: 'Midnight in the city of towers. Two houses of alchemists, the Sun and the Moon, fight over the city.',
      },
    },
  },
  atom: {
    id: 'atom',
    icon: '⚛' + TEXT,
    name: { es: 'Átomos', en: 'Atoms' },
    logo: ATOM_LOGO,
    piece: (p) => (p.kind === 'core' ? ATOM_LEADER : ATOM_PAWN),
    cards: null, // use the default particle names from game.js
    terms: {
      es: {
        tagline: 'Duelo de estrategia atómica',
        team0: 'Ámbar',
        team1: 'Cobalto',
        leader: 'Núcleo',
        leaderHint: 'la pieza con órbitas',
        pawns: 'Átomos',
        captureWin: 'Fisión',
        gateWin: 'Ruptura',
        leaders: ['el Núcleo Ámbar', 'el Núcleo Cobalto'],
        gates: ['la base Ámbar', 'la base Cobalto'],
        lore: 'Dos equipos de partículas, frente a frente.',
      },
      en: {
        tagline: 'An atomic strategy duel',
        team0: 'Amber',
        team1: 'Cobalt',
        leader: 'Core',
        leaderHint: 'the piece with orbits',
        pawns: 'Atoms',
        captureWin: 'Fission',
        gateWin: 'Breach',
        leaders: ['the Amber Core', 'the Cobalt Core'],
        gates: ['the Amber base', 'the Cobalt base'],
        lore: 'Two teams of particles, face to face.',
      },
    },
  },
};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME = 'mistborn';

let current = THEMES[DEFAULT_THEME];

export function setTheme(id) {
  current = THEMES[id] || THEMES[DEFAULT_THEME];
  return current;
}

export function theme() {
  return current;
}

/** Display info for a card in the current theme: { symbol, name }. */
export function cardLabel(cardId, lang) {
  const base = CARDS[cardId];
  const c = (current.cards && current.cards[cardId]) || base;
  return { symbol: c.symbol, name: c[lang] || c.es };
}

/** Name of a piece in the current theme, or null if the theme doesn't name pieces. */
export function pieceName(p, lang) {
  return current.pieceName ? current.pieceName(p, lang) : null;
}
