# Переработка публичной версии портфолио — сводка

Ветка `rework/zoho-public-v2`, сентябрь 2026, поверх локальной ветки `content-rework2`
(e933b98 — 25 коммитов после того, что лежит на GitHub: `content/`, `prompts/`, fidelity-проходы,
переименованные заметки `cross-system`, `org-tooling`, `widget-system`, `contact-model`,
`deluge-cicd`, проверка inline-скриптов в `build.mjs`). Ничего из этого не потеряно.

Цель прохода: публичный сайт читается как портфолио опытного Zoho CRM / CRM Platform / Integration
Engineer, а не как демонстрация того, как сложно сделан сам сайт. Всё, что скрыто, осталось в
репозитории и собирается отдельной сборкой.

## Что изменено

**Навигация и разделы.** Публично три раздела: About, Zoho, Contact. Переключатель
`PUBLIC_SECTIONS` в начале главного скрипта `src/app.html`; выключенный раздел не рисует вкладку,
не регистрирует свои страницы, а его маршруты (включая старые `#/p/<id>`) уводят на главную.
Страницы с `kind:'plan'` регистрируются только когда включены и AI, и Full-stack — публично
ничего «planned» нет. `build.mjs --all` включает все разделы и пишет `dist-all/` — по нему
гоняются тесты скрытых разделов (`npm run test:hidden`), так что код продолжает жить и
проверяться. Единственная AI-страница, без которой не обходится Zoho-кейс — `chat-recap` —
при выключенном AI регистрируется под Zoho.

**Zoho — новая информационная архитектура.** Вместо шести групп карточек: обзор из пяти
направлений (platform development, custom interfaces, integrations, data & reliability, platform
engineering), плашка масштаба, одна большая диаграмма платформы как системы, индекс из семи
flagship-кейсов, сетка интерактивных примеров, список технических заметок, дисклеймер про
синтетические данные. Контент кейсов — в новом модуле `src/cases.js` (только данные).

**Семь кейсов** по единой структуре: summary (What / Scale / My role / Key topics) → Context +
Key facts в две колонки → Architecture с диаграммой → Constraints → Implementation →
Reliability and failure handling (таблица) → Data ownership and security (где уместно) →
My responsibility → Result → Interactive example (встроенное демо) → More examples →
Technical notes → Related cases. На мобильном всё в одну колонку.

**Существующие страницы стали подчинёнными.** Демо — «Interactive example», заметки —
«Technical note»; у каждой есть родительский кейс (`DEMO_PARENT` + `examples`/`notes` кейса),
ссылка «назад» ведёт в него, prev/next ходят внутри кейса. Ссылка на заметку может вести на её
раздел: `#/p/cross-system/who-owns`, `#/p/cross-system/refuse`, `#/p/cross-system/resume`.
На демо-страницах «What to try» поднято над виджетом; карточка события открывается на вкладке
Contacts, а не на Overview. Чипы Live demo / Emulated flow / Write-up / Planned и material-плашки
(`MAT`) убраны с публичных страниц.

**About.** Hero перепозиционирован (Zoho CRM · platform & integration engineer · Warsaw), CTA:
View Zoho work / Download CV / LinkedIn / Email, GitHub — вторичный (контакт и футер).
Разделы: featured work (индекс кейсов), capabilities (шесть групп по инженерным capability,
истории по клику в формате «Where I used it» без шаблона Task/Built/Result), how I run a platform
(6 карточек), experience (Room 8 в прошедшем времени, «2023 — 2026»), credentials & education,
contact. Удалены секции «This site, live» (счётчики тестов и демо), терминал и карта интеграций
с узлами AI/Salesforce.

**Contact** — отдельная страница: email, LinkedIn, CV, WhatsApp, GitHub, языки, формат
сотрудничества, и тот же индекс кейсов «если у вас конкретная проблема».

