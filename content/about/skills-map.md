---
file: "skills-map"
title: "Карта навыков (STORY)"
entries: 76
words: 4847
source:
  code: "src/app.html · STORY"
---

# Карта навыков

Блок «03 / SKILLS» на About. Каждая запись раскрывается по клику на навык.
Поля: `w` — где и когда, `t` — задача/ограничение, `b` — что построено, `r` — результат, `demo` — ссылка на страницу, `code` — фрагмент кода.

---

## Deluge

**Где:** Room 8 · 2023—present · daily

**Задача:** Three years as the only Deluge engineer on a production org: hundreds of functions behind integrations, scheduled jobs and every widget on the platform.

**Построено:** The language is only half of it. Before Zoho provided a functions API the platform gave one browser editor and one function at a time, so I built the extraction and deploy tooling that put the whole codebase under Git with review and dependency analysis — and delivered business processes spanning dozens of functions as one reviewable change.

**Результат:** Deluge stopped being isolated snippets in textareas and became a codebase I could reason about. That is what made the larger systems possible.

_Ссылка на демо:_ `#/p/orghealth`

```js
// checkpoint per page — not per run
for each pg in pageList          // no while loop in Deluge
{
  if(done == false)
  {
    resp = invokeurl [ url: deltaLink ... connection: "graph" ];
    processEvents(resp);
    saveCheckpoint(mailbox, resp.get("@odata.deltaLink"));
    done = resp.get("@odata.nextLink") == null;
  }
}
```

---

## Widgets

**Где:** Room 8 · 2023—present · daily

**Задача:** Sales lives in tables the platform cannot draw — 400-contact target lists, room schedules, a service-line matrix — and every one has to run inside an iframe the CRM controls.

**Построено:** 70+ production widgets on a corporate design system of my own: a versioned component and function library every screen is assembled from, composite screens backed by several Deluge services and external systems at once, mobile adaptations for the Zoho app, and an offline stand that stubs the SDK so a change is verified before production sees it.

**Результат:** The record page became the tool people actually work in.

_Ссылка на демо:_ `#/p/event`

---

## COQL

**Где:** Room 8 · 2023—present · daily

**Задача:** Every widget and integration needs data the REST list endpoints return awkwardly or not at all.

**Построено:** COQL as the daily data-access layer: cross-module read models, reusable query patterns, and the platform's ceilings — 200 rows, 14 criteria — treated as ordinary constraints rather than discoveries.

**Результат:** One query surface everywhere, with the ceilings designed for rather than discovered.

_Ссылка на демо:_ `#/p/event`

```js
select id, Full_Name, Account_Name.Account_Name
from Contacts
where Account_Name.Country = 'Poland'
  and Meeting_Status in ('booked', 'held')
limit 200 offset 400   -- ceiling: 200 rows, page by hand
```

---

## Zoho SDK

**Где:** Room 8 · 2023—present · daily

**Задача:** A widget only exists inside the CRM and the SDK it depends on has no offline form, so every change used to be tested in production.

**Построено:** Production work across record pages, related lists, buttons, web tabs, Canvas and mobile surfaces — learned deep enough to build a compatible offline stand for the SDK surface the widget estate uses: init and lifecycle, record APIs, resize, connection invokes, the platform's own error envelopes.

**Результат:** Widgets develop and test outside the CRM, and a change is verified before the platform ever sees it.

_Ссылка на демо:_ `#/p/event`

```js
ZOHO.embeddedApp.on("PageLoad", function(page){
  ZOHO.CRM.API.coql({select_query: q})
    .then(render)
    .catch(showErrorEnvelope); // same shape offline & live
});
ZOHO.embeddedApp.init();
```

---

## custom modules

**Где:** Room 8 · 2023—present

**Задача:** The org kept its relations as free text — “which business unit, which programme” lived as strings someone once typed.

**Построено:** Fifty-plus custom modules — junction, service and journal modules among them — with relationships, ownership, lifecycle and validation defined rather than accumulated, plus the migration scripts that moved years of strings into real references.

**Результат:** Reports and rollups became possible; “which deals touch this unit” is a query now, not a guess.

_Ссылка на демо:_ `#/p/solution`

---

## workflows

**Где:** Room 8 · 2023—present

**Задача:** Daily ownership of an automation estate accumulated over years: rules, schedules and functions, most of them inherited.

**Построено:** Criteria architecture, execution order, function orchestration and conflict analysis as routine work — and an index of the whole estate: every function cross-referenced against five entry channels, every rule against its execution history.

**Результат:** Rules marked active that had never fired once turned up in that index — a criterion still named a renamed field. Automation is inventory now, not folklore.

_Ссылка на демо:_ `#/p/orghealth`

