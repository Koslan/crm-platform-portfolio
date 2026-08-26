/* ------------------------------------------------------------------
   mockZoho — a stand-in for the CRM Embedded App SDK.
   Serves widget code from a generated dataset held in memory.
   Deliberately reproduces platform behaviour that widgets must cope
   with: 200-record paging, lookup fields returned as {id,name},
   picklist validation, mandatory-field rejection, and — behind the
   failure switch — latency, throttling, expired tokens and rejects.
------------------------------------------------------------------ */
(function (root) {
  'use strict';

  const LOOKUPS = {
    Contacts:{ Account_Name:'Accounts' },
    Programmes:{ Account_Name:'Accounts' },
    Deals:{ Account_Name:'Accounts', Programme:'Programmes' },
    Meetings:{ Account_Name:'Accounts', Campaign:'Campaigns', Deal:'Deals' },
    Event_Contacts:{ Account_Name:'Accounts', Campaign:'Campaigns', Origin_Contact:'Contacts' },
    Messages:{ Deal:'Deals' },
    Potentials:{ Programme:'Programmes' },
    Accounts:{ Main_Parent_Account:'Accounts' },
    Plan_Players:{ Account_Name:'Accounts', Contact:'Contacts' },
    Plan_Actions:{ Account_Name:'Accounts' },
    Service_Matrix:{ Account_Name:'Accounts' },
    Employment:{ Contact:'Contacts', Account_Name:'Accounts' },
    Agreements:{ Account_Name:'Accounts', Deal:'Deals' },
    Tasks:{ Account_Name:'Accounts', Deal:'Deals' },
    Portfolio_Requests:{ Account_Name:'Accounts' },
    Accounts_tree:{ Parent_Account:'Accounts' }
  };
  LOOKUPS.Accounts.Parent_Account = 'Accounts';
  const DISPLAY = { Accounts:'Account_Name', Contacts:'Full_Name', Deals:'Deal_Name',
    Programmes:'Name', Campaigns:'Name', Meetings:'Name', Service_Catalog:'Name',
    Event_Contacts:'id', Messages:'Thread_Topic', Users:'full_name', Potentials:'Solutions',
    Plan_Players:'Name', Plan_Actions:'Task', Service_Matrix:'Service', Employment:'Company',
    Agreements:'Name', Tasks:'Task', Portfolio_Requests:'Request' };
  const RELATED = {
    Accounts:{ Contacts:['Contacts','Account_Name'], Deals:['Deals','Account_Name'] },
    Campaigns:{ Event_Contacts:['Event_Contacts','Campaign'], Meetings:['Meetings','Campaign'] },
    Deals:{ Messages:['Messages','Deal'], Meetings:['Meetings','Deal'] },
    Contacts:{ Event_Contacts:['Event_Contacts','Origin_Contact'] },
    Programmes:{ Deals:['Deals','Programme'], Potentials:['Potentials','Programme'] },
    Contacts_more:{ Employment:['Employment','Contact'] }
  };
  RELATED.Accounts.Plan_Players = ['Plan_Players','Account_Name'];
  RELATED.Accounts.Plan_Actions = ['Plan_Actions','Account_Name'];
  RELATED.Accounts.Service_Matrix = ['Service_Matrix','Account_Name'];
  RELATED.Contacts.Employment = ['Employment','Contact'];
  const PICKLISTS = {
    Meetings:{ Meeting_Status:['Booked','Held','Declined'] },
    Event_Contacts:{ Attending_Status:['Investigating','Yes','No'],
      Meeting_Status:['Open','Contacted','Meeting booked','Meeting held','Meeting declined'],
      Priority:['P1','P2','P3'] },
    Deals:{ Stage:['0. Prospecting','1. Qualification','2. Proposal','3. Confirmation','4. Won','5. Lost'] },
    Plan_Players:{ Player_Role:['Sponsor','Strategic coach','Neutral','Anti-sponsor'] },
    Plan_Actions:{ Status:['Not started','In progress','Done','At risk'] },
    Employment:{ Status:['Current','Past'] }
  };
  const MANDATORY = { Meetings:['Name'], Accounts:['Account_Name'], Contacts:['Last_Name'] };
  const PAGE_MAX = 200;                      // the platform ceiling, reproduced on purpose

  /* ---------------- failure switch ---------------- */
  const chaos = { mode:'off', latency:0, seed:7 };
  const nextRand = () => (chaos.seed = (chaos.seed * 1103515245 + 12345) >>> 0) / 4294967296;
  function err(code, message, details){ const e = new Error(message); e.code = code; e.details = details || {}; return e; }
  async function gate(){
    const wait = chaos.latency || (chaos.mode === 'slow' ? 900 : 0);
    if (wait) await new Promise(r => setTimeout(r, wait + nextRand() * 250));
    if (chaos.mode === 'throttle' && nextRand() < 0.55) throw err('TOO_MANY_REQUESTS','Rate limit reached. Retry after 30 seconds.',{retry_after:30});
    if (chaos.mode === 'expired') throw err('INVALID_TOKEN','The access token has expired.',{});
    if (chaos.mode === 'reject' && nextRand() < 0.5) throw err('INTERNAL_ERROR','The request could not be completed.',{});
  }

  /* ---------------- store ---------------- */
  let DB = {}, ORIGINAL = null, index = {};
  function reindex(){
    index = {};
    for (const [mod, rows] of Object.entries(DB)) {
      if (!Array.isArray(rows)) continue;
      const m = new Map(); rows.forEach(r => m.set(String(r.id), r)); index[mod] = m;
    }
  }
  function load(data){ DB = JSON.parse(JSON.stringify(data)); ORIGINAL = JSON.stringify(data); reindex(); }
  function reset(){ if (ORIGINAL) { DB = JSON.parse(ORIGINAL); reindex(); } }
  const rows = mod => (Array.isArray(DB[mod]) ? DB[mod] : []);
  const nameOf = (mod, rec) => rec ? (rec[DISPLAY[mod]] ?? rec.Name ?? rec.id) : null;

  function hydrate(mod, rec){
    if (!rec) return null;
    const out = { ...rec };
    const map = LOOKUPS[mod] || {};
    for (const [field, target] of Object.entries(map)) {
      const v = rec[field];
      if (v == null) { out[field] = null; continue; }
      const t = index[target] && index[target].get(String(v));
      out[field] = t ? { id: String(v), name: nameOf(target, t) } : { id: String(v), name: null };
    }
    return out;
  }
  function resolvePath(mod, rec, path){
    const parts = String(path).split('.');
    if (parts.length === 1) return rec[parts[0]];
    const target = (LOOKUPS[mod] || {})[parts[0]];
    if (!target) return undefined;
    const t = index[target] && index[target].get(String(rec[parts[0]]));
    return t ? t[parts[1]] : null;
  }

  /* ---------------- COQL subset ---------------- */
  function tokenize(q){
    const re = /\s*("(?:[^"]|"")*"|'(?:[^']|'')*'|>=|<=|!=|[()=<>,]|[A-Za-z_][\w.]*|-?\d+(?:\.\d+)?|\*)/y;
    const out = []; let i = 0;
    while (i < q.length) {
      re.lastIndex = i; const m = re.exec(q);
      if (!m) { if (/^\s+$/.test(q.slice(i))) break; throw err('INVALID_QUERY','Cannot parse near: '+q.slice(i,i+24)); }
      out.push(m[1]); i = re.lastIndex;
    }
    return out;
  }
  const unq = s => (/^['"]/.test(s) ? s.slice(1,-1).replace(/''/g,"'").replace(/""/g,'"') : s);

  function parseCoql(q){
    const t = tokenize(q); let p = 0;
    const peek = () => t[p], take = () => t[p++];
    const kw = w => (t[p] || '').toLowerCase() === w;
    const expect = w => { if (!kw(w)) throw err('INVALID_QUERY','Expected "'+w+'"'); p++; };

    expect('select');
    const select = [];
    do { if (peek() === ',') p++; select.push(take()); } while (peek() === ',');
    expect('from');
    const module = take();
    let where = null, order = null, dir = 'asc', limit = PAGE_MAX, offset = 0;

    if (kw('where')) { p++; where = parseOr(); }
    if (kw('order')) { p++; expect('by'); order = take();
      if (kw('asc') || kw('desc')) dir = take().toLowerCase(); }
    if (kw('limit')) { p++; const a = Number(take());
      if (peek() === ',') { p++; offset = a; limit = Number(take()); } else limit = a; }
    if (kw('offset')) { p++; offset = Number(take()); }
    return { select, module, where, order, dir, limit: Math.min(limit, PAGE_MAX), offset };

    function parseOr(){ let l = parseAnd(); while (kw('or')) { p++; l = { op:'or', l, r:parseAnd() }; } return l; }
    function parseAnd(){ let l = parseTerm(); while (kw('and')) { p++; l = { op:'and', l, r:parseTerm() }; } return l; }
    function parseTerm(){
      if (peek() === '(') { p++; const e = parseOr(); if (peek() !== ')') throw err('INVALID_QUERY','Unbalanced parenthesis'); p++; return e; }
      const field = take();
      if (kw('is')) { p++; if (kw('not')) { p++; expect('null'); return { field, cmp:'notnull' }; } expect('null'); return { field, cmp:'null' }; }
      if (kw('in')) { p++; if (peek() !== '(') throw err('INVALID_QUERY','Expected "(" after IN'); p++;
        const vals = []; while (peek() !== ')') { if (peek() === ',') { p++; continue; } vals.push(unq(take())); }
        p++; return { field, cmp:'in', value:vals }; }
      if (kw('not')) { p++; expect('in'); p++;
        const vals = []; while (peek() !== ')') { if (peek() === ',') { p++; continue; } vals.push(unq(take())); }
        p++; return { field, cmp:'notin', value:vals }; }
      if (kw('like')) { p++; return { field, cmp:'like', value:unq(take()) }; }
      const op = take();
      if (!['=','!=','>','<','>=','<='].includes(op)) throw err('INVALID_QUERY','Unsupported operator "'+op+'"');
      return { field, cmp:op, value:unq(take()) };
    }
  }
  function evalWhere(node, mod, rec){
    if (!node) return true;
    if (node.op) return node.op === 'and'
      ? evalWhere(node.l, mod, rec) && evalWhere(node.r, mod, rec)
      : evalWhere(node.l, mod, rec) || evalWhere(node.r, mod, rec);
    const raw = resolvePath(mod, rec, node.field);
    const v = raw == null ? null : String(raw);
    switch (node.cmp) {
      case 'null': return raw == null || raw === '';
      case 'notnull': return !(raw == null || raw === '');
      case 'in': return v != null && node.value.includes(v);
      case 'notin': return v == null || !node.value.includes(v);
      case 'like': {
        if (v == null) return false;
        const rx = new RegExp('^' + node.value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/%/g,'.*').replace(/_/g,'.') + '$','i');
        return rx.test(v);
      }
      default: {
        const a = isFinite(raw) && raw !== null && raw !== '' ? Number(raw) : v;
        const b = isFinite(node.value) && node.value !== '' ? Number(node.value) : node.value;
        switch (node.cmp) {
          case '=':  return a == b;
          case '!=': return a != b;
          case '>':  return a > b;
          case '<':  return a < b;
          case '>=': return a >= b;
          case '<=': return a <= b;
        }
      }
    }
  }
  function runCoql(query){
    const q = parseCoql(query);
    if (!Array.isArray(DB[q.module])) throw err('INVALID_MODULE','No module named "'+q.module+'"');
    let list = rows(q.module).filter(r => evalWhere(q.where, q.module, r));
    const total = list.length;
    if (q.order) {
      const f = q.order, s = q.dir === 'desc' ? -1 : 1;
      list = list.slice().sort((a,b) => {
        const x = resolvePath(q.module,a,f), y = resolvePath(q.module,b,f);
        if (x == null && y == null) return 0; if (x == null) return 1; if (y == null) return -1;
        return (x > y ? 1 : x < y ? -1 : 0) * s;
      });
    }
    const page = list.slice(q.offset, q.offset + q.limit);
    const star = q.select.includes('*');
    const data = page.map(r => {
      if (star) return { ...r };
      const o = {};
      for (const f of q.select) o[f] = resolvePath(q.module, r, f) ?? null;
      if (!q.select.includes('id')) o.id = r.id;
      return o;
    });
    return { data, info:{ count:data.length, total, more_records: q.offset + data.length < total } };
  }

  /* ---------------- writes ---------------- */
  function validate(mod, payload, isCreate){
    for (const f of (MANDATORY[mod] || [])) {
      if (isCreate && (payload[f] == null || payload[f] === ''))
        throw err('MANDATORY_NOT_FOUND','Required field not found', { api_name:f });
    }
    for (const [f, allowed] of Object.entries(PICKLISTS[mod] || {})) {
      if (f in payload && payload[f] != null && payload[f] !== '' && !allowed.includes(payload[f]))
        throw err('INVALID_DATA','Value not part of the picklist', { api_name:f, expected:allowed });
      if (f in payload && payload[f] === '')
        throw err('INVALID_DATA','An empty value is not accepted for a picklist', { api_name:f });
    }
    for (const [k, v] of Object.entries(payload)) if (v === null && isCreate) delete payload[k];
  }
  let seq = 7300000000000;
  function insert(mod, payload){
    validate(mod, payload, true);
    const rec = { id:String(++seq), ...payload, Created_Time:new Date().toISOString().slice(0,10) };
    rows(mod).push(rec); index[mod] && index[mod].set(rec.id, rec);
    return { code:'SUCCESS', details:{ id:rec.id }, message:'record added' };
  }
  function update(mod, recId, payload){
    const rec = index[mod] && index[mod].get(String(recId));
    if (!rec) throw err('INVALID_DATA','No record with that id', { api_name:'id' });
    validate(mod, payload, false);
    Object.assign(rec, payload);
    return { code:'SUCCESS', details:{ id:rec.id }, message:'record updated' };
  }

  /* ---------------- server-side functions ---------------- */
  const FUNCTIONS = Object.create(null);
  function registerFunction(name, fn){ FUNCTIONS[name] = fn; }

  /* ---------------- SDK surface ---------------- */
  const listeners = {};
  const ZOHO = {
    embeddedApp:{
      on(evt, cb){ (listeners[evt] = listeners[evt] || []).push(cb); },
      init(){ const ctx = ZOHO.__context || {};
        setTimeout(() => (listeners.PageLoad || []).forEach(cb => cb(ctx)), 0);
        return Promise.resolve(); }
    },
    CRM:{
      CONFIG:{ getCurrentUser: async () => ({ users:[ { id:'1', full_name:'You (demo)', email:'demo@northbeam.example', role:{ name:'Sales Lead' } } ] }) },
      API:{
        async getRecord({ Entity, RecordID }){ await gate(); return { data:[ hydrate(Entity, index[Entity] && index[Entity].get(String(RecordID))) ].filter(Boolean) }; },
        async getAllRecords({ Entity, page = 1, per_page = PAGE_MAX }){
          await gate(); const pp = Math.min(per_page, PAGE_MAX); const all = rows(Entity);
          const slice = all.slice((page-1)*pp, page*pp);
          return { data:slice.map(r => hydrate(Entity, r)), info:{ count:slice.length, more_records: page*pp < all.length, page } };
        },
        async getRelatedRecords({ Entity, RecordID, RelatedList, page = 1, per_page = PAGE_MAX }){
          await gate();
          const def = (RELATED[Entity] || {})[RelatedList];
          if (!def) throw err('INVALID_MODULE','No related list "'+RelatedList+'" on '+Entity);
          const [mod, fk] = def; const pp = Math.min(per_page, PAGE_MAX);
          const all = rows(mod).filter(r => String(r[fk]) === String(RecordID));
          const slice = all.slice((page-1)*pp, page*pp);
          return { data:slice.map(r => hydrate(mod, r)), info:{ count:slice.length, more_records: page*pp < all.length } };
        },
        async searchRecord({ Entity, Type = 'criteria', Query }){
          await gate();
          const m = /^\(?\s*([\w.]+)\s*:\s*(\w+)\s*:\s*([\s\S]*?)\s*\)?$/.exec(String(Query));
          if (!m) throw err('INVALID_QUERY','criteria could not be parsed');
          const [, field, op, value] = m;
          const test = r => {
            const raw = resolvePath(Entity, r, field); const v = raw == null ? '' : String(raw).toLowerCase();
            const q = String(value).toLowerCase();
            if (op === 'equals') return v === q;
            if (op === 'starts_with') return v.startsWith(q);
            if (op === 'is_empty') return v === '';
            return v.includes(q);            // the platform has no contains; this is the emulator being generous
          };
          const all = rows(Entity).filter(test).slice(0, PAGE_MAX);
          return { data:all.map(r => hydrate(Entity, r)), info:{ count:all.length } };
        },
        async coql({ select_query }){ await gate(); return runCoql(select_query); },
        async insertRecord({ Entity, APIData }){ await gate(); return { data:[ insert(Entity, { ...APIData }) ] }; },
        async updateRecord({ Entity, RecordID, APIData }){ await gate(); return { data:[ update(Entity, RecordID, { ...APIData }) ] }; },
        async deleteRecord({ Entity, RecordID }){
          await gate(); const arr = rows(Entity); const i = arr.findIndex(r => String(r.id) === String(RecordID));
          if (i < 0) throw err('INVALID_DATA','No record with that id');
          arr.splice(i,1); index[Entity].delete(String(RecordID));
          return { data:[{ code:'SUCCESS', details:{ id:String(RecordID) } }] };
        }
      },
      FUNCTIONS:{
        async execute(name, args){
          await gate();
          const fn = FUNCTIONS[name];
          // The platform does not throw when a function is missing or unshared.
          // It answers with an envelope, which is exactly how widgets get fooled.
          if (!fn) return { code:'INVALID_DATA', details:{}, message:'function not found or not shared' };
          try { const out = await fn(args || {}, api); return { code:'success', details:{ output: typeof out === 'string' ? out : JSON.stringify(out) } }; }
          catch (e) { return { code:'ERROR', details:{}, message:String(e.message || e) }; }
        }
      },
      CONNECTION:{
        async invoke(connection, params){
          await gate();
          const fn = FUNCTIONS['connection:' + connection];
          if (!fn) return { details:{ statusMessage:null }, code:'failure', message:'connection "'+connection+'" is not authorised' };
          const body = await fn(params || {}, api);
          // Payload arrives buried in details.statusMessage, as it does on the platform.
          return { code:'success', details:{ statusMessage: body } };
        }
      },
      UI:{
        Resize({ height, width }){ if (root.frameElement && height) root.frameElement.style.height = String(height).replace('px','') + 'px'; return Promise.resolve(); },
        Record:{ open({ Entity, RecordID }){ root.dispatchEvent(new CustomEvent('mockzoho:open', { detail:{ Entity, RecordID } })); return Promise.resolve(); } },
        Popup:{ close(){ root.dispatchEvent(new CustomEvent('mockzoho:popup-close')); return Promise.resolve(); } }
      }
    }
  };

  const api = { db:() => DB, rows, index:() => index, coql:runCoql, insert, update, hydrate };
  const mockZoho = { load, reset, chaos, registerFunction, coql:runCoql, api,
    context(ctx){ ZOHO.__context = ctx; return mockZoho; },
    counts(){ return Object.fromEntries(Object.entries(DB).filter(([,v]) => Array.isArray(v)).map(([k,v]) => [k, v.length])); } };

  root.ZOHO = ZOHO; root.mockZoho = mockZoho;
  if (typeof module !== 'undefined' && module.exports) module.exports = { ZOHO, mockZoho };
})(typeof window !== 'undefined' ? window : globalThis);
