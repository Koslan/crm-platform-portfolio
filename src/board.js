/* =============================================================
   Room schedule (desktop tab) and the mobile meeting board.
   Both sit on one lane-layout engine and one alert engine:
     clash  — a person in two overlapping meetings
     travel — a person moving between places with under 15 minutes
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa, coqlAll, pad2, dmy, parseDT, hhmm, esc, DOW } = S;
const { hue, ini, money } = window.CRMPages;

const CSS4 = `
.ecp .sched{position:relative;display:grid;border:1px solid var(--b);border-radius:9px;overflow:hidden;background:var(--surface)}
.ecp .sched .gutter{border-right:1px solid var(--b);background:var(--surface-2)}
.ecp .sched .rh{position:sticky;top:0;z-index:3;background:var(--surface);border-bottom:1px solid var(--b);padding:9px 11px;font:500 12px/1.3 "IBM Plex Sans",sans-serif;display:flex;align-items:center;gap:7px}
.ecp .sched .rh i{width:8px;height:8px;border-radius:50%;flex:0 0 8px;font-style:normal}
.ecp .sched .rh small{color:var(--ink-3);font-weight:400;font-size:11px}
.ecp .sched .colbody{position:relative;border-right:1px solid var(--b)}
.ecp .sched .hr{position:absolute;left:0;right:0;border-top:1px solid var(--b)}
.ecp .sched .hr.q{border-top-style:dotted;opacity:.5}
.ecp .sched .tick{position:absolute;right:8px;transform:translateY(-50%);font:400 10.5px/1 "IBM Plex Mono",monospace;color:var(--ink-3);font-variant-numeric:tabular-nums}
.ecp .blk{position:absolute;border-radius:6px;padding:5px 7px;overflow:hidden;color:#fff;cursor:pointer;
  opacity:0;transform:translateY(6px) scale(.985);transition:opacity .3s ease,transform .3s ease,box-shadow .16s ease}
.ecp .blk.in{opacity:1;transform:none}
.ecp .blk:hover{box-shadow:0 6px 18px -6px rgba(0,0,0,.5);z-index:4}
.ecp .blk .bt{font:600 10.5px/1.25 "IBM Plex Mono",monospace;opacity:.85}
.ecp .blk .ba{font:500 11.5px/1.3 "IBM Plex Sans",sans-serif;margin-top:1px;overflow:hidden;text-overflow:ellipsis}
.ecp .blk .bf{position:absolute;right:5px;bottom:4px;font-size:10.5px;letter-spacing:1px}
.ecp .blk.declined{opacity:.5;text-decoration:line-through}
.ecp .now{position:absolute;left:0;right:0;height:0;border-top:2px solid var(--crit);z-index:5;pointer-events:none}
.ecp .now::before{content:'';position:absolute;left:-5px;top:-5px;width:8px;height:8px;border-radius:50%;background:var(--crit);animation:ecpp 2.2s ease-in-out infinite}
@keyframes ecpp{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--crit) 55%,transparent)}50%{box-shadow:0 0 0 7px transparent}}
.ecp .alert{display:inline-flex;gap:5px;align-items:center;border-radius:999px;padding:3px 10px;font-size:11.5px;cursor:pointer;border:1px solid transparent}
.ecp .alert.clash{background:var(--crit-bg);color:var(--crit);border-color:color-mix(in srgb,var(--crit) 30%,transparent)}
.ecp .alert.travel{background:var(--warn-bg);color:var(--warn);border-color:color-mix(in srgb,var(--warn) 30%,transparent)}
.ecp .alert[aria-pressed="true"]{outline:2px solid currentColor;outline-offset:1px}
.ecp .load-card{display:flex;flex-direction:column;gap:6px;padding:10px}

/* ---- phone ---- */
.phone{width:390px;max-width:100%;margin:0 auto;border-radius:34px;border:9px solid #191f1c;background:var(--surface);
  box-shadow:0 30px 70px -26px rgba(0,0,0,.55);overflow:hidden;position:relative;height:760px;display:flex;flex-direction:column}