---

## Blueprints

**Где:** Room 8 · 2023—present

**Задача:** The sales process existed as tribal knowledge; stages were skipped and loss reasons never captured.

**Построено:** Blueprint-driven lifecycles as part of platform ownership: states, controlled transitions, per-stage mandatory fields, automation hand-offs and the escape paths that surface in week two — with a deliberate boundary between what belongs in a Blueprint, a workflow, code and the UI.

**Результат:** The loss-analysis work downstream became possible, because the data it needs is enforced at entry.

---

## schedules

**Где:** Room 8 · 2023—present · daily

**Задача:** Everything periodic on the platform runs through scheduled functions, and they share one quota and one timeout.

**Построено:** The org's scheduled workload designed as a whole: partitioning, resumability, overlap prevention, idempotency and safe backfills — delta syncs, a chat import every ten minutes, a monthly forced resync.

**Результат:** No single run nears the ceiling, and an interrupted job continues instead of restarting.

_Ссылка на демо:_ `#/p/orghealth`

---

## validation rules

**Где:** Room 8 · 2023—present

**Задача:** The org accepted bad data faster than any cleanup could remove it, and every report inherited the mess.

**Построено:** Validation placed by layer rather than by habit — layouts, Blueprints, workflows, widgets and Deluge — so each business invariant holds where it cannot be bypassed, without blocking legitimate exceptions or integration traffic. Every refusal names its reason.

**Результат:** Data quality became a property of the system rather than of individual diligence.

_Ссылка на демо:_ `#/p/event`

---

## Tabulator

**Где:** Room 8 · 2023—present

**Задача:** A 400-row target list needs filtering, sorting and in-cell editing — inside an iframe, on CRM data.

**Построено:** Reusable patterns for large interactive datasets across the widget estate: custom header filters, validated in-cell editing, state that survives a refresh, custom rendering, and writes back into the CRM.

**Результат:** Contact triage that used to need a spreadsheet export happens on the record page.

_Ссылка на демо:_ `#/p/event`

---

## layouts

**Где:** Room 8 · 2023—present

**Задача:** A CRM form is a tax on every deal a salesperson logs, and the org's forms had grown by accretion for years.

**Построено:** Layouts and information architecture across dozens of modules: role- and process-specific variants, conditional sections, field dependencies, naming consistency, and controlled evolution as requirements changed.

**Результат:** Faster entry and cleaner records — the right field became the easy one, and layout changes pass the same review as code.

---

## roles & profiles

**Где:** Room 8 · 2023—present

**Задача:** Sales ops, BD and regional teams in several countries: everyone needs their slice, nobody should see everything.

**Построено:** The access model designed rather than accumulated: a role hierarchy following the org chart, least-privilege profiles, module and field permissions, record ownership and sharing rules that survive reorgs — with their effect on automation, reporting and integrations accounted for.

**Результат:** Access questions have an answer in the model instead of a special case per person.

---

## Zoho Creator

**Где:** Room 8 · occasional

**Задача:** Not every internal tool deserves a CRM module — forcing the wrong shape distorts data for years.

**Построено:** Creator apps for process-specific interfaces: data modelling, forms, automation and CRM integration, plus the judgement of when Creator beats a module or a widget.

**Результат:** Internal tools that fit their data instead of bending it.

---

## Zoho Flow

**Где:** Room 8 · occasional

**Задача:** Visual automation is loved right up until it silently breaks under volume.

**Построено:** Flow used where a business owner should see and change the automation, with a boundary — ownership, volume, security, observability, recovery — that decides when something moves into engineered code.

**Результат:** The classic automation-rot failure mode prevented before it started, org-wide.

---

## Zoho Analytics

**Где:** Room 8 · recurring

**Задача:** Management ran on gut feel, and CRM-native reports could not express the questions being asked.

**Построено:** The reporting layer over the CRM and beyond it: synchronised CRM and external sources, prepared datasets and transformations, analytical queries, and dashboards built around the questions managers ask weekly.

**Результат:** Meetings argue about what to do next, not about whose numbers are right.

---

## Zoho One

**Где:** Room 8 · 2023—present

**Задача:** The CRM sits inside a wider suite someone has to own.

**Построено:** Platform-level administration of the surrounding estate: applications, user lifecycle, provisioning, access coordination, and the integration boundaries between CRM and adjacent products.

**Результат:** One accountable owner for the whole Zoho footprint.

---

## Apex

**Где:** Noltic, SoftServe, Synebo · 2020—23

**Задача:** Three consulting years in other people's orgs, on other people's deadlines, with governor limits always in the room.

**Построено:** Production Apex across triggers, batch, queueable and schedulable work: transaction-safe automation, integration services, large-volume processing and test architecture — including two inherited trigger architectures refactored without stopping the org.

