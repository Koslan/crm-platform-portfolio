/* =============================================================
   Agent journal — a CRM agent allowed to write, and the module that
   keeps it honest. Three parts: a command bar with six pre-recorded
   examples, a parse/validate/resolve panel that calls the emulator's
   own getFields rather than a hardcoded list, and a live Agent_Journal
   table with filters and an expandable before/after diff.

   Nothing here calls a real model. Recognition and intent-parsing are
   deterministic lookups keyed by the exact preset utterance, exactly as
   the rest of this site is: pre-recorded, and it says so on the screen.
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa, coqlAll } = S;

const CSS_AJ = `
.aj{--gap:14px;display:grid;gap:var(--gap)}
.aj .cmdrow{display:flex;gap:8px;margin-bottom:10px}
.aj .cmdrow input{flex:1;font:400 13.5px/1.3 "IBM Plex Sans",sans-serif;padding:10px 12px;border:1px solid var(--line);border-radius:6px;background:var(--surface);color:var(--ink)}
.aj .presets{display:flex;flex-wrap:wrap;gap:7px}
.aj .presets button{font:400 12px/1.3 "IBM Plex Sans",sans-serif;padding:7px 11px;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);cursor:pointer;text-align:left}
.aj .presets button:hover{border-color:var(--line-strong);color:var(--ink)}
.aj .presets button .tag{display:block;font:500 9.5px/1.4 "IBM Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);margin-top:2px}
.aj .parse{display:grid;gap:12px}
.aj .stepcard{background:var(--surface);border:1px solid var(--line);border-radius:9px;padding:13px 15px}
.aj .stepcard h5{margin:0 0 8px;font:600 13px/1.3 "IBM Plex Serif",serif;display:flex;align-items:center;gap:8px}
.aj .stepcard h5 .n{display:inline-flex;align-items:center;justify-content:center;width:19px;height:19px;border-radius:50%;background:var(--accent-soft);color:var(--accent-ink);font:600 11px/1 "IBM Plex Mono",monospace}
.aj .heard{font:400 14px/1.5 "IBM Plex Sans",sans-serif;padding:9px 11px;background:var(--surface-2);border-radius:6px}
.aj .heard mark{background:var(--warn-bg);color:var(--warn);border-radius:3px;padding:0 3px;font-weight:500}
.aj .intent{font:400 12px/1.6 "IBM Plex Mono",monospace;background:var(--surface-2);border-radius:6px;padding:9px 11px;white-space:pre-wrap;word-break:break-word}
.aj .vrow{display:flex;align-items:center;gap:8px;padding:6px 0;font-size:12.5px;border-bottom:1px solid var(--line)}
.aj .vrow:last-child{border-bottom:none}
.aj .vrow .k{font:500 10.5px/1 "IBM Plex Mono",monospace;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-3);min-width:110px}
.aj .vrow .ok{color:var(--ok)}
.aj .vrow .no{color:var(--crit)}
.aj .candidates{display:grid;gap:6px;margin-top:8px}
.aj .cand{display:flex;justify-content:space-between;align-items:center;padding:7px 10px;border:1px solid var(--line);border-radius:6px;font-size:12.5px}
.aj .cand.picked{border-color:var(--ok);background:var(--ok-bg)}
.aj .refusal{border-left:3px solid var(--crit);background:var(--crit-bg);padding:11px 14px;border-radius:0 7px 7px 0;font-size:13px;color:var(--crit)}
.aj .refusal b{display:block;margin-bottom:3px;font:600 13px/1.3 "IBM Plex Serif",serif}
.aj .waiting{border-left:3px solid var(--warn);background:var(--warn-bg);padding:12px 14px;border-radius:0 7px 7px 0}
.aj .waiting h5{margin:0 0 8px;font:600 13.5px/1.3 "IBM Plex Serif",serif;color:var(--warn)}
.aj .risklist{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0 10px}
.aj .risklist span{font:500 11px/1 "IBM Plex Mono",monospace;background:var(--surface);border:1px solid var(--warn);color:var(--warn);border-radius:4px;padding:4px 8px}
.aj .diff2{display:grid;grid-template-columns:130px 1fr 1fr;gap:0;border:1px solid var(--line);border-radius:8px;overflow:hidden;margin:10px 0}
.aj .diff2 > div{padding:8px 11px;border-bottom:1px solid var(--line);font-size:12.5px;min-width:0;overflow-wrap:anywhere}
.aj .diff2 > div:nth-child(-n+3){background:var(--surface-2);font:500 10px/1.4 "IBM Plex Mono",monospace;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-3)}
.aj .diff2 .k{font:500 10px/1.4 "IBM Plex Mono",monospace;letter-spacing:.05em;text-transform:uppercase;color:var(--ink-3);background:var(--surface-2)}
.aj .diff2 .before{color:var(--ink-2)}
.aj .diff2 .after.changed{background:var(--ok-bg);color:var(--ok);font-weight:500}
.aj .gaterow{display:flex;gap:10px;margin-top:10px}
.aj .gaterow button{font:500 13px/1 "IBM Plex Sans",sans-serif;padding:10px 16px;border-radius:6px;cursor:pointer}
.aj .gaterow .apply{background:var(--ok);border:1px solid var(--ok);color:#fff}
.aj .gaterow .refuse{background:var(--surface);border:1px solid var(--crit);color:var(--crit)}
.aj .gaterow button[disabled]{opacity:.5;cursor:default}
.aj .applied{border-left:3px solid var(--ok);background:var(--ok-bg);padding:11px 14px;border-radius:0 7px 7px 0;font-size:13px;color:var(--ok)}
.aj .jrow-diff{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:10px 12px;background:var(--surface-2)}
.aj .jrow-diff .col h6{margin:0 0 6px;font:500 10px/1.3 "IBM Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3)}
.aj .jrow-diff .f{display:flex;justify-content:space-between;gap:8px;font-size:12px;padding:3px 0}
.aj .jrow-diff .f.hi{background:var(--warn-bg);border-radius:4px;padding:3px 6px;margin:0 -6px}
.aj .jrow-diff .f .fk{color:var(--ink-3)}
.aj tr.expand-row td{padding:0;border-top:none}
.aj tr.expandable{cursor:pointer}
.aj tr.expandable:hover{background:var(--surface-2)}
`;

function css(){ if (!document.getElementById('aj-css')) {
  const st = document.createElement('style'); st.id = 'aj-css'; st.textContent = CSS_AJ; document.head.appendChild(st); } }

/* ---------- domain dictionary: what recognition mangles, and what it should read ----------
   Mixed technical vocabulary and company names are exactly where ASR breaks — the
   corrections below are what a domain vocabulary buys, applied to the six presets. */
