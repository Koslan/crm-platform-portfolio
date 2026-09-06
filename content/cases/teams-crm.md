---
case: "teams-crm"
num: "03"
title: "From meeting data to CRM automation — with Teams as the control surface"
route: "#/zoho/teams-crm"
public: true
embed: "chat-recap"
examples: ["chat-recap","board"]
notes: ["cross-system/refuse","cross-system/resume"]
related: ["orchestration","jira-sync","ai-workflows"]
words: 1428
source:
  body: "src/cases.js · CASES[2] (slug \"teams-crm\")"
  furniture: "src/app.html · vCaseStudy()"
---

# 03 · From meeting data to CRM automation — with Teams as the control surface

> **Kicker** (`kicker`): Adaptive Cards · callbacks · transcripts · AI as one stage
>
> **Одной строкой** (`one`): A multi-stage CRM workflow that collects a meeting from several sources, resolves its CRM context, runs a model as one deterministic stage — and is driven from Microsoft Teams without opening the CRM.

## Summary

- **What:** A CRM orchestration that turns a held meeting into structured CRM records — account, opportunity, participants with buyer roles, a recap to the corporate standard — and a Teams control interface built on top of it.
- **Scale:** Seven pipeline hops, two transcript sources (Teams transcripts and Krisp) behind one adapter, a two-card wizard in Teams, and a draft ready before the person reaches the card that asks for it.
- **My role:** Architecture and implementation of the CRM side, the transcript pipeline and the Teams flow with its cards.
- **Key topics:** orchestration · asynchronous callbacks · Adaptive Cards · score-based matching · AI as a stage · failure recording

## Key facts

| | |
| --- | --- |
| Pipeline | 7 hops, each failing differently |
| Transcript sources | Teams transcripts · Krisp, behind one adapter |
| Thresholds | 40 to link · 60 to copy text |
| Cards | 2, each a callback subscription |
| Loop bound | fixed iterations · half an hour |
| Stage | recorded on the record itself |
| Write-back | each part of the recap to its own field, after a person accepts it |

## Context

After a client meeting the useful information is spread out: the recording and its transcript sit with the meeting provider, the participants are in the calendar, the account and the deal are in the CRM, and the follow-up is being discussed in a Teams chat. The recap field on the meeting record stayed empty, because nobody transcribes recordings and nobody retypes what was agreed.

The first task was the CRM workflow itself: find the meeting, collect its artefacts from more than one source, resolve the CRM context, turn the transcript into a recap, and write structured results — recap, opportunity, buyers — onto the right records. The second task came later: let a person control that workflow from the Teams conversation where the meeting was already being discussed, without opening the CRM at all.

## Architecture

Teams is not a source of messages copied into the CRM. It is a second front end on a CRM backend: the orchestration lives in Deluge functions and CRM records, the model is one stage inside it, and Teams is where a person sees the state, chooses, and triggers the next step.

<!-- diagram · layers · вставляется после секции body[0] · источник: CASES[2].architecture.dg -->

### Диаграмма — слои архитектуры

_Alt-текст (`aria`, читается скринридером):_ Transcript sources and the Teams conversation feed a collection and matching stage; CRM orchestration runs functions, validation, state transitions and a model stage; results land in Zoho CRM and, in parallel, in a Teams control interface whose card actions come back into the orchestration


**Meeting ecosystem**
- **Teams transcripts** — meetings held in Teams
- **Krisp transcripts** — meetings held elsewhere
- **Teams conversation** — where the meeting is discussed

↓ _started the moment an account is picked on the first card_

**Collection / matching**
- **Meeting identification** — join link → online-meeting id
- **Source adapter** — whichever source owns the meeting
- **Participant matching** — directory · account contacts
- **CRM context** — account · opportunity · organiser

**CRM orchestration** (ядро)
- **Functions** — pipeline · linking · record creation
- **Validation** — refusals with a reason
- **State transitions** — stage written on the record
- **Model stage** — captions → recap, to the standard
- **Business rules** — buyers · opportunity · account

**undefined**

_Zoho CRM_
- **Records and state** — meeting · participants · recap fields · stage

