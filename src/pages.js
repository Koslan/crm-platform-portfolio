/* =============================================================
   Three more record pages on the same emulated CRM shell:
     · Solution map      — a programme record
     · Contact enrichment — an account record
     · Deal conversations — a deal record
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa, coqlAll, esc } = S;

const CSS2 = `
.ecp .mtx{display:grid;gap:10px;overflow-x:auto;padding-bottom:6px}
.ecp .mhd{background:linear-gradient(150deg,#1f6fa8,#1d5c4a);color:#fff;border-radius:9px;padding:12px 13px;min-height:118px;display:flex;flex-direction:column;gap:7px}
.ecp .mhd .t{font:600 13.5px/1.25 "IBM Plex Sans",sans-serif}
.ecp .mhd .rev{font:600 17px/1 "IBM Plex Mono",monospace;font-variant-numeric:tabular-nums}
.ecp .mhd .tags{display:flex;gap:5px;flex-wrap:wrap}
.ecp .mhd .tags span{background:rgba(255,255,255,.18);border-radius:999px;padding:2px 8px;font-size:10.5px}
.ecp .mhd button{margin-top:auto;background:rgba(255,255,255,.2);border:0;color:#fff;border-radius:6px;padding:7px 9px;font:500 11.5px/1 "IBM Plex Sans",sans-serif;cursor:pointer}
.ecp .mhd button:hover{background:rgba(255,255,255,.32)}
.ecp .cell{border-radius:9px;padding:11px 12px;min-height:96px;opacity:0;transform:translateY(7px);transition:opacity .34s ease,transform .34s ease;cursor:default}
.ecp .cell.in{opacity:1;transform:none}
.ecp .cell .nm{font:600 12.5px/1.35 "IBM Plex Sans",sans-serif;margin-bottom:6px}
.ecp .cell hr{border:0;height:1px;background:currentColor;opacity:.28;margin:6px 0}
.ecp .cell .ln{font:400 11.5px/1.7 "IBM Plex Mono",monospace;font-variant-numeric:tabular-nums;display:flex;justify-content:space-between;gap:8px}
.ecp .cell.won{background:linear-gradient(150deg,#1d6b46,#134c31);color:#eaf6ef}
.ecp .cell.lost{background:linear-gradient(150deg,#9c3a2e,#6f281f);color:#fbeae7}
.ecp .cell.conf{background:linear-gradient(150deg,#1f5f92,#164straight);color:#e8f2fb}
.ecp .cell.conf{background:linear-gradient(150deg,#1f5f92,#16446b);color:#e8f2fb}
.ecp .cell.prop{background:linear-gradient(150deg,#3f8f63,#2c6b49);color:#eef8f2}
.ecp .cell.pros{background:linear-gradient(150deg,#d3a24a,#b3822f);color:#33270d}
.ecp .cell.pot{background:linear-gradient(150deg,#5ea3c9,#417f9f);color:#eaf4fa}
.ecp .cell.none{background:var(--surface-2);color:var(--ink-3);font-style:italic;border:1px dashed var(--line)}
.ecp-pop{position:fixed;z-index:70;max-width:340px;background:rgba(14,20,17,.94);color:#eaf1ee;border-radius:9px;padding:12px 14px;font-size:12.5px;box-shadow:0 18px 44px -14px rgba(0,0,0,.7);backdrop-filter:blur(5px);pointer-events:none}
.ecp-pop h5{margin:0 0 8px;font:600 13px/1.3 "IBM Plex Serif",serif}
.ecp-pop .r{display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-top:1px solid rgba(255,255,255,.14)}
.ecp-pop .r:first-of-type{border-top:0}
.ecp-pop .r i{font-style:normal;opacity:.72}
.ecp .stat{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
.ecp .stat div{border:1px solid var(--b);border-radius:8px;padding:8px 12px;background:var(--surface);min-width:104px}
.ecp .stat b{display:block;font:600 16px/1.2 "IBM Plex Mono",monospace;font-variant-numeric:tabular-nums}
.ecp .stat span{font-size:10.5px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em}
.ecp .av{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;font:600 11px/1 "IBM Plex Mono",monospace;color:#fff;flex:0 0 28px}
.ecp tr.crm td{background:color-mix(in srgb,var(--accent-soft) 55%,transparent)}
.ecp tr.new td{background:transparent}
.ecp tr.made td{background:var(--ok-bg)}
.ecp .thread{border:1px solid var(--b);border-radius:9px;margin-bottom:10px;background:var(--surface);overflow:hidden}
.ecp .thead{display:flex;align-items:center;gap:10px;padding:11px 13px;cursor:pointer}
.ecp .thead:hover{background:var(--surface-2)}
.ecp .thead .tp{font-weight:500}
.ecp .thead .meta{margin-left:auto;display:flex;gap:8px;align-items:center;font-size:11.5px;color:var(--ink-3)}
.ecp .msgs{border-top:1px solid var(--b);padding:6px 13px 12px}
.ecp .msg{display:flex;gap:10px;padding:10px 0;border-top:1px solid var(--b)}
.ecp .msg:first-child{border-top:0}
.ecp .msg.reply{margin-left:26px;border-left:2px solid var(--line);padding-left:12px}
.ecp .msg .who{font-size:12.5px;font-weight:500}
.ecp .msg .when{font-size:11px;color:var(--ink-3);margin-left:6px}
.ecp .msg .tx{font-size:13px;color:var(--ink-2);margin-top:3px;max-width:70ch}
.ecp .msg .push{margin-left:auto;align-self:flex-start}
.ecp .composer{border:1px solid var(--b);border-radius:9px;padding:11px 13px;background:var(--surface);margin-top:12px}
`;

function shell(host, o) {
  S.ensureCss();
  if (!document.getElementById('ecp-css2')) {
    const st = document.createElement('style'); st.id = 'ecp-css2'; st.textContent = CSS2; document.head.appendChild(st);
  }
  host.classList.add('ecp');
  host.innerHTML = `<div class="bar">
      <div><h3><span>${E(o.kind)}</span>${E(o.title)}</h3><div class="f">
        ${o.fields.slice(0,4).map(([k,v])=>`<i>${E(k)}</i><b>${E(v)}</b>`).join('')}</div></div>
      <div style="padding-top:34px"><div class="f">
        ${o.fields.slice(4,8).map(([k,v])=>`<i>${E(k)}</i><b>${E(v)}</b>`).join('')}</div></div>
      <div class="acts">${o.actions.map((a,i)=>`<button ${i?'':'class="pri"'} data-a="${E(a[0])}">${E(a[1])}</button>`).join('')}</div>
    </div>
    <div class="tabs" role="tablist">${o.tabs.map((t,i)=>`<button role="tab" data-t="${E(t)}" aria-selected="${i===0}">${E(t)}</button>`).join('')}
      ${(o.ghostTabs||[]).map(t=>`<button role="tab" disabled style="opacity:.4;cursor:default">${E(t)}</button>`).join('')}</div>
    <div class="body" id="ecp-body"></div>`;
  q(host,'.tabs').onclick = e => { const b = e.target.closest('button[data-t]'); if (!b) return;
    qa(host,'.tabs button').forEach(x=>x.setAttribute('aria-selected', String(x===b)));
    o.onTab(b.dataset.t, document.getElementById('ecp-body')); };
  if (o.onAction) q(host,'.acts').onclick = e => { const b = e.target.closest('button[data-a]'); if (b) o.onAction(b.dataset.a); };
  o.onTab(o.tabs[0], document.getElementById('ecp-body'));
}
const money = n => n == null ? '—' : (n >= 1e6 ? '$' + (n/1e6).toFixed(1) + 'M' : '$' + Math.round(n/1000) + 'K');
const hue = s => { let h = 0; for (const c of String(s)) h = (h*31 + c.charCodeAt(0)) >>> 0;
  return ['#2f6f5b','#3a6fa0','#8a5a2b','#6a4b8f','#2c7d78','#96513f','#4a6b2f','#7a3f66'][h % 8]; };
const ini = n => String(n).split(' ').map(x=>x[0]).join('').slice(0,2).toUpperCase();

/* ================= solution map ================= */
const SolutionMap = {
  async mount(host, programmeId) {
    const p = (await ZOHO.CRM.API.getRecord({ Entity:'Programmes', RecordID:programmeId })).data[0];
    this.p = p;
    shell(host, { kind:'Programme', title:p.Name,
      fields:[['Client', p.Account_Name.name], ['Category', p.Category], ['Complexity', p.Complexity],
              ['Target release', p.Release_Date], ['Booked', '—'], ['Pipeline', '—'], ['Open leads', '—'], ['Service lines','—']],
      actions:[['refresh','Refresh'],['help','Field guide'],['export','Export']],
      tabs:['Solution map'], ghostTabs:['Timeline','Documents','Team'],
      onTab:(t,b)=>this.render(b),
      onAction:a => { if (a==='help') this.help(); if (a==='refresh') this.render(document.getElementById('ecp-body')); } });
  },

  async render(b) {
    b.innerHTML = `<div class="panel"><div class="tools"><h4 style="margin:0">Solutions by business unit</h4>
      <span class="grow"></span><span class="hint" id="sm-sum"></span><button class="ver">v3.1.2</button></div>
      <div id="sm-grid"><span class="hint">Building the matrix…</span></div>
      <div class="hint" style="margin-top:12px">Colour is the strongest deal state in the cell. Pale blue is pipeline that
        analytics found and nobody has worked yet. Hover a cell to see the deals behind it.</div></div>`;

    const [cat, deals, pots, contacts] = await Promise.all([
      coqlAll(`select id, Name, Business_Unit, Status from Service_Catalog where Status = 'Current'`),
      coqlAll(`select id, Deal_Name, Stage, Amount, Closing_Date, Business_Unit, Solutions, Owner from Deals where Programme = '${this.p.id}'`),
      coqlAll(`select id, Business_Unit, Solutions, Budget, Contacts from Potentials where Programme = '${this.p.id}'`),
      coqlAll(`select id from Contacts where Account_Name = '${esc(this.p.Account_Name.id)}'`)
    ]);
    const units = [...new Set(cat.rows.map(r => r.Business_Unit))];
    const RANK = { '4. Won':6, '3. Confirmation':5, '2. Proposal':4, '1. Qualification':3, '0. Prospecting':2, '5. Lost':1 };
    const CLS  = { '4. Won':'won', '3. Confirmation':'conf', '2. Proposal':'prop', '1. Qualification':'prop', '0. Prospecting':'pros', '5. Lost':'lost' };
    const key = (u,s) => u + '||' + s;
    const byCell = {}; deals.rows.forEach(d => (byCell[key(d.Business_Unit, d.Solutions)] ||= []).push(d));
    const potCell = {}; pots.rows.forEach(p => (potCell[key(p.Business_Unit, p.Solutions)] ||= []).push(p));

    const rowsPer = Math.max(...units.map(u => cat.rows.filter(r => r.Business_Unit === u).length));
    const grid = q(b,'#sm-grid');
    grid.className = 'mtx';
    grid.style.gridTemplateColumns = `repeat(${units.length}, minmax(168px,1fr))`;
    let totalRev = 0, totalPot = 0;

    let html = units.map(u => {
      const ds = deals.rows.filter(d => d.Business_Unit === u);
      const won = ds.filter(d => d.Stage === '4. Won').reduce((a,d)=>a+d.Amount, 0);
      const pot = pots.rows.filter(p => p.Business_Unit === u).reduce((a,p)=>a+p.Budget, 0);
      totalRev += won; totalPot += pot;
      return `<div class="mhd"><div class="t">${E(u)}</div><div class="rev">${money(won)}</div>
        <div class="tags"><span>${ds.length} deals</span><span>${pots.rows.filter(p=>p.Business_Unit===u).length} unworked</span><span>${contacts.rows.length} contacts</span></div>
        <button data-bu="${E(u)}">Create opportunity</button></div>`;
    }).join('');

    for (let r = 0; r < rowsPer; r++) {
      html += units.map((u, ci) => {
        const svc = cat.rows.filter(x => x.Business_Unit === u)[r];
        if (!svc) return `<div class="cell none" style="visibility:hidden"></div>`;
        const ds = byCell[key(u, svc.Name)] || [], ps = potCell[key(u, svc.Name)] || [];
        const best = ds.slice().sort((a,c) => (RANK[c.Stage]||0) - (RANK[a.Stage]||0))[0];
        const cls = best ? CLS[best.Stage] : (ps.length ? 'pot' : 'none');
        const lines = [];
        const sum = st => ds.filter(d => d.Stage === st).reduce((a,d)=>a+d.Amount,0);
        if (sum('4. Won')) lines.push(['Won', money(sum('4. Won'))]);
        if (sum('5. Lost')) lines.push(['Lost', money(sum('5. Lost'))]);
        const open = ds.filter(d => !['4. Won','5. Lost'].includes(d.Stage)).reduce((a,d)=>a+d.Amount,0);
        if (open) lines.push(['In play', money(open)]);
        if (ps.length) lines.push(['Unworked', money(ps.reduce((a,p)=>a+p.Budget,0))]);
        return `<div class="cell ${cls}" data-c="${E(key(u,svc.Name))}" style="transition-delay:${(ci+r)*80}ms">
          <div class="nm">${E(svc.Name)}</div>${lines.length ? '<hr>' : ''}
          ${lines.map(([k,v])=>`<div class="ln"><span>${k}</span><b>${v}</b></div>`).join('')
            || '<div class="ln" style="opacity:.8">not relevant</div>'}</div>`;
      }).join('');
    }
    grid.innerHTML = html;
    requestAnimationFrame(() => qa(grid,'.cell').forEach(c => c.classList.add('in')));
    q(b,'#sm-sum').textContent = `${money(totalRev)} booked · ${money(totalPot)} unworked · ${deals.rows.length} deals`;
    // fill the header numbers now the data is in — they are rollups, not stored fields
    const open = deals.rows.filter(d => !['4. Won','5. Lost'].includes(d.Stage)).reduce((a,d)=>a+d.Amount,0);
    const hb = document.querySelectorAll('.ecp .bar .f')[1];
    if (hb) hb.innerHTML = [['Booked', money(totalRev)], ['In play', money(open)],
      ['Unworked', money(totalPot)], ['Service lines', `${new Set(deals.rows.map(d=>d.Solutions)).size} of ${cat.rows.length}`]]
      .map(([k,v])=>`<i>${k}</i><b>${v}</b>`).join('');

    let pop = null;
    grid.addEventListener('mouseover', e => {
      const c = e.target.closest('.cell[data-c]'); if (!c) return;
      const ds = byCell[c.dataset.c] || [], ps = potCell[c.dataset.c] || [];
      if (!ds.length && !ps.length) return;
      pop && pop.remove();
      pop = el(`<div class="ecp-pop"><h5>${E(c.dataset.c.split('||')[1])}</h5>
        ${ds.map(d=>`<div class="r"><i>${E(d.Deal_Name.split('—').pop().trim())} · ${E(d.Stage)}</i><b>${money(d.Amount)}</b></div>`).join('')}
        ${ps.map(p=>`<div class="r"><i>unworked · ${E(p.Contacts||'no contact named')}</i><b>${money(p.Budget)}</b></div>`).join('')}
      </div>`);
      document.body.appendChild(pop);
      const r = c.getBoundingClientRect();
      pop.style.left = Math.min(r.left, innerWidth - pop.offsetWidth - 14) + 'px';
      pop.style.top  = (r.bottom + 8 + pop.offsetHeight > innerHeight ? r.top - pop.offsetHeight - 8 : r.bottom + 8) + 'px';
    });
    grid.addEventListener('mouseout', e => { if (!e.relatedTarget || !e.relatedTarget.closest('.cell')) { pop && pop.remove(); pop = null; } });
    grid.addEventListener('click', e => { const btn = e.target.closest('button[data-bu]'); if (btn) this.create(btn.dataset.bu, cat.rows); });
  },

  create(bu, cat) {
    const opts = cat.filter(c => c.Business_Unit === bu);
    const mask = el(`<div class="ecp-mask ecp"><div class="ecp-mod" style="width:min(560px,100%)">
      <div class="hd"><h3>New opportunity</h3><button class="x">&times;</button></div>
      <div class="pane" style="min-height:0">
        <span class="lab">Business unit</span><input class="ti" value="${E(bu)}" disabled>
        <span class="lab" style="margin-top:14px">Service line</span>
        <select class="se" id="o-svc">${opts.map(o=>`<option>${E(o.Name)}</option>`).join('')}</select>
        <span class="lab" style="margin-top:14px">Stage</span>
        <select class="se" id="o-stage"><option>0. Prospecting</option><option>1. Qualification</option><option>2. Proposal</option></select>
        <span class="lab" style="margin-top:14px">Amount (USD)</span>
        <input class="ti" id="o-amt" type="number" value="80000">
        <div class="hint" id="o-msg" style="color:var(--warn)"></div>
      </div>
      <div class="ft"><span class="sp"></span><button class="btn sec" id="o-cancel">Cancel</button><button class="btn" id="o-save">Create</button></div>
    </div></div>`);
    document.body.appendChild(mask);
    const close = () => mask.remove();
    q(mask,'.x').onclick = close; q(mask,'#o-cancel').onclick = close;
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
    q(mask,'#o-save').onclick = async () => {
      const svc = q(mask,'#o-svc').value;
      try {
        await ZOHO.CRM.API.insertRecord({ Entity:'Deals', APIData:{
          Deal_Name:`${this.p.Name} — ${svc}`, Account_Name:this.p.Account_Name.id, Programme:this.p.id,
          Business_Unit:bu, Solutions:svc, Stage:q(mask,'#o-stage').value,
          Amount:+q(mask,'#o-amt').value, Owner:'You (demo)' }});
        close(); this.render(document.getElementById('ecp-body'));
      } catch (e) { q(mask,'#o-msg').textContent = `${e.code} — ${e.message}`; }
    };
  },

  help() {
    const mask = el(`<div class="ecp-mask ecp"><div class="ecp-mod" style="width:min(620px,100%)">
      <div class="hd"><h3>How to read this matrix</h3><button class="x">&times;</button></div>
      <div class="pane"><dl class="kvs">
        <dt>Colour</dt><dd>The strongest deal state in the cell, not the newest: won beats confirmation beats proposal beats prospecting beats lost.</dd>
        <dt>Pale blue</dt><dd>No deal exists. Analytics found budget against this service line and nobody has worked it.</dd>
        <dt>Split amounts</dt><dd>A deal covering several service lines is divided between them, so column totals stay honest.</dd>
        <dt>Row order</dt><dd>By booked revenue, then by unworked pipeline, then alphabetically for whatever is left.</dd>
        <dt>Matching</dt><dd>Deals are attached to a business unit by keyword across two free-text fields, because the link was never modelled. Mismatches are visible rather than silently dropped.</dd>
      </dl></div><div class="ft"><span class="sp"></span><button class="btn" id="h-ok">Close</button></div></div></div>`);
    document.body.appendChild(mask);
    const close = () => mask.remove();
    q(mask,'.x').onclick = close; q(mask,'#h-ok').onclick = close;
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
  }
};

