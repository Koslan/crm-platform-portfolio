---
tab: "zoho"
title: "Zoho"
route: "#/zoho"
status: "в сборке, тесты зелёные — 256 проверок"
source:
  lede: "src/app.html · vZoho()"
  scale: "src/app.html · SCALE"
  sections: "src/app.html · ZOHO_GROUPS"
  new_pages: "src/app.html · REC (enrichment, cockpit)"
---

# Zoho — полный текст вкладки

Всё, что стоит на странице, слово в слово из сборки: лид, плашка масштаба,
шесть секций с абзацами и всеми карточками, плюс полный текст двух новых
страниц. Правки вносим здесь, потом переносим в `src/app.html`.

---

## Шапка

**Eyebrow:** Platform

**H1:** Zoho

**Лид:**

> Three years as the sole engineer and accountable owner of a production CRM: data model, widgets, integrations, automation and the release process. The demos here run in your browser against an emulated platform — the same query interpreter, the same limits, the same write validation. Below, the work in the six pieces it actually came in.

## Плашка масштаба

- **70+** — widgets
- **50+** — custom modules
- **hundreds** — Deluge functions
- **dozens** — canvas layouts & client scripts
- **7+** — external systems

Числа подтверждены 30.08. «~1 500 функций» из плашки убрано — осталось
«сотни Deluge-функций», как порядок величины.

---

# Шесть секций

## 1 · CONTACTS

**Заголовок:** Cleaning up contacts, deduplication and enrichment

**Абзац:**

> Contacts had been created situationally for years, so duplicates were everywhere — worst where one person held roles at several sub-companies of the same group. The fix was a model rather than a clean-up script: contacts and accounts joined many-to-many, every existing record migrated onto it, and enrichment wired in so a provider credit is spent once. Every account went through the analysis; new contacts now arrive through the same identity rules.

**Карточки (демо):**

- **Contact enrichment** — `Live demo` — #/p/enrichment
  <br>Provider people matched against the CRM through four identity keys before a single one is written.

**Строки списком:**

- **One person, several employers** — `Planned` — #/p/contact-model
  <br>Junction modules instead of text-field pseudo-relations, and the migration that put every existing contact onto them.
- **One screen, two platforms** — `Live demo` — #/p/sf-lwc
  <br>The employment-history widget, ported to a Lightning Web Component, next to the Zoho original.

**Подпись над строками с других вкладок:** Also on the Salesforce tab

---

## 2 · EVENTS

**Заголовок:** Trade shows: booking, meetings, follow-up

**Абзац:**

> One system takes an industry event from preparation, through the floor, to post-analysis. Meetings are booked and tracked from the CRM, run from a phone at the venue, and reached through the tools people already live in — with a calendar sync that keeps every side honest.

**Карточки (демо):**

- **Event campaign page** — `Live demo` — #/p/event
  <br>A campaign record with three widgets and the five-step booking wizard.
- **Meeting board (mobile)** — `Live demo` — #/p/board
  <br>A phone-sized schedule with lane layout and an on-screen console.

**Строки списком:**

- **Delta sync across seventeen calendars** — `Planned` — #/p/calendar-sync
  <br>A checkpoint written on every page, because the language has no while loop and a run can die on page forty.
- **Building for a surface with no devtools** — `Planned` — #/p/mobile-canvas
  <br>An on-screen console with a ring buffer, and the bugs it was the only way to catch.

---

## 3 · AI

**Заголовок:** AI in the CRM: recaps, loss analysis, drafted text

**Абзац:**

> Recaps write themselves from what a meeting left behind, lost deals get a two-stage analysis against a corporate taxonomy, and inside the widgets a model drafts the text where a standard, careful wording matters more than a fast one. Each of them records what it did somewhere a person can argue with it.

**Карточки (демо):**

- **Meeting recap from chat** — `Emulated flow` — #/p/chat-recap
  <br>A two-card wizard in a chat client, writing a structured recap into the CRM.

**Строки списком:**

- **Where the widgets let a model write** — `Planned` — #/p/ai-in-widgets
  <br>The places in the CRM interface where a standard, careful wording matters more than a fast one.
- **Loss analysis in two stages** — `Write-up` — #/p/loss-analysis
  <br>Six evidence sources, a 38-cause taxonomy in the prompt, a human-correctable middle stage.
- **A CRM agent with an action journal** — `Live demo` — #/p/agent-journal
  <br>Every action writes a before/after diff to a module. An opaque agent does not survive its first disputed edit.

