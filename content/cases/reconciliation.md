---
case: "reconciliation"
num: "07"
title: "Data authority, reconciliation and migration"
route: "#/zoho/reconciliation"
public: true
embed: "event"
examples: ["event"]
notes: ["cross-system/who-owns","contact-model"]
related: ["orchestration","enrichment"]
words: 810
source:
  body: "src/cases.js · CASES[6] (slug \"reconciliation\")"
  furniture: "src/app.html · vCaseStudy()"
---

# 07 · Data authority, reconciliation and migration

> **Kicker** (`kicker`): Field authority · expected values · repair workflows · migration
>
> **Одной строкой** (`one`): Four systems touch the same meeting. A written rule says which one may be right about which field; a reconciliation screen computes what the record should say; and a migration was verified against the same rules rather than record counts.

## Summary

- **What:** A data-authority model across the CRM, the calendar, chat and the issue tracker, the reconciliation tooling that enforces it, and the migration and data-model work that gave the org one authoritative set of records.
- **Scale:** An authority map over every shared meeting field; a reconciliation screen with three matching levels, five sync states and bulk repair; a legacy-CRM migration with automation suppressed and loads verified by rule.
- **My role:** The authority model, the reconciliation tooling, the migration end to end, and the data-model redesign.
- **Key topics:** field authority · three-way compare · repair writes · create-only fields · migration verification · junction modules

## Key facts

| | |
| --- | --- |
| Systems | calendar · CRM · chat · issue tracker |
| Rule | time → calendar, judgement → CRM, delivery → tracker |
| Matching | 3 levels, 4 in-memory indexes |
| Sync states | 5, with a six-state diff legend |
| Migration | Python · Deluge · SQL, automation suppressed |
| Verification | reconciliation rules, not record counts |

## Context

“Sixty minutes here, forty-five there” does not tell an operator what the record should say. A meeting exists in a calendar, in the CRM, in a chat thread and in an issue; each has a legitimate claim on part of it. Left alone, every sync overwrites the previous one, the last write wins, and the last write is usually a robot — so the humans stop trusting the record.

The same question sat under the migration from the legacy CRM: years of records had to arrive as one authoritative set, with a written answer to “why does this field disagree”, and relations that had lived as free text — which business unit, which programme — had to become references that reports and rollups can use.

## Architecture

The authority map is the mechanism. It says, per field, which system owns the value, which may only supply it, and which may never write it. The payload builder enforces it by keeping create and update apart; the reconciliation screen makes it visible by computing the expected value from both sources plus the map and printing the rule under the comparison.

<!-- diagram · layers · вставляется после секции body[0] · источник: CASES[6].architecture.dg -->

### Диаграмма — слои архитектуры

_Alt-текст (`aria`, читается скринридером):_ Calendar and CRM records are matched at three levels; the authority map yields an expected value per field; each row gets a sync state; a repair writes exactly the expected value, with create and update kept apart


**Two sources**
- **Calendar** — owns time and attendees
- **CRM** — owns judgement

↓ _three matching levels · four in-memory indexes · external id where present_

**Matching**
- **Paired rows** — both sides
- **Only in CRM** — invitation not sent
- **Only in calendar** — booked outside the CRM

↓ _per field: owner · source · never · create-only_

**Authority map** (ядро)
- **Time** — calendar
- **Judgement** — CRM: type, room note, recap
- **Delivery** — issue tracker
- **Chat** — owns nothing

↓ _expected value computed from both sources plus the map_

**Sync state per row**
- **In sync**
- **Incorrect** — values differ
- **Outdated** — calendar moved on
- **No dates**
- **Diff legend** — six states

↓ _repair writes exactly the expected value_

**Repair**
- **Create** — all fields, once
- **Update** — never the create-only fields
- **Bulk** — progress · per-row error log

**Пояснения по клику** (`detail`):

