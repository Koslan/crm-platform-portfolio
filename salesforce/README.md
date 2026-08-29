# Salesforce artifact — Northbeam Engineering

This folder is a real SFDX project: the same synthetic company used by the rest of this
portfolio (`data/generate.mjs`), modeled a second time on Salesforce primitives instead
of Zoho's. It exists to demonstrate platform transfer, not to run against a live org —
**no Salesforce org is required to view the site**. The interactive demo at
`#/p/sf-lwc` on the built site runs entirely in the browser against `platform/mockSF.js`,
a stand-in SDK with no network calls, exactly like the rest of the portfolio.

This README is for the one thing that folder *doesn't* show: what deploying the real
metadata to a scratch org looks like.

## What's here

```
salesforce/
  sfdx-project.json
  jest.config.js                          Jest config for the LWC unit tests (see below)
  force-app/main/default/
    objects/                              Employment__c, Meeting__c, Event_Contact__c,
                                           Programme__c, Service_Line__c, Sync_Checkpoint__c,
                                           Sync_Source__mdt (Custom Metadata Type),
                                           Sync_Run_Event__e (Platform Event), plus
                                           custom fields added to standard Account/
                                           Contact/Opportunity
    classes/                              EmploymentHistoryController(+Test),
                                           DeltaSyncJob(+Test), SyncHttpService,
                                           SyncCheckpointException
    lwc/employmentHistory/                the ported widget: .js, .html, .css,
                                           .js-meta.xml, __tests__/
    namedCredentials/                     Northbeam_Mail_Sync (placeholder — see below)
    customMetadata/                       one Sync_Source__mdt record (Mailbox 01); a
                                           real org would carry all 17
  data/export.mjs                         Zoho dataset -> SFDX data/tree import format
  data/                                   (export.mjs writes its output here, gitignored
                                           the same way data/dataset.json is)
```

## Deploying to a scratch org

You need the Salesforce CLI (`sf`, formerly `sfdx`) and a Dev Hub-enabled org.

```bash
npm install --global @salesforce/cli
sf org login web --set-default-dev-hub --alias northbeam-hub

sf org create scratch --definition-file config/project-scratch-def.json \
  --alias northbeam-scratch --set-default --duration-days 7
# (config/project-scratch-def.json is not included in this portfolio — a minimal
#  Developer edition definition works: {"orgName":"Northbeam Scratch","edition":"Developer"})

sf project deploy start --source-dir force-app
```

That deploys every object, field, class, and the LWC. `Sync_Checkpoint__c`,
`Sync_Source__mdt`, `Sync_Run_Event__e`, `DeltaSyncJob`, and `SyncHttpService` deploy and
compile cleanly with no further setup — they simply are never invoked, since nothing in
this repository calls `DeltaSyncJob.kickOffAllActiveSources()` outside a test.

### Loading the dataset

```bash
node salesforce/data/export.mjs         # reads ../data/dataset.json, writes salesforce/data/*.json
sf data tree import --plan salesforce/data/plan.json --target-org northbeam-scratch
```

`export.mjs` reads the same `data/dataset.json` the rest of the site generates (via
`npm run generate` at the repo root) and never modifies `data/generate.mjs` — see that
script's own header comment for the field-by-field mapping.

### Running the Apex tests

```bash
sf apex run test --test-level RunLocalTests --target-org northbeam-scratch --result-format human --code-coverage
```

### Running the LWC Jest tests

`@salesforce/sfdx-lwc-jest` is **not** a devDependency of the root
`crm-portfolio-site` package — the root project is a static-site build with a Playwright
test suite that has nothing to do with Lightning tooling, and pulling LWC's Jest preset
into it for one widget's tests would be a strange coupling. Run them from this folder
instead:

```bash
cd salesforce
npm install --no-save @salesforce/sfdx-lwc-jest
npx sfdx-lwc-jest
```

or without a local install:

```bash
npx --package @salesforce/sfdx-lwc-jest sfdx-lwc-jest --config salesforce/jest.config.js
```

## What is deliberately not wired up

- **`Northbeam_Mail_Sync` Named Credential** ships with a placeholder URL
  (`https://example.invalid/...`) and no stored credential. `DeltaSyncJob` references it
  by API name only — it is never called outside `DeltaSyncJobTest`, which mocks the
  callout entirely with `HttpCalloutMock`. Pointing it at a real endpoint and its OAuth
  setup is exactly the kind of org-specific configuration this portfolio does not ship,
  by design (see "What is forbidden," repo root README).
- **`.github/workflows/salesforce.yml`** runs `sf project deploy start --dry-run` and the
  Apex tests on every PR that touches `salesforce/**`, but only when the repository
  secret `SF_AUTH_URL` is present — see that workflow file's own comment. **It is
  inactive today**: no org is configured for this repository, so the job is skipped
  (not failed) on every run. Wiring it up means creating a scratch or sandbox org,
  running `sf org display --verbose --json` to get an auth URL, and storing it as
  `SF_AUTH_URL` in the repo's secrets.

## Why this exists at all

The rest of this portfolio is Zoho CRM. This folder is the argument that the discipline
underneath it — object modeling, a write path that survives a partial failure, a sync
job that respects a platform's own limits instead of fighting them — is not tied to one
vendor's SDK. The write-ups at `#/p/sf-lwc` and `#/p/sf-sync` on the site make that case
directly; this README is just the "how would you actually deploy this" answer for anyone
who wants to check.
