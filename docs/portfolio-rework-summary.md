# Переработка публичной версии портфолио — сводка

Ветка `rework/zoho-public-v2`, сентябрь 2026, поверх локальной ветки `content-rework2`
(e933b98 — 25 коммитов после того, что лежит на GitHub: `content/`, `prompts/`, fidelity-проходы,
переименованные заметки `cross-system`, `org-tooling`, `widget-system`, `contact-model`,
`deluge-cicd`, проверка inline-скриптов в `build.mjs`). Ничего из этого не потеряно.

Цель прохода: публичный сайт читается как портфолио опытного Zoho CRM / CRM Platform / Integration
Engineer, а не как демонстрация того, как сложно сделан сам сайт. Всё, что скрыто, осталось в
репозитории и собирается отдельной сборкой.

## Что изменено

**Навигация и разделы.** Публично четыре пункта: About, Zoho, Screens, Contact. Переключатель
`PUBLIC_SECTIONS` в начале главного скрипта `src/app.html`; выключенный раздел не рисует вкладку,
не регистрирует свои страницы, а его маршруты (включая старые `#/p/<id>`) уводят на главную.
Страницы с `kind:'plan'` регистрируются только когда включены и AI, и Full-stack — публично
ничего «planned» нет. `build.mjs --all` включает все разделы и пишет `dist-all/` — по нему
гоняются тесты скрытых разделов (`npm run test:hidden`), так что код продолжает жить и
проверяться. AI-страницы, которые по сути работа в CRM (`AI_UNDER_ZOHO`), при выключенном AI
регистрируются под Zoho.

**Zoho — новая информационная архитектура.** Вместо шести групп карточек: обзор из шести
направлений (platform development, custom interfaces, integrations, data & reliability, platform
engineering, AI inside CRM workflows), плашка масштаба, одна большая диаграмма платформы как
системы, индекс из восьми flagship-кейсов, сетка интерактивных примеров, список технических
заметок, дисклеймер про синтетические данные. Контент кейсов — в новом модуле `src/cases.js`
(только данные).

**Восемь кейсов** по единой структуре: summary (What / Scale / My role / Key topics) → Context +
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
(6 карточек), experience (Room 8 «2023 — present»), credentials & education,
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

**Кейс 08 — AI inside CRM workflows** (`#/zoho/ai-workflows`, алиасы `ai`, `agents`, `llm`,
`openai`). Собран под вакансии типа «AI systems engineer — OpenAI agents, CRM & API integrations»
только из того, что было: production-пайплайн рекапов (Teams/Krisp → Claude → корпоративный
стандарт → человек принимает → запись по полям), серверный rephrase в виджетах (ключ не в
странице, Undo), двухстадийный loss-analysis (шесть источников, таксономия из 38 причин; роль —
дизайн и прототип, продакшен делал другой инженер, слабость прототипа — без structured output —
названа), write-capable ассистент с risk gate и журналом (честно: прототип для портфолио против
эмулятора), MCP как граница доступа (используется org-тулингом), Zia оценена. Отдельный раздел
«где модели можно решать, а где нет» — ответ на screening-вопрос про разделение AI reasoning и
детерминированных правил. Встроенный пример — agent journal с плашкой «что это». Пять AI-страниц
(`chat-recap`, `agent-journal`, `loss-analysis`, `mcp-product`, `code-intelligence`) публичны под
Zoho (`AI_UNDER_ZOHO`); `team-intelligence`, `ai-workflow`, plan-страница остаются скрытыми.
В capability-сетке появилась группа «AI in CRM workflows»; истории `AI-assisted development` и
`MCP` переписаны без ссылок на сайт. В диаграмме платформы — узлы «Claude · OpenAI» и «Model stages».

**Тексты.** Полный аудит публичных строк: убраны «this site», «running every demo on this site»,
«For this site I wrote an interpreter», упоминания эмулятора, харнесса, Playwright и числа тестов
как достижений; «2023—now» заменено на «2023 — present» (по решению Кости от 6 сентября: Room 8
показывается как текущее место — «April 2023 – present», «Now — 2026» в колонке handover). Известное ограничение виджета enrichment
переформулировано как limitation, а не как «missing here on purpose»; «Still open» про 218 с
против 120 с — как ограничение с проектным ответом. Дисклеймер про синтетические данные — одной
фразой на Zoho-лендинге, в футере и на каждой демо-странице, плюс короткая страница
`#/about-demos`.

**UX-проход по доступу к экранам (6 сентября, после замера).** Замер показал, что до работающего
виджета нужно было два клика и 4–7 экранов прокрутки: на главной (8967 px) на первом экране не было
ни одного пути к демо, на Zoho-лендинге сетка примеров лежала на 4116 px из 5479, а встроенный экран
на кейсах — на 60–79% высоты страницы; кейсы 01 и 02 (про виджеты и оркестрацию) вообще не показывали
ни одного экрана. Что сделано:

