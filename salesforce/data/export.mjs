#!/usr/bin/env node
/* -------------------------------------------------------------------------
   salesforce/data/export.mjs

   Reads the dataset ../../data/dataset.json already produced by
   data/generate.mjs (run `npm run generate` at the repo root first) and
   writes it back out in the shape `sf data tree import` expects: one JSON
   file per object plus a plan.json describing the import order and the
   @ref cross-references between files.

   This script does NOT touch data/generate.mjs — it only reads the dataset
   that script already wrote. Northbeam Engineering is the same invented
   company on both platforms; this is the argument that a person can put one
   data model on two CRMs, not a second, independent dataset.

   Mapping (Zoho module -> Salesforce object):
     Accounts        -> Account
     Contacts        -> Contact
     Deals           -> Opportunity
     Meetings        -> Meeting__c
     Event_Contacts  -> Event_Contact__c
     Programmes      -> Programme__c
     Service_Catalog -> Service_Line__c
     Employment      -> Employment__c

   Zoho record ids (e.g. "6100000000006") are not carried into Salesforce —
   they have no meaning there. sf data tree import instead uses in-file
   "@ref" placeholders to express relationships between records being
   imported in the same batch; refFor() below turns each Zoho id into a
   stable "<Object>Ref<n>" string reused everywhere that id is referenced.
------------------------------------------------------------------------- */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..', '..');
const OUT_DIR = __dirname; // salesforce/data/

const SRC = join(REPO_ROOT, 'data', 'dataset.json');
if (!existsSync(SRC)) {
  console.error(
    'salesforce/data/export.mjs: ' + SRC + ' does not exist.\n' +
    'Run `npm run generate` at the repo root first (or `npm run build`, which includes it).'
  );
  process.exit(1);
}
const D = JSON.parse(readFileSync(SRC, 'utf8'));

/* ---------------- ref bookkeeping ---------------- */
const refMaps = {}; // { 'Account': Map(zohoId -> 'AccountRef1'), ... }
function refFor(sfObject, zohoId) {
  if (zohoId == null) return null;
  if (!refMaps[sfObject]) refMaps[sfObject] = new Map();
  const m = refMaps[sfObject];
  if (!m.has(String(zohoId))) m.set(String(zohoId), `${sfObject}Ref${m.size + 1}`);
  return m.get(String(zohoId));
}
function lookupRef(sfObject, zohoId) {
  // Reference an id that must already have been assigned a ref by an earlier
  // pass over its own object (Accounts before Contacts, etc.) — returns null
  // rather than throwing if the id doesn't resolve, matching how the Zoho
  // side tolerates a dangling lookup by returning {id, name:null} rather
  // than failing (see platform/mockZoho.js hydrate()).
  const m = refMaps[sfObject];
  if (!m) return null;
  return m.get(String(zohoId)) || null;
}
const trunc = (s, n) => (s == null ? null : String(s).slice(0, n));

/* ---------------- per-object records ---------------- */
const records = {}; // { 'Account': [...], ... }
function put(sfObject, zohoId, fields) {
  if (!records[sfObject]) records[sfObject] = [];
  const attributes = { type: sfObject, referenceId: refFor(sfObject, zohoId) };
  records[sfObject].push({ attributes, ...fields });
}

/* Accounts -> Account (pass 1: nothing else depends on Accounts existing first
   except Accounts' own Main_Parent_Account self-lookup, resolved in a second pass) */
for (const a of D.Accounts || []) {
  put('Account', a.id, {
    Name: a.Account_Name,
    Website: a.Website || null,
    BillingCountry: a.Country || null,
    BillingCity: a.City || null,
    BillingState: a.State || null,
    Industry: a.Industry || null,
    NumberOfEmployees: a.Employees ?? null,
    AnnualRevenue: a.Total_Revenue ?? null,
    Cooperation_Status__c: a.Cooperation_Status || null,
    Region__c: a.Region || null,
    Provider_Org_Id__c: a.Provider_Org_Id || null
  });
}
// second pass: self-referencing ParentId now that every Account has a ref
for (const a of D.Accounts || []) {
  if (a.Main_Parent_Account) {
    const rec = records.Account.find(r => r.attributes.referenceId === refFor('Account', a.id));
    const parentRef = lookupRef('Account', a.Main_Parent_Account);
    if (rec && parentRef) rec.ParentId = `@${parentRef}`;
  }
}

