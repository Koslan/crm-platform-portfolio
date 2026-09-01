/* Every page, at the three widths that matter, checked for the two failures a
   reader notices immediately: a document that scrolls sideways, and a console
   error. Both were live when this file was written — the org-health panels
   pushed the page to 521px inside a 390px viewport, and the agent journal to
   919px — and neither showed up in any other suite, because the rest of them
   run at one width and never look at documentElement.scrollWidth. */
import { chromium, launchOpts } from './test/browser.mjs';

const U = 'file://' + process.cwd() + '/dist/index.html';
const say = (n, c) => console.log((c ? '  ok  ' : 'FAIL  ') + n);
const b = await chromium.launch({ ...launchOpts });
let failed = 0;

for (const width of [1500, 1000, 390]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => {
    if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.googleapis|ERR_FILE_NOT_FOUND/.test(m.text()))
      errs.push(m.text());
  });

  await p.goto(U);
  await p.waitForTimeout(700);
  const ids = await p.evaluate(() => Object.keys(ALL));
  const routes = ['', '#/zoho', '#/ai', '#/fullstack', ...ids.map(i => '#/p/' + i)];

  const over = [];
  for (const r of routes) {
    await p.goto(U + r);
    await p.waitForTimeout(r.startsWith('#/p/') ? 550 : 350);
    const o = await p.evaluate(() => {
      const de = document.documentElement;
      if (de.scrollWidth <= de.clientWidth + 1) return null;
      const wide = [...document.querySelectorAll('#view *')]
        .filter(e => e.getBoundingClientRect().right > de.clientWidth + 1)
        .slice(0, 3).map(e => e.tagName + '.' + (e.className || '').toString().slice(0, 40));
      return de.scrollWidth + 'px in ' + de.clientWidth + 'px [' + wide.join(', ') + ']';
    });
    if (o) over.push(r + ' → ' + o);
  }

  say(`${width}px: all ${routes.length} routes fit without sideways scroll`, over.length === 0);
  if (over.length) { failed++; over.slice(0, 6).forEach(x => console.log('       ' + x)); }
  say(`${width}px: no console errors across every route (${errs.length})`, errs.length === 0);
  if (errs.length) { failed++; errs.slice(0, 5).forEach(x => console.log('       ' + x)); }
  await p.close();
}

await b.close();
if (failed) process.exit(1);
