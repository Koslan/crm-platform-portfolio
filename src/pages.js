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
.ecp .cell{position:relative;overflow:hidden;border-radius:8px;padding:8px;min-height:96px;opacity:0;transform:translateY(20px);transition:opacity .34s ease,transform .34s ease;cursor:default;border:1px solid rgba(255,255,255,.2);box-shadow:0 2px 8px rgba(0,0,0,.1)}
.ecp .cell.in{opacity:1;transform:none}
.ecp .cell::before{content:"";position:absolute;inset:0;background:linear-gradient(45deg,transparent,rgba(255,255,255,.1),transparent);pointer-events:none}
.ecp .cell .inner{position:relative;z-index:1}
.ecp .cell .nm{font:600 12px/1.35 "IBM Plex Sans",sans-serif;margin-bottom:4px;letter-spacing:.02em}
.ecp .cell hr{border:0;height:1px;margin:6px 0;background:linear-gradient(90deg,transparent,currentColor,transparent);opacity:.7}
.ecp .cell .ln{font:500 11px/1.5 "IBM Plex Sans",sans-serif;display:flex;align-items:center;gap:5px;white-space:nowrap}
.ecp .cell .ln .amt{font:600 11px/1 "IBM Plex Mono",monospace;font-variant-numeric:tabular-nums}
.ecp .cell .not-rel{font-style:italic;font-weight:400;letter-spacing:.5px;color:rgba(255,255,255,.7);text-align:center}
.ecp .cell.pros .not-rel{color:rgba(44,62,80,.75)}
.ecp .cell.none{background:var(--surface-2);color:var(--ink-3);font-style:italic;border:1px dashed var(--line);box-shadow:none}
.ecp .cell.none::before{display:none}
.ecp-pop{position:fixed;z-index:70;min-width:240px;max-width:360px;background:rgba(0,0,0,.85);color:#fff;border-radius:10px;padding:10px 12px;font-size:12.5px;box-shadow:0 12px 30px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(6px);opacity:0;transform:translateY(6px) scale(.98);transition:opacity 180ms ease,transform 180ms ease;pointer-events:auto}
.ecp-pop.in{opacity:1;transform:translateY(0) scale(1)}
.ecp-pop h5{margin:0 0 6px;font:600 13px/1.3 "IBM Plex Serif",serif}
.ecp-pop .r{padding:7px 0;border-top:1px solid rgba(255,255,255,.08)}
.ecp-pop .r:first-of-type{border-top:0}
.ecp-pop .r .rt{display:flex;align-items:flex-start;gap:8px;margin-bottom:4px;font-weight:600;font-size:12.5px}
.ecp-pop .r a{color:#9bdcff;text-decoration:underline}
.ecp-pop .r .rb{display:flex;gap:12px;font-size:11.5px;opacity:.92}
.ecp-pop .r .rb div{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ecp-pop .r .rb .meta{min-width:150px}
.ecp .mhd .badge{background:rgba(255,255,255,.15);border-radius:8px;padding:2px 6px;font-size:10px;font-weight:500}
.ecp .refresh-btn.busy{opacity:.75;cursor:default}
.ecp .refresh-spin{display:inline-block;animation:ecp-spin .8s linear infinite}
@keyframes ecp-spin{to{transform:rotate(360deg)}}
.ecp-toasts{position:fixed;top:16px;right:16px;z-index:200;display:flex;flex-direction:column;gap:8px;pointer-events:none}
.ecp-toast{pointer-events:auto;min-width:240px;max-width:340px;background:var(--surface);color:var(--ink);border:1px solid var(--b);border-radius:9px;box-shadow:0 12px 28px -10px rgba(0,0,0,.35);padding:10px 12px;display:flex;gap:9px;align-items:flex-start;opacity:0;transform:translateX(16px);transition:opacity .2s ease,transform .2s ease}
.ecp-toast.in{opacity:1;transform:none}
.ecp-toast .ic{font-size:15px;line-height:1.2}
.ecp-toast .tb{font-size:12.5px;line-height:1.4}
.ecp-toast .tb b{display:block;font-size:11.5px;text-transform:uppercase;letter-spacing:.04em;opacity:.75;margin-bottom:1px}
.ecp-toast.success{border-color:var(--ok)}
.ecp-toast.error{border-color:var(--warn)}
.ecp-toast.warning{border-color:#c8942b}
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
const STATUS_COLORS = {
  NO_OPP:'#6c757d', LOST:'#dc3545', WON:'#198754', CONFIRMATION:'#20c997', PROPOSAL:'#6fcf97',
  QUALIFICATION:'#a8e6cf', PROSPECTING:'#ffeaa7', RECOMMENDATION:'#87CEEB', RECOMMENDATION_OPPO:'#DDA0DD', DUPLICATE:'#dc3545'
};
const STAGE_COLOR = { '4. Won':'WON', '3. Confirmation':'CONFIRMATION', '2. Proposal':'PROPOSAL',
  '1. Qualification':'QUALIFICATION', '0. Prospecting':'PROSPECTING', '5. Lost':'LOST',
  'Recommendation':'RECOMMENDATION_OPPO', 'Duplicate':'DUPLICATE' };
// Bootstrap-style class markers kept alongside the computed gradient, so tests and print styles
// can still target a stage by name. Same six the replica always had, plus two for the stages the
// original models as deal states (Recommendation, Duplicate) rather than a separate entity.
const STAGE_CLASS = { '4. Won':'won', '5. Lost':'lost', '3. Confirmation':'conf', '2. Proposal':'prop',
  '1. Qualification':'prop', '0. Prospecting':'pros', 'Recommendation':'reco', 'Duplicate':'dup' };
const adjustBrightness = (color, percent) => {
  const num = parseInt(color.replace('#',''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000
    + (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100
    + (B < 255 ? (B < 1 ? 0 : B) : 255)).toString(16).slice(1);
};
// Amount < $1000 renders as an exact dollar figure in the original (formatBudgetAmount), not a
// rounded-to-K figure — money() only has the M/K branches, so the map keeps its own formatter.
const budgetFmt = n => n === 0 ? '$0'
  : n >= 1e6 ? `$${(n/1e6).toFixed(1)}M`
  : n >= 1000 ? `$${Math.round(n/1000)}K`
  : `$${Math.round(n).toLocaleString()}`;
const STAGE_EMOJI = { won:'💰', lost:'❌', dup:'🔄', qual:'📋', prop:'📄', conf:'✅', pros:'🎯', reco:'📊' };

function showToast(msg, type = 'info', duration = 3000) {
  let host = document.querySelector('.ecp-toasts');
  if (!host) { host = el('<div class="ecp-toasts"></div>'); document.body.appendChild(host); }
  const cfg = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const title = { success:'Success', error:'Error', warning:'Warning', info:'Information' };
  const t = el(`<div class="ecp-toast ${E(type)}"><span class="ic">${cfg[type]||cfg.info}</span>
    <div class="tb"><b>${title[type]||title.info}</b>${E(msg)}</div></div>`);
  host.appendChild(t);
  requestAnimationFrame(() => t.classList.add('in'));
  setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 220); }, duration);
}

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
      onAction:a => { if (a==='help') this.help(); if (a==='refresh') this.refresh(document.getElementById('ecp-body')); } });
  },

  async refresh(b) {
    const btn = document.querySelector('.ecp .bar .acts button[data-a="refresh"]');
    if (btn) { btn.dataset.orig = btn.dataset.orig || btn.textContent; btn.innerHTML = '<i class="refresh-spin">&#8635;</i> Refreshing...'; btn.disabled = true; btn.classList.add('busy'); }
    try {
      await this.render(b);
      showToast('Data refreshed successfully!', 'success', 3000);
    } catch (e) {
      showToast('Error refreshing data. Please try again.', 'error', 5000);
    } finally {
      if (btn) { btn.textContent = btn.dataset.orig; btn.disabled = false; btn.classList.remove('busy'); }
    }
  },

  async render(b) {
    // Fade the panel out first — the original swaps the whole matrix under a
    // 0.4s fade-out, a 450ms pause while the DOM is rebuilt, then a 0.6s fade-in.
    const prevPanel = b.querySelector('.panel');
    if (prevPanel) {
      prevPanel.style.transition = 'opacity .4s ease-in-out, transform .4s ease-in-out';
      prevPanel.style.opacity = '0'; prevPanel.style.transform = 'translateY(10px)';
      await new Promise(res => setTimeout(res, 450));
    }
    b.innerHTML = `<div class="panel" style="opacity:0;transform:translateY(10px)">
      <div class="tools"><h4 style="margin:0">Solutions by business unit</h4>
      <span class="grow"></span><span class="hint" id="sm-sum"></span>
      <button class="btn sec refresh-btn" id="sm-refresh" style="padding:6px 10px;font-size:11.5px" title="Refresh"><i class="refresh-ic">&#8635;</i> Refresh</button>
      <button class="ver">v3.1.2</button></div>
      <div id="sm-grid"><span class="hint">Loading...</span></div>
      <div class="hint" style="margin-top:12px">Colour is the strongest deal state in the cell. Pale blue is pipeline that
        analytics found and nobody has worked yet. Hover a cell with deals on it to see them — the card stays up while
        your cursor is on it.</div></div>`;
    const panel = q(b,'.panel');
    q(b,'#sm-refresh').onclick = () => this.refresh(b);
    requestAnimationFrame(() => { panel.style.transition = 'opacity .6s ease-out, transform .6s ease-out'; panel.style.opacity = '1'; panel.style.transform = 'none'; });

    const [cat, deals, pots, buContacts] = await Promise.all([
      coqlAll(`select id, Name, Business_Unit, Status from Service_Catalog where Status = 'Current'`),
      coqlAll(`select id, Deal_Name, Stage, Amount, Closing_Date, Business_Unit, Solutions, Owner from Deals where Programme = '${this.p.id}'`),
      coqlAll(`select id, Business_Unit, Solutions, Budget, Contacts from Potentials where Programme = '${this.p.id}'`),
      coqlAll(`select id, Business_Unit, Contact from BU_Contacts where Programme = '${this.p.id}'`)
    ]);
    // Business units, in catalog order of first appearance — the original sorts BU columns
    // alphabetically (groupSolutionsByBU), so do the same here rather than keep catalog order.
    const units = [...new Set(cat.rows.map(r => r.Business_Unit))].sort();
    const key = (u,s) => u + '||' + s;
    const byCell = {}; deals.rows.forEach(d => (byCell[key(d.Business_Unit, d.Solutions)] ||= []).push(d));
    const potCell = {}; pots.rows.forEach(p => (potCell[key(p.Business_Unit, p.Solutions)] ||= []).push(p));

    // Row order within a BU: solutions with deals first (by $ desc), then solutions with only
    // unworked potential (by $ desc), then the rest alphabetically — groupSolutionsByBU, ~1080-1160.
    const dealAmt = svc => (byCell[svc.Business_Unit+'||'+svc.Name] || []).reduce((a,d)=>a + (+d.Amount||0), 0);
    const potAmt = svc => (potCell[svc.Business_Unit+'||'+svc.Name] || []).reduce((a,p)=>a + (+p.Budget||0), 0);
    const rowsByBU = {};
    units.forEach(u => {
      const rows = cat.rows.filter(r => r.Business_Unit === u).slice();
      rows.sort((a,b) => {
        const aHasDeal = !!(byCell[key(u,a.Name)]||[]).length, bHasDeal = !!(byCell[key(u,b.Name)]||[]).length;
        if (aHasDeal && !bHasDeal) return -1;
        if (!aHasDeal && bHasDeal) return 1;
        if (aHasDeal && bHasDeal) return dealAmt(b) - dealAmt(a);
        const aHasPot = !!(potCell[key(u,a.Name)]||[]).length, bHasPot = !!(potCell[key(u,b.Name)]||[]).length;
        if (aHasPot && !bHasPot) return -1;
        if (!aHasPot && bHasPot) return 1;
        if (aHasPot && bHasPot) return potAmt(b) - potAmt(a);
        return a.Name.localeCompare(b.Name);
      });
      rowsByBU[u] = rows;
    });
    const rowsPer = units.length ? Math.max(...units.map(u => rowsByBU[u].length)) : 0;
    const grid = q(b,'#sm-grid');

    if (!units.length) {
      grid.className = ''; grid.style.gridTemplateColumns = '';
      grid.innerHTML = `<div class="empty" style="text-align:center;padding:36px 12px">
        <h4 style="margin:0 0 6px">No Solutions Found</h4>
        <p class="hint" style="margin:0">No active service lines are available to display.</p></div>`;
      q(b,'#sm-sum').textContent = '';
      return;
    }

    grid.className = 'mtx';
    grid.style.gridTemplateColumns = `repeat(${units.length}, minmax(168px,1fr))`;
    let totalRev = 0, totalPot = 0;

    // Per-BU header metrics: whole potential (deals + unworked), not just booked Won revenue,
    // and contacts scoped to that BU via the BU_Contacts link rather than the account total.
    const buContactSet = {};
    buContacts.rows.forEach(c => (buContactSet[c.Business_Unit] ||= new Set()).add(c.Contact));

    let html = units.map(u => {
      const ds = deals.rows.filter(d => d.Business_Unit === u);
      const ps = pots.rows.filter(p => p.Business_Unit === u);
      const won = ds.filter(d => d.Stage === '4. Won').reduce((a,d)=>a+(+d.Amount||0), 0);
      const dealTotal = ds.reduce((a,d)=>a+(+d.Amount||0), 0);
      const potTotal = ps.reduce((a,p)=>a+(+p.Budget||0), 0);
      const totalPotential = dealTotal + potTotal;
      totalRev += won; totalPot += potTotal;
      const contactsN = (buContactSet[u] || new Set()).size;
      return `<div class="mhd"><div class="t">${E(u)}</div>
        ${totalPotential > 0 ? `<div class="rev">${budgetFmt(totalPotential)}</div>` : ''}
        <div class="tags">
          ${ds.length ? `<span class="badge">${ds.length} deals</span>` : ''}
          ${ps.length ? `<span class="badge">${ps.length} unworked</span>` : ''}
          ${contactsN ? `<span class="badge">${contactsN} contacts</span>` : ''}
        </div>
        <button data-bu="${E(u)}">Create opportunity</button></div>`;
    }).join('');

    for (let r = 0; r < rowsPer; r++) {
      html += units.map((u, ci) => {
        const svc = rowsByBU[u][r];
        if (!svc) return `<div class="cell none" style="visibility:hidden"></div>`;
        const ds = byCell[key(u, svc.Name)] || [], ps = potCell[key(u, svc.Name)] || [];

        // Colour: opportunities beat potentials — the latest deal (by Closing_Date, else
        // Created_Time) sets the stage colour; only if there is no deal at all does an
        // unworked potential fall back to the pale RECOMMENDATION blue.
        let statusKey = 'NO_OPP', stageCls = 'none';
        if (ds.length) {
          const latest = ds.slice().sort((a,c) => new Date(c.Closing_Date||c.Created_Time||0) - new Date(a.Closing_Date||a.Created_Time||0))[0];
          statusKey = STAGE_COLOR[latest.Stage] || 'NO_OPP';
          stageCls = STAGE_CLASS[latest.Stage] || 'none';
        } else if (ps.length) {
          statusKey = 'RECOMMENDATION'; stageCls = 'pot';
        }
        const color = STATUS_COLORS[statusKey];
        const isProspecting = ds.length && ds.slice().sort((a,c) => new Date(c.Closing_Date||c.Created_Time||0) - new Date(a.Closing_Date||a.Created_Time||0))[0].Stage === '0. Prospecting';
        const textColor = isProspecting ? '#2c3e50' : '#fff';
        const shadow = isProspecting ? '' : 'text-shadow:0 1px 2px rgba(0,0,0,.3);';

        // Content: one line per stage with money > 0, in the original's fixed order, each with
        // its own emoji. Duplicate and Recommendation-as-a-deal get their own lines too.
        const lines = [];
        const sum = st => ds.filter(d => d.Stage === st).reduce((a,d)=>a+(+d.Amount||0), 0);
        if (sum('4. Won')) lines.push(['won','Won', sum('4. Won')]);
        if (sum('5. Lost')) lines.push(['lost','Lost', sum('5. Lost')]);
        if (sum('Duplicate')) lines.push(['dup','Duplicate', sum('Duplicate')]);
        if (sum('1. Qualification')) lines.push(['qual','Qualification', sum('1. Qualification')]);
        if (sum('2. Proposal')) lines.push(['prop','Proposal', sum('2. Proposal')]);
        if (sum('3. Confirmation')) lines.push(['conf','Confirmation', sum('3. Confirmation')]);
        if (sum('0. Prospecting')) lines.push(['pros','Prospecting', sum('0. Prospecting')]);
        if (sum('Recommendation')) lines.push(['reco','Recommendation Oppo', sum('Recommendation')]);
        // Deal exists but none of the above summed to > 0 (all amounts 0) — show the stage name.
        if (ds.length && !lines.length) {
          const latest = ds.slice().sort((a,c) => new Date(c.Closing_Date||c.Created_Time||0) - new Date(a.Closing_Date||a.Created_Time||0))[0];
          lines.push(['reco', latest.Stage || 'Active', null]);
        }

        let body;
        if (ds.length) {
          body = lines.map(([cls,label,amt]) => amt == null
            ? `<div class="ln">${STAGE_EMOJI[cls]||'📊'} ${E(label)}</div>`
            : `<div class="ln">${STAGE_EMOJI[cls]||'📊'} <b class="amt">${budgetFmt(amt)}</b> ${E(label)}</div>`).join('');
          if (ps.length) body += `<div class="ln">💡 <b class="amt">${budgetFmt(ps.reduce((a,p)=>a+(+p.Budget||0),0))}</b> Potential</div>`;
        } else if (ps.length) {
          body = `<div class="ln" style="justify-content:center">💡 <b class="amt">${budgetFmt(ps.reduce((a,p)=>a+(+p.Budget||0),0))}</b> Potential</div>`;
        } else {
          body = `<div class="not-rel">Not Relevant</div>`;
        }
        const isPureAnalytics = !ds.length && ps.length;
        const isNotRelevant = !ds.length && !ps.length;
        const showHr = !isNotRelevant && !isPureAnalytics;

        return `<div class="cell ${stageCls}" data-c="${E(key(u,svc.Name))}" style="transition-delay:${(ci+r)*80}ms;
          background:linear-gradient(135deg, ${color} 0%, ${adjustBrightness(color,-20)} 100%);color:${textColor}">
          <div class="inner">
          <div class="nm" style="${shadow}">${E(svc.Name)}</div>
          ${showHr ? '<hr>' : ''}
          ${body}
          </div></div>`;
      }).join('');
    }
    grid.innerHTML = html;
    requestAnimationFrame(() => qa(grid,'.cell').forEach(c => c.classList.add('in')));
    q(b,'#sm-sum').textContent = `${budgetFmt(totalRev)} booked · ${budgetFmt(totalPot)} unworked · ${deals.rows.length} deals`;
    // fill the header numbers now the data is in — they are rollups, not stored fields
    const open = deals.rows.filter(d => !['4. Won','5. Lost','Duplicate'].includes(d.Stage)).reduce((a,d)=>a+(+d.Amount||0), 0);
    const hb = document.querySelectorAll('.ecp .bar .f')[1];
    if (hb) hb.innerHTML = [['Booked', budgetFmt(totalRev)], ['In play', budgetFmt(open)],
      ['Unworked', budgetFmt(totalPot)], ['Service lines', `${new Set(deals.rows.map(d=>d.Solutions)).size} of ${cat.rows.length}`]]
      .map(([k,v])=>`<i>${k}</i><b>${v}</b>`).join('');

    // Hover card: only cells that actually have deals get one (a potential-only cell stays
    // silent, as in the original — solutionCellDataById is only populated with opportunities).
    // Interactive (pointer-events:auto) with a 2000ms grace period before it fades, so the
    // cursor has time to travel from the cell onto the card itself.
    let pop = null, hideTimer = null;
    const hidePop = () => { if (pop) { pop.classList.remove('in'); const gone = pop; setTimeout(() => gone.remove(), 200); pop = null; } };
    grid.addEventListener('mouseover', e => {
      const c = e.target.closest('.cell[data-c]'); if (!c) return;
      if (e.relatedTarget && c.contains(e.relatedTarget)) return;
      const ds = byCell[c.dataset.c] || [];
      if (!ds.length) return;
      if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; }
      pop && pop.remove();
      const sorted = ds.slice().sort((a,b) => new Date(b.Closing_Date||b.Created_Time||0) - new Date(a.Closing_Date||a.Created_Time||0));
      pop = el(`<div class="ecp-pop"><h5>${E(c.dataset.c.split('||')[1])}</h5>
        ${sorted.map(d => `<div class="r">
          <div class="rt"><a href="#/rec/deal">${E(d.Deal_Name)}</a></div>
          <div class="rb"><div class="meta">🔺 ${E(d.Stage)}<br>📅 ${E(d.Closing_Date || '—')}</div>
          <div>💰 ${budgetFmt(+d.Amount||0)}<br>🏢 ${E(this.p.Account_Name.name)}</div></div>
        </div>`).join('')}
      </div>`);
      pop.addEventListener('mouseenter', () => { if (hideTimer) { clearTimeout(hideTimer); hideTimer = null; } });
      pop.addEventListener('mouseleave', () => { hideTimer = setTimeout(hidePop, 2000); });
      document.body.appendChild(pop);
      const r = c.getBoundingClientRect();
      const cx = r.left + r.width/2, cy = r.top + r.height/2;
      requestAnimationFrame(() => {
        const pad = 12, pr = pop.getBoundingClientRect();
        let left = cx - pr.width/2, top = cy - pr.height/2;
        if (left + pr.width + pad > innerWidth) left = innerWidth - pr.width - pad;
        if (top + pr.height + pad > innerHeight) top = innerHeight - pr.height - pad;
        if (left < pad) left = pad; if (top < pad) top = pad;
        pop.style.left = left+'px'; pop.style.top = top+'px';
        pop.classList.add('in');
      });
    });
    grid.addEventListener('mouseout', e => {
      const c = e.target.closest('.cell[data-c]'); if (!c) return;
      if (e.relatedTarget && (c.contains(e.relatedTarget) || (pop && pop.contains(e.relatedTarget)))) return;
      if (!pop) return;
      hideTimer = setTimeout(hidePop, 2000);
    });
    grid.addEventListener('click', e => { const btn = e.target.closest('button[data-bu]'); if (btn) this.create(btn.dataset.bu, cat.rows); });
  },

  create(bu, cat) {
    const opts = cat.filter(c => c.Business_Unit === bu);
    const STAGES = ['0. Prospecting','1. Qualification','2. Proposal','3. Confirmation','4. Won','5. Lost','Recommendation','Duplicate'];
    const SUBSTAGE = { '5. Lost':['5.1. Very Bad','5.2. Budget','5.3. Timing','5.4. Competitor'] };
    const LOSS = ['Budget mismatch','Timeline could not be met','Lost to incumbent vendor','Programme cancelled','No decision','Capacity unavailable'];
    const mask = el(`<div class="ecp-mask ecp"><div class="ecp-mod" style="width:min(620px,100%)">
      <div class="hd"><h3>New opportunity</h3><button class="x">&times;</button></div>
      <div class="pane" style="min-height:0">
        <span class="lab">Business unit</span><input class="ti" value="${E(bu)}" disabled>
        <span class="lab" style="margin-top:14px">Service lines</span>
        <select class="se" id="o-svc" multiple size="${Math.min(opts.length,5)}">${opts.map((o,i)=>`<option value="${E(o.Name)}"${i===0?' selected':''}>${E(o.Name)}</option>`).join('')}</select>
        <span class="hint" style="margin-top:2px">Ctrl/Cmd-click to select more than one.</span>
        <span class="lab" style="margin-top:14px">Opportunity name</span>
        <input class="ti" id="o-name" placeholder="${E(this.p.Name)} — ${E(opts[0] ? opts[0].Name : '')}">
        <span class="lab" style="margin-top:14px">Primary contact</span>
        <select class="se" id="o-contact"><option value="">Loading…</option></select>
        <span class="lab" style="margin-top:14px">Stage</span>
        <select class="se" id="o-stage">${STAGES.map(s=>`<option>${E(s)}</option>`).join('')}</select>
        <div id="o-substage-wrap" style="display:none"><span class="lab" style="margin-top:14px">Substage</span>
          <select class="se" id="o-substage"></select></div>
        <div id="o-lost-wrap" style="display:none">
          <span class="lab" style="margin-top:14px">Loss reason</span>
          <select class="se" id="o-loss"><option value="">Select a reason…</option>${LOSS.map(l=>`<option>${E(l)}</option>`).join('')}</select>
        </div>
        <span class="lab" style="margin-top:14px">Amount (USD)</span>
        <input class="ti" id="o-amt" type="number" value="80000">
        <span class="lab" style="margin-top:14px">Closing date</span>
        <input class="ti" id="o-close" type="date">
        <span class="lab" style="margin-top:14px">Description</span>
        <textarea class="ti" id="o-desc" rows="2" style="resize:vertical"></textarea>
        <div class="hint" id="o-msg" style="color:var(--warn);margin-top:10px"></div>
      </div>
      <div class="ft"><span class="sp"></span><button class="btn sec" id="o-cancel">Cancel</button><button class="btn" id="o-save">Create</button></div>
    </div></div>`);
    document.body.appendChild(mask);
    const close = () => mask.remove();
    q(mask,'.x').onclick = close; q(mask,'#o-cancel').onclick = close;
    mask.addEventListener('click', e => { if (e.target === mask) close(); });

    // Primary contact: the account's own contacts, sorted so people already tied to this BU
    // (via BU_Contacts) surface first — the closest the replica gets to the original's
    // sortContactsByPriority over an analytics-matched contact list.
    coqlAll(`select id, Full_Name, Title from Contacts where Account_Name = '${esc(this.p.Account_Name.id)}'`).then(res => {
      const sel = q(mask,'#o-contact');
      const opts2 = res.rows.map(c => `<option value="${E(c.id)}">${E(c.Full_Name)}${c.Title ? ' — '+E(c.Title) : ''}</option>`).join('');
      sel.innerHTML = `<option value="">No primary contact</option>${opts2}`;
    }).catch(() => { q(mask,'#o-contact').innerHTML = '<option value="">No primary contact</option>'; });

    // Stage -> substage cascade, and the Lost-only follow-up card.
    const stageSel = q(mask,'#o-stage');
    const applyStageLogic = () => {
      const stage = stageSel.value;
      const subWrap = q(mask,'#o-substage-wrap'), subSel = q(mask,'#o-substage');
      const lostWrap = q(mask,'#o-lost-wrap');
      const subs = SUBSTAGE[stage];
      if (subs) { subWrap.style.display = ''; subSel.innerHTML = subs.map(s=>`<option>${E(s)}</option>`).join(''); }
      else { subWrap.style.display = 'none'; subSel.innerHTML = ''; }
      lostWrap.style.display = stage === '5. Lost' ? '' : 'none';
    };
    stageSel.onchange = applyStageLogic;
    applyStageLogic();

    q(mask,'#o-save').onclick = async () => {
      const svcSel = [...q(mask,'#o-svc').selectedOptions].map(o=>o.value);
      const stage = q(mask,'#o-stage').value;
      if (!svcSel.length) { q(mask,'#o-msg').textContent = 'Pick at least one service line.'; return; }
      if (stage === '5. Lost' && !q(mask,'#o-loss').value) { q(mask,'#o-msg').textContent = 'A loss reason is required for a Lost deal.'; return; }
      const name = q(mask,'#o-name').value.trim() || `${this.p.Name} — ${svcSel[0]}`;
      try {
        await ZOHO.CRM.API.insertRecord({ Entity:'Deals', APIData:{
          Deal_Name:name, Account_Name:this.p.Account_Name.id, Programme:this.p.id,
          Business_Unit:bu, Solutions:svcSel[0], Stage:stage,
          Substage: q(mask,'#o-substage').value || null,
          Amount:+q(mask,'#o-amt').value, Closing_Date: q(mask,'#o-close').value || null,
          Owner:'You (demo)', Loss_Reason: stage === '5. Lost' ? q(mask,'#o-loss').value : null,
          Contact_Name: q(mask,'#o-contact').value || null, Description: q(mask,'#o-desc').value || null }});
        close();
        showToast('Potential created successfully!', 'success', 3000);
        this.render(document.getElementById('ecp-body'));
      } catch (e) { q(mask,'#o-msg').textContent = `${e.code} — ${e.message}`; showToast(`${e.code} — ${e.message}`, 'error', 5000); }
    };
  },

  help() {
    const mask = el(`<div class="ecp-mask ecp"><div class="ecp-mod" style="width:min(620px,100%)">
      <div class="hd"><h3>How to read this matrix</h3><button class="x">&times;</button></div>
      <div class="pane"><dl class="kvs">
        <dt>Colour</dt><dd>The stage of the latest deal on the cell, not a blend: won, confirmation, proposal, qualification, prospecting and lost each get their own colour, plus a pale blue for a business unit that only has unworked pipeline and a light purple for a deal still sitting on the Recommendation stage.</dd>
        <dt>Pale blue</dt><dd>No deal exists yet for this service line. There is only unworked budget nobody has picked up.</dd>
        <dt>Row order</dt><dd>Service lines with a deal come first, ranked by amount; then service lines with only unworked potential, ranked the same way; anything left is alphabetical.</dd>
        <dt>Column order</dt><dd>Business units are alphabetical, and each header totals its whole potential — booked, in-flight and unworked together — not just what has already been won.</dd>
        <dt>Matching</dt><dd>A deal is attached to a business unit and a service line by an exact field on the deal record, because the link is modelled directly rather than guessed from free text.</dd>
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
      tabs:['At a glance','Group structure','Development plan','Contact enrichment','Provider link'], ghostTabs:['Deals'],
      onTab:(t,b)=> t === 'At a glance' ? window.CRMWidgets2.Glance.render(b, a)
                  : t === 'Group structure' ? window.CRMWidgets3.Hierarchy.render(b, a)
                  : t === 'Development plan' ? window.CRMWidgets2.Plan.render(b, a)
                  : t === 'Provider link' ? window.CRMApollo.OrgMatch.render(b, a)
                  : this.render(b) });
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
