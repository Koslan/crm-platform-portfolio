---
page: "agent-journal"
title: "A CRM agent with an action journal"
type: "live-demo (свой рендерер PAGE)"
tab: "ai"
group: "AI in the CRM"
route: "#/p/agent-journal"
kind: "live"
diagrams: 0
source:
  nav: "src/app.html · AI_ITEMS · id=\"agent-journal\""
  body_case: "src/app.html · CASES['AI in the CRM'][1]"
  body_render: "src/app.html · PAGE['agent-journal'].render()"
warning: "CASES-запись для этой страницы НЕ рендерится: PAGE перекрывает CASES в vItem()"
---

# A CRM agent with an action journal

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Every action writes a before/after diff to a module. An opaque agent does not survive its first disputed edit.
>
> **Подзаголовок страницы** (`sub`):
> Designed and built for this portfolio; not run against a production org. Said plainly, because it would come out anyway.

## Текст страницы

_Проза этой страницы живёт прямо в разметке рендерера — правьте по совпадению строки._

# Agent journal

A command bar, a parse-and-validate step against the live field list, a risk gate that waits for a person on the fields that matter, and the journal every action writes to — a module with filters, not a log file.

Live demoPre-recorded parsingWrites to the emulator

## The screen

## ⚠️ Мёртвый текст: CASES-запись, которая не рендерится

Роутер (`vItem`) отдаёт приоритет `PAGE` над `CASES`, поэтому этот текст на сайте не виден. Либо удалить, либо перенести в рендерер выше.

### Three problems, one screen

Recognition mangles mixed-language vocabulary and company names; a write-capable agent can be wrong with no control loop, because the platform’s own audit trail only exports through the interface; and a chat command names no record. The screen below is the answer to all three at once, not a description of one — try it.

### Why a journal and not a log file

Every action writes to a module, not a file: time, channel, utterance, parsed intent, target record, a before-and-after diff, the result. A module is a screen with filters. Above a risk threshold — a fixed list of fields, not a judgement the model makes — the diff is shown and the agent waits for a person.

### The trade

The journal duplicates what the record already holds; taken knowingly, because the alternative is an agent nobody can audit. What stays true even now it is live: nothing here runs against a real org, and the parsing is pre-recorded rather than a live model call, exactly like the rest of this site.

