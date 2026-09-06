---
page: "enrichment"
title: "Contact enrichment"
type: "live-demo (общий шаблон viewRecord)"
tab: "zoho"
group: "Cleaning up contacts, deduplication and enrichment"
route: "#/p/enrichment"
kind: "live"
public: true
public_tab: "zoho"
case: "#/zoho/enrichment"
diagrams: 0
source:
  nav: "src/app.html · ZOHO_GROUPS · id=\"enrichment\""
  body: "src/app.html · REC · id=\"enrichment\""
---

# Contact enrichment

> **Подпись в навигации** (`s`) — видна на карточке в списке:
> Provider people matched against the CRM through four identity keys before a single one is written.
>
> **`sub` — НЕ рендерится, см. LEAD:**
> An account with 142 contacts already on it, and the screen that decides which of the provider’s people are duplicates before a single one is written.

## What to try

- Load from the provider with a seniority or a title filter — people arrive in pages, not all at once.
- Read the statistics strip: direct matches, matches found through the account hierarchy, and matches recovered by profile URL are counted apart, because they are three different kinds of certainty.
- Open Group structure. Existing contacts are gathered across the whole account group, not just this account — a person who moved to a sister company is still the same person.
- Open a profile and read the employment timeline the match was made against.
- Switch to Provider link: the account itself is matched to a provider organisation before any person under it is.

## Why it was not straightforward

Duplicates were the normal state rather than an accident — records had been created situationally for years, and the worst cases were people holding roles at several sub-companies of one group. Four identity keys are applied in sequence, the last a normalised profile URL, and that URL search is chunked to fourteen conditions because fourteen is the platform ceiling. Candidates are gathered through the account hierarchy rather than the single account, and provider quota is respected by batching with three retry steps: the aim is to spend a credit once and never ask the same question twice.
