import { chromium, launchOpts } from './test/browser.mjs';
const b = await chromium.launch({ ...launchOpts });
const U = 'file://' + process.cwd() + '/dist/index.html';

let failed = 0;
const say = (n, c) => { console.log((c ? '  ok  ' : 'FAIL  ') + n); if (!c) failed++; };

/* Pages carrying exactly one diagram spec. teams-recap and teams-sync no
   longer have standalone write-up routes — their diagrams now live on the
   live demo pages they illustrate (chat-recap, chat-tracker). For every
   page: node/edge count sanity, a click that fills .dg-detail, a non-empty
   svg aria-label, and zero console errors — at least four checks each,
   per the brief's Definition of Done. */
const PAGES = [
  { id: 'chat-recap',  kind: 'chain', minNodes: 7 },
  { id: 'authority',   kind: 'authority', minCells: 24 },
  { id: 'org-tooling', kind: 'authority', minCells: 10 },
  { id: 'buckets',     kind: 'funnel', minBuckets: 6 },
  { id: 'chat-tracker', kind: 'chain', minNodes: 6 },
];

for (const page of PAGES) {
  const p = await b.newPage({ viewport: { width: 1500, height: 1050 } });
  const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts.googleapis/.test(m.text())) errs.push(m.text()); });

  await p.goto(U + '#/p/' + page.id);
  await p.waitForSelector('.dg', { timeout: 8000 });
  await p.waitForTimeout(200);

  const nodeCount = await p.locator('.dg [data-dgid]').count();
  if (page.kind === 'chain') {
    say(page.id + ': step nodes drawn (' + nodeCount + ')', nodeCount >= page.minNodes);
    say(page.id + ': at least one failure diamond', (await p.locator('.dg .dgfail').count()) >= 1);
  } else if (page.kind === 'authority') {
    say(page.id + ': matrix cells drawn (' + nodeCount + ')', nodeCount >= page.minCells);
    const ruleText = (await p.locator('.dg .dg-rule').count()) ? (await p.locator('.dg .dg-rule').textContent()).trim() : '';
    say(page.id + ': rule line printed', ruleText.length > 0);
  } else if (page.kind === 'funnel') {
    const bucketCount = await p.locator('.dg .dgbucket').count();
    say(page.id + ': buckets drawn (' + bucketCount + ')', bucketCount >= page.minBuckets);
    say(page.id + ': rule nodes drawn', (await p.locator('.dg .dgrule').count()) >= 1);
  }

  // aria-label on the svg is non-empty
  const ariaLabel = await p.locator('.dg svg').getAttribute('aria-label');
  say(page.id + ': svg aria-label present', !!(ariaLabel && ariaLabel.trim().length > 0));

  // clicking a node fills .dg-detail with non-empty text. Not every node has
  // curated detail copy (e.g. a bare "never" matrix cell) — pick one that
  // does, by reading the spec's own detail map straight from the DOM.
  const before = (await p.locator('.dg-detail').textContent()).trim();
  say(page.id + ': detail panel non-empty on load', before.length > 0);
  const detailId = await p.evaluate(() => {
    const fig = document.querySelector('.dg');
    const spec = JSON.parse(fig.dataset.dgSpec);
    const keys = Object.keys(spec.detail || {});
    return keys.find(k => fig.querySelector('[data-dgid="' + k.replace(/"/g, '\\"') + '"]')) || null;
  });
  if (detailId) {
    await p.locator('.dg [data-dgid="' + detailId + '"]').first().click();
    await p.waitForTimeout(100);
  }
  const afterClick = (await p.locator('.dg-detail').textContent()).trim();
  say(page.id + ': click fills detail panel', !!detailId && afterClick.length > 0);

  // keyboard: Tab-reachable, Enter activates
  const firstNode = p.locator('.dg [data-dgid]').first();
  await firstNode.focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(100);
  const afterEnter = (await p.locator('.dg-detail').textContent()).trim();
  say(page.id + ': keyboard Enter activates a node', afterEnter.length > 0);

  // no console errors
  say(page.id + ': no console errors (' + errs.length + ')', errs.length === 0);
  if (errs.length) console.log(errs.slice(0, 4).join('\n'));

  await p.close();
}

/* Responsive pass: 1500 / 1000 / 390. Chain diagrams must go vertical
   under 700px; nothing may push the page body into horizontal scroll
   at any width, on any archetype. */
for (const width of [1500, 1000, 390]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  for (const page of PAGES) {
    await p.goto(U + '#/p/' + page.id);
    await p.waitForSelector('.dg', { timeout: 8000 });
    await p.waitForTimeout(150);
    const bodyScrollW = await p.evaluate(() => document.body.scrollWidth);
    const winW = await p.evaluate(() => window.innerWidth);
    say(width + 'px ' + page.id + ': no page-body horizontal scroll', bodyScrollW <= winW + 4);
    if (page.kind === 'chain') {
      const vertical = await p.locator('.dg').getAttribute('data-dg-vertical');
      const expected = width < 700 ? '1' : '0';
      say(width + 'px ' + page.id + ': vertical layout ' + (width < 700 ? 'on' : 'off'), vertical === expected);
    }
  }
  await p.close();
}

await b.close();
if (failed) { console.log('\n' + failed + ' failing check(s) above'); process.exitCode = 1; }
