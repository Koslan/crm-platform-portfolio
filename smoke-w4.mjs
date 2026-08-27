import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
const U='file://'+process.cwd()+'/dist/index.html';

await p.goto(U+'#/event'); await p.waitForSelector('.ecp .tabs button[data-t="At a glance"]',{timeout:8000});
await p.click('.ecp .tabs button[data-t="At a glance"]');
await p.waitForSelector('.mx table',{timeout:8000}); await p.waitForTimeout(500);
say('matrix: two-level header', (await p.locator('.mx thead tr').count())===2);
say('matrix: grouped by function', (await p.locator('.mx th.grp').count())>=3);
say('matrix: covered cells ('+(await p.locator('.mx td.hit').count())+')', (await p.locator('.mx td.hit').count())>10);
say('matrix: per-person counters', /meetings/.test(await p.locator('.mx thead tr').nth(1).textContent()));
const cells = await p.evaluate(()=>[...document.querySelectorAll('.mx tbody tr:first-child td.frz')].map(t=>{const r=t.getBoundingClientRect();return {l:Math.round(r.left),w:Math.round(r.width)}}));
say('matrix: pinned columns do not overlap', !cells.some((c,i)=>i&&c.l<cells[i-1].l+cells[i-1].w-1));
const before = await p.locator('.mx tbody tr').count();
await p.fill('#mx-q','alpha'); await p.waitForTimeout(300);
say('matrix: filter narrows ('+before+' -> '+(await p.locator('.mx tbody tr').count())+')', (await p.locator('.mx tbody tr').count())<before);

await p.goto(U+'#/rec/contact'); await p.waitForSelector('.ecp .tabs button[data-t="Provider sync"]',{timeout:8000});
await p.click('.ecp .tabs button[data-t="Provider sync"]');
await p.waitForSelector('.pv .p',{timeout:8000}); await p.waitForTimeout(800);
say('person sync: cards rendered', (await p.locator('.pv .p').count())>3);
say('person sync: employer-match badges', (await p.locator('.pv .p .flags i').count())>0);
await p.locator('.pv .p .nm').first().click(); await p.waitForTimeout(500);
say('person sync: profile with a timeline', (await p.locator('.prof .job').count())>0);
say('person sync: durations computed', /yr|mo/.test(await p.locator('.prof').textContent()));
await p.locator('.ecp-mod [data-close]').click(); await p.waitForTimeout(300);
await p.fill('#ps-q','zz'); await p.waitForTimeout(300);
say('person sync: empty search states it', /Nobody/.test(await p.locator('#ps-grid').textContent()));

await p.goto(U+'#/rec/newcontact'); await p.waitForSelector('.pv .lanes',{timeout:8000}); await p.waitForTimeout(400);
await p.fill('#cn-ln','a'); await p.waitForTimeout(400);
say('create: CRM lane searches while typing', (await p.locator('#cn-zoho .p').count())>0);
say('create: provider lane waits to be asked', (await p.locator('#cn-apollo .p').count())===0);
await p.click('.acts button[data-a="search"]'); await p.waitForTimeout(700);
say('create: provider lane runs on request', (await p.locator('#cn-apollo .p').count())>0);
say('create: duplicates counted before writing', (+(await p.locator('#cn-d').textContent()) + +(await p.locator('#cn-pd').textContent()))>0);
say('create: exact duplicates block creation', (await p.locator('#cn-apollo button[disabled]').count())>0);
// take a handle, not a locator: the button disables itself and a locator would re-resolve elsewhere
const freeCount = await p.locator('#cn-apollo .p button:not([disabled])').count();
say('create: the page offers a creatable card', freeCount>0);
if (freeCount) {
  const free = await p.locator('#cn-apollo .p button:not([disabled])').first().elementHandle();
  await free.click(); await p.waitForTimeout(900);
  say('create: a clean card writes a contact', /created/.test(await free.evaluate(n=>n.textContent)));
}

await p.goto(U+'#/rec/enrich'); await p.waitForSelector('.ecp .tabs button[data-t="Provider link"]',{timeout:8000});
await p.click('.ecp .tabs button[data-t="Provider link"]');
await p.waitForSelector('.pv .two-panel',{timeout:8000}); await p.waitForTimeout(400);
say('org match: two panels', (await p.locator('.pv .panel2').count())===2);
say('org match: button starts disabled', await p.locator('#om-go').isDisabled());
await p.locator('#om-o .it').first().click(); await p.waitForTimeout(300);
say('org match: unlocks with both sides chosen', !(await p.locator('#om-go').isDisabled()));
await p.click('#om-go'); await p.waitForTimeout(700);
say('org match: link written', (await p.locator('.pv .ok2').count())===1);

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,4).join('\n'));
await b.close();
