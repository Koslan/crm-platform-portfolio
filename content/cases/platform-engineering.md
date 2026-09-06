---
case: "platform-engineering"
num: "06"
title: "Zoho platform engineering"
route: "#/zoho/platform-engineering"
public: true
embed: "orghealth"
examples: ["orghealth"]
notes: ["org-tooling","deluge-cicd","code-intelligence"]
related: ["orchestration","reconciliation"]
words: 1036
source:
  body: "src/cases.js · CASES[5] (slug \"platform-engineering\")"
  furniture: "src/app.html · vCaseStudy()"
---

# 06 · Zoho platform engineering

> **Kicker** (`kicker`): Git · code extraction · dependency analysis · deploy pipeline
>
> **Одной строкой** (`one`): Version control, change history, a dependency audit and a verified deploy pipeline for a platform that offers none of them — an org of more than a thousand functions brought under engineering discipline.

## Summary

- **What:** Tooling around the org itself: extraction of every function into Git, a configuration snapshot in place of the change history the platform does not keep, an index of every function against its five entry channels, and a two-way deploy pipeline that verifies the round trip.
- **Scale:** More than a thousand functions extracted in about a quarter of an hour; a twenty-five-minute configuration snapshot; every function indexed against five entry channels; releases reviewed and one click.
- **My role:** Design and implementation of the tooling, the audit method and the release process; the review standard for other developers’ work.
- **Key topics:** extraction · snapshot in Git · five-channel index · dead-code trail · read-back by hash · release management

## Key facts

| | |
| --- | --- |
| Functions | 1,000+ in the org, all extracted |
| Entry channels | 5 — rule, schedule, button, widget, function |
| Snapshot | 25-minute refresh, in Git |
| Deploy | round trip verified by SHA-256 read-back |
| Release | reviewed, one click, on GitHub Actions |
| Audit | opens with what it cannot see |

## Context

The org shipped with no version control and no change history. Deploy was a person copy-pasting into a browser editor that shows one function at a time, with no search across the codebase. Nobody could say what the org’s functions did, which were dead, or who had changed which rule and when. Syncs failed silently, and a connection that had stopped authenticating kept being called from hundreds of places.

The platform offers no way out of this: no API returns the list of functions — not one — and half the configuration is not exposed to the documented API at all. The work was to build the missing engineering layer around the org rather than inside it.

## Architecture

The pipeline treats the org as a remote that must be read back: discover what exists, snapshot it, analyse dependencies and entry points, lint, save, read back, run, assert, and keep the evidence. The protective model is deliberately narrow — one file, one function, at most one save per run, no wildcards.

<!-- diagram · chain · вставляется после секции body[0] · источник: CASES[5].architecture.dg -->

### Диаграмма — цепочка шагов

_Alt-текст (`aria`, читается скринридером):_ Deploy pipeline: discover, snapshot, analyse, lint, save, read back by hash, test run, evidence — with failure points at discovery, save and read-back

1. **Discover** — ids from the org
   - отказ: session expired
2. **Snapshot** — code + config → Git
3. **Analyse** — 5 entry channels · dependencies
4. **Lint** — one file, one function
5. **Save** — at most one per run
   - отказ: refused
6. **Read back** — independent GET
   - чекпойнт: SHA-256 must match
   - отказ: hash differs
7. **Test run** — with assertions
8. **Evidence** — kept with the commit

**Связи:**
- `discover` → `discover` (branch): four routes, tried in order
- `readback` → `save` (loop): a mismatch fails the delivery

**Пояснения по клику** (`detail`):

- `discover` — **Discover**
  No API lists the functions, so ids are harvested by four routes in order: from a captured session, a console script under session cookies, a function deployed inside the org that calls the closed endpoint from where authorisation differs, and the interface’s own internal call.
  _ссылка: #/p/org-tooling_
- `snapshot` — **Snapshot**
  A twenty-five-minute refresh of modules and layouts, rules, buttons, views, blueprints, schedules, webhooks, connections, roles and profiles, with versions found empirically and pinned. The diff between commits does the job the missing change history would have done.
  _ссылка: #/p/org-tooling_
- `analyse` — **Analyse**
  One index across five entry channels, so every function judged dead carries an explicit trail; plus a cycle check among the orphans, rules sharing identical criteria, and rules that never fired.
  _ссылка: #/p/org-tooling_
- `lint` — **Lint**
  The protective model: one file, one function, at most one save, wildcards forbidden.
- `save` — **Save**
  The reviewed function is pushed back to the org through the two-way pipeline. The editor’s confirmation is not taken as proof.
- `readback` — **Read back**
  Delivery counts as successful only when an independent read returns the same SHA-256 as the reviewed file. The system does not trust the answer “Saved”.
- `run` — **Test run**
  The function is executed with assertions against known inputs, so a delivery is a verified behaviour rather than a text change.
