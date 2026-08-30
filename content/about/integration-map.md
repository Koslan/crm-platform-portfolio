---
file: "integration-map"
title: "Карта интеграций (EDGES)"
nodes: 12
source:
  code: "src/app.html · EDGES"
---

# Карта интеграций

SVG-схема в блоке «02 / THE SYSTEM» на About. Клик по узлу раскрывает подпись.

## Microsoft Graph

**Подпись на схеме** (`sub`): calendar delta sync

**Заголовок в раскрытии** (`t`): Microsoft Graph → Zoho

17 shared mailboxes over Graph delta queries: a checkpoint per page, throttling that slows a mailbox instead of failing it, invalid tokens falling back to a full read in the same run. Booked meetings reach the CRM in minutes.

_демо:_ `#/p/event`

## Teams

**Подпись на схеме** (`sub`): chat → CRM → Jira

**Заголовок в раскрытии** (`t`): Teams ↔ Zoho

Thread conversations imported without a bot — a text contract in the first message routes a thread onward, to its Jira issue or its deal. Adaptive-card wizards write meeting recaps back, each card a callback subscription so nothing holds a request open.

_демо:_ `#/p/chat-tracker`

## Entra ID

**Подпись на схеме** (`sub`): auth & scopes

**Заголовок в раскрытии** (`t`): Entra ID — the auth backbone

Every Microsoft integration runs on app registrations I own: least-privilege permission scopes, admin consent flows, secret rotation on schedule. Auth failures clear the cached token and retry once — then fail loudly.

## Google Drive

**Подпись на схеме** (`sub`): AppExchange package

**Заголовок в раскрытии** (`t`): Google Drive ↔ Salesforce

Architected at Noltic: resumable chunked uploads tested to 2 GB, hybrid OAuth token strategy, a Chrome extension linking open Google Docs to CRM records — shipped as a Managed Package on AppExchange after Security Review.

## Google Calendar

**Подпись на схеме** (`sub`): events & Gmail → CRM

**Заголовок в раскрытии** (`t`): Google Calendar & Gmail → CRM

At Room 8: events created and viewed straight from the CRM, meeting-overlap prevention, meetings linked to accounts and contracts — replacing calendar chaos at industry events. Earlier: the BookMe booking backend’s calendar sync at Provectus.

_демо:_ `#/p/event`

## Apollo

**Подпись на схеме** (`sub`): enrichment, dedup

**Заголовок в раскрытии** (`t`): Apollo → Zoho

Provider people matched against the CRM through four keys in sequence, ending with a normalised profile URL; existing contacts gathered through the account hierarchy; batching tuned to provider quota.

## Jira

**Подпись на схеме** (`sub`): PITCH routing, idempotent

**Заголовок в раскрытии** (`t`): Teams → Zoho → Jira

A Teams thread routes to a Jira issue by the PITCH code in its root message. Comments are public or role-restricted and made idempotent by a marker inside the body; attachments travel as links, never uploads; the source message gets a one-time reaction once delivery is confirmed.

_демо:_ `#/p/chat-tracker`

## Email sources

**Подпись на схеме** (`sub`): multi-source ingestion

**Заголовок в раскрытии** (`t`): Email sources → Zoho

A server-side pipeline that carries mail out of multiple sources and mailboxes into the CRM: deduplicated, matched to the right account and deal, attached where sales actually looks.

## Slack

**Подпись на схеме** (`sub`): alerts & deal events

**Заголовок в раскрытии** (`t`): Zoho → Slack

Sync failures and deal events surfaced into the channels the team already reads — the integration layer reports its own health instead of waiting to be noticed.

## Legacy CRM

**Подпись на схеме** (`sub`): migration, reconciled

**Заголовок в раскрытии** (`t`): Legacy CRM → Zoho

The one-way street: years of records mapped, transformed, validated and loaded with automation suppressed — verified against reconciliation rules rather than record counts.

## OpenAI API

**Подпись на схеме** (`sub`): loss analysis, 2 stages

**Заголовок в раскрытии** (`t`): OpenAI → CRM pipelines

A two-stage loss-analysis design: ten times more code gathering evidence from six sources than calling the model, and a 38-cause taxonomy carried in the prompt — with a human-correctable middle stage.

_демо:_ `#/p/loss-analysis`

## Claude · MCP

**Подпись на схеме** (`sub`): AI-assisted delivery

**Заголовок в раскрытии** (`t`): Claude & MCP

AI-assisted delivery with review gates — this site and my production CRM work ship through the same workflow. MCP as safe, typed access to org data: the emulator idea pointed at real systems.

_демо:_ `#/p/site`

