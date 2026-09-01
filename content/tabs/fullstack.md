---
tab: "fullstack"
title: "Full-stack"
route: "#/fullstack"
items: 4
source:
  lede: "src/app.html · vFS()"
  items: "src/app.html · FS_ITEMS"
---

# Full-stack

## Лид страницы

The engineering around CRM work Full-stack CRM work does not stop at the platform boundary. I build the missing layer around it: external interfaces and standalone sites, Node.js and Python automation, server-side integration services, data-processing tools and workers for operations that do not fit inside Zoho’s execution limits. Not published yet Four categories of this work sit outside the portfolio for now — an external service taking the operations the CRM cannot run, a Node.js and Python integration backend, interfaces built outside the CRM around CRM data, and migration and transformation tooling. Each needs its own write-up with the real boundary, failure model and hand-back, and none of them is worth a card until it has one. What follows is the part that is finished — and it is the same engineering, applied to this site.

## Карточки

| id | Заголовок (`t`) | Подпись (`s`) | Вид |
| --- | --- | --- | --- |
| [`harness`](../pages/harness.md) | Running CRM interfaces before they reach the CRM | An offline SDK surface and 273 browser checks, failing on any console error. | note |
| [`generator`](../pages/generator.md) | Repeatable test data that still behaves like a real CRM | The same seed produces the same records; deliberate defects keep the demos honest. | note |
| [`ci-guards`](../pages/ci-guards.md) | A build that blocks employer data from reaching the portfolio | Identifier, credential and integrity checks run before anything is published. | note |
| [`site`](../pages/site.md) | A production-shaped CRM environment in one static file | Production-derived interfaces, synthetic data, an emulated SDK and deliberate failure modes — no backend required. | live |
