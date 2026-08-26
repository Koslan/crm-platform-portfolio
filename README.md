# Portfolio site

Static, no backend. Everything runs in the browser against a generated dataset.

    node data/generate.mjs   # deterministic dataset -> data/dataset.json + dataset.slim.json
    node build.mjs           # src/app.html + emulator + slim dataset -> dist/index.html
    node smoke.mjs           # headless checks (needs playwright)

| Path | What it is |
|---|---|
| `data/generate.mjs` | Seeded generator. Same seed, same dataset, reviewable diffs. |
| `data/dataset.json` | Full dataset — for the hosted build. |
| `data/dataset.slim.json` | Trimmed copy — for the single-file publish. |
| `platform/mockZoho.js` | Stand-in for the CRM SDK: COQL subset, 200-record ceiling, lookup hydration, write validation, failure switch. |
| `src/app.html` | The site. Injection markers `/*__MOCKZOHO__*/` and `/*__DATASET__*/null`. |
| `dist/index.html` | Built single file. |
| `smoke.mjs` | Headless smoke test: routing, query console, paging ceiling, failure switch, console errors. |

## Adding a widget demo

1. Copy the widget's `app/` into `widgets/<name>/`.
2. Replace CDN tags with local copies in `vendor/`.
3. Add `<script src="../../platform/mockZoho.js"></script>` and a dataset load before the widget's own scripts.
4. Set the record context: `mockZoho.context({ EntityId: '<id>', Entity: '<Module>' })`.
5. Register any server-side function the widget calls with `mockZoho.registerFunction(name, fn)`.
6. Point the demo page's frame at `widgets/<name>/index.html`.

## Rules

- No employer data, endpoints, org identifiers, connection names or real people. Ever.
- Every record belongs to the invented company defined in `src/app.html` (`CO`).
- The failure switch is part of the product, not a debug tool: recovery paths are meant to be clicked.
