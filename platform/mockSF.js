/* ------------------------------------------------------------------
   mockSF — a stand-in for the two Lightning Web Component platform
   surfaces the employmentHistory LWC actually depends on: a @wire
   adapter (cacheable read) and an imperative Apex method call (write).

   This is the browser-side twin of platform/mockZoho.js: same generated
   Northbeam Engineering dataset, same idea (reproduce the platform
   behaviour a component must cope with, including its failure modes),
   different SDK shape because the two platforms hand widgets different
   primitives. Concretely, mockSF answers exactly the two calls
   EmploymentHistoryController.cls exposes:

     getEmploymentHistory(contactId)      -- @wire, cacheable
     setMainEmployment(contactId, newMainId) -- imperative, two-step write

   and reproduces the same write-order invariant server-side: unset every
   other main row before setting the new one, so a mid-write failure never
   leaves two rows claiming to be main (see EmploymentHistoryController.cls
   for the Apex original this mirrors 1:1).

   Deliberately NOT included: a real LWC/wire-service runtime. See
   src/sflwc.js's header for why, and how the seam between "platform" and
   "component" stays real without one.
------------------------------------------------------------------- */
(function (root) {
  'use strict';

  /* ---------------- failure switch (same shape as mockZoho.chaos) ---------------- */
  const chaos = { mode: 'off', seed: 11 };
  const nextRand = () => (chaos.seed = (chaos.seed * 1103515245 + 12345) >>> 0) / 4294967296;
  function sfError(message, extra) {
    const e = new Error(message);
    e.body = { message };
    if (extra) Object.assign(e, extra);
    return e;
  }
  /* `forWrite` distinguishes the read path from the write path deliberately: every
     chaos mode here is meant to demonstrate what happens when a WRITE fails (the
     whole point of the write-up is the two-step write's failure behaviour), not to
     also break the read that repaints the table after flipping the switch. Only
     'slow' affects reads; 'throttle', 'no-access' and 'second-write-fails' are
     write-only, matching how a real org's rate limits and FLS checks bite on DML,
     not on a read that already succeeded once. */
  async function gate(forWrite) {
    const wait = chaos.mode === 'slow' ? 700 : 0;
    if (wait) await new Promise(r => setTimeout(r, wait + nextRand() * 200));
    if (!forWrite) return;
    if (chaos.mode === 'throttle' && nextRand() < 0.5)
      throw sfError('REQUEST_LIMIT_EXCEEDED: TotalRequests Limit exceeded.');
    if (chaos.mode === 'no-access')
      throw sfError('INSUFFICIENT_ACCESS_ON_CROSS_REFERENCE_ENTITY: You do not have permission to change the main employer.');
    if (chaos.mode === 'second-write-fails') {
      // Deterministic under this mode: the SECOND write of setMainEmployment always
      // fails, so the failure path is reachable on demand from the UI toggle rather
      // than depending on randomness — this is the scenario the whole write-up is
      // built around and it has to be reproducible by clicking, not by luck.
      throw sfError('UNABLE_TO_LOCK_ROW: unable to obtain exclusive access to this record.');
    }
  }

  /* ---------------- store ---------------- */
  let EMPLOYMENT = [], ORIGINAL = null;
  function load(rows) { EMPLOYMENT = JSON.parse(JSON.stringify(rows)); ORIGINAL = JSON.stringify(rows); }
  function reset() { if (ORIGINAL) EMPLOYMENT = JSON.parse(ORIGINAL); }

  function rowsFor(contactId) {
    return EMPLOYMENT.filter(r => String(r.Contact) === String(contactId));
  }

  /* ---------------- @wire: getEmploymentHistory(contactId) ----------------
     Shaped exactly like EmploymentHistoryController.EmploymentRow's
     @AuraEnabled properties, so src/sflwc.js's row-rendering code is the
     same whichever "platform" answered it. */
  async function getEmploymentHistory(contactId) {
    await gate();
    const rows = rowsFor(contactId).slice().sort((a, b) => (b.Start_Date || '').localeCompare(a.Start_Date || ''));
    return rows.map(r => ({
      id: r.id,
      company: r.Company,
      title: r.Title || null,
      seniority: r.Seniority || null,
      buyerRole: r.Buyer_Role || null,
      startDate: r.Start_Date || null,
      endDate: r.End_Date || null,
      isMain: !!r.Is_Main,
      status: r.Status || null,
      email: r.Email || null,
      comment: r.Comment || null
    }));
  }

  /* ---------------- imperative: setMainEmployment(contactId, newMainId) ----------------
     Mirrors EmploymentHistoryController.setMainEmployment exactly: step 1
     unsets every other main row for this contact and commits; only then
     does step 2 set the new row. Each step is its own await, so a chaos
     mode that fails "the second write" really does leave step 1's result
     in place — same recoverable failure shape as the real Apex. */
  async function setMainEmployment(contactId, newMainId) {
    const rows = rowsFor(contactId);
    const others = rows.filter(r => r.Is_Main && String(r.id) !== String(newMainId));

    // Step 1 — unset every other main row first. 'throttle' and 'no-access' fail
    // here, before anything is written — the most common real failure point, and
    // the safest one (nothing has changed yet). 'second-write-fails' deliberately
    // does NOT fail step 1: it exists specifically to demonstrate step 1 committing
    // and step 2 failing, which is the scenario the write-up is about.
    if (others.length) {
      await gateStep1();
      others.forEach(r => { r.Is_Main = false; });
    }

    // Step 2 — only now set the new main row. All three write-chaos modes can fail
    // here; 'second-write-fails' always does.
    await gateStep2();
    const target = rows.find(r => String(r.id) === String(newMainId));
    if (!target) throw sfError('ENTITY_IS_DELETED: entity is deleted.');
    target.Is_Main = true;
  }

  async function gateStep1() {
    if (chaos.mode === 'second-write-fails') { await gate(false); return; } // let step 1 through
    await gate(true);
  }
  async function gateStep2() {
    await gate(true);
  }

  const mockSF = {
    load, reset, chaos,
    apex: { getEmploymentHistory, setMainEmployment },
    counts() { return { Employment: EMPLOYMENT.length }; }
  };

  root.mockSF = mockSF;
  if (typeof module !== 'undefined' && module.exports) module.exports = { mockSF };
})(typeof window !== 'undefined' ? window : globalThis);
