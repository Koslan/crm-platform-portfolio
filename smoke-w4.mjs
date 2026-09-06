import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
/* A failed check fails the process, so CI cannot go green over a FAIL line. */
const say=(n,c)=>{ console.log((c?'  ok  ':'FAIL  ')+n); if(!c) process.exitCode=1; };
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

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,4).join('\n'));
await b.close();