:root[data-theme="dark"] .phone,:root:not([data-theme="light"]) .phone{border-color:#0a0e0c}
.phone .notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:120px;height:22px;background:#191f1c;border-radius:0 0 13px 13px;z-index:20}
.eb{flex:1;display:flex;flex-direction:column;min-height:0;font-size:15px}
.eb .hd{padding:26px 14px 10px;border-bottom:1px solid var(--b)}
.eb .hd h4{margin:0;font:600 16px/1.25 "IBM Plex Serif",serif}
.eb .hd .sub{font-size:12px;color:var(--ink-3);margin-top:2px;display:flex;gap:8px;align-items:center}
.eb .hd .vr{font:400 10px/1 "IBM Plex Mono",monospace;color:var(--ink-3);border:1px solid var(--b);border-radius:4px;padding:3px 5px;cursor:pointer}
.eb .pills{display:flex;gap:6px;flex-wrap:wrap;margin-top:9px}
.eb .pl{border:1px solid var(--b);border-radius:999px;padding:5px 10px;font-size:12px;background:var(--surface);color:var(--ink-2);cursor:pointer;min-height:30px}
.eb .pl b{font-family:"IBM Plex Mono",monospace;color:var(--ink)}
.eb .pl[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.eb .pl[aria-pressed="true"] b{color:#fff}
.eb .days{display:flex;gap:6px;overflow-x:auto;padding:9px 14px;border-bottom:1px solid var(--b);scrollbar-width:none}
.eb .days::-webkit-scrollbar{display:none}
.eb .day{flex:0 0 auto;min-width:54px;min-height:46px;border:1px solid var(--b);border-radius:9px;padding:5px 9px;text-align:center;cursor:pointer;background:var(--surface)}
.eb .day b{display:block;font:600 14px/1.2 "IBM Plex Mono",monospace}
.eb .day span{font-size:10.5px;color:var(--ink-3)}
.eb .day[aria-pressed="true"]{background:var(--accent);border-color:var(--accent);color:#fff}
.eb .day[aria-pressed="true"] span{color:rgba(255,255,255,.8)}
.eb .tabs2{display:flex;border-bottom:1px solid var(--b)}
.eb .tabs2 button{flex:1;min-height:44px;background:none;border:0;border-bottom:2px solid transparent;font:500 13.5px/1 "IBM Plex Sans",sans-serif;color:var(--ink-3);cursor:pointer}
.eb .tabs2 button[aria-pressed="true"]{color:var(--accent);border-bottom-color:var(--accent)}
.eb .scroll{flex:1;overflow:auto;-webkit-overflow-scrolling:touch}
.eb .card{border:1px solid var(--b);border-radius:11px;margin:9px 12px;padding:11px 12px;background:var(--surface);cursor:pointer;position:relative;overflow:hidden}
.eb .card:active{background:var(--surface-2)}
.eb .card .rail{position:absolute;left:0;top:0;bottom:0;width:4px}
.eb .card .code{font:600 11px/1 "IBM Plex Mono",monospace;color:var(--ink-3)}
.eb .card .ttl{font-weight:600;font-size:14px;margin:3px 0 2px}
.eb .card .mt{font-size:12px;color:var(--ink-3)}
.eb .card .tags{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}
.eb .person{display:flex;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--b);cursor:pointer}
.eb .bar2{height:5px;border-radius:3px;background:var(--surface-2);overflow:hidden;margin-top:5px}
.eb .bar2 i{display:block;height:100%;background:var(--accent)}
.eb .grp{font:500 10px/1 "IBM Plex Mono",monospace;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-3);padding:12px 12px 5px}
.eb .fab{position:absolute;right:16px;bottom:16px;z-index:15;border:0;border-radius:999px;padding:14px 18px;background:var(--accent);color:#fff;font:600 14px/1 "IBM Plex Sans",sans-serif;box-shadow:0 10px 24px -8px rgba(0,0,0,.5);cursor:pointer}
/* a backdrop at opacity 0 still swallows taps — it has to leave the hit-test entirely */
.eb .mask{position:absolute;inset:0;background:rgba(10,16,14,.45);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .24s ease,visibility 0s linear .24s;z-index:16}
.eb .mask.on{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .24s ease,visibility 0s}
.eb .sheet{position:absolute;visibility:hidden;left:0;right:0;bottom:0;max-height:82%;background:var(--surface);border-radius:16px 16px 0 0;z-index:17;
  transform:translateY(100%);transition:transform .3s cubic-bezier(.22,.7,.3,1),visibility 0s linear .3s;display:flex;flex-direction:column;box-shadow:0 -12px 34px -14px rgba(0,0,0,.5)}
.eb .sheet.on{transform:none;visibility:visible;transition:transform .3s cubic-bezier(.22,.7,.3,1),visibility 0s}
.eb .sheet .grab{width:38px;height:4px;border-radius:2px;background:var(--line-strong);margin:9px auto 4px}
.eb .sheet .shd{padding:4px 14px 10px;border-bottom:1px solid var(--b);display:flex;align-items:flex-start;gap:10px}
.eb .sheet .sbody{overflow:auto;padding:12px 14px 22px}
.eb .tile{border:1px solid var(--b);border-radius:9px;padding:8px 10px;text-align:center}
.eb .tile b{display:block;font:600 13px/1.3 "IBM Plex Mono",monospace}
.eb .tile span{font-size:10px;color:var(--ink-3);text-transform:uppercase;letter-spacing:.05em}
.eb .row4{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.eb .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.eb .lab2{font:500 10px/1 "IBM Plex Mono",monospace;letter-spacing:.11em;text-transform:uppercase;color:var(--ink-3);margin:14px 0 6px;display:block}
.eb .btn2{min-height:44px;border-radius:9px;border:1px solid var(--accent);background:var(--accent);color:#fff;font:600 14px/1 "IBM Plex Sans",sans-serif;width:100%;cursor:pointer}
.eb .btn2.sec{background:var(--surface);color:var(--ink-2);border-color:var(--b)}
.eb .console{position:absolute;inset:0;background:var(--surface);z-index:30;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .26s ease}
.eb .console.on{transform:none}
.eb .console .lg{flex:1;overflow:auto;padding:10px 12px;font:400 10.5px/1.6 "IBM Plex Mono",monospace;color:var(--ink-2);white-space:pre-wrap}
.eb .console .lg .e{color:var(--crit)}
.eb .empty{text-align:center;color:var(--ink-3);font-size:13px;padding:40px 24px}
.eb input.f2,.eb textarea.f2{width:100%;font-size:16px;border:1px solid var(--b);border-radius:9px;padding:11px;background:var(--surface);color:var(--ink);min-height:44px}
`;

/* ---------- shared engines ---------- */
function toItems(rows) {
  return rows.map(r => {
    const p = parseDT(r.Meeting_DateTime_String);
    if (!p) return null;
    return { r, day:p.day, from:p.min, to:p.min + (+r.Meeting_Duration || 30),
      place: r.Meeting_Room || r.Spot || null,
      who: String(r.Attendees_String || '').split(',').map(x => x.trim()).filter(Boolean) };
  }).filter(Boolean);
}
/* greedy lanes inside each overlapping cluster */
function lanes(items) {
  const sorted = items.slice().sort((a,b) => a.from - b.from || a.to - b.to);
  const out = []; let cluster = [], end = -1;
  const flush = () => {
    if (!cluster.length) return;
    const ends = [];
    cluster.forEach(it => {
      let l = ends.findIndex(e => e <= it.from);
      if (l < 0) { l = ends.length; ends.push(it.to); } else ends[l] = it.to;
      it.lane = l;
    });
    cluster.forEach(it => { it.lanes = ends.length; out.push(it); });
    cluster = [];
  };
  sorted.forEach(it => { if (it.from >= end && cluster.length) flush(); cluster.push(it); end = Math.max(end, it.to); });
  flush();
  return out;
}
function alerts(items) {
  const clash = new Set(), travel = new Set(), people = {};
  items.forEach(it => it.who.forEach(w => (people[w] ||= []).push(it)));
  Object.values(people).forEach(list => {
    const s = list.slice().sort((a,b) => a.from - b.from);
    for (let i = 0; i < s.length; i++) {
      for (let j = i + 1; j < s.length && s[j].from < s[i].to; j++) { clash.add(s[i].r.id); clash.add(s[j].r.id); }
      const n = s[i + 1];
      if (n && n.place && s[i].place && n.place !== s[i].place && n.from - s[i].to < 15 && n.from >= s[i].to)
        { travel.add(s[i].r.id); travel.add(n.r.id); }
    }
  });
  return { clash, travel };
}
const STATE_CLS = r => r.Meeting_Status === 'Declined' ? 'declined' : '';
const blockColour = r => hue((r.Meeting_Room || r.Spot || 'unplaced') + '');

/* ---------- desktop: room schedule ---------- */
const Schedule = {
  async render(b, P) {
    if (!document.getElementById('ecp-css4')) {
      const st = document.createElement('style'); st.id = 'ecp-css4'; st.textContent = CSS4; document.head.appendChild(st);
    }
    this.P = P; this.day = dmy(P.days[0]); this.only = null;
    b.innerHTML = `<div class="panel">
      <div class="tools"><h4 style="margin:0 12px 0 0">Room schedule</h4>
        <span class="cnt"><b id="v-n">—</b>meetings</span>
        <span class="alert clash" id="v-clash" aria-pressed="false">&#9888; <b id="v-c">0</b> clash</span>
        <span class="alert travel" id="v-travel" aria-pressed="false">&#128665; <b id="v-t">0</b> travel</span>
        <span class="grow"></span>
        <label style="font-size:12.5px;display:flex;gap:6px;align-items:center">
          <input type="checkbox" id="v-dec" checked> show declined</label>
        <button class="ver">v2.4.1</button></div>
      <div class="tools" id="v-days">${P.days.map(d=>`<button class="chip2" data-d="${dmy(d)}" aria-pressed="${dmy(d)===this.day}">${pad2(d.getDate())}.${pad2(d.getMonth()+1)} <span style="opacity:.6">${DOW[d.getDay()]}</span></button>`).join('')}</div>
      <div id="v-grid"><div class="load-card">${Array.from({length:8},()=>'<div class="sk" style="height:16px"></div>').join('')}</div></div>
      <div class="hint" style="margin-top:10px">Height is duration. Meetings that overlap split the column into lanes rather than
        hiding behind each other. The red line is a demo clock parked mid-afternoon so it is visible — a real one follows the campaign's zone,
        not your device's.</div></div>`;
    q(b,'#v-days').onclick = e => { const x = e.target.closest('button[data-d]'); if (!x) return;
      this.day = x.dataset.d; qa(b,'#v-days button').forEach(y=>y.setAttribute('aria-pressed', String(y===x))); this.draw(b); };
    q(b,'#v-dec').onchange = () => this.draw(b);
    ['clash','travel'].forEach(k => q(b,'#v-'+k).onclick = () => {
      this.only = this.only === k ? null : k;
      ['clash','travel'].forEach(j => q(b,'#v-'+j).setAttribute('aria-pressed', String(this.only === j)));
      this.draw(b); });

    const { rows } = await coqlAll(
      `select id, Name, Meeting_DateTime_String, Meeting_Duration, Meeting_Room, Spot, Meeting_Status,
       Meeting_Type, Recap, Attendees_String, Account_Name.Account_Name from Meetings where Campaign = '${P.c.id}'`);
    this.rows = rows;
    this.draw(b);
  },

  draw(b) {
    const P = this.P, rooms = P.c.rooms.map(r => r.name).concat(['No room']);
    const showDeclined = q(b,'#v-dec').checked;
    const all = toItems(this.rows).filter(i => i.day === this.day);
    const A = alerts(all);
    let items = all.filter(i => showDeclined || i.r.Meeting_Status !== 'Declined');
    if (this.only) items = items.filter(i => A[this.only].has(i.r.id));
    q(b,'#v-n').textContent = items.length;
    q(b,'#v-c').textContent = new Set([...A.clash]).size;
    q(b,'#v-t').textContent = new Set([...A.travel]).size;

    const open = 8*60, close = 19*60, PPM = 1.15, H = (close-open)*PPM;
    const grid = q(b,'#v-grid');
    grid.className = 'sched';
    grid.style.gridTemplateColumns = `58px repeat(${rooms.length}, minmax(130px,1fr))`;
    grid.innerHTML = `<div class="rh gutter" style="border-right:1px solid var(--b)"></div>`
      + rooms.map(rn => { const rd = P.c.rooms.find(x => x.name === rn);
        return `<div class="rh"><i style="background:${hue(rn)}"></i>${E(rn)}${rd ? `<small>${E(rd.from)}–${E(rd.to)}</small>` : ''}</div>`; }).join('')
      + `<div class="gutter" style="position:relative;height:${H}px">
          ${Array.from({length: (close-open)/60 + 1},(_,i)=>`<div class="tick" style="top:${i*60*PPM}px">${pad2(8+i)}:00</div>`).join('')}</div>`
      + rooms.map(rn => `<div class="colbody" data-r="${E(rn)}" style="height:${H}px">
          ${Array.from({length:(close-open)/15},(_,i)=>`<div class="hr ${i%4?'q':''}" style="top:${i*15*PPM}px"></div>`).join('')}
        </div>`).join('');

    // demo clock, parked so the line is on screen
    const nowMin = 13*60 + 20;
    qa(grid,'.colbody').forEach(c => c.insertAdjacentHTML('beforeend',
      `<div class="now" style="top:${(nowMin-open)*PPM}px"></div>`));

    rooms.forEach(rn => {
      const col = q(grid, `.colbody[data-r="${CSS.escape(rn)}"]`);
      const mine = items.filter(i => (i.r.Meeting_Room || 'No room') === rn);
      lanes(mine).forEach((it, n) => {
        const top = (it.from - open) * PPM, hgt = Math.max(22, (it.to - it.from) * PPM - 2);
        const w = 100 / it.lanes, left = it.lane * w;
        const marks = (A.clash.has(it.r.id) ? '&#9888;' : '') + (A.travel.has(it.r.id) ? '&#128665;' : '') + (it.r.Recap ? '&#128221;' : '');
        col.insertAdjacentHTML('beforeend', `<div class="blk ${STATE_CLS(it.r)}" data-id="${it.r.id}"
          style="top:${top}px;height:${hgt}px;left:calc(${left}% + 3px);width:calc(${w}% - 6px);background:${blockColour(it.r)};transition-delay:${Math.min(n*45,420)}ms">
          <div class="bt">${hhmm(it.from)}–${hhmm(it.to)}</div>
          <div class="ba">${E(it.r['Account_Name.Account_Name'])}</div>
          ${marks ? `<div class="bf">${marks}</div>` : ''}</div>`);
      });
    });
    requestAnimationFrame(() => qa(grid,'.blk').forEach(x => x.classList.add('in')));
    grid.onclick = e => { const blk = e.target.closest('.blk[data-id]'); if (!blk) return;
      const r = this.rows.find(x => x.id === blk.dataset.id);
      const it = all.find(x => x.r.id === blk.dataset.id);
      alert(`${r['Account_Name.Account_Name']}\n${r.Meeting_DateTime_String} · ${r.Meeting_Duration} min\n`
        + `${r.Meeting_Room || r.Spot || 'no place set'}\n${r.Attendees_String}`
        + (A.clash.has(r.id) ? '\n\n⚠ someone here is double-booked' : '')
        + (A.travel.has(r.id) ? '\n🚕 under 15 minutes to move between places' : '')); };
  }
};

/* ---------- mobile board ---------- */
const Board = {
  async mount(host, campaignId) {
    S.ensureCss();
    if (!document.getElementById('ecp-css4')) {
      const st = document.createElement('style'); st.id = 'ecp-css4'; st.textContent = CSS4; document.head.appendChild(st);
    }
    this.log = [];
    const c = (await ZOHO.CRM.API.getRecord({ Entity:'Campaigns', RecordID:campaignId })).data[0];
    this.c = c;
    const days = []; for (let d = new Date(c.Start), e = new Date(c.End); d <= e; d.setDate(d.getDate()+1)) days.push(new Date(d));
    this.days = days; this.day = dmy(days[0]); this.tab = 'Rooms'; this.only = null;

    host.innerHTML = `<div class="phone"><div class="notch"></div><div class="eb">
      <div class="hd"><h4>${E(c.Name)}</h4>
        <div class="sub">${E(c.Start)} – ${E(c.End)} · ${c.rooms.length} rooms
          <span class="grow" style="flex:1"></span><span class="vr" id="b-ver">v0.0.9 log</span></div>
        <div class="pills" id="b-pills"></div></div>
      <div class="days" id="b-days">${days.map(d=>`<button class="day" data-d="${dmy(d)}" aria-pressed="${dmy(d)===this.day}">
        <b>${pad2(d.getDate())}</b><span>${DOW[d.getDay()]}</span></button>`).join('')}</div>
      <div class="tabs2" id="b-tabs">${['Rooms','Team','Meetings'].map(t=>`<button data-t="${t}" aria-pressed="${t===this.tab}">${t}</button>`).join('')}</div>
      <div class="scroll" id="b-body"></div>
      <button class="fab" id="b-add">＋ Add meeting</button>
      <div class="mask" id="b-mask"></div>
      <div class="sheet" id="b-sheet"></div>
      <div class="console" id="b-console"><div class="hd" style="padding:26px 12px 10px;display:flex;gap:8px;align-items:center">
        <b style="font:600 13px/1 'IBM Plex Serif',serif">On-screen log</b><span style="flex:1"></span>
        <button class="chip2" id="b-copy">Copy</button><button class="chip2" id="b-clear">Clear</button><button class="chip2" id="b-close">Close</button></div>
        <div class="lg" id="b-log"></div></div>
    </div></div>`;
    this.host = host;
    const eb = q(host,'.eb');
    q(eb,'#b-days').onclick = e => { const x = e.target.closest('[data-d]'); if (!x) return;
      this.day = x.dataset.d; qa(eb,'#b-days .day').forEach(y=>y.setAttribute('aria-pressed', String(y===x))); this.draw(); };
    q(eb,'#b-tabs').onclick = e => { const x = e.target.closest('[data-t]'); if (!x) return;
      this.tab = x.dataset.t; qa(eb,'#b-tabs button').forEach(y=>y.setAttribute('aria-pressed', String(y===x))); this.draw(); };
    q(eb,'#b-ver').onclick = () => q(eb,'#b-console').classList.add('on');
    q(eb,'#b-close').onclick = () => q(eb,'#b-console').classList.remove('on');
    q(eb,'#b-clear').onclick = () => { this.log = []; q(eb,'#b-log').textContent = ''; };
    q(eb,'#b-copy').onclick = () => { navigator.clipboard && navigator.clipboard.writeText(this.log.join('\n')); q(eb,'#b-copy').textContent = 'Copied'; setTimeout(()=>q(eb,'#b-copy').textContent='Copy',1200); };
    q(eb,'#b-mask').onclick = () => this.closeSheet();
    q(eb,'#b-add').onclick = () => this.say('wizard', 'the booking wizard lives on the desktop record page in this demo');

    // the phone has no devtools, so everything unexpected goes to the on-screen log
    addEventListener('error', e => this.say('error', e.message, true));
    addEventListener('unhandledrejection', e => this.say('rejection', String(e.reason), true));

    this.say('boot', `campaign ${c.Name}`);
    const t0 = performance.now();
    const { rows } = await coqlAll(
      `select id, Name, Meeting_DateTime_String, Meeting_Duration, Meeting_Room, Spot, Meeting_Status, Meeting_Type,
       Recap, Attendees_String, Account_Name.Account_Name, Account_Name.Cooperation_Status, Account_Name.Country,
       Account_Name.Total_Revenue, Account_Name.Revenue_Last_12M
       from Meetings where Campaign = '${c.id}'`);
    this.rows = rows;
    this.say('coql', `${rows.length} meetings in ${Math.ceil(rows.length/200)} page(s), ${Math.round(performance.now()-t0)} ms`);
    this.draw();
  },

  say(kind, text, bad) {
    this.log.unshift(`${new Date().toISOString().slice(11,19)}  ${kind}  ${text}`);
    const l = this.host && q(this.host,'#b-log');
    if (l) l.innerHTML = this.log.slice(0,400).map(x => `<div class="${bad?'e':''}">${E(x)}</div>`).join('');
  },

  today() { return toItems(this.rows || []).filter(i => i.day === this.day); },

  draw() {
    const eb = q(this.host,'.eb'), all = this.today(), A = alerts(all);
    const team = new Set(all.flatMap(i => i.who));
    q(eb,'#b-pills').innerHTML = [
      ['n', `<b>${all.length}</b> meetings`, false],
      ['team', `<b>${team.size}</b>/${this.c.attendees.length} team`, false],
      ['clash', `&#9888; <b>${new Set([...A.clash]).size}</b> clash`, true],
      ['travel', `&#128665; <b>${new Set([...A.travel]).size}</b> travel`, true]
    ].map(([k,l,act]) => `<button class="pl" ${act?`data-k="${k}"`:''} aria-pressed="${this.only===k}">${l}</button>`).join('');
    q(eb,'#b-pills').onclick = e => { const x = e.target.closest('button[data-k]'); if (!x) return;
      this.only = this.only === x.dataset.k ? null : x.dataset.k;
      this.say('filter', this.only ? 'only ' + this.only : 'filter cleared'); this.draw(); };

    let items = all;
    if (this.only) items = items.filter(i => A[this.only].has(i.r.id));
    const body = q(eb,'#b-body');

    if (!items.length) {
      body.innerHTML = `<div class="empty">${all.length
        ? 'Nothing on this day matches that filter.<br><button class="chip2" id="b-cl" style="margin-top:10px">Clear filter</button>'
        : 'No meetings on this day yet.'}</div>`;
      const cl = q(body,'#b-cl'); if (cl) cl.onclick = () => { this.only = null; this.draw(); };
      return;
    }

    if (this.tab === 'Meetings') {
      body.innerHTML = items.sort((a,b)=>a.from-b.from).map((it,n) => this.card(it, A, n)).join('');
    } else if (this.tab === 'Team') {
      const per = {}; items.forEach(i => i.who.forEach(w => (per[w] ||= []).push(i)));
      const byFn = {};
      this.c.attendees.forEach(a => (byFn[a.Functions] ||= []).push(a));
      body.innerHTML = Object.entries(byFn).map(([fn, list]) => `<div class="grp">${E(fn)}</div>`
        + list.map(a => { const mine = per[a.Name1] || [];
          const load = Math.min(100, Math.round(mine.reduce((s,i)=>s+(i.to-i.from),0) / (8*60) * 100));
          return `<div class="person" data-who="${E(a.Name1)}">
            <span class="av" style="background:${hue(a.Name1)}">${ini(a.Name1)}</span>
            <div style="flex:1;min-width:0"><div style="font-size:13.5px;font-weight:500">${E(a.Name1)}</div>
              <div style="font-size:11.5px;color:var(--ink-3);overflow:hidden;text-overflow:ellipsis">${E(a.Position)}</div>
              <div class="bar2"><i style="width:${load}%"></i></div></div>
            <div style="text-align:right"><div style="font:600 12px/1 'IBM Plex Mono',monospace">${mine.length} mtg</div>
              ${mine.some(i=>A.clash.has(i.r.id)) ? '<span class="pill no" style="margin-top:4px">clash</span>' : ''}
              ${a.Speaker==='yes' ? '<span class="pill info" style="margin-top:4px">speaker</span>' : ''}</div></div>`; }).join('')).join('');
    } else {
      const rooms = [...new Set(items.map(i => i.r.Meeting_Room || 'No room'))];
      body.innerHTML = rooms.map(rn => `<div class="grp"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${hue(rn)};margin-right:6px"></span>${E(rn)}</div>`
        + lanes(items.filter(i => (i.r.Meeting_Room || 'No room') === rn)).sort((a,b)=>a.from-b.from)
          .map((it,n) => this.card(it, A, n, it.lanes > 1)).join('')).join('');
    }
    requestAnimationFrame(() => qa(body,'.card').forEach(c => c.style.opacity = 1));
    body.onclick = e => { const c = e.target.closest('.card[data-id]'); if (c) this.sheet(c.dataset.id); };
  },

  card(it, A, n, overlapping) {
    const r = it.r;
    return `<div class="card" data-id="${r.id}" style="opacity:0;transition:opacity .26s ease ${Math.min(n*40,300)}ms">
      <span class="rail" style="background:${blockColour(r)}"></span>
      <div class="code">${hhmm(it.from)}–${hhmm(it.to)} · ${E(r.Meeting_Room || r.Spot || 'no place')}</div>
      <div class="ttl">${E(r['Account_Name.Account_Name'])}</div>
      <div class="mt">${E(r.Meeting_Type)} · ${E(r.Attendees_String)}</div>
      <div class="tags">
        ${r.Meeting_Status === 'Held' ? '<span class="pill ok">held</span>' : r.Meeting_Status === 'Declined' ? '<span class="pill no">declined</span>' : '<span class="pill book">booked</span>'}
        ${A.clash.has(r.id) ? '<span class="pill no">&#9888; clash</span>' : ''}
        ${A.travel.has(r.id) ? '<span class="pill info">&#128665; travel</span>' : ''}
        ${overlapping ? '<span class="pill ghost">overlaps</span>' : ''}
        ${r.Recap ? '<span class="pill ok">&#10003; recap</span>' : ''}</div></div>`;
  },

  closeSheet() { const eb = q(this.host,'.eb');
    q(eb,'#b-sheet').classList.remove('on'); q(eb,'#b-mask').classList.remove('on'); this.sheetId = null; },

  async sheet(id) {
    const eb = q(this.host,'.eb'), r = this.rows.find(x => x.id === id);
    this.sheetId = id; this.say('sheet', 'open ' + r['Account_Name.Account_Name']);
    const s = q(eb,'#b-sheet');
    s.innerHTML = `<div class="grab"></div>
      <div class="shd"><span class="av" style="background:${hue(r['Account_Name.Account_Name'])}">${ini(r['Account_Name.Account_Name'])}</span>
        <div style="flex:1;min-width:0"><div style="font:600 15px/1.25 'IBM Plex Serif',serif">${E(r['Account_Name.Account_Name'])}</div>
          <div style="font-size:12px;color:var(--ink-3)">${E(r['Account_Name.Country'])} · ${E(r['Account_Name.Cooperation_Status'])}</div></div>
        <button class="chip2" id="b-x">Close</button></div>
      <div class="sbody">
        <div class="row4">
          <div class="tile"><b>${E(r.Meeting_DateTime_String.slice(0,5))}</b><span>date</span></div>
          <div class="tile"><b>${E(r.Meeting_DateTime_String.slice(11))}</b><span>time</span></div>
          <div class="tile"><b>${r.Meeting_Duration}m</b><span>length</span></div>
          <div class="tile"><b>${E(r.Meeting_Status)}</b><span>status</span></div></div>
        <span class="lab2">Account snapshot</span>
        <div class="row2"><div class="tile"><b>${r['Account_Name.Total_Revenue'] ? money(r['Account_Name.Total_Revenue']) : '—'}</b><span>total spend</span></div>
          <div class="tile"><b>${r['Account_Name.Revenue_Last_12M'] ? money(r['Account_Name.Revenue_Last_12M']) : '—'}</b><span>last 12 months</span></div></div>
        <div class="hint" style="margin-top:6px">Updated daily from analytics, not live.</div>
        <span class="lab2">Where</span>
        <div style="font-size:13.5px">${E(r.Meeting_Room || r.Spot || 'no place set')}</div>
        <span class="lab2">Recap</span>
        <textarea class="f2" id="b-recap" rows="4" placeholder="What happened?">${E(r.Recap || '')}</textarea>
        <div class="row2" style="margin-top:8px">
          <button class="btn2 sec" id="b-ai">&#10024; Rephrase</button>
          <button class="btn2" id="b-save">Save recap</button></div>
        <div class="hint" id="b-msg" style="margin-top:8px"></div>
      </div>`;
    q(eb,'#b-x').onclick = () => this.closeSheet();
    q(eb,'#b-mask').classList.add('on');
    requestAnimationFrame(() => s.classList.add('on'));

    let previous = null;
    q(eb,'#b-ai').onclick = async () => {
      const ta = q(eb,'#b-recap'), btn = q(eb,'#b-ai'), msg = q(eb,'#b-msg');
      if (previous !== null) { ta.value = previous; previous = null; btn.innerHTML = '&#10024; Rephrase'; msg.textContent = ''; return; }
      if (!ta.value.trim()) { msg.textContent = 'Nothing to rephrase yet.'; return; }
      btn.disabled = true; msg.textContent = 'asking…'; this.say('fn', 'call rephrase_recap');
      const res = await ZOHO.CRM.FUNCTIONS.execute('rephrase_recap', { input_text: ta.value });
      btn.disabled = false;
      if (!res || String(res.code).toLowerCase() !== 'success') {
        // the platform answers with an envelope instead of throwing; say so rather than showing an empty result
        msg.innerHTML = `<span style="color:var(--crit)">${E(res && res.message || 'the function did not answer')}</span>`;
        this.say('fn', 'no success envelope: ' + (res && res.code), true); return;
      }
      previous = ta.value; ta.value = res.details.output;
      btn.textContent = 'Undo'; msg.textContent = 'Rewritten. The key still lives server-side, never in this page.';
      this.say('fn', 'rephrase returned ' + res.details.output.length + ' chars');
    };
    q(eb,'#b-save').onclick = async () => {
      const ta = q(eb,'#b-recap'), msg = q(eb,'#b-msg');
      // the sheet may have been switched while the request was in flight
      const target = this.sheetId;
      msg.textContent = 'saving…';
      try {
        await ZOHO.CRM.API.updateRecord({ Entity:'Meetings', RecordID:target, APIData:{ Recap: ta.value.trim() }});
        if (this.sheetId !== target) { this.say('race', 'sheet changed mid-save, result discarded', true); return; }
        const row = this.rows.find(x => x.id === target); if (row) row.Recap = ta.value.trim();
        msg.innerHTML = '<span style="color:var(--ok)">Saved to the record.</span>';
        this.say('save', 'recap written to ' + target);
        this.draw();
      } catch (e) {
        msg.innerHTML = `<span style="color:var(--crit)">${E(e.code)} — ${E(e.message)}</span>`;
        this.say('save', 'refused: ' + e.code, true);
      }
    };
  }
};

window.RoomSchedule = Schedule;
window.MobileBoard = Board;
})();
