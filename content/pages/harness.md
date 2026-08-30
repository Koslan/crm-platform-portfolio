---
page: "harness"
title: "The test harness this site grew from"
type: "write-up (CASES → vCase)"
tab: "fullstack"
group: "Full-stack"
route: "#/p/harness"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · FS_ITEMS · id=\"harness\""
  body_case: "src/app.html · CASES['Full-stack'][0]"
---

# The test harness this site grew from

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Playwright, 240 headless checks, failing on any console error.
>
> **Подзаголовок страницы** (`sub`):
> A widget only runs inside the CRM, and deploying to production to see if a change works is not verification.

## The constraint

Every widget on this site is an iframe the platform loads, initialised through an SDK it controls. There is no offline mode, no local server that behaves like the platform, and no sanctioned way to run a widget without a live org in front of it — so the only feedback loop on offer was pushing to production and watching.

## What was built

A stand: stubbed SDK primitives plus a headless browser, so every widget on this site runs the same code it would run inside the CRM, against a generated dataset, with nothing live behind it. Checks spread across many files cover routing, the record pages, both booking wizards and the chat flow. The suite fails on any console error, not only a failed assertion — a widget that quietly logs and carries on is still a bug. `test/browser.mjs` locates Playwright wherever it happens to live, a local devDependency or a global CI install, so the same test files run unmodified in both places.

## The trade

The stand reproduces the surface of the SDK, not the platform underneath it. Anything a widget does through an undocumented call, a quirk of the real iframe host, or a platform-side limit this stand does not model will pass here and still need a first run against a real org — this catches regressions in what is already understood, not everything the platform can do.
