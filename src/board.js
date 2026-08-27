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

/* ---- "Add meeting" wizard (mobile) ---- */
.eb .bw{position:absolute;inset:0;background:var(--surface);z-index:32;display:flex;flex-direction:column;
  transform:translateY(100%);transition:transform .28s cubic-bezier(.22,.7,.3,1)}
.eb .bw.on{transform:none}
.eb .bw-head{padding:26px 14px 10px;border-bottom:1px solid var(--b)}
.eb .bw-head-top{display:flex;align-items:center;gap:10px}
.eb .bw-x{border:0;background:none;font-size:22px;line-height:1;color:var(--ink-3);cursor:pointer;padding:2px 6px}
.eb .bw-steps{display:flex;gap:5px;margin-top:12px}
.eb .bw-steps i{flex:1;height:3px;border-radius:2px;background:var(--line);font-style:normal}
.eb .bw-steps i.on,.eb .bw-steps i.done{background:var(--accent)}
.eb .bw-stepname{font-size:11.5px;color:var(--ink-3);margin-top:8px}
.eb .bw-body{flex:1;overflow:auto;padding:14px}
.eb .bw-hint{padding:0 14px 10px;font-size:12px;color:var(--warn);min-height:1px}
.eb .bw-foot{display:flex;gap:10px;padding:12px 14px;border-top:1px solid var(--b);background:var(--surface-2)}
.eb .bw-foot button{flex:1;min-height:44px;border-radius:9px;font:600 14px/1 "IBM Plex Sans",sans-serif;cursor:pointer;background:var(--surface);color:var(--ink-2);border:1px solid var(--b)}
.eb .bw-foot button.pri{background:var(--accent);color:#fff;border-color:var(--accent)}
.eb .bw-foot button.pri:disabled{opacity:.45;cursor:default}
.eb .bw-block{margin-bottom:16px}
.eb .bw-block label{display:block;font:500 10px/1 "IBM Plex Mono",monospace;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3);margin-bottom:8px}
.eb .bw-help{font-size:11.5px;color:var(--ink-3);margin-top:6px}
.eb .bw-opt{display:flex;align-items:center;gap:10px;border:1px solid var(--b);border-radius:9px;padding:9px 11px;margin-bottom:7px;cursor:pointer}
.eb .bw-opt.on{border-color:var(--accent);background:var(--accent-soft)}
.eb .bw-opt .ic{width:32px;height:32px;border-radius:50%;background:var(--surface-2);color:var(--ink-2);display:grid;place-items:center;font:600 12px/1 "IBM Plex Mono",monospace;flex:0 0 32px}
.eb .bw-opt .tx{flex:1;min-width:0}
.eb .bw-opt .tx b{display:block;font-size:13.5px}
.eb .bw-opt .tx span{font-size:11.5px;color:var(--ink-3)}
.eb .bw-opt .chk{opacity:0;color:var(--accent)}
.eb .bw-opt.on .chk{opacity:1}
.eb .bw-chips{display:flex;gap:6px;flex-wrap:wrap}
.eb .bw-chip{border:1px solid var(--b);border-radius:999px;padding:7px 12px;font-size:12.5px;background:var(--surface);color:var(--ink-2);cursor:pointer;min-height:34px}
.eb .bw-chip.on{background:var(--accent);border-color:var(--accent);color:#fff}
.eb .bw-chip small{display:block;font-size:9.5px;opacity:.8;margin-top:1px}
.eb .bw-role{margin-bottom:14px}
.eb .bw-role h5{margin:0 0 6px;font-size:12.5px;font-weight:600}
.eb .bw-role h5 em{font-weight:400;color:var(--ink-3);font-style:normal}
.eb .bw-none{font-size:12px;color:var(--ink-3);padding:6px 0}
.eb .bw-tag{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--b);border-radius:999px;padding:5px 6px 5px 11px;margin:0 6px 6px 0;font-size:12px;background:var(--surface-2)}
.eb .bw-tag button{border:0;background:none;color:var(--ink-3);cursor:pointer;font-size:14px;line-height:1;padding:2px}
.eb .bw-add{border:1px dashed var(--line-strong);border-radius:9px;padding:8px 11px;font-size:12.5px;color:var(--accent-ink);background:none;cursor:pointer;width:100%;text-align:left}
.eb .bw-fixed{display:flex;align-items:center;gap:10px;border:1px solid var(--b);border-radius:9px;padding:9px 11px;background:var(--surface-2)}
.eb .bw-fixed .ic{width:32px;height:32px;border-radius:50%;background:var(--surface);display:grid;place-items:center;flex:0 0 32px}
.eb .bw-fixed b{display:block;font-size:13px}
.eb .bw-fixed span{font-size:11px;color:var(--ink-3)}
.eb .bw-warn{font-size:12px;padding:9px 11px;border-radius:8px;background:var(--warn-bg);color:var(--warn);margin-top:8px}
.eb .bw-warn.err{background:var(--crit-bg);color:var(--crit)}
.eb .bw-cap{font-size:11.5px;color:var(--ink-3);margin-top:8px}
.eb .bw-cap.over{color:var(--crit)}
.eb .bw-seg{display:flex;border:1px solid var(--b);border-radius:9px;overflow:hidden;margin-bottom:12px}
.eb .bw-seg button{flex:1;min-height:38px;border:0;background:var(--surface);font:500 12.5px/1 "IBM Plex Sans",sans-serif;color:var(--ink-2);cursor:pointer}
.eb .bw-seg button.on{background:var(--accent);color:#fff}
.eb .bw-slotrow{display:flex;align-items:center;gap:10px;border:1px solid var(--b);border-radius:9px;padding:10px 11px;margin-bottom:7px;cursor:pointer}
.eb .bw-slotrow.on{border-color:var(--accent);background:var(--accent-soft)}
.eb .bw-slotrow.warn{border-color:color-mix(in srgb,var(--warn) 40%,var(--b))}
.eb .bw-slotrow .tm{font:600 13.5px/1 "IBM Plex Mono",monospace;flex:0 0 auto}
.eb .bw-slotrow .nt{flex:1;font-size:11.5px;color:var(--ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.eb .bw-earliest{display:block;width:100%;text-align:left;border:1px dashed var(--accent);border-radius:9px;padding:9px 11px;color:var(--accent-ink);background:var(--accent-soft);cursor:pointer;font-size:12.5px;margin-bottom:8px}
.eb .bw-more{width:100%;text-align:left;border:0;background:none;color:var(--ink-3);font-size:12px;padding:6px 0;cursor:pointer}
.eb .bw-grid{overflow:auto;border:1px solid var(--b);border-radius:9px;max-height:280px}
.eb .bw-grid table{border-collapse:collapse;width:100%;font-size:11px}
.eb .bw-grid th,.eb .bw-grid td{border-bottom:1px solid var(--line);padding:3px 6px;text-align:left;white-space:nowrap}
.eb .bw-grid th{position:sticky;top:0;background:var(--surface-2);font:500 9.5px/1 "IBM Plex Mono",monospace;text-transform:uppercase;letter-spacing:.06em;color:var(--ink-3)}
.eb .bw-grid tr.sel td{background:var(--accent-soft)}
.eb .bw-grid td.busy{background:var(--crit-bg);color:var(--crit);font-size:9.5px}
.eb .bw-grid .tm{font:400 10.5px/1 "IBM Plex Mono",monospace;color:var(--ink-3)}
.eb .bw-review{border:1px solid var(--b);border-radius:9px;padding:4px 12px}
.eb .bw-review .row{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--line)}
.eb .bw-review .row:last-child{border-bottom:0}
.eb .bw-review .k{flex:0 0 90px;font-size:11px;color:var(--ink-3)}
.eb .bw-review .v{flex:1;font-size:12.5px}
.eb .bw-count{font-size:11px;color:var(--ink-3);margin-top:4px;text-align:right}
.eb .bw-done{text-align:center;padding:30px 18px}
.eb .bw-done .tick{width:52px;height:52px;border-radius:50%;background:var(--ok-bg);color:var(--ok);display:grid;place-items:center;font-size:26px;margin:0 auto 14px}
.eb .bw-done h3{margin:0 0 8px;font:600 17px/1.3 "IBM Plex Serif",serif}
.eb .bw-done p{font-size:12.5px;color:var(--ink-2);margin:0 0 4px}
.eb .bw-done a{display:inline-block;margin-top:10px;font-size:12.5px}
.eb .bw-pick-mask{position:absolute;inset:0;background:rgba(10,16,14,.5);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s ease,visibility 0s linear .2s;z-index:33}
.eb .bw-pick-mask.on{opacity:1;visibility:visible;pointer-events:auto;transition:opacity .2s ease,visibility 0s}
.eb .bw-pick{position:absolute;left:0;right:0;bottom:0;height:70%;background:var(--surface);border-radius:16px 16px 0 0;z-index:34;
  transform:translateY(100%);transition:transform .28s cubic-bezier(.22,.7,.3,1),visibility 0s linear .28s;visibility:hidden;display:flex;flex-direction:column;box-shadow:0 -12px 34px -14px rgba(0,0,0,.5)}
.eb .bw-pick.on{transform:none;visibility:visible;transition:transform .28s cubic-bezier(.22,.7,.3,1),visibility 0s}
.eb .bw-pick-head{display:flex;align-items:center;gap:10px;padding:14px 14px 10px;border-bottom:1px solid var(--b)}
.eb .bw-pick-head b{flex:1;font:600 14px/1 "IBM Plex Serif",serif}
.eb .bw-pick-search{padding:10px 14px;border-bottom:1px solid var(--b)}
.eb .bw-pick-search input{width:100%;font-size:16px;border:1px solid var(--b);border-radius:9px;padding:10px 11px;background:var(--surface);color:var(--ink)}
.eb .bw-pick-count{font-size:11px;color:var(--ink-3);margin-top:6px}
.eb .bw-pick-list{flex:1;overflow:auto;padding:6px 14px 20px}
.eb .bw-pick-row{width:100%;display:flex;align-items:center;gap:10px;border:0;border-bottom:1px solid var(--line);background:none;padding:11px 2px;text-align:left;cursor:pointer;font-size:13.5px;color:var(--ink)}
.eb .bw-pick-row .n{flex:1}
.eb .bw-pick-row .s{font-size:11px;color:var(--ink-3)}
.eb .bw-pick-row.on{color:var(--accent-ink)}
.eb .bw-pick-row .t{font-size:15px;color:var(--ink-3)}
.eb .bw-pick-row.on .t{color:var(--accent)}
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
function hmToMin(s) { const m = /^(\d{1,2}):(\d{2})/.exec(String(s || '')); return m ? (+m[1] * 60 + +m[2]) : 0; }

/* ---------- mobile board: "Add meeting" wizard ----------
   Same shape as the desktop Wizard (event-page.js) and the same idea as the
   original eventBoard widget's "Add meeting" wizard (js/eventBoard.js,
   functions ebc*): five steps, buyer roles, our-side attendees, room/spot,
   suggested-times + 15-min grid, review, submit. Reuses the campaign record
   and mockZoho already loaded for the board — no separate data model. */
const BW_STEPS = ['Account', 'Participants & agenda', 'Place & time', 'Availability', 'Review & submit'];
const BW_ROLES = [
  { key: 'Economic', label: 'Economic buyer', hint: 'controls the budget' },
  { key: 'Technical', label: 'Technical buyer', hint: 'evaluates the solution' },
  { key: 'User', label: 'User buyer', hint: 'works with the result' },
  { key: 'Coach', label: 'Coach', hint: 'guides us inside' }
];
const BW_DURATIONS = [30, 45, 60, 90, 120];
// Decorative only — the original shows a fixed shared mailbox as organizer.
// Fictitious address, not a real one, per the project's no-real-domains rule.
const BW_ORGANIZER = 'bookings@northbeam.example';

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
    host.classList.add('ecp');            // the phone shows the CRM's own palette, not the site's
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
      <div class="bw" id="b-wiz"></div>
      <div class="bw-pick-mask" id="bwPickMask"></div>
      <div class="bw-pick" id="bwPick">
        <div class="bw-pick-head"><b id="bwPickTitle"></b><button class="chip2" id="bwPickClose">Done</button></div>
        <div class="bw-pick-search"><input id="bwPickQ" type="search" placeholder="Search by name or title" autocomplete="off" autocapitalize="off" spellcheck="false">
          <div class="bw-pick-count" id="bwPickCount"></div></div>
        <div class="bw-pick-list" id="bwPickList"></div>
      </div>
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
    q(eb,'#b-add').onclick = () => this.wOpen();
    q(eb,'#bwPickClose').onclick = () => this.wCloseBuyerPicker();
    q(eb,'#bwPickMask').onclick = () => this.wCloseBuyerPicker();
    q(eb,'#bwPickQ').oninput = () => { if (!this.w || !this.w.picker) return;
      this.w.picker.q = q(eb,'#bwPickQ').value; this.wRenderPickerList(); };

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

/* -------- "Add meeting" wizard: state, steps, submit -------- */
Object.assign(Board, {
  wQ(sel) { const body = q(q(this.host,'.eb'),'#bwBody'); return body ? body.querySelectorAll(sel) : []; },

  wOpen() {
    if (!this.c) return;
    this.w = {
      step:1, busy:false, error:'', done:false, createdId:null,
      query:'', results:[], searching:false, account:null, contacts:[],
      buyers:{ Economic:[], Technical:[], User:[], Coach:[] },
      team:[], duration:45, day:this.day,
      room:this.c.rooms[0] ? this.c.rooms[0].name : null, notInRoom: !this.c.rooms.length,
      spot:'', slotMin:null, slotView:'list', showBusy:false, purpose:'', sendExternal:true,
      picker:null, _seq:0, _accSeq:0
    };
    if (this.sheetId) { this.say('wizard', 'opened while the meeting sheet was still open — closing it'); this.closeSheet(); }
    this.say('wizard', 'open | day=' + this.w.day + ' | room=' + this.w.room);
    this.wRender();
    q(q(this.host,'.eb'),'#b-wiz').classList.add('on');
  },
  wClose() {
    this.say('wizard', 'close | step=' + (this.w ? this.w.step : '?'));
    q(q(this.host,'.eb'),'#b-wiz').classList.remove('on');
  },

  wRoom(name) { return (this.c.rooms || []).find(r => r.name === name) || null; },
  wBuyersFlat() { return BW_ROLES.reduce((a,r) => a.concat(this.w.buyers[r.key]), []); },
  wCapacity() { const r = this.wRoom(this.w.room); return r ? r.cap : 0; },
  wParticipantCount() { return new Set(this.wBuyersFlat().concat(this.w.team)).size; },
  wOverflow() { return this.w.notInRoom ? false : this.wParticipantCount() > this.wCapacity(); },
  wPlaceLabel() { const w = this.w; if (w.notInRoom) return w.spot || 'Meeting spot not set';
    const r = this.wRoom(w.room); return r ? r.name : 'Room not selected'; },
  wMeetingName() { return this.w.account ? `${this.c.Name} — ${this.w.account.name}` : '—'; },

  wBlocker() {
    const w = this.w;
    switch (w.step) {
      case 1: return w.account ? '' : 'Pick an account to continue.';
      case 2:
        if (!this.wBuyersFlat().length) return 'At least one buyer is required.';
        if (!w.team.length) return 'At least one person from our side is required.';
        return '';
      case 3:
        if (!w.notInRoom && !this.c.rooms.length) return 'This event has no rooms configured — switch to a meeting spot.';
        if (!w.notInRoom && !w.room) return 'Pick a meeting room.';
        if (w.notInRoom && !w.spot.trim()) return 'Meeting spot is required outside a room.';
        if (this.wOverflow()) return 'Room capacity is exceeded — remove participants or change the room.';
        return '';
      case 4: return w.slotMin == null ? (w.slotView === 'list' ? 'Pick a time.' : 'Pick a time slot in the grid.') : '';
      case 5: return '';
      default: return '';
    }
  },
  wRefreshHint() {
    const eb = q(this.host,'.eb'), b = this.wBlocker(), hint = q(eb,'#bwHint'), btn = q(eb,'#bwNext');
    if (hint) hint.textContent = this.w.error || b;
    if (btn) btn.disabled = this.w.busy || !!b;
  },

  wNext() {
    if (this.wBlocker() || this.w.busy) return;
    if (this.w.step === 5) return this.wSubmit();
    this.w.step++;
    this.wRender();
  },

  wRender() {
    const eb = q(this.host,'.eb'), wiz = q(eb,'#b-wiz'), w = this.w;
    if (w.done) {
      wiz.innerHTML = `<div class="bw-head"><div class="bw-head-top"><button class="bw-x" id="bwX">&times;</button>
          <b style="flex:1;text-align:center;font:600 14px/1 'IBM Plex Serif',serif">Meeting created</b><span style="width:26px"></span></div>
          <div class="bw-steps">${BW_STEPS.map(()=>'<i class="done"></i>').join('')}</div>
          <div class="bw-stepname">Done</div></div>
        <div class="bw-body" id="bwBody">${this.wSuccessHtml()}</div>
        <div class="bw-foot"><button class="pri" id="bwFinish">Back to the board</button></div>`;
      q(wiz,'#bwX').onclick = () => this.wClose();
      q(wiz,'#bwFinish').onclick = async () => {
        this.wClose();
        const { rows } = await coqlAll(
          `select id, Name, Meeting_DateTime_String, Meeting_Duration, Meeting_Room, Spot, Meeting_Status, Meeting_Type,
           Recap, Attendees_String, Account_Name.Account_Name, Account_Name.Cooperation_Status, Account_Name.Country,
           Account_Name.Total_Revenue, Account_Name.Revenue_Last_12M
           from Meetings where Campaign = '${this.c.id}'`);
        this.rows = rows;
        this.say('wizard', 'board reloaded, ' + rows.length + ' meetings');
        this.draw();
      };
      const open = q(wiz,'#bwOpenCreated');
      if (open) open.onclick = () => ZOHO.CRM.UI.Record.open({ Entity:'Meetings', RecordID:w.createdId });
      return;
    }

    const stepName = BW_STEPS[w.step - 1];
    wiz.innerHTML = `<div class="bw-head"><div class="bw-head-top"><button class="bw-x" id="bwX">&times;</button>
        <b style="flex:1;text-align:center;font:600 14px/1 'IBM Plex Serif',serif">New meeting</b><span style="width:26px"></span></div>
        <div class="bw-steps">${BW_STEPS.map((_,i)=>`<i class="${i+1<w.step?'done':(i+1===w.step?'on':'')}"></i>`).join('')}</div>
        <div class="bw-stepname">Step ${w.step} of 5 &middot; ${E(stepName)}</div></div>
      <div class="bw-body" id="bwBody">${[this.wStep1,this.wStep2,this.wStep3,this.wStep4,this.wStep5][w.step-1].call(this)}</div>
      <div class="bw-hint" id="bwHint"></div>
      <div class="bw-foot"><button id="bwBack">${w.step===1?'Cancel':'Back'}</button>
        <button class="pri" id="bwNext">${w.busy?'Creating…':(w.step===5?'Create meeting':'Continue')}</button></div>`;
    q(wiz,'#bwX').onclick = () => this.wClose();
    q(wiz,'#bwBack').onclick = () => { if (w.step === 1) this.wClose(); else { w.step--; w.error=''; this.wRender(); } };
    q(wiz,'#bwNext').onclick = () => this.wNext();
    [this.wBind1,this.wBind2,this.wBind3,this.wBind4,this.wBind5][w.step-1].call(this);
    this.wRefreshHint();
  },

  /* ---- step 1: account ---- */
  wStep1() {
    const w = this.w;
    const list = w.results.length
      ? w.results.map(a => `<div class="bw-opt ${w.account && w.account.id===a.id ? 'on' : ''}" data-acc="${E(a.id)}">
          <div class="ic">${E(a.name.slice(0,2).toUpperCase())}</div>
          <div class="tx"><b>${E(a.name)}</b><span>${a.Parent_Account && a.Parent_Account.name ? 'Parent: ' + E(a.Parent_Account.name) + ' · ' : ''}${E(a.Cooperation_Status || '')}</span></div>
          <div class="chk">&#10003;</div></div>`).join('')
      : (w.searching ? `<div class="empty">Searching…</div>`
        : (w.query.trim().length >= 2 ? `<div class="empty">No account matches "${E(w.query)}".</div>`
          : `<div class="empty">Type at least two letters to search accounts.</div>`));
    return `<div class="bw-block"><label>Account</label>
        <input class="f2" id="bwAcc" placeholder="Start typing an account name" value="${E(w.query)}">
        <div class="bw-help">Contacts of this account are pulled in on the next step.</div></div>${list}`;
  },
  wBind1() {
    const eb = q(this.host,'.eb'), inp = q(eb,'#bwAcc');
    if (!inp) return;
    inp.oninput = () => { this.w.query = inp.value; clearTimeout(this._wt);
      this._wt = setTimeout(() => this.wSearch(this.w.query), 300); };
    this.wQ('[data-acc]').forEach(el => { el.onclick = () => this.wPickAccount(el.dataset.acc); });
  },
  wSearch(qstr) {
    const w = this.w, seq = ++w._seq, query = String(qstr || '').trim();
    w.searching = true;
    this.wRenderStep1Only();
    const go = query.length >= 2
      ? ZOHO.CRM.API.searchRecord({ Entity:'Accounts', Query:`(Account_Name:starts_with:${query})` }).then(r => r.data).catch(() => [])
      : Promise.resolve([]);
    go.then(rows => {
      if (seq !== w._seq) return;
      // searchRecord returns raw Account fields (Account_Name, not name) — normalize once here
      // so the rest of the wizard can just read w.account.name like everything else does.
      w.results = rows.slice(0,8).map(a => ({ id:a.id, name:a.Account_Name,
        Parent_Account:a.Parent_Account, Cooperation_Status:a.Cooperation_Status }));
      w.searching = false;
      this.wRenderStep1Only();
    });
  },
  wRenderStep1Only() {
    const eb = q(this.host,'.eb'), body = q(eb,'#bwBody');
    if (!body || !this.w || this.w.step !== 1) return;
    const focused = document.activeElement && document.activeElement.id === 'bwAcc';
    const pos = focused ? document.activeElement.selectionStart : null;
    body.innerHTML = this.wStep1();
    this.wBind1();
    this.wRefreshHint();
    if (focused) { const el2 = q(eb,'#bwAcc'); if (el2) { el2.focus(); if (pos != null) el2.setSelectionRange(pos,pos); } }
  },
  async wPickAccount(id) {
    const w = this.w, acc = w.results.find(a => a.id === id);
    if (!acc) return;
    w.account = acc;
    BW_ROLES.forEach(r => { w.buyers[r.key] = []; });
    w.contacts = [];
    const seq = ++w._accSeq;
    w.busy = true; w.step = 2;
    this.wRender();
    const { rows } = await coqlAll(
      `select id, Full_Name, Title from Contacts where Account_Name = '${esc(acc.id)}' and Contact_Status = 'Working'`, 200);
    if (seq !== w._accSeq) return;
    w.contacts = rows.map(c => ({ name:c.Full_Name, Title:c.Title }));
    const known = new Set(w.contacts.map(c => c.name));
    BW_ROLES.forEach(r => { w.buyers[r.key] = w.buyers[r.key].filter(n => known.has(n)); });
    w.busy = false;
    this.wRender();
  },

  /* ---- step 2: buyers (exclusive roles) + our side ---- */
  wUseBuyerSearch() { return this.w.contacts.length >= 5; },
  wStep2() {
    const w = this.w, contacts = w.contacts, search = this.wUseBuyerSearch();
    const roles = contacts.length ? BW_ROLES.map(r => {
      if (!search) {
        return `<div class="bw-role"><h5>${E(r.label)} <em>— ${E(r.hint)}</em></h5>
          <div class="bw-chips">${contacts.map(c => `<button class="bw-chip ${w.buyers[r.key].includes(c.name)?'on':''}"
            data-role="${E(r.key)}" data-c="${E(c.name)}">${E(c.name)}<small>${E(c.Title||'')}</small></button>`).join('')}</div></div>`;
      }
      const picked = w.buyers[r.key];
      const tags = picked.length
        ? picked.map(name => { const c = contacts.find(x => x.name === name);
            return `<span class="bw-tag"><b>${E(name)}</b>${c && c.Title ? ` <span style="color:var(--ink-3)">${E(c.Title)}</span>` : ''}
              <button data-drop="${E(name)}" data-droprole="${r.key}" aria-label="Remove">&times;</button></span>`; }).join('')
        : `<div class="bw-none">nobody yet</div>`;
      return `<div class="bw-role"><h5>${E(r.label)} <em>— ${E(r.hint)}</em></h5>${tags}
        <button class="bw-add" data-addrole="${E(r.key)}">＋ Add ${E(r.label.toLowerCase())}</button></div>`;
    }).join('') : (w.busy ? `<div class="empty">Loading contacts…</div>` : `<div class="empty">This account has no contacts in CRM yet.</div>`);

    return `<div class="bw-block"><label>Buyers · ${this.wBuyersFlat().length} selected</label>${roles}</div>
      <div class="bw-block"><label>Our side · ${w.team.length} selected</label>
        <div class="bw-chips">${this.c.attendees.map(a => `<button class="bw-chip ${w.team.includes(a.Name1)?'on':''}"
          data-team="${E(a.Name1)}">${E(a.Name1)}<small>${E(a.Functions||'')}</small></button>`).join('')}</div></div>
      <div class="bw-block"><label>Organizer</label>
        <div class="bw-fixed"><div class="ic">&#9993;</div>
          <div><b>${E(BW_ORGANIZER)}</b><span>shared mailbox, always the organizer</span></div></div></div>`;
  },
  wBind2() {
    const w = this.w;
    this.wQ('[data-role]').forEach(el => { el.onclick = () => {
      const role = el.dataset.role, name = el.dataset.c, had = w.buyers[role].includes(name);
      // roles are exclusive: one person cannot be both an Economic and a User buyer
      BW_ROLES.forEach(r => { w.buyers[r.key] = w.buyers[r.key].filter(n => n !== name); });
      if (!had) w.buyers[role].push(name);
      this.wRender();
    }; });
    this.wQ('[data-addrole]').forEach(el => { el.onclick = () => this.wOpenBuyerPicker(el.dataset.addrole); });
    this.wQ('[data-drop]').forEach(el => { el.onclick = () => {
      w.buyers[el.dataset.droprole] = w.buyers[el.dataset.droprole].filter(n => n !== el.dataset.drop);
      this.wRender();
    }; });
    this.wQ('[data-team]').forEach(el => { el.onclick = () => {
      const name = el.dataset.team, i = w.team.indexOf(name);
      i > -1 ? w.team.splice(i,1) : w.team.push(name);
      w.slotMin = null;
      this.wRender();
    }; });
  },

  /* ---- buyer picker sheet (accounts with 5+ contacts) ---- */
  wPickerRows() {
    const w = this.w, role = w.picker.role, qstr = String(w.picker.q || '').trim().toLowerCase();
    const all = w.contacts;
    const hit = qstr ? all.filter(c => (c.name + ' ' + (c.Title||'')).toLowerCase().includes(qstr)) : all;
    hit.sort((a,b) => (w.buyers[role].includes(b.name)?1:0) - (w.buyers[role].includes(a.name)?1:0));
    return { hit: hit.slice(0,60), total: hit.length, all: all.length };
  },
  wOpenBuyerPicker(role) {
    const eb = q(this.host,'.eb');
    this.w.picker = { role, q:'' };
    q(eb,'#bwPickTitle').textContent = (BW_ROLES.find(x => x.key === role) || {}).label || role;
    const inp = q(eb,'#bwPickQ'); if (inp) inp.value = '';
    this.wRenderPickerList();
    q(eb,'#bwPickMask').classList.add('on');
    q(eb,'#bwPick').classList.add('on');
    if (inp) inp.focus();
  },
  wCloseBuyerPicker() {
    if (!this.w || !this.w.picker) return;
    const eb = q(this.host,'.eb');
    this.w.picker = null;
    q(eb,'#bwPickMask').classList.remove('on');
    q(eb,'#bwPick').classList.remove('on');
    this.wRender();
  },
  wRenderPickerList() {
    const eb = q(this.host,'.eb'), w = this.w, role = w.picker.role, r = this.wPickerRows();
    q(eb,'#bwPickList').innerHTML = r.hit.length ? r.hit.map(c => { const on = w.buyers[role].includes(c.name);
        return `<button class="bw-pick-row${on?' on':''}" data-pn="${E(c.name)}"><span class="n">${E(c.name)}</span>
          ${c.Title ? `<span class="s">${E(c.Title)}</span>` : ''}<span class="t">${on?'&#10003;':'＋'}</span></button>`; }).join('')
      : `<div class="empty">Nothing matches "${E(w.picker.q)}".</div>`;
    q(eb,'#bwPickCount').textContent = r.total > r.hit.length ? `showing ${r.hit.length} of ${r.total} — keep typing` : `${r.total} of ${r.all}`;
    q(eb,'#bwPickList').querySelectorAll('[data-pn]').forEach(b => { b.onclick = () => {
      const name = b.dataset.pn, had = w.buyers[role].includes(name);
      BW_ROLES.forEach(rr => { w.buyers[rr.key] = w.buyers[rr.key].filter(n => n !== name); });
      if (!had) w.buyers[role].push(name);
      this.wRenderPickerList();
    }; });
  },

  /* ---- step 3: duration / day / room or spot ---- */
  wStep3() {
    const w = this.w, rooms = this.c.rooms || [], spots = this.c.spots || [];
    const cap = this.wCapacity(), used = this.wParticipantCount(), over = this.wOverflow();
    const roomCards = rooms.length
      ? rooms.map(r => `<div class="bw-opt ${w.room===r.name?'on':''}" data-room="${E(r.name)}">
          <div class="ic">${E(r.name.slice(0,1))}</div>
          <div class="tx"><b>${E(r.name)}</b><span>${E(r.from)}–${E(r.to)} · up to ${r.cap} people</span></div>
          <div class="chk">&#10003;</div></div>`).join('')
        + `<div class="bw-cap ${over?'over':''}">${over?'⚠':'✓'} Capacity: ${used}/${cap}${over?' · Overflowed':''}</div>`
      : `<div class="bw-warn">This event has no meeting rooms configured — book a spot instead.</div>`;
    return `<div class="bw-block"><label>Duration</label><div class="bw-chips">
        ${BW_DURATIONS.map(d => `<button class="bw-chip ${w.duration===d?'on':''}" data-dur="${d}">${d} min</button>`).join('')}</div></div>
      <div class="bw-block"><label>Date</label><div class="bw-chips">
        ${this.days.map(d => `<button class="bw-chip ${w.day===dmy(d)?'on':''}" data-day="${dmy(d)}">${pad2(d.getDate())}.${pad2(d.getMonth()+1)}<small>${DOW[d.getDay()]}</small></button>`).join('')}</div></div>
      <div class="bw-block"><label>Location</label>
        ${rooms.length ? `<div class="bw-opt ${w.notInRoom?'on':''}" id="bwNoRoom">
          <div class="ic">📍</div><div class="tx"><b>Not in a meeting room</b><span>use a meeting spot instead</span></div>
          <div class="chk">&#10003;</div></div>` : `<div class="bw-warn">This event has no meeting rooms configured, so the meeting goes to a spot.</div>`}
        ${w.notInRoom ? `<label style="margin-top:10px;display:block">Meeting spot</label>
          <input class="f2" id="bwSpot" placeholder="Where exactly?" value="${E(w.spot)}">
          ${spots.length ? `<div class="bw-chips" style="margin-top:8px">${spots.map(s => `<button class="bw-chip ${w.spot===s?'on':''}" data-spot="${E(s)}">${E(s)}</button>`).join('')}</div>`
            : `<div class="bw-help">No suggested spots on this event.</div>`}
          <div class="bw-cap">♾ Capacity: unlimited outside a room</div>` : roomCards}
      </div>`;
  },
  wBind3() {
    const w = this.w;
    this.wQ('[data-dur]').forEach(el => { el.onclick = () => { w.duration = +el.dataset.dur; w.slotMin = null; this.wRender(); }; });
    this.wQ('[data-day]').forEach(el => { el.onclick = () => { w.day = el.dataset.day; w.slotMin = null; this.wRender(); }; });
    this.wQ('[data-room]').forEach(el => { el.onclick = () => { w.room = el.dataset.room; w.slotMin = null; this.wRender(); }; });
    const nr = q(q(this.host,'.eb'),'#bwNoRoom');
    if (nr) nr.onclick = () => { w.notInRoom = !w.notInRoom; w.slotMin = null; this.wRender(); };
    const sp = q(q(this.host,'.eb'),'#bwSpot');
    if (sp) sp.oninput = () => { w.spot = sp.value; this.wRefreshHint(); };
    this.wQ('[data-spot]').forEach(el => { el.onclick = () => { w.spot = el.dataset.spot; this.wRender(); }; });
  },

  /* ---- step 4: availability ---- */
  wDayRows() {
    return (this.rows || []).map(r => {
      const p = parseDT(r.Meeting_DateTime_String);
      if (!p || p.day !== this.w.day || r.Meeting_Status === 'Declined') return null;
      return { from:p.min, to:p.min + (+r.Meeting_Duration || 30), room:r.Meeting_Room,
        who:String(r.Attendees_String || '').split(',').map(x=>x.trim()).filter(Boolean),
        subject:r['Account_Name.Account_Name'] || r.Name || 'Busy' };
    }).filter(Boolean);
  },
  wBusyFor(kind, key) {
    return this.wDayRows().filter(x => kind === 'room' ? x.room === key : x.who.includes(key))
      .map(x => ({ from:x.from, to:x.to, subject:x.subject }));
  },
  wSlotConflicts() {
    const w = this.w, res = { room:null, people:[] };
    if (w.slotMin == null) return res;
    const a = w.slotMin, b = w.slotMin + w.duration, hits = list => list.filter(x => x.from < b && a < x.to);
    if (!w.notInRoom && w.room) { const busy = hits(this.wBusyFor('room', w.room)); if (busy.length) res.room = busy[0]; }
    w.team.forEach(n => { const busy = hits(this.wBusyFor('person', n)); if (busy.length) res.people.push({ name:n, subject:busy[0].subject }); });
    return res;
  },
  wGridRange() {
    const r = this.wRoom(this.w.room);
    if (r) return { from:hmToMin(r.from), to:hmToMin(r.to) };
    const rooms = this.c.rooms || [];
    if (rooms.length) return { from:Math.min(...rooms.map(x=>hmToMin(x.from))), to:Math.max(...rooms.map(x=>hmToMin(x.to))) };
    return { from:9*60, to:18*60 };
  },
  wMergeBusy(list) {
    const sorted = list.slice().sort((a,b) => a.from-b.from), out = [];
    sorted.forEach(iv => { const last = out[out.length-1];
      if (last && iv.from <= last.to) last.to = Math.max(last.to, iv.to); else out.push({ from:iv.from, to:iv.to }); });
    return out;
  },
  wFreeWindows() {
    const range = this.wGridRange(), w = this.w;
    const busy = w.notInRoom ? [] : this.wMergeBusy(this.wBusyFor('room', w.room));
    const wins = []; let cur = range.from;
    busy.forEach(b => { if (b.from > cur) wins.push({ from:cur, to:Math.min(b.from, range.to) }); cur = Math.max(cur, b.to); });
    if (cur < range.to) wins.push({ from:cur, to:range.to });
    return wins.filter(win => win.to - win.from >= w.duration);
  },
  wSlotPeopleBusy(start) {
    const w = this.w, a = start, b = start + w.duration, out = [];
    w.team.forEach(n => { const hit = this.wBusyFor('person', n).find(x => x.from < b && a < x.to); if (hit) out.push({ name:n, subject:hit.subject }); });
    return out;
  },
  wSuggestSlots() {
    const wins = this.wFreeWindows(), seen = new Set(), slots = [], w = this.w;
    wins.forEach(win => {
      const starts = [win.from];
      let t = Math.ceil(win.from/30)*30;
      while (t + w.duration <= win.to && starts.length < 5) { if (t !== win.from) starts.push(t); t += 30; }
      starts.forEach(st => { if (st + w.duration > win.to || seen.has(st)) return; seen.add(st);
        slots.push({ start:st, busy:this.wSlotPeopleBusy(st) }); });
    });
    slots.sort((a,b) => a.start-b.start);
    return slots;
  },
  wStep4() {
    const w = this.w;
    const head = `<div class="bw-seg"><button class="${w.slotView==='list'?'on':''}" data-view="list">Suggested times</button>
      <button class="${w.slotView==='grid'?'on':''}" data-view="grid">15-min grid</button></div>`;
    return head + (w.slotView === 'list' ? this.wStep4List() : this.wStep4Grid());
  },
  wStep4List() {
    const w = this.w, slots = this.wSuggestSlots();
    const free = slots.filter(s => !s.busy.length), partly = slots.filter(s => s.busy.length);
    const row = s => { const on = w.slotMin === s.start, label = `${hhmm(s.start)} – ${hhmm(s.start + w.duration)}`;
      const note = s.busy.length ? s.busy.map(b => E(b.name.split(' ')[0]) + ' — ' + E(b.subject)).join(', ') : 'Everyone free';
      return `<div class="bw-slotrow ${on?'on':''} ${s.busy.length?'warn':''}" data-slot="${s.start}">
        <div class="tm">${label}</div><div class="nt">${s.busy.length?'⚠ ':'✓ '}${note}</div><div class="chk">&#10003;</div></div>`; };
    const first = free[0];
    const earliest = first ? `<button class="bw-earliest" data-slot="${first.start}">⚡ Take the earliest free slot · ${hhmm(first.start)}</button>` : '';
    return `<div class="bw-block"><label>${w.duration} min · ${E(this.wPlaceLabel())}</label>${earliest}
        <div class="bw-help">Times where the room is free. Busy time comes from every meeting already on this board.</div></div>
      ${free.length ? `<div>${free.map(row).join('')}</div>`
        : `<div class="bw-warn err">No free window of ${w.duration} min left in ${E(this.wPlaceLabel())} on this day. Try a shorter meeting, another room or another date.</div>`}
      ${partly.length ? `<button class="bw-more" id="bwMore">${w.showBusy?'▾':'▸'} ${partly.length} more where some attendees are busy</button>
        ${w.showBusy ? `<div>${partly.map(row).join('')}</div>` : ''}` : ''}`;
  },
  wStep4Grid() {
    const w = this.w, range = this.wGridRange(), cols = [];
    if (!w.notInRoom && w.room) cols.push({ label:this.wPlaceLabel(), busy:this.wBusyFor('room', w.room), room:true });
    w.team.forEach(n => cols.push({ label:n, busy:this.wBusyFor('person', n) }));
    let rows = '';
    const lastStart = Math.max(range.from, range.to - w.duration);
    for (let t = range.from; t <= lastStart; t += 15) {
      const sel = w.slotMin != null && t >= w.slotMin && t < w.slotMin + w.duration;
      const cells = cols.map(c => { const b = c.busy.find(x => t >= x.from && t < x.to); if (!b) return '<td></td>';
        const first = t === Math.max(b.from, range.from) || t === range.from;
        return `<td class="busy">${first ? E(b.subject) : ''}</td>`; }).join('');
      rows += `<tr class="${sel?'sel':''}" data-t="${t}"><td class="tm">${t%30===0?hhmm(t):''}</td>${cells}</tr>`;
    }
    const c = this.wSlotConflicts();
    let warn = '';
    if (c.room) warn += `<div class="bw-warn err">${E(this.wPlaceLabel())} is busy with "${E(c.room.subject)}" during this slot — pick another time or room.</div>`;
    if (c.people.length) warn += `<div class="bw-warn">${c.people.map(p => E(p.name)+' — '+E(p.subject)).join('<br>')}<br><b>These attendees are busy.</b> You can still book, they will get a conflicting invite.</div>`;
    const picked = w.slotMin != null ? `${hhmm(w.slotMin)} – ${hhmm(w.slotMin + w.duration)}` : 'not selected';
    return `<div class="bw-block"><label>Selected slot</label>
        <div style="display:flex;align-items:center;gap:10px">
          <button class="bw-chip" id="bwMinus" ${w.slotMin==null?'disabled':''}>−15</button>
          <b style="font:600 14px/1 'IBM Plex Mono',monospace">${picked}</b>
          <button class="bw-chip" id="bwPlus" ${w.slotMin==null?'disabled':''}>+15</button></div>
        <div class="bw-help">${w.duration} min · ${E(this.wPlaceLabel())}</div>${warn}</div>
      <div class="bw-help" style="margin-bottom:8px">Busy time is taken from every meeting already on this board.</div>
      <div class="bw-grid"><table><thead><tr><th class="tm">Time</th>
        ${cols.map(c2 => `<th>${E(c2.room ? '🚪 ' + c2.label : c2.label.split(' ')[0])}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody></table></div>`;
  },
  wBind4() {
    const w = this.w;
    this.wQ('[data-view]').forEach(b => { b.onclick = () => { w.slotView = b.dataset.view; this.wRender(); }; });
    this.wQ('[data-slot]').forEach(el => { el.onclick = () => { w.slotMin = +el.dataset.slot; this.wRender(); }; });
    const more = q(q(this.host,'.eb'),'#bwMore'); if (more) more.onclick = () => { w.showBusy = !w.showBusy; this.wRender(); };
    this.wQ('tr[data-t]').forEach(tr => { tr.onclick = () => { w.slotMin = +tr.dataset.t; this.wRender(); }; });
    const range = this.wGridRange();
    const step = d => { if (w.slotMin == null) return; const next = w.slotMin + d;
      if (next < range.from || next + w.duration > range.to) return; w.slotMin = next; this.wRender(); };
    const minus = q(q(this.host,'.eb'),'#bwMinus'); if (minus) minus.onclick = () => step(-15);
    const plus = q(q(this.host,'.eb'),'#bwPlus'); if (plus) plus.onclick = () => step(15);
  },

  /* ---- step 5: review + submit ---- */
  wStep5() {
    const w = this.w, left = 255 - w.purpose.length;
    const buyers = BW_ROLES.filter(r => w.buyers[r.key].length).map(r => `${r.label}: ${w.buyers[r.key].join(', ')}`).join(' · ') || '—';
    return `<div class="bw-block"><label>Purpose of meeting <span style="text-transform:none;letter-spacing:0;color:var(--ink-3)">(optional)</span></label>
        <textarea class="f2" id="bwPurpose" maxlength="255" placeholder="Why are we meeting?">${E(w.purpose)}</textarea>
        <div class="bw-count">${left} characters left</div></div>
      <div class="bw-block"><div class="bw-opt ${w.sendExternal?'on':''}" id="bwExt" style="margin:0">
        <div class="ic">&#9993;</div><div class="tx"><b>Send the invite to external participants</b><span>off = internal event only</span></div>
        <div class="chk">&#10003;</div></div></div>
      <div class="bw-review">
        <div class="row"><div class="k">Name</div><div class="v">${E(this.wMeetingName())}</div></div>
        <div class="row"><div class="k">Place</div><div class="v">${E(this.wPlaceLabel())}</div></div>
        <div class="row"><div class="k">Date</div><div class="v">${E(w.day)}</div></div>
        <div class="row"><div class="k">Time</div><div class="v">${w.slotMin!=null?hhmm(w.slotMin)+' – '+hhmm(w.slotMin+w.duration):'—'} (${w.duration} min)</div></div>
        <div class="row"><div class="k">Time zone</div><div class="v">${E(this.c.Time_Zone_String)}</div></div>
        <div class="row"><div class="k">Buyers</div><div class="v">${E(buyers)}</div></div>
        <div class="row"><div class="k">Our side</div><div class="v">${E(w.team.join(', ')||'—')}</div></div>
        <div class="row"><div class="k">Organizer</div><div class="v">${E(BW_ORGANIZER)}</div></div></div>
      <div class="bw-warn" style="margin-top:10px">This creates a meeting record and its participants through the emulated platform layer.
        The Outlook event and the Teams link would be a server-side step and are not part of this widget.</div>`;
  },
  wBind5() {
    const eb = q(this.host,'.eb'), w = this.w, p = q(eb,'#bwPurpose');
    if (p) p.oninput = () => { w.purpose = p.value.slice(0,255);
      const c = q(eb,'.bw-count'); if (c) c.textContent = (255 - w.purpose.length) + ' characters left';
      this.wRefreshHint(); };
    const ext = q(eb,'#bwExt'); if (ext) ext.onclick = () => { w.sendExternal = !w.sendExternal; this.wRender(); };
  },

  async wSubmit() {
    const w = this.w;
    w.error = ''; w.busy = true; this.wRender();
    this.say('wizard', 'submitting | account=' + w.account.id + ' | day=' + w.day + ' | slot=' + w.slotMin);
    try {
      const buyerRows = [];
      BW_ROLES.forEach(r => w.buyers[r.key].forEach(name => buyerRows.push({ name, role:r.label })));
      const res = await ZOHO.CRM.API.insertRecord({ Entity:'Meetings', APIData:{
        Name: this.wMeetingName(),
        Meeting_DateTime_String: `${w.day} ${hhmm(w.slotMin)}`,
        Meeting_Date: `${w.day.slice(6)}-${w.day.slice(3,5)}-${w.day.slice(0,2)}`,
        Meeting_Duration: w.duration, Meeting_Room: w.notInRoom ? null : w.room, Spot: w.notInRoom ? w.spot : null,
        Meeting_Status:'Booked', Meeting_Type:'Discovery', Owner: w.team[0] || null,
        Account_Name: w.account.id, Campaign: this.c.id, Time_Zone: this.c.Time_Zone_String,
        Attendees_String: w.team.join(', '), Sync_State:'not_in_crm',
        // unlike the desktop Wizard (event-page.js), this writes the role that was actually
        // picked on step 2 instead of a hardcoded 'Economic Buyer' for everyone
        participants: buyerRows.map(b => ({ Name1:b.name, Type:b.role, Group:'External' }))
      }});
      w.createdId = res.data[0].details.id;
      this.say('wizard', 'meeting created | id=' + w.createdId);
      w.busy = false; w.done = true;
      this.wRender();
    } catch (e) {
      w.busy = false;
      w.error = `${e.code || 'ERROR'} — ${e.message}` + (e.details && e.details.api_name ? ` (field: ${e.details.api_name})` : '');
      this.say('wizard', 'submit failed: ' + w.error, true);
      this.wRender();
    }
  },
  wSuccessHtml() {
    const w = this.w;
    return `<div class="bw-done"><div class="tick">&#10003;</div><h3>Meeting booked</h3>
      <p>${E(this.wMeetingName())}<br>${E(w.day)} ${w.slotMin!=null?hhmm(w.slotMin)+' – '+hhmm(w.slotMin+w.duration):''} · ${E(this.wPlaceLabel())}</p>
      <a href="#" id="bwOpenCreated">Open the meeting in CRM ↗</a></div>`;
  }
});

window.RoomSchedule = Schedule;
window.MobileBoard = Board;
})();