const DICTIONARY = [
  [/\bem\s*see\s*ef\b/i, 'EMC'], [/\bee\s*em\s*see\b/i, 'EMC'],
  [/\bcee\s*em\s*eff\b/i, 'CMF'], [/\bsee\s*em\s*eff\b/i, 'CMF'],
  [/\bo\s*t\s*a\b/i, 'OTA'], [/\boh\s*tee\s*ay\b/i, 'OTA'],
  [/\bn\s*p\s*s\b/i, 'NPS'],
  [/\blarks?purr?\b/i, 'Larkspur'], [/\bvantij\b/i, 'Vantage'],
  [/\borillya\b/i, 'Orillia'], [/\bveero\b/i, 'Vireo'],
];

/* ---------- the six presets ----------
   Each carries the raw (mangled) utterance a speech engine would actually produce,
   the module/record it targets, and how resolution/validation must come out. The
   corrected utterance is what the domain dictionary above turns the raw text into —
   diffed against the raw text for the highlight in step 1. */
function buildPresets(D){
  const stageDeal = D.Deals.find(d => d.Stage !== '4. Won' && d.Stage !== '5. Lost') || D.Deals[0];
  const stageAcc = D.Accounts.find(a => a.id === stageDeal.Account_Name);
  const recapMeeting = D.Meetings.find(m => !m.Recap) || D.Meetings[0];
  const ambiUtt = D.Agent_Journal.find(j => j.Refusal_Reason === 'multiple candidates');
  const missingUtt = D.Agent_Journal.find(j => j.Refusal_Reason === 'field does not exist');
  const badPickUtt = D.Agent_Journal.find(j => j.Refusal_Reason === 'value outside picklist');
  const riskDeal = D.Deals.find(d => d.id !== stageDeal.id) || D.Deals[1];
  const riskAcc = D.Accounts.find(a => a.id === riskDeal.Account_Name);
  const newOwner = (D.Users.find(u => u.full_name !== riskDeal.Owner) || D.Users[0]).full_name;

  return [
    { tag:'stage change', raw:`move ${stageAcc.Account_Name} to won, the seeree em see prescan quote is signed`,
      module:'Deals', recordId: stageDeal.id, field:'Stage', value:'4. Won',
      candidates:[{ id:stageDeal.id, label:stageDeal.Deal_Name }] },
    { tag:'meeting recap', raw:`add recap to the ${recapMeeting.Meeting_Type.toLowerCase()} meeting, walked through the oh tee ay and diagnostics scope, client wants a fixed date`,
      module:'Meetings', recordId: recapMeeting.id, field:'Recap',
      value:'Walked through the OTA and diagnostics scope; client wants a fixed date before signing.',
      candidates:[{ id:recapMeeting.id, label:recapMeeting.Name }] },
    { tag:'ambiguous', raw: ambiUtt.Utterance, module:'Deals', field:'Stage', value:'4. Won',
      candidates: (D.Accounts.filter(a => a.Account_Name.startsWith(ambiUtt.Utterance.split(' ')[1]))
        .flatMap(a => D.Deals.filter(d => d.Account_Name === a.id).slice(0,1))
        .map(d => ({ id:d.id, label:d.Deal_Name }))) },
    { tag:'field missing', raw: missingUtt.Utterance, module: missingUtt.Target_Module,
      recordId: missingUtt.Target_Record, field: JSON.parse(missingUtt.Intent_JSON).fields
        && Object.keys(JSON.parse(missingUtt.Intent_JSON).fields)[0], value:'High',
      candidates:[{ id: missingUtt.Target_Record, label: missingUtt.Target_Record }] },
    { tag:'high risk', raw:`reassign ${riskAcc.Account_Name} to ${newOwner}`,
      module:'Deals', recordId: riskDeal.id, field:'Owner', value:newOwner,
      candidates:[{ id:riskDeal.id, label:riskDeal.Deal_Name }] },
    { tag:'bad value', raw: badPickUtt.Utterance, module:'Deals',
      recordId: badPickUtt.Target_Record, field:'Stage',
      value: JSON.parse(badPickUtt.Intent_JSON).fields.Stage,
      candidates:[{ id: badPickUtt.Target_Record, label: badPickUtt.Target_Record }] }
  ];
}

