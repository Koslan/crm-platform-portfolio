---
case: "jira-sync"
num: "04"
title: "Teams → CRM → Jira: one thread, three systems, and who owns what"
route: "#/zoho/jira-sync"
public: true
embed: "chat-tracker"
examples: ["chat-tracker"]
notes: ["cross-system/resume","cross-system/who-owns"]
related: ["teams-crm","widgets"]
words: 1112
source:
  body: "src/cases.js · CASES[3] (slug \"jira-sync\")"
  furniture: "src/app.html · vCaseStudy()"
---

# 04 · Teams → CRM → Jira: one thread, three systems, and who owns what

> **Kicker** (`kicker`): Routing by the thread root · idempotency in two systems · one-way on purpose
>
> **Одной строкой** (`one`): A tagged reply in a Teams thread becomes the right Jira comment without re-entry: the thread carries the routing code, the CRM carries routing and delivery state, Jira owns the issue and its visibility — and every ten-minute run is safe to replay.

## Summary

- **What:** A sync from Teams channels through Zoho CRM into Jira: threads resolved to deals by a code in their root message, tagged replies posted as public or role-restricted comments, delivery state and idempotency held in the CRM, attachments as links.
- **Scale:** A resumable importer every ten minutes over a channel registry that business users maintain on the deal record; a sync that never posts twice and never guesses a destination.
- **My role:** Architecture, the routing rule, the functions on the CRM side and the operating model.
- **Key topics:** thread-root routing · CRM as state store · idempotency markers · restricted comments · remote links · one-way by design

## Key facts

| | |
| --- | --- |
| Routing | a code in the thread’s root message, inherited by every reply |
| Registry | which channels to read, on the deal record |
| Idempotency | a delivery flag in the CRM and a marker inside the Jira comment |
| Visibility | #jira public · #jira_private locked to a Jira project role |
| Attachments | names as links back to the thread, never uploads |
| Run | every 10 minutes · bounded Graph window · resumable |

## Context

Deals are discussed in Teams threads and delivered in Jira. Engineering asks what was agreed with the client and the answer is in a chat; sales asks what engineering is doing on the deal and the answer lives in issue comments behind a licence they do not have. None of it reached the deal record, and nobody was going to retype it.

Three constraints shaped the design at once. A channel is not a deal — one channel carries several discussions, so any “channel equals deal” rule is wrong on the cases that matter most. Building an app inside the chat client was not going to be approved in a reasonable timescale. And the tracker sits behind a corporate proxy that has opinions about request bodies.

## Architecture

The thread carries its own routing. The CRM holds the registry of which channels to read, resolves each thread to a deal from the code in its root message, stores the messages with their delivery state, and posts the tagged ones to the issue as comments carrying a hidden marker. Jira owns the issue and its visibility; the CRM mirrors the delivery status onto the deal; replies never flow back into the thread.

<!-- diagram · layers · вставляется после секции body[0] · источник: CASES[3].architecture.dg -->

### Диаграмма — слои архитектуры

_Alt-текст (`aria`, читается скринридером):_ Teams channels are read through a registry on the deal; threads are resolved to deals by the code in their root message; messages and delivery state are stored in the CRM; tagged replies become idempotent Jira comments; delivery status is mirrored to the deal


**Microsoft Teams**
- **Channels** — listed on the deal record
- **Thread root** — carries the routing code
- **Tagged replies** — #jira · #jira_private

↓ _every 10 minutes · a bounded Graph window · resumable_

**Resolution**
- **Code in the root** — resolved once per thread
- **Deal match** — inherited by every reply
- **No code → skipped** — reported, never guessed

**Zoho CRM** (ядро)
- **Channel registry** — which channels to read at all
- **Messages module** — ids · routing · delivery flag
- **Deal** — threads · delivery status

↓ _marker searched before posting · comment, then a one-time reaction_

**Jira**
- **Comment** — public, or locked to a project role
- **Link, not a file** — names travel, files stay
- **Delivery status** — mirrored to the deal

**undefined**

**Пояснения по клику** (`detail`):

- `chan` — **Channels**
  The registry of which channels to read at all lives on the deal record; adding a channel is a business user filling in a field, not an engineer deploying. It says where to look, never which deal a thread belongs to.
