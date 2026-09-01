/* Two outputs from one source:
     dist/index.html    a complete document — this is what GitHub Pages serves.
                        Without a doctype the browser falls into quirks mode, where a
                        <table> stops inheriting colour from its parent. That is not a
                        theory: it turned every emulated CRM table dark-on-light.
     dist/artifact.html the same content as a fragment, for hosts that supply their own
                        <head> and would otherwise end up with two of everything.
*/
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';

const tpl  = readFileSync('src/app.html','utf8');
const mock = readFileSync('platform/mockZoho.js','utf8');
const data = readFileSync('data/dataset.slim.json','utf8');
const evt  = readFileSync('src/event-page.js','utf8');
const pgs  = readFileSync('src/pages.js','utf8');
const tms  = readFileSync('src/teams.js','utf8');
const brd  = readFileSync('src/board.js','utf8');
const w2   = readFileSync('src/widgets2.js','utf8');
const oh   = readFileSync('src/orghealth.js','utf8');
const w3   = readFileSync('src/widgets3.js','utf8');
const ap   = readFileSync('src/apollo.js','utf8');
const dg   = readFileSync('src/diagrams.js','utf8');
const aij  = readFileSync('src/aijournal.js','utf8');
const mksf = readFileSync('platform/mockSF.js','utf8');
const sflw = readFileSync('src/sflwc.js','utf8');

const body = tpl
  .replace('/*__MOCKZOHO__*/',   () => mock)
  .replace('/*__DATASET__*/null',() => data)
  .replace('/*__EVENTPAGE__*/',  () => evt)
  .replace('/*__PAGES__*/',      () => pgs)
  .replace('/*__TEAMS__*/',      () => tms)
  .replace('/*__BOARD__*/',      () => brd)
  .replace('/*__WIDGETS2__*/',   () => w2)
  .replace('/*__ORGHEALTH__*/',  () => oh)
  .replace('/*__WIDGETS3__*/',   () => w3)
  .replace('/*__APOLLO__*/',     () => ap)
  .replace('/*__DIAGRAMS__*/',   () => dg)
  .replace('/*__AIJOURNAL__*/',  () => aij)
  .replace('/*__SFLWC__*/',      () => mksf + '\n' + sflw);

const title = (/<title>([^<]*)<\/title>/.exec(body) || [,'CRM platform field notes'])[1];
const desc = 'CRM platform engineering: widgets, integrations and org tooling, running outside the CRM against generated data.';
const site = 'https://koslan.github.io/crm-platform-portfolio/';
const icon = 'data:image/svg+xml,'+encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'
  + '<rect width="64" height="64" rx="14" fill="#5B5BD6"/>'
  + '<text x="32" y="43" font-family="Instrument Sans,DejaVu Sans,sans-serif" font-size="30" font-weight="600" fill="#fff" text-anchor="middle">KB</text>'
  + '</svg>');

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta name="color-scheme" content="light">
<link rel="icon" href="${icon}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${title}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${site}">
<meta property="og:image" content="${site}og.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
</head>
<body>
${body.replace(/<title>[^<]*<\/title>\s*/, '')}
</body>
</html>
`;

/* The page is one HTML file whose behaviour lives in inline <script> blocks, so
   a stray quote inside a copy string is not a build error — it is a blank page
   at runtime, and the test suite only reaches it after Playwright has started.
   Parsing every inline script here turns that into a failed build with a line
   number. `new Function` compiles without executing, which is exactly the check
   wanted: syntax only, no side effects. */
function checkInlineScripts(html, label){
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
  let m, i = 0, bad = 0;
  while ((m = re.exec(html))) {
    i++;
    const code = m[1];
    if (!code.trim()) continue;
    try { new Function(code); }
    catch (e) {
      bad++;
      const upto = html.slice(0, m.index).split('\n').length;
      console.error(`${label}: inline script #${i} (opens near line ${upto}) does not parse — ${e.message}`);
    }
  }
  if (bad) {
    console.error(`${label}: ${bad} inline script(s) failed to parse. Refusing to write a page that cannot run.`);
    process.exit(1);
  }
  return i;
}
const scriptCount = checkInlineScripts(body, 'dist/artifact.html');

mkdirSync('dist',{recursive:true});
cpSync('public','dist',{recursive:true});
writeFileSync('dist/index.html', doc);
writeFileSync('dist/artifact.html', body);
console.log('dist/index.html   ', (doc.length/1024).toFixed(0)+' KB  (full document, for Pages)');
console.log('dist/artifact.html', (body.length/1024).toFixed(0)+' KB  (fragment)');
console.log('inline scripts     ', scriptCount, 'parsed');
