---
page: "cockpit"
title: "Sales cockpit"
type: "live-demo (общий шаблон viewRecord)"
tab: "zoho"
group: "Weekly reports, reminders and workflows"
route: "#/p/cockpit"
kind: "live"
public: true
public_tab: "zoho"
case: "#/zoho/widgets"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"cockpit\""
  body: "src/app.html · REC · id=\"cockpit\""
---

# Sales cockpit

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Open value, overdue deals, agreements waiting and tasks past due — for the team or for one person.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> The operations screen a head of sales lives in: open value, overdue deals, agreements waiting and tasks past due — for the whole team or for one person.

## What to try

- Switch the scope from Everyone to a single salesperson. Every counter above recalculates against that scope.
- Read the rules in the header: overdue means a closing date already in the past, warning means it closes within seven days. The rule is printed, not implied.
- Move between Pipeline, Legal and Methodology — the same team seen through three different obligations.

## Why it was not straightforward

Nothing in the platform draws this screen: the counters, the scope switch and the overdue and warning rules are hand-built over deals, agreements and tasks. The rules sit in the header rather than inside a report definition, because a number nobody can argue with is a number nobody acts on.
