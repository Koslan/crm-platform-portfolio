---
page: "loss-analysis"
title: "From six evidence sources to one governed loss reason"
type: "write-up (CASES → vCase)"
tab: "ai"
group: "AI as a business solution"
route: "#/p/loss-analysis"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · AI_GROUPS · id=\"loss-analysis\""
  body_case: "src/app.html · CASES['AI in the CRM'][0]"
---

# From six evidence sources to one governed loss reason

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> A two-stage classification pipeline with a human-correctable intermediate record.
>
> **Material labels** (`MAT`): Architecture write-up · Contributed design
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> A free-text explanation cannot be compared across deals. This design gathers evidence from six sources, materialises a human-correctable intermediate record, then asks the model to place the case inside the company’s own taxonomy. Evidence collection and classification are deliberately separated, so a correction does not require repeating the whole pipeline.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> A free-text answer is useless for reporting. It has to land in the company’s own categories.

> **My role on this one:** Prototyped the direction and contributed to the design; another engineer implemented and owned it.

## The constraint

The evidence is spread across the CRM, the issue tracker and analytics; the function time limit does not allow gathering it and reasoning about it in one call; and an unconstrained answer cannot be compared between deals.

## What was built

Roughly ten times more code gathering evidence than calling the model. Six sources, plus derived behavioural signals that exist nowhere as fields — how many times the start date moved, which stage the deal stalled in, whether this client had ever been won before. Tracker comments are filtered by author so the model reads the outside voice, not the CRM’s own echo. Then two stages: the first is explicitly forbidden to analyse and must list the holes in the data; its output is materialised as a record; the second reads that and does one thing — place the case in a seven-kilobyte taxonomy of thirty-eight causes with rules for choosing between them. A human can correct the middle and re-run only the second stage.

## The trade, said out loud

No structured output anywhere: the answer is parsed by markdown anchors and substring checks. Stop reasons are not inspected, so a truncated answer is indistinguishable from a complete one. And the category is never written to a structured field — the assignment is commented out — so the very reporting the pipeline exists for cannot be built. A schema, validation against the taxonomy, and a picklist field are the obvious repairs.