**Результат:** Certified three times over, but the refactors are the better credential.

```js
trigger OppTrigger on Opportunity (after update) {
  // one query, whole batch — never per record
  Map<Id,Account> accs = new Map<Id,Account>(
    [SELECT Id, OwnerId FROM Account
     WHERE Id IN :accountIds(Trigger.new)]);
  OppService.reassign(Trigger.new, accs); // logic lives in a class
}
```

---

## Lightning Web Components

**Где:** Noltic, Synebo · 2020—23

**Задача:** Orgs full of one-off screens: each new request built from scratch and styled its own way.

**Построено:** Reusable LWC patterns to SLDS standards with presentation, state and service integration separated, so a new capability is assembled rather than rebuilt; contributed to the architecture of the integration flows behind them.

**Результат:** New screens assembled from parts instead of started from zero.

---

## SOQL/SOSL

**Где:** Synebo, SoftServe · 2020—22

**Задача:** Queries that worked in a demo org crawled on production volumes.

**Построено:** Query paths designed for real data: selectivity and indexing, transaction budgets, search behaviour, security context and asynchronous processing.

**Результат:** The habit transferred — the same discipline shapes my COQL work today.

---

## Flows

**Где:** SoftServe · 2021—22

**Задача:** Every automation request arrives as “just write code”, and then an admin can never touch it again.

**Построено:** Flow, Apex or a combination chosen per case on business ownership, transaction safety, observability and who has to support it after handover.

**Результат:** Clients kept the ability to adjust their own processes after handover.

---

## Aura

**Где:** Synebo, SoftServe · 2020—22

**Задача:** Orgs that predate LWC don't rewrite themselves, and users depend on every screen while you touch it.

**Построено:** Maintained and extended production Aura across client orgs: tracing inherited dependencies, protecting existing behaviour, migrating to LWC only where the payoff justified the risk.

**Результат:** Legacy stewardship — unglamorous, and the reason the client kept working through it.

---

## Visualforce

**Где:** Synebo, SoftServe · 2020—22

**Задача:** The 2015-era corners of an org still serve users every day.

**Построено:** Dependency analysis, safe production fixes and regression protection on business-critical Visualforce, with replacement only once a verified successor existed.

**Результат:** Legacy screens kept working while the org moved on around them.

---

## Sales / Service / Experience Cloud

**Где:** SoftServe · 2021—22 · 

**Задача:** Multiple concurrent client implementations, each with its own model of the world.

**Построено:** Delivery from requirements to release: solution modelling, objects and layouts, access architecture, automation boundaries, estimation, build, testing, documentation and handover — with requirements run directly with client stakeholders.

**Результат:** Delivery didn't need a translator between the client and the build.

---

## Microsoft Graph

**Где:** Room 8 · 2023—present · daily

**Задача:** Meetings are booked in Outlook; sales needs them in the CRM within minutes, without anyone forwarding invitations.

**Построено:** Graph integrations across calendar, mail and identity: an Entra app registration with least-privilege scopes, delta queries with durable state per mailbox, throttling budgets that slow a mailbox instead of failing it, and failure isolation so one broken account cannot stop the rest.

**Результат:** Two years of unattended operation — a mailbox that breaks reports itself instead of silently drifting.

_Ссылка на демо:_ `#/p/event`

---

## Teams & Teams bots

**Где:** Room 8 · 2023—present

**Задача:** Deals are discussed in Teams threads; none of it reached the record, and nobody was going to retype it.

**Построено:** Teams-centred workflows spanning conversations, meetings, Adaptive Cards, CRM records and the issue tracker: identity resolution, asynchronous interaction, auditability — including a text contract in the first message of a thread instead of a bot nobody would have approved, and a resumable importer that takes five channels a run.

**Результат:** Thread context lands on the right deal with the mapping source recorded; ambiguous threads park for review instead of guessing.

_Ссылка на демо:_ `#/p/chat-tracker`

---

## OAuth 2.0

**Где:** every integration since 2019

**Задача:** Every outbound system speaks a different dialect of the same auth dance, and tokens expire mid-run.

**Построено:** Auth boundaries across providers: grant selection, least-privilege scopes, token storage and renewal, secret rotation, revocation and bounded recovery — one shared token layer, cached and refreshed a minute before expiry, that clears and retries once on failure.

**Результат:** Auth stopped being a source of incidents, and the pattern has survived four platforms unchanged.

```js
async function token(){
  if(cache && cache.exp - 60_000 > Date.now()) return cache.value;
  cache = await refresh();          // client_credentials / refresh_token
  return cache.value;
}
// on 401: cache = null; retry once; then fail loudly
```

