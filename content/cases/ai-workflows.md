---
case: "ai-workflows"
num: "08"
title: "AI inside CRM workflows — with the decisions kept outside the model"
route: "#/zoho/ai-workflows"
public: true
embed: "agent-journal"
examples: ["agent-journal","chat-recap","board"]
notes: ["loss-analysis","mcp-product"]
related: ["teams-crm","enrichment","platform-engineering"]
words: 1852
source:
  body: "src/cases.js · CASES[7] (slug \"ai-workflows\")"
  furniture: "src/app.html · vCaseStudy()"
---

# 08 · AI inside CRM workflows — with the decisions kept outside the model

> **Kicker** (`kicker`): Claude · OpenAI API · bounded stages · approval · audit trail
>
> **Одной строкой** (`one`): Model calls placed inside CRM processes — meeting recaps, text at the point of input, loss classification, a write-capable assistant — where deterministic code gathers the evidence, validation decides what may be saved, a person approves, and every write leaves a trail.

## Summary

- **What:** The one pattern behind every AI feature on the platform: deterministic collection and identity resolution first, one bounded interpretation task for the model, validation of its output, a human decision before anything is written, and a record of what was done.
- **Scale:** Four instances. A production recap pipeline over Teams and Krisp transcripts; server-side rewriting behind the text controls of the widgets people type into; a two-stage loss-analysis pipeline over six evidence sources; and a write-capable assistant with a risk gate and an action journal, built as a working prototype.
- **My role:** Architecture and implementation of the recap pipeline and the in-widget rewriting; the design and prototype of the loss-analysis pipeline, which another engineer then implemented and owned; the design and a working implementation of the journaled assistant against an emulated org; evaluation of the platform’s native AI.
- **Key topics:** bounded model stages · prompt contracts · validation before write · human approval · audit journal · Claude and OpenAI APIs · MCP

## Key facts

| | |
| --- | --- |
| Providers | Claude · OpenAI API · Zia evaluated |
| The model decides | interpretation · classification · rewriting |
| The model never decides | lookups · stage changes · validation · scheduling · permissions |
| Evidence | six sources for a loss analysis; roughly ten times more code gathering than calling |
| Approval | the draft returns to the person; saving is a deliberate act |
| Risk gate | a fixed list of fields, not a judgement the model makes |
| Keys | server-side only; nothing reaches a page |
| Trail | the stage on the record · a journal module with before and after |

## Context

Most of what a sales team knows arrives as text: the transcript of a client meeting, a chat thread about the follow-up, a note typed on a phone between two meetings at a trade show, and — for a lost deal — an explanation spread across the CRM, the issue tracker and analytics. Turning that text into records the business can filter and report on is work nobody has time for, so the recap field stayed empty and the loss reason stayed a sentence.

The model features on the platform exist to do the interpretation part of that work and only that part. Each one was built on the same rule: a model receives one bounded task inside a system that has already gathered the evidence, resolved the identities and decided what is allowed — and the system, not the model, decides what gets written. This page is that rule, and the four places it was applied.

## Architecture

The same shape every time. Deterministic code gathers the evidence, resolves the identities, applies permissions and writes down which stage it reached. The model receives one bounded task with the output contract in the prompt and answers through a server-side function. Validation checks the answer against what the CRM will accept — required sections, taxonomy membership, a field that exists, a value inside the picklist. A person accepts, corrects or refuses. Only then is anything written, field by field, with the stage on the record or an entry in a journal to say who did what.

<!-- diagram · layers · вставляется после секции body[0] · источник: CASES[7].architecture.dg -->

### Диаграмма — слои архитектуры

_Alt-текст (`aria`, читается скринридером):_ Evidence sources feed deterministic assembly; one bounded model stage follows; validation and a human decision sit between the model and the CRM write, which leaves a trail


**Evidence**
- **Transcripts** — Teams · Krisp, behind one adapter
- **Chats and notes** — threads · a note typed on a phone
- **CRM records** — deal · meeting · participants · history
- **Tracker and analytics** — comments filtered by author

↓ _deterministic code: gather · resolve identities · apply permissions · write the stage_

**Deterministic assembly**
- **Identity resolution** — account · meeting · organiser
- **Evidence package** — six sources, derived signals
- **Permissions and scope** — the function’s, not the model’s
- **Stage on the record** — visible in the data, not a run log

