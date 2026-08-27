# Карта соответствий: реплика ↔ оригинал

Одна строка на поверхность сайта. Промпт `prompts/fidelity-pass.md` берёт отсюда две вещи:
какой файл реплики править и где лежит оригинал.

Корень оригиналов: `C:\VSCode Workspace\Zoho`
Корень реплики: папка этого репозитория.

## Карточка кампании (`#/event`)

| Вкладка | Файл реплики | Точка входа | Оригинал | На что смотреть в первую очередь |
|---|---|---|---|---|
| Overview | `src/event-page.js` | `Overview.render` | скриншот карточки записи + `Widgets/EventContacts/app/widget.html` | состав и порядок полей в баннере, набор кнопок, порядок вкладок |
| Contacts | `src/event-page.js` | `Contacts.render` / `Contacts.draw` | `Widgets/EventContacts` | подписи и порядок колонок, набор чипов-фильтров, три вида интерфейса, замочек на статусах, тексты счётчиков |
| Meetings | `src/event-page.js` | `Meetings.render` / `Meetings.draw` | `Widgets/eventMeetings`, `Widgets/meetingsFullView` | колонки, счётчики в шапке, чипы дней, формат даты и длительности |
| Room schedule | `src/board.js` | `Schedule.render` / `Schedule.draw` | `Widgets/eventVisualMeetings` | шаг сетки, цвет блоков, значки на блоке, поведение при пересечении, линия «сейчас» |
| Calendar sync | `src/widgets2.js` | `Reconcile.render` | `Widgets/meetingsFullView` | названия пяти состояний, набор колонок, легенда diff, тексты кнопок массовых операций |
| At a glance | `src/apollo.js` | `EventMatrix.render` | `Widgets/atAGlance` | группировка колонок, содержимое ячейки, что именно закреплено слева, счётчики под именами |
| Create meeting | `src/event-page.js` | `Wizard.*` | `Widgets/eventMeetingCreationButton` | названия шагов, набор полей на каждом, тексты блокеров, вид карточек комнат, экран успеха |

## Карточка аккаунта (`#/rec/enrich`)

| Вкладка | Файл реплики | Точка входа | Оригинал | На что смотреть |
|---|---|---|---|---|
| At a glance | `src/widgets2.js` | `Glance.render` | `Widgets/accAtAGlance` | набор плиток и их подписи, порядок, подстрочки |
| Group structure | `src/widgets3.js` | `Hierarchy.render` | `Widgets/accHierarchy` | состав досье в узле, легенда статусов, что подписано под именем |
| Development plan | `src/widgets2.js` | `Plan.render` | `Widgets/AccDevPlan` | названия вкладок и колонок, ступени лестницы отношений, набор флагов в матрице |
| Contact enrichment | `src/pages.js` | `Enrichment.render` | `Widgets/accApolloEnrichment` | состав фильтров, колонки таблицы, счётчики статистики, содержимое профиля |
| Provider link | `src/apollo.js` | `OrgMatch.render` | `Widgets/accSyncByName` | заголовки панелей, что показано в строке списка, текст подсказки под кнопкой |

## Карточка контакта (`#/rec/contact`)

| Вкладка | Файл реплики | Точка входа | Оригинал | На что смотреть |
|---|---|---|---|---|
| Employment history | `src/widgets2.js` | `History.render` / `History.add` | `Widgets/updateAccountHistory`, `Widgets/PreviousContactsWidget` | колонки, поведение «основного места», состав формы добавления |
| Provider sync | `src/apollo.js` | `PersonSync.render` | `Widgets/apolloSyncByName` | четыре состояния бейджа совпадения, содержимое карточки, вид профиля |

## Отдельные страницы

| Страница | Файл реплики | Точка входа | Оригинал | На что смотреть |
|---|---|---|---|---|
| Sales cockpit (`#/cockpit`) | `src/widgets3.js` | `Cockpit.mount` / `Cockpit.draw` | `Widgets/Head_Dashboard` (`head_widget.html`, `js/headDashboard.js`) | заголовки блоков и их цвета, порядок вкладок, набор колонок, правило светофора |
| Solution map (`#/rec/solution`) | `src/pages.js` | `SolutionMap.render` | `Widgets/gtSolutionOppMap` (код в `dist/*.zip`) | цвета состояний, содержимое ячейки, текст справки, шапка юнита |
| Deal conversations (`#/rec/deal`) | `src/pages.js` | `Conversations.threads` / `.tracker` | `Widgets/oppoTeams` | вид треда, набор бейджей, состав композера, пустые состояния |
| Create from a provider (`#/rec/newcontact`) | `src/apollo.js` | `ContactNew.mount` | `Widgets/apolloCreateContactByName` | две ленты, счётчики дублей на карточке, состав формы поиска |
| Meeting board, mobile (`#/rec/board`) | `src/board.js` | `Board.mount` / `.draw` / `.sheet` | `Widgets/eventBoard`, `zoho-mobile-widgets/widgets/eventBoard` | пилюли в шапке, состав шторки, тексты кнопок, содержимое экранной консоли |
| Meeting recap from chat (`#/rec/teams`) | `src/teams.js` | `Teams.card1` / `.card2` | `Power Automate Solutions/MeetingContextzoho_1_0_0_1/Workflows/*.json` | тексты и поля адаптивных карточек, порядок шагов |
| Chat to issue tracker (`#/rec/tracker`) | `src/teams.js` | `Tracker.*` | `teams-jira-integrtion/` | формат блока метаданных, статусы, что попадает в комментарий |
| Org health report (`#/orghealth`) | `src/orghealth.js` | `OrgHealth.mount` | `Zoho_org_code/automation/_audit_2026-05-01/AUDIT_REPORT.md`, `automation/_external_apis_inventory.md` | названия статусов, состав разделов, формулировка раздела о неполноте снапшота |
| Platform emulator (`#/platform`) | `src/app.html` | `viewPlatform` / `wirePlatform` | `platform/mockZoho.js` + `zoho-mobile-widgets` (оффлайн-стенд) | какие вызовы SDK реально используются виджетами |

## Что править нельзя ни при каких обстоятельствах

Список ведётся здесь, потому что промпт на него ссылается.

- домены, адреса почты, названия юрлиц и дивизионов работодателя, аббревиатуры вроде трёхбуквенной приставки в названиях полей;
- идентификатор организации, идентификаторы раскладок, имена коннекшенов, ключи и токены в любом виде;
- фамилии сотрудников и клиентов, названия компаний-клиентов, названия реальных отраслевых выставок и площадок;
- api-имена модулей и полей, по которым читается процесс работодателя (игровые сущности, «зелёный лист», названия сервисов нетворкинга);
- дословные формулировки лицензированной методологии продаж — перефразировать своими словами.

Всё это заменяется на легенду Northbeam Engineering. Проверка на утечки стоит в CI и валит сборку.
