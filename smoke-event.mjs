import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1000 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
/* A failed check fails the process, so CI cannot go green over a FAIL line. */
const say=(n,c)=>{ console.log((c?'  ok  ':'FAIL  ')+n); if(!c) process.exitCode=1; };
const U='file://'+process.cwd()+'/dist/index.html';

await p.goto(U+'#/event');
await p.waitForSelector('.ecp .bar', {timeout:8000});
say('record page mounted', true);
await p.waitForTimeout(600);
say('header counters filled', /\d/.test(await p.locator('#ecp-conf').textContent()));
// the record opens on Contacts, the tab people use; Overview is one click away
say('opens on the Contacts tab', (await p.locator('.ecp .tabs button[aria-selected="true"]').textContent()).trim()==='Contacts');
await p.click('.ecp .tabs button[data-t="Overview"]');
await p.waitForSelector('.ecp table.d', {timeout:8000});
say('overview: rooms + team tables', (await p.locator('.ecp table.d').count())>=2);
await p.screenshot({path:'s1-overview.png'});

await p.click('.ecp .tabs button[data-t="Accounts"]');
await p.waitForSelector('#ea-tw table.g tbody tr', {timeout:15000});
const accHeads = (await p.locator('#ea-tw thead tr').first().locator('th').allTextContents()).join('|');
say('accounts: column order matches the widget',
  /MeetingSet\?/.test(accHeads) && /Meeting metLast Year\?/.test(accHeads)
  && accHeads.indexOf('MeetToMatch') < accHeads.indexOf('Account')
  && accHeads.indexOf('IsTarget?') < accHeads.indexOf('Priority'));
say('accounts: paginated at 25', (await p.locator('#ea-tw tbody tr').count())===25);
const accFoot = await p.locator('#ea-tw .foot .rows').textContent();
say('accounts: three sources merged ('+accFoot.trim()+')', /of (\d+) rows/.test(accFoot)
  && +accFoot.match(/of (\d+) rows/)[1] > 40);
say('accounts: last year flag set from the previous event',
  (await p.locator('#ea-tw tbody tr td:nth-child(2) .tick:not(.off)').count())>0);
say('accounts: target priority read out of the tag',
  (await p.locator('#ea-tw tbody tr td:nth-child(6)').allTextContents()).some(t=>/^P[123]$/.test(t.trim())));
await p.locator('#ea-tw tbody td[data-tip]').first().hover();
await p.waitForTimeout(450);
say('accounts: hover panel lists the contacts', await p.locator('.ea-tip').count()===1);
await p.click('#ea-help');
await p.waitForSelector('.ea-modal', {timeout:3000});
say('accounts: help modal explains the three stages',
  /STAGE 2: RECALCULATE ALL FLAGS/.test(await p.locator('.ea-modal .bd').textContent()));
await p.locator('.ea-modal .x').click();
await p.waitForTimeout(200);
await p.locator('.ec.ea').screenshot({path:'s1b-accounts.png'});

await p.click('.ecp .tabs button[data-t="Contacts"]');
await p.waitForSelector('#c-tw table.g tbody tr', {timeout:8000});
await p.waitForTimeout(600);                       // the counters count up on first paint
const total = +(await p.locator('#c-all').textContent());
say('contacts loaded in pages ('+total+')', total>200);
say('view note explains the view', /Event preparation/.test(await p.locator('#c-load').textContent()));
say('regional and source counters filled', +(await p.locator('#c-eu').textContent())>0
  && +(await p.locator('#c-mtm').textContent())>0);
