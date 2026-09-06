---
page: "board"
title: "The event floor, designed for a phone"
type: "live-demo (общий шаблон viewRecord)"
tab: "zoho"
group: "Trade shows: booking, meetings, follow-up"
route: "#/p/board"
kind: "live"
public: true
public_tab: "zoho"
case: "#/zoho/widgets"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"board\""
  body: "src/app.html · REC · id=\"board\""
---

# The event floor, designed for a phone

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> A room-by-room schedule, team load and assisted recap flow for a surface with no developer tools.
>
> **Material labels** (`MAT`, публично не рендерятся): Production-derived demo
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> The same event platform on the device people carry at the venue: a room timeline, team load, conflict and travel warnings, and a recap flow that writes back to CRM. The interface is designed for short interactions, unreliable attention and a host environment with no mobile developer tools.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> The same event, on a phone. A room-by-room day, team load, and a bottom sheet that writes a recap back — built for a surface with no developer tools, so it carries its own.

## What to try

- Tap the clash or travel counter — the day narrows to the meetings that caused it.
- Switch to Team: the load bar is share of an eight-hour day, and a double-booked person is flagged there too.
- Open a meeting, write a recap, and press Rephrase. The rewrite happens server-side, so no key is ever in this page; press again to undo.
- Tap the version badge in the header. That is the on-screen console — the only way to read an error on a phone inside the CRM app.

## Why it was not straightforward

### Mobile operating constraints

The host application gives a widget running on a phone no developer tools whatsoever: no console, no inspector, no way to read an error that happened on somebody else’s device on a trade-show floor. So the interface carries its own — the version badge in the header opens an on-screen console with a ring buffer, and several of these bugs were never visible any other way. The rest follows from the same surface. Nothing here comes out of a component library: the room timeline, the lane layout for meetings that overlap, and the bottom sheet are all hand-built, because the binding constraint is not screen width but attention. The person using this is standing up, between conversations, and has seconds rather than minutes. Two alerts exist that the platform has no concept of — somebody booked into two meetings at once, and a move between places with under fifteen minutes to make it — because those are the two things that actually go wrong on a floor, and neither is a field anybody thought to model.

### AI-assisted recap, and the boundary around it

The recap field is where a model earns its place on this screen. Typing a structured summary on a phone is the most expensive thing this interface asks of anyone, and turning a rough note into the shape the business expects is precisely the bounded task a model is good at. What makes it usable rather than alarming is the boundary drawn around it. The rewrite runs server-side, so no key is ever present in the page. The target record and the destination field are fixed by the interface and are not the model’s to choose. Pressing the same control again undoes the rewrite and gives back the original words, so nothing a person typed is lost to a suggestion they did not want. And it drafts, nothing more — the save stays a separate, deliberate act by the person whose name goes on the record.

### What this surface still cannot do

The console is a ring buffer: it holds the recent past and drops the rest, so an error nobody looks at soon after it happens is gone for good. The clash and travel warnings are computed from the meetings the CRM holds, which means anything arranged outside the CRM does not exist for them — the alerts are accurate about the data they have and silent about the data they do not, and on a floor where people agree things in person that gap is not theoretical. Both are the same trade in different places: this screen is built to be honest about a small, verifiable picture rather than confident about a complete one it cannot actually see.
