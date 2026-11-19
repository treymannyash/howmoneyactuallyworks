import { createHero } from './lib/hero.js';
import { createEconomy } from './lib/economy.js';
import { createStage, THREE, webglOK, prefersReduced, clayMesh } from './lib/stage3d.js';
import { makeChapterIcon, hueOf, THEMES } from './lib/clay.js';
import { shockFrames } from './lib/shock.js';
import { NM } from './lib/data.js';
import { CH, DET, YEAR_TEXTS, M2, EVS } from './content/site-data.js';
import { createXray } from './xray.js';

const reduced = prefersReduced(), gl = webglOK();
const $ = (s, r = document) => r.querySelector(s);
if (!gl) document.documentElement.classList.add('nogl');
if (reduced) document.documentElement.classList.add('rm');
const T = THEMES.A;
const HREF = { ideas: 'chapters/ideas.html', machine: 'chapters/machine.html', trap: 'chapters/trap.html', exit: 'chapters/exit.html', detour: 'chapters/detour.html' };
const LEG = { ideas: '#f5a623', machine: '#4db8ff', trap: '#f87171', exit: '#ff7043', detour: '#00e5a0' };
const CC = { ideas: '#C9941A', machine: '#4A8CBB', trap: '#C9564D', exit: '#D1702F', detour: '#4E9468' };

/* ---------- hero ---------- */
let hero = null;
if (gl) { try { hero = createHero($('#heroScene'), { theme: 'A', reduced, hrefs: HREF }); } catch (e) { console.warn(e); } if (!hero) document.documentElement.classList.add('nogl'); }
$('#thread').querySelectorAll('button').forEach(b => b.addEventListener('click', () => { $('#thread').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); hero && hero.setElastic(b.dataset.e === '1'); }));

/* ---------- dock: year + U.S. M2 (FRED M2SL) ---------- */
const m2At = y => { const e = M2.find(m => m[0] === Math.round(y)) || M2[M2.length - 1]; return e[1]; };
const syn0 = $('#synopsis').innerHTML;
$('#yrs').innerHTML = EVS.map(([y, t], i) => `<button type="button" class="yr" data-y="${y}" aria-pressed="${i === 0}"><b>${y}</b><span>${t}</span></button>`).join('');
const svg = $('#m2svg'); const W = 260, H = 46, mx = Math.max(...M2.map(m => m[1])), x0 = M2[0][0], x1 = M2[M2.length - 1][0];
const px = y => 4 + (y - x0) / (x1 - x0) * (W - 8), py = v => H - 4 - (v / mx) * (H - 10);
svg.innerHTML = `<path d="M${M2.map(m => px(m[0]).toFixed(1) + ',' + py(m[1]).toFixed(1)).join(' L')}" fill="none" stroke="var(--accent)" stroke-width="2"/>` + EVS.map(([y]) => `<circle data-y="${y}" cx="${px(y)}" cy="${py(m2At(y))}" r="3.5" fill="var(--bg)" stroke="var(--ink)" stroke-width="1.5"/>`).join('');
function setYear(y) { $('#m2').textContent = '$' + m2At(y).toFixed(2) + 'T'; document.querySelectorAll('#yrs .yr').forEach(b => b.setAttribute('aria-pressed', +b.dataset.y === +y)); svg.querySelectorAll('circle').forEach(c => { const on = +c.dataset.y === +y; c.setAttribute('r', on ? 5.5 : 3.5); c.setAttribute('fill', on ? 'var(--accent)' : 'var(--bg)'); });
  const t = YEAR_TEXTS['year' + y]; $('#synopsis').innerHTML = t ? (t.syn || t.text || t) : syn0; }
document.querySelectorAll('#yrs .yr').forEach(b => { b.addEventListener('click', () => setYear(+b.dataset.y)); b.addEventListener('mouseenter', () => setYear(+b.dataset.y)); });
setYear(EVS[0][0]);

