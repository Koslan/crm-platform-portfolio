---
case: "widgets"
num: "01"
title: "Custom CRM interfaces"
route: "#/zoho/widgets"
public: true
embed: null
examples: ["event","cockpit","solution","board","enrichment"]
notes: ["widget-system"]
related: ["orchestration","enrichment"]
words: 1071
source:
  body: "src/cases.js · CASES[0] (slug \"widgets\")"
  furniture: "src/app.html · vCaseStudy()"
---

# 01 · Custom CRM interfaces

> **Kicker** (`kicker`): Widgets · Canvas · Mobile · JavaScript
>
> **Одной строкой** (`one`): Screens for workflows the standard record page could not carry: target lists of several hundred contacts, room schedules, a service-line matrix, a team cockpit — inside the iframe the platform controls.

## Summary

- **What:** Custom interfaces inside Zoho CRM for the workflows standard layouts, subforms and related lists could not support.
- **Scale:** Seventy-plus production widgets across record pages, related lists, buttons, web tabs, Canvas and the mobile app, on one versioned component library.
- **My role:** Design, implementation, the shared library, the offline test stand and production support — as the platform’s primary engineer.
- **Key topics:** Embedded SDK · COQL paging · Tabulator · validated inline editing · mobile Canvas · failure states

## Key facts

| | |
| --- | --- |
| Widgets | 70+ in production |
| Surfaces | record page · related list · button · web tab · Canvas · mobile |
| Data layer | COQL, 200 rows a page, 14 criteria a query |
| Tables | Tabulator with custom header filters |
| Library | shared components and functions, versioned |
| Verification | offline stand for the SDK, browser tests at phone widths |

## Context

Sales at a services company lives in tables the platform cannot draw. A trade show brings a target list of several hundred contacts that has to be triaged, edited and booked against; a client programme is read as a matrix of service lines against business units; a sales lead needs the team’s pipeline, overdue items and legal paperwork on one screen scoped to the person looking at it. The standard record page offers fields, subforms and related lists, and none of those shapes fit. Before the widgets, that work happened in spreadsheet exports.

The answer was not one screen but an estate: seventy-plus widgets that share a design system, a component and function library with versioning, and one set of conventions for loading, paging, editing and failing. Each of the examples on this page is one composite screen from that estate.

## Architecture

Every widget follows the same path: the record page loads it with the record in context; the widget reads through the embedded SDK — COQL for data, record APIs for writes, connection invokes for anything external — and hands everything heavy, secret or slow to a Deluge service layer. The service layer holds the query patterns, the validation and write rules, the calls to the calendar, the tracker and the enrichment provider, and the model calls whose keys never reach the page.

<!-- diagram · layers · вставляется после секции body[0] · источник: CASES[0].architecture.dg -->

### Диаграмма — слои архитектуры

_Alt-текст (`aria`, читается скринридером):_ A record page loads an embedded widget; the widget talks to the Zoho SDK; the SDK reaches a Deluge service layer, which reaches the CRM and external APIs


**Zoho record**
- **Record page** — related list · button · web tab
- **Mobile app** — Canvas mobile detail view

↓ _iframe, initialised with the record in context_

**Embedded widget**
- **UI** — vanilla JS · HTML · CSS
- **Tables** — Tabulator, custom header filters
- **Shared library** — components and functions, versioned
- **On-screen console** — mobile, ring buffer

↓ _ZOHO.CRM.API · COQL · connection invokes · resize_

**Zoho SDK**
- **COQL** — 200 rows a page
- **Record API** — validated writes
- **Function invoke** — server-side work

↓ _anything heavy, secret or external goes server-side_

**Deluge service layer**
- **Query patterns** — paging · chunked searches
- **Validation and write rules** — every refusal names its reason
- **External calls** — calendar · tracker · provider
- **Model calls** — keys stay server-side

**CRM and external systems** (ядро)
- **Records and subforms** — Zoho CRM
- **External APIs** — Graph · Jira · Apollo

**Пояснения по клику** (`detail`):

- `page` — **Record page**
  The platform gives an iframe and a query API. Everything else — grid, filters, editing, layout — is hand-built.
- `mob` — **Mobile app**
  The same widget model on a phone. Free/busy is computed from CRM records because personal calendars are unreachable from a browser widget, and the interface says so.
  _ссылка: #/p/board_
