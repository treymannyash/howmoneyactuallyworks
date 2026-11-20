import { createEconomy, ekey } from '../lib/economy.js';
import { flowColor, legendEl } from '../lib/flows.js';
import { EX, NM, EDGES, SC } from '../lib/data.js';
import { THEMES, hueOf } from '../lib/clay.js';
import { shockFrames, SHOCK_ORDER } from '../lib/shock.js';
import { mountChapter, quiz, quizHTML, NOOP, $, $$, esc } from '../lib/kit.js';
import { MSTEPS } from './machine-steps.js';

const T = THEMES.A;
const E = (a, b) => ekey(a, b);
let eco = NOOP, reducedMode = false, cur = -1;
const NAV = [null, ['households', 'firms'], ['households', 'banks', 'firms', 'consumers_credit'], ['fed', 'banks', 'households', 'firms', 'consumers_credit'], ['treasury', 'banks', 'foreign', 'government', 'households'], ['fed', 'repo', 'moneymkt', 'banks', 'treasury', 'firms']];
const STEPS = [
  { nodes: null, edges: null, auto: true },
  { nodes: NAV[1], edges: ['households_firms', 'firms_households'] },
  { nodes: NAV[2], edges: ['households_banks', 'banks_firms', 'banks_households', 'banks_consumers_credit', 'consumers_credit_households'] },
  { nodes: NAV[3], edges: ['fed_banks', 'banks_firms', 'banks_households', 'banks_consumers_credit', 'consumers_credit_households', 'households_firms'] },
  { nodes: NAV[4], edges: ['treasury_banks', 'banks_treasury', 'foreign_treasury', 'treasury_government', 'government_households'] },
  { nodes: NAV[5], edges: ['fed_repo', 'repo_banks', 'repo_moneymkt', 'moneymkt_banks', 'fed_treasury', 'moneymkt_firms'] },
  { nodes: null, edges: null }, { nodes: null, edges: null },
];
let selPipe = {}, drain = 0, rate = 50, sIdx = -1, sKey = 'bank', frames = shockFrames('bank'), timer = null, inspecting = false, anim = null;

