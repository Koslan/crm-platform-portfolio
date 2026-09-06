---
page: "code-intelligence"
title: "Code intelligence across the whole org"
type: "write-up (CASES → vCase)"
tab: "ai"
group: "AI in engineering"
route: "#/p/code-intelligence"
kind: "note"
public: true
public_tab: "zoho"
case: "#/zoho/platform-engineering"
diagrams: 0
source:
  nav: "src/app.html · AI_GROUPS · id=\"code-intelligence\""
  body_case: "src/app.html · CASES['Written up from the platform work'][2]"
---

# Code intelligence across the whole org

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Full-org extraction, AI-assisted review, dependency analysis and risk discovery across the function estate.
>
> **Material labels** (`MAT`, публично не рендерятся): Working internal tool · Architecture write-up
>
> **`sub` — НЕ рендерится, см. LEAD:**
> Full-org extraction, AI-assisted review, dependency analysis and risk discovery across the function estate.

## One function at a time is the wrong unit

Reviewing a pasted function cannot reveal a pattern duplicated across two hundred others, a missing failure policy repeated at every call site, or a change that breaks an invocation path three systems away. The unit of the problem is the estate, not the file. The code has to exist as one system before anything — a model or a person — can reason about the system rather than about the snippet on screen.

## The workflow

With the estate extracted and joined to dependency, invocation and configuration evidence, AI is pointed at the work that scales badly for a person: reviewing for missing error handling, finding patterns that disagree with each other across modules, flagging where a proposed change carries regression risk, tracing what a rename actually touches, and drafting documentation nobody wants to write twice. Findings are review material. Nothing travels from a finding straight into production.

## From finding to change

Approved work goes down the ordinary delivery path — source review, tests, controlled deployment, verification by read-back. Reusable skills encode the review stages and the platform’s own constraints, so the process is a file that gets changed deliberately rather than a prompt somebody rebuilds from memory and slightly differently each time.

## What it cannot decide

It can find suspicious code and explain why the code deserves attention. It cannot decide what the business meant, and it cannot prove a function is unused from code alone — that needs the five entry channels, and even then the answer is bounded by the one class of function the extraction cannot see. The output worth worrying about here is not a wrong finding, which review catches, but a confident silence over the part of the estate nobody realised was missing from it.
