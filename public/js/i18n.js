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
    flux: 'Siguiente',
    offline: 'desconectado',
    you: 'Tú',
    ai: 'IA',
    amber: '{team0}',
    cobalt: '{team1}',
    theme: 'Tema',
    changeTheme: 'Cambiar tema',
    yourTurn: 'Tu turno: elige carta, pieza y destino',
    yourTurnLocal: 'Turno de {name}',
    pickTarget: '{name}: elige a dónde mover',
    pickCard: '¿Con qué carta? Toca una de tus cartas',
    mustPass: 'No puedes mover: toca la carta que quieres ceder',
    theirTurn: 'Turno de {name}…',
    aiThinking: 'La IA está pensando…',
    waitingOpponent: 'Esperando al rival…',
    reconnecting: 'Reconectando…',
    connecting: 'Conectando…',
    connected: 'Conectado',
    connectFailed: 'No se pudo conectar al servidor',
    youWin: '¡Ganaste!',
    youLose: 'Perdiste',
    draw: 'Empate',
    winsName: '¡Gana {name}!',
    reason_capture: '{captureWin}: {fallen} fue capturado.',
    reason_gate: '{gateWin}: {arrived} llegó a {gate}.',
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
      <p>Cada equipo tiene <b>1 {leader}</b> ({leaderHint}) y <b>4 {pawns}</b> más. Ganas de dos formas:</p>
      <ul>
        <li><b>{captureWin}</b>: captura el {leader} rival.</li>
        <li><b>{gateWin}</b>: lleva tu {leader} a la casilla donde empezó el {leader} rival (está marcada en el tablero).</li>
      </ul>
      <h3>Tu turno</h3>
      <ol>
        <li>Elige una de tus <b>2 cartas</b>. El punto blanco es tu pieza y las marcas de color son a dónde puede saltar (arriba = hacia el rival).</li>
        <li>Mueve <b>una</b> de tus piezas según esa carta. Salta por encima de lo que haya en medio.</li>
        <li>Si caes en una pieza rival, la <b>capturas</b>. No puedes caer en una tuya ni salir del tablero.</li>
        <li>La carta que usaste pasa a <b>Siguiente</b> y tú te quedas con la que estaba allí. Después de su jugada, tu rival se quedará con la carta que acabas de usar.</li>
      </ol>
      <h3>Detalles</h3>
      <ul>
        <li>En cada partida se usan 5 de las 16 cartas: 2 por jugador y 1 en Siguiente. Todas están a la vista.</li>
        <li>Si no tienes ningún movimiento posible, igual tienes que ceder una de tus cartas.</li>
        <li>Empate si la misma posición se repite 3 veces o tras 200 jugadas.</li>
        <li>Quién empieza se decide al azar.</li>
        <li>El tema (en el menú) solo cambia el aspecto; las reglas son las mismas. En online cada jugador ve su propio tema.</li>
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
    flux: 'Next',
    offline: 'offline',
    you: 'You',
    ai: 'AI',
    amber: '{team0}',
    cobalt: '{team1}',
    theme: 'Theme',
    changeTheme: 'Change theme',
    yourTurn: 'Your turn: pick a card, a piece and a square',
    yourTurnLocal: "{name}'s turn",
    pickTarget: '{name}: choose where to move',
    pickCard: 'Which card? Tap one of your cards',
    mustPass: 'No moves: tap the card you want to give up',
    theirTurn: "{name}'s turn…",
    aiThinking: 'The AI is thinking…',
    waitingOpponent: 'Waiting for opponent…',
    reconnecting: 'Reconnecting…',
    connecting: 'Connecting…',
    connected: 'Connected',
    connectFailed: 'Could not reach the server',
    youWin: 'You win!',
    youLose: 'You lose',
    draw: 'Draw',
    winsName: '{name} wins!',
    reason_capture: '{captureWin}: {fallen} has fallen.',
    reason_gate: '{gateWin}: {arrived} reached {gate}.',
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
      <p>Each team has <b>1 {leader}</b> ({leaderHint}) and <b>4</b> more <b>{pawns}</b>. Win in one of two ways:</p>
      <ul>
        <li><b>{captureWin}</b>: capture the enemy {leader}.</li>
        <li><b>{gateWin}</b>: move your {leader} onto the square where the enemy {leader} started (it's marked on the board).</li>
      </ul>
      <h3>Your turn</h3>
      <ol>
        <li>Pick one of your <b>2 cards</b>. The white dot is your piece and the coloured marks are where it can jump (up = towards the opponent).</li>
        <li>Move <b>one</b> of your pieces using that card. Pieces jump over anything in between.</li>
        <li>Landing on an enemy piece <b>captures</b> it. You can't land on your own piece or leave the board.</li>
        <li>The card you used goes to <b>Next</b> and you take the card that was there. After their move, your opponent gets the card you just used.</li>
      </ol>
      <h3>Details</h3>
      <ul>
        <li>Each game uses 5 of the 16 cards: 2 per player and 1 in Next. Everything is visible.</li>
        <li>If you have no legal move, you still have to give up one of your cards.</li>
        <li>Draw if the same position happens 3 times or after 200 moves.</li>
        <li>The first player is chosen at random.</li>
        <li>The theme (in the menu) only changes the look; the rules are the same. Online, each player sees their own theme.</li>
      </ul>
      <h3>The 16 cards</h3>`,
  },
};

let lang = 'es';
let themeVars = () => ({});

/** Words that depend on the visual theme ({leader}, {gateWin}, ...). */
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
