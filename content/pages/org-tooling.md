---
page: "org-tooling"
title: "Building tooling for an org that will not export itself"
type: "write-up (CASES → vCase)"
tab: "zoho"
group: "Platform engineering"
route: "#/p/org-tooling"
kind: "note"
diagrams: 1
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"org-tooling\""
  body_case: "src/app.html · CASES['Platform and tooling'][0]"
---

# Building tooling for an org that will not export itself

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Extraction, a config snapshot, a function audit, an external-call inventory, a credential boundary — five problems, one method.
>
> **Подзаголовок страницы** (`sub`):
> Five problems, one method: when the platform refuses to answer a question, build the instrument that answers it anyway — and say plainly what it still cannot see.

## Extracting the code the platform will not export

No API returns the list of functions — not one; the documented parameter rejects every value, and the CLI exports metadata and widgets, never automation. The fix: a negative result recorded first — fifty-five parameter values and roughly a hundred and fifty endpoint/version/header combinations tried across production, sandbox and the interface domain — then four routes in order: ids harvested from a captured session, a console script under session cookies, a function deployed inside the org that calls the closed endpoint from the inside where authorisation differs, and finally the interface’s own internal call. Fifteen hundred functions in ten to fifteen minutes. The route depends on a browser session that expires in about half an hour and on an internal object the vendor may rename, so it is written up as a reproducible procedure with its failure points named, not a one-off trick.

## A config snapshot in git, standing in for the change history the platform lacks

Half the configuration — schedules, client scripts, buttons, webhooks, connections, approvals, pipelines — sits behind the interface domain with no documented API, each setting on its own unpredictable API version. A twenty-five minute refresh covers modules, layouts, rules, buttons, views, blueprints, schedules, webhooks, connections, roles and profiles; versions were found empirically and pinned, and response diagnostics are written to their own file so it is visible which endpoints answered at all. The snapshot lives in git, and the diff between commits does the job the missing change history would have done — with an explicit list of what still needs a manual export, declared up front rather than discovered later.

## Classifying fifteen hundred functions across five entry points

A function can be reached from a rule, a schedule, a button, a widget, or another function — five channels, none of them linked. One index across all five means every function judged dead carries an explicit trail: not in the rule map, not in schedules, not on a button, not in the widget grep, not called by another function, plus a cycle check among the orphans. Alongside it: buttons deleted without their functions, rules sharing identical criteria, and rules marked active that had never once run because their criteria referenced a renamed field. One class of function was unreachable by the same method — a different identifier namespace, with a one-in-twenty-two name-match rate — so the report opens with a completeness section stating plainly that anything called only from there is misclassified, naming three ways to close the gap. An audit that names the limit of its own method is worth more than one that reads clean.

## Counting every way the org reaches outside

A connection is referenced by a literal string inside a function body — no index, no usage view, nothing that notices when a connection stops authenticating while code keeps calling it. A sweep across every function and widget script normalises each call into a URL pattern, attaches it to its connection and, where one exists, the rule that triggers it, producing a table with a row per service: call volume, distinct files, methods, connections, and the share of calls wrapped in error handling. The findings changed behaviour: a large share of connections turned out never to be used at all; a handful had stopped authenticating and were still being called from hundreds of places, meaning those calls had been failing silently; error-handling coverage across the busiest services was close to zero; and a single shared credential appeared inline in hundreds of files, making rotation a refactor rather than a setting. Shown here running against an invented org of the same shape — the real output is a portrait of somebody else’s security posture.

## Two credentials, and a line drawn between them

The simple key that lets an outside script invoke a server-side function does not work for reading or writing records, or running a query — those need a full authorisation flow, and wrapping every record operation in its own function to dodge that means a new function forever. A single request path handles both, with retries: an authorisation failure clears the cached token and retries, a rate limit respects the interval the server asks for and falls back to bounded backoff, and batch sizes follow the platform’s own limits — a hundred for deletes, ninety for writes, pages of two hundred for reads, no more than a hundred values in a set membership test. Bulk loads pass an empty trigger list, suppressing every rule and state machine for the run — without it, two hundred records fire the whole automation estate and the run becomes unpredictable; legitimate automation has to be caught up separately afterwards, a decision made consciously rather than discovered.

<!-- diagram · authority · вставляется после секции body[4] · источник: CASES · dgs[] -->

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

## See it live

Блок-callout внизу страницы ведёт на `#/p/orghealth` — Org health report.
