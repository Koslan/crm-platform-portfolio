---
case: "orchestration"
num: "02"
title: "Multi-system synchronisation and CRM orchestration"
route: "#/zoho/orchestration"
public: true
embed: null
examples: ["event","board"]
notes: ["cross-system/who-owns","cross-system/resume"]
related: ["reconciliation","teams-crm"]
words: 1049
source:
  body: "src/cases.js · CASES[1] (slug \"orchestration\")"
  furniture: "src/app.html · vCaseStudy()"
---

# 02 · Multi-system synchronisation and CRM orchestration

> **Kicker** (`kicker`): Microsoft Graph · Deluge · delta tokens · reconciliation
>
> **Одной строкой** (`one`): One business process spread across the CRM, seventeen calendars, mailboxes, meeting providers and the team’s own screens — with the CRM deciding what is current, what to write and when to stop.

## Summary

- **What:** Zoho CRM as the orchestration point for a process whose state lives in several external systems at once — calendars, mailboxes, meeting providers, chat — each of which changes independently.
- **Scale:** Seventeen shared mailboxes under delta sync, an event lifecycle from target list to reconciled calendar, a chat import every ten minutes, a monthly forced resync — running unattended for two years.
- **My role:** Architecture, implementation, the reliability model and production support.
- **Key topics:** delta tokens · checkpoints · pagination · throttling · idempotency · identity resolution · reconciliation

## Key facts

| | |
| --- | --- |
| Mailboxes | 17, one delta token each |
| Checkpoint | written after every page, not per run |
| Error classes | three, each with its own reaction |
| Schedules | every 10 minutes · monthly full resync |
| Lifecycle | booked → held → declined, two processes |
| Alerting | each sync reports its own health to Slack |

## Context

A meeting at a trade show exists in four places at once. It is booked on a CRM record; it is an invitation in an Outlook calendar; it is a Teams meeting with a join link and, later, a transcript; it is a thread in a chat where the follow-up is discussed. Each of those systems holds part of the state and any of them can change without telling the others: a client declines in the calendar, a salesperson moves the room in the CRM, the meeting runs twenty minutes instead of sixty.

The team must not become the integration. Nobody should forward invitations, retype recaps, or work out which system is currently right. The CRM had to become the place where the process is managed: it links the entities across systems, decides which side owns which field, runs the automation that follows a change, never repeats an operation, keeps going after a partial failure, and gives people one screen to see and repair the state.

## Architecture

Not “Graph to Zoho”. Several systems feed one integration layer that resolves identity, maps fields, pages, retries, checkpoints and reconciles; the layer writes into the CRM domain; automation and functions react to the change; and custom screens give people a view of the state and a way to act on it without leaving the record. The backend integration and the frontend tooling were designed as one system.

<!-- diagram · layers · вставляется после секции body[0] · источник: CASES[1].architecture.dg -->

### Диаграмма — слои архитектуры

_Alt-текст (`aria`, читается скринридером):_ External calendars, mail, meeting providers and chat feed an integration and sync layer; the layer writes into the Zoho CRM domain; automation and functions react; a custom interaction layer sits on top


**External systems**
- **Calendar** — Graph · 17 mailboxes
- **Mail** — Graph · several sources
- **Meeting providers** — Teams · transcripts
- **Chat** — Teams channels
- **Google Calendar** — events from the CRM

↓ _webhooks · polling · schedules · user-triggered runs_

**Integration / sync layer**
- **Identity resolution** — record ↔ event ↔ meeting ↔ thread
- **Mapping** — create and update kept apart
- **Pagination** — pre-built page list, completion flag
- **Retry / throttling** — three error classes
- **Idempotency** — markers · journals of event ids
- **Checkpoints** — per page
- **Reconciliation** — authority map → expected value

↓ _writes that are safe to repeat_

**Zoho CRM domain** (ядро)
- **Accounts · Contacts · Deals · Events** — standard modules
- **Custom modules** — meetings · participants · journals
- **State / lifecycle** — booked → held → declined

↓ _rules · schedules · functions_

**Automation**
- **Hourly process** — booked → held from CRM data
- **Monthly process** — asks the calendar: was it cancelled?
- **Participant rebuild** — keeps buyer roles
- **Health reports** — to Slack

↓ _one screen over several systems_

**Custom interaction layer**
- **Reconciliation screen** — expected value · repair
- **Meeting schedule** — sync state per row
- **Booking wizard** — free/busy from CRM records
- **Mobile recap sheet** — writes back