const pc = key => { const e = EDGES.find(e => ekey(e.from, e.to) === key); return e ? flowColor(e.from, e.to) : '#6C95FF'; };
function renderPipe(card, key) {
  const x = EX[key]; const box = $('[data-read]', card);
  box.style.setProperty('--pc', pc(key));
  box.innerHTML = `<div class="tag">${x.tag}</div><h3>${x.title}</h3><p>${x.plain}</p><details class="why"><summary>Why it matters</summary><p>${x.why}</p></details>`;
}
function applyFocus(i) { const s = STEPS[i]; if (!s || !s.nodes) { eco.clearFocus(); return; } eco.setFocus(s.nodes, s.edges, selPipe[i] || null); }
function applyWidgets(i) {
  eco.setBank(i === 2 ? 1 - drain / 100 : 1); eco.setRate(i === 3 ? rate / 100 : .5);
  if (i === 6) showShock(); else eco.setShock({}, {});
}
function inspect(p) {
  const info = $('#info'); inspecting = true;
  if (p.type === 'node') {
    const n = NM[p.key]; const nbr = EDGES.filter(e => e.from === p.key || e.to === p.key);
    info.innerHTML = `<button aria-label="Close" type="button">×</button><h4>${n.label}</h4><div>${n.plain}</div><div class="stat">${n.stat}</div>`;
    eco.setFocus([p.key, ...new Set(nbr.flatMap(e => [e.from, e.to]))], nbr.map(e => E(e.from, e.to)));
  } else {
    const x = EX[p.key]; const e = EDGES.find(e => E(e.from, e.to) === p.key);
    info.innerHTML = `<button aria-label="Close" type="button">×</button><h4>${x.tag}</h4><div><b>${x.title}</b></div><div style="margin-top:6px">${x.plain}</div>`;
    eco.setFocus([e.from, e.to], [p.key], p.key);
  }
  info.classList.add('on'); $('button', info).onclick = closeInfo;
}
function closeInfo() { $('#info').classList.remove('on'); inspecting = false; applyFocus(cur); }
function drainText(v) {
  if (v === 0) return 'Calm. Deposits flow in and the bank lends them out — the pipes are full.';
  if (v < 35) return 'Some depositors leave. The deposit tank drops and the lending pipes start to thin.';
  if (v < 70) return 'Deposit flight: money is flowing back out of the bank, and the loan pipes are running low.';
  return '“Without deposits, banks can’t lend, and the entire credit system seizes — within days.”';
}
function setDrain(v) {
  drain = v; $('#drain').value = v; $('#drainOut').textContent = v + '%'; $('#drainRead').textContent = drainText(v);
  const cap = Math.pow(1 - v / 100, 1.25); $('#capBar').style.width = Math.max(3, cap * 100) + '%';
  $('#capBar').style.background = cap > .66 ? 'var(--good)' : cap > .33 ? '#B07A00' : 'var(--bad)';
  $('#capOut').textContent = cap > .8 ? 'full' : cap > .5 ? 'reduced' : cap > .2 ? 'low' : 'almost none';
  if (cur === 2) eco.setBank(1 - v / 100);
}
function setRate(v) {
  rate = v; const u = v / 100;
  $('#rateOut').textContent = u < .3 ? 'low' : u > .7 ? 'high' : 'middle';
  const pct = Math.max(12, Math.min(100, Math.round((1 - .9 * (u - .5)) / 1.45 * 100)));
  $('#credBar').style.width = pct + '%'; $('#credBar').style.background = u < .66 ? 'var(--good)' : 'var(--bad)';
  $('#credOut').textContent = u < .3 ? 'wide open' : u > .7 ? 'squeezed' : 'normal';
  $('#rateRead').innerHTML = u < .3 ? 'Borrowing gets cheaper: the loan pipes open wider and money moves more freely. <i>“The Fed cutting too fast can reignite inflation (the 1970s).”</i>'
    : u > .7 ? 'Borrowing gets more expensive everywhere: loan pipes narrow and spending slows. <i>“This is the most direct channel through which Fed rate hikes slow the economy.”</i>'
    : '<i>“There is no neutral position — every rate decision has winners and losers across the entire economy.”</i>';
  if (cur === 3) eco.setRate(u);
}
function showShock() {
  const box = $('#sbox'), tiles = $('#tiles');
  $$('#sdots i').forEach((d, i) => d.classList.toggle('on', i <= sIdx));
  if (sIdx < 0) { eco.setShock({}, {}); eco.setBank(1); box.dataset.t = 'idle'; box.innerHTML = `<span class="bd">Ready</span><h3>${SC[sKey].name}</h3><p>Press Start, or step through manually. Stressed chambers glow and pulse; pipes thin and the flow drains.</p>`; tiles.hidden = true; return; }
  const f = frames[sIdx]; eco.setShock(f.nodes, f.edges); eco.setBank(f.bank);
  const lab = { warn: 'Warning', stress: 'Stress', broken: 'Broken' }[f.step.t];
  box.dataset.t = f.step.t; box.innerHTML = `<span class="bd">Step ${sIdx + 1}/6 · ${lab}</span><h3>${f.step.l}</h3><p>${f.step.b}</p>`;
  if (sIdx === 5) { const m = SC[sKey].macros; tiles.hidden = false; tiles.innerHTML = [['GDP', m.gdp], ['Unemp.', m.unemp], ['CPI', m.cpi], ['VIX', m.vix]].map(([a, b]) => `<div><b>${b}</b><span>${a}</span></div>`).join(''); } else tiles.hidden = true;
}
function nextShock(auto) { if (sIdx < 5) { sIdx++; showShock(); } if (auto && sIdx < 5) timer = setTimeout(() => nextShock(true), 3000); else { timer = null; $('#sgo').textContent = sIdx >= 5 ? '↺ Replay' : '▶ Start'; } }