---

## idempotency

**Где:** Room 8 · 2023—present

**Задача:** A sync that runs every ten minutes will eventually run twice over the same data.

**Построено:** Replay guarantees defined per integration: stable identities, deduplication state, explicit create-versus-update semantics, and protection of human-authored fields — markers inside comment bodies, rolling journals of processed event ids on the record itself.

**Результат:** “Ran twice” became a non-event: the second pass finds its own marks and steps over them.

_Ссылка на демо:_ `#/p/chat-tracker`

---

## delta tokens

**Где:** Room 8 · 2023—present

**Задача:** Full re-reads guarantee timeouts; provider cursors solve that until one expires mid-run.

**Построено:** Incremental synchronisation with durable checkpoints per page, expiry recovery inside the same run, periodic full reconciliation to clear drift, and explicit handling of deletions.

**Результат:** The syncs self-heal from every token failure mode seen in production.

_Ссылка на демо:_ `#/p/event`

---

## Email ingestion

**Где:** Room 8 · 2023—present

**Задача:** Customer email lived in personal mailboxes across several sources; the CRM saw none of it.

**Построено:** A server-side ingestion pipeline over multiple sources and mailboxes: identity and thread resolution, deduplication, routing to the right account and deal, attachment handling and exception reporting.

**Результат:** The record tells the whole story of an account, including the part that used to die in inboxes.

---

## Jira

**Где:** Room 8 · 2023—present

**Задача:** Presales discusses a deal in Teams — and none of it reaches the Jira issue engineering actually works from.

**Построено:** A Teams-to-Jira integration routed by a PITCH code resolved once from a thread's root message: public or role-restricted comments made idempotent by a marker inside the body, attachments sent as links rather than uploads, and a one-time reaction confirming delivery back on the source message.

**Результат:** A ten-minute sync that never duplicates a comment, with delivery visible on the Teams message itself instead of only inside Jira.

_Ссылка на демо:_ `#/p/chat-tracker`

---

## Apollo

**Где:** Room 8 · 2023—present

**Задача:** Conference target lists arrive as exports with wrong company names and no shared key with the CRM.

**Построено:** Enrichment into the CRM with governance: account-hierarchy resolution, four identity keys applied in order ending with a normalised profile URL, field authority, conservative update rules, quota-aware batching, and human review of ambiguous candidates.

**Результат:** Hundreds of people imported without creating duplicates — the tool is safe to run twice.

---

## webhooks

**Где:** Room 8 · 2023—present

**Задача:** Events are not re-sent: a rejected write is a lost event, and the rejection reason is unknown in advance.

**Построено:** A receiver that repairs its own payload: five attempts, reading the failing field out of the CRM error, substituting or dropping it, switching create to update when a duplicate id comes back — with the raw payload retained and everything dropped itemised.

**Результат:** Records arrive degraded-but-visible instead of not at all, and the degradation is on the record rather than in a log nobody reads.

_Ссылка на демо:_ `#/p/cross-system`

```js
for (attempt of [1,2,3,4,5]) {
  res = crm.upsert(payload);
  if (res.ok) break;
  field = parseFailingField(res.error);
  if (!field) break;                 // unknown cause: stop, don’t spin
  payload = repair(payload, field);  // placeholder | drop | create→update
}
report(dropped, substituted);        // degradation is itemised
```

---

## rate limiting

**Где:** Room 8, Noltic · since 2022

**Задача:** Every provider throttles differently, and a naive retry storm makes it worse.

**Построено:** Capacity and retry policy across the integration estate: the server's own Retry-After respected first, bounded backoff after that, checkpoint-safe throttling, smaller pages for heavy accounts, and batch sizes pinned to each platform's documented limits.

**Результат:** Throttling became a slowdown, not an outage.

---

## reconciliation

**Где:** Room 8 · 2023—present

**Задача:** “Sixty minutes here, forty-five there” does not tell an operator what the record should say.

**Построено:** Reconciliation built on explicit field authority rather than comparison: a third column carrying the expected value computed from an authority map, the governing rule printed under it, and a repair that writes exactly that.

**Результат:** Disagreements between systems became a queue to work rather than an argument to have.

_Ссылка на демо:_ `#/p/event`

---

## Adaptive Cards

**Где:** Room 8 · 2023—present

**Задача:** A person takes minutes to fill a form; a synchronous Teams call has seconds.

**Построено:** Human-in-the-loop workflows inside a channel that cannot wait: stateless cards reissued in a loop for search, callback-driven progression, a bounded lifetime so a forgotten card cannot hold a run open, and a sentinel value carrying “chosen deliberately” through a control that returns one string.

**Результат:** A search over hundreds of accounts happens inside something that cannot fetch.