_Microsoft Teams_
- **Adaptive Cards** — account → recap, opportunity, buyers
- **User actions** — search · choose · submit

**undefined**

**Пояснения по клику** (`detail`):

- `src-a` — **Teams transcripts**
  For meetings held in Teams: listed through the identity of the organiser and the online-meeting id, then downloaded as captions.
- `src-b` — **Krisp transcripts**
  For meetings held anywhere else. No identifier in common with the CRM, so a candidate is matched by score: overlap as coverage ratios, a penalty for the duration gap, service hints, addresses lifted from the transcript body, and a gate on the recording owner.
  _ссылка: #/p/cross-system/refuse_
- `conv` — **Teams conversation**
  The chat where the meeting is discussed is also where the workflow is controlled: a message raises the first card.
- `ident` — **Meeting identification**
  The join link on the CRM record is turned into an online-meeting identifier; the organiser is resolved to a directory identity.
- `find` — **Source adapter**
  Choosing the source is its own step with its own failure modes, not a branch buried inside the recap logic. Everything downstream — the standard, the validation, the write-back — is identical whichever source answered, so a third provider is a change to one step rather than to the workflow.
- `part` — **Participant matching**
  Internal people against the staff directory, external ones against the account’s contacts; buyer roles a person assigned survive the rebuild.
  _ссылка: #/p/cross-system/who-owns_
- `ctx` — **CRM context**
  The account comes from the first card; the opportunity may belong to a different account, and that choice travels as a marked value.
- `fns` — **Functions**
  A pipeline function — read the meeting, resolve the organiser, resolve the join link, list transcripts, download captions, call the model, write back — beside the functions that create the meeting record and save its linking.
  _ссылка: #/p/chat-recap_
- `val` — **Validation**
  A draft that comes back missing a required section, or too short to be a recap of anything, is refused with the reason on screen rather than saved short.
- `stage` — **State transitions**
  The stage a pipeline reached is written on the meeting record, so “why is this empty” is answered by the data rather than by a run log.
- `model` — **Model stage**
  One bounded task: captions in, a recap in the corporate standard out — fixed sections, commitments pulled out as action items, a plain factual register. The structure is not the model’s to invent, and the key stays server-side.
- `rules` — **Business rules**
  Buyer roles — economic, technical, user, coach — and the opportunity link are set by the person on the card and by CRM rules, never by the model.
- `recs` — **Records and state**
  Each part of the recap is written to its own CRM field rather than one long note, so the next stage of the deal can be filtered and reported on; the record also carries the linked opportunity, the participants with roles, and the stage the pipeline reached.
- `cards` — **Adaptive Cards**
  Card one chooses the account, with a search loop that reissues the card with fresh results; card two collects the recap, the opportunity and the buyers.
  _ссылка: #/p/chat-recap_