/* ---------- chambers ---------- */
const ALL = [...CH, DET];
const stOf = c => c.stats.replace(/<i>/g, '<i>');
$('#chambers').innerHTML = ALL.map((c, i) => `
<section class="chamber${i % 2 ? ' alt' : ''}${c.key === 'detour' ? ' det' : ''}" data-k="${c.key}" id="ch-${c.key}" aria-labelledby="h-${c.key}">
  <span class="bignum" aria-hidden="true">${c.num}</span>
  <div class="txt">
    <div class="eyebrow">${c.key === 'detour' ? 'Branches off Chapter I' : 'Chapter <b>' + c.num + '</b>'}</div>
    <h2 id="h-${c.key}">${c.name}</h2>
    <p class="sub">${c.src}</p>
    <p class="lead">${c.desc}</p>
    ${c.stats ? `<p class="statline">${c.stats}</p>` : ''}
    <div class="btns"><a class="btn" href="${HREF[c.key]}">Enter ${c.key === 'detour' ? 'the detour' : 'chapter ' + c.num} →</a>${c.key === 'machine' ? '<button class="btn ghost" id="run" type="button">▶ Trigger the bank run</button>' : ''}</div>
  </div>
  <div class="mini"><div class="scene" id="sc-${c.key}"></div><div class="caption" id="cap-${c.key}" aria-live="polite"><span class="badge">${c.key === 'machine' ? 'Drag to orbit' : 'Chapter ' + c.num}</span><span>${c.key === 'machine' ? 'Click a chamber label, or trigger the Bank Run / SVB-type shock and watch deposits drain.' : c.syn}</span></div></div>
</section>`).join('');

function iconStage(c, el) {
  let st = null; const v = () => st.fit(new THREE.Vector3(0, 1.5, 0), 4.6, 3.0, .78);
  st = createStage(el, { tray: { w: 11, d: 9, r: 1.8 }, autoRotate: true, polar: [.5, 1.2], zoom: false, refit: v, label: `Illustration for ${c.name}. Drag to rotate.` });
  if (!st) return null; const hue = hueOf(T, LEG[c.key]);
  const ic = makeChapterIcon(c.key, hue, T, st.mats); ic.scale.setScalar(3.6); ic.position.y = 0; st.root.add(ic);
  st.onFrame((dt, t) => { if (st.reduced) return false; const ud = ic.userData; ud.spin && ud.spin.forEach(([o, s]) => o.rotation.y += dt * s); ud.bob && ud.bob.forEach(([o, a]) => o.position.y = (o.userData.y0 ??= o.position.y) + Math.sin(t * 2) * a); return true; });
  st.view(v(), { instant: true });
  return st;
}
function machineChamber(el) {
  const cap = $('#cap-machine'); const cap0 = cap.innerHTML; let eco = createEconomy(el, { theme: 'A', reduced, autoRotate: true, onPick: p => { if (p.type === 'node') { const n = NM[p.key]; eco.setFocus([p.key], null); eco.flyTo([p.key]); cap.innerHTML = `<span class="badge">${n.label}</span><span>${n.desc} <i style="opacity:.85">${n.stat}</i></span>`; } } });
  if (!eco) return null; let timer = null, frames = shockFrames('bank'), i = -1; const btn = $('#run');
  const show = k => { const f = frames[k]; eco.setShock(f.nodes, f.edges); eco.setBank(f.bank); cap.innerHTML = `<span class="badge">Step ${k + 1}/6</span><span><b>${f.step.l}.</b> ${f.step.b}</span>`; };
  const reset = () => { clearTimeout(timer); timer = null; eco.setShock({}, {}); eco.setBank(1); eco.clearFocus(); eco.flyTo(null); cap.innerHTML = cap0; btn.textContent = '▶ Trigger the bank run'; i = -1; };
  btn.addEventListener('click', () => { if (i >= 0) { reset(); return; } eco.clearFocus(); eco.autoRotate(false); eco.flyTo(null); btn.textContent = '■ Reset'; (function next() { i++; show(i); if (i < 5) timer = setTimeout(next, reduced ? 1800 : 2600); else { timer = null; btn.textContent = '↺ Reset'; } })(); });
  return eco;
}
const made = {};
const io = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; const k = e.target.dataset.k; if (made[k] || !gl) return; made[k] = 1; const c = ALL.find(x => x.key === k); const el = $('#sc-' + k); try { (k === 'machine' ? machineChamber(el) : iconStage(c, el)); } catch (er) { console.warn(er); } }), { rootMargin: '400px' });
document.querySelectorAll('.chamber').forEach(s => io.observe(s));

/* ---------- chapter cards ---------- */
$('#ch-grid').innerHTML = ALL.map(c => `<a class="ch-card${c.key === 'detour' ? ' detour' : ''}" href="${HREF[c.key]}" style="--cc:${CC[c.key]}"><div><span class="num">${c.num}</span><h3>${c.name}</h3><div class="tag">${c.tag}</div><p>${c.desc}</p>${c.stats ? `<div class="st">${c.stats}</div>` : ''}</div><span class="go">Open →</span></a>`).join('');

/* ---------- live derivatives ---------- */
createXray($('#xrayStage'), $('#xrayPanel'), $('#nuggetList'), { gl, reduced });
