/* Screenshot helper for visual QA.
   usage: node tools/shots.mjs <outdir> <width>x<height> route [route ...]
   routes are hash fragments without the leading '#/', e.g. '' 'zoho' 'zoho/widgets' 'p/event'
   A route may carry ':full' to capture the full page instead of the viewport. */
import { chromium, launchOpts } from '../test/browser.mjs';
import { mkdirSync } from 'node:fs';

const [outdir, size, ...routes] = process.argv.slice(2);
const [w, h] = size.split('x').map(Number);
mkdirSync(outdir, { recursive: true });
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
const errs = [];
p.on('console', m => { if (m.type() === 'error' && !/fonts\.googleapis|ERR_TUNNEL/.test(m.text())) errs.push(m.text()); });
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
for (const r of routes) {
  const full = r.endsWith(':full');
  const route = full ? r.slice(0, -5) : r;
  await p.goto('file://' + process.cwd() + '/dist/index.html#/' + route);
  await p.waitForTimeout(900);
  const name = (route || 'home').replace(/[\/]/g, '_') + '-' + w;
  await p.screenshot({ path: outdir + '/' + name + '.png', fullPage: full });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  const ph = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log((sw > w ? 'OVERFLOW ' : '      ok ') + name + '  scrollWidth=' + sw + ' height=' + ph);
}
if (errs.length) { console.log('console errors:'); console.log(errs.join('\n')); }
await b.close();
