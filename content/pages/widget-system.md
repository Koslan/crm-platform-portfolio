---
page: "widget-system"
title: "Seventy widgets as one product system"
type: "write-up (CASES → vCase)"
tab: "zoho"
group: "Org tooling, CI/CD, deployment and the external server"
route: "#/p/widget-system"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"widget-system\""
  body_case: "src/app.html · CASES['Written up from the platform work'][4]"
---

# Seventy widgets as one product system

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Shared components, services, versioning and mobile adaptation behind 70+ production interfaces.
>
> **Material labels** (`MAT`): Architecture write-up
>
> **`sub` — НЕ рендерится, см. LEAD:**
> Shared components, services, versioning and mobile adaptation behind 70+ production interfaces.

## Seventy widgets, or seventy copies of the same table

Seventy independent widgets are seventy versions of the same table, the same validation rule, the same failure message and the same date formatting, each drifting on its own schedule. The visible estate grows and delivery slows with every copy, because a fix has to be found in seventy places before it can be applied in one — and the seventieth is always the one nobody remembers.

## A shared layer, with rules about changing it

The widgets share component patterns, service wrappers around the platform SDK, a common error envelope and one visual language. What makes that a system rather than a folder of helpers is the rules attached to it: versioning, and a stated compatibility policy for changing something seventy screens depend on.

## Three surfaces, one set of decisions

Desktop, Canvas and mobile are three hosts with different space, different input, and on a phone no developer tools at all. They reuse the same decisions — the same data access, the same validation, the same failure behaviour — and adapt only the presentation to the host, rather than forking the logic once per surface and then maintaining three versions of the same bug.

## Quality at a scale nobody can click through

Nobody reviews seventy widgets by hand before a release. The offline SDK harness runs them against seeded data and deliberate failures, and browser checks run at desktop and phone widths, failing on any console error rather than only on a failed assertion. The aim is not a coverage number; it is that a change to the shared layer is verified somewhere other than in production, on somebody else’s afternoon.

## The trade

A shared layer makes local changes safer and platform-wide changes more consequential: one careless edit to a shared component reaches every screen at once. That is exactly why versioning and compatibility rules are part of the product rather than cleanup deferred to later. The cost is real and worth naming — a change that would take an afternoon inside one isolated widget takes longer here, and that slower path is what buys the other sixty-nine screens not breaking.
