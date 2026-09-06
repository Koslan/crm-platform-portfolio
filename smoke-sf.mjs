import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
/* A failed check fails the process, so CI cannot go green over a FAIL line. */
const say=(n,c)=>{ console.log((c?'  ok  ':'FAIL  ')+n); if(!c) process.exitCode=1; };
const U='file://'+process.cwd()+'/dist-all/index.html'; // the all-sections build — see build.mjs
p.on('dialog', d=>d.dismiss());

/* --- sf-lwc: page opens, is built, has the platform switcher --- */
await p.goto(U+'#/p/sf-lwc');
await p.waitForSelector('.sflwc-switch', {timeout:8000});
const pageText = await p.locator('#view').textContent();
say('sf-lwc: page does not say "not built yet"', !pageText.includes('not built yet'));
say('sf-lwc: platform switcher has two tabs', (await p.locator('.sflwc-switch button').count()) === 2);

/* --- Zoho tab renders first, same as before this work started --- */
await p.waitForSelector('#h-tw table', {timeout:8000});
say('sf-lwc: Zoho tab renders the existing history widget', (await p.locator('#h-tw tbody tr').count()) > 0);

/* --- Salesforce tab: table with >=5 rows --- */
await p.click('.sflwc-switch button[data-p="sf"]');
await p.waitForSelector('.sflwc-table', {timeout:8000});
const sfRows = await p.locator('.sflwc-table tbody tr').count();
say('sf-lwc: Salesforce tab renders a table with 5+ rows ('+sfRows+')', sfRows >= 5);
say('sf-lwc: exactly one main row on load', (await p.locator('.sflwc-table input[type=checkbox]:checked').count()) === 1);

/* --- moving the main employer keeps exactly one main row --- */
const beforeMainId = await p.locator('.sflwc-table input[type=checkbox]:checked').getAttribute('data-id');
const moveTarget = p.locator('.sflwc-table input[type=checkbox]:not(:checked)').first();
const moveTargetId = await moveTarget.getAttribute('data-id');
await moveTarget.click();
await p.waitForTimeout(700);
const afterMainCount = await p.locator('.sflwc-table input[type=checkbox]:checked').count();
const afterMainId = await p.locator('.sflwc-table input[type=checkbox]:checked').getAttribute('data-id');
say('sf-lwc: moving main leaves exactly one main row', afterMainCount === 1);
say('sf-lwc: the moved row is the one now main', afterMainId === moveTargetId && afterMainId !== beforeMainId);

/* --- write-failure toggle: UI rolls back and shows an error, never loses data --- */
await p.click('#sflwc-chaos button[data-m="second-write-fails"]');
await p.waitForTimeout(300);
const mainBeforeFail = await p.locator('.sflwc-table input[type=checkbox]:checked').getAttribute('data-id');
const failTarget = p.locator('.sflwc-table input[type=checkbox]:not(:checked)').first();
await failTarget.click();
await p.waitForTimeout(700);
say('sf-lwc: forced write failure shows a visible error', (await p.locator('.sflwc-error').count()) > 0);
const afterFailCount = await p.locator('.sflwc-table input[type=checkbox]:checked').count();
const afterFailId = await p.locator('.sflwc-table input[type=checkbox]:checked').getAttribute('data-id');
say('sf-lwc: exactly one main row survives a failed write', afterFailCount === 1);
say('sf-lwc: failed write rolls back rather than losing which row is main', afterFailId === mainBeforeFail);
await p.click('#sflwc-chaos button[data-m="off"]');
await p.screenshot({path:'sf1-lwc.png'});

/* --- the Salesforce tab is retired: four tabs, and the old link still lands --- */
await p.goto(U+'#/about');
await p.waitForTimeout(300);
const tabLabels = (await p.locator('#tabs a').allTextContents()).map(t=>t.trim());
say('nav: no Salesforce tab ('+tabLabels.join(', ')+')', tabLabels.length === 6 && !tabLabels.includes('Salesforce'));
say('nav: no standalone Salesforce tab', !tabLabels.some(t=>/salesforce/i.test(t)));
say('nav: the AI tab is called Applied AI', tabLabels.some(t=>/applied ai/i.test(t)));

await p.goto(U+'#/salesforce');
await p.waitForTimeout(400);
say('old #/salesforce link redirects to the front page ('+p.url().split('#')[1]+')', /#\/$/.test(p.url()));

/* sf-lwc is the one surviving cross-platform page, and it is reachable from Zoho */
await p.goto(U+'#/zoho');
await p.waitForTimeout(300);
const zohoHtml = await p.locator('#view').innerHTML();
say('zoho index links to the cross-platform port', zohoHtml.includes('#/p/sf-lwc'));

/* sf-sync is no longer routed */
await p.goto(U+'#/p/sf-sync');
await p.waitForTimeout(300);
const goneText = await p.locator('#view').textContent();
say('sf-sync is no longer a public page', !goneText.includes('Apex vs Deluge'));

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
