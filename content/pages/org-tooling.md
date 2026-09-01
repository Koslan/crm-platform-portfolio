---
page: "org-tooling"
title: "The engineering layer Zoho did not provide"
type: "write-up (CASES → vCase)"
tab: "zoho"
group: "Org tooling, CI/CD, deployment and the external server"
route: "#/p/org-tooling"
kind: "note"
diagrams: 1
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"org-tooling\""
  body_case: "src/app.html · CASES['Platform and tooling'][0]"
---

# The engineering layer Zoho did not provide

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Pull the org into one searchable system, map dependencies and turn browser-only change into reviewed delivery.
>
> **Material labels** (`MAT`): Working internal tool · Architecture write-up
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> Zoho exposes the running platform, but not the complete codebase, dependency graph or change history an engineering team needs. I built the missing layer around it: function extraction, configuration snapshots, dependency and invocation analysis, external-call inventory, Git review, and tools that deploy and run approved functions.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> Five problems, one method: when the platform refuses to answer a question, build the instrument that answers it anyway — and say plainly what it still cannot see.

## One searchable system for the function estate

No API returns the list of functions — not one; the documented parameter rejects every value, and the CLI exports metadata and widgets, never automation. The fix begins with a negative result recorded rather than hidden: fifty-five parameter values and roughly a hundred and fifty endpoint, version and header combinations tried across production, sandbox and the interface domain. Then four routes in order — ids harvested from a captured session, a console script running under session cookies, a function deployed inside the org that calls the closed endpoint from the inside where authorisation differs, and finally the interface’s own internal call. Fifteen hundred functions in ten to fifteen minutes, in one place a person can grep. Everything below depends on the estate existing as text; none of it is reachable from a browser editor showing one function at a time.

## Dependencies and invocation paths

A function can be reached from a workflow rule, a schedule, a button, a widget, or another function — five channels, none of them linked to each other, and no reverse reference anywhere in the platform. One index across all five turns “is this still used?” into a question with an answer and a trail behind it: not in the rule map, not in schedules, not on a button, not in the widget grep, not called by any other function, plus a cycle check so a cluster of orphans calling only each other is not mistaken for live code. The same index answers the question in the other direction — what breaks if this changes — which is the one a reviewer actually needs before approving anything. It also surfaces what nobody was looking for: buttons deleted while their functions stayed behind, rules duplicating each other’s criteria, and rules marked active that had never once run, because a criterion still names a field that was renamed underneath it.

## Git as the missing change history

Half the configuration — schedules, client scripts, buttons, webhooks, connections, approvals, pipelines — sits behind the interface domain with no documented API, each setting on its own unpredictable API version. A twenty-five minute refresh covers modules, layouts, rules, buttons, views, blueprints, schedules, webhooks, connections, roles and profiles; the versions were found empirically and pinned, and response diagnostics are written to their own file so it stays visible which endpoints answered at all. The snapshot lives in git, and the diff between two commits does the job the platform’s absent change history would have done: who altered the criteria on that rule, and the day it stopped firing. What still needs a manual export is listed up front, so a gap in the history is a declared limitation rather than something discovered during an incident.

## Deploy and run after review

Once the estate is text under review, putting it back has to be as controlled as taking it out. Approved functions are deployed and executed through the same tooling instead of being pasted into the browser editor, and a deployment counts as successful only when an independent read returns what was meant to be written — the platform will accept a save and then serve something else, so the write itself is not evidence. Run output is captured against the change that produced it, which makes a failure attributable to a version rather than to a memory. The full pipeline around this — pull, analyse, review, deploy, run, verify — is its own write-up.

## External calls and credential boundaries

A connection is referenced by a literal string inside a function body: no index, no usage view, nothing that notices when a connection stops authenticating while code carries on calling it. A sweep across every function and widget script normalises each outbound call into a URL pattern and attaches it to its connection and, where one exists, the rule that triggers it — one row per service, carrying call volume, distinct files, methods, connections and the share of calls wrapped in error handling. The findings changed behaviour rather than filling a report: a large share of connections turned out never to be used at all; a handful had stopped authenticating and were still being called from hundreds of places, which means those calls had been failing silently; error-handling coverage across the busiest services was close to zero; and one shared credential appeared inline in hundreds of files, which makes rotation a refactor instead of a setting. The boundary drawn afterwards follows the secret rather than the convenience. Anything needing a third-party credential stays inside a server-side function invoked by a simple key, so the credential never leaves the platform; everything that touches records goes over the full authorisation flow, with an authorisation failure clearing the cached token and retrying, a rate limit respecting the interval the server asks for before falling back to bounded backoff, and batch sizes following the platform’s own ceilings — a hundred per delete, ninety per write, pages of two hundred for reads, no more than a hundred values in a single set membership test. Bulk loads pass an empty trigger list, suppressing every rule and state machine for the duration; without it, two hundred records fire the whole automation estate and the run stops being predictable. That suppression has a bill attached — legitimate automation has to be caught up separately afterwards — and it is paid deliberately rather than discovered later.

