---
page: "generator"
title: "Repeatable test data that still behaves like a real CRM"
type: "write-up (CASES → vCase)"
tab: "fullstack"
group: "Full-stack"
route: "#/p/generator"
kind: "note"
public: false
diagrams: 0
source:
  nav: "src/app.html · FS_ITEMS · id=\"generator\""
  body_case: "src/app.html · CASES['Full-stack'][1]"
---

# Repeatable test data that still behaves like a real CRM

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> The same seed produces the same records; deliberate defects keep the demos honest.
>
> **Material labels** (`MAT`, публично не рендерятся): Architecture write-up
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> Random data makes every review noisy, while perfectly clean data removes the cases CRM software must survive. The generator solves both: a fixed seed makes every diff reproducible, and explicit defect injection creates missing emails, conflicting meetings and duplicate-looking identities on purpose.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> Random data makes every diff noisy; clean data makes the demo dishonest, because a real CRM is never this tidy.

## The constraint

A dataset regenerated differently on every run turns every code review into a diff against noise — nobody can tell whether a changed number is a bug or a new random seed. But a dataset scrubbed clean of the mess real CRMs accumulate would misrepresent the actual job: contacts with no email, meetings that drift out of sync with the calendar, and duplicate-looking records are not edge cases, they are Tuesday.

## What was built

A seeded generator: the same seed produces the same dataset every time, so a pull request changes exactly what it says it changes and nothing else. On top of that, defects are injected on purpose rather than accidental — contacts missing an email address, meetings whose stored time has drifted from what the calendar would say — because the widgets that handle those cases need something to handle. A trimmed copy, `dataset.slim.json`, ships with the build, alongside a referential-integrity check that fails outright if the trimming leaves a dangling reference behind.

## The trade

The trimmed dataset still runs to 1.13 MB inlined directly into the page. That is the cost of having no backend: every record the demos touch has to already be sitting in the browser before the first click.