**Диаграммы.** Движок `src/diagrams.js` получил два HTML-архетипа, которые переносятся по строкам
вместо масштабирования SVG: `chain` (переписан — раньше подписи налезали на боксы, а семь шагов
ужимались до нечитаемого) и новый `layers` (слоистая архитектура с бэндами, стрелками между
слоями, параллельными колонками, паузой во времени и обратной стрелкой). Его правки wrapLabel и
воронки сохранены. Ссылка из detail-панели может вести и на демо (`p/<id>`), и на кейс
(`zoho/<slug>`). Матрица authority показывает в легенде только используемые состояния; строки
«Unnamed» из матрицы убраны, ограничение названо одной сноской.

**Тексты.** Полный аудит публичных строк: убраны «this site», «running every demo on this site»,
«For this site I wrote an interpreter», упоминания эмулятора, харнесса, Playwright и числа тестов
как достижений; «2023—now» заменено на «2023—2026», Room 8 — апрель 2023 – август 2026, бейдж
«current» снят, глаголы в прошедшем времени. Известное ограничение виджета enrichment
переформулировано как limitation, а не как «missing here on purpose»; «Still open» про 218 с
против 120 с — как ограничение с проектным ответом. Дисклеймер про синтетические данные — одной
фразой на Zoho-лендинге, в футере и на каждой демо-странице, плюс короткая страница
`#/about-demos`.

**Прочее.** `<title>` и og:description — про Zoho; `public/og.png` перегенерирован;
`.gitignore` — `dist-all/`; `tools/shots.mjs` — скриншоты любого маршрута на любом вьюпорте
для визуального QA; комментарий в `src/event-page.js`, называвший исходный модуль,
вычищен; `README.md` обновлён.

## Что скрыто (код сохранён)

| Раздел | Что именно | Где лежит |
| --- | --- | --- |
| Salesforce | вкладка, `sf-lwc` (LWC-порт), страница `sf-sync`, группа Salesforce в capability grid, SF-истории навыков | `SF_ITEMS`, `viewSFLWC`, `viewSFSync`, `src/sflwc.js`, `platform/mockSF.js`, `salesforce/`, `smoke-sf.mjs` |
| AI | вкладка, `agent-journal` (демо), заметки `code-intelligence`, `ai-workflow`, `loss-analysis`, `team-intelligence`, `mcp-product`, группа AI в capability grid | `AI_GROUPS`, `src/aijournal.js`, `CASES`, `smoke-ai.mjs` |
| Full-stack | вкладка, `harness`, `generator`, `ci-guards`, `site` (страница «как сделан сайт»), группа Backend | `FS_ITEMS`, `CASES`, `ABOUT`/`vHow` |
| Planned | `calendar-sync`, `mobile-canvas`, `teams-jira`, `reporting`, `external-server`, `ai-interface-assistance` — старые адреса ведут в кейс, который покрывает тему | `SHOW_PLANNED`, `RETIRED` |
| About | терминал (`termAnswer`), счётчики «This site, live», карта интеграций `imapSVG` | функции остались в `src/app.html`, не вызываются |

`chat-recap` — единственная страница AI-группы, оставшаяся публичной: в кейсе Teams AI показан как
одна детерминированная стадия реального CRM-процесса, а не как «AI-секция». Заметка
`team-intelligence` (пост-митинговая аналитика) осталась скрытой вместе с вкладкой — стоит решить,
не место ли ей в кейсе 03.

## Какие материалы объединены в кейсы