- `thread` — **Thread root**
  The first valid code in a thread’s root message is the routing key for every reply beneath it. A code typed only into a reply is not enough — honouring it would mean re-deciding the routing on every message instead of once per thread.
  _ссылка: #/p/chat-tracker_
- `replies` — **Tagged replies**
  #jira makes the resulting comment public; #jira_private restricts it to a Jira project role. An untagged reply is read but never sent anywhere.
- `block` — **Code in the root**
  Nothing is guessed from the text of a conversation; guessing the deal from the body is how a thread lands under the wrong client.
- `deal-id` — **Deal match**
  Resolved once from the root and inherited by every reply, so a thread whose destination could change halfway does not exist.
- `park` — **No code → skipped**
  A root with no code is skipped and reported, never guessed at.
- `reg` — **Channel registry**
  Reading is bounded to a window of channel activity per run — the platform throttles Graph, and nothing here can afford to re-read everything every ten minutes.
- `msgs` — **Messages module**
  The thread is upserted into the CRM before Jira is touched at all — message ids, routing, delivery state. Jira is never asked what it already has; the CRM already knows.
- `deal` — **Deal**
  The deal record shows its threads and the delivery status — visible on the deal instead of behind a tracker licence.
  _ссылка: #/p/chat-tracker_
- `comment` — **Comment**
  Before posting, the run searches the issue for a hidden marker; finding one is the whole duplicate check. The comment lands public or locked to a project role, and the source message gets a one-time reaction — proof the exact message reached Jira, not just that a sync ran.
- `link` — **Link, not a file**
  Attachments are never uploaded: only their names travel, as links back to the thread they came from, where the original permission model still applies. The proxy in front of the tracker drops multipart bodies anyway.
  _ссылка: #/p/cross-system/resume_
