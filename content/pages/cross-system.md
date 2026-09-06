---
page: "cross-system"
title: "Who is allowed to be right?"
type: "write-up (CASES → vCase)"
tab: "zoho"
group: "Connecting Teams, Slack and Jira to the CRM"
route: "#/p/cross-system"
kind: "note"
public: true
public_tab: "zoho"
case: "#/zoho/orchestration"
diagrams: 2
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"cross-system\""
  body_case: "src/app.html · CASES['Integration and sync'][0]"
---

# Who is allowed to be right?

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Field authority, reconciliation and refusal rules for systems that disagree.
>
> **Material labels** (`MAT`, публично не рендерятся): Architecture write-up
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> Integration becomes dangerous when transport is implemented before ownership. These cases start by naming which system owns each field, what may fill an empty value, what must never overwrite a person, and when automation must refuse rather than guess.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> Eight integrations across Teams, calendars, Jira and conference exports. No shared key, no second delivery, no shared permission model — and, in three of them, a deliberate stop short of full automation.

## Блок содержания (`contents`)

- **Who owns the field?** (`sec-who-owns`) — Authority, reconciliation, and the human edit that has to survive an automatic resync.
- **How does the sync resume?** (`sec-resume`) — Checkpoints, callbacks, and isolating a failure to the system that actually caused it.
- **When should automation refuse?** (`sec-refuse`) — Score thresholds, ambiguous matches, and the queue a person works instead.

## The common shape

Every one of these crosses a boundary the CRM does not own. On the other side sits a calendar that cannot be asked about every meeting, a chat card that cannot fetch a row, an events feed that never re-sends, a tracker whose files cannot be closed to a role, and a conference export whose company column is regularly wrong. None of that can be fixed from this side, so the work is deciding — in writing, before the code — what the CRM is allowed to believe, what it is allowed to overwrite, and where it should stop and hand the row to a person. Eight of those decisions follow, ordered by the question each one answers.

## Who owns the field?

Three of these are the same argument in different clothes: two systems hold a value, both have a legitimate claim to it, and something has to decide which one is allowed to be right. The answer is never “whichever wrote last”, because that rule silently prefers the system that runs most often over the one that knows most.

## Which system is allowed to be right

A meeting exists in a calendar, in the CRM, in a chat thread and in an issue. Each has a legitimate claim on part of it. Left alone, every sync overwrites the previous one and the humans stop trusting the record. Written down as a table, this settles most arguments before they start. Enforcement lives in the payload builder, where create and update are separated: two fields are never written at all because of length ceilings, one is truncated, and several are written only on creation so a sync cannot erase a human edit. The mechanism is what matters, so those fields are not named in the matrix below.

<!-- diagram · authority · вставляется после секции body[2] · источник: CASES · dgs[0] -->

### Диаграмма — матрица владения

_Alt-текст (`aria`, читается скринридером):_ Ownership matrix: eight meeting fields against Calendar, CRM, Chat and Issue tracker, with the rule Time belongs to the calendar, judgement belongs to the CRM, delivery belongs to the tracker, chat owns nothing

| Поле | Calendar | CRM | Chat | Issue tracker |
| --- | --- | --- | --- | --- |
| Start / end time | ● owner | ○ source | ▨ never | ▨ never |
| Duration | ● owner | ○ source | ▨ never | ▨ never |
| Attendees | ● owner | ○ source | ○ source | ▨ never |
| Meeting type | ▨ never | ● owner | ▨ never | ▨ never |
| Room note | ▨ never | ● owner | ▨ never | ▨ never |
| Recap | ▨ never | ● owner | ○ source | ▨ never |
| Delivery state | ▨ never | ○ source | ▨ never | ● owner |
| Link to issue | ▨ never | ○ source | ○ source | ● owner |

**Правило:** Time belongs to the calendar. Judgement belongs to the CRM. Delivery belongs to the tracker. Chat owns nothing.

**Оговорка:** Not every field is drawn. The payload builder that writes from the CRM into the calendar never writes two fields at all, because of length ceilings, and truncates a third; several others are written only on creation, so a later sync cannot erase a human edit. Those fields are not named here, so no row is marked create-only or truncated.

**Пояснения по клику** (`detail`):

- `start-end:cal` — **Start / end time — Calendar**
  The calendar owns time: it is where people accept and move things.
- `meeting-type:cal` — **Meeting type — never from the calendar**
  The meeting type is never taken from the calendar side, even though the calendar has an event type of its own.
