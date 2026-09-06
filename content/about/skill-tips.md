---
file: "skill-tips"
title: "Подсказки к навыкам (TIPS)"
entries: 78
words: 1987
source:
  code: "src/app.html · TIPS"
---

# Подсказки к навыкам

Показываются при наведении/фокусе на навык. Одна строка на навык.

### Deluge

3+ years of production Deluge at Room 8: scheduled syncs, workflow functions, REST callouts through connections. My calendar delta-sync walks pages with a checkpoint written on every page — because the language has no while loop and a run can die on page forty.

### custom modules

Redesigned the org’s data model: junction modules replaced text-field pseudo-relations, an Event Contacts module powers the trade-show tooling, a journal module records what automation did to a record.

### layouts

Owned every layout across the org’s modules — fields placed by what sales actually fills in, with the rarely-used moved out of the way instead of deleted.

### workflows

Wrote and maintained the org’s whole automation estate — and audited all of it: my index found rules marked active that had never fired once, because a criterion referenced a renamed field.

### schedules

My scheduled functions do the heavy lifting: delta sync over 17 mailboxes, Teams chat import every 10 minutes, a monthly forced resync that clears the drift deltas accumulate.

### validation rules

Validation that mirrors reality: a Lost deal demands its loss reason, a booking without a buyer is refused with the reason named — the same rules my widgets show interactively.

### Blueprints

Built the sales pipeline’s stage machine: transitions, per-stage mandatory fields, escapes for the edge cases that show up in week two.

### roles & profiles

Designed the access model for sales ops, BD and regional teams — a manager sees the team, a salesperson sees their own work, enforced by design rather than habit.

### sharing rules

Sharing that follows the org chart without leaking across regions — and survives reorgs, because it hangs on roles rather than named users.

### data modelling

The identity model is mine: which identifier is authoritative, when records merge automatically, when a human decides — enforced across every inbound integration.

### Sandbox

Introduced sandbox → production promotion with review to an org that had none: no change reaches production unreviewed is now the operating rule.

### Widgets

Built 70+ production widgets across the org’s modules: contact desks, meeting boards, a solution matrix, reconciliation screens — on a shared component library with versioning.

### Canvas & Canvas Mobile Detail View

Full record pages in Canvas plus mobile widgets for the Zoho app — including an on-screen console with a 400-line ring buffer I built because a phone inside the CRM app has no devtools.

### Zoho SDK

The embedded SDK across record pages, related lists, buttons, web tabs, Canvas and mobile — known deep enough to build an offline stand-in for it, down to the error envelopes, so a widget is verified before the org sees it.

### REST APIs

Zoho REST across modules, related lists, notes, tags, users — paging, bulk jobs, and the undocumented corners mapped empirically, endpoint by endpoint, API version by API version.

### COQL

My main query surface: dotted lookups across modules, paging at the 200-row ceiling, the 14-condition criteria limit — and the chunked searches I wrote for when the limits bite.

### Tabulator

The heavy tables in my widgets run on Tabulator: custom header-filter editors (date ranges, “at least N”), in-cell editing, a second synchronized scrollbar above the table because sales asked for it.

### Zoho Creator

Creator apps where CRM modules are the wrong shape — small internal tools with their own forms and reports.

### Zoho Flow

Flow for the light glue between Zoho apps; replaced with code where volume made visual flows fragile.

### Zoho Analytics

Reporting layer over the CRM: synced datasets, SQL-style queries, dashboards sales managers actually open.

### Zoho One

Administered the wider suite around the CRM — users, apps, provisioning — as part of owning the platform.

### Apex

Three years of production Apex across Noltic, SoftServe and Synebo: triggers, batch, queueable, schedulable — bulkified and unit-tested. Refactored inherited trigger architecture twice, both times without stopping the org.

### SOQL/SOSL

Optimised queries on large data volumes at Synebo: selective filters, no N+1 inside triggers, governor budgets treated as a design input rather than a surprise.

### governor-limit optimization

