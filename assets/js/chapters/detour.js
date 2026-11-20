import { createStage, clayMesh, smoothTo, THREE, lighten, darken, rrect, mute, ACCENT } from '../lib/stage3d.js';
import { mountChapter, $, $$, esc, segmented } from '../lib/kit.js';
import { DETOUR as D } from '../content/detour-data.js';

const GREEN = mute('#5FA37C'), AMBER = mute('#E58353'), GOLD = mute('#E5BD54');
const COINCOL = ['#E5BD54', '#E58353', '#6FA3CC', '#5FBBA0', '#A58BD0'].map(mute);
let S = null, sc = null, view = 'scales', silver = 0, thesis = 0, line = 'sala', pt = 0, tokenOn = false;
const fork = (() => { const m = D.fork.html; const el = document.createElement('div'); el.innerHTML = m; return { sala: [...el.querySelectorAll('.f-sala li')].map(x => x.innerHTML), heid: [...el.querySelectorAll('.f-heid li')].map(x => x.innerHTML), sh: el.querySelector('.f-sala .fh').textContent, hh: el.querySelector('.f-heid .fh').textContent }; })();

function buildScene(el) {
  const st = createStage(el, { tray: { w: 19, d: 12, r: 2, z: 0 }, shiftRight: true, shiftX: .19, shiftScale: .74, autoRotate: true, minDist: 6, maxDist: 34, label: 'Interactive 3D balance: silver arriving in Castile tips the scales and prices climb. Also five thesis coins and a forked road.' });
  if (!st) return null; S = st; const mats = st.mats, root = st.root;
  // ----- scales -----
  const sg = new THREE.Group(); root.add(sg);
  clayMesh(st, new THREE.CylinderGeometry(1.2, 1.5, .5, 32), '#5C646D', { y: .25, parent: sg }); clayMesh(st, new THREE.CylinderGeometry(.22, .3, 4.6, 18), '#8A6A4C', { y: 2.55, parent: sg });
  const beam = new THREE.Group(); beam.position.y = 4.9; sg.add(beam); clayMesh(st, new THREE.BoxGeometry(8, .22, .34), '#8A6A4C', { parent: beam }); clayMesh(st, new THREE.SphereGeometry(.34, 16, 12), GOLD, { parent: beam });
  const pan = (x) => { const g = new THREE.Group(); g.position.set(x, 0, 0); beam.add(g); [-.5, .5].forEach(z => clayMesh(st, new THREE.CylinderGeometry(.025, .025, 2.6, 6), '#5B4B3B', { y: -1.3, z: z * 1.2, parent: g, cast: false })); clayMesh(st, new THREE.CylinderGeometry(1.7, 1.5, .22, 32), '#5C646D', { y: -2.7, parent: g }); const items = new THREE.Group(); items.position.y = -2.55; g.add(items); return { g, items }; };
  const L = pan(-3.7), R = pan(3.7);
  const chests = []; for (let i = 0; i < 12; i++) { const m = new THREE.Group(); const a = clayMesh(st, new THREE.BoxGeometry(.7, .45, .5), '#8A6A4C', { y: .22, parent: m }); clayMesh(st, new THREE.BoxGeometry(.72, .12, .52), GOLD, { y: .5, parent: m }); const col = i % 4, row = Math.floor(i / 4); m.position.set(-.85 + col * .55 - (row % 2) * .1, row * .55, ((i % 2) - .5) * .5); m.scale.setScalar(.001); L.items.add(m); chests.push(m); }
  const goods = []; const GC = ['#C98B4A', '#6FA3CC', '#86B58F', '#DE7068', '#A58BD0', '#E8A94B'].map(mute);
  for (let i = 0; i < 6; i++) { const g = new THREE.Group(); const m = clayMesh(st, i % 2 ? new THREE.BoxGeometry(.6, .6, .6) : new THREE.SphereGeometry(.38, 18, 12), GC[i], { y: .3, parent: g }); g.position.set(-.85 + (i % 3) * .85, 0, (Math.floor(i / 3) - .5) * .8); R.items.add(g); goods.push(g); }
  const tagMats = new THREE.MeshStandardMaterial({ color: '#FBF4E6', roughness: .9 }); const tags = goods.map(g => { const t = new THREE.Group(); const stick = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, 1, 6), mats.clay('#5B4B3B')); stick.position.y = .5; const card = new THREE.Mesh(new THREE.BoxGeometry(.5, .3, .04), tagMats); card.position.y = 1; card.castShadow = true; t.add(stick, card); t.position.set(0, .6, .3); g.add(t); t.userData = { stick, card }; return t; });
  const lL = st.addLabel(() => new THREE.Vector3(-3.7, .3, 1.9), '<b>Silver arriving</b><span class="st">treasure fleets from the Americas</span>', { cls: 'tw', anchor: 'below' });
  const lR = st.addLabel(() => new THREE.Vector3(3.7, .3, 1.9), '<b>Ordinary goods</b><span class="st">price tags climb</span>', { cls: 'tw', anchor: 'below' });
  const yearLab = st.addLabel(() => new THREE.Vector3(0, 6.1, 0), '', { cls: 'tw', anchor: 'above' });
  // ----- coins shelf -----
  const cg = new THREE.Group(); root.add(cg); clayMesh(st, new THREE.BoxGeometry(11.5, .5, 3), '#5C646D', { y: .25, parent: cg }); clayMesh(st, new THREE.BoxGeometry(11.5, 3.6, .3), '#9AA4AE', { y: 2, z: -1.4, parent: cg });
  const coins = D.theses.items.map((t, i) => { const g = new THREE.Group(); g.position.set(-4.4 + i * 2.2, 1.4, .1); cg.add(g); const m = clayMesh(st, new THREE.CylinderGeometry(.85, .85, .16, 36), COINCOL[i], { parent: g }); m.rotation.x = Math.PI / 2; clayMesh(st, new THREE.TorusGeometry(.7, .045, 8, 36), lighten(COINCOL[i], .5), { z: .1, parent: g, cast: false });
    const lab = st.addLabel(() => new THREE.Vector3(g.position.x, .5, 1.1), `<b>${esc(t.num)}</b>`, { cls: 'mlab', onClick: () => window.__pickThesis && window.__pickThesis(i) }); g.userData = { m, lab, u: 0 }; return g; });
  // ----- fork road -----
  const fg = new THREE.Group(); root.add(fg);
  const road = (pts, hex) => { const c = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], .08, p[1]))); const m = new THREE.Mesh(new THREE.TubeGeometry(c, 40, .32, 10), mats.clay(hex)); m.scale.y = .35; m.castShadow = m.receiveShadow = true; fg.add(m); return c; };
  const trunk = road([[0, 5.2], [0, 3.2], [0, 1.4]], '#5C646D'); const cS = road([[0, 1.4], [-1.2, 0], [-3.2, -1.6], [-5, -3.4]], GREEN), cH = road([[0, 1.4], [1.2, 0], [3.2, -1.6], [5, -3.4]], AMBER);
  const stones = { sala: [], heid: [] };
  [['sala', cS, GREEN], ['heid', cH, AMBER]].forEach(([k, c, hex]) => { for (let i = 0; i < 4; i++) { const p = c.getPoint(.28 + i * .24); const g = new THREE.Group(); g.position.set(p.x, .12, p.z); fg.add(g); const m = clayMesh(st, new THREE.CylinderGeometry(.55, .65, .5, 24), lighten(hex, .15), { y: .25, parent: g }); const top = clayMesh(st, new THREE.CylinderGeometry(.4, .4, .08, 24), lighten(hex, .5), { y: .52, parent: g }); const lab = st.addLabel(() => new THREE.Vector3(p.x, .9, p.z), `${i + 1}`, { cls: 'mlab', onClick: () => window.__pickPt && window.__pickPt(k, i) }); g.userData = { m, lab, u: 0 }; stones[k].push(g); } });
  const sign = (x, txt, cls) => st.addLabel(() => new THREE.Vector3(x, 1.4, -4.1), txt, { cls: 'tw ' + cls });
  const sL = sign(-5, `<b>${esc(fork.sh.replace('◆ ', ''))}</b>`, ''), sH = sign(5, `<b>${esc(fork.hh)}</b>`, ''); const sT = st.addLabel(() => new THREE.Vector3(0, .4, 5.3), '<b>Hold the two lines side by side</b>', { cls: 'tw' });
  const mk = (x, hex) => { const g = new THREE.Group(); g.position.set(x, .1, -4); fg.add(g); clayMesh(st, new THREE.CylinderGeometry(.9, 1, .4, 28), lighten(hex, .2), { y: .2, parent: g }); clayMesh(st, new THREE.BoxGeometry(.9, .9, .9), '#F4E8D0', { y: .85, parent: g }); clayMesh(st, new THREE.ConeGeometry(.75, .5, 4), hex, { y: 1.55, ry: Math.PI / 4, parent: g }); }; mk(-5.2, GREEN); mk(5.2, AMBER);
  const E = new THREE.Color();
  st.onFrame((dt, t, k) => {
    let mv = false;
    sg.visible = view === 'scales'; cg.visible = view === 'coins'; fg.visible = view === 'fork';
    lL.el.hidden = lR.el.hidden = yearLab.el.hidden = view !== 'scales'; coins.forEach(c => c.userData.lab.el.hidden = view !== 'coins'); [sL, sH, sT].forEach(l => l.el.hidden = view !== 'fork'); Object.values(stones).flat().forEach(s => s.userData.lab.el.hidden = view !== 'fork');
    // scales
    const u = silver; const n = Math.round(u * 12);
    chests.forEach((c, i) => { const want = i < n ? 1 : 0; const cur = c.scale.x; const nx = cur + (want - cur) * k; if (Math.abs(want - cur) > .01) mv = true; c.scale.setScalar(Math.max(.001, Math.abs(want - nx) < .01 ? want : nx)); });
    if (smoothTo(beam.rotation, 'z', u * .26, k)) mv = true; const bz = beam.rotation.z; L.g.rotation.z = -bz; R.g.rotation.z = -bz;
    tags.forEach((tg, i) => { const h = .7 + u * (1.4 + (i % 3) * .35); tg.userData.stick.scale.y = h; tg.userData.stick.position.y = h / 2; tg.userData.card.position.y = h; tg.userData.card.scale.set(1 + u * .5, 1 + u * .6, 1); tg.userData.card.material = tagMats; });
    const yr = Math.round(1540 + u * 60); yearLab.el.innerHTML = `<b>c. ${yr}</b><span class="st">${u < .02 ? 'before the flood' : u > .98 ? 'prices have climbed for decades' : 'more silver, higher price tags'}</span>`;
    // coins
    coins.forEach((g, i) => { const on = i === thesis; if (smoothTo(g.userData, 'u', on ? 1 : 0, k)) mv = true; g.position.y = 1.4 + g.userData.u * 1.1; g.rotation.y = on && !S.reduced ? t * 1.6 : g.userData.u * 0; g.scale.setScalar(1 + g.userData.u * .35); g.userData.lab.el.classList.toggle('sel', on); if (on && !S.reduced) mv = true; });
    // fork
    ['sala', 'heid'].forEach(kk => stones[kk].forEach((g, i) => { const on = kk === line && i === pt; if (smoothTo(g.userData, 'u', on ? 1 : 0, k)) mv = true; g.position.y = .12 + g.userData.u * .5; g.userData.m.material.emissive.set('#FFE2A8'); g.userData.m.material.emissiveIntensity = g.userData.u * .5; g.userData.lab.el.classList.toggle('sel', on); }));
    return mv || (!S.reduced && view !== 'scales');
  });
  const views = { scales: () => st.fit(new THREE.Vector3(.4, 2.6, 0), 9.4, 4.8, .82), coins: () => st.fit(new THREE.Vector3(.4, 1.8, 0), 8.6, 3.4, .8), fork: () => st.fit(new THREE.Vector3(0, 0, .6), 9.6, 6, .95) };
  sc = { st, show(v) { view = v; st.view(views[v]()); }, views };
  st.options = { refit: () => views[view]() };
  return sc;
}
const go = v => { sc && sc.show(v); };
const rot = b => S && S.autoRotate(b);
const SIL = D.theses.items[1];

