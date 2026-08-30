---
page: "solution"
title: "Solution map"
type: "live-demo (общий шаблон viewRecord)"
tab: "zoho"
group: "Widgets & interfaces"
route: "#/p/solution"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"solution\""
  body: "src/app.html · REC · id=\"solution\""
---

# Solution map

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Service lines against business units, coloured by the latest deal on each cell.
>
> **Подзаголовок страницы** (`sub`):
> A programme record, and the matrix its account plan is read from: service lines against business units, coloured by the latest deal on each cell, with unworked pipeline surfaced in pale blue and a business unit's whole potential — not just what it has already won — totalled in its header.

## What to try

- Hover a cell that has a deal on it — the deals behind it float above, and the card stays up while your cursor is on it.
- Open the field guide from the header. The colour rule and the row order are documented in the product, not in a wiki nobody opens.
- Create an opportunity from a business-unit header — pick more than one service line, a primary contact and a stage, and watch Lost pull in its own loss-reason field. It is written through the emulator and the matrix redraws with it.

## Why it was not straightforward

Nothing in the platform draws a matrix. The grid, the ten stage colours, the diagonal reveal, the toasts and the hover card are all hand-built to match what the production widget actually does at runtime — including the odd corners, like Prospecting being the one stage that reads in dark text on its own pale yellow, not the white every other stage gets.