Governor limits shaped how I write Salesforce code: everything bulkified, async where it belongs, limits budgeted per transaction before the first line is written.

### Lightning Web Components

Built LWC to SLDS standards at Noltic — reusable components that replaced one-off screens; Aura and Visualforce maintained where the org already lived in them.

### Aura

Maintained and extended Aura components in orgs that predate LWC — and migrated pieces to LWC where it paid off.

### Visualforce

Legacy Visualforce kept alive and slowly retired — I’ve done the archaeology of a 2015-era org more than once.

### Flows

Declarative vs code decided case by case at SoftServe: Flows for what an admin should be able to change, Apex for what must not break silently.

### Sales / Service / Experience Cloud

Configured all three on concurrent client implementations at SoftServe: objects, layouts, security model, validation — then owned build, testing and docs through to release.

### Microsoft Graph

Built the Room 8 calendar sync: 17 mailboxes over Graph delta queries with a checkpoint per page; throttling stops the mailbox but deliberately keeps the checkpoint. The full story is in the orchestration case study.

### Teams & Teams bots

Got Teams conversations into the CRM without building a bot — a text contract in the first message of a thread — and built adaptive-card wizards where each card is a callback subscription, so nothing holds a request open while a person thinks.

### Outlook

Mailbox and calendar data through Graph and Outlook APIs — part of the same sync estate as the 17 mailboxes.

### Email ingestion

Built the pipeline that carries email out of multiple sources and mailboxes into Zoho: fetched server-side, deduplicated, matched to the right account and deal, and attached where sales actually looks — instead of dying in personal inboxes.

### Entra ID

Every Graph integration ran on app registrations I owned: permission scopes cut to least privilege, admin consent flows, secrets rotated on schedule.

### Jira

Teams threads routed to Jira by the PITCH code in a root message, comments idempotent through a marker inside the body, public or role-restricted by a #jira / #jira_private tag, attachments always sent as links rather than uploads.

### Apollo

Built the enrichment pipeline: provider people matched against the CRM through four dedup keys in sequence, the last a normalised profile URL; batching tuned to provider quota with three retry steps.

### Slack

CRM events surfaced into Slack channels — deal changes and sync failures reported where the team already is.

### Google Workspace

Google Drive document management integrated into Salesforce at Noltic — including a Chrome extension I later re-architected; Google Calendar sync in the BookMe backend at Provectus.

### Adaptive Cards

Card-based wizards in Teams: stateless cards reissued in a loop for search, a sentinel value carrying “chosen deliberately” through a control that can only return one string.

### Power Automate

Used where a business owner should own the flow; replaced with code where reliability mattered more than editability.

### Zapier

Inherited Zapier estates twice — kept what was sound, replaced with native integrations what volume had made fragile.

### Make

Same policy as Zapier: fine for glue, replaced where an execution log and retries needed to be real.

### OAuth 2.0

Implemented the token layer all my outbound calls share: cached, refreshed a minute before expiry; an auth failure clears the cache and retries once instead of failing the run.

### REST & SOAP

Designed and delivered both at Noltic — authenticated flows, error handling, user-facing controls — and SOAP still earns its keep in older enterprise estates.

### webhooks

Built a receiver that repairs its own payload: five attempts, reading the failing field out of the CRM error, substituting or dropping it, switching create → update when a duplicate id comes back.

### pagination

Paging is never an afterthought in my code: pre-built page lists with completion flags on platforms without loops, ceilings respected, progress recorded so an interrupted run continues.

### rate limiting

I respect the Retry-After the server sends, fall back to linear backoff with a ceiling, and lower page sizes for heavy calendars instead of letting them fail.

### retries & exponential backoff

Every call in my integrations is classified: retryable, fatal, or “stop but keep the checkpoint” — three error classes, three different reactions, written down.

### idempotency

Markers hidden inside comment bodies, rolling journals of processed event ids, create-vs-update semantics split — so a sync running every ten minutes never posts twice and never overwrites a human edit.

### delta tokens

