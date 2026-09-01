---
tab: "zoho"
title: "Zoho"
route: "#/zoho"
items: 18
source:
  lede: "src/app.html · vZoho()"
  items: "src/app.html · ZOHO_GROUPS"
---

# Zoho

## Лид страницы

Platform Zoho More than three years as the primary engineer and technical owner of a production Zoho CRM platform: data architecture, automation, integrations, interfaces, the release process and post-release support — together with the engineering practice that lets a platform scale, from source control and review to automated testing and controlled promotion. Zoho is the operating core of an ecosystem spanning more than ten external systems. The demos here run in your browser against an emulated platform — the same query interpreter, the same limits, the same write validation. Below, the work in the six pieces it actually came in. 70+ production widgets 50+ custom modules hundreds Deluge functions dozens canvas layouts &amp; client scripts 10+ connected systems CONTACTS Cleaning up contacts, deduplication and enrichment Contacts had been created situationally for years, so duplicates were everywhere — worst where one person held roles at several sub-companies of the same group. The fix was a model rather than a clean-up script: contacts and accounts joined many-to-many, every existing record migrated onto it, and enrichment wired in so a provider credit is spent once. Every account went through the analysis; new contacts now arrive through the same identity rules. Contact enrichment Provider people matched against the CRM through four identity keys before a single one is written. Live demo One person, several companies — without duplicate identities A many-to-many contact model, the migration onto it, and the identity rules every inbound path now obeys. Write-up The same contract on another platform One workflow, implemented on two CRM platforms The same employment-history contract in a Zoho widget and a real Lightning Web Component. Live demo EVENTS Trade shows: booking, meetings, follow-up One system takes an industry event from preparation, through the floor, to post-analysis. Meetings are booked and tracked from the CRM, run from a phone at the venue, and reached through the tools people already live in — with a calendar sync that keeps every side honest. One event system, end to end Targeting, booking, conflict checks, mobile execution and reconciliation on one campaign record. Live demo The event floor, designed for a phone A room-by-room schedule, team load and assisted recap flow for a surface with no developer tools. Live demo Delta sync across seventeen calendars A checkpoint written on every page, because the language has no while loop and a run can die on page forty. Planned Building for a surface with no devtools An on-screen console with a ring buffer, and the bugs it was the only way to catch. Planned AI AI in the CRM: recaps, loss analysis, drafted text Recaps write themselves from what a meeting left behind, lost deals get a two-stage analysis against a corporate taxonomy, and inside the widgets a model drafts the text where a standard, careful wording matters more than a fast one. Each of them records what it did somewhere a person can argue with it. This is one of the six pieces of platform work, but the pages themselves are written up as one capability on the Applied AI tab rather than split across two indexes. Written up on the Applied AI tab From transcript to a corporate-standard meeting recap Teams, Krisp and future sources feed one governed evidence-to-recap pipeline. Emulated flow From six evidence sources to one governed loss reason A two-stage classification pipeline with a human-correctable intermediate record. Write-up AI at the point of CRM input Drafting and rewriting across 10+ interfaces, especially short reports from mobile devices. Planned Controlled write-back with an action journal Every proposed change carries a before/after diff and a human gate for high-risk fields. Live demo SYNC Connecting Teams, Slack and Jira to the CRM CRM tasks and tracker issues talk to each other directly, and the topic chats in Teams and Slack feed the tracker: comments are collected, filed against the right issue, and never retyped by hand. The hard part is not the transport — it is deciding which system is right when two of them disagree. One thread across Teams, Zoho and Jira CRM owns routing and delivery state; stable markers make every ten-minute run safe to replay. Emulated flow Who is allowed to be right? Field authority, reconciliation and refusal rules for systems that disagree. Write-up Teams → CRM → Jira, and who owns what An ownership matrix across four systems, a text contract as the mapping mechanism, and idempotency on both arms. Planned AUTOMATION Weekly reports, reminders and workflows Hundreds of automations run the routine — workflows, blueprints, schedulers, external flows and server-side jobs. Sales leads get their weekly picture assembled for them; individual salespeople get the reminders that keep records moving, delivered where they already work rather than in an inbox nobody opens. Sales cockpit Open value, overdue deals, agreements waiting and tasks past due — for the team or for one person. Live demo The week that reports itself Weekly summaries for sales leads and per-person reminders, assembled on a schedule and delivered where people already work. Planned PLATFORM Org tooling, CI/CD, deployment and the external server Tooling for the org itself: extraction the platform refuses to offer, a config history it never kept, an audit that names the limits of its own method — and, for the operations that do not fit inside the org at all, an external server that takes the heavy work and hands the result back. An org audit that names what it cannot see A generated 1,240-function org reconciled against five entry channels, with blind spots stated first. Live demo A business map the standard CRM could not draw Service lines against business units, with live pipeline and opportunity creation in the same matrix. Live demo The engineering layer Zoho did not provide Pull the org into one searchable system, map dependencies and turn browser-only change into reviewed delivery. Write-up From browser-only code to reviewed delivery Pull, analyse, review, deploy, run and verify — one controlled toolchain around a browser-only editor. Write-up Seventy widgets as one product system Shared components, services, versioning and mobile adaptation behind 70+ production interfaces. Write-up The work that does not fit inside the org Complex operations moved to an external server, and the line for deciding what goes out. Planned

