/* =============================================================
   Four more surfaces:
     · Calendar sync   — reconciliation with a third "expected" column
     · At a glance     — an account snapshot tab
     · Development plan— strategic players, actions, service matrix
     · Employment      — a contact's history across accounts
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa, coqlAll, esc, parseDT, hhmm, dmy, pad2 } = S;
const { hue, ini, money, shell } = window.CRMPages;

const CSS5 = `
.ecp .diff{display:grid;grid-template-columns:150px repeat(3,minmax(0,1fr));gap:0;border:1px solid var(--line);border-radius:8px;overflow:hidden}
.ecp .diff > div{padding:9px 12px;border-bottom:1px solid var(--line);font-size:13px;min-width:0;overflow-wrap:anywhere}
.ecp .diff > div:nth-child(-n+4){background:var(--surface-2);font:500 10.5px/1.4 "IBM Plex Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3)}
.ecp .diff .k{font:500 10.5px/1.4 "IBM Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);background:var(--surface-2)}
.ecp .diff .same{color:var(--ink-2)}
.ecp .diff .differs{background:var(--warn-bg);color:var(--warn);font-weight:500}
.ecp .diff .only{background:var(--idle-bg);color:var(--ink-3);font-style:italic}
.ecp .diff .exp{background:var(--accent-soft);color:var(--accent-ink);font-weight:500}
.ecp .legend{display:flex;gap:12px;flex-wrap:wrap;font-size:11.5px;color:var(--ink-3);margin-top:10px}
.ecp .legend span::before{content:'';display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:5px;vertical-align:-1px}
.ecp .legend .l1::before{background:var(--surface-2);border:1px solid var(--line)}
.ecp .legend .l2::before{background:var(--warn-bg)}
.ecp .legend .l3::before{background:var(--idle-bg)}
.ecp .legend .l4::before{background:var(--accent-soft)}
.ecp .bar3{height:6px;border-radius:3px;background:var(--surface-2);overflow:hidden;min-width:70px}
.ecp .bar3 i{display:block;height:100%}
.ecp .prog{display:flex;align-items:center;gap:8px}
.ecp .prog b{font:600 11.5px/1 "IBM Plex Mono",monospace;min-width:32px;text-align:right}
.ecp .ladder{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 0}
.ecp .ladder span{border:1px solid var(--line);border-radius:999px;padding:4px 10px;font-size:11.5px;color:var(--ink-3);background:var(--surface)}
.ecp .ladder span.on{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:500}
.ecp .ladder span.want{border-color:var(--accent);color:var(--accent-ink);border-style:dashed}
.ecp .role-pill{border-radius:5px;padding:3px 8px;font-size:11.5px;font-weight:500;display:inline-block}
.ecp .role-Sponsor{background:var(--ok-bg);color:var(--ok)}
.ecp .role-Strategic.coach,.ecp .role-coach{background:var(--accent-soft);color:var(--accent-ink)}
.ecp .role-Neutral{background:var(--idle-bg);color:var(--ink-3)}
.ecp .role-Anti-sponsor{background:var(--crit-bg);color:var(--crit)}
.ecp .kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
.ecp .kpi div{border:1px solid var(--line);border-radius:9px;padding:12px 14px;background:var(--surface)}
.ecp .kpi b{display:block;font:600 21px/1.2 "IBM Plex Mono",monospace;font-variant-numeric:tabular-nums}
.ecp .kpi span{font-size:10.5px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.06em}
.ecp .kpi em{font-style:normal;font-size:11.5px;color:var(--ink-3);display:block;margin-top:3px}
.ecp .spark{display:flex;align-items:flex-end;gap:3px;height:34px;margin-top:8px}
.ecp .spark i{flex:1;background:var(--accent-soft);border-radius:2px 2px 0 0;min-height:2px}
.ecp .spark i.hi{background:var(--accent)}
.ecp .tl{position:relative;padding-left:22px}
.ecp .tl::before{content:'';position:absolute;left:6px;top:6px;bottom:6px;width:2px;background:var(--line)}
.ecp .tl .ev{position:relative;padding:9px 0}
.ecp .tl .ev::before{content:'';position:absolute;left:-19px;top:15px;width:9px;height:9px;border-radius:50%;background:var(--line-strong);border:2px solid var(--surface)}
.ecp .tl .ev.now::before{background:var(--ok)}
.ecp .tl .ev .t{font-weight:600;font-size:13.5px}
.ecp .tl .ev .m{font-size:12px;color:var(--ink-3)}
.ecp .cbx{display:grid;place-items:center}
.ecp .cbx input{width:15px;height:15px;cursor:pointer}
`;

function css5() { if (!document.getElementById('ecp-css5')) {
  const st = document.createElement('style'); st.id = 'ecp-css5'; st.textContent = CSS5; document.head.appendChild(st); } }

/* ---------- the "other side": a calendar derived from each CRM row ----------
   Divergence is not random. Each sync state produces the specific kind of drift
   that state is meant to describe, so the screen has something real to reconcile. */