<!-- diagram · authority · вставляется после секции body[4] · источник: CASES · dgs[0] -->

### Диаграмма — матрица владения

_Alt-текст (`aria`, читается скринридером):_ Ownership matrix: seven operations against a simple invoke key and a full OAuth flow, with the rule the line follows the secret, not the convenience

| Поле | Simple key (function invoke) | Full OAuth flow |
| --- | --- | --- |
| Call a server-side function | ● owner | ▨ never |
| Read records | ▨ never | ● owner |
| Create | ▨ never | ● owner |
| Update | ▨ never | ● owner |
| Delete | ▨ never | ● owner |
| Run a query | ▨ never | ● owner |
| Use a third-party credential | ● owner | ▨ never |

**Правило:** The line follows the secret, not the convenience.

**Пояснения по клику** (`detail`):

- `call-fn:simple` — **Call a server-side function — simple key**
  The simple key that lets an outside script invoke a server-side function.
- `third-party:simple` — **Third-party credential — stays behind the simple key**
  Anything needing a third-party credential stays inside a server-side function and is invoked with the simple key, so the credential never leaves the platform.
- `read:oauth` — **Read — full OAuth flow**
  Create, update, delete, query — everything that touches records goes directly over the full flow from the tool, with the token cached and refreshed a minute before it expires.
- `create:oauth` — **Create — full OAuth flow**
  Batched at ninety per write, following the platform’s own limits.
- `delete:oauth` — **Delete — full OAuth flow**
  Batched at a hundred per delete.
- `query:oauth` — **Query — full OAuth flow**
  No more than a hundred values in a single set membership test.

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "authority",
 "at": 5,
 "aria": "Ownership matrix: seven operations against a simple invoke key and a full OAuth flow, with the rule the line follows the secret, not the convenience",
 "cols": [
  {
   "id": "simple",
   "n": "Simple key (function invoke)"
  },
  {
   "id": "oauth",
   "n": "Full OAuth flow"
  }
 ],
 "rows": [
  {
   "id": "call-fn",
   "n": "Call a server-side function"
  },
  {
   "id": "read",
   "n": "Read records"
  },
  {
   "id": "create",
   "n": "Create"
  },
  {
   "id": "update",
   "n": "Update"
  },
  {
   "id": "delete",
   "n": "Delete"
  },
  {
   "id": "query",
   "n": "Run a query"
  },
  {
   "id": "third-party",
   "n": "Use a third-party credential"
  }
 ],
 "cells": {
  "call-fn:simple": "owner",
  "call-fn:oauth": "never",
  "read:simple": "never",
  "read:oauth": "owner",
  "create:simple": "never",
  "create:oauth": "owner",
  "update:simple": "never",
  "update:oauth": "owner",
  "delete:simple": "never",
  "delete:oauth": "owner",
  "query:simple": "never",
  "query:oauth": "owner",
  "third-party:simple": "owner",
  "third-party:oauth": "never"
 },
 "rule": "The line follows the secret, not the convenience.",
 "detail": {
  "call-fn:simple": {
   "t": "Call a server-side function — simple key",
   "d": "The simple key that lets an outside script invoke a server-side function."
  },
  "third-party:simple": {
   "t": "Third-party credential — stays behind the simple key",
   "d": "Anything needing a third-party credential stays inside a server-side function and is invoked with the simple key, so the credential never leaves the platform."
  },
  "read:oauth": {
   "t": "Read — full OAuth flow",
   "d": "Create, update, delete, query — everything that touches records goes directly over the full flow from the tool, with the token cached and refreshed a minute before it expires."
  },
  "create:oauth": {
   "t": "Create — full OAuth flow",
   "d": "Batched at ninety per write, following the platform’s own limits."
  },
  "delete:oauth": {
   "t": "Delete — full OAuth flow",
   "d": "Batched at a hundred per delete."
  },
  "query:oauth": {
   "t": "Query — full OAuth flow",
   "d": "No more than a hundred values in a single set membership test."
  }
 }
}
```

</details>

## What the audit still cannot prove

One class of function is unreachable by this method: it lives in a different identifier namespace, and matching it by name succeeds about once in twenty-two attempts. Anything called only from there is therefore misclassified, and the report opens with that fact rather than closing with it, naming three ways the gap could be closed. The reachability verdict is honest only inside its own five channels — it is evidence of absence there and nowhere else, so “dead” means no entry point was found among the things this method can see, which is a narrower claim than it looks. The extraction route underneath all of it rests on a browser session that expires in about half an hour and on an internal object the vendor is free to rename, which is why it is written up as a reproducible procedure with its failure points named rather than as a tool that will keep working. An audit that states the limit of its own method is worth more than one that reads clean.

## See it live

Блок-callout внизу страницы ведёт на `#/p/orghealth` — An org audit that names what it cannot see.
