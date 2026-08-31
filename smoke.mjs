import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1280, height:900 } });
const errs = [];
p.on('console', m => { if (m.type()==='error' && !/ERR_TUNNEL_CONNECTION_FAILED|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
p.on('pageerror', e => errs.push('pageerror: '+e.message));
await p.goto('file://'+process.cwd()+'/dist/index.html');
const say = (n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);

say('tabs rendered', (await p.locator('.tabs a').count()) === 4);
say('about is the front page', (await p.locator('h1').first().textContent()).includes('Kostiantyn'));
await p.click('.tabs a[href="#/zoho"]');
await p.waitForTimeout(200);
const zohoLinks = await p.locator('a[href^="#/p/"]').count();
say('a tab lists its pages ('+zohoLinks+')', zohoLinks >= 8);

await p.goto('file://'+process.cwd()+'/dist/index.html#/p/org-tooling');
await p.waitForTimeout(300);
say('write-up page routes', (await p.locator('h1').textContent()).includes('Building tooling'));

// the routes the site used to publish still resolve
await p.goto('file://'+process.cwd()+'/dist/index.html#/case/org-tooling');
await p.waitForTimeout(300);
say('an old write-up link still lands', (await p.evaluate(() => location.hash)) === '#/p/org-tooling');
await p.goto('file://'+process.cwd()+'/dist/index.html#/rec/teams');
await p.waitForTimeout(300);
say('an old demo link still lands', (await p.evaluate(() => location.hash)) === '#/p/chat-recap');
await p.goto('file://'+process.cwd()+'/dist/index.html#/how');
await p.waitForTimeout(300);
say('the site page carries its legend', (await p.locator('.kv dt').count()) >= 3);

// screenshots for the record
await p.goto('file://'+process.cwd()+'/dist/index.html#/p/event');
await p.waitForSelector('.ecp', {timeout:8000}); await p.waitForTimeout(300);
await p.screenshot({ path:'shot-platform.png', fullPage:false });
await p.goto('file://'+process.cwd()+'/dist/index.html#/');
await p.waitForTimeout(300);
await p.screenshot({ path:'shot-home.png', fullPage:false });
await p.goto('file://'+process.cwd()+'/dist/index.html#/p/orghealth');
await p.waitForTimeout(300);
await p.screenshot({ path:'shot-writeup.png', fullPage:false });

// A1 fixes: hero CTA, cert links, social card, live demo counter, About page structure
await p.goto('file://'+process.cwd()+'/dist/index.html#/about');
await p.waitForTimeout(300);

const cvHref = await p.locator('a.pri').first().getAttribute('href');
say('CV button links to a PDF', /\.pdf$/i.test(cvHref||''));

const certHrefs = await p.locator('a.cert').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
say('no cert link points at a static credential page', certHrefs.length>0 && certHrefs.every(h=>!/\/credentials\//.test(h||'')));

const headHtml = await p.evaluate(()=>document.head.innerHTML);
say('document carries an og:image tag', /property="og:image"/.test(headHtml));

const demoCounterVal = await p.locator('.live .lc b[data-count]').nth(1).getAttribute('data-count');
const realDemoCount = await p.evaluate(()=>Object.values(ALL).filter(i=>i.kind==='live'||i.kind==='emul').length);
say('live-demo counter matches ALL ('+demoCounterVal+' == '+realDemoCount+')', Number(demoCounterVal)===realDemoCount);

const idxLabels = await p.locator('.bsec .idx').allTextContents();
const wantOrder = Array.from({length:9},(_,i)=>String(i+1).padStart(2,'0'));
say('About page has 9 sections numbered 01..09', idxLabels.length===9 && idxLabels.every((t,i)=>t.startsWith(wantOrder[i]+' /')));

const runcardCount = await p.locator('.bsec').nth(4).locator('.runcard').count();
say('section 05 has 7 cards', runcardCount===7);

for (const id of ['harness','generator','ci-guards']) {
  await p.goto('file://'+process.cwd()+'/dist/index.html#/p/'+id);
  await p.waitForTimeout(250);
  const bodyText = await p.locator('body').innerText();
  say('#/p/'+id+' has its write-up', !bodyText.includes('write-up pending'));
}

say('no console errors ('+errs.length+')', errs.length===0);
if (errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
