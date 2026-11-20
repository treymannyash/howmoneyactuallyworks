// "Phrase X-Ray": nine slogans as clay speech bubbles that crack open to show the real-driver chain from the site's own text.
import { createStage, THREE, clayMesh, smoothTo, lighten, darken, rrect, mute } from './lib/stage3d.js';
import { NUGGETS } from './content/site-data.js';

const HUES = ['#F7931A', '#EBA82E', '#E5586A', '#4C8DFF', '#A78BFA', '#2FBFB0', '#2FBF8A', '#EBA82E', '#34D1E6'];
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const parse = n => { const m = n.body.match(/<div class="mech">([\s\S]*?)<\/div>/); const b = m && m[1].match(/<b>([\s\S]*?)<\/b>/); const chain = b ? b[1].split(/\s*→\s*|\s+—\s+/).map(s => s.replace(/\.$/, '')) : []; return { chain, mech: m ? m[0] : '' }; };

export function createXray(stageEl, panel, listEl, { gl, reduced }) {
  const items = NUGGETS.map(n => ({ ...n, ...parse(n) }));
  let sel = 0, cap = 0, st = null, setSel = () => {};
  const mobile = innerWidth < 720;
  listEl.innerHTML = items.map((n, i) => `<button type="button" class="pill" aria-pressed="${i === 0}" data-i="${i}"><b>${esc(n.badge)}</b>${n.phrase}</button>`).join('');
  const caps = `<div class="widget cap-widget" id="capW" hidden><label for="capR"><span>Rent cap</span><output id="capOut">none</output></label><input type="range" id="capR" min="0" max="100" value="0" aria-describedby="capRead"><div class="ends"><span>no cap</span><span>tight cap</span></div><p class="readout" id="capRead" aria-live="polite" style="min-height:0"></p><p class="src" style="margin-top:6px">Illustrative — shows the direction described in the text below, not a forecast.</p></div>`;
  function renderPanel() {
    const n = items[sel]; panel.innerHTML = `<span class="badge">${esc(n.badge)}</span><h3>${n.phrase}</h3><div class="hint">What’s underneath</div><div class="chain-flow">${n.chain.map((c, i) => `${i ? '<i>→</i>' : ''}<span>${esc(c)}</span>`).join('')}</div>${sel === 0 ? caps : ''}<div class="body">${n.body}</div>`;
    if (sel === 0) { const w = panel.querySelector('#capW'); w.hidden = false; const r = panel.querySelector('#capR'); r.value = cap; const upd = () => { cap = +r.value; panel.querySelector('#capOut').textContent = cap < 5 ? 'none' : cap < 40 ? 'loose' : cap < 75 ? 'tight' : 'very tight'; panel.querySelector('#capRead').innerHTML = cap < 5 ? 'No cap: the block keeps being built and kept up.' : cap < 50 ? 'Fewer people want to build or maintain rental housing — <b>supply shrinks</b>.' : 'Supply shrinks further, and a queue forms: the apartments that remain go to <b>whoever has the best connections or luck</b>.'; st && st.markDirty(); }; r.addEventListener('input', upd); upd(); }
  }
  function select(i) { sel = i; listEl.querySelectorAll('.pill').forEach((b, j) => b.setAttribute('aria-pressed', j === i)); renderPanel(); setSel(i); }
  listEl.querySelectorAll('.pill').forEach(b => b.onclick = () => select(+b.dataset.i));
  renderPanel();
  if (!gl) { stageEl.style.display = 'none'; document.querySelector('.xray').style.gridTemplateColumns = '1fr'; return; }
  st = createStage(stageEl, { tray: { w: 17, d: 12, r: 2, z: .9 }, polar: [.3, 1.0], azimuth: [-.55, .55], zoom: false, minDist: 9, maxDist: 40, label: 'Nine speech bubbles, one per common slogan. Select one to crack it open and see the mechanism underneath. The same list is below as buttons.' });
  if (!st) { stageEl.style.display = 'none'; document.querySelector('.xray').style.gridTemplateColumns = '1fr'; return; }
  const bright = h => '#' + new THREE.Color(h).lerp(new THREE.Color('#ffffff'), .38).getHexString();
  const plain = s => s.replace(/<[^>]+>/g, '');
  const wrap = (ctx, text, maxW) => { const words = text.split(' '); const lines = []; let line = ''; words.forEach(w => { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }); lines.push(line); return lines; };
  const paint = (cv, n, hex, idx) => { const c = cv.getContext('2d'); c.clearRect(0, 0, 1024, 512); c.fillStyle = '#12151A'; c.fillRect(0, 0, 1024, 512);
    c.fillStyle = bright(hex); c.fillRect(0, 0, 1024, 14); c.fillRect(0, 498, 1024, 14);
    c.fillStyle = bright(hex); c.font = '600 30px "JetBrains Mono", monospace'; c.textBaseline = 'top'; c.fillText(String(idx + 1).padStart(2, '0') + ' / 09', 60, 50);
    c.fillStyle = '#F2F4F6'; let fs = 104; c.font = `600 ${fs}px Inter, system-ui, sans-serif`; let lines = wrap(c, n.badge, 880); while (lines.length > 2 && fs > 56) { fs -= 8; c.font = `600 ${fs}px Inter, system-ui, sans-serif`; lines = wrap(c, n.badge, 880); }
    lines.forEach((l, k) => c.fillText(l, 60, 130 + k * (fs * 1.15))); };
  const hit = [];
  const bubbles = items.map((n, i) => {
    const g = new THREE.Group(); const col = i % 3, row = Math.floor(i / 3); g.position.set(-4.2 + col * 4.2, 2.7 + (2 - row) * 2.05, -3.2); st.root.add(g);
    const hex = HUES[i]; const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 512; paint(cv, n, hex, i);
    const half = (dx, side) => { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(1.9, 1.7, .1), { depth: .5, bevelEnabled: true, bevelThickness: .03, bevelSize: .03, bevelSegments: 1, curveSegments: 4 }), st.mats.clay(hex)); m.position.set(dx, 0, 0); m.castShadow = m.receiveShadow = true; g.add(m);
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.repeat.set(.5, 1); tex.offset.set(side * .5, 0);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.7 * .9), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); f.position.set(0, 0, .6); m.add(f); m.userData = { i, tex, cv }; hit.push(m); return m; };
    const L = half(-.96, 0), R = half(.96, 1); clayMesh(st, new THREE.ConeGeometry(.3, .6, 4), hex, { x: -1.1, y: -1.1, z: .2, rz: Math.PI, parent: g });
    g.userData = { L, R, u: 0, cv, n, hex }; return g;
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { bubbles.forEach(g => { paint(g.userData.cv, g.userData.n, g.userData.hex, bubbles.indexOf(g)); g.userData.L.userData.tex.needsUpdate = true; g.userData.R.userData.tex.needsUpdate = true; }); st.markDirty(); });
  const ray = new THREE.Raycaster(), mp = new THREE.Vector2(); let down = null;
  st.canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  st.canvas.addEventListener('pointerup', e => { if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; const r = st.canvas.getBoundingClientRect(); mp.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(mp, st.camera); const h = ray.intersectObjects(hit, false)[0]; if (h) select(h.object.userData.i); });
  st.canvas.style.cursor = 'pointer';
  const chain = new THREE.Group(); st.root.add(chain); const nodes = [], nlabs = [], links = [];
  for (let k = 0; k < 4; k++) { const m = clayMesh(st, new THREE.SphereGeometry(.55, 24, 16), '#4C8DFF', { y: .7, parent: chain }); const lab = st.addLabel(() => new THREE.Vector3(m.position.x, 1.45, m.position.z), '', { cls: 'chn', anchor: mobile ? 'below' : 'above' }); nodes.push(m); nlabs.push(lab); if (k) { const c = clayMesh(st, new THREE.CylinderGeometry(.09, .09, 1, 10), '#8A939D', { y: .7, parent: chain }); links.push(c); } }
  chain.position.z = 2.3;
  const apt = new THREE.Group(); apt.position.z = 4.6; st.root.add(apt); const apts = [];
  for (let k = 0; k < 6; k++) { const g = new THREE.Group(); g.position.x = -4 + k * 1.6; apt.add(g); const b = clayMesh(st, new THREE.BoxGeometry(1.1, 1, 1.1), ['#C9CED4', '#D5D9DE', '#BCC2C9'][k % 3], { y: .5, parent: g }); clayMesh(st, new THREE.BoxGeometry(1.25, .16, 1.25), '#4C8DFF', { y: 1.08, parent: b, cast: false }).scale.set(1, 1, 1); g.userData = { b }; apts.push(g); }
  const people = []; for (let k = 0; k < 8; k++) { const p = new THREE.Group(); clayMesh(st, new THREE.CylinderGeometry(.2, .2, .5, 16), '#EBA82E', { y: .25, parent: p }); clayMesh(st, new THREE.CylinderGeometry(.2, .2, .08, 16), '#F2F4F6', { y: .54, parent: p }); p.position.set(5.2, 0, 1.0 - k * .45); p.userData = { u: 0 }; apt.add(p); people.push(p); }
  const aLab1 = st.addLabel(() => new THREE.Vector3(-4, 2.3, 4.6), '<b>Rental homes</b>', { cls: 'tw', anchor: 'above' }), aLab2 = st.addLabel(() => new THREE.Vector3(5.2, 1.2, 4.6), '<b>Waiting list</b>', { cls: 'tw', anchor: 'above' });
  const tok = new THREE.Mesh(new THREE.SphereGeometry(.2, 14, 10), new THREE.MeshStandardMaterial({ color: '#F2F4F6', emissive: '#4C8DFF', emissiveIntensity: .7 })); chain.add(tok);
  setSel = () => { st.markDirty(); };
  st.onFrame((dt, t, k) => {
    let mv = false; const n = items[sel], cnt = n.chain.length;
    bubbles.forEach((g, i) => { const u = g.userData, on = i === sel; if (smoothTo(u, 'u', on ? 1 : 0, k)) mv = true; u.L.position.x = -.96 - u.u * .3; u.R.position.x = .96 + u.u * .3; u.L.rotation.y = -u.u * .22; u.R.rotation.y = u.u * .22; g.position.z = -3.2 + u.u * 1.1; g.scale.setScalar(1 + u.u * .06); if (!reduced) mv = true; });
    nodes.forEach((m, j) => { const on = j < cnt; const x = (j - (cnt - 1) / 2) * 3.9; m.position.x = x; const tg = on ? 1 : 0; if (smoothTo(m.userData, 's', tg, k)) mv = true; m.scale.setScalar(Math.max(.001, m.userData.s ?? 0)); m.material.color.set(HUES[sel]).lerp(new THREE.Color('#B93B4A'), j / Math.max(1, cnt - 1) * .55); m.visible = (m.userData.s ?? 0) > .02; nlabs[j].el.hidden = !on; if (on && nlabs[j].el.dataset.t !== n.chain[j]) { nlabs[j].el.textContent = n.chain[j]; nlabs[j].el.dataset.t = n.chain[j]; } });
    links.forEach((c, j) => { const on = j < cnt - 1; c.visible = on; if (on) { const a = nodes[j].position.x, b = nodes[j + 1].position.x; c.scale.y = Math.abs(b - a) - 1; c.position.x = (a + b) / 2; c.rotation.z = Math.PI / 2; } });
    const ph = reduced ? .9 : (t * .25) % 1; const seg = ph * Math.max(1, cnt - 1); const j0 = Math.min(Math.floor(seg), cnt - 2); tok.visible = cnt > 1; if (cnt > 1) { const a = nodes[j0].position.x, b = nodes[j0 + 1].position.x; tok.position.set(a + (b - a) * (seg - j0), .7 + .55 + Math.sin(t * 6) * .04, 0); if (!reduced) mv = true; }
    const showApt = sel === 0; apt.visible = showApt; aLab1.el.hidden = aLab2.el.hidden = !showApt;
    if (showApt) { const c = cap / 100; apts.forEach((g, j) => { const keep = Math.max(.12, 1 - c * (.45 + j * .1)); if (smoothTo(g.userData, 's', keep, k)) mv = true; g.scale.y = g.userData.s ?? 1; g.userData.b.parent.visible = true; }); people.forEach((p, j) => { const on = j < Math.round(c * 8) ? 1 : 0; if (smoothTo(p.userData, 'u', on, k)) mv = true; p.scale.setScalar(Math.max(.001, p.userData.u)); }); }
    return mv;
  });
  const fit = () => st.fit(new THREE.Vector3(0, 3.7, 1.0), mobile ? 7.8 : 7.0, 6.0, .42);
  st.options = {}; st.view(fit(), { instant: true });
  new ResizeObserver(() => { st.view(fit(), { instant: true }); }).observe(stageEl);
  return { select };
}
