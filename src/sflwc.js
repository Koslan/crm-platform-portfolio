/* =============================================================
   sflwc — "One screen, two platforms."

   Renders the employmentHistory LWC (salesforce/force-app/.../lwc/
   employmentHistory/) inside the browser, against platform/mockSF.js,
   next to the existing Zoho port of the same widget (CRMWidgets2.History
   in src/widgets2.js) behind a Zoho/Salesforce tab switcher on one page.

   THE KEY DECISION FOR THIS FILE, stated once here because the write-up
   references it: this is NOT the real LWC engine (@lwc/engine-dom) running
   the actual .js/.html/.css files from salesforce/force-app/. A real LWC
   runtime plus its module resolution and template compiler does not fit
   this site's "one inlined HTML file" build (build.mjs concatenates plain
   scripts — there is no bundler step, no Shadow DOM template compiler, and
   pulling one in was measured to cost well over the ~150KB ceiling this
   portfolio holds itself to). So this file is a functionally identical
   vanilla-JS reimplementation, built the same way every other widget on
   this site is built (plain functions, template strings, direct DOM
   writes) — but it deliberately keeps the SAME SHAPE as the real
   component:

     - the same two calls, with the same names, in the same order:
         mockSF.apex.getEmploymentHistory(contactId)   -- read, "wire"-like
         mockSF.apex.setMainEmployment(contactId, id)  -- write, imperative
     - the same write behaviour: optimistic UI update immediately, disable
       every control for the duration, roll back to the last known-good
       state and surface the error on failure — read employmentHistory.js
       (the real component) and SFLWC.EmploymentHistory.render/handleMainChange
       below side by side; the control flow is line-for-line the same idea.
     - the same field names on every row (id, company, title, seniority,
       buyerRole, startDate, endDate, isMain, status, email, comment) as
       EmploymentHistoryController.EmploymentRow, so the mapping from Apex
       to screen is traceable without translation.

   What is real: the write-order invariant (mockSF.js unsets every other
   main row before setting the new one, exactly like
   EmploymentHistoryController.setMainEmployment), the failure-and-rollback
   behaviour, and the field-level shape. What is not real: Shadow DOM,
   the @wire reactivity graph, and Lightning Data Service caching — those
   are platform machinery, not the behaviour the write-up is about.
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa } = S;

const CSS_SFLWC = `
.sflwc-switch{display:inline-flex;border:1px solid var(--line);border-radius:8px;overflow:hidden;margin-bottom:16px}
.sflwc-switch button{border:0;background:var(--surface);color:var(--ink-2);padding:8px 16px;font:500 13px/1 inherit;cursor:pointer}
.sflwc-switch button.on{background:var(--accent);color:#fff}
.sflwc-switch button:not(.on):hover{background:var(--surface-2)}
.sflwc-plat{border:1px solid var(--line);border-radius:10px;padding:16px}
.sflwc-tools{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.sflwc-tools h4{margin:0;font-size:14px}
.sflwc-grow{flex:1}
.sflwc-hint{font-size:12px;color:var(--ink-3)}
.sflwc-note{margin-top:10px}
.sflwc-error{background:var(--crit-bg);color:var(--crit);border:1px solid var(--crit);border-radius:6px;padding:8px 12px;margin-bottom:10px;font-size:13px}
.sflwc-table{width:100%;border-collapse:collapse;font-size:13px}
.sflwc-table th,.sflwc-table td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line)}
.sflwc-cbx{text-align:center}
.sflwc-chaosrow{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.sflwc-chaosrow button{border:1px solid var(--line);background:var(--surface);color:var(--ink-2);border-radius:999px;padding:5px 12px;font-size:12px;cursor:pointer}
.sflwc-chaosrow button[aria-pressed="true"]{background:var(--accent);color:#fff;border-color:var(--accent)}
.sflwc-present{display:inline-block;background:var(--ok-bg);color:var(--ok);border-radius:999px;padding:1px 8px;font-size:11px}
`;
function ensureCss(){ if (document.getElementById('sflwc-css')) return;
  const st = document.createElement('style'); st.id = 'sflwc-css'; st.textContent = CSS_SFLWC; document.head.appendChild(st); }

/* ---------------- the vanilla port of the LWC ---------------- */
const EmploymentHistory = {
  contactId: null, rows: [], isBusy: false, error: null,

  /** Same role as the component's @wire(getEmploymentHistory) — read,
   *  cacheable in spirit (no artificial refetch here beyond calling it
   *  again after a write, exactly like the component's refreshApex). */
  async loadFromWire() {
    this.error = null;
    try {
      this.rows = await mockSF.apex.getEmploymentHistory(this.contactId);
    } catch (err) {
      this.error = this.messageFrom(err);
      this.rows = [];
    }
  },

  render(host) {
    this.host = host;
    const cols = [
      ['Main',''],['Company',''],['Title',''],['Seniority',''],['Buyer role',''],
      ['From',''],['To',''],['Status','']
    ];
    host.innerHTML = `<div class="sflwc-plat">
      <div class="sflwc-tools"><h4>Where this person has worked</h4><span class="sflwc-grow"></span>
        <span class="sflwc-hint">${this.rows.length} record${this.rows.length===1?'':'s'} &middot; Salesforce (LWC port)</span></div>
      ${this.error ? `<div class="sflwc-error" role="alert">${E(this.error)}</div>` : ''}
      ${this.rows.length ? `<table class="sflwc-table"><thead><tr>${cols.map(c=>`<th>${E(c[0])}</th>`).join('')}</tr></thead>
        <tbody>${this.rows.map(r => `<tr data-id="${E(r.id)}">
          <td class="sflwc-cbx"><input type="checkbox" data-id="${E(r.id)}" ${r.isMain?'checked':''} ${this.isBusy?'disabled':''}></td>
          <td>${E(r.company)}</td><td>${E(r.title||'')}</td><td>${E(r.seniority||'')}</td>
          <td>${r.buyerRole?E(r.buyerRole):'<span style="color:var(--ink-3)">—</span>'}</td>
          <td>${E(r.startDate||'')}</td><td>${r.endDate?E(r.endDate):'<span class="sflwc-present">present</span>'}</td>
          <td>${E(r.status||'')}</td></tr>`).join('')}</tbody></table>`
        : '<p class="sflwc-hint">No employment records.</p>'}
      <div class="sflwc-hint sflwc-note">One row is marked as the main employer, and it is the one the contact
        record points at. Ticking a different row moves that pointer — every other row is cleared first, then the
        new one is set, so the record is never briefly without a main employer if the second write fails
        (EmploymentHistoryController.setMainEmployment, ported to mockSF.apex.setMainEmployment).</div>
    </div>`;
    const table = q(host, '.sflwc-table');
    if (table) table.addEventListener('change', e => this.handleMainChange(e));
  },

  messageFrom(err) {
    if (err && err.body && err.body.message) return err.body.message;
    if (err && err.message) return err.message;
    return 'Something went wrong changing the main employer.';
  },

  /** Same shape as the component's handleMainChange: snapshot for rollback,
   *  go optimistic immediately, disable every control, call the server,
   *  re-read on success, roll back and show the error on failure. */
  async handleMainChange(e) {
    const box = e.target.closest('input[data-id]'); if (!box) return;
    if (this.isBusy) return;
    const newMainId = box.dataset.id;

    const previousRows = this.rows.map(r => ({ ...r })); // snapshot for rollback
    this.isBusy = true;
    this.error = null;
    this.rows = this.rows.map(r => ({ ...r, isMain: r.id === newMainId })); // optimistic
    this.render(this.host); // re-render with every control disabled

    try {
      await mockSF.apex.setMainEmployment(this.contactId, newMainId);
      await this.loadFromWire(); // refreshApex-equivalent: trust the server, not the optimism
    } catch (err) {
      this.rows = previousRows; // roll back
      this.error = this.messageFrom(err);
    } finally {
      this.isBusy = false;
      this.render(this.host);
    }
  }
};