Checkpoint per page, not per run; an invalid token clears the variable and falls back to a full read in the same run; monthly forced resync clears accumulated drift. Battle-tested over 17 mailboxes.

### reconciliation

My reconciliation screens show a third column — the expected value, computed from an authority map — so “repair” writes exactly what the record should say, and the rule is printed under the comparison.

### deduplication

Four keys in sequence ending with a normalised profile URL; name matches shown but never blocking, because two people genuinely share a name.

### Data migration

Ran the legacy-CRM migration at Room 8: custom mapping, transformation and validation in Python, Deluge, Apex and SQL — loads verified against reconciliation rules rather than record counts.

### ETL

Python and SQL pipelines for everything the CRM can’t do to its own data: conference exports sorted into buckets, enrichment files cleaned, historical spellings migrated.

### mapping & transformation

Field-level mapping documents that survive contact with reality: authoritative sources named per field, write rules that keep a tool safe to run twice.

### data quality

A name is corrected only when the surname differs; title and email fill only empty fields; everything else that merely differs goes to a human. Those three rules are mine.

### Git

Brought Git to a platform with no export: my extraction tooling pulls more than a thousand functions into a reviewable repo, and the diff between commits stands in for the change history the platform never kept.

### GitHub Actions

Set up CI/CD at Noltic and again at Room 8: automated test execution, environment promotion, one-click deploys — and guards that fail the build if anything resembling a real org identifier appears.

### Azure DevOps

Pipelines and boards where the client already lived in Azure — same release discipline, different tooling.

### CI/CD

From “deploy is a person copy-pasting” to reviewed, one-click, reversible releases — done twice, on two different platforms.

### code review

Reviewed other developers’ CRM work at Room 8 against the platform’s engineering and security standards — and my own changes went through the same gate.

### automated testing

Production widgets get browser tests at phone widths and an offline stand that stubs the Zoho SDK; the release gate fails on any console error, not only on a failed assertion.

### release management

Releases sequenced so change lands without disrupting live sales operations — staged, announced, reversible, with the risky part shipped behind a flag.

### JavaScript

Every widget is framework-free vanilla JS — my daily language for UI that has to live inside an iframe the platform controls.

### TypeScript

Tooling and services where types pay rent: extraction tooling, build scripts, integration services.

### HTML

Semantic, accessible markup — the reconciliation tables and the mobile board are plain HTML doing heavy lifting.

### CSS

Hand-written layout systems: the lane layout for overlapping meetings and the ten-colour stage matrix are pure CSS.

### Python

My data language: migrations, org extraction, validation pipelines, the conference-export bucket sorter.

### Java & Spring Boot

Two years of backend before CRM: navigation services at Luxoft, the BookMe booking backend at Provectus — REST design, OAuth, high-concurrency schema.

### Node.js

Backend services and build tooling — this site’s dataset generator, build pipeline and test harness are Node.

### SQL

From migration validation queries to reporting — SQL is where my data work gets checked.

### PostgreSQL

The database behind my backend work and side tooling — schema design included.

### AI-assisted development

AI inside a governed delivery workflow — analysis, Deluge and widget implementation, tests, documentation, review — with human ownership of architecture, security and business rules, and nothing generated accepted unverified.

### Claude

Claude Code daily, tuned for CRM work: custom skills for widget development, MCP for org access, review gates so nothing generated lands unread.

### OpenAI API

Designed a two-stage loss-analysis pipeline: ten times more code gathering evidence from six sources than calling the model, and a 38-cause taxonomy in the prompt so answers land in the company’s own categories.

### embedded CRM features

AI living inside CRM surfaces I built: server-side recap rephrasing (no key ever in the page), an agent design where every action writes a before/after diff to a journal module.

### MCP

A scoped MCP surface over CRM records and the platform tooling around them: typed operations, explicit permissions, an audit trail — used by the org’s extraction and audit tooling.

### Zoho native AI

Zia evaluated and configured where it earns its place — and replaced with custom pipelines where it doesn’t.