- `cal` — **Calendar**
  The calendar owns time: it is where people accept and move things. It also supplies attendees, but never the meeting type, even though it has an event type of its own.
  _ссылка: #/p/cross-system/who-owns_
- `crm` — **CRM**
  Judgement belongs to the CRM — a meeting type, a room note, a recap — because a person typed it.
- `pair` — **Paired rows**
  Matched at three levels, with four in-memory indexes and constant-time updates after a single edit.
- `crm-only` — **Only in CRM**
  A booked meeting whose invitation has not gone out yet — a server-side step, marked as such rather than pretended.
- `cal-only` — **Only in calendar**
  A meeting booked outside the CRM; shown so it can be adopted rather than silently ignored.
- `time` — **Time**
  Start, end and duration come from the calendar; the CRM is a source, chat and tracker never write them.
- `judge` — **Judgement**
  Meeting type, room note and recap are never overwritten from outside; several fields are written only on creation so a later sync cannot erase a human edit.
- `deliv` — **Delivery**
  The issue tracker is authoritative over its own delivery state; the CRM mirrors it.
- `chat` — **Chat**
  The whole chat column is source or never: chat is where a decision is made in conversation, not where it is stored.
- `ok` — **In sync**
  Both sides agree with the expected value.
- `wrong` — **Incorrect**
  The two sources disagree on a field the map can settle; the Expected column shows the answer.
- `old` — **Outdated**
  The calendar has moved on and the CRM row still shows the earlier time.
- `nodates` — **No dates**
  A row without usable dates on one side; flagged rather than compared.
- `legend` — **Diff legend**
  Six states in the diff view, so a person can see at a glance which side supplied what.
  _ссылка: #/p/event_
- `create` — **Create**
  All fields, once. Two fields are never written into the calendar because of length ceilings and one is truncated — each exclusion carries its reason next to it.
- `update` — **Update**
  Never the create-only fields, never the meeting type from outside — so a sync cannot erase a human edit.
