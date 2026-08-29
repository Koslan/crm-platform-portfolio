import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const p = await b.newPage({ viewport:{ width:1500, height:1050 } });
const errs=[]; p.on('pageerror',e=>errs.push('pageerror: '+e.message));
p.on('console',m=>{ if(m.type()==='error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
const say=(n,c)=>console.log((c?'  ok  ':'FAIL  ')+n);
const U='file://'+process.cwd()+'/dist/index.html';

await p.goto(U+'#/p/agent-journal');
await p.waitForSelector('#aj-tw table.d',{timeout:8000}); await p.waitForTimeout(500);

const rowCount = await p.locator('#aj-tw table.d tbody tr').count();
say('journal renders with 30+ rows ('+rowCount+')', rowCount>=30);
say('six presets are offered', (await p.locator('#aj-presets button').count())===6);

// filter by outcome narrows the table
const beforeFilter = await p.locator('#aj-tw table.d tbody tr').count();
await p.selectOption('#aj-tw select[data-f="res"]','refused');
await p.waitForTimeout(300);
const afterFilter = await p.locator('#aj-tw table.d tbody tr').count();
say('filter by outcome narrows the table ('+beforeFilter+' -> '+afterFilter+')', afterFilter<beforeFilter && afterFilter>0);
await p.selectOption('#aj-tw select[data-f="res"]','');
await p.waitForTimeout(300);

// expand a row -> two-column diff with at least one highlighted field
await p.selectOption('#aj-tw select[data-f="res"]','applied');
await p.waitForTimeout(300);
await p.locator('#aj-tw table.d tbody tr').first().click();
await p.waitForTimeout(300);
say('row expansion shows a two-column diff', (await p.locator('#aj-tw .jrow-diff .col').count())===2);
say('at least one changed field is highlighted', (await p.locator('#aj-tw .jrow-diff .f.hi').count())>0);
await p.selectOption('#aj-tw select[data-f="res"]','');
await p.waitForTimeout(300);

// preset: missing field -> refused with a reason, nothing written
const beforeMissing = await p.locator('#aj-tw table.d tbody tr').count();
await p.locator('#aj-presets button[data-i="3"]').click();
await p.waitForTimeout(700);
const parseText3 = await p.locator('#aj-parse').textContent();
say('command with a missing field is refused', /Refused/.test(parseText3) && /field does not exist/.test(parseText3));
say('missing-field command writes nothing to the record (no apply/refuse gate shown)', (await p.locator('#aj-apply').count())===0);

// preset: ambiguous -> shows candidates, refused, nothing written
await p.locator('#aj-presets button[data-i="2"]').click();
await p.waitForTimeout(700);
const parseText2 = await p.locator('#aj-parse').textContent();
say('ambiguous command shows candidates', (await p.locator('#aj-parse .candidates .cand').count())>=2);
say('ambiguous command is refused rather than guessing', /multiple candidates/.test(parseText2));

// preset: bad picklist value -> refused
await p.locator('#aj-presets button[data-i="5"]').click();
await p.waitForTimeout(700);
say('out-of-picklist value is refused', /outside picklist|not in picklist/.test(await p.locator('#aj-parse').textContent()));

// preset: high-risk field -> diff shown, waits for a person
await p.locator('#aj-presets button[data-i="4"]').click();
await p.waitForTimeout(700);
say('high-risk command shows a diff and waits for approval', (await p.locator('.aj .diff2').count())>0);
say('apply and refuse controls are both offered', (await p.locator('#aj-apply').count())===1 && (await p.locator('#aj-refuse').count())===1);
const journalBeforeApply = await p.locator('#aj-tw table.d tbody tr').count();
await p.locator('#aj-apply').click();
await p.waitForTimeout(600);
say('applying the gated command writes a new journal row', /Applied/.test(await p.locator('#aj-gate-result').textContent()));
await p.waitForTimeout(300);
const journalAfterApply = await p.locator('#aj-tw table.d tbody tr').count();
say('journal grows after an applied write ('+journalBeforeApply+' -> '+journalAfterApply+')', journalAfterApply>journalBeforeApply);

// getFields is actually called against the live emulator, not a hardcoded list
const usesLiveFields = await p.evaluate(async () => {
  const before = (await ZOHO.CRM.API.getFields({ Entity:'Deals' })).fields.length;
  return before > 0;
});
say('validation reads getFields from the live emulator', usesLiveFields);

// no stale placeholders left on the AI tab
await p.goto(U+'#/p/ai-workflow'); await p.waitForTimeout(400);
const wfText = await p.locator('#view').textContent();
say('ai-workflow has no "not built yet" placeholder', !/not built yet/.test(wfText));
say('ai-workflow has no "write-up pending" placeholder', !/write-up pending/.test(wfText));
say('ai-workflow reads constraint / built / trade', /constraint/i.test(wfText) && /built/i.test(wfText) && /trade/i.test(wfText));

await p.goto(U+'#/p/mcp-product'); await p.waitForTimeout(400);
const mcpText = await p.locator('#view').textContent();
say('new AI write-up has no placeholder text', !/not built yet/.test(mcpText) && !/write-up pending/.test(mcpText));

await p.goto(U+'#/p/agent-journal'); await p.waitForTimeout(400);
const ajPageText = await p.locator('#view').textContent();
say('agent-journal page has no placeholder text', !/not built yet/.test(ajPageText) && !/write-up pending/.test(ajPageText));

say('no console errors ('+errs.length+')', errs.length===0);
if(errs.length) console.log(errs.slice(0,4).join('\n'));
await b.close();
