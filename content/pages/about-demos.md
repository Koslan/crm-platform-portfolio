---
page: "about-demos"
title: "About the interactive examples"
route: "#/about-demos"
public: true
source:
  body: "src/cases.js · ABOUT_DEMOS"
  furniture: "src/app.html · vAboutDemos()"
---

# About the interactive examples

## Synthetic data

Every record on these pages belongs to an invented company. No client record, endpoint, credential or internal name from any employer appears anywhere here.

## No live org

Nothing connects to a production system. The screens run in your browser against a stand-in for the platform SDK that answers queries, pages at the platform’s own ceiling and refuses writes for the same reasons the platform does, so the behaviour of production patterns can be shown without production access.

## Behaviour, not source

The examples reproduce how the production interfaces and flows behave — the same rules, the same refusals, the same recovery paths — and are built from the engineering patterns behind them rather than from proprietary code.

## Drawn shells

The chat, tracker and calendar shells are simplified interfaces drawn for these pages. They carry no third-party branding and exist so a flow that crosses several systems can be walked end to end.

## Failure on purpose

Where a page offers a failure switch, it turns on latency, rate limits, rejected writes or expired tokens, so the recovery paths can be clicked rather than described.