| Кейс | URL | Встроено | Примеры | Заметки |
| --- | --- | --- | --- | --- |
| 01 Custom CRM interfaces | `#/zoho/widgets` | — | event, cockpit, solution, board, enrichment | widget-system |
| 02 Multi-system synchronisation and CRM orchestration | `#/zoho/orchestration` | — | event, board | cross-system → who-owns, resume |
| 03 From meeting data to CRM automation — with Teams as the control surface | `#/zoho/teams-crm` | chat-recap | chat-recap, board | cross-system → refuse, resume |
| 04 Teams → CRM → Jira: one thread, three systems, and who owns what | `#/zoho/jira-sync` | chat-tracker | chat-tracker | cross-system → resume, who-owns |
| 05 Contact enrichment and identity resolution | `#/zoho/enrichment` | enrichment (вкладка Contact enrichment) | enrichment | contact-model, cross-system → refuse |
| 06 Zoho platform engineering | `#/zoho/platform-engineering` | orghealth | orghealth | org-tooling, deluge-cicd |
| 07 Data authority, reconciliation and migration | `#/zoho/reconciliation` | event (вкладка Calendar sync) | event | cross-system → who-owns, contact-model |

Публичных страниц-примеров девять (event, board, cockpit, solution, enrichment, orghealth,
chat-recap, chat-tracker + встроенные), заметок пять (cross-system, org-tooling, deluge-cicd,
widget-system, contact-model). Тест проверяет, что у каждой есть родительский кейс.

Алиасы, которые тоже работают: `#/zoho/graph-delta-sync`, `#/zoho/sync`, `#/zoho/calendar-sync` →
orchestration; `#/zoho/interfaces` → widgets; `#/zoho/teams` → teams-crm; `#/zoho/jira` → jira-sync;
`#/zoho/platform` → platform-engineering; `#/zoho/data`, `#/zoho/migration` → reconciliation.
Все старые адреса (`#/rec/*`, `#/demo/*`, `#/case/*`, `#/flow/*`, `#/how`, `#/p/site`,
`#/p/delta-sync`, `#/p/teams-sync`, `#/p/authority`, …) редиректят — карта в `RETIRED`.

## Какие диаграммы добавлены

- Zoho-лендинг: платформа как одна система (external systems → integration services → Zoho CRM →
  automation → custom interfaces), узлы с описаниями и ссылками на кейсы и примеры.
- 01: Zoho record → embedded widget → Zoho SDK → Deluge service layer → CRM and external systems.
- 02: external systems → integration / sync layer → Zoho CRM domain → automation → custom
  interaction layer (плюс существующая цепочка delta sync в заметке cross-system).
- 03: meeting ecosystem → collection / matching → CRM orchestration → [Zoho CRM | Microsoft Teams]
  с обратной стрелкой callback'а.
- 04: Microsoft Teams → resolution → Zoho CRM → Jira с обратным потоком комментариев и статуса.
- 05: sources → identity resolution → decision → Zoho CRM.
- 06: цепочка deploy-пайплайна discover → snapshot → analyse → lint → save → read back (SHA-256)
  → test run → evidence с точками отказа.
- 07: two sources → matching → authority map → sync state per row → repair.

## Какие утверждения изменены после фактчека

| Было | Стало | Почему |
| --- | --- | --- |
| «15 live demos», «21 write-ups», счётчики тестов, число демо в capability-историях | убраны | не сходились с фактом и/или рассказывали про сайт |
| «70+ widgets across 10 modules» | «70+ widgets across the org’s modules» | число модулей ранее признано неподтверждённым |
| «~1,500 functions», «roughly 1,500», «Fifteen hundred functions in ten to fifteen minutes» | «more than a thousand» / «1,000+» | точное число чужого орга не публикуем; 1,240 остаётся только как размер сгенерированного орга и так подписано |
| «Thirty-five services» | «Dozens of services» | абсолютная метрика чужого орга |
| «2023—now», «current», «since 2023» | «2023—2026», апрель 2023 – август 2026 | Room 8 закончился |
| «Sole technical owner» | «primary engineer and technical owner» | точнее по сути |
| «Dozens of custom … modules across a landscape approaching a hundred» | «Fifty-plus custom modules» | подтверждённое число |
| «Still open, and worth saying out loud» (218 с против 120 с) | ограничение и проектный ответ (resumable, ≤5 каналов за прогон) | публичная версия не показывает незавершённую работу; факт сохранён |
| Строки «Unnamed (never) 1/2», «Unnamed (cut)» в матрице | убраны; ограничение — одной сноской | читалось как незаполненный черновик |
| «Known gap … missing here on purpose» в виджете enrichment | «Limitation: …» | ограничение продакшен-инструмента, не незавершённость демо |
| «7+ connected systems» (первый проход) | «10+ connected systems» | взято из ветки content-rework2 |

