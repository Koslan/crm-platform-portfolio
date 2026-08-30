---
page: "mcp-product"
title: "Three kinds of AI work, and the CRM only had two"
type: "write-up (CASES → vCase)"
tab: "ai"
group: "AI in the CRM"
route: "#/p/mcp-product"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · AI_ITEMS · id=\"mcp-product\""
  body_case: "src/app.html · CASES['AI in the CRM'][3]"
---

# Three kinds of AI work, and the CRM only had two

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Evidence-gathering versus inference, and MCP as the emulator’s own idea pointed at a real org.
>
> **Подзаголовок страницы** (`sub`):
> Evidence-gathering versus inference, and MCP as the emulator’s own idea, pointed at a real org.

## The constraint

This portfolio already shows two kinds of AI work: a pipeline that gathers evidence and calls a model once, twice, at the end (loss analysis); and an agent that writes, gated by validation and a human (the journal above). Neither is what most people mean when they say "AI in the CRM" today — they mean a model working the org directly, the way an assistant with MCP access does. Building that third kind honestly means being precise about where a model earns its place and where it does not, because a CRM pipeline is mostly evidence-gathering, and a model dropped into the wrong part of it produces a plausible, ungrounded answer instead of a correct one.

## What was built

A three-way split, stated as a rule rather than a feeling. Deterministic operations — a stage change, a lookup, a picklist validation, a query against two hundred records — stay deterministic; nothing about them benefits from a model guessing. Classification and rewriting are where a model belongs: turning a rambling transcript into a recap, placing a loss reason in a taxonomy, correcting a mis-heard company name. MCP is the connecting piece — a typed, scoped surface for exactly the calls a model is allowed to make against org data, with the record shapes and the refusals defined outside the model, not inside its judgement. That is the same idea as the emulator this whole site runs on, aimed the other direction: instead of standing in for the platform so code can run outside it, MCP stands in front of the platform so a model can act on it safely.

## The trade

MCP is access control, not correctness control — a well-typed tool call can still carry a bad instruction, so the validation and the risk gate shown in the journal above are still the part doing the actual work. Naming the three kinds plainly is the whole contribution here: a portfolio that only ever says "AI" without saying which of the three it means is not saying anything a hiring manager can evaluate.