/* ---------------- Zoho / Salesforce switcher ---------------- */
const SFLWC = {
  async mount(host, contactId) {
    ensureCss();
    this.host = host; this.contactId = contactId; this.platform = 'zoho';
    host.innerHTML = `
      <div class="sflwc-switch" role="tablist" aria-label="Platform">
        <button data-p="zoho" class="on" role="tab" aria-selected="true">Zoho (production)</button>
        <button data-p="sf" role="tab" aria-selected="false">Salesforce (ported)</button>
      </div>
      <div id="sflwc-body"></div>
      <div class="sflwc-chaosrow" id="sflwc-chaos">
        <span class="sflwc-hint" style="align-self:center">Salesforce failure switch:</span>
        <button data-m="off" aria-pressed="true">Off</button>
        <button data-m="throttle" aria-pressed="false">Throttled</button>
        <button data-m="second-write-fails" aria-pressed="false">2nd write fails</button>
        <button data-m="no-access" aria-pressed="false">No access</button>
      </div>`;
    q(host, '.sflwc-switch').onclick = e => {
      const b = e.target.closest('button[data-p]'); if (!b) return;
      qa(host, '.sflwc-switch button').forEach(x => { x.classList.toggle('on', x===b); x.setAttribute('aria-selected', String(x===b)); });
      this.platform = b.dataset.p;
      this.paintBody();
    };
    q(host, '#sflwc-chaos').onclick = e => {
      const b = e.target.closest('button[data-m]'); if (!b) return;
      window.mockSF.chaos.mode = b.dataset.m;
      qa(host, '#sflwc-chaos button[data-m]').forEach(x => x.setAttribute('aria-pressed', String(x===b)));
      if (this.platform === 'sf') this.paintBody();
    };
    await this.paintBody();
  },

  async paintBody() {
    const body = q(this.host, '#sflwc-body');
    if (this.platform === 'zoho') {
      body.innerHTML = '<div id="sflwc-zoho-host"></div>';
      if (window.CRMWidgets2) window.CRMWidgets2.History.mount(q(body,'#sflwc-zoho-host'), this.contactId);
    } else {
      body.innerHTML = '<div class="sflwc-hint" style="padding:20px 0">Loading…</div>';
      EmploymentHistory.contactId = this.contactId;
      await EmploymentHistory.loadFromWire();
      EmploymentHistory.render(body);
    }
  }
};

window.SFLWC = SFLWC;
})();
