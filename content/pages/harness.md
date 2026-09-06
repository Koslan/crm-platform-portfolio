---
page: "harness"
title: "Running CRM interfaces before they reach the CRM"
type: "write-up (CASES → vCase)"
tab: "fullstack"
group: "Full-stack"
route: "#/p/harness"
kind: "note"
public: false
diagrams: 0
source:
  nav: "src/app.html · FS_ITEMS · id=\"harness\""
  body_case: "src/app.html · CASES['Full-stack'][0]"
---

# Running CRM interfaces before they reach the CRM

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> An offline SDK surface and 279 browser checks, failing on any console error.
>
> **Material labels** (`MAT`, публично не рендерятся): Architecture write-up
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> A widget normally runs only inside a live CRM and the SDK it controls. I built an offline test harness around the subset the widget estate actually uses: lifecycle, record APIs, queries, function calls, connection calls, validation and failure envelopes. Production-derived interfaces can now be exercised before deployment, against repeatable data and deliberate failures.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> A widget only runs inside the CRM, and deploying to production to see if a change works is not verification.

## The constraint

Every widget on this site is an iframe the platform loads, initialised through an SDK it controls. There is no offline mode, no local server that behaves like the platform, and no sanctioned way to run a widget without a live org in front of it — so the only feedback loop on offer was pushing to production and watching.

## What was built

An offline test harness: stubbed SDK primitives plus a headless browser, so every widget on this site runs the same code it would run inside the CRM, against a generated dataset, with nothing live behind it. Checks spread across many files cover routing, the record pages, both booking wizards and the chat flow. The suite fails on any console error, not only a failed assertion — a widget that quietly logs and carries on is still a bug. `test/browser.mjs` locates Playwright wherever it happens to live, a local devDependency or a global CI install, so the same test files run unmodified in both places.

## The trade

The stand reproduces the surface of the SDK, not the platform underneath it. Anything a widget does through an undocumented call, a quirk of the real iframe host, or a platform-side limit this stand does not model will pass here and still need a first run against a real org — this catches regressions in what is already understood, not everything the platform can do.
