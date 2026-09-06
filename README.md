# CRM portfolio site

A portfolio of Zoho CRM platform and integration engineering: seven case studies from one
production platform, with the production interfaces and flows reproduced in a static page
against a generated dataset. No backend, no live org, no client data.

Public sections: **About** (profile, capabilities, experience), **Zoho** (overview, architecture,
case studies, interactive examples, technical notes) and **Contact**. Every case study has a stable
address — `#/zoho/widgets`, `#/zoho/orchestration`, `#/zoho/teams-crm`, `#/zoho/jira-sync`,
`#/zoho/enrichment`, `#/zoho/platform-engineering`, `#/zoho/reconciliation` — so a proposal can
link straight to the relevant one.

The Salesforce, AI and full-stack sections still exist in the sources but are switched off in the
public build (see *Sections* below).

---

## Run it

```bash
npm install
npx playwright install chromium     # only needed for the tests
npm run build                       # dataset -> emulator -> dist/index.html
npm run serve                       # http://localhost:8080
npm test                            # headless checks against dist/
```

`npm run verify` does everything CI does: the public build and its tests, then the all-sections
build (`dist-all/`) and the tests of the hidden sections.

## Sections

`src/app.html` opens with one switch:

```js
const PUBLIC_SECTIONS = { about:true, zoho:true, contact:true, ai:false, salesforce:false, fullstack:false };
```

A section that is off has no tab, registers no items, and its routes resolve to the front page —
an old hash does not reach it. `build.mjs` rewrites the object: `node build.mjs` (public) keeps the
line above; `node build.mjs --all` turns every section on and writes `dist-all/`, which is what
`npm run test:hidden` exercises so the switched-off code keeps working. Two smaller switches sit
next to it: `PUBLIC_HIDDEN_ITEMS` hides individual page ids the same way (empty at the moment), and
items marked `kind:'plan'` are only listed when the AI and full-stack sections are both on, so the
public build shows nothing that is not built. The one AI page the Zoho work depends on — the
meeting recap — is registered under Zoho when the AI section is off.

## Layout

| Path | What it is |
|---|---|
| `data/generate.mjs` | Seeded generator. Same seed, same dataset, reviewable diffs. Fails the build if the trimmed copy ends up with a dangling reference. |
| `data/dataset.json` | Full dataset. |
| `data/dataset.slim.json` | Trimmed, referentially whole copy, inlined into the single-file build. |
| `platform/mockZoho.js` | Stand-in for the CRM SDK: a COQL subset, the 200-record ceiling, lookup hydration, write validation, a failure switch. |
| `src/app.html` | Site shell, navigation, the About and Contact pages, the item pages, the technical notes (`CASES`) and the skill stories. Injection markers are replaced at build time. |
| `src/cases.js` | The public Zoho content: the overview, the platform architecture diagram and the seven case studies with their diagrams. Data only. |
| `src/diagrams.js` | Diagram engine: `chain` and `layers` (HTML, wrap on narrow screens), `authority`, `states`, `funnel`, `coverage` (SVG). A spec object describes the picture; a click on a node fills the detail panel. |
| `src/event-page.js` | Event campaign record: Overview, Contacts, Meetings, and the booking wizard. |
| `src/pages.js` | Solution map, contact enrichment, deal conversations. |
| `src/teams.js` | Emulated chat client, the two-card recap flow and the chat-to-tracker flow. |
| `src/board.js` | Room schedule with lane layout, and the mobile meeting board with its own "Add meeting" wizard and on-screen console. |
| `src/widgets2.js` | Calendar reconciliation, account snapshot, development plan, employment history. |
| `src/orghealth.js` | Org health report — function reachability, connections, rules, dependency graph. |
| `src/widgets3.js` | Account hierarchy tree and the sales cockpit. |
| `src/apollo.js` | Event coverage matrix and the three enrichment-provider surfaces. |
| `src/aijournal.js`, `src/sflwc.js`, `platform/mockSF.js`, `salesforce/` | The AI and Salesforce sections — built, tested, switched off in public. |
| `build.mjs` | Inlines the emulator, the dataset and the page modules into `dist/index.html` (or `dist-all/` with `--all`), and parses every inline script so a syntax error fails the build rather than the page. |
| `smoke*.mjs` | Headless checks; `test/browser.mjs` finds playwright wherever it is installed. `smoke-public.mjs` covers the public structure: case pages, aliases, hidden routes, banned strings, phone widths. `smoke-responsive.mjs` walks every route at three widths. `smoke-ai.mjs` and `smoke-sf.mjs` run against `dist-all/`. |
| `tools/shots.mjs` | Screenshot helper for visual QA at any viewport: `node tools/shots.mjs out 1440x900 zoho zoho/widgets:full`. |
| `tools/og.mjs` | Regenerates the social preview image. |
| `content/` | One-way markdown export of the page texts and diagram specs, for editing prose without opening the sources (`content/INDEX.md`). Written before the public rework; the exporter does not yet know about `src/cases.js`. |
| `prompts/`, `docs/fidelity-map.md` | The fidelity-pass prompt and its lookup table (see below). |
| `docs/portfolio-rework-summary.md` | What the public rework changed, what is hidden, the direct URLs. |

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds, runs three guards and
publishes `dist/` to GitHub Pages.

