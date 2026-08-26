/* Two outputs from one source:
     dist/index.html    a complete document — this is what GitHub Pages serves.
                        Without a doctype the browser falls into quirks mode, where a
                        <table> stops inheriting colour from its parent. That is not a
                        theory: it turned every emulated CRM table dark-on-light.
     dist/artifact.html the same content as a fragment, for hosts that supply their own
                        <head> and would otherwise end up with two of everything.
*/
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const tpl  = readFileSync('src/app.html','utf8');
const mock = readFileSync('platform/mockZoho.js','utf8');
const data = readFileSync('data/dataset.slim.json','utf8');
const evt  = readFileSync('src/event-page.js','utf8');
const pgs  = readFileSync('src/pages.js','utf8');
const tms  = readFileSync('src/teams.js','utf8');
const brd  = readFileSync('src/board.js','utf8');
const w2   = readFileSync('src/widgets2.js','utf8');
const oh   = readFileSync('src/orghealth.js','utf8');

const body = tpl
  .replace('/*__MOCKZOHO__*/',   () => mock)
  .replace('/*__DATASET__*/null',() => data)
  .replace('/*__EVENTPAGE__*/',  () => evt)
  .replace('/*__PAGES__*/',      () => pgs)
  .replace('/*__TEAMS__*/',      () => tms)
  .replace('/*__BOARD__*/',      () => brd)
  .replace('/*__WIDGETS2__*/',   () => w2)
  .replace('/*__ORGHEALTH__*/',  () => oh);

const title = (/<title>([^<]*)<\/title>/.exec(body) || [,'CRM platform field notes'])[1];
const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="CRM widgets running outside the CRM, against generated data. Interfaces, integrations and org tooling.">
<meta name="color-scheme" content="light dark">
</head>
<body>
${body}
</body>
</html>
`;

mkdirSync('dist',{recursive:true});
writeFileSync('dist/index.html', doc);
writeFileSync('dist/artifact.html', body);
console.log('dist/index.html   ', (doc.length/1024).toFixed(0)+' KB  (full document, for Pages)');
console.log('dist/artifact.html', (body.length/1024).toFixed(0)+' KB  (fragment)');