- `status` — **Delivery status**
  The tracker is authoritative over its own delivery state; the deal shows it next to the CRM stage, and their disagreement is visible instead of argued about.
  _ссылка: #/p/cockpit_

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "layers",
 "aria": "Teams channels are read through a registry on the deal; threads are resolved to deals by the code in their root message; messages and delivery state are stored in the CRM; tagged replies become idempotent Jira comments; delivery status is mirrored to the deal",
 "rows": [
  {
   "id": "teams",
   "label": "Microsoft Teams",
   "nodes": [
    {
     "id": "chan",
     "n": "Channels",
     "sub": "listed on the deal record"
    },
    {
     "id": "thread",
     "n": "Thread root",
     "sub": "carries the routing code"
    },
    {
     "id": "replies",
     "n": "Tagged replies",
     "sub": "#jira · #jira_private"
    }
   ]
  },
  {
   "arrow": "every 10 minutes · a bounded Graph window · resumable"
  },
  {
   "id": "res",
   "label": "Resolution",
   "nodes": [
    {
     "id": "block",
     "n": "Code in the root",
     "sub": "resolved once per thread"
    },
    {
     "id": "deal-id",
     "n": "Deal match",
     "sub": "inherited by every reply"
    },
    {
     "id": "park",
     "n": "No code → skipped",
     "sub": "reported, never guessed"
    }
   ]
  },
  {
   "id": "crm",
   "label": "Zoho CRM",
   "core": true,
   "nodes": [
    {
     "id": "reg",
     "n": "Channel registry",
     "sub": "which channels to read at all"
    },
    {
     "id": "msgs",
     "n": "Messages module",
     "sub": "ids · routing · delivery flag"
    },
    {
     "id": "deal",
     "n": "Deal",
     "sub": "threads · delivery status"
    }
   ]
  },
  {
   "arrow": "marker searched before posting · comment, then a one-time reaction"
  },
  {
   "id": "jira",
   "label": "Jira",
   "nodes": [
    {
     "id": "comment",
     "n": "Comment",
     "sub": "public, or locked to a project role"
    },
    {
     "id": "link",
     "n": "Link, not a file",
     "sub": "names travel, files stay"
    },
    {
     "id": "status",
     "n": "Delivery status",
     "sub": "mirrored to the deal"
    }
   ]
  },
  {
   "back": "delivery status returns to the deal; replies never flow back into the thread — one-way on purpose"
  }
 ],
 "detail": {
  "chan": {
   "t": "Channels",
   "d": "The registry of which channels to read at all lives on the deal record; adding a channel is a business user filling in a field, not an engineer deploying. It says where to look, never which deal a thread belongs to."
  },
  "thread": {
   "t": "Thread root",
   "d": "The first valid code in a thread’s root message is the routing key for every reply beneath it. A code typed only into a reply is not enough — honouring it would mean re-deciding the routing on every message instead of once per thread.",
   "demo": "p/chat-tracker"
  },
  "replies": {
   "t": "Tagged replies",
   "d": "#jira makes the resulting comment public; #jira_private restricts it to a Jira project role. An untagged reply is read but never sent anywhere."
  },
  "block": {
   "t": "Code in the root",
   "d": "Nothing is guessed from the text of a conversation; guessing the deal from the body is how a thread lands under the wrong client."
  },
  "deal-id": {
   "t": "Deal match",
   "d": "Resolved once from the root and inherited by every reply, so a thread whose destination could change halfway does not exist."
  },
  "park": {
   "t": "No code → skipped",
   "d": "A root with no code is skipped and reported, never guessed at."
  },
  "reg": {
   "t": "Channel registry",
   "d": "Reading is bounded to a window of channel activity per run — the platform throttles Graph, and nothing here can afford to re-read everything every ten minutes."
  },
  "msgs": {
   "t": "Messages module",
   "d": "The thread is upserted into the CRM before Jira is touched at all — message ids, routing, delivery state. Jira is never asked what it already has; the CRM already knows."
  },
  "deal": {
   "t": "Deal",
   "d": "The deal record shows its threads and the delivery status — visible on the deal instead of behind a tracker licence.",
   "demo": "p/chat-tracker"
  },
  "comment": {
   "t": "Comment",
   "d": "Before posting, the run searches the issue for a hidden marker; finding one is the whole duplicate check. The comment lands public or locked to a project role, and the source message gets a one-time reaction — proof the exact message reached Jira, not just that a sync ran."
  },
  "link": {
   "t": "Link, not a file",
   "d": "Attachments are never uploaded: only their names travel, as links back to the thread they came from, where the original permission model still applies. The proxy in front of the tracker drops multipart bodies anyway.",
   "demo": "p/cross-system/resume"
  },
  "status": {
   "t": "Delivery status",
   "d": "The tracker is authoritative over its own delivery state; the deal shows it next to the CRM stage, and their disagreement is visible instead of argued about.",
   "demo": "p/cockpit"
  }
 }
}
```

</details>

## Constraints

- **No bot** — The routing had to work with what people already do: type in a chat window. They will not leave it to fill in a form, so the deal code lives in the thread itself.
- **Time limit and throttling** — Pulling replies means one call per root message while the platform API throttles; the pauses alone ran to ten and thirteen seconds, and a synchronous call is capped at 120 seconds.
- **The proxy** — The upload endpoint answers 200 with an empty body through the corporate proxy, and no attachment appears.
- **Visibility** — The tracker can close a comment to a role but not a file — and the files that needed closing were the ones with rates in them.
- **A sync that runs every ten minutes** — will eventually run twice over the same data, and one marker is not enough to make that safe.

## Implementation

### Routing belongs to the thread root

The mapping lives on the thread’s root message, not the channel, because one channel carries several discussions — the channel registry only says which channels to read at all. The first valid code in the root becomes the routing key for every reply beneath it. A code typed into a reply but never into the root is invisible to the router by design: honouring a later message would mean re-deciding the routing on every reply instead of once per thread, and a thread whose destination can change halfway is a thread nobody can audit. A root with no code is skipped and reported, never guessed at.

### The CRM as the state store

Each run reads a bounded window of channel activity through Graph rather than a channel’s full history — the platform throttles, and nothing here can afford to re-read everything every ten minutes. A controlled full run once measured 218 seconds against a 120-second ceiling on the synchronous call, which is why the importer is bounded per run and resumable rather than asked to finish in one go. The thread is upserted into the CRM before Jira is touched at all — message ids, routing, delivery state. Jira is never asked what it already has; the CRM already knows.

### Idempotency in both systems

A run every ten minutes has to be safe to repeat, and one marker is not enough for that. The CRM holds a delivery flag on the stored message; each posted comment holds a hidden marker in its own body. Before posting, the run searches the issue for that marker, and finding one skips the comment and the acknowledgement together. The two survive different accidents — the CRM flag outlives a deleted Jira comment, the marker outlives a rebuilt CRM row — so the pair is what makes a replay a no-op rather than a second comment. Once a comment lands, the source message gets a one-time reaction: proof the exact message reached Jira, not just that a sync ran.

### Restricted comments, and the file that cannot be

A tagged reply becomes a public comment; a privately tagged one is locked to a Jira project role. A file attached to the same issue cannot be locked that way, so attachments are never uploaded: only their names travel, as links back to the thread they came from, where the original permission model still applies. A restricted comment is exactly as private as the tracker’s own role model — a weaker guarantee than the chat thread it was copied out of, and anyone using it should know that before they type.

### One-way on purpose

Replies flow from the thread to the issue and never back. Two-way would mean deciding, on every edit, which side is authoritative for a comment both systems now hold, and that question has no good default — only a choice about whose edit gets silently discarded. The cost of refusing it is real: someone who answers on the Jira issue has answered only on the Jira issue, and the thread will not show it. What does come back is the delivery status, which the tracker owns and the deal mirrors next to its own CRM stage.

### Proving the proxy was the problem

Localisation by experiment rather than guesswork: downloading from storage works; building a multipart body works and 160 KB leaves in 0.88 seconds, so the bytes do go out; JSON endpoints through the same proxy answer with content, including validation errors. Conclusion: the multipart body is what the proxy loses. A JSON call carrying a link and a stable id passes the proxy, keeps the sync idempotent, and inherits the permissions of the place the file lives.

## Reliability and failure handling

What the sync does when the thread, the tracker or the run misbehaves.

| When | What the system does |
| --- | --- |
| A thread root carries no code | Nothing is guessed. The thread is skipped and reported; no reply from it is sent anywhere. |
| A code appears only in a reply | Ignored by design: routing is decided once, from the root, so a thread cannot change destination halfway. |
| The run repeats over the same replies | The CRM delivery flag and the marker in the existing comment are both found; the comment and the reaction are skipped together. |
| A Jira comment was deleted, or a CRM row rebuilt | The other half of the idempotency pair still holds, so a replay is still a no-op rather than a second comment. |
| The run is cut off by the time limit | The next run continues from the stored state; a bounded window per run keeps any single run far from the ceiling. |
| A file is attached to a private thread | Only its name travels, as a link back to the thread; nothing is uploaded to an issue that cannot restrict it. |
| Someone answers on the Jira issue | The thread does not show it. One-way is a stated cost, not an oversight. |

## Data ownership and security

Visibility is decided by the tag and enforced by the tracker: a privately tagged reply becomes a comment locked to a Jira project role, and files never leave the thread whose permission model protects them. The registry on the deal decides what is read at all, and an untagged reply is read but never sent anywhere.

## My responsibility

Architecture and implementation on the CRM side — the routing rule, the messages module and its delivery state, the functions that read, resolve, upsert and post — and the operating model that lets business users maintain the channel registry without a deploy.

## Result

A tagged Teams reply becomes the correct Jira comment without manual re-entry, filed against the right deal, with delivery visible on the deal instead of behind a tracker licence. Every run is safe to replay; missing routing data is skipped rather than guessed.

## Interactive example

Встроено: [`chat-tracker`](../pages/chat-tracker.md).

## More examples

- [`chat-tracker`](../pages/chat-tracker.md) — A Teams thread on one side, the Jira issue it routes to on the other — run the sync twice and watch the second run post nothing.

## Technical notes

- [`cross-system/resume`](../pages/cross-system.md) — **Attachments as links, after proving the proxy was the problem** A 200 with an empty body, a tracker that cannot restrict a file to a role, and the experiment that localised the fault.
- [`cross-system/who-owns`](../pages/cross-system.md) — **Who owns the field?** Delivery belongs to the tracker; chat owns nothing.

## Related cases

- [`teams-crm`](./teams-crm.md)
- [`widgets`](./widgets.md)