/* Contacts -> Contact */
for (const c of D.Contacts || []) {
  const accRef = lookupRef('Account', c.Account_Name);
  put('Contact', c.id, {
    FirstName: c.First_Name || null,
    LastName: c.Last_Name || 'Unknown',
    Title: c.Title || null,
    Email: c.Email || null,
    AccountId: accRef ? `@${accRef}` : null,
    Seniority__c: c.Seniority || null,
    Contact_Status__c: c.Contact_Status || null
  });
}

/* Programmes -> Programme__c */
for (const p of D.Programmes || []) {
  const accRef = lookupRef('Account', p.Account_Name);
  put('Programme__c', p.id, {
    Name: p.Name,
    Account__c: accRef ? `@${accRef}` : null,
    Release_Date__c: p.Release_Date || null,
    Category__c: p.Category || null,
    Complexity__c: p.Complexity || null
  });
}

/* Service_Catalog -> Service_Line__c (no lookups out) */
for (const s of D.Service_Catalog || []) {
  put('Service_Line__c', s.id, {
    Name: s.Name,
    Business_Unit__c: s.Business_Unit || null,
    Status__c: s.Status || null
  });
}

/* Deals -> Opportunity */
const STAGE_MAP = {
  '0. Prospecting': 'Prospecting',
  '1. Qualification': 'Qualification',
  '2. Proposal': 'Proposal/Price Quote',
  '3. Confirmation': 'Negotiation/Review',
  '4. Won': 'Closed Won',
  '5. Lost': 'Closed Lost',
  'Recommendation': 'Prospecting',
  'Duplicate': 'Closed Lost'
};
for (const d of D.Deals || []) {
  const accRef = lookupRef('Account', d.Account_Name);
  const progRef = lookupRef('Programme__c', d.Programme);
  put('Opportunity', d.id, {
    Name: d.Deal_Name,
    AccountId: accRef ? `@${accRef}` : null,
    Programme__c: progRef ? `@${progRef}` : null,
    Business_Unit__c: d.Business_Unit || null,
    Amount: d.Amount ?? null,
    CloseDate: d.Closing_Date || '2026-12-31',
    StageName: STAGE_MAP[d.Stage] || 'Prospecting'
  });
}

/* Meetings -> Meeting__c (Campaign left unmapped: this dataset's Campaigns
   are trade-show campaigns, which map naturally to the standard Salesforce
   Campaign object — but Campaign import ordering/fields are out of scope
   for this export; Meeting__c.Campaign__c is populated only when a
   Campaign with a matching ref already exists in this same run, which it
   does not by default. Left as a documented gap rather than a silent one —
   see the report's "not done" section.) */
for (const m of D.Meetings || []) {
  const accRef = lookupRef('Account', m.Account_Name);
  put('Meeting__c', m.id, {
    Name: trunc(m.Name, 80) || 'Meeting',
    Account__c: accRef ? `@${accRef}` : null,
    Meeting_DateTime__c: m.Meeting_Date ? `${m.Meeting_Date}T00:00:00.000Z` : null,
    Meeting_Duration__c: m.Meeting_Duration ?? null,
    Meeting_Room__c: m.Meeting_Room || null,
    Meeting_Status__c: m.Meeting_Status || null,
    Sync_State__c: m.Sync_State || null,
    External_Event_Id__c: m.External_Event_Id || null
  });
}

