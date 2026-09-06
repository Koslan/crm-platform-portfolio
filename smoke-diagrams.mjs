import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const U = 'file://' + process.cwd() + '/dist/index.html';

let failed = 0;
const say = (n, c) => { console.log((c ? '  ok  ' : 'FAIL  ') + n); if (!c) failed++; };

/* Every diagram on the site, addressed as (page, index-on-that-page). Two
   write-ups no longer have routes of their own: the teams-recap and teams-sync
   diagrams moved onto the live demos they illustrate (chat-recap, chat-tracker),
   and the eight integration write-ups merged into cross-system, which is why
   that page carries two — an ownership matrix and a funnel. For every diagram:
   node/edge count sanity, a click that fills .dg-detail, a non-empty svg
   aria-label, and zero console errors — at least four checks each, per the
   brief's Definition of Done. */
const PAGES = [
  { id: 'chat-recap',   kind: 'chain',     minNodes: 7 },
  { id: 'chat-tracker', kind: 'chain',     minNodes: 6 },
  { id: 'org-tooling',  kind: 'authority', minCells: 10 },
  { id: 'cross-system', kind: 'authority', minCells: 24, dg: 0 },
  { id: 'cross-system', kind: 'funnel',    minBuckets: 6, dg: 1 },
  { id: 'zoho/orchestration',        kind: 'layers', minNodes: 20 },
  { id: 'zoho/teams-crm',            kind: 'layers', minNodes: 14 },
  { id: 'zoho/platform-engineering', kind: 'chain',  minNodes: 8 },
];
/* a bare id is an item page; a slash means a case study */
const url = id => U + (id.indexOf('/') >= 0 ? '#/' : '#/p/') + id;
const label = p => p.id + (p.dg != null ? ' [' + p.kind + ']' : '');

for (const page of PAGES) {
  const at = page.dg || 0;
  const p = await b.newPage({ viewport: { width: 1500, height: 1050 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });

  await p.goto(url(page.id));
  await p.waitForSelector('.dg', { timeout: 8000 });
  await p.waitForTimeout(200);
  const fig = p.locator('.dg').nth(at);

  const nodeCount = await fig.locator('[data-dgid]').count();
  if (page.kind === 'chain') {
    say(label(page) + ': step nodes drawn (' + nodeCount + ')', nodeCount >= page.minNodes);
    say(label(page) + ': at least one failure diamond', (await fig.locator('.dgfail').count()) >= 1);
  } else if (page.kind === 'layers') {
    say(label(page) + ': layer nodes drawn (' + nodeCount + ')', nodeCount >= page.minNodes);
    say(label(page) + ': bands drawn', (await fig.locator('.dgl-row').count()) >= 4);
  } else if (page.kind === 'authority') {
    say(label(page) + ': matrix cells drawn (' + nodeCount + ')', nodeCount >= page.minCells);
    const ruleText = (await fig.locator('.dg-rule').count()) ? (await fig.locator('.dg-rule').textContent()).trim() : '';
    say(label(page) + ': rule line printed', ruleText.length > 0);
  } else if (page.kind === 'funnel') {
    const bucketCount = await fig.locator('.dgbucket').count();
    say(label(page) + ': buckets drawn (' + bucketCount + ')', bucketCount >= page.minBuckets);
    say(label(page) + ': rule nodes drawn', (await fig.locator('.dgrule').count()) >= 1);
  }

  // an accessible label: on the svg for the SVG archetypes, on the figure for the HTML ones
  const ariaLabel = (await fig.locator('svg[aria-label]').count())
    ? await fig.locator('svg[aria-label]').first().getAttribute('aria-label')
    : await fig.getAttribute('aria-label');
  say(label(page) + ': aria-label present', !!(ariaLabel && ariaLabel.trim().length > 0));

  // clicking a node fills .dg-detail with non-empty text. Not every node has
  // curated detail copy (e.g. a bare "never" matrix cell) — pick one that
  // does, by reading the spec's own detail map straight from the DOM.
  const before = (await fig.locator('.dg-detail').textContent()).trim();
  say(label(page) + ': detail panel non-empty on load', before.length > 0);
  const detailId = await p.evaluate((i) => {
    const f = document.querySelectorAll('.dg')[i];
    const spec = JSON.parse(f.dataset.dgSpec);
    const keys = Object.keys(spec.detail || {});
    return keys.find(k => f.querySelector('[data-dgid="' + k.replace(/"/g, '\\"') + '"]')) || null;
  }, at);
  if (detailId) {
    await fig.locator('[data-dgid="' + detailId + '"]').first().click();
    await p.waitForTimeout(100);
  }
  const afterClick = (await fig.locator('.dg-detail').textContent()).trim();
  say(label(page) + ': click fills detail panel', !!detailId && afterClick.length > 0);

  // keyboard: Tab-reachable, Enter activates
  await fig.locator('[data-dgid]').first().focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(100);
  const afterEnter = (await fig.locator('.dg-detail').textContent()).trim();
  say(label(page) + ': keyboard Enter activates a node', afterEnter.length > 0);

  // no console errors
  say(label(page) + ': no console errors (' + errs.length + ')', errs.length === 0);
  if (errs.length) console.log(errs.slice(0, 4).join('\n'));

  await p.close();
}

/* Responsive pass: 1500 / 1000 / 390. A chain wraps its step cards onto
   further lines when the container is narrow; nothing may push the page body
   into horizontal scroll at any width, on any archetype. */
for (const width of [1500, 1000, 390]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  for (const page of PAGES) {
    const at = page.dg || 0;
    await p.goto(url(page.id));
    await p.waitForSelector('.dg', { timeout: 8000 });
    await p.waitForTimeout(150);
    const bodyScrollW = await p.evaluate(() => document.body.scrollWidth);
    const winW = await p.evaluate(() => window.innerWidth);
    say(width + 'px ' + label(page) + ': no page-body horizontal scroll', bodyScrollW <= winW + 4);
    if (page.kind === 'chain') {
      // every step card must be fully inside its figure, whatever the width
      const inside = await p.evaluate((i) => {
        const f = document.querySelectorAll('.dg')[i]; const r0 = f.getBoundingClientRect();
        return [...f.querySelectorAll('.dgc-step')].every(el => { const r = el.getBoundingClientRect(); return r.left >= r0.left - 1 && r.right <= r0.right + 1; });
      }, at);
      say(width + 'px ' + label(page) + ': every step card stays inside the figure', inside);
    }
  }
  await p.close();
}

await b.close();
if (failed) { console.log('\n' + failed + ' failing check(s) above'); process.exitCode = 1; }