/* ================= contact enrichment ================= */
const Enrichment = {
  async mount(host, accountId) {
    const a = (await ZOHO.CRM.API.getRecord({ Entity:'Accounts', RecordID:accountId })).data[0];
    this.a = a; this.loaded = 0;
    shell(host, { kind:'Account', title:a.Account_Name,
      fields:[['Country', a.Country], ['Industry', a.Industry], ['Status', a.Cooperation_Status], ['Segment', a.Segment],
              ['Employees', a.Employees], ['Revenue', money(a.Total_Revenue)], ['Last 12 months', money(a.Revenue_Last_12M)],
              ['Parent', a.Main_Parent_Account ? a.Main_Parent_Account.name : '—']],
      actions:[['enrich','Enrich contacts'],['hier','Hierarchy'],['export','Export']],
      tabs:['Contact enrichment'], ghostTabs:['Deals','Meetings','Documents'],
      onTab:(t,b)=>this.render(b) });
  },

  async render(b) {
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0 12px 0 0">Enrichment</h4>
        <select class="se" id="e-sen" style="width:auto"><option value="">Any seniority</option>
          ${['C-Level','Lead','Senior','Middle','Junior'].map(x=>`<option>${x}</option>`).join('')}</select>
        <input class="search" id="e-title" placeholder="Job title contains…">
        <button class="btn" id="e-load" style="padding:8px 14px">Load from provider</button>
        <span class="grow"></span><button class="ver">v1.6.4</button></div>
      <div class="stat" id="e-stat"></div>
      <div class="tools"><span class="hint" id="e-note">Nothing loaded yet. The provider is a fixture, so this costs no credits.</span>
        <span class="grow"></span><button class="btn sec" id="e-imp" style="padding:8px 14px" disabled>Import selected</button></div>
      <div class="tw" id="e-tw"></div>
      <div class="hint" style="margin-top:10px"><b>Known gap:</b> there is no preview of what a write would change before it happens.
        On the production version, matched contacts are updated straight after loading. The right fix is a before/after diff
        and a confirmation step — that screen is missing here on purpose, so the gap is visible rather than glossed over.</div>
    </div>`;
    const st = { page:0, rows:[], sel:new Set() };
    this.st = st;
    q(b,'#e-load').onclick = () => this.load(b, st);
    q(b,'#e-imp').onclick = () => this.importSel(b, st);
    this.stats(b, st);
  },

  filtered() {
    const b = document.getElementById('ecp-body');
    const sen = q(b,'#e-sen').value, t = q(b,'#e-title').value.toLowerCase();
    return (window.__DATA__.Enrichment.People || []).filter(p =>
      (!sen || p.Seniority === sen) && (!t || String(p.Title).toLowerCase().includes(t)));
  },

  async load(b, st) {
    const all = this.filtered();
    const btn = q(b,'#e-load'); btn.disabled = true;
    q(b,'#e-note').textContent = `Loading page ${st.page + 1}…`;
    await new Promise(r => setTimeout(r, 420));                 // provider batching, visible
    const next = all.slice(st.page * 12, st.page * 12 + 12);
    st.rows.push(...next); st.page++;
    btn.disabled = false;
    q(b,'#e-note').textContent = `${st.rows.length} of ${all.length} people loaded, ${Math.min(12, next.length)} per request`;
    this.draw(b, st); this.stats(b, st);
    if (st.rows.length >= all.length) btn.disabled = true;
  },

  stats(b, st) {
    const r = st.rows;
    const n = f => r.filter(f).length;
    q(b,'#e-stat').innerHTML = [
      ['Loaded', r.length], ['Direct match', n(x=>x.Match_Path==='direct')],
      ['Via hierarchy', n(x=>x.Match_Path==='hierarchy')], ['By profile URL', n(x=>x.Match_Path==='profile_url')],
      ['New to CRM', n(x=>x.Match==='new')], ['No email', n(x=>!x.Email)]
    ].map(([k,v])=>`<div><b>${v}</b><span>${k}</span></div>`).join('');
  },

  draw(b, st) {
    const tw = q(b,'#e-tw');
    tw.innerHTML = `<table class="d"><thead><tr><th style="width:34px"></th><th>Person</th><th>Title</th>
      <th>Seniority</th><th>Email</th><th>Company</th><th>In CRM</th><th>Matched by</th><th>Last sync</th></tr></thead>
      <tbody>${st.rows.map(p=>`<tr class="${p._made ? 'made' : p.Match==='crm' ? 'crm' : 'new'}" data-id="${p.id}">
        <td>${p.Match==='crm' || p._made ? '' : `<input type="checkbox" data-s="${p.id}" ${st.sel.has(p.id)?'checked':''}>`}</td>
        <td><div style="display:flex;gap:8px;align-items:center">
          <span class="av" style="background:${hue(p.Full_Name)}">${ini(p.Full_Name)}</span>
          <a href="#" data-p="${p.id}">${E(p.Full_Name)}</a></div></td>
        <td class="wrap">${E(p.Title)}</td><td>${E(p.Seniority)}</td>
        <td>${p.Email ? E(p.Email) : '<span class="pill ghost">not revealed</span>'}</td>
        <td class="wrap">${E(p.Company)}</td>
        <td>${p._made ? '<span class="pill ok">created</span>' : p.Match==='crm' ? '<span class="pill ok">&#10003;</span>' : '<span class="pill ghost">&#10005;</span>'}</td>
        <td>${p.Match_Path ? `<span class="pill info">${E(p.Match_Path.replace('_',' '))}</span>` : '—'}</td>
        <td>${p.Last_Sync ? E(p.Last_Sync) : '<span style="color:var(--ink-3)">—</span>'}</td></tr>`).join('')}</tbody></table>`;
    tw.onchange = e => { const c = e.target.closest('input[data-s]'); if (!c) return;
      c.checked ? st.sel.add(c.dataset.s) : st.sel.delete(c.dataset.s);
      q(b,'#e-imp').disabled = !st.sel.size;
      q(b,'#e-imp').textContent = st.sel.size ? `Import ${st.sel.size} selected` : 'Import selected'; };
    tw.onclick = e => { const a = e.target.closest('a[data-p]'); if (!a) return; e.preventDefault();
      this.profile(st.rows.find(x => x.id === a.dataset.p)); };
  },

  profile(p) {
    const mask = el(`<div class="ecp-mask ecp"><div class="ecp-mod" style="width:min(560px,100%)">
      <div class="hd"><h3>${E(p.Full_Name)}</h3><button class="x">&times;</button></div>
      <div class="pane" style="min-height:0">
        <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px">
          <span class="av" style="width:64px;height:64px;flex:0 0 64px;font-size:20px;background:${hue(p.Full_Name)}">${ini(p.Full_Name)}</span>
          <div><div style="font:600 15px/1.3 'IBM Plex Serif',serif">${E(p.Title)}</div>
            <div style="color:var(--ink-3);font-size:13px">${E(p.Company)}</div>
            <div style="margin-top:6px;display:flex;gap:6px"><span class="pill info">${E(p.Seniority)}</span>
              ${p.Linkedin ? '<span class="pill ghost">profile on file</span>' : ''}</div></div></div>
        <span class="lab">Employment history</span>
        ${p.History.map(h=>`<div class="room" style="cursor:default;border-left:3px solid ${h.To ? 'var(--line-strong)' : 'var(--ok)'}">
          <div><div class="nm">${E(h.Title)}</div><div class="mt">${E(h.Company)} · ${E(h.From)} – ${h.To ? E(h.To) : 'present'}</div></div></div>`).join('')}
      </div><div class="ft"><span class="sp"></span><button class="btn" id="p-ok">Close</button></div></div></div>`);
    document.body.appendChild(mask);
    const close = () => mask.remove();
    q(mask,'.x').onclick = close; q(mask,'#p-ok').onclick = close;
    mask.addEventListener('click', e => { if (e.target === mask) close(); });
  },

  async importSel(b, st) {
    const sel = st.rows.filter(p => st.sel.has(p.id));
    let made = 0, failed = [];
    for (const p of sel) {
      const [first, ...rest] = p.Full_Name.split(' ');
      try {
        await ZOHO.CRM.API.insertRecord({ Entity:'Contacts', APIData:{
          First_Name:first, Last_Name:rest.join(' ') || first, Full_Name:p.Full_Name,
          Title:p.Title, Seniority:p.Seniority, Email:p.Email, Linkedin:p.Linkedin,
          Account_Name:this.a.id, Contact_Status:'Working' }});
        p._made = true; p.Match = 'crm'; p.Match_Path = 'direct'; made++;
      } catch (e) { failed.push(`${p.Full_Name}: ${e.code}`); }
    }
    st.sel.clear();
    q(b,'#e-imp').disabled = true; q(b,'#e-imp').textContent = 'Import selected';
    q(b,'#e-note').innerHTML = `${made} contact${made===1?'':'s'} created`
      + (failed.length ? ` · <span style="color:var(--crit)">${failed.length} refused: ${E(failed.join('; '))}</span>` : '')
      + ` · deduplication ran against direct contacts, the parent account's contacts, and normalised profile URLs`;
    this.draw(b, st); this.stats(b, st);
  }
};