**Пояснения по клику** (`detail`):

- `cal` — **Calendar**
  Seventeen shared mailboxes read through Graph delta queries. Throttling slows a mailbox instead of failing it; an invalid token falls back to a full read in the same run.
  _ссылка: #/zoho/orchestration_
- `mail` — **Mail**
  A server-side pipeline carries mail out of several sources and mailboxes into the CRM: deduplicated, matched to the account and deal, attached where sales looks.
- `meet` — **Meeting providers**
  A join link becomes an online-meeting id; transcripts appear minutes after the meeting, so nothing in the pipeline waits for them.
  _ссылка: #/zoho/teams-crm_
- `chat` — **Chat**
  Threads mapped to deals by a text contract in the first message; five channels a run, every ten minutes.
  _ссылка: #/zoho/jira-sync_
- `gcal` — **Google Calendar**
  Events created and viewed from the CRM, with overlap prevention and meetings linked to accounts and contracts.
- `ident` — **Identity resolution**
  The same meeting has a CRM id, a calendar event id, an online-meeting id and a thread. Each link is stored on the record, so the next run resolves by id rather than by guess.
- `map` — **Mapping**
  Create and update are separated in the payload builder. Several fields are written only on creation so a later sync cannot erase a human edit.
  _ссылка: #/p/cross-system/who-owns_
- `page` — **Pagination**
  The language has no while loop, so paging walks a pre-built list of page numbers with a completion flag; the schedule calling the function again is the loop.
- `retry` — **Retry and throttling**
  An invalid token: full read in the same run. Throttled: stop the mailbox, keep the checkpoint. A missing item: mark the mailbox skipped. Three classes, three reactions, written down.
- `idem` — **Idempotency**
  A rolling journal of processed event ids on the record, markers inside comment bodies, and create-versus-update semantics — so a run every ten minutes never posts twice.
  _ссылка: #/p/cross-system/resume_
- `cp` — **Checkpoints**
  Written after every page, not at the end. A run that dies on page forty loses nothing; the next scheduled run continues from the saved page.
- `recon` — **Reconciliation**
  A third column beside the two sources — the expected value, computed from an authority map — and a repair that writes exactly that.
  _ссылка: #/zoho/reconciliation_
- `recs` — **Standard modules**
  Accounts, contacts and deals carry the links to the external entities; the events module carries the campaign the meetings belong to.
- `cust` — **Custom modules**
  Meetings with a participant subform, journals of what automation did, and the module that carries the sync stage each pipeline reached.
- `life` — **State and lifecycle**
  Booked, held or declined. Declined is final; held is derived from time; only the calendar can say “cancelled”.
  _ссылка: #/p/cross-system/who-owns_
- `hourly` — **Hourly process**
  Works only from CRM data: computes an end time from start plus duration with two fallbacks and moves a row from booked to held. Cheap, so it can run every hour.
- `monthly` — **Monthly process**
  Authoritative over one question — was this cancelled — and asks the calendar only about rows already marked held, one month per run, capped at a few hundred rows.
- `rebuild` — **Participant rebuild**
  On every calendar update the participant list is rebuilt, and the buyer roles a person typed are restored through a composite key of address and role.
  _ссылка: #/p/cross-system/who-owns_
- `alerts` — **Health reports**
  Each sync classifies its own failures and reports them to Slack; time-to-notice for a broken sync dropped from days to minutes.
- `recap` — **Reconciliation screen**
  Five sync states, a three-way compare with an Expected column, the rule printed under it, bulk repair with a per-row error log.
  _ссылка: #/p/event_
- `sched` — **Meeting schedule**
  The Meetings tab of a campaign record carries the sync state of every row next to its time, room and attendees.
  _ссылка: #/p/event_
- `wiz` — **Booking wizard**
  Free/busy is computed from CRM records — rooms and people — because personal calendars are unreachable from a browser widget, and the interface says so.
  _ссылка: #/p/event_
