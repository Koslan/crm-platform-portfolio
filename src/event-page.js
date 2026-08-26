/* =============================================================
   Event Campaign record page — emulated CRM shell with the
   widgets that live on it. Runs on mockZoho, no CRM required.
   Tabs: Overview · Contacts · Meetings   +  Create Meeting wizard
============================================================= */
(function () {
'use strict';

const CSS = `
.ecp{--h:#1b5f8f;--h2:#1d5c4a;--b:var(--line);--r:8px;font-size:14px}
.ecp *{box-sizing:border-box}
.ecp .bar{background:linear-gradient(100deg,#1f6fa8 0%,#1d5c4a 100%);color:#fff;border-radius:var(--r) var(--r) 0 0;padding:18px 22px;display:grid;grid-template-columns:1.15fr .95fr auto;gap:18px}
.ecp .bar h3{font-family:"IBM Plex Serif",serif;font-size:17px;margin:0 0 14px;font-weight:600}
.ecp .bar h3 span{font-weight:400;opacity:.82;margin-right:8px}
.ecp .f{display:grid;grid-template-columns:130px 1fr;gap:3px 12px;font-size:12.5px;line-height:1.7}
.ecp .f b{font-weight:600}
.ecp .f i{font-style:normal;opacity:.8}
.ecp .acts{display:grid;grid-template-columns:1fr 1fr;gap:8px;align-content:start}
.ecp .acts button{font:500 12px/1 "IBM Plex Sans",sans-serif;padding:9px 12px;border-radius:5px;border:0;cursor:pointer;background:rgba(255,255,255,.16);color:#fff;white-space:nowrap}
.ecp .acts button:hover{background:rgba(255,255,255,.28)}
.ecp .acts button.pri{background:#2b8fd6}
.ecp .acts button.pri:hover{background:#3ba0e6}
.ecp .tabs{display:flex;gap:2px;background:var(--surface);border:1px solid var(--b);border-top:0;padding:0 14px;overflow-x:auto}
.ecp .tabs button{font:500 13.5px/1 "IBM Plex Sans",sans-serif;background:none;border:0;border-bottom:2px solid transparent;padding:13px 14px;cursor:pointer;color:var(--ink-2);white-space:nowrap}
.ecp .tabs button[aria-selected="true"]{color:var(--accent);border-bottom-color:var(--accent)}
.ecp .body{background:var(--ground);border:1px solid var(--b);border-top:0;border-radius:0 0 var(--r) var(--r);padding:16px}
.ecp .panel{background:var(--surface);border:1px solid var(--b);border-radius:var(--r);padding:14px 16px;margin-bottom:14px}
.ecp .panel > h4{font:600 14px/1 "IBM Plex Serif",serif;margin:0 0 12px}
.ecp .tools{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.ecp .cnt{display:inline-flex;align-items:baseline;gap:5px;border:1px solid var(--b);border-radius:999px;padding:3px 10px;font-size:11.5px;color:var(--ink-3);cursor:pointer;background:var(--surface)}
.ecp .cnt b{font:600 12.5px/1 "IBM Plex Mono",monospace;color:var(--ink);font-variant-numeric:tabular-nums}
.ecp .cnt[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-ink)}
.ecp .chip2{font:400 12px/1 "IBM Plex Sans",sans-serif;border:1px solid var(--b);background:var(--surface);color:var(--ink-2);border-radius:999px;padding:6px 11px;cursor:pointer}
.ecp .chip2:hover{border-color:var(--line-strong)}
.ecp .chip2[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.ecp .seg{display:inline-flex;border:1px solid var(--b);border-radius:6px;overflow:hidden}
.ecp .seg button{font:400 12px/1 "IBM Plex Sans",sans-serif;background:var(--surface);border:0;border-right:1px solid var(--b);padding:7px 11px;cursor:pointer;color:var(--ink-2)}
.ecp .seg button:last-child{border-right:0}
.ecp .seg button[aria-pressed="true"]{background:var(--accent-soft);color:var(--accent-ink);font-weight:500}
.ecp .grow{flex:1}
.ecp input.search{border:1px solid var(--b);border-radius:6px;padding:7px 11px;font:400 12.5px/1 "IBM Plex Sans",sans-serif;min-width:230px;background:var(--surface);color:var(--ink)}
.ecp .ver{font:400 10.5px/1 "IBM Plex Mono",monospace;color:var(--ink-3);border:1px solid var(--b);border-radius:4px;padding:4px 6px;cursor:pointer}
.ecp .tw{overflow:auto;max-height:520px;border:1px solid var(--b);border-radius:6px;background:var(--surface)}
.ecp table.d{border-collapse:separate;border-spacing:0;width:100%;font-size:12.5px}
.ecp table.d th{position:sticky;top:0;z-index:2;background:var(--surface-2);font:500 10px/1.3 "IBM Plex Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);text-align:left;padding:9px 10px;border-bottom:1px solid var(--b);white-space:nowrap}
.ecp table.d td{padding:7px 10px;border-bottom:1px solid var(--b);vertical-align:middle;white-space:nowrap}
.ecp table.d tr:hover td{background:var(--surface-2)}
.ecp table.d td.wrap{white-space:normal;min-width:180px}
.ecp .pill{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:2px 9px;font-size:11px;border:1px solid transparent;white-space:nowrap}
.ecp .pill.ok{background:var(--ok-bg);color:var(--ok);border-color:color-mix(in srgb,var(--ok) 32%,transparent)}
.ecp .pill.book{background:var(--accent-soft);color:var(--accent-ink);border-color:color-mix(in srgb,var(--accent) 32%,transparent)}
.ecp .pill.no{background:var(--crit-bg);color:var(--crit);border-color:color-mix(in srgb,var(--crit) 32%,transparent)}
.ecp .pill.info{background:var(--warn-bg);color:var(--warn);border-color:color-mix(in srgb,var(--warn) 32%,transparent)}
.ecp .pill.ghost{background:transparent;color:var(--ink-3);border-color:var(--b)}
.ecp .lock{opacity:.55;margin-left:2px}
.ecp .prio{font:600 10.5px/1 "IBM Plex Mono",monospace;padding:2px 6px;border-radius:4px;border:1px solid var(--b);color:var(--ink-2)}
.ecp .prio.P1{background:var(--crit-bg);color:var(--crit);border-color:transparent}
.ecp .prio.P2{background:var(--warn-bg);color:var(--warn);border-color:transparent}
.ecp .sk{height:11px;border-radius:4px;background:linear-gradient(90deg,var(--surface-2) 25%,var(--line) 37%,var(--surface-2) 63%);background-size:400% 100%;animation:ecpsk 1.3s ease infinite}
@keyframes ecpsk{0%{background-position:100% 50%}100%{background-position:0 50%}}
.ecp .load{font:400 12px/1 "IBM Plex Mono",monospace;color:var(--ink-3);margin-bottom:9px}
.ecp .info{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px 26px}
.ecp .info .f{grid-template-columns:120px 1fr;font-size:13px;color:var(--ink-2)}
.ecp .info .f b{color:var(--ink)}
.ecp .none{color:var(--ink-3);font-size:13px;padding:22px;text-align:center}
/* wizard */
.ecp-mask{position:fixed;inset:0;background:rgba(10,16,14,.55);z-index:60;display:flex;align-items:flex-start;justify-content:center;padding:36px 16px;overflow:auto}
.ecp-mod{width:min(1080px,100%);background:var(--surface);border-radius:10px;box-shadow:0 24px 70px -20px rgba(0,0,0,.5);overflow:hidden}
.ecp-mod .hd{display:flex;align-items:center;gap:12px;padding:14px 20px;border-bottom:1px solid var(--b)}
.ecp-mod .hd h3{font:600 16px/1 "IBM Plex Serif",serif;margin:0}
.ecp-mod .hd .x{margin-left:auto;background:none;border:0;font-size:20px;cursor:pointer;color:var(--ink-3);line-height:1}
.ecp-mod .steps{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;background:linear-gradient(100deg,#1f6fa8,#1d5c4a);padding:14px 20px 16px;color:#fff}
.ecp-mod .steps div{border-top:3px solid rgba(255,255,255,.28);padding-top:9px;font-size:12px;opacity:.72}
.ecp-mod .steps div.on{border-top-color:#fff;opacity:1;font-weight:500}
.ecp-mod .steps div.done{border-top-color:rgba(255,255,255,.85);opacity:.95}
.ecp-mod .steps b{display:block;font:500 10px/1 "IBM Plex Mono",monospace;opacity:.7;margin-bottom:4px}
.ecp-mod .pane{padding:20px;min-height:330px}
.ecp-mod .ft{display:flex;gap:10px;align-items:center;padding:14px 20px;border-top:1px solid var(--b);background:var(--surface-2)}
.ecp-mod .ft .msg{font-size:12.5px;color:var(--warn)}
.ecp-mod .ft .sp{flex:1}
.ecp .btn{font:500 13px/1 "IBM Plex Sans",sans-serif;padding:10px 18px;border-radius:6px;cursor:pointer;border:1px solid var(--accent);background:var(--accent);color:#fff}
.ecp .btn[disabled]{opacity:.45;cursor:not-allowed}
.ecp .btn.sec{background:var(--surface);color:var(--ink-2);border-color:var(--b)}
.ecp .two{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.ecp .lab{font:500 10.5px/1 "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);display:block;margin:0 0 8px}
.ecp .room{display:flex;align-items:center;gap:11px;border:1px solid var(--b);border-radius:8px;padding:11px 13px;cursor:pointer;margin-bottom:9px;background:var(--surface)}
.ecp .room[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft)}
.ecp .room .nm{font-weight:500}
.ecp .room .mt{font-size:11.5px;color:var(--ink-3)}
.ecp .room .tick{margin-left:auto;width:19px;height:19px;border-radius:50%;border:1.5px solid var(--line-strong);display:grid;place-items:center;font-size:11px;color:#fff}
.ecp .room[aria-pressed="true"] .tick{background:var(--accent);border-color:var(--accent)}
.ecp .slot{display:flex;align-items:center;gap:10px;border:1px solid var(--b);border-radius:6px;padding:8px 11px;margin-bottom:6px;cursor:pointer;font-family:"IBM Plex Mono",monospace;font-size:12.5px;background:var(--surface)}
.ecp .slot[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-soft);color:var(--accent-ink)}
.ecp .slot.busy{cursor:not-allowed;opacity:.55;background:var(--surface-2)}
.ecp .slot .why{margin-left:auto;font-family:"IBM Plex Sans",sans-serif;font-size:11px;color:var(--ink-3)}
.ecp .res{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:44px 20px;text-align:center}
.ecp .res .tickbig{width:56px;height:56px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center;font-size:27px}
.ecp textarea.ta,.ecp input.ti,.ecp select.se{width:100%;border:1px solid var(--b);border-radius:6px;padding:9px 11px;font:400 13px/1.5 "IBM Plex Sans",sans-serif;background:var(--surface);color:var(--ink)}
.ecp .peep{display:flex;flex-wrap:wrap;gap:6px}
.ecp .peep button{font:400 12px/1 "IBM Plex Sans",sans-serif;border:1px solid var(--b);background:var(--surface);color:var(--ink-2);border-radius:999px;padding:6px 10px;cursor:pointer}
.ecp .peep button[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.ecp .hint{font-size:12px;color:var(--ink-3);margin-top:7px}
.ecp .kvs{display:grid;grid-template-columns:130px 1fr;gap:6px 16px;font-size:13.5px}
.ecp .kvs dt{font:500 10.5px/1.5 "IBM Plex Mono",monospace;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)}
.ecp .kvs dd{margin:0;color:var(--ink)}
@media (max-width:900px){.ecp .bar{grid-template-columns:1fr}.ecp .two{grid-template-columns:1fr}.ecp .info{grid-template-columns:1fr}}
`;

/* ---------- helpers ---------- */
const E = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const el = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstElementChild; };
const q = (r, s) => r.querySelector(s);
const qa = (r, s) => Array.from(r.querySelectorAll(s));
const pad2 = n => String(n).padStart(2, '0');
const dmy = d => `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()}`;
const parseDT = s => { const m = /^(\d{2})\.(\d{2})\.(\d{4}) (\d{2}):(\d{2})$/.exec(s || ''); return m ? { day:`${m[1]}.${m[2]}.${m[3]}`, min:+m[4]*60 + +m[5] } : null; };
const hhmm = m => `${pad2(Math.floor(m/60))}:${pad2(m%60)}`;
const esc = v => String(v).replace(/'/g, "''");
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

async function coqlAll(query, cap = 1200) {
  const out = []; let offset = 0;
  for (;;) {
    const r = await ZOHO.CRM.API.coql({ select_query: `${query} limit 200 offset ${offset}` });
    out.push(...r.data);
    if (!r.info.more_records || out.length >= cap) return { rows: out, total: r.info.total };
    offset += 200;
  }
}

/* ---------- page ---------- */
const Page = {
  async mount(host, campaignId) {
    if (!document.getElementById('ecp-css')) {
      const st = document.createElement('style'); st.id = 'ecp-css'; st.textContent = CSS; document.head.appendChild(st);
    }
    const c = (await ZOHO.CRM.API.getRecord({ Entity:'Campaigns', RecordID:campaignId })).data[0];
    this.c = c;
    const days = [];
    for (let d = new Date(c.Start), end = new Date(c.End); d <= end; d.setDate(d.getDate()+1)) days.push(new Date(d));
    this.days = days;

    host.classList.add('ecp');
    host.innerHTML = `
      ${this.banner(c)}
      <div class="tabs" role="tablist">
        ${['Overview','Contacts','Meetings'].map((t,i)=>`<button role="tab" data-t="${t}" aria-selected="${i===0}">${t}</button>`).join('')}
        ${['Meetings Visual','At A Glance','Timeline','Mobile View'].map(t=>`<button role="tab" disabled style="opacity:.4;cursor:default">${t}</button>`).join('')}
      </div>
      <div class="body" id="ecp-body"></div>`;

    q(host,'.tabs').addEventListener('click', e => {
      const b = e.target.closest('button[data-t]'); if (!b) return;
      qa(host,'.tabs button').forEach(x => x.setAttribute('aria-selected', String(x === b)));
      this.tab(b.dataset.t);
    });
    q(host,'.acts').addEventListener('click', e => {
      const b = e.target.closest('button[data-a]'); if (!b) return;
      if (b.dataset.a === 'meeting') Wizard.open(this);
    });
    this.host = host;
    this.tab('Overview');
  },

  banner(c) {
    return `<div class="bar">
      <div><h3><span>Event Campaign</span>${E(c.Name)}</h3>
        <div class="f">
          <i>Start date</i><b>${E(c.Start)}</b>
          <i>End date</i><b>${E(c.End)}</b>
          <i>Website</i><b>${E(c.Website || '—')}</b>
          <i>Type</i><b>${E(c.Event_Type)}</b>
        </div></div>
      <div style="padding-top:34px"><div class="f">
          <i>Confirmed meetings</i><b id="ecp-conf">—</b>
          <i>Benchmark</i><b>${E(c.Benchmark ?? '—')}</b>
          <i>Attainment</i><b id="ecp-att">—</b>
          <i>Time zone</i><b>${E(c.Time_Zone_String)}</b>
        </div></div>
      <div class="acts">
        <button class="pri" data-a="meeting">Create Meeting</button>
        <button data-a="channel">Event Channel</button>
        <button data-a="glance">At a Glance</button>
        <button data-a="link">Link Contacts</button>
        <button data-a="create">Create Contacts</button>
        <button data-a="export">Export</button>
      </div></div>`;
  },

  async tab(name) {
    const b = document.getElementById('ecp-body');
    this.current = name;
    if (name === 'Overview')  return Overview.render(b, this);
    if (name === 'Contacts')  return Contacts.render(b, this);
    if (name === 'Meetings')  return Meetings.render(b, this);
  },

  async refreshHeader() {
    const r = await ZOHO.CRM.API.coql({ select_query:
      `select id from Meetings where Campaign = '${this.c.id}' and Meeting_Status != 'Declined' limit 200` });
    const n = r.info.total;
    const conf = document.getElementById('ecp-conf'), att = document.getElementById('ecp-att');
    if (conf) conf.textContent = n;
    if (att) att.textContent = this.c.Benchmark ? Math.round(n / this.c.Benchmark * 100) + '%' : '—';
  }
};

/* ---------- tab: overview ---------- */
const Overview = {
  async render(b, P) {
    const c = P.c;
    b.innerHTML = `
      <div class="panel"><h4>Event &amp; venue</h4>
        <div class="info">
          <div class="f"><i>Country</i><b>${E(c.Country)}</b><i>City</i><b>${E(c.City)}</b><i>Region</i><b>${E(c.Macro_Region)}</b></div>
          <div class="f"><i>Venue</i><b>${E(c.Venue || '—')}</b><i>Booth</i><b>${E(c.Booth || '—')}</b><i>Meeting rooms</i><b>${c.rooms.length}</b></div>
          <div class="f"><i>Team attending</i><b>${c.attendees.length}</b><i>Speakers</i><b>${c.attendees.filter(a=>a.Speaker==='yes').length}</b><i>Suggested spots</i><b>${c.spots.length}</b></div>
        </div>
      </div>
      <div class="panel"><h4>Rooms</h4>
        <div class="tw"><table class="d"><thead><tr><th>Room</th><th>Available from</th><th>Until</th><th>Capacity</th></tr></thead>
        <tbody>${c.rooms.map(r=>`<tr><td>${E(r.name)}</td><td>${E(r.from)}</td><td>${E(r.to)}</td><td>${r.cap} people</td></tr>`).join('')}</tbody></table></div>
      </div>
      <div class="panel"><h4>Team attending</h4>
        <div class="tw"><table class="d"><thead><tr><th>Name</th><th>Position</th><th>Function</th><th>Speaker</th><th>Email</th></tr></thead>
        <tbody>${c.attendees.map(a=>`<tr><td>${E(a.Name1)}</td><td class="wrap">${E(a.Position)}</td><td>${E(a.Functions)}</td>
          <td>${a.Speaker==='yes'?'<span class="pill ok">speaker</span>':'<span class="pill ghost">no</span>'}</td>
          <td>${E(a.Email)}</td></tr>`).join('')}</tbody></table></div>
      </div>`;
    P.refreshHeader();
  }
};

/* ---------- tab: contacts ---------- */
const Contacts = {
  state:{ view:'prep', filters:new Set(), search:'', rows:null },
  async render(b, P) {
    b.innerHTML = `<div class="panel">
      <div class="tools">
        <h4 style="margin:0 14px 0 0">All contacts</h4>
        <span class="cnt" data-f=""><b id="c-all">—</b>all</span>
        <span class="cnt" data-f="shown"><b id="c-shown">—</b>shown</span>
        <span class="cnt" data-f="target"><b id="c-t">—</b>targets</span>
        <span class="cnt" data-f="booked"><b id="c-b">—</b>booked</span>
        <span class="cnt" data-f="open"><b id="c-o">—</b>open</span>
        <span class="grow"></span>
        <span class="seg" id="c-view">
          <button data-v="old">Old UI</button><button data-v="prep" aria-pressed="true">Event preparation</button><button data-v="full">Full view</button>
        </span>
        <button class="ver" title="Widget version">v2.3.0</button>
      </div>
      <div class="tools" id="c-chips">
        ${[['target','Targets only'],['last','Met last year'],['src1','Partner directory'],['src2','Event app'],['nosrc','No source'],
           ['P1','P1'],['P2','P2'],['P3','P3'],['booked','Booked'],['held','Held'],['declined','Declined'],['open','Open'],['contacted','Contacted']]
          .map(([k,l])=>`<button class="chip2" data-k="${k}">${l}</button>`).join('')}
        <span class="grow"></span>
        <input class="search" id="c-search" placeholder="Search account, contact, title…">
      </div>
      <div id="c-load" class="load">Loading contacts…</div>
      <div class="tw" id="c-tw">${Array.from({length:12},()=>`<div style="display:flex;gap:10px;padding:9px 10px">${
        [90,150,120,70,60,80,110].map(w=>`<div class="sk" style="width:${w}px"></div>`).join('')}</div>`).join('')}</div>
    </div>`;

    const S = this.state;
    const upd = () => this.draw(b);
    q(b,'#c-view').onclick = e => { const x = e.target.closest('button[data-v]'); if(!x) return;
      qa(b,'#c-view button').forEach(y=>y.setAttribute('aria-pressed', String(y===x))); S.view = x.dataset.v; upd(); };
    q(b,'#c-chips').onclick = e => { const x = e.target.closest('button[data-k]'); if(!x) return;
      const k = x.dataset.k; S.filters.has(k) ? S.filters.delete(k) : S.filters.add(k);
      x.setAttribute('aria-pressed', String(S.filters.has(k))); upd(); };
    q(b,'#c-search').oninput = e => { S.search = e.target.value.toLowerCase(); upd(); };
    qa(b,'.cnt').forEach(c => c.onclick = () => { const f = c.dataset.f; if(!f) { S.filters.clear();
      qa(b,'#c-chips button').forEach(y=>y.setAttribute('aria-pressed','false')); } else {
      S.filters.has(f) ? S.filters.delete(f) : S.filters.add(f);
      const btn = q(b,`#c-chips button[data-k="${f}"]`); if (btn) btn.setAttribute('aria-pressed', String(S.filters.has(f))); }
      upd(); });

    const t0 = performance.now();
    const { rows } = await coqlAll(
      `select id, Attending_Status, Meeting_Status, Priority, Source, Is_Target, Met_Last_Year, Added_By, BD_Comment,
       Origin_Contact.Full_Name, Origin_Contact.Title, Origin_Contact.Email,
       Account_Name.Account_Name, Account_Name.Country, Account_Name.Cooperation_Status
       from Event_Contacts where Campaign = '${P.c.id}'`);
    S.rows = rows;
    q(b,'#c-load').textContent =
      `${rows.length} contacts loaded in ${Math.ceil(rows.length/200)} pages · ${Math.round(performance.now()-t0)} ms`;
    this.draw(b);
    P.refreshHeader();
  },

  keep(r) {
    const S = this.state, f = S.filters;
    if (S.search) {
      const h = [r['Origin_Contact.Full_Name'], r['Origin_Contact.Title'], r['Account_Name.Account_Name']].join(' ').toLowerCase();
      if (!h.includes(S.search)) return false;
    }
    const grp = (keys, test) => { const on = keys.filter(k => f.has(k)); return !on.length || test(on); };
    if (f.has('target') && !r.Is_Target) return false;
    if (f.has('last') && !r.Met_Last_Year) return false;
    if (!grp(['src1','src2','nosrc'], on => on.some(k =>
        k === 'nosrc' ? !r.Source : r.Source === (k === 'src1' ? 'Partner Directory' : 'Event App')))) return false;
    if (!grp(['P1','P2','P3'], on => on.includes(r.Priority))) return false;
    const ms = { booked:'Meeting booked', held:'Meeting held', declined:'Meeting declined', open:'Open', contacted:'Contacted' };
    if (!grp(Object.keys(ms), on => on.some(k => r.Meeting_Status === ms[k]))) return false;
    return true;
  },

  draw(b) {
    const S = this.state; if (!S.rows) return;
    const list = S.rows.filter(r => this.keep(r));
    const n = k => S.rows.filter(k).length;
    q(b,'#c-all').textContent   = S.rows.length;
    q(b,'#c-shown').textContent = list.length;
    q(b,'#c-t').textContent     = n(r => r.Is_Target);
    q(b,'#c-b').textContent     = n(r => r.Meeting_Status === 'Meeting booked');
    q(b,'#c-o').textContent     = n(r => r.Meeting_Status === 'Open');

    const full = S.view === 'full', old = S.view === 'old';
    const pill = v => v === 'Meeting held' ? `<span class="pill ok">held</span>`
      : v === 'Meeting booked' ? `<span class="pill book">booked</span>`
      : v === 'Meeting declined' ? `<span class="pill no">declined</span>`
      : v === 'Contacted' ? `<span class="pill info">contacted</span>` : `<span class="pill ghost">open</span>`;
    const cols = ['','Contact','Title','Account','Country','Attending','Meeting status','Priority','Source']
      .concat(full ? ['Added by','Comment'] : []);
    const head = `<tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr>`;
    const body = list.slice(0, 300).map(r => `<tr>
      <td>${r.Is_Target ? '<span class="pill info">target</span>' : '<span style="color:var(--ink-3)">—</span>'}</td>
      <td>${E(r['Origin_Contact.Full_Name'])}</td>
      <td class="wrap">${E(r['Origin_Contact.Title'])}</td>
      <td class="wrap">${E(r['Account_Name.Account_Name'])}</td>
      <td>${E(r['Account_Name.Country'])}</td>
      <td>${E(r.Attending_Status)}</td>
      <td>${pill(r.Meeting_Status)}<span class="lock" title="Set from meetings — not editable here">&#128274;</span></td>
      <td>${r.Priority ? `<span class="prio ${r.Priority}">${r.Priority}</span>` : '<span style="color:var(--ink-3)">—</span>'}</td>
      <td>${r.Source ? E(r.Source) : '<span style="color:var(--ink-3)">—</span>'}</td>
      ${full ? `<td>${E(r.Added_By)}</td><td class="wrap">${E(r.BD_Comment || '—')}</td>` : ''}
    </tr>`).join('');

    q(b,'#c-tw').innerHTML = list.length
      ? `<table class="d" ${old ? 'style="font-size:11.5px"' : ''}><thead>${head}</thead><tbody>${body}</tbody></table>`
        + (list.length > 300 ? `<div class="none">Showing the first 300 of ${list.length} matching rows.</div>` : '')
      : `<div class="none">${S.filters.size || S.search
          ? 'Nothing matches these filters. <a href="#" id="c-clear">Clear them</a>'
          : 'No contacts are linked to this campaign yet.'}</div>`;
    const cl = q(b,'#c-clear');
    if (cl) cl.onclick = e => { e.preventDefault(); S.filters.clear(); S.search = '';
      q(b,'#c-search').value = ''; qa(b,'#c-chips button').forEach(y=>y.setAttribute('aria-pressed','false')); this.draw(b); };
  }
};

/* ---------- tab: meetings ---------- */
const Meetings = {
  state:{ day:null, filters:new Set(), search:'', rows:null },
  async render(b, P) {
    const S = this.state; S.day = null;
    b.innerHTML = `<div class="panel">
      <div class="tools">
        <h4 style="margin:0 14px 0 0">All meetings</h4>
        <span class="cnt"><b id="m-all">—</b>all</span>
        <span class="cnt"><b id="m-shown">—</b>shown</span>
        <span class="cnt"><b id="m-acc">—</b>accounts</span>
        <span class="cnt"><b id="m-rec">—</b>recaps</span>
        <span class="cnt"><b id="m-bk">—</b>booked</span>
        <span class="cnt"><b id="m-hl">—</b>held</span>
        <span class="cnt"><b id="m-hrs">—</b>hours</span>
        <span class="grow"></span>
        <button class="ver">v2.1.0</button>
      </div>
      <div class="tools" id="m-chips">
        ${[['recap','Has recap'],['norecap','No recap'],['room','In a room'],['spot','At a spot'],
           ['Booked','Booked'],['Held','Held'],['Declined','Declined']]
          .map(([k,l])=>`<button class="chip2" data-k="${k}">${l}</button>`).join('')}
        <span class="grow"></span>
        <input class="search" id="m-search" placeholder="Search meeting, account, owner…">
      </div>
      <div class="tools" id="m-days"><span class="lab" style="margin:0 4px 0 0">Days</span>
        ${P.days.map(d=>`<button class="chip2" data-d="${dmy(d)}">${pad2(d.getDate())}.${pad2(d.getMonth()+1)} <span style="opacity:.6">${DOW[d.getDay()]}</span></button>`).join('')}
      </div>
      <div id="m-load" class="load">Loading meetings…</div>
      <div class="tw" id="m-tw"></div>
    </div>`;

    const upd = () => this.draw(b);
    q(b,'#m-chips').onclick = e => { const x = e.target.closest('button[data-k]'); if(!x) return;
      const k = x.dataset.k; S.filters.has(k) ? S.filters.delete(k) : S.filters.add(k);
      x.setAttribute('aria-pressed', String(S.filters.has(k))); upd(); };
    q(b,'#m-days').onclick = e => { const x = e.target.closest('button[data-d]'); if(!x) return;
      const on = S.day === x.dataset.d; S.day = on ? null : x.dataset.d;
      qa(b,'#m-days button').forEach(y=>y.setAttribute('aria-pressed', String(!on && y===x))); upd(); };
    q(b,'#m-search').oninput = e => { S.search = e.target.value.toLowerCase(); upd(); };

    const { rows } = await coqlAll(
      `select id, Name, Meeting_DateTime_String, Meeting_Duration, Meeting_Room, Spot, Meeting_Status,
       Meeting_Type, Target_Priority, Owner, Recap, Attendees_String, Sync_State,
       Account_Name.Account_Name from Meetings where Campaign = '${P.c.id}'`);
    // sortable key from "DD.MM.YYYY HH:MM" -> "YYYYMMDDHHMM"; blanks sort last
    const key = r => { const v = r.Meeting_DateTime_String || '';
      return v.length < 16 ? '\uffff' : v.slice(6,10) + v.slice(3,5) + v.slice(0,2) + v.slice(11,16); };
    S.rows = rows.slice().sort((a,c) => key(a) < key(c) ? -1 : key(a) > key(c) ? 1 : 0);
    q(b,'#m-load').textContent = `${rows.length} meetings loaded · ${new Set(rows.map(r=>r['Account_Name.Account_Name'])).size} accounts`;
    this.draw(b);
    P.refreshHeader();
  },

  draw(b) {
    const S = this.state; if (!S.rows) return;
    const list = S.rows.filter(r => {
      const p = parseDT(r.Meeting_DateTime_String);
      if (S.day && (!p || p.day !== S.day)) return false;
      if (S.search && ![r.Name, r['Account_Name.Account_Name'], r.Owner].join(' ').toLowerCase().includes(S.search)) return false;
      const f = S.filters;
      if (f.has('recap') && !r.Recap) return false;
      if (f.has('norecap') && r.Recap) return false;
      if (f.has('room') && !r.Meeting_Room) return false;
      if (f.has('spot') && r.Meeting_Room) return false;
      const st = ['Booked','Held','Declined'].filter(k => f.has(k));
      if (st.length && !st.includes(r.Meeting_Status)) return false;
      return true;
    });
    const mins = list.reduce((a,r) => a + (+r.Meeting_Duration || 0), 0);
    q(b,'#m-all').textContent   = S.rows.length;
    q(b,'#m-shown').textContent = list.length;
    q(b,'#m-acc').textContent   = new Set(list.map(r=>r['Account_Name.Account_Name'])).size;
    q(b,'#m-rec').textContent   = list.filter(r=>r.Recap).length;
    q(b,'#m-bk').textContent    = list.filter(r=>r.Meeting_Status==='Booked').length;
    q(b,'#m-hl').textContent    = list.filter(r=>r.Meeting_Status==='Held').length;
    q(b,'#m-hrs').textContent   = Math.round(mins/60);

    const sync = s => s==='in_sync' ? '<span class="pill ok">in sync</span>'
      : s==='outdated' ? '<span class="pill info">outdated</span>'
      : s==='incorrect' ? '<span class="pill no">incorrect</span>'
      : s==='not_in_crm' ? '<span class="pill ghost">not in calendar</span>'
      : '<span class="pill ghost">no dates</span>';
    q(b,'#m-tw').innerHTML = list.length ? `<table class="d">
      <thead><tr><th>Date</th><th>Recap</th><th>Account</th><th>Meeting</th><th>Priority</th><th>Status</th>
      <th>Owner</th><th>Min</th><th>Room</th><th>Spot</th><th>Calendar</th><th>Team</th></tr></thead>
      <tbody>${list.map(r => { const p = parseDT(r.Meeting_DateTime_String); return `<tr>
        <td>${p ? `${p.day.slice(0,5)} <span style="color:var(--ink-3)">${hhmm(p.min)}</span>` : '<span style="color:var(--ink-3)">—</span>'}</td>
        <td>${r.Recap ? '<span class="pill ok">&#10003;</span>' : '<span style="color:var(--ink-3)">—</span>'}</td>
        <td class="wrap">${E(r['Account_Name.Account_Name'])}</td>
        <td class="wrap">${E(r.Meeting_Type)}</td>
        <td>${r.Target_Priority ? `<span class="prio ${r.Target_Priority}">${r.Target_Priority}</span>` : '<span style="color:var(--ink-3)">—</span>'}</td>
        <td>${r.Meeting_Status === 'Held' ? '<span class="pill ok">held</span>'
             : r.Meeting_Status === 'Declined' ? '<span class="pill no">declined</span>' : '<span class="pill book">booked</span>'}</td>
        <td>${E(r.Owner)}</td><td>${r.Meeting_Duration}</td>
        <td>${r.Meeting_Room ? E(r.Meeting_Room) : '<span style="color:var(--ink-3)">—</span>'}</td>
        <td>${r.Spot ? E(r.Spot) : '<span style="color:var(--ink-3)">—</span>'}</td>
        <td>${sync(r.Sync_State)}</td>
        <td class="wrap">${E(r.Attendees_String)}</td></tr>`; }).join('')}</tbody></table>`
      : `<div class="none">No meetings match these filters.</div>`;
  }
};

/* ---------- create meeting wizard ---------- */
const Wizard = {
  async open(P) {
    this.P = P;
    this.s = { step:1, account:null, purpose:'', buyers:[], team:[], duration:60,
      day: dmy(P.days[0]), spot:null, room: P.c.rooms[0] ? P.c.rooms[0].name : null, slot:null, done:false };
    const mask = el(`<div class="ecp-mask ecp"><div class="ecp-mod">
      <div class="hd"><h3>Create event meeting</h3><span class="ver" style="margin-left:8px">v2.0.5</span><button class="x" title="Close">&times;</button></div>
      <div class="steps">${['Account','Participants','Place &amp; time','Availability','Review']
        .map((t,i)=>`<div data-s="${i+1}"><b>${i+1}</b>${t}</div>`).join('')}</div>
      <div class="pane" id="w-pane"></div>
      <div class="ft"><button class="btn sec" id="w-back">Back</button><span class="msg" id="w-msg"></span>
        <span class="sp"></span><button class="btn" id="w-next">Continue</button></div>
    </div></div>`);
    document.body.appendChild(mask);
    this.mask = mask;
    q(mask,'.x').onclick = () => this.close();
    mask.addEventListener('click', e => { if (e.target === mask) this.close(); });
    q(mask,'#w-back').onclick = () => { if (this.s.step > 1) { this.s.step--; this.draw(); } };
    q(mask,'#w-next').onclick = () => this.next();
    this.draw();
  },
  close() { this.mask.remove(); },

  blocker() {
    const s = this.s;
    if (s.step === 1 && !s.account) return 'Pick an account to continue.';
    if (s.step === 2 && !s.buyers.length) return 'At least one buyer is required.';
    if (s.step === 2 && !s.team.length) return 'At least one person from our side is required.';
    if (s.step === 3 && !s.room && !s.spot) return 'Choose a meeting room, or name a spot.';
    if (s.step === 3 && s.room) {
      const cap = (this.P.c.rooms.find(r => r.name === s.room) || {}).cap || 0;
      const total = s.buyers.length + s.team.length;
      if (total > cap) return `Room capacity is ${cap}; this meeting has ${total} people. Remove people or change the room.`;
    }
    if (s.step === 4 && s.slot == null) return 'Pick a start time.';
    return '';
  },

  async next() {
    const s = this.s;
    if (this.blocker()) return;
    if (s.step === 5) return this.submit();
    s.step++;
    this.draw();
  },

  draw() {
    const s = this.s, m = this.mask;
    qa(m,'.steps div').forEach(d => { const n = +d.dataset.s;
      d.classList.toggle('on', n === s.step); d.classList.toggle('done', n < s.step); });
    q(m,'#w-back').style.visibility = s.step > 1 && !s.done ? 'visible' : 'hidden';
    q(m,'#w-next').textContent = s.step === 5 ? 'Book the meeting' : 'Continue';
    q(m,'#w-next').style.display = s.done ? 'none' : '';
    const pane = q(m,'#w-pane');
    this['step'+s.step](pane);
    const b = this.blocker();
    q(m,'#w-msg').textContent = b;
    q(m,'#w-next').disabled = !!b;
  },

  async step1(pane) {
    const s = this.s;
    pane.innerHTML = `<span class="lab">Which account is this meeting with?</span>
      <input class="ti" id="w-acc" placeholder="Type at least two characters…" value="${E(s.account ? s.account.name : '')}">
      <div class="hint">Search runs against the CRM through the emulated platform layer.</div>
      <div id="w-hits" style="margin-top:14px"></div>`;
    const inp = q(pane,'#w-acc'), hits = q(pane,'#w-hits');
    const run = async () => {
      const v = inp.value.trim();
      if (v.length < 2) { hits.innerHTML = ''; return; }
      const r = await ZOHO.CRM.API.searchRecord({ Entity:'Accounts', Query:`(Account_Name:starts_with:${v})` });
      hits.innerHTML = r.data.length ? r.data.slice(0,8).map(a => `<div class="room" data-id="${a.id}" data-n="${E(a.Account_Name)}">
          <div style="width:30px;height:30px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);display:grid;place-items:center;font:600 12px/1 'IBM Plex Mono',monospace">${E(a.Account_Name.slice(0,2).toUpperCase())}</div>
          <div><div class="nm">${E(a.Account_Name)}</div><div class="mt">${E(a.Country)} · ${E(a.Cooperation_Status)}</div></div>
          <div class="tick">&#10003;</div></div>`).join('')
        : `<div class="none">Nothing starts with “${E(v)}”.</div>`;
    };
    inp.oninput = run;
    hits.onclick = async e => { const r = e.target.closest('[data-id]'); if (!r) return;
      s.account = { id:r.dataset.id, name:r.dataset.n }; s.buyers = [];
      inp.value = s.account.name; this.draw(); };
    if (s.account) run();
  },

  async step2(pane) {
    const s = this.s, P = this.P;
    pane.innerHTML = `<div class="two">
      <div><span class="lab">Purpose of the meeting</span>
        <textarea class="ta" rows="3" id="w-purpose" placeholder="What are we trying to achieve?">${E(s.purpose)}</textarea>
        <div class="hint" id="w-left"></div>
        <span class="lab" style="margin-top:18px">Buyers — from ${E(s.account.name)}</span>
        <div id="w-buyers" class="peep"><span class="hint">Loading contacts…</span></div></div>
      <div><span class="lab">Our side</span><div id="w-team" class="peep"></div>
        <div class="hint">Everyone listed on the campaign record.</div></div></div>`;
    const ta = q(pane,'#w-purpose'), left = q(pane,'#w-left');
    const count = () => left.textContent = `${255 - ta.value.length} characters left`;
    ta.oninput = () => { s.purpose = ta.value.slice(0,255); count(); }; count();

    const { rows } = await coqlAll(
      `select id, Full_Name, Title from Contacts where Account_Name = '${esc(s.account.id)}' and Contact_Status = 'Working'`, 200);
    const bx = q(pane,'#w-buyers');
    bx.innerHTML = rows.length
      ? rows.slice(0,40).map(c => `<button data-id="${c.id}" data-n="${E(c.Full_Name)}" aria-pressed="${s.buyers.some(b=>b.id===c.id)}">${E(c.Full_Name)} <span style="opacity:.6">· ${E(c.Title)}</span></button>`).join('')
      : `<span class="hint">This account has no active contacts. Add one on the account record first.</span>`;
    bx.onclick = e => { const b = e.target.closest('button[data-id]'); if (!b) return;
      const i = s.buyers.findIndex(x => x.id === b.dataset.id);
      i < 0 ? s.buyers.push({ id:b.dataset.id, name:b.dataset.n }) : s.buyers.splice(i,1);
      b.setAttribute('aria-pressed', String(i < 0)); this.refreshBlocker(); };

    const tx = q(pane,'#w-team');
    tx.innerHTML = P.c.attendees.map(a => `<button data-n="${E(a.Name1)}" aria-pressed="${s.team.includes(a.Name1)}">${E(a.Name1)} <span style="opacity:.6">· ${E(a.Functions)}</span></button>`).join('');
    tx.onclick = e => { const b = e.target.closest('button[data-n]'); if (!b) return;
      const n = b.dataset.n, i = s.team.indexOf(n);
      i < 0 ? s.team.push(n) : s.team.splice(i,1);
      b.setAttribute('aria-pressed', String(i < 0)); this.refreshBlocker(); };
  },

  step3(pane) {
    const s = this.s, P = this.P;
    pane.innerHTML = `<div class="two">
      <div><span class="lab">Duration</span><div class="peep" id="w-dur">
          ${[30,45,60,90,120].map(d=>`<button data-d="${d}" aria-pressed="${s.duration===d}">${d} min</button>`).join('')}</div>
        <span class="lab" style="margin-top:18px">Day</span><div class="peep" id="w-day">
          ${P.days.map(d=>`<button data-d="${dmy(d)}" aria-pressed="${s.day===dmy(d)}">${pad2(d.getDate())}.${pad2(d.getMonth()+1)} <span style="opacity:.6">${DOW[d.getDay()]}</span></button>`).join('')}</div>
        <div class="hint">Campaign runs ${E(P.c.Start)} to ${E(P.c.End)}.</div>
        <label style="display:flex;gap:8px;align-items:center;margin-top:18px;font-size:13px">
          <input type="checkbox" id="w-nr" ${s.room ? '' : 'checked'}> Not in a meeting room</label>
        <div id="w-spotwrap" style="margin-top:10px;${s.room ? 'display:none' : ''}">
          <span class="lab">Where instead</span>
          <input class="ti" id="w-spot" list="w-spots" value="${E(s.spot || '')}" placeholder="Name the place">
          <datalist id="w-spots">${P.c.spots.map(x=>`<option value="${E(x)}">`).join('')}</datalist></div>
      </div>
      <div><span class="lab">Meeting room</span><div id="w-rooms" ${s.room ? '' : 'style="opacity:.4;pointer-events:none"'}>
        ${P.c.rooms.map(r=>`<div class="room" data-n="${E(r.name)}" aria-pressed="${s.room===r.name}">
          <div><div class="nm">${E(r.name)}</div><div class="mt">${E(r.from)}–${E(r.to)} · up to ${r.cap} people</div></div>
          <div class="tick">&#10003;</div></div>`).join('')}</div>
        <div class="hint" id="w-cap"></div></div></div>`;
    const cap = () => { const r = P.c.rooms.find(x => x.name === s.room);
      q(pane,'#w-cap').textContent = r ? `Capacity ${s.buyers.length + s.team.length} of ${r.cap}` : ''; };
    q(pane,'#w-dur').onclick = e => { const b = e.target.closest('button[data-d]'); if(!b) return;
      s.duration = +b.dataset.d; s.slot = null; this.draw(); };
    q(pane,'#w-day').onclick = e => { const b = e.target.closest('button[data-d]'); if(!b) return;
      s.day = b.dataset.d; s.slot = null; this.draw(); };
    q(pane,'#w-rooms').onclick = e => { const r = e.target.closest('[data-n]'); if(!r) return;
      s.room = r.dataset.n; s.slot = null; this.draw(); };
    q(pane,'#w-nr').onchange = e => { s.room = e.target.checked ? null : (P.c.rooms[0]||{}).name; s.slot = null; this.draw(); };
    const sp = q(pane,'#w-spot'); if (sp) sp.oninput = e => { s.spot = e.target.value; this.refreshBlocker(); };
    cap();
  },

  async step4(pane) {
    const s = this.s, P = this.P;
    pane.innerHTML = `<div class="tools"><span class="seg" id="w-mode">
        <button data-m="sug" aria-pressed="true">Suggested times</button><button data-m="grid">15-minute grid</button></span>
      <span class="grow"></span><span class="hint" id="w-tz">Times in ${E(P.c.Time_Zone_String)}</span></div>
      <div id="w-slots"><span class="hint">Working out who is free…</span></div>`;

    const day = s.day;
    const { rows } = await coqlAll(
      `select id, Meeting_DateTime_String, Meeting_Duration, Meeting_Room, Attendees_String, Meeting_Status
       from Meetings where Campaign = '${P.c.id}' and Meeting_DateTime_String like '${day}%'`, 400);
    const busy = rows.filter(r => r.Meeting_Status !== 'Declined').map(r => {
      const p = parseDT(r.Meeting_DateTime_String);
      return p ? { from:p.min, to:p.min + (+r.Meeting_Duration || 30), room:r.Meeting_Room,
                   who:String(r.Attendees_String || '').split(',').map(x=>x.trim()) } : null;
    }).filter(Boolean);

    const room = P.c.rooms.find(r => r.name === s.room);
    const [oh,om] = (room ? room.from : '09:00').split(':').map(Number);
    const [ch,cm] = (room ? room.to   : '18:00').split(':').map(Number);
    const open = oh*60+om, close = ch*60+cm;

    const clash = start => {
      const end = start + s.duration;
      const hitRoom = s.room && busy.find(b => b.room === s.room && b.from < end && start < b.to);
      if (hitRoom) return { block:true, why:'room is taken' };
      const hitWho = busy.find(b => b.from < end && start < b.to && b.who.some(w => s.team.includes(w)));
      if (hitWho) return { block:true, why:'someone from our side is busy' };
      return { block:false };
    };
    const grid = [];
    for (let t = open; t + s.duration <= close; t += 15) grid.push({ t, ...clash(t) });
    this._grid = grid;

    const render = mode => {
      const list = mode === 'sug' ? grid.filter(g => !g.block).filter((_,i) => i % 2 === 0).slice(0, 12) : grid;
      q(pane,'#w-slots').innerHTML = list.length ? list.map(g => `
        <div class="slot ${g.block ? 'busy' : ''}" data-t="${g.t}" aria-pressed="${s.slot === g.t}">
          ${hhmm(g.t)} – ${hhmm(g.t + s.duration)}
          ${g.block ? `<span class="why">${g.why}</span>` : `<span class="why">free</span>`}</div>`).join('')
        : `<div class="none">Nothing is free on this day for a ${s.duration}-minute meeting. Try a shorter slot or another day.</div>`;
      q(pane,'#w-slots').onclick = e => { const d = e.target.closest('.slot:not(.busy)'); if (!d) return;
        s.slot = +d.dataset.t; this.draw(); };
    };
    q(pane,'#w-mode').onclick = e => { const b = e.target.closest('button[data-m]'); if(!b) return;
      qa(pane,'#w-mode button').forEach(x=>x.setAttribute('aria-pressed', String(x===b))); render(b.dataset.m); };
    render('sug');
  },

  step5(pane) {
    const s = this.s, P = this.P;
    if (s.done) return;
    pane.innerHTML = `<span class="lab">Review</span>
      <dl class="kvs">
        <dt>Account</dt><dd>${E(s.account.name)}</dd>
        <dt>When</dt><dd>${E(s.day)} · ${hhmm(s.slot)}–${hhmm(s.slot + s.duration)} (${s.duration} min)</dd>
        <dt>Where</dt><dd>${E(s.room || s.spot)}</dd>
        <dt>Time zone</dt><dd>${E(P.c.Time_Zone_String)} — the campaign's zone, not your device's</dd>
        <dt>Buyers</dt><dd>${s.buyers.map(b=>E(b.name)).join(', ')}</dd>
        <dt>Our side</dt><dd>${s.team.map(E).join(', ')}</dd>
        <dt>Purpose</dt><dd>${E(s.purpose || '—')}</dd>
      </dl>
      <div class="hint" style="margin-top:16px">Booking writes a record through the emulated platform layer. Nothing leaves your browser.</div>`;
  },

  async submit() {
    const s = this.s, P = this.P, m = this.mask;
    q(m,'#w-next').disabled = true; q(m,'#w-msg').textContent = 'Writing the record…';
    try {
      const res = await ZOHO.CRM.API.insertRecord({ Entity:'Meetings', APIData:{
        Name:`${P.c.Name} — ${s.account.name}`,
        Meeting_DateTime_String:`${s.day} ${hhmm(s.slot)}`,
        Meeting_Date:`${s.day.slice(6)}-${s.day.slice(3,5)}-${s.day.slice(0,2)}`,
        Meeting_Duration:s.duration, Meeting_Room:s.room, Spot:s.room ? null : s.spot,
        Meeting_Status:'Booked', Meeting_Type:'Discovery', Owner:s.team[0] || null,
        Account_Name:s.account.id, Campaign:P.c.id, Time_Zone:P.c.Time_Zone_String,
        Attendees_String:s.team.join(', '), Sync_State:'not_in_crm',
        participants:s.buyers.map(b => ({ Name1:b.name, Type:'Economic Buyer', Group:'External' }))
      }});
      s.done = true;
      q(m,'#w-msg').textContent = '';
      q(m,'#w-pane').innerHTML = `<div class="res"><div class="tickbig">&#10003;</div>
        <h3 style="font:600 18px/1 'IBM Plex Serif',serif;margin:0">Meeting booked</h3>
        <div style="color:var(--ink-2);font-size:13.5px">${E(s.account.name)} · ${E(s.day)} at ${hhmm(s.slot)} · ${E(s.room || s.spot)}</div>
        <div class="hint">Record ${E(res.data[0].details.id)} created. The calendar invitation is a server-side step and is not part of this demo — the record is marked <b>not in calendar</b> so the reconciliation screen has something to find.</div>
        <button class="btn sec" id="w-close" style="margin-top:8px">Back to the campaign</button></div>`;
      q(m,'#w-close').onclick = () => { this.close(); P.tab(P.current); };
      this.draw();
    } catch (e) {
      q(m,'#w-next').disabled = false;
      q(m,'#w-msg').textContent = `${e.code || 'ERROR'} — ${e.message}` + (e.details && e.details.api_name ? ` (field: ${e.details.api_name})` : '');
    }
  },

  refreshBlocker() { const b = this.blocker();
    q(this.mask,'#w-msg').textContent = b; q(this.mask,'#w-next').disabled = !!b; }
};

window.EventCampaignPage = Page;
})();