- `bulk` — **Bulk**
  Bulk operations run with progress and a per-row error log; a row the platform refuses is shown with the platform’s reason.

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "layers",
 "aria": "Calendar and CRM records are matched at three levels; the authority map yields an expected value per field; each row gets a sync state; a repair writes exactly the expected value, with create and update kept apart",
 "rows": [
  {
   "id": "src",
   "label": "Two sources",
   "nodes": [
    {
     "id": "cal",
     "n": "Calendar",
     "sub": "owns time and attendees"
    },
    {
     "id": "crm",
     "n": "CRM",
     "sub": "owns judgement"
    }
   ]
  },
  {
   "arrow": "three matching levels · four in-memory indexes · external id where present"
  },
  {
   "id": "match",
   "label": "Matching",
   "nodes": [
    {
     "id": "pair",
     "n": "Paired rows",
     "sub": "both sides"
    },
    {
     "id": "crm-only",
     "n": "Only in CRM",
     "sub": "invitation not sent"
    },
    {
     "id": "cal-only",
     "n": "Only in calendar",
     "sub": "booked outside the CRM"
    }
   ]
  },
  {
   "arrow": "per field: owner · source · never · create-only"
  },
  {
   "id": "auth",
   "label": "Authority map",
   "core": true,
   "nodes": [
    {
     "id": "time",
     "n": "Time",
     "sub": "calendar"
    },
    {
     "id": "judge",
     "n": "Judgement",
     "sub": "CRM: type, room note, recap"
    },
    {
     "id": "deliv",
     "n": "Delivery",
     "sub": "issue tracker"
    },
    {
     "id": "chat",
     "n": "Chat",
     "sub": "owns nothing"
    }
   ]
  },
  {
   "arrow": "expected value computed from both sources plus the map"
  },
  {
   "id": "state",
   "label": "Sync state per row",
   "nodes": [
    {
     "id": "ok",
     "n": "In sync",
     "sub": ""
    },
    {
     "id": "wrong",
     "n": "Incorrect",
     "sub": "values differ"
    },
    {
     "id": "old",
     "n": "Outdated",
     "sub": "calendar moved on"
    },
    {
     "id": "nodates",
     "n": "No dates",
     "sub": ""
    },
    {
     "id": "legend",
     "n": "Diff legend",
     "sub": "six states"
    }
   ]
  },
  {
   "arrow": "repair writes exactly the expected value"
  },
  {
   "id": "write",
   "label": "Repair",
   "nodes": [
    {
     "id": "create",
     "n": "Create",
     "sub": "all fields, once"
    },
    {
     "id": "update",
     "n": "Update",
     "sub": "never the create-only fields"
    },
    {
     "id": "bulk",
     "n": "Bulk",
     "sub": "progress · per-row error log"
    }
   ]
  }
 ],
 "detail": {
  "cal": {
   "t": "Calendar",
   "d": "The calendar owns time: it is where people accept and move things. It also supplies attendees, but never the meeting type, even though it has an event type of its own.",
   "demo": "p/cross-system/who-owns"
  },
  "crm": {
   "t": "CRM",
   "d": "Judgement belongs to the CRM — a meeting type, a room note, a recap — because a person typed it."
  },
  "pair": {
   "t": "Paired rows",
   "d": "Matched at three levels, with four in-memory indexes and constant-time updates after a single edit."
  },
  "crm-only": {
   "t": "Only in CRM",
   "d": "A booked meeting whose invitation has not gone out yet — a server-side step, marked as such rather than pretended."
  },
  "cal-only": {
   "t": "Only in calendar",
   "d": "A meeting booked outside the CRM; shown so it can be adopted rather than silently ignored."
  },
  "time": {
   "t": "Time",
   "d": "Start, end and duration come from the calendar; the CRM is a source, chat and tracker never write them."
  },
  "judge": {
   "t": "Judgement",
   "d": "Meeting type, room note and recap are never overwritten from outside; several fields are written only on creation so a later sync cannot erase a human edit."
  },
  "deliv": {
   "t": "Delivery",
   "d": "The issue tracker is authoritative over its own delivery state; the CRM mirrors it."
  },
  "chat": {
   "t": "Chat",
   "d": "The whole chat column is source or never: chat is where a decision is made in conversation, not where it is stored."
  },
  "ok": {
   "t": "In sync",
   "d": "Both sides agree with the expected value."
  },
  "wrong": {
   "t": "Incorrect",
   "d": "The two sources disagree on a field the map can settle; the Expected column shows the answer."
  },
  "old": {
   "t": "Outdated",
   "d": "The calendar has moved on and the CRM row still shows the earlier time."
  },
  "nodates": {
   "t": "No dates",
   "d": "A row without usable dates on one side; flagged rather than compared."
  },
  "legend": {
   "t": "Diff legend",
   "d": "Six states in the diff view, so a person can see at a glance which side supplied what.",
   "demo": "p/event"
  },
  "create": {
   "t": "Create",
   "d": "All fields, once. Two fields are never written into the calendar because of length ceilings and one is truncated — each exclusion carries its reason next to it."
  },
  "update": {
   "t": "Update",
   "d": "Never the create-only fields, never the meeting type from outside — so a sync cannot erase a human edit."
  },
  "bulk": {
   "t": "Bulk",
   "d": "Bulk operations run with progress and a per-row error log; a row the platform refuses is shown with the platform’s reason."
  }
 }
}
```

</details>

## Constraints

- **Ambiguous matching** — The external identifier is missing on some records, so matching across the two systems is itself uncertain.
- **Length ceilings** — Two fields cannot be written into the calendar at all because of length limits, and one is truncated.
- **Wholesale subform writes** — A subform is replaced, not patched; anything not in the array being sent stops existing.
- **Live operations** — The migration had to land without sales noticing the ground shift, with the automation estate not firing on every loaded record.
- **Two kinds of time** — System fields are absolute instants; the business fields are wall-clock time in the event’s zone, stored as text, and a browser helper will silently substitute the device zone.

## Implementation

### The map

Written down as a table, it settles most arguments before they start. Time belongs to the calendar. Judgement belongs to the CRM. Delivery belongs to the tracker. Chat owns nothing. In the payload builder, create and update are separated: two fields are never written at all because of length ceilings, one is truncated, the meeting type is never overwritten from outside, and several fields are written only on creation so a sync cannot erase a human edit. Every exclusion carries its reason next to it.

### The screen

Three levels of matching with four in-memory indexes and constant-time updates after a single edit. Beside the two sources, a third column — the expected value — and a diff view with a six-state legend. A status column with five states, bulk operations with progress and a per-row error log. The rule is printed under the comparison, so the person clicking Repair can disagree with it.

### Two processes, one question each

Deciding whether a meeting was held or declined from the calendar means asking the calendar about every meeting every hour; deciding from the CRM alone never learns about cancellations. So one cheap hourly process moves rows from booked to held using CRM data, and one expensive monthly process asks the calendar about rows already held and marks cancellations — one month per run, capped at a few hundred rows, with the month a constant in the code so the run is reproducible.

### The migration

Source assessment, identity and field mapping, deterministic transformation in Python, Deluge and SQL, load sequencing with automation suppressed — bulk loads pass an empty trigger list — exception handling, and verification against reconciliation rules rather than record counts. The same pass moved years of free-text relations into junction modules: “which deals touch this business unit” is a query now, not a guess.

### Time follows the event

One rule: time follows the event, not the device. The offset is derived for the specific date, so daylight saving is included, and the string is assembled by hand; wall-clock text round-trips untouched. For the calendar API a forty-zone dictionary translates Windows zone names, and an unknown name yields null rather than a silent UTC — because the silent version once moved all thirteen meetings of a campaign by three hours with no message anywhere.

## Reliability and failure handling

What the tooling does when the two sides disagree, or the write cannot be trusted.

| When | What the system does |
| --- | --- |
| The external identifier is missing | Matching falls back through three levels; unmatched rows appear as only-in-CRM or only-in-calendar rather than being paired by guess. |
| A field is owned by the other system | The repair writes the expected value from the owner; a “source” system never overwrites an “owner”. |
| A value would exceed the calendar’s length ceiling | Two such fields are never written and one is truncated, by rule, with the reason recorded next to the exclusion. |
| A human edit would be overwritten by a resync | Create-only fields are skipped on update; buyer roles are restored through a composite key of address and role. |
| The write result comes back in one of three shapes | Success is checked three ways in sequence; a row locked by the state machine is counted as skipped, not failed. |
| A device zone leaks into a business field | The zone is pinned once from the event; the lookup stays as a warned fallback and the interface says when it fired. |

## My responsibility

The authority model, the reconciliation tooling and its screen, the two lifecycle processes, and the migration end to end — from source assessment to the reconciliation-based verification of the loads. Migration and reconciliation rules were written down and reviewed before the first load.

## Result

Disagreements between systems became a queue to work rather than an argument to have; the repair writes exactly what the record should say, and the rule is on the screen. One authoritative set of records after the migration, and a written answer to “why does this field disagree”.

## Interactive example

Встроено: [`event`](../pages/event.md) (вкладка «Calendar sync»).

## More examples

- [`event`](../pages/event.md) — The Calendar sync tab: five sync states, a three-way compare with the Expected column, and a repair that changes the row’s state.

## Technical notes

- [`cross-system/who-owns`](../pages/cross-system.md) — **Who owns the field?** Authority, reconciliation, and the human edit that has to survive an automatic resync.
- [`contact-model`](../pages/contact-model.md)

## Related cases

- [`orchestration`](./orchestration.md)
- [`enrichment`](./enrichment.md)
