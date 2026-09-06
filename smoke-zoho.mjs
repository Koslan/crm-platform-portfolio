/* The Zoho index: overview, scale strip, the platform diagram, the seven case
   studies, and the examples and notes under them — plus two screens that used
   to be reachable only as tabs inside other records and now have pages of
   their own, actually mounting their widget rather than rendering an empty host. */
import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1000 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_/.test(m.text())) errs.push('console: '+m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
const U='file://'+process.cwd()+'/dist/index.html';

await p.goto(U+'#/zoho'); await p.waitForTimeout(500);
say('zoho: scale strip states five figures', (await p.locator('.stats .stat').count())===5);
say('zoho: five directions of work, each with a paragraph', (await p.locator('.dirs .dir').count())===5 && (await p.locator('.dirs .dir p').count())===5);
say('zoho: the platform diagram is drawn', (await p.locator('.dg-layers .dgl-row').count())>=5);
say('zoho: seven case studies indexed', (await p.locator('.cslist .csrow[href^="#/zoho/"]').count())===7);
const links=await p.locator('a[href^="#/p/"]').count();
say('zoho: index links every example and note ('+links+')', links>=12);
say('zoho: nothing on the index is labelled planned', !/Planned/.test(await p.locator('#view').textContent()));
/* Pages that got written are listed as notes, under their case. */
for (const id of ['contact-model','deluge-cicd','widget-system','cross-system','org-tooling']) {
  say(`zoho: ${id} is listed`, (await p.locator(`a[href^="#/p/${id}"]`).count())>=1);
}

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

say('no console errors ('+errs.length+')', errs.length===0);
errs.slice(0,5).forEach(e=>console.log('       '+e.slice(0,180)));
await b.close();
