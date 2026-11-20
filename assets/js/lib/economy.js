// The Machine as a 3D clay diorama: 12 chambers, 27 pipes (real data from the live site).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { NM, EDGES, POS, R } from './data.js';
import { THEMES, hueOf, Mats, makeChamber, lighten, darken, studio } from './clay.js';
import { declutter } from './declutter.js';
import { FLOW, NODE_FLOW, flowType, flowColor } from './flows.js';

const S = 58;                                   // 2D map units -> world units
const W = (p) => new THREE.Vector3((p.x - 450) / S, 0, (p.y - 340) / S);
export const ekey = (a, b) => `${a}_${b}`;
const CREDIT = new Set(['banks_firms', 'banks_households', 'banks_consumers_credit', 'consumers_credit_households']);
const SPEND = new Set(['households_firms', 'firms_households']);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function createEconomy(container, opts = {}) {
  const reduced = !!opts.reduced;
  const mobile = opts.mobile ?? (matchMedia('(pointer:coarse)').matches || innerWidth < 720);
  let T = THEMES[opts.theme || 'A'];

  /* ---------- renderer ---------- */
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { container.classList.add('no-webgl'); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.shadowMap.enabled = !mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Interactive 3D model of the economy: twelve chambers connected by twenty-seven pipes. Drag to rotate. The same information is in the text beside it.');
  canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:' + (mobile ? 'none' : 'none') + ';';
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.5, 200);
  const hemi = new THREE.HemisphereLight(T.sky, T.gnd, T.hemi);
  const sun = new THREE.DirectionalLight(T.sun, T.sunI);
  sun.position.set(-7, 14, 9); sun.castShadow = !mobile;
  sun.shadow.mapSize.set(mobile ? 512 : 2048, mobile ? 512 : 2048);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 10, bottom: -10, near: 2, far: 40 });
  sun.shadow.bias = -0.0004; sun.shadow.radius = 5;
  scene.add(hemi, sun); studio(renderer, scene, mobile, ['#6C95FF', '#34D1E6']);

  const root = new THREE.Group(); scene.add(root);
  const mats = new Mats(T);

  /* ---------- tray + zones ---------- */
  const rrect = (w, d, r) => { const s = new THREE.Shape(); const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2;
    s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
    s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); return s; };
  const trayMat = mats.clay(T.ground);
  const tray = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(16.2, 12.6, 1.6), { depth: .22, bevelEnabled: true, bevelThickness: .1, bevelSize: .12, bevelSegments: 3, curveSegments: 10 }), trayMat);
  tray.rotation.x = -Math.PI / 2; tray.position.set(0, -.32, .3); tray.receiveShadow = true; root.add(tray);
  const zoneMat = mats.clay(T.zone);
  const zones = [[392, 20, 804, 278], [300, 498, 650, 596]];
  zones.forEach(([x0, y0, x1, y1]) => {
    const a = W({ x: x0, y: y0 }), b = W({ x: x1, y: y1 });
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(b.x - a.x, b.z - a.z, .7), { depth: .05, bevelEnabled: false, curveSegments: 8 }), zoneMat);
    m.rotation.x = -Math.PI / 2; m.position.set((a.x + b.x) / 2, .0, (a.z + b.z) / 2); m.receiveShadow = true; root.add(m);
  });
  // soft contact shadows on the tray come from the real shadow map; the tray catches them.

  /* ---------- chambers ---------- */
  const nodes = {};
  for (const key of Object.keys(NM)) {
    const start = mats.list.length;
    const pos = W(POS[key]);
    const pedR = R[key] / S * 1.18;
    const g = new THREE.Group(); g.position.copy(pos); root.add(g);
    const hue = FLOW[NODE_FLOW[key] || 'external'].c;
    const pedMat = mats.clay('#8A9097'), topMat = mats.clay('#C9CED4');
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(pedR, pedR * 1.07, .16, 32), pedMat); ped.position.y = .0; ped.castShadow = ped.receiveShadow = true; g.add(ped);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(pedR * .9, pedR * .9, .04, 32), topMat); top.position.y = .09; top.receiveShadow = true; g.add(top);
    const ill = makeChamber(key, hue, T, mats); ill.scale.setScalar(pedR / .55 * 1.12); ill.position.y = 0; g.add(ill);
    { const gm = new THREE.MeshBasicMaterial({ color: hue, transparent: true, opacity: .95 }); gm.userData.base = new THREE.Color(hue); mats.list.push(gm);
      const gr = new THREE.Mesh(new THREE.TorusGeometry(pedR * 1.04, .016, 6, 64), gm); gr.rotation.x = Math.PI / 2; gr.position.y = .1; g.add(gr);
      const gl = new THREE.Mesh(new THREE.CircleGeometry(pedR * 2.1, 40), new THREE.MeshBasicMaterial({ color: hue, transparent: true, opacity: .13, blending: THREE.AdditiveBlending, depthWrite: false })); gl.rotation.x = -Math.PI / 2; gl.position.y = -.05; g.add(gl); }
    const halo = new THREE.Mesh(new THREE.TorusGeometry(pedR * 1.32, .045, 8, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 }));
    halo.rotation.x = Math.PI / 2; halo.position.y = .1; g.add(halo);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(pedR * 1.15, .03, 8, 48), new THREE.MeshBasicMaterial({ color: T.ink, transparent: true, opacity: 0 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = .1; g.add(ring);
    g.traverse(o => { if (o.isMesh) o.userData.node = key; });
    nodes[key] = { key, g, pos, pedR, ill, halo, ring, pedMat, topMat, hue, mats: mats.list.slice(start), dim: 0, dimT: 0, state: 0, stateT: 0, stateName: null, focus: 0, focusT: 0 };
  }
  // deposit tank next to the bank
  const bn = nodes.banks;
  const tank = new THREE.Group(); tank.position.set(bn.pedR + .75, 0, -.05); bn.g.add(tank);
  const glassM = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transparent: true, opacity: .22, roughness: .12, metalness: 0, clearcoat: 1, envMapIntensity: 1.4 });
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .9, 24, 1, true), glassM); glass.position.y = .55; tank.add(glass);
  const tbase = new THREE.Mesh(new THREE.CylinderGeometry(.24, .26, .1, 24), mats.clay(T.cream)); tbase.position.y = .05; tbase.castShadow = true; tank.add(tbase);
  const liq = new THREE.Mesh(new THREE.CylinderGeometry(.165, .165, .86, 24), new THREE.MeshStandardMaterial({ color: '#34D1E6', emissive: '#34D1E6', emissiveIntensity: .7, roughness: .3 })); liq.geometry.translate(0, .43, 0); liq.position.y = .1; liq.castShadow = true; tank.add(liq);
  const tcap = new THREE.Mesh(new THREE.CylinderGeometry(.23, .23, .06, 24), mats.clay(T.cream)); tcap.position.y = 1.02; tank.add(tcap);

  /* ---------- pipes ---------- */
  const edges = [];
  const has = new Set(EDGES.map(e => ekey(e.from, e.to)));
  EDGES.forEach((E, i) => {
    const a = nodes[E.from], b = nodes[E.to];
    const dir = b.pos.clone().sub(a.pos).setY(0); const len = dir.length(); dir.normalize();
    const perp = new THREE.Vector3(-dir.z, 0, dir.x);
    const pair = has.has(ekey(E.to, E.from));
    const off = pair ? (E.from < E.to ? .11 : -.11) : 0;
    const p0 = a.pos.clone().addScaledVector(dir, a.pedR * .75).addScaledVector(perp, off); p0.y = .5 * 0 + .46;
    const p1 = b.pos.clone().addScaledVector(dir, -b.pedR * .75).addScaledVector(perp, off); p1.y = .46;
    const mid = p0.clone().lerp(p1, .5); mid.y = .46 + .34 + len * .085; mid.addScaledVector(perp, off * 1.5);
    const curve = new THREE.QuadraticBezierCurve3(p0, mid, p1);
    const rad = (.036 + E.w * .0095) * (E.d ? .9 : 1);
    const hue = flowColor(E.from, E.to);
    const mat = new THREE.MeshStandardMaterial({ color: hue, emissive: hue, emissiveIntensity: .55, roughness: .35, metalness: .5, transparent: true, opacity: T.pipeOpacity, depthWrite: false });
    mat.userData.base = new THREE.Color(hue);
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, rad, 8, false), mat);
    tube.renderOrder = 2; tube.userData.edge = ekey(E.from, E.to); root.add(tube);
    const pts = curve.getSpacedPoints(80);
    const e = { i, key: ekey(E.from, E.to), E, curve, pts, len, tube, mat, hue, base: E.d ? .55 : .8, f: .8, fT: .8, rev: 0, revT: 0, tint: 0, tintT: 0, tintName: 'warn', dim: 0, dimT: 0, hl: 0, hlT: 0, n: mobile ? 3 : (E.w >= 2 ? 6 : 5), rad };
    edges.push(e);
  });
  const edgeBy = Object.fromEntries(edges.map(e => [e.key, e]));
  const total = edges.reduce((s, e) => s + e.n, 0);
  const pMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(.058, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }), total);
  pMesh.castShadow = false; pMesh.frustumCulled = false; pMesh.renderOrder = 3; root.add(pMesh);
  const parts = []; let pi = 0;
  edges.forEach(e => { for (let k = 0; k < e.n; k++) parts.push({ e, k, idx: pi++, ph: (k / e.n) + (e.i * .137) % .2 }); });
  const tmpC = new THREE.Color();
  const setPartColors = () => parts.forEach(p => { tmpC.copy(p.e.mat.userData.base).lerp(new THREE.Color('#ffffff'), .35); pMesh.setColorAt(p.idx, tmpC); }); setPartColors();

  /* ---------- labels ---------- */
  const labelLayer = document.createElement('div'); labelLayer.className = 'eco-labels'; container.appendChild(labelLayer);
  const ICON = { warn: '!', stress: '▲', broken: '✕' };
  for (const k of Object.keys(nodes)) {
    const n = nodes[k]; const b = document.createElement('button');
    b.className = 'nlabel'; b.type = 'button'; b.dataset.k = k; b.style.setProperty('--nc', FLOW[NODE_FLOW[k] || 'external'].c);
    b.innerHTML = `<span class="nm">${NM[k].label}</span><span class="st" aria-hidden="true"></span>`;
    b.addEventListener('click', e => { e.stopPropagation(); opts.onPick && opts.onPick({ type: 'node', key: k }); });
    labelLayer.appendChild(b); n.label = b;
  }
  const tankE = { el: null, pri: 20 };
  const tankLabel = document.createElement('div'); tankLabel.className = 'nlabel tank'; tankLabel.innerHTML = '<span class="nm">Deposits</span>'; labelLayer.appendChild(tankLabel); tankE.el = tankLabel;
  const zoneLabels = [['THE OVERNIGHT PLUMBING', 596, 40], ['GOVERNMENT & DEBT', 475, 590]].map(([t, x, y]) => { const d = document.createElement('div'); d.className = 'zlabel'; d.textContent = t; d.dataset.x = x; d.dataset.y = y; labelLayer.appendChild(d); return d; });

  /* ---------- controls + camera ---------- */
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, { enableDamping: !reduced, dampingFactor: .09, enablePan: false, minDistance: 6, maxDistance: 44, minPolarAngle: .35, maxPolarAngle: 1.28, enableZoom: !mobile && opts.zoom !== false, rotateSpeed: .7, autoRotate: false, autoRotateSpeed: .55 });
  let dirty = true, tween = null, last = performance.now(), visible = true, size = { w: 1, h: 1 };
  controls.addEventListener('start', () => { tween = null; dirty = true; autoPause = performance.now() + 5000; });
  controls.addEventListener('change', () => { dirty = true; });
  let autoWanted = !!opts.autoRotate, autoPause = 0;

  const vf = () => THREE.MathUtils.degToRad(camera.fov);
  function viewFor(keys) {
    const list = (keys && keys.length ? keys : Object.keys(nodes)).map(k => nodes[k].pos);
    const c = new THREE.Vector3(); list.forEach(p => c.add(p)); c.divideScalar(list.length);
    let hw = 0, hd = 0; list.forEach(p => { hw = Math.max(hw, Math.abs(p.x - c.x)); hd = Math.max(hd, Math.abs(p.z - c.z)); });
    const full = !keys || !keys.length;
    hw += full ? 1.9 : 2.2; hd += full ? 1.6 : 1.8;
    const aspect = size.w / size.h, th = Math.tan(vf() / 2), pitch = .93;
    const shift = opts.shiftRight && !mobile ? (opts.shiftScale ?? .84) : 1;     // keep the scene clear of the text column
    let dist = Math.max(hw / (th * aspect * shift), (hd * Math.sin(pitch) + 1.1) / th) * 1.04;
    dist = full ? dist : Math.max(dist, 9.5);
    const target = c.clone(); target.y = .35;
    return { target, dist, pitch };
  }
  function goalPos(v) {
    const cur = camera.position.clone().sub(controls.target); const az = Math.atan2(cur.x, cur.z);
    return new THREE.Vector3(Math.sin(az) * Math.cos(v.pitch), Math.sin(v.pitch), Math.cos(az) * Math.cos(v.pitch)).multiplyScalar(v.dist).add(v.target);
  }
  function flyTo(keys, o = {}) {
    const v = viewFor(keys); const p = goalPos(v);
    if (reduced || o.instant) { camera.position.copy(p); controls.target.copy(v.target); controls.update(); tween = null; dirty = true; return; }
    tween = { p, t: v.target }; dirty = true;
  }
  function applyOffset() {
    if (opts.shiftRight && !mobile) camera.setViewOffset(size.w, size.h, -size.w * (opts.shiftX ?? .085), 0, size.w, size.h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function resize() {
    const r = container.getBoundingClientRect(); const w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
    if (w === size.w && h === size.h) return; size = { w, h };
    renderer.setSize(w, h, false); camera.aspect = w / h; applyOffset(); dirty = true;
    if (!tween && !userMoved) flyTo(lastKeys, { instant: true });
  }
  let userMoved = false, lastKeys = null;
  controls.addEventListener('start', () => { userMoved = true; });
  new ResizeObserver(resize).observe(container);
  size = { w: container.clientWidth || 800, h: container.clientHeight || 600 }; renderer.setSize(size.w, size.h, false); camera.aspect = size.w / size.h; applyOffset();
  // initial camera
  { const v = viewFor(null); camera.position.copy(goalPos({ ...v, pitch: v.pitch })).add(new THREE.Vector3(0, 0, 0.001)); controls.target.copy(v.target); camera.position.set(v.target.x + 0.0, v.target.y + Math.sin(v.pitch) * v.dist, v.target.z + Math.cos(v.pitch) * v.dist); controls.update(); }

  /* ---------- state ---------- */
  const st = { bank: 1, rate: .5, shock: { nodes: {}, edges: {} }, focusNodes: null, focusEdges: null, sel: null };
  let bankShown = 1;
  const SM = { warn: [.78, 1, 'warn'], stress: [.42, 2, 'stress'], broken: [.1, 3, 'broken'] };
  function recompute() {
    const rateF = clamp(1 - .9 * (st.rate - .5), .5, 1.45);
    const bankF = Math.pow(clamp(st.bank, 0, 1), 1.25);
    for (const e of edges) {
      let f = e.base, rev = 0;
      if (CREDIT.has(e.key)) f *= bankF * rateF;
      if (SPEND.has(e.key)) f *= clamp(1 - .32 * (st.rate - .5) * 2 * .5, .8, 1.2);
      if (e.key === 'households_banks' && st.bank < .97) { rev = 1; f = .22 + (1 - st.bank) * .75; }
      let tint = 0, tn = 'warn';
      const s = st.shock.edges[e.key];
      if (s) { f = Math.min(f, e.base * SM[s][0]); tint = SM[s][1] / 3; tn = SM[s][2]; }
      e.fT = clamp(f, 0, 1); e.revT = rev; e.tintT = tint; if (tint) e.tintName = tn;
    }
    for (const k in nodes) { const s = st.shock.nodes[k]; nodes[k].stateT = s ? SM[s][1] / 3 : 0; if (s) nodes[k].stateName = s; nodes[k].label.dataset.state = s || ''; nodes[k].label.querySelector('.st').textContent = s ? ICON[s] : ''; nodes[k].label.setAttribute('aria-label', NM[k].label + (s ? ' — ' + s : '')); }
    const fk = st.focusNodes, fe = st.focusEdges;
    const anyF = !!(fk || fe);
    for (const k in nodes) { const inF = !anyF || (fk && fk.includes(k)); nodes[k].dimT = inF ? 0 : 1; nodes[k].focusT = anyF && fk && fk.includes(k) ? 1 : 0; nodes[k].label.classList.toggle('dim', !inF); }
    for (const e of edges) { const inF = !anyF || (fe && fe.includes(e.key)); e.dimT = inF ? 0 : 1; e.hlT = anyF && fe && fe.includes(e.key) && (!st.sel || st.sel === e.key) ? 1 : 0; }
    dirty = true;
  }
  recompute();

  /* ---------- frame ---------- */
  const dummy = new THREE.Object3D(); const cA = new THREE.Color(), cB = new THREE.Color(), cG = new THREE.Color(T.ground);
  const v3 = new THREE.Vector3();
  let time = 0;
  function frame(now) {
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    const smooth = reduced ? 1 : 1 - Math.exp(-dt * 6);
    let moving = false;
    if (!reduced) time += dt;
    // camera tween
    if (tween) {
      const k = 1 - Math.exp(-dt * 2.6);
      camera.position.lerp(tween.p, k); controls.target.lerp(tween.t, k);
      if (camera.position.distanceTo(tween.p) < .02 && controls.target.distanceTo(tween.t) < .02) tween = null; moving = true;
    }
    controls.autoRotate = autoWanted && !reduced && !tween && now > autoPause;
    if (controls.autoRotate) moving = true;
    if (controls.update()) moving = true;
    // values
    const lerpv = (o, a, b) => { const d = o[b] - o[a]; if (Math.abs(d) > .002) { o[a] += d * smooth; moving = true; } else o[a] = o[b]; };
    for (const k in nodes) {
      const n = nodes[k]; lerpv(n, 'dim', 'dimT'); lerpv(n, 'state', 'stateT'); lerpv(n, 'focus', 'focusT');
      const sc = T.stress[n.stateName || 'warn']; cA.set(sc);
      const pulse = n.state > .01 && !reduced ? .55 + .45 * Math.sin(time * 5 + n.pos.x) : (n.state > .01 ? 1 : 0);
      for (const m of n.mats) {
        cB.copy(m.userData.base);
        if (m === n.pedMat || m === n.topMat) cB.lerp(cA, n.state * .65);
        cB.lerp(cG, n.dim * .62); m.color.copy(cB);
        if (m.emissive) { if (n.state > .01) { m.emissive.copy(cA); m.emissiveIntensity = n.state * pulse * .6; } else if (m.userData.emBase) { m.emissive.copy(m.userData.emBase); m.emissiveIntensity = m.userData.emI * (1 - n.dim * .8); } else m.emissiveIntensity = 0; }
      }
      n.halo.material.color.copy(cA); n.halo.material.opacity = n.state > .01 ? (.35 + .45 * pulse) * (1 - n.dim * .5) : 0;
      n.halo.scale.setScalar(1 + (reduced ? 0 : .06 * Math.sin(time * 4 + n.pos.z)) * n.state);
      n.ring.material.opacity = n.focus * .55;
      n.g.rotation.z = n.state > .6 && !reduced && n.stateName !== 'warn' ? Math.sin(time * 28 + n.pos.x) * .008 : 0;
      const u = n.ill.userData;
      if (!reduced) { u.spin.forEach(([o, s]) => o.rotation.y += dt * s); u.bob.forEach(([o, a]) => o.position.y = (o.userData.y0 ??= o.position.y) + Math.sin(time * 2 + n.pos.x) * a); }
    }
    // tank + dial
    lerpvTank();
    function lerpvTank() { const d = st.bank - bankShown; if (Math.abs(d) > .002) { bankShown += d * smooth; moving = true; } else bankShown = st.bank; liq.scale.y = Math.max(.02, bankShown); }
    nodes.fed.ill.userData.dial.rotation.z = THREE.MathUtils.lerp(Math.PI * .75, -Math.PI * .75, st.rate);
    // pipes
    for (const e of edges) {
      lerpv(e, 'f', 'fT'); lerpv(e, 'rev', 'revT'); lerpv(e, 'tint', 'tintT'); lerpv(e, 'dim', 'dimT'); lerpv(e, 'hl', 'hlT');
      cA.copy(e.mat.userData.base); if (e.tint > .01) cA.lerp(cB.set(T.stress[e.tintName]), e.tint * .85);
      cA.lerp(cG, e.dim * .55); e.mat.color.copy(cA); e.mat.emissive.copy(cA);
      e.mat.opacity = clamp(T.pipeOpacity * (1 - e.dim * .55) + e.hl * .28, .08, .95);
    }
    for (const p of parts) {
      const e = p.e; const vis = clamp(e.f * e.n - p.k, 0, 1) * (1 - e.dim * .6) * (1 + e.hl * .35);
      const sp = (.17 + .5 * e.f) / (e.len / 5.5);
      let t = reduced ? p.ph % 1 : Math.abs(p.ph + time * sp) % 1; if (e.rev > .5) t = 1 - t;
      const fi = t * 80, i0 = Math.min(79, fi | 0), fr = fi - i0; const a = e.pts[i0], b = e.pts[i0 + 1];
      v3.set(a.x + (b.x - a.x) * fr, a.y + (b.y - a.y) * fr, a.z + (b.z - a.z) * fr);
      dummy.position.copy(v3); dummy.scale.setScalar(Math.max(.001, vis) * (.75 + e.rad * 10) ); dummy.updateMatrix(); pMesh.setMatrixAt(p.idx, dummy.matrix);
    }
    pMesh.instanceMatrix.needsUpdate = true;
    // labels
    const hw = size.w / 2, hh = size.h / 2;
    const proj = (x, y, z) => { v3.set(x, y, z).project(camera); return [v3.x * hw + hw, -v3.y * hh + hh, v3.z]; };
    for (const k in nodes) { const n = nodes[k]; const [x, y] = proj(n.pos.x, 0, n.pos.z + n.pedR + .12); n.lbase = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,0)`; n.label.style.transform = n.lbase; }
    { const w = bn.g.localToWorld(tank.position.clone().add(new THREE.Vector3(0, -.02, .42))); const [x, y] = proj(w.x, w.y, w.z); tankE.base = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,0)`; tankLabel.style.transform = tankE.base; }
    zoneLabels.forEach(z => { const p = W({ x: +z.dataset.x, y: +z.dataset.y }); const [x, y] = proj(p.x, .02, p.z); z.__e = z.__e || { el: z, pri: 50 }; z.__e.base = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`; z.style.transform = z.__e.base; });
    { const ents = []; let pi = 0; for (const k in nodes) { const n = nodes[k]; n.__e = n.__e || { el: n.label }; n.__e.base = n.lbase; n.__e.pri = (n.label.classList.contains('sel') || n.label.matches(':hover') ? 0 : 1) + (pi++) / 100; ents.push(n.__e); } tankE.pri = 20; ents.push(tankE); zoneLabels.forEach(z => ents.push(z.__e)); declutter(container, ents); }
    if (!reduced || dirty || moving) { renderer.render(scene, camera); dirty = false; }
  }
  requestAnimationFrame(frame);
  new IntersectionObserver(es => { visible = es[0].isIntersecting; dirty = true; }, { threshold: 0 }).observe(container);

  /* ---------- picking (click = pointer didn't drag) ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  canvas.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return; down = null;
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(root.children.filter(o => o.isMesh || o.isGroup), true).find(h => h.object.userData.node || h.object.userData.edge);
    if (hit && opts.onPick) opts.onPick(hit.object.userData.node ? { type: 'node', key: hit.object.userData.node } : { type: 'edge', key: hit.object.userData.edge });
  });
  // include node groups in picking
  root.children.forEach(() => {});

  /* ---------- API ---------- */
  const api = {
    renderer, camera, controls, nodes, edges, edgeBy, THREE,
    setFocus(nk, ek, sel) { st.sel = sel || null; st.focusNodes = nk; st.focusEdges = ek ? ek.map(p => Array.isArray(p) ? ekey(p[0], p[1]) : p) : null; if (!nk && !ek) { st.focusNodes = null; } recompute(); },
    clearFocus() { st.focusNodes = null; st.focusEdges = null; st.sel = null; recompute(); },
    setBank(v) { st.bank = clamp(v, 0, 1); recompute(); },
    setRate(v) { st.rate = clamp(v, 0, 1); recompute(); },
    setShock(nodesMap, edgeMap) { st.shock = { nodes: nodesMap || {}, edges: edgeMap || {} }; recompute(); },
    flyTo(keys, o) { lastKeys = keys && keys.length ? keys : null; userMoved = false; flyTo(keys, o); },
    autoRotate(b) { autoWanted = b; },
    // theme is chosen at load (?theme=A|B); the mock toggle simply reloads.
    state: st,
    markDirty() { dirty = true; },
    get reducedMotion() { return reduced; },
    dispose() { renderer.dispose(); container.innerHTML = ''; }
  };
  return api;
}
