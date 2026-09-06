---
case: "enrichment"
num: "05"
title: "Contact enrichment and identity resolution"
route: "#/zoho/enrichment"
public: true
embed: "enrichment"
examples: ["enrichment"]
notes: ["contact-model","cross-system/refuse"]
related: ["reconciliation","widgets","ai-workflows"]
words: 1004
source:
  body: "src/cases.js · CASES[4] (slug \"enrichment\")"
  furniture: "src/app.html · vCaseStudy()"
---

# 05 · Contact enrichment and identity resolution

> **Kicker** (`kicker`): Apollo · four identity keys · deduplication · write rules
>
> **Одной строкой** (`one`): People from a provider and from conference exports enter the CRM classified and traceable — or not at all. Four keys in a fixed order, name matches that never block, and write rules that make the tools safe to run twice.

## Summary

- **What:** A contact model that joins people and companies many-to-many, the migration of every existing record onto it, and enrichment from an external provider and from event exports wired in so that automation never creates a second copy of a person who is already there.
- **Scale:** Every account through the analysis; hundreds of people imported without creating duplicates; conference exports of several hundred rows sorted into seven outcome buckets; a provider credit spent once.
- **My role:** The contact model and its migration, the identity rules, the write rules and the widgets that expose them.
- **Key topics:** identity resolution · normalisation · deduplication · account hierarchy · quota-aware batching · human review

## Key facts

| | |
| --- | --- |
| Model | person ↔ company as a junction: which company, what period, whether current main |
| Identity keys | 4, in a fixed order, last: normalised profile URL |
| Name matches | shown, never blocking |
| Search | chunked to 14 conditions — the platform ceiling |
| Buckets | 7, two of them worked by a person |
| Write rules | 3, applied everywhere |
| Quota | batches sized to the provider, three retry steps |

## Context

The same person exists four different ways across two systems. Conference target lists arrive as exports with wrong company names and no shared key with the CRM; the enrichment provider writes profile URLs differently from the CRM; email is missing for many people; a holding keeps its contacts on its subsidiaries. Automated “fixes” destroy data faster than they clean it — every Alex becomes an Alexander, a live title is overwritten by a stale one.

The org needed an identity model rather than an import button: which identifier is authoritative, when two records are the same person, when a merge is automatic and when a person decides — enforced the same way across every inbound path.

## Architecture

Look, then write. Every source passes through the same resolution: normalise, apply the identity keys in order, decide whether the result is a match, a candidate for a person, or a new record — and only then write, under rules that protect what is already there.

<!-- diagram · layers · вставляется после секции body[0] · источник: CASES[4].architecture.dg -->

### Диаграмма — слои архитектуры

_Alt-текст (`aria`, читается скринридером):_ Provider results, conference exports and CRM search feed identity resolution; resolution produces a decision — update, create, or human review — and only then writes into the CRM


**Sources**
- **Enrichment provider** — people by title, seniority, location
- **Conference export** — several hundred rows, no key
- **CRM search** — whole account hierarchy
- **Provider organisation** — the account matched first

↓ _normalise: profile URL, email, name, company_

**Identity resolution**
- **Four keys, in sequence** — each applied when the previous found nothing
- **Normalised profile URL** — the last key
- **Tie-break** — account first, then email
- **Account hierarchy** — existing contacts gathered through the group
- **Name** — shown, never blocking

↓ _a classification, not a match_

**Decision**
- **Matched** — fill empty fields only
- **New person** — create, provider checked first
- **Ambiguous** — worked by a person, candidates attached
- **Unresolved** — left for a person

↓ _three write rules_

**Zoho CRM** (ядро)
- **Contacts** — one record per person
- **Employment history** — many-to-many, one main employer
- **Accounts** — group structure

**Пояснения по клику** (`detail`):

- `prov` — **Enrichment provider**
  Filtered by title, seniority and location, loaded in pages; batches sized to the provider’s quota with three retry steps. The right lane waits, because provider calls cost credits.
  _ссылка: #/p/enrichment_
- `export` — **Conference export**
  Several hundred rows with no shared key and half the company names wrong — sorted into buckets rather than matched.
  _ссылка: #/p/cross-system/refuse_
- `crm-search` — **CRM search**
  Existing contacts are gathered through the account hierarchy, not just the account itself: a holding keeps its people on the subsidiaries, and a person who moved to a sister company is still the same person.
