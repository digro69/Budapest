/* =====================================================================
   build-single-file.js — Assemble toute l'application en un seul fichier
   HTML autonome (CSS et JS intégrés), pratique pour l'envoyer par mail,
   le déposer sur un hébergeur ou le publier tel quel.

   Usage :  node tools/build-single-file.js
   Sortie :  dist/budapest.html          (page complète, ouvrable direct)
             dist/budapest-artifact.html (fragment, sans <html>/<head>/<body>)
   ===================================================================== */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const css = read('css/app.css');
const js = ['js/data.js', 'js/store.js', 'js/app.js'].map(read).join('\n\n');

/* Le service worker n'existe pas dans la version « fichier unique » :
   on neutralise son enregistrement pour éviter une erreur 404. */
const jsStandalone = js.replace(
  /if \('serviceWorker' in navigator[\s\S]*?\n}\n?$/,
  '/* Version fichier unique : pas de service worker. */\n'
);

const TITLE = 'Budapest — Programme de séjour';
const DESCRIPTION =
  'Le plan de visite de Budapest dans votre poche : programme jour par jour, ' +
  'fiches détaillées, notes personnelles.';

const BODY = `
  <div id="app"></div>
  <dialog class="sheet" id="sheet"></dialog>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

const fullPage = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${TITLE}</title>
<meta name="description" content="${DESCRIPTION}">
<meta name="theme-color" content="#23405c">
<style>
${css}</style>
</head>
<body>
${BODY}
<script>
${jsStandalone}
</script>
</body>
</html>
`;

const fragment = `<title>${TITLE}</title>
<style>
${css}</style>
${BODY}
<script>
${jsStandalone}
</script>
`;

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist', 'budapest.html'), fullPage);
fs.writeFileSync(path.join(ROOT, 'dist', 'budapest-artifact.html'), fragment);

const ko = (s) => (Buffer.byteLength(s, 'utf8') / 1024).toFixed(1) + ' Ko';
console.log('dist/budapest.html           ' + ko(fullPage));
console.log('dist/budapest-artifact.html  ' + ko(fragment));