↓ _one bounded task · the output contract in the prompt · keys stay server-side_

**Model stage** (ядро)
- **Recap to a standard** — captions → sections and action items
- **Loss classification** — two stages · 38-cause taxonomy
- **Rewrite at input** — rough note → readable record
- **Command → intent** — prototype: module, record, field, value

↓ _validation: required sections · taxonomy membership · field exists · value in the picklist_

**Human decision**
- **Accept or correct** — the draft returns to the card or the widget
- **Correct the middle** — re-run stage two alone
- **Risk gate** — a fixed list of fields; the diff waits

↓ _field by field · idempotent · attributable_

**CRM write and trail**
- **Reportable fields** — not one long note
- **Action journal** — time · intent · target · before → after
- **Undo and refusal** — the previous text is kept

**Пояснения по клику** (`detail`):

- `transcripts` — **Transcripts**
  Meetings held in Teams have a Teams transcript; meetings held anywhere else are covered by Krisp. Choosing the source is its own step with its own failure modes, behind one adapter, so a third provider changes one step rather than the workflow.
  _ссылка: #/zoho/teams-crm_
- `text` — **Chats and notes**
  A note typed on a phone at a trade show, or a Teams thread about the follow-up. Short, rough, and exactly the input a model is good at making readable.
  _ссылка: #/p/board_
- `crm` — **CRM records**
  The deal, the meeting, the participants and the account history — read by code, never guessed by the model. Derived signals that exist nowhere as fields (how often the start date moved, where the deal stalled) are computed here.
- `outside` — **Tracker and analytics**
  For a loss analysis the tracker comments are filtered by author, so the model reads the client’s voice rather than the CRM’s own echo.
  _ссылка: #/p/loss-analysis_
- `identity` — **Identity resolution**
  Which account, which meeting, which organiser — resolved by keys and scores before a model is involved. When two candidates remain, nothing is chosen for it.
  _ссылка: #/zoho/enrichment_
- `package` — **Evidence package**
  Roughly ten times more code gathers evidence than calls the model. The package is the input contract: the model is never asked to go and find something.
- `scope` — **Permissions and scope**
  The function runs with its own credentials and scopes. A request outside them fails at the boundary, not inside the model’s judgement.
  _ссылка: #/p/mcp-product_
- `stage` — **Stage on the record**
  Each hop writes the stage it reached onto the record itself, so “why is this empty” is answered by the data rather than by a run log nobody can reach.
  _ссылка: #/p/chat-recap_
- `recap` — **Recap to a standard**
  The company’s standard fixes the sections, requires commitments as action items and sets the register. The model produces that structure from the captions; the structure is not its to invent.
  _ссылка: #/p/chat-recap_
- `classify` — **Loss classification**
  Stage one is forbidden to analyse and must list the holes in the data; its output becomes a record. Stage two places the case in a taxonomy of thirty-eight causes carried in the prompt.
  _ссылка: #/p/loss-analysis_
- `rewrite` — **Rewrite at input**
  A server-side function turns the rough note into the structure the business expects and hands it back with an Undo. The same pattern sits behind the drafting controls of more than ten widgets.
  _ссылка: #/p/board_
- `intent` — **Command → intent**
  A prototype: a spoken or typed command parsed into module, record, field and value, then validated against the live field list.
  _ссылка: #/p/agent-journal_
- `accept` — **Accept or correct**
  Nothing goes from the model straight into the record. The draft returns to the card or the widget the person is already looking at, and the save is a deliberate act.
  _ссылка: #/p/chat-recap_
- `middle` — **Correct the middle**
  Because stage one is materialised, a person can correct it and re-run only stage two — cheaper than a restart, and a place to disagree with the evidence rather than with the verdict.
  _ссылка: #/p/loss-analysis_
- `gate` — **Risk gate**
  Above a threshold the diff is shown and the assistant waits. The threshold is a fixed list of fields — stage, amount, owner — not a judgement the model makes.
  _ссылка: #/p/agent-journal_
- `fields` — **Reportable fields**
  Each part of a recap is written to its own field rather than one long note, so the next stage of the deal can be filtered and reported on.
