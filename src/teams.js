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

window.TeamsFlow = Teams;
})();