One-time setup in the repository: **Settings → Pages → Source: GitHub Actions**. Nothing else —
no tokens, no secrets, no environment variables.

The guards exist because this is a portfolio, and a portfolio that leaks is worse than no portfolio:

1. **Referential integrity** — a row pointing at a record that did not make the trimmed copy
   renders as a blank cell, which reads as a bug in the widget rather than a bug in the fixture.
2. **Identifier scan** — the build fails if anything resembling a real org id, host, corporate
   domain or API key appears in the sources.
3. **Behaviour** — the headless suite across routing, the record pages, both booking wizards, the
   chat flows, the diagrams and the public structure, failing on any console error.

## Adding a widget

1. Put the widget's `app/` under `widgets/<name>/`, replacing CDN tags with local copies.
2. Load `platform/mockZoho.js` and the dataset before the widget's own scripts.
3. Set the record context: `mockZoho.context({ EntityId:'<id>', Entity:'<Module>' })`.
4. Register whatever server-side functions it calls: `mockZoho.registerFunction(name, fn)`.
5. Point a page at `widgets/<name>/index.html` in a frame — the platform loads widgets in one
   too, so this is faithful as well as convenient.

## Adding a case study

A case is one object in `src/cases.js`: summary (what / scale / role / topics), key facts, context,
constraints, an architecture diagram spec, implementation sections, a failure-handling table,
responsibility, result, the examples and notes it owns, and optionally the id of an example to
embed (`embed`, with `embedTab` for a tabbed record). The page furniture in `src/app.html`
(`vCaseStudy`) draws it; `DEMO_PARENT` says which case an example belongs to first.

## Bringing a surface closer to its original

The replicas were built from descriptions of the widgets, not from their code, so some read as
*similar* rather than *the same*. `prompts/fidelity-pass.md` is a reusable prompt that fixes one
surface at a time: read the original, write down every difference in labels, order, states and
behaviour, agree what to take, then edit only that surface's file and re-run the suite.
`docs/fidelity-map.md` is the lookup it depends on, and the scrubbing rules live at its foot —
form and behaviour come across from the original, content never does.

## House rules

- No employer data, endpoints, org identifiers, connection names or real people. Ever.
- Every record belongs to the invented company defined in `src/app.html` (`CO`).
- The failure switch is part of the product, not a debug tool: recovery paths are meant to be
  clicked, not described.
- If a screen cannot honestly do something — send a calendar invitation, for instance — it says
  so rather than pretending.
- Numbers on public pages are the confirmed ones or an order of magnitude; nothing about the
  site's own machinery (test counts, demo counts) is presented as an achievement.
