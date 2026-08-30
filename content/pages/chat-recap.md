---
page: "chat-recap"
title: "Meeting recap from chat"
type: "live-demo (общий шаблон viewRecord)"
tab: "zoho"
group: "Integrations & sync"
route: "#/p/chat-recap"
kind: "emul"
diagrams: 1
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"chat-recap\""
  body: "src/app.html · REC · id=\"teams\""
---

# Meeting recap from chat

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> A two-card wizard in a chat client, writing a structured recap into the CRM.
>
> **Подзаголовок страницы** (`sub`):
> The chat client on the left, the CRM record on the right, and a two-card flow between them. A trace panel shows every call as it is made.

## What to try

- Pick the first chat and send the message to the CRM. The account is already resolved, and the card says which key resolved it.
- Pick the third chat instead: two accounts appear among the participants, so nothing is chosen for you.
- Try to save a three-word recap. The card refuses and says why.
- Watch the trace — the transcript pipeline starts on card one, so the recap is ready two steps later.

<!-- diagram · chain · вставляется после секции body[0] · источник: REC['teams'].dg -->

### Диаграмма — цепочка шагов

_Alt-текст (`aria`, читается скринридером):_ Seven-hop chain from reading the meeting record to writing the recap back, with a permission failure on listing transcripts

1. **Read meeting** — CRM
   - чекпойнт: stage written
2. **Resolve organiser** — directory identity
   - чекпойнт: stage written
3. **Join link → id** — online-meeting id
   - чекпойнт: stage written
4. **List transcripts**
   - чекпойнт: stage written
   - отказ: 403
5. **Download captions**
   - чекпойнт: stage written
6. **Model call**
   - чекпойнт: stage written
7. **Write summary** — + stage
   - чекпойнт: stage written

**Связи:**
- `meeting` → `meeting` (async): pipeline started on card 1
- `list` → `list` (branch): fallback: second source

**Пояснения по клику** (`detail`):

- `meeting` — **Read meeting record**
  Pulled from the CRM the moment the chain starts.
- `organiser` — **Resolve organiser**
  The organiser is resolved to a directory identity.
- `join` — **Join link → online-meeting id**
  The join link is turned into an online-meeting identifier.
- `list` — **List transcripts — the main failure**
  Access to transcripts was switched off at the tenant level with no warning, and every call started returning a permission error (403). The pipeline records the stage it reached on the record itself, so the answer to "why is this empty" is visible in the data rather than buried in a run log.
- `download` — **Download captions**
  Downloads the caption file for the transcript that was found.
- `model` — **Model call**
  The model call that turns captions into a recap.
- `write` — **Write summary + stage**
  Writes the recap and the stage the pipeline reached back onto the meeting record.
- `rail:meeting:meeting` — **Async pipeline start**
  The whole chain is started the moment a person picks the account on the first card — long before anyone asks for a recap. Nothing waits for it.
- `rail:list:list` — **Fallback: second source**
  When there is no transcript, a second source is matched by score rather than by key, with a gate that refuses the automatic link if the known recording owner is not among the candidates.
  _ссылка на демо: #/p/cross-system_

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "chain",
 "at": 1,
 "aria": "Seven-hop chain from reading the meeting record to writing the recap back, with a permission failure on listing transcripts",
 "steps": [
  {
   "id": "meeting",
   "n": "Read meeting",
   "sub": "CRM",
   "checkpoint": "stage written"
  },
  {
   "id": "organiser",
   "n": "Resolve organiser",
   "sub": "directory identity",
   "checkpoint": "stage written"
  },
  {
   "id": "join",
   "n": "Join link → id",
   "sub": "online-meeting id",
   "checkpoint": "stage written"
  },
  {
   "id": "list",
   "n": "List transcripts",
   "sub": "",
   "fail": "403",
   "checkpoint": "stage written"
  },
  {
   "id": "download",
   "n": "Download captions",
   "sub": "",
   "checkpoint": "stage written"
  },
  {
   "id": "model",
   "n": "Model call",
   "sub": "",
   "checkpoint": "stage written"
  },
  {
   "id": "write",
   "n": "Write summary",
   "sub": "+ stage",
   "checkpoint": "stage written"
  }
 ],
 "rails": [
  {
   "from": "meeting",
   "to": "meeting",
   "kind": "async",
   "label": "pipeline started on card 1",
   "sub": "nothing waits for it"
  },
  {
   "from": "list",
   "to": "list",
   "kind": "branch",
   "label": "fallback: second source",
   "demo": "cross-system"
  }
 ],
 "detail": {
  "meeting": {
   "t": "Read meeting record",
   "d": "Pulled from the CRM the moment the chain starts."
  },
  "organiser": {
   "t": "Resolve organiser",
   "d": "The organiser is resolved to a directory identity."
  },
  "join": {
   "t": "Join link → online-meeting id",
   "d": "The join link is turned into an online-meeting identifier."
  },
  "list": {
   "t": "List transcripts — the main failure",
   "d": "Access to transcripts was switched off at the tenant level with no warning, and every call started returning a permission error (403). The pipeline records the stage it reached on the record itself, so the answer to \"why is this empty\" is visible in the data rather than buried in a run log."
  },
  "download": {
   "t": "Download captions",
   "d": "Downloads the caption file for the transcript that was found."
  },
  "model": {
   "t": "Model call",
   "d": "The model call that turns captions into a recap."
  },
  "write": {
   "t": "Write summary + stage",
   "d": "Writes the recap and the stage the pipeline reached back onto the meeting record."
  },
  "rail:meeting:meeting": {
   "t": "Async pipeline start",
   "d": "The whole chain is started the moment a person picks the account on the first card — long before anyone asks for a recap. Nothing waits for it."
  },
  "rail:list:list": {
   "t": "Fallback: second source",
   "d": "When there is no transcript, a second source is matched by score rather than by key, with a gate that refuses the automatic link if the known recording owner is not among the candidates.",
   "demo": "cross-system"
  }
 }
}
```

</details>

## Why it was not straightforward

No step holds a synchronous request open while a person thinks; each card is a callback. When the linked opportunity belongs to a different account, that choice travels as a marked value through a control that can only return one string. The recap-fetch pipeline starts the moment the account is picked, long before anyone asks for it — two steps later the field is already filled. When there is no transcript, a second source is matched by score rather than by key, gated so the automatic link is refused if the known recording owner is not among the candidates; the link is written at a lower score than the text itself, because "I believe this is the meeting" and "I am willing to write data into it" are different decisions. Transcript access was switched off at the tenant level with no warning, so the pipeline records the stage it reached on the record itself — the answer to "why is this empty" lives in the data, not a run log.
