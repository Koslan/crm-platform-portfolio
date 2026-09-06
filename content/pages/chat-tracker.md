---
page: "chat-tracker"
title: "One thread across Teams, Zoho and Jira"
type: "live-demo (общий шаблон viewRecord)"
tab: "zoho"
group: "Connecting Teams, Slack and Jira to the CRM"
route: "#/p/chat-tracker"
kind: "emul"
public: true
public_tab: "zoho"
case: "#/zoho/jira-sync"
diagrams: 1
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"chat-tracker\""
  body: "src/app.html · REC · id=\"tracker\""
---

# One thread across Teams, Zoho and Jira

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> CRM owns routing and delivery state; stable markers make every ten-minute run safe to replay.
>
> **Material labels** (`MAT`, публично не рендерятся): Production-derived demo
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> A tagged Teams reply becomes the correct Jira comment without manual re-entry. The thread carries context, CRM carries routing and delivery state, and Jira owns the issue and its visibility. Every run is safe to replay, and missing routing data is skipped rather than guessed.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> Two recreated application screens, not one CRM shell: a Teams thread on one side, the Jira issue it routes to on the other.

## What to try

- Read the root message: the PITCH code inside it is the whole routing mechanism, resolved once and inherited by every reply.
- Run synchronization. The tagged replies land as comments on the Jira screen, and each one gets a one-time ticket reaction back in Teams.
- Run it again. The existing marker is found, nothing is posted twice, and no second reaction fires.
- Show the restricted example: the same run also produces a comment locked to a Jira project role, not just coloured differently.
- Show the missing-PITCH example: a thread with no code in its root is skipped safely, never guessed at.
- Open the technical details drawer to see the hidden markers and the deal each thread is filed against.

<!-- diagram · chain · вставляется после секции body[2] · источник: REC['tracker'].dg -->

### Диаграмма — цепочка шагов

_Alt-текст (`aria`, читается скринридером):_ Six-step chain from a tagged Teams reply through a bounded Graph read, PITCH resolution, a CRM upsert, a Jira marker search and posting, with a branch for a duplicate marker and a loop back every ten minutes

1. **Reply tagged** — #jira / #jira_private
2. **Read via Graph** — bounded window
3. **Resolve PITCH** — from the root message
   - чекпойнт: inherited by every reply
   - отказ: no PITCH → skipped safely
4. **Upsert in CRM** — Teams_Messages row
   - чекпойнт: state saved
5. **Search Jira marker** — hidden in comment body
6. **Post + confirm** — comment, then one-time reaction
   - чекпойнт: In_Jira = true

**Связи:**
- `marker` → `marker` (branch): marker exists → duplicate skipped
- `post` → `read` (loop): every ten minutes

**Пояснения по клику** (`detail`):

- `tag` — **Reply tagged in Teams**
  #jira makes the resulting comment public; #jira_private restricts it to a Jira project role. An untagged reply is read but never sent anywhere.
- `read` — **Read via Microsoft Graph, a bounded window at a time**
  Each run reads a bounded slice of channel activity rather than a channel’s full history — the platform throttles Graph, and nothing here can afford to re-read everything every ten minutes.
- `resolve` — **PITCH resolved once, from the root message**
  The first valid PITCH code in a thread’s root message becomes the routing key for every reply beneath it. A code typed only into a reply is not enough — trusting it would mean re-deciding the routing on every message instead of once per thread.
- `crm` — **Zoho CRM as the state store**
  The thread is upserted into a Teams_Messages row before Jira is touched at all — message ids, PITCH, delivery state. Jira is never asked what it already has; the CRM already knows.
- `marker` — **A marker hidden in the comment body**
  Before posting, the run searches the issue for a hidden [crm-teams-msg:&lt;id&gt;] marker. Finding one is the whole duplicate check — a run that fires twice over the same reply never posts twice.
- `post` — **Comment posted, reaction set once**
  A public or role-restricted comment lands on the issue, then the source message gets a one-time 🎫 — proof the exact message reached Jira, not just that a sync ran.