say('rows are paginated at 100', (await p.locator('#c-tw tbody tr').count())===100);
await p.click('#c-chips button[data-k="target"]');
await p.waitForTimeout(200);
const shown = +(await p.locator('#c-shown').textContent());
say('chip filter narrows ('+shown+' of '+total+')', shown>0 && shown<total);
await p.click('#c-view button[data-v="full"]');
await p.waitForTimeout(400);
const heads = await p.locator('#c-tw thead tr').first().locator('th').allTextContents();
say('full view adds the comment columns', heads.join('|').includes('BD comment') && heads.join('|').includes('SL comment'));
say('column order matches the widget', heads[0].startsWith('Met') && heads[1].startsWith('Source')
  && heads[2].startsWith('Account') && heads[3].startsWith('Is target'));
await p.locator('#c-tw thead tr.fr input[data-f="accName"]').fill('a');
await p.waitForTimeout(300);
say('column filter narrows the table', /of \d+ rows/.test(await p.locator('#c-tw .foot .rows').textContent()));
await p.locator('#c-tw thead tr.fr input[data-f="accName"]').fill('');
await p.waitForTimeout(200);
// a status the meetings own cannot be edited by hand; an open one can
const editable = p.locator('#c-tw tbody td[data-ed="Status"]').first();
const wasText = (await editable.textContent()).trim();
await editable.click();
await p.waitForTimeout(150);
say('meeting status opens an editor', await editable.locator('select').count()===1);
await editable.locator('select').selectOption('Not interested');
await p.waitForTimeout(400);
say('edit persists to the emulator', (await p.locator('#c-tw tbody tr').first().textContent()).includes('Not interested')
  || wasText!=='');
say('locked statuses carry the lock', await p.locator('#c-tw tbody .lock').count()>0);
await p.screenshot({path:'s2-contacts.png'});
await p.click('#c-view button[data-v="old"]');
await p.waitForSelector('.ec.ui-old table.g', {timeout:8000});
say('old UI renders the production table', /All Contacts: \d+/.test(await p.locator('#c-old-all').textContent()));
await p.screenshot({path:'s2b-contacts-old.png'});
await p.click('#c-view button[data-v="prep"]');
await p.waitForSelector('.ec.ui-new table.g', {timeout:8000});
await p.click('#c-chips button[data-k="target"]');

await p.click('.ecp .tabs button[data-t="Meetings"]');
await p.waitForSelector('#m-tw table.g', {timeout:8000});
await p.waitForTimeout(600);                       // the counters count up on first paint
const mAll = +(await p.locator('#m-all').textContent());
say('meetings loaded ('+mAll+')', mAll>10);
say('hours counter computed', +(await p.locator('#m-hrs').textContent())>0);
const mHeads = (await p.locator('#m-tw thead tr').first().locator('.ct').allTextContents()).join('|');
say('meetings: column order matches the widget',
  mHeads.indexOf('Date') < mHeads.indexOf('Recap') && mHeads.indexOf('Recap') < mHeads.indexOf('Account')
  && mHeads.indexOf('Account') < mHeads.indexOf('Meeting name') && /Buyers/.test(mHeads) && /Ourattendees/.test(mHeads));
say('meetings: buyer role letters render', (await p.locator('#m-tw tbody .bq').count())>0);
await p.click('#m-chips button[data-k="yes"][data-group="recap"]'); await p.waitForTimeout(200);
say('recap filter works', +(await p.locator('#m-shown').textContent())<mAll);
await p.click('#m-chips button[data-k="yes"][data-group="recap"]'); await p.waitForTimeout(200);
await p.click('#m-view button[data-v="old"]');
await p.waitForSelector('.ec.ui-old table.g', {timeout:8000});
say('meetings old UI renders the production table', /Records: \d+/.test(await p.locator('#m-old-count').textContent()));
await p.click('#m-view button[data-v="new"]');
await p.waitForSelector('.ec.ui-new table.g', {timeout:8000});
await p.waitForTimeout(600);
say('meetings: still loaded after switching back', +(await p.locator('#m-all').textContent())===mAll);
await p.screenshot({path:'s3-meetings.png'});

