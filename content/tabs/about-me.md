---
tab: "about"
title: "About me"
route: "#/about"
blocks: 10
source:
  body: "src/app.html · vAbout()"
  skills: "src/app.html · STORY (76) + TIPS (78)"
---

# About me

Страница собрана из блоков в `vAbout()`. Карта навыков (`STORY`) и подсказки (`TIPS`) вынесены в отдельные файлы: [skills-map.md](../about/skills-map.md), [skill-tips.md](../about/skill-tips.md). Карта интеграций — [integration-map.md](../about/integration-map.md).

---

## HERO

CRM Platform Engineer · Warsaw, Poland (CET) · remote / hybrid

# Kostiantyn Buriak

Seven years in commercial software engineering: six on CRM platforms — Zoho and Salesforce — building interfaces inside the CRM, integrations that survive real failure, and tooling for orgs that do not export themselves. The demos on this site are the production code, running in your browser against invented data.

[Download CV](Kostiantyn_Buriak_CV.pdf)[LinkedIn](https://www.linkedin.com/in/kburiak)[GitHub](https://github.com/koslan)[WhatsApp](https://wa.me/48732579181)[Email](mailto:buriak.kostiantyn@gmail.com)

- **7 yrs** in software
- **15** live demos
- **21** write-ups
- **3** SF certifications

_[изображение: Kostiantyn Buriak]_

---

## 01 / DEMOS

## If you have five minutes

Three screens that show the range fastest — a record page with live widgets, a hand-built matrix, and an audit of an entire org.

[

### Event campaign page

A campaign record with three widgets and the five-step booking wizard.

Live demo](#/p/event)[

### Solution map

Service lines against business units, coloured by the latest deal on each cell.

Live demo](#/p/solution)[

### Org health report

1,240 functions placed against five entry channels.

Live demo](#/p/orghealth)

---

## 02 / THE SYSTEM

## What I actually connected

Skills as a working system, not a word list. Every line on this map is something I designed, built and still operate. Click a system or a connection.

---

## 03 / SKILLS

## Skills, with the stories behind them

**Hover any skill** — it expands into where I used it and what I actually built. **Click** — pins the full story with the result and, for the flagship ones, a code fragment.

Zoho

DelugeRoom 8 · 2023—now · dailyThree years as the only Deluge engineer on a production org: hundreds of functions behind integrations, scheduled jobs and every widget on the platform.The language is only half of it. Before Zoho provided a functions API the platform gave one browser editor and one function at a time, so I built the extraction and deploy tooling that put the whole codebase under Git with review and dependency analysis — and delivered business processes spanning dozens of functions as one reviewable change.click to pin — result + code + demoWidgetsRoom 8 · 2023—now · dailySales lives in tables the platform cannot draw — 400-contact target lists, room schedules, a service-line matrix — and every one has to run inside an iframe the CRM controls.70+ production widgets on a corporate design system of my own: a versioned component and function library every screen is assembled from, composite screens backed by several Deluge services and external systems at once, mobile adaptations for the Zoho app, and an offline harness that stubs the SDK so a change is verified before production sees it.click to pin — result + demoCOQLRoom 8 · 2023—now · dailyEvery widget and integration needs data the REST list endpoints return awkwardly or not at all.COQL as the daily data-access layer: cross-module read models, reusable query patterns, and the platform's ceilings — 200 rows, 14 criteria — treated as ordinary constraints rather than discoveries. For this site I wrote an interpreter of the same dialect.click to pin — result + code + demoZoho SDKRoom 8 · 2023—now · dailyA widget only exists inside the CRM and the SDK it depends on has no offline form, so every change used to be tested in production.Production work across record pages, related lists, buttons, web tabs, Canvas and mobile surfaces — learned deep enough to build a compatible offline harness for the SDK surface the widget estate uses: init and lifecycle, record APIs, resize, connection invokes, the platform's own error envelopes.click to pin — result + code + democustom modulesRoom 8 · 2023—nowThe org kept its relations as free text — “which business unit, which programme” lived as strings someone once typed.Dozens of custom, junction, service and journal modules across a landscape approaching a hundred, with relationships, ownership, lifecycle and validation defined rather than accumulated — plus the migration scripts that moved years of strings into real references.click to pin — result + demoworkflowsRoom 8 · 2023—nowDaily ownership of an automation estate accumulated over years: rules, schedules and functions, most of them inherited.Criteria architecture, execution order, function orchestration and conflict analysis as routine work — and an index of the whole estate: every function cross-referenced against five entry channels, every rule against its execution history.click to pin — result + demoBlueprintsRoom 8 · 2023—nowThe sales process existed as tribal knowledge; stages were skipped and loss reasons never captured.Blueprint-driven lifecycles as part of platform ownership: states, controlled transitions, per-stage mandatory fields, automation hand-offs and the escape paths that surface in week two — with a deliberate boundary between what belongs in a Blueprint, a workflow, code and the UI.click to pin — resultschedulesRoom 8 · 2023—now · dailyEverything periodic on the platform runs through scheduled functions, and they share one quota and one timeout.The org's scheduled workload designed as a whole: partitioning, resumability, overlap prevention, idempotency and safe backfills — delta syncs, a chat import every ten minutes, a monthly forced resync.click to pin — result + demovalidation rulesRoom 8 · 2023—nowThe org accepted bad data faster than any cleanup could remove it, and every report inherited the mess.Validation placed by layer rather than by habit — layouts, Blueprints, workflows, widgets and Deluge — so each business invariant holds where it cannot be bypassed, without blocking legitimate exceptions or integration traffic. Every refusal names its reason.click to pin — result + demoTabulatorRoom 8 · 2023—nowA 400-row target list needs filtering, sorting and in-cell editing — inside an iframe, on CRM data.Reusable patterns for large interactive datasets across the widget estate: custom header filters, validated in-cell editing, state that survives a refresh, custom rendering, and writes back into the CRM.click to pin — result + demolayoutsRoom 8 · 2023—nowA CRM form is a tax on every deal a salesperson logs, and the org's forms had grown by accretion for years.Layouts and information architecture across dozens of modules: role- and process-specific variants, conditional sections, field dependencies, naming consistency, and controlled evolution as requirements changed.click to pin — resultroles & profilesRoom 8 · 2023—nowSales ops, BD and regional teams in several countries: everyone needs their slice, nobody should see everything.The access model designed rather than accumulated: a role hierarchy following the org chart, least-privilege profiles, module and field permissions, record ownership and sharing rules that survive reorgs — with their effect on automation, reporting and integrations accounted for.click to pin — resultZoho CreatorRoom 8 · occasionalNot every internal tool deserves a CRM module — forcing the wrong shape distorts data for years.Creator apps for process-specific interfaces: data modelling, forms, automation and CRM integration, plus the judgement of when Creator beats a module or a widget.click to pin — resultZoho FlowRoom 8 · occasionalVisual automation is loved right up until it silently breaks under volume.Flow used where a business owner should see and change the automation, with a boundary — ownership, volume, security, observability, recovery — that decides when something moves into engineered code.click to pin — resultZoho AnalyticsRoom 8 · recurringManagement ran on gut feel, and CRM-native reports could not express the questions being asked.The reporting layer over the CRM and beyond it: synchronised CRM and external sources, prepared datasets and transformations, analytical queries, and dashboards built around the questions managers ask weekly.click to pin — resultZoho OneRoom 8 · 2023—nowThe CRM sits inside a wider suite someone has to own.Platform-level administration of the surrounding estate: applications, user lifecycle, provisioning, access coordination, and the integration boundaries between CRM and adjacent products.click to pin — result

Salesforce

ApexNoltic, SoftServe, Synebo · 2020—23Three consulting years in other people's orgs, on other people's deadlines, with governor limits always in the room.Production Apex across triggers, batch, queueable and schedulable work: transaction-safe automation, integration services, large-volume processing and test architecture — including two inherited trigger architectures refactored without stopping the org.click to pin — result + codeLightning Web ComponentsNoltic, Synebo · 2020—23Orgs full of one-off screens: each new request built from scratch and styled its own way.Reusable LWC patterns to SLDS standards with presentation, state and service integration separated, so a new capability is assembled rather than rebuilt; contributed to the architecture of the integration flows behind them.click to pin — resultSOQL/SOSLSynebo, SoftServe · 2020—22Queries that worked in a demo org crawled on production volumes.Query paths designed for real data: selectivity and indexing, transaction budgets, search behaviour, security context and asynchronous processing.click to pin — resultFlowsSoftServe · 2021—22Every automation request arrives as “just write code”, and then an admin can never touch it again.Flow, Apex or a combination chosen per case on business ownership, transaction safety, observability and who has to support it after handover.click to pin — resultAppExchange & Security ReviewNoltic · 2022—23A working integration is one thing; a package Salesforce will let strangers install is another. The Security Review exists to find the difference.The full cycle on the Google Drive integration: OAuth and token storage locked behind permission sets, logs sanitised of anything sensitive, CRUD/FLS enforced on every path, HttpCalloutMock coverage for all external calls, packaging, and remediation across three submissions.click to pin — resultAuraSynebo, SoftServe · 2020—22Orgs that predate LWC don't rewrite themselves, and users depend on every screen while you touch it.Maintained and extended production Aura across client orgs: tracing inherited dependencies, protecting existing behaviour, migrating to LWC only where the payoff justified the risk.click to pin — resultVisualforceSynebo, SoftServe · 2020—22The 2015-era corners of an org still serve users every day.Dependency analysis, safe production fixes and regression protection on business-critical Visualforce, with replacement only once a verified successor existed.click to pin — resultSales / Service / Experience CloudSoftServe · 2021—22 · Multiple concurrent client implementations, each with its own model of the world.Delivery from requirements to release: solution modelling, objects and layouts, access architecture, automation boundaries, estimation, build, testing, documentation and handover — with requirements run directly with client stakeholders.click to pin — result

Integrations

Microsoft GraphRoom 8 · 2023—now · dailyMeetings are booked in Outlook; sales needs them in the CRM within minutes, without anyone forwarding invitations.Graph integrations across calendar, mail and identity: an Entra app registration with least-privilege scopes, delta queries with durable state per mailbox, throttling budgets that slow a mailbox instead of failing it, and failure isolation so one broken account cannot stop the rest.click to pin — result + demoTeams & Teams botsRoom 8 · 2023—nowDeals are discussed in Teams threads; none of it reached the record, and nobody was going to retype it.Teams-centred workflows spanning conversations, meetings, Adaptive Cards, CRM records and the issue tracker: identity resolution, asynchronous interaction, auditability — including a text contract in the first message of a thread instead of a bot nobody would have approved, and a resumable importer that takes five channels a run.click to pin — result + demoOAuth 2.0every integration since 2019Every outbound system speaks a different dialect of the same auth dance, and tokens expire mid-run.Auth boundaries across providers: grant selection, least-privilege scopes, token storage and renewal, secret rotation, revocation and bounded recovery — one shared token layer, cached and refreshed a minute before expiry, that clears and retries once on failure.click to pin — result + codeidempotencyRoom 8 · 2023—nowA sync that runs every ten minutes will eventually run twice over the same data.Replay guarantees defined per integration: stable identities, deduplication state, explicit create-versus-update semantics, and protection of human-authored fields — markers inside comment bodies, rolling journals of processed event ids on the record itself.click to pin — result + demodelta tokensRoom 8 · 2023—nowFull re-reads guarantee timeouts; provider cursors solve that until one expires mid-run.Incremental synchronisation with durable checkpoints per page, expiry recovery inside the same run, periodic full reconciliation to clear drift, and explicit handling of deletions.click to pin — result + demoEmail ingestionRoom 8 · 2023—nowCustomer email lived in personal mailboxes across several sources; the CRM saw none of it.A server-side ingestion pipeline over multiple sources and mailboxes: identity and thread resolution, deduplication, routing to the right account and deal, attachment handling and exception reporting.click to pin — resultJiraRoom 8 · 2023—nowPresales discusses a deal in Teams — and none of it reaches the Jira issue engineering actually works from.A Teams-to-Jira integration routed by a PITCH code resolved once from a thread's root message: public or role-restricted comments made idempotent by a marker inside the body, attachments sent as links rather than uploads, and a one-time reaction confirming delivery back on the source message.click to pin — result + demoApolloRoom 8 · 2023—nowConference target lists arrive as exports with wrong company names and no shared key with the CRM.Enrichment into the CRM with governance: account-hierarchy resolution, four identity keys applied in order ending with a normalised profile URL, field authority, conservative update rules, quota-aware batching, and human review of ambiguous candidates.click to pin — resultwebhooksRoom 8 · 2023—nowEvents are not re-sent: a rejected write is a lost event, and the rejection reason is unknown in advance.A receiver that repairs its own payload: five attempts, reading the failing field out of the CRM error, substituting or dropping it, switching create to update when a duplicate id comes back — with the raw payload retained and everything dropped itemised.click to pin — result + code + demorate limitingRoom 8, Noltic · since 2022Every provider throttles differently, and a naive retry storm makes it worse.Capacity and retry policy across the integration estate: the server's own Retry-After respected first, bounded backoff after that, checkpoint-safe throttling, smaller pages for heavy accounts, and batch sizes pinned to each platform's documented limits.click to pin — resultreconciliationRoom 8 · 2023—now“Sixty minutes here, forty-five there” does not tell an operator what the record should say.Reconciliation built on explicit field authority rather than comparison: a third column carrying the expected value computed from an authority map, the governing rule printed under it, and a repair that writes exactly that.click to pin — result + demoAdaptive CardsRoom 8 · 2023—nowA person takes minutes to fill a form; a synchronous Teams call has seconds.Human-in-the-loop workflows inside a channel that cannot wait: stateless cards reissued in a loop for search, callback-driven progression, a bounded lifetime so a forgotten card cannot hold a run open, and a sentinel value carrying “chosen deliberately” through a control that returns one string.click to pin — result + demodeduplicationRoom 8 · 2023—nowThe same person exists four different ways across two systems.Identity resolution across integrations and migrations: authoritative identifiers, normalisation, ordered evidence ending with a normalised profile URL, confidence thresholds, merge safety, and human review whenever automation cannot prove identity — name matches shown but never blocking.click to pin — resultSlackRoom 8 · 2023—nowIntegration failures used to be discovered by salespeople noticing stale data.Slack as the operational surface for the integration estate: each sync classifies its own failures and reports its own health, deal events and alerts routed to the channels the team already reads, with noise kept deliberately low.click to pin — resultGoogle WorkspaceNoltic 2022—23, Provectus 2019Documents in Drive, bookings in Calendar — both needed to live inside other systems.Architected the Google Drive–Salesforce managed integration at Noltic: resumable chunked uploads to 2 GB, hybrid OAuth, record-linked document workflows, a Chrome extension linking open Google Docs to CRM records, packaging and Security Review. Earlier, Google Calendar sync in the BookMe backend at Provectus.click to pin — resultPower AutomateoccasionalSome flows belong to business owners, not to engineering.Used for business-managed orchestration, and evaluated by ownership, data sensitivity, volume, observability and recovery — moved into engineered integrations when it outgrew that role.click to pin — resultZapierinherited estatesInherited Zapier estates twice — glue that had quietly become infrastructure.Reviewed and documented what was there: ownership and failure modes written down, sound low-risk flows kept, fragile ones migrated to native integrations once volume and recovery mattered more than editability.click to pin — resultMakeinherited estatesThe same inheritance, a different platform.Make treated as low-code glue with the same boundary applied: fine while a flow is small and business-owned, replaced once retries, logs and recovery had to be real.click to pin — result

Data & releases

Giteverywhere · dailyThe platform keeps no change history: “who changed this rule and when” had no answer.Source-driven engineering brought to an estate of roughly 1,500 functions: extraction and snapshot tooling pulls code and org configuration into a Git-tracked repository with dependency mapping and response diagnostics, so change history and review exist at all.click to pin — result + demoGitHub ActionsNoltic, Room 8 · since 2022Deploys were a person copy-pasting into a browser — on two different platforms, two years apart.Reviewed CI/CD on both estates: automated verification, environment promotion, one-click traceable releases, and guards that fail the build if anything resembling a real identifier appears.click to pin — resultDeluge deploy pipelineRoom 8 · 2024—now · dailyBefore Zoho provided a functions API the platform offered one browser editor, one function at a time: no search across the codebase, no history, no local tooling.A two-way delivery pipeline for Deluge: the org's whole codebase pulled to local disk, edited in a real IDE under Git with review and dependency-aware analysis, and pushed back with the round-trip verified — what lands in the org is exactly what was reviewed.click to pin — resultautomated testingRoom 8 · 2023—nowAn embedded CRM application cannot run outside the CRM, so verifying a change used to mean deploying it to production.A testing architecture for that constraint: an offline harness stubbing the Zoho SDK, seeded datasets with deliberate defects, browser-level regression at desktop and phone widths, mocked external boundaries, and release gates that fail on any console error.click to pin — result + demoData migrationRoom 8 · 2023—24Move years of records out of a legacy CRM without sales noticing the ground shift under them.Migration end to end: source assessment, identity and field mapping, deterministic transformation in Python, Deluge, Apex and SQL, load sequencing with automation suppressed, exception handling, and verification against reconciliation rules rather than record counts.click to pin — resultETLRoom 8 · recurringConference exports, enrichment files, historic spellings — data the CRM cannot clean about itself.Repeatable pipelines in Python and SQL for migration, enrichment, synchronisation and historical correction: explicit mappings, deterministic transforms, validation output, and rerun behaviour that is safe by design.click to pin — result + democode reviewRoom 8 · 2023—nowA platform owner who is also the only reviewer becomes either the bottleneck or the standard.The review standard for CRM change — architecture fit, security, data integrity, platform limits, dependency impact, recovery, test evidence, and who owns it after release — applied to other developers' work and to my own on the same terms.click to pin — resultrelease managementRoom 8 · 2023—nowThe CRM serves live sales operations; there is no maintenance window that suits everyone.Release planning around the business: risk and dependency assessment, sequencing against operations, announcement, verification, staged rollout with the risky part behind a flag, and a rollback path decided before the release rather than during it.click to pin — resultdata qualityRoom 8 · 2023—nowAutomated “fixes” destroy data faster than they clean it.Data-quality governance across the CRM and its inbound systems: field authority, identity confidence, duplicate policy, exception queues — and three write rules applied everywhere: a name is corrected only when the surname differs, title and email fill only empty fields, everything else that merely differs goes to a human.click to pin — result + demopaginationevery integrationEvery API pages differently, and half of them lie about it.Resumable high-volume processing: pre-built page lists with completion flags on platforms without loops, durable progress, provider ceilings respected, duplicate-safe replay and partial-run recovery.click to pin — resultAzure DevOpsclient workSome clients live in Azure, and the release discipline has to come to them.Delivery inside the client's toolchain: repositories, boards, pipelines, approvals and release traceability, with the same gates applied.click to pin — result

Languages

JavaScriptsince 2019 · dailyUI that must live inside an iframe the platform controls — no build step, no framework, no excuses.The primary language of 70+ production widgets and the tooling around them: reusable UI architecture, data-heavy interaction, asynchronous workflows, external integrations and defensive execution where the host page is not mine.click to pin — result + code + demoPythonRoom 8 · recurringThe engineering layer around the CRM: extraction, audits, migrations, classifiers.Platform extraction and audit tooling, configuration snapshots, dependency analysis, migration and validation pipelines, reconciliation and reporting.click to pin — result + demoTypeScripttooling · recurringInternal tooling outlives the week it was written in, and untyped tooling rots fastest.Typed contracts where my code meets other people's data: the org extraction system, integration services, build automation and test infrastructure.click to pin — resultSQLsince 2019A migration claim without a query behind it is an opinion.Validation queries behind migrations, reconciliation checks between systems, data-quality investigation, and reporting that survives “now break it down by…”.click to pin — resultNode.jsthis site & servicesThe services and tooling around the CRM benefit from sharing a language with the widgets.Integration services and engineering infrastructure on Node: API orchestration, this site's dataset generator, build pipeline and test harness.click to pin — result + demoHTMLdailyWidget UIs that must survive years of change, phone screens and printing.Durable markup for embedded applications: real tables for data, complex forms, predictable focus order, and structures that scale without special casing.click to pin — resultCSSdailyThe platform gives an iframe; the design system inside it is yours to build.Styling systems for data-dense CRM interfaces: reusable foundations, responsive layout, state-driven visualisation, theming and mobile adaptation — including the lane layout for overlapping meetings and a ten-colour stage matrix.click to pin — result + demoJava & Spring BootLuxoft, Provectus · 2019—20Two backend years before CRM work: real services, real load.Production services with REST and OAuth integrations, concurrent booking workflows and transactional modelling — background services for a mobile navigation app at Luxoft, the BookMe booking backend at Provectus.click to pin — resultPostgreSQLProvectus, side toolingA booking system where many tablets and phones contend for the same rooms.Relational modelling for high-concurrency access in the BookMe backend, and Postgres behind side tooling since: constraints, transactions, migrations.click to pin — result

AI

AI-assisted developmentdaily since 2024AI-assisted delivery is easy to demo and hard to ship.AI inside a governed workflow: analysis, implementation, tests, documentation and review, with human ownership of architecture, security and business rules, and nothing generated accepted unverified. This site — an SDK emulator, live widgets, a seeded dataset with deliberate defects and a headless test suite — was built that way, and so is my production CRM work.click to pin — result + demoClaudedailyGeneric AI assistance loses the domain: the platform's limits, the org's conventions, the release rules.A domain-aware Claude Code workflow: custom skills encoding widget patterns and platform limits, MCP for org access, structured stages with review gates.click to pin — resultOpenAI APIRoom 8 · design & prototyping“Why did we lose this deal”, answered in free text, is useless for reporting.Designed and prototyped a two-stage pipeline: ten times more code gathering evidence from six sources than calling the model; stage one is forbidden to analyse and must list the holes in the data; stage two places the case into a 38-cause taxonomy carried in the prompt. A prototype, not a production system.click to pin — result + demoembedded CRM featuresRoom 8 · 2024—nowAI features inside a CRM must never leak keys into the browser or act without a trail.Delivered: server-side recap rephrasing, with no key ever reaching the page. Designed, not shipped: an agent pattern where every action writes time, intent, target and a before-and-after diff to a journal module, with a confirmation screen above a risk threshold.click to pin — result + demoMCPexploring · 2025—nowAssistants need to query an org without being handed the keys to it.Exploring MCP as a controlled access layer: narrowly scoped typed tools over the same surface my emulator implements, explicit permissions, audit logging, and a hard line between reasoning and authorised action.click to pin — resultZoho native AIRoom 8 · evaluatedZia ships in the box; the question is where it actually earns its place.Evaluated the native features against real workflows, data boundaries and cost, configured them where they fit, and used custom pipelines where they did not.click to pin — result

Platform ownership

business analysisRoom 8, SoftServe · since 2021Requests arrive as “add a field” — the real constraint is almost always a process nobody has mapped.Lead discovery with Sales, BD, Operations and Support: map the current process, find the actual constraint behind the request, define acceptance criteria, and turn the result into a functional design covering data model, access, automation, integration and reporting. Choose deliberately between native configuration, Deluge, a widget, Creator or an external service. Not my trade: on a larger scope I work alongside a business analyst rather than in place of one.click to pin — resultCRM administrationRoom 8 · 2023—now · dailyA multi-country CRM where access, layouts and automation drift into chaos unless someone owns the operating model.Own it end to end: user lifecycle, role hierarchy, least-privilege profiles, module and field permissions, record ownership, sharing rules, layouts, workflows, Blueprints and validation. Access changes are treated as governed platform changes — with their effect on automation, reporting and integrations — not one-off exceptions.click to pin — resultUAT & adoptionRoom 8, SoftServe · since 2021A deployed change that users route around is a failure with extra steps.Take changes through acceptance, not just deployment: UAT scenarios defined with process owners, representative test data, coordinated sign-off, release notes and user guidance, training sessions, and hands-on support after launch. Recurring questions feed back into the backlog.click to pin — resultgovernance & controlled changeRoom 8 · 2023—nowA CRM serving live sales operations cannot absorb uncontrolled change — and cannot freeze either.Run the change model: intake, prioritisation against business impact and capacity, review gates, traceable releases, rollback paths and post-release verification. Least-privilege access, secrets out of client code and logs, audit trail by design — the same habits that passed AppExchange Security Review.click to pin — resultreports & dashboardsRoom 8 · 2023—nowCommercial teams need numbers they can argue with — one explainable version of them.Native CRM reports and dashboards maintained as part of platform administration; the analytical layer in Zoho Analytics where questions cross modules or systems — synced sources, prepared datasets, transformations, analytical SQL, scheduled delivery.click to pin — resultdata analysisRoom 8 · recurringDecisions about the estate — what to rebuild, what to retire, where the data goes wrong — need numbers rather than impressions.Analysis I run myself on the platform's own data: SQL and Python over exports, audit output and reporting datasets; funnel and cohort questions from sales management; data-quality investigations; the evidence layer and taxonomy behind the loss-analysis pipeline. Some of it was a single question answered once, some I owned end to end from the question to the dashboard.click to pin — resultdocumentationRoom 8, Noltic · since 2022Undocumented platforms die with their author — and consulting work is judged on the paper trail as much as the build.Documentation at the level the change requires: functional designs and acceptance criteria before build; data maps, field dictionaries and sequence diagrams for integrations; test evidence, release notes, runbooks and rollback steps before production; user guidance after. Versioned with the implementation.click to pin — resultstakeholder ownershipRoom 8 · 2023—nowOne engineer, many masters: sales ops, BD, finance, regional teams — all with urgent requests.Own the delivery queue from intake to production: gather demand, clarify business impact and dependencies, estimate, prioritise against capacity and risk, sequence releases, communicate status, verify outcomes after launch.click to pin — result

---

## 04 / EXPERIENCE

## Where the six years happened

From a support desk in Odesa, through Java backends and three years of Salesforce consulting, to owning a production CRM platform end to end. Newest first.

2023 — now

3+ years

current

### Room 8 Group — CRM Engineer / Platform Owner

remote · global game development services company

**Sole developer and accountable owner** of a production Zoho CRM platform serving sales operations, business development and regional teams across multiple countries — data model, automation, widgets, integrations, migrations, release process and post-go-live support. Own the digital roadmap: gather demand from commercial and operations stakeholders, prioritise against business impact and delivery capacity, and sequence releases so change lands without disrupting live operations.

**Inherited — April 2023** — 

-   No version control anywhere; deploy was a person copy-pasting into a browser.
-   Syncs failed silently — the first alert was a salesperson noticing stale data.
-   Relations kept as free-text fields; identity resolved by memory.
-   Widgets one-off and untested; changes verified in production.
-   Nobody could say what the org’s 1,500 functions did, or which were dead.

**Now** — 

-   The whole org in Git; review gate + CI/CD; releases are one reviewed click.
-   Integrations classify their own failures and recover — or report themselves.
-   An explicit identity & merge model enforced across every inbound flow.
-   Widgets across the CRM estate on a shared design system and a versioned component library, browser-tested at phone widths offline.
-   Every function indexed against five entry channels, with an audit trail.

Integrations & orchestration

-   Own the **integration contract with every connected system** — Microsoft Graph, Teams, Jira, Apollo, Slack, Google — defining the auth model, failure modes, retry policy and reconciliation rules, so a broken sync is detected and recovered rather than reported by a user.
-   Designed **multi-system orchestration** across Teams, Zoho CRM and Jira — system-of-record definitions, handoff rules and duplicate prevention — so meeting context reaches CRM and issue tracking without manual re-entry, removing a recurring manual step from the commercial team’s week.
-   Implemented pagination, rate-limit handling, exponential backoff, expired delta-token recovery and idempotent writes across all inbound flows.

Data & identity

-   Defined the organisation’s **identity and record-merge model** — which identifier is authoritative, when records merge automatically, when a human decides — and enforced it across every inbound integration, replacing text-field pseudo-relations with junction modules and an explicit merge path.
-   **Migrated and synchronised large datasets** between CRM platforms with custom mapping, transformation and validation in Python, Deluge, Apex and SQL — Bulk API loads verified against reconciliation rules rather than record counts.

Engineering practice

-   Introduced **version control and reviewable history** to a platform that shipped with neither: internal tooling that extracts all CRM functions into a searchable Git-tracked codebase, maps dependencies and invocation paths, and generates a function-audit table — “no change reaches production unreviewed” as an operating rule.
-   Integrated a **two-way deploy pipeline for Deluge functions** — the entire org’s code pulled to local disk and pushed back after review — so the whole codebase is developed, searched and deep-analysed from one place, instead of the platform’s one-function-at-a-time browser editor.
-   Delivered **three full systems in under 12 months** — the event scheduler, the account development planner (Miller-Heiman methodology) and the conversations/file tooling — and **mentor junior developers** on the platform.
-   Built and maintain **widgets across the CRM estate**, on a shared design system and a versioned component library, including mobile layouts, browser tests at phone widths and an offline harness that stubs the Zoho SDK.
-   **Audited the inherited implementation end to end** and converted the findings into a prioritised remediation plan with sequencing and risk rationale; escalated security and data-integrity issues rather than building around them; review other developers’ work.
-   Drive adoption directly — user documentation, training and hands-on support for non-technical teams; apply **generative AI** across delivery and documentation work.

**Projects from this role — open them on this site** — [Event campaign toolkitdemo](#/p/event)[Meeting board (mobile)demo](#/p/board)[Solution mapdemo](#/p/solution)[Chat → Jirademo](#/p/chat-tracker)[Meeting recapsdemo](#/p/chat-recap)[Org auditdemo](#/p/orghealth)[Org toolingwrite-up](#/p/org-tooling)

[

_[изображение: Event campaign page widget]_

Event campaign page3 widgets + booking wizard — live](#/p/event)[

_[изображение: Solution map widget]_

Solution mapservice lines × business units — live](#/p/solution)[

_[изображение: Meeting board mobile widget]_

Meeting board (mobile)room timeline on a phone — live](#/p/board)

Zoho CRMDeluge3+ years of production Deluge at Room 8: scheduled syncs, workflow functions, REST callouts through connections. My calendar delta-sync walks pages with a checkpoint written on every page — because the language has no while loop and a run can die on page forty.JavaScriptEvery widget on this site is framework-free vanilla JS — my daily language for UI that has to live inside an iframe the platform controls.PythonMy data language: migrations, org extraction, validation pipelines, the conference-export bucket sorter.COQLMy main query surface: dotted lookups across modules, paging at the 200-row ceiling, the 14-condition criteria limit — and the chunked searches I wrote for when the limits bite. The query console on the Zoho tab runs my interpreter of it.MS GraphTeamsJiraTeams threads routed to Jira by the PITCH code in a root message, comments idempotent through a marker inside the body, public or role-restricted by a #jira / #jira\_private tag, attachments always sent as links rather than uploads.ApolloBuilt the enrichment pipeline: provider people matched against the CRM through four dedup keys in sequence, the last a normalised profile URL; batching tuned to provider quota with three retry steps.SlackCRM events surfaced into Slack channels — deal changes and sync failures reported where the team already is.GitBrought Git to a platform with no export: my extraction tooling pulls ~1,500 functions into a reviewable repo, and the diff between commits stands in for the change history the platform never kept.GitHub ActionsSet up CI/CD at Noltic and again at Room 8: automated test execution, environment promotion, one-click deploys — and guards that fail the build if anything resembling a real org identifier appears.

2022 — 23

10 months

### Noltic — Salesforce Developer

Lviv, Ukraine (remote) · Salesforce consulting partner · flagship: Google Drive ↔ Salesforce, published on AppExchange

**Architected end to end** a Google Drive ↔ Salesforce integration that shipped as a Managed Package on AppExchange, paired with a Chrome extension — so a person working in Google Docs links the open document to an Opportunity without switching tabs.

-   Implemented **resumable chunked uploads** — session URLs, Content-Range headers, retry from the failed chunk, tested with files up to 2 GB — cutting upload failures by **~80%**; heavy calls offloaded to Queueable/@future around Salesforce callout limits.
-   Designed a **hybrid OAuth token strategy**: tokens stored in Salesforce (locked down by permission sets) with a Chrome-local fallback — refresh and revocation handled on both paths.
-   Solved Google Drive’s “folders are just files” model: recursive tree traversal with a documented two-level depth cap — the honest compromise against Google rate limits and Salesforce governors at once.
-   Took the package through **AppExchange Security Review** (three submissions): log sanitation, FLS/CRUD enforcement, permission-set lockdown of token fields, HttpCalloutMock coverage for every external path.
-   **Built and owned the delivery pipeline**: Git workflow, CI/CD with GitHub Actions, code review and release coordination across distributed teams.
-   Second project: a customer-management system for small businesses (hotels and the like) on a ready-made CRM platform — short, but a useful lesson in when _not_ to build custom.

ApexThree years of production Apex across Noltic, SoftServe and Synebo: triggers, batch, queueable, schedulable — bulkified and unit-tested. Refactored inherited trigger architecture twice, both times without stopping the org.LWCSLDSOAuth 2.0Implemented the token layer all my outbound calls share: cached, refreshed a minute before expiry; an auth failure clears the cache and retries once instead of failing the run.Google Drive APIChrome extensionAppExchangeSecurity ReviewGitHub ActionsSet up CI/CD at Noltic and again at Room 8: automated test execution, environment promotion, one-click deploys — and guards that fail the build if anything resembling a real org identifier appears.

2021 — 22

1 yr 4 mo

### SoftServe — Salesforce Developer & Administrator

remote (Ukraine) · enterprise consulting · two projects, two certifications earned on the job

-   **Sales-automation project** — a two-person delivery (my manager and I): LWC components and Apex backend across **Sales, Service and Experience Cloud** for international clients, with all client communication in English. Earned **Salesforce Platform Developer I** during this project.
-   **Healthcare project** — process automation for an international medical company in a multi-country team: declarative-first delivery with **Flows**, navigating Salesforce and Google API limits into a tool the client could support long-term. Earned **Salesforce Administrator** during this one.
-   Ran **requirements workshops** with business analysts and client stakeholders, then owned estimates, build, testing and technical documentation through to release for each approved change.
-   Held test coverage with **unit tests and mocks**; worked production defects from diagnosis to fix, keeping a live client platform stable while change continued to ship.

Sales CloudService CloudExperience CloudApexThree years of production Apex across Noltic, SoftServe and Synebo: triggers, batch, queueable, schedulable — bulkified and unit-tested. Refactored inherited trigger architecture twice, both times without stopping the org.LWCFlowsDeclarative vs code decided case by case at SoftServe: Flows for what an admin should be able to change, Apex for what must not break silently.unit tests & mocks

2020 — 21

5 months

### Synebo — Salesforce Developer

Odesa, Ukraine · Salesforce consulting partner

-   Implemented and refactored **Apex — triggers, batch, queueable and schedulable jobs** — within Salesforce governor limits.
-   Optimised **SOQL queries** for performance on large data volumes.
-   Built user interfaces in **Lightning Web Components, Aura and Visualforce**.
-   Wrote unit tests and worked with QA to reproduce and resolve defects before release.

ApexThree years of production Apex across Noltic, SoftServe and Synebo: triggers, batch, queueable, schedulable — bulkified and unit-tested. Refactored inherited trigger architecture twice, both times without stopping the org.SOQLLWCAuraMaintained and extended Aura components in orgs that predate LWC — and migrated pieces to LWC where it paid off.VisualforceLegacy Visualforce kept alive and slowly retired — I’ve done the archaeology of a 2015-era org more than once.QA collaboration

2020

6 months

### Luxoft — Java Software Engineer

Odesa, Ukraine · project: mobile navigation (Maps) application

-   Developed **Java and Spring Boot background services** for a mobile navigation (Maps) application — the server side behind turn-by-turn features on the phone.
-   Implemented REST communication between services using **Retrofit**; collaborated with other developers on designing, developing, testing and shipping server-side applications.
-   Delivered features, change requests and defect fixes within a **Scrum organisation of 50+ developers**, integrating across multiple microservices — direct experience of a large matrixed delivery structure and its coordination overhead.

JavaSpring BootRetrofitRESTmicroservicesScrum

2019

6 months

### Provectus — Java Engineer (internship)

Odesa, Ukraine · project: BookMe — meeting-room booking

Joined the **first-wave BookMe team** on the “Formula-1” internship: an internal product for booking meeting rooms from tablets at the door and from a mobile app — any room in the office, not just the one you are standing next to. Our team shipped **v1.0 in October 2019**; a second wave later grew it into desk booking during the pandemic.

-   Built the **server side**: REST APIs the iOS and Android clients consume, Google Calendar synchronisation, OAuth 2.0 authentication and access control.
-   Designed the **database schema for high-concurrency access** — many tablets and phones booking the same rooms at once.
-   Supported the iOS and Android client developers day to day — the API contract was a conversation, not a handoff.

**In the press** — [AIN.UA — the BookMe storyarticle](https://ain.ua/ru/2021/02/04/bookme-ili-zachem-it-kompanii-prilozhenie-dlya-bronirovaniya-miting-rumov-vo-vremena-pandemii/)[BookMe on the App Storeapp](https://bookme-provectus.appstor.io/)

JavaREST API designGoogle Calendar APIOAuth 2.0Implemented the token layer all my outbound calls share: cached, refreshed a minute before expiry; an auth failure clears the cache and retries once instead of failing the run.database designiOS/Android teams

2016 — 18

2 yrs 4 mo

### Odis-W — Support Engineer

Odesa, Ukraine · first IT role

-   Where it started: two years of **support engineering** alongside the telecom degree — diagnosing real users’ problems before ever automating them away. The habit of reading errors instead of guessing dates from here.

supporttroubleshootingnetworks

---

## 05 / HOW I RUN A PLATFORM

## What this looks like off the keyboard

The part of platform ownership that is not code: discovery, governance, adoption and the discipline that keeps the other six sections true.

### Business analysis & functional design

Turning a stakeholder request into a data model, not just a screen.

-   Stakeholder discovery before a single field gets built — what the request is actually trying to solve.
-   Translate “I want a button” into entities, relationships and validation rules.
-   Push back on requirements that would break the platform, with a working alternative attached — spec before code.

### CRM administration & access governance

Who sees what, and why, enforced by design rather than habit.

-   Profiles, roles, sharing rules and layouts designed around how teams actually work.
-   Access follows the org chart and survives reorgs, because it hangs on roles rather than named users.
-   Changes to the access model go through a controlled review, not a live edit.

### Reporting & analytics

Native reporting as part of administration; cross-system analysis where it earns its place.

-   Reports and dashboards built and maintained as a normal part of CRM administration.
-   Cross-system analytics in Zoho Analytics where a question spans more than one source.
-   No BI stack beyond what was actually there — the honest version, not the impressive one.

### UAT, training & adoption

A feature isn’t done when it ships; it is done when people use it correctly.

-   Acceptance scenarios written and walked through before release, not after.
-   Training run on each team’s own data, not a generic sandbox.
-   Adoption checked a month out — is the feature actually being used, and by whom.

### Documentation

Documentation that lives where the work happens, not in a wiki nobody opens.

-   In-product help built into the record itself — see the [field guide in the solution map](#/p/solution) for a live example of the pattern.
-   Runbooks for the processes that would otherwise live in one person’s head.
-   Field-ownership diagrams that answer “who owns this value” before anyone has to ask.

### Governance, security & controlled change

A history of what changed and why, where the platform itself keeps none.

-   The whole org [snapshotted into git](#/p/org-tooling), standing in for the change history the platform never kept.
-   Credential separation enforced across the [secret boundary](#/p/org-tooling) between systems.
-   AppExchange Security Review as the hardest version of this discipline — passed, not waived.

### Delivery & stakeholder ownership

Sole technical owner of the platform, accountable for what ships and what breaks.

-   Sole technical owner of the Zoho CRM platform since 2023 — roadmap, delivery and support in one seat.
-   Review other developers’ code before it reaches production.
-   Three full systems delivered in twelve months, plus ongoing mentoring of junior developers.

---

## 06 / CREDENTIALS

## Certifications

Three Salesforce credentials, all current. Each card links to the official credential description; verification is one click on Trailhead.

[

PD I

### Salesforce Certified Platform Developer I

2021 · currentVerify on Trailhead →](https://trailblazer.me/id/kburiak)[

ADM

### Salesforce Certified Administrator

2021 · currentVerify on Trailhead →](https://trailblazer.me/id/kburiak)[

JS I

### Salesforce Certified JavaScript Developer I

2022 · currentVerify on Trailhead →](https://trailblazer.me/id/kburiak)

---

## 07 / EDUCATION

## Where the engineering started

A telecommunications degree before software: networks, infrastructure and system design — the reason integrations feel like home ground rather than someone else’s territory.

ONAT

### Odessa National Academy of Telecommunications (A.S. Popov)

Master’s degree — Computer Networks & Telecommunications

2010 — 2016 · Odesa, Ukraine

Six years of networks, protocols and IT infrastructure — with the lesson that stuck: mastering a technology matters less than understanding how technologies **integrate and interact**. Everything on this site — sync engines, auth layers, reconciliation — grows out of that foundation.

## Courses & additional training

IT STEP Academy

#### Java Programming

2018 — 2019

Hillel IT School

#### Front-End Pro

course

course

#### Algorithms & Data Structures

certificate

course

#### Clean Code & Design Patterns

certificate

course

#### Java (Basic)

certificate

Salesforce

#### Trailhead

2020 — 2021 · [trailblazer.me/id/kburiak →](https://trailblazer.me/id/kburiak)

## Languages & setup

Languages

English — **B2**, daily working language in international teams · Ukrainian — native · Russian — native · Polish — A1 · Spanish — beginner

Work setup

Warsaw, Poland (CET/CEST) · on-site, hybrid or remote · EU work authorization — no sponsorship required · B2B via Polish sole proprietorship or Umowa o Pracę

Beyond the code

Cycling, gym and martial arts keep the discipline; science fiction feeds the imagination — reading it, and building fictional worlds of my own. Travels to see how different cultures approach work and life. Learning Spanish.

---

## 08 / THIS SITE, LIVE

## Counted in your browser, right now

Nothing here is a claim from a PDF — the site carries its own evidence and counts it as you read.

**0_✓_**headless tests behind this build

**0**live demos mounted on these pages

**0**write-ups with the trade stated

**0**synthetic records generated for the emulator

**0_~_**org functions extracted & indexed

**Synthetic by design** — 

Every record on this site belongs to an invented company. The platform underneath is emulated in your browser, and a failure switch turns on latency, rate limits and rejected writes — so recovery paths can be clicked rather than described.

---

## 09 / TERMINAL

## Or just ask the CV

For those who read job sites in a terminal anyway.
