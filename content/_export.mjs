/* Экспортёр контента: тянет все тексты и спеки диаграмм из собранного сайта
   в content/*.md.
   Зависимость: npm i --no-save turndown  (один раз; сборка сайта её не трогает)
   Запуск:      npm run build && npm run build:all && node content/_export.mjs
   Читает dist-all/ (все разделы включены), чтобы скрытые страницы тоже попадали
   в экспорт, и dist/ — чтобы пометить, что из этого публично. Без dist-all/
   работает по dist/ и экспортирует только публичное.
   Односторонний: перезаписывает md из кода. Правки в md обратно НЕ применяет —
   см. content/INDEX.md, раздел «Как применить правку». */
import { chromium, launchOpts } from '../test/browser.mjs';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import TurndownService from 'turndown';

const td = new TurndownService({ headingStyle:'atx', bulletListMarker:'-', codeBlockStyle:'fenced' });
td.addRule('svg',     { filter:['svg'], replacement:()=>'\n\n_[диаграмма — спека ниже]_\n\n' });
td.addRule('controls',{ filter:['input','button','select','textarea','canvas','script'], replacement:()=>'' });
td.addRule('sechead', { filter:n=>n.nodeName==='DIV'&&n.classList.contains('sechead'),
                        replacement:c=>'\n\n## '+c.trim()+'\n\n' });
td.addRule('kicker',  { filter:n=>n.classList&&n.classList.contains('k')&&n.nodeName==='SPAN',
                        replacement:c=>'**'+c.trim()+'** — ' });
/* Фотография в hero — data:URI на 90 КБ. В markdown ей делать нечего. */
td.addRule('img',     { filter:['img'], replacement:(c,n)=>'\n\n_[изображение: '+(n.getAttribute('alt')||'без alt')+']_\n\n' });
/* .stat = <b>число</b><span>подпись</span> — без пробела слипается */
td.addRule('stat',    { filter:n=>n.nodeName==='DIV'&&n.classList.contains('stat'),
                        replacement:c=>'\n- '+c.replace(/\*\*([^*]+)\*\*/,'**$1** ').trim() });

const CELL = { owner:'● owner', source:'○ source', never:'▨ never',
               truncated:'◪ truncated', 'create-only':'◐ create-only' };
const words = s => (String(s||'').replace(/<[^>]*>/g,' ').match(/\S+/g)||[]).length;
const fm = o => '---\n' + Object.entries(o).map(([k,v]) =>
  v && typeof v === 'object' && !Array.isArray(v)
    ? k+':\n'+Object.entries(v).map(([a,b])=>'  '+a+': '+JSON.stringify(b)).join('\n')
    : k+': '+(Array.isArray(v)?JSON.stringify(v):(typeof v==='number'?v:JSON.stringify(v)))
).join('\n') + '\n---\n';

/* `demo` в detail — либо id страницы, либо путь вида zoho/<slug> или p/<id>/<section>. */
const demoHref = d => '#/' + (String(d).includes('/') ? d : 'p/' + d);