function calendarSide(rows) {
  const out = [];
  rows.forEach(r => {
    if (r.Sync_State === 'not_in_crm') return;            // exists only in the CRM
    const p = parseDT(r.Meeting_DateTime_String);
    const ev = { key:r.id, subject:`${r['Account_Name.Account_Name']} — ${r.Meeting_Type}`,
      start:r.Meeting_DateTime_String, duration:r.Meeting_Duration,
      room:r.Meeting_Room || r.Spot || '', organiser:r.Owner, modified:'2026-03-02' };
    if (r.Sync_State === 'outdated')  { ev.subject += ' (rescheduled)'; ev.modified = r.External_Modified || '2026-03-09';
                                        if (p) ev.start = `${p.day} ${hhmm(p.min + 30)}`; }
    if (r.Sync_State === 'incorrect') { ev.duration = r.Meeting_Duration === 30 ? 45 : r.Meeting_Duration - 15;
                                        ev.room = 'Room Alpha 2'; }
    if (r.Sync_State === 'no_dates')  { ev.start = ''; }
    out.push(ev);
  });
  // two events nobody ever put in the CRM
  out.push({ key:'CAL-1', subject:'Kestrel Devices — introduction', start:'11.03.2026 15:00', duration:30,
             room:'Lounge B', organiser:'D. Meier', modified:'2026-03-08', orphan:true });
  out.push({ key:'CAL-2', subject:'Fenwick Audio — follow-up', start:'12.03.2026 09:30', duration:45,
             room:'Room Alpha', organiser:'K. Sandberg', modified:'2026-03-09', orphan:true });
  return out;
}