- `rail:marker:marker` — **Marker already exists**
  When the search on the marker step finds a hit, posting and the reaction are both skipped — the run reports a duplicate rather than writing a second comment.

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "chain",
 "at": 3,
 "aria": "Six-step chain from a tagged Teams reply through a bounded Graph read, PITCH resolution, a CRM upsert, a Jira marker search and posting, with a branch for a duplicate marker and a loop back every ten minutes",
 "steps": [
  {
   "id": "tag",
   "n": "Reply tagged",
   "sub": "#jira / #jira_private"
  },
  {
   "id": "read",
   "n": "Read via Graph",
   "sub": "bounded window"
  },
  {
   "id": "resolve",
   "n": "Resolve PITCH",
   "sub": "from the root message",
   "checkpoint": "inherited by every reply",
   "fail": "no PITCH → skipped safely"
  },
  {
   "id": "crm",
   "n": "Upsert in CRM",
   "sub": "Teams_Messages row",
   "checkpoint": "state saved"
  },
  {
   "id": "marker",
   "n": "Search Jira marker",
   "sub": "hidden in comment body"
  },
  {
   "id": "post",
   "n": "Post + confirm",
   "sub": "comment, then one-time reaction",
   "checkpoint": "In_Jira = true"
  }
 ],
 "rails": [
  {
   "from": "marker",
   "to": "marker",
   "kind": "branch",
   "label": "marker exists → duplicate skipped"
  },
  {
   "from": "post",
   "to": "read",
   "kind": "loop",
   "label": "every ten minutes"
  }
 ],
 "detail": {
  "tag": {
   "t": "Reply tagged in Teams",
   "d": "#jira makes the resulting comment public; #jira_private restricts it to a Jira project role. An untagged reply is read but never sent anywhere."
  },
  "read": {
   "t": "Read via Microsoft Graph, a bounded window at a time",
   "d": "Each run reads a bounded slice of channel activity rather than a channel’s full history — the platform throttles Graph, and nothing here can afford to re-read everything every ten minutes."
  },
  "resolve": {
   "t": "PITCH resolved once, from the root message",
   "d": "The first valid PITCH code in a thread’s root message becomes the routing key for every reply beneath it. A code typed only into a reply is not enough — trusting it would mean re-deciding the routing on every message instead of once per thread."
  },
  "crm": {
   "t": "Zoho CRM as the state store",
   "d": "The thread is upserted into a Teams_Messages row before Jira is touched at all — message ids, PITCH, delivery state. Jira is never asked what it already has; the CRM already knows."
  },
  "marker": {
   "t": "A marker hidden in the comment body",
   "d": "Before posting, the run searches the issue for a hidden [crm-teams-msg:&lt;id&gt;] marker. Finding one is the whole duplicate check — a run that fires twice over the same reply never posts twice."
  },
  "post": {
   "t": "Comment posted, reaction set once",
   "d": "A public or role-restricted comment lands on the issue, then the source message gets a one-time 🎫 — proof the exact message reached Jira, not just that a sync ran."
  },
  "rail:marker:marker": {
   "t": "Marker already exists",
   "d": "When the search on the marker step finds a hit, posting and the reaction are both skipped — the run reports a duplicate rather than writing a second comment."
  }
 }
}
```

</details>

## Why it was not straightforward

### Routing belongs to the thread root

The mapping lives on the thread's root message, not the channel, because one channel carries several PITCH discussions — the channel registry only says which channels to read at all. A PITCH code typed into a reply but never into the root is invisible to the router by design: honouring a later message would mean re-deciding the routing on every reply instead of once per thread, and a thread whose destination can change halfway is a thread nobody can audit. A root with no code is skipped and reported, never guessed at.

### Idempotency exists in both systems

A run every ten minutes has to be safe to repeat, and one marker is not enough for that. The CRM holds a delivery flag on the stored message; each posted comment holds a hidden marker in its own body. Before posting, the run searches the issue for that marker, and finding one skips the comment and the acknowledgement together. The two survive different accidents — the CRM flag outlives a deleted Jira comment, the marker outlives a rebuilt CRM row — so the pair is what makes a replay a no-op rather than a second comment.

### Restricted comments do not make files private

A comment can be locked to a Jira project role. A file attached to the same issue cannot. So attachments are never uploaded: only their names travel, as links back to the thread they came from, where the original permission model still applies. This is a limitation stated rather than solved — a restricted comment is exactly as private as the tracker's own role model, which is a weaker guarantee than the chat thread it was copied out of, and anyone using it should know that before they type.

### The integration is one-way on purpose

Replies flow from the thread to the issue and never back. Two-way would mean deciding, on every edit, which side is authoritative for a comment both systems now hold, and that question has no good default — only a choice about whose edit gets silently discarded. The cost of refusing it is real and worth naming: someone who answers on the Jira issue has answered only on the Jira issue, and the thread will not show it.