- `evidence` — **Evidence**
  Request and response diagnostics are written to their own files, so it is visible which endpoints answered at all — and the audit report opens with what the method cannot see.
- `rail:discover:discover` — **Four routes**
  Written up as a reproducible procedure with its failure points named, not as a one-off trick: the route depends on a browser session and on an internal object the vendor may rename.
- `rail:readback:save` — **A mismatch fails the delivery**
  If the hash read back differs from the reviewed file, the run stops and reports; nothing is marked delivered.

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "chain",
 "aria": "Deploy pipeline: discover, snapshot, analyse, lint, save, read back by hash, test run, evidence — with failure points at discovery, save and read-back",
 "steps": [
  {
   "id": "discover",
   "n": "Discover",
   "sub": "ids from the org",
   "fail": "session expired"
  },
  {
   "id": "snapshot",
   "n": "Snapshot",
   "sub": "code + config → Git"
  },
  {
   "id": "analyse",
   "n": "Analyse",
   "sub": "5 entry channels · dependencies"
  },
  {
   "id": "lint",
   "n": "Lint",
   "sub": "one file, one function"
  },
  {
   "id": "save",
   "n": "Save",
   "sub": "at most one per run",
   "fail": "refused"
  },
  {
   "id": "readback",
   "n": "Read back",
   "sub": "independent GET",
   "checkpoint": "SHA-256 must match",
   "fail": "hash differs"
  },
  {
   "id": "run",
   "n": "Test run",
   "sub": "with assertions"
  },
  {
   "id": "evidence",
   "n": "Evidence",
   "sub": "kept with the commit"
  }
 ],
 "rails": [
  {
   "from": "discover",
   "to": "discover",
   "kind": "branch",
   "label": "four routes, tried in order",
   "sub": "session ids · console script · inside-org call · interface call"
  },
  {
   "from": "readback",
   "to": "save",
   "kind": "loop",
   "label": "a mismatch fails the delivery"
  }
 ],
 "detail": {
  "discover": {
   "t": "Discover",
   "d": "No API lists the functions, so ids are harvested by four routes in order: from a captured session, a console script under session cookies, a function deployed inside the org that calls the closed endpoint from where authorisation differs, and the interface’s own internal call.",
   "demo": "p/org-tooling"
  },
  "snapshot": {
   "t": "Snapshot",
   "d": "A twenty-five-minute refresh of modules and layouts, rules, buttons, views, blueprints, schedules, webhooks, connections, roles and profiles, with versions found empirically and pinned. The diff between commits does the job the missing change history would have done.",
   "demo": "p/org-tooling"
  },
  "analyse": {
   "t": "Analyse",
   "d": "One index across five entry channels, so every function judged dead carries an explicit trail; plus a cycle check among the orphans, rules sharing identical criteria, and rules that never fired.",
   "demo": "p/org-tooling"
  },
  "lint": {
   "t": "Lint",
   "d": "The protective model: one file, one function, at most one save, wildcards forbidden."
  },
  "save": {
   "t": "Save",
   "d": "The reviewed function is pushed back to the org through the two-way pipeline. The editor’s confirmation is not taken as proof."
  },
  "readback": {
   "t": "Read back",
   "d": "Delivery counts as successful only when an independent read returns the same SHA-256 as the reviewed file. The system does not trust the answer “Saved”."
  },
  "run": {
   "t": "Test run",
   "d": "The function is executed with assertions against known inputs, so a delivery is a verified behaviour rather than a text change."
  },
  "evidence": {
   "t": "Evidence",
   "d": "Request and response diagnostics are written to their own files, so it is visible which endpoints answered at all — and the audit report opens with what the method cannot see."
  },
  "rail:discover:discover": {
   "t": "Four routes",
   "d": "Written up as a reproducible procedure with its failure points named, not as a one-off trick: the route depends on a browser session and on an internal object the vendor may rename."
  },
  "rail:readback:save": {
   "t": "A mismatch fails the delivery",
   "d": "If the hash read back differs from the reviewed file, the run stops and reports; nothing is marked delivered."
  }
 }
}
```

</details>

## Constraints

- **No export** — The documented parameter rejects every value; the CLI exports metadata and widgets, never automation. Fifty-five parameter values and roughly a hundred and fifty combinations of endpoint, version and headers were tried and recorded as a negative result before the working routes were found.
- **Undocumented surfaces** — Schedules, client scripts, buttons, webhooks, connections, approvals and pipelines live behind the interface domain and a session token, each on its own API version.
- **No reverse references** — A function can be reached from a rule, a schedule, a button, a widget or another function. Five channels, five places to look, none of them linked.
- **A browser session** — The extraction route depends on a session that expires in about half an hour and on an internal object the vendor may rename.
- **A “Saved” that cannot be trusted** — The editor’s own confirmation says nothing about what actually landed in the org.

## Implementation

### Extracting what the platform will not export

First, a negative result recorded rather than hidden: fifty-five parameter values and roughly a hundred and fifty combinations of endpoint, API version and headers, across production, sandbox and the interface domain. Then four routes in order — ids harvested from a captured session, a console script running under session cookies, a function deployed inside the org that calls the closed endpoint from the inside where authorisation differs, and finally the interface’s own internal call. More than a thousand functions in ten to fifteen minutes. The route depends on a session that expires in about half an hour, so it is written up as a reproducible procedure with its failure points named.

### A snapshot in place of history

Half the configuration is not exposed to the documented API: schedules, client scripts, buttons, webhooks, connections, approvals, pipelines. A twenty-five-minute refresh covers modules and layouts, rules, buttons, views, blueprints, schedules, webhooks, connections, roles and profiles; versions were found empirically and pinned; response diagnostics go to their own file so it is visible which endpoints answered. The snapshot lives in Git, and the diff between commits answers “who changed which rule and when”. An explicit list of what is not covered is part of the output.

### Classifying every function

One index across all five entry channels, so every function judged dead carries an explicit trail: not found in the rule map, not in schedules, not on a button, not in the widget grep, not called by another function — plus a cycle check among the orphans. Alongside it: buttons deleted without their functions, rules sharing identical criteria, and rules marked active that had never once run because their criteria referenced a renamed field. One class of function is unreachable by the same method — a different identifier namespace, with a name match rate of one in twenty-two — and the report opens with that, listing three ways to close the gap.

### Counting every way the org reaches outside

A connection is referenced by a literal string inside a function body; there is no index, no usage view, and nothing notices when a connection stops authenticating while code keeps calling it. A sweep across every function and widget script normalises each call into a URL pattern, attaches it to its connection and, where one exists, to the rule that triggers it. The result is a table with a row per external service: call volume, distinct files, methods, connections, and the share of calls wrapped in error handling. Connections that were never used, connections that had stopped authenticating and were still called, and a shared credential written inline all came out of that table.

### The two credentials, and the line between them

A simple key lets an outside script invoke a server-side function but cannot read, write or query records; those need the full authorisation flow. The line follows the secret: anything that needs a third-party credential stays inside a server-side function invoked with the simple key, so the credential never leaves the platform; everything that touches records goes over the full flow with the token cached and refreshed a minute before it expires. Batch sizes follow the platform’s own limits — a hundred for deletes, ninety for writes, pages of two hundred for reads.

### From tooling to an operating rule

Sandbox-to-production promotion with review was introduced to an org that had none; the review standard — architecture fit, security, data integrity, platform limits, dependency impact, recovery, test evidence, ownership after release — applies to other developers’ work and to my own on the same terms. Releases are sequenced around live sales operations, staged, announced, reversible, with the risky part shipped behind a flag. Rollback is a revert.

## Reliability and failure handling

Where the tooling can be wrong, and what it does about it.

| When | What the system does |
| --- | --- |
| The browser session expires mid-extraction | The run stops and says so; the route is written up as a reproducible procedure with that failure point named, and is re-run from a fresh session. |
| A function is called from a namespace the index cannot see | The report says so first, not last: the completeness section names the class, the match rate, and three ways to close the gap. |
| The editor says “Saved” and the org disagrees | An independent read compares the SHA-256 with the reviewed file; a mismatch fails the delivery and nothing is marked delivered. |
| A run touches more than it should | It cannot: one file, one function, at most one save per run, wildcards forbidden. |
| An endpoint stops answering after a version change | Response diagnostics are written per endpoint, so the snapshot shows which surfaces went dark instead of silently shrinking. |
| A bulk load fires the whole automation estate | Bulk loads pass an empty trigger list; legitimate automation is caught up separately afterwards, by decision. |

## Data ownership and security

The audit’s real output is a portrait of the org’s security posture — inline credentials, unguarded calls, broken connections — and that is not something to publish. The instrument is what matters, so it is shown here against a generated org of the same shape.

## My responsibility

Design and implementation of the extraction, snapshot, audit and deploy tooling; the audit method and its stated limits; the release process and the review standard applied to every change, including my own.

## Result

Deluge stopped being isolated snippets in text areas and became a codebase: searchable, reviewed, diffed, with dependency and dead-code analysis, and delivered as coordinated multi-function change. “No change reaches production unreviewed” became enforceable rather than aspirational, and release day stopped being an event.

## Interactive example

Встроено: [`orghealth`](../pages/orghealth.md).

## More examples

- [`orghealth`](../pages/orghealth.md) — The audit instrument running against a generated org: reachability, guarded calls, broken connections, rules that never fired — and the blind spot stated first.

## Technical notes

- [`org-tooling`](../pages/org-tooling.md)
- [`deluge-cicd`](../pages/deluge-cicd.md)
- [`code-intelligence`](../pages/code-intelligence.md)

## Related cases

- [`orchestration`](./orchestration.md)
- [`reconciliation`](./reconciliation.md)