const Reconcile = {
  async render(b, P) {
    css5();
    this.P = P;
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0 12px 0 0">Calendar sync</h4>
        <span class="cnt"><b id="r-tot">—</b>rows</span>
        <span class="cnt" data-s="in_sync"><b id="r-ok">—</b>in sync</span>
        <span class="cnt" data-s="outdated"><b id="r-out">—</b>outdated</span>
        <span class="cnt" data-s="incorrect"><b id="r-bad">—</b>incorrect</span>
        <span class="cnt" data-s="not_in_crm"><b id="r-nc">—</b>only in CRM</span>
        <span class="cnt" data-s="orphan"><b id="r-orph">—</b>only in calendar</span>
        <span class="grow"></span>
        <button class="btn" id="r-bulk" style="padding:8px 14px">Repair everything shown</button>
        <button class="ver">v2.1.0</button></div>
      <div class="tools"><span class="hint" id="r-note">Loading both sides…</span>
        <span class="grow"></span>
        <label style="font-size:12.5px;display:flex;gap:6px;align-items:center">
          <input type="checkbox" id="r-chaos"> simulate a flaky connection</label></div>
      <div class="tw" id="r-tw"></div>
      <div class="hint" style="margin-top:10px">Two columns cannot tell you what a record <i>should</i> say.
        The third column is the expected value, computed from both sides plus the rules — that is what the repair writes.</div>
    </div>`;

    const { rows } = await coqlAll(
      `select id, Name, Meeting_DateTime_String, Meeting_Duration, Meeting_Room, Spot, Meeting_Type,
       Meeting_Status, Owner, Sync_State, External_Modified, Account_Name.Account_Name
       from Meetings where Campaign = '${P.c.id}'`);
    this.rows = rows;
    this.cal = calendarSide(rows);
    q(b,'#r-chaos').onchange = e => { mockZoho.chaos.mode = e.target.checked ? 'throttle' : 'off';
      q(b,'#r-note').textContent = e.target.checked
        ? 'Rate limiting is on. Repairs will fail part of the time — the row says which and stays repairable.'
        : `${rows.length} CRM rows and ${this.cal.length} calendar events matched by identifier.`; };
    q(b,'#r-bulk').onclick = () => this.bulk(b);
    qa(b,'.cnt[data-s]').forEach(c => c.onclick = () => {
      this.only = this.only === c.dataset.s ? null : c.dataset.s;
      qa(b,'.cnt[data-s]').forEach(x => x.setAttribute('aria-pressed', String(this.only === x.dataset.s)));
      this.draw(b); });
    q(b,'#r-note').textContent = `${rows.length} CRM rows and ${this.cal.length} calendar events matched by identifier.`;
    this.draw(b);
  },

  pairs() {
    // pairs are rebuilt on every draw, so "repaired" cannot live on the object —
    // it lives in a set keyed by the row, which also makes the bulk pass restartable
    this.done = this.done || new Set();
    const byKey = {}; this.cal.forEach(e => byKey[e.key] = e);
    const list = this.rows.map(r => ({ r, e:byKey[r.id] || null, key:r.id,
      state:this.done.has(r.id) ? 'repaired' : r.Sync_State }));
    this.cal.filter(e => e.orphan).forEach(e => list.push({ r:null, e, key:e.key,
      state:this.done.has(e.key) ? 'repaired' : 'orphan' }));
    return list;
  },

  expected(p) {
    // Rules, in the order they are allowed to win.
    if (!p.r) return { subject:p.e.subject, start:p.e.start, duration:p.e.duration, room:p.e.room,
                       note:'create the CRM record from the calendar' };
    if (!p.e) return { subject:`${p.r['Account_Name.Account_Name']} — ${p.r.Meeting_Type}`,
                       start:p.r.Meeting_DateTime_String, duration:p.r.Meeting_Duration,
                       room:p.r.Meeting_Room || p.r.Spot || '', note:'send the invitation; the calendar has nothing' };
    return {
      // the calendar owns when and how long; a human owns the room note and the type
      subject:`${p.r['Account_Name.Account_Name']} — ${p.r.Meeting_Type}`,
      start:p.e.start || p.r.Meeting_DateTime_String,
      duration:p.e.duration,
      room:p.r.Meeting_Room || p.e.room,
      note:'calendar wins on time, the CRM keeps the room and the type'
    };
  },

  draw(b) {
    const all = this.pairs();
    const n = s => all.filter(x => x.state === s).length;
    q(b,'#r-tot').textContent  = all.length;
    q(b,'#r-ok').textContent   = n('in_sync');
    q(b,'#r-out').textContent  = n('outdated');
    q(b,'#r-bad').textContent  = n('incorrect');
    q(b,'#r-nc').textContent   = n('not_in_crm');
    q(b,'#r-orph').textContent = n('orphan');

    const list = this.only ? all.filter(x => x.state === this.only) : all;
    const badge = s => ({ in_sync:'<span class="pill ok">in sync</span>',
      outdated:'<span class="pill info">outdated</span>', incorrect:'<span class="pill no">incorrect</span>',
      not_in_crm:'<span class="pill ghost">only in CRM</span>', orphan:'<span class="pill ghost">only in calendar</span>',
      no_dates:'<span class="pill ghost">no dates</span>', repaired:'<span class="pill ok">repaired</span>' }[s] || s);

    q(b,'#r-tw').innerHTML = `<table class="d"><thead><tr>
      <th>State</th><th>Account</th><th>CRM start</th><th>Calendar start</th><th>CRM min</th><th>Cal min</th>
      <th>Room</th><th>Owner</th><th style="width:150px">Repair</th></tr></thead><tbody>
      ${list.map((p,i) => `<tr data-i="${all.indexOf(p)}">
        <td>${badge(p.state)}</td>
        <td class="wrap">${E(p.r ? p.r['Account_Name.Account_Name'] : p.e.subject.split('—')[0].trim())}</td>
        <td>${p.r ? E(p.r.Meeting_DateTime_String || '—') : '<span style="color:var(--ink-3)">—</span>'}</td>
        <td class="${p.e && p.r && p.e.start !== p.r.Meeting_DateTime_String ? 'differs' : ''}"
            style="${p.e && p.r && p.e.start !== p.r.Meeting_DateTime_String ? 'color:var(--warn);font-weight:500' : ''}">
            ${p.e ? E(p.e.start || '—') : '<span style="color:var(--ink-3)">—</span>'}</td>
        <td>${p.r ? p.r.Meeting_Duration : '—'}</td>
        <td style="${p.e && p.r && p.e.duration !== p.r.Meeting_Duration ? 'color:var(--warn);font-weight:500' : ''}">${p.e ? p.e.duration : '—'}</td>
        <td>${E((p.r && (p.r.Meeting_Room || p.r.Spot)) || (p.e && p.e.room) || '—')}</td>
        <td>${E((p.r && p.r.Owner) || (p.e && p.e.organiser) || '—')}</td>
        <td><button class="ghost2" data-diff="${all.indexOf(p)}">compare</button>
            ${p.state === 'in_sync' || p.state === 'repaired' ? '' :
              `<button class="ghost2" data-fix="${all.indexOf(p)}">repair</button>`}</td></tr>`).join('')}
      </tbody></table>`;
    q(b,'#r-tw').onclick = e => {
      const d = e.target.closest('[data-diff]'); if (d) return this.compare(all[+d.dataset.diff]);
      const f = e.target.closest('[data-fix]'); if (f) return this.fix(b, all[+f.dataset.fix], f);
    };
  },

  compare(p) {
    const exp = this.expected(p);
    const row = (k, crm, cal, ex) => {
      const cls = v => v == null || v === '' ? 'only' : (String(crm) === String(cal) ? 'same' : 'differs');
      return `<div class="k">${E(k)}</div>
        <div class="${p.r ? cls(crm) : 'only'}">${E(crm ?? '—')}</div>
        <div class="${p.e ? cls(cal) : 'only'}">${E(cal ?? '—')}</div>
        <div class="exp">${E(ex ?? '—')}</div>`;
    };
    const mask = el(`<div class="ecp-mask ecp"><div class="ecp-mod" style="width:min(760px,100%)">
      <div class="hd"><h3>Three-way comparison</h3><button class="x">&times;</button></div>
      <div class="pane" style="min-height:0">
        <div class="diff">
          <div></div><div>In the CRM</div><div>In the calendar</div><div>Expected</div>
          ${row('Subject', p.r ? `${p.r['Account_Name.Account_Name']} — ${p.r.Meeting_Type}` : null, p.e && p.e.subject, exp.subject)}
          ${row('Start',    p.r && p.r.Meeting_DateTime_String, p.e && p.e.start, exp.start)}
          ${row('Duration', p.r && p.r.Meeting_Duration, p.e && p.e.duration, exp.duration)}
          ${row('Room',     p.r && (p.r.Meeting_Room || p.r.Spot), p.e && p.e.room, exp.room)}
          ${row('Owner',    p.r && p.r.Owner, p.e && p.e.organiser, exp.organiser || (p.r && p.r.Owner))}
        </div>
        <div class="legend"><span class="l1">identical</span><span class="l2">differs</span>
          <span class="l3">present on one side only</span><span class="l4">what the repair will write</span></div>
        <div class="callout acc" style="margin-top:14px;border-left:3px solid var(--accent);background:var(--accent-soft);padding:11px 14px;border-radius:0 7px 7px 0;font-size:13px">
          <b>Rule applied:</b> ${E(exp.note)}.</div>
      </div>
      <div class="ft"><span class="sp"></span><button class="btn" id="d-ok">Close</button></div></div></div>`);
    document.body.appendChild(mask);
    const close = () => mask.remove();
    q(mask,'.x').onclick = close; q(mask,'#d-ok').onclick = close;
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
  },

  async fix(b, p, btn) {
    const exp = this.expected(p);
    btn.disabled = true; btn.textContent = 'repairing…';
    try {
      if (!p.r) {
        await ZOHO.CRM.API.insertRecord({ Entity:'Meetings', APIData:{
          Name:exp.subject, Meeting_DateTime_String:exp.start, Meeting_Duration:exp.duration,
          Meeting_Room:exp.room, Meeting_Status:'Booked', Meeting_Type:'Discovery',
          Campaign:this.P.c.id, Account_Name:(this.rows[0]||{}).Account_Name, Sync_State:'in_sync' }});
      } else {
        await ZOHO.CRM.API.updateRecord({ Entity:'Meetings', RecordID:p.r.id, APIData:{
          Meeting_DateTime_String:exp.start, Meeting_Duration:exp.duration, Sync_State:'in_sync' }});
        p.r.Meeting_DateTime_String = exp.start; p.r.Meeting_Duration = exp.duration; p.r.Sync_State = 'in_sync';
      }
      this.done.add(p.key);
      this.draw(b);
    } catch (e) {
      btn.disabled = false; btn.textContent = 'retry';
      btn.title = `${e.code} — ${e.message}`;
      btn.style.color = 'var(--crit)'; btn.style.borderColor = 'var(--crit)';
      q(b,'#r-note').innerHTML = `<span style="color:var(--crit)">${E(e.code)} — ${E(e.message)}</span>
        · the row keeps its state, so a retry does the same work rather than half of it`;
    }
  },

  async bulk(b) {
    const all = this.pairs().filter(p => p.state !== 'in_sync' && p.state !== 'repaired');
    const note = q(b,'#r-note');
    let done = 0, failed = 0;
    for (const p of all) {
      note.textContent = `Repairing ${done + failed + 1} of ${all.length}…`;
      try { await this.fixQuiet(p); done++; } catch (_) { failed++; }
    }
    this.draw(b);
    note.innerHTML = `${done} repaired`
      + (failed ? ` · <span style="color:var(--crit)">${failed} refused and left exactly as they were</span>` : '')
      + ` · the pass is restartable, because each row is decided on its own`;
  },
  async fixQuiet(p) {
    const exp = this.expected(p);
    if (!p.r) { await ZOHO.CRM.API.insertRecord({ Entity:'Meetings', APIData:{
      Name:exp.subject, Meeting_DateTime_String:exp.start, Meeting_Duration:exp.duration,
      Meeting_Room:exp.room, Meeting_Status:'Booked', Meeting_Type:'Discovery',
      Campaign:this.P.c.id, Account_Name:(this.rows[0]||{}).Account_Name, Sync_State:'in_sync' }}); }
    else { await ZOHO.CRM.API.updateRecord({ Entity:'Meetings', RecordID:p.r.id, APIData:{
      Meeting_DateTime_String:exp.start, Meeting_Duration:exp.duration, Sync_State:'in_sync' }});
      p.r.Meeting_DateTime_String = exp.start; p.r.Meeting_Duration = exp.duration; p.r.Sync_State = 'in_sync'; }
    this.done.add(p.key);
  }
};

/* ---------- account: at a glance ---------- */
const Glance = {
  async render(b, a) {
    css5();
    b.innerHTML = `<div class="panel"><h4>At a glance</h4><div class="kpi" id="g-kpi"></div></div>
      <div class="panel"><h4>Recent activity</h4><div class="tl" id="g-tl"></div></div>`;
    const [deals, meetings, contacts] = await Promise.all([
      coqlAll(`select id, Deal_Name, Stage, Amount, Closing_Date, Business_Unit from Deals where Account_Name = '${esc(a.id)}'`),
      coqlAll(`select id, Name, Meeting_DateTime_String, Meeting_Status, Meeting_Type, Recap from Meetings where Account_Name = '${esc(a.id)}'`),
      coqlAll(`select id, Full_Name, Title from Contacts where Account_Name = '${esc(a.id)}'`)
    ]);
    const won = deals.rows.filter(d => d.Stage === '4. Won');
    const open = deals.rows.filter(d => !['4. Won','5. Lost'].includes(d.Stage));
    const lost = deals.rows.filter(d => d.Stage === '5. Lost');
    const sum = l => l.reduce((s,d) => s + d.Amount, 0);
    const units = [...new Set(deals.rows.map(d => d.Business_Unit))];
    const bars = units.map(u => sum(deals.rows.filter(d => d.Business_Unit === u && d.Stage === '4. Won')));
    const top = Math.max(1, ...bars);

    q(b,'#g-kpi').innerHTML = [
      ['Booked', money(sum(won)), `${won.length} deals won`],
      ['In play', money(sum(open)), `${open.length} open`],
      ['Lost', money(sum(lost)), `${lost.length} closed lost`],
      ['Win rate', won.length + lost.length ? Math.round(won.length / (won.length + lost.length) * 100) + '%' : '—',
        `${won.length + lost.length} decided`],
      ['People', contacts.rows.length, `${contacts.rows.length ? 'in the CRM' : 'none yet'}`],
      ['Meetings', meetings.rows.length, `${meetings.rows.filter(m => m.Recap).length} with a recap`]
    ].map(([k,v,e]) => `<div><b>${E(v)}</b><span>${E(k)}</span><em>${E(e)}</em></div>`).join('')
      + `<div style="grid-column:1/-1"><span>Booked by business unit</span>
          <div class="spark">${bars.map(x => `<i class="${x === top && x ? 'hi' : ''}" style="height:${Math.max(3, x/top*100)}%" title="${money(x)}"></i>`).join('')}</div>
          <em>${units.map(E).join(' · ') || 'no deals yet'}</em></div>`;

    const ev = [];
    meetings.rows.forEach(m => { const p = parseDT(m.Meeting_DateTime_String);
      ev.push({ k:p ? p.day.split('.').reverse().join('-') : '9999', t:`${m.Meeting_Type} meeting`,
        m:`${m.Meeting_Status}${m.Recap ? ' · recap written' : ''}`, now:m.Meeting_Status === 'Booked' }); });
    deals.rows.forEach(d => ev.push({ k:d.Closing_Date, t:d.Deal_Name.split('—').pop().trim(),
      m:`${d.Stage} · ${money(d.Amount)}`, now:d.Stage === '4. Won' }));
    ev.sort((x,y) => x.k < y.k ? 1 : -1);
    q(b,'#g-tl').innerHTML = ev.slice(0,12).map(x =>
      `<div class="ev ${x.now ? 'now' : ''}"><div class="t">${E(x.t)}</div><div class="m">${E(x.k)} · ${E(x.m)}</div></div>`).join('')
      || '<div class="none">Nothing recorded against this account yet.</div>';
  }
};

/* ---------- account: development plan ---------- */
const Plan = {
  async render(b, a) {
    css5();
    this.a = a;
    const LADDER = ['No relationship','Approved vendor','Preferred supplier','Solutions consultant','Strategic contributor','Trusted partner'];
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0">Relationship</h4>
        <span class="grow"></span>
        ${a.Plan_Active ? '<span class="pill ok">plan active</span>' : '<span class="pill ghost">never activated</span>'}
        <span class="hint">${a.Plan_Updated ? 'last touched ' + E(a.Plan_Updated) : ''}</span>
        <button class="ver">v1.9.3</button></div>
      <div class="ladder">${LADDER.map(l => `<span class="${l === a.Relationship_Now ? 'on' : l === a.Relationship_Target ? 'want' : ''}">${E(l)}</span>`).join('')}</div>
      <div class="hint" style="margin-top:8px">Filled: where we are. Dashed: where we want to be. The client's own view is
        <b>${E(a.Relationship_Client || '—')}</b> — recorded separately, because the two disagree more often than anyone likes.</div>
      <div class="info" style="margin-top:16px">
        <div class="f"><i>Objective</i><b>${E(a.Plan_Objective || '—')}</b></div>
        <div class="f"><i>Blockers</i><b>${E(a.Plan_Blockers || 'none recorded')}</b></div>
        <div class="f"><i>Owner</i><b>${E(a.Owner)}</b></div>
      </div></div>

      <div class="panel"><div class="tools"><h4 style="margin:0">Strategic players</h4>
        <span class="grow"></span><span class="hint" id="p-pn"></span></div>
        <div class="tw" id="p-players"></div></div>

      <div class="panel"><div class="tools"><h4 style="margin:0">Action plan</h4>
        <span class="grow"></span><span class="hint" id="p-an"></span></div>
        <div class="tw" id="p-actions"></div></div>

      <div class="panel"><div class="tools"><h4 style="margin:0">Cross-sell matrix</h4>
        <span class="grow"></span><span class="hint">Every tick writes straight to the record — there is no Save button, on purpose.</span></div>
        <div class="tw" id="p-matrix"></div></div>`;

    const [players, actions, matrix] = await Promise.all([
      coqlAll(`select id, Name, Title, Player_Role, Relationship, Justification, Best_Contact, Strategy from Plan_Players where Account_Name = '${esc(a.id)}'`),
      coqlAll(`select id, Task, Expected, Actual, Business_Unit, Deadline, Progress, Status, Owner from Plan_Actions where Account_Name = '${esc(a.id)}'`),
      coqlAll(`select id, Business_Unit, Service, Selling, Lost, Providing, Provided_Before, Want, Not_Relevant, Comment from Service_Matrix where Account_Name = '${esc(a.id)}'`)
    ]);
    q(b,'#p-pn').textContent = `${players.rows.length} people`;
    q(b,'#p-an').textContent = `${actions.rows.length} actions · ${actions.rows.filter(x=>x.Status==='Done').length} done`;

    const roleCls = r => 'role-pill role-' + String(r).split(' ')[0].replace('Anti-sponsor','Anti-sponsor');
    S.dataTable(q(b,'#p-players'), [
      { k:'nm', label:'Player', filter:'text', text:r=>r.Name, html:r=>`<span class="link">${E(r.Name)}</span>` },
      { k:'ti', label:'Title', filter:'text', cls:'wrap', text:r=>r.Title || '' },
      { k:'rl', label:'Role', filter:'select', text:r=>r.Player_Role,
        html:r=>`<span class="${roleCls(r.Player_Role)}">${E(r.Player_Role)}</span>` },
      { k:'rel',label:'Relationship', filter:'select', text:r=>r.Relationship || '' },
      { k:'ju', label:'Why we think so', filter:'text', cls:'wrap', text:r=>r.Justification || '' },
      { k:'bc', label:'Best contact', filter:'select', text:r=>r.Best_Contact || '' },
      { k:'st', label:'Strategy', filter:'text', cls:'wrap', text:r=>r.Strategy || '' }
    ], players.rows, { cap:60 });

    S.dataTable(q(b,'#p-actions'), [
      { k:'t',  label:'Task', filter:'text', cls:'wrap', text:r=>r.Task },
      { k:'e',  label:'Expected result', filter:'text', cls:'wrap', text:r=>r.Expected || '' },
      { k:'ac', label:'Actual', filter:'text', cls:'wrap', text:r=>r.Actual || '' },
      { k:'bu', label:'Unit', filter:'select', text:r=>r.Business_Unit || '' },
      { k:'dl', label:'Deadline', filter:'text', text:r=>r.Deadline || '' },
      { k:'pg', label:'% done', filter:'min', text:r=>String(r.Progress), sortVal:r=>+r.Progress,
        html:r=>{ const c = r.Progress >= 100 ? 'var(--ok)' : r.Progress >= 80 ? 'var(--accent)' : r.Progress >= 50 ? 'var(--warn)' : 'var(--crit)';
          return `<span class="prog"><span class="bar3"><i style="width:${r.Progress}%;background:${c}"></i></span><b>${r.Progress}%</b></span>`; } },
      { k:'s',  label:'Status', filter:'select', text:r=>r.Status,
        html:r=>r.Status==='Done'?'<span class="pill ok">done</span>'
             :r.Status==='At risk'?'<span class="pill no">at risk</span>'
             :r.Status==='In progress'?'<span class="pill book">in progress</span>':'<span class="pill ghost">not started</span>' },
      { k:'o',  label:'Owner', filter:'select', text:r=>r.Owner || '' }
    ], actions.rows, { cap:60 });

    const flags = [['Selling','Selling now'],['Lost','Lost'],['Providing','Delivering'],
                   ['Provided_Before','Delivered before'],['Want','Want to sell'],['Not_Relevant','Not relevant']];
    S.dataTable(q(b,'#p-matrix'), [
      { k:'bu', label:'Unit', filter:'select', text:r=>r.Business_Unit },
      { k:'sv', label:'Service', filter:'text', cls:'wrap', text:r=>r.Service },
      ...flags.map(([f,l]) => ({ k:f, label:l, filter:'select', cls:'cbx', text:r=>r[f]?'yes':'no',
        html:r=>`<input type="checkbox" data-m="${r.id}" data-flag="${f}" ${r[f]?'checked':''}>` })),
      { k:'cm', label:'Comment', filter:'text', cls:'wrap', text:r=>r.Comment || '' }
    ], matrix.rows, { cap:120 });

    q(b,'#p-matrix').addEventListener('change', async e => {
      const c = e.target.closest('input[data-m]'); if (!c) return;
      const id = c.dataset.m, f = c.dataset.flag, v = c.checked;
      c.disabled = true;
      try { await ZOHO.CRM.API.updateRecord({ Entity:'Service_Matrix', RecordID:id, APIData:{ [f]:v }});
        const row = matrix.rows.find(x => x.id === id); if (row) row[f] = v; }
      catch (err) { c.checked = !v; alert(`${err.code} — ${err.message}`); }
      c.disabled = false;
    });
  }
};