- `meeting-type:crm` — **Meeting type — CRM owns it**
  A person typed it. Judgement belongs to the CRM.
- `room-note:crm` — **Room note — CRM owns it**
  A person typed it. Judgement belongs to the CRM.
- `recap:crm` — **Recap — CRM owns it**
  A person typed it. The recap is judgement, not a fact carried in from elsewhere.
- `delivery-state:tracker` — **Delivery state — tracker owns it**
  The issue tracker is authoritative over its own delivery state.
- `chat` — **Chat owns nothing**
  The whole Chat column is source or never — the chat is where a decision gets made in conversation, not where it is stored.
- `issue-link:tracker` — **Link to issue — the tracker owns it**
  The issue is the tracker’s own object; the CRM and the chat carry the key as a source.

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "authority",
 "at": 3,
 "aria": "Ownership matrix: eight meeting fields against Calendar, CRM, Chat and Issue tracker, with the rule Time belongs to the calendar, judgement belongs to the CRM, delivery belongs to the tracker, chat owns nothing",
 "cols": [
  {
   "id": "cal",
   "n": "Calendar"
  },
  {
   "id": "crm",
   "n": "CRM"
  },
  {
   "id": "chat",
   "n": "Chat"
  },
  {
   "id": "tracker",
   "n": "Issue tracker"
  }
 ],
 "rows": [
  {
   "id": "start-end",
   "n": "Start / end time"
  },
  {
   "id": "duration",
   "n": "Duration"
  },
  {
   "id": "attendees",
   "n": "Attendees"
  },
  {
   "id": "meeting-type",
   "n": "Meeting type"
  },
  {
   "id": "room-note",
   "n": "Room note"
  },
  {
   "id": "recap",
   "n": "Recap"
  },
  {
   "id": "delivery-state",
   "n": "Delivery state"
  },
  {
   "id": "issue-link",
   "n": "Link to issue"
  }
 ],
 "cells": {
  "start-end:cal": "owner",
  "start-end:crm": "source",
  "start-end:chat": "never",
  "start-end:tracker": "never",
  "duration:cal": "owner",
  "duration:crm": "source",
  "duration:chat": "never",
  "duration:tracker": "never",
  "attendees:cal": "owner",
  "attendees:crm": "source",
  "attendees:chat": "source",
  "attendees:tracker": "never",
  "meeting-type:cal": "never",
  "meeting-type:crm": "owner",
  "meeting-type:chat": "never",
  "meeting-type:tracker": "never",
  "room-note:cal": "never",
  "room-note:crm": "owner",
  "room-note:chat": "never",
  "room-note:tracker": "never",
  "recap:cal": "never",
  "recap:crm": "owner",
  "recap:chat": "source",
  "recap:tracker": "never",
  "delivery-state:cal": "never",
  "delivery-state:crm": "source",
  "delivery-state:chat": "never",
  "delivery-state:tracker": "owner",
  "issue-link:cal": "never",
  "issue-link:crm": "source",
  "issue-link:chat": "source",
  "issue-link:tracker": "owner"
 },
 "rule": "Time belongs to the calendar. Judgement belongs to the CRM. Delivery belongs to the tracker. Chat owns nothing.",
 "note": "Not every field is drawn. The payload builder that writes from the CRM into the calendar never writes two fields at all, because of length ceilings, and truncates a third; several others are written only on creation, so a later sync cannot erase a human edit. Those fields are not named here, so no row is marked create-only or truncated.",
 "detail": {
  "start-end:cal": {
   "t": "Start / end time — Calendar",
   "d": "The calendar owns time: it is where people accept and move things."
  },
  "meeting-type:cal": {
   "t": "Meeting type — never from the calendar",
   "d": "The meeting type is never taken from the calendar side, even though the calendar has an event type of its own."
  },
  "meeting-type:crm": {
   "t": "Meeting type — CRM owns it",
   "d": "A person typed it. Judgement belongs to the CRM."
  },
  "room-note:crm": {
   "t": "Room note — CRM owns it",
   "d": "A person typed it. Judgement belongs to the CRM."
  },
  "recap:crm": {
   "t": "Recap — CRM owns it",
   "d": "A person typed it. The recap is judgement, not a fact carried in from elsewhere."
  },
  "delivery-state:tracker": {
   "t": "Delivery state — tracker owns it",
   "d": "The issue tracker is authoritative over its own delivery state."
  },
  "chat": {
   "t": "Chat owns nothing",
   "d": "The whole Chat column is source or never — the chat is where a decision gets made in conversation, not where it is stored."
  },
  "issue-link:tracker": {
   "t": "Link to issue — the tracker owns it",
   "d": "The issue is the tracker’s own object; the CRM and the chat carry the key as a source."
  }
 }
}
```

</details>

## One field, two systems, and a rule about who wins

A meeting is held, or declined, or still booked. Deciding it from the calendar means asking the calendar about every meeting, every hour — impossible at any real volume. Deciding it from the CRM alone means never learning about cancellations, because a cancellation happens in the calendar and the CRM row simply becomes a past meeting that looks attended. So: two processes, each authoritative over exactly one thing. The hourly one works only from CRM data, computing an end time from the start plus the duration with two fallbacks, and moves a row from booked to held; it never touches a declined row, because that is a final state. The second and much more expensive one is authoritative over one question only — was this cancelled — and asks the calendar about rows already marked held, where a cancelled flag and a missing event both mean declined. It walks one month per run, capped at a few hundred rows, so a full year takes twelve passes and a cancelled meeting can sit mislabelled for a while: the deliberate price of not calling the calendar hourly for everything. The month is a constant in the code rather than a parameter — crude, but the run is then perfectly reproducible. The write result comes back in three different shapes depending on the path taken, so success is checked three ways in sequence; and a row locked by a state machine refuses the write with a marker buried inside the response body rather than a status code, so those are counted as skipped, not as failures, because they are neither.

## Keeping what a human typed through an automatic resync

Every time a meeting updates from the calendar, its participant list is rebuilt: internal people matched against the staff directory, external ones against the account’s contacts. But the calendar knows nothing about buyer roles — economic, technical, user, coach — and those are exactly what somebody sat down and worked out. So existing participants are read first and indexed by a composite key of address and role; for each external address the rebuild checks all four roles for an existing key before assigning anything, and restores the role it finds. Only a genuinely new person gets a default. Historic rows carry the old spelling of those roles, from before the picklist was renamed, so a second pass maps the old values onto the new ones rather than quietly dropping the classification on every record created before the rename. What stays risky is the write path: the roles live in a subform, and a subform is replaced wholesale rather than patched row by row, so anything not in the array being sent stops existing. The role-restoring logic makes the content correct and does nothing about that. Saying so is more useful than implying the problem is solved.

## How does the sync resume?

Three more are about what happens after a run stops halfway. Events are not re-sent, a person filling in a form is slower than any request will wait, and a corporate proxy fails in a way that looks exactly like the other system rejecting you. Each of these needed a checkpoint, a callback, or a way to prove which side actually broke.

## A receiver that repairs its own payload

Events are not re-sent. A rejected write is a lost event, and the reason is unknown in advance: a date format, a length, a missing mandatory field, or a duplicate rule. So a five-attempt loop reads the field name out of the CRM error and rewrites the payload between attempts — a missing mandatory field gets a marked placeholder, any other named field is dropped and the attempt repeats, and a duplicate error carrying a record id switches the operation from create to update. When the culprit cannot be identified the loop stops on purpose instead of spinning. Everything dropped or substituted comes back in the response, so the record is saved degraded but visible. Idempotency is separate: a rolling journal of processed event ids on the record itself, which means a very old event could in theory be processed twice — the alternative was a record and an API call per event. A placeholder in a mandatory field puts marked rubbish in the data, which still beats a missing record.

## A two-card wizard in a chat, with nothing held open

A person takes minutes to fill in a form; a synchronous call has seconds. The trigger has to answer quickly, and a card is not an application: it has no state, cannot fetch more rows, and ends when it is submitted. Holding the request open while somebody thinks is not slow — it is impossible. So every human step is a callback subscription rather than a wait: the card posts, the flow suspends, the answer arrives as a new event. Around the card sits a loop — the card reports which button was pressed, and if it was a search rather than a submit, the loop reissues the card with fresh results, which is how a search across hundreds of accounts happens inside something that cannot fetch. The loop is bounded, a fixed number of iterations and half an hour, so a card somebody forgot about cannot hold a run open indefinitely. One detail is worth keeping: a dropdown returns exactly one value, so when the opportunity already linked to the meeting belongs to a different account it travels as a marked value — a prefix the saving function recognises and strips — and both ends know the choice was deliberate, through a control that cannot carry a flag. The first design edited the previous card in place, which meant tracking message identifiers and lost a race whenever two events arrived close together; replacing the card instead costs a little clutter in the chat and removes the entire class of problem.

## Attachments as links, after proving the proxy was the problem

Three constraints at once. The tracker is only reachable through a corporate proxy; the proxy answers the upload endpoint with 200 and an empty body, and no attachment appears; and the tracker itself cannot limit a file by visibility — a comment can be closed to a role, a file is visible to everyone who can see the issue, and the files that needed closing were the ones with rates in them. Localisation came by experiment rather than guesswork: downloading from storage works; building a multipart body works and 160 KB takes 0.88 seconds, so the bytes really do leave; JSON endpoints through the same proxy answer with content, including validation errors. Conclusion: the multipart body is what is lost. The fix is not a file but a remote link — a JSON call carrying a stable global id. JSON passes the proxy, the global id makes a ten-minute sync idempotent, and the link inherits the permissions of the storage it points at, which solves the third problem too. The file is not physically in the tracker, so someone without access to the folder hits a login — accepted deliberately, because the alternative hands rates to everyone who can open the issue.

## When should automation refuse?

The last two are the ones where the correct behaviour was to stop. Both had enough evidence to make a confident guess and not enough to be right, and a confident wrong link is more expensive than no link at all — it gets believed. Both end in a queue a person works rather than a decision the system made alone.

## Matching transcripts by score, not by key

A transcript arrives with its own identifier, its own clock and its own attendee list. Time is the only shared signal, and it is weak: a sixty-minute meeting may have run twenty-two, so “same time” becomes an overlap problem between intervals of different length. The answer is a score rather than a boolean. Overlap is measured as two coverage ratios and the larger is taken, so a meeting nested inside another still scores full, with a penalty proportional to the duration gap subtracted. Modifiers follow: a service hint, e-mail addresses lifted out of the transcript body and intersected with the attendee list, a penalty when a transcript already exists. The strongest modifier is the recording owner — a bonus when they are present, a penalty when the attendee list is populated and they are not. Above the score sits a gate: if the owner is known and the best candidate does not contain them, a second pass runs, and if nothing qualifies the automatic link is refused outright. Two thresholds instead of one: the link is written above forty, the transcript text is only copied into the meeting above sixty. “I think this is the meeting” and “I am willing to write data into it” are deliberately different decisions, and every candidate is kept with its score for a human to review.

## Sorting a conference export into buckets instead of matching it

Several hundred rows, no shared key with anything, and half the company names in the file are wrong. There is no single identifier: profile URLs are written differently on each side, email is missing for many people, the company column is regularly wrong, and enrichment names are sometimes mangled. So not a match — a classification, worked independently per bucket, as the funnel below sets out. Three write rules are what make the tool safe to run twice: a name is corrected only when the surname differs, because otherwise every Alex becomes an Alexander; title and email are filled only into an empty field and never over a live value; and everything else that merely differs is reported for a human to look at.

<!-- diagram · funnel · вставляется после секции body[11] · источник: CASES · dgs[0] -->

### Диаграмма — воронка

_Alt-текст (`aria`, читается скринридером):_ Funnel from a conference export through four ordered rules to seven outcome buckets, two of them worked by a person

**Вход:** Conference export (several hundred rows)

**Правила по порядку:**
1. Profile lookup by slug, path anchor
2. Account check
3. Email
4. Name, tie-break: account then email

**Гейты:**
- после `name`: no candidate resolves → ambiguous with the candidates attached, never the first one

**Корзины:**
- Matched by profile — автоматически
- Matched, account disagrees — автоматически
- Matched by email or name — автоматически
- Needs enrichment — автоматически
- Created from enrichment — автоматически
- Ambiguous — разбирает человек
- Unresolved — разбирает человек

**Пояснения по клику** (`detail`):

- `profile` — **Profile lookup by slug, with a path anchor**
  Done on the slug with a path anchor rather than the whole URL, so an extended slug and a trailing slash both still hit, while the anchor stops a slug matching in the middle of somebody else’s address.
- `account` — **Account check**
  First tie-breaker when several candidates come back.
- `email` — **Email**
  Second tie-breaker, run only after account.
- `name` — **Name, fixed tie-break order**
  Tie-breakers run in a fixed order — account first, then email — and if none resolves it, the row goes to ambiguous with the candidates attached rather than taking the first.
- `matched-profile` — **Matched by profile**
  The strongest signal: a direct profile-URL hit.
- `matched-disagree` — **Matched, account disagrees**
  A profile match exists, but the account on the row does not agree with it — reported rather than silently trusted.
- `matched-email-name` — **Matched by email or name**
  Resolved through the tie-break chain: account first, then email.
- `needs-enrichment` — **Needs enrichment**
  No match yet; queued for the enrichment provider.
- `created-enrichment` — **Created from enrichment**
  A new contact created from what enrichment returned.
- `ambiguous` — **Ambiguous — worked by a person**
  The tool deliberately does not push for full automation. No candidate resolves → ambiguous with the candidates attached, never the first one.
- `unresolved` — **Unresolved — worked by a person**
  Nothing matched at all; left for a human rather than guessed.

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "funnel",
 "at": 12,
 "aria": "Funnel from a conference export through four ordered rules to seven outcome buckets, two of them worked by a person",
 "input": {
  "n": "Conference export",
  "count": "several hundred rows"
 },
 "rules": [
  {
   "id": "profile",
   "n": "Profile lookup by slug, path anchor",
   "order": 1
  },
  {
   "id": "account",
   "n": "Account check",
   "order": 2
  },
  {
   "id": "email",
   "n": "Email",
   "order": 3
  },
  {
   "id": "name",
   "n": "Name, tie-break: account then email",
   "order": 4
  }
 ],
 "buckets": [
  {
   "id": "matched-profile",
   "n": "Matched by profile",
   "who": "auto"
  },
  {
   "id": "matched-disagree",
   "n": "Matched, account disagrees",
   "who": "auto"
  },
  {
   "id": "matched-email-name",
   "n": "Matched by email or name",
   "who": "auto"
  },
  {
   "id": "needs-enrichment",
   "n": "Needs enrichment",
   "who": "auto"
  },
  {
   "id": "created-enrichment",
   "n": "Created from enrichment",
   "who": "auto"
  },
  {
   "id": "ambiguous",
   "n": "Ambiguous",
   "who": "human"
  },
  {
   "id": "unresolved",
   "n": "Unresolved",
   "who": "human"
  }
 ],
 "gates": [
  {
   "after": "name",
   "n": "no candidate resolves → ambiguous with the candidates attached, never the first one"
  }
 ],
 "detail": {
  "profile": {
   "t": "Profile lookup by slug, with a path anchor",
   "d": "Done on the slug with a path anchor rather than the whole URL, so an extended slug and a trailing slash both still hit, while the anchor stops a slug matching in the middle of somebody else’s address."
  },
  "account": {
   "t": "Account check",
   "d": "First tie-breaker when several candidates come back."
  },
  "email": {
   "t": "Email",
   "d": "Second tie-breaker, run only after account."
  },
  "name": {
   "t": "Name, fixed tie-break order",
   "d": "Tie-breakers run in a fixed order — account first, then email — and if none resolves it, the row goes to ambiguous with the candidates attached rather than taking the first."
  },
  "matched-profile": {
   "t": "Matched by profile",
   "d": "The strongest signal: a direct profile-URL hit."
  },
  "matched-disagree": {
   "t": "Matched, account disagrees",
   "d": "A profile match exists, but the account on the row does not agree with it — reported rather than silently trusted."
  },
  "matched-email-name": {
   "t": "Matched by email or name",
   "d": "Resolved through the tie-break chain: account first, then email."
  },
  "needs-enrichment": {
   "t": "Needs enrichment",
   "d": "No match yet; queued for the enrichment provider."
  },
  "created-enrichment": {
   "t": "Created from enrichment",
   "d": "A new contact created from what enrichment returned."
  },
  "ambiguous": {
   "t": "Ambiguous — worked by a person",
   "d": "The tool deliberately does not push for full automation. No candidate resolves → ambiguous with the candidates attached, never the first one."
  },
  "unresolved": {
   "t": "Unresolved — worked by a person",
   "d": "Nothing matched at all; left for a human rather than guessed."
  }
 }
}
```

</details>

## What the eight have in common

Three habits, and they are the actual content of this page. Write the ownership rule down before the code, because a rule that lives only in someone’s head gets re-decided on every sync. Separate “I think this is right” from “I am willing to write it” — the two thresholds in the transcript matcher, the create-versus-update split in the payload builder, the fill-only-into-an-empty-field rule in the import. And leave the ambiguous rows to a person on purpose: the funnel above ends in two human buckets, the transcript matcher refuses a link rather than guessing, and the receiver itemises what it dropped instead of hiding it. Each of those costs throughput, and each was the right trade at this volume. Where it is not — the wholesale subform write, the month-long lag on a cancellation, the rolling idempotency journal — is named in the sections above rather than smoothed over.

## See it live

Блок-callout внизу страницы ведёт на `#/p/event` — One event system, end to end.