const QS = [
  { q: 'In the Bank Run / SVB-type shock, how does the bank pay out the withdrawals?', o: [['Sells its bond holdings — even at a loss', 1], ['Prints new money', 0], ['Asks every borrower to repay overnight', 0]],
    why: '“To pay withdrawals, banks sell bond holdings — at depressed prices due to rate rises. SVB became insolvent exactly this way.”', focus: { nodes: ['banks', 'treasury'], edges: ['banks_treasury'], sel: 'banks_treasury' } },
  { q: 'Which pipe does the site call “the most direct channel through which Fed rate hikes slow the economy”?', o: [['Foreign Demand', 0], ['Consumer Loans — banks lending to you', 1], ['Wages & Income', 0]],
    why: 'Consumer loans: “When interest rates spike (as in 2022-2024), mortgages become unaffordable, car loans get expensive, and consumer spending on big-ticket items collapses.”', focus: { nodes: ['banks', 'households', 'fed'], edges: ['banks_households', 'fed_banks'], sel: 'banks_households' } },
  { q: 'In the repo market, what do banks hand over as collateral to borrow cash overnight?', o: [['Gold bars', 0], ['Stock certificates', 0], ['Treasury bonds', 1]],
    why: '“Repo is where banks borrow cash overnight by handing over Treasury bonds as collateral — like pawning your watch for one day.”', focus: { nodes: ['repo', 'banks', 'treasury'], edges: ['repo_banks'], sel: 'repo_banks' } },
];

function fullText() {
  const nodes = Object.entries(NM).map(([k, n]) => `<article class="ft-item" id="ft-node-${k}"><h4>${n.label}</h4><p>${n.plain}</p><p class="ft-meta">${n.desc} · ${n.stat}</p></article>`).join('');
  const pipes = EDGES.map(e => { const x = EX[E(e.from, e.to)]; return `<article class="ft-item" id="ft-pipe-${E(e.from, e.to)}" style="--pc:${pc(E(e.from, e.to))}"><div class="tag">${x.tag}</div><h4>${x.title}</h4><p>${x.plain}</p>${x.detail ? `<p>${x.detail}</p>` : ''}<p class="ft-why"><b>Why it matters:</b> ${x.why}</p></article>`; }).join('');
  const shocks = SHOCK_ORDER.map(k => { const s = SC[k]; return `<article class="ft-item"><h4>${s.name} <small>${s.badge}</small></h4><ol>${s.steps.map(st => `<li><b>${st.l}.</b> ${st.b}</li>`).join('')}</ol><p class="ft-meta">GDP ${s.macros.gdp} · Unemployment ${s.macros.unemp} · CPI ${s.macros.cpi} · VIX ${s.macros.vix}</p></article>`; }).join('');
  return `<h3>The 12 chambers</h3><div class="ft-grid">${nodes}</div><h3>The 27 pipes</h3><div class="ft-grid">${pipes}</div><h3>The 6 shock scenarios</h3><div class="ft-grid">${shocks}</div>`;
}

const stepCfg = MSTEPS.map((s, i) => ({ ...s, rail: ['Intro', 'The loop', 'Banks', 'The Fed', 'Treasury', 'Overnight', 'Shock lab', 'Check'][i],
  html: i === 7 ? '<p class="mono" data-qn></p>' + quizHTML('What did you pick up?') : s.html,
  src: i === 7 ? 'Questions are new. Every answer and explanation is taken from the site\'s own Chapter II text.' : s.src,
  init: (card) => {
    const wrap = $('.pills[data-pipes]', card);
    if (wrap) { const keys = wrap.dataset.pipes.split(','); keys.forEach((k, j) => {
      const b = document.createElement('button'); b.className = 'pill'; b.type = 'button'; b.style.setProperty('--pc', pc(k)); b.innerHTML = `<i></i>${EX[k].tag}`; b.setAttribute('aria-pressed', j === 0);
      b.onclick = () => { selPipe[i] = k; $$('.pill', wrap).forEach(x => x.setAttribute('aria-pressed', x === b)); renderPipe(card, k); applyFocus(i); }; wrap.appendChild(b); }); selPipe[i] = keys[0]; renderPipe(card, keys[0]); }
  },
  enter: (ctx, i) => {
    cur = i; inspecting = false; clearTimeout(timer); timer = null; const g = $('#sgo'); if (g) g.textContent = '▶ Start';
    eco.autoRotate(!!STEPS[i].auto); applyWidgets(i); applyFocus(i); if (i === 7) showQ(); eco.flyTo(STEPS[i].nodes);
  } }));

