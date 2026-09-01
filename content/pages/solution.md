---
page: "solution"
title: "A business map the standard CRM could not draw"
type: "live-demo (общий шаблон viewRecord)"
tab: "zoho"
group: "Org tooling, CI/CD, deployment and the external server"
route: "#/p/solution"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"solution\""
  body: "src/app.html · REC · id=\"solution\""
---

# A business map the standard CRM could not draw

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Service lines against business units, with live pipeline and opportunity creation in the same matrix.
>
> **Material labels** (`MAT`): Production-derived demo
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> A programme record becomes an account-planning surface: business units on one axis, service lines on the other, and the latest deal visible in every cell. Unworked potential stays visible alongside pipeline, and a new opportunity starts from the exact row and column where the gap was found.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> A programme record, and the matrix its account plan is read from: service lines against business units, coloured by the latest deal on each cell, with unworked pipeline surfaced in pale blue and a business unit's whole potential — not just what it has already won — totalled in its header.

## What to try

- Hover a cell that has a deal on it — the deals behind it float above, and the card stays up while your cursor is on it.
- Open the field guide from the header. The colour rule and the row order are documented in the product, not in a wiki nobody opens.
- Create an opportunity from a business-unit header — pick more than one service line, a primary contact and a stage, and watch Lost pull in its own loss-reason field. It is written through the emulator and the matrix redraws with it.

## Why it was not straightforward

### The decision this matrix supports

An account manager preparing a programme review has one question a list of deals cannot answer: where are we already selling into this client, and where have we sold nothing at all? Laid out as business units against service lines it is visible at a glance instead of assembled by hand — a cell coloured by the stage of its latest deal, a pale blue cell where budget exists that nobody has picked up, and an empty run across a row where a whole service line has never been offered to anybody. Each column header totals that business unit’s whole potential rather than what it has already won, so the conversation starts from the size of the opportunity instead of the size of the invoice. And because the gap is found in a specific cell, the opportunity is created from that cell: the business unit and the service line are already decided, and the only things left to fill in are the ones a person genuinely has to choose.

### Why the platform could not draw it

Nothing in the CRM produces a matrix; a report runs down a list, not across two axes. The grid, the stage colouring, the diagonal reveal on a cell holding more than one deal, the hover card that stays up while the cursor is on it, and the toasts after a write are all hand-built — and built to match what the production widget does at runtime rather than what a cleaner design would have preferred. The reading rules live in a field guide inside the product, reachable from the header: how a colour is chosen, why the rows are ordered as they are, what a pale cell means, and the one stage that prints in dark text. A colour scheme carrying this much meaning is either documented where it is used or quietly misread.

### What it deliberately does not show

A cell carries the latest deal, not the history behind it. A service line won three years ago and lost twice since reads as its most recent outcome, and the two earlier attempts are not on the screen at all. Ordering ranks by amount, which favours large service lines over strategically important small ones without saying so. Both are deliberate — this screen exists to start a conversation about gaps, not to replace the deal records underneath it — but an account plan built from this view alone is a plan written entirely in the present tense.
