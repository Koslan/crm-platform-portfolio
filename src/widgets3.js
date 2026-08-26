/* =============================================================
   · Account hierarchy — the whole group, drawn from any member
   · Sales cockpit     — the operations screen a head of sales lives in
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa, coqlAll, esc } = S;
const { hue, ini, money, shell } = window.CRMPages;

const CSS7 = `
.hier{position:relative;overflow:auto;padding:14px 6px 22px;background:var(--surface)}
.hier svg{position:absolute;inset:0;pointer-events:none}
.hier .node{position:absolute;width:186px;border:1px solid var(--line);border-radius:9px;background:var(--surface);
  box-shadow:var(--shadow);cursor:pointer;overflow:hidden;transition:transform .16s ease,box-shadow .16s ease;
  opacity:0;transform:translateY(6px)}
.hier .node.in{opacity:1;transform:none}
.hier .node:hover{transform:translateY(-2px);box-shadow:0 10px 26px -12px rgba(27,39,51,.4)}
.hier .node.self{border-color:var(--accent);border-width:2px}
.hier .node .nm{font:600 13px/1.3 "IBM Plex Sans",sans-serif;padding:9px 11px 8px;background:var(--surface)}
.hier .node .nm em{font-style:normal;display:block;font-weight:400;font-size:10.5px;color:var(--ink-3);margin-top:2px}
.hier .node .body{padding:8px 11px 10px;font:400 11.5px/1.55 "IBM Plex Sans",sans-serif}
.hier .node .body div{display:flex;justify-content:space-between;gap:8px}
.hier .node .body b{font-family:"IBM Plex Mono",monospace;font-variant-numeric:tabular-nums}
.hier .node .here{position:absolute;top:7px;right:8px;font:500 9px/1 "IBM Plex Mono",monospace;letter-spacing:.08em;
  text-transform:uppercase;background:var(--accent);color:#fff;border-radius:3px;padding:3px 5px}
.hier-lg{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;font-size:11.5px}
.hier-lg span{display:inline-flex;align-items:center;gap:6px;color:var(--ink-2)}
.hier-lg i{width:11px;height:11px;border-radius:3px;display:inline-block}
.ck .grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(430px,1fr))}
.ck .box{border:1px solid var(--line);border-radius:10px;background:var(--surface);overflow:hidden}
.ck .box > h5{margin:0;padding:9px 13px;font:600 12.5px/1.3 "IBM Plex Sans",sans-serif;color:#fff;display:flex;align-items:center;gap:9px}
.ck .box > h5 span{margin-left:auto;font:400 11px/1 "IBM Plex Mono",monospace;opacity:.85}
.ck .box .tw{max-height:290px;border:0;border-radius:0}
.ck tr.late td{background:#fdeceb}
.ck tr.soon td{background:#fdf4e0}
.ck .stg{font-weight:600}
.ck .note{font-size:12.5px;color:var(--ink-3);padding:9px 13px;border-top:1px solid var(--line);background:var(--surface-2)}
`;
function css7(){ if(!document.getElementById('w3-css')){ const st=document.createElement('style'); st.id='w3-css'; st.textContent=CSS7; document.head.appendChild(st);} }

const STATUS_COLOUR = {
  'Key client':'#1c7a4a', 'Client':'#3f9d6b', 'Key prospect':'#c08a1e',
  'Prospect':'#d97757', 'Seed prospect':'#8a99a6', 'Former Client':'#8a99a6', 'Restricted':'#bf3a2b'
};
const sc = s => STATUS_COLOUR[s] || '#8a99a6';

/* ---------------- account hierarchy ---------------- */
const Hierarchy = {
  async render(b, a) {
    css7();
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0">Group structure</h4>
        <span class="grow"></span><span class="hint" id="hi-note">Climbing to the top of the group…</span>
        <button class="ver">v1.5.0</button></div>
      <div class="hier-lg" id="hi-legend"></div>
      <div class="hier" id="hi-canvas" style="min-height:220px"></div>
      <div class="hint" style="margin-top:10px">Opened from a subsidiary, this still draws the whole group: the widget
        first follows the record's own pointer to the top company, then walks down. Fill colour is the cooperation
        status, so the tree doubles as a portfolio heat map.</div>
    </div>`;

    // climb: the record points at the top of its group, so any member draws the same tree
    const rootId = (a.Main_Parent_Account && a.Main_Parent_Account.id) || a.id;
    const { rows } = await coqlAll(
      `select id, Account_Name, Parent_Account, Main_Parent_Account, Cooperation_Status, Country,
       Hierarchy_Level, Total_Revenue, Revenue_Last_12M, Platforms, Owner, Co_Owner
       from Accounts where Main_Parent_Account = '${esc(rootId)}'`, 200);
    const root = (await ZOHO.CRM.API.getRecord({ Entity:'Accounts', RecordID:rootId })).data[0];
    const flat = [{ ...root, Parent_Account:null }, ...rows.filter(r => r.id !== rootId)];
    const byId = {}; flat.forEach(n => byId[n.id] = { d:n, kids:[] });
    flat.forEach(n => { const p = n.Parent_Account && byId[n.Parent_Account.id || n.Parent_Account];
      if (p && p.d.id !== n.id) p.kids.push(byId[n.id]); });
    const tree = byId[rootId];

    q(b,'#hi-note').textContent = flat.length > 1
      ? `${flat.length} companies in the group${a.id !== rootId ? ', opened from a subsidiary' : ''}`
      : 'this company has no parent and no subsidiaries — one node is the honest answer';

    const used = [...new Set(flat.map(n => n.Cooperation_Status))];
    q(b,'#hi-legend').innerHTML = used.map(s2 =>
      `<span><i style="background:${sc(s2)}"></i>${E(s2)}</span>`).join('');

    // tidy layout: x from leaf order, y from depth
    const NW = 186, GAPX = 20, GAPY = 52, NH = 116;
    let leaf = 0;
    (function place(n, depth) {
      n.depth = depth;
      if (!n.kids.length) { n.x = leaf++; return; }
      n.kids.forEach(k => place(k, depth + 1));
      n.x = (n.kids[0].x + n.kids[n.kids.length-1].x) / 2;
    })(tree, 0);
    const nodes = []; (function walk(n){ nodes.push(n); n.kids.forEach(walk); })(tree);
    const depth = Math.max(...nodes.map(n => n.depth));
    const W = leaf * (NW + GAPX) + GAPX, H = (depth + 1) * (NH + GAPY);
    const px = n => GAPX + n.x * (NW + GAPX), py = n => n.depth * (NH + GAPY);

    const canvas = q(b,'#hi-canvas');
    canvas.style.height = H + 'px';
    canvas.innerHTML = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      ${nodes.flatMap(n => n.kids.map(k => {
        const x1 = px(n) + NW/2, y1 = py(n) + NH, x2 = px(k) + NW/2, y2 = py(k), my = y1 + GAPY/2;
        return `<path d="M${x1} ${y1} V${my} H${x2} V${y2}" fill="none" stroke="var(--line-strong)" stroke-width="1.5"/>`;
      })).join('')}</svg>`
      + nodes.map((n,i) => { const d = n.d;
        return `<div class="node ${d.id === a.id ? 'self' : ''}" data-id="${d.id}"
          style="left:${px(n)}px;top:${py(n)}px;transition-delay:${Math.min(i*45,420)}ms">
          ${d.id === a.id ? '<span class="here">here</span>' : ''}
          <div class="nm">${E(d.Account_Name)}<em>${E(d.Hierarchy_Level || 'Company')} · ${E(d.Country || '')}</em></div>
          <div class="body" style="background:${sc(d.Cooperation_Status)};color:#fff">
            <div><span>status</span><b>${E(d.Cooperation_Status || '—')}</b></div>
            <div><span>total</span><b>${money(d.Total_Revenue)}</b></div>
            <div><span>last 12 m</span><b>${money(d.Revenue_Last_12M)}</b></div>
            <div><span>owner</span><b>${E((d.Owner || '').split(' ').pop())}</b></div>
          </div></div>`; }).join('');
    requestAnimationFrame(() => {
      qa(canvas,'.node').forEach(x => x.classList.add('in'));
      // a group wider than the panel should still open on the company you came from
      const self = q(canvas,'.node.self');
      if (self && canvas.scrollWidth > canvas.clientWidth)
        canvas.scrollLeft = Math.max(0, self.offsetLeft - canvas.clientWidth/2 + 93);
    });
    canvas.onclick = e => { const n = e.target.closest('.node[data-id]'); if (!n) return;
      const P = window.CRMPages.Enrichment;
      if (P) P.mount(document.getElementById('rec-host'), n.dataset.id); };
  }
};

