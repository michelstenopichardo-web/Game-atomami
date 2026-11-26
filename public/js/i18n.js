// Atomami — texts in Spanish and English.
export const STRINGS = {
  es: {
    tagline: '{tagline}',
    yourName: 'Tu nombre',
    playOnline: 'Jugar online',
    playAI: 'Contra la IA',
    playLocal: '2 jugadores (mismo iPhone)',
    howToPlay: 'Cómo jugar',
    installHint: 'Consejo: en Safari toca Compartir → «Añadir a pantalla de inicio» para tenerlo como app.',
    createRoom: 'Crear sala privada',
    createHint: 'Te damos un código para invitar a un amigo.',
    roomCode: 'Código de sala',
    joinRoom: 'Unirse',
    quickMatch: 'Partida rápida',
    quickHint: 'Te emparejamos con quien esté buscando partida.',
    chooseLevel: 'Elige la dificultad',
    easy: 'Fácil',
    normal: 'Normal',
    hard: 'Difícil',
    aiRecord: 'Tu récord contra la IA: {w} victorias · {l} derrotas',
    waitingTitle: 'Sala',
    waitingFriend: 'Comparte este código con tu amigo:',
    waitingQuick: 'Buscando rival…',
    shareInvite: 'Invitar',
    copyLink: 'Copiar enlace',
    linkCopied: 'Enlace copiado',
    shareText: '¡Juega Atomami conmigo! Sala {code}',
    menu: 'Menú',
    toggleSound: 'Sonido sí/no',
    resign: 'Rendirse',
    confirmResign: '¿Seguro que te rindes?',
    yes: 'Sí',
    no: 'No',
    offlineNote: 'Versión de prueba: aquí puedes jugar contra la IA o con alguien en el mismo iPhone. El modo online se activa al poner el servidor en marcha.',
    exitToMenu: 'Salir al menú',
    flux: '{flux}',
    offline: 'desconectado',
    you: 'Tú',
    ai: 'IA',
    amber: '{team0}',
    cobalt: '{team1}',
    theme: 'Tema',
    changeTheme: 'Cambiar tema',
    yourTurn: 'Tu turno: elige carta, pieza y destino',
    yourTurnLocal: 'Turno de {name}',
    pickFlux: 'Elige una carta del {flux}',
    pickCard: '¿Con qué carta? Toca una de tus cartas',
    mustPass: 'No puedes mover: toca una carta tuya para cambiarla',
    theirTurn: 'Turno de {name}…',
    aiThinking: 'La IA está pensando…',
    waitingOpponent: 'Esperando al rival…',
    reconnecting: 'Reconectando…',
    connecting: 'Conectando…',
    connected: 'Conectado',
    connectFailed: 'No se pudo conectar al servidor',
    fusionBadge: '{holdWin} {n}/2',
    youWin: '¡Ganaste!',
    youLose: 'Perdiste',
    draw: 'Empate',
    winsName: '¡Gana {name}!',
    reason_fission: '{captureWin}: el {leader} fue capturado.',
    reason_fusion: '{holdWin}: un {leader} resistió 2 turnos en el {center}.',
    reason_repetition: 'La misma posición se repitió 3 veces.',
    reason_limit: 'Se alcanzó el límite de jugadas.',
    reason_resign: 'Un jugador se rindió.',
    reason_resign_them: 'Tu rival se rindió.',
    reason_resign_you: 'Te rendiste.',
    reason_resign_name: '{name} se rindió.',
    playAgain: 'Revancha',
    waitingRematch: 'Esperando al rival…',
    rematchOffer: '{name} quiere la revancha',
    viewBoard: 'Ver tablero',
    opponentLeft: 'Tu rival salió de la sala',
    'error_room-full': 'La sala está llena',
    error_full: 'El servidor está lleno, prueba más tarde',
    error_illegal: 'Movimiento no válido',
    'error_not-your-turn': 'No es tu turno',
    'error_no-room': 'Esa sala no existe',
    error_server: 'Error del servidor',
    error_rate: 'Vas muy rápido, espera un momento',
    kicked: 'Abriste esta partida en otra pestaña',
    enterCode: 'Escribe el código de 4 letras',
    enterName: 'Escribe tu nombre y toca «Unirse»',
    offlineOnly: 'El modo online necesita conexión al servidor.',
    rulesHtml: `
      <p class="lore">{lore}</p>
      <h3>Objetivo</h3>
      <p>Cada equipo tiene <b>1 {leader}</b> ({leaderHint}) y <b>4 {pawns}</b>. Ganas de dos formas:</p>
      <ul>
        <li><b>{captureWin}</b>: captura el {leader} rival.</li>
        <li><b>{holdWin}</b>: lleva tu {leader} al <b>{center}</b> (la casilla central) y mantenlo ahí. Si tu {leader} empieza <b>2 de tus turnos seguidos</b> en el {center}, ganas. Tu rival tiene dos turnos para echarte.</li>
      </ul>
      <h3>Tu turno</h3>
      <ol>
        <li>Elige una de tus <b>2 cartas</b>. El punto blanco es tu pieza y los cuadros de color son a dónde puede saltar (arriba = hacia el rival).</li>
        <li>Mueve <b>una</b> de tus piezas según esa carta. Puede saltar por encima de otras piezas.</li>
        <li>Si caes en una pieza rival, la <b>capturas</b>. No puedes caer en una tuya ni salir del tablero.</li>
        <li><b>Draft del {flux}</b>: la carta que usaste va al {flux} y tú te quedas con una de las 2 cartas que ya estaban allí. ¡Ojo: tu rival podrá llevarse la carta que acabas de usar!</li>
      </ol>
      <h3>Detalles</h3>
      <ul>
        <li>Solo se usan 6 de las 16 cartas en cada partida: 2 por jugador y 2 en el {flux}. Todas están a la vista.</li>
        <li>Si no tienes ningún movimiento posible, igual cambias una carta tuya por una del {flux}.</li>
        <li>El tema (en el menú) solo cambia el aspecto; las reglas son las mismas. En online cada jugador ve su propio tema.</li>
        <li>Empate si la misma posición se repite 3 veces o tras 200 jugadas.</li>
        <li>Quién empieza se decide al azar.</li>
      </ul>
      <h3>Las 16 cartas</h3>`,
  },
  en: {
    tagline: '{tagline}',
    yourName: 'Your name',
    playOnline: 'Play online',
    playAI: 'Play the AI',
    playLocal: '2 players (same iPhone)',
    howToPlay: 'How to play',
    installHint: 'Tip: in Safari tap Share → "Add to Home Screen" to use it like an app.',
    createRoom: 'Create private room',
    createHint: 'You get a code to invite a friend.',
    roomCode: 'Room code',
    joinRoom: 'Join',
    quickMatch: 'Quick match',
    quickHint: 'We pair you with whoever is looking for a game.',
    chooseLevel: 'Choose difficulty',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    aiRecord: 'Your record vs the AI: {w} wins · {l} losses',
    waitingTitle: 'Room',
    waitingFriend: 'Share this code with your friend:',
    waitingQuick: 'Looking for an opponent…',
    shareInvite: 'Invite',
    copyLink: 'Copy link',
    linkCopied: 'Link copied',
    shareText: 'Play Atomami with me! Room {code}',
    menu: 'Menu',
    toggleSound: 'Sound on/off',
    resign: 'Resign',
    confirmResign: 'Are you sure you want to resign?',
    yes: 'Yes',
    no: 'No',
    offlineNote: 'Preview build: play the AI or a friend on the same iPhone. Online play turns on once the server is running.',
    exitToMenu: 'Exit to menu',
    flux: '{flux}',
    offline: 'offline',
    you: 'You',
    ai: 'AI',
    amber: '{team0}',
    cobalt: '{team1}',
    theme: 'Theme',
    changeTheme: 'Change theme',
    yourTurn: 'Your turn: pick a card, a piece and a square',
    yourTurnLocal: "{name}'s turn",
    pickFlux: 'Pick a card from the {flux}',
    pickCard: 'Which card? Tap one of your cards',
    mustPass: 'No moves: tap one of your cards to swap it',
    theirTurn: "{name}'s turn…",
    aiThinking: 'The AI is thinking…',
    waitingOpponent: 'Waiting for opponent…',
    reconnecting: 'Reconnecting…',
    connecting: 'Connecting…',
    connected: 'Connected',
    connectFailed: 'Could not reach the server',
    fusionBadge: '{holdWin} {n}/2',
    youWin: 'You win!',
    youLose: 'You lose',
    draw: 'Draw',
    winsName: '{name} wins!',
    reason_fission: '{captureWin}: the {leader} was captured.',
    reason_fusion: '{holdWin}: the {leader} held the {center} for 2 turns.',
    reason_repetition: 'The same position happened 3 times.',
    reason_limit: 'Move limit reached.',
    reason_resign: 'A player resigned.',
    reason_resign_them: 'Your opponent resigned.',
    reason_resign_you: 'You resigned.',
    reason_resign_name: '{name} resigned.',
    playAgain: 'Rematch',
    waitingRematch: 'Waiting for opponent…',
    rematchOffer: '{name} wants a rematch',
    viewBoard: 'View board',
    opponentLeft: 'Your opponent left the room',
    'error_room-full': 'That room is full',
    error_full: 'Server is full, try again later',
    error_illegal: 'Illegal move',
    'error_not-your-turn': 'Not your turn',
    'error_no-room': "That room doesn't exist",
    error_server: 'Server error',
    error_rate: 'Slow down a little',
    kicked: 'You opened this game in another tab',
    enterCode: 'Type the 4-letter code',
    enterName: 'Type your name and tap "Join"',
    offlineOnly: 'Online mode needs a connection to the server.',
    rulesHtml: `
      <p class="lore">{lore}</p>
      <h3>Goal</h3>
      <p>Each team has <b>1 {leader}</b> ({leaderHint}) and <b>4 {pawns}</b>. Win in one of two ways:</p>
      <ul>
        <li><b>{captureWin}</b>: capture the enemy {leader}.</li>
        <li><b>{holdWin}</b>: bring your {leader} to the <b>{center}</b> (the centre square) and hold it. If your {leader} starts <b>2 of your turns in a row</b> on the {center}, you win. Your opponent gets two turns to knock you off.</li>
      </ul>
      <h3>Your turn</h3>
      <ol>
        <li>Pick one of your <b>2 cards</b>. The white dot is your piece and the coloured squares are where it can jump (up = towards the opponent).</li>
        <li>Move <b>one</b> of your pieces using that card. Pieces jump over anything in between.</li>
        <li>Landing on an enemy piece <b>captures</b> it. You can't land on your own piece or leave the board.</li>
        <li><b>{flux} draft</b>: the card you used goes to the {flux} and you take one of the 2 cards that were already there. Careful: your opponent can grab the card you just used!</li>
      </ol>
      <h3>Details</h3>
      <ul>
        <li>Only 6 of the 16 cards are used each game: 2 per player and 2 in the {flux}. Everything is visible.</li>
        <li>If you have no legal move, you still swap one of your cards with the {flux}.</li>
        <li>The theme (in the menu) only changes the look; the rules are the same. Online, each player sees their own theme.</li>
        <li>Draw if the same position happens 3 times or after 200 moves.</li>
        <li>The first player is chosen at random.</li>
      </ul>
      <h3>The 16 cards</h3>`,
  },
};

let lang = 'es';
let themeVars = () => ({});

/** Words that depend on the visual theme ({leader}, {center}, ...). */
export function setThemeVars(fn) {
  themeVars = fn;
}

export function setLang(l) {
  lang = STRINGS[l] ? l : 'es';
  document.documentElement.lang = lang;
}

export function getLang() {
  return lang;
}

export function t(key, vars = {}) {
  const str = STRINGS[lang][key] ?? STRINGS.es[key] ?? key;
  const all = { ...themeVars(lang), ...vars };
  return str.replace(/\{(\w+)\}/g, (_, k) => (all[k] ?? ''));
}
