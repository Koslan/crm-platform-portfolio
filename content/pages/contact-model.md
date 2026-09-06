---
page: "contact-model"
title: "One person, several companies — without duplicate identities"
type: "write-up (CASES → vCase)"
tab: "zoho"
group: "Cleaning up contacts, deduplication and enrichment"
route: "#/p/contact-model"
kind: "note"
public: true
public_tab: "zoho"
case: "#/zoho/enrichment"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"contact-model\""
  body_case: "src/app.html · CASES['Written up from the platform work'][0]"
---

# One person, several companies — without duplicate identities

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> A many-to-many contact model, the migration onto it, and the identity rules every inbound path now obeys.
>
> **Material labels** (`MAT`, публично не рендерятся): Architecture write-up
>
> **`sub` — НЕ рендерится, см. LEAD:**
> A many-to-many contact model, the migration onto it, and the identity rules every inbound path now obeys.

## One person, several employers, and a field that holds one

A contact record stores one company. That is fine until the client is a group: somebody holds a role at the parent, a second at a subsidiary, and a history at a third that was acquired two years ago. A single company field forces a choice between losing that history and creating a second person to carry it, and years of records made situationally had settled on the second. The result was not an untidy database. It was duplicates concentrated precisely where the money is — on the multi-entity accounts — and enrichment credits being spent on identities the CRM already held.

## A junction, not a bigger text field

The person and the company became separate identities joined through a junction module, so a role is a record in its own right: which company, over what period, and whether it is the current main one. Nothing survives as a pseudo-relation inside a text field, which means employment history can be queried rather than read, and “who do we know across this group” has an answer that does not depend on which subsidiary somebody happened to type on the day.

## Migrating records that were already wrong

The existing records had to move onto the model, and they were not clean when they moved, so the migration was a reconciliation rather than a copy. Candidates were gathered across the whole account hierarchy instead of the single account, then matched on ordered evidence — authoritative identifiers first, normalised contact evidence next, a normalised profile URL last — and anything that could not be proved was left for a person rather than merged on a likelihood. The asymmetry is deliberate: a surviving duplicate is visible and irritating, while a wrong merge quietly destroys somebody’s history and leaves no trace that it happened.

## What every inbound path now has to do

A model is only worth having if every route obeys it. Identity resolution runs before creation on every inbound path, and enrichment runs only after resolution — so a provider credit is spent once, on a person the CRM has established it genuinely does not know. Ambiguous matches stay visible as ambiguous instead of being settled by whichever integration happened to run last, and a new integration does not get to arrive with its own private definition of a duplicate.

## The trade

The relationship layer is real complexity, and every consumer — widget, report, integration — has to understand it. That cost is taken deliberately, because the simplicity it replaced existed only in the schema. Users were already carrying the complexity as duplicate records, lost employment history and a question about a group account that nobody could answer; they were simply carrying it without any of the tools this model hands back.

## See it live

Блок-callout внизу страницы ведёт на `#/p/enrichment` — Contact enrichment.