/* ---------------- sales cockpit ---------------- */
const Cockpit = {
  async mount(host) {
    css7();
    host.classList.add('ecp'); host.classList.add('ck');
    this.host = host;
    this.owner = 'all'; this.tab = 'Pipeline';
    const users = (window.__DATA__.Users || []).map(u => u.full_name);
    this.users = users;
    host.innerHTML = `
      <div class="bar" style="border-radius:8px 8px 0 0">
        <div><h3><span>Team</span>Sales operations</h3>
          <div class="f"><i>Scope</i><b id="ck-scope">everyone</b><i>Today</i><b>26.08.2026</b>
            <i>Overdue rule</i><b>closing date in the past</b><i>Warning</i><b>closes within 7 days</b></div></div>
        <div style="padding-top:34px"><div class="f">
          <i>Open value</i><b id="ck-open">—</b><i>Overdue</i><b id="ck-late">—</b>
          <i>Agreements waiting</i><b id="ck-agr">—</b><i>Tasks past due</i><b id="ck-task">—</b></div></div>
        <div class="acts">
          <button class="pri" data-o="all">Everyone</button>
          <button data-o="me">Mine</button>
          ${users.slice(0,4).map(u => `<button data-o="${E(u)}">${E(u)}</button>`).join('')}
        </div></div>
      <div class="tabs" role="tablist">${['Pipeline','Legal','Methodology'].map((t,i) =>
        `<button role="tab" data-t="${t}" aria-selected="${i===0}">${t}</button>`).join('')}</div>
      <div class="body" id="ck-body"></div>`;
    q(host,'.acts').onclick = e => { const btn = e.target.closest('[data-o]'); if (!btn) return;
      this.owner = btn.dataset.o;
      qa(host,'.acts button').forEach(x => x.className = x === btn ? 'pri' : '');
      q(host,'#ck-scope').textContent = this.owner === 'all' ? 'everyone' : this.owner === 'me' ? 'mine' : this.owner;
      this.draw(); };
    q(host,'.tabs').onclick = e => { const btn = e.target.closest('[data-t]'); if (!btn) return;
      this.tab = btn.dataset.t;
      qa(host,'.tabs button').forEach(x => x.setAttribute('aria-selected', String(x === btn)));
      this.draw(); };

    const [deals, tasks, agr, port] = await Promise.all([
      coqlAll(`select id, Deal_Name, Stage, Substage, Amount, Closing_Date, Owner, Business_Unit,
               Account_Plan_Link, Plan_Recommended, Account_Name.Account_Name from Deals`),
      coqlAll(`select id, Task, Kind, Owner, Due, Status, Priority, Account_Name.Account_Name from Tasks`),
      coqlAll(`select id, Kind, Name, Status, Issue_Key, Issue_Status, Owner, Raised, Due, Account_Name.Account_Name from Agreements`),
      coqlAll(`select id, Request, Owner, Raised, Due, Status, Account_Name.Account_Name from Portfolio_Requests`)
    ]);
    this.data = { deals:deals.rows, tasks:tasks.rows, agr:agr.rows, port:port.rows };
    this.me = this.users[0];
    this.draw();
  },

  scope(rows) {
    if (this.owner === 'all') return rows;
    const who = this.owner === 'me' ? this.me : this.owner;
    return rows.filter(r => r.Owner === who);
  },

  draw() {
    const TODAY = '2026-08-26';
    const soonLimit = '2026-09-02';
    const D = this.scope(this.data.deals), T = this.scope(this.data.tasks),
          A = this.scope(this.data.agr), P = this.scope(this.data.port);
    const open = D.filter(d => !['4. Won','5. Lost'].includes(d.Stage));
    const late = open.filter(d => d.Closing_Date < TODAY);
    q(this.host,'#ck-open').textContent = money(open.reduce((a,d) => a + d.Amount, 0));
    q(this.host,'#ck-late').textContent = late.length;
    q(this.host,'#ck-agr').textContent  = A.filter(x => x.Status !== 'Signed').length;
    q(this.host,'#ck-task').textContent = T.filter(x => x.Status !== 'Done' && x.Due < TODAY).length;

    const rowCls = d => d.Closing_Date < TODAY ? 'late' : d.Closing_Date <= soonLimit ? 'soon' : '';
    const STAGE_COLOUR = { '0. Prospecting':'#8a6fb0','1. Qualification':'#1f7fc4','2. Proposal':'#b0701c',
      '3. Confirmation':'#1c8a4d','4. Won':'#1c8a4d','5. Lost':'#bf3a2b' };
    const stage = v => `<span class="stg" style="color:${STAGE_COLOUR[v]||'var(--ink-2)'}">${E(v)}</span>`;
    const body = q(this.host,'#ck-body');

    const box = (title, colour, rows, cols, note, cap) => {
      const id = 'b' + Math.random().toString(36).slice(2,8);
      return { html:`<div class="box"><h5 style="background:${colour}">${E(title)}<span>${rows.length} records</span></h5>
        <div class="tw" id="${id}"></div>${note ? `<div class="note">${note}</div>` : ''}</div>`,
        wire:() => S.dataTable(document.getElementById(id), cols, rows, { cap:cap || 120 }) };
    };

    let boxes = [];
    if (this.tab === 'Pipeline') {
      const dealCols = [
        { k:'a', label:'Account', filter:'text', cls:'wrap', text:d=>d['Account_Name.Account_Name'],
          html:d=>`<span class="link">${E(d['Account_Name.Account_Name'])}</span>` },
        { k:'d', label:'Deal', filter:'text', cls:'wrap', text:d=>d.Deal_Name.split('—').pop().trim() },
        { k:'s', label:'Stage', filter:'select', text:d=>d.Stage, html:d=>stage(d.Stage) },
        { k:'v', label:'Value', filter:'min', text:d=>String(d.Amount), sortVal:d=>d.Amount, html:d=>money(d.Amount) },
        { k:'c', label:'Closes', filter:'text', text:d=>d.Closing_Date },
        { k:'o', label:'Owner', filter:'select', text:d=>d.Owner }
      ];
      boxes = [
        box('Overdue', '#a5372c', late, dealCols,
            'A closing date in the past on an open deal. Nothing else qualifies — the rule is one line, so nobody argues about the list.'),
        box('Closing within a week', '#b0701c', open.filter(d => d.Closing_Date >= TODAY && d.Closing_Date <= soonLimit), dealCols),
        box('Tasks past due', '#7b8b9a', T.filter(t => t.Status !== 'Done' && t.Due < TODAY), [
          { k:'t', label:'Task', filter:'text', cls:'wrap', text:t=>t.Task },
          { k:'a', label:'Account', filter:'text', cls:'wrap', text:t=>t['Account_Name.Account_Name'] },
          { k:'p', label:'Priority', filter:'select', text:t=>t.Priority,
            html:t=>`<span class="prio ${t.Priority}">${t.Priority}</span>` },
          { k:'d', label:'Due', filter:'text', text:t=>t.Due },
          { k:'o', label:'Owner', filter:'select', text:t=>t.Owner }]),
        box('Portfolio requests', '#3d4a45', P.filter(p => p.Status !== 'Delivered'), [
          { k:'r', label:'Request', filter:'text', cls:'wrap', text:p=>p.Request },
          { k:'a', label:'Account', filter:'text', cls:'wrap', text:p=>p['Account_Name.Account_Name'] },
          { k:'d', label:'Due', filter:'text', text:p=>p.Due },
          { k:'s', label:'Status', filter:'select', text:p=>p.Status },
          { k:'o', label:'Owner', filter:'select', text:p=>p.Owner }])
      ];
    } else if (this.tab === 'Legal') {
      const cols = [
        { k:'n', label:'Document', filter:'text', cls:'wrap', text:x=>x.Name },
        { k:'a', label:'Account', filter:'text', cls:'wrap', text:x=>x['Account_Name.Account_Name'] },
        { k:'s', label:'Stage', filter:'select', text:x=>x.Status },
        { k:'j', label:'Issue', filter:'text', text:x=>x.Issue_Key,
          html:x=>`<span class="link">${E(x.Issue_Key)}</span>` },
        { k:'js',label:'Tracker', filter:'select', text:x=>x.Issue_Status,
          html:x=>`<span class="pill ghost">${E(x.Issue_Status)}</span>` },
        { k:'d', label:'Due', filter:'text', text:x=>x.Due },
        { k:'o', label:'Owner', filter:'select', text:x=>x.Owner }
      ];
      boxes = ['NDA','MSA','Exhibit','Amendment'].map((k,i) =>
        box(k + 's awaiting signature', ['#1f5f92','#155e93','#3d4a45','#7b8b9a'][i],
            A.filter(x => x.Kind === k), cols,
            i === 0 ? 'Stage comes from the CRM. The tracker column is the same document seen from the issue that legal actually works in — two systems, one row, and the disagreement is visible rather than argued about.' : ''));
    } else {
      const rec = D.filter(d => d.Plan_Recommended && !d.Account_Plan_Link);
      const has = D.filter(d => d.Account_Plan_Link);
      const cols = [
        { k:'a', label:'Account', filter:'text', cls:'wrap', text:d=>d['Account_Name.Account_Name'] },
        { k:'d', label:'Deal', filter:'text', cls:'wrap', text:d=>d.Deal_Name.split('—').pop().trim() },
        { k:'v', label:'Value', filter:'min', text:d=>String(d.Amount), sortVal:d=>d.Amount, html:d=>money(d.Amount) },
        { k:'s', label:'Stage', filter:'select', text:d=>d.Stage, html:d=>stage(d.Stage) },
        { k:'o', label:'Owner', filter:'select', text:d=>d.Owner }
      ];
      boxes = [
        box('Account plan recommended', '#a5372c', rec, cols,
            'The rule, in full: the deal is still open, it is worth more than the threshold, and no plan is linked. It runs on the client, so anyone can read it off this screen and disagree with it.'),
        box('Account plan in place', '#1c7a4a', has, cols)
      ];
    }
    body.innerHTML = `<div class="grid">${boxes.map(x => x.html).join('')}</div>`;
    boxes.forEach(x => x.wire());
    if (this.tab === 'Pipeline') qa(body,'.box').forEach((bx,i) => { if (i > 1) return;
      qa(bx,'tbody tr').forEach(tr => {
        const txt = tr.textContent;
        const d = (i === 0 ? late : open).find(x => txt.includes(x.Closing_Date));
        if (d) tr.className = rowCls(d); }); });
  }
};

window.CRMWidgets3 = { Hierarchy, Cockpit };
})();
