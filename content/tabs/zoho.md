---
tab: "zoho"
title: "Zoho"
route: "#/zoho"
items: 18
public: true
source:
  lede: "src/app.html · vZoho()"
  items: "src/app.html · ZOHO_GROUPS"
---

# Zoho

## Лид страницы

Zoho CRM &middot; 2023 &mdash; present Zoho CRM engineering More than three years as the primary engineer and technical owner of a production Zoho CRM at a global game-development services company: sales, business development and regional teams in several countries, an org of more than a thousand functions, an integration layer around Microsoft Graph, Teams, Jira and Apollo, and model stages inside the workflows that run on it. The work below is the platform as it runs, shown against synthetic data.

## Плашка масштаба (`OVERVIEW.scale`, src/cases.js)

- **70+** production widgets
- **50+** custom modules
- **1,000+** org functions under Git
- **10+** connected systems
- **3+ yrs** platform ownership

## Направления (`OVERVIEW.directions`)

### Platform development

Deluge as the daily language: hundreds of functions behind integrations, scheduled jobs and every widget on the platform. Fifty-plus custom modules, with junction, service and journal modules replacing the free-text pseudo-relations the org had accumulated. Workflows, Blueprints and schedules designed as one estate that shares a single quota and a single timeout, so no run nears the ceiling and an interrupted job continues instead of restarting.

_Теги:_ Deluge · custom modules · workflows · Blueprints · schedules · validation rules

### Custom interfaces

Seventy-plus production widgets on record pages, related lists, buttons, web tabs, Canvas and the mobile app, assembled from a versioned component and function library. Heavy tables on Tabulator with validated in-cell editing, custom header filters and paging at the platform’s 200-row ceiling; mobile screens that carry their own console, because a phone inside the CRM app has no developer tools.

_Теги:_ Widgets · Canvas & mobile · Zoho SDK · Tabulator · JavaScript · HTML/CSS

### Integrations

Microsoft Graph for calendars, mail and identity across seventeen shared mailboxes; Teams for conversations, meetings and Adaptive Card wizards; Jira for two-way comments; Apollo for enrichment; Slack for the integration layer’s own health; Google Calendar events created from the CRM; a server-side email ingestion pipeline. Each contract defines the auth model, the failure classes, the retry policy and the reconciliation rule before the first call is written.

_Теги:_ Microsoft Graph · Teams · Jira · Apollo · Slack · REST & webhooks · OAuth 2.0

### Data & reliability

COQL as the query surface. A legacy-CRM migration verified against reconciliation rules rather than record counts. Identity resolution with four keys applied in a fixed order. Checkpoints written per page, delta tokens with expiry recovery inside the same run, idempotent writes through markers and journals, and throttling that slows a mailbox instead of failing it.

_Теги:_ COQL · migration · deduplication · idempotency · pagination · delta tokens · retries

### Platform engineering

Extraction tooling that pulled more than a thousand functions out of a platform with no export into a Git repository; a configuration snapshot standing in for the change history the platform never kept; a five-channel audit of every function’s entry points; a two-way deploy pipeline that verifies the round trip by hash; reviewed, one-click releases on GitHub Actions.

_Теги:_ Git · code extraction · dependency analysis · org audit · CI/CD · code review

### AI inside CRM workflows

Model calls placed inside CRM processes rather than beside them: a production recap pipeline over Teams and Krisp transcripts, server-side rewriting behind the text controls of the widgets, a two-stage loss classification into the company’s own taxonomy, and a scoped MCP surface for assistants. Deterministic code gathers the evidence and resolves identities; the model gets one bounded task; validation and a person decide what is written; every write leaves a trail.

_Теги:_ Claude · OpenAI API · prompt contracts · validation · human approval · audit journal · MCP

## Платформа как одна система (`ARCH`)

<!-- diagram · layers · вставляется после секции body[0] · источник: src/cases.js · ARCH -->

### Диаграмма — слои архитектуры