**Подпись над строками с других вкладок:** Also on the AI tab

---

## 4 · SYNC

**Заголовок:** Connecting Teams, Slack and Jira to the CRM

**Абзац:**

> CRM tasks and tracker issues talk to each other directly, and the topic chats in Teams and Slack feed the tracker: comments are collected, filed against the right issue, and never retyped by hand. The hard part is not the transport — it is deciding which system is right when two of them disagree.

**Карточки (демо):**

- **Chat to issue tracker** — `Emulated flow` — #/p/chat-tracker
  <br>A tagged reply becomes a public or role-restricted, deduplicated comment on a Jira issue.

**Строки списком:**

- **Crossing between systems that do not agree** — `Write-up` — #/p/cross-system
  <br>Eight integrations, and the rule each one needed.
- **Teams → CRM → Jira, and who owns what** — `Planned` — #/p/teams-jira
  <br>An ownership matrix across four systems, a text contract as the mapping mechanism, and idempotency on both arms.

---

## 5 · AUTOMATION

**Заголовок:** Weekly reports, reminders and workflows

**Абзац:**

> Hundreds of automations run the routine — workflows, blueprints, schedulers, external flows and server-side jobs. Sales leads get their weekly picture assembled for them; individual salespeople get the reminders that keep records moving, delivered where they already work rather than in an inbox nobody opens.

**Карточки (демо):**

- **Sales cockpit** — `Live demo` — #/p/cockpit
  <br>Open value, overdue deals, agreements waiting and tasks past due — for the team or for one person.

**Строки списком:**

- **The week that reports itself** — `Planned` — #/p/reporting
  <br>Weekly summaries for sales leads and per-person reminders, assembled on a schedule and delivered where people already work.

---

## 6 · PLATFORM

**Заголовок:** Org tooling, CI/CD, deployment and the external server

**Абзац:**

> Tooling for the org itself: extraction the platform refuses to offer, a config history it never kept, an audit that names the limits of its own method — and, for the operations that do not fit inside the org at all, an external server that takes the heavy work and hands the result back.

**Карточки (демо):**

- **Org health report** — `Live demo` — #/p/orghealth
  <br>1,240 functions placed against five entry channels.
- **Solution map** — `Live demo` — #/p/solution
  <br>Service lines against business units, coloured by the latest deal on each cell.

**Строки списком:**

- **Building tooling for an org that will not export itself** — `Write-up` — #/p/org-tooling
  <br>Extraction, a config snapshot, a function audit, an external-call inventory, a credential boundary — five problems, one method.
- **A deployment pipeline for a platform with no export** — `Planned` — #/p/deluge-cicd
  <br>Snapshot, review, delivery — and a read-back that calls a save successful only when an independent read returns the same hash.
- **Seventy widgets as one system** — `Planned` — #/p/widget-system
  <br>A shared design system, a versioned component library, and an offline harness that stubs the platform SDK.
- **The work that does not fit inside the org** — `Planned` — #/p/external-server
  <br>Complex operations moved to an external server, and the line for deciding what goes out.

---

# Две новые страницы — полный текст

Это не новый код: `CRMPages.Enrichment` и `CRMWidgets3.Cockpit` были написаны
давно, но открывались только как вкладки внутри чужих записей. Им добавлены
записи в `REC`, `PAGE` и `ZOHO_GROUPS`; `wireRecord` теперь ищет хост не только
в `CRMPages`, но и в `CRMWidgets2/3`.

---

## Contact enrichment · `#/p/enrichment`

**H1:** Contact enrichment

**Лид:**

> Provider people matched against the CRM through four identity keys before a single one is written.

**Блок «The record»** — сюда монтируется сам виджет.

**What to try**

- Load from the provider with a seniority or a title filter — people arrive in pages, not all at once.
- Read the statistics strip: direct matches, matches found through the account hierarchy, and matches recovered by profile URL are counted apart, because they are three different kinds of certainty.
- Open Group structure. Existing contacts are gathered across the whole account group, not just this account — a person who moved to a sister company is still the same person.
- Open a profile and read the employment timeline the match was made against.
- Switch to Provider link: the account itself is matched to a provider organisation before any person under it is.

**Why it was not straightforward**

> Duplicates were the normal state rather than an accident — records had been created situationally for years, and the worst cases were people holding roles at several sub-companies of one group. Four identity keys are applied in sequence, the last a normalised profile URL, and that URL search is chunked to fourteen conditions because fourteen is the platform ceiling. Candidates are gathered through the account hierarchy rather than the single account, and provider quota is respected by batching with three retry steps: the aim is to spend a credit once and never ask the same question twice.

