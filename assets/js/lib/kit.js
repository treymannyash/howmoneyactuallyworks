// Chapter page kit: nav, step rail, sticky 3D stage + scroll-driven cards, progress, WebGL-failure fallback.
import { webglOK, prefersReduced } from './stage3d.js';

import { EXTRAS } from '../content/extras-data.js';
const tailHTML = key => { const x = EXTRAS[key]; if (!x) return ''; const e = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  return x.tail.map(p => `<p>${p}</p>`).join('') + (key === 'trap' ? '' : x.res.map(r => `<h3>${e(r.label)}</h3><div class="ft-res">${r.links.map(l => `<a href="${e(l.href)}" target="_blank" rel="noopener">${e(l.title)}<span>${e(l.meta)}</span></a>`).join('')}</div>`).join('')); };


export const CHAPTERS = [
  { key: 'ideas', roman: 'I', name: 'The Ideas', href: 'ideas.html' },
  { key: 'machine', roman: 'II', name: 'The Machine', href: 'machine.html' },
  { key: 'trap', roman: 'III', name: 'The Trap', href: 'trap.html' },
  { key: 'exit', roman: 'IV', name: 'The Exit', href: 'exit.html' },
  { key: 'detour', roman: '◆', name: 'The Detour', href: 'detour.html' },
];
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const NOOP = new Proxy(function () {}, { get: () => NOOP, apply: () => NOOP });
export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function mountChapter(cfg) {
  const reduced = prefersReduced();
  const root = document.documentElement;
  if (reduced) root.classList.add('rm');
  const isMobile = () => innerWidth <= 900;
  const me = CHAPTERS.find(c => c.key === cfg.key);
  const idx = CHAPTERS.indexOf(me), nxt = cfg.next === null ? null : (cfg.next || CHAPTERS[idx + 1]);
  document.title = `${me.roman === '◆' ? 'The Detour' : 'Chapter ' + me.roman} — ${me.name} · How the Economy Actually Works`;
  const gl = webglOK();
  if (!gl) root.classList.add('nogl');

  document.body.insertAdjacentHTML('afterbegin', `
  <a class="skip" href="#steps">Skip to the chapter</a>
  <div class="progress" id="prog" aria-hidden="true"></div>
  <nav class="cnav" aria-label="Chapter">
    <a class="brand" href="../index.html"><i></i><span class="full">How the Economy Works</span></a>
    <div class="mid"><b>${me.roman}</b> ${me.name}</div>
    <div class="chnav" aria-label="Chapters">${CHAPTERS.map(c => `<a href="${c.href}" title="${c.name}"${c.key === cfg.key ? ' aria-current="page"' : ''}>${c.roman}</a>`).join('')}</div>
  </nav>
  <nav class="rail" id="rail" aria-label="Steps"></nav>
  <div class="stage" id="stage"><div class="scene" id="scene"></div>
    <div class="stage-hud"><button class="chip-btn" id="resetView" type="button">⟲ Reset view</button></div>
    <div class="info" id="info" role="region" aria-live="polite" aria-label="Details"></div>
    <div class="hint3d" id="hint3d">Drag to orbit · click a label to read it</div></div>
  <main class="steps" id="steps"></main>`);

  const stepsEl = $('#steps');
  stepsEl.innerHTML = cfg.steps.map((s, i) => `
    <section class="step${s.tall ? ' tall' : ''}" data-i="${i}" id="s-${s.id}" aria-labelledby="h-${s.id}">
      <div class="card">
        <div class="kicker"><span class="n">${esc(s.n ?? (i === 0 ? 'Chapter ' + me.roman : `${i} / ${cfg.steps.length - 1}`))}</span>${esc(s.kicker || '')}</div>
        ${s.html}
        ${s.src ? `<p class="src">${s.src}</p>` : ''}
      </div></section>`).join('');
  const sections = $$('.step');

  // full text + footer
  const ft = document.createElement('section'); ft.className = 'fulltext'; ft.id = 'fulltext';
  ft.innerHTML = `<div class="ft-in"><details id="ftd"><summary><span>Read the full chapter text</span><small>Every paragraph, event and table from the original chapter</small></summary><div class="ft-body">${cfg.fullText ? cfg.fullText() : ''}${tailHTML(cfg.key)}</div>
    <p class="ft-orig"><a href="original/${cfg.key}.html">Open the original dark-theme explorer for this chapter →</a></p></details>
    ${cfg.after || ''}
    <div class="chfoot">${idx > 0 ? `<a class="btn ghost" href="${CHAPTERS[idx - 1].href}">← ${CHAPTERS[idx - 1].roman} ${CHAPTERS[idx - 1].name}</a>` : ''}
      ${nxt ? `<a class="btn" href="${nxt.href}">Next: ${nxt.roman} ${nxt.name} →</a>` : ''}<a class="btn ghost" href="../index.html">↑ Back to the map</a></div></div>`;
  document.body.appendChild(ft);
  // open the full text when navigating to something inside it
  if (location.hash && ft.querySelector(location.hash)) { $('#ftd').open = true; setTimeout(() => ft.querySelector(location.hash).scrollIntoView(), 80); }

  // 3D
  let scene = null;
  if (gl) { try { scene = cfg.build($('#scene')); } catch (e) { console.warn('3D scene failed', e); scene = null; } }
  if (!scene) { root.classList.add('nogl'); scene = NOOP; }
  window.__scene = scene;

  const ctx = { scene, reduced, isMobile, $, $$, esc, sections, gl: !!scene && scene !== NOOP, get cur() { return cur; }, go: i => sections[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: isMobile() ? 'start' : 'center' }) };
  cfg.steps.forEach((s, i) => s.init && s.init($('.card', sections[i]), ctx, i));
  cfg.init && cfg.init(ctx);

  // rail
  const rail = $('#rail');
  cfg.steps.forEach((s, i) => { const b = document.createElement('button'); b.innerHTML = `<span>${esc(s.rail || s.kicker || 'Intro')}</span>`; b.setAttribute('aria-label', `Go to step: ${s.rail || s.kicker || 'Intro'}`); b.onclick = () => ctx.go(i); rail.appendChild(b); });

  let cur = -1;
  function enter(i) {
    if (i === cur) return; cur = i;
    sections.forEach((s, j) => s.classList.toggle('on', j === i));
    $$('button', rail).forEach((b, j) => j === i ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'));
    $('#info').classList.remove('on');
    cfg.steps[i].enter && cfg.steps[i].enter(ctx, i);
  }
  function activeStep() {
    const probe = isMobile() ? innerHeight * .46 + (innerHeight * .54) * .3 : innerHeight * .5;
    let best = 0, bd = 1e9;
    sections.forEach((s, i) => { const r = s.getBoundingClientRect(); const d = r.top <= probe && r.bottom >= probe ? 0 : Math.min(Math.abs(r.top - probe), Math.abs(r.bottom - probe)); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { ticking = false; const h = document.documentElement; const endOfSteps = stepsEl.getBoundingClientRect().bottom;
      enter(activeStep()); $('#prog').style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, h.scrollHeight - innerHeight)).toFixed(3)})`;
      $('#stage').style.visibility = endOfSteps < 40 ? 'hidden' : ''; });
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll);
  $('#resetView').onclick = () => { $('#info').classList.remove('on'); cfg.resetView ? cfg.resetView(ctx) : scene.reset && scene.reset(); };
  setTimeout(() => { cur = -1; enter(activeStep()); onScroll(); }, 60);
  window.__go = i => sections[i].scrollIntoView({ block: isMobile() ? 'start' : 'center' });
  window.__ready = true;
  return ctx;
}

/* tiny UI helpers shared by chapter widgets */
export function segmented(el, items, onPick, { label = 'Options', cls = 'pill', start = 0 } = {}) {
  el.setAttribute('role', 'group'); el.setAttribute('aria-label', label); el.innerHTML = '';
  const btns = items.map((it, i) => { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.innerHTML = it; b.setAttribute('aria-pressed', i === start); b.onclick = () => { btns.forEach(x => x.setAttribute('aria-pressed', x === b)); onPick(i); }; el.appendChild(b); return b; });
  return { btns, set(i) { btns.forEach((x, j) => x.setAttribute('aria-pressed', j === i)); } };
}
export function quiz(card, qs, { onShow, onAnswer, done } = {}) {
  let qi = 0, score = 0, answered = false;
  const $q = s => card.querySelector(s);
  function show() {
    if (qi >= qs.length) { $q('[data-qn]').textContent = 'Done'; $q('[data-qq]').textContent = `You got ${score} of ${qs.length}.`; $q('[data-qopts]').innerHTML = ''; $q('[data-qfb]').innerHTML = done ? done(score, qs.length) : ''; $q('[data-qnext]').hidden = true; $q('[data-qagain]').hidden = false; onShow && onShow(null); return; }
    const Q = qs[qi]; answered = false; $q('[data-qn]').textContent = `Q${qi + 1} of ${qs.length}`; $q('[data-qq]').innerHTML = Q.q; $q('[data-qfb]').textContent = ''; $q('[data-qnext]').hidden = true; $q('[data-qagain]').hidden = true;
    const wrap = $q('[data-qopts]'); wrap.innerHTML = '';
    Q.o.forEach(([t, ok], oi) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = () => {
      if (answered) return; answered = true; [...wrap.children].forEach(x => x.disabled = true);
      b.classList.add(ok ? 'good' : 'bad'); b.textContent = (ok ? '✓ ' : '✕ ') + t;
      if (!ok) { const g = wrap.children[Q.o.findIndex(x => x[1])]; g.classList.add('good'); g.textContent = '✓ ' + g.textContent; }
      if (ok) score++; $q('[data-qfb]').innerHTML = `<b class="${ok ? 'g' : 'b'}">${ok ? 'Right.' : 'Not quite.'}</b> ${Q.why}`;
      onAnswer && onAnswer(Q, oi, ok); $q('[data-qnext]').hidden = false; $q('[data-qnext]').textContent = qi === qs.length - 1 ? 'See result →' : 'Next →'; $q('[data-qnext]').focus({ preventScroll: true });
    }; wrap.appendChild(b); });
    onShow && onShow(Q);
  }
  $q('[data-qnext]').onclick = () => { qi++; show(); }; $q('[data-qagain]').onclick = () => { qi = 0; score = 0; show(); };
  show(); return { show };
}
export const quizHTML = (title = 'What did you pick up?') => `<h2>${title}</h2><p data-qq class="lede" style="color:var(--ink)"></p><div class="q-opts" data-qopts></div><p class="fb" data-qfb aria-live="polite"></p><div class="row"><button class="btn" data-qnext type="button" hidden>Next →</button><button class="btn ghost" data-qagain type="button" hidden>↺ Try again</button></div>`;