- `org-match` — **Provider organisation**
  The account itself is matched to a provider organisation before any person under it is, so people are searched under the right company rather than by name across the provider.
  _ссылка: #/p/enrichment_
- `keys` — **Four keys, in sequence**
  Duplicates are caught by four keys applied in a fixed order; each is tried only when the previous one found nothing, and the order is the same on every run.
- `url` — **Normalised profile URL**
  Trailing slashes, protocol and an appended numeric suffix are removed before comparison, because the same person is written four ways across two systems. On an export the lookup runs on the slug with a path anchor.
- `tie` — **Tie-break**
  Tie-breakers run in a fixed order — account first, then email — and if none resolves it, the row goes to ambiguous with the candidates attached rather than taking the first.
- `hier` — **Account hierarchy**
  Existing contacts are gathered through the account hierarchy, not just the account itself: a holding keeps its people on the subsidiaries.
- `name` — **Name**
  Name matches are shown but never block, since two people do share a name.
  _ссылка: #/p/enrichment_
- `matched` — **Matched**
  Title and email are filled only into an empty field, never over a live value.
- `new` — **New person**
  Created only after the CRM has been searched and the provider checked; a red counter on the card means an exact profile match already exists and the button is disabled.
  _ссылка: #/p/enrichment_
- `amb` — **Ambiguous**
  The tool deliberately does not push for full automation: no candidate resolves, so the row goes to a person with the candidates attached.
- `unres` — **Unresolved**
  Nothing matched at all; left for a human rather than guessed.
- `contacts` — **Contacts**
  One record per person, with the identity that matched recorded alongside.
- `emp` — **Employment history**
  A role is a record in its own right — which company, over what period, and whether it is the current main one — so “who do we know across this group” has an answer that does not depend on which subsidiary somebody typed on the day.
  _ссылка: #/p/contact-model_
- `accts` — **Accounts**
  Group structure as real relations rather than text, so “which people belong to this group” is a query.

<details>
<summary>Редактируемая спека (это и есть источник — правьте её)</summary>

