# CRM portfolio site

CRM widgets running **outside** the CRM, against a generated dataset, in a static page.
No backend, no live org, no client data.

Live pages: an event campaign record with three widgets and a booking wizard, a programme
solution matrix, contact enrichment on an account, deal conversations, a chat-to-CRM recap
flow, and a platform emulator you can type queries into.

---

## Run it

```bash
npm install
npx playwright install chromium     # only needed for the tests
npm run build                       # dataset -> emulator -> dist/index.html
npm run serve                       # http://localhost:8080
npm test                            # 162 headless checks
```

`npm run verify` does build + test in one go — the same thing CI runs.

## Layout

| Path | What it is |
|---|---|
| `data/generate.mjs` | Seeded generator. Same seed, same dataset, reviewable diffs. Fails the build if the trimmed copy ends up with a dangling reference. |
| `data/dataset.json` | Full dataset. |
| `data/dataset.slim.json` | Trimmed, referentially whole copy, inlined into the single-file build. |
| `platform/mockZoho.js` | Stand-in for the CRM SDK: a COQL subset, the 200-record ceiling, lookup hydration, write validation, a failure switch. |
| `src/app.html` | Site shell, navigation, write-ups. Injection markers are replaced at build time. |
| `src/event-page.js` | Event campaign record: Overview, Contacts, Meetings, and the booking wizard. |
| `src/pages.js` | Solution map, contact enrichment, deal conversations. |
| `src/teams.js` | Emulated chat client and the two-card recap flow. |
| `src/board.js` | Room schedule with lane layout, and the mobile meeting board with its on-screen console. |
| `src/widgets2.js` | Calendar reconciliation, account snapshot, development plan, employment history. |
| `src/orghealth.js` | Org health report — function reachability, connections, rules, dependency graph. |
| `src/widgets3.js` | Account hierarchy tree and the sales cockpit. |
| `src/apollo.js` | Event coverage matrix and the three enrichment-provider surfaces. |
| `build.mjs` | Inlines the emulator, the dataset and the page modules into `dist/index.html`. |
| `smoke*.mjs` | Headless checks. `test/browser.mjs` finds playwright wherever it is installed. |

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
3. **Behaviour** — 162 headless checks across routing, the query console, the record pages, the
   wizard and the chat flow, failing on any console error.

## Adding a widget

1. Put the widget's `app/` under `widgets/<name>/`, replacing CDN tags with local copies.
2. Load `platform/mockZoho.js` and the dataset before the widget's own scripts.
3. Set the record context: `mockZoho.context({ EntityId:'<id>', Entity:'<Module>' })`.
4. Register whatever server-side functions it calls: `mockZoho.registerFunction(name, fn)`.
5. Point a page at `widgets/<name>/index.html` in a frame — the platform loads widgets in one
   too, so this is faithful as well as convenient.

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
