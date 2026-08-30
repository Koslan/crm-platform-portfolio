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

Beyond the CRM Full-stack The engineering around the CRM work: the test harness, the dataset generator, the build that fails on a leaked identifier — and this site, which is itself a project.

## Карточки

| id | Заголовок (`t`) | Подпись (`s`) | Вид |
| --- | --- | --- | --- |
| [`harness`](../pages/harness.md) | The test harness this site grew from | Playwright, 240 headless checks, failing on any console error. | note |
| [`generator`](../pages/generator.md) | A seeded dataset with deliberate defects | Same seed, same data, reviewable diffs — and a build that fails on a dangling reference. | note |
| [`ci-guards`](../pages/ci-guards.md) | CI guards against leaks | An identifier scan that fails the build if anything resembling a real org id or key appears. | note |
| [`site`](../pages/site.md) | This site itself | One static file, no backend, hash routing, an emulated platform SDK underneath. | live |
