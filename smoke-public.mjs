/* The public structure: seven case studies with stable addresses, hidden
   sections that do not resolve, no status labels or placeholder copy, no
   self-referential bragging, sane behaviour at phone widths. */
import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const U = 'file://' + process.cwd() + '/dist/index.html';
let failed = 0;
const say = (n, c) => { console.log((c ? '  ok  ' : 'FAIL  ') + n); if (!c) failed++; };

const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
p.on('pageerror', e => errs.push('pageerror: ' + e.message));
p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });
const go = async h => { await p.goto(U + '#/' + h); await p.waitForTimeout(350); };
const hash = () => p.evaluate(() => location.hash);
const text = () => p.locator('#view').innerText();

/* ---- the seven cases ---- */
const CASES = ['widgets', 'orchestration', 'teams-crm', 'jira-sync', 'enrichment', 'platform-engineering', 'reconciliation'];
for (const slug of CASES) {
  await go('zoho/' + slug);
  const t = await text();
  say('#/zoho/' + slug + ' opens on its summary', /what\s+/i.test(t) && /scale\s+/i.test(t) && /my role\s+/i.test(t) && /key topics/i.test(t));
  say('#/zoho/' + slug + ' has an architecture diagram', (await p.locator('.dg').count()) >= 1);
  say('#/zoho/' + slug + ' has a failure-handling table', (await p.locator('.cs-table tbody tr').count()) >= 4);
  say('#/zoho/' + slug + ' states the result and the responsibility', /\bresult\b/i.test(t) && /my responsibility/i.test(t));
  const bodyScrollW = await p.evaluate(() => document.body.scrollWidth);
  say('#/zoho/' + slug + ' no horizontal scroll at 1440', bodyScrollW <= 1440);
}