_Ссылка на демо:_ `#/p/chat-recap`

---

## deduplication

**Где:** Room 8 · 2023—present

**Задача:** The same person exists four different ways across two systems.

**Построено:** Identity resolution across integrations and migrations: authoritative identifiers, normalisation, ordered evidence ending with a normalised profile URL, confidence thresholds, merge safety, and human review whenever automation cannot prove identity — name matches shown but never blocking.

**Результат:** Import tools that are safe to run twice, by construction.

---

## Slack

**Где:** Room 8 · 2023—present

**Задача:** Integration failures used to be discovered by salespeople noticing stale data.

**Построено:** Slack as the operational surface for the integration estate: each sync classifies its own failures and reports its own health, deal events and alerts routed to the channels the team already reads, with noise kept deliberately low.

**Результат:** Time-to-notice for a broken sync dropped from days to minutes — and the monitoring lives in the syncs, not in the chat.

---

## Google Workspace

**Где:** Noltic 2022—23, Provectus 2019

**Задача:** Documents in Drive, bookings in Calendar — both needed to live inside other systems.

**Построено:** Architected the Google Drive–Salesforce managed integration at Noltic: resumable chunked uploads to 2 GB, hybrid OAuth, record-linked document workflows, a Chrome extension linking open Google Docs to CRM records, packaging and Security Review. Earlier, Google Calendar sync in the BookMe backend at Provectus.

**Результат:** Two production Google integrations five years apart — one of them publicly published and security-reviewed.

---

## Power Automate

**Где:** occasional

**Задача:** Some flows belong to business owners, not to engineering.

**Построено:** Used for business-managed orchestration, and evaluated by ownership, data sensitivity, volume, observability and recovery — moved into engineered integrations when it outgrew that role.

**Результат:** A deliberate boundary rather than a default tool.

---

## Zapier

**Где:** inherited estates

**Задача:** Inherited Zapier estates twice — glue that had quietly become infrastructure.

**Построено:** Reviewed and documented what was there: ownership and failure modes written down, sound low-risk flows kept, fragile ones migrated to native integrations once volume and recovery mattered more than editability.

**Результат:** Fewer 3 a.m. surprises from a tool with no real execution log.

---

## Make

**Где:** inherited estates

**Задача:** The same inheritance, a different platform.

**Построено:** Make treated as low-code glue with the same boundary applied: fine while a flow is small and business-owned, replaced once retries, logs and recovery had to be real.

**Результат:** Consistency beats tool loyalty.

---

## AppExchange & Security Review

**Где:** Noltic · 2022—23

**Задача:** A working integration is one thing; a package Salesforce will let strangers install is another. The Security Review exists to find the difference.

**Построено:** The full cycle on the Google Drive integration: OAuth and token storage locked behind permission sets, logs sanitised of anything sensitive, CRUD/FLS enforced on every path, HttpCalloutMock coverage for all external calls, packaging, and remediation across three submissions.

**Результат:** Published on AppExchange. The habits it forced — security from day one, logs that never see a token — stayed in everything I have built since.

---

## Deluge deploy pipeline

**Где:** Room 8 · 2024—present · daily

**Задача:** Before Zoho provided a functions API the platform offered one browser editor, one function at a time: no search across the codebase, no history, no local tooling.

**Построено:** A two-way delivery pipeline for Deluge: the org's whole codebase pulled to local disk, edited in a real IDE under Git with review and dependency-aware analysis, and pushed back with the round-trip verified — what lands in the org is exactly what was reviewed.

**Результат:** Isolated snippets in textareas became deliverable systems: coordinated multi-function change, dead-code and dependency analysis, and daily development that no longer fights a browser.

---

## Git

**Где:** everywhere · daily

**Задача:** The platform keeps no change history: “who changed this rule and when” had no answer.

**Построено:** Source-driven engineering brought to an estate of more than a thousand functions: extraction and snapshot tooling pulls code and org configuration into a Git-tracked repository with dependency mapping and response diagnostics, so change history and review exist at all.

**Результат:** The diff between commits does the job the missing change history never did, and “no change reaches production unreviewed” became enforceable.

_Ссылка на демо:_ `#/p/org-tooling`

---

## GitHub Actions

**Где:** Noltic, Room 8 · since 2022

**Задача:** Deploys were a person copy-pasting into a browser — on two different platforms, two years apart.

**Построено:** Reviewed CI/CD on both estates: automated verification, environment promotion, one-click traceable releases, and guards that fail the build if anything resembling a real identifier appears.

**Результат:** Release day stopped being an event. Rollback is a revert, not an archaeology dig.

---

## automated testing

**Где:** Room 8 · 2023—present