## Карточки

| id | Заголовок (`t`) | Подпись (`s`) | Вид |
| --- | --- | --- | --- |
| [`enrichment`](../pages/enrichment.md) | Contact enrichment | Provider people matched against the CRM through four identity keys before a single one is written. | live |
| [`contact-model`](../pages/contact-model.md) | One person, several companies — without duplicate identities | A many-to-many contact model, the migration onto it, and the identity rules every inbound path now obeys. | note |
| [`event`](../pages/event.md) | One event system, end to end | Targeting, booking, conflict checks, mobile execution and reconciliation on one campaign record. | live |
| [`board`](../pages/board.md) | The event floor, designed for a phone | A room-by-room schedule, team load and assisted recap flow for a surface with no developer tools. | live |
| [`calendar-sync`](../pages/calendar-sync.md) | Delta sync across seventeen calendars | A checkpoint written on every page, because the language has no while loop and a run can die on page forty. | plan |
| [`mobile-canvas`](../pages/mobile-canvas.md) | Building for a surface with no devtools | An on-screen console with a ring buffer, and the bugs it was the only way to catch. | plan |
| [`chat-tracker`](../pages/chat-tracker.md) | One thread across Teams, Zoho and Jira | CRM owns routing and delivery state; stable markers make every ten-minute run safe to replay. | emul |
| [`cross-system`](../pages/cross-system.md) | Who is allowed to be right? | Field authority, reconciliation and refusal rules for systems that disagree. | note |
| [`teams-jira`](../pages/teams-jira.md) | Teams → CRM → Jira, and who owns what | An ownership matrix across four systems, a text contract as the mapping mechanism, and idempotency on both arms. | plan |
| [`cockpit`](../pages/cockpit.md) | Sales cockpit | Open value, overdue deals, agreements waiting and tasks past due — for the team or for one person. | live |
| [`reporting`](../pages/reporting.md) | The week that reports itself | Weekly summaries for sales leads and per-person reminders, assembled on a schedule and delivered where people already work. | plan |
| [`orghealth`](../pages/orghealth.md) | An org audit that names what it cannot see | A generated 1,240-function org reconciled against five entry channels, with blind spots stated first. | live |
| [`solution`](../pages/solution.md) | A business map the standard CRM could not draw | Service lines against business units, with live pipeline and opportunity creation in the same matrix. | live |
| [`org-tooling`](../pages/org-tooling.md) | The engineering layer Zoho did not provide | Pull the org into one searchable system, map dependencies and turn browser-only change into reviewed delivery. | note |
| [`deluge-cicd`](../pages/deluge-cicd.md) | From browser-only code to reviewed delivery | Pull, analyse, review, deploy, run and verify — one controlled toolchain around a browser-only editor. | note |
| [`widget-system`](../pages/widget-system.md) | Seventy widgets as one product system | Shared components, services, versioning and mobile adaptation behind 70+ production interfaces. | note |
| [`external-server`](../pages/external-server.md) | The work that does not fit inside the org | Complex operations moved to an external server, and the line for deciding what goes out. | plan |
| [`sf-lwc`](../pages/sf-lwc.md) | One workflow, implemented on two CRM platforms | The same employment-history contract in a Zoho widget and a real Lightning Web Component. | live |

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