---

## Sales cockpit · `#/p/cockpit`

**H1:** Sales cockpit

**Лид:**

> Open value, overdue deals, agreements waiting and tasks past due — for the team or for one person.

**Блок «The record»** — сюда монтируется сам виджет.

**What to try**

- Switch the scope from Everyone to a single salesperson. Every counter above recalculates against that scope.
- Read the rules in the header: overdue means a closing date already in the past, warning means it closes within seven days. The rule is printed, not implied.
- Move between Pipeline, Legal and Methodology — the same team seen through three different obligations.

**Why it was not straightforward**

> Nothing in the platform draws this screen: the counters, the scope switch and the overdue and warning rules are hand-built over deals, agreements and tasks. The rules sit in the header rather than inside a report definition, because a number nobody can argue with is a number nobody acts on.

---

# Что где стоит — сводка

## Живое сейчас (8 страниц)

| Страница | Секция | Вид |
| --- | --- | --- |
| Contact enrichment | CONTACTS | live — **новая** |
| One screen, two platforms | CONTACTS | live, живёт на вкладке Salesforce |
| Event campaign page | EVENTS | live |
| Meeting board (mobile) | EVENTS | live |
| Meeting recap from chat | AI | emul |
| Loss analysis in two stages | AI | write-up, живёт на вкладке AI |
| A CRM agent with an action journal | AI | live, живёт на вкладке AI |
| Chat to issue tracker | SYNC | emul |
| Crossing between systems that do not agree | SYNC | write-up |
| Sales cockpit | AUTOMATION | live — **новая** |
| Org health report | PLATFORM | live |
| Solution map | PLATFORM | live |
| Building tooling for an org that will not export itself | PLATFORM | write-up |

## Помечено Planned (8 страниц)

Каждая открывается честной заглушкой «not built yet» — «It is listed so the gap
is visible rather than implied». Ни одна не ведёт в 404.

| Страница | Секция | Откуда брать материал |
| --- | --- | --- |
| One person, several employers | CONTACTS | achievements §25, твой рассказ про many-to-many |
| Delta sync across seventeen calendars | EVENTS | achievements §1 |
| Building for a surface with no devtools | EVENTS | каталог граблей, раздел 10 |
| Where the widgets let a model write | AI | **нужен твой перечень мест** |
| Teams → CRM → Jira, and who owns what | SYNC | TEAMS_ZOHO_JIRA_ARCHITECTURE + `_rework/teams-jira.md` |
| The week that reports itself | AUTOMATION | твой рассказ (договорились: общая статья) |
| A deployment pipeline for a platform with no export | PLATFORM | PORTFOLIO_CASE_RU |
| Seventy widgets as one system | PLATFORM | inventory-widgets.md |
| The work that does not fit inside the org | PLATFORM | твой рассказ про внешний сервер |

## Открытые вопросы

1. **AI-текст в виджетах** — нужен перечень мест в интерфейсе, где модель пишет
   текст. Единственный пункт, который остался с прошлого согласования.
2. **Пост-анализ событий** — договорились отложить, зайдём отдельно по аналитике.
3. **Хардкод id аккаунта** для страницы enrichment — сейчас константа
   `'6100000000008'`. Работает (генератор сидированный), но лучше выбирать по
   данным, как это делает solution map. Мелочь, поправлю.

## Что изменилось в коде

| Файл | Что |
| --- | --- |
| `src/app.html` | `ZOHO_GROUPS` — шесть секций вместо трёх групп; `vZoho()` переписан; `SCALE`; CSS (`.scale`, `.alsolab`, одиночная карточка); `REC` +2 записи; `PAGE` +2; `wireRecord` ищет хост в трёх бандлах; `TEST_COUNT` 240 → 256 |
| `smoke-zoho.mjs` | новый файл, 16 проверок |
| `package.json` | `smoke-zoho.mjs` добавлен в `npm test` |
| `content/tabs/zoho.md` | док обновлён под новую структуру |

## Перед деплоем

⚠️ Не запускай `push-portfolio.cmd` как есть — он делает `rmdir /s /q
crm-portfolio-site` и распаковывает `crm-portfolio-site.tar.gz`, то есть затрёт
эти правки. Коммить и пушить из рабочей копии, либо сначала пересобрать тарбол
из неё. CI сам делает build и `npm test`, `dist/` в гит не идёт.