/* ---------- диаграмма → читаемый markdown + редактируемая спека ---------- */
function diagramMd(d, anchor) {
  let s = `\n<!-- diagram · ${d.kind} · вставляется после секции body[${(d.at ?? 1) - 1}] · источник: ${anchor} -->\n`;
  s += `\n### Диаграмма — ${ {chain:'цепочка шагов', authority:'матрица владения', funnel:'воронка', layers:'слои архитектуры', states:'состояния', coverage:'покрытие'}[d.kind] || d.kind }\n\n`;
  s += `_Alt-текст (\`aria\`, читается скринридером):_ ${d.aria}\n\n`;

  if (d.kind === 'authority') {
    const cols = d.cols.map(c=>c.n);
    s += '| Поле | ' + cols.join(' | ') + ' |\n|' + ' --- |'.repeat(cols.length+1) + '\n';
    for (const r of d.rows)
      s += '| ' + r.n + ' | ' + d.cols.map(c => CELL[d.cells[r.id+':'+c.id]] || '—').join(' | ') + ' |\n';
    if (d.rule) s += `\n**Правило:** ${d.rule}\n`;
    if (d.note) s += `\n**Оговорка:** ${d.note}\n`;
  }
  if (d.kind === 'chain') {
    s += (d.steps||[]).map((st,i) => {
      let l = `${i+1}. **${st.n}**` + (st.sub?` — ${st.sub}`:'');
      if (st.checkpoint) l += `\n   - чекпойнт: ${st.checkpoint}`;
      if (st.fail)       l += `\n   - отказ: ${st.fail}`;
      return l;
    }).join('\n') + '\n';
    if (d.rails?.length) s += '\n**Связи:**\n' + d.rails.map(r =>
      `- \`${r.from}\` → \`${r.to}\` (${r.kind}): ${r.label}`).join('\n') + '\n';
  }
  if (d.kind === 'layers') {
    (d.rows||[]).forEach(r => {
      if (r.arrow) { s += `\n↓ _${r.arrow}_\n`; return; }
      s += `\n**${r.label}**${r.core ? ' (ядро)' : ''}\n`;
      const cols = r.cols || [{ nodes: r.nodes }];
      cols.forEach(c => {
        if (c.label) s += `\n_${c.label}_\n`;
        (c.nodes||[]).forEach(n => { s += `- **${n.n}**${n.sub ? ' — ' + n.sub : ''}\n`; });
      });
    });
    if (d.back) s += `\n**Обратная стрелка:** ${d.back.label || ''}\n`;
  }
  if (d.kind === 'funnel') {
    s += `**Вход:** ${d.input.n}${d.input.count?` (${d.input.count})`:''}\n\n**Правила по порядку:**\n`;
    s += (d.rules||[]).map(r=>`${r.order}. ${r.n}`).join('\n') + '\n';
    if (d.gates?.length) s += '\n**Гейты:**\n' + d.gates.map(g=>`- после \`${g.after}\`: ${g.n}`).join('\n') + '\n';
    s += '\n**Корзины:**\n' + (d.buckets||[]).map(x =>
      `- ${x.n} — ${x.who==='human'?'разбирает человек':'автоматически'}`).join('\n') + '\n';
  }
  if (d.detail && Object.keys(d.detail).length) {
    s += '\n**Пояснения по клику** (`detail`):\n\n';
    for (const [k,v] of Object.entries(d.detail))
      s += `- \`${k}\` — **${v.t}**\n  ${v.d}${v.demo?`\n  _ссылка: ${demoHref(v.demo)}_`:''}\n`;
  }
  s += '\n<details>\n<summary>Редактируемая спека (это и есть источник — правьте её)</summary>\n\n```json\n'
     + JSON.stringify(d, null, 1) + '\n```\n\n</details>\n';
  return s;
}

/* ---------- сбор данных ---------- */
const b = await chromium.launch({ ...launchOpts });
const FULL = existsSync('dist-all/index.html') ? 'dist-all' : 'dist';
const p = await b.newPage({ viewport:{ width:1500, height:1000 } });
await p.goto('file://' + process.cwd() + '/' + FULL + '/index.html');
await p.waitForTimeout(700);

/* Что из этого публично — по публичной сборке. */
let PUBLIC_IDS = null, PUBLIC_TABS = null, PUBLIC_TAB_OF = {};
if (FULL !== 'dist' && existsSync('dist/index.html')) {
  const pp = await b.newPage({ viewport:{ width:1500, height:1000 } });
  await pp.goto('file://' + process.cwd() + '/dist/index.html'); await pp.waitForTimeout(500);
  const pub = await pp.evaluate(() => ({ ids:Object.fromEntries(Object.values(ALL).map(i=>[i.id,i.tab])), tabs:TABS.map(t=>t.id),
    sections: typeof PUBLIC_SECTIONS !== 'undefined' ? PUBLIC_SECTIONS : null }));
  PUBLIC_TAB_OF = pub.ids; PUBLIC_IDS = new Set(Object.keys(pub.ids)); PUBLIC_TABS = pub.tabs;
  await pp.close();
}
const isPublicId = id => PUBLIC_IDS ? PUBLIC_IDS.has(id) : true;