- `sheet` — **Mobile recap sheet**
  A recap written on a phone lands on the meeting record; the rephrase runs server-side so no key is in the page.
  _ссылка: #/p/board_

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "layers",
 "aria": "External calendars, mail, meeting providers and chat feed an integration and sync layer; the layer writes into the Zoho CRM domain; automation and functions react; a custom interaction layer sits on top",
 "rows": [
  {
   "id": "ext",
   "label": "External systems",
   "nodes": [
    {
     "id": "cal",
     "n": "Calendar",
     "sub": "Graph · 17 mailboxes"
    },
    {
     "id": "mail",
     "n": "Mail",
     "sub": "Graph · several sources"
    },
    {
     "id": "meet",
     "n": "Meeting providers",
     "sub": "Teams · transcripts"
    },
    {
     "id": "chat",
     "n": "Chat",
     "sub": "Teams channels"
    },
    {
     "id": "gcal",
     "n": "Google Calendar",
     "sub": "events from the CRM"
    }
   ]
  },
  {
   "arrow": "webhooks · polling · schedules · user-triggered runs"
  },
  {
   "id": "sync",
   "label": "Integration / sync layer",
   "nodes": [
    {
     "id": "ident",
     "n": "Identity resolution",
     "sub": "record ↔ event ↔ meeting ↔ thread"
    },
    {
     "id": "map",
     "n": "Mapping",
     "sub": "create and update kept apart"
    },
    {
     "id": "page",
     "n": "Pagination",
     "sub": "pre-built page list, completion flag"
    },
    {
     "id": "retry",
     "n": "Retry / throttling",
     "sub": "three error classes"
    },
    {
     "id": "idem",
     "n": "Idempotency",
     "sub": "markers · journals of event ids"
    },
    {
     "id": "cp",
     "n": "Checkpoints",
     "sub": "per page"
    },
    {
     "id": "recon",
     "n": "Reconciliation",
     "sub": "authority map → expected value"
    }
   ]
  },
  {
   "arrow": "writes that are safe to repeat"
  },
  {
   "id": "crm",
   "label": "Zoho CRM domain",
   "core": true,
   "nodes": [
    {
     "id": "recs",
     "n": "Accounts · Contacts · Deals · Events",
     "sub": "standard modules"
    },
    {
     "id": "cust",
     "n": "Custom modules",
     "sub": "meetings · participants · journals"
    },
    {
     "id": "life",
     "n": "State / lifecycle",
     "sub": "booked → held → declined"
    }
   ]
  },
  {
   "arrow": "rules · schedules · functions"
  },
  {
   "id": "auto",
   "label": "Automation",
   "nodes": [
    {
     "id": "hourly",
     "n": "Hourly process",
     "sub": "booked → held from CRM data"
    },
    {
     "id": "monthly",
     "n": "Monthly process",
     "sub": "asks the calendar: was it cancelled?"
    },
    {
     "id": "rebuild",
     "n": "Participant rebuild",
     "sub": "keeps buyer roles"
    },
    {
     "id": "alerts",
     "n": "Health reports",
     "sub": "to Slack"
    }
   ]
  },
  {
   "arrow": "one screen over several systems"
  },
  {
   "id": "ui",
   "label": "Custom interaction layer",
   "nodes": [
    {
     "id": "recap",
     "n": "Reconciliation screen",
     "sub": "expected value · repair"
    },
    {
     "id": "sched",
     "n": "Meeting schedule",
     "sub": "sync state per row"
    },
    {
     "id": "wiz",
     "n": "Booking wizard",
     "sub": "free/busy from CRM records"
    },
    {
     "id": "sheet",
     "n": "Mobile recap sheet",
     "sub": "writes back"
    }
   ]
  }
 ],
 "detail": {
  "cal": {
   "t": "Calendar",
   "d": "Seventeen shared mailboxes read through Graph delta queries. Throttling slows a mailbox instead of failing it; an invalid token falls back to a full read in the same run.",
   "demo": "zoho/orchestration"
  },
  "mail": {
   "t": "Mail",
   "d": "A server-side pipeline carries mail out of several sources and mailboxes into the CRM: deduplicated, matched to the account and deal, attached where sales looks."
  },
  "meet": {
   "t": "Meeting providers",
   "d": "A join link becomes an online-meeting id; transcripts appear minutes after the meeting, so nothing in the pipeline waits for them.",
   "demo": "zoho/teams-crm"
  },
  "chat": {
   "t": "Chat",
   "d": "Threads mapped to deals by a text contract in the first message; five channels a run, every ten minutes.",
   "demo": "zoho/jira-sync"
  },
  "gcal": {
   "t": "Google Calendar",
   "d": "Events created and viewed from the CRM, with overlap prevention and meetings linked to accounts and contracts."
  },
  "ident": {
   "t": "Identity resolution",
   "d": "The same meeting has a CRM id, a calendar event id, an online-meeting id and a thread. Each link is stored on the record, so the next run resolves by id rather than by guess."
  },
  "map": {
   "t": "Mapping",
   "d": "Create and update are separated in the payload builder. Several fields are written only on creation so a later sync cannot erase a human edit.",
   "demo": "p/cross-system/who-owns"
  },
  "page": {
   "t": "Pagination",
   "d": "The language has no while loop, so paging walks a pre-built list of page numbers with a completion flag; the schedule calling the function again is the loop."
  },
  "retry": {
   "t": "Retry and throttling",
   "d": "An invalid token: full read in the same run. Throttled: stop the mailbox, keep the checkpoint. A missing item: mark the mailbox skipped. Three classes, three reactions, written down."
  },
  "idem": {
   "t": "Idempotency",
   "d": "A rolling journal of processed event ids on the record, markers inside comment bodies, and create-versus-update semantics — so a run every ten minutes never posts twice.",
   "demo": "p/cross-system/resume"
  },
  "cp": {
   "t": "Checkpoints",
   "d": "Written after every page, not at the end. A run that dies on page forty loses nothing; the next scheduled run continues from the saved page."
  },
  "recon": {
   "t": "Reconciliation",
   "d": "A third column beside the two sources — the expected value, computed from an authority map — and a repair that writes exactly that.",
   "demo": "zoho/reconciliation"
  },
  "recs": {
   "t": "Standard modules",
   "d": "Accounts, contacts and deals carry the links to the external entities; the events module carries the campaign the meetings belong to."
  },
  "cust": {
   "t": "Custom modules",
   "d": "Meetings with a participant subform, journals of what automation did, and the module that carries the sync stage each pipeline reached."
  },
  "life": {
   "t": "State and lifecycle",
   "d": "Booked, held or declined. Declined is final; held is derived from time; only the calendar can say “cancelled”.",
   "demo": "p/cross-system/who-owns"
  },
  "hourly": {
   "t": "Hourly process",
   "d": "Works only from CRM data: computes an end time from start plus duration with two fallbacks and moves a row from booked to held. Cheap, so it can run every hour."
  },
  "monthly": {
   "t": "Monthly process",
   "d": "Authoritative over one question — was this cancelled — and asks the calendar only about rows already marked held, one month per run, capped at a few hundred rows."
  },
  "rebuild": {
   "t": "Participant rebuild",
   "d": "On every calendar update the participant list is rebuilt, and the buyer roles a person typed are restored through a composite key of address and role.",
   "demo": "p/cross-system/who-owns"
  },
  "alerts": {
   "t": "Health reports",
   "d": "Each sync classifies its own failures and reports them to Slack; time-to-notice for a broken sync dropped from days to minutes."
  },
  "recap": {
   "t": "Reconciliation screen",
   "d": "Five sync states, a three-way compare with an Expected column, the rule printed under it, bulk repair with a per-row error log.",
   "demo": "p/event"
  },
  "sched": {
   "t": "Meeting schedule",
   "d": "The Meetings tab of a campaign record carries the sync state of every row next to its time, room and attendees.",
   "demo": "p/event"
  },
  "wiz": {
   "t": "Booking wizard",
   "d": "Free/busy is computed from CRM records — rooms and people — because personal calendars are unreachable from a browser widget, and the interface says so.",
   "demo": "p/event"
  },
  "sheet": {
   "t": "Mobile recap sheet",
   "d": "A recap written on a phone lands on the meeting record; the rephrase runs server-side so no key is in the page.",
   "demo": "p/board"
  }
 }
}
```

</details>

## Constraints

- **No background workers** — Everything periodic runs through scheduled Deluge functions that share one quota and one timeout, and the language has no while loop.
- **No persistent storage for sync state** — A delta token has to live somewhere between runs; the only place a scheduled function can keep state is a variable written through a connector call.
- **Four sources of change** — Some events arrive through webhooks, some are polled, some come from a schedule, some are started by a person, and a transcript becomes available only minutes after the meeting.
- **Partial failure is normal** — A single run can update three systems and be throttled by the fourth. The process cannot be one synchronous transaction.
- **Human input must survive** — Buyer roles typed by a person, a meeting type, a room note — none of it may be erased by the next automatic resync.

## Implementation

### The event lifecycle

A target list of contacts is filtered to accounts with no meeting yet. The booking wizard checks who and what is free from the meetings already in the CRM and books; sending the calendar invitation is a server-side step, and the row is marked accordingly until the delta sync brings the calendar’s answer back. From then on the calendar and the CRM disagree in five known ways — in sync, incorrect, outdated, only in the CRM, only in the calendar — and the reconciliation screen shows each row with the value the record should have.

### Incremental calendar sync

One delta token per mailbox, kept in a variable written through a connector call. A run walks a pre-built list of page numbers with a completion flag, writes each page to the CRM before requesting the next, and saves the checkpoint after every page. An invalid token is cleared and the run falls back to a full delta in the same execution; throttling stops the mailbox but deliberately leaves the checkpoint alone; a missing item marks the mailbox skipped. Once a month a forced full resync clears the drift that deltas accumulate. Events deleted upstream are counted and logged but not removed, so history attached to deals survives.

### Deciding the meeting state

Deciding “held or declined” from the calendar would mean asking it about every meeting every hour. Deciding from the CRM alone would never learn about cancellations. So two processes, each authoritative over exactly one thing: an hourly one that works from CRM data and moves rows from booked to held, and a monthly one that asks the calendar about rows already held, walks one month per run and marks a cancelled flag or a missing event as declined. Declined is final and neither process touches it.

### Keeping what a person typed

Every calendar update rebuilds the participant list — internal people against the staff directory, external ones against the account’s contacts. The calendar knows nothing about buyer roles, and those are exactly what somebody worked out. Existing participants are read first and indexed by address and role; the rebuild checks all four roles for an existing key before assigning anything, and a second pass maps the old spelling of the roles onto the new one so records created before the picklist was renamed keep their classification.

### The token layer and the transport

All outbound calls share one token layer: cached, refreshed a minute before expiry; an authorisation failure clears the cache and retries once, then fails loudly. A rate-limit response is answered with the interval the server asks for, falling back to a linear backoff with a ceiling. Page sizes are lower than the default for heavy calendars — slower runs, but they stopped failing.

## Reliability and failure handling

What happens when the run does not follow the happy path.

| When | What the system does |
| --- | --- |
| Invalid or expired delta token | The variable is cleared and the mailbox is re-read in full within the same run; the next run is incremental again. |
| Throttled by the calendar API | The mailbox stops for this run; the checkpoint is left where it is; the other sixteen mailboxes continue. |
| Hard function timeout mid-run | The pages already written stay written; the saved checkpoint and the mailbox status guarantee the next scheduled run continues from the last completed page. |
| A run repeats over the same data | Create and update are separate operations; processed event ids sit in a rolling journal on the record; the second pass finds its own marks and steps over them. |
| A client cancels in the calendar | The hourly process cannot see it; the monthly process asks the calendar about held rows and marks the row declined — a cancelled meeting can sit mislabelled for a while, and that cost was taken deliberately. |
| A row locked by the Blueprint | The write is refused with a marker inside the response body rather than a status code; those rows are counted as skipped, not as failures, because they are neither. |
| A sync breaks silently | It does not: each sync classifies its failures and reports its own health to Slack; the first alert is no longer a salesperson noticing stale data. |

## Data ownership and security

Every Microsoft integration runs on app registrations with permission scopes cut to least privilege and secrets rotated on schedule. Credentials live in the platform’s connections and never appear in code; the bulk loads that suppress automation pass an empty trigger list, and legitimate automation is caught up separately afterwards — a decision made consciously rather than discovered.

## My responsibility

Architecture, implementation, the reliability model and production support, as the platform’s primary engineer. The integration contract with each connected system — auth model, failure classes, retry policy, reconciliation rule — was written down before the first call and kept next to the code.

## Result

Booked meetings reach the CRM within minutes of appearing in a calendar, without anyone forwarding invitations. The syncs recovered from every token failure mode seen in production and ran unattended for two years; a mailbox that breaks reports itself instead of drifting. Disagreements between the calendar and the CRM became a queue to work rather than an argument to have.

## More examples

- [`event`](../pages/event.md) — The Meetings tab and the Calendar sync tab of a campaign record: sync states per row, and the reconciliation table with its Expected column.
- [`board`](../pages/board.md) — The same event on a phone, with a recap sheet that writes back to the meeting record.

## Technical notes

- [`cross-system/who-owns`](../pages/cross-system.md) — **Who owns the field?** Authority, reconciliation, and the human edit that has to survive an automatic resync.
- [`cross-system/resume`](../pages/cross-system.md) — **How does the sync resume?** Checkpoints, callbacks, and isolating a failure to the system that actually caused it.

## Related cases

- [`reconciliation`](./reconciliation.md)
- [`teams-crm`](./teams-crm.md)
