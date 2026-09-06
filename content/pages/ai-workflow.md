---
page: "ai-workflow"
title: "How AI-assisted delivery is verified"
type: "write-up (CASES → vCase)"
tab: "ai"
group: "AI in engineering"
route: "#/p/ai-workflow"
kind: "note"
public: false
diagrams: 0
source:
  nav: "src/app.html · AI_GROUPS · id=\"ai-workflow\""
  body_case: "src/app.html · CASES['AI in the CRM'][2]"
---

# How AI-assisted delivery is verified

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Generated work passes source review, behavioural tests, leak guards and controlled promotion before production.
>
> **Material labels** (`MAT`, публично не рендерятся): Architecture write-up
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> AI is used throughout delivery: designing new functions and interfaces, generating Deluge, JavaScript and Python, reviewing existing code, expanding tests, identifying regression risk, analysing dependencies and maintaining documentation. The extracted org provides the context; Git review, controlled deployment and automated checks provide the acceptance boundary.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> AI designs, generates and reviews across the org; source review, controlled deployment and automated checks decide what ships.

## Generation is not the bottleneck; verification is

A model writes a Deluge function, a widget screen or a migration script in seconds. Establishing that any of it is correct — that it does what the ticket meant, that it did not quietly break one of the other things calling it, that it respects a platform limit nobody wrote down — takes the rest of the time. That ratio is the whole shape of the workflow. Everything below exists because typing was never the expensive part, and treating generated code as finished because it was fast is the specific mistake this is built to prevent.

## What AI actually does across the org

It is used throughout delivery rather than at one step: designing new functions and interfaces before they are written, generating Deluge, JavaScript and Python, reviewing code that already exists, expanding test coverage, identifying which changes carry regression risk, analysing dependencies across the function estate, and keeping documentation level with what shipped. What makes that possible is not the model — it is that the org exists as text first. Against a browser editor showing one function at a time there is no context to reason with; against an extracted estate with a dependency index, the question “what else calls this” has an answer, and a review is about the system rather than the snippet on screen.

## The acceptance boundary

None of that output ships because it looks right. A change goes through source review the same way any change would, and the reviewer is a person who remains accountable for it afterwards — AI-assisted authorship does not move ownership. Deployment runs through the tooling rather than the browser editor, and a save is only accepted when an independent read returns what was meant to be written. Behavioural checks run before promotion, and a failure stays attached to the change that caused it. The boundary is deliberately boring: it is the same boundary a team without AI would need, and the only thing AI changes is how much work arrives at it.

## The same gates, turned on this site

This portfolio is one instance of that workflow rather than the subject of it, and it is the instance that can be shown. 279 headless checks fail the build on any console error rather than only on a failed assertion, because a widget that throws quietly is a widget that fails silently in front of a reader. The build refuses to write a page whose inline scripts do not parse. A CI guard scans for anything shaped like a real org identifier, host, domain or credential and stops the build if it finds one, since a public portfolio is exactly the surface on which a leaked credential would sit unnoticed. The dataset generator is seeded, so a diff is reviewable rather than noise. And one rule holds across every pass: one surface at a time, with the discrepancies written down and agreed before anything is touched.

## What the gates cannot catch

They catch form, not meaning. A console-clean, leak-free build that faithfully reproduces the wrong behaviour passes every check here, and the same is true in the org: a function can be reviewed, deployed, verified by read-back and still encode a rule the business never asked for. Fidelity to intent is held by the person who owns the change, not by the machinery around it. Saying “I use AI to build” describes nothing on its own; the gates are the part worth describing, and the honest version of the claim is that they move the risk from typing errors to reasoning errors rather than removing it.
