---
page: "event"
title: "One event system, end to end"
type: "live-demo (свой рендерер PAGE)"
tab: "zoho"
group: "Trade shows: booking, meetings, follow-up"
route: "#/p/event"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"event\""
  body_render: "src/app.html · PAGE['event'].render()"
---

# One event system, end to end

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Targeting, booking, conflict checks, mobile execution and reconciliation on one campaign record.
>
> **Material labels** (`MAT`): Production-derived demo
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> One campaign record carries the event from preparation to follow-up: several hundred target contacts, a meeting schedule, a booking flow that checks people and rooms, and mobile interfaces for the team on the floor. The widgets share one data model, so every view is another operating surface over the same event rather than a separate tool.

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

## Why this is a platform task

Three widgets and a wizard is a description of the artefacts, not of the work. The work is that one campaign record has to carry an event from a target list through booking, through the floor, to the follow-up afterwards — and that every surface touching it reads and writes the same data model. Build them as four separate tools and the schedule disagrees with the booking within a day; build them over one model and a conflict is a query rather than a phone call.

That is also what makes the ceilings unavoidable rather than incidental. Everything here runs on the platform emulator — the same query interpreter, the same two-hundred-record page limit, the same write validation — so the target list pages, the wizard genuinely refuses an incomplete booking, and a meeting that has not reached a calendar says so instead of pretending. A screen that hides its platform is a screenshot; this one has to survive it.

## Related

- [`board`](./board.md) — The event floor, designed for a phone
- [`calendar-sync`](./calendar-sync.md) — Delta sync across seventeen calendars
- [`widget-system`](./widget-system.md) — Seventy widgets as one product system
