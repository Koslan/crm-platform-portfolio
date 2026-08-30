---
page: "site"
title: "This site itself"
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

# This site itself

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> One static file, no backend, hash routing, an emulated platform SDK underneath.

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
