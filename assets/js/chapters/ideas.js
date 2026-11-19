import { createStage, clayMesh, smoothTo, THREE, lighten, darken, rrect } from '../lib/stage3d.js';
import { mountChapter, quiz, quizHTML, segmented, $, $$, esc } from '../lib/kit.js';
import { IDEAS as I } from '../content/ideas-data.js';
import { EXTRAS } from '../content/extras-data.js';

const ERA_OF = [0, 1, 1, 3, 3, 4, 4, 6];            // which era each pipeline node falls in, by its year (derived from the era ranges on the page)
const NODE_X = [-7.2, -3.3, -1.5, .6, 2.4, 4.0, 5.6, 7.4];
const COLS = ['#E5BD54', '#E58353', '#DE7068', '#A58BD0', '#6FA3CC', '#5FBBA0', '#86B58F', '#E8A94B'];
let S = null, sc = null, pos = 0, era = 0, mythI = 0, quizSel = -1;

function build(el) {
  const st = createStage(el, { tray: { w: 21, d: 14, r: 2, z: 0 }, shiftRight: true, shiftX: .19, shiftScale: .72, autoRotate: true, minDist: 7, maxDist: 36, label: 'Interactive 3D pipeline from German universities to American campuses. Drag to rotate; the same information is in the text beside it.' });
  if (!st) return null; S = st; const T = st.T, root = st.root, mats = st.mats;
  const pipeG = new THREE.Group(), mythG = new THREE.Group(), quizG = new THREE.Group(); root.add(pipeG, mythG, quizG);
  // islands: Germany (left) and the U.S. (right) with water between
  const water = clayMesh(st, new THREE.BoxGeometry(2.3, .1, 6.4), '#A9CCE0', { x: -5.5, y: -.02, z: 0, parent: pipeG, cast: false });
  const isl = (w, x, hex) => { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(w, 7, .9), { depth: .12, bevelEnabled: true, bevelThickness: .05, bevelSize: .06, bevelSegments: 2 }), mats.clay(hex)); m.rotation.x = -Math.PI / 2; m.position.set(x, 0, 0); m.receiveShadow = true; pipeG.add(m); return m; };
  isl(3.2, -7.2, '#DCC9A0'); isl(13.2, 3.3, '#D9E3C2');
  const zl = [st.addLabel(() => new THREE.Vector3(-7.2, .1, 3.7), 'Germany', { cls: 'zl' }), st.addLabel(() => new THREE.Vector3(3.3, .1, 3.7), 'United States', { cls: 'zl' })];
  // pedestals + pipes
  const nodes = I.pipe.map((n, i) => {
    const g = new THREE.Group(); g.position.set(NODE_X[i], 0, Math.sin(i * 1.1) * 1.4); pipeG.add(g);
    const ped = clayMesh(st, new THREE.CylinderGeometry(.62, .74, 1, 28), COLS[i], { parent: g }); ped.geometry.translate(0, .5, 0);
    const top = new THREE.Group(); top.position.y = 1; g.add(top);
    if (i === 0) { const b = clayMesh(st, new THREE.BoxGeometry(1.2, .8, .8), '#EBDDBF', { y: .4, parent: top }); clayMesh(st, new THREE.ConeGeometry(.95, .55, 4), '#C47A4A', { y: 1.07, ry: Math.PI / 4, parent: top }); clayMesh(st, new THREE.BoxGeometry(.2, .35, .1), '#8A6A4C', { y: .18, z: .41, parent: top }); }
    else if (i === 5) { for (let k = 0; k < 4; k++) clayMesh(st, new THREE.BoxGeometry(.9 - k * .05, .18, .65), ['#C0392B', '#2F6B8A', '#E5BD54', '#5FBBA0'][k], { y: .09 + k * .19, ry: k * .25, parent: top }); }
    else { const w = .8, hgt = .6 + (i % 3) * .25; clayMesh(st, new THREE.BoxGeometry(w, hgt, .7), '#F4E8D0', { y: hgt / 2, parent: top }); clayMesh(st, new THREE.BoxGeometry(w + .2, .14, .8), lighten(COLS[i], .15), { y: hgt + .07, parent: top }); [-.28, 0, .28].forEach(x => clayMesh(st, new THREE.BoxGeometry(.1, hgt - .1, .1), '#C9B793', { x, y: hgt / 2, z: .38, parent: top })); }
    const L = st.addLabel(() => new THREE.Vector3(g.position.x, 2.5 + (g.userData.h || 0) * 1.3, g.position.z), `<b>${esc(n.name)}</b><span class="st">${esc(n.year)}</span>`, { cls: 'plab', onClick: () => { setPos(i); const sl = $('#tl'); if (sl) sl.value = i; } });
    g.userData = { ped, top, L, h: 0, tgt: 0 }; return g;
  });
  const segs = []; const toks = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i].position.clone().setY(.55), b = nodes[i + 1].position.clone().setY(.55); const len = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, len, 12), mats.clay('#E9DCC3')); m.castShadow = true; m.position.copy(a.clone().add(b).multiplyScalar(.5)); m.lookAt(b); m.rotateX(Math.PI / 2); pipeG.add(m); segs.push(m);
  }
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.26, 20, 14), new THREE.MeshStandardMaterial({ color: T.cream, emissive: '#E58353', emissiveIntensity: .6, roughness: .3 })); orb.position.y = 1.2; orb.castShadow = true; pipeG.add(orb);
  // myth crystals (12)
  const crystals = I.myths.map((m, i) => {
    const c = new THREE.Mesh(new THREE.OctahedronGeometry(.5, 0), mats.clay(['#E5BD54', '#DE7068', '#6FA3CC', '#A58BD0', '#5FBBA0', '#E58353'][i % 6])); c.scale.y = 1.35; c.castShadow = true;
    const col = i % 6, row = Math.floor(i / 6); c.position.set(-5.6 + col * 2.24, .9, -4.1 + row * 2.3 - 0.4); c.userData = { y0: .9, sel: 0 };
    mythG.add(c); const base = clayMesh(st, new THREE.CylinderGeometry(.5, .6, .22, 24), '#E9DCC3', { x: c.position.x, y: .11, z: c.position.z, parent: mythG });
    const L = st.addLabel(() => new THREE.Vector3(c.position.x, .15, c.position.z + .75), `#${i + 1}`, { cls: 'mlab', onClick: () => { setMyth(i); } }); c.userData.L = L; return c;
  });
  // quiz plinths (decades)
  const decs = ['1880s', '1930s', '1970s', '2010s'];
  const quizLabels = [];
  const plinths = decs.map((d, i) => { const x = -4.5 + i * 3; const p = clayMesh(st, new THREE.BoxGeometry(2.2, .5, 1.5), lighten(COLS[i], .35), { x, y: .25, z: 5.2, parent: quizG }); quizLabels.push(st.addLabel(() => new THREE.Vector3(x, .5, 5.2 + .9), d, { cls: 'mlab' })); return p; });
  const qcard = clayMesh(st, new THREE.BoxGeometry(1.6, .12, 1.1), '#FBF4E6', { x: 0, y: 1.9, z: 3.2, parent: quizG }); qcard.userData = { tx: 0, ty: 1.9, tz: 3.2 };
  // frame loop
  st.onFrame((dt, t, k) => {
    let mv = false; const reveal = pos;
    nodes.forEach((g, i) => { const u = g.userData; const on = i <= reveal; const inEra = era < 0 || ERA_OF[i] === era; u.tgt = on ? (i === Math.round(reveal) ? .9 : .45) : 0; if (smoothTo(u, 'h', u.tgt, k)) mv = true; u.ped.scale.y = 1 + u.h * 1.3; u.top.position.y = 1 + u.h * 1.3; u.ped.material.emissive.set(inEra && eraMode ? '#FFD28A' : '#000'); u.ped.material.emissiveIntensity = inEra && eraMode ? .35 : 0; u.L.el.classList.toggle('dim', !on); u.L.el.classList.toggle('sel', i === Math.round(reveal)); });
    segs.forEach((m, i) => { m.material.color.set(i < reveal ? '#E58353' : '#E9DCC3'); });
    const idx = THREE.MathUtils.clamp(pos, 0, 7); const i0 = Math.floor(idx), i1 = Math.min(7, i0 + 1), f = idx - i0;
    const p0 = nodes[i0].position, p1 = nodes[i1].position; const hh = 1 + nodes[i0].userData.h * 1.3;
    orb.position.set(p0.x + (p1.x - p0.x) * f, hh + .55 + (S.reduced ? 0 : Math.sin(t * 3) * .05), p0.z + (p1.z - p0.z) * f);
    crystals.forEach((c, i) => { const u = c.userData, sel = i === mythI && mythMode; if (smoothTo(u, 'sel', sel ? 1 : 0, k)) mv = true; c.position.y = u.y0 + u.sel * .9 + (S.reduced ? 0 : Math.sin(t * 1.5 + i) * .05); if (!S.reduced || sel) c.rotation.y += S.reduced ? 0 : dt * (.4 + u.sel * 2); c.material.emissive.set('#FFB36B'); c.material.emissiveIntensity = u.sel * .55; c.scale.setScalar(1 + u.sel * .25); c.scale.y *= 1.35; u.L.el.classList.toggle('sel', sel); });
    qcard.position.x += (qcard.userData.tx - qcard.position.x) * k; qcard.position.y += (qcard.userData.ty - qcard.position.y) * k; qcard.position.z += (qcard.userData.tz - qcard.position.z) * k;
    if (Math.abs(qcard.userData.tx - qcard.position.x) > .01) mv = true;
    plinths.forEach((p, i) => { p.material.emissive.set(i === quizSel ? '#8DD6A5' : '#000'); p.material.emissiveIntensity = i === quizSel ? .5 : 0; });
    const pv = !(viewMode === 'myth' || viewMode === 'quiz'); pipeG.visible = pv; nodes.forEach(g => g.userData.L.el.hidden = !pv); crystals.forEach(c => c.userData.L.el.hidden = viewMode !== 'myth'); quizLabels.forEach(L => L.el.hidden = viewMode !== 'quiz'); zl.forEach(L => L.el.hidden = !pv); mythG.visible = viewMode === 'myth'; quizG.visible = viewMode === 'quiz';
    return mv || !S.reduced;
  });
  const views = {
    all: () => st.fit(new THREE.Vector3(.1, 0, .2), 11.6, 5.6, .9), myth: () => st.fit(new THREE.Vector3(0, .5, -2.2), 6.6, 3.2, .85), quiz: () => st.fit(new THREE.Vector3(0, .5, 4.2), 5.6, 3.4, .85),
  };
  sc = { st, nodes, views, show(v) { viewMode = v; st.view(views[v]()); }, qcard };
  st.options = { refit: () => views[viewMode === 'pipe' ? 'all' : viewMode]?.() };
  return sc;
}
const rot = b => S && S.autoRotate(b);
let viewMode = 'all', eraMode = false, mythMode = false;
function setPos(v, instant) { pos = v; renderPipe(); S && S.markDirty(); }
function setMyth(i) { mythI = i; renderMyth(); S && S.markDirty(); }
let renderPipe = () => {}, renderMyth = () => {};

