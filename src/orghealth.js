/* =============================================================
   Org health — what the extraction tooling produces when it is
   pointed at an org. Shown against a generated org, so the numbers
   prove the instrument without exposing anyone's configuration.
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa } = S;
const { hue } = window.CRMPages;

const CSS6 = `
.oh{--gap:14px;display:grid;gap:var(--gap)}
.oh .row{display:grid;gap:var(--gap);grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
.oh .card{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:15px 16px}
.oh .card h5{margin:0 0 3px;font:600 14px/1.3 "IBM Plex Serif",serif}
.oh .card .cap{font-size:12px;color:var(--ink-3);margin-bottom:12px}
.oh .big{font:600 30px/1 "IBM Plex Mono",monospace;font-variant-numeric:tabular-nums}
.oh .sub{font-size:12px;color:var(--ink-3);margin-top:4px}
.oh .stack{display:flex;height:26px;border-radius:5px;overflow:hidden;border:1px solid var(--line)}
.oh .stack i{display:block;height:100%}
.oh .keys{display:flex;flex-wrap:wrap;gap:10px 16px;margin-top:11px;font-size:12px}
.oh .keys span{display:flex;align-items:center;gap:6px;color:var(--ink-2);cursor:pointer;padding:2px 4px;border-radius:4px}
.oh .keys span:hover{background:var(--surface-2)}
.oh .keys span[aria-pressed="true"]{background:var(--accent-soft);color:var(--accent-ink)}
.oh .keys b{width:9px;height:9px;border-radius:2px;display:inline-block}
.oh .keys em{font-style:normal;font-family:"IBM Plex Mono",monospace;color:var(--ink-3)}
.oh .bars{display:grid;gap:7px}
.oh .bars .b{display:grid;grid-template-columns:130px 1fr 78px;gap:10px;align-items:center;font-size:12.5px}
.oh .bars .t{height:16px;border-radius:3px;background:var(--surface-2);overflow:hidden;position:relative}
.oh .bars .t i{position:absolute;left:0;top:0;bottom:0;background:var(--accent-soft)}
.oh .bars .t u{position:absolute;left:0;top:0;bottom:0;background:var(--ok);text-decoration:none}
.oh .bars .n{text-align:right;font-family:"IBM Plex Mono",monospace;font-variant-numeric:tabular-nums;color:var(--ink-2)}
.oh .matrix{width:100%;border-collapse:separate;border-spacing:2px;font-size:12px}
.oh .matrix th{font:500 10px/1.3 "IBM Plex Mono",monospace;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3);text-align:left;padding:2px 4px;font-weight:500}
.oh .matrix td{text-align:center;border-radius:4px;padding:6px 4px;font-family:"IBM Plex Mono",monospace;font-variant-numeric:tabular-nums;cursor:default}
.oh .matrix td.z{color:var(--ink-3);background:var(--surface-2)}
.oh .warn{border-left:3px solid var(--warn);background:var(--warn-bg);padding:12px 15px;border-radius:0 8px 8px 0;font-size:13.5px}
.oh .warn h5{margin:0 0 5px;font:600 13.5px/1.3 "IBM Plex Serif",serif}
.oh .graph{width:100%;height:230px;display:block}
.oh .graph text{font:400 9px/1 "IBM Plex Mono",monospace;fill:var(--ink-3)}
`;

const STATUS = {
  LIVE:                 ['#1c8a4d','reached by a rule, a button, a schedule or a widget'],
  ORPHAN_BUT_LIVE:      ['#c9a227','called only by another function — alive, but nothing starts it'],
  DORMANT:              ['#7b8b9a','wired up, last ran over a year ago'],
  EMPTY_STUB:           ['#b0c0cc','a signature and nothing else'],
  REALLY_DEAD:          ['#bf3a2b','no entry point on any of the five channels'],
  MISSING_FROM_SNAPSHOT:['#8a6fb0','visible in the interface, unreachable by the extraction']
};

const OrgHealth = {
  mount(host) {
    S.ensureCss();
    if (!document.getElementById('oh-css')) {
      const st = document.createElement('style'); st.id = 'oh-css'; st.textContent = CSS6; document.head.appendChild(st); }
    host.classList.add('ecp');
    const o = window.__DATA__.Org;
    this.o = o; this.only = null;
    const F = o.functions, R = o.rules, C = o.connections, X = o.calls;
    const cnt = s => F.filter(f => f.status === s).length;
    const total = F.length;
    const calls = X.reduce((a,c) => a + c.calls, 0), guarded = X.reduce((a,c) => a + c.guarded, 0);
    const brokenUsed = C.filter(c => !c.auth_ok && c.uses);
    const orphanConn = C.filter(c => !c.uses);
    const neverRan = R.filter(r => r.active && !r.last_executed);
    const stale = R.filter(r => r.active && r.last_executed && r.last_executed < '2025-08-01');
    const dupGroups = new Set(R.filter(r => r.duplicate_group).map(r => r.duplicate_group));
    const secrets = F.filter(f => f.hardcoded_secret).length;

    host.innerHTML = `<div class="oh">
      <div class="row">
        ${[[total, 'functions found', `${o.scanned.widgets} widgets and ${o.scanned.rules} rules scanned alongside`],
           [cnt('LIVE'), 'reachable', `${Math.round(cnt('LIVE')/total*100)}% of the estate`],
           [cnt('REALLY_DEAD') + cnt('EMPTY_STUB'), 'safe to delete', 'no entry point on any channel'],
           [`${Math.round(guarded/calls*100)}%`, 'external calls guarded', `${guarded.toLocaleString()} of ${calls.toLocaleString()} in a try/catch`]
          ].map(([b,l,s2]) => `<div class="card"><div class="big">${E(b)}</div>
            <div style="font-size:12.5px;font-weight:500;margin-top:2px">${E(l)}</div><div class="sub">${E(s2)}</div></div>`).join('')}
      </div>

      <div class="card">
        <h5>Where every function stands</h5>
        <div class="cap">Five entry channels were checked for each one: a workflow rule, a schedule, a custom button,
          a widget, and a call from another function. A function is only called dead when all five come back empty.</div>
        <div class="stack" id="oh-stack">${Object.keys(STATUS).map(k =>
          `<i data-s="${k}" title="${k}: ${cnt(k)}" style="width:${cnt(k)/total*100}%;background:${STATUS[k][0]}"></i>`).join('')}</div>
        <div class="keys" id="oh-keys">${Object.entries(STATUS).map(([k,[c,d]]) =>
          `<span data-s="${k}" aria-pressed="false" title="${E(d)}"><b style="background:${c}"></b>${E(k.replace(/_/g,' ').toLowerCase())} <em>${cnt(k)}</em></span>`).join('')}</div>
        <div id="oh-detail" style="margin-top:12px"></div>
      </div>

      <div class="row">
        <div class="card"><h5>By module and category</h5>
          <div class="cap">Click nothing — this is a heat map. Dark means many, and the empty cells are as
            informative as the full ones.</div>
          <div style="overflow-x:auto" id="oh-matrix"></div></div>
        <div class="card"><h5>Calls out, and how many are protected</h5>
          <div class="cap">The pale bar is every call to that service. The solid part is the share wrapped in error
            handling. A transient failure on an unguarded call takes the whole rule down with it.</div>
          <div class="bars" id="oh-calls"></div></div>
      </div>

      <div class="row">
        <div class="card"><h5>Connections</h5>
          <div class="cap">The platform stores whether a connection still authenticates, but does not connect that
            fact to the places using it, and will happily keep calling a broken one.</div>
          <div class="bars">
            <div class="b"><span>Defined</span><div class="t"><i style="width:100%"></i></div><span class="n">${C.length}</span></div>
            <div class="b"><span>Never used</span><div class="t"><i style="width:${orphanConn.length/C.length*100}%"></i></div><span class="n">${orphanConn.length}</span></div>
            <div class="b"><span>Broken, still called</span><div class="t"><u style="width:${brokenUsed.length/C.length*100}%;background:var(--crit)"></u></div><span class="n">${brokenUsed.length}</span></div>
          </div>
          ${brokenUsed.length ? `<div class="warn" style="margin-top:12px"><h5>${brokenUsed.reduce((a,c)=>a+c.uses,0)} call sites will fail at runtime</h5>
            ${brokenUsed.map(c=>`<div><b>${E(c.name)}</b> — ${c.uses} uses, authentication expired</div>`).join('')}</div>` : ''}
        </div>
        <div class="card"><h5>Rules that never fire</h5>
          <div class="cap">A rule can be marked active and have run precisely never. The platform does not check that
            a criterion still refers to a field that exists.</div>
          <div class="bars">
            <div class="b"><span>Active</span><div class="t"><i style="width:100%"></i></div><span class="n">${R.filter(r=>r.active).length}</span></div>
            <div class="b"><span>Never executed</span><div class="t"><u style="width:${neverRan.length/R.length*100}%;background:var(--crit)"></u></div><span class="n">${neverRan.length}</span></div>
            <div class="b"><span>Silent over a year</span><div class="t"><u style="width:${stale.length/R.length*100}%;background:var(--warn)"></u></div><span class="n">${stale.length}</span></div>
            <div class="b"><span>Duplicate criteria</span><div class="t"><u style="width:${dupGroups.size/R.length*100}%;background:var(--warn)"></u></div><span class="n">${dupGroups.size} groups</span></div>
          </div>
          <div class="cap" style="margin:12px 0 0">${secrets} functions carry a credential inline. There is no single
            place to rotate one, because the connection name has to be a literal.</div>
        </div>
      </div>

      <div class="card"><h5>Who calls whom</h5>
        <div class="cap">Functions grouped by module, sized by how many others call them. The cluster on the right is
          the shared layer — small, heavily depended on, and the reason nothing there can be deleted casually.</div>
        <svg class="graph" id="oh-graph" viewBox="0 0 900 230" preserveAspectRatio="xMidYMid meet"></svg></div>

      <div class="warn"><h5>Read this before trusting the numbers above</h5>
        One class of function is unreachable by this method: those bound to schedules live in a different identifier
        namespace, and matching them by display name succeeds for one in twenty-two. ${cnt('MISSING_FROM_SNAPSHOT')} functions
        are counted here as visible-but-unread. Anything called <i>only</i> from one of them is misclassified as dead
        on this page. The gap is stated rather than smoothed over, and three ways to close it are written up beside the
        report — an audit that names the limit of its own method is worth more than one that reads clean.</div>
    </div>`;

    this.drawMatrix(); this.drawCalls(); this.drawGraph();
    q(host,'#oh-keys').onclick = e => { const k = e.target.closest('[data-s]'); if (!k) return;
      this.only = this.only === k.dataset.s ? null : k.dataset.s;
      qa(host,'#oh-keys span').forEach(x => x.setAttribute('aria-pressed', String(this.only === x.dataset.s)));
      this.detail(); };
    q(host,'#oh-stack').onclick = e => { const i = e.target.closest('[data-s]'); if (!i) return;
      this.only = this.only === i.dataset.s ? null : i.dataset.s;
      qa(host,'#oh-keys span').forEach(x => x.setAttribute('aria-pressed', String(this.only === x.dataset.s)));
      this.detail(); };
  },

  detail() {
    const box = document.getElementById('oh-detail');
    if (!this.only) { box.innerHTML = ''; return; }
    const rows = this.o.functions.filter(f => f.status === this.only);
    box.innerHTML = `<div class="cap" style="margin-bottom:8px"><b>${E(this.only.replace(/_/g,' '))}</b> —
      ${E(STATUS[this.only][1])}. ${rows.length} functions.</div><div class="tw" style="max-height:300px"></div>`;
    S.dataTable(q(box,'.tw'), [
      { k:'n',  label:'Function', filter:'text', cls:'wrap', text:f=>f.api_name },
      { k:'c',  label:'Category', filter:'select', text:f=>f.category },
      { k:'m',  label:'Module', filter:'select', text:f=>f.module },
      { k:'l',  label:'Lines', filter:'min', text:f=>String(f.lines), sortVal:f=>f.lines },
      { k:'cb', label:'Called by', filter:'min', text:f=>String(f.called_by), sortVal:f=>f.called_by },
      { k:'e',  label:'Entry points', filter:'none',
        html:f=>[['workflow',f.entry_workflow],['button',f.entry_button],['widget',f.entry_widget],['schedule',f.entry_scheduler]]
          .filter(x=>x[1]).map(x=>`<span class="pill ghost">${x[0]}</span>`).join(' ') || '<span style="color:var(--ink-3)">none found</span>',
        text:f=>[f.entry_workflow&&'workflow',f.entry_button&&'button',f.entry_widget&&'widget',f.entry_scheduler&&'schedule'].filter(Boolean).join(' ') },
      { k:'t',  label:'Guarded', filter:'select', text:f=>f.has_try?'yes':'no',
        html:f=>f.has_try?'<span class="pill ok">yes</span>':'<span class="pill ghost">no</span>' },
      { k:'s',  label:'Inline secret', filter:'select', text:f=>f.hardcoded_secret?'yes':'no',
        html:f=>f.hardcoded_secret?'<span class="pill no">yes</span>':'<span style="color:var(--ink-3)">—</span>' },
      { k:'d',  label:'Last modified', filter:'text', text:f=>f.last_modified }
    ], rows, { cap:150, sort:'cb', dir:'desc' });
  },

  drawMatrix() {
    const F = this.o.functions;
    const mods = [...new Set(F.map(f => f.module))];
    const cats = [...new Set(F.map(f => f.category))];
    const cell = (m,c) => F.filter(f => f.module === m && f.category === c).length;
    const top = Math.max(...mods.flatMap(m => cats.map(c => cell(m,c))));
    document.getElementById('oh-matrix').innerHTML = `<table class="matrix">
      <thead><tr><th></th>${cats.map(c => `<th>${E(c)}</th>`).join('')}<th style="text-align:right">total</th></tr></thead>
      <tbody>${mods.map(m => `<tr><th>${E(m)}</th>${cats.map(c => { const v = cell(m,c);
        const a = v / top;
        return `<td class="${v ? '' : 'z'}" style="${v ? `background:color-mix(in srgb, var(--accent) ${Math.round(12+a*70)}%, var(--surface));color:${a>0.45?'#fff':'var(--ink)'}` : ''}">${v || '·'}</td>`;
      }).join('')}<td style="font-weight:600">${cats.reduce((a,c)=>a+cell(m,c),0)}</td></tr>`).join('')}</tbody></table>`;
  },

  drawCalls() {
    const X = this.o.calls.slice().sort((a,b) => b.calls - a.calls);
    const top = X[0].calls;
    document.getElementById('oh-calls').innerHTML = X.map(c => `<div class="b">
      <span>${E(c.service)}</span>
      <div class="t"><i style="width:${c.calls/top*100}%"></i><u style="width:${c.guarded/top*100}%"></u></div>
      <span class="n">${c.guarded}/${c.calls}</span></div>`).join('');
  },

  drawGraph() {
    const F = this.o.functions;
    const mods = [...new Set(F.map(f => f.module))];
    const svg = document.getElementById('oh-graph');
    const W = 900, H = 230, cx = W/2, cy = H/2;
    const R = 88;
    const nodes = mods.map((m,i) => { const a = (i/mods.length)*Math.PI*2 - Math.PI/2;
      const inbound = F.filter(f => f.module === m).reduce((s,f)=>s+f.called_by,0);
      return { m, x:cx + Math.cos(a)*R*2.6, y:cy + Math.sin(a)*R*0.78, n:F.filter(f=>f.module===m).length, inbound }; });
    const maxIn = Math.max(...nodes.map(n => n.inbound));
    const edges = [];
    nodes.forEach((a,i) => nodes.forEach((b,j) => { if (j <= i) return;
      const w = Math.round((a.inbound + b.inbound) / (maxIn*2) * 6);
      if (w > 1) edges.push({ a, b, w }); }));
    svg.innerHTML = edges.map(e => `<line x1="${e.a.x}" y1="${e.a.y}" x2="${e.b.x}" y2="${e.b.y}"
        stroke="var(--line-strong)" stroke-opacity=".5" stroke-width="${e.w/3}"/>`).join('')
      + nodes.map(n => { const r = 9 + (n.inbound/maxIn)*20;
        return `<g><circle cx="${n.x}" cy="${n.y}" r="${r}" fill="${hue(n.m)}" fill-opacity=".85"/>
          <text x="${n.x}" y="${n.y + r + 12}" text-anchor="middle">${E(n.m)} · ${n.n}</text></g>`; }).join('');
  }
};

window.OrgHealth = OrgHealth;
})();