_Alt-текст (`aria`, читается скринридером):_ Layered architecture: external systems feed integration services, which write into Zoho CRM; automation runs on the CRM, and custom interfaces sit on top of both


**External systems**
- **Microsoft Graph** — calendar · mail · identity
- **Teams** — chats · meetings · cards
- **Jira** — issues · comments
- **Apollo** — people enrichment
- **Slack** — alerts
- **Google Calendar** — events
- **Email sources** — ingestion
- **Legacy CRM** — migration
- **Claude · OpenAI** — model providers

↓ _OAuth 2.0 · pagination · three retry classes · throttling budgets_

**Integration services**
- **Calendar delta sync** — 17 mailboxes · checkpoint per page
- **Thread importer** — text contract · 5 channels a run
- **Recap pipeline** — 7 hops · starts early, nothing waits
- **Webhook receiver** — repairs its own payload
- **Enrichment** — 4 identity keys, in order
- **Reconciliation** — authority map → expected value
- **Model stages** — recap · classification · rewrite

↓ _idempotent writes · create and update kept apart · human-authored fields protected_

**Zoho CRM** (ядро)
- **Accounts · Contacts · Deals** — standard modules, redesigned relations
- **Meetings · Events** — lifecycle: booked → held → declined
- **50+ custom modules** — junction · service · journal
- **Blueprints · validation** — state machines, refusals with a reason

↓ _rules · schedules · functions_

**Automation**
- **Deluge functions** — hundreds, under Git
- **Workflows** — criteria indexed against execution history
- **Schedules** — shared quota · resumable · no overlap
- **Blueprints** — controlled transitions

↓ _embedded SDK · COQL · server-side functions_

**Custom interfaces**
- **70+ widgets** — record pages · related lists · web tabs
- **Canvas pages** — full record layouts
- **Mobile** — Canvas mobile detail view
- **Teams Adaptive Cards** — a control surface outside the CRM

**Пояснения по клику** (`detail`):

- `graph` — **Microsoft Graph**
  Calendars of seventeen shared mailboxes read through delta queries; mail and directory identity for the recap pipeline. Runs on an Entra app registration with least-privilege scopes.
  _ссылка: #/zoho/orchestration_
- `teams` — **Microsoft Teams**
  Deal conversations imported from channels without a bot, and Adaptive Card wizards that drive a CRM workflow from inside the chat.
  _ссылка: #/zoho/teams-crm_
- `jira` — **Jira**
  Two-way comment sync between a deal and its issue, made idempotent by a marker inside the comment body; attachments travel as links.
  _ссылка: #/zoho/jira-sync_
- `apollo` — **Apollo**
  People from an enrichment provider matched against the CRM through four keys in sequence before anything is written.
  _ссылка: #/zoho/enrichment_
- `slack` — **Slack**
  Each sync classifies its own failures and reports its own health into the channels the team already reads.
- `gcal` — **Google Calendar**
  Events created and viewed from the CRM record, with meeting-overlap prevention and meetings linked to accounts and contracts.
- `mail` — **Email sources**
  A server-side ingestion pipeline: fetched, deduplicated, matched to the right account and deal, attached where sales looks.
- `legacy` — **Legacy CRM**
  A one-way migration: years of records mapped, transformed, validated and loaded with automation suppressed, verified against reconciliation rules.
  _ссылка: #/zoho/reconciliation_
- `llm` — **Model providers**
  Claude and the OpenAI API, called from server-side functions only. Each call is one bounded task — a recap to a standard, a classification into a taxonomy, a rewrite — with the output contract in the prompt.
  _ссылка: #/zoho/ai-workflows_
- `delta` — **Calendar delta sync**
  A checkpoint is written after every page, not at the end of the run, so a run that dies on page forty loses nothing.
  _ссылка: #/zoho/orchestration_
- `threads` — **Thread importer**
  A text contract in the first message of a thread maps it to a deal; the importer is resumable and takes five channels a run.
  _ссылка: #/p/chat-tracker_
