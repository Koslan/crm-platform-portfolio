import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
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

/* --- account: at a glance + plan --- */
await p.goto(U+'#/rec/enrich'); await p.waitForSelector('.ecp .kpi', {timeout:8000}); await p.waitForTimeout(400);
say('glance: KPI tiles rendered', (await p.locator('.ecp .kpi div').count())>=6);
say('glance: sparkline drawn', (await p.locator('.ecp .spark i').count())>0);
say('glance: activity timeline', (await p.locator('.ecp .tl .ev').count())>0);
await p.screenshot({path:'e3-glance.png'});
await p.click('.ecp .tabs button[data-t="Development plan"]');
await p.waitForSelector('#p-matrix table', {timeout:8000}); await p.waitForTimeout(400);
say('plan: relationship ladder marks now and target',
    (await p.locator('.ecp .ladder span.on').count())===1 && (await p.locator('.ecp .ladder span.want').count())<=1);
say('plan: strategic players with coloured roles', (await p.locator('.ecp .role-pill').count())>0);
say('plan: progress bars on actions', (await p.locator('.ecp .bar3 i').count())>0);
const boxes = p.locator('#p-matrix input[type=checkbox]');
const n0 = await boxes.count();
say('plan: cross-sell matrix has ticks ('+n0+')', n0>10);
const first = boxes.first();
const was = await first.isChecked();
await first.click(); await p.waitForTimeout(500);
say('plan: a tick writes straight to the record', (await first.isChecked())!==was);
await p.screenshot({path:'e4-plan.png'});

/* --- contact history --- */
await p.goto(U+'#/rec/contact'); await p.waitForSelector('#h-tw table', {timeout:8000}); await p.waitForTimeout(400);
const rows = await p.locator('#h-tw tbody tr').count();
say('history: several employers ('+rows+')', rows>1);
say('history: exactly one row is main', (await p.locator('#h-tw input[data-main]:checked').count())===1);
const target = p.locator('#h-tw input[data-main]:not(:checked)').first();
await target.click(); await p.waitForTimeout(900);
say('history: moving main keeps exactly one', (await p.locator('#h-tw input[data-main]:checked').count())===1);
say('history: duration column computed', /yr|mo/.test(await p.locator('#h-tw tbody').textContent()));
await p.screenshot({path:'e5-history.png'});

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
