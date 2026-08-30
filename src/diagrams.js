/* =============================================================
   Diagrams engine — hand-drawn SVG schematics for the write-up pages.

   Same trick as the integration map (imapSVG/ZONES/EDGES, above this
   file's injection point): plain SVG strings, a click on a node fills
   a detail panel underneath. This file generalises that one pattern
   into five reusable archetypes so a write-up's data structure, not
   hand-drawn coordinates, describes the picture.

   No runtime dependencies. One visual language across all five kinds:
     node        fill #F8F9FB  stroke #D9DCE5
     node.active fill #EDEDFB  stroke #5B5BD6
     edge        stroke #C3C8D6
     warn        #B0722A
     label       DM Mono 9.5px
     heading     Instrument Sans 12.5px

   API:
     window.Diagrams.render(spec) -> html string
       <figure class="dg">…<svg>…</svg><div class="dg-detail"></div></figure>
     window.Diagrams.wire(rootEl)
       attaches click + keyboard handling to every .dg found under rootEl
============================================================= */
(function () {
'use strict';

const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const escAttr = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const INK = '#16181D';
const SUB = '#8A8F9C';
const LINE = '#D9DCE5';
const FILL = '#F8F9FB';
const ACTIVE_FILL = '#EDEDFB';
const ACTIVE_LINE = '#5B5BD6';
const EDGE = '#C3C8D6';
const WARN = '#B0722A';

/* ---------- small shared SVG builders ---------- */

function textLine(x, y, s, opts) {
  opts = opts || {};
  const anchor = opts.anchor || 'middle';
  const cls = opts.cls ? ' class="' + opts.cls + '"' : '';
  const style = opts.style || '';
  return '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor + '"' + cls
    + (style ? ' style="' + style + '"' : '') + '>' + esc(s) + '</text>';
}

function arrowMarkerDefs() {
  return '<defs>'
    + '<marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
    + '<path d="M0,0 L10,5 L0,10 z" fill="' + EDGE + '"></path></marker>'
    + '<marker id="dg-arrow-warn" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
    + '<path d="M0,0 L10,5 L0,10 z" fill="' + WARN + '"></path></marker>'
    + '</defs>';
}

function rectNode(id, x, y, w, h, label, sub, opts) {
  opts = opts || {};
  const rx = opts.rx != null ? opts.rx : 10;
  const cls = 'dgnode' + (opts.cls ? ' ' + opts.cls : '');
  const labelStyle = 'font:600 12.5px "Instrument Sans",sans-serif;fill:' + INK + ';pointer-events:none';
  const subStyle = 'font:400 9.5px "DM Mono",monospace;fill:' + SUB + ';pointer-events:none';
  let inner = '<rect x="0" y="0" width="' + w + '" height="' + h + '" rx="' + rx + '"></rect>';
  const midY = sub ? h / 2 - 3 : h / 2 + 4;
  inner += textLine(w / 2, midY, label, { style: labelStyle });
  if (sub) inner += textLine(w / 2, h / 2 + 14, sub, { style: subStyle });
  return '<g class="' + cls + '" data-dgid="' + esc(id) + '" tabindex="0" role="button" '
    + 'transform="translate(' + x + ',' + y + ')">' + inner + '</g>';
}

function diamond(id, cx, cy, size, label) {
  const h = size, w = size * 1.7;
  const pts = [ [cx, cy - h/2], [cx + w/2, cy], [cx, cy + h/2], [cx - w/2, cy] ]
    .map(p => p[0] + ',' + p[1]).join(' ');
  const style = 'font:400 9px "DM Mono",monospace;fill:#fff;pointer-events:none';
  return '<g class="dgfail" data-dgid="' + esc(id) + '" tabindex="0" role="button">'
    + '<polygon points="' + pts + '" fill="' + WARN + '" stroke="' + WARN + '"></polygon>'
    + textLine(cx, cy + 3, label, { style }) + '</g>';
}

/* ---------- detail panel wiring (shared by all archetypes) ---------- */

function detailHTML(entry) {
  if (!entry) return '';
  let h = '<p class="t">' + esc(entry.t || '') + '</p>';
  if (entry.d) h += '<p>' + esc(entry.d) + '</p>';
  if (entry.demo) h += '<p><a href="#/p/' + esc(entry.demo) + '">Open the demo / write-up &rarr;</a></p>';
  return h;
}

function activate(root, spec, id) {
  const detail = root.querySelector('.dg-detail');
  if (!detail) return;
  root.querySelectorAll('[data-dgid]').forEach(el => el.classList.toggle('on', el.dataset.dgid === id));
  // A chain's failure diamond (id "<step>:fail") tells the same story as its
  // step — "what happens / how it breaks / what the system does" — so it
  // falls back to the step's own detail entry rather than needing a
  // duplicate one authored per failure point.
  const base = id && id.indexOf(':fail') === id.length - 5 ? id.slice(0, -5) : id;
  const entry = (spec.detail && spec.detail[id]) || (spec.detail && spec.detail[base]);
  detail.innerHTML = detailHTML(entry);
  detail.id = detail.id || ('dg-detail-' + Math.random().toString(36).slice(2));
  root.querySelectorAll('[data-dgid]').forEach(el => el.setAttribute('aria-describedby', detail.id));
}

/* ================= archetype A: chain ================= */

function chainSVG(spec, vertical) {
  const steps = spec.steps || [];
  const n = steps.length;
  const stepW = 118, stepH = 46, gapX = 46, gapY = 30, failH = 30, pad = 24;
  let svg, w, h;

  if (!vertical) {
    w = pad * 2 + n * stepW + (n - 1) * gapX;
    h = 220;
    const baseY = 70;
    let body = arrowMarkerDefs();
    const cx = i => pad + i * (stepW + gapX);
    // edges between steps
    for (let i = 0; i < n - 1; i++) {
      const x1 = cx(i) + stepW, x2 = cx(i + 1);
      body += '<line class="dgedge" x1="' + x1 + '" y1="' + (baseY + stepH/2) + '" x2="' + x2 + '" y2="' + (baseY + stepH/2)
        + '" marker-end="url(#dg-arrow)"></line>';
    }
    // rails (retry/fallback/loop arcs above, async below)
    (spec.rails || []).forEach(r => {
      const fromIdx = steps.findIndex(s => s.id === r.from);
      const toIdx = steps.findIndex(s => s.id === r.to);
      if (fromIdx < 0 || toIdx < 0) return;
      if (r.kind === 'async') {
        const x = cx(fromIdx) + stepW / 2;
        const y1 = baseY + stepH, y2 = y1 + 46;
        body += '<line class="dgedge dgasync" x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2
          + '" marker-end="url(#dg-arrow)"></line>';
        body += rectNode('rail:' + r.from + ':' + r.to, x - 80, y2, 160, 40, r.label, '', { cls: 'dgasyncnode' });
        body += textLine(x, y2 - 6, r.sub || '', { style: 'font:400 9px "DM Mono",monospace;fill:' + SUB });
      } else if (r.kind === 'branch') {
        const x = cx(fromIdx) + stepW / 2;
        const y1 = baseY + stepH, y2 = y1 + 46;
        body += '<line class="dgedge dgasync" x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y2
          + '" marker-end="url(#dg-arrow)"></line>';
        body += rectNode('rail:' + r.from + ':' + r.to, x - 84, y2, 168, 40, r.label, '', { cls: 'dgasyncnode' });
      } else {
        // retry / fallback / loop — an arc over the top with a label
        const x1 = cx(Math.min(fromIdx, toIdx)) + stepW / 2;
        const x2 = cx(Math.max(fromIdx, toIdx)) + stepW / 2;
        const midX = (x1 + x2) / 2;
        const arcY = baseY - 34;
        body += '<path class="dgedge dgrail" d="M' + x1 + ',' + (baseY - 2) + ' Q' + midX + ',' + arcY + ' ' + x2 + ',' + (baseY - 2)
          + '" marker-end="url(#dg-arrow)"></path>';
        body += textLine(midX, arcY - 6, r.label, { style: 'font:400 9px "DM Mono",monospace;fill:' + SUB });
      }
    });
    // step nodes
    steps.forEach((s, i) => {
      const x = cx(i), y = baseY;
      body += rectNode(s.id, x, y, stepW, stepH, s.n, s.sub, {});
      if (s.checkpoint) {
        const tickX = x + stepW + gapX / 2;
        body += '<line x1="' + tickX + '" y1="' + (y + stepH/2 - 10) + '" x2="' + tickX + '" y2="' + (y + stepH/2 + 10)
          + '" stroke="' + ACTIVE_LINE + '" stroke-width="2.4"></line>';
        body += textLine(tickX, y + stepH/2 + 24, s.checkpoint, { style: 'font:400 8.5px "DM Mono",monospace;fill:' + ACTIVE_LINE });
      }
      if (s.fail) {
        const dx = x + stepW / 2, dy = y + stepH + failH / 2 + 10;
        body += diamond(s.id + ':fail', dx, dy, failH, s.fail);
      }
    });
    h = 70 + stepH + failH + 60;
    svg = '<svg role="img" data-dg-fluid="1" aria-label="' + esc(spec.aria) + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';
  } else {
    w = 320;
    const nodeY = i => 20 + i * (stepH + gapY + 24);
    let body = arrowMarkerDefs();
    for (let i = 0; i < n - 1; i++) {
      const y1 = nodeY(i) + stepH, y2 = nodeY(i + 1);
      body += '<line class="dgedge" x1="' + (w/2) + '" y1="' + y1 + '" x2="' + (w/2) + '" y2="' + y2
        + '" marker-end="url(#dg-arrow)"></line>';
    }
    steps.forEach((s, i) => {
      const y = nodeY(i);
      body += rectNode(s.id, w/2 - stepW/2, y, stepW, stepH, s.n, s.sub, {});
      if (s.fail) {
        const dx = w/2 + stepW/2 + 46, dy = y + stepH/2;
        body += diamond(s.id + ':fail', dx, dy, 24, s.fail);
      }
    });
    h = nodeY(n - 1) + stepH + 20;
    svg = '<svg role="img" data-dg-fluid="1" aria-label="' + esc(spec.aria) + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';
  }
  const legend = '<div class="dg-legend">'
    + '<span><i class="lg-line"></i> synchronous call</span>'
    + '<span><i class="lg-line lg-dash"></i> does not wait</span>'
    + '<span><i class="lg-diamond"></i> known failure point</span>'
    + '<span><i class="lg-tick"></i> checkpoint saved</span>'
    + '</div>';
  return { svg, legend, w, h };
}

/* ================= archetype B: authority ================= */

function authoritySVG(spec) {
  const rows = spec.rows || [], cols = spec.cols || [];
  const rowLabelW = 168, cellW = 116, cellH = 40, headH = 54, pad = 8;
  const w = rowLabelW + cols.length * cellW + pad * 2;
  const h = headH + rows.length * cellH + pad * 2;
  let body = '';
  // column headers
  cols.forEach((c, ci) => {
    const x = rowLabelW + ci * cellW + cellW / 2;
    body += textLine(x, headH - 16, c.n, { style: 'font:600 11.5px "Instrument Sans",sans-serif;fill:' + INK });
  });
  rows.forEach((r, ri) => {
    const y = headH + ri * cellH;
    body += textLine(rowLabelW - 12, y + cellH / 2 + 4, r.n, { anchor: 'end', style: 'font:400 11px "Instrument Sans",sans-serif;fill:' + INK });
    cols.forEach((c, ci) => {
      const x = rowLabelW + ci * cellW;
      const key = r.id + ':' + c.id;
      const state = (spec.cells || {})[key] || 'never';
      body += authorityCell(key, x, y, cellW, cellH, state);
    });
  });
  const svg = '<svg role="img" width="' + w + '" aria-label="' + esc(spec.aria) + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';
  const legend = '<div class="dg-legend">'
    + '<span><i class="lg-cell lg-owner"></i> owner</span>'
    + '<span><i class="lg-cell lg-source"></i> source</span>'
    + '<span><i class="lg-cell lg-never"></i> never</span>'
    + '<span><i class="lg-cell lg-create"></i> create-only</span>'
    + '<span><i class="lg-cell lg-trunc"></i> truncated</span>'
    + '</div>';
  return { svg, legend, w, h };
}

function authorityCell(key, x, y, w, h, state) {
  const cx = x + w/2, cy = y + h/2;
  const gap = 3;
  let inner = '';
  const box = 'x="' + (x+gap) + '" y="' + (y+gap) + '" width="' + (w-gap*2) + '" height="' + (h-gap*2) + '" rx="6"';
  if (state === 'owner') {
    inner = '<rect ' + box + ' fill="' + ACTIVE_FILL + '" stroke="' + ACTIVE_LINE + '"></rect>'
      + '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + ACTIVE_LINE + '"></circle>';
  } else if (state === 'source') {
    inner = '<rect ' + box + ' fill="' + FILL + '" stroke="' + LINE + '"></rect>';
  } else if (state === 'never') {
    const cid = 'hatch-' + key.replace(/[^a-z0-9]/gi, '');
    inner = '<defs><pattern id="' + cid + '" width="6" height="6" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">'
      + '<line x1="0" y1="0" x2="0" y2="6" stroke="' + LINE + '" stroke-width="2"></line></pattern></defs>'
      + '<rect ' + box + ' fill="url(#' + cid + ')" stroke="' + LINE + '"></rect>';
  } else if (state === 'create-only') {
    inner = '<rect ' + box + ' fill="' + FILL + '" stroke="' + LINE + '"></rect>'
      + '<path d="M' + (x+gap) + ',' + (y+gap) + ' L' + (x+w-gap) + ',' + (y+gap) + ' L' + (x+w-gap) + ',' + (y+h-gap) + ' Z" fill="' + ACTIVE_FILL + '"></path>'
      + '<rect ' + box + ' fill="none" stroke="' + ACTIVE_LINE + '"></rect>';
  } else if (state === 'truncated') {
    const cut = 10;
    const pts = [ [x+gap,y+gap], [x+w-gap-cut,y+gap], [x+w-gap,y+gap+cut], [x+w-gap,y+h-gap], [x+gap,y+h-gap] ]
      .map(p => p.join(',')).join(' ');
    inner = '<polygon points="' + pts + '" fill="' + FILL + '" stroke="' + WARN + '"></polygon>';
  }
  return '<g class="dgcell" data-dgid="' + esc(key) + '" tabindex="0" role="button">' + inner + '</g>';
}

/* ================= archetype C: states ================= */

function statesSVG(spec) {
  const states = spec.states || [];
  const n = states.length;
  const pillW = 132, pillH = 44, gapX = 64, pad = 30, actorW = 150;
  const w = pad * 2 + n * pillW + (n - 1) * gapX + actorW;
  const y = 70;
  let body = arrowMarkerDefs();
  const cx = i => pad + i * (pillW + gapX);
  (spec.transitions || []).forEach(t => {
    const fromIdx = states.findIndex(s => s.id === t.from);
    const toIdx = states.findIndex(s => s.id === t.to);
    if (fromIdx < 0 || toIdx < 0) return;
    const x1 = cx(fromIdx) + pillW, x2 = cx(toIdx);
    const stroke = t.cost === 'expensive' ? WARN : ACTIVE_LINE;
    const marker = t.cost === 'expensive' ? 'url(#dg-arrow-warn)' : 'url(#dg-arrow)';
    if (x2 >= x1) {
      body += '<line class="dgedge dgtrans" data-dgid="tr:' + esc(t.from + '>' + t.to) + '" tabindex="0" role="button" '
        + 'x1="' + x1 + '" y1="' + (y + pillH/2) + '" x2="' + x2 + '" y2="' + (y + pillH/2)
        + '" stroke="' + stroke + '" marker-end="' + marker + '"></line>';
      body += textLine((x1+x2)/2, y - 10, t.label || t.by || '', { style: 'font:400 9px "DM Mono",monospace;fill:' + SUB });
    } else {
      const midX = (x1+x2)/2, arcY = y + pillH + 34;
      body += '<path class="dgedge dgtrans" data-dgid="tr:' + esc(t.from + '>' + t.to) + '" tabindex="0" role="button" '
        + 'd="M' + x1 + ',' + (y+pillH) + ' Q' + midX + ',' + arcY + ' ' + x2 + ',' + (y+pillH)
        + '" stroke="' + stroke + '" fill="none" marker-end="' + marker + '"></path>';
      body += textLine(midX, arcY + 14, t.label || t.by || '', { style: 'font:400 9px "DM Mono",monospace;fill:' + SUB });
    }
  });
  states.forEach((s, i) => {
    const x = cx(i);
    const rx = 22;
    const cls = 'dgnode' + (s.final ? ' dgfinal' : '');
    let g = '<g class="' + cls + '" data-dgid="' + esc(s.id) + '" tabindex="0" role="button" transform="translate(' + x + ',' + y + ')">';
    g += '<rect x="0" y="0" width="' + pillW + '" height="' + pillH + '" rx="' + rx + '"></rect>';
    if (s.final) g += '<rect x="4" y="4" width="' + (pillW-8) + '" height="' + (pillH-8) + '" rx="' + (rx-4) + '" fill="none" stroke="' + INK + '" stroke-width="1.2"></rect>';
    g += textLine(pillW/2, pillH/2 + 4, s.n, { style: 'font:600 12px "Instrument Sans",sans-serif;fill:' + INK });
    g += '</g>';
    body += g;
  });
  const h = y + pillH + 90;
  // actor legend on the right
  const actorsX = w - actorW + 10;
  let actorsBody = textLine(actorsX, 26, 'ACTORS', { anchor: 'start', style: 'font:500 9.5px "DM Mono",monospace;letter-spacing:.12em;fill:' + SUB });
  (spec.actors || []).forEach((a, i) => {
    actorsBody += textLine(actorsX, 48 + i * 20, a.n + ' — ' + a.freq, { anchor: 'start', style: 'font:400 10.5px "Instrument Sans",sans-serif;fill:' + INK });
  });
  body += actorsBody;
  const svg = '<svg role="img" width="' + w + '" aria-label="' + esc(spec.aria) + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';
  const legend = '<div class="dg-legend">'
    + '<span><i class="lg-line"></i> cheap, frequent</span>'
    + '<span><i class="lg-line lg-warn"></i> expensive, rare</span>'
    + '<span><i class="lg-final"></i> final state</span>'
    + '</div>';
  return { svg, legend, w, h };
}

/* ================= archetype D: funnel ================= */

function funnelSVG(spec) {
  const rules = (spec.rules || []).slice().sort((a,b) => (a.order||0) - (b.order||0));
  const buckets = spec.buckets || [];
  const inputW = 150, ruleW = 190, bucketW = 200;
  const colGap = 70;
  const rowH = 40, rowGap = 12;
  const pad = 24;
  const rulesX = pad + inputW + colGap;
  const bucketsX = rulesX + ruleW + colGap;
  const w = bucketsX + bucketW + pad;
  const rulesH = rules.length * (rowH + rowGap) - rowGap;
  const bucketsH = buckets.length * (rowH + rowGap) - rowGap;
  const contentH = Math.max(rulesH, bucketsH, 60);
  const topPad = 40;
  const h = topPad + contentH + 50;
  let body = arrowMarkerDefs();

  // input node, vertically centred
  const inputY = topPad + contentH/2 - 30;
  body += rectNode('input', pad, inputY, inputW, 60, spec.input.n, spec.input.count ? (spec.input.count + ' rows') : '', {});

  // rule column
  rules.forEach((r, i) => {
    const y = topPad + i * (rowH + rowGap);
    body += rectNode(r.id, rulesX, y, ruleW, rowH, (r.order != null ? (r.order + '. ') : '') + r.n, '', { cls: 'dgrule' });
  });

  // input -> first rule edge
  if (rules.length) {
    body += '<line class="dgedge" x1="' + (pad+inputW) + '" y1="' + (inputY+30) + '" x2="' + rulesX + '" y2="' + (topPad+rowH/2)
      + '" marker-end="url(#dg-arrow)"></line>';
    for (let i = 0; i < rules.length - 1; i++) {
      const y1 = topPad + i*(rowH+rowGap) + rowH;
      const y2 = topPad + (i+1)*(rowH+rowGap);
      body += '<line class="dgedge" x1="' + (rulesX+ruleW/2) + '" y1="' + y1 + '" x2="' + (rulesX+ruleW/2) + '" y2="' + y2
        + '" marker-end="url(#dg-arrow)"></line>';
    }
  }

  // rule -> buckets fan-out (from last rule to every bucket)
  const lastRuleY = rules.length ? topPad + (rules.length-1)*(rowH+rowGap) + rowH/2 : topPad + rowH/2;
  buckets.forEach((b, i) => {
    const y = topPad + i * (rowH + rowGap);
    body += '<line class="dgedge" x1="' + (rulesX+ruleW) + '" y1="' + lastRuleY + '" x2="' + bucketsX + '" y2="' + (y+rowH/2)
      + '" marker-end="url(#dg-arrow)"></line>';
    const cls = 'dgbucket' + (b.who === 'human' ? ' dghuman' : '');
    const label = b.n + (b.share != null ? ' (' + b.share + ')' : '');
    body += rectNode(b.id, bucketsX, y, bucketW, rowH, label, b.who === 'human' ? 'worked by a person' : '', { cls });
  });

  // gates: horizontal lines across the rule column with a label
  (spec.gates || []).forEach(g => {
    const idx = rules.findIndex(r => r.id === g.after);
    if (idx < 0) return;
    const y = topPad + idx * (rowH + rowGap) + rowH + rowGap/2;
    body += '<line x1="' + (rulesX-14) + '" y1="' + y + '" x2="' + (rulesX+ruleW+14) + '" y2="' + y
      + '" stroke="' + WARN + '" stroke-width="1.4" stroke-dasharray="3,3"></line>';
    body += textLine(rulesX+ruleW/2, y - 6, g.n, { style: 'font:400 9px "DM Mono",monospace;fill:' + WARN });
  });

  const svg = '<svg role="img" width="' + w + '" aria-label="' + esc(spec.aria) + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';
  const legend = '<div class="dg-legend">'
    + '<span><i class="lg-cell" style="background:' + FILL + ';border:1px solid ' + LINE + '"></i> resolved automatically</span>'
    + '<span><i class="lg-cell lg-human"></i> worked by a person</span>'
    + '<span><i class="lg-gate"></i> gate</span>'
    + '</div>';
  return { svg, legend, w, h };
}

/* ================= archetype E: coverage ================= */

function coverageSVG(spec) {
  const groups = spec.groups || [];
  const rowH = 26, rowGap = 6, groupGap = 22, labelW = 190, barMaxW = 360, pad = 20;
  const axisMax = (spec.axis && spec.axis.max) || Math.max(1, ...groups.flatMap(g => g.items.map(i => i.value)));
  let y = pad + 20;
  let body = '';
  groups.forEach(g => {
    body += textLine(pad, y, g.n, { anchor: 'start', style: 'font:600 11px "Instrument Sans",sans-serif;fill:' + INK });
    y += 18;
    g.items.forEach(it => {
      const barW = Math.max(4, (it.value / axisMax) * barMaxW);
      const fill = it.flag === 'dead' ? '#EDEDED' : it.flag === 'broken' ? '#F6E3D3' : it.flag === 'unguarded' ? '#FBE9E9' : ACTIVE_FILL;
      const stroke = it.flag === 'broken' || it.flag === 'unguarded' ? WARN : it.flag === 'dead' ? LINE : ACTIVE_LINE;
      body += '<g class="dgtile" data-dgid="' + esc(it.id) + '" tabindex="0" role="button">'
        + textLine(labelW - 10, y + rowH/2 + 4, it.n, { anchor: 'end', style: 'font:400 10.5px "Instrument Sans",sans-serif;fill:' + INK })
        + '<rect x="' + labelW + '" y="' + y + '" width="' + barW + '" height="' + rowH + '" rx="4" fill="' + fill + '" stroke="' + stroke + '"></rect>'
        + textLine(labelW + barW + 8, y + rowH/2 + 4, String(it.value), { anchor: 'start', style: 'font:400 9.5px "DM Mono",monospace;fill:' + SUB })
        + '</g>';
      y += rowH + rowGap;
    });
    y += groupGap;
  });
  const w = pad + labelW + barMaxW + 60;
  const totalsY = y;
  let totalsBody = '';
  if (spec.totals && spec.totals.length) {
    totalsBody = textLine(pad, totalsY + 14, spec.totals.map(t => t.n + ': ' + t.v).join('   ·   '),
      { anchor: 'start', style: 'font:500 10.5px "DM Mono",monospace;fill:' + INK });
    y = totalsY + 34;
  }
  const h = y + 10;
  const svg = '<svg role="img" width="' + w + '" aria-label="' + esc(spec.aria) + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + totalsBody + '</svg>';
  const legend = '<div class="dg-legend">'
    + '<span><i class="lg-cell lg-owner"></i> covered</span>'
    + '<span><i class="lg-cell" style="background:#EDEDED;border:1px solid ' + LINE + '"></i> dead</span>'
    + '<span><i class="lg-cell" style="background:#FBE9E9;border:1px solid ' + WARN + '"></i> unguarded</span>'
    + '<span><i class="lg-cell" style="background:#F6E3D3;border:1px solid ' + WARN + '"></i> broken</span>'
    + '</div>';
  const blind = spec.blind ? '<p class="dg-blind"><b>What this does not see —</b> ' + esc(spec.blind) + '</p>' : '';
  return { svg, legend, w, h, blind };
}

/* ================= render / wire ================= */

const RENDERERS = {
  chain: (spec, vertical) => chainSVG(spec, vertical),
  authority: spec => authoritySVG(spec),
  states: spec => statesSVG(spec),
  funnel: spec => funnelSVG(spec),
  coverage: spec => coverageSVG(spec)
};

/* render() returns a plain HTML string, per the API contract, so wire()
   cannot close over the spec object in memory — the figure and its markup
   may be serialised, cached or moved before wire() ever runs. The spec is
   instead carried on the node itself, as JSON in a data attribute, so
   wire(root) is self-sufficient: give it a root that contains .dg figures
   and it re-derives everything it needs from the DOM alone. */
function render(spec) {
  const fn = RENDERERS[spec.kind];
  if (!fn) return '';
  const isChain = spec.kind === 'chain';
  const out = isChain ? fn(spec, false) : fn(spec);
  const blindBlock = out.blind ? out.blind : '';
  // coverage puts the blind block first, per the site's own rule that incompleteness leads
  const before = spec.kind === 'coverage' ? blindBlock : '';
  const after = spec.kind === 'coverage' ? '' : blindBlock;
  // A funnel's input node has no author-supplied detail entry (it isn't a
  // resolution outcome, just the starting count) — synthesise one so
  // clicking or tabbing to it never leaves the detail panel empty.
  if (spec.kind === 'funnel' && spec.input && !(spec.detail && spec.detail.input)) {
    spec = Object.assign({}, spec, {
      detail: Object.assign({}, spec.detail, {
        input: { t: spec.input.n, d: spec.input.count ? spec.input.count : undefined }
      })
    });
  }
  // Archetype B's own spec: "under the grid — the rule sentence, in a large
  // typeface — the exact sentence the diagram exists to justify." spec.rule
  // was previously accepted as data and never rendered — fixed here.
  const ruleBlock = spec.rule ? '<p class="dg-rule">' + esc(spec.rule) + '</p>' : '';
  // spec.note: a fact that belongs to the mechanism as a whole, not to any
  // one cell/node/bucket — e.g. "two fields are excluded for a reason the
  // source never names." Kept out of the grid rather than pinned to a cell
  // the source doesn't actually identify.
  const noteBlock = spec.note ? '<p class="dg-note">' + esc(spec.note) + '</p>' : '';
  const specJSON = escAttr(JSON.stringify(spec));
  return '<figure class="dg" data-kind="' + esc(spec.kind) + '" data-dg-spec="' + specJSON + '">'
    + (spec.title ? '<div class="dg-title">' + esc(spec.title) + '</div>' : '')
    + before
    + '<div class="dg-canvas">' + out.svg + '</div>'
    + ruleBlock
    + out.legend
    + noteBlock
    + after
    + '<div class="dg-detail" tabindex="-1"></div>'
    + '</figure>';
}

function reflow(figure, spec) {
  if (spec.kind !== 'chain') return;
  const canvas = figure.querySelector('.dg-canvas');
  if (!canvas) return;
  const vertical = figure.getBoundingClientRect().width < 700;
  if (figure.dataset.dgVertical === (vertical ? '1' : '0')) return;
  figure.dataset.dgVertical = vertical ? '1' : '0';
  const out = chainSVG(spec, vertical);
  canvas.innerHTML = out.svg;
}

function wire(root) {
  root = root || document;
  const figures = root.querySelectorAll ? root.querySelectorAll('.dg') : [];
  figures.forEach(fig => {
    if (fig.dataset.dgWired) return;
    let spec;
    try { spec = JSON.parse(fig.dataset.dgSpec); } catch (e) { return; }
    fig.dataset.dgWired = '1';
    const pick = id => activate(fig, spec, id);
    // Delegated on the figure itself, not on each [data-dgid] node: a
    // vertical/horizontal reflow of a chain regenerates the whole canvas,
    // and delegation means those fresh nodes are already clickable —
    // nothing needs rebinding after reflow() swaps the markup.
    fig.addEventListener('click', e => {
      const el = e.target.closest('[data-dgid]');
      if (el && fig.contains(el)) pick(el.dataset.dgid);
    });
    fig.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const el = e.target.closest('[data-dgid]');
      if (el && fig.contains(el)) { e.preventDefault(); pick(el.dataset.dgid); }
    });
    if (spec.kind === 'chain') {
      const onResize = () => reflow(fig, spec);
      onResize();
      window.addEventListener('resize', onResize);
    }
    // activate the first entry so the panel is never empty
    const first = spec.detail && Object.keys(spec.detail)[0];
    if (first) pick(first);
  });
}

/* Self-wiring: the router (src/app.html) sets #view.innerHTML on every
   navigation, which never executes injected <script> tags and is out of
   scope for this file to edit (route() belongs to another owner). A
   MutationObserver on #view calls wire() whenever a .dg figure appears,
   so every page that puts one in its markup gets click/keyboard support
   for free, with no router changes required.

   This has to attach synchronously, not on DOMContentLoaded: #view is a
   static empty div that exists in the markup before this script tag runs
   (this module is injected well after it), and the router's own first
   route() call happens synchronously at the bottom of the page's main
   script — before DOMContentLoaded ever fires. Waiting for that event
   here would mean missing the very first render on a direct link into a
   write-up page (e.g. #/p/org-tooling loaded fresh), leaving its diagram
   unwired until the next navigation. */
(function observeView() {
  const view = document.getElementById('view');
  if (!view || !window.MutationObserver) return;
  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.addedNodes && m.addedNodes.length) { wire(view); return; }
    }
  });
  mo.observe(view, { childList: true });
})();

window.Diagrams = { render, wire };
})();