**Задача:** An embedded CRM application cannot run outside the CRM, so verifying a change used to mean deploying it to production.

**Построено:** A testing architecture for that constraint: an offline stand stubbing the Zoho SDK, seeded datasets with deliberate defects, browser-level regression at desktop and phone widths, mocked external boundaries, and release gates that fail on any console error.

**Результат:** Changes are verified before the platform ever sees them.

---

## Data migration

**Где:** Room 8 · 2023—24

**Задача:** Move years of records out of a legacy CRM without sales noticing the ground shift under them.

**Построено:** Migration end to end: source assessment, identity and field mapping, deterministic transformation in Python, Deluge, Apex and SQL, load sequencing with automation suppressed, exception handling, and verification against reconciliation rules rather than record counts.

**Результат:** One authoritative set of records, and a written answer to “why does this field disagree”.

---

## ETL

**Где:** Room 8 · recurring

**Задача:** Conference exports, enrichment files, historic spellings — data the CRM cannot clean about itself.

**Построено:** Repeatable pipelines in Python and SQL for migration, enrichment, synchronisation and historical correction: explicit mappings, deterministic transforms, validation output, and rerun behaviour that is safe by design.

**Результат:** Messy externals enter the CRM classified and traceable, or not at all.

_Ссылка на демо:_ `#/p/buckets`

---

## code review

**Где:** Room 8 · 2023—present

**Задача:** A platform owner who is also the only reviewer becomes either the bottleneck or the standard.

**Построено:** The review standard for CRM change — architecture fit, security, data integrity, platform limits, dependency impact, recovery, test evidence, and who owns it after release — applied to other developers' work and to my own on the same terms.

**Результат:** The standard survives me being on holiday.

---

## release management

**Где:** Room 8 · 2023—present

**Задача:** The CRM serves live sales operations; there is no maintenance window that suits everyone.

**Построено:** Release planning around the business: risk and dependency assessment, sequencing against operations, announcement, verification, staged rollout with the risky part behind a flag, and a rollback path decided before the release rather than during it.

**Результат:** Change lands without disrupting the pipeline it serves.

---

## data quality

**Где:** Room 8 · 2023—present

**Задача:** Automated “fixes” destroy data faster than they clean it.

**Построено:** Data-quality governance across the CRM and its inbound systems: field authority, identity confidence, duplicate policy, exception queues — and three write rules applied everywhere: a name is corrected only when the surname differs, title and email fill only empty fields, everything else that merely differs goes to a human.

**Результат:** Tools that improve data without ever silently overwriting a person's work.

_Ссылка на демо:_ `#/p/buckets`

---

## pagination

**Где:** every integration

**Задача:** Every API pages differently, and half of them lie about it.

**Построено:** Resumable high-volume processing: pre-built page lists with completion flags on platforms without loops, durable progress, provider ceilings respected, duplicate-safe replay and partial-run recovery.

**Результат:** An interrupted run continues where it stopped instead of starting over.

---

## Azure DevOps

**Где:** client work

**Задача:** Some clients live in Azure, and the release discipline has to come to them.

**Построено:** Delivery inside the client's toolchain: repositories, boards, pipelines, approvals and release traceability, with the same gates applied.

**Результат:** Process portability: the discipline is mine, the toolchain is theirs.

---

## JavaScript

**Где:** since 2019 · daily

**Задача:** UI that must live inside an iframe the platform controls — no build step, no framework, no excuses.

**Построено:** The primary language of 70+ production widgets and the tooling around them: reusable UI architecture, data-heavy interaction, asynchronous workflows, external integrations and defensive execution where the host page is not mine.

**Результат:** Fast, dependency-free, debuggable in the one environment that matters — the CRM's own iframe.

_Ссылка на демо:_ `#/p/event`

```js
// no framework: state → render, events → state
const state = {filter:null, rows:[]};
function render(){ host.innerHTML = table(state); wire(host); }
host.addEventListener("click", e => {
  const chip = e.target.closest("[data-filter]");
  if (chip){ state.filter = chip.dataset.filter; render(); }
});
```

---

## Python

**Где:** Room 8 · recurring

**Задача:** The engineering layer around the CRM: extraction, audits, migrations, classifiers.

**Построено:** Platform extraction and audit tooling, configuration snapshots, dependency analysis, migration and validation pipelines, reconciliation and reporting.

**Результат:** My default language for anything that touches data or the platform in bulk.

_Ссылка на демо:_ `#/p/buckets`

---

## TypeScript

**Где:** tooling · recurring

**Задача:** Internal tooling outlives the week it was written in, and untyped tooling rots fastest.

**Построено:** Typed contracts where my code meets other people's data: the org extraction system, integration services, build automation and test infrastructure.