const evHTML = e => `<details class="ev"><summary><b>${esc(e.year)}</b><span>${esc(e.title)}</span></summary><div class="ev-b"><p>${e.detail}</p>${e.people.length ? `<div class="ppl">${e.people.map(p => `<span>${esc(p)}</span>`).join('')}</div>` : ''}${e.sf ? `<div class="sf"><q>${esc(e.sf.quote)}</q><small><b>${esc(e.sf.attr)}</b> — ${e.sf.note}</small></div>` : ''}</div></details>`;
const surname = n => n.split(/[ \/]/).filter(Boolean).pop();

const steps = [
  { id: 'meet', rail: 'Intro', kicker: I.hdr.badge, html: `<h1>From Heidelberg <em>to Harvard</em></h1><p class="lede">${esc(I.hdr.sub)}</p><div class="chips">${I.stats.map(s => `<div><b>${esc(s.num)}</b><span>${esc(s.label)}</span></div>`).join('')}</div><p>Scroll to ride the pipeline from the German lecture hall to the American campus. Drag the model to look around.</p>`,
    src: 'Title, subtitle and the four figures are from Chapter I. The scroll hint is new copy.', enter: ({ scene }) => { eraMode = false; mythMode = false; setPos(7); scene.show && scene.show('all'); rot(true); } },
  { id: 'pipe', rail: 'The pipeline', kicker: 'The intellectual pipeline', tall: true, n: '1 / 5',
    html: `<h2>Follow the pipeline, year by year</h2><p class="lede">Eight hand-offs carry the German-trained model into American universities, policy and textbooks. Drag the slider — or tap a pedestal.</p>
      <div class="widget"><label for="tl"><span>Hand-off</span><output id="tlOut"></output></label><input type="range" id="tl" min="0" max="7" step="1" value="0" aria-describedby="who"><div class="tl-ticks" aria-hidden="true">${I.pipe.map(p => `<span>${esc(p.year)}</span>`).join('')}</div></div>
      <div class="who" id="who" aria-live="polite"></div>`,
    src: 'Names, roles and years are verbatim from the chapter\'s "Intellectual Pipeline". The 3D layout (islands, pedestal heights, flow) is an illustration, not a map.',
    init: (card) => {
      const tl = $('#tl', card);
      renderPipe = () => { const i = Math.round(pos); const n = I.pipe[i]; const fig = I.figs.find(f => f.name.includes(surname(n.name)) || (surname(n.name).length > 3 && f.name.includes(n.name.split(' ')[0] === 'J.R.' ? 'Commons' : surname(n.name))));
        $('#tlOut', card).textContent = `${i + 1} / 8 · ${n.year}`;
        $('#who', card).style.borderColor = COLS[i]; $('#who', card).innerHTML = `<h3>${esc(n.name)}</h3><div class="role">${esc(n.role)} · ${esc(n.year)}</div>${fig ? `<p>${esc(fig.role)}</p><p class="ft-meta">${esc(fig.german)}</p>` : '<p>One link in the chain the chapter calls the intellectual pipeline.</p>'}`; };
      tl.addEventListener('input', () => setPos(+tl.value)); renderPipe();
    }, enter: ({ scene }) => { eraMode = false; mythMode = false; scene.show && scene.show('all'); rot(false); $('#tl').value = Math.round(pos); renderPipe(); } },
  { id: 'eras', rail: 'Seven eras', kicker: 'Seven eras · 27 events', n: '2 / 5', tall: true,
    html: `<h2>Seven eras, 27 events</h2><p class="lede" id="eraDesc"></p><div class="seg-row" id="eraBtns"></div><div class="evlist" id="evlist" role="list"></div>`,
    src: 'Era names, dates and every event are verbatim from Chapter I. Highlighted pedestals are placed by matching each hand-off\'s year to the era\'s date range.',
    init: (card) => {
      const sg = segmented($('#eraBtns', card), I.eras.map((e, i) => `<b>${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][i]}</b>`), i => setEra(i), { label: 'Era', cls: 'pill sm' });
      $$('button', card).forEach((b, i) => b.title = I.eras[i].label);
      function setEra(i) { era = i; const e = I.eras[i]; $('#eraDesc', card).innerHTML = `<b>${esc(e.label)}</b> · ${esc(e.range)}<br>${esc(e.desc)}`; $('#evlist', card).innerHTML = I.events.filter(ev => ev.era === i).map(evHTML).join(''); sg.set(i); pos = Math.max(pos, 7); S && S.markDirty(); }
      setEra(0); card.setEra = setEra;
    }, enter: ({ scene }) => { eraMode = true; mythMode = false; setPos(7); scene.show && scene.show('all'); rot(false); } },
  { id: 'myths', rail: 'Embedded myths', kicker: '12 embedded myths', n: '3 / 5', tall: true,
    html: `<h2>Twelve crystals, twelve myths</h2><p class="lede">Pick one up and read what the chapter says is really underneath it.</p><div class="mchips" id="mchips"></div><div class="myth-box" id="mythBox" aria-live="polite"></div>`,
    src: 'Myth titles, explanations and "reality" text are verbatim from Chapter I.',
    init: (card) => {
      $('#mchips', card).innerHTML = I.myths.map((m, i) => `<button class="pill" type="button" aria-pressed="${i === 0}" data-i="${i}">${i + 1}</button>`).join('');
      renderMyth = () => { const m = I.myths[mythI]; $$('#mchips .pill', card).forEach((b, j) => b.setAttribute('aria-pressed', j === mythI)); $('#mythBox', card).innerHTML = `<div class="tag">${esc(m.label)}</div><h3>${esc(m.title)}</h3><p>${m.body}</p><div class="real">${m.reality}</div>`; };
      $$('#mchips .pill', card).forEach(b => b.onclick = () => setMyth(+b.dataset.i)); renderMyth();
    }, enter: ({ scene }) => { eraMode = false; mythMode = true; scene.show && scene.show('myth'); rot(false); renderMyth(); } },
  { id: 'quiz', rail: 'Who said it?', kicker: 'Who said it? Guess the decade', n: '4 / 5', tall: true,
    html: `<p class="mono" data-qn></p>${quizHTML('Whose decade is this?')}`,
    src: 'The quotations, decades and attributions are from Chapter I\'s "Who said it?" box.',
    init: (card, ctx) => {
      const QS = I.quiz.map(q => ({ q: `<span class="quote-card">${esc(q.q)}</span>`, o: q.opts.map(o => [o.t, o.ok ? 1 : 0]), why: q.rest.join(' ') }));
      quiz(card, QS, { onShow: Q => { quizSel = -1; if (sc) { sc.qcard.userData.tx = 0; sc.qcard.userData.tz = 3.2; sc.qcard.userData.ty = 1.9; } S && S.markDirty(); },
        onAnswer: (Q, oi, ok) => { const right = Q.o.findIndex(x => x[1]); quizSel = right; sc.qcard.userData.tx = -4.5 + right * 3; sc.qcard.userData.tz = 5.2; sc.qcard.userData.ty = 1; S.markDirty(); }, done: (s, n) => `<b class="g">${s} of ${n}.</b> The language reads as contemporary because the argument has never really changed.` });
    }, enter: ({ scene }) => { eraMode = false; mythMode = false; scene.show && scene.show('quiz'); rot(false); } },
  { id: 'who', rail: 'The throughline', kicker: 'Key transmission figures', n: '5 / 5', tall: true,
    html: `<h2>Eight people. One throughline.</h2><div class="evlist" style="max-height:30vh">${I.figs.map(f => `<details class="ev"><summary><b></b><span>${esc(f.name)}</span></summary><div class="ev-b"><p>${esc(f.role)}</p><p class="ft-meta">${esc(f.german)}</p></div></details>`).join('')}</div><p>${I.throughline}</p><a class="btn" href="detour.html">◆ ${esc(I.detour.t)} →</a><p class="src" style="margin-top:12px">${I.detour.s}</p>`,
    src: 'Figures, throughline and the Detour call-out are verbatim from Chapter I.', enter: ({ scene }) => { eraMode = false; mythMode = false; setPos(7); scene.show && scene.show('all'); rot(true); } },
];

