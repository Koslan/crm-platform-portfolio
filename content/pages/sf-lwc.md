---
page: "sf-lwc"
title: "One screen, two platforms"
type: "live-demo (свой рендерер PAGE)"
tab: "salesforce"
group: "Salesforce"
route: "#/p/sf-lwc"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · SF_ITEMS · id=\"sf-lwc\""
  body_render: "src/app.html · PAGE['sf-lwc'].render()"
---

# One screen, two platforms

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> The employment-history widget, ported to a Lightning Web Component, next to the Zoho original.

## Текст страницы

_Проза этой страницы живёт прямо в разметке рендерера — правьте по совпадению строки._

# One screen, two platforms

The employment-history widget, live on both platforms at once: the existing Zoho production port next to a Salesforce Lightning Web Component built to the same contract — same controller call names, same write order, same failure-and-rollback behaviour. Switch the tab; the data underneath is the same invented contact on both sides.

Live demoEmulated CRM shellEmulated LWC platform

## The widget

## What to try

-   Tick "main" on a different row on either tab. Every other row is unticked first, then the new one is set — the same two-write order on both platforms, because that order is the whole point.
-   On the Salesforce tab, turn on the failure switch below the table, then move the main employer again. "2nd write fails" leaves the table exactly as it was and shows the error, rather than silently losing which row is main.
-   "No access" mirrors what EmploymentHistoryController.cls actually throws when the running user lacks field-level access — a clean, user-facing message rather than a raw DML error.

## Why this shape

Salesforce/force-app/main/default/lwc/employmentHistory is the real Lightning Web Component — @wire read, imperative write, Apex controller with Security.stripInaccessible. Rendering the actual LWC engine inside one inlined HTML file was measured against this site’s own size ceiling and did not fit, so the Salesforce tab here is a vanilla-JS port that keeps the same method names, the same controller call shape and the same write order as the real component — see the write-up for exactly what that trade costs and what it keeps.
