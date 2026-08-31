---
tab: "zoho"
title: "Zoho"
route: "#/zoho"
groups: 6
source:
  lede: "src/app.html · vZoho()"
  scale: "src/app.html · SCALE"
  groups: "src/app.html · ZOHO_GROUPS"
---

# Zoho

## Лид страницы

Platform Zoho Three years as the sole engineer and accountable owner of a production CRM: data model, widgets, integrations, automation and the release process. The demos here run in your browser against an emulated platform — the same query interpreter, the same limits, the same write validation. Below, the work in the six pieces it actually came in.

## Плашка масштаба

- **70+** widgets
- **50+** custom modules
- **hundreds** Deluge functions
- **dozens** canvas layouts & client scripts
- **7+** external systems

## Шесть секций

Полный текст всех блоков — `zoho-full-text.md` рядом.

Вкладка собрана не по типу артефакта, а по кускам работы. У каждого — абзац,
существующие страницы, ненаписанные (`kind:'plan'` — показаны, чтобы пробел был
виден, а не подразумевался) и `also`: страницы с других вкладок, которые
относятся к этому куску работы и показываются строкой со ссылкой, а не копией.

### CONTACTS · Cleaning up contacts, deduplication and enrichment

Contacts had been created situationally for years, so duplicates were everywhere — worst where one person held roles at several sub-companies of the same group. The fix was a model rather than a clean-up script: contacts and accounts joined many-to-many, every existing record migrated onto it, and enrichment wired in so a provider credit is spent once. Every account went through the analysis; new contacts now arrive through the same identity rules.

| id | Заголовок | Вид |
| --- | --- | --- |
| `enrichment` | Contact enrichment | live — **новая страница** |
| `contact-model` | One person, several employers | plan |
| `sf-lwc` | One screen, two platforms | also → вкладка Salesforce |

### EVENTS · Trade shows: booking, meetings, follow-up

One system takes an industry event from preparation, through the floor, to post-analysis. Meetings are booked and tracked from the CRM, run from a phone at the venue, and reached through the tools people already live in — with a calendar sync that keeps every side honest.

| id | Заголовок | Вид |
| --- | --- | --- |
| [`event`](../pages/event.md) | Event campaign page | live |
| [`board`](../pages/board.md) | Meeting board (mobile) | live |
| `calendar-sync` | Delta sync across seventeen calendars | plan |
| `mobile-canvas` | Building for a surface with no devtools | plan |

### AI · AI in the CRM: recaps, loss analysis, drafted text

Recaps write themselves from what a meeting left behind, lost deals get a two-stage analysis against a corporate taxonomy, and inside the widgets a model drafts the text where a standard, careful wording matters more than a fast one. Each of them records what it did somewhere a person can argue with it.

| id | Заголовок | Вид |
| --- | --- | --- |
| [`chat-recap`](../pages/chat-recap.md) | Meeting recap from chat | emul |
| `ai-in-widgets` | Where the widgets let a model write | plan |
| [`loss-analysis`](../pages/loss-analysis.md) | Loss analysis in two stages | also → вкладка AI |
| [`agent-journal`](../pages/agent-journal.md) | A CRM agent with an action journal | also → вкладка AI |

### SYNC · Connecting Teams, Slack and Jira to the CRM

CRM tasks and tracker issues talk to each other directly, and the topic chats in Teams and Slack feed the tracker: comments are collected, filed against the right issue, and never retyped by hand. The hard part is not the transport — it is deciding which system is right when two of them disagree.

| id | Заголовок | Вид |
| --- | --- | --- |
| [`chat-tracker`](../pages/chat-tracker.md) | Chat to issue tracker | emul |
| [`cross-system`](../pages/cross-system.md) | Crossing between systems that do not agree | note |
| `teams-jira` | Teams → CRM → Jira, and who owns what | plan |

### AUTOMATION · Weekly reports, reminders and workflows

Hundreds of automations run the routine — workflows, blueprints, schedulers, external flows and server-side jobs. Sales leads get their weekly picture assembled for them; individual salespeople get the reminders that keep records moving, delivered where they already work rather than in an inbox nobody opens.

| id | Заголовок | Вид |
| --- | --- | --- |
| `cockpit` | Sales cockpit | live — **новая страница** |
| `reporting` | The week that reports itself | plan |

### PLATFORM · Org tooling, CI/CD, deployment and the external server

Tooling for the org itself: extraction the platform refuses to offer, a config history it never kept, an audit that names the limits of its own method — and, for the operations that do not fit inside the org at all, an external server that takes the heavy work and hands the result back.

| id | Заголовок | Вид |
| --- | --- | --- |
| [`orghealth`](../pages/orghealth.md) | Org health report | live |
| [`solution`](../pages/solution.md) | Solution map | live |
| [`org-tooling`](../pages/org-tooling.md) | Building tooling for an org that will not export itself | note |
| `deluge-cicd` | A deployment pipeline for a platform with no export | plan |
| `widget-system` | Seventy widgets as one system | plan |
| `external-server` | The work that does not fit inside the org | plan |

## Две новые страницы

`enrichment` и `cockpit` — не новый код, а два экрана, которые уже были
написаны и до сих пор открывались только как вкладки внутри других записей:
`CRMPages.Enrichment` и `CRMWidgets3.Cockpit`. Им добавлены записи в `REC`,
`PAGE` и `ZOHO_GROUPS`; `wireRecord` теперь ищет хост не только в `CRMPages`,
но и в `CRMWidgets2/3`. Страница `enrichment` открывается на аккаунте со 142
контактами и заодно выводит наружу вкладки Group structure, Development plan
и Provider link.