const TBR = r => r ? `<p class="ft-note"><b>${esc(r.label)}.</b> ${r.body} ${r.links.map(l => `<a href="${esc(l.href)}" target="_blank" rel="noopener">${esc(l.t)}</a>`).join(' · ')}</p>` : '';
const MX = i => { const m = EXTRAS.ideas.myths[i] || {}; return (m.stamp ? `<p class="ft-meta">${esc(m.stamp)}</p>` : '') + (m.sf ? `<p class="ft-note"><q>${esc(m.sf.quote.replace(/^"|"$/g, ''))}</q> ${esc(m.sf.attr)}. ${m.sf.note}</p>` : '') + TBR(m.tb); };
const CTX = n => EXTRAS.ideas.contexts.filter(c => c.after === n).map(c => `<aside class="ft-item ft-note"><div class="ft-yr">${esc(c.label)}</div><p>${c.body}</p></aside>`).join('');
const TN = i => EXTRAS.ideas.thenNow.filter(c => c.afterEra === i).map(c => `<aside class="ft-item"><div class="ft-yr">${esc(c.eyebrow)}</div><div class="ft-grid">${c.cols.map(k => `<div><b>${esc(k.head)}</b><p><q>${esc(k.quote.replace(/^"|"$/g, ''))}</q></p><p class="ft-meta">${esc(k.attr)}</p></div>`).join('')}</div><p>${esc(c.foot)}</p></aside>`).join('');
const fullText = () => {
  const era = I.eras.map((e, i) => `<h3 id="${e.id}">${esc(e.label)} <small class="ft-yr">${esc(e.range)}</small></h3><p>${esc(e.desc)}</p><div class="ft-grid">${I.events.map((ev, n) => [ev, n]).filter(([ev]) => ev.era === i).map(([ev, n]) => `<article class="ft-item"><div class="ft-yr">${esc(ev.year)}</div><h4>${esc(ev.title)}</h4><p>${ev.detail}</p>${ev.people.length ? `<p class="ft-meta">${ev.people.map(esc).join(' · ')}</p>` : ''}${ev.sf ? `<p class="ft-note"><q>${esc(ev.sf.quote)}</q> — ${esc(ev.sf.attr)}. ${ev.sf.note}</p>` : ''}${TBR(EXTRAS.ideas.evRefs[n])}</article>${CTX(n)}`).join('')}</div>${TN(i)}`).join('');
  const myths = `<h3>The 12 embedded myths</h3><div class="ft-grid">${I.myths.map((m, mi) => `<article class="ft-item"><div class="ft-yr">${esc(m.label)}</div><h4>${esc(m.title)}</h4><p>${m.body}</p><p><b>Reality:</b> ${m.reality}</p>${MX(mi)}</article>`).join('')}</div>`;
  const figs = `<h3>Key transmission figures</h3><div class="ft-grid">${I.figs.map(f => `<article class="ft-item"><h4>${esc(f.name)}</h4><p>${esc(f.role)}</p><p class="ft-meta">${esc(f.german)}</p></article>`).join('')}</div><h3>The Intellectual Pipeline — Person by Person</h3><p>${I.pipe.map(p => `${esc(p.name)} (${esc(p.role)}, ${esc(p.year)})`).join(' → ')}</p>`;
  const quiz = `<h3>Who said it? Guess the decade</h3><div class="ft-grid">${I.quiz.map(q => `<article class="ft-item"><p><q>${esc(q.q)}</q></p><p class="ft-meta">${q.opts.map(o => esc(o.t) + (o.ok ? ' ✓' : '')).join(' · ')}</p>${q.rest.join('')}</article>`).join('')}</div>`;
  const phrases = `<h3>Recurring Arguments — By Era</h3><ul>${['Economy too complex for ordinary people', 'Competition is wasteful — coordination is better', 'We need expert management of the economy', 'Government spending creates growth', 'Markets are inherently unstable'].map(x => `<li>“${x}”</li>`).join('')}</ul><p class="ft-note">Based on themes from Thomas C. Leonard's <em>Illiberal Reformers</em>, the history of the AEA, and the intellectual genealogy of American economic thought. All interpretive claims are offered for critical engagement, not as settled conclusions.</p>`;
  return `<h3>The throughline</h3><p>${I.throughline}</p><p><a href="detour.html">${esc(I.detour.k)}: ${esc(I.detour.t)}</a> — ${I.detour.s}</p>` + era + myths + figs + quiz + phrases;
};
mountChapter({ key: 'ideas', steps, fullText, build, resetView: () => sc && sc.show(viewMode) });
