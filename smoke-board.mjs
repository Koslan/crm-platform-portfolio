import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
const U='file://'+process.cwd()+'/dist/index.html';
p.on('dialog', d => d.dismiss());

/* --- room schedule --- */
await p.goto(U+'#/event');
await p.waitForSelector('.ecp .tabs button[data-t="Room schedule"]', {timeout:8000});
await p.click('.ecp .tabs button[data-t="Room schedule"]');
await p.waitForSelector('.ecp .blk', {timeout:8000});
await p.waitForTimeout(800);
const blks = await p.locator('.ecp .blk').count();
say('schedule: blocks drawn ('+blks+')', blks>3);
say('schedule: all revealed', (await p.locator('.ecp .blk.in').count())===blks);
say('schedule: now-line present', (await p.locator('.ecp .now').count())>0);
const heights = await p.$$eval('.ecp .blk', n=>n.map(x=>parseFloat(x.style.height)));
say('schedule: height tracks duration', new Set(heights).size>1);
const widths = await p.$$eval('.ecp .blk', n=>n.map(x=>x.style.width));
say('schedule: overlaps split into lanes', widths.some(w=>!w.includes('100%')));
const clashN = +(await p.locator('#v-c').textContent());
say('schedule: clash alert counted ('+clashN+')', clashN>0);
await p.click('#v-clash'); await p.waitForTimeout(700);
say('schedule: clash filter narrows', (await p.locator('.ecp .blk').count())<blks);
await p.screenshot({path:'b1-schedule.png'});
await p.click('#v-clash');

/* --- mobile board --- */
await p.goto(U+'#/rec/board');
await p.waitForSelector('.phone .card', {timeout:8000});
await p.waitForTimeout(700);
say('board: phone frame rendered', (await p.locator('.phone').count())===1);
const cards = await p.locator('.eb .card').count();
say('board: room groups with cards ('+cards+')', cards>0);
say('board: pills show counters', /meetings/.test(await p.locator('#b-pills').textContent()));
await p.click('#b-tabs button[data-t="Team"]'); await p.waitForTimeout(400);
say('board: team tab shows load bars', (await p.locator('.eb .bar2 i').count())>0);
await p.click('#b-tabs button[data-t="Meetings"]'); await p.waitForTimeout(400);
say('board: meetings tab lists the day', (await p.locator('.eb .card').count())>0);
const clashPill = p.locator('#b-pills button[data-k="clash"]');
const before = await p.locator('.eb .card').count();
await clashPill.click(); await p.waitForTimeout(400);
const after = await p.locator('.eb .card').count();
say('board: clash pill filters ('+before+' -> '+after+')', after>0 && after<before);
await clashPill.click(); await p.waitForTimeout(300);

await p.locator('.eb .card').first().click();
await p.waitForSelector('#b-recap', {timeout:5000});
await p.waitForTimeout(400);
say('board: sheet slides up', await p.locator('#b-sheet').evaluate(n=>n.classList.contains('on')));
say('board: account snapshot tiles', (await p.locator('.eb .tile').count())>=6);
await p.fill('#b-recap','they want the certification plan first. we send a scope on friday.');
await p.click('#b-ai'); await p.waitForTimeout(600);
const rew = await p.inputValue('#b-recap');
say('board: rephrase rewrote server-side', /^Outcome:/.test(rew));
say('board: undo offered', /Undo/.test(await p.locator('#b-ai').textContent()));
await p.click('#b-ai'); await p.waitForTimeout(200);
say('board: undo restores the draft', (await p.inputValue('#b-recap')).startsWith('they want'));
await p.click('#b-save'); await p.waitForTimeout(700);
say('board: recap saved to the record', /Saved/.test(await p.locator('#b-msg').textContent()));
await p.screenshot({path:'b2-board.png'});
await p.click('#b-x'); await p.waitForTimeout(400);
say('board: sheet closes', !(await p.locator('#b-sheet').evaluate(n=>n.classList.contains('on'))));
await p.click('#b-ver'); await p.waitForTimeout(400);
say('board: on-screen console opens', await p.locator('#b-console').evaluate(n=>n.classList.contains('on')));
const logTxt = await p.locator('#b-log').textContent();
say('board: console carries real entries', /coql/.test(logTxt) && /save/.test(logTxt));
await p.screenshot({path:'b3-console.png'});

/* --- "Add meeting" wizard --- */
await p.click('#b-close'); await p.waitForTimeout(300);   // the on-screen console from the check above is still open
const boardBefore = +(await p.locator('#b-pills button').first().locator('b').textContent());
await p.click('#b-add');
await p.waitForSelector('#b-wiz.on', {timeout:5000});
say('wizard opens', true);
say('wizard: blocked with no account', await p.locator('#bwNext').isDisabled());

const seed = await p.evaluate(()=>window.__DATA__.Accounts.find(a=>!a.Parent_Account).Account_Name.slice(0,3));
await p.fill('#bwAcc', seed);
await p.waitForTimeout(400);
const wHits = await p.locator('#bwBody .bw-opt').count();
say('wizard: account search returns hits ('+wHits+')', wHits>0);
await p.locator('#bwBody .bw-opt').first().click();
// picking an account auto-advances to step 2 in this wizard, unlike the desktop one
await p.waitForSelector('#bwBody .bw-role', {timeout:5000});
await p.waitForTimeout(400);
say('wizard: step 2 has four buyer roles', (await p.locator('.bw-role').count())===4);
say('wizard: blocked until a buyer is picked', await p.locator('#bwNext').isDisabled());

