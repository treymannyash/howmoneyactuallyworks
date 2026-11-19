import { createStage, clayMesh, smoothTo, THREE, lighten, darken, rrect } from '../lib/stage3d.js';
import { mountChapter, $, $$, esc, segmented } from '../lib/kit.js';
import { steps as MECH, scenariosData as SCEN, actorsData as ACT, CHAIN, READ } from '../content/trap-data.js';
import { TRAP } from '../content/trap-prose.js';

const FLOOR_COL = ['#86B58F', '#6FA3CC', '#A58BD0', '#E8A94B', '#DE7068'];
const GRP_COL = ['#E5BD54', '#4F86B8', '#8E6FC4', '#4F9F7A'];
const FH = 1.4, FW = 4.6, FD = 3.2;
let S = null, sc = null, build = 8, mode = 'normal', asset = -1, actor = -1, view = 'tower', pat = -1;
const ACT_FLOOR = [2, 1, 4, 4];     // illustrative: which floor each actor's pawn points at
const SCEN_GRP = [0, 1, 2, 3];
const MODE_SYNC = [];

function buildScene(el) {
  const st = createStage(el, { tray: { w: 22, d: 14, r: 2, z: 1 }, shiftRight: true, shiftX: .19, shiftScale: .74, autoRotate: true, minDist: 7, maxDist: 38, label: 'Interactive 3D tower showing the chain of legal claims from you to the protected institutions, in normal times and in crisis.' });
  if (!st) return null; S = st; const mats = st.mats, T = st.T, root = st.root;
  const tower = new THREE.Group(); root.add(tower);
  const floors = CHAIN.map((c, i) => {
    const g = new THREE.Group(); g.position.y = i * (FH + .12); tower.add(g);
    const m = clayMesh(st, new THREE.BoxGeometry(FW - i * .18, FH, FD - i * .12), FLOOR_COL[i], { y: FH / 2, parent: g });
    // windows
    for (let k = -1; k <= 1; k++) clayMesh(st, new THREE.BoxGeometry(.8, .45, .06), '#FBF4E6', { x: k * 1.2, y: FH / 2 + .05, z: (FD - i * .12) / 2 + .01, parent: g, cast: false });
    const L = st.addLabel(() => new THREE.Vector3(FW / 2 - i * .09 + .1, g.position.y + FH / 2, 0), `<b>${esc(c.name)}</b><span class="st"></span>`, { cls: 'tw', anchor: 'right' });
    g.userData = { m, L, base: new THREE.Color(FLOOR_COL[i]), dim: 0, sq: 1, i, vis: 0 }; return g;
  });
  // extras for the build steps
  const crate = clayMesh(st, new THREE.BoxGeometry(1.8, 1.3, 1.6), '#6B5A45', { x: -FW / 2 - 1.5, y: .65 + (FH + .12) * 1, z: 0, parent: tower }); const crateLab = st.addLabel(() => new THREE.Vector3(-FW / 2 - 1.5, (FH + .12) + 1.5, 0), '<b>Derivatives</b><span class="st">into deposit-taking banks</span>', { cls: 'tw', anchor: 'above' });
  const crown = new THREE.Group(); crown.position.y = 5 * (FH + .12) + .1; tower.add(crown);
  clayMesh(st, new THREE.CylinderGeometry(.9, 1.1, .35, 24), '#E5BD54', { y: .18, parent: crown }); for (let k = 0; k < 5; k++) clayMesh(st, new THREE.ConeGeometry(.2, .6, 8), '#E5BD54', { x: Math.cos(k / 5 * 6.283) * .7, z: Math.sin(k / 5 * 6.283) * .7, y: .62, parent: crown });
  const crownLab = st.addLabel(() => new THREE.Vector3(0, crown.position.y + 1.3, 0), '<b>CBDC</b><span class="st">the control layer</span>', { cls: 'tw', anchor: 'above' });
  const valve = new THREE.Mesh(new THREE.TorusGeometry(2.45, .07, 10, 48), mats.clay('#C0392B')); valve.rotation.x = Math.PI / 2; valve.position.y = 4 * (FH + .12) + FH + .06; tower.add(valve);
  // orbs (3 per asset group)
  const orbs = []; const names = SCEN.map(s => s.title);
  for (let g = 0; g < 4; g++) for (let k = 0; k < 3; k++) { const o = new THREE.Mesh(new THREE.SphereGeometry(.3, 20, 14), new THREE.MeshStandardMaterial({ color: GRP_COL[g], roughness: .45, emissive: GRP_COL[g], emissiveIntensity: .0 })); o.castShadow = true; tower.add(o); orbs.push({ o, g, k, p: new THREE.Vector3(), t: 0 }); }
  const rest = (g, k) => new THREE.Vector3(-2.7 + (g * 3 + k) * .5 + (g * .1), .3, FD / 2 + 1.0);
  const crisisPos = (g, k) => { const a = (g * 3 + k) / 12 * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * 1.0, 5 * (FH + .12) + .95 + Math.sin(a * 2) * .1, Math.sin(a) * 1.0); };
  orbs.forEach(r => r.o.position.copy(rest(r.g, r.k)));
  // pawns
  const pawns = ACT.map((a, i) => { const g = new THREE.Group(); g.position.set(-5.4 + (i % 2) * 1.1, 0, -1.5 + i * 1.1); tower.add(g);
    clayMesh(st, new THREE.CylinderGeometry(.28, .4, .8, 18), '#7A6957', { y: .4, parent: g }); clayMesh(st, new THREE.SphereGeometry(.3, 18, 14), '#E9CDA6', { y: 1.05, parent: g });
    const beam = clayMesh(st, new THREE.CylinderGeometry(.03, .03, 1, 6), '#2A2118', { parent: tower, cast: false }); beam.visible = false;
    const L = st.addLabel(() => new THREE.Vector3(g.position.x, 1.5, g.position.z), `<b>${esc(a.name.split(' ').slice(-1)[0])}</b>`, { cls: 'tw', onClick: () => window.__pickActor && window.__pickActor(i) });
    g.userData = { beam, L }; return g; });
  // language-layer conveyor
  const conv = new THREE.Group(); conv.position.set(0, 0, 7.4); root.add(conv);
  clayMesh(st, new THREE.BoxGeometry(11, .25, 1.4), '#CBB892', { y: .12, parent: conv });
  const stat = [0, 1, 2, 3, 4].map(i => { const m = clayMesh(st, new THREE.BoxGeometry(1.5, .9, 1.1), lighten(FLOOR_COL[i], .2), { x: -4.4 + i * 2.2, y: .7, parent: conv }); const L = st.addLabel(() => new THREE.Vector3(-4.4 + i * 2.2, 1.3, 7.4), String(i + 1), { cls: 'mlab' }); return { m, L }; });
  const tok = new THREE.Mesh(new THREE.SphereGeometry(.38, 20, 14), new THREE.MeshStandardMaterial({ color: '#FBF4E6', emissive: '#E58353', emissiveIntensity: .6, roughness: .4 })); tok.position.set(-4.4, 1.5, 7.4); tok.castShadow = true; root.add(tok); tok.userData.x = -4.4;
  const tint = new THREE.Color(), grey = new THREE.Color('#C8BCA6');
  st.onFrame((dt, t, k) => {
    let mv = false; const showTower = view !== 'lang';
    floors.forEach((g, i) => { const u = g.userData; const want = (view === 'build' ? (i < Math.min(5, build) ? 1 : 0) : 1) * (build >= 1 || view !== 'build' ? 1 : 0);
      const v = view === 'build' ? (build > i ? 1 : 0) : 1; if (smoothTo(u, 'vis', v, k)) mv = true; g.scale.y = Math.max(.001, u.vis) * (i === 3 && build >= 6 && (view === 'build' || true) && buildCCP() ? .62 : 1); g.visible = showTower && u.vis > .02; u.L.el.hidden = !(showTower && u.vis > .6);
      const crisisDim = mode === 'crisis' && CHAIN[i].dim ? 1 : 0; if (smoothTo(u, 'dim', crisisDim, k)) mv = true; tint.copy(u.base).lerp(grey, u.dim * .75); u.m.material.color.copy(tint);
      const hl = (asset >= 0 && i === 0) || (actor >= 0 && ACT_FLOOR[actor] === i); u.m.material.emissive.set('#FFD28A'); u.m.material.emissiveIntensity = hl ? .45 + (S.reduced ? 0 : .15 * Math.sin(t * 4)) : 0; if (hl && !S.reduced) mv = true;
      const txt = mode === 'crisis' ? CHAIN[i].crisis : CHAIN[i].normal; const sp = u.L.el.querySelector('.st'); if (sp.textContent !== txt) sp.textContent = txt; u.L.el.classList.toggle('crisis', mode === 'crisis'); });
    const bs = view === 'build' ? build : 0;
    crate.visible = showTower && bs >= 7; crateLab.el.hidden = !crate.visible; crown.visible = showTower && bs >= 8; crownLab.el.hidden = !crown.visible; valve.visible = showTower && bs >= 5;
    // orbs
    orbs.forEach(r => { r.t += ((mode === 'crisis' && view !== 'build' ? 1 : 0) - r.t) * (S.reduced ? 1 : Math.min(1, dt * (asset === r.g ? 1.6 : 1.1))); if (Math.abs(((mode === 'crisis' && view !== 'build') ? 1 : 0) - r.t) > .004) mv = true;
      const a = rest(r.g, r.k), b = crisisPos(r.g, r.k); const e = r.t * r.t * (3 - 2 * r.t); r.o.position.lerpVectors(a, b, e); if (e > 0 && e < 1) r.o.position.x += Math.sin(e * 3.14) * (r.g % 2 ? 2.8 : -2.8) * 1.0; if (e > 0 && e < 1) r.o.position.z += Math.sin(e * 3.14) * 1.6;
      const sel = asset === r.g; r.o.material.emissiveIntensity = sel ? .5 : 0; r.o.scale.setScalar(sel ? 1.35 : 1); r.o.visible = showTower && view !== 'build' || (view === 'build' && build >= 1 && showTower); });
    // pawns
    pawns.forEach((g, i) => { const on = view === 'actors'; g.visible = on; g.userData.L.el.hidden = !on; const b = g.userData.beam; b.visible = on && actor === i; if (b.visible) { const f = floors[ACT_FLOOR[i]]; const a = new THREE.Vector3(g.position.x, 1.3, g.position.z), c = new THREE.Vector3(-FW / 2 + .2, f.position.y + FH / 2, 0); const len = a.distanceTo(c); b.scale.y = len; b.position.copy(a.clone().add(c).multiplyScalar(.5)); b.lookAt(c); b.rotateX(Math.PI / 2); } g.scale.setScalar(actor === i ? 1.25 : 1); });
    // conveyor
    conv.visible = view === 'lang'; stat.forEach((s, i) => { s.L.el.hidden = view !== 'lang'; s.m.scale.y = pat === i ? 1.35 : 1; s.m.material.emissive.set('#FFD28A'); s.m.material.emissiveIntensity = pat === i ? .5 : 0; });
    tok.visible = view === 'lang'; if (smoothTo(tok.userData, 'x', -4.4 + Math.max(0, pat) * 2.2, k)) mv = true; tok.position.x = tok.userData.x; tok.position.y = 1.5 + (S.reduced ? 0 : Math.sin(t * 3) * .08);
    pawns.forEach(() => 0); if (view === 'actors' || view === 'lang') mv = mv || !S.reduced;
    return mv;
  });
  const buildCCP = () => build >= 6 && view === 'build';
  const views = { tower: () => st.fit(new THREE.Vector3(1.4, 3.4, 1), 7.6, 5.4, .95), build: () => st.fit(new THREE.Vector3(.4, 3.4, 0), 7.6, 5.4, .95), lang: () => st.fit(new THREE.Vector3(0, .6, 7.2), 7.4, 2.6, .8), actors: () => st.fit(new THREE.Vector3(-.4, 3.4, 0), 8.6, 5.4, .95) };
  views.assets = views.tower;
  sc = { st, show(v) { view = v; st.view(views[v]()); }, views };
  st.options = { refit: () => views[view]?.() };
  return sc;
}
const setMode = m => { mode = m; MODE_SYNC.forEach(f => f()); S && S.markDirty(); };
const go = v => { sc && sc.show(v); S && S.autoRotate(v === 'tower' && false); };

