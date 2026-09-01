---
page: "mcp-product"
title: "Scoped AI access to CRM"
type: "write-up (CASES → vCase)"
tab: "ai"
group: "Control and access"
route: "#/p/mcp-product"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · AI_GROUPS · id=\"mcp-product\""
  body_case: "src/app.html · CASES['AI in the CRM'][3]"
---

# Scoped AI access to CRM

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Typed operations for records and platform tooling, with permissions and validation outside the model.
>
> **Material labels** (`MAT`): Working internal tool · Architecture write-up
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> Claude works with CRM records and related operations through a scoped MCP surface connected to the surrounding Zoho tooling. Reusable skills combine record operations with function pull, analysis, deploy and run capabilities, turning one-off prompts into repeatable development, audit and operational workflows.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> Typed operations over records and the platform tooling around them, with permissions, validation and the audit trail defined outside the model.

## What the MCP surface exposes

Claude reaches the CRM through a scoped MCP surface rather than a general-purpose connection: a fixed set of typed operations over records — read, search and query, create, update, delete, related lists, and the field and layout metadata needed to know what a module actually contains — alongside the operations belonging to the tooling around the platform, so the same session that reads a record can pull a function, see what calls it, deploy an approved version and run it. The list is the boundary. There is no escape hatch letting a model compose an arbitrary request, which means the answer to “what could this do if it were wrong” is a list somebody wrote rather than a guess about a model.

## What remains outside model judgement

A CRM workflow is mostly evidence-gathering, and a model dropped into the wrong part of one returns a plausible ungrounded answer instead of a correct one — so the split is stated as a rule rather than left to taste. Deterministic operations stay deterministic: a stage change, a lookup, a picklist validation, a query across two hundred records. Nothing about any of them improves when a model guesses. Classification and rewriting are where the model belongs: turning a rambling transcript into a recap, placing a loss reason inside a taxonomy, correcting a misheard company name. The record shapes, the required fields and the refusals live outside the model in the surface definition, where somebody can review them without having to read a prompt to find out what the system will accept.

## Skills as repeatable workflows

A tool call is one action; the work is almost always a sequence of them, and retyping that sequence as a prompt is how it drifts. Reusable skills carry the sequence instead — pull the relevant functions, analyse what calls what, check a change against the platform’s constraints, deploy, run, verify — which turns one-off prompting into repeatable development, audit and operational workflows with the stages written down where a person can disagree with them. It also makes the process reviewable in the ordinary way: a skill is a file, so a change in how the org gets audited arrives as a diff rather than as a different mood on a different day.

## The function tooling behind the agent

None of this works against a platform that will not show you its own code, and Zoho will not. The MCP surface is thin on purpose because the layer underneath it is not: the extraction that puts the whole function estate somewhere searchable, the dependency and invocation index, the configuration snapshot in git, and the deploy-and-run path with its read-back check. The agent is a way to reach that tooling in a sentence, not a capability of its own. Which is why the useful question about it is never how good the model is, but how complete the estate it can see happens to be — a confident answer drawn from a partial extraction is the failure mode worth worrying about here.

## Permissions, confirmation and auditability

Access is scoped by the credentials the surface itself holds rather than by what the model is asked to do, so a request outside that scope fails at the boundary instead of inside the model’s judgement. Changes that matter are confirmed before they happen, and what was done stays attached to the change that caused it. Then the honest limit: MCP is access control, not correctness control. A well-typed call can carry a badly reasoned instruction, and nothing about a typed surface makes the instruction good — the validation, the risk gate and the person reading the diff are still the parts doing the real work. What the surface buys is narrower and worth having anyway: the damage a wrong instruction can do is bounded in advance by a list somebody wrote down.