const D = await p.evaluate(() => {
  const clone = x => JSON.parse(JSON.stringify(x));
  const strip = h => String(h||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  const about = []; const d = document.createElement('div'); d.innerHTML = vAbout();
  const hero = d.querySelector('.hero'); if (hero) about.push({ idx:'HERO', html: hero.innerHTML });
  d.querySelectorAll('.bsec').forEach(sec => {
    const idx = sec.querySelector('.idx')?.textContent.trim() || '';
    sec.querySelector('.idx')?.remove();
    sec.querySelectorAll('.story,.term,.imap,.tsug').forEach(n=>n.remove());
    about.push({ idx, html: sec.innerHTML });
  });
  const own = {};
  for (const id of ['event','orghealth','sf-lwc','agent-journal','site']) {
    if (!PAGE[id]) continue;
    const w = document.createElement('div'); w.innerHTML = PAGE[id].render();
    w.querySelectorAll('script,.dg-detail').forEach(n=>n.remove());
    own[id] = w.innerHTML;
  }
  const contact = (() => { const w = document.createElement('div'); w.innerHTML = typeof vContact === 'function' ? vContact() : ''; return w.innerHTML; })();
  return { CASES:clone(CASES), REC:clone(REC), STORY:clone(STORY), TIPS:clone(TIPS),
    ABOUT:clone(ABOUT), EDGES:clone(EDGES), CO:clone(CO), PAIR:clone(PAIR),
    ZOHO_GROUPS:clone(ZOHO_GROUPS), AI_GROUPS:clone(AI_GROUPS), SF_ITEMS:clone(SF_ITEMS), FS_ITEMS:clone(FS_ITEMS),
    LEAD:clone(LEAD), MAT:clone(MAT), RELATED:clone(RELATED),
    ALL:Object.fromEntries(Object.entries(ALL).map(([k,v])=>[k,{t:v.t,s:v.s,kind:v.kind,tab:v.tab,group:v.group}])),
    pageIds:Object.keys(PAGE), about, own, contact,
    TEST_COUNT: typeof TEST_COUNT !== 'undefined' ? TEST_COUNT : null,
    PUB: clone(window.ZOHO_PUBLIC || null), TABS: clone(TABS),
    SECTIONS: typeof PUBLIC_SECTIONS !== 'undefined' ? clone(PUBLIC_SECTIONS) : null,
    DEMO_PARENT: typeof DEMO_PARENT !== 'undefined' ? clone(DEMO_PARENT) : {},
    ledes:{ zoho:strip(vZoho().split('<div class="sechead"')[0].split('<div class="stats">')[0]), ai:strip(vAI().split('<div class="sechead"')[0]),
            fullstack:strip(vFS().split('<div class="sechead"')[0]) }
  };
});
await b.close();

const root = 'content';
['tabs','pages','about','cases'].forEach(x=>mkdirSync(root+'/'+x,{recursive:true}));
const written = [];
const put = (f, s) => { writeFileSync(root+'/'+f, s.replace(/\n{4,}/g,'\n\n\n')); written.push(f); };

const CASE_BY_ID = {}; const CAT_BY_ID = {};
for (const [cat,l] of Object.entries(D.CASES)) l.forEach((c,i)=>{ CASE_BY_ID[c.id]=c; CAT_BY_ID[c.id]=[cat,i]; });
const REC_BY_PAGE = { solution:'solution', board:'board', 'chat-recap':'teams', 'chat-tracker':'tracker', enrichment:'enrichment', cockpit:'cockpit' };
/* Кейс, к которому страница относится на публичном сайте (ссылка «назад» ведёт в него). */
const CASE_OF_ITEM = {};
if (D.PUB) {
  Object.entries(D.DEMO_PARENT).forEach(([id,slug]) => CASE_OF_ITEM[id] = slug);
  D.PUB.CASES.forEach(c => (c.notes||[]).forEach(n => { const id = typeof n === 'string' ? n : n.id; if (!CASE_OF_ITEM[id]) CASE_OF_ITEM[id] = c.slug; }));
}
const OWN = ['event','orghealth','sf-lwc','agent-journal','site'];

/* ---------- страницы ---------- */
for (const [id, meta] of Object.entries(D.ALL)) {
  const c = CASE_BY_ID[id], recId = REC_BY_PAGE[id];
  const rec = recId ? D.REC.find(r=>r.id===recId) : null;
  const isOwn = OWN.includes(id);
  const shadowed = c && D.pageIds.includes(id);          // CASES есть, но PAGE его перекрывает

  const type = rec ? 'live-demo (общий шаблон viewRecord)'
             : isOwn ? (meta.kind === 'note' ? 'write-up (свой рендерер PAGE)' : 'live-demo (свой рендерер PAGE)')
             : c ? 'write-up (CASES → vCase)' : '—';
  const src = { nav:`src/app.html · ${meta.tab==='zoho'?'ZOHO_GROUPS':meta.tab==='ai'?'AI_GROUPS':'FS_ITEMS'} · id="${id}"` };
  if (rec)   src.body = `src/app.html · REC · id="${rec.id}"`;
  if (c)     src.body_case = `src/app.html · CASES['${CAT_BY_ID[id][0]}'][${CAT_BY_ID[id][1]}]`;
  if (isOwn) src.body_render = `src/app.html · PAGE['${id}'].render()`;

  const dgs = [ ...(c ? (c.dgs || (c.dg?[c.dg]:[])) : []), ...(rec?.dg ? [rec.dg] : []) ];
  const pub = isPublicId(id);
  let s = fm({ page:id, title:meta.t, type, tab:meta.tab, group:meta.group, route:`#/p/${id}`,
    kind:meta.kind, public:pub, ...(pub && PUBLIC_TAB_OF[id] ? { public_tab:PUBLIC_TAB_OF[id] } : {}),
    ...(CASE_OF_ITEM[id] ? { case:`#/zoho/${CASE_OF_ITEM[id]}` } : {}),
    diagrams:dgs.length, source:src,
    ...(shadowed?{warning:'CASES-запись для этой страницы НЕ рендерится: PAGE перекрывает CASES в vItem()'}:{}) });

  s += `\n# ${meta.t}\n\n> **Подпись в навигации** (\`s\`) — видна на карточке в списке:\n> ${meta.s}\n`;
  if (D.MAT[id])  s += `>\n> **Material labels** (\`MAT\`, публично не рендерятся): ${D.MAT[id].join(' · ')}\n`;
  if (D.LEAD[id]) s += `>\n> **Лид страницы** (\`LEAD\`) — абзац под подписью:\n> ${D.LEAD[id]}\n`;
  /* `sub` больше не виден на сайте: vItem срезает .pagehead целиком, а лид берётся
     из LEAD. Оставлен в экспорте как исходный материал, но помечен честно. */
  if (rec) s += `>
> **`+'`sub`'+` — НЕ рендерится, см. LEAD:**
> ${rec.sub}
`;
  if (c)   s += `>
> **`+'`sub`'+` — НЕ рендерится, см. LEAD:**
> ${c.sub}
`;

  if (rec) {
    s += `\n## What to try\n\n` + rec.try.map(t=>`- ${t}`).join('\n') + '\n';
    if (rec.dg) s += diagramMd(rec.dg, `REC['${rec.id}'].dg`);
    s += `\n## Why it was not straightforward\n`;
    if (rec.whyParts) rec.whyParts.forEach(([h,t])=>{ s += `\n### ${h}\n\n${t}\n`; });
    else s += `\n${rec.why}\n`;
  }
  if (c && !shadowed) {
    if (c.role) s += `\n> **My role on this one:** ${c.role}\n`;
    if (c.contents) s += `\n## Блок содержания (\`contents\`)\n\n`
      + c.contents.map(([aid,q,blurb])=>`- **${q}** (\`sec-${aid}\`) — ${blurb}`).join('\n') + '\n';
    const specs = (c.dgs || (c.dg?[c.dg]:[])).slice().sort((a,b)=>(a.at??1)-(b.at??1));
    c.body.forEach(([h,t],i)=>{
      specs.filter(d=>(d.at??1)===i).forEach((d,j)=>{ s += diagramMd(d, `CASES · dgs[${j}]`); });
      s += `\n## ${h}\n\n${t}\n`;
    });
    specs.filter(d=>(d.at??1)>=c.body.length).forEach(d=>{ s += diagramMd(d, 'CASES · dgs[]'); });
  }
  if (isOwn) {
    s += `\n## Текст страницы\n\n_Проза этой страницы живёт прямо в разметке рендерера — правьте по совпадению строки._\n\n`;
    s += td.turndown(D.own[id]) + '\n';
  }
  if (shadowed) {
    s += `\n## ⚠️ Мёртвый текст: CASES-запись, которая не рендерится\n\n`
      + `Роутер (\`vItem\`) отдаёт приоритет \`PAGE\` над \`CASES\`, поэтому этот текст на сайте не виден. `
      + `Либо удалить, либо перенести в рендерер выше.\n\n`;
    c.body.forEach(([h,t])=>{ s += `### ${h}\n\n${t}\n\n`; });
  }
  if (D.PAIR[id]) s += `\n## See it live\n\nБлок-callout внизу страницы ведёт на \`#/p/${D.PAIR[id]}\` — ${D.ALL[D.PAIR[id]].t}.\n`;
  if (D.RELATED[id]) s += `\n## Related\n\n`
    + D.RELATED[id].filter(r=>D.ALL[r]).map(r=>`- [\`${r}\`](./${r}.md) — ${D.ALL[r].t}`).join('\n') + '\n';
  put(`pages/${id}.md`, s);
}


/* ---------- кейсы (src/cases.js) ---------- */
const html2md = h => td.turndown(String(h||'')).trim();
if (D.PUB) {
  D.PUB.CASES.forEach((c, i) => {
    const S = c.summary || {};
    let s = fm({ case:c.slug, num:c.num, title:c.t, route:`#/zoho/${c.slug}`, public:true,
      embed:c.embed || null, examples:(c.examples||[]).map(e=>e.id),
      notes:(c.notes||[]).map(n=>typeof n==='string'?n:n.id+'/'+n.sec), related:c.related||[],
      words: words(c.context)+words(c.architecture&&c.architecture.text)+(c.implementation||[]).reduce((n,[,t])=>n+words(t),0)
            +(c.reliability?c.reliability.rows.reduce((n,[a,b])=>n+words(a)+words(b),0):0)+words(c.security)+words(c.role)+words(c.result),
      source:{ body:`src/cases.js · CASES[${i}] (slug "${c.slug}")`, furniture:'src/app.html · vCaseStudy()' } });
    s += `\n# ${c.num} · ${c.t}\n\n> **Kicker** (\`kicker\`): ${c.kicker}\n>\n> **Одной строкой** (\`one\`): ${c.one}\n`;
    s += `\n## Summary\n\n- **What:** ${S.what||''}\n- **Scale:** ${S.scale||''}\n- **My role:** ${S.role||''}\n- **Key topics:** ${(S.topics||[]).join(' · ')}\n`;
    if (c.facts) s += `\n## Key facts\n\n| | |\n| --- | --- |\n` + c.facts.map(([k,v])=>`| ${k} | ${v} |`).join('\n') + '\n';
    s += `\n## Context\n\n${html2md(c.context)}\n`;
    if (c.architecture) {
      s += `\n## Architecture\n\n${html2md(c.architecture.text)}\n`;
      if (c.architecture.dg) s += diagramMd(c.architecture.dg, `CASES[${i}].architecture.dg`);
    }
    if (c.constraints) s += `\n## Constraints\n\n` + c.constraints.map(([k,v])=>`- **${k}** — ${v}`).join('\n') + '\n';
    if (c.implementation) { s += `\n## Implementation\n`; c.implementation.forEach(([h,t]) => { s += `\n### ${h}\n\n${html2md(t)}\n`; }); }
    if (c.reliability) s += `\n## Reliability and failure handling\n\n${c.reliability.intro||''}\n\n| When | What the system does |\n| --- | --- |\n`
      + c.reliability.rows.map(([a,b])=>`| ${a} | ${b} |`).join('\n') + '\n';
    if (c.security) s += `\n## Data ownership and security\n\n${html2md(c.security)}\n`;
    if (c.role) s += `\n## My responsibility\n\n${html2md(c.role)}\n`;
    if (c.result) s += `\n## Result\n\n${html2md(c.result)}\n`;
    if (c.embed) s += `\n## Interactive example\n\nВстроено: [\`${c.embed}\`](../pages/${c.embed}.md)${c.embedTab?` (вкладка «${c.embedTab}»)`:''}.${c.embedNote?`\n\n> ${c.embedNote}`:''}\n`;
    if (c.examples && c.examples.length) s += `\n## More examples\n\n` + c.examples.map(e=>`- [\`${e.id}\`](../pages/${e.id}.md)${e.note?` — ${e.note}`:''}`).join('\n') + '\n';
    if (c.notes && c.notes.length) s += `\n## Technical notes\n\n` + c.notes.map(n => typeof n==='string'
      ? `- [\`${n}\`](../pages/${n}.md)` : `- [\`${n.id}/${n.sec}\`](../pages/${n.id}.md) — **${n.t}** ${n.s}`).join('\n') + '\n';
    if (c.related && c.related.length) s += `\n## Related cases\n\n` + c.related.map(r=>`- [\`${r}\`](./${r}.md)`).join('\n') + '\n';
    put(`cases/${c.slug}.md`, s);
  });

  /* about-demos — короткая страница, тоже данные в src/cases.js */
  const A = D.PUB.ABOUT_DEMOS;
  let s = fm({ page:'about-demos', title:A.t, route:'#/about-demos', public:true, source:{ body:'src/cases.js · ABOUT_DEMOS', furniture:'src/app.html · vAboutDemos()' } });
  s += `\n# ${A.t}\n`;
  A.body.forEach(([h,t]) => { s += `\n## ${h}\n\n${t}\n`; });
  put('pages/about-demos.md', s);
}

/* ---------- контакт ---------- */
{
  let s = fm({ tab:'contact', title:'Contact', route:'#/contact', public: PUBLIC_TABS ? PUBLIC_TABS.includes('contact') : true,
    source:{ body:'src/app.html · vContact()' } });
  s += `\n# Contact\n\n_Проза живёт прямо в разметке \`vContact()\` — правьте по совпадению строки._\n\n` + html2md(D.contact) + '\n';
  put('tabs/contact.md', s);
}

/* ---------- табы ---------- */
/* sf-lwc lives under a Zoho group rather than on a tab of its own, so it is
   appended to the Zoho listing the same way `reg()` appends it in the site. */
const tabItems = { zoho:[...D.ZOHO_GROUPS.flatMap(g=>g.items), ...D.SF_ITEMS],
                   ai:D.AI_GROUPS.flatMap(g=>g.items), fullstack:D.FS_ITEMS };
const tabTitle = { zoho:'Zoho', ai:'Applied AI', fullstack:'Full-stack' };
for (const [tab, items] of Object.entries(tabItems)) {
  let s = fm({ tab, title:tabTitle[tab], route:`#/${tab}`, items:items.length, public: PUBLIC_TABS ? PUBLIC_TABS.includes(tab) : true,
    source:{ lede:`src/app.html · v${tab==='zoho'?'Zoho':tab==='ai'?'AI':'FS'}()`,
             items:`src/app.html · ${tab==='zoho'?'ZOHO_GROUPS':tab==='ai'?'AI_GROUPS':'FS_ITEMS'}` } });
  s += `\n# ${tabTitle[tab]}\n\n## Лид страницы\n\n${D.ledes[tab]}\n`;
  if (tab === 'zoho' && D.PUB) {
    const O = D.PUB.OVERVIEW;
    s += `\n## Плашка масштаба (\`OVERVIEW.scale\`, src/cases.js)\n\n` + O.scale.map(([b,l])=>`- **${b}** ${l}`).join('\n') + '\n';
    s += `\n## Направления (\`OVERVIEW.directions\`)\n`;
    O.directions.forEach(([h,t,tags]) => { s += `\n### ${h}\n\n${t}\n\n_Теги:_ ${tags.join(' · ')}\n`; });
    if (D.PUB.ARCH) s += `\n## Платформа как одна система (\`ARCH\`)\n` + diagramMd(D.PUB.ARCH, 'src/cases.js · ARCH');
    s += `\n## Кейсы (\`CASES\`, по файлу на кейс в content/cases/)\n\n` + D.PUB.CASES.map(c=>`- ${c.num} [\`${c.slug}\`](../cases/${c.slug}.md) — ${c.t}`).join('\n') + '\n';
    s += `\n_Публично страница Zoho рисуется из этих данных (\`vZoho()\`); группы ниже — реестр страниц (\`ZOHO_GROUPS\`), их абзацы на публичной странице не показываются._\n`;
  }
  s += `\n## Карточки\n\n`;
  s += '| id | Заголовок (`t`) | Подпись (`s`) | Вид | Публично |\n| --- | --- | --- | --- | --- |\n';
  items.forEach(i=>{ s += `| [\`${i.id}\`](../pages/${i.id}.md) | ${i.t} | ${i.s} | ${i.kind} | ${isPublicId(i.id) ? (PUBLIC_TAB_OF[i.id] && PUBLIC_TAB_OF[i.id]!==tab ? 'да, под '+PUBLIC_TAB_OF[i.id] : 'да') : 'нет'} |\n`; });
  const groups = tab==='zoho' ? D.ZOHO_GROUPS : tab==='ai' ? D.AI_GROUPS : null;
  if (groups) {
    s += `
## Группы

Каждая группа несёт свой абзац (\`intro\`), список написанных страниц и — через \`also\` — `
       + `страницы, которые относятся к этой работе, но живут на другой вкладке.

`;
    groups.forEach(g=>{
      s += `### ${g.h}

${g.intro}

`;
      if (g.items.length) s += `Входят: ${g.items.map(i=>'`'+i.id+'`').join(', ')}

`;
      if (g.also) s += `${g.alsoLabel || 'Также относится'}: ${g.also.map(i=>'`'+i+'`').join(', ')}

`;
    });
  }
  put(`tabs/${tab}.md`, s);
}
/* about-me */
{
  let s = fm({ tab:'about', title:'About me', route:'#/about', blocks:D.about.length,
    source:{ body:'src/app.html · vAbout()', skills:'src/app.html · STORY (76) + TIPS (78)' } });
  s += `\n# About me\n\nСтраница собрана из блоков в \`vAbout()\`. Карта навыков (\`STORY\`) и подсказки (\`TIPS\`) вынесены `
     + `в отдельные файлы: [skills-map.md](../about/skills-map.md), [skill-tips.md](../about/skill-tips.md). `
     + `Карта интеграций — [integration-map.md](../about/integration-map.md).\n`;
  D.about.forEach(bl => { s += `\n---\n\n## ${bl.idx}\n\n` + td.turndown(bl.html) + '\n'; });
  put('tabs/about-me.md', s);
}

/* ---------- about: STORY / TIPS / EDGES ---------- */
{
  let s = fm({ file:'skills-map', title:'Карта навыков (STORY)', entries:Object.keys(D.STORY).length,
    words:Object.values(D.STORY).reduce((n,x)=>n+words(x.t)+words(x.b)+words(x.r),0),
    source:{ code:'src/app.html · STORY' } });
  s += `\n# Карта навыков\n\nБлок «03 / SKILLS» на About. Каждая запись раскрывается по клику на навык.\n`
     + `Поля: \`w\` — где и когда, \`t\` — задача/ограничение, \`b\` — что построено, \`r\` — результат, `
     + `\`demo\` — ссылка на страницу, \`code\` — фрагмент кода.\n`;
  for (const [k,v] of Object.entries(D.STORY)) {
    s += `\n---\n\n## ${k}\n\n**Где:** ${v.w}\n\n**Задача:** ${v.t}\n\n**Построено:** ${v.b}\n\n**Результат:** ${v.r}\n`;
    if (v.demo) s += `\n_Ссылка на демо:_ \`#/p/${v.demo}\`\n`;
    if (v.code) s += `\n\`\`\`js\n${v.code}\n\`\`\`\n`;
  }
  put('about/skills-map.md', s);
}
{
  let s = fm({ file:'skill-tips', title:'Подсказки к навыкам (TIPS)', entries:Object.keys(D.TIPS).length,
    words:Object.values(D.TIPS).reduce((n,t)=>n+words(t),0), source:{ code:'src/app.html · TIPS' } });
  s += `\n# Подсказки к навыкам\n\nПоказываются при наведении/фокусе на навык. Одна строка на навык.\n\n`;
  for (const [k,v] of Object.entries(D.TIPS)) s += `### ${k}\n\n${v}\n\n`;
  put('about/skill-tips.md', s);
}
{
  let s = fm({ file:'integration-map', title:'Карта интеграций (EDGES)', nodes:D.EDGES.length,
    source:{ code:'src/app.html · EDGES' } });
  s += `\n# Карта интеграций\n\nSVG-схема в блоке «02 / THE SYSTEM» на About. Клик по узлу раскрывает подпись.\n\n`;
  D.EDGES.forEach(e=>{
    s += `## ${e.n || e.id}\n\n`;
    if (e.sub)  s += `**Подпись на схеме** (\`sub\`): ${e.sub}\n\n`;
    if (e.t)    s += `**Заголовок в раскрытии** (\`t\`): ${e.t}\n\n`;
    if (e.d)    s += `${e.d}\n\n`;
    if (e.demo) s += `_демо:_ \`#/p/${e.demo}\`\n\n`;
  });
  put('about/integration-map.md', s);
}
console.log('написано файлов:', written.length);
written.sort().forEach(f=>console.log('  content/'+f));