```json
{
 "kind": "layers",
 "aria": "Provider results, conference exports and CRM search feed identity resolution; resolution produces a decision — update, create, or human review — and only then writes into the CRM",
 "rows": [
  {
   "id": "src",
   "label": "Sources",
   "nodes": [
    {
     "id": "prov",
     "n": "Enrichment provider",
     "sub": "people by title, seniority, location"
    },
    {
     "id": "export",
     "n": "Conference export",
     "sub": "several hundred rows, no key"
    },
    {
     "id": "crm-search",
     "n": "CRM search",
     "sub": "whole account hierarchy"
    },
    {
     "id": "org-match",
     "n": "Provider organisation",
     "sub": "the account matched first"
    }
   ]
  },
  {
   "arrow": "normalise: profile URL, email, name, company"
  },
  {
   "id": "res",
   "label": "Identity resolution",
   "nodes": [
    {
     "id": "keys",
     "n": "Four keys, in sequence",
     "sub": "each applied when the previous found nothing"
    },
    {
     "id": "url",
     "n": "Normalised profile URL",
     "sub": "the last key"
    },
    {
     "id": "tie",
     "n": "Tie-break",
     "sub": "account first, then email"
    },
    {
     "id": "hier",
     "n": "Account hierarchy",
     "sub": "existing contacts gathered through the group"
    },
    {
     "id": "name",
     "n": "Name",
     "sub": "shown, never blocking"
    }
   ]
  },
  {
   "arrow": "a classification, not a match"
  },
  {
   "id": "dec",
   "label": "Decision",
   "nodes": [
    {
     "id": "matched",
     "n": "Matched",
     "sub": "fill empty fields only"
    },
    {
     "id": "new",
     "n": "New person",
     "sub": "create, provider checked first"
    },
    {
     "id": "amb",
     "n": "Ambiguous",
     "sub": "worked by a person, candidates attached"
    },
    {
     "id": "unres",
     "n": "Unresolved",
     "sub": "left for a person"
    }
   ]
  },
  {
   "arrow": "three write rules"
  },
  {
   "id": "crm",
   "label": "Zoho CRM",
   "core": true,
   "nodes": [
    {
     "id": "contacts",
     "n": "Contacts",
     "sub": "one record per person"
    },
    {
     "id": "emp",
     "n": "Employment history",
     "sub": "many-to-many, one main employer"
    },
    {
     "id": "accts",
     "n": "Accounts",
     "sub": "group structure"
    }
   ]
  }
 ],
 "detail": {
  "prov": {
   "t": "Enrichment provider",
   "d": "Filtered by title, seniority and location, loaded in pages; batches sized to the provider’s quota with three retry steps. The right lane waits, because provider calls cost credits.",
   "demo": "p/enrichment"
  },
  "export": {
   "t": "Conference export",
   "d": "Several hundred rows with no shared key and half the company names wrong — sorted into buckets rather than matched.",
   "demo": "p/cross-system/refuse"
  },
  "crm-search": {
   "t": "CRM search",
   "d": "Existing contacts are gathered through the account hierarchy, not just the account itself: a holding keeps its people on the subsidiaries, and a person who moved to a sister company is still the same person."
  },
  "org-match": {
   "t": "Provider organisation",
   "d": "The account itself is matched to a provider organisation before any person under it is, so people are searched under the right company rather than by name across the provider.",
   "demo": "p/enrichment"
  },
  "keys": {
   "t": "Four keys, in sequence",
   "d": "Duplicates are caught by four keys applied in a fixed order; each is tried only when the previous one found nothing, and the order is the same on every run."
  },
  "url": {
   "t": "Normalised profile URL",
   "d": "Trailing slashes, protocol and an appended numeric suffix are removed before comparison, because the same person is written four ways across two systems. On an export the lookup runs on the slug with a path anchor."
  },
  "tie": {
   "t": "Tie-break",
   "d": "Tie-breakers run in a fixed order — account first, then email — and if none resolves it, the row goes to ambiguous with the candidates attached rather than taking the first."
  },
  "hier": {
   "t": "Account hierarchy",
   "d": "Existing contacts are gathered through the account hierarchy, not just the account itself: a holding keeps its people on the subsidiaries."
  },
  "name": {
   "t": "Name",
   "d": "Name matches are shown but never block, since two people do share a name.",
   "demo": "p/enrichment"
  },
  "matched": {
   "t": "Matched",
   "d": "Title and email are filled only into an empty field, never over a live value."
  },
  "new": {
   "t": "New person",
   "d": "Created only after the CRM has been searched and the provider checked; a red counter on the card means an exact profile match already exists and the button is disabled.",
   "demo": "p/enrichment"
  },
  "amb": {
   "t": "Ambiguous",
   "d": "The tool deliberately does not push for full automation: no candidate resolves, so the row goes to a person with the candidates attached."
  },
  "unres": {
   "t": "Unresolved",
   "d": "Nothing matched at all; left for a human rather than guessed."
  },
  "contacts": {
   "t": "Contacts",
   "d": "One record per person, with the identity that matched recorded alongside."
  },
  "emp": {
   "t": "Employment history",
   "d": "A role is a record in its own right — which company, over what period, and whether it is the current main one — so “who do we know across this group” has an answer that does not depend on which subsidiary somebody typed on the day.",
   "demo": "p/contact-model"
  },
  "accts": {
   "t": "Accounts",
   "d": "Group structure as real relations rather than text, so “which people belong to this group” is a query."
  }
 }
}
```

</details>

## Constraints

- **No shared key** — Profile URLs are written differently on each side, email is often missing, the company column is regularly wrong, and enrichment names are sometimes mangled.
- **The query ceiling** — A search over a list of profile URLs is limited to fourteen conditions a query, so the list is searched in chunks.
- **Credits** — Every provider call costs credits; the CRM must be searched first and the provider asked only when needed.
- **Group structure** — A contact record stores one company; the client is a group. Existing contacts have to be gathered through the whole account hierarchy, not just the account itself.
- **Two people can share a name** — A name match is evidence, never proof.

## Implementation

### A junction, not a bigger text field

A contact record stores one company. That is fine until the client is a group: somebody holds a role at the parent, a second at a subsidiary, and a history at a third acquired two years ago. Years of records made situationally had settled on creating a second person to carry that history, so duplicates concentrated precisely where the money is — on the multi-entity accounts — and enrichment credits were spent on identities the CRM already held. The person and the company became separate identities joined through a junction module, so a role is a record in its own right: which company, over what period, and whether it is the current main one. Employment history can be queried rather than read.