/* ---- embedded examples mount inside the case pages ---- */
await go('zoho/teams-crm');
await p.waitForSelector('#cs-embed .list, #cs-embed .tms', { timeout: 8000 }).catch(() => {});
say('teams-crm embeds the chat flow', (await p.locator('#cs-embed').count()) === 1 && (await p.locator('#cs-embed button').count()) > 0);
await go('zoho/reconciliation');
await p.waitForSelector('#cs-embed .tabs button[data-t]', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(600);
const selTab = await p.locator('#cs-embed .tabs button[aria-selected="true"]').first().textContent().catch(() => '');
say('reconciliation embeds the event record open on Calendar sync (' + (selTab || '').trim() + ')', (selTab || '').trim() === 'Calendar sync');
await go('zoho/platform-engineering');
await p.waitForSelector('#cs-embed svg, #cs-embed table', { timeout: 8000 }).catch(() => {});
say('platform-engineering embeds the org health report', (await p.locator('#cs-embed *').count()) > 20);
await go('zoho/enrichment');
await p.waitForSelector('#cs-embed .tabs button[data-t]', { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(1200);
const enrTab = await p.locator('#cs-embed .tabs button[aria-selected="true"]').first().textContent().catch(() => '');
say('enrichment embeds the account record open on Contact enrichment (' + (enrTab || '').trim() + ')', (enrTab || '').trim() === 'Contact enrichment');
await go('p/cross-system/refuse');
await p.waitForTimeout(500);
const scrolledTo = await p.evaluate(() => { const t = document.getElementById('sec-refuse'); return t ? Math.round(t.getBoundingClientRect().top) : null; });
say('#/p/cross-system/refuse opens the note at its section (top=' + scrolledTo + ')', scrolledTo !== null && scrolledTo < 120);

/* ---- aliases and old addresses ---- */
await go('zoho/graph-delta-sync');
say('#/zoho/graph-delta-sync redirects to the orchestration case', (await hash()) === '#/zoho/orchestration');
await go('p/delta-sync');
say('the merged delta-sync note leads to the orchestration case', (await hash()) === '#/zoho/orchestration');
await go('p/authority');
say('the merged authority note leads to its section of cross-system', (await hash()) === '#/p/cross-system/who-owns');
await go('p/site');
say('the retired site page leads to the note about the examples', (await hash()) === '#/about-demos');
await go('about');
say('#/about lands on the front page', (await hash()) === '#/');

/* ---- hidden sections do not resolve ---- */
for (const h of ['ai', 'salesforce', 'fullstack', 'p/sf-lwc', 'p/sf-sync', 'p/agent-journal', 'p/loss-analysis', 'p/harness', 'p/generator', 'p/ci-guards', 'p/ai-workflow', 'p/mcp-product', 'p/code-intelligence', 'p/team-intelligence', 'p/calendar-sync', 'p/mobile-canvas', 'p/teams-jira', 'p/reporting', 'p/external-server', 'p/ai-interface-assistance']) {
  await go(h);
  const hh = await hash();
  say('#/' + h + ' is not reachable (lands on ' + hh + ')', /^#\/(zoho(\/[a-z-]+)?|about-demos|p\/board)?$/.test(hh) && !/#\/p\/(sf-|agent|loss|harness|generator|ci-|ai-|mcp|code-int|team-int|calendar|mobile|teams-jira|reporting|external)/.test(hh));
}
await go('');
const tabs = await p.locator('.tabs a').allTextContents();
say('navigation shows only About, Zoho, Contact', tabs.join('|') === 'About|Zoho|Contact');
const homeText = await text();
say('front page names the platform in the first screen', /Zoho CRM/.test(homeText.slice(0, 400)));

/* ---- no status chips, placeholders or self-reference on public pages ---- */
const PUBLIC = ['', 'zoho', 'contact', 'about-demos', ...CASES.map(c => 'zoho/' + c)];
await go('zoho');
const ids = await p.evaluate(() => Object.keys(ALL));
PUBLIC.push(...ids.map(id => 'p/' + id));
const banned = [/\bPlanned\b/, /\bTODO\b/, /coming soon/i, /work in progress/i, /write-up pending/i, /not built yet/i,
  /Live demo/, /Emulated flow/, /\bthis site\b/i, /headless (checks|tests)/i, /Playwright/, /\b1,500\b/, /fifteen hundred/i,
  /10 modules/, /Thirty-five services/i, /2023\s*[—–-]\s*now/i, /\bpassionate\b/i, /\bseamless/i, /\bleverag/i, /cutting-edge/i, /rockstar/i, /Unnamed \(/];
let bannedHits = [];
for (const h of PUBLIC) {
  await go(h);
  const t = await text();
  for (const rx of banned) if (rx.test(t)) bannedHits.push('#/' + h + ' → ' + rx);
}
say('no status labels, placeholders or self-reference on ' + PUBLIC.length + ' public pages', bannedHits.length === 0);
if (bannedHits.length) console.log(bannedHits.slice(0, 20).join('\n'));

/* ---- every public item page opens and links back to its case ---- */
let noParent = [];
for (const id of ids) {
  await go('p/' + id);
  const back = await p.locator('a.back').first().getAttribute('href');
  if (!/^#\/zoho\//.test(back || '')) noParent.push(id);
}
say('every example and note belongs to a case', noParent.length === 0);
if (noParent.length) console.log(noParent.join(', '));

/* ---- contact ---- */
await go('contact');
const ct = await text();
say('contact page carries email, LinkedIn, CV and GitHub', /buriak\.kostiantyn@gmail\.com/.test(ct) && /linkedin/.test(ct) && (await p.locator('a[download]').count()) >= 1 && /github/.test(ct));

/* ---- browser history ---- */
await go('');
await go('zoho');
await go('zoho/widgets');
await p.goBack(); await p.waitForTimeout(300);
say('back returns to the Zoho page', (await hash()) === '#/zoho');
await p.goForward(); await p.waitForTimeout(300);
say('forward returns to the case', (await hash()) === '#/zoho/widgets');

say('no console errors at 1440 (' + errs.length + ')', errs.length === 0);
if (errs.length) console.log(errs.slice(0, 5).join('\n'));
await p.close();

/* ---- phone widths ---- */
for (const width of [390, 430]) {
  const m = await b.newPage({ viewport: { width, height: 900 } });
  const merrs = [];
  m.on('pageerror', e => merrs.push('pageerror: ' + e.message));
  m.on('console', x => { if (x.type() === 'error' && !/ERR_TUNNEL|fonts.googleapis/.test(x.text())) merrs.push(x.text()); });
  for (const h of ['', 'zoho', 'contact', 'zoho/widgets', 'zoho/orchestration', 'zoho/teams-crm', 'p/cross-system', 'p/org-tooling', 'p/chat-tracker', 'p/event']) {
    await m.goto(U + '#/' + h); await m.waitForTimeout(500);
    const sw = await m.evaluate(() => document.documentElement.scrollWidth);
    say(width + 'px #/' + h + ': no horizontal page scroll (' + sw + ')', sw <= width + 1);
  }
  await m.goto(U + '#/'); await m.waitForTimeout(300);
  const topH = await m.evaluate(() => document.querySelector('.top').getBoundingClientRect().height);
  say(width + 'px: header stays on one line (' + Math.round(topH) + 'px)', topH < 70);
  say(width + 'px: no console errors (' + merrs.length + ')', merrs.length === 0);
  if (merrs.length) console.log(merrs.slice(0, 5).join('\n'));
  await m.close();
}

await b.close();
if (failed) { console.log('\n' + failed + ' failing check(s) above'); process.exitCode = 1; }