/* ================= deal conversations ================= */
const Conversations = {
  async mount(host, dealId) {
    const d = (await ZOHO.CRM.API.getRecord({ Entity:'Deals', RecordID:dealId })).data[0];
    this.d = d;
    shell(host, { kind:'Deal', title:d.Deal_Name,
      fields:[['Account', d.Account_Name.name], ['Stage', d.Stage], ['Amount', money(d.Amount)], ['Close date', d.Closing_Date],
              ['Business unit', d.Business_Unit], ['Service line', d.Solutions], ['Owner', d.Owner], ['Programme', d.Programme ? d.Programme.name : '—']],
      actions:[['sync','Sync now'],['channel','Open channel'],['issue','Open issue']],
      tabs:['Chat threads','Tracker comments'], ghostTabs:['Meetings','Documents','Quotes'],
      onTab:(t,b)=> t === 'Chat threads' ? this.threads(b) : this.tracker(b) });
  },

  async threads(b) {
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0 12px 0 0">Chat threads</h4>
        <select class="se" id="t-ctx" style="width:auto"><option value="">All contexts</option>
          <option>DELIVERY</option><option>ACCOUNT</option><option>OTHER</option></select>
        <input class="search" id="t-q" placeholder="Search text or author…">
        <span class="grow"></span><span class="hint" id="t-sum"></span><button class="ver">v1.4.0</button></div>
      <div id="t-list"><span class="hint">Loading…</span></div></div>`;
    const { rows } = await coqlAll(
      `select id, Context, Thread_Topic, Is_Root, Root_Message_Id, Message_Id, From_Name, Created_DateTime,
       Body, Has_Attachment, Needs_Review, In_Tracker, Issue_Key from Messages where Deal = '${this.d.id}'`);
    this.rows = rows;
    const draw = () => {
      const ctx = q(b,'#t-ctx').value, s = q(b,'#t-q').value.toLowerCase();
      const groups = {};
      rows.forEach(r => (groups[r.Root_Message_Id] ||= []).push(r));
      const list = Object.values(groups)
        .filter(g => !ctx || g[0].Context === ctx)
        .filter(g => !s || g.some(m => (m.Body + ' ' + m.From_Name).toLowerCase().includes(s)));
      q(b,'#t-sum').textContent = `${list.length} threads · ${list.reduce((a,g)=>a+g.length,0)} messages`;
      q(b,'#t-list').innerHTML = list.length ? list.map(g => {
        const root = g.find(m => m.Is_Root) || g[0];
        return `<div class="thread" data-r="${E(root.Root_Message_Id)}">
          <div class="thead"><span class="pill info">${E(root.Context)}</span>
            <span class="tp">${E(root.Thread_Topic)}</span>
            <span class="meta">${root.Issue_Key ? `<span class="pill ghost">${E(root.Issue_Key)}</span>` : ''}
              ${g.some(m=>m.Has_Attachment) ? '<span title="has an attachment">&#128206;</span>' : ''}
              ${g.some(m=>m.Needs_Review) ? '<span class="pill no">needs review</span>' : ''}
              <span>${g.length} msg</span></span></div>
          <div class="msgs" hidden>${g.map((m,i)=>`<div class="msg ${i && !m.Is_Root ? 'reply' : ''}">
            <span class="av" style="background:${hue(m.From_Name)}">${ini(m.From_Name)}</span>
            <div style="flex:1"><div><span class="who">${E(m.From_Name)}</span><span class="when">${E(m.Created_DateTime)}</span></div>
              <div class="tx">${E(m.Body)}</div></div>
            <button class="chip2 push" data-push="${m.id}" ${m.In_Tracker ? 'disabled style="opacity:.55"' : ''}>
              ${m.In_Tracker ? '&#10003; in tracker' : 'Add to tracker'}</button></div>`).join('')}</div></div>`;
      }).join('') : `<div class="none">No thread matches that.</div>`;
    };
    q(b,'#t-ctx').onchange = draw; q(b,'#t-q').oninput = draw;
    q(b,'#t-list').onclick = async e => {
      const push = e.target.closest('button[data-push]');
      if (push) {
        const id = push.dataset.push;
        push.disabled = true; push.textContent = 'sending…';
        await ZOHO.CRM.API.updateRecord({ Entity:'Messages', RecordID:id, APIData:{ In_Tracker:true }});
        const r = rows.find(x => x.id === id); if (r) r.In_Tracker = true;
        push.innerHTML = '&#10003; in tracker'; push.style.opacity = '.55';
        return;
      }
      const h = e.target.closest('.thead'); if (!h) return;
      const m = h.nextElementSibling; m.hidden = !m.hidden;
    };
    draw();
  },

  async tracker(b) {
    const rows = (this.rows || []).filter(r => r.In_Tracker);
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0">Tracker comments</h4><span class="grow"></span>
        <button class="chip2" id="k-tr">Translate all to English</button><button class="ver">v1.4.0</button></div>
      ${rows.length ? rows.map(r=>`<div class="msg" style="border-top:1px solid var(--b)">
          <span class="av" style="background:${hue(r.From_Name)}">${ini(r.From_Name)}</span>
          <div style="flex:1"><div><span class="who">${E(r.From_Name)}</span>
            <span class="when">${E(r.Created_DateTime)}</span>
            ${r.Issue_Key ? `<span class="pill ghost" style="margin-left:6px">${E(r.Issue_Key)}</span>` : ''}</div>
            <div class="tx" data-tx>${E(r.Body)}</div></div></div>`).join('')
        : `<div class="none">Nothing has been pushed to the tracker yet. Send a message across from the previous tab.</div>`}
      <div class="composer"><span class="lab">Add a comment</span>
        <textarea class="ta" rows="3" id="k-txt" placeholder="Type @ to mention someone on the issue…"></textarea>
        <div id="k-men" class="peep" style="margin-top:8px"></div>
        <div class="tools" style="margin-top:10px"><span class="hint" id="k-msg">
          Comments carry a hidden marker so a ten-minute sync never posts the same message twice.</span>
          <span class="grow"></span><button class="btn" id="k-post">Post comment</button></div></div></div>`;

    const people = [...new Set((this.rows||[]).map(r => r.From_Name))].slice(0, 6);
    const ta = q(b,'#k-txt'), men = q(b,'#k-men');
    ta.oninput = () => { const at = /@(\w*)$/.exec(ta.value);
      men.innerHTML = at ? people.filter(p => p.toLowerCase().includes(at[1].toLowerCase()))
        .map(p => `<button data-m="${E(p)}">${E(p)}</button>`).join('') : ''; };
    men.onclick = e => { const btn = e.target.closest('button[data-m]'); if (!btn) return;
      ta.value = ta.value.replace(/@\w*$/, `[~${btn.dataset.m}] `); men.innerHTML = ''; ta.focus(); };
    q(b,'#k-post').onclick = () => { if (!ta.value.trim()) return;
      q(b,'#k-msg').innerHTML = `Posted with marker <span class="mono">[crm-msg:${Date.now().toString(36)}]</span> — a repeat send would be recognised and skipped.`;
      ta.value = ''; };
    q(b,'#k-tr').onclick = () => qa(b,'[data-tx]').forEach(x => {
      if (x.dataset.done) return; x.dataset.done = '1';
      x.innerHTML = E(x.textContent) + ' <span class="pill info" style="margin-left:6px">translated</span>'; });
  }
};

window.CRMPages = { SolutionMap, Enrichment, Conversations, shell, money, hue, ini };
})();
