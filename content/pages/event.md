---
page: "event"
title: "Event campaign page"
type: "live-demo (свой рендерер PAGE)"
tab: "zoho"
group: "Widgets & interfaces"
route: "#/p/event"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"event\""
  body_render: "src/app.html · PAGE['event'].render()"
---

# Event campaign page

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> A campaign record with three widgets and the five-step booking wizard.

## Текст страницы

_Проза этой страницы живёт прямо в разметке рендерера — правьте по совпадению строки._

# Event campaign page

One CRM record, several widgets. This is how the work actually looks: a campaign header, a tabbed record page, a target list of several hundred contacts, a meeting schedule, and a booking wizard that checks who and what is free before it lets you continue.

Live demoEmulated CRM shell3 widgets + wizard

## The record

## What to try

-   **Contacts** — several hundred rows loaded in pages of two hundred, the platform ceiling. Filter chips combine as OR inside a group and AND across groups. Statuses derived from meetings carry a padlock.
-   **Meetings** — counters recompute against whatever is filtered, including booked hours. The calendar column carries the five sync states the reconciliation work exists for.
-   **Create Meeting** — the wizard refuses to continue and says why: no buyer, no room, capacity exceeded. Step four computes free slots from the meetings already in the CRM and names the reason a slot is blocked — the room is taken, or one of our people is already in something.
-   Book a meeting and it appears in the Meetings tab, marked _not in calendar_ — because sending the invitation is a server-side step, and pretending otherwise would be the exact lie this kind of screen should not tell.

## Why this shape

A widget shown on its own is a screenshot. A record page with tabs is the thing people actually use: the same campaign, seen five ways, with one set of data underneath. Everything here runs on the platform emulator — the same query interpreter, the same two-hundred-record ceiling, the same write validation. The wizard’s booking really is rejected if a mandatory field is missing.
