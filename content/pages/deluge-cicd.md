---
page: "deluge-cicd"
title: "From browser-only code to reviewed delivery"
type: "write-up (CASES → vCase)"
tab: "zoho"
group: "Org tooling, CI/CD, deployment and the external server"
route: "#/p/deluge-cicd"
kind: "note"
public: true
public_tab: "zoho"
case: "#/zoho/platform-engineering"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"deluge-cicd\""
  body_case: "src/app.html · CASES['Written up from the platform work'][1]"
---

# From browser-only code to reviewed delivery

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Pull, analyse, review, deploy, run and verify — one controlled toolchain around a browser-only editor.
>
> **Material labels** (`MAT`, публично не рендерятся): Working internal tool · Architecture write-up
>
> **`sub` — НЕ рендерится, см. LEAD:**
> Pull, analyse, review, deploy, run and verify — one controlled toolchain around a browser-only editor.

## A browser editor is not a development environment

The platform presents functions one at a time in a browser editor. That is enough to change a line. It is not enough to search the estate for a pattern that repeats, to review a change touching four functions as one change, to know what else calls the thing being edited, or to establish afterwards that production received what was approved. Without those, deployment means somebody pasting text into a form and remembering that they did.

## Pull, and normalise into something reviewable

The estate is pulled into a local searchable codebase and normalised into the same analysis system that carries the dependency and invocation index, so a change is read against what calls it rather than on its own. This is the extraction the org tooling is built on; the pipeline is what happens to that code afterwards.

## Review as the gate, git as the record

Changes are made under git review. That is unremarkable anywhere else and is the entire point here: it gives the platform an authored change history it does not otherwise have, and a place where a second person can disagree before production sees anything. It also makes the reasoning durable — why a criterion was changed outlives the conversation in which somebody decided to change it.

## Deploy, run, and prove it landed

Delivery does not end with a successful request. The platform will accept a save and then serve something else, so a deployment counts as landed only when an independent read returns the same content, compared by hash rather than by eye. The function is then run through the same tooling with its output captured against the version that produced it, which makes a failure attributable to a specific change instead of to somebody’s recollection of one.

## What the pipeline rests on

It stands on platform surfaces that are less complete and less stable than a real source API: some endpoints are undocumented, the versions were found empirically, and part of the flow depends on a session that expires. So every unsupported path and manual fallback is written down and kept visible rather than being allowed to settle into tribal knowledge. A pipeline whose failure modes are undocumented is a pipeline that strands whoever inherits it, which is the same problem it was built to solve.

## See it live

Блок-callout внизу страницы ведёт на `#/p/orghealth` — An org audit that names what it cannot see.
