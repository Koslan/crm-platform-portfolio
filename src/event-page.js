/* =============================================================
   Event Campaign record page — emulated CRM shell with the
   widgets that live on it. Runs on mockZoho, no CRM required.
   Tabs: Overview · Contacts · Meetings   +  Create Meeting wizard
============================================================= */
(function () {
'use strict';

const CSS = `
/* The CRM is a light product with a blue accent. The widgets have to look like
   they do inside it, not like the site around them — so this block redefines the
   tokens for everything under .ecp and stops inheriting the site's theme. */
.ecp{
  --ground:#f3f6f8; --surface:#ffffff; --surface-2:#eef2f6; --line:#dde5ec; --line-strong:#c2cfda;
  --ink:#1b2733; --ink-2:#48596a; --ink-3:#7b8b9a;
  --accent:#1f7fc4; --accent-ink:#155e93; --accent-soft:#e3f0fb;
  --ok:#1c8a4d; --warn:#b0701c; --crit:#bf3a2b; --idle:#8a99a6;
  --ok-bg:#e3f4ea; --warn-bg:#fbf1de; --crit-bg:#fbe7e4; --idle-bg:#eef2f6;
  --shadow:0 1px 2px rgba(27,39,51,.07), 0 10px 26px -18px rgba(27,39,51,.35);
  color:var(--ink);
  /* form controls take their chrome from the UA; without this the browser paints
     buttons and selects in the visitor's dark scheme inside a light product */
  color-scheme:light;
}
.ecp a{color:var(--accent)}
.ecp .link{color:var(--accent);cursor:pointer}
.ecp .link:hover{text-decoration:underline}

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
.ecp .ver{font:400 10.5px/1 "IBM Plex Mono",monospace;color:var(--ink-3);background:var(--surface);border:1px solid var(--line);border-radius:4px;padding:4px 6px;cursor:pointer}
.ecp .ver:hover{border-color:var(--line-strong);color:var(--ink-2)}
.ecp .tw{overflow:auto;max-height:520px;border:1px solid var(--b);border-radius:6px;background:var(--surface)}
.ecp table.d{border-collapse:separate;border-spacing:0;width:100%;font-size:12.5px}
.ecp table.d th{position:sticky;top:0;z-index:2;background:var(--surface-2);font:500 10px/1.3 "IBM Plex Mono",monospace;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-3);text-align:left;padding:9px 10px;border-bottom:1px solid var(--b);white-space:nowrap}
.ecp table.d td{padding:7px 10px;border-bottom:1px solid var(--b);vertical-align:middle;white-space:nowrap}
.ecp table.d tr:hover td{background:var(--surface-2)}
.ecp table.d thead tr.fr th{position:sticky;top:31px;z-index:2;background:var(--surface);padding:4px 6px;border-bottom:1px solid var(--b)}
.ecp table.d thead tr.fr input,.ecp table.d thead tr.fr select{
  width:100%;min-width:70px;border:1px solid var(--line);border-radius:4px;padding:4px 6px;
  font:400 11.5px/1.2 "IBM Plex Sans",sans-serif;background:var(--surface);color:var(--ink)}
.ecp table.d thead tr.fr input:focus,.ecp table.d thead tr.fr select:focus{outline:1px solid var(--accent);border-color:var(--accent)}
.ecp table.d th.sortable{cursor:pointer;user-select:none}
.ecp table.d th.sortable::after{content:'\\2195';opacity:.3;margin-left:5px;font-size:9px}
.ecp table.d th.sortable[data-dir="asc"]::after{content:'\\2191';opacity:.9}
.ecp table.d th.sortable[data-dir="desc"]::after{content:'\\2193';opacity:.9}
.ecp .tfoot{display:flex;align-items:center;gap:10px;padding:7px 10px;border-top:1px solid var(--b);
  font:400 11.5px/1 "IBM Plex Mono",monospace;color:var(--ink-3);background:var(--surface-2)}
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
.ecp .btn{font:500 13px/1 "IBM Plex Sans",sans-serif;padding:11px 18px;border-radius:6px;cursor:pointer;border:1px solid var(--accent);background:var(--accent);color:#fff}
.ecp-mod .ft #w-next{flex:1;justify-content:center}
.ecp .roles{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
.ecp .role .rl{font:500 10.5px/1 "IBM Plex Mono",monospace;letter-spacing:.09em;text-transform:uppercase;color:var(--ink-3);display:block;margin-bottom:6px}
.ecp .role .box{border:1px solid var(--line);border-radius:6px;padding:6px;background:var(--surface);min-height:42px}
.ecp .role input{width:100%;border:0;outline:0;background:transparent;color:var(--ink);font:400 13px/1.4 "IBM Plex Sans",sans-serif;padding:4px 5px}
.ecp .role .sel{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px}
.ecp .role .sel span{display:inline-flex;align-items:center;gap:6px;background:var(--accent-soft);color:var(--accent-ink);border-radius:999px;padding:3px 9px;font-size:12px}
.ecp .role .sel span b{cursor:pointer;font-weight:600;opacity:.65}
.ecp .role .sug{border:1px solid var(--line);border-top:0;border-radius:0 0 6px 6px;max-height:150px;overflow:auto;background:var(--surface)}
.ecp .role .sug div{padding:7px 10px;cursor:pointer;font-size:12.5px}
.ecp .role .sug div:hover{background:var(--accent-soft)}
.ecp .ghost2{font:400 11px/1 "IBM Plex Sans",sans-serif;border:1px solid var(--line);background:var(--surface);color:var(--ink-2);border-radius:5px;padding:4px 8px;cursor:pointer}
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

/* ================= EventContacts widget skin ==================
   The Contacts tab is a port of the EventContacts widget, so it wears the
   widget's own skin rather than the page's: its own tokens, its own toolbar,
   its own table chrome. Everything here is scoped to .ec. */
.ecp .ec{
  --ec-card:#fff; --ec-row:#fff; --ec-row-alt:#fafbfc; --ec-row-hover:#eff4ff;
  --ec-line:#e4e7eb; --ec-line-strong:#d3d8de;
  --ec-ink:#1c2024; --ec-ink-2:#4b5563; --ec-ink-3:#8b929c;
  --ec-accent:#1a73c7; --ec-accent-soft:#eaf2fb;
  --ec-green:#067647; --ec-green-bg:#e9f7f0; --ec-red:#b42318; --ec-red-bg:#fdf0ef;
  --ec-amber:#a05a00; --ec-amber-bg:#fff5e6; --ec-slate:#475467; --ec-slate-bg:#f1f3f5;
  --ec-m2m:#b9770e; --ec-radius:10px;
  font:13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:var(--ec-ink);
}
.ecp .ec .toolbar{background:var(--ec-card);border:1px solid var(--ec-line);border-bottom:0;
  border-radius:var(--ec-radius) var(--ec-radius) 0 0;padding:11px 14px 0}
.ecp .ec .tb-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ecp .ec .tb-title{font-size:15px;font-weight:650;letter-spacing:-.01em;margin:0 4px 0 0;white-space:nowrap}
.ecp .ec .stats{display:flex;align-items:center;gap:8px;flex-wrap:wrap;flex:1 1 auto;min-width:0}
.ecp .ec .tb-row > .seg,.ecp .ec .tb-row > .btn,.ecp .ec .tb-row > .ver,.ecp .ec .tb-row > .tb-title{flex:none}
.ecp .ec .stat{display:inline-flex;align-items:baseline;gap:5px;padding:4px 10px;border-radius:7px;
  background:#f7f8fa;border:1px solid var(--ec-line)}
.ecp .ec .stat b{font-size:13px;font-weight:650;font-variant-numeric:tabular-nums}
.ecp .ec .stat span{font-size:11.5px;color:var(--ec-ink-3)}
.ecp .ec .stat b.idle{color:var(--ec-ink-3);font-weight:400}
.ecp .ec .stat[title]{cursor:help}
.ecp .ec .stat.is-mtm{background:#fff8ec;border-color:#f2e2c2}
.ecp .ec .stat.is-mtm b{color:var(--ec-m2m)}
.ecp .ec .stat.is-app{background:#f7f2fc;border-color:#e4d8f2}
.ecp .ec .stat.is-app b{color:#6b3fa0}
@media (max-width:1180px){.ecp .ec .stat.is-secondary{display:none}}
.ecp .ec .divider{width:1px;height:20px;background:var(--ec-line);margin:0 1px}
.ecp .ec .tb-row.second .divider{height:18px;margin:0 3px}
/* Meetings tab toolbar: primary/hours/warn stat variants and the third
   (per-day) chip row, none of which the Contacts toolbar needed. */
.ecp .ec .stat.is-primary b{color:var(--ec-accent)}
.ecp .ec .stat.is-hours{background:#eef6f0;border-color:#d6ead9}
.ecp .ec .stat.is-warn{background:var(--ec-amber-bg);border-color:#f2d9ae}
.ecp .ec .stat.is-warn b{color:var(--ec-amber)}
.ecp .ec .tb-row.third{margin-top:8px;padding:0 0 10px;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.ecp .ec .tb-label{font-size:11px;font-weight:650;letter-spacing:.03em;text-transform:uppercase;color:var(--ec-ink-3);margin-right:2px}
.ecp .ec .chip-date{padding:4px 9px;display:inline-flex;align-items:baseline;gap:4px}
.ecp .ec .chip-more{font-size:11.5px;color:var(--ec-ink-3);cursor:help;white-space:nowrap}
.ecp .ec .seg{display:inline-flex;background:#eef0f3;border-radius:8px;padding:3px;gap:2px}
.ecp .ec .seg button{appearance:none;border:0;background:transparent;font:inherit;font-weight:550;
  color:var(--ec-ink-2);padding:6px 14px;border-radius:6px;cursor:pointer;white-space:nowrap;
  transition:background .12s,color .12s,box-shadow .12s}
.ecp .ec .seg button:hover{color:var(--ec-ink)}
.ecp .ec .seg button[aria-selected="true"]{background:var(--ec-card);color:var(--ec-ink);box-shadow:0 1px 2px rgba(16,24,40,.12)}
.ecp .ec .btn2{appearance:none;font:inherit;font-weight:550;border:1px solid var(--ec-line-strong);
  background:var(--ec-card);color:var(--ec-ink-2);padding:6px 11px;border-radius:7px;cursor:pointer;
  display:inline-flex;align-items:center;gap:6px}
.ecp .ec .btn2:hover{background:#f7f8fa;color:var(--ec-ink)}
.ecp .ec .btn2.narrow{padding:6px 9px;min-width:52px;justify-content:center;font-variant-numeric:tabular-nums}
.ecp .ec .ver{font-size:11px;font-weight:600;letter-spacing:.02em;color:var(--ec-ink-3);background:#f4f5f7;
  border:1px solid var(--ec-line);border-radius:6px;padding:4px 8px;font-variant-numeric:tabular-nums;white-space:nowrap}
.ecp .ec .tb-row.second{margin-top:10px;padding:9px 0 10px;border-top:1px solid var(--ec-line)}
.ecp .ec .chip{appearance:none;font:inherit;font-size:12px;font-weight:550;border:1px solid var(--ec-line-strong);
  background:var(--ec-card);color:var(--ec-ink-2);padding:4px 11px;border-radius:999px;cursor:pointer;white-space:nowrap;
  /* the site has a .chip of its own — the widget's chips are sentence case, not small caps */
  text-transform:none;letter-spacing:normal;font-family:inherit;line-height:1.45;display:inline-block}
.ecp .ec .chip:hover{border-color:#b9c0c9;color:var(--ec-ink)}
.ecp .ec .chip[aria-pressed="true"]{background:var(--ec-accent);border-color:var(--ec-accent);color:#fff}
.ecp .ec .srch{position:relative;margin-left:auto;flex:0 1 260px;min-width:170px}
.ecp .ec .srch input{font:inherit;width:100%;min-width:170px;padding:6px 10px 6px 30px;
  border:1px solid var(--ec-line-strong);border-radius:7px;background:var(--ec-card);color:var(--ec-ink);outline:none}
.ecp .ec .srch input:focus{border-color:var(--ec-accent);box-shadow:0 0 0 3px rgba(26,115,199,.13)}
.ecp .ec .srch svg{position:absolute;left:9px;top:50%;transform:translateY(-50%);color:var(--ec-ink-3)}
.ecp .ec .tablecard{background:var(--ec-card);border:1px solid var(--ec-line);border-radius:0 0 var(--ec-radius) var(--ec-radius);
  box-shadow:0 1px 2px rgba(16,24,40,.05),0 1px 3px rgba(16,24,40,.06);overflow:hidden}
.ecp .ec .viewnote{display:flex;align-items:center;gap:8px;padding:8px 14px;background:#fafbfc;
  border-bottom:1px solid var(--ec-line);color:var(--ec-ink-2);font-size:12px}
.ecp .ec .viewnote b{color:var(--ec-ink);font-weight:600}
.ecp .ec .viewnote .spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(26,115,199,.22);
  border-top-color:var(--ec-accent);border-radius:50%;animation:ecspin .7s linear infinite;flex:none}
.ecp .ec .viewnote .loadstep{color:var(--ec-ink-2);font-weight:550;animation:ecpulse 1.6s ease-in-out infinite}
@keyframes ecspin{to{transform:rotate(360deg)}}
@keyframes ecpulse{0%,100%{opacity:1}50%{opacity:.55}}
.ecp .ec .loadbar{height:3px;background:linear-gradient(90deg,transparent,var(--ec-accent),transparent);
  background-size:40% 100%;background-repeat:no-repeat;animation:ecbar 1.1s linear infinite}
@keyframes ecbar{0%{background-position:-40% 0}100%{background-position:140% 0}}

/* ---- grid ---- */
.ecp .ec .holder{overflow:auto;background:var(--ec-card)}
.ecp .ec table.g{border-collapse:separate;border-spacing:0;font-size:11.5px;table-layout:fixed}
.ecp .ec table.g th,.ecp .ec table.g td{border-right:1px solid #f0f2f4;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
.ecp .ec table.g thead th{position:sticky;top:0;z-index:20;background:#fbfcfd;border-bottom:1px solid var(--ec-line-strong);
  border-right:1px solid var(--ec-line);padding:6px 7px 5px;text-align:left;vertical-align:top}
.ecp .ec table.g thead tr.fr th{top:47px;z-index:19;padding:3px 5px 5px;border-bottom:1px solid var(--ec-line-strong)}
.ecp .ec table.g thead th .ct{font-size:9.5px;font-weight:650;letter-spacing:.035em;text-transform:uppercase;
  color:var(--ec-ink-2);white-space:normal;line-height:1.3;min-height:36px;display:block;cursor:pointer;user-select:none}
.ecp .ec table.g thead th .ct .ar{opacity:.35;font-size:9px;margin-left:3px}
.ecp .ec table.g thead th[data-dir] .ct .ar{opacity:.95;color:var(--ec-accent)}
.ecp .ec table.g thead tr.fr input,.ecp .ec table.g thead tr.fr select{font:inherit;font-size:10.5px;
  border:1px solid var(--ec-line);border-radius:5px;padding:3px 5px;background:var(--ec-card);
  color:var(--ec-ink);width:100%;outline:none}
.ecp .ec table.g thead tr.fr input:focus,.ecp .ec table.g thead tr.fr select:focus{border-color:var(--ec-accent)}
.ecp .ec table.g tbody tr{height:30px;background:var(--ec-row)}
.ecp .ec table.g tbody tr:nth-child(even){background:var(--ec-row-alt)}
.ecp .ec table.g tbody tr:hover{background:var(--ec-row-hover)}
.ecp .ec table.g tbody td{padding:4px 7px;border-bottom:1px solid #eef0f3;height:30px;background:transparent}
/* the source tint is a gradient on the row; an inherited background would make every
   cell restart it, so ordinary cells stay transparent and only frozen ones repaint */
.ecp .ec table.g td.c,.ecp .ec table.g th.c{text-align:center}
.ecp .ec table.g tbody tr.src-mtm{background:linear-gradient(90deg,rgba(212,136,6,.16),rgba(212,136,6,0) 340px),var(--ec-row)}
.ecp .ec table.g tbody tr.src-mtm:nth-child(even){background:linear-gradient(90deg,rgba(212,136,6,.18),rgba(212,136,6,.02) 340px),var(--ec-row-alt)}
.ecp .ec table.g tbody tr.src-app{background:linear-gradient(90deg,rgba(107,63,160,.12),rgba(107,63,160,0) 340px),var(--ec-row)}
.ecp .ec table.g tbody tr.src-app:nth-child(even){background:linear-gradient(90deg,rgba(107,63,160,.14),rgba(107,63,160,.02) 340px),var(--ec-row-alt)}
/* frozen columns: opaque, so the scrolling content dives under a hard edge */
.ecp .ec table.g th.fz,.ecp .ec table.g td.fz{position:sticky;z-index:12}
.ecp .ec table.g thead th.fz{z-index:22}
.ecp .ec table.g tbody td.fz{background:var(--ec-row)}
.ecp .ec table.g tbody tr:nth-child(even) td.fz{background:var(--ec-row-alt)}
.ecp .ec table.g tbody tr:hover td.fz{background:var(--ec-row-hover)}
.ecp .ec table.g tbody tr.src-mtm td.fz{background:#fffaf1}
.ecp .ec table.g tbody tr.src-app td.fz{background:#fdfbff}
.ecp .ec table.g tbody tr.src-mtm td.fz-1{box-shadow:inset 3px 0 0 #e2a233}
.ecp .ec table.g tbody tr.src-app td.fz-1{box-shadow:inset 3px 0 0 #8b5fbf}
.ecp .ec table.g th.fz-edge,.ecp .ec table.g td.fz-edge{box-shadow:9px 0 10px -9px rgba(16,24,40,.28);
  border-right:1px solid var(--ec-line-strong)}
.ecp .ec table.g th.fz-right,.ecp .ec table.g td.fz-right{box-shadow:-9px 0 10px -9px rgba(16,24,40,.28);
  border-left:1px solid var(--ec-line-strong);border-right:0}
.ecp .ec .foot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#fbfcfd;
  border-top:1px solid var(--ec-line);color:var(--ec-ink-2);font-size:12px;padding:7px 10px}
.ecp .ec .foot .pg{appearance:none;border:1px solid var(--ec-line-strong);background:var(--ec-card);
  color:var(--ec-ink-2);border-radius:6px;font:inherit;font-size:12px;padding:3px 9px;cursor:pointer}
.ecp .ec .foot .pg[aria-current="true"]{background:var(--ec-accent);border-color:var(--ec-accent);color:#fff}
.ecp .ec .foot .pg:disabled{opacity:.45;cursor:default}
.ecp .ec .foot select{font:inherit;font-size:12px;border:1px solid var(--ec-line-strong);border-radius:6px;
  padding:3px 6px;background:var(--ec-card);color:var(--ec-ink-2)}
.ecp .ec .foot .rows{font-variant-numeric:tabular-nums}
.ecp .ec .empty{padding:26px;text-align:center;color:var(--ec-ink-3);font-size:12.5px}

/* ---- cell atoms, straight from the widget ---- */
.ecp .ec a.link{color:var(--ec-accent);text-decoration:none;font-weight:550;cursor:pointer}
.ecp .ec a.link:hover{text-decoration:underline}
.ecp .ec .muted{color:var(--ec-ink-3)}
.ecp .ec .pill{display:inline-block;padding:1px 7px;border-radius:999px;font-size:10px;font-weight:600;
  line-height:1.5;white-space:nowrap;border:1px solid transparent}
.ecp .ec .pill.green{background:var(--ec-green-bg);color:var(--ec-green);border-color:#c5e9d8}
.ecp .ec .pill.green-o{background:#fff;color:var(--ec-green);border-color:#a9dcc4}
.ecp .ec .pill.red{background:var(--ec-red-bg);color:var(--ec-red);border-color:#f4cdc9}
.ecp .ec .pill.amber{background:var(--ec-amber-bg);color:var(--ec-amber);border-color:#f5dfb8}
.ecp .ec .pill.blue{background:var(--ec-accent-soft);color:var(--ec-accent);border-color:#cfe0f2}
.ecp .ec .pill.slate{background:var(--ec-slate-bg);color:var(--ec-slate);border-color:#e2e5e9}
.ecp .ec .pill.ghost{background:transparent;color:var(--ec-ink-3);border-color:var(--ec-line-strong);border-style:dashed}
.ecp .ec .pill.src-mtm{background:#fff4e0;color:var(--ec-m2m);border-color:#efd6a4}
.ecp .ec .pill.src-app{background:#f3ecfb;color:#6b3fa0;border-color:#dcc9ee}
.ecp .ec .prio{display:inline-block;min-width:22px;text-align:center;padding:1px 5px;border-radius:5px;
  font-size:10px;font-weight:700}
.ecp .ec .prio.p1{background:#fdecea;color:#b42318}
.ecp .ec .prio.p2{background:var(--ec-amber-bg);color:var(--ec-amber)}
.ecp .ec .prio.p3{background:var(--ec-slate-bg);color:var(--ec-slate)}
.ecp .ec .tick{font-size:14px;line-height:1;color:var(--ec-green);font-weight:700}
.ecp .ec .tick.off{color:#d2d6db;font-weight:400}
.ecp .ec .num{font-variant-numeric:tabular-nums;font-weight:600}
.ecp .ec .num.zero{color:#c7ccd3;font-weight:400}
/* Meetings tab: date-in-two-lines, room/spot markers, buyer-role letters —
   the original (eventMeetings) carries these, Contacts never needed them. */
.ecp .ec .dt{display:block;line-height:1.16;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ecp .ec .dt .d{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ec-ink)}
.ecp .ec .dt .t{font-variant-numeric:tabular-nums;font-size:10px;color:var(--ec-ink-3);margin-left:4px}
.ecp .ec .where{display:inline-block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:bottom}
.ecp .ec .where.is-spot{color:var(--ec-ink-2)}
.ecp .ec .where .wmark{color:var(--ec-ink-3);font-size:9.5px;margin-right:4px;letter-spacing:.04em}
.ecp .ec .bq{color:var(--ec-ink-3);font-size:9.5px;font-weight:700;margin-right:2px}
.ecp .ec .bq.e{color:var(--ec-red)}
.ecp .ec .bq.t{color:var(--ec-accent)}
.ecp .ec .bq.u{color:var(--ec-green)}
.ecp .ec .bq.c{color:var(--ec-amber)}
.ecp .ec .cmt{display:block;color:var(--ec-ink-2);font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ecp .ec .cmt .tag{color:var(--ec-accent);font-weight:600}
.ecp .ec .trash{color:#b6bcc4;cursor:pointer;display:inline-flex}
.ecp .ec .trash:hover{color:var(--ec-red)}
.ecp .ec .selwrap{display:inline-flex;align-items:center;gap:4px;cursor:pointer}
.ecp .ec .selwrap .caret{color:transparent;font-size:8px;line-height:1;transition:color .12s}
.ecp .ec tbody tr:hover .selwrap .caret{color:var(--ec-ink-3)}
.ecp .ec .lock{color:#c7ccd3;font-size:9px;margin-left:3px}
.ecp .ec td.editing{padding:0}
.ecp .ec td.editing select,.ecp .ec td.editing textarea{font:inherit;font-size:11.5px;width:100%;height:100%;
  border:1px solid var(--ec-accent);border-radius:0;padding:2px 4px;background:#fff;color:var(--ec-ink);outline:none}
.ecp .ec td.editing textarea{height:60px;position:relative;z-index:30;resize:none}
.ecp .ec .dr{display:flex;flex-direction:column;gap:3px}
.ecp .ec .dr .drline{display:flex;align-items:center;gap:4px}
.ecp .ec .dr label{font-size:9px;font-weight:700;letter-spacing:.04em;color:var(--ec-ink-3);flex:0 0 22px}
.ecp .ec .dr .drclear{align-self:flex-start;margin-left:26px;font-size:9.5px;color:var(--ec-ink-3);cursor:pointer;
  border:0;background:none;padding:0}
.ecp .ec .dr .drclear:hover{color:var(--ec-red)}

/* ---- loading skeleton ---- */
.ecp .ec .skel{padding:6px 8px}
.ecp .ec .skel-row{display:flex;gap:10px;padding:6px 2px;animation:ecfade .5s ease both}
.ecp .ec .skel-cell{height:10px;border-radius:4px;
  background:linear-gradient(90deg,#eef1f4 25%,#e2e6ea 37%,#eef1f4 63%);background-size:400% 100%;
  animation:ecsk 1.3s ease infinite}
@keyframes ecsk{0%{background-position:100% 50%}100%{background-position:0 50%}}
@keyframes ecfade{from{opacity:0}to{opacity:1}}
.ecp .ec .just-built{animation:ecflash .9s ease}
@keyframes ecflash{0%{background:var(--ec-accent-soft)}100%{background:transparent}}

/* ---- Old UI shell: the production table this replaced ---- */
.ecp .ec.ui-old .old-head{background:skyblue;color:#fff;border-radius:15px;padding:8px 14px;font-size:x-large}
.ecp .ec.ui-old .old-head .oldSwitch{float:right;display:inline-flex;background:rgba(255,255,255,.3);
  border-radius:9px;padding:3px;gap:2px;margin:4px 12px 0 0}
.ecp .ec.ui-old .old-head .oldSwitch button{appearance:none;border:0;background:transparent;font-family:inherit;
  font-size:13px;font-weight:600;color:#fff;padding:7px 15px;border-radius:6px;cursor:pointer;white-space:nowrap}
.ecp .ec.ui-old .old-head .oldSwitch button:hover{background:rgba(255,255,255,.2)}
.ecp .ec.ui-old .old-head .oldSwitch button[aria-selected="true"]{background:#fff;color:#2c7ea8}
.ecp .ec.ui-old .old-head p.counter{color:#fff;font-size:15px;font-weight:400;margin:10px;
  background:none;border:0;padding:0;min-width:0;border-radius:0;display:block}
/* the old table carries no source tint — that arrived with the new UI */
.ecp .ec.ui-old table.g tbody tr.src-mtm td.fz-1,
.ecp .ec.ui-old table.g tbody tr.src-app td.fz-1{box-shadow:none}
.ecp .ec.ui-old .tablecard{border-radius:0;border:0;box-shadow:none;margin-top:12px}
.ecp .ec.ui-old table.g{font-size:15px}
.ecp .ec.ui-old table.g thead th{background:#fff;border-bottom:1px solid #dbdbdb}
.ecp .ec.ui-old table.g thead th .ct{font-size:15px;font-weight:400;letter-spacing:0;text-transform:none;
  color:#313949;min-height:2.4em}
.ecp .ec.ui-old table.g thead tr.fr th{top:auto}
.ecp .ec.ui-old table.g tbody tr,.ecp .ec.ui-old table.g tbody tr:nth-child(even){background:#fff}
.ecp .ec.ui-old table.g tbody td{color:#313949;font-size:15px;height:auto;padding:.5em .75em;
  border-bottom:1px solid #edf4fa;border-right:0}
.ecp .ec.ui-old table.g tbody tr.src-mtm,.ecp .ec.ui-old table.g tbody tr.src-app{background:#fff}
.ecp .ec.ui-old table.g tbody td.fz{background:#fff}
/* ---- eventAccounts: shell, hover panel and the help modal ---- */
.ecp .ec.ea .old-head{position:relative}
.ecp .ec.ea .old-head .help{position:absolute;right:14px;top:10px;background:none;border:0;
  font-size:1.5rem;line-height:1;color:#007bff;cursor:pointer;text-decoration:none}
.ecp .ec.ea .old-head .help:hover{color:#0056b3}
.ecp .ec.ea .ea-load{display:flex;align-items:center;gap:8px;font-size:15px;color:#fff;margin:10px 0 0}
.ecp .ec.ea .ea-load .spin{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.35);
  border-top-color:#fff;border-radius:50%;animation:ecspin .7s linear infinite;flex:none}
.ecp .ec.ea table.g thead th .ct{cursor:pointer}
.ecp .ec.ea table.g tbody td{font-size:15px}
.ecp .ec.ea .tick{font-size:15px;color:#067647}
.ecp .ec.ea .tick.off{color:#c7ccd3}
.ea-tip{position:absolute;z-index:1000;background:rgba(0,0,0,.7);color:#fff;padding:10px;border-radius:5px;
  white-space:pre-line;font-family:Arial,sans-serif;font-size:13px;max-width:520px}
.ea-tip .ea-tip-pre{margin:0;font-family:"Courier New",monospace;font-size:12px;white-space:pre;color:#fff}
.ea-tip a.custom-link{color:#fff !important;text-decoration:underline !important;cursor:pointer}
.ea-mask{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1100;display:flex;align-items:flex-start;
  justify-content:center;padding:40px 16px;overflow:auto}
.ea-modal{width:min(800px,100%);background:#fff;border-radius:6px;box-shadow:0 12px 40px rgba(0,0,0,.35)}
.ea-modal .hd{display:flex;align-items:center;gap:12px;padding:16px;border-bottom:1px solid #dee2e6}
.ea-modal .hd h5{margin:0;font:500 20px/1.2 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#212529}
.ea-modal .hd .x{margin-left:auto;background:none;border:0;font-size:24px;line-height:1;color:#000;opacity:.5;cursor:pointer}
.ea-modal .hd .x:hover{opacity:.9}
.ea-modal .bd{padding:16px;font:14px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#212529}
.ea-modal .bd ul{margin:6px 0 10px 18px;padding:0}
.ea-modal .bd li{margin:3px 0}

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


/* ---------- data table: sticky head, a filter under every column, sorting ----------
   The platform's own tables work this way, so a demo that filters only by chips
   feels wrong the moment anyone tries a column. */
function dataTable(container, cols, rows, opts) {
  opts = opts || {};
  const st = { f: {}, sort: opts.sort || null, dir: opts.dir || 'asc', cap: opts.cap || 300 };
  const textOf = (c, r) => c.text ? String(c.text(r) ?? '') : String(r[c.k] ?? '');
  const htmlOf = (c, r) => c.html ? c.html(r) : E(textOf(c, r));

  function options(c) {
    return [...new Set(rows.map(r => textOf(c, r)).filter(Boolean))].sort();
  }
  function pass(r) {
    return cols.every(c => {
      const v = (st.f[c.k] || '').trim().toLowerCase();
      if (!v) return true;
      const t = textOf(c, r).toLowerCase();
      if (c.filter === 'select') return t === v;
      if (c.filter === 'min') return (parseFloat(textOf(c, r)) || 0) >= parseFloat(v);
      return t.includes(v);
    });
  }
  function draw() {
    let list = rows.filter(pass);
    if (st.sort) {
      const c = cols.find(x => x.k === st.sort), s = st.dir === 'desc' ? -1 : 1;
      list = list.slice().sort((a, b) => {
        const x = c.sortVal ? c.sortVal(a) : textOf(c, a), y = c.sortVal ? c.sortVal(b) : textOf(c, b);
        return (x > y ? 1 : x < y ? -1 : 0) * s;
      });
    }
    const shown = list.slice(0, st.cap);
    container.innerHTML = `<table class="d"><thead>
      <tr>${cols.map(c => `<th class="${c.filter === 'none' ? '' : 'sortable'}" data-s="${c.k}"
            ${st.sort === c.k ? `data-dir="${st.dir}"` : ''}>${E(c.label)}</th>`).join('')}</tr>
      <tr class="fr">${cols.map(c => {
        if (c.filter === 'none') return '<th></th>';
        if (c.filter === 'select') return `<th><select data-f="${c.k}"><option value="">All</option>${
          options(c).map(o => `<option ${st.f[c.k] === o ? 'selected' : ''}>${E(o)}</option>`).join('')}</select></th>`;
        return `<th><input data-f="${c.k}" value="${E(st.f[c.k] || '')}" placeholder="${c.filter === 'min' ? '≥ n' : ''}"></th>`;
      }).join('')}</tr></thead>
      <tbody>${shown.map(r => `<tr>${cols.map(c => `<td class="${c.cls || ''}">${htmlOf(c, r)}</td>`).join('')}</tr>`).join('')
        || `<tr><td colspan="${cols.length}" class="none">Nothing matches these filters.</td></tr>`}</tbody></table>
      <div class="tfoot"><span>${list.length} of ${rows.length} rows</span>
        ${list.length > st.cap ? `<span>· showing the first ${st.cap}</span>` : ''}
        <span style="flex:1"></span>${Object.values(st.f).some(v => v) ? '<button class="ghost2" data-clear>clear filters</button>' : ''}</div>`;
    if (opts.onDraw) opts.onDraw(list);
  }
  container.addEventListener('input', e => { const i = e.target.closest('[data-f]'); if (!i) return;
    st.f[i.dataset.f] = i.value; const k = i.dataset.f, pos = i.selectionStart; draw();
    const again = container.querySelector(`[data-f="${k}"]`); if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (_) {} } });
  container.addEventListener('change', e => { const sel = e.target.closest('select[data-f]'); if (!sel) return;
    st.f[sel.dataset.f] = sel.value; draw(); });
  container.addEventListener('click', e => {
    if (e.target.closest('[data-clear]')) { st.f = {}; draw(); return; }
    const th = e.target.closest('th.sortable[data-s]'); if (!th) return;
    if (st.sort === th.dataset.s) st.dir = st.dir === 'asc' ? 'desc' : 'asc'; else { st.sort = th.dataset.s; st.dir = 'asc'; }
    draw(); });
  draw();
  return { redraw: draw, state: st };
}

/* ---------- page ---------- */
function ensureCss() {
  if (document.getElementById('ecp-css')) return;
  const st = document.createElement('style'); st.id = 'ecp-css'; st.textContent = CSS; document.head.appendChild(st);
}
const Page = {
  ensureCss,
  async mount(host, campaignId, initialTab) {
    ensureCss();
    const c = (await ZOHO.CRM.API.getRecord({ Entity:'Campaigns', RecordID:campaignId })).data[0];
    this.c = c;
    const days = [];
    for (let d = new Date(c.Start), end = new Date(c.End); d <= end; d.setDate(d.getDate()+1)) days.push(new Date(d));
    this.days = days;

    host.classList.add('ecp');
    host.innerHTML = `
      ${this.banner(c)}
      <div class="tabs" role="tablist">
        ${['Overview','Accounts','Contacts','Meetings','Room schedule','Calendar sync','At a glance'].map(t=>`<button role="tab" data-t="${t}" aria-selected="${t===(initialTab||'Overview')}">${t}</button>`).join('')}
        ${['Timeline'].map(t=>`<button role="tab" disabled style="opacity:.4;cursor:default">${t}</button>`).join('')}
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
    this.tab(initialTab || 'Overview');
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
    if (name === 'Accounts')  return AccountsTab.render(b, this);
    if (name === 'Contacts')  return Contacts.render(b, this);
    if (name === 'Meetings')  return Meetings.render(b, this);
    if (name === 'Room schedule') return window.RoomSchedule.render(b, this);
    if (name === 'Calendar sync') return window.CRMWidgets2.Reconcile.render(b, this);
    if (name === 'At a glance') return window.CRMApollo.EventMatrix.render(b, this);
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

/* ---------- tab: contacts ---------------------------------------------
   A port of the EventContacts widget (v2.3.0). Three views over one fetch:
   the production table it replaced (Old UI), the working list before the
   event (Event preparation), and everything including comments (Full view).
   Column set, labels, pills, filters and cell editors follow the widget.
---------------------------------------------------------------------- */
const EC_VERSION = '2.3.0';
const SRC_MTM = 'Meet to Match', SRC_APP = 'Event App';
const SRC_BADGES = [{ v:SRC_MTM, label:'MtM', cls:'src-mtm' }, { v:SRC_APP, label:'Event app', cls:'src-app' }];
const SRC_FILTER_VALUES = [SRC_MTM, SRC_APP, 'No source'];
const SWITCH_MS = 150;                       // short pause so the skeleton gets to blink
const HEIGHT_STEPS = [1, 1.2, 1.6, 2.4];
const GRID_BASE = 560;

/* Regions for the toolbar counters. Country comes from the account as typed,
   so the lists carry the spellings the CRM actually holds. */
const USA_SET = new Set(['usa','us','u.s.','u.s.a.','united states','united states of america','america']);
const EUROPE_SET = new Set(['albania','andorra','austria','belarus','belgium','bosnia','bosnia and herzegovina',
  'bulgaria','croatia','cyprus','czech republic','czechia','denmark','estonia','faroe islands','finland','france',
  'germany','gibraltar','greece','hungary','iceland','ireland','italy','kosovo','latvia','liechtenstein','lithuania',
  'luxembourg','malta','moldova','monaco','montenegro','netherlands','the netherlands','north macedonia','macedonia',
  'norway','poland','portugal','romania','russia','san marino','serbia','slovakia','slovenia','spain','sweden',
  'switzerland','turkey','ukraine','united kingdom','uk','great britain','england','scotland','wales',
  'northern ireland','vatican city']);
const normCountry = v => String(v == null ? '' : v).trim().toLowerCase();
const isUSA = v => USA_SET.has(normCountry(v));
const isEurope = v => EUROPE_SET.has(normCountry(v));

const VIEW_NOTE = {
  prep:'<b>Event preparation</b> — working contact list before the event. BD and SL comments are hidden.',
  full:'<b>Full view</b> — every column, including BD and SL comments.'
};
const ATTENDING_PILL = { 'Yes':'green','No':'red','Investigating':'amber','Unknown':'slate','W/o linked Contacts':'ghost' };
const STATUS_PILL = { 'Meeting held':'green','Meeting booked':'green-o','Meeting declined':'red','Not interested':'red',
  "Don't contact":'slate','Not attending':'slate','No Reply':'ghost','Contacted':'blue','Open':'ghost' };
// statuses written by the meetings, not by hand — same rule as the old UI
const STATUS_READONLY = ['Meeting booked','Meeting declined','Meeting held'];
// statuses that mean the contact is coming
const STATUS_FORCES_ATTENDING_YES = ['Not interested','Meeting booked','Meeting declined','Meeting held'];
const ATTENDING_VALUES = ['Investigating','Yes','No','Unknown'];
const STATUS_VALUES = ['Open','Contacted','Meeting booked','Meeting held','Meeting declined',
  'No Reply','Not interested','Not attending',"Don't contact"];

/* ---------- cell formatters ---------- */
const ecTick = v => v ? '<span class="tick">&#10003;</span>' : '<span class="tick off">&ndash;</span>';
const ecShownSources = r => SRC_BADGES.filter(b => (r.sources || []).includes(b.v));
const ecSource = r => { const b = ecShownSources(r);
  return b.length ? b.map(x => `<span class="pill ${x.cls}">${x.label}</span>`).join(' ') : '<span class="tick off">&ndash;</span>'; };
const ecPill = (map, readonlyList) => (v, r) => {
  if (!v) return '<span class="muted">&mdash;</span>';
  const tail = !r.conName ? ''
    : (readonlyList && readonlyList.includes(v))
      ? '<span class="lock" title="Set from meetings">&#128274;</span>'
      : '<span class="caret">&#9660;</span>';
  return `<span class="selwrap"><span class="pill ${map[v] || 'slate'}">${E(v)}</span>${tail}</span>`;
};
const ecCount = v => { const n = Number(v || 0); return `<span class="num ${n === 0 ? 'zero' : ''}">${n}</span>`; };
const ecPrio = v => v ? `<span class="prio ${String(v).toLowerCase()}">${E(v)}</span>` : '';
const ecComment = v => v ? `<span class="cmt">${E(v).replace(/@(\w+)/g, '<span class="tag">@$1</span>')}</span>`
                         : '<span class="muted">&mdash;</span>';
const ecPrioConf = v => v === '1'
  ? '<span class="selwrap"><span class="pill blue">1</span><span class="caret">&#9660;</span></span>'
  : '<span class="selwrap"><span class="num zero">0</span><span class="caret">&#9660;</span></span>';
function ecFmtDate(iso) {
  const d = new Date(iso); if (isNaN(d)) return String(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
const ecDate = v => v ? `<span class="muted">${E(ecFmtDate(v))}</span>` : '';
const ecTrash = r => r.conName
  ? `<span class="trash" data-del="${E(r.id)}" title="Unlink contact"><svg width="14" height="14" viewBox="0 0 24 24"
     fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
     <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/></svg></span>` : '';
const ecLink = (mod, id, text) => text
  ? `<a class="link" data-open="${mod}:${E(id)}">${E(text)}</a>` : '<span class="muted">&mdash;</span>';

/* ---------- filters ---------- */
const ecList = values => ({ type:'list', values });
const ecUnique = (rows, k) => [...new Set(rows.map(r => r[k]).filter(Boolean))].sort();

/* ---------- the grid ----------------------------------------------------
   Sticky head, a filter under every column, sorting, local pagination and
   frozen columns — the same table shape the widget has under Tabulator. */
function ecGrid(host, cols, rows, st, hooks) {
  const lastFrozen = cols.reduce((acc, c, i) => c.frozen === 'l' ? i : acc, -1);
  const textOf = (c, r) => c.text ? String(c.text(r) ?? '') : String(r[c.k] ?? '');
  const htmlOf = (c, r) => c.fmt ? c.fmt(r[c.k], r) : E(textOf(c, r));

  function pass(r) {
    return cols.every(c => {
      const f = c.filter; if (!f) return true;
      if (f.type === 'daterange') {
        const a = st.f[c.k + ':from'] || '', b = st.f[c.k + ':to'] || '';
        if (!a && !b) return true;
        const d = String(r[c.k] || '').slice(0, 10); if (!d) return false;
        return (!a || d >= a) && (!b || d <= b);
      }
      const v = st.f[c.k];
      if (!v) return true;
      if (f.type === 'tick') return v === 'blank' ? r[c.k] == null : String(!!r[c.k]) === v;
      if (f.type === 'atleast') { const n = Number(v); return isNaN(n) ? true : Number(r[c.k] || 0) >= n; }
      if (f.type === 'empty') return v === 'empty' ? !r[c.k] : !!r[c.k];
      if (f.type === 'srcs') return v === 'No source'
        ? ecShownSources(r).length === 0 : (r.sources || []).includes(v);
      if (f.type === 'list') return textOf(c, r) === v;
      return textOf(c, r).toLowerCase().includes(String(v).toLowerCase());
    });
  }

  function filterCell(c) {
    const f = c.filter; if (!f) return '';
    const cur = st.f[c.k] || '';
    const opts = vals => vals.map(v => `<option${cur === v ? ' selected' : ''}>${E(v)}</option>`).join('');
    if (f.type === 'tick') { const L = f.labels || { yes:'&#10003;', no:'&#10007;' };
      return `<select data-f="${c.k}"><option value="">All</option>`
      + `<option value="true"${cur==='true'?' selected':''}>${L.yes}</option>`
      + `<option value="false"${cur==='false'?' selected':''}>${L.no}</option>`
      + (f.blank ? `<option value="blank"${cur==='blank'?' selected':''}>&nbsp;</option>` : '')
      + `</select>`; }
    if (f.type === 'list' || f.type === 'srcs')
      return `<select data-f="${c.k}"><option value="">All</option>${opts(f.values)}</select>`;
    if (f.type === 'empty') return `<select data-f="${c.k}"><option value="">All</option>`
      + `<option value="not_empty"${cur==='not_empty'?' selected':''}>Not empty</option>`
      + `<option value="empty"${cur==='empty'?' selected':''}>Empty</option></select>`;
    if (f.type === 'atleast') return `<input data-f="${c.k}" value="${E(cur)}" placeholder="&#8805; n">`;
    if (f.type === 'daterange') return `<div class="dr">`
      + `<div class="drline"><label>FROM</label><input type="date" data-f="${c.k}:from" value="${E(st.f[c.k+':from']||'')}"></div>`
      + `<div class="drline"><label>TO</label><input type="date" data-f="${c.k}:to" value="${E(st.f[c.k+':to']||'')}"></div>`
      + `<button class="drclear" type="button" data-drclear="${c.k}">clear</button></div>`;
    return `<input data-f="${c.k}" value="${E(cur)}" placeholder="">`;
  }

  function pageButtons(cur, pages) {
    const out = [], win = 2;
    const from = Math.max(1, cur - win), to = Math.min(pages, cur + win);
    if (from > 1) out.push(1, '…');
    for (let i = from; i <= to; i++) out.push(i);
    if (to < pages) out.push('…', pages);
    return out.map(n => n === '…' ? '<span class="rows">…</span>'
      : `<button class="pg" data-pg="${n}" aria-current="${n === cur}">${n}</button>`).join('');
  }

  function draw() {
    let list = rows.filter(pass);
    if (st.sort) {
      const c = cols.find(x => x.k === st.sort), s = st.dir === 'desc' ? -1 : 1;
      if (c) list = list.slice().sort((a, b) => {
        const x = c.sortVal ? c.sortVal(a) : textOf(c, a), y = c.sortVal ? c.sortVal(b) : textOf(c, b);
        return (x > y ? 1 : x < y ? -1 : 0) * s;
      });
    }
    const pages = Math.max(1, Math.ceil(list.length / st.size));
    if (st.page > pages) st.page = pages;
    const from = (st.page - 1) * st.size, page = list.slice(from, from + st.size);

    let left = 0; const offs = {};
    cols.forEach(c => { if (c.frozen === 'l') { offs[c.k] = left; left += c.w; } });
    const cls = (c, i) => [c.cls || '', c.align === 'c' ? 'c' : '',
      c.frozen === 'l' ? 'fz' : '', c.frozen === 'r' ? 'fz fz-right' : '',
      c.frozen === 'l' && i === lastFrozen ? 'fz-edge' : '',
      c.frozen === 'l' ? (offs[c.k] === 0 ? 'fz-1' : 'fz-2') : ''].filter(Boolean).join(' ');
    const style = c => c.frozen === 'l' ? `left:${offs[c.k]}px` : c.frozen === 'r' ? 'right:0' : '';
    const arrow = c => st.sort === c.k ? (st.dir === 'asc' ? '&#8593;' : '&#8595;') : '&#8597;';

    host.innerHTML = `<div class="holder"><table class="g">
      <colgroup>${cols.map(c => `<col style="width:${c.w}px">`).join('')}</colgroup>
      <thead>
        <tr>${cols.map((c, i) => `<th class="${cls(c, i)}" style="${style(c)}"${
          c.help ? ` title="${E(c.help)}"` : ''}${
          st.sort === c.k ? ` data-dir="${st.dir}"` : ''}><span class="ct"${
          c.sortable === false ? '' : ` data-s="${c.k}"`}>${c.title}${
          c.sortable === false ? '' : `<span class="ar">${arrow(c)}</span>`}</span></th>`).join('')}</tr>
        <tr class="fr">${cols.map((c, i) => `<th class="${cls(c, i)}" style="${style(c)}">${filterCell(c)}</th>`).join('')}</tr>
      </thead>
      <tbody>${page.map(r => {
        const tint = st.noTint ? ''
                   : (r.sources || []).includes(SRC_MTM) ? 'src-mtm'
                   : (r.sources || []).includes(SRC_APP) ? 'src-app' : '';
        return `<tr class="${tint}" data-id="${E(r.id)}">${cols.map((c, i) => {
          const ed = c.editor && c.editor.can(r) ? ` data-ed="${c.k}"` : '';
          const tip = c.tooltip ? ` title="${E(textOf(c, r))}"` : '';
          const hov = c.tip ? ` data-tip="${c.k}"` : '';
          return `<td class="${cls(c, i)}" style="${style(c)}"${ed}${tip}${hov}>${htmlOf(c, r)}</td>`;
        }).join('')}</tr>`;
      }).join('') || `<tr><td colspan="${cols.length}"><div class="empty">No contacts match the current filters</div></td></tr>`}
      </tbody></table></div>
      <div class="foot">
        <button class="pg" data-pg="prev"${st.page === 1 ? ' disabled' : ''}>&#8249; Prev</button>
        ${pageButtons(st.page, pages)}
        <button class="pg" data-pg="next"${st.page === pages ? ' disabled' : ''}>Next &#8250;</button>
        <select data-size>${(st.sizes || [50,100,200,500,2000]).map(n => `<option${st.size===n?' selected':''}>${n}</option>`).join('')}</select>
        <span style="flex:1"></span>
        <span class="rows">${list.length ? `${from+1}-${Math.min(from+st.size, list.length)} of ${list.length} rows` : '0 rows'}</span>
      </div>`;
    const holder = q(host, '.holder');
    if (holder) holder.style.maxHeight = (st.maxH || Math.round(GRID_BASE * HEIGHT_STEPS[st.height || 0])) + 'px';
    if (hooks && hooks.onDraw) hooks.onDraw(list);
  }

  host.oninput = e => {
    const i = e.target.closest('[data-f]'); if (!i) return;
    st.f[i.dataset.f] = i.value; st.page = 1;
    const k = i.dataset.f, isText = i.tagName === 'INPUT' && i.type !== 'date', pos = isText ? i.selectionStart : 0;
    draw();
    const again = host.querySelector(`[data-f="${k}"]`);
    if (again && isText) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (_) {} }
  };
  host.onchange = e => {
    const sel = e.target.closest('select[data-f]');
    if (sel) { st.f[sel.dataset.f] = sel.value; st.page = 1; return draw(); }
    const size = e.target.closest('[data-size]');
    if (size) { st.size = Number(size.value); st.page = 1; return draw(); }
  };
  host.onclick = e => {
    const cl = e.target.closest('[data-drclear]');
    if (cl) { delete st.f[cl.dataset.drclear + ':from']; delete st.f[cl.dataset.drclear + ':to']; return draw(); }
    const pg = e.target.closest('[data-pg]');
    if (pg) { const v = pg.dataset.pg;
      st.page = v === 'prev' ? Math.max(1, st.page - 1) : v === 'next' ? st.page + 1 : Number(v);
      draw(); const h = q(host, '.holder'); if (h) h.scrollTop = 0; return; }
    const th = e.target.closest('.ct[data-s]');
    if (th) { const k = th.dataset.s;
      if (st.sort === k) st.dir = st.dir === 'asc' ? 'desc' : 'asc'; else { st.sort = k; st.dir = 'asc'; }
      return draw(); }
    if (hooks && hooks.onClick) hooks.onClick(e, draw);
  };
  draw();
  return { redraw: draw };
}

function ecSkeleton(cols) {
  const widths = [70, 80, 170, 60, 70, 120, 160, 130, 110, 200, 130, 130, 90, 90, 90];
  let out = '';
  for (let r = 0; r < 15; r++) {
    let cells = '';
    for (let c = 0; c < cols; c++) {
      const base = widths[c % widths.length] - (r % 3) * 10;
      cells += `<div class="skel-cell" style="width:${base}px;animation-delay:${(c * 60 + r * 40) % 700}ms"></div>`;
    }
    out += `<div class="skel-row" style="animation-delay:${r * 30}ms">${cells}</div>`;
  }
  return `<div class="skel">${out}</div>`;
}

const Contacts = {
  state:{ mode:'prep', rows:null, campaign:null, chips:{ misc:new Set(), prio:new Set(), status:new Set(), source:new Set() },
    search:'', grid:{ f:{}, sort:null, dir:'asc', page:1, size:100, height:0 }, firstPaint:true, loading:true },

  async render(b, P) {
    const S = this.state; this.P = P;
    S.grid = { f:{}, sort:null, dir:'asc', page:1, size:100, height:S.grid.height || 0 };
    S.firstPaint = true;
    b.innerHTML = '<div class="ec ui-new" id="ec-root"></div>';
    this.host = q(b, '#ec-root');
    this.paintShell();
    this.setLoading(true, 'Loading contacts…');

    if (!S.rows || S.campaign !== P.c.id) {
      S.campaign = P.c.id;
      const { rows } = await coqlAll(
        `select id, Attending_Status, Meeting_Status, Priority, Source, Is_Target, Met_Last_Year, Added_By,
         BD_Comment, SL_Comment, Priority_for_Conference, Booked_Meetings, Declined_Meetings, Held_Meetings,
         Created_Time, Origin_Contact, Origin_Contact.Full_Name, Origin_Contact.Title,
         Account_Name, Account_Name.Account_Name, Account_Name.Country, Account_Name.State, Account_Name.City,
         Account_Name.Owner, Account_Name.Account_Sales
         from Event_Contacts where Campaign = '${P.c.id}'`);
      this.setLoading(true, 'Loading meetings…');
      await new Promise(r => setTimeout(r, 90));
      this.setLoading(true, 'Matching previous events…');
      await new Promise(r => setTimeout(r, 90));
      S.rows = rows.map(r => ({
        id: r.id,
        previousMeetingSet: !!r.Met_Last_Year,
        sources: Array.isArray(r.Source) ? r.Source : (r.Source ? [r.Source] : []),
        accId: r.Account_Name, accName: r['Account_Name.Account_Name'] || '',
        hasTarget: !!r.Is_Target, TargetFor: r.Priority || '',
        ownerId: r['Account_Name.Owner'] || '', coOwnerId: r['Account_Name.Account_Sales'] || '',
        originContactId: r.Origin_Contact, conName: r['Origin_Contact.Full_Name'] || '',
        Country: r['Account_Name.Country'] || '', State: r['Account_Name.State'] || '',
        City: r['Account_Name.City'] || '', Title: r['Origin_Contact.Title'] || '',
        Attending_status: r.Attending_Status || '', Status: r.Meeting_Status || '',
        Booked_Meetings: r.Booked_Meetings || 0, Declined_Meetings: r.Declined_Meetings || 0,
        Held_Meetings: r.Held_Meetings || 0,
        Comment: r.BD_Comment || '', SL_Comment: r.SL_Comment || '',
        Priority_for_Conference: r.Priority_for_Conference || '0',
        Added_by: r.Added_By || '', dateAdded: r.Created_Time || ''
      }));
    }
    this.setLoading(true, 'Building table…');
    setTimeout(() => this.build(), SWITCH_MS);
    P.refreshHeader();
  },

  /* ---------- shell ---------- */
  paintShell() {
    const S = this.state;
    if (S.mode === 'old') return this.paintOldShell();
    this.host.className = 'ec ui-new';
    this.host.innerHTML = `
      <div class="toolbar">
        <div class="tb-row">
          <h2 class="tb-title">All Contacts</h2>
          <div class="stats">
            <div class="stat"><b id="c-all">0</b><span>all</span></div>
            <div class="stat"><b id="c-shown">0</b><span>shown</span></div>
            <div class="divider"></div>
            <div class="stat is-secondary"><b id="c-t">0</b><span>targets</span></div>
            <div class="stat" title="Contacts with at least one booked meeting"><b id="c-b">0</b><span>booked</span></div>
            <div class="stat is-secondary"><b id="c-o">0</b><span>open</span></div>
            <div class="divider"></div>
            <div class="stat is-secondary" title="Contacts in the United States"><b id="c-usa">0</b><span>USA</span></div>
            <div class="stat is-secondary" title="Contacts in Europe"><b id="c-eu">0</b><span>Europe</span></div>
            <div class="divider"></div>
            <div class="stat is-mtm" title="Contacts from the Meet to Match list"><b id="c-mtm">0</b><span>MtM</span></div>
            <div class="stat is-app" title="Contacts from the event app"><b id="c-app">0</b><span>Event app</span></div>
          </div>
          ${this.segHtml()}
          <button type="button" class="btn2 narrow" id="c-height" title="Table height: 1× / 1.2× / 1.6× / 2.4×">&#8597; ${HEIGHT_STEPS[S.grid.height||0]}&times;</button>
          <button type="button" class="btn2" id="c-refresh">&#8635; Refresh</button>
          <span class="ver" id="c-ver" title="Widget version">v${EC_VERSION}</span>
        </div>
        <div class="tb-row second" id="c-chips">${this.chipsHtml()}
          <div class="srch"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            <input id="c-search" type="search" placeholder="Search account, contact, title&hellip;" value="${E(S.search)}"></div>
        </div>
      </div>
      <div class="tablecard">
        <div class="loadbar" id="c-loadbar" style="visibility:hidden"></div>
        <div class="viewnote" id="c-load"></div>
        <div id="c-tw"></div>
      </div>`;
    this.bind();
  },

  paintOldShell() {
    this.host.className = 'ec ui-old';
    this.host.innerHTML = `
      <div class="old-head">All Contacts
        ${this.segHtml('oldSwitch')}
        <p class="counter" id="c-old-all">All Contacts: 0</p>
        <p class="counter" id="c-old-actual">Actual Contacts: 0</p>
      </div>
      <div class="tablecard">
        <div class="loadbar" id="c-loadbar" style="visibility:hidden"></div>
        <div class="viewnote" id="c-load" style="display:none"></div>
        <div id="c-tw"></div>
      </div>`;
    this.bind();
  },

  segHtml(cls) {
    const m = this.state.mode;
    return `<div class="${cls || 'seg'}" id="c-view" role="tablist">
      <button type="button" role="tab" data-v="old" aria-selected="${m==='old'}">Old UI</button>
      <button type="button" role="tab" data-v="prep" aria-selected="${m==='prep'}">Event preparation</button>
      <button type="button" role="tab" data-v="full" aria-selected="${m==='full'}">Full view</button>
    </div>`;
  },

  chipsHtml() {
    const S = this.state;
    const chip = (g, v, l) => `<button type="button" class="chip" data-group="${g}" data-k="${E(v)}"
      aria-pressed="${S.chips[g].has(v)}">${l}</button>`;
    return [
      chip('misc','target','Targets only'), chip('misc','prev','Met last year'),
      '<div class="divider"></div>',
      chip('source',SRC_MTM,'MtM'), chip('source',SRC_APP,'Event app'), chip('source','No source','No source'),
      '<div class="divider"></div>',
      chip('prio','P1','P1'), chip('prio','P2','P2'), chip('prio','P3','P3'),
      '<div class="divider"></div>',
      chip('status','Meeting booked','Booked'), chip('status','Meeting held','Held'),
      chip('status','Meeting declined','Declined'), chip('status','Open','Open'), chip('status','Contacted','Contacted')
    ].join('');
  },

  bind() {
    const S = this.state, root = this.host;
    q(root,'#c-view').onclick = e => {
      const x = e.target.closest('button[data-v]'); if (!x || x.dataset.v === S.mode) return;
      S.mode = x.dataset.v; S.grid.page = 1;
      this.paintShell(); this.setLoading(true, 'Building table…');
      setTimeout(() => this.build(), SWITCH_MS);
    };
    const chips = q(root,'#c-chips');
    if (chips) chips.onclick = e => {
      const x = e.target.closest('button[data-k]'); if (!x) return;
      const set = S.chips[x.dataset.group], v = x.dataset.k;
      set.has(v) ? set.delete(v) : set.add(v);
      x.setAttribute('aria-pressed', String(set.has(v)));
      S.grid.page = 1; this.build();
    };
    const box = q(root,'#c-search');
    if (box) box.oninput = e => {
      S.search = e.target.value.trim().toLowerCase(); S.grid.page = 1;
      const pos = e.target.selectionStart; this.build();
      const again = q(this.host,'#c-search');
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (_) {} }
    };
    const h = q(root,'#c-height');
    if (h) h.onclick = () => { S.grid.height = (S.grid.height + 1) % HEIGHT_STEPS.length;
      h.innerHTML = `&#8597; ${HEIGHT_STEPS[S.grid.height]}&times;`; this.build(); };
    const rf = q(root,'#c-refresh');
    if (rf) rf.onclick = () => { S.rows = null; S.campaign = null;
      this.render(document.getElementById('ecp-body'), this.P); };
  },

  /* ---------- loading ---------- */
  setLoading(on, step) {
    const TILES = ['c-all','c-shown','c-t','c-b','c-o','c-usa','c-eu','c-mtm','c-app'];
    this.state.loading = on;
    const bar = q(this.host,'#c-loadbar'); if (bar) bar.style.visibility = on ? 'visible' : 'hidden';
    const note = q(this.host,'#c-load');
    if (on) {
      if (note) note.innerHTML = `<span class="spin"></span><span class="loadstep">${E(step || 'Loading…')}</span>`;
      const tw = q(this.host,'#c-tw');
      if (tw && !tw.querySelector('table')) tw.innerHTML = ecSkeleton(11);
      // zeroes before the data lands would read as "there are no contacts"
      TILES.forEach(id => { const el = q(this.host,'#'+id);
        if (el) { el.textContent = '—'; el.classList.add('idle'); } });
    } else {
      TILES.forEach(id => { const el = q(this.host,'#'+id); if (el) el.classList.remove('idle'); });
    }
  },

  /* ---------- build ---------- */
  build() {
    const S = this.state; if (!S.rows) return;
    const list = S.rows.filter(r => this.keep(r));
    const cols = S.mode === 'old' ? this.oldColumns() : this.columns(S.mode);
    S.grid.noTint = S.mode === 'old';        // the source tint arrived with the new UI
    const tw = q(this.host,'#c-tw'); if (!tw) return;
    this.grid = ecGrid(tw, cols, list, S.grid, {
      onDraw: shown => this.stats(shown),
      onClick: (e, redraw) => this.cellClick(e, redraw)
    });
    this.setLoading(false);
    const note = q(this.host,'#c-load');
    if (note && S.mode !== 'old') note.innerHTML = VIEW_NOTE[S.mode];
    const table = q(tw,'table');
    if (table) { table.classList.add('just-built'); setTimeout(() => table.classList.remove('just-built'), 900); }
  },

  keep(r) {
    const S = this.state, c = S.chips;
    if (c.misc.has('target') && !r.hasTarget) return false;
    if (c.misc.has('prev') && !r.previousMeetingSet) return false;
    // inside a group the chips are an OR, between groups an AND
    if (c.prio.size && !c.prio.has(r.TargetFor)) return false;
    if (c.status.size && !c.status.has(r.Status)) return false;
    if (c.source.size) {
      const list = r.sources || [];
      const hit = [...c.source].some(v => v === 'No source' ? ecShownSources(r).length === 0 : list.includes(v));
      if (!hit) return false;
    }
    if (S.search) {
      const hay = [r.accName, r.conName, r.Title, r.ownerId, r.City, r.Country].join(' ').toLowerCase();
      if (!hay.includes(S.search)) return false;
    }
    return true;
  },

  stats(shown) {
    const S = this.state, rows = S.rows;
    if (S.mode === 'old') {
      const a = q(this.host,'#c-old-all'), b = q(this.host,'#c-old-actual');
      if (a) a.textContent = 'All Contacts: ' + rows.length;
      if (b) b.textContent = 'Actual Contacts: ' + shown.length;
      return;
    }
    const set = (id, v) => this.paintStat(id, v);
    set('c-all', rows.length);
    set('c-shown', shown.length);
    set('c-t', rows.filter(r => r.hasTarget).length);
    // "booked" counts CONTACTS with a booked meeting, not the meetings themselves
    set('c-b', rows.filter(r => Number(r.Booked_Meetings || 0) > 0).length);
    set('c-o', rows.filter(r => r.Status === 'Open').length);
    set('c-usa', rows.filter(r => isUSA(r.Country)).length);
    set('c-eu', rows.filter(r => isEurope(r.Country)).length);
    set('c-mtm', rows.filter(r => (r.sources || []).includes(SRC_MTM)).length);
    set('c-app', rows.filter(r => (r.sources || []).includes(SRC_APP)).length);
    S.firstPaint = false;
  },

  // numbers count up, but only on the first paint — filters have to feel instant
  paintStat(id, value) {
    const el = q(this.host,'#'+id); if (!el) return;
    if (!this.state.firstPaint) { el.textContent = value; return; }
    const duration = 420, start = performance.now();
    const tick = now => {
      // rAF hands back the frame's start time, which can predate the performance.now()
      // captured a line earlier — without the lower clamp the first frame paints a negative
      const k = Math.max(0, Math.min(1, (now - start) / duration));
      el.textContent = Math.round(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  /* ---------- columns ---------- */
  columns(view) {
    const rows = this.state.rows, roadshow = this.P.c.Event_Type === 'Roadshow';
    const cols = [
      { k:'previousMeetingSet', title:'Met<br>last<br>year', w:76, align:'c', frozen:'l',
        fmt:v => ecTick(v), text:r => r.previousMeetingSet ? 'yes' : 'no', filter:{ type:'tick' } },
      { k:'sources', title:'Source', w:152, frozen:'l', fmt:(v, r) => ecSource(r),
        sortVal:r => (r.sources || []).join(), filter:{ type:'srcs', values:SRC_FILTER_VALUES } },
      { k:'accName', title:'Account', w:178, frozen:'l', tooltip:true,
        fmt:(v, r) => ecLink('Accounts', r.accId, v), filter:{ type:'input' } },
      { k:'hasTarget', title:'Is target', w:64, align:'c', fmt:v => ecTick(v),
        text:r => r.hasTarget ? 'yes' : 'no', filter:{ type:'tick' } },
      { k:'TargetFor', title:'Priority', w:82, align:'c', fmt:v => ecPrio(v), filter:ecList(['P1','P2','P3']) },
      { k:'ownerId', title:'Account owner', w:122, filter:ecList(ecUnique(rows,'ownerId')) },
      { k:'conName', title:'Contact name', w:166, tooltip:true,
        fmt:(v, r) => ecLink('Contacts', r.originContactId, v), filter:{ type:'input' } },
      { k:'Country', title:'Country', w:138, tooltip:true, filter:ecList(ecUnique(rows,'Country')) }
    ];
    if (roadshow) cols.push({ k:'State', title:'State', w:120, filter:ecList(ecUnique(rows,'State')) });
    cols.push(
      { k:'City', title:'City', w:114, filter:{ type:'input' } },
      { k:'Title', title:'Title', w:220, tooltip:true, filter:{ type:'input' } },
      { k:'Attending_status', title:'Attending Status', w:132, fmt:ecPill(ATTENDING_PILL),
        filter:ecList(ATTENDING_VALUES), editor:{ type:'list', values:ATTENDING_VALUES, can:r => !!r.conName } },
      { k:'Status', title:'Meeting<br>status', w:136, fmt:ecPill(STATUS_PILL, STATUS_READONLY),
        filter:ecList(STATUS_VALUES),
        editor:{ type:'list', values:STATUS_VALUES, can:r => !!r.conName && !STATUS_READONLY.includes(r.Status) } },
      { k:'Booked_Meetings', title:'Booked meetings', w:98, align:'c', fmt:ecCount,
        sortVal:r => Number(r.Booked_Meetings||0), filter:{ type:'atleast' } },
      { k:'Declined_Meetings', title:'Declined meetings', w:102, align:'c', fmt:ecCount,
        sortVal:r => Number(r.Declined_Meetings||0), filter:{ type:'atleast' } },
      { k:'Held_Meetings', title:'Held meetings', w:94, align:'c', fmt:ecCount,
        sortVal:r => Number(r.Held_Meetings||0), filter:{ type:'atleast' } });
    // BD and SL comments — Full view only
    if (view === 'full') cols.push(
      { k:'Comment', title:'BD comment', w:210, tooltip:true, fmt:ecComment, filter:{ type:'empty' },
        editor:{ type:'text', can:() => true } },
      { k:'SL_Comment', title:'SL comment', w:190, tooltip:true, fmt:ecComment, filter:{ type:'empty' },
        editor:{ type:'text', can:() => true } });
    cols.push(
      { k:'Priority_for_Conference', title:'Priority for conf', w:90, align:'c', fmt:ecPrioConf,
        filter:ecList(['0','1']), editor:{ type:'list', values:['0','1'], can:r => !!r.conName } },
      { k:'Added_by', title:'Added by', w:118, filter:ecList(ecUnique(rows,'Added_by')) },
      { k:'dateAdded', title:'Date added', w:172, fmt:ecDate, sortVal:r => r.dateAdded || '',
        filter:{ type:'daterange' } },
      { k:'delete', title:'', w:44, align:'c', frozen:'r', sortable:false, fmt:(v, r) => ecTrash(r) });
    return cols;
  },

  oldColumns() {
    const rows = this.state.rows, roadshow = this.P.c.Event_Type === 'Roadshow';
    const cols = [
      { k:'previousMeetingSet', title:'Met<br>Last<br>Year?', w:80, align:'c', fmt:v => ecTick(v),
        text:r => r.previousMeetingSet ? 'yes' : 'no', filter:{ type:'tick' } },
      { k:'accName', title:'Account', w:140, frozen:'l',
        fmt:(v, r) => v ? ecLink('Accounts', r.accId, v) : 'No Data', filter:{ type:'input' } },
      { k:'hasTarget', title:'Is<br>Target?', w:80, align:'c', fmt:v => ecTick(v),
        text:r => r.hasTarget ? 'yes' : 'no', filter:{ type:'tick' } },
      { k:'TargetFor', title:'Priority', w:90, filter:ecList(['P1','P2','P3']) },
      { k:'ownerId', title:'Account<br>Owner', w:130, filter:ecList(ecUnique(rows,'ownerId')) },
      { k:'coOwnerId', title:'Account<br>Sales', w:130, filter:ecList(ecUnique(rows,'coOwnerId')) },
      { k:'conName', title:'Contact<br>Name', w:150,
        fmt:(v, r) => v ? ecLink('Contacts', r.originContactId, v) : 'No Data', filter:{ type:'input' } },
      { k:'Country', title:'Country', w:130, filter:ecList(ecUnique(rows,'Country')) }
    ];
    if (roadshow) cols.push({ k:'State', title:'State', w:120, filter:ecList(ecUnique(rows,'State')) });
    cols.push(
      { k:'City', title:'City', w:120, filter:{ type:'input' } },
      { k:'Title', title:'Title', w:200, filter:{ type:'input' } },
      { k:'Attending_status', title:'Attending<br>Status', w:140, filter:ecList(ATTENDING_VALUES),
        editor:{ type:'list', values:ATTENDING_VALUES, can:r => !!r.conName } },
      { k:'Status', title:'Meeting<br>Status', w:150, filter:ecList(STATUS_VALUES),
        editor:{ type:'list', values:STATUS_VALUES, can:r => !!r.conName && !STATUS_READONLY.includes(r.Status) } },
      { k:'Booked_Meetings', title:'Booked<br>Meetings', w:110, align:'c',
        sortVal:r => Number(r.Booked_Meetings||0), filter:{ type:'atleast' } },
      { k:'Declined_Meetings', title:'Declined<br>Meetings', w:110, align:'c',
        sortVal:r => Number(r.Declined_Meetings||0), filter:{ type:'atleast' } },
      { k:'Held_Meetings', title:'Held<br>Meetings', w:100, align:'c',
        sortVal:r => Number(r.Held_Meetings||0), filter:{ type:'atleast' } },
      { k:'Comment', title:'BD Comment', w:220, filter:{ type:'empty' }, editor:{ type:'text', can:() => true } },
      { k:'SL_Comment', title:'SL<br>Comment', w:200, filter:{ type:'empty' }, editor:{ type:'text', can:() => true } },
      { k:'Priority_for_Conference', title:'Priority<br>for Conf', w:100, align:'c',
        filter:ecList(['0','1']), editor:{ type:'list', values:['0','1'], can:r => !!r.conName } },
      { k:'Added_by', title:'Added<br>by', w:130, filter:ecList(ecUnique(rows,'Added_by')) },
      { k:'dateAdded', title:'Date Added', w:170, fmt:v => v ? E(ecFmtDate(v)) : '',
        sortVal:r => r.dateAdded || '', filter:{ type:'daterange' } },
      { k:'delete', title:'', w:44, align:'c', sortable:false, fmt:(v, r) => ecTrash(r) });
    return cols;
  },

  /* ---------- cell interaction ---------- */
  cellClick(e, redraw) {
    const del = e.target.closest('[data-del]');
    if (del) return this.unlink(del.dataset.del);
    const open = e.target.closest('[data-open]');
    if (open) { const [Entity, RecordID] = open.dataset.open.split(':');
      ZOHO.CRM.UI.Record.open({ Entity, RecordID }); return; }
    const td = e.target.closest('td[data-ed]');
    if (td && !td.classList.contains('editing')) this.edit(td, redraw);
  },

  edit(td, redraw) {
    const S = this.state, id = td.closest('tr').dataset.id, k = td.dataset.ed;
    const row = S.rows.find(r => String(r.id) === String(id)); if (!row) return;
    const cols = S.mode === 'old' ? this.oldColumns() : this.columns(S.mode);
    const col = cols.find(c => c.k === k); if (!col || !col.editor) return;
    const prev = td.innerHTML;
    td.classList.add('editing');
    if (col.editor.type === 'list') {
      td.innerHTML = `<select>${col.editor.values.map(v =>
        `<option${v === row[k] ? ' selected' : ''}>${E(v)}</option>`).join('')}</select>`;
      const sel = td.querySelector('select'); sel.focus();
      let closed = false;
      const cancel = () => { if (closed) return; closed = true;
        td.classList.remove('editing'); td.innerHTML = prev; };
      sel.onchange = () => { if (closed) return; closed = true; this.commit(row, k, sel.value, redraw); };
      sel.onblur = cancel;
      sel.onkeydown = ev => { if (ev.key === 'Escape') cancel(); };
    } else {
      td.innerHTML = `<textarea>${E(row[k] || '')}</textarea>`;
      const ta = td.querySelector('textarea'); ta.focus();
      ta.onblur = () => this.commit(row, k, ta.value, redraw);
      ta.onkeydown = ev => { if (ev.key === 'Escape') { ta.onblur = null; td.classList.remove('editing'); redraw(); } };
    }
  },

  async commit(row, k, value, redraw) {
    if (value === row[k]) { redraw(); return; }
    const FIELD = { Attending_status:'Attending_Status', Status:'Meeting_Status',
      Comment:'BD_Comment', SL_Comment:'SL_Comment', Priority_for_Conference:'Priority_for_Conference' };
    const patch = { [FIELD[k]]: value };
    // a status that means the contact is coming also flips Attending, as it does in the widget
    if (k === 'Status' && STATUS_FORCES_ATTENDING_YES.includes(value) && row.Attending_status !== 'Yes')
      patch.Attending_Status = 'Yes';
    const before = { ...row };
    row[k] = value;
    if (patch.Attending_Status) row.Attending_status = 'Yes';
    redraw();
    try {
      await ZOHO.CRM.API.updateRecord({ Entity:'Event_Contacts', RecordID:row.id, APIData:patch });
    } catch (err) {
      Object.assign(row, before); redraw();
      const note = q(this.host,'#c-load');
      if (note) {
        note.innerHTML = `<b>Not saved</b> — ${E(err.message || 'the CRM refused the write')}`;
        setTimeout(() => { if (this.state.mode !== 'old' && note.isConnected) note.innerHTML = VIEW_NOTE[this.state.mode]; }, 4000);
      }
    }
  },

  async unlink(id) {
    const S = this.state, i = S.rows.findIndex(r => String(r.id) === String(id));
    if (i < 0) return;
    const [gone] = S.rows.splice(i, 1);
    this.build();
    try { await ZOHO.CRM.API.deleteRecord({ Entity:'Event_Contacts', RecordID:id }); }
    catch (err) { S.rows.splice(i, 0, gone); this.build(); }
  }
};


/* ---------- tab: accounts ----------------------------------------------
   A port of the eventAccounts widget. Accounts of the campaign assembled
   from three sources — accounts with a linked contact, target accounts by
   tag, and accounts of the previous event that had live meetings — then
   re-flagged and rendered, exactly the three stages the widget names.
---------------------------------------------------------------------- */
const EA_HELP = {
  accName: 'Account name. Clickable — opens in Zoho CRM.',
  hasTarget: 'Indicates whether the account is targeted for the campaign (checkmark — yes, cross — no).',
  TargetFor: 'Priority or category of the target account (if any).',
  ownerId: 'Account owner (responsible manager).',
  contactsAdded: 'Number of contacts linked to this account for the current event.',
  contactsCountAll: 'Total number of contacts linked to the account across all events.',
  Booked_Meetings: 'Number of scheduled meetings for the account in the current event.',
  Declined_Meetings: 'Number of declined meetings for the account.',
  Held_Meetings: 'Number of held (completed) meetings for the account.',
  Country: 'Country associated with the account.',
  State: 'Region or state associated with the account.',
  dateAdded: 'Date when the first contact of this account was added to the current event.',
  previousMeetingSet: 'Whether the account participated last year (checkmark — yes, cross — no).',
  meetingSet: 'Whether the account has meetings in the current event (checkmark — yes, cross — no).',
  isExistingContacts: 'MeetToMatch indicator — whether the account has contacts added via bulk insert (checkmark — yes, cross — no).',
  HasRoadshowTag: 'Indicates that the account is related to a Roadshow (only for Roadshow events).'
};

const EA_GENERAL_HELP = `
<b>General description:</b><br>
This widget displays a comprehensive list of accounts associated with the selected Event Campaign in Zoho CRM.
It uses a 3-stage processing system to ensure all accounts are properly loaded, flagged, and displayed with accurate metrics.

<b>Event types:</b><br>
- <b>Roadshow</b> — a special event type where the list of target accounts is formed by combined conditions:<br>
  <ul>
    <li><b>All accounts with the Roadshow tag</b> (e.g., "RS Nordics 2026") are included if this tag is configured for the event.</li>
    <li><b>All accounts with a regular Target tag</b> (e.g., "Target Account P3") are also included, but only if they match the event's region (Region) or country (Country), if specified.</li>
    <li>The final list is a <b>union</b> of accounts with the Roadshow tag <b>and</b> accounts with the Target tag that match the region/country.</li>
    <li>Example filter: (Tag:starts_with:RS Nordics 2026) <b>OR</b> ((Tag:starts_with:Target) <b>AND</b> (Region:equals:EMEA))</li>
    <li>If region is not specified but country is, filtering is by country.</li>
    <li>If neither region nor country is specified, filtering is only by tag.</li>
  </ul>
- <b>Regular event</b> — target accounts are determined only by the Target tag:<br>
  <ul>
    <li>Accounts with a Target tag (e.g., "Target Account P3") are included.</li>
    <li>Example filter: (Tag:starts_with:Target)</li>
  </ul>

<b>How accounts are loaded (3-stage system):</b><br>
1. <b>STAGE 1: LOAD ALL ACCOUNTS</b><br>
   - <b>Contact accounts</b> — all accounts with at least one contact linked to the current event<br>
   - <b>Target accounts</b> — accounts marked as target (by tag and region filtering)<br>
   - <b>Previous year accounts</b> — accounts from previous event that had active meetings (Booked/Held)<br>

2. <b>STAGE 2: RECALCULATE ALL FLAGS</b><br>
   - <b>Target flags</b> — hasTarget, TargetFor, HasRoadshowTag<br>
   - <b>Meeting flags</b> — meetingSet, Booked/Declined/Held counts and links<br>
   - <b>Previous meeting flags</b> — previousMeetingSet<br>
   - <b>Contact flags</b> — contactsAdded, isExistingContacts<br>

3. <b>STAGE 3: RENDER IN TABLE</b><br>
   - Prepare unified data for Tabulator<br>
   - Create table with all columns and filters<br>
   - Update statistics panel<br>

<b>Key features:</b><br>
- <b>Unified processing</b> — all accounts (from contacts, targets, previous year) are processed together<br>
- <b>No duplicates</b> — accounts are deduplicated by account ID<br>
- <b>Real-time flag calculation</b> — all flags are recalculated for each account<br>
- <b>Progress tracking</b> — loading animation shows detailed progress for each stage<br>
- <b>Comprehensive metrics</b> — each account shows contacts, meetings, target status, country, region, etc.<br>
- <b>Roadshow support</b> — special handling for Roadshow events with HasRoadshowTag<br>
- <b>Previous year integration</b> — accounts from previous events are included if they had active meetings<br>

<b>Loading process details:</b><br>
The widget shows detailed loading messages during the 3-stage process:<br>
- <b>Stage 1:</b> "Loading basic data", "Loading contact accounts", "Loading target accounts", "Loading previous year accounts"<br>
- <b>Stage 2:</b> "Recalculating all flags", "Processing X accounts" with progress indicators<br>
- <b>Stage 3:</b> "Initializing table", "Finalizing"<br>
- <b>Edge cases:</b> "No contact accounts found", "No target accounts found", "No previous event found"<br>
`;

/* the priority lives inside the tag name: "Target Account P1" -> "P1" */
function eaTargetFlags(tags, roadshowTag) {
  let hasTarget = false, TargetFor = '', HasRoadshowTag = false;
  (Array.isArray(tags) ? tags : []).forEach(t => {
    const name = typeof t === 'string' ? t : (t && t.name ? t.name : '');
    if (!name) return;
    if (name.toLowerCase().includes('target')) {
      hasTarget = true;
      const parts = name.split(' ');
      if (parts.length >= 3) TargetFor = parts.slice(2).join(' ');
      else if (parts.length === 2 && /^P\d+$/.test(parts[1])) TargetFor = parts[1];
      else TargetFor = 'Target';
    }
    if (roadshowTag && name.includes(roadshowTag)) HasRoadshowTag = true;
  });
  if (!TargetFor && hasTarget) TargetFor = 'Target';
  return { hasTarget, TargetFor, HasRoadshowTag };
}

const AccountsTab = {
  state:{ rows:null, campaign:null, grid:{ f:{}, sort:null, dir:'asc', page:1, size:25, maxH:700, sizes:[10,25,50,100,200] } },

  async render(b, P) {
    const S = this.state; this.P = P;
    S.grid = { f:{}, sort:null, dir:'asc', page:1, size:25, maxH:700, sizes:[10,25,50,100,200] };
    b.innerHTML = `<div class="ec ui-old ea" id="ea-root">
      <div class="old-head">All Accounts
        <button type="button" class="help" id="ea-help" title="Show help">?</button>
        <div id="ea-loading" class="ea-load"><span class="spin"></span><span class="loadstep">Initializing…</span></div>
      </div>
      <div class="tablecard"><div id="ea-tw"></div></div>
    </div>`;
    this.host = q(b, '#ea-root');
    q(this.host,'#ea-help').onclick = () => this.help();
    q(this.host,'#ea-tw').innerHTML = ecSkeleton(11);

    if (!S.rows || S.campaign !== P.c.id) { S.campaign = P.c.id; await this.load(P); }
    this.step('Initializing table...');
    await this.pause();
    this.build();
    this.step('Finalizing...');
    const el = q(this.host,'#ea-loading'); if (el) el.style.display = 'none';
    P.refreshHeader();
  },

  pause(ms) { return new Promise(r => setTimeout(r, ms || 80)); },
  step(text) {
    const el = q(this.host,'#ea-loading .loadstep');
    if (el) el.textContent = text;
  },

  /* ---------- STAGE 1: load all accounts ---------- */
  async load(P) {
    const S = this.state, c = P.c;
    const roadshowTag = c.Roadshow_Tag || null;

    this.step('Loading basic data...');
    const meetings = (await coqlAll(
      `select id, Account_Name, Account_Name.Account_Name, Meeting_Status, Meeting_DateTime_String,
       Attendees_String, Meeting_Type from Meetings where Campaign = '${c.id}'`)).rows;

    this.step('Loading contact accounts...');
    const evc = (await coqlAll(
      `select id, Origin_Contact, Origin_Contact.Full_Name, Account_Name, Account_Name.Account_Name,
       Account_Name.Owner, Account_Name.Account_Sales, Account_Name.Country, Account_Name.State,
       Account_Name.Tag, Account_Name.Count_of_Contacts, Account_Name.Cooperation_Status,
       Added_By, Created_Time, How_Created from Event_Contacts where Campaign = '${c.id}'`)).rows;
    // contacts arrive oldest first so the first one wins the Date Added of the account
    evc.sort((a, b) => String(a.Created_Time || '').localeCompare(String(b.Created_Time || '')));
    // an account the CRM marks Restricted never reaches the table
    const linked = evc.filter(r => r['Account_Name.Cooperation_Status'] !== 'Restricted' && r.Account_Name);
    this.step(linked.length ? `Found ${new Set(linked.map(r => r.Account_Name)).size} contact accounts`
                            : 'No contact accounts found for current event');
    await this.pause();

    this.step('Loading target accounts...');
    const targets = await this.targetAccounts(c, roadshowTag);
    this.step(targets.length ? `Found ${targets.length} target accounts` : 'No target accounts found');
    await this.pause();

    let prevContacts = [], prevMeetings = [];
    const prevId = c.Previous_Event_Campaigns && (c.Previous_Event_Campaigns.id || c.Previous_Event_Campaigns);
    if (prevId) {
      this.step('Loading previous year accounts...');
      prevContacts = (await coqlAll(
        `select id, Account_Name from Event_Contacts where Campaign = '${prevId}'`)).rows;
      prevMeetings = (await coqlAll(
        `select id, Account_Name, Meeting_Status from Meetings where Campaign = '${prevId}'`)).rows;
      const seen = new Set();
      prevContacts = prevContacts.filter(r => r.Account_Name && !seen.has(r.Account_Name) && seen.add(r.Account_Name));
      this.step(`Found ${prevContacts.length} previous year accounts`);
    } else {
      this.step('No previous event found, skipping previous year accounts');
    }
    await this.pause();

    /* ---------- STAGE 2: recalculate all flags ---------- */
    this.step('Recalculating all flags...');
    const map = new Map();
    const put = (id, seed) => { if (id && !map.has(id)) map.set(id, seed); };

    linked.forEach(r => put(r.Account_Name, {
      accId: r.Account_Name, accName: r['Account_Name.Account_Name'] || '',
      ownerId: r['Account_Name.Owner'] || '', coOwnerId: r['Account_Name.Account_Sales'] || '',
      Country: r['Account_Name.Country'] || '', State: r['Account_Name.State'] || '',
      tag: r['Account_Name.Tag'] || [], contactsCountAll: r['Account_Name.Count_of_Contacts'] || 0,
      source:'contacts', dateAdded: r.Created_Time || '' }));

    targets.forEach(a => put(a.id, {
      accId: a.id, accName: a.Account_Name || '',
      ownerId: a.Owner || '', coOwnerId: a.Account_Sales || '',
      Country: a.Country || '', State: a.State || '',
      tag: a.Tag || [], contactsCountAll: a.Count_of_Contacts || 0,
      source:'targets', dateAdded: '' }));

    prevContacts.forEach(r => put(r.Account_Name, {
      accId: r.Account_Name, accName: '', ownerId:'', coOwnerId:'',
      Country:'', State:'', tag:[], contactsCountAll:0, source:'previous_year', dateAdded:'' }));

    this.step(`Processing ${map.size} accounts...`);
    await this.pause();

    // accounts that only came in through last year's list still need their own record
    const thin = [...map.values()].filter(a => !a.accName).map(a => a.accId);
    if (thin.length) {
      const fill = (await coqlAll(
        `select id, Account_Name, Owner, Account_Sales, Country, State, Tag, Count_of_Contacts
         from Accounts where id in (${thin.map(x => `'${esc(x)}'`).join(',')})`)).rows;
      fill.forEach(a => { const t = map.get(a.id); if (!t) return;
        t.accName = a.Account_Name || ''; t.ownerId = a.Owner || ''; t.coOwnerId = a.Account_Sales || '';
        t.Country = a.Country || ''; t.State = a.State || ''; t.tag = a.Tag || [];
        t.contactsCountAll = a.Count_of_Contacts || 0; });
    }

    let done = 0;
    for (const [accId, a] of map) {
      done++;
      if (done % 10 === 0) this.step(`Processing accounts... ${done}/${map.size}`);
      Object.assign(a, eaTargetFlags(a.tag, roadshowTag));
      Object.assign(a, this.meetingFlags(accId, meetings));
      a.previousMeetingSet = this.previousMeetingFlag(accId, prevMeetings);
      const mine = linked.filter(r => r.Account_Name === accId);
      a.contactsAdded = mine.length;
      a.isExistingContacts = mine.some(r => r.How_Created === 'Added in bulk insert');
      a.contactsTip = mine;
      a.id = accId;
    }
    S.rows = [...map.values()];
  },

  async targetAccounts(c, roadshowTag) {
    const out = new Map();
    const search = async query => {
      const r = await ZOHO.CRM.API.searchRecord({ Entity:'Accounts', Type:'criteria', Query:query });
      return r.data || [];
    };
    if (roadshowTag) {
      let hits = await search(`(Tag:starts_with:${roadshowTag})`);
      // the platform answers an empty set rather than an error, so the widget retries with equals
      if (!hits.length) hits = await search(`(Tag:equals:${roadshowTag})`);
      hits.forEach(a => out.set(a.id, a));
    }
    let byTag = await search('(Tag:starts_with:Target)');
    if (c.Event_Type === 'Roadshow' && c.Macro_Region)
      byTag = byTag.filter(a => a.Region === c.Macro_Region);
    byTag.forEach(a => out.set(a.id, a));
    return [...out.values()];
  },

  meetingFlags(accId, meetings) {
    let Booked_Meetings = 0, Declined_Meetings = 0, Held_Meetings = 0;
    const booked = [], declined = [], held = [];
    meetings.forEach(m => {
      if (m.Account_Name !== accId) return;
      let text = m.Meeting_DateTime_String || 'Unknown Meeting Time';
      if (m.Attendees_String) text += ' ' + m.Attendees_String;
      const link = `<a class="custom-link" data-open="Meetings:${E(m.id)}">${E(text)}</a>`;
      if (m.Meeting_Status === 'Booked') { Booked_Meetings++; booked.push(link); }
      else if (m.Meeting_Status === 'Declined') { Declined_Meetings++; declined.push(link); }
      else if (m.Meeting_Status === 'Held') { Held_Meetings++; held.push(link); }
    });
    return { meetingSet: Booked_Meetings > 0 || Held_Meetings > 0,
      Booked_Meetings, Declined_Meetings, Held_Meetings,
      BookedMeetingsLinks: booked.join('<br><br>'),
      DeclinedMeetingsLinks: declined.join('<br><br>'),
      HeldMeetingsLinks: held.join('<br><br>') };
  },

  previousMeetingFlag(accId, prevMeetings) {
    const mine = prevMeetings.filter(m => m.Account_Name === accId);
    if (!mine.length) return false;
    const live = mine.some(m => m.Meeting_Status === 'Booked' || m.Meeting_Status === 'Held');
    const onlyDeclined = mine.every(m => m.Meeting_Status === 'Declined');
    return live || !onlyDeclined;
  },

  /* ---------- STAGE 3: render ---------- */
  build() {
    const S = this.state, tw = q(this.host,'#ea-tw');
    ecGrid(tw, this.columns(), S.rows, S.grid, { onClick: (e) => {
      const open = e.target.closest('[data-open]');
      if (open) { const [Entity, RecordID] = open.dataset.open.split(':');
        ZOHO.CRM.UI.Record.open({ Entity, RecordID }); }
    }});
    this.bindTooltips(tw);
  },

  columns() {
    const roadshow = this.P.c.Event_Type === 'Roadshow';
    const tick = v => v ? '<span class="tick">&#10003;</span>' : '<span class="tick off"></span>';
    const tickCross = v => v ? '<span class="tick">&#10003;</span>' : '<span class="tick off">&#10007;</span>';
    const cols = [
      { k:'meetingSet', title:'Meeting</br>Set?', w:90, align:'c', help:EA_HELP.meetingSet,
        fmt:v => tick(v), text:r => r.meetingSet ? 'yes' : 'no',
        filter:{ type:'tick', labels:{ yes:'yes', no:'no' } } },
      { k:'previousMeetingSet', title:'Meeting met<br>Last Year?', w:100, align:'c', help:EA_HELP.previousMeetingSet,
        fmt:v => tickCross(v), text:r => r.previousMeetingSet ? 'yes' : 'no', filter:{ type:'tick' } },
      { k:'isExistingContacts', title:roadshow ? 'CityMatch' : 'MeetToMatch', w:120, align:'c',
        help:EA_HELP.isExistingContacts, fmt:v => tickCross(v),
        text:r => r.isExistingContacts ? 'yes' : 'no', filter:{ type:'tick' } },
      { k:'accName', title:'Account<br>', w:240, help:EA_HELP.accName,
        fmt:(v, r) => v ? `<a class="link" data-open="Accounts:${E(r.accId)}">${E(v)}</a>` : 'No Data',
        filter:{ type:'input' } },
      { k:'hasTarget', title:'Is<br>Target?', w:80, align:'c', help:EA_HELP.hasTarget,
        fmt:v => tick(v), text:r => r.hasTarget ? 'yes' : 'no',
        filter:{ type:'tick', labels:{ yes:'&#10003;', no:'x' }, blank:true } },
      { k:'TargetFor', title:'Priority', w:80, help:EA_HELP.TargetFor, filter:{ type:'input' } },
      { k:'ownerId', title:'Account<br>Owner', w:170, help:EA_HELP.ownerId, filter:{ type:'input' } },
      { k:'contactsAdded', title:'Contacts</br>In Work', w:95, align:'c', help:EA_HELP.contactsAdded,
        tip:true, sortVal:r => Number(r.contactsAdded || 0), filter:{ type:'input' } },
      { k:'contactsCountAll', title:'Contacts</br>Overall', w:95, align:'c', help:EA_HELP.contactsCountAll,
        sortVal:r => Number(r.contactsCountAll || 0), filter:{ type:'input' } },
      { k:'Booked_Meetings', title:'Booked</br>Meetings', w:95, align:'c', help:EA_HELP.Booked_Meetings,
        tip:true, sortVal:r => Number(r.Booked_Meetings || 0), filter:{ type:'input' } },
      { k:'Declined_Meetings', title:'Declined</br>Meetings', w:95, align:'c', help:EA_HELP.Declined_Meetings,
        tip:true, sortVal:r => Number(r.Declined_Meetings || 0), filter:{ type:'input' } },
      { k:'Held_Meetings', title:'Held</br>Meetings', w:95, align:'c', help:EA_HELP.Held_Meetings,
        tip:true, sortVal:r => Number(r.Held_Meetings || 0), filter:{ type:'input' } },
      { k:'Country', title:'Country', w:200, help:EA_HELP.Country, filter:{ type:'input' } },
      { k:'State', title:'State', w:120, help:EA_HELP.State, filter:{ type:'input' } },
      { k:'dateAdded', title:'Date</br>Added', w:110, help:EA_HELP.dateAdded,
        fmt:v => v ? E(ecFmtDate(v)) : '(invalid date)', sortVal:r => r.dateAdded || '', filter:{ type:'input' } }
    ];
    if (roadshow) cols.push(
      { k:'HasRoadshowTag', title:'Has<br>RoadshowTag', w:100, align:'c', help:EA_HELP.HasRoadshowTag,
        fmt:v => tickCross(v), text:r => r.HasRoadshowTag ? 'yes' : 'no', filter:{ type:'tick' } });
    return cols;
  },

  /* Dark hover panel, 200 ms in. The widget hides it after 5.5 s despite the
     comment saying half a second — kept as it is, the delay is load-bearing for
     anyone trying to click a meeting link inside the panel. */
  bindTooltips(tw) {
    if (tw.__eaTips) return;
    tw.__eaTips = true;
    let showTimer = null, hideTimer = null, panel = null;
    const kill = () => { if (panel) { panel.remove(); panel = null; } };
    tw.addEventListener('mouseover', e => {
      const td = e.target.closest('td[data-tip]'); if (!td) return;
      const row = this.state.rows.find(r => String(r.id) === String(td.closest('tr').dataset.id));
      if (!row) return;
      const html = this.tipFor(row, td.dataset.tip);
      if (!html) return;
      clearTimeout(showTimer); clearTimeout(hideTimer); kill();
      showTimer = setTimeout(() => {
        panel = document.createElement('div');
        panel.className = 'ea-tip';
        panel.innerHTML = html;
        const box = td.getBoundingClientRect();
        panel.style.top = (window.scrollY + box.top + box.height - 3) + 'px';
        panel.style.left = (window.scrollX + box.left) + 'px';
        panel.onclick = ev => { const a = ev.target.closest('[data-open]'); if (!a) return;
          const [Entity, RecordID] = a.dataset.open.split(':');
          ZOHO.CRM.UI.Record.open({ Entity, RecordID }); };
        document.body.appendChild(panel);
      }, 200);
    });
    tw.addEventListener('mouseout', e => {
      if (!e.target.closest('td[data-tip]')) return;
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
      hideTimer = setTimeout(kill, 5500);
    });
  },

  tipFor(row, key) {
    if (key === 'Booked_Meetings')   return row.BookedMeetingsLinks;
    if (key === 'Declined_Meetings') return row.DeclinedMeetingsLinks;
    if (key === 'Held_Meetings')     return row.HeldMeetingsLinks;
    if (key !== 'contactsAdded') return '';
    const list = row.contactsTip || [];
    if (!list.length) return '';
    const names = list.map(r => r['Origin_Contact.Full_Name'] || 'Unknown');
    const added = list.map(r => `Added by: ${r.Added_By || 'Unknown'}`);
    const wN = Math.max(...names.map(x => x.length));
    const wA = Math.max(...added.map(x => x.length));
    return '<pre class="ea-tip-pre">' + list.map((r, i) => {
      const when = r.Created_Time ? ecFmtDateFull(r.Created_Time) : 'Unknown date';
      return E(names[i].padEnd(wN, ' ') + ' ' + added[i].padEnd(wA, ' ') + ' on ' + when);
    }).join('\n') + '</pre>';
  },

  help() {
    const mask = el(`<div class="ea-mask"><div class="ea-modal">
      <div class="hd"><h5>Accounts Table — Business Logic &amp; Field Explanations</h5>
        <button type="button" class="x" aria-label="Close">&times;</button></div>
      <div class="bd">${EA_GENERAL_HELP}</div></div></div>`);
    document.body.appendChild(mask);
    const close = () => mask.remove();
    q(mask,'.x').onclick = close;
    mask.onclick = e => { if (e.target === mask) close(); };
  }
};

function ecFmtDateFull(iso) {
  const d = new Date(iso); if (isNaN(d)) return String(iso);
  return `${pad2(d.getDate())}.${pad2(d.getMonth()+1)}.${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/* ---------- tab: meetings ---------- */
const EM_VERSION = '2.1.1';
// Meeting_Status — six values in the original picklist.
const EM_STATUS_PILL = { 'Booked':'blue', 'Planned':'blue', 'Held':'green', 'Finished':'green',
  'Declined':'red', 'Cancelled':'red' };
// Participants.Type: buyers get a role letter, Our Attendee is kept in its own column.
const EM_BUYER_LETTER = { 'Economic Buyer':'E', 'Technical Buyer':'T', 'User Buyer':'U', 'Coach Buyer':'C' };
const EM_ROLE_CLASS = { E:'e', T:'t', U:'u', C:'c' };
const EM_VIEW_NOTE = {
  event:'<b>Event</b> — meeting rooms and spots. Country / State / City are hidden: they repeat the campaign.',
  roadshow:'<b>Roadshow</b> — locations and meeting purpose. Room and spot columns are hidden.'
};
const emTick = v => v ? '<span class="tick">&#10003;</span>' : '<span class="tick off">&ndash;</span>';
const emStatus = v => !v ? '<span class="pill ghost">not set</span>'
  : `<span class="pill ${EM_STATUS_PILL[v] || 'slate'}">${E(v)}</span>`;
const emPrio = v => v ? `<span class="prio ${String(v).toLowerCase()}">${E(v)}</span>` : '<span class="muted">&mdash;</span>';
const emMin = v => { const n = Number(v || 0); return `<span class="num ${n === 0 ? 'zero' : ''}">${n}</span>`; };
const emWhere = (v, isSpot) => v
  ? `<span class="where${isSpot ? ' is-spot' : ''}"><span class="wmark">${isSpot ? 'SP' : 'RM'}</span>${E(v)}</span>`
  : '<span class="muted">&mdash;</span>';
const emPlain = v => v ? E(v) : '<span class="muted">&mdash;</span>';
const emBuyers = list => !list || !list.length ? '<span class="muted">&mdash;</span>'
  : list.map(b => `<span class="bq ${EM_ROLE_CLASS[b.letter]}">${b.letter}</span>${E(b.name)}`).join(', ');
function emFmtDate(when) {
  if (!when) return '<span class="muted">&mdash;</span>';
  return `<span class="dt"><span class="d">${when.day.slice(0,5)}</span><span class="t">${hhmm(when.min)}</span></span>`;
}
// "DD.MM.YYYY" -> sortable "YYYYMMDD"; blanks (parseDT returned null) sort last
const emSortKey = p => p ? p.day.slice(6,10) + p.day.slice(3,5) + p.day.slice(0,2) + String(p.min).padStart(4,'0') : '￿';
const emIsPast = p => { if (!p) return false;
  const [dd,mm,yyyy] = p.day.split('.');
  const d = new Date(+yyyy, +mm-1, +dd, Math.floor(p.min/60), p.min%60);
  return d.getTime() < Date.now();
};

const Meetings = {
  state:{ mode:'new', rows:null, campaign:null,
    chips:{ recap:new Set(), when:new Set(), place:new Set(), status:new Set(), date:new Set() },
    search:'', grid:{ f:{}, sort:'sortTs', dir:'asc', page:1, size:100, height:0 }, firstPaint:true, loading:true },

  async render(b, P) {
    const S = this.state; this.P = P;
    S.grid = { f:{}, sort:'sortTs', dir:'asc', page:1, size:100, height:S.grid.height || 0 };
    S.firstPaint = true;
    b.innerHTML = '<div class="ec ui-new" id="em-root"></div>';
    this.host = q(b, '#em-root');
    this.paintShell();
    this.setLoading(true, 'Loading meetings…');

    if (!S.rows || S.campaign !== P.c.id) {
      S.campaign = P.c.id;
      const { rows } = await coqlAll(
        `select id, Name, Meeting_DateTime_String, Meeting_Duration, Meeting_Room, Spot, Meeting_Status,
         Target_Priority, Owner, Recap, Country, State, City, Purpose_of_the_Meeting,
         Account_Name, Account_Name.Account_Name from Meetings where Campaign = '${P.c.id}'`);
      // Participants ride on the same fixture row (participants[]), but the original loads
      // them from a separate sabform-like source — mirror that shape here instead of trusting
      // a hydrated lookup for it.
      const raw = new Map(mockZoho.api.rows('Meetings').map(m => [String(m.id), m]));
      S.rows = rows.map(r => {
        const src = raw.get(String(r.id)) || {};
        const parts = Array.isArray(src.participants) ? src.participants : [];
        const buyers = parts.filter(p => EM_BUYER_LETTER[p.Type])
          .map(p => ({ name:p.Name1 || '', position:p.Position || '', letter:EM_BUYER_LETTER[p.Type] }));
        const ours = parts.filter(p => p.Type === 'Our Attendee').map(p => p.Name1 || '');
        const oursText = ours.length ? [...new Set(ours)].join(', ') : (src.Attendees_String || '');
        const p = parseDT(r.Meeting_DateTime_String);
        return {
          id:r.id, Name:r.Name || '',
          accId:r.Account_Name, accName:r['Account_Name.Account_Name'] || '',
          TargetFor:r.Target_Priority || '', Meeting_Status:r.Meeting_Status || '',
          Meeting_Recap:r.Recap || '', hasRecap:!!(r.Recap && String(r.Recap).trim()),
          ownerName:r.Owner || '', Meeting_DateTime_String:r.Meeting_DateTime_String || '',
          when:p, isPast:emIsPast(p), sortTs:emSortKey(p),
          noDate:!p, dateKey:p ? p.day : '',
          Meeting_Duration:Number(r.Meeting_Duration || 0),
          Meeting_Room:r.Meeting_Room || '', Spot:r.Spot || '',
          Country:r.Country || '', State:r.State || '', City:r.City || '',
          buyers, buyersText:buyers.map(x => `${x.name}${x.position ? ' — ' + x.position : ''} (${x.letter})`).join(', '),
          oursText, Purpose_of_the_Meeting:r.Purpose_of_the_Meeting || ''
        };
      });
    }
    this.setLoading(true, 'Building table…');
    setTimeout(() => this.build(), SWITCH_MS);
    P.refreshHeader();
  },

  /* ---------- shell ---------- */
  paintShell() {
    const S = this.state;
    if (S.mode === 'old') return this.paintOldShell();
    this.host.className = 'ec ui-new';
    this.host.innerHTML = `
      <div class="toolbar">
        <div class="tb-row">
          <h2 class="tb-title">All Meetings</h2>
          <div class="stats">
            <div class="stat is-primary"><b id="m-all">0</b><span>all</span></div>
            <div class="stat is-primary"><b id="m-shown">0</b><span>shown</span></div>
            <div class="divider"></div>
            <div class="stat" title="Distinct accounts across the meetings below"><b id="m-acc">0</b><span>accounts</span></div>
            <div class="stat is-secondary" title="Meetings with a Meeting Recap filled in"><b id="m-rec">0</b><span>recaps</span></div>
            <div class="divider"></div>
            <div class="stat is-secondary" title="Meeting_Status = Booked or Planned"><b id="m-bk">0</b><span>booked</span></div>
            <div class="stat is-secondary" title="Meeting_Status = Held or Finished"><b id="m-hl">0</b><span>held</span></div>
            <div class="stat is-hours" title="Total scheduled time, from Meeting_Duration"><b id="m-hrs">0</b><span>hours</span></div>
            <div class="stat is-warn" id="m-nodate-tile" style="display:none" title="Meetings with an empty or unparseable Meeting_DateTime_String"><b id="m-nodate">0</b><span>no date</span></div>
          </div>
          ${this.segHtml()}
          <button type="button" class="btn2 narrow" id="m-height" title="Table height: 1× / 1.2× / 1.6× / 2.4×">&#8597; ${HEIGHT_STEPS[S.grid.height||0]}&times;</button>
          <button type="button" class="btn2" id="m-refresh">&#8635; Refresh</button>
          <span class="ver" id="m-ver" title="Widget version">v${EM_VERSION}</span>
        </div>
        <div class="tb-row second" id="m-chips">${this.chipsHtml()}
          <div class="srch"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2.4" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
            <input id="m-search" type="search" placeholder="Search meeting, account, owner, attendee&hellip;" value="${E(S.search)}"></div>
        </div>
        <div class="tb-row third" id="m-daterow" style="display:none">
          <span class="tb-label">Dates</span>
          <span id="m-datechips"></span>
          <span class="chip-more" id="m-datemore" style="display:none"></span>
        </div>
      </div>
      <div class="tablecard">
        <div class="loadbar" id="m-loadbar" style="visibility:hidden"></div>
        <div class="viewnote" id="m-load"></div>
        <div id="m-tw"></div>
      </div>`;
    this.bind();
  },

  paintOldShell() {
    this.host.className = 'ec ui-old';
    this.host.innerHTML = `
      <div class="old-head">All Meetings
        ${this.segHtml('oldSwitch')}
        <p class="counter" id="m-old-count"></p>
      </div>
      <div class="tablecard">
        <div class="loadbar" id="m-loadbar" style="visibility:hidden"></div>
        <div class="viewnote" id="m-load" style="display:none"></div>
        <div id="m-tw"></div>
      </div>`;
    this.bind();
  },

  segHtml(cls) {
    const m = this.state.mode;
    return `<div class="${cls || 'seg'}" id="m-view" role="tablist">
      <button type="button" role="tab" data-v="old" aria-selected="${m==='old'}">Old UI</button>
      <button type="button" role="tab" data-v="new" aria-selected="${m==='new'}">New UI</button>
    </div>`;
  },

  chipsHtml() {
    const S = this.state;
    const chip = (g, v, l) => `<button type="button" class="chip" data-group="${g}" data-k="${E(v)}"
      aria-pressed="${S.chips[g].has(v)}">${l}</button>`;
    const present = [...new Set((S.rows || []).map(r => r.Meeting_Status).filter(Boolean))].sort();
    // status chips are built from the data present in this campaign, same as the widget: the
    // picklist carries six values, a given campaign usually shows two or three
    [...S.chips.status].forEach(v => { if (!present.includes(v)) S.chips.status.delete(v); });
    return [
      chip('recap','yes','Has recap'), chip('recap','no','No recap'),
      '<div class="divider"></div>',
      chip('when','upcoming','Upcoming'), chip('when','past','Past'), chip('when','nodate','No date'),
      '<div class="divider"></div>',
      chip('place','room','In a room'), chip('place','spot','Spot'),
      '<div class="divider"></div>',
      present.map(v => chip('status', v, E(v))).join('')
    ].join('');
  },

  dateChipsHtml() {
    const S = this.state, MAX = 10;
    const counts = new Map();
    (S.rows || []).forEach(r => { if (r.dateKey) counts.set(r.dateKey, (counts.get(r.dateKey)||0)+1); });
    const allKeys = [...counts.keys()].sort();
    let keys = allKeys, dropped = [];
    if (allKeys.length > MAX) {
      const keep = new Set([...counts.entries()].sort((a,b)=>b[1]-a[1] || (a[0]<b[0]?-1:1)).slice(0,MAX).map(e=>e[0]));
      keys = allKeys.filter(k => keep.has(k));
      dropped = allKeys.filter(k => !keep.has(k));
    }
    [...S.chips.date].forEach(k => { if (!keys.includes(k)) S.chips.date.delete(k); });
    const show = keys.length > 1;
    if (!show) S.chips.date.clear();
    return { show, dropped, html: keys.map(k => {
      const [dd,mm,yyyy] = k.split('.');
      return `<button type="button" class="chip chip-date" data-group="date" data-k="${E(k)}"
        aria-pressed="${S.chips.date.has(k)}" title="${counts.get(k)} meeting(s)">${dd}.${mm}</button>`;
    }).join('') };
  },

  bind() {
    const S = this.state, root = this.host;
    q(root,'#m-view').onclick = e => {
      const x = e.target.closest('button[data-v]'); if (!x || x.dataset.v === S.mode) return;
      S.mode = x.dataset.v; S.grid.page = 1;
      this.paintShell(); this.setLoading(true, 'Building table…');
      setTimeout(() => this.build(), SWITCH_MS);
    };
    const chips = q(root,'#m-chips');
    if (chips) chips.onclick = e => {
      const x = e.target.closest('button[data-k]'); if (!x) return;
      const set = S.chips[x.dataset.group], v = x.dataset.k;
      set.has(v) ? set.delete(v) : set.add(v);
      x.setAttribute('aria-pressed', String(set.has(v)));
      S.grid.page = 1; this.build();
    };
    const days = q(root,'#m-datechips');
    if (days) days.parentElement.onclick = e => {
      const x = e.target.closest('button[data-k][data-group="date"]'); if (!x) return;
      const set = S.chips.date, v = x.dataset.k;
      set.has(v) ? set.delete(v) : set.add(v);
      x.setAttribute('aria-pressed', String(set.has(v)));
      S.grid.page = 1; this.build();
    };
    const box = q(root,'#m-search');
    if (box) box.oninput = e => {
      S.search = e.target.value.trim().toLowerCase(); S.grid.page = 1;
      const pos = e.target.selectionStart; this.build();
      const again = q(this.host,'#m-search');
      if (again) { again.focus(); try { again.setSelectionRange(pos, pos); } catch (_) {} }
    };
    const h = q(root,'#m-height');
    if (h) h.onclick = () => { S.grid.height = (S.grid.height + 1) % HEIGHT_STEPS.length;
      h.innerHTML = `&#8597; ${HEIGHT_STEPS[S.grid.height]}&times;`; this.build(); };
    const rf = q(root,'#m-refresh');
    if (rf) rf.onclick = () => { S.rows = null; S.campaign = null;
      this.render(document.getElementById('ecp-body'), this.P); };
  },

  /* ---------- loading ---------- */
  setLoading(on, step) {
    const TILES = ['m-all','m-shown','m-acc','m-rec','m-bk','m-hl','m-hrs','m-nodate'];
    this.state.loading = on;
    const bar = q(this.host,'#m-loadbar'); if (bar) bar.style.visibility = on ? 'visible' : 'hidden';
    const note = q(this.host,'#m-load');
    if (on) {
      if (note) note.innerHTML = `<span class="spin"></span><span class="loadstep">${E(step || 'Loading…')}</span>`;
      const tw = q(this.host,'#m-tw');
      if (tw && !tw.querySelector('table')) tw.innerHTML = ecSkeleton(11);
      TILES.forEach(id => { const el = q(this.host,'#'+id);
        if (el) { el.textContent = '—'; el.classList.add('idle'); } });
    } else {
      TILES.forEach(id => { const el = q(this.host,'#'+id); if (el) el.classList.remove('idle'); });
    }
  },

  /* ---------- build ---------- */
  build() {
    const S = this.state; if (!S.rows) return;
    if (S.mode === 'new') {
      const dc = this.dateChipsHtml();
      const row = q(this.host,'#m-daterow'), host = q(this.host,'#m-datechips'), more = q(this.host,'#m-datemore');
      if (row) row.style.display = dc.show ? '' : 'none';
      if (host) host.innerHTML = dc.html;
      if (more) {
        more.style.display = dc.dropped.length ? '' : 'none';
        if (dc.dropped.length) more.textContent = '+' + dc.dropped.length + ' more';
      }
      // status chips depend on the data, rebuild the whole second row so newly-appearing
      // statuses (or ones that vanished) stay in sync with chipState
      const chipsHost = q(this.host,'#m-chips');
      if (chipsHost) chipsHost.innerHTML = this.chipsHtml() + chipsHost.querySelector('.srch').outerHTML;
    }
    const list = S.rows.filter(r => this.keep(r));
    const cols = S.mode === 'old' ? this.oldColumns() : this.columns();
    S.grid.noTint = true;
    const tw = q(this.host,'#m-tw'); if (!tw) return;
    this.grid = ecGrid(tw, cols, list, S.grid, {
      onDraw: shown => this.stats(shown),
      onClick: (e, redraw) => this.cellClick(e, redraw)
    });
    this.setLoading(false);
    const note = q(this.host,'#m-load');
    if (note && S.mode !== 'old') note.innerHTML = EM_VIEW_NOTE[this.roadshow() ? 'roadshow' : 'event'];
    const table = q(tw,'table');
    if (table) { table.classList.add('just-built'); setTimeout(() => table.classList.remove('just-built'), 900); }
  },

  roadshow() { return this.P.c.Event_Type === 'Roadshow'; },

  keep(r) {
    const S = this.state, c = S.chips;
    if (c.recap.size) { const k = r.hasRecap ? 'yes' : 'no'; if (!c.recap.has(k)) return false; }
    if (c.when.size) {
      const k = r.noDate ? 'nodate' : (r.isPast ? 'past' : 'upcoming');
      if (!c.when.has(k)) return false;
    }
    if (c.place.size) {
      const k = r.Meeting_Room ? 'room' : (r.Spot ? 'spot' : '');
      if (!k || !c.place.has(k)) return false;
    }
    if (c.status.size && !c.status.has(r.Meeting_Status)) return false;
    if (c.date.size && (!r.dateKey || !c.date.has(r.dateKey))) return false;
    if (S.search) {
      const hay = [r.Name, r.accName, r.ownerName, r.buyersText, r.oursText, r.Meeting_Room, r.Spot, r.City]
        .join(' ').toLowerCase();
      if (!hay.includes(S.search)) return false;
    }
    return true;
  },

  stats(shown) {
    const S = this.state, rows = S.rows;
    if (S.mode === 'old') {
      const el = q(this.host,'#m-old-count');
      if (el) el.textContent = `Records: ${shown.length} of ${rows.length}`;
      return;
    }
    const set = (id, v) => this.paintStat(id, v);
    set('m-all', rows.length);
    set('m-shown', shown.length);
    set('m-acc', new Set(shown.map(r => r.accId).filter(Boolean)).size);
    set('m-rec', shown.filter(r => r.hasRecap).length);
    set('m-bk', shown.filter(r => r.Meeting_Status === 'Booked' || r.Meeting_Status === 'Planned').length);
    set('m-hl', shown.filter(r => r.Meeting_Status === 'Held' || r.Meeting_Status === 'Finished').length);
    const minutes = shown.reduce((a,r) => a + (r.Meeting_Duration || 0), 0);
    set('m-hrs', Math.round(minutes/60));
    const noDate = shown.filter(r => r.noDate).length;
    set('m-nodate', noDate);
    const tile = q(this.host,'#m-nodate-tile'); if (tile) tile.style.display = noDate ? '' : 'none';
    S.firstPaint = false;
  },

  paintStat(id, value) {
    const el = q(this.host,'#'+id); if (!el) return;
    if (!this.state.firstPaint) { el.textContent = value; return; }
    const duration = 420, start = performance.now();
    const tick = now => {
      const k = Math.max(0, Math.min(1, (now - start) / duration));
      el.textContent = Math.round(value * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  /* ---------- columns ---------- */
  uniqueValues(field) { return [...new Set((this.state.rows||[]).map(r => r[field]).filter(Boolean))].sort(); },

  columns() {
    const roadshow = this.roadshow();
    const cols = [
      { k:'sortTs', title:'Date', w:78, frozen:'l', sortVal:r=>r.sortTs,
        fmt:(v,r)=>emFmtDate(r.when), text:r=>r.Meeting_DateTime_String||'', filter:{ type:'input' } },
      { k:'hasRecap', title:'Re<br>cap', w:52, align:'c', frozen:'l', fmt:v=>emTick(v),
        text:r=>r.hasRecap?'yes':'no', filter:{ type:'tick' } },
      { k:'accName', title:'Account', w:168, frozen:'l', tooltip:true,
        fmt:(v,r)=>ecLink('Accounts', r.accId, v), filter:{ type:'input' } },
      { k:'Name', title:'Meeting name', w:240, tooltip:true,
        fmt:(v,r)=>ecLink('Meetings', r.id, v), filter:{ type:'input' } },
      Object.assign({ k:'TargetFor', title:'Target<br>priority', w:78, align:'c', fmt:v=>emPrio(v) },
        ecList(this.uniqueValues('TargetFor'))),
      Object.assign({ k:'Meeting_Status', title:'Status', w:96, fmt:v=>emStatus(v) },
        ecList(this.uniqueValues('Meeting_Status'))),
      Object.assign({ k:'ownerName', title:'Owner', w:104, tooltip:true }, ecList(this.uniqueValues('ownerName'))),
      { k:'Meeting_Duration', title:'Min', w:54, align:'c', fmt:v=>emMin(v),
        sortVal:r=>Number(r.Meeting_Duration||0), filter:{ type:'atleast' } }
    ];
    if (roadshow) {
      cols.push(
        Object.assign({ k:'Country', title:'Country', w:118, tooltip:true, fmt:v=>emPlain(v) }, ecList(this.uniqueValues('Country'))),
        Object.assign({ k:'State', title:'State', w:96, tooltip:true, fmt:v=>emPlain(v) }, ecList(this.uniqueValues('State'))),
        Object.assign({ k:'City', title:'City', w:118, tooltip:true, fmt:v=>emPlain(v) }, ecList(this.uniqueValues('City')))
      );
    } else {
      cols.push(
        Object.assign({ k:'Meeting_Room', title:'Meeting<br>room', w:158, tooltip:true, fmt:v=>emWhere(v,false) },
          ecList(this.uniqueValues('Meeting_Room'))),
        { k:'Spot', title:'Spot', w:158, tooltip:true, fmt:v=>emWhere(v,true), filter:{ type:'input' } }
      );
    }
    cols.push(
      { k:'buyersText', title:'Buyers', w:300, tooltip:true, fmt:(v,r)=>emBuyers(r.buyers), filter:{ type:'input' } },
      { k:'oursText', title:'Our<br>attendees', w:340, tooltip:true, fmt:v=>emPlain(v), filter:{ type:'input' } }
    );
    if (roadshow) cols.push({ k:'Purpose_of_the_Meeting', title:'Purpose of<br>the meeting', w:210, tooltip:true,
      fmt:v=>emPlain(v), filter:{ type:'input' } });
    return cols;
  },

  oldColumns() {
    const roadshow = this.roadshow();
    const cols = [
      { k:'Name', title:'Name', w:200, fmt:(v,r)=>v?ecLink('Meetings', r.id, v):'No Data', filter:{ type:'input' } },
      { k:'accName', title:'Account', w:160, fmt:(v,r)=>v?ecLink('Accounts', r.accId, v):'No Data', filter:{ type:'input' } },
      { k:'TargetFor', title:'Target<br>Account Priority', w:120, filter:{ type:'input' } },
      { k:'Meeting_Status', title:'Status', w:110, filter:{ type:'input' } },
      { k:'hasRecap', title:'Recap', w:70, align:'c', fmt:v=>v?'✅':'-', text:r=>r.hasRecap?'yes':'no', filter:{ type:'tick' } },
      { k:'ownerName', title:'Owner', w:130, filter:{ type:'input' } },
      { k:'sortTs', title:'Date', w:110, sortVal:r=>r.sortTs,
        fmt:(v,r)=>r.when?`${r.when.day.slice(0,5)}<br>${hhmm(r.when.min)}`:'No Data', text:r=>r.Meeting_DateTime_String||'', filter:{ type:'input' } },
      Object.assign({ k:'Meeting_Duration', title:'Meeting<br>Duration', w:100 }, ecList(this.uniqueValues('Meeting_Duration')))
    ];
    if (roadshow) {
      cols.push(
        { k:'Country', title:'Country', w:118, filter:{ type:'input' } },
        { k:'State', title:'State', w:96, filter:{ type:'input' } },
        { k:'City', title:'City', w:118, filter:{ type:'input' } }
      );
    } else {
      cols.push(
        { k:'Meeting_Room', title:'Meeting<br>Room', w:150, filter:{ type:'input' } },
        { k:'Spot', title:'Spot', w:150, filter:{ type:'input' } }
      );
    }
    cols.push(
      { k:'buyersText', title:'Buyers', w:280, fmt:(v,r)=>(r.buyers||[]).length
          ? r.buyers.map(b=>`${E(b.name)}${b.position?' - '+E(b.position):''} - ${b.letter}`).join(',<br>') : '',
        filter:{ type:'input' } },
      { k:'oursText', title:'Our<br>Attendees', w:220, filter:{ type:'input' } }
    );
    if (roadshow) cols.push({ k:'Purpose_of_the_Meeting', title:'Purpose of<br>the Meeting', w:200, filter:{ type:'input' } });
    return cols;
  },

  /* ---------- cell interaction ---------- */
  cellClick(e) {
    const open = e.target.closest('[data-open]');
    if (open) { const [Entity, RecordID] = open.dataset.open.split(':');
      ZOHO.CRM.UI.Record.open({ Entity, RecordID }); return; }
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
    const ROLES = [['Economic Buyer','Economic buyer'],['Technical Buyer','Technical buyer'],
                   ['User Buyer','User buyer'],['Coach','Coach']];
    pane.innerHTML = `
      <span class="lab">Purpose of the meeting</span>
      <textarea class="ta" rows="2" id="w-purpose" placeholder="What are we trying to achieve?">${E(s.purpose)}</textarea>
      <div class="hint" id="w-left"></div>
      <div style="height:1px;background:var(--line);margin:18px 0"></div>
      <span class="lab">Buyers <span style="text-transform:none;letter-spacing:0;font-family:'IBM Plex Sans',sans-serif;color:var(--ink-3)">— from ${E(s.account.name)}</span></span>
      <div class="roles" id="w-roles">
        ${ROLES.map(([k,l])=>`<div class="role" data-role="${E(k)}">
          <span class="rl">${E(l)}</span>
          <div class="box"><div class="sel"></div><input placeholder="Search contacts…" autocomplete="off"></div>
          <div class="sug" hidden></div></div>`).join('')}
      </div>
      <div style="height:1px;background:var(--line);margin:18px 0"></div>
      <span class="lab">Our side <span style="text-transform:none;letter-spacing:0;font-family:'IBM Plex Sans',sans-serif;color:var(--ink-3)">— <b id="w-tn">0</b> selected</span></span>
      <div id="w-team" class="peep"></div>`;

    const ta = q(pane,'#w-purpose'), left = q(pane,'#w-left');
    const count = () => left.textContent = `${255 - ta.value.length} characters left`;
    ta.oninput = () => { s.purpose = ta.value.slice(0,255); count(); }; count();

    const { rows } = await coqlAll(
      `select id, Full_Name, Title from Contacts where Account_Name = '${esc(s.account.id)}' and Contact_Status = 'Working'`, 200);

    const paint = () => {
      qa(pane,'.role').forEach(box => {
        const role = box.dataset.role;
        q(box,'.sel').innerHTML = s.buyers.filter(x => x.role === role)
          .map(x => `<span>${E(x.name)}<b data-drop="${E(x.id)}">&times;</b></span>`).join('');
      });
      this.refreshBlocker();
    };
    q(pane,'#w-roles').addEventListener('input', e => {
      const inp = e.target.closest('input'); if (!inp) return;
      const box = inp.closest('.role'), sug = q(box,'.sug'), v = inp.value.trim().toLowerCase();
      if (v.length < 1) { sug.hidden = true; return; }
      const hits = rows.filter(c => (c.Full_Name + ' ' + (c.Title||'')).toLowerCase().includes(v))
        .filter(c => !s.buyers.some(x => x.id === c.id)).slice(0, 8);
      sug.innerHTML = hits.length ? hits.map(c => `<div data-add="${c.id}" data-n="${E(c.Full_Name)}">${E(c.Full_Name)}
        <span style="color:var(--ink-3)">· ${E(c.Title||'')}</span></div>`).join('')
        : `<div style="color:var(--ink-3);cursor:default">No active contact matches “${E(inp.value)}”.</div>`;
      sug.hidden = false;
    });
    q(pane,'#w-roles').addEventListener('click', e => {
      const add = e.target.closest('[data-add]');
      if (add) { const box = add.closest('.role');
        s.buyers.push({ id:add.dataset.add, name:add.dataset.n, role:box.dataset.role });
        q(box,'input').value = ''; q(box,'.sug').hidden = true; paint(); return; }
      const drop = e.target.closest('[data-drop]');
      if (drop) { const i = s.buyers.findIndex(x => x.id === drop.dataset.drop);
        if (i >= 0) s.buyers.splice(i,1); paint(); }
    });

    const tx = q(pane,'#w-team');
    const tcount = () => q(pane,'#w-tn').textContent = s.team.length;
    tx.innerHTML = P.c.attendees.map(a => `<button data-n="${E(a.Name1)}" aria-pressed="${s.team.includes(a.Name1)}">${E(a.Name1)} <span style="opacity:.6">· ${E(a.Functions)}</span></button>`).join('');
    tx.onclick = e => { const b2 = e.target.closest('button[data-n]'); if (!b2) return;
      const n = b2.dataset.n, i = s.team.indexOf(n);
      i < 0 ? s.team.push(n) : s.team.splice(i,1);
      b2.setAttribute('aria-pressed', String(i < 0)); tcount(); this.refreshBlocker(); };
    paint(); tcount();
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
      // the tab caches rows per campaign (see Meetings.render); drop the cache so the
      // newly booked meeting is picked up on the next render instead of showing stale data
      Meetings.state.rows = null; Meetings.state.campaign = null;
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
window.ECPShared = { ensureCss, dataTable, E, el, q, qa, coqlAll, pad2, dmy, parseDT, hhmm, esc, DOW };
})();
