/* The Zoho index is now the work in six pieces rather than one card grid, and
   two screens that used to be reachable only as tabs inside other records have
   pages of their own. These checks hold that shape: the sections, the scale
   strip, the cross-tab rows, the planned entries, and both new pages actually
   mounting their widget rather than rendering an empty host. */
import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1000 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_/.test(m.text())) errs.push('console: '+m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
const U='file://'+process.cwd()+'/dist/index.html';

await p.goto(U+'#/zoho'); await p.waitForTimeout(500);
say('zoho: six pieces of work, each its own section', (await p.locator('.bsec').count())===6);
say('zoho: every section carries its paragraph', (await p.locator('.bsec > .sub').count())===6);
say('zoho: scale strip states five figures', (await p.locator('.scale .stat').count())===5);
const links=await p.locator('a[href^="#/p/"]').count();
say('zoho: index links every page ('+links+')', links>=20);
say('zoho: work living on another tab is labelled as such',
    (await p.locator('.alsolab').count())===2);
const alsoTxt=(await p.locator('.alsolab').allTextContents()).join(' ');
say('zoho: the other home is named, not implied', /another platform/i.test(alsoTxt) && /AI tab/.test(alsoTxt));
say('zoho: planned work is listed, not hidden',
    (await p.locator('.rowlist .rk').allTextContents()).filter(t=>/Planned/.test(t)).length>=8);

/* Contact enrichment — the account is the one with a full contact list on it,
   so the duplicate problem the page describes is actually visible. */
await p.goto(U+'#/p/enrichment'); await p.waitForTimeout(1500);
say('enrichment: the record shell mounted', (await p.locator('#rec-host.ecp .bar h3').count())>0);
say('enrichment: opened on the account that actually has the contact list',
    /Larkspur Systems/.test(await p.locator('#rec-host .bar h3').textContent()));
const etabs=(await p.locator('#rec-host .tabs button').allTextContents()).join('|');
say('enrichment: reaches the hierarchy and provider tabs too ('+etabs.split('|').length+' tabs)',
    /Group structure/.test(etabs) && /Provider link/.test(etabs));
await p.locator('#rec-host .tabs button', { hasText:'Group structure' }).click(); await p.waitForTimeout(700);
say('enrichment: group structure draws the account hierarchy',
    (await p.locator('#rec-host .hier, #rec-host svg, #rec-host .node').count())>0);

/* Sales cockpit — counters have to be computed from the dataset, not blank. */
await p.goto(U+'#/p/cockpit'); await p.waitForTimeout(1500);
say('cockpit: mounted with its three views', (await p.locator('#rec-host [role="tab"]').count())===3);
const open=(await p.locator('#ck-open').textContent().catch(()=>''))||'';
say('cockpit: open value computed ('+open.trim()+')', /\$/.test(open));
await p.locator('#rec-host [data-o="me"]').click(); await p.waitForTimeout(500);
const scoped=(await p.locator('#ck-open').textContent().catch(()=>''))||'';
say('cockpit: narrowing the scope recalculates the counters', scoped!==open);

/* A planned entry must say it is planned rather than 404 or render a stub page
   that pretends to be a write-up. */
await p.goto(U+'#/p/external-server'); await p.waitForTimeout(300);
say('planned page says it is planned', /not built yet/i.test(await p.locator('#view').textContent()));

say('no console errors ('+errs.length+')', errs.length===0);
errs.slice(0,5).forEach(e=>console.log('       '+e.slice(0,180)));
await b.close();
