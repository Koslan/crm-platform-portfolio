---
page: "ci-guards"
title: "CI guards against leaks"
type: "write-up (CASES → vCase)"
tab: "fullstack"
group: "Full-stack"
route: "#/p/ci-guards"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · FS_ITEMS · id=\"ci-guards\""
  body_case: "src/app.html · CASES['Full-stack'][2]"
---

# CI guards against leaks

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> An identifier scan that fails the build if anything resembling a real org id or key appears.
>
> **Подзаголовок страницы** (`sub`):
> A portfolio that leaks a real employer’s data is worse than no portfolio at all.

## The constraint

Every surface on this site is a rebuild of something that first existed inside a real org, which means every source file is a place a real identifier, host or naming convention could slip back in — a copy-pasted comment, a variable name carried over out of habit, a fixture value nobody thought to change.

## What was built

Three guards run in `deploy.yml` before anything ships: a referential-integrity check over the generated dataset, an identifier scan across the source files for anything shaped like a real org id, host, corporate domain or credential, and the full behavioural test run. Any one of the three failing blocks the deploy.

## The trade

The identifier scan matches shape, not meaning — a pattern search, not a reviewer who understands what it is looking at. What counts as safe to say about the work versus what must never cross over is a written map and a discipline followed by hand, not something a regular expression can enforce on its own.