Не менялось и не выдумывалось: 17 ящиков, чекпойнт на страницу, три класса ошибок, 40/60 пороги,
четыре ключа дедупликации, пять каналов входа, 25-минутный снапшот, SHA-256 read-back,
батчи 100/90/200/100, 218 с против 120 с, «two years of unattended operation», 400-строчный ring
buffer, thirteen meetings three hours wrong.

## Проверка

`npm run verify` = `build` → `test` (10 файлов, 362 проверки; новый `smoke-public.mjs`: семь
кейсов, встраивание демо, алиасы, недоступность скрытых маршрутов, запрещённые строки на всех
публичных страницах, привязка каждой страницы к кейсу, back/forward, 390/430 px без
горизонтального скролла, шапка в одну строку, ноль console errors) → `build:all` → `test:hidden`
(AI, Salesforce; 47 проверок). CI (`deploy.yml`) делает то же и по-прежнему валит сборку на
утёкшем идентификаторе. Проверка inline-скриптов из `content-rework2` сохранена.

Визуально проверено скриншотами (`tools/shots.mjs`) на 1440×900, 1280×800, 390×844, 430×932 —
все публичные маршруты, без переполнений и ошибок консоли.

## Что осталось на Phase 2

- `content/` (markdown-экспорт текстов) сделан до этого прохода: `_export.mjs` не знает про
  `src/cases.js`, кейсы и выключенные разделы. Либо доучить экспортёр, либо считать `content/`
  снимком ветки `content-rework2`.
- Скриншоты для карточек интерактивных примеров (сейчас три встроенных снимка — event, solution,
  board — используются только в блоке опыта; сетка примеров текстовая, чтобы не раздувать страницу).
- Вынести датасет (≈1.1 MB) из инлайна в отдельный файл с отложенной загрузкой — вес страницы
  всё ещё ~2 MB.
- Вернуть Salesforce и AI отдельными проходами: переключатель есть, тесты живут; нужен контент
  того же формата (кейс с диаграммой), в том числе Google Drive ↔ Salesforce / AppExchange.
- Диаграммы к демо-страницам, где их нет (solution, board, sf-lwc — по анализу 30.08).
- CV PDF: в шапке репозиторного `Kostiantyn_Buriak_CV.pdf` период Room 8 всё ещё «April 2023 –
  Present» — обновить файл.
- Подписи в демо `chat-tracker` (`PITCH`, `Teams_Messages`, `In_Jira`) — названия из
  первоисточника; решить, оставлять ли их.

## Прямые ссылки для Upwork-предложений

```
https://koslan.github.io/crm-platform-portfolio/#/zoho
https://koslan.github.io/crm-platform-portfolio/#/zoho/widgets
https://koslan.github.io/crm-platform-portfolio/#/zoho/orchestration
https://koslan.github.io/crm-platform-portfolio/#/zoho/teams-crm
https://koslan.github.io/crm-platform-portfolio/#/zoho/jira-sync
https://koslan.github.io/crm-platform-portfolio/#/zoho/enrichment
https://koslan.github.io/crm-platform-portfolio/#/zoho/platform-engineering
https://koslan.github.io/crm-platform-portfolio/#/zoho/reconciliation
https://koslan.github.io/crm-platform-portfolio/#/contact
```

Под конкретную проблему клиента: Zoho API / лимиты / синк → orchestration или platform-engineering;
миграция или расхождения данных → reconciliation; кастомный виджет → widgets; дубли и обогащение →
enrichment; Teams / Jira → teams-crm / jira-sync.
