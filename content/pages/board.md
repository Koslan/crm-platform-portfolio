---
page: "board"
title: "Meeting board (mobile)"
type: "live-demo (общий шаблон viewRecord)"
tab: "zoho"
group: "Widgets & interfaces"
route: "#/p/board"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"board\""
  body: "src/app.html · REC · id=\"board\""
---

# Meeting board (mobile)

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> A phone-sized schedule with lane layout and an on-screen console.
>
> **Подзаголовок страницы** (`sub`):
> The same event, on a phone. A room-by-room day, team load, and a bottom sheet that writes a recap back — built for a surface with no developer tools, so it carries its own.

## What to try

- Tap the clash or travel counter — the day narrows to the meetings that caused it.
- Switch to Team: the load bar is share of an eight-hour day, and a double-booked person is flagged there too.
- Open a meeting, write a recap, and press Rephrase. The rewrite happens server-side, so no key is ever in this page; press again to undo.
- Tap the version badge in the header. That is the on-screen console — the only way to read an error on a phone inside the CRM app.

## Why it was not straightforward

Nothing here comes from a component library: the timeline, the lane layout for overlapping meetings, the sheet and the console are hand-built. Two alerts exist that the platform has no concept of — a person in two meetings at once, and a move between places with under fifteen minutes to make it.
