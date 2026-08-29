import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
const U='file://'+process.cwd()+'/dist/index.html';
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

/* --- sf-sync: comparison table (7 rows) and diagram --- */
await p.goto(U+'#/p/sf-sync');
await p.waitForSelector('#sfsync-diagram', {timeout:8000});
const syncText = await p.locator('#view').textContent();
say('sf-sync: page does not say "not built yet"', !syncText.includes('not built yet'));
const syncRows = await p.locator('#view table tbody tr').count();
say('sf-sync: comparison table has seven rows ('+syncRows+')', syncRows === 7);
const diagramPresent = (await p.locator('#sfsync-diagram svg').count()) > 0;
say('sf-sync: comparison diagram is drawn', diagramPresent);
await p.screenshot({path:'sf2-sync.png'});

/* --- Salesforce tab list reflects the new status --- */
await p.goto(U+'#/salesforce');
await p.waitForTimeout(300);
const tabText = await p.locator('#view').textContent();
say('salesforce tab: no longer says no finished work is published', !tabText.includes('No finished Salesforce work is published yet'));

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
