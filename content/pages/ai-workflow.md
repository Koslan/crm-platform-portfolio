---
page: "ai-workflow"
title: "AI-assisted engineering, honestly"
type: "write-up (CASES → vCase)"
tab: "ai"
group: "AI in the CRM"
route: "#/p/ai-workflow"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · AI_ITEMS · id=\"ai-workflow\""
  body_case: "src/app.html · CASES['AI in the CRM'][2]"
---

# AI-assisted engineering, honestly

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> How this site and its 240 tests are built and kept green — the gates, and what they cannot catch.
>
> **Подзаголовок страницы** (`sub`):
> How this site and its tests are built and kept green — the gates, and what they cannot catch.

## The constraint

Generation is not the bottleneck. A model writes a screen, a data module or a write-up in seconds; verifying that any of it is correct — that it matches the source it claims to replicate, that it did not silently break another surface, that no employer data leaked into a public repository — takes the rest of the time. The constraint on shipping fast with AI assistance is checking, not typing.

## What was built

Gates, not trust. Two hundred and six headless checks fail the build on any console error, not just a failed assertion — a widget that throws quietly is a widget that fails silently in front of a recruiter. CI runs a guard that scans for anything resembling a real org id, domain or key and refuses the build if it finds one, because a portfolio is exactly the surface a leaked credential would sit on unnoticed. The dataset generator is seeded, so the same run always produces the same data and a diff is reviewable instead of noise. And one rule holds across every pass: one surface at a time, and a written specification of the discrepancies goes up for agreement before anything is touched — this file is the current example.

## The trade

Gates catch form, not meaning. A console-clean, leak-free build that faithfully reproduces the wrong behaviour still passes every check here. Fidelity to the original — the actual point of a replica site — is held by a text map and by discipline in following it, not by a machine. Saying "I use AI to build" describes nothing on its own; the gates are what would have to be described, and most people who say it are not asked to.
