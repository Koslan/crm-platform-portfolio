---
tab: "zoho"
title: "Zoho"
route: "#/zoho"
items: 8
source:
  lede: "src/app.html · vZoho()"
  items: "src/app.html · ZOHO_GROUPS"
---

# Zoho

## Лид страницы

Platform Zoho The core of the last six years: widgets on record pages, tooling for the org itself, and integrations that cross into Teams, Jira and calendars. Six screens run here in the browser against an emulated platform; the two write-ups carry the diagrams and the trades.

## Карточки

| id | Заголовок (`t`) | Подпись (`s`) | Вид |
| --- | --- | --- | --- |
| [`event`](../pages/event.md) | Event campaign page | A campaign record with three widgets and the five-step booking wizard. | live |
| [`solution`](../pages/solution.md) | Solution map | Service lines against business units, coloured by the latest deal on each cell. | live |
| [`board`](../pages/board.md) | Meeting board (mobile) | A phone-sized schedule with lane layout and an on-screen console. | live |
| [`orghealth`](../pages/orghealth.md) | Org health report | 1,240 functions placed against five entry channels. | live |
| [`org-tooling`](../pages/org-tooling.md) | Building tooling for an org that will not export itself | Extraction, a config snapshot, a function audit, an external-call inventory, a credential boundary — five problems, one method. | note |
| [`chat-recap`](../pages/chat-recap.md) | Meeting recap from chat | A two-card wizard in a chat client, writing a structured recap into the CRM. | emul |
| [`chat-tracker`](../pages/chat-tracker.md) | Chat to issue tracker | A tagged reply becomes a public or role-restricted, deduplicated comment on a Jira issue. | emul |
| [`cross-system`](../pages/cross-system.md) | Crossing between systems that do not agree | Eight integrations, and the rule each one needed. | note |

## Группы (сейчас не показываются на индексе)

Индекс Zoho рендерится одной сеткой; группы остались в `ZOHO_GROUPS` и дают хлебную крошку и prev/next на страницах элементов.

### Widgets & interfaces

Screens built inside the CRM — the platform gives you an iframe and a query API, everything else is hand-built.

Входят: `event`, `solution`, `board`

### Platform engineering

Tooling for the org itself: extraction the platform refuses to offer, a config history it never kept, an audit that names the limits of its own method.

Входят: `orghealth`, `org-tooling`

### Integrations & sync

Teams, calendars, Jira, enrichment providers — flows that survive timeouts, throttling and payloads that are simply gone if rejected.

Входят: `chat-recap`, `chat-tracker`, `cross-system`

