---
page: "team-intelligence"
title: "Recurring team intelligence, delivered automatically"
type: "write-up (CASES → vCase)"
tab: "ai"
group: "AI as a business solution"
route: "#/p/team-intelligence"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · AI_GROUPS · id=\"team-intelligence\""
  body_case: "src/app.html · CASES['Written up from the platform work'][3]"
---

# Recurring team intelligence, delivered automatically

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> AI-generated reports and management summaries with deterministic scheduling and delivery controls.
>
> **Material labels** (`MAT`): Architecture write-up
>
> **`sub` — НЕ рендерится, см. LEAD:**
> AI-generated reports and management summaries with deterministic scheduling and delivery controls.

## A report nobody has time to assemble

A sales lead needs a regular picture of what moved, what stalled and what now needs a decision. Assembled by hand it costs the most expensive hour of the week and gets dropped whenever the week is busy — which is reliably the week it mattered. Handed naively to a model, it produces confident prose over whatever data happened to be reachable, which is worse, because it reads exactly like the version that was checked.

## Deterministic evidence, bounded interpretation

So the evidence is assembled by deterministic code: the period selected, the records pulled, access and data-quality rules applied, and the package built before a model is involved at all. The model then receives one bounded task over a governed input — turn this into the narrative the team reads — and nothing else. Scheduling, delivery, staleness detection and failure reporting all stay outside it, because none of them get better when they are guessed.

## Delivery, and the failure that has to be visible

The output names its period and its sources, separates what is missing from what is interpreted, and keeps links back to the records behind each claim, so a reader who disbelieves a sentence can reach the deal it came from. When generation fails or the evidence is incomplete, that becomes a visible state rather than a shorter report that still looks finished — a report which silently narrows its own scope is the dangerous one, because it is still trusted. The same machinery points at individuals as well as teams: the reminders that keep records moving, delivered where people already work rather than into an inbox nobody opens.

## The trade

A generated narrative is easier to read and harder to compare than a table. So the structured metrics stay structured and remain the source of truth; the narrative explains them and never replaces the fields underneath. The risk this design exists to hold off is a team that gradually starts reporting on the prose instead of the numbers, and it is held off by keeping the numbers visibly in charge rather than by trusting anybody to remember.
