---
page: "orghealth"
title: "Org health report"
type: "live-demo (свой рендерер PAGE)"
tab: "zoho"
group: "Platform engineering"
route: "#/p/orghealth"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"orghealth\""
  body_render: "src/app.html · PAGE['orghealth'].render()"
---

# Org health report

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> 1,240 functions placed against five entry channels.

## Текст страницы

_Проза этой страницы живёт прямо в разметке рендерера — правьте по совпадению строки._

# Org health report

A CRM of any age accumulates automation nobody can account for. The platform keeps no reverse references, so “is this function still used?” has no direct answer — this is the answer, assembled by checking five entry channels for every one of them.

Live demoGenerated org, 1,240 functionsNo employer configuration

## The report

## Why it is generated, and not real

The instrument is the point, not the org it was run against. A real report is a portrait of somebody else’s security posture — how many credentials sit inline, how many integrations have no error handling — and that is not mine to publish, cleaned or otherwise. So the tooling is pointed at an invented org of a realistic size and shape instead. What it proves is the same: that the five channels can be reconciled at all, that the dead code can be named with a reason rather than a guess, and that the method knows where it is blind.

## What each panel is actually claiming

-   **Reachability** — a function is called dead only when a workflow rule, a schedule, a button, a widget and every other function all come back empty. Click a slice to see the list, with the entry points each one does have.
-   **Guarded calls** — the share of outbound calls wrapped in error handling. On an estate this size the number is usually single digits, and it is the reason a transient failure takes a whole rule down with it.
-   **Broken connections** — the platform records that a connection stopped authenticating and keeps letting code call it. Nothing links the two facts together until something like this does.
-   **Rules that never fired** — active, wired, and executed exactly never, usually because a criterion still names a field that was renamed.
-   **The warning at the bottom** — the class of function this method cannot see. It is stated first, not last.
