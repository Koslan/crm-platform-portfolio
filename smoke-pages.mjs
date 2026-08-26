import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1000 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
const U='file://'+process.cwd()+'/dist/index.html';

/* --- solution map --- */
await p.goto(U+'#/rec/solution');
await p.waitForSelector('.ecp .mtx .cell', {timeout:8000});
await p.waitForTimeout(900);
const cells = await p.locator('.ecp .cell').count();
say('solution map: cells rendered ('+cells+')', cells>20);
say('solution map: headers show revenue', /\$/.test(await p.locator('.mhd .rev').first().textContent()));
say('solution map: reveal animation applied', (await p.locator('.ecp .cell.in').count())===cells);
const colored = await p.locator('.ecp .cell.won, .ecp .cell.lost, .ecp .cell.prop, .ecp .cell.pros, .ecp .cell.conf, .ecp .cell.pot').count();
say('solution map: several states present ('+colored+')', colored>4);
await p.locator('.ecp .cell.won, .ecp .cell.prop, .ecp .cell.pros, .ecp .cell.conf, .ecp .cell.lost, .ecp .cell.pot').first().hover();
await p.waitForTimeout(350);
say('solution map: hover card appears', (await p.locator('.ecp-pop').count())>0);
await p.screenshot({path:'p1-solution.png'});
await p.click('.mhd button[data-bu]');
await p.waitForSelector('#o-save');
await p.fill('#o-amt','125000');
await p.click('#o-save');
await p.waitForTimeout(900);
say('solution map: created deal redraws matrix', (await p.locator('.ecp .cell').count())>=cells);

/* --- enrichment --- */
await p.goto(U+'#/rec/enrich');
await p.waitForSelector('.ecp .tabs button[data-t="Contact enrichment"]', {timeout:8000});
await p.click('.ecp .tabs button[data-t="Contact enrichment"]');
await p.waitForSelector('#e-load', {timeout:8000});
await p.click('#e-load'); await p.waitForSelector('#e-tw table tbody tr', {timeout:8000});
const r1 = await p.locator('#e-tw tbody tr').count();
say('enrichment: first page loaded ('+r1+')', r1===12);
await p.click('#e-load'); await p.waitForTimeout(700);
say('enrichment: second page appends', (await p.locator('#e-tw tbody tr').count())===24);
const statTxt = await p.locator('#e-stat').textContent();
say('enrichment: match paths counted', /Via hierarchy/.test(statTxt) && /By profile URL/.test(statTxt));
const boxes = p.locator('#e-tw input[data-s]');
const nb = await boxes.count();
say('enrichment: only unmatched rows selectable ('+nb+' of 24)', nb>0 && nb<24);
await boxes.nth(0).check(); await boxes.nth(1).check();
await p.waitForTimeout(150);
await p.click('#e-imp'); await p.waitForTimeout(900);
say('enrichment: import created contacts', /2 contacts created/.test(await p.locator('#e-note').textContent()));
say('enrichment: rows marked created', (await p.locator('#e-tw tr.made').count())===2);
await p.locator('#e-tw a[data-p]').first().click();
await p.waitForSelector('.ecp-mod .room', {timeout:4000});
say('enrichment: profile shows career timeline', (await p.locator('.ecp-mod .room').count())>0);
await p.screenshot({path:'p2-enrich.png'});
await p.click('#p-ok');

/* --- deal conversations --- */
await p.goto(U+'#/rec/deal');
await p.waitForSelector('.ecp .thread', {timeout:8000});
const th = await p.locator('.ecp .thread').count();
say('conversations: threads built ('+th+')', th>0);
await p.locator('.thead').first().click(); await p.waitForTimeout(200);
say('conversations: thread expands with replies', (await p.locator('.msg.reply').count())>0);
const push = await p.locator('button[data-push]:not([disabled])').first().elementHandle();
await push.click(); await p.waitForTimeout(700);
say('conversations: push locks the button',
    /in tracker/.test(await push.evaluate(n=>n.textContent)) && await push.evaluate(n=>n.disabled));
await p.screenshot({path:'p3-deal.png'});
await p.click('.ecp .tabs button[data-t="Tracker comments"]');
await p.waitForSelector('#k-txt', {timeout:4000});
say('conversations: pushed message shows in tracker tab', (await p.locator('.ecp .panel .msg').count())>0);
await p.fill('#k-txt','Checking with @');
await p.waitForTimeout(200);
say('conversations: @ opens a mention list', (await p.locator('#k-men button').count())>0);
await p.locator('#k-men button').first().click();
say('conversations: mention inserted as tracker markup', /\[~/.test(await p.inputValue('#k-txt')));
await p.click('#k-post'); await p.waitForTimeout(200);
say('conversations: post reports the idempotency marker', /crm-msg:/.test(await p.locator('#k-msg').textContent()));

/* --- teams recap --- */
await p.goto(U+'#/rec/teams');
await p.waitForSelector('.tms .chat', {timeout:8000});
say('teams: chat list built', (await p.locator('.tms .chat').count())===3);
await p.click('#tm-go'); await p.waitForSelector('#tm-n1', {timeout:5000});
say('teams: card 1 names the matching key', /matched by/i.test(await p.locator('#tm-cards .card').textContent()));
await p.click('#tm-n1'); await p.waitForSelector('#tm-recap', {timeout:6000});
await p.fill('#tm-recap','too short'); await p.waitForTimeout(150);
say('teams: short recap refused with a reason', await p.locator('#tm-save').isDisabled()
    && /too short/i.test(await p.locator('#tm-b2').textContent()));
await p.fill('#tm-recap','The client wants the certification plan before committing to the tooling budget, and we agreed to return with a scope by Friday.');
await p.waitForTimeout(150);
await p.locator('#tm-buy button').first().click();
await p.click('#tm-save'); await p.waitForSelector('.tms .done', {timeout:6000});
say('teams: recap written to the record', /saved/i.test(await p.locator('#tm-crm').textContent()));
say('teams: trace logged the fire-and-forget step', /fire-and-forget/.test(await p.locator('#tm-trace').textContent()));
await p.screenshot({path:'p4-teams.png'});
await p.locator('.tms .chat[data-i="2"]').click();
await p.waitForTimeout(300);
await p.click('#tm-go'); await p.waitForSelector('#tm-n1', {timeout:5000});
say('teams: ambiguous chat refuses to choose', await p.locator('#tm-n1').isDisabled()
    && (await p.locator('.tms .warn').count())>0);

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
