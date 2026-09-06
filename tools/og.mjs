/* Generates public/og.png: a 1200x630 screenshot of a live page on the site,
   with a name/positioning/address plate overlaid.
   Run manually with `node tools/og.mjs` — this is NOT part of `npm run build`,
   so the build itself never needs a browser. */
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';

const require = createRequire(import.meta.url);
let pw;
try { pw = require('playwright'); }
catch { pw = require(process.env.PLAYWRIGHT_PATH || '/home/claude/.npm-global/lib/node_modules/playwright'); }
const pinned = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium';
const chromium = pw.chromium;
const launchOpts = existsSync(pinned) ? { executablePath: pinned } : {};

const W = 1200, H = 630;

const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport: { width: W, height: H } });
await p.goto('file://' + process.cwd() + '/dist/index.html#/p/solution');
await p.waitForSelector('#rec-host .bar, #rec-host table, #rec-host .grid', { timeout: 8000 });
await p.waitForTimeout(700);
// the matrix itself, not the page's introduction
await p.evaluate(() => { const el = document.querySelector('#rec-host'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 12); });
await p.waitForTimeout(300);

await p.addStyleTag({ content: `
  #__og_plate {
    position: fixed; inset: 0; z-index: 99999;
    background: linear-gradient(180deg, rgba(15,17,21,.05) 0%, rgba(15,17,21,.88) 62%, rgba(15,17,21,.96) 100%);
    display: flex; flex-direction: column; justify-content: flex-end;
    padding: 48px 56px; font-family: "Instrument Sans", system-ui, sans-serif;
    box-sizing: border-box;
  }
  #__og_plate .name { color: #fff; font-size: 46px; font-weight: 600; letter-spacing: -.02em; margin: 0 0 6px; }
  #__og_plate .role { color: #C9CDE0; font-size: 22px; font-weight: 500; margin: 0 0 18px; }
  #__og_plate .site { color: #8F93A8; font-family: "DM Mono", monospace; font-size: 15px; letter-spacing: .02em; }
  #__og_plate .accent { color: #8C8CFF; }
` });

await p.evaluate(() => {
  const el = document.createElement('div');
  el.id = '__og_plate';
  el.innerHTML =
    '<div class="name">Kostiantyn <span class="accent">Buriak</span></div>' +
    '<div class="role">Zoho CRM &middot; platform &amp; integration engineer</div>' +
    '<div class="site">koslan.github.io/crm-platform-portfolio</div>';
  document.body.appendChild(el);
});

await p.waitForTimeout(150);
await p.screenshot({ path: 'public/og.png', clip: { x: 0, y: 0, width: W, height: H } });
await b.close();
console.log('public/og.png written (' + W + 'x' + H + ')');
