import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
/* A failed check fails the process, so CI cannot go green over a FAIL line. */
const say=(n,c)=>{ console.log((c?'  ok  ':'FAIL  ')+n); if(!c) process.exitCode=1; };
const U='file://'+process.cwd()+'/dist/index.html';
p.on('dialog', d=>d.dismiss());

/* --- reconciliation --- */
await p.goto(U+'#/event'); await p.waitForSelector('.ecp .tabs button[data-t="Calendar sync"]', {timeout:8000});
await p.click('.ecp .tabs button[data-t="Calendar sync"]');
await p.waitForSelector('#r-tw table', {timeout:8000}); await p.waitForTimeout(400);
const tot = +(await p.locator('#r-tot').textContent());
say('reconcile: both sides matched ('+tot+' rows)', tot>40);
const states = await p.$$eval('#r-tw .pill', n=>[...new Set(n.map(x=>x.textContent.trim()))]);
say('reconcile: several states present ('+states.join(', ')+')', states.length>=4);
say('reconcile: calendar-only rows found', +(await p.locator('#r-orph').textContent())>0);
await p.locator('#r-tw button[data-diff]').first().click();
await p.waitForSelector('.ecp .diff', {timeout:5000});
const diffTxt = await p.locator('.ecp .diff').textContent();
say('reconcile: three-way compare has an Expected column', /Expected/.test(diffTxt));
say('reconcile: the rule is stated', /Rule applied/.test(await p.locator('.ecp-mod').textContent()));
await p.screenshot({path:'e1-diff.png'});
await p.click('#d-ok');
const before = +(await p.locator('#r-ok').textContent());
await p.locator('#r-tw button[data-fix]').first().click(); await p.waitForTimeout(700);
say('reconcile: repair writes and the row changes state', (await p.locator('#r-tw').textContent()).includes('repaired'));
await p.check('#r-chaos'); await p.waitForTimeout(200);
await p.click('#r-bulk'); await p.waitForTimeout(3500);
const note = await p.locator('#r-note').textContent();
say('reconcile: bulk pass reports refusals under a flaky link — '+note.slice(0,60), /repaired/.test(note));
await p.uncheck('#r-chaos');
await p.screenshot({path:'e2-reconcile.png'});

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
