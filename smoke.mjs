import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1280, height:900 } });
const errs = [];
p.on('console', m => { if (m.type()==='error' && !/ERR_TUNNEL_CONNECTION_FAILED|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
p.on('pageerror', e => errs.push('pageerror: '+e.message));
const U = 'file://'+process.cwd()+'/dist/index.html';
let failed = 0;
const say = (n,c)=>{ console.log((c?'  ok  ':'FAIL  ')+n); if(!c) failed++; };

await p.goto(U);
say('three public tabs rendered', (await p.locator('.tabs a').count()) === 3);
say('about is the front page', (await p.locator('h1').first().textContent()).includes('Kostiantyn'));
await p.click('.tabs a[href="#/zoho"]');
await p.waitForTimeout(300);
const zohoLinks = await p.locator('a[href^="#/p/"]').count();
say('the Zoho page lists its examples and notes ('+zohoLinks+')', zohoLinks >= 12);
say('the Zoho page lists seven case studies', (await p.locator('a[href^="#/zoho/"]').count()) >= 7);

await p.goto(U+'#/p/org-tooling');
await p.waitForTimeout(300);
say('a technical note routes', (await p.locator('h1').textContent()).includes('The engineering layer'));

// the routes the site used to publish still resolve
await p.goto(U+'#/case/org-tooling');
await p.waitForTimeout(300);
say('an old write-up link still lands', (await p.evaluate(() => location.hash)) === '#/p/org-tooling');
await p.goto(U+'#/rec/teams');
await p.waitForTimeout(300);
say('an old demo link still lands', (await p.evaluate(() => location.hash)) === '#/p/chat-recap');
await p.goto(U+'#/p/delta-sync');
await p.waitForTimeout(300);
say('a merged note address leads to its case', (await p.evaluate(() => location.hash)) === '#/zoho/orchestration');
await p.goto(U+'#/how');
await p.waitForTimeout(300);
say('the old site page leads to the note about the examples', (await p.evaluate(() => location.hash)) === '#/about-demos'
  && (await p.locator('.kv dt').count()) >= 3);

// screenshots for the record
await p.goto(U+'#/p/event');
await p.waitForSelector('.ecp', {timeout:8000}); await p.waitForTimeout(300);
await p.screenshot({ path:'shot-platform.png', fullPage:false });
await p.goto(U+'#/');
await p.waitForTimeout(300);
await p.screenshot({ path:'shot-home.png', fullPage:false });
await p.goto(U+'#/zoho');
await p.waitForTimeout(400);
await p.screenshot({ path:'shot-zoho.png', fullPage:false });
await p.goto(U+'#/p/orghealth');
await p.waitForTimeout(300);
await p.screenshot({ path:'shot-writeup.png', fullPage:false });

// hero CTA, cert links, social card, About page structure
await p.goto(U+'#/');
await p.waitForTimeout(300);

const cvHref = await p.locator('.ctas a[download]').first().getAttribute('href');
say('CV button links to a PDF', /\.pdf$/i.test(cvHref||''));
say('primary CTA leads to the Zoho work', (await p.locator('.ctas a.pri').first().getAttribute('href')) === '#/zoho');

const certHrefs = await p.locator('a.cert').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
say('no cert link points at a static credential page', certHrefs.length>0 && certHrefs.every(h=>!/\/credentials\//.test(h||'')));

const headHtml = await p.evaluate(()=>document.head.innerHTML);
say('document carries an og:image tag', /property="og:image"/.test(headHtml));

const idxLabels = await p.locator('.bsec .idx').allTextContents();
const wantOrder = Array.from({length:6},(_,i)=>String(i+1).padStart(2,'0'));
say('About page has 6 sections numbered 01..06', idxLabels.length===6 && idxLabels.every((t,i)=>t.startsWith(wantOrder[i]+' /')));

const runcardCount = await p.locator('.runcard').count();
say('platform-ownership section has 6 cards', runcardCount===6);

say('no console errors ('+errs.length+')', errs.length===0);
if (errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
if (failed) { console.log('\n' + failed + ' failing check(s) above'); process.exitCode = 1; }
