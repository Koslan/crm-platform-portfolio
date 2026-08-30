/* =============================================================
   Emulated chat client + the two-card flow that writes a meeting
   recap into the CRM. Nothing holds a request open while a person
   thinks: each card is a callback, exactly as the real flow works.
============================================================= */
(function () {
'use strict';
const S = window.ECPShared;
const { E, el, q, qa, coqlAll, esc } = S;
const { hue, ini, money } = window.CRMPages;

const CSS3 = `
.tms{display:grid;grid-template-columns:230px minmax(0,1fr) 330px;gap:0;border:1px solid var(--line);border-radius:9px;overflow:hidden;min-height:560px;background:var(--surface)}
.tms .col{min-width:0;display:flex;flex-direction:column}
.tms .col + .col{border-left:1px solid var(--line)}
.tms .ch{padding:11px 13px;border-bottom:1px solid var(--line);font:500 10.5px/1 "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);display:flex;align-items:center;gap:8px}
.tms .ch .tag{font:400 9.5px/1 "IBM Plex Mono",monospace;border:1px solid var(--line);border-radius:4px;padding:3px 5px;letter-spacing:.06em}
.tms .list{overflow:auto;flex:1}
.tms .chat{display:flex;gap:9px;padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--line)}
.tms .chat:hover{background:var(--surface-2)}
.tms .chat[aria-selected="true"]{background:var(--accent-soft)}
.tms .chat .t{font-size:12.5px;font-weight:500;line-height:1.3}
.tms .chat .s{font-size:11px;color:var(--ink-3);margin-top:2px}
.tms .stream{overflow:auto;flex:1;padding:14px}
.tms .bub{display:flex;gap:10px;margin-bottom:14px}
.tms .bub .bd{background:var(--surface-2);border-radius:2px 10px 10px 10px;padding:9px 12px;font-size:13px;color:var(--ink);max-width:60ch}
.tms .bub .nm{font-size:12px;font-weight:500;margin-bottom:3px}
.tms .bub .nm span{font-weight:400;color:var(--ink-3);margin-left:6px;font-size:11px}
.tms .bub .act{margin-top:6px}
.tms .card{border:1px solid var(--line);border-left:3px solid var(--accent);border-radius:8px;background:var(--surface);padding:14px;margin-bottom:14px;max-width:620px}
.tms .card h5{margin:0 0 3px;font:600 14px/1.3 "IBM Plex Serif",serif}
.tms .card .step{font:500 10px/1 "IBM Plex Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-3);margin-bottom:9px}
.tms .card .warn{border-left:3px solid var(--warn);background:var(--warn-bg);padding:8px 11px;border-radius:0 6px 6px 0;font-size:12.5px;margin:10px 0}
.tms .card .done{border-left:3px solid var(--ok);background:var(--ok-bg);padding:8px 11px;border-radius:0 6px 6px 0;font-size:12.5px}
.tms .trace{overflow:auto;flex:1;padding:10px 12px;font:400 11px/1.65 "IBM Plex Mono",monospace;color:var(--ink-2)}
.tms .trace div{padding:4px 0;border-bottom:1px solid var(--line)}
.tms .trace b{color:var(--accent);font-weight:500}
.tms .trace i{font-style:normal;color:var(--ink-3)}
.tms .crmcard{margin:12px;border:1px solid var(--line);border-radius:8px;padding:12px}
.tms .crmcard h6{margin:0 0 8px;font:600 12.5px/1 "IBM Plex Serif",serif}
@media (max-width:1100px){.tms{grid-template-columns:1fr}.tms .col + .col{border-left:0;border-top:1px solid var(--line)}}
`;

const Teams = {
  async mount(host) {
    S.ensureCss();
    if (!document.getElementById('tms-css')) {
      const st = document.createElement('style'); st.id = 'tms-css'; st.textContent = CSS3; document.head.appendChild(st);
    }
    host.classList.add('ecp');
    const { rows } = await coqlAll(
      `select id, Name, Meeting_DateTime_String, Meeting_Duration, Recap, Meeting_Status, External_Event_Id,
       Calendar_UID, Account_Name.Account_Name, Account_Name.Country, Deal
       from Meetings where Meeting_Status = 'Held'`, 300);
    // three chats: matched by event id, matched by calendar uid, and one deliberately ambiguous
    const pool = rows.filter(r => !r.Recap).slice(0, 3);
    this.chats = pool.map((m, i) => ({
      m, source: i === 0 ? 'chat_join_url' : i === 1 ? 'calendar_event_id' : 'participant_accounts',
      ambiguous: i === 2
    }));
    this.trace = [];
    host.innerHTML = `<div class="tms">
      <div class="col"><div class="ch">Chats <span class="tag">emulated UI</span></div><div class="list" id="tm-chats"></div></div>
      <div class="col"><div class="ch" id="tm-title">Pick a meeting chat</div><div class="stream" id="tm-stream"></div></div>
      <div class="col"><div class="ch">CRM &amp; trace</div><div id="tm-crm"></div><div class="trace" id="tm-trace"></div></div>
    </div>`;
    q(host,'#tm-chats').innerHTML = this.chats.map((c,i) => `<div class="chat" data-i="${i}" aria-selected="${i===0}">
      <span class="av" style="background:${hue(c.m['Account_Name.Account_Name'])}">${ini(c.m['Account_Name.Account_Name'])}</span>
      <div><div class="t">${E(c.m['Account_Name.Account_Name'])}</div>
      <div class="s">${E(c.m.Meeting_DateTime_String)} · ${c.m.Meeting_Duration} min</div></div></div>`).join('');
    q(host,'#tm-chats').onclick = e => { const d = e.target.closest('[data-i]'); if (!d) return;
      qa(host,'.chat').forEach(x=>x.setAttribute('aria-selected', String(x===d)));
      this.open(+d.dataset.i); };
    this.host = host;
    this.open(0);
  },

  log(kind, text, note) {
    this.trace.unshift(`<div><b>${E(kind)}</b> ${E(text)}${note ? ` <i>${E(note)}</i>` : ''}</div>`);
    const t = q(this.host,'#tm-trace'); if (t) t.innerHTML = this.trace.join('');
  },

  open(i) {
    const c = this.chats[i]; this.c = c; this.state = { step:0, account:null, recap:'', opp:null, buyers:[] };
    this.trace = []; this.log('reset', 'chat opened', c.m['Account_Name.Account_Name']);
    q(this.host,'#tm-title').textContent = `${c.m['Account_Name.Account_Name']} · meeting chat`;
    this.crm();
    q(this.host,'#tm-stream').innerHTML = `
      <div class="bub"><span class="av" style="background:${hue('Anna Kowal')}">AK</span>
        <div><div class="nm">Anna Kowal<span>${E(c.m.Meeting_DateTime_String)}</span></div>
          <div class="bd">Good call. They want the certification plan before they commit to the tooling budget.
            I said we would come back with a scope by Friday.</div>
          <div class="act"><button class="btn" id="tm-go" style="padding:8px 14px">Send to CRM</button></div></div></div>
      <div class="bub"><span class="av" style="background:${hue('Marek Lindqvist')}">ML</span>
        <div><div class="nm">Marek Lindqvist<span>a few minutes later</span></div>
          <div class="bd">Agreed. I will pull the test matrix from the last programme so we are not starting from scratch.</div></div></div>
      <div id="tm-cards"></div>`;
    q(this.host,'#tm-go').onclick = () => this.card1();
  },

  async crm() {
    const m = this.c.m;
    const fresh = (await ZOHO.CRM.API.getRecord({ Entity:'Meetings', RecordID:m.id })).data[0];
    q(this.host,'#tm-crm').innerHTML = `<div class="crmcard"><h6>Meeting record</h6>
      <dl class="kvs" style="grid-template-columns:96px 1fr;font-size:12.5px">
        <dt>Account</dt><dd>${E(m['Account_Name.Account_Name'])}</dd>
        <dt>When</dt><dd>${E(m.Meeting_DateTime_String)}</dd>
        <dt>Status</dt><dd>${E(fresh.Meeting_Status)}</dd>
        <dt>Recap</dt><dd>${fresh.Recap ? `<span class="pill ok">saved</span>` : '<span class="pill ghost">empty</span>'}</dd>
      </dl>${fresh.Recap ? `<div class="tx" style="font-size:12.5px;color:var(--ink-2);margin-top:8px">${E(fresh.Recap)}</div>` : ''}</div>`;
  },

  async card1() {
    const c = this.c, cards = q(this.host,'#tm-cards');
    this.log('graph', 'GET /chats/{id}', 'resolve the online meeting');
    this.log('crm', `match by ${c.source}`, c.ambiguous ? 'two accounts among participants' : 'single hit');
    this.log('crm', 'fire-and-forget: transcript pipeline started', 'so the recap is ready two steps from now');

    const acc = c.m['Account_Name.Account_Name'];
    const others = (await ZOHO.CRM.API.searchRecord({ Entity:'Accounts', Query:`(Account_Name:starts_with:${acc.slice(0,3)})` })).data.slice(0,3);
    cards.innerHTML = `<div class="card"><div class="step">Step 1 of 2</div>
      <h5>Which account is this meeting with?</h5>
      <div class="hint" style="margin-bottom:10px">Matched by <b>${E(c.source.replace(/_/g,' '))}</b>${c.ambiguous ? '' : ' — one account, filled in for you'}.</div>
      ${c.ambiguous ? `<div class="warn">Two accounts appear among the participants. Nothing has been chosen —
        picking one silently is how a meeting ends up attached to the wrong client.</div>` : ''}
      <div id="tm-accs">${(c.ambiguous ? others : [{ Account_Name:acc, id:'x' }]).map((a,i)=>`
        <div class="room" data-n="${E(a.Account_Name)}" aria-pressed="${!c.ambiguous && i===0}">
          <div><div class="nm">${E(a.Account_Name)}</div><div class="mt">${c.ambiguous ? 'from a participant’s email domain' : 'from the meeting record'}</div></div>
          <div class="tick">&#10003;</div></div>`).join('')}</div>
      <div class="tools" style="margin-top:12px"><span class="msg hint" id="tm-b1">${c.ambiguous ? 'Pick an account to continue.' : ''}</span>
        <span class="grow"></span><button class="btn" id="tm-n1" ${c.ambiguous ? 'disabled' : ''}>Continue</button></div></div>`;
    if (!c.ambiguous) this.state.account = acc;
    q(cards,'#tm-accs').onclick = e => { const r = e.target.closest('[data-n]'); if (!r) return;
      qa(cards,'#tm-accs .room').forEach(x=>x.setAttribute('aria-pressed', String(x===r)));
      this.state.account = r.dataset.n;
      q(cards,'#tm-n1').disabled = false; q(cards,'#tm-b1').textContent = ''; };
    q(cards,'#tm-n1').onclick = () => this.card2();
  },

  async card2() {
    const c = this.c, st = this.state, cards = q(this.host,'#tm-cards');
    this.log('crm', 'getBuyersAndOpps', st.account);
    const deals = (await coqlAll(
      `select id, Deal_Name, Stage, Amount, Account_Name.Account_Name from Deals where Account_Name.Account_Name = '${esc(st.account)}'`, 60)).rows;
    const foreign = (await coqlAll(
      `select id, Deal_Name, Account_Name.Account_Name from Deals where Account_Name.Account_Name != '${esc(st.account)}' limit 200`, 200)).rows[0];
    const contacts = (await coqlAll(
      `select id, Full_Name, Title from Contacts where Account_Name.Account_Name = '${esc(st.account)}' and Contact_Status = 'Working'`, 60)).rows;
    const mismatch = foreign && !deals.length;

    cards.innerHTML = `<div class="card"><div class="step">Step 2 of 2</div>
      <h5>Meeting recap</h5>
      <span class="lab" style="margin-top:10px">What happened</span>
      <textarea class="ta" rows="4" id="tm-recap" placeholder="At least fifty characters — this is what the rest of the company reads.">The client wants the certification plan before committing to tooling budget. We agreed to return with a scope by Friday and to reuse the test matrix from the previous programme.</textarea>
      <div class="hint" id="tm-cnt"></div>
      <span class="lab" style="margin-top:14px">Opportunity</span>
      <select class="se" id="tm-opp">
        ${mismatch ? `<option value="__MISMATCH_OPP__${E(foreign.id)}" selected>Current meeting opportunity belongs to another account: ${E(foreign.Deal_Name)}</option>` : ''}
        ${deals.map(d=>`<option value="${E(d.id)}">${E(d.Deal_Name)} · ${E(d.Stage)}</option>`).join('')}
        <option value="">No opportunity</option>
      </select>
      ${mismatch ? `<div class="warn">The linked opportunity belongs to a different account. It is kept and pre-selected, but the
        choice travels as a marked value so the save knows it was deliberate — a dropdown can only return one string.</div>` : ''}
      <span class="lab" style="margin-top:14px">Buyers in the room</span>
      <div class="peep" id="tm-buy">${contacts.slice(0,8).map(x=>`<button data-n="${E(x.Full_Name)}">${E(x.Full_Name)} <span style="opacity:.6">· ${E(x.Title)}</span></button>`).join('') || '<span class="hint">No active contacts on this account.</span>'}</div>
      <div class="tools" style="margin-top:14px"><span class="hint" id="tm-b2"></span><span class="grow"></span>
        <button class="btn sec" id="tm-back">Back</button><button class="btn" id="tm-save">Save to CRM</button></div></div>`;

    const ta = q(cards,'#tm-recap'), cnt = q(cards,'#tm-cnt');
    const check = () => { st.recap = ta.value;
      const short = ta.value.trim().length < 50;
      cnt.textContent = `${ta.value.trim().length} characters — fifty is the minimum`;
      cnt.style.color = short ? 'var(--warn)' : 'var(--ink-3)';
      q(cards,'#tm-save').disabled = short;
      q(cards,'#tm-b2').textContent = short ? 'The recap is too short to be useful to anyone.' : ''; };
    ta.oninput = check; check();
    q(cards,'#tm-buy').onclick = e => { const b = e.target.closest('button[data-n]'); if (!b) return;
      const i = st.buyers.indexOf(b.dataset.n); i < 0 ? st.buyers.push(b.dataset.n) : st.buyers.splice(i,1);
      b.setAttribute('aria-pressed', String(i < 0)); };
    q(cards,'#tm-back').onclick = () => this.card1();
    q(cards,'#tm-save').onclick = async () => {
      const raw = q(cards,'#tm-opp').value;
      const sentinel = raw.startsWith('__MISMATCH_OPP__');
      const oppId = sentinel ? raw.replace('__MISMATCH_OPP__','') : (raw || null);
      if (sentinel) this.log('flow', 'sentinel recognised', 'prefix stripped, kept deliberately');
      this.log('crm', 'saveRecap', c.m.id);
      try {
        await ZOHO.CRM.API.updateRecord({ Entity:'Meetings', RecordID:c.m.id, APIData:{
          Recap: st.recap.trim(), Deal: oppId, Meeting_Status:'Held' }});
        this.log('crm', 'record updated', 'recap saved');
        cards.innerHTML = `<div class="card"><div class="step">Done</div><h5>Recap saved</h5>
          <div class="done">Written to the meeting record for ${E(st.account)}.
            ${sentinel ? 'The opportunity from the other account was kept, because you chose it knowingly.' : ''}
            ${st.buyers.length ? `Buyers recorded: ${E(st.buyers.join(', '))}.` : ''}</div>
          <div class="hint" style="margin-top:10px">The card is replaced rather than edited in place. Editing the previous
            card was tried first and produced a class of races over message ids; a fresh card costs a little chat clutter and
            removes all of them.</div></div>`;
        this.crm();
      } catch (e) {
        this.log('error', e.code || 'ERROR', e.message);
        q(cards,'#tm-b2').textContent = `${e.code} — ${e.message}`;
      }
    };
  }
};


/* ---------- Microsoft Teams -> Zoho -> Jira synchronization ----------
   Two self-contained recreations, not a shared CRM shell: a dark Teams
   window and a light Jira window, switched by tab rather than squeezed
   into one three-column frame. Routing runs on the PITCH code in the
   root message of a thread; the channel itself only tells Zoho which
   Teams channels to read at all. See the write-up (teams-sync) for the
   constraint this replays and what stays broken. */
const CHANNEL = { name:'presales_game_project', client:'Northstar Games' };
const PITCH = 'PITCH-2048';
const ROOT = { author:'Marta Kaminski', when:'29 Aug 2026 · 09:12',
  text:`${PITCH}\n\nThe client confirmed the review call for Tuesday. Please check the latest scope and let me know who will attend.` };
const REPLIES = [
  { id:'r1', author:'Tomas Novak', when:'29 Aug 2026 · 10:40', tag:'#jira', mention:'Kostiantyn Buriak',
    text:'@Kostiantyn Buriak, please review the estimation before the call.',
    files:['Estimation_v3.xlsx','Scope_notes.pdf'] },
  { id:'r2', author:'Marta Kaminski', when:'29 Aug 2026 · 10:52', tag:'#jira_private',
    text:'The commercial assumption still needs internal approval.' }
];
const ROOT_NOPITCH = { author:'Andrej Petrov', when:'27 Aug 2026 · 15:03',
  text:'Does anyone know when the second sample batch lands? The client asked twice already.' };

const CSS_TRK = `
.trk-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px}
.trk-bar .grow{flex:1 1 auto}
.trk-status{font:400 12.5px/1.5 "IBM Plex Sans",sans-serif;padding:7px 12px;border-radius:6px;color:var(--ink-2);
  border-left:3px solid var(--line-strong);background:var(--surface-2);margin-bottom:12px}
.trk-status[data-tone="ok"]{border-left-color:var(--ok);background:var(--ok-bg);color:var(--ok)}
.trk-status[data-tone="warn"]{border-left-color:var(--warn);background:var(--warn-bg);color:var(--warn)}
.trk-tabs{display:flex;gap:0;border-bottom:1px solid var(--line)}
.trk-tabs button{font:500 13px/1 "IBM Plex Mono",monospace;letter-spacing:.04em;background:none;border:0;
  border-bottom:2px solid transparent;padding:10px 4px;margin-right:22px;cursor:pointer;color:var(--ink-3)}
.trk-tabs button[aria-selected="true"]{color:var(--accent);border-bottom-color:var(--accent)}
.trk-tabs button .n{color:var(--ink-3);margin-right:6px}
.trk-screens{border:1px solid var(--line);border-top:0;border-radius:0 0 10px 10px;overflow:hidden}
.trk-screens .tmw[hidden],.trk-screens .jrw[hidden]{display:none}
.trk-lock{display:inline-flex;align-items:center;gap:5px;font:500 11px/1 "IBM Plex Sans",sans-serif;
  padding:4px 9px 4px 7px;border-radius:999px;white-space:normal}
.trk-tech{margin-top:14px;border:1px solid var(--line);border-radius:8px;overflow:auto}
.trk-tech table{width:100%;border-collapse:collapse;font-size:12px}
.trk-tech td{padding:7px 12px;border-top:1px solid var(--line);vertical-align:top}
.trk-tech td:first-child{font:500 11px/1.4 "IBM Plex Mono",monospace;color:var(--ink-3);white-space:nowrap;
  width:190px;border-right:1px solid var(--line)}
.trk-tech tr:first-child td{border-top:0}

/* ---- Microsoft Teams recreation ---- */
.tmw{--bg:#1B1A19;--bg2:#292827;--bg3:#242322;--rail:#1B1A19;--acc:#6264A7;--acc2:#7B83EB;
  --ink:#F5F5F5;--ink2:#C8C6C4;--ink3:#8A8886;--ln:#3B3A39;
  background:var(--bg2);color:var(--ink);font-family:"Segoe UI","IBM Plex Sans",sans-serif;
  display:grid;grid-template-rows:auto 1fr;min-height:600px}
.tmw *{box-sizing:border-box}
.tmw .top{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:12px;
  padding:0 10px;height:48px;background:var(--rail);border-bottom:1px solid var(--ln)}
.tmw .top .logo{font:600 14px/1 "Segoe UI",sans-serif;display:flex;align-items:center;gap:8px;color:#fff}
.tmw .top .logo i{width:24px;height:24px;border-radius:5px;flex:none;display:inline-block;position:relative;
  background:linear-gradient(135deg,#5b5fc7,#7b83eb)}
.tmw .top .logo i::after{content:'T';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font:700 13px/1 "Segoe UI",sans-serif;color:#fff}
.tmw .top .srch{justify-self:center;width:100%;max-width:420px;background:var(--bg3);border:1px solid var(--ln);
  border-radius:5px;padding:6px 10px 6px 30px;font-size:12.5px;color:var(--ink3);position:relative}
.tmw .top .srch-wrap{position:relative;width:100%;max-width:420px}
.tmw .top .srch-wrap::before{content:'\\1F50D';position:absolute;left:9px;top:50%;transform:translateY(-50%) scale(.8);
  opacity:.65;font-size:12px}
.tmw .top .side{display:flex;align-items:center;gap:14px;font-size:15px;color:var(--ink2)}
.tmw .top .side.r{justify-content:flex-end}
.tmw .top .side .av{width:26px;height:26px;border-radius:50%;background:var(--acc);color:#fff;
  font:600 10.5px/26px "Segoe UI",sans-serif;text-align:center;display:block;flex:none}
.tmw .body{display:grid;grid-template-columns:68px 232px minmax(0,1fr);min-height:0;background:transparent;border:0;border-radius:0;padding:0}
.tmw .rail{background:var(--rail);border-right:1px solid var(--ln);display:flex;flex-direction:column;
  align-items:center;padding:12px 0;font-size:9.5px;color:var(--ink3)}
.tmw .rail .me{width:28px;height:28px;border-radius:50%;background:var(--acc);color:#fff;
  font:600 11px/28px "Segoe UI",sans-serif;text-align:center;margin-bottom:18px;flex:none}
.tmw .rail nav{display:flex;flex-direction:column;gap:2px;width:100%;align-items:center}
.tmw .rail span{display:flex;flex-direction:column;align-items:center;gap:3px;width:56px;padding:6px 0;
  border-radius:4px;position:relative}
.tmw .rail span.on{color:#fff}
.tmw .rail span.on::before{content:'';position:absolute;left:-12px;top:8px;bottom:8px;width:3px;
  border-radius:0 3px 3px 0;background:#fff}
.tmw .rail i{display:block;font-size:16px;line-height:20px;font-style:normal}
.tmw .rail b{font-weight:400;font-size:9.5px;line-height:1}
.tmw .rail .apps{margin-top:auto;padding-top:14px}
.tmw .chans{background:var(--bg2);border-right:1px solid var(--ln);overflow:auto;display:flex;flex-direction:column}
.tmw .chans .team-hd{display:flex;align-items:center;gap:8px;padding:12px 14px 8px;font:600 13px/1.2 "Segoe UI",sans-serif;color:#fff}
.tmw .chans .team-hd i{width:20px;height:20px;border-radius:4px;background:var(--acc);flex:none}
.tmw .chans .team-hd b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tmw .chans .team-hd .cv{color:var(--ink3);font-size:10px}
.tmw .chan-grp{padding:2px 8px 10px}
.tmw .chan{display:flex;align-items:center;gap:7px;padding:7px 10px;border-radius:4px;font-size:13px;color:var(--ink2)}
.tmw .chan[aria-current="true"]{background:var(--bg3);color:#fff;font-weight:600}
.tmw .chan .hash{color:var(--ink3);font-weight:400;flex:none}
.tmw .chan[aria-current="true"] .hash{color:var(--ink2)}
.tmw .thr{display:flex;flex-direction:column;min-width:0}
.tmw .thr-hd{padding:9px 18px 0;border-bottom:1px solid var(--ln)}
.tmw .thr-hd .crumb{display:flex;align-items:center;gap:6px;font:600 15px/1.3 "Segoe UI",sans-serif;color:#fff;flex-wrap:wrap}
.tmw .thr-hd .crumb .team{color:var(--ink2);font-weight:400;font-size:13px}
.tmw .thr-hd .crumb .sep{color:var(--ink3);font-weight:400}
.tmw .thr-hd .sub{font:400 11.5px/1 "Segoe UI",sans-serif;color:var(--ink3);margin:4px 0 8px}
.tmw .thr-hd .ptabs{display:flex;gap:20px}
.tmw .thr-hd .ptabs span{font:500 12.5px/1 "Segoe UI",sans-serif;color:var(--ink3);padding:8px 2px;
  border-bottom:2px solid transparent}
.tmw .thr-hd .ptabs span.on{color:#fff;border-bottom-color:var(--acc2)}
.tmw .jump{display:flex;align-items:center;gap:0;padding:7px 18px;border-bottom:1px solid var(--ln);
  flex-wrap:wrap;background:var(--bg3)}
.tmw .jump .lbl{font:600 10px/1 "Segoe UI",sans-serif;letter-spacing:.06em;text-transform:uppercase;
  color:var(--ink3);margin-right:12px}
.tmw .jump button{background:none;border:0;border-bottom:2px solid transparent;color:var(--ink2);
  font:400 12px/1 "Segoe UI",sans-serif;padding:6px 4px;margin-right:16px;cursor:pointer;text-align:left}
.tmw .jump button[aria-current="true"]{color:#fff;border-bottom-color:var(--acc2)}
.tmw .canvas{overflow:auto;flex:1;padding:16px 18px 6px}
.tmw .msg{display:flex;gap:10px;margin-bottom:2px;padding:6px 8px;border-radius:6px;position:relative;border:0}
.tmw .msg:hover{background:var(--bg3)}
.tmw .msg+.msg{margin-top:14px}
.tmw .msg .av{width:32px;height:32px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;
  font:600 11px/1 "Segoe UI",sans-serif;color:#fff}
.tmw .msg .hover{position:absolute;top:-14px;right:10px;display:none;align-items:center;gap:2px;
  background:var(--bg3);border:1px solid var(--ln);border-radius:6px;padding:3px;box-shadow:0 2px 6px rgba(0,0,0,.4)}
.tmw .msg:hover .hover{display:flex}
.tmw .msg .hover i{width:24px;height:24px;border-radius:4px;font-size:13px;display:flex;align-items:center;justify-content:center}
.tmw .msg .who{font:600 12.5px/1 "Segoe UI",sans-serif;color:#fff}
.tmw .msg .who span{font-weight:400;color:var(--ink3);margin-left:8px;font-size:11px}
.tmw .msg .bd{font-size:13.5px;line-height:1.5;color:var(--ink);white-space:pre-wrap;margin-top:3px}
.tmw .msg .bd b.pitch{color:#9698d6;font-weight:600}
.tmw .msg .tag{display:inline-block;margin-top:6px;font:500 11px/1 "IBM Plex Mono",monospace;color:#9698d6;
  background:rgba(98,100,167,.22);border-radius:4px;padding:3px 7px}
.tmw .msg .att{margin-top:7px;font-size:12px;color:#9698d6}
.tmw .msg .rx{margin-top:8px;min-height:1px}
.tmw .msg .rx .ticket{display:inline-flex;align-items:center;gap:5px;background:var(--bg3);border:1px solid var(--ln);
  border-radius:14px;padding:3px 10px;font-size:12px;color:var(--ink2)}
.tmw .sysmsg{margin:0 0 16px;border:1px solid var(--ln);border-radius:8px;background:var(--bg3);padding:12px 14px}
.tmw .sysmsg h6{margin:0 0 6px;font:600 12.5px/1.3 "Segoe UI",sans-serif;color:#fff}
.tmw .sysmsg .row{margin-top:7px}
.tmw .sysmsg .row b{color:var(--ink3);font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:2px}
.tmw .sysmsg .row div{font-size:12.5px;line-height:1.5;color:var(--ink)}
.tmw .compose{margin:6px 18px 14px;border:1px solid var(--ln);border-radius:8px;background:var(--bg3)}
.tmw .compose .fld{padding:10px 12px 4px;font-size:13px;color:var(--ink3)}
.tmw .compose .tools{display:flex;align-items:center;gap:14px;padding:4px 10px 8px;font-size:14px;color:var(--ink3);margin-bottom:0;flex-wrap:nowrap}
.tmw .compose .tools .send{margin-left:auto;color:var(--ink3);opacity:.5}
.tmw .compose .note{padding:0 12px 9px;font:400 10.5px/1.4 "Segoe UI",sans-serif;color:var(--ink3);font-style:italic}
@media(max-width:900px){.tmw .body{grid-template-columns:56px 1fr}.tmw .chans{display:none}}
@media(max-width:680px){.tmw .body{grid-template-columns:1fr}.tmw .rail{display:none}.tmw,.jrw{min-height:480px}
  .tmw .top{grid-template-columns:auto 1fr auto}.tmw .top .srch-wrap{max-width:none}}

/* ---- Jira recreation ---- */
.jrw{--bg:#FFFFFF;--bg2:#F7F8F9;--acc:#0C66E4;--ink:#172B4D;--ink2:#5E6C84;--ln:#DFE1E6;
  background:var(--bg);color:var(--ink);font-family:"IBM Plex Sans",sans-serif;
  display:grid;grid-template-rows:auto 1fr;min-height:600px}
.jrw *{box-sizing:border-box}
.jrw .top{display:flex;align-items:center;gap:18px;padding:9px 16px;border-bottom:1px solid var(--ln)}
.jrw .top .logo{font:700 14px/1 "IBM Plex Sans",sans-serif;color:var(--acc)}
.jrw .top nav{display:flex;gap:16px;font-size:12.5px;color:var(--ink2)}
.jrw .top .srch{flex:1;max-width:340px;background:var(--bg2);border:1px solid var(--ln);border-radius:4px;
  padding:6px 10px;font-size:12.5px;color:var(--ink2);margin-left:auto}
.jrw .body{display:grid;grid-template-columns:190px minmax(0,1fr);min-height:0;background:transparent;border:0;border-radius:0;padding:0}
.jrw .side{background:var(--bg2);border-right:1px solid var(--ln);padding:14px 0}
.jrw .side h6{font:600 11px/1 "IBM Plex Mono",monospace;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2);
  padding:0 16px 8px;margin:0}
.jrw .side a{display:block;padding:7px 16px;font-size:12.5px;color:var(--ink2);border-left:2px solid transparent}
.jrw .side a[aria-current="true"]{color:var(--acc);border-left-color:var(--acc);background:#E9F2FE;font-weight:600}
.jrw .main{overflow:auto;padding:16px 22px}
.jrw .crumb{font-size:11.5px;color:var(--ink2);margin-bottom:10px}
.jrw .crumb b{color:var(--ink)}
.jrw .ihd{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding-bottom:12px;
  border-bottom:1px solid var(--ln)}
.jrw .ihd h1{font:600 18px/1.3 "IBM Plex Sans",sans-serif;margin:0}
.jrw .ihd h1 span{color:var(--ink2);font-weight:400;margin-right:8px}
.jrw .meta{display:flex;gap:16px;margin-top:8px;font-size:12px;color:var(--ink2);flex-wrap:wrap}
.jrw .status-chip{background:#DEEBFF;color:#0747A6;font:600 11px/1 "IBM Plex Sans",sans-serif;padding:4px 10px;
  border-radius:4px;flex:none}
.jrw .itabs{display:flex;border-bottom:1px solid var(--ln);margin:14px 0 0;flex-wrap:wrap}
.jrw .itabs button{background:none;border:0;border-bottom:2px solid transparent;color:var(--ink2);
  font:500 12.5px/1 "IBM Plex Sans",sans-serif;padding:10px 4px;margin-right:22px;cursor:pointer}
.jrw .itabs button[aria-selected="true"]{color:var(--acc);border-bottom-color:var(--acc)}
.jrw .comments{padding-top:14px}
.jrw .empty{color:var(--ink2);font-size:12.5px;font-style:italic;padding:14px 0}
.jrw .cmt{display:flex;gap:10px;padding:14px 0;border-top:1px solid var(--ln)}
.jrw .cmt:first-child{border-top:0}
.jrw .cmt .av{width:28px;height:28px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;
  font:600 10.5px/1 "IBM Plex Sans",sans-serif;color:#fff}
.jrw .cmt .hd{display:flex;align-items:center;gap:8px;font-size:12px;flex-wrap:wrap}
.jrw .cmt .hd b{color:var(--ink)}
.jrw .cmt .hd .via{color:var(--ink2)}
.jrw .cmt .src{display:inline-flex;align-items:center;gap:5px;font:500 10.5px/1 "IBM Plex Mono",monospace;
  color:#0052CC;background:#E9F2FE;border-radius:4px;padding:2px 7px}
.jrw .cmt .bd{font-size:13px;line-height:1.55;margin-top:6px;white-space:pre-wrap}
.jrw .cmt .bd .mention{color:var(--acc);font-weight:600;background:#E9F2FE;border-radius:3px;padding:0 3px}
.jrw .cmt .lnk{margin-top:7px;font-size:12px;color:var(--ink2)}
.jrw .cmt .lnk a{color:var(--acc)}
.jrw .cmt .files{margin-top:8px;border:1px solid var(--ln);border-radius:6px;padding:8px 10px;background:var(--bg2)}
.jrw .cmt .files div{font-size:12px;padding:2px 0}
.jrw .cmt .files a{color:var(--acc)}
.jrw .cmt .marker{margin-top:6px;font:400 10.5px/1.4 "IBM Plex Mono",monospace;color:var(--ink2);opacity:.75}
.jrw .lock{background:#FFF0B3;color:#7A5D00}
.jrw .cmt.new{animation:trkfade .5s ease-out}
@keyframes trkfade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){.jrw .cmt.new{animation:none}}
.jrw .cmt.flash{background:#FFFAE6}
@media(max-width:900px){.jrw .body{grid-template-columns:1fr}.jrw .side{display:none}}
`;

const wait = ms => new Promise(r => window.setTimeout(r, ms));

const Tracker = {
  async mount(host) {
    S.ensureCss();
    if (!document.getElementById('trk-css')) {
      const st = document.createElement('style'); st.id = 'trk-css'; st.textContent = CSS_TRK; document.head.appendChild(st);
    }
    host.classList.add('ecp');
    this.host = host;
    this.tab = 'teams'; this.thread = 'pitch'; this.itab = 'comments';
    this.delivered = {}; this.comments = []; this.bw = { delivered:false, marker:null };
    this.techOpen = false; this.flashIds = new Set();
    this.statusText = 'Two replies in this thread are tagged for Jira — nothing has synced yet.'; this.tone = 'idle';
    this.opportunity = null;

    try {
      const { rows } = await coqlAll(
        `select id, Deal_Name, Account_Name.Account_Name from Deals where Stage != '5. Lost' limit 1`, 1);
      if (rows[0]) this.opportunity = { name: rows[0].Deal_Name, account: rows[0]['Account_Name.Account_Name'] };
    } catch (e) { /* the drawer just shows an em dash for Opportunity */ }

    host.innerHTML = `<div class="trk">
      <div class="trk-bar">
        <button class="btn" data-act="run">Run synchronization</button>
        <button class="btn sec" data-act="again">Run again</button>
        <button class="chip2" data-act="restricted">Show restricted example</button>
        <button class="chip2" data-act="missing">Show missing PITCH example</button>
        <button class="chip2" data-act="biweekly">Show biweekly recap</button>
        <span class="grow"></span>
        <button class="chip2" id="trk-tech-btn" data-act="tech" aria-pressed="false">Show technical details</button>
      </div>
      <div id="trk-status-wrap"></div>
      <div class="trk-tabs" role="tablist" aria-label="Application screen">
        <button role="tab" id="trk-tab-teams" data-tab="teams" aria-selected="true" aria-controls="trk-teams">01 <span class="n">·</span> Microsoft Teams</button>
        <button role="tab" id="trk-tab-jira" data-tab="jira" aria-selected="false" aria-controls="trk-jira">02 <span class="n">·</span> Jira</button>
      </div>
      <div class="trk-screens">
        <div id="trk-teams" class="tmw" role="tabpanel" aria-labelledby="trk-tab-teams"></div>
        <div id="trk-jira" class="jrw" role="tabpanel" aria-labelledby="trk-tab-jira" hidden></div>
      </div>
      <div id="trk-tech" class="trk-tech" hidden></div>
    </div>`;

    host.addEventListener('click', e => {
      const tab = e.target.closest('[data-tab]'); if (tab) { this.tab = tab.dataset.tab; this.paint(); return; }
      const th = e.target.closest('[data-th]'); if (th) { this.thread = th.dataset.th; this.paint(); return; }
      const itab = e.target.closest('[data-itab]'); if (itab) { this.itab = itab.dataset.itab; this.paint(); return; }
      const act = e.target.closest('[data-act]'); if (!act) return;
      const a = act.dataset.act;
      if (a === 'run' || a === 'again') this.runSync();
      else if (a === 'restricted') this.showRestricted();
      else if (a === 'missing') this.showMissing();
      else if (a === 'biweekly') this.runBiweekly();
      else if (a === 'tech') this.toggleTech();
    });
    this.paint();
  },

  status(text, tone) { this.statusText = text; this.tone = tone || 'idle'; },

  bodyWithPitch(text) { return E(text).replace(/PITCH-\d+/, m => `<b class="pitch">${m}</b>`); },
  mentionJira(text, mention) {
    const esc2 = E(text);
    return mention ? esc2.replace('@' + E(mention), `<span class="mention">@${E(mention)}</span>`) : esc2;
  },

  async runSync() {
    if (this.thread === 'nopitch') {
      this.status('Skipped safely · no PITCH found in the root message', 'warn'); this.paint(); return;
    }
    this.status('Synchronizing…', 'idle'); this.paint();
    await wait(420);
    let added = 0;
    REPLIES.forEach(r => {
      if (this.delivered[r.id]) return;
      added++;
      const marker = `[crm-teams-msg:${r.id}]`;
      this.delivered[r.id] = marker;
      this.comments.push(Object.assign({}, r, { marker, fresh:true }));
    });
    if (added) {
      this.status((added === 1 ? '1 comment' : added + ' comments') + ' delivered · ticket set on the source message', 'ok');
      this.tab = 'jira';
      this.paint();
      await wait(900);
      this.comments.forEach(c => { c.fresh = false; });
      this.paint();
    } else {
      this.status('Existing Jira marker found · duplicate skipped', 'idle');
      this.flashIds = new Set(Object.keys(this.delivered));
      this.paint();
      await wait(1300);
      this.flashIds = new Set(); this.paint();
    }
  },

  async showRestricted() {
    this.thread = 'pitch'; this.tab = 'teams'; this.paint();
    await wait(150);
    await this.runSync();
    this.tab = 'jira'; this.flashIds = new Set(['r2']); this.paint();
    await wait(1300);
    this.flashIds = new Set(); this.paint();
  },

  async showMissing() {
    this.thread = 'nopitch'; this.tab = 'teams';
    await this.runSync();
  },

  async runBiweekly() {
    this.thread = 'pitch'; this.tab = 'teams';
    if (this.bw.delivered) {
      this.status('Already delivered', 'idle');
      this.flashIds = new Set(['biweekly']); this.paint();
      await wait(1300);
      this.flashIds = new Set(); this.paint();
      return;
    }
    this.status('Publishing the biweekly recap…', 'idle'); this.paint();
    await wait(420);
    this.bw.delivered = true;
    this.bw.marker = `[crm-biweekly:${PITCH}:15 Aug 2026:29 Aug 2026:${CHANNEL.name}]`;
    this.comments.push({ id:'biweekly', biweekly:true, marker:this.bw.marker, fresh:true });
    this.status('Biweekly recap published to Teams and the linked issue', 'ok');
    this.paint();
    await wait(650);
    this.comments.forEach(c => { c.fresh = false; });
  },

  toggleTech() { this.techOpen = !this.techOpen; this.paint(); },

  sysmsgHTML() {
    return `<div class="sysmsg"><h6>&#129302; Zoho sync &middot; Bi-weekly recap</h6>
      <div class="row"><b>Period</b><div>15 Aug 2026 &mdash; 29 Aug 2026 &middot; ${E(CHANNEL.name)}</div></div>
      <div class="row"><b>Changed</b><div>The client confirmed the review call and the estimation was updated after the latest scope clarification.</div></div>
      <div class="row"><b>Needed</b><div>Confirm attendees and approve the remaining commercial assumption.</div></div>
    </div>`;
  },

  threadHTML(root, replies, showBw) {
    const hoverIcons = `<span class="hover"><i title="Like">&#128077;</i><i title="Reply">&#8617;</i><i title="React">&#128512;</i><i title="More">&#8943;</i></span>`;
    let h = `<div class="msg">${hoverIcons}<span class="av" style="background:${hue(root.author)}">${ini(root.author)}</span>
      <div><div class="who">${E(root.author)}<span>${E(root.when)} &middot; root message</span></div>
      <div class="bd">${this.bodyWithPitch(root.text)}</div></div></div>`;
    replies.forEach(r => {
      const delivered = !!this.delivered[r.id];
      h += `<div class="msg">${hoverIcons}<span class="av" style="background:${hue(r.author)}">${ini(r.author)}</span>
        <div><div class="who">${E(r.author)}<span>${E(r.when)} &middot; reply</span></div>
        <div class="bd">${this.mentionJira(r.text, r.mention)}</div>
        <div class="tag">${E(r.tag)}</div>
        ${r.files ? `<div class="att">&#128206; ${r.files.length} file${r.files.length > 1 ? 's' : ''} attached</div>` : ''}
        <div class="rx">${delivered ? `<span class="ticket" title="Delivered to Jira &middot; ${PITCH}" aria-label="Delivered to Jira">&#127915; Delivered to Jira</span>` : ''}</div>
        </div></div>`;
    });
    if (showBw) h += this.sysmsgHTML();
    return h;
  },

  teamsHTML() {
    const root = this.thread === 'pitch' ? ROOT : ROOT_NOPITCH;
    const replies = this.thread === 'pitch' ? REPLIES : [];
    const showBw = this.thread === 'pitch' && this.bw.delivered;
    return `<div class="top">
        <div class="logo"><i></i> Teams</div>
        <div class="srch-wrap"><div class="srch">Search</div></div>
        <div class="side r"><span title="Help">&#63;</span><span title="Settings">&#9881;</span><span class="av">KB</span></div>
      </div>
      <div class="body">
        <div class="rail">
          <div class="me">KB</div>
          <nav>
            <span title="Activity"><i>&#128276;</i><b>Activity</b></span>
            <span title="Chat"><i>&#128172;</i><b>Chat</b></span>
            <span class="on" title="Teams"><i>&#128101;</i><b>Teams</b></span>
            <span title="Calendar"><i>&#128197;</i><b>Calendar</b></span>
            <span title="Calls"><i>&#128222;</i><b>Calls</b></span>
          </nav>
          <span class="apps" title="Apps"><i>&#8943;</i><b>Apps</b></span>
        </div>
        <div class="chans">
          <div class="team-hd"><i></i><b>[PRJ] Presale</b><span class="cv">&#9662;</span></div>
          <div class="chan-grp">
            <div class="chan"><span class="hash">#</span>General</div>
            <div class="chan" aria-current="true"><span class="hash">#</span>${E(CHANNEL.name)}</div>
            <div class="chan"><span class="hash">#</span>onboarding_supersalesbros</div>
          </div></div>
        <div class="thr">
          <div class="thr-hd">
            <div class="crumb"><span class="team">[PRJ] Presale</span><span class="sep">&#8250;</span>${E(CHANNEL.name)}</div>
            <div class="sub">${E(CHANNEL.client)} &middot; channel is registered in Zoho Analytics</div>
            <div class="ptabs"><span class="on">Posts</span><span>Files</span><span>Wiki</span><span>+</span></div>
          </div>
          <div class="jump"><span class="lbl">Jump to thread</span>
            <button data-th="pitch" aria-current="${this.thread === 'pitch'}">Client review &amp; estimation <span style="opacity:.6">&middot; ${PITCH}</span></button>
            <button data-th="nopitch" aria-current="${this.thread === 'nopitch'}">Second sample batch</button>
          </div>
          <div class="canvas">${this.threadHTML(root, replies, showBw)}</div>
          <div class="compose">
            <div class="fld">Type a message</div>
            <div class="tools"><span>&#128206;</span><span>&#128512;</span><span>&#127909;</span><span>&#128273;</span><span class="send">&#10148;</span></div>
            <div class="note">Read-only recreation &mdash; posting is disabled here</div>
          </div>
        </div>
      </div>`;
  },

  commentHTML(c) {
    const flash = this.flashIds.has(c.id) ? ' flash' : '';
    const fresh = c.fresh ? ' new' : '';
    const marker = this.techOpen ? `<div class="marker">${E(c.marker)}</div>` : '';
    if (c.biweekly) {
      return `<div class="cmt${fresh}${flash}"><span class="av" style="background:${hue('Zoho sync')}">ZS</span>
        <div><div class="hd"><b>Zoho sync</b><span class="src">Zoho CRM</span>
          <span class="trk-lock">&#128274; Restricted to Producers/BizDev/Supervisor/Art/Tech. Dir</span></div>
        <div class="bd">Bi-weekly Teams recap &middot; 15 Aug 2026 &mdash; 29 Aug 2026
Channel: ${E(CHANNEL.name)}

Changed: The client confirmed the review call and the estimation was updated after the latest scope clarification.

Needed: Confirm attendees and approve the remaining commercial assumption.</div>
        ${marker}</div></div>`;
    }
    const restricted = c.tag === '#jira_private';
    return `<div class="cmt${fresh}${flash}"><span class="av" style="background:${hue(c.author)}">${ini(c.author)}</span>
      <div><div class="hd"><b>${E(c.author)}</b><span class="via">via Teams &middot; ${E(c.when)}</span>
        <span class="src">Zoho CRM</span>
        ${restricted ? `<span class="trk-lock">&#128274; Restricted to Producers/BizDev/Supervisor/Art/Tech. Dir</span>` : ''}</div>
      <div class="bd">${this.mentionJira(c.text, c.mention)}</div>
      <div class="lnk">Channel: ${E(CHANNEL.name)} &middot; <a href="#">Open thread in Teams</a></div>
      ${c.files ? `<div class="files">Attachments from Teams${c.files.map(f => `<div>&#128279; <a href="#">${E(f)}</a> &mdash; Open in Teams/SharePoint</div>`).join('')}</div>` : ''}
      ${marker}</div></div>`;
  },

  jiraHTML() {
    const list = this.comments;
    const activityLike = this.itab === 'activity' || this.itab === 'history';
    return `<div class="top"><div class="logo">Jira</div><nav><span>Projects</span><span>Filters</span></nav><div class="srch">Search</div></div>
      <div class="body">
        <div class="side"><h6>PITCH project</h6>
          <a aria-current="false">Summary</a><a aria-current="true">Issues</a><a aria-current="false">Reports</a></div>
        <div class="main">
          <div class="crumb">PITCH project <b>/</b> <b>${PITCH}</b></div>
          <div class="ihd">
            <div><h1><span>${PITCH}</span>Client review and estimation</h1>
              <div class="meta"><span>Assignee: Kostiantyn Buriak</span><span>Reporter: Zoho sync</span></div></div>
            <span class="status-chip">In Progress</span>
          </div>
          <div class="itabs" role="tablist">
            <button role="tab" data-itab="activity" aria-selected="${this.itab === 'activity'}">Activity</button>
            <button role="tab" data-itab="comments" aria-selected="${this.itab === 'comments'}">Comments</button>
            <button role="tab" data-itab="history" aria-selected="${this.itab === 'history'}">History</button>
          </div>
          ${activityLike
            ? `<p class="empty">Not part of this demo &mdash; Comments is where the synchronization lands.</p>`
            : `<div class="comments">${list.length ? list.map(c => this.commentHTML(c)).join('') : '<p class="empty">Nothing delivered from Teams yet.</p>'}</div>`}
        </div>
      </div>`;
  },

  techHTML() {
    const rows = [
      ['Team_ID + Channel_ID', 'TEAM_PRESALES &middot; CH_PRESALES_GAME_PROJECT'],
      ['Root_Message_ID', 'root-2048'],
      ['Teams_Message_ID', Object.keys(this.delivered).join(', ') || '&mdash;'],
      ['Message_Unique_Key', 'hash of channel + root + message id'],
      ['Jira_Key', PITCH],
      ['Opportunity', this.opportunity ? `${E(this.opportunity.name)} &middot; ${E(this.opportunity.account)}` : '&mdash;'],
      ['ETag', 'W/&quot;teams-etag-08x2f&quot;'],
      ['In_Jira', Object.keys(this.delivered).length ? 'true' : 'false'],
      ['[crm-teams-msg:&hellip;]', 'hidden marker inside each delivered comment'],
      ['[crm-biweekly:&hellip;]', this.bw.marker ? E(this.bw.marker) : 'not yet published']
    ];
    return `<table><tbody>${rows.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</tbody></table>`;
  },

  paint() {
    const h = this.host;
    q(h,'#trk-status-wrap').innerHTML = `<div class="trk-status" data-tone="${this.tone}">${E(this.statusText)}</div>`;
    q(h,'#trk-tab-teams').setAttribute('aria-selected', String(this.tab === 'teams'));
    q(h,'#trk-tab-jira').setAttribute('aria-selected', String(this.tab === 'jira'));
    const teamsEl = q(h,'#trk-teams'), jiraEl = q(h,'#trk-jira');
    teamsEl.hidden = this.tab !== 'teams'; jiraEl.hidden = this.tab !== 'jira';
    teamsEl.innerHTML = this.teamsHTML();
    jiraEl.innerHTML = this.jiraHTML();
    const tech = q(h,'#trk-tech');
    tech.hidden = !this.techOpen;
    if (this.techOpen) tech.innerHTML = this.techHTML();
    q(h,'#trk-tech-btn').setAttribute('aria-pressed', String(this.techOpen));
  }
};

window.TrackerFlow = Tracker;

window.TeamsFlow = Teams;
})();