// exclusivity: find an account with 5+ working contacts so the search-picker sheet (not chips) is exercised
const bigAcc = await p.evaluate(async () => {
  for (const a of window.__DATA__.Accounts) {
    const r = await ZOHO.CRM.API.coql({ select_query:
      `select id from Contacts where Account_Name = '${a.id}' and Contact_Status = 'Working' limit 10` });
    if (r.data.length >= 5) return a.Account_Name;
  }
  return null;
});
say('wizard: an account with 5+ contacts exists to test the picker ('+bigAcc+')', !!bigAcc);
if (bigAcc) {
  await p.click('#bwX');
  await p.waitForTimeout(300);
  await p.click('#b-add');
  await p.waitForSelector('#b-wiz.on');
  await p.fill('#bwAcc', bigAcc);
  await p.waitForTimeout(400);
  await p.locator('#bwBody .bw-opt', { hasText: bigAcc }).first().click();
  await p.waitForSelector('#bwBody .bw-add', {timeout:5000});
  await p.waitForTimeout(300);
  say('wizard: 5+ contacts switches to the search picker', (await p.locator('.bw-add').count())===4);
  await p.locator('.bw-add[data-addrole="Economic"]').click();
  await p.waitForSelector('#bwPick.on', {timeout:3000});
  const pickerName = (await p.locator('#bwPickList .bw-pick-row .n').first().textContent()).trim();
  await p.locator('#bwPickList .bw-pick-row').first().click();
  await p.waitForTimeout(150);
  await p.click('#bwPickClose');
  await p.waitForTimeout(150);
  say('wizard: buyer picked as Economic', (await p.evaluate(()=>MobileBoard.w.buyers.Economic.length))===1);
  // roles are exclusive: moving the same person to Technical must drop them from Economic
  await p.locator('.bw-add[data-addrole="Technical"]').click();
  await p.waitForSelector('#bwPick.on');
  await p.locator('#bwPickList .bw-pick-row', { hasText: pickerName }).first().click();
  await p.waitForTimeout(150);
  await p.click('#bwPickClose');
  await p.waitForTimeout(150);
  const buyersAfterMove = await p.evaluate(()=>JSON.parse(JSON.stringify(MobileBoard.w.buyers)));
  say('wizard: buyer roles are mutually exclusive',
    buyersAfterMove.Economic.length===0 && buyersAfterMove.Technical.includes(pickerName));
} else {
  await p.locator('.bw-chip[data-role]').first().click();
  await p.waitForTimeout(150);
}

await p.locator('.bw-chip[data-team]').first().click();
await p.waitForTimeout(200);
say('wizard: unblocks once a buyer and our-side attendee are picked', !(await p.locator('#bwNext').isDisabled()));
await p.click('#bwNext');
await p.waitForSelector('#bwBody .bw-cap, #bwBody .bw-warn', {timeout:5000});
say('wizard: step 3 shows rooms with capacity or a no-rooms warning', true);
await p.click('#bwNext');
await p.waitForSelector('.bw-slotrow, .bw-grid', {timeout:8000});
await p.waitForTimeout(300);
const listSlots = await p.locator('.bw-slotrow').count();
say('wizard: suggested-times slots computed ('+listSlots+')', listSlots>0);
await p.click('.bw-seg button[data-view="grid"]');
await p.waitForSelector('.bw-grid table', {timeout:3000});
say('wizard: 15-min grid renders', (await p.locator('.bw-grid tbody tr').count())>0);
await p.click('.bw-seg button[data-view="list"]');
await p.waitForTimeout(200);
await p.locator('.bw-slotrow[data-slot]').first().click();
await p.waitForTimeout(150);
await p.screenshot({path:'b4-wizard.png'});
say('wizard: slot pick unblocks step 4', !(await p.locator('#bwNext').isDisabled()));
await p.click('#bwNext');
await p.waitForSelector('.bw-review', {timeout:5000});
say('wizard: review lists the campaign time zone', /zone/i.test(await p.locator('.bw-review').textContent()));
say('wizard: purpose is optional — step 5 is not blocked', !(await p.locator('#bwNext').isDisabled()));
await p.click('#bwNext');
await p.waitForSelector('.bw-done', {timeout:8000});
say('wizard: booking wrote a record', /Meeting booked/.test(await p.locator('.bw-done').textContent()));
await p.screenshot({path:'b5-wizard-done.png'});
const createdId = await p.evaluate(()=>MobileBoard.w.createdId);
const createdRec = await p.evaluate(async id => (await ZOHO.CRM.API.getRecord({ Entity:'Meetings', RecordID:id })).data[0], createdId);
// the buyer was moved to Technical during the exclusivity check above — the written participant
// must carry that role, not a hardcoded 'Economic Buyer' (a real bug on the desktop Wizard)
say('wizard: participant role is the one actually picked, not a hardcoded default',
  bigAcc ? createdRec.participants.some(x => x.Type === 'Technical buyer')
         : !!createdRec.participants.length);
await p.click('#bwFinish');
await p.waitForTimeout(500);
say('wizard: closes and the new meeting appears on the board',
  +(await p.locator('#b-pills button').first().locator('b').textContent()) === boardBefore + 1);

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,5).join('\n'));
await b.close();