### Migrating records that were already wrong

Every existing record had to move onto the model, and none of them were clean when they moved, so the migration was a reconciliation rather than a copy. Candidates were gathered across the whole account hierarchy instead of the single account, then matched on ordered evidence — authoritative identifiers first, normalised contact evidence next, a normalised profile URL last — and anything that could not be proved was left for a person rather than merged on a likelihood. The asymmetry is deliberate: a surviving duplicate is visible and irritating, while a wrong merge quietly destroys somebody’s history and leaves no trace that it happened.

### Four keys, in order

Duplicates are caught by four keys applied in sequence, the last being a normalised profile URL. Normalisation strips the protocol, trailing slashes and an appended numeric suffix, because the same person is written four different ways across two systems. On a conference export the lookup runs on the slug with a path anchor, so an extended slug and a trailing slash both still hit while the anchor stops a slug matching in the middle of somebody else’s address. Tie-breakers run in a fixed order — account first, then email — and when none resolves it the row goes to ambiguous with the candidates attached, never to the first candidate.

### Buckets instead of matches

A conference export is not matched; it is classified, and each bucket is worked independently: matched by profile; matched but the account disagrees; matched by email or name; needs enrichment; created from enrichment; ambiguous; unresolved. The last two are worked by a person. The tool deliberately does not push for full automation, because the cost of a wrong merge is a person filed under the wrong company for years.

### The three write rules

A name is corrected only when the surname differs, because otherwise every Alex becomes an Alexander. Title and email are filled only into an empty field and never over a live value. Everything else that merely differs is reported for a human to look at. Those three rules are what make the tools safe to run twice, and they are applied in every inbound path, not only here.

### Identity before enrichment: a credit spent once

A model is only worth having if every route obeys it. Identity resolution runs before creation on every inbound path, and enrichment runs only after resolution — so a provider credit is spent once, on a person the CRM has established it does not know. The account itself is matched to a provider organisation before any person under it is searched; batches are sized to the provider’s quota with three retry steps. Ambiguous matches stay visible as ambiguous instead of being settled by whichever integration happened to run last, and a new integration does not get to arrive with its own private definition of a duplicate.

## Reliability and failure handling

How the tools behave on the data that actually arrives.

| When | What the system does |
| --- | --- |
| Same person, different profile URL spelling | Normalised before comparison; recovered matches are counted separately in the statistics strip so the effect of the rule is visible. |
| Two people with the same name | Shown as amber, never blocking; the profile URL decides, or a person does. |
| The provider throttles | Batches are sized to the provider’s quota and retried in three steps. |
| A live title would be overwritten | It is not: title and email fill empty fields only; the difference is reported. |
| A row cannot be resolved | It lands in ambiguous or unresolved with its candidates attached; the import continues with the rest. |
| The tool is run a second time | Safe by construction: the write rules only fill empty fields and only create what no key matched, so a second pass writes nothing new. |

## My responsibility

The contact model and the migration of every existing record onto it; the identity model — which identifier is authoritative, when records merge automatically, when a human decides — the matching and write rules, and the widgets that expose them on the account and contact records. Enforced across every inbound integration, not only the enrichment path.

## Result

Every account went through the analysis, and new contacts now arrive through the same identity rules: hundreds of people imported without creating duplicates, tools that are safe to run twice by construction, and a provider credit spent once. The relationship layer is real complexity that every widget, report and integration has to understand — taken deliberately, because the simplicity it replaced existed only in the schema while users carried the cost as duplicates and lost history.

## Interactive example

Встроено: [`enrichment`](../pages/enrichment.md) (вкладка «Contact enrichment»).

## More examples

- [`enrichment`](../pages/enrichment.md) — The account record: group structure, development plan, the enrichment screen with its statistics strip, and the provider link matched before any person under it.

## Technical notes

- [`contact-model`](../pages/contact-model.md)
- [`cross-system/refuse`](../pages/cross-system.md) — **Sorting a conference export into buckets** Classification instead of matching, with two of seven buckets worked by a person.

## Related cases

- [`reconciliation`](./reconciliation.md)
- [`widgets`](./widgets.md)
- [`ai-workflows`](./ai-workflows.md)
