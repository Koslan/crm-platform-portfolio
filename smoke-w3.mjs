import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
const U='file://'+process.cwd()+'/dist/index.html';

await p.goto(U+'#/rec/enrich');
await p.waitForSelector('.ecp .tabs button[data-t="Group structure"]',{timeout:8000});
await p.click('.ecp .tabs button[data-t="Group structure"]');
await p.waitForSelector('.hier .node',{timeout:8000}); await p.waitForTimeout(900);
const nodes = await p.locator('.hier .node').count();
say('hierarchy: tree drawn ('+nodes+' companies)', nodes>=8);
say('hierarchy: one connector per child', (await p.locator('.hier svg path').count())===nodes-1);
say('hierarchy: legend is a flex row', (await p.evaluate(()=>getComputedStyle(document.getElementById('hi-legend')).display))==='flex');
say('hierarchy: current record marked once', (await p.locator('.hier .node.self').count())===1);
say('hierarchy: three depth levels', (await p.evaluate(()=>new Set([...document.querySelectorAll('.hier .node')].map(n=>n.style.top)).size))>=3);
await p.locator('.hier .node:not(.self)').first().click(); await p.waitForTimeout(900);
say('hierarchy: a node opens that company', (await p.locator('.ecp .bar h3').textContent()).trim().length>7);

await p.goto(U+'#/cockpit'); await p.waitForSelector('.ck .box',{timeout:8000}); await p.waitForTimeout(700);
say('cockpit: four pipeline boxes', (await p.locator('.ck .box').count())===4);
say('cockpit: overdue rows carry the traffic light', (await p.locator('.ck tr.late').count())>0);
const allLate = +(await p.locator('#ck-late').textContent());
await p.click('.acts button[data-o="me"]'); await p.waitForTimeout(800);
say('cockpit: scope narrows ('+allLate+' -> '+(await p.locator('#ck-late').textContent())+')',
    +(await p.locator('#ck-late').textContent()) < allLate);
await p.click('.acts button[data-o="all"]'); await p.waitForTimeout(600);
await p.click('.ck .tabs button[data-t="Legal"]'); await p.waitForTimeout(700);
say('cockpit: four document kinds', (await p.locator('.ck .box').count())===4);
say('cockpit: tracker status beside the CRM stage', /Tracker/.test(await p.locator('.ck').textContent()));
await p.click('.ck .tabs button[data-t="Methodology"]'); await p.waitForTimeout(700);
say('cockpit: recommended versus in place', (await p.locator('.ck .box').count())===2);
say('cockpit: the rule is printed on the screen', /worth more than the threshold/.test(await p.locator('.ck .note').first().textContent()));

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,4).join('\n'));
await b.close();