/* ---------- contact: employment history ---------- */
const History = {
  async mount(host, contactId) {
    css5();
    const c = (await ZOHO.CRM.API.getRecord({ Entity:'Contacts', RecordID:contactId })).data[0];
    this.c = c;
    shell(host, { kind:'Contact', title:c.Full_Name,
      fields:[['Title', c.Title], ['Seniority', c.Seniority], ['Email', c.Email || '—'], ['Status', c.Contact_Status],
              ['Main account', c.Account_Name ? c.Account_Name.name : '—'], ['Profile', c.Linkedin ? 'on file' : '—'],
              ['Added', c.Created_Time], ['Records', '—']],
      actions:[['add','Add employment'],['merge','Find duplicates'],['export','Export']],
      tabs:['Employment history','Provider sync'], ghostTabs:['Meetings','Emails'],
      onTab:(t,b)=> t === 'Provider sync' ? window.CRMApollo.PersonSync.render(b, c) : this.render(b),
      onAction:a => { if (a === 'add') this.add(); } });
  },

  async render(b) {
    const c = this.c;
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0">Where this person has worked</h4>
        <span class="grow"></span><span class="hint" id="h-n"></span><button class="ver">v1.2.0</button></div>
      <div class="tw" id="h-tw"></div>
      <div class="hint" style="margin-top:10px">One row is marked as the main employer, and it is the one the contact
        record points at. Ticking a different row moves that pointer — it behaves like a radio button even though the
        underlying field is a plain checkbox on each row.</div>
    </div>`;
    const { rows } = await coqlAll(
      `select id, Company, Title, Seniority, Email, Start_Date, End_Date, Is_Main, Status, Buyer_Role, Comment
       from Employment where Contact = '${esc(c.id)}'`);
    rows.sort((a,b2) => (b2.Start_Date || '').localeCompare(a.Start_Date || ''));
    this.rows = rows;
    q(b,'#h-n').textContent = `${rows.length} record${rows.length === 1 ? '' : 's'}`;
    const dur = r => { const s = new Date(r.Start_Date), e = r.End_Date ? new Date(r.End_Date) : new Date(2026,7,1);
      const m = Math.max(1, Math.round((e - s) / 2.6e9)); return m >= 12 ? `${Math.floor(m/12)} yr ${m%12} mo` : `${m} mo`; };

    S.dataTable(q(b,'#h-tw'), [
      { k:'main', label:'Main', filter:'select', cls:'cbx', text:r=>r.Is_Main?'yes':'no',
        html:r=>`<input type="checkbox" data-main="${r.id}" ${r.Is_Main?'checked':''}>` },
      { k:'co', label:'Company', filter:'text', cls:'wrap', text:r=>r.Company,
        html:r=>`<span class="link">${E(r.Company)}</span>` },
      { k:'ti', label:'Title', filter:'text', cls:'wrap', text:r=>r.Title || '' },
      { k:'sn', label:'Seniority', filter:'select', text:r=>r.Seniority || '' },
      { k:'br', label:'Buyer role', filter:'select', text:r=>r.Buyer_Role || '',
        html:r=>r.Buyer_Role?`<span class="pill info">${E(r.Buyer_Role)}</span>`:'<span style="color:var(--ink-3)">—</span>' },
      { k:'fr', label:'From', filter:'text', text:r=>r.Start_Date || '' },
      { k:'to', label:'To', filter:'text', text:r=>r.End_Date || 'present',
        html:r=>r.End_Date?E(r.End_Date):'<span class="pill ok">present</span>' },
      { k:'du', label:'For', filter:'none', text:r=>dur(r) },
      { k:'em', label:'Email', filter:'text', cls:'wrap', text:r=>r.Email || '',
        html:r=>r.Email?E(r.Email):'<span class="pill ghost">not on file</span>' },
      { k:'cm', label:'Note', filter:'text', cls:'wrap', text:r=>r.Comment || '' }
    ], rows, { cap:40 });

    q(b,'#h-tw').addEventListener('change', async e => {
      const box = e.target.closest('input[data-main]'); if (!box) return;
      const id = box.dataset.main;
      qa(b,'#h-tw input[data-main]').forEach(x => x.disabled = true);
      try {
        for (const r of rows) if (r.Is_Main && r.id !== id) {
          await ZOHO.CRM.API.updateRecord({ Entity:'Employment', RecordID:r.id, APIData:{ Is_Main:false }});
          r.Is_Main = false;
        }
        await ZOHO.CRM.API.updateRecord({ Entity:'Employment', RecordID:id, APIData:{ Is_Main:true }});
        const row = rows.find(x => x.id === id); if (row) row.Is_Main = true;
        this.render(b);
      } catch (err) {
        qa(b,'#h-tw input[data-main]').forEach(x => x.disabled = false);
        alert(`${err.code} — ${err.message}`);
      }
    });
  },

  add() {
    const mask = el(`<div class="ecp-mask ecp"><div class="ecp-mod" style="width:min(540px,100%)">
      <div class="hd"><h3>Add employment</h3><button class="x">&times;</button></div>
      <div class="pane" style="min-height:0">
        <span class="lab">Company</span><input class="ti" id="e-co" placeholder="Type two letters to search accounts…">
        <div id="e-hits" style="margin-top:8px"></div>
        <div class="two" style="margin-top:14px">
          <div><span class="lab">Title</span><input class="ti" id="e-ti"></div>
          <div><span class="lab">Seniority</span><select class="se" id="e-sn">
            ${['Junior','Middle','Senior','Lead','C-Level'].map(x=>`<option>${x}</option>`).join('')}</select></div>
        </div>
        <div class="two" style="margin-top:14px">
          <div><span class="lab">From</span><input class="ti" id="e-fr" type="date"></div>
          <div><span class="lab">To</span><input class="ti" id="e-to" type="date"></div>
        </div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:14px;font-size:13px">
          <input type="checkbox" id="e-cur"> still works here</label>
        <div class="hint" id="e-msg" style="color:var(--warn)"></div>
      </div>
      <div class="ft"><span class="sp"></span><button class="btn sec" id="e-cancel">Cancel</button>
        <button class="btn" id="e-save">Add</button></div></div></div>`);
    document.body.appendChild(mask);
    const close = () => mask.remove();
    q(mask,'.x').onclick = close; q(mask,'#e-cancel').onclick = close;
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
    let accId = null;
    q(mask,'#e-co').oninput = async e => {
      const v = e.target.value.trim(); accId = null;
      if (v.length < 2) { q(mask,'#e-hits').innerHTML = ''; return; }
      const r = await ZOHO.CRM.API.searchRecord({ Entity:'Accounts', Query:`(Account_Name:starts_with:${v})` });
      q(mask,'#e-hits').innerHTML = r.data.slice(0,5).map(a =>
        `<div class="room" data-id="${a.id}" data-n="${E(a.Account_Name)}"><div><div class="nm">${E(a.Account_Name)}</div>
          <div class="mt">${E(a.Country)}</div></div><div class="tick">&#10003;</div></div>`).join('')
        || `<div class="hint">No account starts with “${E(v)}”. It can still be typed free-hand — plenty of people
             come from companies that are not clients.</div>`;
    };
    q(mask,'#e-hits').onclick = e => { const r = e.target.closest('[data-id]'); if (!r) return;
      accId = r.dataset.id; q(mask,'#e-co').value = r.dataset.n; q(mask,'#e-hits').innerHTML = ''; };
    q(mask,'#e-cur').onchange = e => { q(mask,'#e-to').disabled = e.target.checked; };
    q(mask,'#e-save').onclick = async () => {
      const cur = q(mask,'#e-cur').checked;
      try {
        await ZOHO.CRM.API.insertRecord({ Entity:'Employment', APIData:{
          Contact:this.c.id, Account_Name:accId, Company:q(mask,'#e-co').value.trim(),
          Title:q(mask,'#e-ti').value.trim(), Seniority:q(mask,'#e-sn').value,
          Start_Date:q(mask,'#e-fr').value, End_Date:cur ? null : q(mask,'#e-to').value,
          Is_Main:false, Status:cur ? 'Current' : 'Past' }});
        close(); this.render(document.getElementById('ecp-body'));
      } catch (err) { q(mask,'#e-msg').textContent = `${err.code} — ${err.message}`; }
    };
  }
};

window.CRMWidgets2 = { Reconcile, Glance, Plan, History };
})();