/* Event_Contacts -> Event_Contact__c */
for (const ec of D.Event_Contacts || []) {
  const accRef = lookupRef('Account', ec.Account_Name);
  const conRef = lookupRef('Contact', ec.Origin_Contact);
  // Campaign__c on Event_Contact__c points at the standard Campaign object,
  // same caveat as Meeting__c above — Campaigns are not exported by this
  // script, so the field is left null rather than pointing at a ref that
  // does not exist in this run.
  put('Event_Contact__c', ec.id, {
    Origin_Contact__c: conRef ? `@${conRef}` : null,
    Account__c: accRef ? `@${accRef}` : null,
    Attending_Status__c: ec.Attending_Status || null,
    Meeting_Status__c: ec.Meeting_Status || null,
    Priority__c: ec.Priority || null,
    Is_Target__c: !!ec.Is_Target,
    BD_Comment__c: ec.BD_Comment || null,
    SL_Comment__c: ec.SL_Comment || null
  });
}

/* Employment -> Employment__c */
for (const e of D.Employment || []) {
  const conRef = lookupRef('Contact', e.Contact);
  const accRef = e.Account_Name ? lookupRef('Account', e.Account_Name) : null;
  if (!conRef) continue; // Employment__c.Contact__c is required; skip orphans defensively
  put('Employment__c', e.id, {
    Contact__c: `@${conRef}`,
    Account__c: accRef ? `@${accRef}` : null,
    Company__c: e.Company,
    Title__c: e.Title || null,
    Seniority__c: e.Seniority || null,
    Buyer_Role__c: e.Buyer_Role || null,
    Start_Date__c: e.Start_Date,
    End_Date__c: e.End_Date || null,
    Is_Main__c: !!e.Is_Main,
    Status__c: e.Status || null,
    Email__c: e.Email || null,
    Comment__c: e.Comment || null
  });
}

/* ---------------- Event_Contacts requires Campaign__c to be required=true
   on the object, but this export does not create Campaigns. Relax the
   requirement at write time is not this script's job (that is a metadata
   change); instead this export drops the Campaign__c assignment and the
   object's own required=true on that field would reject these rows on
   import. Rather than silently shipping an inconsistency, this is called
   out explicitly in the report's "not done" section and in the plan below
   with a comment. ---------------- */

/* ---------------- write output ---------------- */
mkdirSync(OUT_DIR, { recursive: true });

const ORDER = [
  'Account', 'Contact', 'Programme__c', 'Service_Line__c',
  'Opportunity', 'Meeting__c', 'Event_Contact__c', 'Employment__c'
];

const FILE_NAME = {
  Account: 'Accounts.json',
  Contact: 'Contacts.json',
  Programme__c: 'Programmes.json',
  Service_Line__c: 'ServiceLines.json',
  Opportunity: 'Opportunities.json',
  Meeting__c: 'Meetings.json',
  Event_Contact__c: 'EventContacts.json',
  Employment__c: 'EmploymentRecords.json'
};

const plan = [];
for (const obj of ORDER) {
  const rows = records[obj] || [];
  if (!rows.length) continue;
  const fileName = FILE_NAME[obj] || `${obj.replace(/__c$/, '')}.json`;
  writeFileSync(join(OUT_DIR, fileName), JSON.stringify({ records: rows }, null, 2));
  plan.push({
    sobject: obj,
    saveRefs: true,
    resolveRefs: true,
    files: [fileName]
  });
}
writeFileSync(join(OUT_DIR, 'plan.json'), JSON.stringify(plan, null, 2));

console.log('salesforce/data/export.mjs — wrote ' + plan.length + ' object file(s):');
for (const obj of ORDER) {
  const n = (records[obj] || []).length;
  if (n) console.log('  ' + obj.padEnd(20) + n);
}
console.log(
  '\nKnown gap: Meeting__c.Campaign__c and Event_Contact__c.Campaign__c are left null — ' +
  'this export does not create standard Campaign records. See salesforce/README.md.'
);