const steps = [
  { id: 'meet', rail: 'Intro', kicker: D.hdr.eyebrow, html: `<h1>The School of <em>Salamanca</em></h1><p class="lede">${D.hdr.lede}</p><div class="fiat-note" style="border-color:var(--green);background:var(--good-bg);color:var(--ink)">${D.hdr.why.replace('class="k"', 'class="fk" style="color:var(--good)"')}</div>`, src: 'Title, introduction and the "Why this detour exists" box are verbatim from the Detour page.', enter: () => { go('scales'); rot(true); } },
  { id: 'setting', rail: 'Silver in', kicker: D.setting.h2, n: '1 / 4', tall: true,
    html: `<h2>${esc(D.setting.h2)}</h2><p class="lede">${D.setting.lede}</p><div class="widget"><label for="sil"><span>Silver arriving in Castile</span><output id="silOut">c. 1540</output></label><input type="range" id="sil" min="0" max="100" value="0" aria-describedby="silRead"><div class="ends"><span>1540s</span><span>1600s</span></div><p class="readout" id="silRead" aria-live="polite"></p></div><div class="chips" style="grid-template-columns:1fr">${D.setting.ctx.map(c => `<div><b>${esc(c.n)}</b><span style="text-transform:none;letter-spacing:0;font:400 13px var(--sans)">${c.t.match(/class="cap">(.*)<\/div>$/)[1]}</span></div>`).join('')}</div>`,
    src: 'The setting text and the three figures are verbatim from the Detour page. The tipping scales and the 1540s→1600s slider are an illustration of "more silver, higher prices", not data.',
    init: (card) => { const sl = $('#sil', card); const r = () => { silver = sl.value / 100; const yr = Math.round(1540 + silver * 60); $('#silOut', card).textContent = 'c. ' + yr; $('#silRead', card).innerHTML = silver < .05 ? 'Few treasure fleets have arrived. Prices are steady.' : silver > .8 ? `<i>“Where it is abundant, it is worth less.”</i> — the pattern behind thesis II below: the same goods now cost far more silver.` : 'Chests keep arriving on the left pan. The same goods on the right now need more silver to balance — price tags climb.'; S && S.markDirty(); }; sl.addEventListener('input', r); r(); },
    enter: () => { go('scales'); rot(false); } },
  { id: 'theses', rail: 'Five theses', kicker: D.theses.h2, n: '2 / 4', tall: true,
    html: `<h2>${esc(D.theses.h2)}</h2><p class="lede">${D.theses.lede}</p><div class="coin-row" id="coinRow" role="group" aria-label="Thesis"></div><div class="who" id="thWho" aria-live="polite" style="border-color:var(--green)"></div><button class="btn ghost" id="tkBtn" type="button" aria-expanded="false">Show: still running →</button><div class="fiat-note" id="tkBox" hidden style="border-style:solid;border-color:var(--green);background:var(--good-bg);color:var(--ink)"></div>`,
    src: 'Thesis titles, authors, texts and the "still running" lines are verbatim from the Detour page. The coin shelf is an illustration.',
    init: (card) => { const row = $('#coinRow', card); D.theses.items.forEach((t, i) => { const b = document.createElement('button'); b.className = 'coin'; b.type = 'button'; b.textContent = t.num.replace('.', ''); b.title = t.title; b.setAttribute('aria-label', `Thesis ${t.num} ${t.title}`); b.setAttribute('aria-pressed', i === 0); b.onclick = () => pick(i); row.appendChild(b); });
      const pick = i => { thesis = i; $$('.coin', row).forEach((b, j) => b.setAttribute('aria-pressed', j === i)); const t = D.theses.items[i]; $('#thWho', card).innerHTML = `<h3>${esc(t.num)} ${esc(t.title)}</h3><div class="role">${esc(t.who)}</div>${t.body}`; $('#tkBox', card).hidden = true; $('#tkBtn', card).setAttribute('aria-expanded', 'false'); $('#tkBox', card).innerHTML = `<span class="fk" style="color:var(--good)">${esc(t.tokenKey)}</span><p><b>${esc(t.yrs)}</b> ${t.token.replace(/^<span class="yrs">.*?<\/span>\s*/, '')}</p>`; S && S.markDirty(); };
      $('#tkBtn', card).onclick = () => { const h = $('#tkBox', card).hidden; $('#tkBox', card).hidden = !h; $('#tkBtn', card).setAttribute('aria-expanded', h); }; window.__pickThesis = pick; pick(0); },
    enter: () => { go('coins'); rot(false); } },
  { id: 'burial', rail: 'Buried', kicker: D.burial.h2, n: '3 / 4', html: `<h2>${esc(D.burial.h2)}</h2>${D.burial.html.replace(/class="rediscovery"/, 'class="rediscovery" style="display:grid;gap:8px;margin:10px 0"').replace(/class="rd-item"/g, 'class="who" style="border-color:var(--green)"').replace(/<span class="y">/g, '<span class="ft-yr">')}`, src: 'Verbatim from the Detour page.', enter: () => { go('coins'); rot(true); } },
  { id: 'fork', rail: 'The fork', kicker: D.fork.h2, n: '4 / 4', tall: true,
    html: `<h2>${esc(D.fork.h2)}</h2><p class="lede">${D.fork.lede}</p><div class="seg2" id="lineSeg" role="group" aria-label="Line"><button type="button" data-l="sala" aria-pressed="true">Salamanca · 1544</button><button type="button" data-l="heid" aria-pressed="false">Heidelberg · 1872</button></div><div class="who" id="forkWho" aria-live="polite"></div><div class="row"><button class="btn ghost" type="button" id="fkPrev">← Prev</button><button class="btn ghost" type="button" id="fkNext">Next →</button></div><p style="margin-top:12px">${D.fork.foot}</p><a class="btn" href="ideas.html">↩ Return to Chapter I — see which line won</a>`,
    src: 'The two lists of four points, and the closing paragraph, are verbatim from the Detour page. The forked road is an illustration.',
    init: (card) => { const show = () => { $$('#lineSeg button', card).forEach(b => b.setAttribute('aria-pressed', b.dataset.l === line)); const col = line === 'sala' ? 'var(--green)' : 'var(--accent)'; $('#forkWho', card).style.borderColor = col; $('#forkWho', card).innerHTML = `<div class="role">${esc(line === 'sala' ? fork.sh : fork.hh)} · point ${pt + 1} / 4</div><h3 style="font-size:20px">${fork[line][pt]}</h3>`; S && S.markDirty(); };
      window.__pickPt = (k, i) => { line = k; pt = i; show(); }; $$('#lineSeg button', card).forEach(b => b.onclick = () => { line = b.dataset.l; show(); }); $('#fkPrev', card).onclick = () => { pt = (pt + 3) % 4; show(); }; $('#fkNext', card).onclick = () => { pt = (pt + 1) % 4; show(); }; show(); },
    enter: () => { go('fork'); rot(false); } },
];
const fullText = () => `<h3>${esc(D.hdr.h1)}</h3><p>${D.hdr.lede}</p><div class="ft-item">${D.hdr.why}</div>
  <h3>${esc(D.setting.h2)}</h3><p>${D.setting.lede}</p><div class="ft-grid">${D.setting.ctx.map(c => `<div class="ft-item">${c.t}</div>`).join('')}</div>
  <h3>${esc(D.theses.h2)}</h3><p>${D.theses.lede}</p><div class="ft-grid">${D.theses.items.map(t => `<article class="ft-item"><div class="ft-yr">${esc(t.num)}</div><h4>${esc(t.title)}</h4><p class="ft-meta">${esc(t.who)}</p>${t.body}<div class="fiat-note" style="border-style:solid"><span class="fk">${esc(t.tokenKey)}</span><p>${t.token}</p></div></article>`).join('')}</div>
  <h3>${esc(D.burial.h2)}</h3>${D.burial.html}<h3>${esc(D.fork.h2)}</h3><p>${D.fork.lede}</p>${D.fork.html}<p>${D.fork.foot}</p><p class="ft-note">${D.srcnote}</p>`;
mountChapter({ key: 'detour', steps, fullText, build: buildScene, next: null, resetView: () => sc && sc.show(view) });