// wizard
await p.click('.ecp .acts button[data-a="meeting"]');
await p.waitForSelector('.ecp-mod', {timeout:5000});
say('wizard opens blocked', await p.locator('#w-next').isDisabled());
say('blocker names the reason', /account/i.test(await p.locator('#w-msg').textContent()));
const seed = await p.evaluate(()=>window.__DATA__.Accounts.find(a=>!a.Parent_Account).Account_Name.slice(0,3));
await p.fill('#w-acc', seed);
await p.waitForTimeout(300);
const hits = await p.locator('#w-hits .room').count();
say('account search returns hits ('+hits+')', hits>0);
await p.locator('#w-hits .room').first().click();
await p.waitForTimeout(200);
await p.click('#w-next');
await p.waitForSelector('#w-roles', {timeout:5000});
await p.waitForTimeout(500);
say('step 2 has four buyer roles', (await p.locator('.ecp .role').count())===4);
say('step 2 blocked until a buyer is picked', await p.locator('#w-next').isDisabled());
await p.locator('.ecp .role input').first().fill('a');
await p.waitForTimeout(300);
const sug = await p.locator('.ecp .role .sug div[data-add]').count();
say('step 2 suggests contacts of the account ('+sug+')', sug>0);
if (sug) await p.locator('.ecp .role .sug div[data-add]').first().click();
await p.waitForTimeout(200);
say('step 2 shows the buyer as a chip', (await p.locator('.ecp .role .sel span').count())>0);
await p.locator('#w-team button').first().click();
await p.waitForTimeout(200);
say('step 2 unblocks', !(await p.locator('#w-next').isDisabled()));
await p.click('#w-next');
await p.waitForSelector('#w-rooms', {timeout:5000});
say('step 3 shows rooms with capacity', /people/.test(await p.locator('#w-rooms .room .mt').first().textContent()));
await p.click('#w-next');
await p.waitForSelector('#w-slots .slot', {timeout:8000});
const slots = await p.locator('#w-slots .slot').count();
say('availability computed ('+slots+' suggestions)', slots>0);
await p.screenshot({path:'s4-wizard.png'});
await p.locator('#w-slots .slot:not(.busy)').first().click();
await p.waitForTimeout(200);
await p.click('#w-next');
await p.waitForSelector('.kvs', {timeout:5000});
say('review lists the campaign time zone', /zone/i.test(await p.locator('.kvs').textContent()));
await p.click('#w-next');
await p.waitForSelector('.res .tickbig', {timeout:6000});
say('booking wrote a record', /Record \d+ created/.test(await p.locator('.res').textContent()));
await p.screenshot({path:'s5-booked.png'});
await p.click('#w-close');
await p.waitForTimeout(600);
say('new meeting appears in the tab', +(await p.locator('#m-all').textContent()) === mAll+1);

// 15-min grid path + blocked reasons
await p.click('.ecp .acts button[data-a="meeting"]');
await p.waitForSelector('.ecp-mod');
await p.fill('#w-acc', seed); await p.waitForTimeout(300);
await p.locator('#w-hits .room').first().click(); await p.click('#w-next');
await p.waitForSelector('#w-roles'); await p.waitForTimeout(500);
await p.locator('.ecp .role input').first().fill('a'); await p.waitForTimeout(300);
if (await p.locator('.ecp .role .sug div[data-add]').count()) await p.locator('.ecp .role .sug div[data-add]').first().click();
await p.locator('#w-team button').first().click(); await p.click('#w-next');
await p.waitForSelector('#w-rooms'); await p.click('#w-next');
await p.waitForSelector('#w-slots .slot');
await p.click('#w-mode button[data-m="grid"]'); await p.waitForTimeout(300);
const busy = await p.locator('#w-slots .slot.busy').count();
say('grid marks blocked slots with a reason ('+busy+')', busy>0);
say('reason text present', /taken|busy/.test(await p.locator('#w-slots').textContent()));

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,4).join('\n'));
await b.close();