- `acts` — **User actions**
  Each press is a new event with the conversation and the CRM context resolved from it — minutes after the card was sent, when the function that sent it has long ended.
  _ссылка: #/p/cross-system/resume_

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "layers",
 "aria": "Transcript sources and the Teams conversation feed a collection and matching stage; CRM orchestration runs functions, validation, state transitions and a model stage; results land in Zoho CRM and, in parallel, in a Teams control interface whose card actions come back into the orchestration",
 "rows": [
  {
   "id": "eco",
   "label": "Meeting ecosystem",
   "nodes": [
    {
     "id": "src-a",
     "n": "Teams transcripts",
     "sub": "meetings held in Teams"
    },
    {
     "id": "src-b",
     "n": "Krisp transcripts",
     "sub": "meetings held elsewhere"
    },
    {
     "id": "conv",
     "n": "Teams conversation",
     "sub": "where the meeting is discussed"
    }
   ]
  },
  {
   "arrow": "started the moment an account is picked on the first card"
  },
  {
   "id": "collect",
   "label": "Collection / matching",
   "nodes": [
    {
     "id": "ident",
     "n": "Meeting identification",
     "sub": "join link → online-meeting id"
    },
    {
     "id": "find",
     "n": "Source adapter",
     "sub": "whichever source owns the meeting"
    },
    {
     "id": "part",
     "n": "Participant matching",
     "sub": "directory · account contacts"
    },
    {
     "id": "ctx",
     "n": "CRM context",
     "sub": "account · opportunity · organiser"
    }
   ]
  },
  {
   "id": "orch",
   "label": "CRM orchestration",
   "core": true,
   "nodes": [
    {
     "id": "fns",
     "n": "Functions",
     "sub": "pipeline · linking · record creation"
    },
    {
     "id": "val",
     "n": "Validation",
     "sub": "refusals with a reason"
    },
    {
     "id": "stage",
     "n": "State transitions",
     "sub": "stage written on the record"
    },
    {
     "id": "model",
     "n": "Model stage",
     "sub": "captions → recap, to the standard"
    },
    {
     "id": "rules",
     "n": "Business rules",
     "sub": "buyers · opportunity · account"
    }
   ]
  },
  {
   "cols": [
    {
     "id": "crm",
     "label": "Zoho CRM",
     "nodes": [
      {
       "id": "recs",
       "n": "Records and state",
       "sub": "meeting · participants · recap fields · stage"
      }
     ]
    },
    {
     "id": "tms",
     "label": "Microsoft Teams",
     "nodes": [
      {
       "id": "cards",
       "n": "Adaptive Cards",
       "sub": "account → recap, opportunity, buyers"
      },
      {
       "id": "acts",
       "n": "User actions",
       "sub": "search · choose · submit"
      }
     ]
    }
   ]
  },
  {
   "back": "a card action arrives as a new event and re-enters the orchestration"
  }
 ],
 "detail": {
  "src-a": {
   "t": "Teams transcripts",
   "d": "For meetings held in Teams: listed through the identity of the organiser and the online-meeting id, then downloaded as captions."
  },
  "src-b": {
   "t": "Krisp transcripts",
   "d": "For meetings held anywhere else. No identifier in common with the CRM, so a candidate is matched by score: overlap as coverage ratios, a penalty for the duration gap, service hints, addresses lifted from the transcript body, and a gate on the recording owner.",
   "demo": "p/cross-system/refuse"
  },
  "conv": {
   "t": "Teams conversation",
   "d": "The chat where the meeting is discussed is also where the workflow is controlled: a message raises the first card."
  },
  "ident": {
   "t": "Meeting identification",
   "d": "The join link on the CRM record is turned into an online-meeting identifier; the organiser is resolved to a directory identity."
  },
  "find": {
   "t": "Source adapter",
   "d": "Choosing the source is its own step with its own failure modes, not a branch buried inside the recap logic. Everything downstream — the standard, the validation, the write-back — is identical whichever source answered, so a third provider is a change to one step rather than to the workflow."
  },
  "part": {
   "t": "Participant matching",
   "d": "Internal people against the staff directory, external ones against the account’s contacts; buyer roles a person assigned survive the rebuild.",
   "demo": "p/cross-system/who-owns"
  },
  "ctx": {
   "t": "CRM context",
   "d": "The account comes from the first card; the opportunity may belong to a different account, and that choice travels as a marked value."
  },
  "fns": {
   "t": "Functions",
   "d": "A pipeline function — read the meeting, resolve the organiser, resolve the join link, list transcripts, download captions, call the model, write back — beside the functions that create the meeting record and save its linking.",
   "demo": "p/chat-recap"
  },
  "val": {
   "t": "Validation",
   "d": "A draft that comes back missing a required section, or too short to be a recap of anything, is refused with the reason on screen rather than saved short."
  },
  "stage": {
   "t": "State transitions",
   "d": "The stage a pipeline reached is written on the meeting record, so “why is this empty” is answered by the data rather than by a run log."
  },
  "model": {
   "t": "Model stage",
   "d": "One bounded task: captions in, a recap in the corporate standard out — fixed sections, commitments pulled out as action items, a plain factual register. The structure is not the model’s to invent, and the key stays server-side."
  },
  "rules": {
   "t": "Business rules",
   "d": "Buyer roles — economic, technical, user, coach — and the opportunity link are set by the person on the card and by CRM rules, never by the model."
  },
  "recs": {
   "t": "Records and state",
   "d": "Each part of the recap is written to its own CRM field rather than one long note, so the next stage of the deal can be filtered and reported on; the record also carries the linked opportunity, the participants with roles, and the stage the pipeline reached."
  },
  "cards": {
   "t": "Adaptive Cards",
   "d": "Card one chooses the account, with a search loop that reissues the card with fresh results; card two collects the recap, the opportunity and the buyers.",
   "demo": "p/chat-recap"
  },
  "acts": {
   "t": "User actions",
   "d": "Each press is a new event with the conversation and the CRM context resolved from it — minutes after the card was sent, when the function that sent it has long ended.",
   "demo": "p/cross-system/resume"
  }
 }
}
```

</details>

## Constraints

- **Delayed availability** — A transcript appears minutes after a meeting ends, sometimes not at all. The workflow cannot assume the artefact is there when it starts.
- **Two sources, no shared identifier** — Meetings held in Teams have a Teams transcript; meetings held elsewhere have a Krisp one, with its own identifier, its own clock and its own attendee list. Time is the only shared signal, and it is weak.
- **Cards are not applications** — An Adaptive Card has no state, cannot fetch more rows, and ends when it is submitted. A person takes minutes to fill it in; the trigger that sent it has seconds.
- **One string, one control** — A dropdown returns exactly one value; there is no way to carry a flag such as “chosen deliberately” through it.
- **Tenant-level policy** — Access to transcripts can be switched off for the whole tenant without warning, and did.

## Implementation

### Part one — the CRM workflow

The pipeline runs in seven hops inside one server-side function: read the meeting record, resolve the organiser to a directory identity, turn the join link into an online-meeting id, list transcripts, download the captions, call the model, write the recap and the stage back. Separate functions create the meeting record and save its linking. Every hop records the stage it reached on the record, so a half-finished run is visible in the data. The whole chain is started the moment a person picks the account on the first card — long before anyone asks for a recap — and nothing waits for it. Two steps later, when the recap card opens, the field is already filled.

### Two sources, one adapter

Meetings held in Teams have a Teams transcript; meetings held anywhere else are covered by Krisp. Choosing the source is its own step with its own failure modes — read the meeting record, resolve the organiser, turn the join link into an online-meeting id, then ask whichever source owns that meeting for its captions — and everything downstream is identical whichever source answered, so a third provider is a change to one step rather than to the workflow.

The Krisp side has no identifier in common with the CRM. Matching is a score rather than a boolean: overlap between intervals of unequal length as two coverage ratios with the larger taken, so a meeting nested inside another still scores full; a penalty proportional to the duration gap; modifiers for a service hint and for e-mail addresses lifted from the transcript body and intersected with the attendees; and the strongest signal, the recording owner. Above the score sits a gate: if the owner is known and the best candidate does not contain them, the automatic link is refused. Two thresholds instead of one — the link is written above forty, the text is copied only above sixty — because “I think this is the meeting” and “I am willing to write data into it” are different decisions.

### AI as one stage, not the workflow

A recap here is not a summary. The company’s own standard fixes which sections a recap must contain, requires commitments to be pulled out as action items rather than left inside the narrative, and sets the register — plain, factual, no hedging and no commitment nobody made — because these are read by people who were not in the room. The model’s task is bounded to producing that structure from the captions it was handed; the structure itself is not its to invent. A draft that comes back missing a required section, or too short to be a recap of anything, is refused with the reason on screen rather than saved short. Nothing goes from the model straight into the record: the draft returns to the card the person is already looking at, and the save is a deliberate act. Each part is then written to its own CRM field instead of one long note, so the next stage of the deal can be filtered and reported on. Everything structured — the opportunity link, the buyer roles, the account — is set by CRM rules and by the person on the card, never by the model. On the mobile board the rephrase also runs server-side, so no key is ever in a page.

### Part two — Teams as the control surface

A card is not a form that waits. The card posts, the function that sent it ends, and the answer arrives minutes later as a new event carrying the conversation and the CRM context. Every human step is therefore a callback subscription rather than a wait. Around the first card sits a loop: the card reports which button was pressed, and if it was a search rather than a submit, the loop reissues the card with fresh results — that is how a search across hundreds of accounts happens inside something that cannot fetch. The loop is bounded by a fixed number of iterations and half an hour, so a forgotten card cannot hold a run open.

### One action, a chain of functions

A press on the second card arrives as a new event. The flow resolves the conversation and the meeting record from it, validates the input — a three-word recap is refused with the reason — and writes the recap, the opportunity link and the participants with their buyer roles through the CRM functions, then replaces the card with the new state. When the opportunity already linked to the meeting belongs to a different account, it is shown, kept and saved knowingly: the choice travels as a marked value with a prefix the saving function recognises and strips.

### What earlier versions got wrong

The first design edited the previous card in place, which meant tracking message identifiers and lost a race whenever two events arrived close together. Replacing the card costs a little clutter in the chat and removes the whole class of problem. A “back” step was dropped on purpose: it would have meant one loop around both cards and a much larger state machine for a rare action.

## Reliability and failure handling

Failure modes and what the system does with each.

| When | What the system does |
| --- | --- |
| The transcript has not appeared yet | The pipeline records the stage it reached and stops; the recap field stays empty with the reason visible on the record, and the card flow continues without it. |
| No transcript in the first source | The second source is searched by score; the link is written above forty, the text copied only above sixty; every candidate is kept with its score for a person to review. |
| Several meetings could match | If the recording owner is known and the best candidate does not include them, a second pass runs; if nothing qualifies the automatic link is refused rather than guessed. |
| Two accounts among the participants | The first card does not choose. It shows both and waits for the person. |
| Transcript access switched off for the tenant | Every listing call returns a permission error; the stage is written on the record, so the answer to “why is this empty” is in the data rather than in a run log. |
| A forgotten card | The loop around the card is bounded — a fixed number of iterations and half an hour — so nothing holds a run open indefinitely. |
| A draft missing a required section, or too short | Refused with the reason on screen rather than saved short; nothing is written until a person accepts a draft that meets the standard. |
| Nobody opens the meeting | It gets no recap. The flow cannot run unattended — auditability is bought with somebody’s attention — and a backlog of un-reviewed drafts is ordinary operating reality rather than an edge case. |
| A transient API failure mid-chain | Calls into the CRM are short, retried with exponential backoff and do their heavy lifting server-side; the orchestration only sequences. |

## My responsibility

Design and implementation of the CRM side — the modules and fields, the pipeline functions, the scoring and the gate, the model stage — and of the Teams flow with its cards and callbacks.

## Result

A held meeting becomes CRM data — a recap in the corporate standard, an opportunity link, participants with buyer roles — without anyone opening the CRM: the conversation where the meeting is discussed is also where the workflow is controlled. The CRM stays the system of record; Teams became a lightweight front end over it. The output is written into fields the business reports on, which is what makes the person-in-the-loop worth its cost. When the transcript route was closed at tenant level, the failure was visible on every affected record the same day, with the stage that failed.

## Interactive example

Встроено: [`chat-recap`](../pages/chat-recap.md).

## More examples

- [`chat-recap`](../pages/chat-recap.md) — The two-card flow, walked end to end: pick a message, choose the account, fill the recap, watch the record appear — with a trace of every call.
- [`board`](../pages/board.md) — The recap sheet on the mobile board, with a server-side rephrase.

## Technical notes

- [`cross-system/refuse`](../pages/cross-system.md) — **When should automation refuse?** Score thresholds, ambiguous transcript matches, and the queue a person works instead.
- [`cross-system/resume`](../pages/cross-system.md) — **A two-card wizard in a chat, with nothing held open** Callback subscriptions instead of waiting, a bounded loop, and one string carrying two meanings.

## Related cases

- [`orchestration`](./orchestration.md)
- [`jira-sync`](./jira-sync.md)
- [`ai-workflows`](./ai-workflows.md)