- `ui` — **UI**
  Framework-free: state to render, events to state. No build step, no runtime dependency the host page could collide with.
- `tables` — **Tables**
  Custom header-filter editors (date ranges, “at least N”), in-cell editing, a second horizontal scrollbar synchronised above the table because sales asked for it.
  _ссылка: #/p/event_
- `lib` — **Shared library**
  Component patterns, service wrappers around the SDK, a common error envelope and one visual language — with versioning and a stated compatibility policy for changing something seventy screens depend on. A version badge in the header says what is running.
- `console` — **On-screen console**
  A 400-line ring buffer capturing errors and unhandled rejections — the only way to read an error on a phone inside the CRM app.
  _ссылка: #/p/board_
- `coql` — **COQL**
  Dotted lookups across modules, paging at the 200-row ceiling, criteria chunked at fourteen conditions.
- `rapi` — **Record API**
  A write is refused for a missing mandatory field or a value outside a picklist; the widget shows the reason instead of a spinner.
- `fn` — **Function invoke**
  Heavy work runs server-side: free-slot search across rooms and people, provider batches, tracker calls.
- `q` — **Query patterns**
  Reusable read models across modules; the ceilings treated as ordinary constraints rather than discoveries.
- `rules` — **Validation and write rules**
  A booking without a buyer is refused with the reason named; a Lost deal demands its loss reason; a name is corrected only when the surname differs.
- `ext` — **External calls**
  Calendar invitations, tracker comments and provider batches leave from the service layer, never from the page.
- `ai` — **Model calls**
  Recap rephrasing runs server-side so no key is ever in the page; press again to undo.
  _ссылка: #/p/board_
- `records` — **Records and subforms**
  A subform is replaced wholesale rather than patched row by row — one of the reasons every write path is explicit about what it sends.