function correct(raw){
  let out = raw, marks = [];
  DICTIONARY.forEach(([rx, fix]) => {
    if (rx.test(out)) { marks.push(fix); out = out.replace(rx, fix); }
  });
  return { text: out, corrected: marks };
}

function highlightHeard(raw, corrected){
  // Show the corrected text with the swapped-in terms marked, so the win from the
  // domain dictionary is visible rather than asserted.
  let html = E(corrected.text);
  new Set(corrected.corrected).forEach(term => {
    html = html.replace(new RegExp('\\b'+term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\b'), `<mark>${E(term)}</mark>`);
  });
  return html;
}

const AgentJournal = {
  mount(host) {
    css();
    S.ensureCss();
    host.classList.add('ecp','aj');
    this.host = host;
    const D = window.__DATA__ || null;
    this.rows = null;
    host.innerHTML = `
      <div class="panel">
        <h4 style="margin:0 0 4px">Try a command</h4>
        <p class="hint" style="margin:0 0 10px">Recognition, intent parsing and resolution here are pre-recorded —
          exactly like the rest of this site (see <a href="#/p/site">How this site works</a>). Six examples are wired
          to the six outcomes the journal below can produce.</p>
        <div class="cmdrow"><input id="aj-in" placeholder="Pick a preset below, or edit one and press Run" readonly>
          <button class="btn" id="aj-run" disabled>Run</button></div>
        <div class="presets" id="aj-presets"></div>
      </div>
      <div class="parse" id="aj-parse"></div>
      <div class="panel">
        <div class="tools"><h4 style="margin:0">Agent_Journal</h4><span class="grow"></span>
          <span class="hint" id="aj-jn"></span></div>
        <div class="tw" id="aj-tw"></div>
      </div>`;

    this.presets = buildPresets(D);
    q(host,'#aj-presets').innerHTML = this.presets.map((p,i) =>
      `<button data-i="${i}">${E(p.raw)}<span class="tag">${E(p.tag)}</span></button>`).join('');
    q(host,'#aj-presets').onclick = e => {
      const b = e.target.closest('button[data-i]'); if (!b) return;
      this.runPreset(+b.dataset.i);
    };

    this.loadJournal();
  },

  async loadJournal(refresh){
    const { rows } = await coqlAll(`select id, When, Channel, Utterance, Intent_JSON, Target_Module, Target_Record,
      Before_JSON, After_JSON, Result, Refusal_Reason, Risk from Agent_Journal order by When desc limit 200`);
    this.rows = rows;
    this.drawJournal();
    if (refresh) q(this.host,'#aj-jn').textContent = `${rows.length} rows · just updated`;
  },

  runPreset(i){
    const p = this.presets[i];
    q(this.host,'#aj-in').value = p.raw;
    this.render(p);
  },

  async render(p){
    const host = this.host;
    const corrected = correct(p.raw);
    const intent = { module:p.module, record: p.candidates.length===1 ? p.candidates[0].id : null,
      fields: { [p.field]: p.value }, operation:'update' };

    // step 3: validate against the live field list — a real call, not a hardcoded array
    const fieldsResp = await ZOHO.CRM.API.getFields({ Entity: p.module });
    const known = (fieldsResp.fields || []).find(f => f.api_name === p.field);

    let html = `<div class="stepcard"><h5><span class="n">1</span>Recognition</h5>
      <div class="heard">${highlightHeard(p.raw, corrected)}</div>
      ${corrected.corrected.length ? `<p class="hint" style="margin:8px 0 0">Domain vocabulary corrected: ${
        [...new Set(corrected.corrected)].map(E).join(', ')}</p>` : ''}</div>`;

    html += `<div class="stepcard"><h5><span class="n">2</span>Parsed intent</h5>
      <div class="intent">${E(JSON.stringify(intent, null, 1))}</div></div>`;

    html += `<div class="stepcard"><h5><span class="n">3</span>Validation against live fields</h5>
      <div class="vrow"><span class="k">Module</span><span>${E(p.module)}</span></div>
      <div class="vrow"><span class="k">Field</span><span>${E(p.field)}</span>
        <span class="${known ? 'ok' : 'no'}">${known ? '✓ exists on '+E(p.module) : '✗ not found on '+E(p.module)}</span></div>`;
    if (known && known.pick_list_values) {
      const inList = known.pick_list_values.includes(p.value);
      html += `<div class="vrow"><span class="k">Value</span><span>${E(String(p.value))}</span>
        <span class="${inList ? 'ok' : 'no'}">${inList ? '✓ in picklist' : '✗ not in picklist: '+known.pick_list_values.map(E).join(', ')}</span></div>`;
    }
    html += `</div>`;

    if (!known) {
      html += `<div class="refusal"><b>Refused — field does not exist</b>
        "${E(p.field)}" is not a field on ${E(p.module)} in the live field list. Nothing is written.</div>`;
      q(host,'#aj-parse').innerHTML = html;
      return this.afterRender(p, { refused:'field does not exist' });
    }
    if (known.pick_list_values && !known.pick_list_values.includes(p.value)) {
      html += `<div class="refusal"><b>Refused — value outside picklist</b>
        "${E(String(p.value))}" is not one of the allowed values for ${E(p.field)}. Nothing is written.</div>`;
      q(host,'#aj-parse').innerHTML = html;
      return this.afterRender(p, { refused:'value outside picklist' });
    }

    // step 4: resolve the record
    html += `<div class="stepcard"><h5><span class="n">4</span>Record resolution</h5>`;
    if (p.candidates.length === 0) {
      html += `<div class="hint">No candidate found.</div></div>`;
      html += `<div class="refusal"><b>Refused — nothing to resolve</b>No record matched. Nothing is written.</div>`;
      q(host,'#aj-parse').innerHTML = html;
      return this.afterRender(p, { refused:'no candidate' });
    }
    if (p.candidates.length > 1) {
      html += `<p class="hint" style="margin:0 0 4px">Several records match. The rule: one match proceeds, several ask.</p>
        <div class="candidates">${p.candidates.map(c => `<div class="cand"><span>${E(c.label)}</span><span class="hint">${E(c.id)}</span></div>`).join('')}</div>
        </div>`;
      html += `<div class="refusal"><b>Refused — multiple candidates</b>
        ${p.candidates.length} records match. The agent asks rather than guesses. Nothing is written.</div>`;
      q(host,'#aj-parse').innerHTML = html;
      return this.afterRender(p, { refused:'multiple candidates' });
    }
    const target = p.candidates[0];
    html += `<div class="candidates"><div class="cand picked"><span>${E(target.label)}</span><span class="hint">one match — proceeding</span></div></div></div>`;

    // step 5: fetch the current record for the before value, and the risk gate
    const rec = (await ZOHO.CRM.API.getRecord({ Entity:p.module, RecordID:target.id })).data[0] || {};
    const before = rec[p.field];
    const HIGH_RISK = ['Stage','Amount','Cooperation_Status','Owner','Account_Sales'];
    const isHighRisk = HIGH_RISK.includes(p.field);

    if (isHighRisk) {
      html += `<div class="waiting"><h5>Risk threshold — human approval required</h5>
        <p class="hint" style="margin:0 0 4px">High-risk fields are a fixed list, not a judgement the model makes:</p>
        <div class="risklist">${HIGH_RISK.map(f => `<span>${E(f)}</span>`).join('')}</div>
        <div class="diff2"><div>Field</div><div>Before</div><div>After</div>
          <div class="k">${E(p.field)}</div><div class="before">${E(String(before ?? '—'))}</div>
          <div class="after changed">${E(String(p.value))}</div></div>
        <div class="gaterow">
          <button class="apply" id="aj-apply">Apply</button>
          <button class="refuse" id="aj-refuse">Refuse</button>
        </div>
        <div id="aj-gate-result" style="margin-top:10px"></div>
      </div>`;
      q(host,'#aj-parse').innerHTML = html;
      q(host,'#aj-apply').onclick = () => this.commit(p, target, before, 'applied');
      q(host,'#aj-refuse').onclick = () => this.commit(p, target, before, 'refused', 'declined by reviewer');
      return;
    }

    // low risk: applies straight through
    html += `<div class="stepcard"><h5><span class="n">5</span>Write</h5>
      <div class="diff2"><div>Field</div><div>Before</div><div>After</div>
        <div class="k">${E(p.field)}</div><div class="before">${E(String(before ?? '—'))}</div>
        <div class="after changed">${E(String(p.value))}</div></div></div>`;
    q(host,'#aj-parse').innerHTML = html;
    await this.commit(p, target, before, 'applied', null, true);
  },

  async commit(p, target, before, result, refusalReason, silent){
    const host = this.host;
    if (result === 'applied') {
      try {
        await ZOHO.CRM.API.updateRecord({ Entity:p.module, RecordID:target.id, APIData:{ [p.field]: p.value } });
      } catch (e) {
        result = 'failed';
      }
    }
    await ZOHO.CRM.API.insertRecord({ Entity:'Agent_Journal', APIData:{
      When: new Date().toISOString().slice(0,16).replace('T',' '),
      Channel: 'chat', Utterance: q(host,'#aj-in').value || p.raw,
      Intent_JSON: JSON.stringify({ module:p.module, record:target.id, fields:{ [p.field]:p.value }, operation:'update' }),
      Target_Module: p.module, Target_Record: target.id,
      Before_JSON: JSON.stringify({ [p.field]: before ?? null }),
      After_JSON: result === 'applied' ? JSON.stringify({ [p.field]: p.value }) : null,
      Result: result, Refusal_Reason: refusalReason || null,
      Risk: ['Stage','Amount','Cooperation_Status','Owner','Account_Sales'].includes(p.field) ? 'high' : 'low'
    }});
    if (!silent) {
      const box = q(host,'#aj-gate-result');
      if (box) box.innerHTML = result === 'applied'
        ? `<div class="applied"><b>Applied.</b> The write went through and a row was added to the journal below.</div>`
        : `<div class="refusal"><b>Refused.</b> Nothing was written; the refusal is recorded in the journal below.</div>`;
    }
    this.loadJournal(true);
  },

  afterRender(p, outcome){
    // record refusals that never reached the write step, so the journal reflects
    // every command run from the bar, not only the ones that got as far as a diff.
    ZOHO.CRM.API.insertRecord({ Entity:'Agent_Journal', APIData:{
      When: new Date().toISOString().slice(0,16).replace('T',' '),
      Channel:'chat', Utterance: q(this.host,'#aj-in').value || p.raw,
      Intent_JSON: JSON.stringify({ module:p.module, record:null, fields:{ [p.field]:p.value }, operation:'update' }),
      Target_Module: p.module, Target_Record: null,
      Before_JSON: null, After_JSON: null,
      Result:'refused', Refusal_Reason: outcome.refused,
      Risk: ['Stage','Amount','Cooperation_Status','Owner','Account_Sales'].includes(p.field) ? 'high' : 'low'
    }}).then(() => this.loadJournal(true));
  },

  drawJournal(){
    const host = this.host;
    q(host,'#aj-jn').textContent = `${this.rows.length} rows`;
    const badge = r => ({ applied:'<span class="pill ok">applied</span>',
      refused:'<span class="pill no">refused</span>',
      'awaiting-approval':'<span class="pill info">awaiting approval</span>',
      failed:'<span class="pill ghost">failed</span>' }[r] || r);
    const riskBadge = r => r === 'high' ? '<span class="pill no">high</span>' : '<span class="pill ghost">low</span>';

    S.dataTable(q(host,'#aj-tw'), [
      { k:'w',  label:'When', filter:'text', text:r=>r.When },
      { k:'ch', label:'Channel', filter:'select', text:r=>r.Channel },
      { k:'u',  label:'Utterance', filter:'text', cls:'wrap', text:r=>r.Utterance },
      { k:'m',  label:'Module', filter:'select', text:r=>r.Target_Module },
      { k:'res',label:'Result', filter:'select', text:r=>r.Result, html:r=>badge(r.Result) },
      { k:'rr', label:'Refusal reason', filter:'select', text:r=>r.Refusal_Reason||'', cls:'wrap' },
      { k:'rk', label:'Risk', filter:'select', text:r=>r.Risk, html:r=>riskBadge(r.Risk) }
    ], this.rows, { cap:200, onDraw:() => this.wireExpand() });

    this.wireExpand();
  },

  wireExpand(){
    const host = this.host;
    const table = q(host,'#aj-tw table.d'); if (!table) return;
    const tbody = q(table,'tbody');
    qa(tbody,'tr').forEach((tr,i) => {
      if (tr.querySelector('.none')) return;
      tr.classList.add('expandable');
      tr.onclick = () => this.toggleDiff(tr, i);
    });
  },

  toggleDiff(tr, visibleIndex){
    const next = tr.nextElementSibling;
    if (next && next.classList.contains('expand-row')) { next.remove(); return; }
    // Find the row by its rendered utterance text, since dataTable re-slices on every draw.
    const utt = tr.children[2] && tr.children[2].textContent;
    const row = this.rows.find(r => r.Utterance === utt) || this.rows[visibleIndex];
    if (!row) return;
    let before = {}, after = {};
    try { before = JSON.parse(row.Before_JSON || '{}') || {}; } catch(_) {}
    try { after = JSON.parse(row.After_JSON || '{}') || {}; } catch(_) {}
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])];
    const colHtml = (obj, other) => keys.length
      ? keys.map(k => `<div class="f ${obj[k]!==other[k] ? 'hi':''}"><span class="fk">${E(k)}</span><span>${E(String(obj[k] ?? '—'))}</span></div>`).join('')
      : '<div class="hint">Nothing written.</div>';
    const tdCount = tr.children.length;
    const expand = el(`<tr class="expand-row"><td colspan="${tdCount}"><div class="jrow-diff">
      <div class="col"><h6>Before</h6>${colHtml(before, after)}</div>
      <div class="col"><h6>After</h6>${colHtml(after, before)}</div>
    </div></td></tr>`);
    tr.after(expand);
  }
};

window.AgentJournal = AgentJournal;
})();
