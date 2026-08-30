---
page: "sf-sync"
title: "Apex vs Deluge: the same sync, twice"
type: "write-up (свой рендерер PAGE)"
tab: "salesforce"
group: "Salesforce"
route: "#/p/sf-sync"
kind: "note"
diagrams: 0
source:
  nav: "src/app.html · SF_ITEMS · id=\"sf-sync\""
  body_case: "src/app.html · CASES['Salesforce'][0]"
  body_render: "src/app.html · PAGE['sf-sync'].render()"
warning: "CASES-запись для этой страницы НЕ рендерится: PAGE перекрывает CASES в vItem()"
---

# Apex vs Deluge: the same sync, twice

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> The delta-sync pattern rebuilt on Salesforce primitives.
>
> **Подзаголовок страницы** (`sub`):
> The delta-sync pattern from the Zoho side, rebuilt on Salesforce primitives. Not the code — the decisions.

## Текст страницы

_Проза этой страницы живёт прямо в разметке рендерера — правьте по совпадению строки._

# Apex vs Deluge: the same sync, twice

The delta-sync pattern from the Zoho side (seventeen mailboxes, a checkpoint per page, a hard time ceiling), rebuilt on Salesforce primitives. Not the code — the decisions. Where the two platforms genuinely diverge is the last row, and it is the one worth reading slowly.

Write-upApex, not deployed to a live org

## The comparison

Problem

Deluge (Zoho)

Apex (Salesforce)

**No cycle across a run**

The schedule itself is the loop — a rebuild of the same function call, walking a pre-built list of page numbers with a completion flag

A Queueable chains itself once per page — enqueueJob(new DeltaSyncJob(...)) inside execute() reads as a loop even though each iteration is a separate transaction

**Time ceiling**

120 seconds on a single synchronous function call

Governor limits per transaction — at most 100 callouts, plus Queueable chaining’s own depth limits — so the job bounds itself by a page-count budget per transaction, not a wall clock, and re-chains into a fresh transaction for more budget

**Where state lives**

A field on a record, or a small standalone module — there is nowhere else to keep a delta token between runs

Sync\_Checkpoint\_\_c, a Custom Object — chosen over Platform Cache because it survives an org restart or a cache eviction and is visible in the UI, which mattered more than the extra read/write latency

**Secrets**

A connection object inside the platform — the credential never appears in code

A Named Credential — same idea, same guarantee: zero secrets in Apex or metadata

**Observability**

The sync stage is written onto the record itself, so “why is this empty” is answered by the data

A Platform Event published after every page, read live by a subscribing LWC monitor via empApi — push instead of pull, otherwise the same instinct

**Testability**

A hand-built offline stand-in (this whole site’s platform emulator) — nothing in Zoho’s own tooling mocks a connection call

HttpCalloutMock, built into the platform — a real testing seam the Deluge side has to construct from scratch

**Suppressing automation on a bulk load**

An empty trigger list passed with the bulk API call turns off every rule and workflow for the run

No direct equivalent — Salesforce triggers are not switched off by a request flag; the closest available tool is a static/bypass flag pattern written into the trigger handlers themselves, and it has to be built and maintained by hand

## Same steps, different mechanism

## Why this page exists

Anyone can restate what a platform’s documentation says. The useful version of this comparison is knowing which rows have a real answer on both sides and which one does not — suppressing automation during a bulk load is trivial in Zoho and has no built-in equivalent in Apex. Naming that gap plainly is worth more than a table that reads clean.

## ⚠️ Мёртвый текст: CASES-запись, которая не рендерится

Роутер (`vItem`) отдаёт приоритет `PAGE` над `CASES`, поэтому этот текст на сайте не виден. Либо удалить, либо перенести в рендерер выше.

### The constraint

Same shape as the Deluge original running behind the event campaign page's calendar sync: seventeen mailboxes, a delta query per mailbox, a hard ceiling on how long any one unit of work may run, and three error classes that each need a different reaction — throttling should slow a mailbox rather than fail it, an invalid or expired token should fall back to a full read in the same run, and anything else should mark the mailbox skipped without taking the rest of the batch down.

### What was built

DeltaSyncJob, a Queueable that chains itself once per page — Apex has no while loop across transactions either, so the mechanism is the same idea as the Deluge page-number walk, just built on a primitive that can enqueue its own continuation. A Custom Object, Sync_Checkpoint__c, is written after every page — not just at the end — so a chain that dies on page forty resumes on page forty-one. Three error branches mirror the Deluge ones exactly: a 429 leaves the checkpoint untouched and re-chains with a delay; an invalid token clears itself and re-fetches as a full read inside the same execute(); anything else marks the checkpoint failed and returns without throwing, so one bad mailbox cannot take a batch job down. Config — page size, the per-transaction page ceiling, which Named Credential to call through — lives in a Custom Metadata Type, deployable and inspectable the same way the classes are. Every page also publishes a Platform Event, so a monitor component can show a run live without polling.

### The trade

Custom Object over Platform Cache for the checkpoint, deliberately: Platform Cache is faster but evaporates on a cache eviction or an org restart, and a checkpoint that quietly disappears mid-sync is worse than one that is a little slower to read. HttpCalloutMock replaces every external call in tests — this repository never contacts a real mail provider, in tests or otherwise. The comparison table below is the actual content of this page; read it end to end rather than the prose above, which only sets up why it exists.