- `journal` — **Action journal**
  A module, not a log file: time, channel, the utterance, the parsed intent, the target record, a before-and-after diff, the result. A module is a screen with filters.
  _ссылка: #/p/agent-journal_
- `undo` — **Undo and refusal**
  A rewrite keeps the previous text one click away; a draft missing a required section is refused with the reason on screen rather than saved short.
  _ссылка: #/p/board_

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "layers",
 "aria": "Evidence sources feed deterministic assembly; one bounded model stage follows; validation and a human decision sit between the model and the CRM write, which leaves a trail",
 "rows": [
  {
   "id": "src",
   "label": "Evidence",
   "nodes": [
    {
     "id": "transcripts",
     "n": "Transcripts",
     "sub": "Teams · Krisp, behind one adapter"
    },
    {
     "id": "text",
     "n": "Chats and notes",
     "sub": "threads · a note typed on a phone"
    },
    {
     "id": "crm",
     "n": "CRM records",
     "sub": "deal · meeting · participants · history"
    },
    {
     "id": "outside",
     "n": "Tracker and analytics",
     "sub": "comments filtered by author"
    }
   ]
  },
  {
   "arrow": "deterministic code: gather · resolve identities · apply permissions · write the stage"
  },
  {
   "id": "assemble",
   "label": "Deterministic assembly",
   "nodes": [
    {
     "id": "identity",
     "n": "Identity resolution",
     "sub": "account · meeting · organiser"
    },
    {
     "id": "package",
     "n": "Evidence package",
     "sub": "six sources, derived signals"
    },
    {
     "id": "scope",
     "n": "Permissions and scope",
     "sub": "the function’s, not the model’s"
    },
    {
     "id": "stage",
     "n": "Stage on the record",
     "sub": "visible in the data, not a run log"
    }
   ]
  },
  {
   "arrow": "one bounded task · the output contract in the prompt · keys stay server-side"
  },
  {
   "id": "model",
   "label": "Model stage",
   "core": true,
   "nodes": [
    {
     "id": "recap",
     "n": "Recap to a standard",
     "sub": "captions → sections and action items"
    },
    {
     "id": "classify",
     "n": "Loss classification",
     "sub": "two stages · 38-cause taxonomy"
    },
    {
     "id": "rewrite",
     "n": "Rewrite at input",
     "sub": "rough note → readable record"
    },
    {
     "id": "intent",
     "n": "Command → intent",
     "sub": "prototype: module, record, field, value"
    }
   ]
  },
  {
   "arrow": "validation: required sections · taxonomy membership · field exists · value in the picklist"
  },
  {
   "id": "human",
   "label": "Human decision",
   "nodes": [
    {
     "id": "accept",
     "n": "Accept or correct",
     "sub": "the draft returns to the card or the widget"
    },
    {
     "id": "middle",
     "n": "Correct the middle",
     "sub": "re-run stage two alone"
    },
    {
     "id": "gate",
     "n": "Risk gate",
     "sub": "a fixed list of fields; the diff waits"
    }
   ]
  },
  {
   "arrow": "field by field · idempotent · attributable"
  },
  {
   "id": "write",
   "label": "CRM write and trail",
   "nodes": [
    {
     "id": "fields",
     "n": "Reportable fields",
     "sub": "not one long note"
    },
    {
     "id": "journal",
     "n": "Action journal",
     "sub": "time · intent · target · before → after"
    },
    {
     "id": "undo",
     "n": "Undo and refusal",
     "sub": "the previous text is kept"
    }
   ]
  }
 ],
 "detail": {
  "transcripts": {
   "t": "Transcripts",
   "d": "Meetings held in Teams have a Teams transcript; meetings held anywhere else are covered by Krisp. Choosing the source is its own step with its own failure modes, behind one adapter, so a third provider changes one step rather than the workflow.",
   "demo": "zoho/teams-crm"
  },
  "text": {
   "t": "Chats and notes",
   "d": "A note typed on a phone at a trade show, or a Teams thread about the follow-up. Short, rough, and exactly the input a model is good at making readable.",
   "demo": "p/board"
  },
  "crm": {
   "t": "CRM records",
   "d": "The deal, the meeting, the participants and the account history — read by code, never guessed by the model. Derived signals that exist nowhere as fields (how often the start date moved, where the deal stalled) are computed here."
  },
  "outside": {
   "t": "Tracker and analytics",
   "d": "For a loss analysis the tracker comments are filtered by author, so the model reads the client’s voice rather than the CRM’s own echo.",
   "demo": "p/loss-analysis"
  },
  "identity": {
   "t": "Identity resolution",
   "d": "Which account, which meeting, which organiser — resolved by keys and scores before a model is involved. When two candidates remain, nothing is chosen for it.",
   "demo": "zoho/enrichment"
  },
  "package": {
   "t": "Evidence package",
   "d": "Roughly ten times more code gathers evidence than calls the model. The package is the input contract: the model is never asked to go and find something."
  },
  "scope": {
   "t": "Permissions and scope",
   "d": "The function runs with its own credentials and scopes. A request outside them fails at the boundary, not inside the model’s judgement.",
   "demo": "p/mcp-product"
  },
  "stage": {
   "t": "Stage on the record",
   "d": "Each hop writes the stage it reached onto the record itself, so “why is this empty” is answered by the data rather than by a run log nobody can reach.",
   "demo": "p/chat-recap"
  },
  "recap": {
   "t": "Recap to a standard",
   "d": "The company’s standard fixes the sections, requires commitments as action items and sets the register. The model produces that structure from the captions; the structure is not its to invent.",
   "demo": "p/chat-recap"
  },
  "classify": {
   "t": "Loss classification",
   "d": "Stage one is forbidden to analyse and must list the holes in the data; its output becomes a record. Stage two places the case in a taxonomy of thirty-eight causes carried in the prompt.",
   "demo": "p/loss-analysis"
  },
  "rewrite": {
   "t": "Rewrite at input",
   "d": "A server-side function turns the rough note into the structure the business expects and hands it back with an Undo. The same pattern sits behind the drafting controls of more than ten widgets.",
   "demo": "p/board"
  },
  "intent": {
   "t": "Command → intent",
   "d": "A prototype: a spoken or typed command parsed into module, record, field and value, then validated against the live field list.",
   "demo": "p/agent-journal"
  },
  "accept": {
   "t": "Accept or correct",
   "d": "Nothing goes from the model straight into the record. The draft returns to the card or the widget the person is already looking at, and the save is a deliberate act.",
   "demo": "p/chat-recap"
  },
  "middle": {
   "t": "Correct the middle",
   "d": "Because stage one is materialised, a person can correct it and re-run only stage two — cheaper than a restart, and a place to disagree with the evidence rather than with the verdict.",
   "demo": "p/loss-analysis"
  },
  "gate": {
   "t": "Risk gate",
   "d": "Above a threshold the diff is shown and the assistant waits. The threshold is a fixed list of fields — stage, amount, owner — not a judgement the model makes.",
   "demo": "p/agent-journal"
  },
  "fields": {
   "t": "Reportable fields",
   "d": "Each part of a recap is written to its own field rather than one long note, so the next stage of the deal can be filtered and reported on."
  },
  "journal": {
   "t": "Action journal",
   "d": "A module, not a log file: time, channel, the utterance, the parsed intent, the target record, a before-and-after diff, the result. A module is a screen with filters.",
   "demo": "p/agent-journal"
  },
  "undo": {
   "t": "Undo and refusal",
   "d": "A rewrite keeps the previous text one click away; a draft missing a required section is refused with the reason on screen rather than saved short.",
   "demo": "p/board"
  }
 }
}
```

</details>

## Constraints

- **Function limits** — A server-side function has a time limit and no long-running state. Gathering six sources and reasoning about them does not fit in one call, so a pipeline is split into stages and the intermediate result is materialised as a record rather than held in memory.
- **Keys** — A widget is a page in somebody’s browser. Provider keys never leave the server side: the page calls a function, the function calls the provider, and the page only ever sees the result.
- **Comparability** — A free-text answer cannot be reported on. A recap has to land in the company’s own sections with the commitments pulled out; a loss reason has to land in one taxonomy — or neither is useful to anyone but the person who wrote it.
- **Accountability** — Nothing generated may replace a human-written field silently, and every write has to be attributable afterwards. The platform’s own audit trail exports only through its interface, so the trail had to be designed in.
- **Availability of the evidence** — Transcript access can be switched off at tenant level without warning. A second source and a visible “no recap” state have to exist before the first outage, not after it.
- **Cost** — Every provider call costs money and every enrichment credit is spent once. A stage that can be re-run on its own is cheaper than a pipeline that starts over.

## Implementation

### The rule: where the model is allowed to decide

The split is stated as a rule rather than left to taste, because a model dropped into the wrong part of a CRM workflow returns a plausible ungrounded answer instead of a correct one. Deterministic operations stay deterministic: a lookup, a stage change, a picklist validation, a query across two hundred records, a schedule, a permission check. Nothing about any of them improves when a model guesses. Classification and rewriting are where the model belongs: turning captions into a recap, placing a loss reason inside a taxonomy, making a phone note readable, correcting a misheard company name. The record shapes, the required fields and the refusals live outside the model — in the function, the validation and the surface definition — where somebody can review them without reading a prompt to find out what the system will accept.

### Recaps: a production pipeline with a model in the middle

Seven hops from the meeting record to a written recap: read the meeting, resolve the organiser to a directory identity, turn the join link into an online-meeting id, ask whichever source owns the meeting for its captions, download them, call the model, write the result. The pipeline starts the moment a person picks the account on the first Teams card, so the draft is ready before the card that asks for it. The model’s task is bounded to producing the corporate recap standard — fixed sections, commitments as action items, a plain factual register — from the captions it was handed. A draft missing a required section, or too short to be a recap of anything, is refused with the reason on screen. The accepted recap is written part by part into its own fields, and the stage the pipeline reached is written onto the record after every hop. The whole flow, and Teams as its control surface, is [case 03](#/zoho/teams-crm).

### Text at the point of input

The cheapest place to improve CRM data is where it is typed. On the mobile meeting board a rough note goes to a server-side function, the function calls the provider, and the rewritten draft comes back into the same text area with an Undo that restores the original. The page never holds a key and never talks to a provider; it calls a function and shows the envelope it gets back, including the failure. The same server-side pattern sits behind the drafting and rewriting controls in more than ten widgets. What stays fixed in every one of them: the interface names the target record and the allowed operation, validation decides what may be saved, and a field a person wrote is never replaced without that person pressing the button.

### Loss analysis: two stages, and the taxonomy in the prompt

“Why did we lose this deal”, answered in free text, is useless for reporting. The design gathers evidence from six sources — the CRM, the tracker, analytics — plus derived behavioural signals that exist nowhere as fields: how many times the start date moved, which stage the deal stalled in, whether this client had ever been won before. Tracker comments are filtered by author so the model reads the outside voice. Then two stages, because the function time limit does not allow gathering and reasoning in one call: the first is explicitly forbidden to analyse and must list the holes in the data, and its output is materialised as a record; the second reads that record and does one thing — place the case in a seven-kilobyte taxonomy of thirty-eight causes with rules for choosing between them. A person can correct the middle record and re-run only the second stage.

The role, stated plainly: I designed the direction, the evidence model and the two-stage shape and prototyped it; another engineer implemented and owned the production version. And the prototype’s weakness, stated as plainly: it used no structured output, so the answer was parsed by markdown anchors and substring checks, and stop reasons were not inspected, so a truncated answer looked complete. A schema-constrained output, validation of the category against the taxonomy before it is written, and a picklist field to write it into are the repairs — the same three things any classification stage should have from the start.

### A write-capable assistant, and the journal that keeps it honest

Reading is cheap to get wrong; writing is not. A command such as “move the deal to negotiation” is parsed into module, record, field and value, then validated against the live field list — a field that does not exist, or a value outside the picklist, is refused with the reason and nothing is written. The target record is resolved against the CRM; when two candidates remain, nothing is chosen for the person and the candidates are shown. Above a risk threshold — a fixed list of fields such as stage, amount and owner, never a judgement the model makes — the before-and-after diff is shown and the assistant waits. Every action, applied or refused, writes to a journal module: time, channel, the utterance as heard, the parsed intent, the target, the diff, the result. A module is a screen with filters; a log file is not.

This one is a working prototype built for this portfolio against an emulated org, not a feature that ran in production, and the recognition and parsing are pre-recorded rather than a live model call. It is on the page because it is the approval-and-audit half of the pattern made clickable: the same refusals, gates and trail the production features apply, on the one surface where a reader can press the buttons.

### Access for assistants: the boundary is a list

When an assistant works against the org — reading records, pulling functions, checking what calls what — it does so through a scoped MCP surface: a fixed set of typed operations over records and over the platform tooling around them, with permissions carried by the credentials the surface holds rather than by what the model is asked. There is no escape hatch that lets a model compose an arbitrary request, so the answer to “what could this do if it were wrong” is a list somebody wrote. The surface is used by the org’s extraction and audit tooling today; as a product surface for salespeople it is an exploration, not a production feature, and the page that describes it says so.

### The platform’s own AI, evaluated

The native assistant ships in the box, so the question was where it earns its place. It was evaluated against the real workflows, the data boundaries and the cost, configured where it fit, and passed over where a custom pipeline could be held to the same standard and the same audit trail as everything else on this page.

## Reliability and failure handling

What happens when the evidence is missing, the model is wrong, or the person is not there.

| When | What the system does |
| --- | --- |
| Transcript access is switched off at tenant level | Listing returns a permission error; the stage reached is recorded on the record and the run stops without a recap. The second source is matched by score, with a gate that refuses the automatic link if the known recording owner is not among the candidates. |
| The draft is missing a required section, or is too short | Refused with the reason on screen. Nothing is saved short. |
| Nobody opens the meeting | No recap. The flow cannot run unattended by design; a backlog of un-reviewed drafts is a visible state, not a silent one. |
| Stage one of the loss analysis finds holes in the evidence | The holes are part of the materialised record. A person fills or corrects them and re-runs only the second stage. |
| The command names a field that does not exist, or a value outside the picklist | Validation against the live field list refuses before any write; the refusal and its reason are journaled. |
| The command resolves to two candidate records | Nothing is written. The candidates are shown and the person chooses. |
| The change touches a high-risk field | The diff is shown and the assistant waits. The list of such fields is fixed, not inferred. |
| The provider is slow or answers with an error | The widget shows the function’s own error envelope, the person keeps their text, and a rewrite that did arrive can be undone in one click. |
| The answer is truncated | The open weakness of the loss-analysis prototype, named rather than hidden: stop reasons were not inspected. A schema-constrained output and validation against the taxonomy are the repair. |

## Data ownership and security

Provider keys live in server-side functions and connections; a page calls a function and sees only the result. The provider receives the evidence package for one task and the contract for its output — captions and the recap standard, a note and the target structure, the loss-analysis package — not an open connection to the CRM. Assistant access to the org goes through a scoped MCP surface whose operations are a fixed list and whose permissions are the surface’s own. Every write is attributable: the stage on the record for the pipelines, the journal for the assistant, and the person who pressed Save for anything a model drafted.

## My responsibility

Architecture, implementation and production support of the recap pipeline and the in-widget rewriting. On the loss analysis, the direction, the evidence model and the two-stage design, prototyped; another engineer implemented and owned the production version. On the journaled assistant, the design and a working implementation against an emulated org. On MCP, the surface the org tooling uses. Stated this way because the difference matters when somebody is deciding what to trust.

## Result

Recaps to the corporate standard within minutes of a meeting being picked, written into fields the business reports on. Salespeople turning phone notes into readable records without leaving the widget. Loss reasons that can be compared across deals because they land in one taxonomy. And one rule, applied in every one of those places, that answers “what happens when the model is wrong” with a validation, a person or a journal entry rather than a shrug.

## Interactive example

Встроено: [`agent-journal`](../pages/agent-journal.md).

> A working prototype built for this portfolio: the recognition and parsing are pre-recorded, and it writes to an emulated org. The pattern it makes clickable — validate against the live field list, refuse ambiguity, gate high-risk fields, journal everything — is the one the production features follow.

## More examples

- [`agent-journal`](../pages/agent-journal.md) — the approval-and-audit half of the pattern, clickable
- [`chat-recap`](../pages/chat-recap.md) — the production recap pipeline, with its trace panel
- [`board`](../pages/board.md) — the Rephrase button on the mobile recap, server-side

## Technical notes

- [`loss-analysis`](../pages/loss-analysis.md)
- [`mcp-product`](../pages/mcp-product.md)

## Related cases

- [`teams-crm`](./teams-crm.md)
- [`enrichment`](./enrichment.md)
- [`platform-engineering`](./platform-engineering.md)
