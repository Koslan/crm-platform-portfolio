---
page: "site"
title: "A production-shaped CRM environment in one static file"
type: "live-demo (свой рендерер PAGE)"
tab: "fullstack"
group: "Full-stack"
route: "#/p/site"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · FS_ITEMS · id=\"site\""
  body_render: "src/app.html · PAGE['site'].render()"
---

# A production-shaped CRM environment in one static file

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Production-derived interfaces, synthetic data, an emulated SDK and deliberate failure modes — no backend required.
>
> **Material labels** (`MAT`): Public production-shaped build
>
> **Лид страницы** (`LEAD`) — абзац под подписью:
> This site turns the offline widget harness into a public environment: production-derived interfaces run against synthetic records, an emulated platform SDK and deliberate latency, throttling, token and validation failures. The company and the surrounding application shells are invented; no employer endpoint, credential or internal identifier is present.

## Текст страницы

_Проза этой страницы живёт прямо в разметке рендерера — правьте по совпадению строки._

## The company is invented

All records belong to Northbeam Engineering, a contract product-engineering firm — industrial design, mechanical, electronics, firmware, test & certification. Accounts, people, deals, meetings and conversations are generated. No client record, endpoint, credential or internal name from any employer appears anywhere on this site.

## The platform is emulated

The widgets are the real thing — the same code that runs inside the CRM, loaded in a frame exactly as the platform loads it. What sits underneath is a stand-in for the platform SDK: record reads and writes, a query interpreter with paging at the platform’s own ceiling, server-side function calls, and connection calls, all served from the generated dataset and held in memory. Edits persist for your session; Reset restores them.

## This layer already existed

It began as an offline test harness — stubs plus a headless browser — built because a widget cannot run outside the CRM and nobody wants to verify a change by deploying it to production. This site is that harness promoted to a product.

## Failure is a switch, not a story

A control turns on latency, rate limiting, rejected writes and expired tokens. Recovery paths are meant to be clicked, not described.

## The other systems are drawn, not cloned

Chat, tracker and calendar shells are simplified interfaces built for this site. They carry no third-party branding and are labelled as emulations. They exist so a flow that crosses four systems can be walked end to end.

## Legend

Company

Northbeam Engineering

Business

a contract product-engineering firm — industrial design, mechanical, electronics, firmware, test & certification

Why this one

It needs the same shapes the work needs — accounts and people, a service catalogue sold across business units, programmes tracked in an issue tracker, and a sales team that meets clients at trade shows — without resembling any employer of mine.