- **Новый раздел `#/screens`** — «The screens, running»: все девять интерактивных примеров на одной
  странице, каждый с превью и указанием кейса, к которому относится. Один клик из шапки с любой
  страницы. Раздел живёт вместе с Zoho (`isPublic('screens')` смотрит на `PUBLIC_SECTIONS.zoho`).
- **Превью на карточках.** `tools/thumbs.mjs` фотографирует каждый пример прямо из собранного сайта
  (Chromium с `deviceScaleFactor: 0.5`, клип по хосту виджета, JPEG q70) и пишет `src/shots.js` —
  девять полосок, 186 КБ инлайном; страница выросла с 2191 до 2281 КБ. Карточка не может разойтись с
  тем, что открывает: она сгенерирована из него.
- **`See it running` под summary кейса** — пилюли со ссылками на его экраны, на 578–785 px от верха
  вместо 4700–7000. Кейсы 01 и 02 получили встроенный экран (карточка события на вкладках Contacts и
  Meetings соответственно).
- **Пятая кнопка в hero** — «See the screens».
- На item-странице убрано дублирование: имя кейса было и в ссылке «назад», и в мета-строке.
- Тест запрещённых строк разделён надвое: статусные ярлыки (`Planned` и т.п.) проверяются на обвязке
  страницы, а самореклама — везде; иначе встроенная карточка события роняла тест словом «Planned» в
  статусе митинга, то есть на данных CRM.

**Прочее.** `<title>` и og:description — про Zoho; `public/og.png` перегенерирован;
`.gitignore` — `dist-all/`; `tools/shots.mjs` — скриншоты любого маршрута на любом вьюпорте
для визуального QA; комментарий в `src/event-page.js`, называвший исходный модуль,
вычищен; `README.md` обновлён.

## Что скрыто (код сохранён)

| Раздел | Что именно | Где лежит |
| --- | --- | --- |
| Salesforce | вкладка, `sf-lwc` (LWC-порт), страница `sf-sync`, группа Salesforce в capability grid, SF-истории навыков | `SF_ITEMS`, `viewSFLWC`, `viewSFSync`, `src/sflwc.js`, `platform/mockSF.js`, `salesforce/`, `smoke-sf.mjs` |
| AI | вкладка Applied AI, заметки `ai-workflow` (про верификацию AI-разработки, с числом тестов) и `team-intelligence`, plan-страница `ai-interface-assistance` | `AI_GROUPS`, `CASES`, `smoke-ai.mjs` |
| Full-stack | вкладка, `harness`, `generator`, `ci-guards`, `site` (страница «как сделан сайт»), группа Backend | `FS_ITEMS`, `CASES`, `ABOUT`/`vHow` |
| Planned | `calendar-sync`, `mobile-canvas`, `teams-jira`, `reporting`, `external-server`, `ai-interface-assistance` — старые адреса ведут в кейс, который покрывает тему | `SHOW_PLANNED`, `RETIRED` |
| About | терминал (`termAnswer`), счётчики «This site, live», карта интеграций `imapSVG` | функции остались в `src/app.html`, не вызываются |

Пять страниц AI-группы публичны под Zoho — `chat-recap`, `agent-journal`, `loss-analysis`,
`mcp-product`, `code-intelligence` — потому что это работа в CRM, а не «AI-секция»; они входят в
кейсы 03, 06 и 08. `team-intelligence` остаётся скрытой (решение Кости).

## Какие материалы объединены в кейсы

| Кейс | URL | Встроено | Примеры | Заметки |
| --- | --- | --- | --- | --- |
| 01 Custom CRM interfaces | `#/zoho/widgets` | — | event, cockpit, solution, board, enrichment | widget-system |
| 02 Multi-system synchronisation and CRM orchestration | `#/zoho/orchestration` | — | event, board | cross-system → who-owns, resume |
| 03 From meeting data to CRM automation — with Teams as the control surface | `#/zoho/teams-crm` | chat-recap | chat-recap, board | cross-system → refuse, resume |
| 04 Teams → CRM → Jira: one thread, three systems, and who owns what | `#/zoho/jira-sync` | chat-tracker | chat-tracker | cross-system → resume, who-owns |
| 05 Contact enrichment and identity resolution | `#/zoho/enrichment` | enrichment (вкладка Contact enrichment) | enrichment | contact-model, cross-system → refuse |
| 06 Zoho platform engineering | `#/zoho/platform-engineering` | orghealth | orghealth | org-tooling, deluge-cicd, code-intelligence |
| 07 Data authority, reconciliation and migration | `#/zoho/reconciliation` | event (вкладка Calendar sync) | event | cross-system → who-owns, contact-model |
| 08 AI inside CRM workflows | `#/zoho/ai-workflows` | agent-journal (прототип, помечен) | agent-journal, chat-recap, board | loss-analysis, mcp-product |