const spark = () => { const { labels, data } = TRAP.velocity; const w = 260, h = 74, mn = 1, mx = 2.6; const pts = data.map((d, i) => [10 + i * (w - 20) / (data.length - 1), 8 + (1 - (d - mn) / (mx - mn)) * (h - 22)]);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" role="img" aria-label="Velocity of money, 1933 to 2025"><path d="M${pts.map(p => p.join(',')).join(' L')}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="var(--accent)"/><text x="${p[0]}" y="${h - 2}" font-size="9" text-anchor="middle" fill="var(--ink2)" font-family="IBM Plex Mono">${labels[i]}</text>`).join('')}</svg>`; };
const sentences = TRAP.language.paras[0].split(/(?<=\.)\s+(?=[A-Z])/);

const steps = [
  { id: 'meet', rail: 'Intro', kicker: 'The Trap', html: `<h1>${esc(TRAP.hdr.h1)}</h1><p class="lede">${TRAP.hdr.lede}</p><blockquote class="quote-card">${esc(TRAP.hdr.quote)}<br><small>${esc(TRAP.hdr.quoteBy)}</small></blockquote>`,
    src: 'Title, introduction and quotation are verbatim from Chapter III.', enter: () => { setMode('normal'); go('tower'); S && S.autoRotate(true); } },
  { id: 'setting', rail: 'The setting', kicker: TRAP.context.h2, n: '1 / 6', html: `<h2>${esc(TRAP.context.h2)}</h2><p class="lede">${TRAP.context.lede}</p><div class="chips">${TRAP.context.ctx.map(c => `<div><b>${esc(c.big)}</b><span style="text-transform:none;letter-spacing:0;font:400 13px var(--sans)">${c.cap}</span></div>`).join('')}</div>${spark()}`,
    src: 'Text and both figures are verbatim from Chapter III; the sparkline uses the chapter\'s own velocity points (1933 → 2025).', enter: () => { setMode('normal'); go('tower'); S && S.autoRotate(true); } },
  { id: 'build', rail: 'Eight steps', kicker: TRAP.mechanism.h2, n: '2 / 6', tall: true,
    html: `<h2>${esc(TRAP.mechanism.h2)}</h2><p class="lede">${TRAP.mechanism.lede}</p><div class="widget"><label for="bld"><span>Build the tower</span><output id="bldOut"></output></label><input type="range" id="bld" min="1" max="8" step="1" value="8"><div class="tl-ticks" aria-hidden="true">${MECH.map(m => `<span>${m.num}</span>`).join('')}</div></div><div class="who" id="bwho" aria-live="polite" style="border-color:var(--bad)"></div>`,
    src: 'Step titles, years, details and context are verbatim from Chapter III. Which piece of the 3D tower each step adds is an illustration, not part of the source.',
    init: (card) => { const sl = $('#bld', card); const r = () => { build = +sl.value; const m = MECH[build - 1]; $('#bldOut', card).textContent = `${m.num} · ${m.year}`; $('#bwho', card).innerHTML = `<h3>${esc(m.title)}</h3><div class="role">${esc(m.year)}</div><p>${m.detail}</p><p style="color:var(--ink2)"><b>Context:</b> ${m.context}</p>`; S && S.markDirty(); }; sl.addEventListener('input', r); r(); },
    enter: () => { setMode('normal'); go('build'); S && S.autoRotate(false); build = +$('#bld').value; } },
  { id: 'chain', rail: 'The chain', kicker: TRAP.chain.h2, n: '3 / 6', tall: true,
    html: `<h2>${esc(TRAP.chain.h2)}</h2><p class="lede">${TRAP.chain.lede}</p><div class="seg2" id="modeSeg" role="group" aria-label="Chain view mode"><button type="button" data-m="normal" aria-pressed="true">Normal times</button><button type="button" data-m="crisis" aria-pressed="false">In crisis</button></div><ol class="chain-list" id="chainList"></ol><p class="read" id="chainRead" aria-live="polite"></p>`,
    src: 'Chain labels and both readings are verbatim from Chapter III. The tower metaphor and the sweeping orbs are an illustration.',
    init: (card) => { const list = $('#chainList', card);
      const sync = () => { $$('#modeSeg button', card).forEach(b => b.setAttribute('aria-pressed', b.dataset.m === mode)); $('#modeSeg', card).classList.toggle('crisis', mode === 'crisis');
        list.innerHTML = CHAIN.map(c => `<li class="${mode === 'crisis' && !c.dim ? 'hi' : mode === 'crisis' ? 'dimmed' : ''}"><div><b>${esc(c.name)}</b><em>${esc(mode === 'crisis' ? c.crisis : c.normal)}${mode === 'crisis' && c.dim ? '<span class="flag">▼ subordinated</span>' : mode === 'crisis' ? '<span class="flag">▲ priority</span>' : ''}</em></div></li>`).join(''); $('#chainRead', card).innerHTML = READ[mode]; };
      MODE_SYNC.push(sync); $$('#modeSeg button', card).forEach(b => b.onclick = () => setMode(b.dataset.m)); sync(); },
    enter: () => { go('tower'); S && S.autoRotate(false); } },
  { id: 'taken', rail: 'Who gets taken', kicker: TRAP.taken.h2, n: '4 / 6', tall: true,
    html: `<h2>${esc(TRAP.taken.h2)}</h2><p class="lede">${TRAP.taken.lede}</p><div class="seg-row" id="scBtns"></div><div class="who" id="scWho" aria-live="polite" style="border-color:var(--bad)"></div><div class="seg2" id="modeSeg2" role="group" aria-label="Chain view mode"><button type="button" data-m="normal" aria-pressed="true">Normal</button><button type="button" data-m="crisis" aria-pressed="false">In crisis</button></div>`,
    src: 'Asset classes, precedents and descriptions are verbatim from Chapter III. The coloured orbs are an illustration of where each asset class sits in the chain.',
    init: (card) => { const seg = segmented($('#scBtns', card), SCEN.map(s => esc(s.title)), i => pick(i), { label: 'Asset class', cls: 'pill sm', start: -1 });
      const pick = i => { asset = i; seg.set(i); const s = SCEN[i]; $('#scWho', card).innerHTML = `<span class="tag-risk ${s.risk}">${esc(s.risk)} risk</span><h3 style="margin-top:6px">${esc(s.title)}</h3><p><b>Precedent:</b> ${esc(s.parallel)}</p><p>${s.desc}</p>`; S && S.markDirty(); };
      const sync = () => $$('#modeSeg2 button', card).forEach(b => b.setAttribute('aria-pressed', b.dataset.m === mode)); MODE_SYNC.push(sync); $$('#modeSeg2 button', card).forEach(b => b.onclick = () => setMode(b.dataset.m)); pick(0); },
    enter: () => { go('tower'); S && S.autoRotate(false); if (asset < 0) asset = 0; } },
  { id: 'actors', rail: 'The people', kicker: TRAP.actors.h2, n: '5 / 6', tall: true,
    html: `<h2>${esc(TRAP.actors.h2)}</h2><div class="seg-row" id="acBtns"></div><div class="who" id="acWho" aria-live="polite"></div>`,
    src: 'Names, roles and context are verbatim from Chapter III. Which floor each person\'s beam points at is an illustration.',
    init: (card) => { const seg = segmented($('#acBtns', card), ACT.map(a => esc(a.name)), i => pick(i), { label: 'Key actor', cls: 'pill sm' });
      const pick = i => { actor = i; seg.set(i); const a = ACT[i]; $('#acWho', card).innerHTML = `<h3>${esc(a.name)}</h3><div class="role">${esc(a.role)}</div><p>${a.context}</p>`; S && S.markDirty(); }; window.__pickActor = pick; pick(0); },
    enter: () => { setMode('normal'); asset = -1; go('actors'); S && S.autoRotate(false); } },
  { id: 'lang', rail: 'Language layer', kicker: TRAP.language.h2, n: '6 / 6', tall: true,
    html: `<h2>${esc(TRAP.language.h2)}</h2><p class="lede">${TRAP.language.lede}</p><div class="pat" id="pat"></div><p>${TRAP.language.paras[1]}</p><p>${TRAP.language.paras[2]}</p>`,
    src: 'The five stages are the five sentences of the chapter\'s own description of the pattern, split into steps.',
    init: (card) => { const w = $('#pat', card); w.innerHTML = sentences.map((s, i) => `<button type="button" aria-pressed="${i === 0}" data-i="${i}">${esc(s)}</button>`).join('');
      const sel = i => { pat = i; $$('button', w).forEach((b, j) => b.setAttribute('aria-pressed', j === i)); S && S.markDirty(); };
      $$('button', w).forEach(b => b.onclick = () => sel(+b.dataset.i)); sel(0); },
    enter: () => { asset = -1; actor = -1; go('lang'); S && S.autoRotate(false); if (pat < 0) pat = 0; } },
  { id: 'src', rail: 'Sources', kicker: 'Sources & further watching', n: '', html: `<h2>Further watching &amp; reading</h2><div class="ft-res">${TRAP.res.map(r => `<a href="${esc(r.href)}" target="_blank" rel="noopener">${esc(r.title)}<span>${esc(r.meta)}</span></a>`).join('')}</div><p class="ft-note" style="margin-top:12px">${TRAP.srcnote}</p>`,
    enter: () => { go('tower'); setMode('normal'); S && S.autoRotate(true); } },
];
const fullText = () => `<h3>${esc(TRAP.hdr.h1)}</h3><p>${TRAP.hdr.lede}</p><p><q>${esc(TRAP.hdr.quote)}</q> ${esc(TRAP.hdr.quoteBy)}</p>
  <h3>${esc(TRAP.context.h2)}</h3><p>${TRAP.context.lede}</p><p>${TRAP.context.ctx.map(c => `<b>${esc(c.big)}</b> — ${c.cap}`).join('<br>')}</p>
  <h3>${esc(TRAP.mechanism.h2)}</h3><p>${TRAP.mechanism.lede}</p><div class="ft-grid">${MECH.map(m => `<article class="ft-item"><div class="ft-yr">${esc(m.num)} · ${esc(m.year)}</div><h4>${esc(m.title)}</h4><p>${m.detail}</p><p class="ft-note"><b>Context:</b> ${m.context}</p></article>`).join('')}</div>
  <h3>${esc(TRAP.chain.h2)}</h3><p>${TRAP.chain.lede}</p><table><thead><tr><th>Link</th><th>Normal times</th><th>In crisis</th></tr></thead><tbody>${CHAIN.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.normal)}</td><td>${esc(c.crisis)}</td></tr>`).join('')}</tbody></table><p>${READ.normal}</p><p>${READ.crisis}</p>
  <h3>${esc(TRAP.taken.h2)}</h3><p>${TRAP.taken.lede}</p><div class="ft-grid">${SCEN.map(s => `<article class="ft-item"><div class="ft-yr">${esc(s.risk)} risk</div><h4>${esc(s.title)}</h4><p><b>Precedent:</b> ${esc(s.parallel)}</p><p>${s.desc}</p></article>`).join('')}</div>
  <h3>${esc(TRAP.actors.h2)}</h3><div class="ft-grid">${ACT.map(a => `<article class="ft-item"><h4>${esc(a.name)}</h4><p class="ft-meta">${esc(a.role)}</p><p>${a.context}</p></article>`).join('')}</div>
  <h3>${esc(TRAP.language.h2)}</h3><p>${TRAP.language.lede}</p>${TRAP.language.paras.map(p => `<p>${p}</p>`).join('')}
  <p class="ft-note">${TRAP.srcnote}</p><h3>Further watching &amp; reading</h3><div class="ft-res">${TRAP.res.map(r => `<a href="${esc(r.href)}" target="_blank" rel="noopener">${esc(r.title)}<span>${esc(r.meta)}</span></a>`).join('')}</div>`;
mountChapter({ key: 'trap', steps, fullText, build: buildScene, resetView: () => sc && sc.show(view) });
