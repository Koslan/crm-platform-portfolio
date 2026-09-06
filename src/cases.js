/* =============================================================
   Public Zoho content: the platform overview, the architecture picture and
   the seven flagship case studies. Data only — the page furniture that draws
   it lives in src/app.html (vZoho, vCaseStudy).

   Every figure here is one that has been confirmed against the source
   material; where the exact number is not publishable it is given as an
   order of magnitude. Nothing here names an employer's org, module, field,
   connection or host — see docs/fidelity-map.md for the rule.
============================================================= */
(function () {
'use strict';

const p = s => '<p>' + s + '</p>';

/* ---------- landing: overview, scale, architecture ---------- */

const OVERVIEW = {
  lede: 'More than three years as the primary engineer and technical owner of a production Zoho CRM at a global '
    + 'game-development services company: sales, business development and regional teams in several '
    + 'countries, an org of more than a thousand functions, and an integration layer around Microsoft '
    + 'Graph, Teams, Jira and Apollo. The work below is the platform as it ran, shown against synthetic data.',
  scale: [
    ['70+', 'production widgets'],
    ['50+', 'custom modules'],
    ['1,000+', 'org functions under Git'],
    ['10+', 'connected systems'],
    ['3+ yrs', 'platform ownership']
  ],
  directions: [
    ['Platform development',
     'Deluge as the daily language: hundreds of functions behind integrations, scheduled jobs and every '
     + 'widget on the platform. Fifty-plus custom modules, with junction, service and journal modules '
     + 'replacing the free-text pseudo-relations the org had accumulated. Workflows, Blueprints and '
     + 'schedules designed as one estate that shares a single quota and a single timeout, so no run nears '
     + 'the ceiling and an interrupted job continues instead of restarting.',
     ['Deluge', 'custom modules', 'workflows', 'Blueprints', 'schedules', 'validation rules']],
    ['Custom interfaces',
     'Seventy-plus production widgets on record pages, related lists, buttons, web tabs, Canvas and the '
     + 'mobile app, assembled from a versioned component and function library. Heavy tables on Tabulator '
     + 'with validated in-cell editing, custom header filters and paging at the platform’s 200-row '
     + 'ceiling; mobile screens that carry their own console, because a phone inside the CRM app has no '
     + 'developer tools.',
     ['Widgets', 'Canvas & mobile', 'Zoho SDK', 'Tabulator', 'JavaScript', 'HTML/CSS']],
    ['Integrations',
     'Microsoft Graph for calendars, mail and identity across seventeen shared mailboxes; Teams for '
     + 'conversations, meetings and Adaptive Card wizards; Jira for two-way comments; Apollo for '
     + 'enrichment; Slack for the integration layer’s own health; Google Calendar events created from '
     + 'the CRM; a server-side email ingestion pipeline. Each contract defines the auth model, the '
     + 'failure classes, the retry policy and the reconciliation rule before the first call is written.',
     ['Microsoft Graph', 'Teams', 'Jira', 'Apollo', 'Slack', 'REST & webhooks', 'OAuth 2.0']],
    ['Data & reliability',
     'COQL as the query surface. A legacy-CRM migration verified against reconciliation rules rather '
     + 'than record counts. Identity resolution with four keys applied in a fixed order. Checkpoints '
     + 'written per page, delta tokens with expiry recovery inside the same run, idempotent writes '
     + 'through markers and journals, and throttling that slows a mailbox instead of failing it.',
     ['COQL', 'migration', 'deduplication', 'idempotency', 'pagination', 'delta tokens', 'retries']],
    ['Platform engineering',
     'Extraction tooling that pulled more than a thousand functions out of a platform with no export '
     + 'into a Git repository; a configuration snapshot standing in for the change history the platform '
     + 'never kept; a five-channel audit of every function’s entry points; a two-way deploy pipeline that '
     + 'verifies the round trip by hash; reviewed, one-click releases on GitHub Actions.',
     ['Git', 'code extraction', 'dependency analysis', 'org audit', 'CI/CD', 'code review']]
  ]
};

const ARCH = {
  kind: 'layers',
  aria: 'Layered architecture: external systems feed integration services, which write into Zoho CRM; automation runs on the CRM, and custom interfaces sit on top of both',
  rows: [
    { id: 'ext', label: 'External systems', nodes: [
      { id: 'graph', n: 'Microsoft Graph', sub: 'calendar · mail · identity' },
      { id: 'teams', n: 'Teams', sub: 'chats · meetings · cards' },
      { id: 'jira', n: 'Jira', sub: 'issues · comments' },
      { id: 'apollo', n: 'Apollo', sub: 'people enrichment' },
      { id: 'slack', n: 'Slack', sub: 'alerts' },
      { id: 'gcal', n: 'Google Calendar', sub: 'events' },
      { id: 'mail', n: 'Email sources', sub: 'ingestion' },
      { id: 'legacy', n: 'Legacy CRM', sub: 'migration' } ] },
    { arrow: 'OAuth 2.0 · pagination · three retry classes · throttling budgets' },
    { id: 'svc', label: 'Integration services', nodes: [
      { id: 'delta', n: 'Calendar delta sync', sub: '17 mailboxes · checkpoint per page' },
      { id: 'threads', n: 'Thread importer', sub: 'text contract · 5 channels a run' },
      { id: 'recap', n: 'Recap pipeline', sub: '7 hops · starts early, nothing waits' },
      { id: 'webhook', n: 'Webhook receiver', sub: 'repairs its own payload' },
      { id: 'enrich', n: 'Enrichment', sub: '4 identity keys, in order' },
      { id: 'recon', n: 'Reconciliation', sub: 'authority map → expected value' } ] },
    { arrow: 'idempotent writes · create and update kept apart · human-authored fields protected' },
    { id: 'crm', label: 'Zoho CRM', core: true, nodes: [
      { id: 'std', n: 'Accounts · Contacts · Deals', sub: 'standard modules, redesigned relations' },
      { id: 'meet', n: 'Meetings · Events', sub: 'lifecycle: booked → held → declined' },
      { id: 'custom', n: '50+ custom modules', sub: 'junction · service · journal' },
      { id: 'state', n: 'Blueprints · validation', sub: 'state machines, refusals with a reason' } ] },
    { arrow: 'rules · schedules · functions' },
    { id: 'auto', label: 'Automation', nodes: [
      { id: 'deluge', n: 'Deluge functions', sub: 'hundreds, under Git' },
      { id: 'wf', n: 'Workflows', sub: 'criteria indexed against execution history' },
      { id: 'sched', n: 'Schedules', sub: 'shared quota · resumable · no overlap' },
      { id: 'bp', n: 'Blueprints', sub: 'controlled transitions' } ] },
    { arrow: 'embedded SDK · COQL · server-side functions' },
    { id: 'ui', label: 'Custom interfaces', nodes: [
      { id: 'widgets', n: '70+ widgets', sub: 'record pages · related lists · web tabs' },
      { id: 'canvas', n: 'Canvas pages', sub: 'full record layouts' },
      { id: 'mobile', n: 'Mobile', sub: 'Canvas mobile detail view' },
      { id: 'cards', n: 'Teams Adaptive Cards', sub: 'a control surface outside the CRM' } ] }
  ],
  detail: {
    graph: { t: 'Microsoft Graph', d: 'Calendars of seventeen shared mailboxes read through delta queries; mail and directory identity for the recap pipeline. Runs on an Entra app registration with least-privilege scopes.', demo: 'zoho/orchestration' },
    teams: { t: 'Microsoft Teams', d: 'Deal conversations imported from channels without a bot, and Adaptive Card wizards that drive a CRM workflow from inside the chat.', demo: 'zoho/teams-crm' },
    jira: { t: 'Jira', d: 'Two-way comment sync between a deal and its issue, made idempotent by a marker inside the comment body; attachments travel as links.', demo: 'zoho/jira-sync' },
    apollo: { t: 'Apollo', d: 'People from an enrichment provider matched against the CRM through four keys in sequence before anything is written.', demo: 'zoho/enrichment' },
    slack: { t: 'Slack', d: 'Each sync classifies its own failures and reports its own health into the channels the team already reads.' },
    gcal: { t: 'Google Calendar', d: 'Events created and viewed from the CRM record, with meeting-overlap prevention and meetings linked to accounts and contracts.' },
    mail: { t: 'Email sources', d: 'A server-side ingestion pipeline: fetched, deduplicated, matched to the right account and deal, attached where sales looks.' },
    legacy: { t: 'Legacy CRM', d: 'A one-way migration: years of records mapped, transformed, validated and loaded with automation suppressed, verified against reconciliation rules.', demo: 'zoho/reconciliation' },
    delta: { t: 'Calendar delta sync', d: 'A checkpoint is written after every page, not at the end of the run, so a run that dies on page forty loses nothing.', demo: 'zoho/orchestration' },
    threads: { t: 'Thread importer', d: 'A text contract in the first message of a thread maps it to a deal; the importer is resumable and takes five channels a run.', demo: 'p/chat-tracker' },
    recap: { t: 'Recap pipeline', d: 'Seven hops from the meeting record to a written recap, started the moment an account is picked so the field is filled before anyone asks.', demo: 'p/chat-recap' },
    webhook: { t: 'Webhook receiver', d: 'Five attempts that read the failing field out of the CRM error and rewrite the payload, because a rejected write is a lost event.', demo: 'p/cross-system/resume' },
    enrich: { t: 'Enrichment', d: 'Four identity keys applied in a fixed order, ending with a normalised profile URL; name matches shown but never blocking.', demo: 'p/enrichment' },
    recon: { t: 'Reconciliation', d: 'A third column — the expected value, computed from an authority map — beside the two sources, and a repair that writes exactly that.', demo: 'p/cross-system/who-owns' },
    std: { t: 'Standard modules', d: 'Relations that lived as free text became junction modules with ownership, lifecycle and validation defined rather than accumulated.' },
    meet: { t: 'Meetings and events', d: 'A meeting is booked, held or declined. Two processes decide which, each authoritative over exactly one question.', demo: 'p/cross-system/who-owns' },
    custom: { t: 'Custom modules', d: 'Fifty-plus custom modules: junctions for many-to-many relations, service catalogues, and journal modules that record what automation did to a record.' },
    state: { t: 'Blueprints and validation', d: 'The sales pipeline as a state machine with per-stage mandatory fields; every refusal names its reason, in the layout, the Blueprint, the workflow or the widget.' },
    deluge: { t: 'Deluge functions', d: 'Hundreds of functions of my own inside an org of more than a thousand, all of them extracted into Git and indexed against their entry points.', demo: 'zoho/platform-engineering' },
    wf: { t: 'Workflows', d: 'The automation estate audited as a whole: rules marked active that had never fired once turned up in the index, because a criterion named a renamed field.' },
    sched: { t: 'Schedules', d: 'Delta syncs, a chat import every ten minutes, a monthly forced resync — partitioned and resumable so that no single run nears the shared ceiling.' },
    bp: { t: 'Blueprints', d: 'Stages, controlled transitions, per-stage mandatory fields and the escape paths that show up in week two.' },
    widgets: { t: 'Widgets', d: 'Seventy-plus production widgets on a versioned component library: contact desks, meeting boards, a solution matrix, reconciliation screens.', demo: 'zoho/widgets' },
    canvas: { t: 'Canvas pages', d: 'Full record pages built in Canvas where the standard layout could not carry the process.' },
    mobile: { t: 'Mobile', d: 'Widgets for the Zoho mobile app, including an on-screen console with a ring buffer, because a phone inside the app has no developer tools.', demo: 'p/board' },
    cards: { t: 'Teams Adaptive Cards', d: 'A CRM workflow driven from Teams: cards as callback subscriptions, so nothing holds a request open while a person thinks.', demo: 'zoho/teams-crm' }
  }
};

/* ---------- the seven cases ---------- */

const CASES = [

/* ===== 01 custom interfaces ===== */
{ slug: 'widgets', num: '01', t: 'Custom CRM interfaces',
  kicker: 'Widgets · Canvas · Mobile · JavaScript',
  one: 'Screens for workflows the standard record page could not carry: target lists of several hundred contacts, room schedules, a service-line matrix, a team cockpit — inside the iframe the platform controls.',
  summary: {
    what: 'Custom interfaces inside Zoho CRM for the workflows standard layouts, subforms and related lists could not support.',
    scale: 'Seventy-plus production widgets across record pages, related lists, buttons, web tabs, Canvas and the mobile app, on one versioned component library.',
    role: 'Design, implementation, the shared library, the offline test stand and production support — as the platform’s primary engineer.',
    topics: ['Embedded SDK', 'COQL paging', 'Tabulator', 'validated inline editing', 'mobile Canvas', 'failure states']
  },
  facts: [
    ['Widgets', '70+ in production'],
    ['Surfaces', 'record page · related list · button · web tab · Canvas · mobile'],
    ['Data layer', 'COQL, 200 rows a page, 14 criteria a query'],
    ['Tables', 'Tabulator with custom header filters'],
    ['Library', 'shared components and functions, versioned'],
    ['Verification', 'offline stand for the SDK, browser tests at phone widths']
  ],
  context: p('Sales at a services company lives in tables the platform cannot draw. A trade show brings a '
      + 'target list of several hundred contacts that has to be triaged, edited and booked against; a '
      + 'client programme is read as a matrix of service lines against business units; a sales lead needs '
      + 'the team’s pipeline, overdue items and legal paperwork on one screen scoped to the person looking '
      + 'at it. The standard record page offers fields, subforms and related lists, and none of those '
      + 'shapes fit. Before the widgets, that work happened in spreadsheet exports.')
    + p('The answer was not one screen but an estate: seventy-plus widgets that share a design system, a '
      + 'component and function library with versioning, and one set of conventions for loading, paging, '
      + 'editing and failing. Each of the examples on this page is one composite screen from that estate.'),
  constraints: [
    ['The iframe', 'A widget is an iframe the CRM loads and initialises through its SDK. It receives the record it sits on and nothing else; the host page, its styles and its navigation are not yours.'],
    ['The query ceiling', 'COQL returns 200 rows a page and accepts fourteen criteria a query. A four-hundred-row target list is three pages by hand; a search over a list of profile URLs is chunked into fourteen-condition slices.'],
    ['Permissions', 'The widget runs as the person looking at it. A screen that shows a manager the team and a salesperson their own work is the same code with the scope resolved at load.'],
    ['Mobile', 'The mobile app loads the same kind of widget on a phone, where there are no developer tools, a narrow viewport and a touch keyboard.'],
    ['Write safety', 'Edits go back into a live org. An in-cell edit is validated before it is sent; a control that behaves like a radio button must never leave the record briefly without an answer.'],
    ['Embedded context', 'The widget must resize with its content, survive a refresh with its filter state intact, and say so when a server-side step cannot be done from a browser.']
  ],
  architecture: {
    text: p('Every widget follows the same path: the record page loads it with the record in context; the '
      + 'widget reads through the embedded SDK — COQL for data, record APIs for writes, connection invokes '
      + 'for anything external — and hands everything heavy, secret or slow to a Deluge service layer. The '
      + 'service layer holds the query patterns, the validation and write rules, the calls to the calendar, '
      + 'the tracker and the enrichment provider, and the model calls whose keys never reach the page.'),
    dg: {
      kind: 'layers',
      aria: 'A record page loads an embedded widget; the widget talks to the Zoho SDK; the SDK reaches a Deluge service layer, which reaches the CRM and external APIs',
      rows: [
        { id: 'rec', label: 'Zoho record', nodes: [
          { id: 'page', n: 'Record page', sub: 'related list · button · web tab' },
          { id: 'mob', n: 'Mobile app', sub: 'Canvas mobile detail view' } ] },
        { arrow: 'iframe, initialised with the record in context' },
        { id: 'w', label: 'Embedded widget', nodes: [
          { id: 'ui', n: 'UI', sub: 'vanilla JS · HTML · CSS' },
          { id: 'tables', n: 'Tables', sub: 'Tabulator, custom header filters' },
          { id: 'lib', n: 'Shared library', sub: 'components and functions, versioned' },
          { id: 'console', n: 'On-screen console', sub: 'mobile, ring buffer' } ] },
        { arrow: 'ZOHO.CRM.API · COQL · connection invokes · resize' },
        { id: 'sdk', label: 'Zoho SDK', nodes: [
          { id: 'coql', n: 'COQL', sub: '200 rows a page' },
          { id: 'rapi', n: 'Record API', sub: 'validated writes' },
          { id: 'fn', n: 'Function invoke', sub: 'server-side work' } ] },
        { arrow: 'anything heavy, secret or external goes server-side' },
        { id: 'svc', label: 'Deluge service layer', nodes: [
          { id: 'q', n: 'Query patterns', sub: 'paging · chunked searches' },
          { id: 'rules', n: 'Validation and write rules', sub: 'every refusal names its reason' },
          { id: 'ext', n: 'External calls', sub: 'calendar · tracker · provider' },
          { id: 'ai', n: 'Model calls', sub: 'keys stay server-side' } ] },
        { id: 'crm', label: 'CRM and external systems', core: true, nodes: [
          { id: 'records', n: 'Records and subforms', sub: 'Zoho CRM' },
          { id: 'apis', n: 'External APIs', sub: 'Graph · Jira · Apollo' } ] }
      ],
      detail: {
        page: { t: 'Record page', d: 'The platform gives an iframe and a query API. Everything else — grid, filters, editing, layout — is hand-built.' },
        mob: { t: 'Mobile app', d: 'The same widget model on a phone. Free/busy is computed from CRM records because personal calendars are unreachable from a browser widget, and the interface says so.', demo: 'p/board' },
        ui: { t: 'UI', d: 'Framework-free: state to render, events to state. No build step, no runtime dependency the host page could collide with.' },
        tables: { t: 'Tables', d: 'Custom header-filter editors (date ranges, “at least N”), in-cell editing, a second horizontal scrollbar synchronised above the table because sales asked for it.', demo: 'p/event' },
        lib: { t: 'Shared library', d: 'Component patterns, service wrappers around the SDK, a common error envelope and one visual language — with versioning and a stated compatibility policy for changing something seventy screens depend on. A version badge in the header says what is running.' },
        console: { t: 'On-screen console', d: 'A 400-line ring buffer capturing errors and unhandled rejections — the only way to read an error on a phone inside the CRM app.', demo: 'p/board' },
        coql: { t: 'COQL', d: 'Dotted lookups across modules, paging at the 200-row ceiling, criteria chunked at fourteen conditions.' },
        rapi: { t: 'Record API', d: 'A write is refused for a missing mandatory field or a value outside a picklist; the widget shows the reason instead of a spinner.' },
        fn: { t: 'Function invoke', d: 'Heavy work runs server-side: free-slot search across rooms and people, provider batches, tracker calls.' },
        q: { t: 'Query patterns', d: 'Reusable read models across modules; the ceilings treated as ordinary constraints rather than discoveries.' },
        rules: { t: 'Validation and write rules', d: 'A booking without a buyer is refused with the reason named; a Lost deal demands its loss reason; a name is corrected only when the surname differs.' },
        ext: { t: 'External calls', d: 'Calendar invitations, tracker comments and provider batches leave from the service layer, never from the page.' },
        ai: { t: 'Model calls', d: 'Recap rephrasing runs server-side so no key is ever in the page; press again to undo.', demo: 'p/board' },
        records: { t: 'Records and subforms', d: 'A subform is replaced wholesale rather than patched row by row — one of the reasons every write path is explicit about what it sends.' },
        apis: { t: 'External APIs', d: 'The calendar, the issue tracker and the enrichment provider — reached through connections the widget never sees.' }
      }
    }
  },
  implementation: [
    ['Common patterns, one library',
     p('Each widget is assembled from the same parts: a loading state that names the real stages of the load '
       + 'rather than spinning; a data layer that pages COQL to the ceiling and merges the pages; filter chips '
       + 'that combine as OR inside a group and AND across groups; a version badge that says which build is '
       + 'running. The parts are versioned together with a stated compatibility policy, so a fix in the '
       + 'library reaches every screen on the next release rather than one screen at a time — and a change '
       + 'to the shared layer is verified on the offline stand before any screen in production sees it. '
       + 'Desktop, Canvas and mobile are three hosts with different space and input; they reuse the same '
       + 'data access, validation and failure behaviour and adapt only the presentation.')],
    ['Large tables',
     p('The target list for a trade show is several hundred rows with nine counters above it, edited in place. '
       + 'Tabulator carries the grid; the header filters — a date range, an “at least N” threshold — are custom '
       + 'editors; status, priority and attendance are edited in the cell and written back through the SDK. '
       + 'Statuses that the system derives from meetings carry a padlock with an explanation instead of being '
       + 'silently overwritten. A second horizontal scrollbar sits above the table, synchronised with the body, '
       + 'because that is where people looked for it.')],
    ['Validated writes and control order',
     p('A booking wizard refuses to continue and says why: no buyer, no room, capacity exceeded. Step four '
       + 'computes free slots from the meetings already in the CRM and names the reason a slot is blocked — '
       + 'the room is taken, or one of our people is already in something. On the employment-history screen '
       + 'exactly one row is the main employer, and moving that pointer is two writes in a fixed order: every '
       + 'other row is unticked first, then the new one is set, so a failure can never leave two rows claiming '
       + 'to be main, and the whole control set is disabled while it runs.')],
    ['Scope and role',
     p('The sales cockpit is not a record but a team: ten tables across three tabs, scoped to everyone, to '
       + 'one person or to you. The platform will not take twenty owners in one query criterion, so the user '
       + 'list is fetched, filtered by role, and records are narrowed after retrieval. The rule that decides '
       + 'what lands in each table — a closing date in the past, a deal above a threshold with no plan linked '
       + '— is printed under the table, because a rule you cannot read is a rule you cannot trust.')],
    ['Mobile',
     p('The meeting board runs on a phone inside the CRM app: a room-by-room day with meetings drawn as '
       + 'blocks whose height is their duration, overlapping meetings split into lanes, a now-line, team load '
       + 'as a share of an eight-hour day, and a bottom sheet that writes a recap back. Two alerts exist that '
       + 'the platform has no concept of — a person in two meetings at once, and a move between places with '
       + 'under fifteen minutes to make it. The screen carries its own console, because there are no '
       + 'developer tools on that surface.')]
  ],
  reliability: {
    intro: 'What the screens do when the platform or the data does not cooperate.',
    rows: [
      ['A query exceeds the 200-row ceiling', 'Pages are requested to the ceiling and merged; the counters recompute against whatever is filtered, including booked hours.'],
      ['A write is refused', 'The widget shows the platform’s reason — a missing mandatory field, a value outside the picklist — next to the control, and leaves the row editable.'],
      ['The second of two dependent writes fails', 'The pointer control unticks first and sets second; a failure on the second write leaves no row claiming to be main rather than two, the error is shown rather than swallowed, and the controls are re-enabled.'],
      ['A server-side step cannot be done from the browser', 'A booked meeting appears marked “not in calendar” — sending the invitation is a server-side job, and the screen says so instead of pretending.'],
      ['An error on a phone', 'The on-screen console keeps the last four hundred lines, including unhandled rejections; the version badge opens it.'],
      ['A subform write', 'A subform is replaced wholesale, so the payload builder lists every row it intends to keep; anything it does not send stops existing, and that is written down next to the write path.']
    ]
  },
  role: p('Primary engineer on the whole estate: information architecture, the component library, every '
    + 'widget on this page and the Deluge functions behind them, the offline stand that stubs the SDK so a '
    + 'change is verified before the org sees it, and the production support afterwards. Requirements '
    + 'were gathered directly with sales operations and business development, and pushed back on where a '
    + 'request would have distorted the data model.'),
  result: p('The record page became the tool people work in. Contact triage that used to need a spreadsheet '
    + 'export happens on the record; a client programme is read as one matrix instead of a report; the '
    + 'team’s pipeline is one screen with its rules printed on it. The library is what made seventy-plus '
    + 'screens sustainable for one small team: a change lands everywhere, and every screen fails the same '
    + 'way — visibly, with a reason.'),
  examples: [
    { id: 'event', note: 'A campaign record with a target list of several hundred contacts, a meeting schedule and the five-step booking wizard.' },
    { id: 'cockpit', note: 'Open value, overdue deals, agreements waiting and tasks past due — for the team or for one person, with the rules printed on the screen.' },
    { id: 'solution', note: 'Service lines against business units, coloured by the latest deal on each cell, with a built-in field guide.' },
    { id: 'board', note: 'A phone-sized schedule with lane layout, team load, a recap sheet and an on-screen console.' },
    { id: 'enrichment', note: 'An account record with its group structure, development plan and the enrichment screen that matches people before writing.' }
  ],
  notes: ['widget-system'],
  related: ['orchestration', 'enrichment'] },

/* ===== 02 orchestration ===== */
{ slug: 'orchestration', num: '02', t: 'Multi-system synchronisation and CRM orchestration',
  kicker: 'Microsoft Graph · Deluge · delta tokens · reconciliation',
  one: 'One business process spread across the CRM, seventeen calendars, mailboxes, meeting providers and the team’s own screens — with the CRM deciding what is current, what to write and when to stop.',
  summary: {
    what: 'Zoho CRM as the orchestration point for a process whose state lives in several external systems at once — calendars, mailboxes, meeting providers, chat — each of which changes independently.',
    scale: 'Seventeen shared mailboxes under delta sync, an event lifecycle from target list to reconciled calendar, a chat import every ten minutes, a monthly forced resync — running unattended for two years.',
    role: 'Architecture, implementation, the reliability model and production support.',
    topics: ['delta tokens', 'checkpoints', 'pagination', 'throttling', 'idempotency', 'identity resolution', 'reconciliation']
  },
  facts: [
    ['Mailboxes', '17, one delta token each'],
    ['Checkpoint', 'written after every page, not per run'],
    ['Error classes', 'three, each with its own reaction'],
    ['Schedules', 'every 10 minutes · monthly full resync'],
    ['Lifecycle', 'booked → held → declined, two processes'],
    ['Alerting', 'each sync reports its own health to Slack']
  ],
  context: p('A meeting at a trade show exists in four places at once. It is booked on a CRM record; it is an '
      + 'invitation in an Outlook calendar; it is a Teams meeting with a join link and, later, a transcript; '
      + 'it is a thread in a chat where the follow-up is discussed. Each of those systems holds part of the '
      + 'state and any of them can change without telling the others: a client declines in the calendar, a '
      + 'salesperson moves the room in the CRM, the meeting runs twenty minutes instead of sixty.')
    + p('The team must not become the integration. Nobody should forward invitations, retype recaps, or '
      + 'work out which system is currently right. The CRM had to become the place where the process is '
      + 'managed: it links the entities across systems, decides which side owns which field, runs the '
      + 'automation that follows a change, never repeats an operation, keeps going after a partial failure, '
      + 'and gives people one screen to see and repair the state.'),
  constraints: [
    ['No background workers', 'Everything periodic runs through scheduled Deluge functions that share one quota and one timeout, and the language has no while loop.'],
    ['No persistent storage for sync state', 'A delta token has to live somewhere between runs; the only place a scheduled function can keep state is a variable written through a connector call.'],
    ['Four sources of change', 'Some events arrive through webhooks, some are polled, some come from a schedule, some are started by a person, and a transcript becomes available only minutes after the meeting.'],
    ['Partial failure is normal', 'A single run can update three systems and be throttled by the fourth. The process cannot be one synchronous transaction.'],
    ['Human input must survive', 'Buyer roles typed by a person, a meeting type, a room note — none of it may be erased by the next automatic resync.']
  ],
  architecture: {
    text: p('Not “Graph to Zoho”. Several systems feed one integration layer that resolves identity, maps fields, '
      + 'pages, retries, checkpoints and reconciles; the layer writes into the CRM domain; automation and '
      + 'functions react to the change; and custom screens give people a view of the state and a way to act '
      + 'on it without leaving the record. The backend integration and the frontend tooling were designed as '
      + 'one system.'),
    dg: {
      kind: 'layers',
      aria: 'External calendars, mail, meeting providers and chat feed an integration and sync layer; the layer writes into the Zoho CRM domain; automation and functions react; a custom interaction layer sits on top',
      rows: [
        { id: 'ext', label: 'External systems', nodes: [
          { id: 'cal', n: 'Calendar', sub: 'Graph · 17 mailboxes' },
          { id: 'mail', n: 'Mail', sub: 'Graph · several sources' },
          { id: 'meet', n: 'Meeting providers', sub: 'Teams · transcripts' },
          { id: 'chat', n: 'Chat', sub: 'Teams channels' },
          { id: 'gcal', n: 'Google Calendar', sub: 'events from the CRM' } ] },
        { arrow: 'webhooks · polling · schedules · user-triggered runs' },
        { id: 'sync', label: 'Integration / sync layer', nodes: [
          { id: 'ident', n: 'Identity resolution', sub: 'record ↔ event ↔ meeting ↔ thread' },
          { id: 'map', n: 'Mapping', sub: 'create and update kept apart' },
          { id: 'page', n: 'Pagination', sub: 'pre-built page list, completion flag' },
          { id: 'retry', n: 'Retry / throttling', sub: 'three error classes' },
          { id: 'idem', n: 'Idempotency', sub: 'markers · journals of event ids' },
          { id: 'cp', n: 'Checkpoints', sub: 'per page' },
          { id: 'recon', n: 'Reconciliation', sub: 'authority map → expected value' } ] },
        { arrow: 'writes that are safe to repeat' },
        { id: 'crm', label: 'Zoho CRM domain', core: true, nodes: [
          { id: 'recs', n: 'Accounts · Contacts · Deals · Events', sub: 'standard modules' },
          { id: 'cust', n: 'Custom modules', sub: 'meetings · participants · journals' },
          { id: 'life', n: 'State / lifecycle', sub: 'booked → held → declined' } ] },
        { arrow: 'rules · schedules · functions' },
        { id: 'auto', label: 'Automation', nodes: [
          { id: 'hourly', n: 'Hourly process', sub: 'booked → held from CRM data' },
          { id: 'monthly', n: 'Monthly process', sub: 'asks the calendar: was it cancelled?' },
          { id: 'rebuild', n: 'Participant rebuild', sub: 'keeps buyer roles' },
          { id: 'alerts', n: 'Health reports', sub: 'to Slack' } ] },
        { arrow: 'one screen over several systems' },
        { id: 'ui', label: 'Custom interaction layer', nodes: [
          { id: 'recap', n: 'Reconciliation screen', sub: 'expected value · repair' },
          { id: 'sched', n: 'Meeting schedule', sub: 'sync state per row' },
          { id: 'wiz', n: 'Booking wizard', sub: 'free/busy from CRM records' },
          { id: 'sheet', n: 'Mobile recap sheet', sub: 'writes back' } ] }
      ],
      detail: {
        cal: { t: 'Calendar', d: 'Seventeen shared mailboxes read through Graph delta queries. Throttling slows a mailbox instead of failing it; an invalid token falls back to a full read in the same run.', demo: 'zoho/orchestration' },
        mail: { t: 'Mail', d: 'A server-side pipeline carries mail out of several sources and mailboxes into the CRM: deduplicated, matched to the account and deal, attached where sales looks.' },
        meet: { t: 'Meeting providers', d: 'A join link becomes an online-meeting id; transcripts appear minutes after the meeting, so nothing in the pipeline waits for them.', demo: 'zoho/teams-crm' },
        chat: { t: 'Chat', d: 'Threads mapped to deals by a text contract in the first message; five channels a run, every ten minutes.', demo: 'zoho/jira-sync' },
        gcal: { t: 'Google Calendar', d: 'Events created and viewed from the CRM, with overlap prevention and meetings linked to accounts and contracts.' },
        ident: { t: 'Identity resolution', d: 'The same meeting has a CRM id, a calendar event id, an online-meeting id and a thread. Each link is stored on the record, so the next run resolves by id rather than by guess.' },
        map: { t: 'Mapping', d: 'Create and update are separated in the payload builder. Several fields are written only on creation so a later sync cannot erase a human edit.', demo: 'p/cross-system/who-owns' },
        page: { t: 'Pagination', d: 'The language has no while loop, so paging walks a pre-built list of page numbers with a completion flag; the schedule calling the function again is the loop.' },
        retry: { t: 'Retry and throttling', d: 'An invalid token: full read in the same run. Throttled: stop the mailbox, keep the checkpoint. A missing item: mark the mailbox skipped. Three classes, three reactions, written down.' },
        idem: { t: 'Idempotency', d: 'A rolling journal of processed event ids on the record, markers inside comment bodies, and create-versus-update semantics — so a run every ten minutes never posts twice.', demo: 'p/cross-system/resume' },
        cp: { t: 'Checkpoints', d: 'Written after every page, not at the end. A run that dies on page forty loses nothing; the next scheduled run continues from the saved page.' },
        recon: { t: 'Reconciliation', d: 'A third column beside the two sources — the expected value, computed from an authority map — and a repair that writes exactly that.', demo: 'zoho/reconciliation' },
        recs: { t: 'Standard modules', d: 'Accounts, contacts and deals carry the links to the external entities; the events module carries the campaign the meetings belong to.' },
        cust: { t: 'Custom modules', d: 'Meetings with a participant subform, journals of what automation did, and the module that carries the sync stage each pipeline reached.' },
        life: { t: 'State and lifecycle', d: 'Booked, held or declined. Declined is final; held is derived from time; only the calendar can say “cancelled”.', demo: 'p/cross-system/who-owns' },
        hourly: { t: 'Hourly process', d: 'Works only from CRM data: computes an end time from start plus duration with two fallbacks and moves a row from booked to held. Cheap, so it can run every hour.' },
        monthly: { t: 'Monthly process', d: 'Authoritative over one question — was this cancelled — and asks the calendar only about rows already marked held, one month per run, capped at a few hundred rows.' },
        rebuild: { t: 'Participant rebuild', d: 'On every calendar update the participant list is rebuilt, and the buyer roles a person typed are restored through a composite key of address and role.', demo: 'p/cross-system/who-owns' },
        alerts: { t: 'Health reports', d: 'Each sync classifies its own failures and reports them to Slack; time-to-notice for a broken sync dropped from days to minutes.' },
        recap: { t: 'Reconciliation screen', d: 'Five sync states, a three-way compare with an Expected column, the rule printed under it, bulk repair with a per-row error log.', demo: 'p/event' },
        sched: { t: 'Meeting schedule', d: 'The Meetings tab of a campaign record carries the sync state of every row next to its time, room and attendees.', demo: 'p/event' },
        wiz: { t: 'Booking wizard', d: 'Free/busy is computed from CRM records — rooms and people — because personal calendars are unreachable from a browser widget, and the interface says so.', demo: 'p/event' },
        sheet: { t: 'Mobile recap sheet', d: 'A recap written on a phone lands on the meeting record; the rephrase runs server-side so no key is in the page.', demo: 'p/board' }
      }
    }
  },
  implementation: [
    ['The event lifecycle',
     p('A target list of contacts is filtered to accounts with no meeting yet. The booking wizard checks '
       + 'who and what is free from the meetings already in the CRM and books; sending the calendar '
       + 'invitation is a server-side step, and the row is marked accordingly until the delta sync brings '
       + 'the calendar’s answer back. From then on the calendar and the CRM disagree in five known ways — '
       + 'in sync, incorrect, outdated, only in the CRM, only in the calendar — and the reconciliation '
       + 'screen shows each row with the value the record should have.')],
    ['Incremental calendar sync',
     p('One delta token per mailbox, kept in a variable written through a connector call. A run walks a '
       + 'pre-built list of page numbers with a completion flag, writes each page to the CRM before '
       + 'requesting the next, and saves the checkpoint after every page. An invalid token is cleared and '
       + 'the run falls back to a full delta in the same execution; throttling stops the mailbox but '
       + 'deliberately leaves the checkpoint alone; a missing item marks the mailbox skipped. Once a month a '
       + 'forced full resync clears the drift that deltas accumulate. Events deleted upstream are counted '
       + 'and logged but not removed, so history attached to deals survives.')],
    ['Deciding the meeting state',
     p('Deciding “held or declined” from the calendar would mean asking it about every meeting every hour. '
       + 'Deciding from the CRM alone would never learn about cancellations. So two processes, each '
       + 'authoritative over exactly one thing: an hourly one that works from CRM data and moves rows from '
       + 'booked to held, and a monthly one that asks the calendar about rows already held, walks one month '
       + 'per run and marks a cancelled flag or a missing event as declined. Declined is final and neither '
       + 'process touches it.')],
    ['Keeping what a person typed',
     p('Every calendar update rebuilds the participant list — internal people against the staff '
       + 'directory, external ones against the account’s contacts. The calendar knows nothing about buyer '
       + 'roles, and those are exactly what somebody worked out. Existing participants are read first and '
       + 'indexed by address and role; the rebuild checks all four roles for an existing key before '
       + 'assigning anything, and a second pass maps the old spelling of the roles onto the new one so '
       + 'records created before the picklist was renamed keep their classification.')],
    ['The token layer and the transport',
     p('All outbound calls share one token layer: cached, refreshed a minute before expiry; an '
       + 'authorisation failure clears the cache and retries once, then fails loudly. A rate-limit response '
       + 'is answered with the interval the server asks for, falling back to a linear backoff with a '
       + 'ceiling. Page sizes are lower than the default for heavy calendars — slower runs, but they '
       + 'stopped failing.')]
  ],
  reliability: {
    intro: 'What happens when the run does not follow the happy path.',
    rows: [
      ['Invalid or expired delta token', 'The variable is cleared and the mailbox is re-read in full within the same run; the next run is incremental again.'],
      ['Throttled by the calendar API', 'The mailbox stops for this run; the checkpoint is left where it is; the other sixteen mailboxes continue.'],
      ['Hard function timeout mid-run', 'The pages already written stay written; the saved checkpoint and the mailbox status guarantee the next scheduled run continues from the last completed page.'],
      ['A run repeats over the same data', 'Create and update are separate operations; processed event ids sit in a rolling journal on the record; the second pass finds its own marks and steps over them.'],
      ['A client cancels in the calendar', 'The hourly process cannot see it; the monthly process asks the calendar about held rows and marks the row declined — a cancelled meeting can sit mislabelled for a while, and that cost was taken deliberately.'],
      ['A row locked by the Blueprint', 'The write is refused with a marker inside the response body rather than a status code; those rows are counted as skipped, not as failures, because they are neither.'],
      ['A sync breaks silently', 'It does not: each sync classifies its failures and reports its own health to Slack; the first alert is no longer a salesperson noticing stale data.']
    ]
  },
  security: p('Every Microsoft integration runs on app registrations with permission scopes cut to least '
    + 'privilege and secrets rotated on schedule. Credentials live in the platform’s connections and never '
    + 'appear in code; the bulk loads that suppress automation pass an empty trigger list, and legitimate '
    + 'automation is caught up separately afterwards — a decision made consciously rather than discovered.'),
  role: p('Architecture, implementation, the reliability model and production support, as the platform’s '
    + 'primary engineer. The integration contract with each connected system — auth model, failure classes, '
    + 'retry policy, reconciliation rule — was written down before the first call and kept next to the '
    + 'code.'),
  result: p('Booked meetings reach the CRM within minutes of appearing in a calendar, without anyone '
    + 'forwarding invitations. The syncs recovered from every token failure mode seen in production and ran '
    + 'unattended for two years; a mailbox that breaks reports itself instead of drifting. Disagreements '
    + 'between the calendar and the CRM became a queue to work rather than an argument to have.'),
  examples: [
    { id: 'event', note: 'The Meetings tab and the Calendar sync tab of a campaign record: sync states per row, and the reconciliation table with its Expected column.' },
    { id: 'board', note: 'The same event on a phone, with a recap sheet that writes back to the meeting record.' }
  ],
  notes: [
    { id: 'cross-system', sec: 'who-owns', t: 'Who owns the field?', s: 'Authority, reconciliation, and the human edit that has to survive an automatic resync.' },
    { id: 'cross-system', sec: 'resume', t: 'How does the sync resume?', s: 'Checkpoints, callbacks, and isolating a failure to the system that actually caused it.' }
  ],
  related: ['reconciliation', 'teams-crm'] },

/* ===== 03 teams control surface ===== */
{ slug: 'teams-crm', num: '03', t: 'From meeting data to CRM automation — with Teams as the control surface',
  kicker: 'Adaptive Cards · callbacks · transcripts · AI as one stage',
  one: 'A multi-stage CRM workflow that collects a meeting from several sources, resolves its CRM context, runs a model as one deterministic stage — and is driven from Microsoft Teams without opening the CRM.',
  summary: {
    what: 'A CRM orchestration that turns a held meeting into structured CRM records — account, opportunity, participants with buyer roles, a recap to the corporate standard — and a Teams control interface built on top of it.',
    scale: 'Seven pipeline hops, two transcript sources (Teams transcripts and Krisp) behind one adapter, a two-card wizard in Teams, and a draft ready before the person reaches the card that asks for it.',
    role: 'Architecture and implementation of the CRM side, the transcript pipeline and the Teams flow with its cards.',
    topics: ['orchestration', 'asynchronous callbacks', 'Adaptive Cards', 'score-based matching', 'AI as a stage', 'failure recording']
  },
  facts: [
    ['Pipeline', '7 hops, each failing differently'],
    ['Transcript sources', 'Teams transcripts · Krisp, behind one adapter'],
    ['Thresholds', '40 to link · 60 to copy text'],
    ['Cards', '2, each a callback subscription'],
    ['Loop bound', 'fixed iterations · half an hour'],
    ['Stage', 'recorded on the record itself'],
    ['Write-back', 'each part of the recap to its own field, after a person accepts it']
  ],
  context: p('After a client meeting the useful information is spread out: the recording and its transcript '
      + 'sit with the meeting provider, the participants are in the calendar, the account and the deal are '
      + 'in the CRM, and the follow-up is being discussed in a Teams chat. The recap field on the meeting '
      + 'record stayed empty, because nobody transcribes recordings and nobody retypes what was agreed.')
    + p('The first task was the CRM workflow itself: find the meeting, collect its artefacts from more than '
      + 'one source, resolve the CRM context, turn the transcript into a recap, and write structured '
      + 'results — recap, opportunity, buyers — onto the right records. The second task came later: let a '
      + 'person control that workflow from the Teams conversation where the meeting was already being '
      + 'discussed, without opening the CRM at all.'),
  constraints: [
    ['Delayed availability', 'A transcript appears minutes after a meeting ends, sometimes not at all. The workflow cannot assume the artefact is there when it starts.'],
    ['Two sources, no shared identifier', 'Meetings held in Teams have a Teams transcript; meetings held elsewhere have a Krisp one, with its own identifier, its own clock and its own attendee list. Time is the only shared signal, and it is weak.'],
    ['Cards are not applications', 'An Adaptive Card has no state, cannot fetch more rows, and ends when it is submitted. A person takes minutes to fill it in; the trigger that sent it has seconds.'],
    ['One string, one control', 'A dropdown returns exactly one value; there is no way to carry a flag such as “chosen deliberately” through it.'],
    ['Tenant-level policy', 'Access to transcripts can be switched off for the whole tenant without warning, and did.']
  ],
  architecture: {
    text: p('Teams is not a source of messages copied into the CRM. It is a second front end on a CRM backend: '
      + 'the orchestration lives in Deluge functions and CRM records, the model is one stage inside it, and '
      + 'Teams is where a person sees the state, chooses, and triggers the next step.'),
    dg: {
      kind: 'layers',
      aria: 'Transcript sources and the Teams conversation feed a collection and matching stage; CRM orchestration runs functions, validation, state transitions and a model stage; results land in Zoho CRM and, in parallel, in a Teams control interface whose card actions come back into the orchestration',
      rows: [
        { id: 'eco', label: 'Meeting ecosystem', nodes: [
          { id: 'src-a', n: 'Teams transcripts', sub: 'meetings held in Teams' },
          { id: 'src-b', n: 'Krisp transcripts', sub: 'meetings held elsewhere' },
          { id: 'conv', n: 'Teams conversation', sub: 'where the meeting is discussed' } ] },
        { arrow: 'started the moment an account is picked on the first card' },
        { id: 'collect', label: 'Collection / matching', nodes: [
          { id: 'ident', n: 'Meeting identification', sub: 'join link → online-meeting id' },
          { id: 'find', n: 'Source adapter', sub: 'whichever source owns the meeting' },
          { id: 'part', n: 'Participant matching', sub: 'directory · account contacts' },
          { id: 'ctx', n: 'CRM context', sub: 'account · opportunity · organiser' } ] },
        { id: 'orch', label: 'CRM orchestration', core: true, nodes: [
          { id: 'fns', n: 'Functions', sub: 'pipeline · linking · record creation' },
          { id: 'val', n: 'Validation', sub: 'refusals with a reason' },
          { id: 'stage', n: 'State transitions', sub: 'stage written on the record' },
          { id: 'model', n: 'Model stage', sub: 'captions → recap, to the standard' },
          { id: 'rules', n: 'Business rules', sub: 'buyers · opportunity · account' } ] },
        { cols: [
          { id: 'crm', label: 'Zoho CRM', nodes: [
            { id: 'recs', n: 'Records and state', sub: 'meeting · participants · recap fields · stage' } ] },
          { id: 'tms', label: 'Microsoft Teams', nodes: [
            { id: 'cards', n: 'Adaptive Cards', sub: 'account → recap, opportunity, buyers' },
            { id: 'acts', n: 'User actions', sub: 'search · choose · submit' } ] } ] },
        { back: 'a card action arrives as a new event and re-enters the orchestration' }
      ],
      detail: {
        'src-a': { t: 'Teams transcripts', d: 'For meetings held in Teams: listed through the identity of the organiser and the online-meeting id, then downloaded as captions.' },
        'src-b': { t: 'Krisp transcripts', d: 'For meetings held anywhere else. No identifier in common with the CRM, so a candidate is matched by score: overlap as coverage ratios, a penalty for the duration gap, service hints, addresses lifted from the transcript body, and a gate on the recording owner.', demo: 'p/cross-system/refuse' },
        conv: { t: 'Teams conversation', d: 'The chat where the meeting is discussed is also where the workflow is controlled: a message raises the first card.' },
        ident: { t: 'Meeting identification', d: 'The join link on the CRM record is turned into an online-meeting identifier; the organiser is resolved to a directory identity.' },
        find: { t: 'Source adapter', d: 'Choosing the source is its own step with its own failure modes, not a branch buried inside the recap logic. Everything downstream — the standard, the validation, the write-back — is identical whichever source answered, so a third provider is a change to one step rather than to the workflow.' },
        part: { t: 'Participant matching', d: 'Internal people against the staff directory, external ones against the account’s contacts; buyer roles a person assigned survive the rebuild.', demo: 'p/cross-system/who-owns' },
        ctx: { t: 'CRM context', d: 'The account comes from the first card; the opportunity may belong to a different account, and that choice travels as a marked value.' },
        fns: { t: 'Functions', d: 'A pipeline function — read the meeting, resolve the organiser, resolve the join link, list transcripts, download captions, call the model, write back — beside the functions that create the meeting record and save its linking.', demo: 'p/chat-recap' },
        val: { t: 'Validation', d: 'A draft that comes back missing a required section, or too short to be a recap of anything, is refused with the reason on screen rather than saved short.' },
        stage: { t: 'State transitions', d: 'The stage a pipeline reached is written on the meeting record, so “why is this empty” is answered by the data rather than by a run log.' },
        model: { t: 'Model stage', d: 'One bounded task: captions in, a recap in the corporate standard out — fixed sections, commitments pulled out as action items, a plain factual register. The structure is not the model’s to invent, and the key stays server-side.' },
        rules: { t: 'Business rules', d: 'Buyer roles — economic, technical, user, coach — and the opportunity link are set by the person on the card and by CRM rules, never by the model.' },
        recs: { t: 'Records and state', d: 'Each part of the recap is written to its own CRM field rather than one long note, so the next stage of the deal can be filtered and reported on; the record also carries the linked opportunity, the participants with roles, and the stage the pipeline reached.' },
        cards: { t: 'Adaptive Cards', d: 'Card one chooses the account, with a search loop that reissues the card with fresh results; card two collects the recap, the opportunity and the buyers.', demo: 'p/chat-recap' },
        acts: { t: 'User actions', d: 'Each press is a new event with the conversation and the CRM context resolved from it — minutes after the card was sent, when the function that sent it has long ended.', demo: 'p/cross-system/resume' }
      }
    }
  },
  implementation: [
    ['Part one — the CRM workflow',
     p('The pipeline runs in seven hops inside one server-side function: read the meeting record, resolve '
       + 'the organiser to a directory identity, turn the join link into an online-meeting id, list '
       + 'transcripts, download the captions, call the model, write the recap and the stage back. Separate '
       + 'functions create the meeting record and save its linking. Every hop records the stage it reached on '
       + 'the record, so a half-finished run is visible in the data. The whole chain '
       + 'is started the moment a person picks the account on the first card — long before anyone asks for '
       + 'a recap — and nothing waits for it. Two steps later, when the recap card opens, the field is '
       + 'already filled.')],
    ['Two sources, one adapter',
     p('Meetings held in Teams have a Teams transcript; meetings held anywhere else are covered by Krisp. '
       + 'Choosing the source is its own step with its own failure modes — read the meeting record, resolve '
       + 'the organiser, turn the join link into an online-meeting id, then ask whichever source owns that '
       + 'meeting for its captions — and everything downstream is identical whichever source answered, so a '
       + 'third provider is a change to one step rather than to the workflow.')
     + p('The Krisp side has no identifier in common with the CRM. Matching is a score rather than a '
       + 'boolean: overlap between intervals of unequal length as two coverage ratios with the larger taken, '
       + 'so a meeting nested inside another still scores full; a penalty proportional to the duration gap; '
       + 'modifiers for a service hint and for e-mail addresses lifted from the transcript body and '
       + 'intersected with the attendees; and the strongest signal, the recording owner. Above the score '
       + 'sits a gate: if the owner is known and the best candidate does not contain them, the automatic '
       + 'link is refused. Two thresholds instead of one — the link is written above forty, the text is '
       + 'copied only above sixty — because “I think this is the meeting” and “I am willing to write data '
       + 'into it” are different decisions.')],
    ['AI as one stage, not the workflow',
     p('A recap here is not a summary. The company’s own standard fixes which sections a recap must contain, '
       + 'requires commitments to be pulled out as action items rather than left inside the narrative, and '
       + 'sets the register — plain, factual, no hedging and no commitment nobody made — because these are '
       + 'read by people who were not in the room. The model’s task is bounded to producing that structure '
       + 'from the captions it was handed; the structure itself is not its to invent. A draft that comes back '
       + 'missing a required section, or too short to be a recap of anything, is refused with the reason on '
       + 'screen rather than saved short. Nothing goes from the model straight into the record: the draft '
       + 'returns to the card the person is already looking at, and the save is a deliberate act. Each part '
       + 'is then written to its own CRM field instead of one long note, so the next stage of the deal can '
       + 'be filtered and reported on. Everything structured — the opportunity link, the buyer roles, the '
       + 'account — is set by CRM rules and by the person on the card, never by the model. On the mobile '
       + 'board the rephrase also runs server-side, so no key is ever in a page.')],
    ['Part two — Teams as the control surface',
     p('A card is not a form that waits. The card posts, the function that sent it ends, and the answer '
       + 'arrives minutes later as a new event carrying the conversation and the CRM context. Every human '
       + 'step is therefore a callback subscription rather than a wait. Around the first card sits a loop: '
       + 'the card reports which button was pressed, and if it was a search rather than a submit, the loop '
       + 'reissues the card with fresh results — that is how a search across hundreds of accounts happens '
       + 'inside something that cannot fetch. The loop is bounded by a fixed number of iterations and half '
       + 'an hour, so a forgotten card cannot hold a run open.')],
    ['One action, a chain of functions',
     p('A press on the second card arrives as a new event. The flow resolves the conversation and the '
       + 'meeting record from it, validates the input — a three-word recap is refused with the reason — '
       + 'and writes the recap, the opportunity link and the participants with their buyer roles through '
       + 'the CRM functions, then replaces the card with the new state. When the opportunity already linked to the '
       + 'meeting belongs to a different account, it is shown, kept and saved knowingly: the choice travels '
       + 'as a marked value with a prefix the saving function recognises and strips.')],
    ['What earlier versions got wrong',
     p('The first design edited the previous card in place, which meant tracking message identifiers and '
       + 'lost a race whenever two events arrived close together. Replacing the card costs a little clutter '
       + 'in the chat and removes the whole class of problem. A “back” step was dropped on purpose: it would '
       + 'have meant one loop around both cards and a much larger state machine for a rare action.')]
  ],
  reliability: {
    intro: 'Failure modes and what the system does with each.',
    rows: [
      ['The transcript has not appeared yet', 'The pipeline records the stage it reached and stops; the recap field stays empty with the reason visible on the record, and the card flow continues without it.'],
      ['No transcript in the first source', 'The second source is searched by score; the link is written above forty, the text copied only above sixty; every candidate is kept with its score for a person to review.'],
      ['Several meetings could match', 'If the recording owner is known and the best candidate does not include them, a second pass runs; if nothing qualifies the automatic link is refused rather than guessed.'],
      ['Two accounts among the participants', 'The first card does not choose. It shows both and waits for the person.'],
      ['Transcript access switched off for the tenant', 'Every listing call returns a permission error; the stage is written on the record, so the answer to “why is this empty” is in the data rather than in a run log.'],
      ['A forgotten card', 'The loop around the card is bounded — a fixed number of iterations and half an hour — so nothing holds a run open indefinitely.'],
      ['A draft missing a required section, or too short', 'Refused with the reason on screen rather than saved short; nothing is written until a person accepts a draft that meets the standard.'],
      ['Nobody opens the meeting', 'It gets no recap. The flow cannot run unattended — auditability is bought with somebody’s attention — and a backlog of un-reviewed drafts is ordinary operating reality rather than an edge case.'],
      ['A transient API failure mid-chain', 'Calls into the CRM are short, retried with exponential backoff and do their heavy lifting server-side; the orchestration only sequences.']
    ]
  },
  role: p('Design and implementation of the CRM side — the modules and fields, the pipeline functions, the '
    + 'scoring and the gate, the model stage — and of the Teams flow with its cards and callbacks.'),
  result: p('A held meeting becomes CRM data — a recap in the corporate standard, an opportunity link, '
    + 'participants with buyer roles — without anyone opening the CRM: the conversation where the meeting '
    + 'is discussed is also where the workflow is controlled. The CRM stays the system of record; Teams '
    + 'became a lightweight front end over it. The output is written into fields the business reports on, '
    + 'which is what makes the person-in-the-loop worth its cost. When the transcript route was closed at '
    + 'tenant level, the failure was visible on every affected record the same day, with the stage that '
    + 'failed.'),
  embed: 'chat-recap',
  examples: [
    { id: 'chat-recap', note: 'The two-card flow, walked end to end: pick a message, choose the account, fill the recap, watch the record appear — with a trace of every call.' },
    { id: 'board', note: 'The recap sheet on the mobile board, with a server-side rephrase.' }
  ],
  notes: [
    { id: 'cross-system', sec: 'refuse', t: 'When should automation refuse?', s: 'Score thresholds, ambiguous transcript matches, and the queue a person works instead.' },
    { id: 'cross-system', sec: 'resume', t: 'A two-card wizard in a chat, with nothing held open', s: 'Callback subscriptions instead of waiting, a bounded loop, and one string carrying two meanings.' }
  ],
  related: ['orchestration', 'jira-sync'] },

/* ===== 04 jira ===== */
{ slug: 'jira-sync', num: '04', t: 'Teams → CRM → Jira: one thread, three systems, and who owns what',
  kicker: 'Routing by the thread root · idempotency in two systems · one-way on purpose',
  one: 'A tagged reply in a Teams thread becomes the right Jira comment without re-entry: the thread carries the routing code, the CRM carries routing and delivery state, Jira owns the issue and its visibility — and every ten-minute run is safe to replay.',
  summary: {
    what: 'A sync from Teams channels through Zoho CRM into Jira: threads resolved to deals by a code in their root message, tagged replies posted as public or role-restricted comments, delivery state and idempotency held in the CRM, attachments as links.',
    scale: 'A resumable importer every ten minutes over a channel registry that business users maintain on the deal record; a sync that never posts twice and never guesses a destination.',
    role: 'Architecture, the routing rule, the functions on the CRM side and the operating model.',
    topics: ['thread-root routing', 'CRM as state store', 'idempotency markers', 'restricted comments', 'remote links', 'one-way by design']
  },
  facts: [
    ['Routing', 'a code in the thread’s root message, inherited by every reply'],
    ['Registry', 'which channels to read, on the deal record'],
    ['Idempotency', 'a delivery flag in the CRM and a marker inside the Jira comment'],
    ['Visibility', '#jira public · #jira_private locked to a Jira project role'],
    ['Attachments', 'names as links back to the thread, never uploads'],
    ['Run', 'every 10 minutes · bounded Graph window · resumable']
  ],
  context: p('Deals are discussed in Teams threads and delivered in Jira. Engineering asks what was agreed '
      + 'with the client and the answer is in a chat; sales asks what engineering is doing on the deal and '
      + 'the answer lives in issue comments behind a licence they do not have. None of it reached the deal '
      + 'record, and nobody was going to retype it.')
    + p('Three constraints shaped the design at once. A channel is not a deal — one channel carries several '
      + 'discussions, so any “channel equals deal” rule is wrong on the cases that matter most. Building an '
      + 'app inside the chat client was not going to be approved in a reasonable timescale. And the tracker '
      + 'sits behind a corporate proxy that has opinions about request bodies.'),
  constraints: [
    ['No bot', 'The routing had to work with what people already do: type in a chat window. They will not leave it to fill in a form, so the deal code lives in the thread itself.'],
    ['Time limit and throttling', 'Pulling replies means one call per root message while the platform API throttles; the pauses alone ran to ten and thirteen seconds, and a synchronous call is capped at 120 seconds.'],
    ['The proxy', 'The upload endpoint answers 200 with an empty body through the corporate proxy, and no attachment appears.'],
    ['Visibility', 'The tracker can close a comment to a role but not a file — and the files that needed closing were the ones with rates in them.'],
    ['A sync that runs every ten minutes', 'will eventually run twice over the same data, and one marker is not enough to make that safe.']
  ],
  architecture: {
    text: p('The thread carries its own routing. The CRM holds the registry of which channels to read, resolves '
      + 'each thread to a deal from the code in its root message, stores the messages with their delivery '
      + 'state, and posts the tagged ones to the issue as comments carrying a hidden marker. Jira owns the '
      + 'issue and its visibility; the CRM mirrors the delivery status onto the deal; replies never flow '
      + 'back into the thread.'),
    dg: {
      kind: 'layers',
      aria: 'Teams channels are read through a registry on the deal; threads are resolved to deals by the code in their root message; messages and delivery state are stored in the CRM; tagged replies become idempotent Jira comments; delivery status is mirrored to the deal',
      rows: [
        { id: 'teams', label: 'Microsoft Teams', nodes: [
          { id: 'chan', n: 'Channels', sub: 'listed on the deal record' },
          { id: 'thread', n: 'Thread root', sub: 'carries the routing code' },
          { id: 'replies', n: 'Tagged replies', sub: '#jira · #jira_private' } ] },
        { arrow: 'every 10 minutes · a bounded Graph window · resumable' },
        { id: 'res', label: 'Resolution', nodes: [
          { id: 'block', n: 'Code in the root', sub: 'resolved once per thread' },
          { id: 'deal-id', n: 'Deal match', sub: 'inherited by every reply' },
          { id: 'park', n: 'No code → skipped', sub: 'reported, never guessed' } ] },
        { id: 'crm', label: 'Zoho CRM', core: true, nodes: [
          { id: 'reg', n: 'Channel registry', sub: 'which channels to read at all' },
          { id: 'msgs', n: 'Messages module', sub: 'ids · routing · delivery flag' },
          { id: 'deal', n: 'Deal', sub: 'threads · delivery status' } ] },
        { arrow: 'marker searched before posting · comment, then a one-time reaction' },
        { id: 'jira', label: 'Jira', nodes: [
          { id: 'comment', n: 'Comment', sub: 'public, or locked to a project role' },
          { id: 'link', n: 'Link, not a file', sub: 'names travel, files stay' },
          { id: 'status', n: 'Delivery status', sub: 'mirrored to the deal' } ] },
        { back: 'delivery status returns to the deal; replies never flow back into the thread — one-way on purpose' }
      ],
      detail: {
        chan: { t: 'Channels', d: 'The registry of which channels to read at all lives on the deal record; adding a channel is a business user filling in a field, not an engineer deploying. It says where to look, never which deal a thread belongs to.' },
        thread: { t: 'Thread root', d: 'The first valid code in a thread’s root message is the routing key for every reply beneath it. A code typed only into a reply is not enough — honouring it would mean re-deciding the routing on every message instead of once per thread.', demo: 'p/chat-tracker' },
        replies: { t: 'Tagged replies', d: '#jira makes the resulting comment public; #jira_private restricts it to a Jira project role. An untagged reply is read but never sent anywhere.' },
        block: { t: 'Code in the root', d: 'Nothing is guessed from the text of a conversation; guessing the deal from the body is how a thread lands under the wrong client.' },
        'deal-id': { t: 'Deal match', d: 'Resolved once from the root and inherited by every reply, so a thread whose destination could change halfway does not exist.' },
        park: { t: 'No code → skipped', d: 'A root with no code is skipped and reported, never guessed at.' },
        reg: { t: 'Channel registry', d: 'Reading is bounded to a window of channel activity per run — the platform throttles Graph, and nothing here can afford to re-read everything every ten minutes.' },
        msgs: { t: 'Messages module', d: 'The thread is upserted into the CRM before Jira is touched at all — message ids, routing, delivery state. Jira is never asked what it already has; the CRM already knows.' },
        deal: { t: 'Deal', d: 'The deal record shows its threads and the delivery status — visible on the deal instead of behind a tracker licence.', demo: 'p/chat-tracker' },
        comment: { t: 'Comment', d: 'Before posting, the run searches the issue for a hidden marker; finding one is the whole duplicate check. The comment lands public or locked to a project role, and the source message gets a one-time reaction — proof the exact message reached Jira, not just that a sync ran.' },
        link: { t: 'Link, not a file', d: 'Attachments are never uploaded: only their names travel, as links back to the thread they came from, where the original permission model still applies. The proxy in front of the tracker drops multipart bodies anyway.', demo: 'p/cross-system/resume' },
        status: { t: 'Delivery status', d: 'The tracker is authoritative over its own delivery state; the deal shows it next to the CRM stage, and their disagreement is visible instead of argued about.', demo: 'p/cockpit' }
      }
    }
  },
  implementation: [
    ['Routing belongs to the thread root',
     p('The mapping lives on the thread’s root message, not the channel, because one channel carries '
       + 'several discussions — the channel registry only says which channels to read at all. The first '
       + 'valid code in the root becomes the routing key for every reply beneath it. A code typed into a '
       + 'reply but never into the root is invisible to the router by design: honouring a later message '
       + 'would mean re-deciding the routing on every reply instead of once per thread, and a thread whose '
       + 'destination can change halfway is a thread nobody can audit. A root with no code is skipped and '
       + 'reported, never guessed at.')],
    ['The CRM as the state store',
     p('Each run reads a bounded window of channel activity through Graph rather than a channel’s full '
       + 'history — the platform throttles, and nothing here can afford to re-read everything every ten '
       + 'minutes. A controlled full run once measured 218 seconds against a 120-second ceiling on the '
       + 'synchronous call, which is why the importer is bounded per run and resumable rather than asked to '
       + 'finish in one go. The thread is upserted into the CRM before Jira is touched at all — message ids, '
       + 'routing, delivery state. Jira is never asked what it already has; the CRM already knows.')],
    ['Idempotency in both systems',
     p('A run every ten minutes has to be safe to repeat, and one marker is not enough for that. The CRM '
       + 'holds a delivery flag on the stored message; each posted comment holds a hidden marker in its own '
       + 'body. Before posting, the run searches the issue for that marker, and finding one skips the '
       + 'comment and the acknowledgement together. The two survive different accidents — the CRM flag '
       + 'outlives a deleted Jira comment, the marker outlives a rebuilt CRM row — so the pair is what makes '
       + 'a replay a no-op rather than a second comment. Once a comment lands, the source message gets a '
       + 'one-time reaction: proof the exact message reached Jira, not just that a sync ran.')],
    ['Restricted comments, and the file that cannot be',
     p('A tagged reply becomes a public comment; a privately tagged one is locked to a Jira project role. '
       + 'A file attached to the same issue cannot be locked that way, so attachments are never uploaded: '
       + 'only their names travel, as links back to the thread they came from, where the original '
       + 'permission model still applies. A restricted comment is exactly as private as the tracker’s own '
       + 'role model — a weaker guarantee than the chat thread it was copied out of, and anyone using it '
       + 'should know that before they type.')],
    ['One-way on purpose',
     p('Replies flow from the thread to the issue and never back. Two-way would mean deciding, on every '
       + 'edit, which side is authoritative for a comment both systems now hold, and that question has no '
       + 'good default — only a choice about whose edit gets silently discarded. The cost of refusing it is '
       + 'real: someone who answers on the Jira issue has answered only on the Jira issue, and the thread '
       + 'will not show it. What does come back is the delivery status, which the tracker owns and the deal '
       + 'mirrors next to its own CRM stage.')],
    ['Proving the proxy was the problem',
     p('Localisation by experiment rather than guesswork: downloading from storage works; building a '
       + 'multipart body works and 160 KB leaves in 0.88 seconds, so the bytes do go out; JSON endpoints '
       + 'through the same proxy answer with content, including validation errors. Conclusion: the '
       + 'multipart body is what the proxy loses. A JSON call carrying a link and a stable id passes the '
       + 'proxy, keeps the sync idempotent, and inherits the permissions of the place the file lives.')]
  ],
  reliability: {
    intro: 'What the sync does when the thread, the tracker or the run misbehaves.',
    rows: [
      ['A thread root carries no code', 'Nothing is guessed. The thread is skipped and reported; no reply from it is sent anywhere.'],
      ['A code appears only in a reply', 'Ignored by design: routing is decided once, from the root, so a thread cannot change destination halfway.'],
      ['The run repeats over the same replies', 'The CRM delivery flag and the marker in the existing comment are both found; the comment and the reaction are skipped together.'],
      ['A Jira comment was deleted, or a CRM row rebuilt', 'The other half of the idempotency pair still holds, so a replay is still a no-op rather than a second comment.'],
      ['The run is cut off by the time limit', 'The next run continues from the stored state; a bounded window per run keeps any single run far from the ceiling.'],
      ['A file is attached to a private thread', 'Only its name travels, as a link back to the thread; nothing is uploaded to an issue that cannot restrict it.'],
      ['Someone answers on the Jira issue', 'The thread does not show it. One-way is a stated cost, not an oversight.']
    ]
  },
  security: p('Visibility is decided by the tag and enforced by the tracker: a privately tagged reply becomes a '
    + 'comment locked to a Jira project role, and files never leave the thread whose permission model '
    + 'protects them. The registry on the deal decides what is read at all, and an untagged reply is read '
    + 'but never sent anywhere.'),
  role: p('Architecture and implementation on the CRM side — the routing rule, the messages module and its '
    + 'delivery state, the functions that read, resolve, upsert and post — and the operating model that lets '
    + 'business users maintain the channel registry without a deploy.'),
  result: p('A tagged Teams reply becomes the correct Jira comment without manual re-entry, filed against the '
    + 'right deal, with delivery visible on the deal instead of behind a tracker licence. Every run is safe '
    + 'to replay; missing routing data is skipped rather than guessed.'),
  embed: 'chat-tracker',
  examples: [
    { id: 'chat-tracker', note: 'A Teams thread on one side, the Jira issue it routes to on the other — run the sync twice and watch the second run post nothing.' }
  ],
  notes: [
    { id: 'cross-system', sec: 'resume', t: 'Attachments as links, after proving the proxy was the problem', s: 'A 200 with an empty body, a tracker that cannot restrict a file to a role, and the experiment that localised the fault.' },
    { id: 'cross-system', sec: 'who-owns', t: 'Who owns the field?', s: 'Delivery belongs to the tracker; chat owns nothing.' }
  ],
  related: ['teams-crm', 'widgets'] },

/* ===== 05 enrichment ===== */
{ slug: 'enrichment', num: '05', t: 'Contact enrichment and identity resolution',
  kicker: 'Apollo · four identity keys · deduplication · write rules',
  one: 'People from a provider and from conference exports enter the CRM classified and traceable — or not at all. Four keys in a fixed order, name matches that never block, and write rules that make the tools safe to run twice.',
  summary: {
    what: 'A contact model that joins people and companies many-to-many, the migration of every existing record onto it, and enrichment from an external provider and from event exports wired in so that automation never creates a second copy of a person who is already there.',
    scale: 'Every account through the analysis; hundreds of people imported without creating duplicates; conference exports of several hundred rows sorted into seven outcome buckets; a provider credit spent once.',
    role: 'The contact model and its migration, the identity rules, the write rules and the widgets that expose them.',
    topics: ['identity resolution', 'normalisation', 'deduplication', 'account hierarchy', 'quota-aware batching', 'human review']
  },
  facts: [
    ['Model', 'person ↔ company as a junction: which company, what period, whether current main'],
    ['Identity keys', '4, in a fixed order, last: normalised profile URL'],
    ['Name matches', 'shown, never blocking'],
    ['Search', 'chunked to 14 conditions — the platform ceiling'],
    ['Buckets', '7, two of them worked by a person'],
    ['Write rules', '3, applied everywhere'],
    ['Quota', 'batches sized to the provider, three retry steps']
  ],
  context: p('The same person exists four different ways across two systems. Conference target lists arrive '
      + 'as exports with wrong company names and no shared key with the CRM; the enrichment provider '
      + 'writes profile URLs differently from the CRM; email is missing for many people; a holding keeps '
      + 'its contacts on its subsidiaries. Automated “fixes” destroy data faster than they clean it — every '
      + 'Alex becomes an Alexander, a live title is overwritten by a stale one.')
    + p('The org needed an identity model rather than an import button: which identifier is authoritative, '
      + 'when two records are the same person, when a merge is automatic and when a person decides — '
      + 'enforced the same way across every inbound path.'),
  constraints: [
    ['No shared key', 'Profile URLs are written differently on each side, email is often missing, the company column is regularly wrong, and enrichment names are sometimes mangled.'],
    ['The query ceiling', 'A search over a list of profile URLs is limited to fourteen conditions a query, so the list is searched in chunks.'],
    ['Credits', 'Every provider call costs credits; the CRM must be searched first and the provider asked only when needed.'],
    ['Group structure', 'A contact record stores one company; the client is a group. Existing contacts have to be gathered through the whole account hierarchy, not just the account itself.'],
    ['Two people can share a name', 'A name match is evidence, never proof.']
  ],
  architecture: {
    text: p('Look, then write. Every source passes through the same resolution: normalise, apply the identity '
      + 'keys in order, decide whether the result is a match, a candidate for a person, or a new record — '
      + 'and only then write, under rules that protect what is already there.'),
    dg: {
      kind: 'layers',
      aria: 'Provider results, conference exports and CRM search feed identity resolution; resolution produces a decision — update, create, or human review — and only then writes into the CRM',
      rows: [
        { id: 'src', label: 'Sources', nodes: [
          { id: 'prov', n: 'Enrichment provider', sub: 'people by title, seniority, location' },
          { id: 'export', n: 'Conference export', sub: 'several hundred rows, no key' },
          { id: 'crm-search', n: 'CRM search', sub: 'whole account hierarchy' },
          { id: 'org-match', n: 'Provider organisation', sub: 'the account matched first' } ] },
        { arrow: 'normalise: profile URL, email, name, company' },
        { id: 'res', label: 'Identity resolution', nodes: [
          { id: 'keys', n: 'Four keys, in sequence', sub: 'each applied when the previous found nothing' },
          { id: 'url', n: 'Normalised profile URL', sub: 'the last key' },
          { id: 'tie', n: 'Tie-break', sub: 'account first, then email' },
          { id: 'hier', n: 'Account hierarchy', sub: 'existing contacts gathered through the group' },
          { id: 'name', n: 'Name', sub: 'shown, never blocking' } ] },
        { arrow: 'a classification, not a match' },
        { id: 'dec', label: 'Decision', nodes: [
          { id: 'matched', n: 'Matched', sub: 'fill empty fields only' },
          { id: 'new', n: 'New person', sub: 'create, provider checked first' },
          { id: 'amb', n: 'Ambiguous', sub: 'worked by a person, candidates attached' },
          { id: 'unres', n: 'Unresolved', sub: 'left for a person' } ] },
        { arrow: 'three write rules' },
        { id: 'crm', label: 'Zoho CRM', core: true, nodes: [
          { id: 'contacts', n: 'Contacts', sub: 'one record per person' },
          { id: 'emp', n: 'Employment history', sub: 'many-to-many, one main employer' },
          { id: 'accts', n: 'Accounts', sub: 'group structure' } ] }
      ],
      detail: {
        prov: { t: 'Enrichment provider', d: 'Filtered by title, seniority and location, loaded in pages; batches sized to the provider’s quota with three retry steps. The right lane waits, because provider calls cost credits.', demo: 'p/enrichment' },
        export: { t: 'Conference export', d: 'Several hundred rows with no shared key and half the company names wrong — sorted into buckets rather than matched.', demo: 'p/cross-system/refuse' },
        'crm-search': { t: 'CRM search', d: 'Existing contacts are gathered through the account hierarchy, not just the account itself: a holding keeps its people on the subsidiaries, and a person who moved to a sister company is still the same person.' },
        'org-match': { t: 'Provider organisation', d: 'The account itself is matched to a provider organisation before any person under it is, so people are searched under the right company rather than by name across the provider.', demo: 'p/enrichment' },
        keys: { t: 'Four keys, in sequence', d: 'Duplicates are caught by four keys applied in a fixed order; each is tried only when the previous one found nothing, and the order is the same on every run.' },
        url: { t: 'Normalised profile URL', d: 'Trailing slashes, protocol and an appended numeric suffix are removed before comparison, because the same person is written four ways across two systems. On an export the lookup runs on the slug with a path anchor.' },
        tie: { t: 'Tie-break', d: 'Tie-breakers run in a fixed order — account first, then email — and if none resolves it, the row goes to ambiguous with the candidates attached rather than taking the first.' },
        hier: { t: 'Account hierarchy', d: 'Existing contacts are gathered through the account hierarchy, not just the account itself: a holding keeps its people on the subsidiaries.' },
        name: { t: 'Name', d: 'Name matches are shown but never block, since two people do share a name.', demo: 'p/enrichment' },
        matched: { t: 'Matched', d: 'Title and email are filled only into an empty field, never over a live value.' },
        new: { t: 'New person', d: 'Created only after the CRM has been searched and the provider checked; a red counter on the card means an exact profile match already exists and the button is disabled.', demo: 'p/enrichment' },
        amb: { t: 'Ambiguous', d: 'The tool deliberately does not push for full automation: no candidate resolves, so the row goes to a person with the candidates attached.' },
        unres: { t: 'Unresolved', d: 'Nothing matched at all; left for a human rather than guessed.' },
        contacts: { t: 'Contacts', d: 'One record per person, with the identity that matched recorded alongside.' },
        emp: { t: 'Employment history', d: 'A role is a record in its own right — which company, over what period, and whether it is the current main one — so “who do we know across this group” has an answer that does not depend on which subsidiary somebody typed on the day.', demo: 'p/contact-model' },
        accts: { t: 'Accounts', d: 'Group structure as real relations rather than text, so “which people belong to this group” is a query.' }
      }
    }
  },
  implementation: [
    ['A junction, not a bigger text field',
     p('A contact record stores one company. That is fine until the client is a group: somebody holds a '
       + 'role at the parent, a second at a subsidiary, and a history at a third acquired two years ago. '
       + 'Years of records made situationally had settled on creating a second person to carry that history, '
       + 'so duplicates concentrated precisely where the money is — on the multi-entity accounts — and '
       + 'enrichment credits were spent on identities the CRM already held. The person and the company '
       + 'became separate identities joined through a junction module, so a role is a record in its own '
       + 'right: which company, over what period, and whether it is the current main one. Employment '
       + 'history can be queried rather than read.')],
    ['Migrating records that were already wrong',
     p('Every existing record had to move onto the model, and none of them were clean when they moved, so '
       + 'the migration was a reconciliation rather than a copy. Candidates were gathered across the whole '
       + 'account hierarchy instead of the single account, then matched on ordered evidence — authoritative '
       + 'identifiers first, normalised contact evidence next, a normalised profile URL last — and anything '
       + 'that could not be proved was left for a person rather than merged on a likelihood. The asymmetry '
       + 'is deliberate: a surviving duplicate is visible and irritating, while a wrong merge quietly '
       + 'destroys somebody’s history and leaves no trace that it happened.')],
    ['Four keys, in order',
     p('Duplicates are caught by four keys applied in sequence, the last being a normalised profile URL. '
       + 'Normalisation strips the protocol, trailing slashes and an appended numeric suffix, because the '
       + 'same person is written four different ways across two systems. On a conference export the lookup '
       + 'runs on the slug with a path anchor, so an extended slug and a trailing slash both still hit while '
       + 'the anchor stops a slug matching in the middle of somebody else’s address. Tie-breakers run in a '
       + 'fixed order — account first, then email — and when none resolves it the row goes to ambiguous '
       + 'with the candidates attached, never to the first candidate.')],
    ['Buckets instead of matches',
     p('A conference export is not matched; it is classified, and each bucket is worked independently: '
       + 'matched by profile; matched but the account disagrees; matched by email or name; needs '
       + 'enrichment; created from enrichment; ambiguous; unresolved. The last two are worked by a person. '
       + 'The tool deliberately does not push for full automation, because the cost of a wrong merge is a '
       + 'person filed under the wrong company for years.')],
    ['The three write rules',
     p('A name is corrected only when the surname differs, because otherwise every Alex becomes an '
       + 'Alexander. Title and email are filled only into an empty field and never over a live value. '
       + 'Everything else that merely differs is reported for a human to look at. Those three rules are what '
       + 'make the tools safe to run twice, and they are applied in every inbound path, not only here.')],
    ['Identity before enrichment: a credit spent once',
     p('A model is only worth having if every route obeys it. Identity resolution runs before creation on '
       + 'every inbound path, and enrichment runs only after resolution — so a provider credit is spent once, '
       + 'on a person the CRM has established it does not know. The account itself is matched to a provider '
       + 'organisation before any person under it is searched; batches are sized to the provider’s quota '
       + 'with three retry steps. Ambiguous matches stay visible as ambiguous instead of being settled by '
       + 'whichever integration happened to run last, and a new integration does not get to arrive with its '
       + 'own private definition of a duplicate.')]
  ],
  reliability: {
    intro: 'How the tools behave on the data that actually arrives.',
    rows: [
      ['Same person, different profile URL spelling', 'Normalised before comparison; recovered matches are counted separately in the statistics strip so the effect of the rule is visible.'],
      ['Two people with the same name', 'Shown as amber, never blocking; the profile URL decides, or a person does.'],
      ['The provider throttles', 'Batches are sized to the provider’s quota and retried in three steps.'],
      ['A live title would be overwritten', 'It is not: title and email fill empty fields only; the difference is reported.'],
      ['A row cannot be resolved', 'It lands in ambiguous or unresolved with its candidates attached; the import continues with the rest.'],
      ['The tool is run a second time', 'Safe by construction: the write rules only fill empty fields and only create what no key matched, so a second pass writes nothing new.']
    ]
  },
  role: p('The contact model and the migration of every existing record onto it; the identity model — which '
    + 'identifier is authoritative, when records merge automatically, when a human decides — the matching '
    + 'and write rules, and the widgets that expose them on the account and contact records. Enforced across '
    + 'every inbound integration, not only the enrichment path.'),
  result: p('Every account went through the analysis, and new contacts now arrive through the same identity '
    + 'rules: hundreds of people imported without creating duplicates, tools that are safe to run twice by '
    + 'construction, and a provider credit spent once. The relationship layer is real complexity that every '
    + 'widget, report and integration has to understand — taken deliberately, because the simplicity it '
    + 'replaced existed only in the schema while users carried the cost as duplicates and lost history.'),
  embed: 'enrichment',
  embedTab: 'Contact enrichment',
  examples: [
    { id: 'enrichment', note: 'The account record: group structure, development plan, the enrichment screen with its statistics strip, and the provider link matched before any person under it.' }
  ],
  notes: [
    'contact-model',
    { id: 'cross-system', sec: 'refuse', t: 'Sorting a conference export into buckets', s: 'Classification instead of matching, with two of seven buckets worked by a person.' }
  ],
  related: ['reconciliation', 'widgets'] },

/* ===== 06 platform engineering ===== */
{ slug: 'platform-engineering', num: '06', t: 'Zoho platform engineering',
  kicker: 'Git · code extraction · dependency analysis · deploy pipeline',
  one: 'Version control, change history, a dependency audit and a verified deploy pipeline for a platform that offers none of them — an org of more than a thousand functions brought under engineering discipline.',
  summary: {
    what: 'Tooling around the org itself: extraction of every function into Git, a configuration snapshot in place of the change history the platform does not keep, an index of every function against its five entry channels, and a two-way deploy pipeline that verifies the round trip.',
    scale: 'More than a thousand functions extracted in about a quarter of an hour; a twenty-five-minute configuration snapshot; every function indexed against five entry channels; releases reviewed and one click.',
    role: 'Design and implementation of the tooling, the audit method and the release process; the review standard for other developers’ work.',
    topics: ['extraction', 'snapshot in Git', 'five-channel index', 'dead-code trail', 'read-back by hash', 'release management']
  },
  facts: [
    ['Functions', '1,000+ in the org, all extracted'],
    ['Entry channels', '5 — rule, schedule, button, widget, function'],
    ['Snapshot', '25-minute refresh, in Git'],
    ['Deploy', 'round trip verified by SHA-256 read-back'],
    ['Release', 'reviewed, one click, on GitHub Actions'],
    ['Audit', 'opens with what it cannot see']
  ],
  context: p('The org shipped with no version control and no change history. Deploy was a person copy-pasting '
      + 'into a browser editor that shows one function at a time, with no search across the codebase. '
      + 'Nobody could say what the org’s functions did, which were dead, or who had changed which rule and '
      + 'when. Syncs failed silently, and a connection that had stopped authenticating kept being called '
      + 'from hundreds of places.')
    + p('The platform offers no way out of this: no API returns the list of functions — not one — and half '
      + 'the configuration is not exposed to the documented API at all. The work was to build the missing '
      + 'engineering layer around the org rather than inside it.'),
  constraints: [
    ['No export', 'The documented parameter rejects every value; the CLI exports metadata and widgets, never automation. Fifty-five parameter values and roughly a hundred and fifty combinations of endpoint, version and headers were tried and recorded as a negative result before the working routes were found.'],
    ['Undocumented surfaces', 'Schedules, client scripts, buttons, webhooks, connections, approvals and pipelines live behind the interface domain and a session token, each on its own API version.'],
    ['No reverse references', 'A function can be reached from a rule, a schedule, a button, a widget or another function. Five channels, five places to look, none of them linked.'],
    ['A browser session', 'The extraction route depends on a session that expires in about half an hour and on an internal object the vendor may rename.'],
    ['A “Saved” that cannot be trusted', 'The editor’s own confirmation says nothing about what actually landed in the org.']
  ],
  architecture: {
    text: p('The pipeline treats the org as a remote that must be read back: discover what exists, snapshot it, '
      + 'analyse dependencies and entry points, lint, save, read back, run, assert, and keep the evidence. '
      + 'The protective model is deliberately narrow — one file, one function, at most one save per run, '
      + 'no wildcards.'),
    dg: {
      kind: 'chain',
      aria: 'Deploy pipeline: discover, snapshot, analyse, lint, save, read back by hash, test run, evidence — with failure points at discovery, save and read-back',
      steps: [
        { id: 'discover', n: 'Discover', sub: 'ids from the org', fail: 'session expired' },
        { id: 'snapshot', n: 'Snapshot', sub: 'code + config → Git' },
        { id: 'analyse', n: 'Analyse', sub: '5 entry channels · dependencies' },
        { id: 'lint', n: 'Lint', sub: 'one file, one function' },
        { id: 'save', n: 'Save', sub: 'at most one per run', fail: 'refused' },
        { id: 'readback', n: 'Read back', sub: 'independent GET', checkpoint: 'SHA-256 must match', fail: 'hash differs' },
        { id: 'run', n: 'Test run', sub: 'with assertions' },
        { id: 'evidence', n: 'Evidence', sub: 'kept with the commit' }
      ],
      rails: [
        { from: 'discover', to: 'discover', kind: 'branch', label: 'four routes, tried in order', sub: 'session ids · console script · inside-org call · interface call' },
        { from: 'readback', to: 'save', kind: 'loop', label: 'a mismatch fails the delivery' }
      ],
      detail: {
        discover: { t: 'Discover', d: 'No API lists the functions, so ids are harvested by four routes in order: from a captured session, a console script under session cookies, a function deployed inside the org that calls the closed endpoint from where authorisation differs, and the interface’s own internal call.', demo: 'p/org-tooling' },
        snapshot: { t: 'Snapshot', d: 'A twenty-five-minute refresh of modules and layouts, rules, buttons, views, blueprints, schedules, webhooks, connections, roles and profiles, with versions found empirically and pinned. The diff between commits does the job the missing change history would have done.', demo: 'p/org-tooling' },
        analyse: { t: 'Analyse', d: 'One index across five entry channels, so every function judged dead carries an explicit trail; plus a cycle check among the orphans, rules sharing identical criteria, and rules that never fired.', demo: 'p/org-tooling' },
        lint: { t: 'Lint', d: 'The protective model: one file, one function, at most one save, wildcards forbidden.' },
        save: { t: 'Save', d: 'The reviewed function is pushed back to the org through the two-way pipeline. The editor’s confirmation is not taken as proof.' },
        readback: { t: 'Read back', d: 'Delivery counts as successful only when an independent read returns the same SHA-256 as the reviewed file. The system does not trust the answer “Saved”.' },
        run: { t: 'Test run', d: 'The function is executed with assertions against known inputs, so a delivery is a verified behaviour rather than a text change.' },
        evidence: { t: 'Evidence', d: 'Request and response diagnostics are written to their own files, so it is visible which endpoints answered at all — and the audit report opens with what the method cannot see.' },
        'rail:discover:discover': { t: 'Four routes', d: 'Written up as a reproducible procedure with its failure points named, not as a one-off trick: the route depends on a browser session and on an internal object the vendor may rename.' },
        'rail:readback:save': { t: 'A mismatch fails the delivery', d: 'If the hash read back differs from the reviewed file, the run stops and reports; nothing is marked delivered.' }
      }
    }
  },
  implementation: [
    ['Extracting what the platform will not export',
     p('First, a negative result recorded rather than hidden: fifty-five parameter values and roughly a '
       + 'hundred and fifty combinations of endpoint, API version and headers, across production, sandbox '
       + 'and the interface domain. Then four routes in order — ids harvested from a captured session, a '
       + 'console script running under session cookies, a function deployed inside the org that calls the '
       + 'closed endpoint from the inside where authorisation differs, and finally the interface’s own '
       + 'internal call. More than a thousand functions in ten to fifteen minutes. The route depends on a '
       + 'session that expires in about half an hour, so it is written up as a reproducible procedure with '
       + 'its failure points named.')],
    ['A snapshot in place of history',
     p('Half the configuration is not exposed to the documented API: schedules, client scripts, buttons, '
       + 'webhooks, connections, approvals, pipelines. A twenty-five-minute refresh covers modules and '
       + 'layouts, rules, buttons, views, blueprints, schedules, webhooks, connections, roles and profiles; '
       + 'versions were found empirically and pinned; response diagnostics go to their own file so it is '
       + 'visible which endpoints answered. The snapshot lives in Git, and the diff between commits answers '
       + '“who changed which rule and when”. An explicit list of what is not covered is part of the output.')],
    ['Classifying every function',
     p('One index across all five entry channels, so every function judged dead carries an explicit trail: '
       + 'not found in the rule map, not in schedules, not on a button, not in the widget grep, not called '
       + 'by another function — plus a cycle check among the orphans. Alongside it: buttons deleted without '
       + 'their functions, rules sharing identical criteria, and rules marked active that had never once run '
       + 'because their criteria referenced a renamed field. One class of function is unreachable by the '
       + 'same method — a different identifier namespace, with a name match rate of one in twenty-two — and '
       + 'the report opens with that, listing three ways to close the gap.')],
    ['Counting every way the org reaches outside',
     p('A connection is referenced by a literal string inside a function body; there is no index, no usage '
       + 'view, and nothing notices when a connection stops authenticating while code keeps calling it. A '
       + 'sweep across every function and widget script normalises each call into a URL pattern, attaches '
       + 'it to its connection and, where one exists, to the rule that triggers it. The result is a table with '
       + 'a row per external service: call volume, distinct files, methods, connections, and the share of '
       + 'calls wrapped in error handling. Connections that were never used, connections that had stopped '
       + 'authenticating and were still called, and a shared credential written inline all came out of that '
       + 'table.')],
    ['The two credentials, and the line between them',
     p('A simple key lets an outside script invoke a server-side function but cannot read, write or query '
       + 'records; those need the full authorisation flow. The line follows the secret: anything that needs '
       + 'a third-party credential stays inside a server-side function invoked with the simple key, so the '
       + 'credential never leaves the platform; everything that touches records goes over the full flow with '
       + 'the token cached and refreshed a minute before it expires. Batch sizes follow the platform’s own '
       + 'limits — a hundred for deletes, ninety for writes, pages of two hundred for reads.')],
    ['From tooling to an operating rule',
     p('Sandbox-to-production promotion with review was introduced to an org that had none; the review '
       + 'standard — architecture fit, security, data integrity, platform limits, dependency impact, '
       + 'recovery, test evidence, ownership after release — applies to other developers’ work and to my '
       + 'own on the same terms. Releases are sequenced around live sales operations, staged, announced, '
       + 'reversible, with the risky part shipped behind a flag. Rollback is a revert.')]
  ],
  reliability: {
    intro: 'Where the tooling can be wrong, and what it does about it.',
    rows: [
      ['The browser session expires mid-extraction', 'The run stops and says so; the route is written up as a reproducible procedure with that failure point named, and is re-run from a fresh session.'],
      ['A function is called from a namespace the index cannot see', 'The report says so first, not last: the completeness section names the class, the match rate, and three ways to close the gap.'],
      ['The editor says “Saved” and the org disagrees', 'An independent read compares the SHA-256 with the reviewed file; a mismatch fails the delivery and nothing is marked delivered.'],
      ['A run touches more than it should', 'It cannot: one file, one function, at most one save per run, wildcards forbidden.'],
      ['An endpoint stops answering after a version change', 'Response diagnostics are written per endpoint, so the snapshot shows which surfaces went dark instead of silently shrinking.'],
      ['A bulk load fires the whole automation estate', 'Bulk loads pass an empty trigger list; legitimate automation is caught up separately afterwards, by decision.']
    ]
  },
  security: p('The audit’s real output is a portrait of the org’s security posture — inline credentials, '
    + 'unguarded calls, broken connections — and that is not something to publish. The instrument is what '
    + 'matters, so it is shown here against a generated org of the same shape.'),
  role: p('Design and implementation of the extraction, snapshot, audit and deploy tooling; the audit method '
    + 'and its stated limits; the release process and the review standard applied to every change, '
    + 'including my own.'),
  result: p('Deluge stopped being isolated snippets in text areas and became a codebase: searchable, reviewed, '
    + 'diffed, with dependency and dead-code analysis, and delivered as coordinated multi-function change. '
    + '“No change reaches production unreviewed” became enforceable rather than aspirational, and release '
    + 'day stopped being an event.'),
  embed: 'orghealth',
  examples: [
    { id: 'orghealth', note: 'The audit instrument running against a generated org: reachability, guarded calls, broken connections, rules that never fired — and the blind spot stated first.' }
  ],
  notes: ['org-tooling', 'deluge-cicd'],
  related: ['orchestration', 'reconciliation'] },

/* ===== 07 reconciliation ===== */
{ slug: 'reconciliation', num: '07', t: 'Data authority, reconciliation and migration',
  kicker: 'Field authority · expected values · repair workflows · migration',
  one: 'Four systems touch the same meeting. A written rule says which one may be right about which field; a reconciliation screen computes what the record should say; and a migration was verified against the same rules rather than record counts.',
  summary: {
    what: 'A data-authority model across the CRM, the calendar, chat and the issue tracker, the reconciliation tooling that enforces it, and the migration and data-model work that gave the org one authoritative set of records.',
    scale: 'An authority map over every shared meeting field; a reconciliation screen with three matching levels, five sync states and bulk repair; a legacy-CRM migration with automation suppressed and loads verified by rule.',
    role: 'The authority model, the reconciliation tooling, the migration end to end, and the data-model redesign.',
    topics: ['field authority', 'three-way compare', 'repair writes', 'create-only fields', 'migration verification', 'junction modules']
  },
  facts: [
    ['Systems', 'calendar · CRM · chat · issue tracker'],
    ['Rule', 'time → calendar, judgement → CRM, delivery → tracker'],
    ['Matching', '3 levels, 4 in-memory indexes'],
    ['Sync states', '5, with a six-state diff legend'],
    ['Migration', 'Python · Deluge · SQL, automation suppressed'],
    ['Verification', 'reconciliation rules, not record counts']
  ],
  context: p('“Sixty minutes here, forty-five there” does not tell an operator what the record should say. A '
      + 'meeting exists in a calendar, in the CRM, in a chat thread and in an issue; each has a legitimate '
      + 'claim on part of it. Left alone, every sync overwrites the previous one, the last write wins, and '
      + 'the last write is usually a robot — so the humans stop trusting the record.')
    + p('The same question sat under the migration from the legacy CRM: years of records had to arrive as '
      + 'one authoritative set, with a written answer to “why does this field disagree”, and relations '
      + 'that had lived as free text — which business unit, which programme — had to become references '
      + 'that reports and rollups can use.'),
  constraints: [
    ['Ambiguous matching', 'The external identifier is missing on some records, so matching across the two systems is itself uncertain.'],
    ['Length ceilings', 'Two fields cannot be written into the calendar at all because of length limits, and one is truncated.'],
    ['Wholesale subform writes', 'A subform is replaced, not patched; anything not in the array being sent stops existing.'],
    ['Live operations', 'The migration had to land without sales noticing the ground shift, with the automation estate not firing on every loaded record.'],
    ['Two kinds of time', 'System fields are absolute instants; the business fields are wall-clock time in the event’s zone, stored as text, and a browser helper will silently substitute the device zone.']
  ],
  architecture: {
    text: p('The authority map is the mechanism. It says, per field, which system owns the value, which may only '
      + 'supply it, and which may never write it. The payload builder enforces it by keeping create and '
      + 'update apart; the reconciliation screen makes it visible by computing the expected value from both '
      + 'sources plus the map and printing the rule under the comparison.'),
    dg: {
      kind: 'layers',
      aria: 'Calendar and CRM records are matched at three levels; the authority map yields an expected value per field; each row gets a sync state; a repair writes exactly the expected value, with create and update kept apart',
      rows: [
        { id: 'src', label: 'Two sources', nodes: [
          { id: 'cal', n: 'Calendar', sub: 'owns time and attendees' },
          { id: 'crm', n: 'CRM', sub: 'owns judgement' } ] },
        { arrow: 'three matching levels · four in-memory indexes · external id where present' },
        { id: 'match', label: 'Matching', nodes: [
          { id: 'pair', n: 'Paired rows', sub: 'both sides' },
          { id: 'crm-only', n: 'Only in CRM', sub: 'invitation not sent' },
          { id: 'cal-only', n: 'Only in calendar', sub: 'booked outside the CRM' } ] },
        { arrow: 'per field: owner · source · never · create-only' },
        { id: 'auth', label: 'Authority map', core: true, nodes: [
          { id: 'time', n: 'Time', sub: 'calendar' },
          { id: 'judge', n: 'Judgement', sub: 'CRM: type, room note, recap' },
          { id: 'deliv', n: 'Delivery', sub: 'issue tracker' },
          { id: 'chat', n: 'Chat', sub: 'owns nothing' } ] },
        { arrow: 'expected value computed from both sources plus the map' },
        { id: 'state', label: 'Sync state per row', nodes: [
          { id: 'ok', n: 'In sync', sub: '' },
          { id: 'wrong', n: 'Incorrect', sub: 'values differ' },
          { id: 'old', n: 'Outdated', sub: 'calendar moved on' },
          { id: 'nodates', n: 'No dates', sub: '' },
          { id: 'legend', n: 'Diff legend', sub: 'six states' } ] },
        { arrow: 'repair writes exactly the expected value' },
        { id: 'write', label: 'Repair', nodes: [
          { id: 'create', n: 'Create', sub: 'all fields, once' },
          { id: 'update', n: 'Update', sub: 'never the create-only fields' },
          { id: 'bulk', n: 'Bulk', sub: 'progress · per-row error log' } ] }
      ],
      detail: {
        cal: { t: 'Calendar', d: 'The calendar owns time: it is where people accept and move things. It also supplies attendees, but never the meeting type, even though it has an event type of its own.', demo: 'p/cross-system/who-owns' },
        crm: { t: 'CRM', d: 'Judgement belongs to the CRM — a meeting type, a room note, a recap — because a person typed it.' },
        pair: { t: 'Paired rows', d: 'Matched at three levels, with four in-memory indexes and constant-time updates after a single edit.' },
        'crm-only': { t: 'Only in CRM', d: 'A booked meeting whose invitation has not gone out yet — a server-side step, marked as such rather than pretended.' },
        'cal-only': { t: 'Only in calendar', d: 'A meeting booked outside the CRM; shown so it can be adopted rather than silently ignored.' },
        time: { t: 'Time', d: 'Start, end and duration come from the calendar; the CRM is a source, chat and tracker never write them.' },
        judge: { t: 'Judgement', d: 'Meeting type, room note and recap are never overwritten from outside; several fields are written only on creation so a later sync cannot erase a human edit.' },
        deliv: { t: 'Delivery', d: 'The issue tracker is authoritative over its own delivery state; the CRM mirrors it.' },
        chat: { t: 'Chat', d: 'The whole chat column is source or never: chat is where a decision is made in conversation, not where it is stored.' },
        ok: { t: 'In sync', d: 'Both sides agree with the expected value.' },
        wrong: { t: 'Incorrect', d: 'The two sources disagree on a field the map can settle; the Expected column shows the answer.' },
        old: { t: 'Outdated', d: 'The calendar has moved on and the CRM row still shows the earlier time.' },
        nodates: { t: 'No dates', d: 'A row without usable dates on one side; flagged rather than compared.' },
        legend: { t: 'Diff legend', d: 'Six states in the diff view, so a person can see at a glance which side supplied what.', demo: 'p/event' },
        create: { t: 'Create', d: 'All fields, once. Two fields are never written into the calendar because of length ceilings and one is truncated — each exclusion carries its reason next to it.' },
        update: { t: 'Update', d: 'Never the create-only fields, never the meeting type from outside — so a sync cannot erase a human edit.' },
        bulk: { t: 'Bulk', d: 'Bulk operations run with progress and a per-row error log; a row the platform refuses is shown with the platform’s reason.' }
      }
    }
  },
  implementation: [
    ['The map',
     p('Written down as a table, it settles most arguments before they start. Time belongs to the '
       + 'calendar. Judgement belongs to the CRM. Delivery belongs to the tracker. Chat owns nothing. In the '
       + 'payload builder, create and update are separated: two fields are never written at all because of '
       + 'length ceilings, one is truncated, the meeting type is never overwritten from outside, and several '
       + 'fields are written only on creation so a sync cannot erase a human edit. Every exclusion carries '
       + 'its reason next to it.')],
    ['The screen',
     p('Three levels of matching with four in-memory indexes and constant-time updates after a single '
       + 'edit. Beside the two sources, a third column — the expected value — and a diff view with a '
       + 'six-state legend. A status column with five states, bulk operations with progress and a per-row '
       + 'error log. The rule is printed under the comparison, so the person clicking Repair can disagree '
       + 'with it.')],
    ['Two processes, one question each',
     p('Deciding whether a meeting was held or declined from the calendar means asking the calendar about '
       + 'every meeting every hour; deciding from the CRM alone never learns about cancellations. So one '
       + 'cheap hourly process moves rows from booked to held using CRM data, and one expensive monthly '
       + 'process asks the calendar about rows already held and marks cancellations — one month per run, '
       + 'capped at a few hundred rows, with the month a constant in the code so the run is reproducible.')],
    ['The migration',
     p('Source assessment, identity and field mapping, deterministic transformation in Python, Deluge and '
       + 'SQL, load sequencing with automation suppressed — bulk loads pass an empty trigger list — '
       + 'exception handling, and verification against reconciliation rules rather than record counts. The '
       + 'same pass moved years of free-text relations into junction modules: “which deals touch this '
       + 'business unit” is a query now, not a guess.')],
    ['Time follows the event',
     p('One rule: time follows the event, not the device. The offset is derived for the specific date, so '
       + 'daylight saving is included, and the string is assembled by hand; wall-clock text round-trips '
       + 'untouched. For the calendar API a forty-zone dictionary translates Windows zone names, and an '
       + 'unknown name yields null rather than a silent UTC — because the silent version once moved all '
       + 'thirteen meetings of a campaign by three hours with no message anywhere.')]
  ],
  reliability: {
    intro: 'What the tooling does when the two sides disagree, or the write cannot be trusted.',
    rows: [
      ['The external identifier is missing', 'Matching falls back through three levels; unmatched rows appear as only-in-CRM or only-in-calendar rather than being paired by guess.'],
      ['A field is owned by the other system', 'The repair writes the expected value from the owner; a “source” system never overwrites an “owner”.'],
      ['A value would exceed the calendar’s length ceiling', 'Two such fields are never written and one is truncated, by rule, with the reason recorded next to the exclusion.'],
      ['A human edit would be overwritten by a resync', 'Create-only fields are skipped on update; buyer roles are restored through a composite key of address and role.'],
      ['The write result comes back in one of three shapes', 'Success is checked three ways in sequence; a row locked by the state machine is counted as skipped, not failed.'],
      ['A device zone leaks into a business field', 'The zone is pinned once from the event; the lookup stays as a warned fallback and the interface says when it fired.']
    ]
  },
  role: p('The authority model, the reconciliation tooling and its screen, the two lifecycle processes, and '
    + 'the migration end to end — from source assessment to the reconciliation-based verification of the '
    + 'loads. Migration and reconciliation rules were written down and reviewed before the first load.'),
  result: p('Disagreements between systems became a queue to work rather than an argument to have; the '
    + 'repair writes exactly what the record should say, and the rule is on the screen. One authoritative '
    + 'set of records after the migration, and a written answer to “why does this field disagree”.'),
  embed: 'event',
  embedTab: 'Calendar sync',
  examples: [
    { id: 'event', note: 'The Calendar sync tab: five sync states, a three-way compare with the Expected column, and a repair that changes the row’s state.' }
  ],
  notes: [
    { id: 'cross-system', sec: 'who-owns', t: 'Who owns the field?', s: 'Authority, reconciliation, and the human edit that has to survive an automatic resync.' },
    'contact-model'
  ],
  related: ['orchestration', 'enrichment'] }
];

const ABOUT_DEMOS = {
  t: 'About the interactive examples',
  body: [
    ['Synthetic data', 'Every record on these pages belongs to an invented company. No client record, endpoint, credential or internal name from any employer appears anywhere here.'],
    ['No live org', 'Nothing connects to a production system. The screens run in your browser against a stand-in for the platform SDK that answers queries, pages at the platform’s own ceiling and refuses writes for the same reasons the platform does, so the behaviour of production patterns can be shown without production access.'],
    ['Behaviour, not source', 'The examples reproduce how the production interfaces and flows behave — the same rules, the same refusals, the same recovery paths — and are built from the engineering patterns behind them rather than from proprietary code.'],
    ['Drawn shells', 'The chat, tracker and calendar shells are simplified interfaces drawn for these pages. They carry no third-party branding and exist so a flow that crosses several systems can be walked end to end.'],
    ['Failure on purpose', 'Where a page offers a failure switch, it turns on latency, rate limits, rejected writes or expired tokens, so the recovery paths can be clicked rather than described.']
  ]
};

window.ZOHO_PUBLIC = { OVERVIEW, ARCH, CASES, ABOUT_DEMOS };
})();
