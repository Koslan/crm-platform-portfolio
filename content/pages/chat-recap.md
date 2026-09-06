---
page: "chat-recap"
title: "From transcript to a corporate-standard meeting recap"
type: "live-demo (общий шаблон viewRecord)"
tab: "ai"
group: "AI as a business solution"
route: "#/p/chat-recap"
kind: "emul"
public: true
public_tab: "zoho"
case: "#/zoho/teams-crm"
diagrams: 1
source:
  nav: "src/app.html · AI_GROUPS · id=\"chat-recap\""
  body: "src/app.html · REC · id=\"teams\""
---

# From transcript to a corporate-standard meeting recap

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Teams, Krisp and future sources feed one governed evidence-to-recap pipeline.
>
> **Material labels** (`MAT`, публично не рендерятся): Production-derived demo
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> Meetings held in Teams use Teams transcripts; meetings held elsewhere use Krisp. Both enter the same process: resolve the meeting and the account, gather the evidence, generate a recap to the corporate standard, validate it and write the structured result back to CRM. The source boundary is open to further providers without changing the workflow around it.
>
> **`sub` — НЕ рендерится, см. LEAD:**
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
   - чекпойнт: stage written on the record after every hop
2. **Resolve organiser** — directory identity
3. **Join link → id** — online-meeting id
4. **List transcripts** — source A
   - отказ: 403
5. **Download captions** — VTT
6. **Model call** — captions → recap
7. **Write summary** — + stage

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
  _ссылка: #/p/cross-system_

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
   "checkpoint": "stage written on the record after every hop"
  },
  {
   "id": "organiser",
   "n": "Resolve organiser",
   "sub": "directory identity"
  },
  {
   "id": "join",
   "n": "Join link → id",
   "sub": "online-meeting id"
  },
  {
   "id": "list",
   "n": "List transcripts",
   "sub": "source A",
   "fail": "403"
  },
  {
   "id": "download",
   "n": "Download captions",
   "sub": "VTT"
  },
  {
   "id": "model",
   "n": "Model call",
   "sub": "captions → recap"
  },
  {
   "id": "write",
   "n": "Write summary",
   "sub": "+ stage"
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

### Choosing the source is a different decision from writing the recap

Meetings held in Teams have a Teams transcript. Meetings held anywhere else do not, and Krisp covers those. That choice is its own step with its own failure modes, not a branch buried inside the recap logic: read the meeting record, resolve the organiser to a directory identity, turn the join link into an online-meeting id, then ask whichever source owns that meeting for its captions. Everything downstream — the standard, the validation, the write-back — is identical whichever source answered, which is what makes a third provider a change to one step instead of a change to the workflow. Where no transcript exists at all, a candidate is matched by score rather than by key, and the automatic link is refused outright when the known recording owner is not among the candidates. The link is written at a lower score than the text is, because “I believe this is the meeting” and “I am willing to write data into it” are different decisions and deserve different thresholds.

### What the corporate standard requires, and why the model does not choose it

A recap here is not a summary. The company’s own standard fixes which sections a recap must contain, requires commitments to be pulled out as action items rather than left inside the narrative, and sets the register — plain, factual, no hedging and no commitment nobody actually made — because these are read by people who were not in the room and cannot check. Each part is written to its own CRM field instead of one long note, so the next stage of the deal can be filtered and reported on rather than read one record at a time. The model’s task is bounded to producing that structure from the captions it was handed; the structure itself is not its to invent. A draft that comes back missing a required section, or too short to be a recap of anything, is refused with the reason on screen rather than saved short.

### The trace panel is the observability

Every call the flow makes is written to the trace as it is made: the record read, the identity resolved, the source that answered, the step it stopped on. That panel is the primary proof this page offers, and it exists because of a real failure rather than a design preference. Transcript access was switched off at the tenant level with no warning and every listing call began returning a permission error; the pipeline records the stage it reached on the record itself, so “why is this empty” is answered by the data instead of by a run log nobody can reach. The same panel shows what the flow is not doing: no step holds a synchronous request open while a person thinks. Each card is a callback, and the recap pipeline starts the moment the account is picked — long before anyone asks for a recap — so two steps later the field is already filled.

### A person corrects it before anything is saved

Nothing goes from the model straight into the record. The draft returns to the card the person is already looking at, and the save is a deliberate act rather than the end of a pipeline. When the linked opportunity belongs to a different account, that choice travels as a marked value through a control that can only hand back one string — awkward, and still better than inferring it. The cost is named rather than hidden: this flow cannot run unattended. A meeting nobody opens gets no recap, and a backlog of un-reviewed drafts is ordinary operating reality here, not an edge case. Buying auditability with somebody’s attention is the trade, and it is only worth it because the output is written into fields the business reports on.
