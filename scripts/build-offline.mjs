// Builds a single self-contained HTML file of Atomami with the offline modes
// (vs AI and same-phone 2 players). Useful as a quick preview without a server.
//   node scripts/build-offline.mjs [output.html]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(process.argv[2] || path.join(root, 'dist', 'atomami-offline.html'));
const read = (f) => fs.readFileSync(path.join(root, 'public', f), 'utf8');

// Turn an ES module into plain statements that can share one scope.
function strip(src) {
  return src
    .split('\n')
    .filter((l) => !/^import\s/.test(l) && !/^export\s*\{/.test(l))
    .map((l) => l.replace(/^export\s+(?=(async\s+)?(function|const|let|class)\b)/, ''))
    .join('\n');
}

const game = strip(read('js/game.js'));
const ai = strip(read('js/ai.js'));
const workerSrc = [game, ai, strip(read('js/ai-worker.js'))].join('\n');
const appCode = [game, ai, strip(read('js/i18n.js')), strip(read('js/sound.js')), strip(read('js/app.js'))].join('\n');

const html = read('index.html');
const body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<script type="module"'));
const css = read('style.css');
const safe = (s) => s.replace(/<\/(script)/gi, '<\\/$1');

const page = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no">
<meta name="theme-color" content="#0b0d1a">
<title>Atomami</title>
<style>
${css}
</style>
${body}
<script>window.ATOMAMI_OFFLINE = true;</script>
<script type="module">
try {
  window.ATOMAMI_WORKER_URL = URL.createObjectURL(new Blob([${safe(JSON.stringify(workerSrc))}], { type: 'text/javascript' }));
} catch (e) { /* the AI will run on the main thread */ }
${safe(appCode)}
</script>
`;
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, page);
console.log(`wrote ${out} (${(page.length / 1024).toFixed(0)} KB)`);
