---
tab: "ai"
title: "Applied AI"
route: "#/ai"
items: 8
public: false
source:
  lede: "src/app.html · vAI()"
  items: "src/app.html · AI_GROUPS"
---

# Applied AI

## Лид страницы

Architecture and implementation, not a prompt gallery Applied AI I design and implement AI across three layers of the CRM platform: engineering the system itself, running evidence-based business workflows, and assisting salespeople inside the interfaces they already use. The model handles interpretation and drafting; the surrounding architecture handles data collection, permissions, validation, scheduling, human review, write-back and auditability. The boundary Grounded in evidence, bounded by deterministic controls, auditable after every write. Where a model is trusted with a judgement, the page says so; where the surrounding code does the work and the model only drafts, it says that too. ENGINEERING AI in engineering Zoho keeps most of its code behind browser editors and disconnected configuration screens, so the extraction and analysis layer had to exist before a model could be useful against it. With the org in one searchable system, AI designs functions and interfaces, generates Deluge, JavaScript and Python, reviews existing code, expands tests, identifies regression risk and analyses dependencies. Generation was never the bottleneck; verification is, so Git review, controlled deployment and automated checks decide what ships. Code intelligence across the whole org Full-org extraction, AI-assisted review, dependency analysis and risk discovery across the function estate. Technical note How AI-assisted delivery is verified Generated work passes source review, behavioural tests, leak guards and controlled promotion before production. Technical note The tooling this runs on, on the Zoho tab The engineering layer Zoho did not provide Pull the org into one searchable system, map dependencies and turn browser-only change into reviewed delivery. Technical note From browser-only code to reviewed delivery Pull, analyse, review, deploy, run and verify — one controlled toolchain around a browser-only editor. Technical note WORKFLOWS AI as a business solution An AI feature in a CRM is an integration and control system before it is a model call. Evidence has to be gathered, identities resolved, permissions enforced, outputs validated and failures made recoverable; the model receives one bounded interpretation task inside that system. Meetings held in Teams use Teams transcripts, meetings held elsewhere use Krisp, and a source adapter keeps the process open to further providers without changing the recap standard or the write-back. From transcript to a corporate-standard meeting recap Teams, Krisp and future sources feed one governed evidence-to-recap pipeline. Interactive example From six evidence sources to one governed loss reason A two-stage classification pipeline with a human-correctable intermediate record. Technical note Recurring team intelligence, delivered automatically AI-generated reports and management summaries with deterministic scheduling and delivery controls. Technical note INTERFACES AI assistance inside CRM interfaces AI is embedded in more than ten interfaces where it lowers the cost of keeping CRM data useful — drafting, rewriting and standardising text without sending a salesperson to a separate tool. The strongest case is short reporting from a phone, where the interface reduces the input cost and the model turns a rough note into the structure the business expects. Assistance stays bounded: the interface fixes the target record and the allowed operation, validation decides what may be saved, human-written fields are not silently replaced, and the result can be reviewed or undone. Controlled write-back with an action journal Every proposed change carries a before/after diff and a human gate for high-risk fields. Interactive example AI at the point of CRM input Drafting and rewriting across 10+ interfaces, especially short reports from mobile devices. Planned The mobile recap this sits inside, on the Zoho tab The event floor, designed for a phone A room-by-room schedule, team load and assisted recap flow for a surface with no developer tools. Interactive example ACCESS Control and access Claude works with CRM records and related operations through a scoped MCP surface connected to the surrounding Zoho tooling, and reusable skills combine record operations with function pull, analysis, deploy and run — turning one-off prompts into repeatable development, audit and operational workflows. MCP decides which operations exist; it does not make a model correct. Permissions, validation, risk gates, confirmation and the audit trail stay outside model judgement. Scoped AI access to CRM Typed operations for records and platform tooling, with permissions and validation outside the model. Technical note

## Карточки

| id | Заголовок (`t`) | Подпись (`s`) | Вид | Публично |
| --- | --- | --- | --- | --- |
| [`code-intelligence`](../pages/code-intelligence.md) | Code intelligence across the whole org | Full-org extraction, AI-assisted review, dependency analysis and risk discovery across the function estate. | note | да, под zoho |
| [`ai-workflow`](../pages/ai-workflow.md) | How AI-assisted delivery is verified | Generated work passes source review, behavioural tests, leak guards and controlled promotion before production. | note | нет |
| [`chat-recap`](../pages/chat-recap.md) | From transcript to a corporate-standard meeting recap | Teams, Krisp and future sources feed one governed evidence-to-recap pipeline. | emul | да, под zoho |
| [`loss-analysis`](../pages/loss-analysis.md) | From six evidence sources to one governed loss reason | A two-stage classification pipeline with a human-correctable intermediate record. | note | да, под zoho |
| [`team-intelligence`](../pages/team-intelligence.md) | Recurring team intelligence, delivered automatically | AI-generated reports and management summaries with deterministic scheduling and delivery controls. | note | нет |
| [`ai-interface-assistance`](../pages/ai-interface-assistance.md) | AI at the point of CRM input | Drafting and rewriting across 10+ interfaces, especially short reports from mobile devices. | plan | нет |
| [`agent-journal`](../pages/agent-journal.md) | Controlled write-back with an action journal | Every proposed change carries a before/after diff and a human gate for high-risk fields. | live | да, под zoho |
| [`mcp-product`](../pages/mcp-product.md) | Scoped AI access to CRM | Typed operations for records and platform tooling, with permissions and validation outside the model. | note | да, под zoho |

## Группы

Каждая группа несёт свой абзац (`intro`), список написанных страниц и — через `also` — страницы, которые относятся к этой работе, но живут на другой вкладке.

### AI in engineering

Zoho keeps most of its code behind browser editors and disconnected configuration screens, so the extraction and analysis layer had to exist before a model could be useful against it. With the org in one searchable system, AI designs functions and interfaces, generates Deluge, JavaScript and Python, reviews existing code, expands tests, identifies regression risk and analyses dependencies. Generation was never the bottleneck; verification is, so Git review, controlled deployment and automated checks decide what ships.

Входят: `code-intelligence`, `ai-workflow`

The tooling this runs on, on the Zoho tab: `org-tooling`, `deluge-cicd`

### AI as a business solution

An AI feature in a CRM is an integration and control system before it is a model call. Evidence has to be gathered, identities resolved, permissions enforced, outputs validated and failures made recoverable; the model receives one bounded interpretation task inside that system. Meetings held in Teams use Teams transcripts, meetings held elsewhere use Krisp, and a source adapter keeps the process open to further providers without changing the recap standard or the write-back.

Входят: `chat-recap`, `loss-analysis`, `team-intelligence`

### AI assistance inside CRM interfaces

AI is embedded in more than ten interfaces where it lowers the cost of keeping CRM data useful — drafting, rewriting and standardising text without sending a salesperson to a separate tool. The strongest case is short reporting from a phone, where the interface reduces the input cost and the model turns a rough note into the structure the business expects. Assistance stays bounded: the interface fixes the target record and the allowed operation, validation decides what may be saved, human-written fields are not silently replaced, and the result can be reviewed or undone.

Входят: `ai-interface-assistance`, `agent-journal`

The mobile recap this sits inside, on the Zoho tab: `board`

### Control and access

Claude works with CRM records and related operations through a scoped MCP surface connected to the surrounding Zoho tooling, and reusable skills combine record operations with function pull, analysis, deploy and run — turning one-off prompts into repeatable development, audit and operational workflows. MCP decides which operations exist; it does not make a model correct. Permissions, validation, risk gates, confirmation and the audit trail stay outside model judgement.

Входят: `mcp-product`

