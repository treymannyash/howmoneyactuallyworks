import { createStage, clayMesh, smoothTo, THREE, lighten, darken, mute } from '../lib/stage3d.js';
import { EXTRAS } from '../content/extras-data.js';
import { mountChapter, $, $$, esc, segmented } from '../lib/kit.js';
import { EXIT as X } from '../content/exit-data.js';

const C = Object.fromEntries(Object.entries({ l1: '#EDA04B', liq: '#6FA3CC', fed: '#5FBBA0', fiat: '#DE7068', coin: '#F2C14E' }).map(([k, v]) => [k, mute(v)]));
let S = null, sc = null, view = 'cake', fiat = false, prop = -1, hlLayer = 'all', room = 'liquid', phase = 0, cmpCol = -1;
const COLX = [-4, -2, 0, 2, 4];

function buildScene(el) {
  const st = createStage(el, { tray: { w: 21, d: 12, r: 2, z: 0 }, shiftRight: true, shiftX: .19, shiftScale: .74, autoRotate: true, minDist: 7, maxDist: 36, label: 'Interactive 3D layer cake: Bitcoin base layer as the foundation with Liquid and Fedimint rooms above it, and the fiat stack inverted.' });
  if (!st) return null; S = st; const mats = st.mats, root = st.root;
  const cake = new THREE.Group(); root.add(cake);
  // L1 foundation: five columns + roof
  const cols = COLX.map((x, i) => { const g = new THREE.Group(); g.position.set(x, 0, 0); cake.add(g); const c = clayMesh(st, new THREE.CylinderGeometry(.42, .5, 1.8, 24), C.l1, { y: .9, parent: g }); clayMesh(st, new THREE.CylinderGeometry(.58, .58, .16, 24), lighten(C.l1, .25), { y: .08, parent: g }); clayMesh(st, new THREE.CylinderGeometry(.58, .58, .16, 24), lighten(C.l1, .25), { y: 1.82, parent: g });
    const L = st.addLabel(() => new THREE.Vector3(x, 0, 1.2), `<b>${i + 1}</b>`, { cls: 'mlab', onClick: () => window.__pickProp && window.__pickProp(i) }); g.userData = { c, L, sel: 0 }; return g; });
  const roof = clayMesh(st, new THREE.BoxGeometry(10.4, .5, 4.4), C.l1, { y: 2.05, parent: cake }); const roofLab = st.addLabel(() => new THREE.Vector3(0, 2.3, 2.3), '<b>₿ Bitcoin base layer</b><span class="st">Layer 1 · the foundation</span>', { cls: 'tw', anchor: 'above' });
  const mkRoom = (x, hex, name, sub) => { const g = new THREE.Group(); g.position.set(x, 2.3, -.9); cake.add(g); const b = clayMesh(st, new THREE.BoxGeometry(4.3, 1.9, 2.1), hex, { y: .95, parent: g }); const r = clayMesh(st, new THREE.BoxGeometry(4.7, .28, 2.5), darken(hex, .12), { y: 2.05, parent: g });
    [-1.2, 0, 1.2].forEach(k => clayMesh(st, new THREE.BoxGeometry(.7, .8, .06), '#FBF4E6', { x: k, y: 1.1, z: 1.06, parent: g, cast: false })); const L = st.addLabel(() => new THREE.Vector3(x, 4.8, -.9), `<b>${name}</b><span class="st">${sub}</span>`, { cls: 'tw', anchor: 'above' }); g.userData = { b, r, L, glow: 0 }; return g; };
  const liq = mkRoom(-2.7, C.liq, '💧 Liquid', 'Layer 2 · the institutional room'), fed = mkRoom(2.7, C.fed, '🔐 Fedimint', 'Layer 2 · the community room');
  // vaults (inside roofs' underside = on the ground between columns) + coins
  const vault = x => { const v = clayMesh(st, new THREE.BoxGeometry(1.2, .6, .9), '#8A6A4C', { x, y: 2.3 + .3, z: 1.35, parent: cake }); return v; };
  const vL = vault(-3), vF = vault(3);
  const coin = (hex) => { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .1, 28), mats.clay(hex, { metal: .1 })); m.rotation.x = Math.PI / 2; m.castShadow = true; g.add(m); return g; };
  const coinL1 = coin(C.coin), tokL = coin('#9CC4E6'), tokF = coin('#8BD3BB'); cake.add(coinL1, tokL, tokF);
  const mask = new THREE.Mesh(new THREE.TorusGeometry(.3, .06, 8, 20), mats.clay('#2A2118')); tokF.add(mask);
  // fiat inverted stack
  const fi = new THREE.Group(); fi.position.set(0, 0, 0); root.add(fi); fi.visible = false;
  clayMesh(st, new THREE.BoxGeometry(1.7, 1.1, 1.4), '#E9CDA6', { y: .55, parent: fi }); clayMesh(st, new THREE.BoxGeometry(3.6, 1.2, 2.4), '#A9B3BE', { y: 1.7, parent: fi }); clayMesh(st, new THREE.BoxGeometry(8, 1.6, 4), C.fiat, { y: 3.1, parent: fi });
  const fl1 = st.addLabel(() => new THREE.Vector3(0, 3.9, 0), '<b>The Fed — a committee</b><span class="st">sets the rules, at the top</span>', { cls: 'tw crisis', anchor: 'above' }), fl2 = st.addLabel(() => new THREE.Vector3(2, 1.7, 0), '<b>Banks</b><span class="st">build on the Fed</span>', { cls: 'tw', anchor: 'right' }), fl3 = st.addLabel(() => new THREE.Vector3(1, .55, 0), '<b>You</b><span class="st">holding IOUs</span>', { cls: 'tw', anchor: 'right' });
  const fiL = [fl1, fl2, fl3];
  
  st.onFrame((dt, t, k) => {
    let mv = false; const cakeOn = view === 'cake' && !fiat || view === 'cake' && fiat && false;
    const showFiat = fiat || (view === 'cmp' && cmpCol === 3); cake.visible = !showFiat; fi.visible = showFiat; fiL.forEach(L => L.el.hidden = !showFiat); roofLab.el.hidden = showFiat; liq.userData.L.el.hidden = showFiat; fed.userData.L.el.hidden = showFiat; cols.forEach(c => c.userData.L.el.hidden = showFiat);
    // highlight
    const hl = (name) => (hlLayer === 'all' || hlLayer === name) ? 0 : 1;
    [[roof, 'l1', C.l1], [liq.userData.b, 'liq', C.liq], [fed.userData.b, 'fed', C.fed]].forEach(([m, n, hex]) => { m.userData.dim = m.userData.dim ?? 0; if (smoothTo(m.userData, 'dim', hl(n), k)) mv = true; m.material.color.set(hex).lerp(new THREE.Color('#E7DCC6'), m.userData.dim * .8); });
    cols.forEach((g, i) => { const u = g.userData; const on = prop === i; if (smoothTo(u, 'sel', on ? 1 : 0, k)) mv = true; g.position.y = u.sel * .35; u.c.material.emissive.set('#FFD28A'); u.c.material.emissiveIntensity = u.sel * .5; const dimC = (hlLayer === 'all' || hlLayer === 'l1') ? 0 : .8; u.c.material.color.set(C.l1).lerp(new THREE.Color('#E7DCC6'), dimC); u.L.el.classList.toggle('sel', on); });
    // peg animation
    const isL = room === 'liquid', vx = isL ? -3 : 3, tok = isL ? tokL : tokF, other = isL ? tokF : tokL, tx = isL ? -2.7 : 2.7; other.visible = false;
    const tgtC = new THREE.Vector3(), tgtT = new THREE.Vector3(); let tokS = 0;
    if (view !== 'peg') { coinL1.visible = false; tok.visible = false; }
    else {
      coinL1.visible = true; tok.visible = true; if (!coinL1.userData.init) { coinL1.position.set(vx < 0 ? -6.4 : 6.4, 2.6, 2.4); coinL1.userData.init = 1; } 
      if (phase === 0) { tgtC.set(vx, 3.2, 1.35); tokS = 0; tgtT.set(tx, 3.4, .4); }
      else if (phase === 1) { tgtC.set(vx, 3.2, 1.35); tokS = 1; tgtT.set(tx - 1.1, 3.3, .35); }
      else if (phase === 2) { tgtC.set(vx, 3.2, 1.35); tokS = 1; tgtT.set(tx + 1.1, 3.3, .35); }
      else { tgtC.set(vx < 0 ? -6.4 : 6.4, 2.6, 2.4); tokS = 0; tgtT.set(tx, 3.4, .4); }
      if (phase === 0 && !coinL1.userData.in) { /* coin starts outside and slides in */ }
      const k2 = S.reduced ? 1 : Math.min(1, dt * 3); if (coinL1.position.distanceTo(tgtC) > .02) mv = true; coinL1.position.lerp(tgtC, k2); if (tok.position.distanceTo(tgtT) > .02) mv = true; tok.position.lerp(tgtT, k2);
      if (smoothTo(tok.userData, 's', tokS, k)) mv = true; tok.scale.setScalar(Math.max(.001, tok.userData.s ?? 0)); if (!S.reduced) { coinL1.rotation.y += dt; tok.rotation.y -= dt; mv = true; }
    }
    return mv || (!S.reduced && view !== 'cake');
  });
  const views = { cake: () => st.fit(new THREE.Vector3(1.2, 1.9, 0), 8.2, 5, 1.0), peg: () => st.fit(new THREE.Vector3(0, 2.2, 0), 7.6, 4.6, .95) };
  sc = { st, show(v) { view = v; st.view(views[v === 'cmp' ? 'cake' : v]()); }, views };
  st.options = { refit: () => views[view === 'cmp' ? 'cake' : view]() };
  return sc;
}
const setHL = h => { hlLayer = h; S && S.markDirty(); };
const go = v => { sc && sc.show(v); };
const rot = b => S && S.autoRotate(b);

