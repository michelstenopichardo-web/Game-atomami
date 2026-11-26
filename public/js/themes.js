// Atomami — visual themes. A theme only changes names, pictures and colours;
// the rules (game.js) are the same for every theme.
import { CARDS } from './game.js';

const TEXT = '︎'; // ask iOS to draw symbols as text glyphs, not emoji

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

// Midnight Alchemy: Sun and Moon houses. Glyphs are the classical alchemical/planetary signs.
const SUN = '☉' + TEXT;
const MOON = '☽' + TEXT;
const glyph = (owner) => (owner === 0 ? SUN : MOON);

const alchemyLeader = (owner) => `<svg class="tok lead" viewBox="0 0 100 100" aria-hidden="true">
  <circle cx="50" cy="50" r="45" class="disc"/>
  <g class="seal"><circle cx="50" cy="50" r="39" class="line"/><polygon points="50,11 83.8,69.5 16.2,69.5" class="line"/><circle cx="50" cy="50" r="19.5" class="line"/></g>
  <text x="50" y="51" class="glyph">${glyph(owner)}</text>
</svg>`;

const alchemyPawn = (owner) => `<svg class="tok" viewBox="0 0 100 100" aria-hidden="true">
  <polygon points="32,10 68,10 90,32 90,68 68,90 32,90 10,68 10,32" class="stone"/>
  <polygon points="36,19 64,19 81,36 81,64 64,81 36,81 19,64 19,36" class="rim"/>
  <text x="50" y="52" class="glyph small">${glyph(owner)}</text>
</svg>`;

const ALCHEMY_LOGO = `<svg viewBox="0 0 120 120" class="logo-atom alchemy" aria-hidden="true">
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

export const THEMES = {
  alchemy: {
    id: 'alchemy',
    icon: '☽' + TEXT,
    name: { es: 'Medianoche', en: 'Midnight' },
    logo: ALCHEMY_LOGO,
    piece: (kind, owner) => (kind === 'core' ? alchemyLeader(owner) : alchemyPawn(owner)),
    cards: ALCHEMY_CARDS,
    terms: {
      es: {
        tagline: 'Duelo de alquimistas a medianoche',
        team0: 'Sol',
        team1: 'Luna',
        leader: 'Alquimista',
        leaderHint: 'la pieza con el sello',
        pawns: 'Gólems',
        center: 'Atanor',
        captureWin: 'Captura',
        holdWin: 'Transmutación',
        flux: 'Crisol',
        lore: 'Medianoche en la ciudad de las torres. Dos casas de alquimistas, la del Sol y la de la Luna, se disputan el Atanor: el horno que puede transmutarlo todo.',
      },
      en: {
        tagline: 'A midnight duel of alchemists',
        team0: 'Sun',
        team1: 'Moon',
        leader: 'Alchemist',
        leaderHint: 'the piece with the seal',
        pawns: 'Golems',
        center: 'Athanor',
        captureWin: 'Capture',
        holdWin: 'Transmutation',
        flux: 'Crucible',
        lore: 'Midnight in the city of towers. Two houses of alchemists, the Sun and the Moon, fight over the Athanor: the furnace that can transmute anything.',
      },
    },
  },
  atom: {
    id: 'atom',
    icon: '⚛' + TEXT,
    name: { es: 'Átomos', en: 'Atoms' },
    logo: ATOM_LOGO,
    piece: (kind) => (kind === 'core' ? ATOM_LEADER : ATOM_PAWN),
    cards: null, // use the default particle names from game.js
    terms: {
      es: {
        tagline: 'Duelo de estrategia atómica',
        team0: 'Ámbar',
        team1: 'Cobalto',
        leader: 'Núcleo',
        leaderHint: 'la pieza con órbitas',
        pawns: 'Átomos',
        center: 'Reactor',
        captureWin: 'Fisión',
        holdWin: 'Fusión',
        flux: 'Flujo',
        lore: 'Dos equipos de partículas se disputan el Reactor.',
      },
      en: {
        tagline: 'An atomic strategy duel',
        team0: 'Amber',
        team1: 'Cobalt',
        leader: 'Core',
        leaderHint: 'the piece with orbits',
        pawns: 'Atoms',
        center: 'Reactor',
        captureWin: 'Fission',
        holdWin: 'Fusion',
        flux: 'Flux',
        lore: 'Two teams of particles fight over the Reactor.',
      },
    },
  },
};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME = 'alchemy';

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