**Результат:** Tools colleagues can extend without archaeology. Vanilla JS stays where the platform demands it; types live where they pay rent.

---

## SQL

**Где:** since 2019

**Задача:** A migration claim without a query behind it is an opinion.

**Построено:** Validation queries behind migrations, reconciliation checks between systems, data-quality investigation, and reporting that survives “now break it down by…”.

**Результат:** Where a migration is described as verified against reconciliation rules, SQL is what proved it.

---

## Node.js

**Где:** this site & services

**Задача:** The services and tooling around the CRM benefit from sharing a language with the widgets.

**Построено:** Integration services and engineering infrastructure on Node: API orchestration, this site's dataset generator, build pipeline and test harness.

**Результат:** One language across widget, tool and test — less translation, fewer bugs.

_Ссылка на демо:_ `#/p/generator`

---

## HTML

**Где:** daily

**Задача:** Widget UIs that must survive years of change, phone screens and printing.

**Построено:** Durable markup for embedded applications: real tables for data, complex forms, predictable focus order, and structures that scale without special casing.

**Результат:** Interfaces that outlive their first design — the reconciliation tables and the mobile board are that discipline made visible.

---

## CSS

**Где:** daily

**Задача:** The platform gives an iframe; the design system inside it is yours to build.

**Построено:** Styling systems for data-dense CRM interfaces: reusable foundations, responsive layout, state-driven visualisation, theming and mobile adaptation — including the lane layout for overlapping meetings and a ten-colour stage matrix.

**Результат:** Design tokens and grids without a framework tax.

_Ссылка на демо:_ `#/p/board`

---

## Java & Spring Boot

**Где:** Luxoft, Provectus · 2019—20

**Задача:** Two backend years before CRM work: real services, real load.

**Построено:** Production services with REST and OAuth integrations, concurrent booking workflows and transactional modelling — background services for a mobile navigation app at Luxoft, the BookMe booking backend at Provectus.

**Результат:** I came to CRM work already knowing what a backend owes its clients.

---

## PostgreSQL

**Где:** Provectus, side tooling

**Задача:** A booking system where many tablets and phones contend for the same rooms.

**Построено:** Relational modelling for high-concurrency access in the BookMe backend, and Postgres behind side tooling since: constraints, transactions, migrations.

**Результат:** Locks and constraints doing the correctness work, not application hope.

---

## AI-assisted development

**Где:** daily since 2024

**Задача:** AI-assisted delivery is easy to demo and hard to ship.

**Построено:** AI inside a governed delivery workflow on the platform: analysis, Deluge and widget implementation, tests, documentation and review, with human ownership of architecture, security and business rules, and nothing generated accepted unverified — source review, deployment through tooling that verifies the round trip by hash, behavioural checks before promotion.

**Результат:** Generation was never the bottleneck; verification is — so the gates decide what ships.

_Ссылка на демо:_ `#/p/code-intelligence`

---

## Claude

**Где:** daily

**Задача:** Generic AI assistance loses the domain: the platform's limits, the org's conventions, the release rules.

**Построено:** A domain-aware Claude Code workflow: custom skills encoding widget patterns and platform limits, MCP for org access, structured stages with review gates.

**Результат:** The assistant starts from our reality — COQL's row ceiling, our versioning rules — rather than from a tutorial.

---

## OpenAI API

**Где:** Room 8 · design & prototyping

**Задача:** “Why did we lose this deal”, answered in free text, is useless for reporting.

**Построено:** Designed and prototyped a two-stage pipeline: ten times more code gathering evidence from six sources than calling the model; stage one is forbidden to analyse and must list the holes in the data; stage two places the case into a 38-cause taxonomy carried in the prompt. A prototype, not a production system.

**Результат:** Comparable, categorised loss reasons — with a human-correctable middle stage.

_Ссылка на демо:_ `#/p/loss-analysis`

---

## embedded CRM features

**Где:** Room 8 · 2024—present

**Задача:** AI features inside a CRM must never leak keys into the browser or act without a trail.

**Построено:** Delivered: server-side recap rephrasing, with no key ever reaching the page. Designed, not shipped: an agent pattern where every action writes time, intent, target and a before-and-after diff to a journal module, with a confirmation screen above a risk threshold.

**Результат:** AI that survives its first disputed edit, because the journal answers who did what.

_Ссылка на демо:_ `#/p/agent-journal`

---

## MCP

**Где:** Room 8 · 2025—present

**Задача:** Assistants need to query an org without being handed the keys to it.

**Построено:** MCP as a controlled access layer: narrowly scoped typed operations over records and the platform tooling around them, explicit permissions, audit logging, and a hard line between reasoning and authorised action. Used by the extraction and audit tooling; as a product surface for salespeople it is an exploration, not production.