const roomCard = (id, R, color) => `<div class="kicker-row"><span class="tag-risk" style="background:${color};color:#fff">${esc(R.badge)}</span></div><h2>${esc(R.head)}</h2><p class="lede">${R.lede}</p>
  <div class="widget"><label for="${id}-ph"><span>Walk through it</span><output id="${id}-out"></output></label><input type="range" id="${id}-ph" min="0" max="3" step="1" value="0"><div class="tl-ticks" aria-hidden="true">${R.steps.map((_, i) => `<span>${i + 1}</span>`).join('')}</div></div>
  <div class="who" id="${id}-who" aria-live="polite" style="border-color:${color}"></div>
  <div class="feat">${R.feat.map(f => `<div><span class="fl">${esc(f.l)}</span><span class="fv">${esc(f.v)}</span></div>`).join('')}</div>
  <details class="why"><summary>The trust trade-off</summary>${R.trust.map(p => `<p>${p}</p>`).join('')}</details>
  <div class="fiat-note"><span class="fk">${esc(R.fiatKey)}</span>${R.fiat.map(p => `<p>${p}</p>`).join('')}</div>${R.analogy ? `<details class="why"><summary>${esc(R.analogy.k)}</summary>${R.analogy.ps.map(p => `<p>${p}</p>`).join('')}</details>` : ''}`;
