/* =============================================================
   Enrichment-provider surfaces, and the event coverage matrix.
     · EventMatrix — meetings × people, on the campaign
     · PersonSync  — refresh one contact from the provider
     · ContactNew  — create from the provider, deduplicated first
     · OrgMatch    — link an account to a provider organisation
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa, coqlAll, esc, parseDT, hhmm, dmy } = S;
const { hue, ini, money, shell } = window.CRMPages;

const CSS8 = `
/* ---- matrix ---- */
.mx{overflow:auto;max-height:560px;border:1px solid var(--line);border-radius:9px;background:var(--surface)}
.mx table{border-collapse:separate;border-spacing:0;font-size:12px}
.mx th,.mx td{padding:7px 9px;border-bottom:1px solid var(--line);white-space:nowrap;background:var(--surface);overflow:hidden;text-overflow:ellipsis}
.mx thead th{position:sticky;top:0;z-index:4;background:var(--surface-2);font:500 10px/1.35 "IBM Plex Mono",monospace;
  letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);text-align:left}
.mx thead tr:nth-child(2) th{top:31px;z-index:4}
.mx thead th.grp{text-align:center;border-left:1px solid var(--line-strong);color:var(--ink);background:var(--accent-soft)}
.mx th.frz,.mx td.frz{position:sticky;z-index:3;box-shadow:none}
.mx thead th.frz{z-index:6}
.mx .edge{border-right:2px solid var(--line-strong)}
.mx td.hit{background:var(--accent-soft);color:var(--accent-ink);font-weight:500;text-align:left}
.mx td.dot{color:var(--line-strong);text-align:center}
.mx .who{font:500 11.5px/1.3 "IBM Plex Sans",sans-serif;color:var(--ink)}
.mx .who em{font-style:normal;display:block;font-size:10px;color:var(--ink-3);font-weight:400}
.mx .role{font:600 9.5px/1 "IBM Plex Mono",monospace;border-radius:3px;padding:2px 4px;margin-left:5px;color:#fff}
.mx tr:hover td:not(.frz){background:#f5faff}
.mx tr:hover td.hit{background:#dcecfb}
/* ---- provider cards ---- */
.pv .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(268px,1fr));gap:13px}
.pv .p{border:1px solid var(--line);border-radius:11px;background:var(--surface);padding:14px;position:relative;cursor:pointer;
  opacity:0;transform:translateY(9px);transition:opacity .3s ease,transform .3s ease,box-shadow .16s ease,border-color .16s ease}
.pv .p.in{opacity:1;transform:none}
.pv .p:hover{border-color:var(--accent);box-shadow:0 8px 22px -12px rgba(27,39,51,.35)}
.pv .p .ph{width:52px;height:52px;border-radius:50%;display:grid;place-items:center;color:#fff;font:600 17px/1 "IBM Plex Mono",monospace;margin-bottom:10px}
.pv .p .nm{font:600 14px/1.3 "IBM Plex Sans",sans-serif}
.pv .p .ti{font-size:12.5px;color:var(--ink-2);margin-top:2px}
.pv .p .co{font-size:12px;color:var(--ink-3);margin-top:1px}
.pv .p .meta{font:400 10.5px/1 "IBM Plex Mono",monospace;color:var(--ink-3);margin-top:8px;letter-spacing:.03em}
.pv .p .jobs{display:flex;gap:4px;flex-wrap:wrap;margin-top:9px}
.pv .p .jobs span{font-size:10.5px;border:1px solid var(--line);border-radius:999px;padding:2px 8px;color:var(--ink-3)}
.pv .p .jobs span.cur{border-color:var(--ok);color:var(--ok);background:var(--ok-bg)}
.pv .p .act{margin-top:11px}
.pv .p .flags{position:absolute;top:11px;right:11px;display:flex;gap:5px}
.pv .p .flags i{width:21px;height:21px;border-radius:50%;display:grid;place-items:center;font-style:normal;
  font:600 11px/1 "IBM Plex Sans",sans-serif;color:#fff;cursor:help;position:relative}
.pv .p .flags i b{position:absolute;top:-4px;right:-4px;min-width:14px;height:14px;border-radius:7px;background:var(--crit);
  color:#fff;font:600 9px/14px "IBM Plex Mono",monospace;text-align:center;padding:0 3px}
.pv .p .flags i b.warn{background:var(--warn)}
.pv .lanes{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.pv .lane > h5{margin:0 0 10px;font:600 12.5px/1.3 "IBM Plex Sans",sans-serif;display:flex;align-items:center;gap:8px}
.pv .lane > h5 span{margin-left:auto;font:500 10.5px/1 "IBM Plex Mono",monospace;border-radius:999px;padding:3px 8px;color:#fff}
.pv .lane.crm > h5{color:#155e93} .pv .lane.crm > h5 span{background:#1f7fc4}
.pv .lane.ext > h5{color:#6b4b96} .pv .lane.ext > h5 span{background:#8a6fb0}
.pv .lane .grid{grid-template-columns:1fr}
.pv .prof .hd2{background:linear-gradient(120deg,#6b4b96,#c05a8e);color:#fff;padding:20px;display:flex;gap:16px;align-items:center}
.pv .prof .hd2 .ph{width:84px;height:84px;border-radius:50%;display:grid;place-items:center;font:600 27px/1 "IBM Plex Mono",monospace;background:rgba(255,255,255,.22)}
.pv .prof .hd2 h3{margin:0;font:600 19px/1.25 "IBM Plex Serif",serif}
.pv .prof .hd2 div{font-size:13px;opacity:.92}
.pv .prof .job{display:flex;gap:12px;padding:11px 0;border-top:1px solid var(--line)}
.pv .prof .job:first-of-type{border-top:0}
.pv .prof .job .dotc{width:30px;height:30px;border-radius:50%;flex:0 0 30px;display:grid;place-items:center;color:#fff;font:600 12px/1 "IBM Plex Mono",monospace}
.pv .prof .job .t{font-weight:600;font-size:13.5px}
.pv .prof .job .m{font-size:12px;color:var(--ink-3)}
.pv .two-panel{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.pv .panel2{border:1px solid var(--line);border-radius:10px;background:var(--surface);display:flex;flex-direction:column;max-height:430px}
.pv .panel2 h5{margin:0;padding:11px 13px;border-bottom:1px solid var(--line);font:600 12.5px/1.3 "IBM Plex Sans",sans-serif;display:flex;align-items:center;gap:8px}
.pv .panel2 .srch{padding:9px 11px;border-bottom:1px solid var(--line)}
.pv .panel2 .lst{overflow:auto;flex:1}
.pv .panel2 .it{padding:9px 13px;border-bottom:1px solid var(--line);cursor:pointer;display:flex;gap:10px;align-items:flex-start}
.pv .panel2 .it:hover{background:var(--surface-2)}
.pv .panel2 .it[aria-pressed="true"]{background:var(--accent-soft)}
.pv .panel2 .it .t{font-weight:600;font-size:13px}
.pv .panel2 .it .m{font-size:11.5px;color:var(--ink-3);margin-top:2px}
.pv .panel2 .it .tick{margin-left:auto;color:var(--ok);font-size:15px;visibility:hidden}
.pv .panel2 .it[aria-pressed="true"] .tick{visibility:visible}
.pv .syncbar{display:flex;align-items:center;gap:12px;justify-content:center;margin-top:16px}
.pv .ok2{border-left:3px solid var(--ok);background:var(--ok-bg);padding:11px 14px;border-radius:0 8px 8px 0;font-size:13px;margin-top:14px}
@media (max-width:900px){.pv .lanes,.pv .two-panel{grid-template-columns:1fr}}
`;
function css8(){ if(!document.getElementById('ap-css')){ const st=document.createElement('style'); st.id='ap-css'; st.textContent=CSS8; document.head.appendChild(st);} }

const ROLE_COLOUR = { 'Economic Buyer':'#1c7a4a', 'Technical Buyer':'#1f7fc4', 'User Buyer':'#b0701c', 'Coach':'#8a6fb0' };
const roleLetter = r => ({ 'Economic Buyer':'E','Technical Buyer':'T','User Buyer':'U','Coach':'C' }[r] || '?');
const yrs = (from, to) => { const a = new Date(from), b = to ? new Date(to) : new Date(2026,7,26);
  const m = Math.max(1, Math.round((b - a) / 2.6e9));
  return m >= 12 ? `${Math.floor(m/12)} yr ${m % 12} mo` : `${m} mo`; };

/* ================= event coverage matrix ================= */
const EventMatrix = {
  async render(b, P) {
    css8();
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0 12px 0 0">Coverage</h4>
        <span class="cnt"><b id="mx-m">—</b>meetings</span>
        <span class="cnt"><b id="mx-p">—</b>people</span>
        <span class="cnt"><b id="mx-c">—</b>covered</span>
        <span class="grow"></span>
        <input class="search" id="mx-q" placeholder="Filter by account, room or person…">
        <button class="ver">v1.8.0</button></div>
      <div class="mx" id="mx-box"><div class="load-card">${Array.from({length:9},()=>'<div class="sk" style="height:15px"></div>').join('')}</div></div>
      <div class="hint" style="margin-top:10px">One row per meeting, one column per person on the campaign, grouped by
        the function they belong to. The columns are not configured anywhere — they are built from whoever is listed on
        the campaign record, so adding a person to the trip adds a column here.</div>
    </div>`;
    const { rows } = await coqlAll(
      `select id, Meeting_DateTime_String, Meeting_Duration, Meeting_Room, Spot, Meeting_Status, Meeting_Type,
       Attendees_String, Account_Name.Account_Name from Meetings where Campaign = '${P.c.id}'`);
    const parts = {};
    (window.__DATA__.Meetings || []).forEach(m => { if (m.Campaign === P.c.id) parts[m.id] = m.participants || []; });
    this.rows = rows; this.parts = parts; this.P = P;
    q(b,'#mx-q').oninput = () => this.draw(b);
    this.draw(b);
  },

  draw(b) {
    const P = this.P, term = q(b,'#mx-q').value.trim().toLowerCase();
    const people = P.c.attendees;
    const groups = {}; people.forEach(a => (groups[a.Functions] ||= []).push(a));
    const key = r => r.Meeting_DateTime_String || '￿';
    let rows = this.rows.slice().sort((x,y) => {
      const kx = key(x), ky = key(y);
      const s = t => t.length < 16 ? '￿' : t.slice(6,10)+t.slice(3,5)+t.slice(0,2)+t.slice(11,16);
      return s(kx) < s(ky) ? -1 : s(kx) > s(ky) ? 1 : 0;
    });
    if (term) rows = rows.filter(r => [r['Account_Name.Account_Name'], r.Meeting_Room, r.Spot, r.Attendees_String]
      .join(' ').toLowerCase().includes(term));

    const on = (r, name) => String(r.Attendees_String || '').split(',').map(x => x.trim()).includes(name);
    const perPerson = {}; people.forEach(a => perPerson[a.Name1] = this.rows.filter(r => on(r, a.Name1)).length);
    const covered = rows.filter(r => people.some(a => on(r, a.Name1))).length;
    q(b,'#mx-m').textContent = rows.length;
    q(b,'#mx-p').textContent = people.length;
    q(b,'#mx-c').textContent = covered;

    // pinned columns need fixed widths, otherwise the offsets are guesses and the
    // columns slide under each other as soon as a company name gets long
    const FW = [206, 62, 62, 150];
    const FRZ = FW.map((_,i) => FW.slice(0,i).reduce((a,b) => a+b, 0));
    const frz = i => `class="frz${i===3?' edge':''}" style="left:${FRZ[i]}px;width:${FW[i]}px;min-width:${FW[i]}px;max-width:${FW[i]}px"`;
    const head1 = `<tr>
      <th ${frz(0)}>Meeting</th><th ${frz(1)}>Date</th><th ${frz(2)}>Time</th><th ${frz(3)}>Where</th>
      ${Object.entries(groups).map(([g,list]) => `<th class="grp" colspan="${list.length}">${E(g)} (${list.length})</th>`).join('')}</tr>`;
    const head2 = `<tr>
      <th ${frz(0)}></th><th ${frz(1)}></th><th ${frz(2)}></th><th ${frz(3)}></th>
      ${Object.values(groups).flat().map((a,i) => `<th${i===0?' style="border-left:1px solid var(--line-strong)"':''}>
        <span class="who">${E(a.Name1.split(' ')[0])} ${E(a.Name1.split(' ').pop()[0])}.
        <em>${perPerson[a.Name1]} meetings</em></span></th>`).join('')}</tr>`;

    const body = rows.map(r => { const p = parseDT(r.Meeting_DateTime_String);
      const buyers = (this.parts[r.id] || []).filter(x => x.Group === 'External');
      return `<tr>
        <td ${frz(0)}><span class="link">${E(r['Account_Name.Account_Name'])}</span></td>
        <td ${frz(1)}>${p ? E(p.day.slice(0,5)) : '—'}</td>
        <td ${frz(2)}>${p ? hhmm(p.min) : '—'}</td>
        <td ${frz(3)}>${E(r.Meeting_Room || r.Spot || '—')}</td>
        ${Object.values(groups).flat().map(a => on(r, a.Name1)
          ? `<td class="hit">${buyers.slice(0,1).map(x => `${E(x.Name1)}<span class="role" style="background:${ROLE_COLOUR[x.Type]||'#8a99a6'}">${roleLetter(x.Type)}</span>`).join('') || 'attending'}</td>`
          : '<td class="dot">·</td>').join('')}</tr>`; }).join('');

    q(b,'#mx-box').innerHTML = rows.length
      ? `<table><thead>${head1}${head2}</thead><tbody>${body}</tbody></table>`
      : '<div class="none">Nothing matches that.</div>';
  }
};

/* ================= shared person card ================= */
function personCard(p, opts) {
  opts = opts || {};
  const jobs = (p.History || []).slice(0,3);
  return `<div class="p" data-p="${E(p.id)}">
    ${opts.flags ? `<div class="flags">${opts.flags(p)}</div>` : ''}
    <div class="ph" style="background:${hue(p.Full_Name)}">${ini(p.Full_Name)}</div>
    <div class="nm">${E(p.Full_Name)}</div>
    <div class="ti">${E(p.Title || '')}</div>
    <div class="co">${E(p.Company || '')}</div>
    <div class="meta">${E(p.Seniority || '')}${p.Email ? '' : ' · email not revealed'}</div>
    <div class="jobs">${jobs.map(h => `<span class="${h.To ? '' : 'cur'}">${E(h.Company)}</span>`).join('')}</div>
    ${opts.action ? `<div class="act">${opts.action(p)}</div>` : ''}</div>`;
}
function profileModal(p, extra) {
  const mask = el(`<div class="ecp-mask ecp pv"><div class="ecp-mod prof" style="width:min(560px,100%)">
    <div class="hd2"><span class="ph">${ini(p.Full_Name)}</span>
      <div><h3>${E(p.Full_Name)}</h3><div>${E(p.Title || '')}</div><div style="opacity:.75">${E(p.Company || '')}</div></div>
      <button class="x" style="margin-left:auto;color:#fff;background:none;border:0;font-size:22px;cursor:pointer">&times;</button></div>
    <div class="pane" style="min-height:0">
      ${extra || ''}
      <span class="lab">Employment history</span>
      ${(p.History || []).map((h,i) => `<div class="job">
        <span class="dotc" style="background:${h.To ? 'var(--line-strong)' : 'var(--ok)'}">${i+1}</span>
        <div><div class="t">${E(h.Title)}</div>
          <div class="m">${E(h.Company)} · ${E(h.From)} – ${h.To ? E(h.To) : 'present'} <b>(${yrs(h.From, h.To)})</b></div></div></div>`).join('')}
    </div>
    <div class="ft"><span class="sp"></span><button class="btn" data-close>Close</button></div></div></div>`);
  document.body.appendChild(mask);
  const close = () => mask.remove();
  q(mask,'.x').onclick = close; q(mask,'[data-close]').onclick = close;
  mask.addEventListener('click', e => { if (e.target === mask) close(); });
}

/* ================= sync one contact from the provider ================= */
const PersonSync = {
  async render(b, c) {
    css8();
    b.classList.add('pv');
    const all = (window.__DATA__.Enrichment.People || []);
    const pool = all.filter(p => p.Full_Name !== c.Full_Name).slice(0, 9);
    const auto = all.find(p => p.Full_Name === c.Full_Name) || null;

    b.innerHTML = `<div class="panel pv">
      <div class="tools"><h4 style="margin:0 12px 0 0">Refresh from the provider</h4>
        <span class="pill ${auto ? 'ok' : 'info'}">${auto ? 'matched automatically' : 'manual selection'}</span>
        <span class="grow"></span><span class="hint">last synced ${E(c.Created_Time)}</span><button class="ver">v2.2.1</button></div>
      ${auto ? `<div class="ok2">The provider returned one person whose employer matches this record.
        Confirm and the contact is overwritten with their data.</div>
        <div class="grid" style="margin-top:12px;max-width:300px" id="ps-auto"></div>` : ''}
      <div class="tools" style="margin-top:16px"><span class="lab" style="margin:0">Or search by name</span>
        <input class="search" id="ps-q" placeholder="Type a name…" style="min-width:280px">
        <span class="hint" id="ps-note">${pool.length} people in the last response</span></div>
      <div class="grid" id="ps-grid" style="margin-top:12px"></div>
      <div class="hint" style="margin-top:12px">The badge on each card is the employer check: the provider's employment
        history is compared with the account on the CRM record, and the four outcomes — current exact, current partial,
        past exact, past partial — are different colours. It is the difference between "this is them" and "this was them
        two jobs ago", and it decides whether an overwrite is safe.</div>
    </div>`;

    const flags = p => {
      const acc = (c.Account_Name && c.Account_Name.name) || '';
      const hist = p.History || [];
      const cur = hist.find(h => !h.To), past = hist.filter(h => h.To);
      const exact = s => s && acc && s.toLowerCase() === acc.toLowerCase();
      const part  = s => s && acc && (s.toLowerCase().includes(acc.split(' ')[0].toLowerCase()));
      let icon = null;
      if (cur && exact(cur.Company))            icon = ['#1c7a4a','!','current employer matches exactly'];
      else if (cur && part(cur.Company))        icon = ['#3f9d6b','!','current employer partially matches'];
      else if (past.some(h => exact(h.Company)))icon = ['#b0701c','!','a previous employer matches exactly'];
      else if (past.some(h => part(h.Company))) icon = ['#d97757','!','a previous employer partially matches'];
      const dup = p.Match === 'crm' ? '<i style="background:#bf3a2b" title="already in the CRM">&#9679;</i>' : '';
      return (icon ? `<i style="background:${icon[0]}" title="${icon[2]}">${icon[1]}</i>` : '') + dup;
    };
    const act = () => `<button class="btn" style="width:100%;padding:8px">Update contact</button>`;

    const draw = list => {
      const g = q(b,'#ps-grid');
      g.innerHTML = list.map(p => personCard(p, { flags, action:act })).join('')
        || '<div class="none">Nobody in the response matches that name.</div>';
      requestAnimationFrame(() => qa(g,'.p').forEach((x,i) => setTimeout(() => x.classList.add('in'), i*45)));
    };
    if (auto) { const ga = q(b,'#ps-auto');
      ga.innerHTML = personCard(auto, { flags, action:() => `<button class="btn" style="width:100%;padding:8px">Yes, update</button>` });
      requestAnimationFrame(() => qa(ga,'.p').forEach(x => x.classList.add('in'))); }
    draw(pool);
    q(b,'#ps-q').oninput = e => { const v = e.target.value.trim().toLowerCase();
      draw(v ? all.filter(p => p.Full_Name.toLowerCase().includes(v)).slice(0,12) : pool);
      q(b,'#ps-note').textContent = v ? 'filtered' : `${pool.length} people in the last response`; };
    b.addEventListener('click', e => {
      const btn = e.target.closest('.act button');
      const card = e.target.closest('.p[data-p]'); if (!card) return;
      const p = all.find(x => x.id === card.dataset.p); if (!p) return;
      if (btn) { btn.disabled = true; btn.textContent = 'updated'; btn.style.opacity = .6; return; }
      profileModal(p);
    });
  }
};

/* ================= create from the provider, deduplicated first ================= */
const ContactNew = {
  async mount(host) {
    css8();
    host.classList.add('ecp'); host.classList.add('pv');
    const all = (window.__DATA__.Enrichment.People || []);
    this.all = all;
    host.innerHTML = `<div class="bar" style="border-radius:8px 8px 0 0">
        <div><h3><span>Contacts</span>Create from the provider</h3>
          <div class="f"><i>Order</i><b>look before you write</b><i>Keys</i><b>profile URL, then name</b>
            <i>Sources</i><b>CRM and provider, side by side</b><i>Writes</i><b>only what you confirm</b></div></div>
        <div style="padding-top:34px"><div class="f">
          <i>In the CRM</i><b id="cn-z">0</b><i>From the provider</i><b id="cn-a">0</b>
          <i>Exact duplicates</i><b id="cn-d">0</b><i>Possible</i><b id="cn-pd">0</b></div></div>
        <div class="acts"><button class="pri" data-a="search">Search provider</button><button data-a="clear">Clear</button></div>
      </div>
      <div class="body">
        <div class="panel">
          <div class="two" style="align-items:end">
            <div><span class="lab">Profile URL</span><input class="ti" id="cn-url" placeholder="https://…/in/name"></div>
            <div><span class="lab">Account</span><input class="ti" id="cn-acc" placeholder="Type two letters…" list="cn-accs">
              <datalist id="cn-accs"></datalist></div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;margin:14px 0">
            <span style="flex:1;height:1px;background:var(--line)"></span>
            <span class="lab" style="margin:0">or</span>
            <span style="flex:1;height:1px;background:var(--line)"></span></div>
          <div class="two"><div><span class="lab">First name</span><input class="ti" id="cn-fn"></div>
            <div><span class="lab">Last name</span><input class="ti" id="cn-ln" placeholder="type here — the CRM lane searches as you type"></div></div>
        </div>
        <div class="lanes">
          <div class="lane crm"><h5>Already in the CRM<span id="cn-zn">0</span></h5><div class="grid" id="cn-zoho"></div></div>
          <div class="lane ext"><h5>From the provider<span id="cn-an">0</span></h5><div class="grid" id="cn-apollo"></div></div>
        </div>
        <div class="hint" style="margin-top:12px">The left lane is the CRM and it searches while you type. The right lane
          is the provider and it only runs when you ask, because it costs credits. The counters on each provider card are
          duplicates found before anything is written: red for an exact profile-URL match, amber for a possible one by name.</div>
      </div>`;

    const accs = (window.__DATA__.Accounts || []).slice(0, 40);
    q(host,'#cn-accs').innerHTML = accs.map(a => `<option value="${E(a.Account_Name)}">`).join('');
    const crmPeople = (window.__DATA__.Contacts || []);

    const norm = u => String(u || '').toLowerCase().replace(/\/+$/,'').replace(/^https?:\/\/(www\.)?/,'').replace(/-\d+$/,'');
    const dupExact = p => crmPeople.filter(c => p.Linkedin && norm(c.Linkedin) === norm(p.Linkedin));
    const dupName  = p => crmPeople.filter(c => c.Full_Name === p.Full_Name && !(p.Linkedin && norm(c.Linkedin) === norm(p.Linkedin)));

    const flags = p => { const a = dupExact(p).length, b2 = dupName(p).length;
      return (a ? `<i style="background:#bf3a2b" title="exact profile match already in the CRM"><b>${a}</b>&#9679;</i>` : '')
           + (b2 ? `<i style="background:#b0701c" title="same name, different profile"><b class="warn">${b2}</b>~</i>` : ''); };

    const drawZoho = () => {
      const fn = q(host,'#cn-fn').value.trim().toLowerCase(), ln = q(host,'#cn-ln').value.trim().toLowerCase();
      const acc = q(host,'#cn-acc').value.trim().toLowerCase();
      let list = crmPeople;
      if (acc) { const a = accs.find(x => x.Account_Name.toLowerCase() === acc); if (a) list = list.filter(c => c.Account_Name === a.id); }
      if (fn || ln) list = list.filter(c => (!fn || c.First_Name.toLowerCase().startsWith(fn)) && (!ln || c.Last_Name.toLowerCase().startsWith(ln)));
      else if (!acc) list = [];
      list = list.slice(0, 6).map(c => ({ id:'z'+c.id, Full_Name:c.Full_Name, Title:c.Title, Seniority:c.Seniority,
        Company:(accs.find(a => a.id === c.Account_Name) || {}).Account_Name || '', Email:c.Email, History:[] }));
      const g = q(host,'#cn-zoho');
      g.innerHTML = list.map(p => personCard(p, {})).join('')
        || '<div class="none" style="padding:22px">Nothing yet — type a name or pick an account.</div>';
      requestAnimationFrame(() => qa(g,'.p').forEach((x,i) => setTimeout(() => x.classList.add('in'), i*40)));
      q(host,'#cn-zn').textContent = list.length; q(host,'#cn-z').textContent = list.length;
    };
    const drawApollo = () => {
      const fn = q(host,'#cn-fn').value.trim().toLowerCase(), ln = q(host,'#cn-ln').value.trim().toLowerCase();
      const url = q(host,'#cn-url').value.trim();
      let list = all;
      if (url) list = all.filter(p => p.Linkedin && norm(p.Linkedin) === norm(url));
      else if (fn || ln) list = all.filter(p => p.Full_Name.toLowerCase().includes(fn) && p.Full_Name.toLowerCase().includes(ln));
      list = list.slice(0, 8);
      const g = q(host,'#cn-apollo');
      g.innerHTML = list.map(p => personCard(p, { flags,
        action:p2 => dupExact(p2).length
          ? `<button class="btn sec" style="width:100%;padding:8px" disabled>Already in the CRM</button>`
          : `<button class="btn" style="width:100%;padding:8px">Create contact</button>` })).join('')
        || '<div class="none" style="padding:22px">Nothing returned. Try a name, or paste a profile URL.</div>';
      requestAnimationFrame(() => qa(g,'.p').forEach((x,i) => setTimeout(() => x.classList.add('in'), i*45)));
      q(host,'#cn-an').textContent = list.length; q(host,'#cn-a').textContent = list.length;
      q(host,'#cn-d').textContent  = list.reduce((a2,p) => a2 + dupExact(p).length, 0);
      q(host,'#cn-pd').textContent = list.reduce((a2,p) => a2 + dupName(p).length, 0);
    };

    ['#cn-fn','#cn-ln','#cn-acc'].forEach(sel => q(host,sel).oninput = drawZoho);
    q(host,'.acts').onclick = e => { const btn = e.target.closest('[data-a]'); if (!btn) return;
      if (btn.dataset.a === 'search') drawApollo();
      else { ['#cn-fn','#cn-ln','#cn-acc','#cn-url'].forEach(s2 => q(host,s2).value = '');
        q(host,'#cn-apollo').innerHTML = ''; drawZoho(); ['#cn-a','#cn-d','#cn-pd'].forEach(s2 => q(host,s2).textContent = '0'); } };
    q(host,'#cn-apollo').addEventListener('click', async e => {
      const btn = e.target.closest('.act button:not([disabled])');
      const card = e.target.closest('.p[data-p]'); if (!card) return;
      const p = all.find(x => x.id === card.dataset.p); if (!p) return;
      if (!btn) { const ex = dupExact(p), nm = dupName(p);
        return profileModal(p, (ex.length || nm.length) ? `<div class="callout" style="border-left:3px solid var(--warn);background:var(--warn-bg);padding:10px 13px;border-radius:0 7px 7px 0;font-size:13px;margin-bottom:14px">
          <b>${ex.length} exact</b> and <b>${nm.length} possible</b> duplicates were found before this card was drawn.
          ${ex.length ? 'Creating is blocked.' : 'Creating is allowed, but the name already exists.'}</div>` : ''); }
      btn.disabled = true; btn.textContent = 'creating…';
      const [first, ...rest] = p.Full_Name.split(' ');
      try {
        await ZOHO.CRM.API.insertRecord({ Entity:'Contacts', APIData:{
          First_Name:first, Last_Name:rest.join(' ') || first, Full_Name:p.Full_Name,
          Title:p.Title, Seniority:p.Seniority, Email:p.Email, Linkedin:p.Linkedin,
          Account_Name:(accs.find(a => a.Account_Name === q(host,'#cn-acc').value.trim()) || accs[0]).id,
          Contact_Status:'Working' }});
        btn.textContent = 'created'; btn.classList.add('sec'); drawZoho();
      } catch (err) { btn.disabled = false; btn.textContent = `${err.code} — retry`; }
    });
    drawZoho();
  }
};

/* ================= two-panel organisation matcher ================= */
const OrgMatch = {
  async render(b, a) {
    css8();
    b.classList.add('pv');
    const accs = (window.__DATA__.Accounts || []);
    const orgs = (window.__DATA__.Provider_Orgs || []);
    let pickA = a.id, pickO = null;

    b.innerHTML = `<div class="panel pv">
      <div class="tools"><h4 style="margin:0">Link to the provider</h4>
        <span class="grow"></span>
        <span class="pill ${a.Provider_Org_Id ? 'ok' : 'ghost'}">${a.Provider_Org_Id ? 'already linked' : 'not linked'}</span>
        <button class="ver">v1.4.2</button></div>
      <div class="two-panel">
        <div class="panel2"><h5><span style="color:#1f7fc4">&#9632;</span> Accounts in the CRM</h5>
          <div class="srch"><input class="search" id="om-qa" placeholder="Search accounts…" style="width:100%;min-width:0"></div>
          <div class="lst" id="om-a"></div></div>
        <div class="panel2"><h5><span style="color:#1c8a4d">&#9673;</span> Provider organisations</h5>
          <div class="srch"><input class="search" id="om-qo" placeholder="Search the provider…" style="width:100%;min-width:0"></div>
          <div class="lst" id="om-o"></div></div>
      </div>
      <div class="syncbar"><button class="btn" id="om-go" disabled>Link the two</button>
        <span class="hint" id="om-hint">Pick one on each side.</span></div>
      <div id="om-done"></div>
      <div class="hint" style="margin-top:14px">Two lists, one decision. The provider names the same company slightly
        differently — a legal suffix here, a missing one there — so this is left as a judgement rather than a fuzzy match
        that is right most of the time and silently wrong the rest.</div>
    </div>`;

    const drawA = () => { const v = q(b,'#om-qa').value.trim().toLowerCase();
      const list = accs.filter(x => !v || x.Account_Name.toLowerCase().includes(v)).slice(0,60);
      q(b,'#om-a').innerHTML = list.map(x => `<div class="it" data-a="${x.id}" aria-pressed="${pickA===x.id}">
        <div><div class="t">${E(x.Account_Name)}</div>
          <div class="m">${E(x.Country || '')} · ${E(x.Industry || '')}${x.Provider_Org_Id ? ' · <span class="pill ok">linked</span>' : ''}</div></div>
        <span class="tick">&#10003;</span></div>`).join(''); };
    const drawO = () => { const v = q(b,'#om-qo').value.trim().toLowerCase();
      const list = orgs.filter(x => !v || x.Name.toLowerCase().includes(v)).slice(0,60);
      q(b,'#om-o').innerHTML = list.map(x => `<div class="it" data-o="${x.id}" aria-pressed="${pickO===x.id}">
        <div><div class="t">${E(x.Name)}</div>
          <div class="m">${E(x.Domain)} · ${E(x.City)}, ${E(x.Country)} · ${E(x.Industry)}${x.Linked_Account ? ' · <span class="pill ok">linked</span>' : ''}</div></div>
        <span class="tick">&#10003;</span></div>`).join(''); };
    const refresh = () => { const ok = pickA && pickO;
      q(b,'#om-go').disabled = !ok;
      q(b,'#om-hint').textContent = ok ? 'Both sides chosen.' : 'Pick one on each side.'; };

    q(b,'#om-qa').oninput = drawA; q(b,'#om-qo').oninput = drawO;
    q(b,'#om-a').onclick = e => { const it = e.target.closest('[data-a]'); if (!it) return;
      pickA = it.dataset.a; drawA(); refresh(); };
    q(b,'#om-o').onclick = e => { const it = e.target.closest('[data-o]'); if (!it) return;
      pickO = pickO === it.dataset.o ? null : it.dataset.o; drawO(); refresh(); };
    q(b,'#om-go').onclick = async () => {
      const acc = accs.find(x => x.id === pickA), org = orgs.find(x => x.id === pickO);
      try {
        await ZOHO.CRM.API.updateRecord({ Entity:'Accounts', RecordID:acc.id, APIData:{ Provider_Org_Id:org.id }});
        acc.Provider_Org_Id = org.id; org.Linked_Account = acc.id;
        q(b,'#om-done').innerHTML = `<div class="ok2"><b>${E(acc.Account_Name)}</b> is now linked to
          <b>${E(org.Name)}</b>. Enrichment for this account will use that organisation from here on.</div>`;
        drawA(); drawO();
      } catch (err) { q(b,'#om-done').innerHTML = `<div class="errbox">${E(err.code)} — ${E(err.message)}</div>`; }
    };
    drawA(); drawO(); refresh();
  }
};

window.CRMApollo = { EventMatrix, PersonSync, ContactNew, OrgMatch };
})();