- `recap` — **Recap pipeline**
  Seven hops from the meeting record to a written recap, started the moment an account is picked so the field is filled before anyone asks.
  _ссылка: #/p/chat-recap_
- `webhook` — **Webhook receiver**
  Five attempts that read the failing field out of the CRM error and rewrite the payload, because a rejected write is a lost event.
  _ссылка: #/p/cross-system/resume_
- `enrich` — **Enrichment**
  Four identity keys applied in a fixed order, ending with a normalised profile URL; name matches shown but never blocking.
  _ссылка: #/p/enrichment_
- `recon` — **Reconciliation**
  A third column — the expected value, computed from an authority map — beside the two sources, and a repair that writes exactly that.
  _ссылка: #/p/cross-system/who-owns_
- `modelstage` — **Model stages**
  Deterministic code gathers the evidence and resolves the identities; the model gets one task; validation and a person decide what is written; the stage reached is on the record.
  _ссылка: #/zoho/ai-workflows_
- `std` — **Standard modules**
  Relations that lived as free text became junction modules with ownership, lifecycle and validation defined rather than accumulated.
- `meet` — **Meetings and events**
  A meeting is booked, held or declined. Two processes decide which, each authoritative over exactly one question.
  _ссылка: #/p/cross-system/who-owns_
- `custom` — **Custom modules**
  Fifty-plus custom modules: junctions for many-to-many relations, service catalogues, and journal modules that record what automation did to a record.
- `state` — **Blueprints and validation**
  The sales pipeline as a state machine with per-stage mandatory fields; every refusal names its reason, in the layout, the Blueprint, the workflow or the widget.
- `deluge` — **Deluge functions**
  Hundreds of functions of my own inside an org of more than a thousand, all of them extracted into Git and indexed against their entry points.
  _ссылка: #/zoho/platform-engineering_
- `wf` — **Workflows**
  The automation estate audited as a whole: rules marked active that had never fired once turned up in the index, because a criterion named a renamed field.
- `sched` — **Schedules**
  Delta syncs, a chat import every ten minutes, a monthly forced resync — partitioned and resumable so that no single run nears the shared ceiling.
- `bp` — **Blueprints**
  Stages, controlled transitions, per-stage mandatory fields and the escape paths that show up in week two.
- `widgets` — **Widgets**
  Seventy-plus production widgets on a versioned component library: contact desks, meeting boards, a solution matrix, reconciliation screens.
  _ссылка: #/zoho/widgets_
- `canvas` — **Canvas pages**
  Full record pages built in Canvas where the standard layout could not carry the process.
- `mobile` — **Mobile**
  Widgets for the Zoho mobile app, including an on-screen console with a ring buffer, because a phone inside the app has no developer tools.
  _ссылка: #/p/board_
