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

/* --- chat to issue tracker (Teams -> Zoho -> Jira) --- */
await p.goto(U+'#/p/chat-tracker');
await p.waitForSelector('.tmw .msg', {timeout:8000});
say('tracker: Teams screen recognisable (tabs present)', (await p.locator('.trk-tabs button').count())===2);
say('tracker: root message carries the PITCH code', /PITCH-2048/.test(await p.locator('.tmw .msg .bd').first().textContent()));
say('tracker: tagged replies show before any sync ran', (await p.locator('.tmw .msg .tag').count())===2);
say('tracker: no ticket reaction before synchronization', (await p.locator('.tmw .ticket').count())===0);
await p.click('.trk-bar [data-act="run"]');
await p.waitForSelector('.jrw .cmt', {timeout:4000});
say('tracker: synchronization jumps to Jira so the result is visible', (await p.locator('[data-tab="jira"]').getAttribute('aria-selected'))==='true');
say('tracker: delivered replies land as Jira comments', (await p.locator('.jrw .cmt').count())===2);
say('tracker: synchronization sets one-time reactions', (await p.locator('.tmw .ticket').count())===2);
say('tracker: restricted comment carries a role lock, not just colour', /Restricted to Producers/.test(await p.locator('.jrw .cmt .trk-lock').first().textContent()));
say('tracker: attachment travels as a link, not an upload', /Estimation_v3\.xlsx/.test(await p.locator('.jrw .cmt .files').textContent()));
const beforeAgain = await p.locator('.jrw .cmt').count();
await p.click('.trk-bar [data-act="again"]');
await p.waitForTimeout(1600);
say('tracker: running again does not duplicate the comment', (await p.locator('.jrw .cmt').count())===beforeAgain);
say('tracker: duplicate run reports the marker, not a new post', /duplicate skipped/i.test(await p.locator('.trk-status').textContent()));
await p.click('.trk-bar [data-act="missing"]');
await p.waitForTimeout(700);
say('tracker: a thread with no root PITCH is skipped safely', /Skipped safely/i.test(await p.locator('.trk-status').textContent()));
say('tracker: skipping never invents a Jira comment for it', (await p.locator('.jrw .cmt').count())===beforeAgain);
await p.click('.trk-bar [data-act="biweekly"]');
await p.waitForSelector('.tmw .sysmsg', {timeout:4000});
say('tracker: biweekly recap posts a Changed/Needed card in Teams', /Needed/.test(await p.locator('.tmw .sysmsg').textContent()));
await p.click('.trk-bar [data-act="biweekly"]');
await p.waitForTimeout(1600);
say('tracker: repeating the biweekly run reports already delivered', /Already delivered/i.test(await p.locator('.trk-status').textContent()));
await p.click('#trk-tech-btn');
await p.waitForSelector('.trk-tech table', {timeout:3000});
say('tracker: technical details drawer lists the hidden markers', /crm-teams-msg/.test(await p.locator('.trk-tech').textContent()));
await p.screenshot({path:'p5-tracker.png'});

/* --- every page the navigation offers is either written or honestly planned --- */
await p.goto(U+'#/'); await p.waitForTimeout(400);
const registry = await p.evaluate(() => Object.values(ALL).map(i => ({ id:i.id, kind:i.kind })));
const bodies = [];
for (const it of registry) {
  await p.goto(U+'#/p/'+it.id); await p.waitForTimeout(260);
  bodies.push({ ...it, text: await p.locator('#view').textContent() });
}
const stranded = bodies.filter(x => x.kind !== 'plan' && /write-up pending|not built yet/.test(x.text));
say('no page claims to be written and then renders a placeholder ('+stranded.map(x=>x.id).join(',')+')', stranded.length===0);
const unlabelled = bodies.filter(x => x.kind === 'plan' && !/not built yet/.test(x.text));
say('every planned page says so on the page itself ('+unlabelled.map(x=>x.id).join(',')+')', unlabelled.length===0);
const thin = bodies.filter(x => x.kind !== 'plan' && x.text.split(/\s+/).length < 120);
say('no written page is a stub ('+thin.map(x=>x.id).join(',')+')', thin.length===0);

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
