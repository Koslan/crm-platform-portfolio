---
page: "orghealth"
title: "An org audit that names what it cannot see"
type: "live-demo (свой рендерер PAGE)"
tab: "zoho"
group: "Org tooling, CI/CD, deployment and the external server"
route: "#/p/orghealth"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"orghealth\""
  body_render: "src/app.html · PAGE['orghealth'].render()"
---

# An org audit that names what it cannot see

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> A generated 1,240-function org reconciled against five entry channels, with blind spots stated first.
>
> **Material labels** (`MAT`): Production-derived demo · Working audit tooling
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> A mature CRM accumulates automation nobody can fully account for. This report reconciles every function against rules, schedules, buttons, widgets and other functions, then distinguishes reachable code, unsupported assumptions and genuine audit gaps. The public dataset is generated; the instrument and the method are the real work.

## Текст страницы

_Проза этой страницы живёт прямо в разметке рендерера — правьте по совпадению строки._

# Org health report

A CRM of any age accumulates automation nobody can account for. The platform keeps no reverse references, so “is this function still used?” has no direct answer — this is the answer, assembled by checking five entry channels for every one of them.

Live demoGenerated org, 1,240 functionsNo employer configuration

## The report

## Why it is generated, and not real

The instrument is the point, not the org it was run against. A real report is a portrait of somebody else’s security posture — how many credentials sit inline, how many integrations have no error handling — and that is not mine to publish, cleaned or otherwise. So the tooling is pointed at an invented org of a realistic size and shape instead. What it proves is the same: that the five channels can be reconciled at all, that the dead code can be named with a reason rather than a guess, and that the method knows where it is blind.

## What each panel is actually claiming, in the order it claims it

-   **The completeness warning** — the class of function this method cannot see, and how large it is. It opens the report rather than closing it: a reader who takes the reachability numbers at face value has been misled, and finding that out underneath the chart is finding out too late.
-   **Reachability** — a function is called dead only when a workflow rule, a schedule, a button, a widget and every other function all come back empty. Click a slice to see the list, with the entry points each one does have.
-   **Broken connections** — the platform records that a connection stopped authenticating and keeps letting code call it. Nothing links the two facts together until something like this does, so the call sites have been failing quietly for as long as nobody looked.
-   **Guarded calls** — the share of outbound calls wrapped in error handling. On an estate this size the number is usually single digits, and it is the reason a transient failure takes a whole rule down with it.
-   **Rules that never fired** — active, wired, and executed exactly never, usually because a criterion still names a field that was renamed.