- `cards` — **Teams Adaptive Cards**
  A CRM workflow driven from Teams: cards as callback subscriptions, so nothing holds a request open while a person thinks.
  _ссылка: #/zoho/teams-crm_

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "layers",
 "aria": "Layered architecture: external systems feed integration services, which write into Zoho CRM; automation runs on the CRM, and custom interfaces sit on top of both",
 "rows": [
  {
   "id": "ext",
   "label": "External systems",
   "nodes": [
    {
     "id": "graph",
     "n": "Microsoft Graph",
     "sub": "calendar · mail · identity"
    },
    {
     "id": "teams",
     "n": "Teams",
     "sub": "chats · meetings · cards"
    },
    {
     "id": "jira",
     "n": "Jira",
     "sub": "issues · comments"
    },
    {
     "id": "apollo",
     "n": "Apollo",
     "sub": "people enrichment"
    },
    {
     "id": "slack",
     "n": "Slack",
     "sub": "alerts"
    },
    {
     "id": "gcal",
     "n": "Google Calendar",
     "sub": "events"
    },
    {
     "id": "mail",
     "n": "Email sources",
     "sub": "ingestion"
    },
    {
     "id": "legacy",
     "n": "Legacy CRM",
     "sub": "migration"
    },
    {
     "id": "llm",
     "n": "Claude · OpenAI",
     "sub": "model providers"
    }
   ]
  },
  {
   "arrow": "OAuth 2.0 · pagination · three retry classes · throttling budgets"
  },
  {
   "id": "svc",
   "label": "Integration services",
   "nodes": [
    {
     "id": "delta",
     "n": "Calendar delta sync",
     "sub": "17 mailboxes · checkpoint per page"
    },
    {
     "id": "threads",
     "n": "Thread importer",
     "sub": "text contract · 5 channels a run"
    },
    {
     "id": "recap",
     "n": "Recap pipeline",
     "sub": "7 hops · starts early, nothing waits"
    },
    {
     "id": "webhook",
     "n": "Webhook receiver",
     "sub": "repairs its own payload"
    },
    {
     "id": "enrich",
     "n": "Enrichment",
     "sub": "4 identity keys, in order"
    },
    {
     "id": "recon",
     "n": "Reconciliation",
     "sub": "authority map → expected value"
    },
    {
     "id": "modelstage",
     "n": "Model stages",
     "sub": "recap · classification · rewrite"
    }
   ]
  },
  {
   "arrow": "idempotent writes · create and update kept apart · human-authored fields protected"
  },
  {
   "id": "crm",
   "label": "Zoho CRM",
   "core": true,
   "nodes": [
    {
     "id": "std",
     "n": "Accounts · Contacts · Deals",
     "sub": "standard modules, redesigned relations"
    },
    {
     "id": "meet",
     "n": "Meetings · Events",
     "sub": "lifecycle: booked → held → declined"
    },
    {
     "id": "custom",
     "n": "50+ custom modules",
     "sub": "junction · service · journal"
    },
    {
     "id": "state",
     "n": "Blueprints · validation",
     "sub": "state machines, refusals with a reason"
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
     "id": "deluge",
     "n": "Deluge functions",
     "sub": "hundreds, under Git"
    },
    {
     "id": "wf",
     "n": "Workflows",
     "sub": "criteria indexed against execution history"
    },
    {
     "id": "sched",
     "n": "Schedules",
     "sub": "shared quota · resumable · no overlap"
    },
    {
     "id": "bp",
     "n": "Blueprints",
     "sub": "controlled transitions"
    }
   ]
  },
  {
   "arrow": "embedded SDK · COQL · server-side functions"
  },
  {
   "id": "ui",
   "label": "Custom interfaces",
   "nodes": [
    {
     "id": "widgets",
     "n": "70+ widgets",
     "sub": "record pages · related lists · web tabs"
    },
    {
     "id": "canvas",
     "n": "Canvas pages",
     "sub": "full record layouts"
    },
    {
     "id": "mobile",
     "n": "Mobile",
     "sub": "Canvas mobile detail view"
    },
    {
     "id": "cards",
     "n": "Teams Adaptive Cards",
     "sub": "a control surface outside the CRM"
    }
   ]
  }
 ],
 "detail": {
  "graph": {
   "t": "Microsoft Graph",
   "d": "Calendars of seventeen shared mailboxes read through delta queries; mail and directory identity for the recap pipeline. Runs on an Entra app registration with least-privilege scopes.",
   "demo": "zoho/orchestration"
  },
  "teams": {
   "t": "Microsoft Teams",
   "d": "Deal conversations imported from channels without a bot, and Adaptive Card wizards that drive a CRM workflow from inside the chat.",
   "demo": "zoho/teams-crm"
  },
  "jira": {
   "t": "Jira",
   "d": "Two-way comment sync between a deal and its issue, made idempotent by a marker inside the comment body; attachments travel as links.",
   "demo": "zoho/jira-sync"
  },
  "apollo": {
   "t": "Apollo",
   "d": "People from an enrichment provider matched against the CRM through four keys in sequence before anything is written.",
   "demo": "zoho/enrichment"
  },
  "slack": {
   "t": "Slack",
   "d": "Each sync classifies its own failures and reports its own health into the channels the team already reads."
  },
  "gcal": {
   "t": "Google Calendar",
   "d": "Events created and viewed from the CRM record, with meeting-overlap prevention and meetings linked to accounts and contracts."
  },
  "mail": {
   "t": "Email sources",
   "d": "A server-side ingestion pipeline: fetched, deduplicated, matched to the right account and deal, attached where sales looks."
  },
  "legacy": {
   "t": "Legacy CRM",
   "d": "A one-way migration: years of records mapped, transformed, validated and loaded with automation suppressed, verified against reconciliation rules.",
   "demo": "zoho/reconciliation"
  },
  "llm": {
   "t": "Model providers",
   "d": "Claude and the OpenAI API, called from server-side functions only. Each call is one bounded task — a recap to a standard, a classification into a taxonomy, a rewrite — with the output contract in the prompt.",
   "demo": "zoho/ai-workflows"
  },
  "delta": {
   "t": "Calendar delta sync",
   "d": "A checkpoint is written after every page, not at the end of the run, so a run that dies on page forty loses nothing.",
   "demo": "zoho/orchestration"
  },
  "threads": {
   "t": "Thread importer",
   "d": "A text contract in the first message of a thread maps it to a deal; the importer is resumable and takes five channels a run.",
   "demo": "p/chat-tracker"
  },
  "recap": {
   "t": "Recap pipeline",
   "d": "Seven hops from the meeting record to a written recap, started the moment an account is picked so the field is filled before anyone asks.",
   "demo": "p/chat-recap"
  },
  "webhook": {
   "t": "Webhook receiver",
   "d": "Five attempts that read the failing field out of the CRM error and rewrite the payload, because a rejected write is a lost event.",
   "demo": "p/cross-system/resume"
  },
  "enrich": {
   "t": "Enrichment",
   "d": "Four identity keys applied in a fixed order, ending with a normalised profile URL; name matches shown but never blocking.",
   "demo": "p/enrichment"
  },
  "recon": {
   "t": "Reconciliation",
   "d": "A third column — the expected value, computed from an authority map — beside the two sources, and a repair that writes exactly that.",
   "demo": "p/cross-system/who-owns"
  },
  "modelstage": {
   "t": "Model stages",
   "d": "Deterministic code gathers the evidence and resolves the identities; the model gets one task; validation and a person decide what is written; the stage reached is on the record.",
   "demo": "zoho/ai-workflows"
  },
  "std": {
   "t": "Standard modules",
   "d": "Relations that lived as free text became junction modules with ownership, lifecycle and validation defined rather than accumulated."
  },
  "meet": {
   "t": "Meetings and events",
   "d": "A meeting is booked, held or declined. Two processes decide which, each authoritative over exactly one question.",
   "demo": "p/cross-system/who-owns"
  },
  "custom": {
   "t": "Custom modules",
   "d": "Fifty-plus custom modules: junctions for many-to-many relations, service catalogues, and journal modules that record what automation did to a record."
  },
  "state": {
   "t": "Blueprints and validation",
   "d": "The sales pipeline as a state machine with per-stage mandatory fields; every refusal names its reason, in the layout, the Blueprint, the workflow or the widget."
  },
  "deluge": {
   "t": "Deluge functions",
   "d": "Hundreds of functions of my own inside an org of more than a thousand, all of them extracted into Git and indexed against their entry points.",
   "demo": "zoho/platform-engineering"
  },
  "wf": {
   "t": "Workflows",
   "d": "The automation estate audited as a whole: rules marked active that had never fired once turned up in the index, because a criterion named a renamed field."
  },
  "sched": {
   "t": "Schedules",
   "d": "Delta syncs, a chat import every ten minutes, a monthly forced resync — partitioned and resumable so that no single run nears the shared ceiling."
  },
  "bp": {
   "t": "Blueprints",
   "d": "Stages, controlled transitions, per-stage mandatory fields and the escape paths that show up in week two."
  },
  "widgets": {
   "t": "Widgets",
   "d": "Seventy-plus production widgets on a versioned component library: contact desks, meeting boards, a solution matrix, reconciliation screens.",
   "demo": "zoho/widgets"
  },
  "canvas": {
   "t": "Canvas pages",
   "d": "Full record pages built in Canvas where the standard layout could not carry the process."
  },
  "mobile": {
   "t": "Mobile",
   "d": "Widgets for the Zoho mobile app, including an on-screen console with a ring buffer, because a phone inside the app has no developer tools.",
   "demo": "p/board"
  },
  "cards": {
   "t": "Teams Adaptive Cards",
   "d": "A CRM workflow driven from Teams: cards as callback subscriptions, so nothing holds a request open while a person thinks.",
   "demo": "zoho/teams-crm"
  }
 }
}
```

</details>

## Кейсы (`CASES`, по файлу на кейс в content/cases/)

- 01 [`widgets`](../cases/widgets.md) — Custom CRM interfaces
- 02 [`orchestration`](../cases/orchestration.md) — Multi-system synchronisation and CRM orchestration
- 03 [`teams-crm`](../cases/teams-crm.md) — From meeting data to CRM automation — with Teams as the control surface
- 04 [`jira-sync`](../cases/jira-sync.md) — Teams → CRM → Jira: one thread, three systems, and who owns what
- 05 [`enrichment`](../cases/enrichment.md) — Contact enrichment and identity resolution
- 06 [`platform-engineering`](../cases/platform-engineering.md) — Zoho platform engineering
- 07 [`reconciliation`](../cases/reconciliation.md) — Data authority, reconciliation and migration
- 08 [`ai-workflows`](../cases/ai-workflows.md) — AI inside CRM workflows — with the decisions kept outside the model

_Публично страница Zoho рисуется из этих данных (`vZoho()`); группы ниже — реестр страниц (`ZOHO_GROUPS`), их абзацы на публичной странице не показываются._

## Карточки

| id | Заголовок (`t`) | Подпись (`s`) | Вид | Публично |
| --- | --- | --- | --- | --- |
| [`enrichment`](../pages/enrichment.md) | Contact enrichment | Provider people matched against the CRM through four identity keys before a single one is written. | live | да |
| [`contact-model`](../pages/contact-model.md) | One person, several companies — without duplicate identities | A many-to-many contact model, the migration onto it, and the identity rules every inbound path now obeys. | note | да |
| [`event`](../pages/event.md) | One event system, end to end | Targeting, booking, conflict checks, mobile execution and reconciliation on one campaign record. | live | да |
| [`board`](../pages/board.md) | The event floor, designed for a phone | A room-by-room schedule, team load and assisted recap flow for a surface with no developer tools. | live | да |
| [`calendar-sync`](../pages/calendar-sync.md) | Delta sync across seventeen calendars | A checkpoint written on every page, because the language has no while loop and a run can die on page forty. | plan | нет |
| [`mobile-canvas`](../pages/mobile-canvas.md) | Building for a surface with no devtools | An on-screen console with a ring buffer, and the bugs it was the only way to catch. | plan | нет |
| [`chat-tracker`](../pages/chat-tracker.md) | One thread across Teams, Zoho and Jira | CRM owns routing and delivery state; stable markers make every ten-minute run safe to replay. | emul | да |
| [`cross-system`](../pages/cross-system.md) | Who is allowed to be right? | Field authority, reconciliation and refusal rules for systems that disagree. | note | да |
| [`teams-jira`](../pages/teams-jira.md) | Teams → CRM → Jira, and who owns what | An ownership matrix across four systems, a text contract as the mapping mechanism, and idempotency on both arms. | plan | нет |
| [`cockpit`](../pages/cockpit.md) | Sales cockpit | Open value, overdue deals, agreements waiting and tasks past due — for the team or for one person. | live | да |
| [`reporting`](../pages/reporting.md) | The week that reports itself | Weekly summaries for sales leads and per-person reminders, assembled on a schedule and delivered where people already work. | plan | нет |
| [`orghealth`](../pages/orghealth.md) | An org audit that names what it cannot see | Every function of a generated org reconciled against five entry channels, with blind spots stated first. | live | да |
| [`solution`](../pages/solution.md) | A business map the standard CRM could not draw | Service lines against business units, with live pipeline and opportunity creation in the same matrix. | live | да |
| [`org-tooling`](../pages/org-tooling.md) | The engineering layer Zoho did not provide | Pull the org into one searchable system, map dependencies and turn browser-only change into reviewed delivery. | note | да |
| [`deluge-cicd`](../pages/deluge-cicd.md) | From browser-only code to reviewed delivery | Pull, analyse, review, deploy, run and verify — one controlled toolchain around a browser-only editor. | note | да |
| [`widget-system`](../pages/widget-system.md) | Seventy widgets as one product system | Shared components, services, versioning and mobile adaptation behind 70+ production interfaces. | note | да |
| [`external-server`](../pages/external-server.md) | The work that does not fit inside the org | Complex operations moved to an external server, and the line for deciding what goes out. | plan | нет |
| [`sf-lwc`](../pages/sf-lwc.md) | One workflow, implemented on two CRM platforms | The same employment-history contract in a Zoho widget and a real Lightning Web Component. | live | нет |

## Группы

Каждая группа несёт свой абзац (`intro`), список написанных страниц и — через `also` — страницы, которые относятся к этой работе, но живут на другой вкладке.

### Cleaning up contacts, deduplication and enrichment

Contacts had been created situationally for years, so duplicates were everywhere — worst where one person held roles at several sub-companies of the same group. The fix was a model rather than a clean-up script: contacts and accounts joined many-to-many, every existing record migrated onto it, and enrichment wired in so a provider credit is spent once. Every account went through the analysis; new contacts now arrive through the same identity rules.

Входят: `enrichment`, `contact-model`

The same contract on another platform: `sf-lwc`

### Trade shows: booking, meetings, follow-up

One system takes an industry event from preparation, through the floor, to post-analysis. Meetings are booked and tracked from the CRM, run from a phone at the venue, and reached through the tools people already live in — with a calendar sync that keeps every side honest.

Входят: `event`, `board`, `calendar-sync`, `mobile-canvas`

### AI in the CRM: recaps, loss analysis, drafted text

Recaps write themselves from what a meeting left behind, lost deals get a two-stage analysis against a corporate taxonomy, and inside the widgets a model drafts the text where a standard, careful wording matters more than a fast one. Each of them records what it did somewhere a person can argue with it. This is one of the six pieces of platform work, but the pages themselves are written up as one capability on the Applied AI tab rather than split across two indexes.

Written up on the Applied AI tab: `chat-recap`, `loss-analysis`, `ai-interface-assistance`, `agent-journal`

### Connecting Teams, Slack and Jira to the CRM

CRM tasks and tracker issues talk to each other directly, and the topic chats in Teams and Slack feed the tracker: comments are collected, filed against the right issue, and never retyped by hand. The hard part is not the transport — it is deciding which system is right when two of them disagree.

Входят: `chat-tracker`, `cross-system`, `teams-jira`

### Weekly reports, reminders and workflows

Hundreds of automations run the routine — workflows, blueprints, schedulers, external flows and server-side jobs. Sales leads get their weekly picture assembled for them; individual salespeople get the reminders that keep records moving, delivered where they already work rather than in an inbox nobody opens.

Входят: `cockpit`, `reporting`

### Org tooling, CI/CD, deployment and the external server

Tooling for the org itself: extraction the platform refuses to offer, a config history it never kept, an audit that names the limits of its own method — and, for the operations that do not fit inside the org at all, an external server that takes the heavy work and hands the result back.

Входят: `orghealth`, `solution`, `org-tooling`, `deluge-cicd`, `widget-system`, `external-server`