Публичных страниц-примеров девять (event, board, cockpit, solution, enrichment, orghealth,
chat-recap, chat-tracker, agent-journal), заметок восемь (cross-system, org-tooling, deluge-cicd,
widget-system, contact-model, loss-analysis, mcp-product, code-intelligence). Тест проверяет, что
у каждой есть родительский кейс.

Алиасы, которые тоже работают: `#/zoho/graph-delta-sync`, `#/zoho/sync`, `#/zoho/calendar-sync` →
orchestration; `#/zoho/interfaces` → widgets; `#/zoho/teams` → teams-crm; `#/zoho/jira` → jira-sync;
`#/zoho/platform` → platform-engineering; `#/zoho/data`, `#/zoho/migration` → reconciliation;
`#/zoho/ai`, `#/zoho/agents`, `#/zoho/llm`, `#/zoho/openai` → ai-workflows.
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
- 08: evidence → deterministic assembly → model stage (ядро) → human decision → CRM write and trail.
- Лендинг: добавлены узлы «Claude · OpenAI» (external systems) и «Model stages» (integration services).

## Какие утверждения изменены после фактчека

| Было | Стало | Почему |
| --- | --- | --- |
| «15 live demos», «21 write-ups», счётчики тестов, число демо в capability-историях | убраны | не сходились с фактом и/или рассказывали про сайт |
| «70+ widgets across 10 modules» | «70+ widgets across the org’s modules» | число модулей ранее признано неподтверждённым |
| «~1,500 functions», «roughly 1,500», «Fifteen hundred functions in ten to fifteen minutes» | «more than a thousand» / «1,000+» | точное число чужого орга не публикуем; 1,240 остаётся только как размер сгенерированного орга и так подписано |
| «Thirty-five services» | «Dozens of services» | абсолютная метрика чужого орга |
| «2023—now», «current» | «2023 — present», «April 2023 – present» | решение Кости 6.09: показывать как текущее место; бейдж «current» не возвращён |
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

`npm run verify` = `build` → `test` (10 файлов, ~440 проверок; новый `smoke-public.mjs`: восемь
кейсов, публичность AI-страниц под Zoho, встраивание демо, алиасы, недоступность скрытых маршрутов, запрещённые строки на всех
публичных страницах, привязка каждой страницы к кейсу, back/forward, 390/430 px без
горизонтального скролла, шапка в одну строку, ноль console errors) → `build:all` → `test:hidden`
(AI, Salesforce; 47 проверок). CI (`deploy.yml`) делает то же и по-прежнему валит сборку на
утёкшем идентификаторе. Проверка inline-скриптов из `content-rework2` сохранена. Все `smoke*.mjs`
теперь ставят `process.exitCode=1` на любой FAIL — раньше восемь из них печатали FAIL и выходили
нулём, так что CI мог быть зелёным при упавшей проверке.

Визуально проверено скриншотами (`tools/shots.mjs`) на 1440×900, 1280×800, 390×844, 430×932 —
все публичные маршруты, без переполнений и ошибок консоли.

## Что осталось на Phase 2

- `content/` перевыгружен: экспортёр читает `dist-all/` и помечает публичность по `dist/`
  (`public`, `public_tab`, `case` в front-matter), пишет `cases/<slug>.md`, `pages/about-demos.md`,
  `tabs/contact.md`, новый лендинг Zoho и диаграммы `layers`. Запуск:
  `npm run build && npm run build:all && node content/_export.mjs` (нужен `npm i --no-save turndown`).
- Скриншоты для карточек интерактивных примеров (сейчас три встроенных снимка — event, solution,
  board — используются только в блоке опыта; сетка примеров текстовая, чтобы не раздувать страницу).
- Вынести датасет (≈1.1 MB) из инлайна в отдельный файл с отложенной загрузкой — вес страницы
  всё ещё ~2 MB.
- Вернуть Salesforce и AI отдельными проходами: переключатель есть, тесты живут; нужен контент
  того же формата (кейс с диаграммой), в том числе Google Drive ↔ Salesforce / AppExchange.
- Диаграммы к демо-страницам, где их нет (solution, board, sf-lwc — по анализу 30.08).
- Подписи в демо `chat-tracker` (`PITCH`, `Teams_Messages`, `In_Jira`) — названия из
  первоисточника; оставлены по решению Кости.

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
https://koslan.github.io/crm-platform-portfolio/#/zoho/ai-workflows
https://koslan.github.io/crm-platform-portfolio/#/screens
https://koslan.github.io/crm-platform-portfolio/#/contact
```

Под конкретную проблему клиента: Zoho API / лимиты / синк → orchestration или platform-engineering;
миграция или расхождения данных → reconciliation; кастомный виджет → widgets; дубли и обогащение →
enrichment; Teams / Jira → teams-crm / jira-sync; AI-агенты, OpenAI/Claude в CRM, approval и audit →
ai-workflows (+ enrichment для Apollo-части таких вакансий).