- `apis` — **External APIs**
  The calendar, the issue tracker and the enrichment provider — reached through connections the widget never sees.

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "layers",
 "aria": "A record page loads an embedded widget; the widget talks to the Zoho SDK; the SDK reaches a Deluge service layer, which reaches the CRM and external APIs",
 "rows": [
  {
   "id": "rec",
   "label": "Zoho record",
   "nodes": [
    {
     "id": "page",
     "n": "Record page",
     "sub": "related list · button · web tab"
    },
    {
     "id": "mob",
     "n": "Mobile app",
     "sub": "Canvas mobile detail view"
    }
   ]
  },
  {
   "arrow": "iframe, initialised with the record in context"
  },
  {
   "id": "w",
   "label": "Embedded widget",
   "nodes": [
    {
     "id": "ui",
     "n": "UI",
     "sub": "vanilla JS · HTML · CSS"
    },
    {
     "id": "tables",
     "n": "Tables",
     "sub": "Tabulator, custom header filters"
    },
    {
     "id": "lib",
     "n": "Shared library",
     "sub": "components and functions, versioned"
    },
    {
     "id": "console",
     "n": "On-screen console",
     "sub": "mobile, ring buffer"
    }
   ]
  },
  {
   "arrow": "ZOHO.CRM.API · COQL · connection invokes · resize"
  },
  {
   "id": "sdk",
   "label": "Zoho SDK",
   "nodes": [
    {
     "id": "coql",
     "n": "COQL",
     "sub": "200 rows a page"
    },
    {
     "id": "rapi",
     "n": "Record API",
     "sub": "validated writes"
    },
    {
     "id": "fn",
     "n": "Function invoke",
     "sub": "server-side work"
    }
   ]
  },
  {
   "arrow": "anything heavy, secret or external goes server-side"
  },
  {
   "id": "svc",
   "label": "Deluge service layer",
   "nodes": [
    {
     "id": "q",
     "n": "Query patterns",
     "sub": "paging · chunked searches"
    },
    {
     "id": "rules",
     "n": "Validation and write rules",
     "sub": "every refusal names its reason"
    },
    {
     "id": "ext",
     "n": "External calls",
     "sub": "calendar · tracker · provider"
    },
    {
     "id": "ai",
     "n": "Model calls",
     "sub": "keys stay server-side"
    }
   ]
  },
  {
   "id": "crm",
   "label": "CRM and external systems",
   "core": true,
   "nodes": [
    {
     "id": "records",
     "n": "Records and subforms",
     "sub": "Zoho CRM"
    },
    {
     "id": "apis",
     "n": "External APIs",
     "sub": "Graph · Jira · Apollo"
    }
   ]
  }
 ],
 "detail": {
  "page": {
   "t": "Record page",
   "d": "The platform gives an iframe and a query API. Everything else — grid, filters, editing, layout — is hand-built."
  },
  "mob": {
   "t": "Mobile app",
   "d": "The same widget model on a phone. Free/busy is computed from CRM records because personal calendars are unreachable from a browser widget, and the interface says so.",
   "demo": "p/board"
  },
  "ui": {
   "t": "UI",
   "d": "Framework-free: state to render, events to state. No build step, no runtime dependency the host page could collide with."
  },
  "tables": {
   "t": "Tables",
   "d": "Custom header-filter editors (date ranges, “at least N”), in-cell editing, a second horizontal scrollbar synchronised above the table because sales asked for it.",
   "demo": "p/event"
  },
  "lib": {
   "t": "Shared library",
   "d": "Component patterns, service wrappers around the SDK, a common error envelope and one visual language — with versioning and a stated compatibility policy for changing something seventy screens depend on. A version badge in the header says what is running."
  },
  "console": {
   "t": "On-screen console",
   "d": "A 400-line ring buffer capturing errors and unhandled rejections — the only way to read an error on a phone inside the CRM app.",
   "demo": "p/board"
  },
  "coql": {
   "t": "COQL",
   "d": "Dotted lookups across modules, paging at the 200-row ceiling, criteria chunked at fourteen conditions."
  },
  "rapi": {
   "t": "Record API",
   "d": "A write is refused for a missing mandatory field or a value outside a picklist; the widget shows the reason instead of a spinner."
  },
  "fn": {
   "t": "Function invoke",
   "d": "Heavy work runs server-side: free-slot search across rooms and people, provider batches, tracker calls."
  },
  "q": {
   "t": "Query patterns",
   "d": "Reusable read models across modules; the ceilings treated as ordinary constraints rather than discoveries."
  },
  "rules": {
   "t": "Validation and write rules",
   "d": "A booking without a buyer is refused with the reason named; a Lost deal demands its loss reason; a name is corrected only when the surname differs."
  },
  "ext": {
   "t": "External calls",
   "d": "Calendar invitations, tracker comments and provider batches leave from the service layer, never from the page."
  },
  "ai": {
   "t": "Model calls",
   "d": "Recap rephrasing runs server-side so no key is ever in the page; press again to undo.",
   "demo": "p/board"
  },
  "records": {
   "t": "Records and subforms",
   "d": "A subform is replaced wholesale rather than patched row by row — one of the reasons every write path is explicit about what it sends."
  },
  "apis": {
   "t": "External APIs",
   "d": "The calendar, the issue tracker and the enrichment provider — reached through connections the widget never sees."
  }
 }
}
```

</details>

## Constraints

- **The iframe** — A widget is an iframe the CRM loads and initialises through its SDK. It receives the record it sits on and nothing else; the host page, its styles and its navigation are not yours.
- **The query ceiling** — COQL returns 200 rows a page and accepts fourteen criteria a query. A four-hundred-row target list is three pages by hand; a search over a list of profile URLs is chunked into fourteen-condition slices.
- **Permissions** — The widget runs as the person looking at it. A screen that shows a manager the team and a salesperson their own work is the same code with the scope resolved at load.
- **Mobile** — The mobile app loads the same kind of widget on a phone, where there are no developer tools, a narrow viewport and a touch keyboard.
- **Write safety** — Edits go back into a live org. An in-cell edit is validated before it is sent; a control that behaves like a radio button must never leave the record briefly without an answer.
- **Embedded context** — The widget must resize with its content, survive a refresh with its filter state intact, and say so when a server-side step cannot be done from a browser.

## Implementation

### Common patterns, one library

Each widget is assembled from the same parts: a loading state that names the real stages of the load rather than spinning; a data layer that pages COQL to the ceiling and merges the pages; filter chips that combine as OR inside a group and AND across groups; a version badge that says which build is running. The parts are versioned together with a stated compatibility policy, so a fix in the library reaches every screen on the next release rather than one screen at a time — and a change to the shared layer is verified on the offline stand before any screen in production sees it. Desktop, Canvas and mobile are three hosts with different space and input; they reuse the same data access, validation and failure behaviour and adapt only the presentation.

### Large tables

The target list for a trade show is several hundred rows with nine counters above it, edited in place. Tabulator carries the grid; the header filters — a date range, an “at least N” threshold — are custom editors; status, priority and attendance are edited in the cell and written back through the SDK. Statuses that the system derives from meetings carry a padlock with an explanation instead of being silently overwritten. A second horizontal scrollbar sits above the table, synchronised with the body, because that is where people looked for it.

### Validated writes and control order

A booking wizard refuses to continue and says why: no buyer, no room, capacity exceeded. Step four computes free slots from the meetings already in the CRM and names the reason a slot is blocked — the room is taken, or one of our people is already in something. On the employment-history screen exactly one row is the main employer, and moving that pointer is two writes in a fixed order: every other row is unticked first, then the new one is set, so a failure can never leave two rows claiming to be main, and the whole control set is disabled while it runs.

### Scope and role

The sales cockpit is not a record but a team: ten tables across three tabs, scoped to everyone, to one person or to you. The platform will not take twenty owners in one query criterion, so the user list is fetched, filtered by role, and records are narrowed after retrieval. The rule that decides what lands in each table — a closing date in the past, a deal above a threshold with no plan linked — is printed under the table, because a rule you cannot read is a rule you cannot trust.

### Mobile

The meeting board runs on a phone inside the CRM app: a room-by-room day with meetings drawn as blocks whose height is their duration, overlapping meetings split into lanes, a now-line, team load as a share of an eight-hour day, and a bottom sheet that writes a recap back. Two alerts exist that the platform has no concept of — a person in two meetings at once, and a move between places with under fifteen minutes to make it. The screen carries its own console, because there are no developer tools on that surface.

## Reliability and failure handling

What the screens do when the platform or the data does not cooperate.

| When | What the system does |
| --- | --- |
| A query exceeds the 200-row ceiling | Pages are requested to the ceiling and merged; the counters recompute against whatever is filtered, including booked hours. |
| A write is refused | The widget shows the platform’s reason — a missing mandatory field, a value outside the picklist — next to the control, and leaves the row editable. |
| The second of two dependent writes fails | The pointer control unticks first and sets second; a failure on the second write leaves no row claiming to be main rather than two, the error is shown rather than swallowed, and the controls are re-enabled. |
| A server-side step cannot be done from the browser | A booked meeting appears marked “not in calendar” — sending the invitation is a server-side job, and the screen says so instead of pretending. |
| An error on a phone | The on-screen console keeps the last four hundred lines, including unhandled rejections; the version badge opens it. |
| A subform write | A subform is replaced wholesale, so the payload builder lists every row it intends to keep; anything it does not send stops existing, and that is written down next to the write path. |

## My responsibility

Primary engineer on the whole estate: information architecture, the component library, every widget on this page and the Deluge functions behind them, the offline stand that stubs the SDK so a change is verified before the org sees it, and the production support afterwards. Requirements were gathered directly with sales operations and business development, and pushed back on where a request would have distorted the data model.

## Result

The record page became the tool people work in. Contact triage that used to need a spreadsheet export happens on the record; a client programme is read as one matrix instead of a report; the team’s pipeline is one screen with its rules printed on it. The library is what made seventy-plus screens sustainable for one small team: a change lands everywhere, and every screen fails the same way — visibly, with a reason.

## More examples

- [`event`](../pages/event.md) — A campaign record with a target list of several hundred contacts, a meeting schedule and the five-step booking wizard.
- [`cockpit`](../pages/cockpit.md) — Open value, overdue deals, agreements waiting and tasks past due — for the team or for one person, with the rules printed on the screen.
- [`solution`](../pages/solution.md) — Service lines against business units, coloured by the latest deal on each cell, with a built-in field guide.
- [`board`](../pages/board.md) — A phone-sized schedule with lane layout, team load, a recap sheet and an on-screen console.
- [`enrichment`](../pages/enrichment.md) — An account record with its group structure, development plan and the enrichment screen that matches people before writing.

## Technical notes

- [`widget-system`](../pages/widget-system.md)

## Related cases

- [`orchestration`](./orchestration.md)
- [`enrichment`](./enrichment.md)