**Результат:** Safe, inspectable access — the damage a wrong instruction can do is bounded by a list somebody wrote.

_Ссылка на демо:_ `#/p/mcp-product`

---

## Zoho native AI

**Где:** Room 8 · evaluated

**Задача:** Zia ships in the box; the question is where it actually earns its place.

**Построено:** Evaluated the native features against real workflows, data boundaries and cost, configured them where they fit, and used custom pipelines where they did not.

**Результат:** AI adopted by evidence, not by announcement.

---

## data analysis

**Где:** Room 8 · recurring

**Задача:** Decisions about the estate — what to rebuild, what to retire, where the data goes wrong — need numbers rather than impressions.

**Построено:** Analysis I run myself on the platform's own data: SQL and Python over exports, audit output and reporting datasets; funnel and cohort questions from sales management; data-quality investigations; the evidence layer and taxonomy behind the loss-analysis pipeline. Some of it was a single question answered once, some I owned end to end from the question to the dashboard.

**Результат:** Answers that carry the query behind them — which is also why the audits state their own blind spots.

---

## business analysis

**Где:** Room 8, SoftServe · since 2021

**Задача:** Requests arrive as “add a field” — the real constraint is almost always a process nobody has mapped.

**Построено:** Lead discovery with Sales, BD, Operations and Support: map the current process, find the actual constraint behind the request, define acceptance criteria, and turn the result into a functional design covering data model, access, automation, integration and reporting. Choose deliberately between native configuration, Deluge, a widget, Creator or an external service. Not my trade: on a larger scope I work alongside a business analyst rather than in place of one.

**Результат:** Decisions with named trade-offs instead of accumulated customisation — and a platform that stays explainable.

---

## CRM administration

**Где:** Room 8 · 2023—present · daily

**Задача:** A multi-country CRM where access, layouts and automation drift into chaos unless someone owns the operating model.

**Построено:** Own it end to end: user lifecycle, role hierarchy, least-privilege profiles, module and field permissions, record ownership, sharing rules, layouts, workflows, Blueprints and validation. Access changes are treated as governed platform changes — with their effect on automation, reporting and integrations — not one-off exceptions.

**Результат:** An access model that survives reorgs and audits, and an admin surface a successor could take over from the docs.

---

## UAT & adoption

**Где:** Room 8, SoftServe · since 2021

**Задача:** A deployed change that users route around is a failure with extra steps.

**Построено:** Take changes through acceptance, not just deployment: UAT scenarios defined with process owners, representative test data, coordinated sign-off, release notes and user guidance, training sessions, and hands-on support after launch. Recurring questions feed back into the backlog.

**Результат:** Features that get used — and a platform that becomes easier to operate instead of accumulating workarounds.

---

## governance & controlled change

**Где:** Room 8 · 2023—present

**Задача:** A CRM serving live sales operations cannot absorb uncontrolled change — and cannot freeze either.

**Построено:** Run the change model: intake, prioritisation against business impact and capacity, review gates, traceable releases, rollback paths and post-release verification. Least-privilege access, secrets out of client code and logs, audit trail by design — the same habits that passed AppExchange Security Review.

**Результат:** “No change reaches production unreviewed” as an enforced operating rule — and readiness for regulated environments without claiming compliance projects I have not done.

---

## reports & dashboards

**Где:** Room 8 · 2023—present

**Задача:** Commercial teams need numbers they can argue with — one explainable version of them.

**Построено:** Native CRM reports and dashboards maintained as part of platform administration; the analytical layer in Zoho Analytics where questions cross modules or systems — synced sources, prepared datasets, transformations, analytical SQL, scheduled delivery.

**Результат:** Weekly management decisions run off one number with a traceable path from source to dashboard.

---

## documentation

**Где:** Room 8, Noltic · since 2022

**Задача:** Undocumented platforms die with their author — and consulting work is judged on the paper trail as much as the build.

**Построено:** Documentation at the level the change requires: functional designs and acceptance criteria before build; data maps, field dictionaries and sequence diagrams for integrations; test evidence, release notes, runbooks and rollback steps before production; user guidance after. Versioned with the implementation.

**Результат:** A platform a successor could operate from the docs — which is the honest test of documentation.

---

## stakeholder ownership

**Где:** Room 8 · 2023—present

**Задача:** One engineer, many masters: sales ops, BD, finance, regional teams — all with urgent requests.

**Построено:** Own the delivery queue from intake to production: gather demand, clarify business impact and dependencies, estimate, prioritise against capacity and risk, sequence releases, communicate status, verify outcomes after launch.

**Результат:** Stakeholders who trust the queue because it is visible, argued and predictable — and a roadmap that survives contact with Q4.