let showQ = () => {};
mountChapter({
  key: 'machine', steps: stepCfg, fullText,
  build: el => createEconomy(el, { theme: 'A', reduced: matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('rm') === '1', shiftRight: true, shiftX: .19, shiftScale: .72, autoRotate: true, onPick: p => inspect(p) }),
  resetView: () => { closeInfo(); eco.flyTo(STEPS[Math.max(0, cur)].nodes); },
  init: ctx => {
    eco = ctx.scene; reducedMode = ctx.reduced; $('#stage').appendChild(legendEl());
    const drainEl = $('#drain'); drainEl.addEventListener('input', () => setDrain(+drainEl.value)); setDrain(0);
    $('#panic').onclick = () => {
      cancelAnimationFrame(anim); if (reducedMode) { setDrain(100); return; }
      const from = drain, t0 = performance.now(), D = 3200 * (1 - from / 100) + 400;
      const f = t => { const u = Math.min(1, (t - t0) / D); setDrain(Math.round(from + (100 - from) * u * u)); if (u < 1) anim = requestAnimationFrame(f); }; anim = requestAnimationFrame(f);
    };
    $('#calm').onclick = () => { cancelAnimationFrame(anim); setDrain(0); };
    const rateEl = $('#rate'); rateEl.addEventListener('input', () => setRate(+rateEl.value)); setRate(50);
    const scen = $('#scen');
    SHOCK_ORDER.forEach(k => { const b = document.createElement('button'); b.className = 'pill'; b.type = 'button'; b.dataset.k = k; b.setAttribute('aria-pressed', k === sKey); b.innerHTML = `${SC[k].name}<small>${SC[k].badge}</small>`;
      b.onclick = () => { sKey = k; frames = shockFrames(k); sIdx = -1; clearTimeout(timer); timer = null; $$('.pill', scen).forEach(x => x.setAttribute('aria-pressed', x === b)); showShock(); }; scen.appendChild(b); });
    $('#sdots').innerHTML = '<i></i>'.repeat(6);
    $('#sgo').onclick = () => { if (timer) { clearTimeout(timer); timer = null; $('#sgo').textContent = '▶ Resume'; return; } if (sIdx >= 5) { sIdx = -1; showShock(); } $('#sgo').textContent = '❚❚ Pause'; if (reducedMode) { nextShock(false); $('#sgo').textContent = '▶ Next'; } else nextShock(true); };
    $('#snext').onclick = () => { clearTimeout(timer); timer = null; $('#sgo').textContent = '▶ Resume'; nextShock(false); $('#sgo').textContent = sIdx >= 5 ? '↺ Replay' : '▶ Resume'; };
    $('#sreset').onclick = () => { clearTimeout(timer); timer = null; sIdx = -1; $('#sgo').textContent = '▶ Start'; showShock(); };
    const qz = quiz($('#s-quiz .card'), QS, {
      onShow: Q => { if (!Q) { eco.clearFocus(); eco.flyTo(null); } else { eco.clearFocus(); eco.flyTo(null); } },
      onAnswer: Q => { eco.setFocus(Q.focus.nodes, Q.focus.edges, Q.focus.sel); eco.flyTo(Q.focus.nodes); },
      done: (s, n) => s === n ? '<b class="g">Nicely done — you can read the machine.</b> Next up: what the plumbing does in a crisis.' : 'Scroll back up and tap the pipes — then try again.' });
    showQ = () => qz.show();
    addEventListener('keydown', e => { if (e.key === 'Escape' && inspecting) closeInfo(); });
  },
});