const wire = (card, id, R) => { const sl = $(`#${id}-ph`, card); const r = () => { phase = +sl.value; $(`#${id}-out`, card).textContent = `Step ${phase + 1} / 4`; const s = R.steps[phase]; $(`#${id}-who`, card).innerHTML = `<h3>${esc(s.t)}</h3><p>${s.p}</p>`; S && S.markDirty(); }; sl.addEventListener('input', r); r(); };

const steps = [
  { id: 'meet', rail: 'Intro', kicker: 'The Exit', html: `<h1>${esc(X.hdr.h1).replace('outside the system', '<em>outside the system</em>')}</h1><p class="lede">${X.hdr.lede}</p>`, src: 'Title and introduction are verbatim from Chapter IV.', enter: () => { fiat = false; prop = -1; setHL('all'); go('cake'); rot(true); } },
  { id: 'stack', rail: 'The stack', kicker: X.stack.h2, n: '1 / 5', tall: true,
    html: `<h2>${esc(X.stack.h2)}</h2><p class="lede">${X.stack.lede}</p><div class="stack-card" id="tiers">${X.stack.tiers.map((t, i) => `<button type="button" data-l="${['liq', 'fed', 'l1'][i]}" aria-pressed="false"><small>${esc(t.k)}</small><b>${esc(t.n)}</b>${esc(t.d)}</button>`).join('')}</div>
      <div class="seg2" id="fiatSeg" role="group" aria-label="Which stack"><button type="button" data-f="0" aria-pressed="true">Bitcoin stack</button><button type="button" data-f="1" aria-pressed="false">Flip to the fiat stack</button></div><div class="fiat-note" id="fiatNote" hidden><span class="fk">${esc(X.stack.fiatTitle)}</span><p>${X.stack.fiat}</p></div>`,
    src: 'Tier names, descriptions and the fiat note are verbatim from Chapter IV. The cake and the upside-down fiat stack are illustrations of those words.',
    init: (card) => { $$('#tiers button', card).forEach(b => b.onclick = () => { const on = b.getAttribute('aria-pressed') === 'true'; $$('#tiers button', card).forEach(x => x.setAttribute('aria-pressed', 'false')); if (!on) { b.setAttribute('aria-pressed', 'true'); setHL(b.dataset.l); } else setHL('all'); });
      $$('#fiatSeg button', card).forEach(b => b.onclick = () => { fiat = b.dataset.f === '1'; $$('#fiatSeg button', card).forEach(x => x.setAttribute('aria-pressed', x === b)); $('#fiatNote', card).hidden = !fiat; if (fiat) { sc && S.view(S.fit(new THREE.Vector3(0, 2.2, 0), 6.6, 4.4, .85)); } else go('cake'); S && S.markDirty(); }); },
    enter: () => { prop = -1; setHL('all'); go('cake'); rot(false); } },
  { id: 'bedrock', rail: 'Bedrock', kicker: X.bedrock.h2, n: '2 / 5', tall: true,
    html: `<h2>${esc(X.bedrock.h2)}</h2><p class="lede">${X.bedrock.lede}</p><div class="seg-row" id="propBtns"></div><div class="who" id="propWho" aria-live="polite" style="border-color:${C.l1}"></div><div class="fiat-note" id="propFiat"></div>`,
    src: 'Property names, explanations and the fiat comparisons are verbatim from Chapter IV. Which column stands for which property is arbitrary.',
    init: (card) => { const seg = segmented($('#propBtns', card), X.bedrock.props.map(p => `${esc(p.num)} ${esc(p.title.split(' — ')[0])}`), i => pick(i), { label: 'Property', cls: 'pill sm' });
      const pick = i => { prop = i; seg.set(i); const p = X.bedrock.props[i]; $('#propWho', card).innerHTML = `<h3>${esc(p.title)}</h3><p>${p.what}</p>`; $('#propFiat', card).innerHTML = `<span class="fk">${esc(p.fiatKey)}</span><p>${p.fiat}</p>`; S && S.markDirty(); }; window.__pickProp = pick; pick(0); },
    enter: () => { fiat = false; setHL('l1'); go('cake'); rot(false); if (prop < 0) prop = 0; } },
  { id: 'liquid', rail: 'Liquid', kicker: 'Liquid', n: '3 / 5', tall: true, html: roomCard('lq', X.liquid, C.liq), src: 'Everything in this card is verbatim from Chapter IV. The coin and token animation illustrates the four steps.',
    init: card => wire(card, 'lq', X.liquid), enter: ({ $ }) => { fiat = false; prop = -1; room = 'liquid'; setHL('liq'); go('peg'); rot(false); const sl = $('#lq-ph'); if (sl) phase = +sl.value; } },
  { id: 'fedimint', rail: 'Fedimint', kicker: 'Fedimint', n: '4 / 5', tall: true, html: roomCard('fd', X.fedimint, C.fed), src: 'Everything in this card is verbatim from Chapter IV. The masked token illustrates blind signatures; it is not a cryptographic diagram.',
    init: card => wire(card, 'fd', X.fedimint), enter: ({ $ }) => { fiat = false; prop = -1; room = 'fedimint'; setHL('fed'); go('peg'); rot(false); const sl = $('#fd-ph'); if (sl) phase = +sl.value; } },
  { id: 'compare', rail: 'Compare', kicker: X.compare.h2, n: '5 / 5', tall: true,
    html: `<h2>${esc(X.compare.h2)}</h2><p class="lede">${X.compare.lede}</p><div class="seg-row" id="cmpBtns"></div><div class="tablewrap"><table class="cmp" id="cmp"><thead><tr>${X.compare.rows[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${X.compare.rows.slice(1).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="ft-note">${X.compare.foot}</p>`,
    src: 'Every row and value is verbatim from Chapter IV\'s comparison table. Picking a column lights its layer in the 3D scene.',
    init: (card) => { const heads = X.compare.rows[0].slice(1); const layer = ['l1', 'liq', 'fed', 'fiat'];
      const seg = segmented($('#cmpBtns', card), ['All', ...heads.map(esc)], i => { cmpCol = i - 1; $$('#cmp tr', card).forEach(tr => [...tr.children].forEach((c, j) => c.classList.toggle('on', i > 0 && j === i))); fiat = false; setHL(i > 0 ? layer[i - 1] === 'fiat' ? 'none' : layer[i - 1] : 'all'); S && S.markDirty(); }, { label: 'Highlight a column', cls: 'pill sm' }); },
    enter: () => { fiat = false; prop = -1; go('cake'); rot(false); cmpCol = -1; setHL('all'); view = 'cmp'; } },
  { id: 'gloss', rail: 'Glossary', kicker: 'Glossary', n: '', html: `<h2>Glossary</h2><div class="ft-grid" style="grid-template-columns:1fr">${X.gloss.map(g => `<div class="ft-item">${g.html}</div>`).join('')}</div><p style="margin-top:12px">${X.closer.map(p => `<span>${p}</span>`).join('<br><br>')}</p>`, src: X.srcnote, enter: () => { fiat = false; go('cake'); setHL('all'); rot(true); } },
];
const fullText = () => `<h3>${esc(X.hdr.h1)}</h3><p>${X.hdr.lede}</p>
  <h3>${esc(X.stack.h2)}</h3><p>${X.stack.lede}</p><div class="ft-grid">${X.stack.tiers.map(t => `<article class="ft-item"><div class="ft-yr">${esc(t.k)}</div><h4>${esc(t.n)}</h4><p>${esc(t.d)}</p></article>`).join('')}</div><p>${esc(X.stack.spectrum)}</p><div class="fiat-note"><span class="fk">${esc(X.stack.fiatTitle)}</span><p>${X.stack.fiat}</p></div>
  <h3>${esc(X.bedrock.h2)}</h3><p>${X.bedrock.lede}</p><div class="ft-grid">${X.bedrock.props.map(p => `<article class="ft-item"><div class="ft-yr">${esc(p.num)}</div><h4>${esc(p.title)}</h4><p>${p.what}</p><div class="fiat-note"><span class="fk">${esc(p.fiatKey)}</span><p>${p.fiat}</p></div></article>`).join('')}</div>
  ${[['liquid', X.liquid], ['fedimint', X.fedimint]].map(([id, R]) => `<p class="ft-yr">${esc(EXTRAS.exit.rooms[id].eyebrow)}</p><h3 id="${id}">${esc(R.head)} <small class="ft-yr">${esc(R.badge)}</small></h3><p>${R.lede}</p><p class="ft-yr">${esc(EXTRAS.exit.rooms[id].step)}</p><div class="ft-grid">${R.steps.map((s, i) => `<article class="ft-item"><div class="ft-yr">Step ${i + 1}</div><h4>${esc(s.t)}</h4><p>${s.p}</p></article>`).join('')}</div><div class="feat">${R.feat.map(f => `<div><span class="fl">${esc(f.l)}</span><span class="fv">${esc(f.v)}</span></div>`).join('')}</div><p class="ft-yr">${esc(EXTRAS.exit.rooms[id].trust)}</p>${R.trust.map(p => `<p>${p}</p>`).join('')}<div class="fiat-note"><span class="fk">${esc(R.fiatKey)}</span>${R.fiat.map(p => `<p>${p}</p>`).join('')}</div>${R.analogy ? `<div class="ft-item"><h4>${esc(R.analogy.k)}</h4>${R.analogy.ps.map(p => `<p>${p}</p>`).join('')}</div>` : ''}`).join('')}
  <h3>${esc(X.compare.h2)}</h3><p>${X.compare.lede}</p><div class="tablewrap" style="max-height:none"><table class="cmp"><thead><tr>${X.compare.rows[0].map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${X.compare.rows.slice(1).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="ft-note">${X.compare.foot}</p>
  <h3>Glossary</h3><div class="ft-grid">${X.gloss.map(g => `<div class="ft-item">${g.html}</div>`).join('')}</div>${X.closer.map(p => `<p>${p}</p>`).join('')}<p class="ft-note">${X.srcnote}</p>`;
mountChapter({ key: 'exit', steps, fullText, build: buildScene, resetView: () => sc && sc.show(view) });
