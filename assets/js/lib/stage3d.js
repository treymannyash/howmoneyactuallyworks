// Generic clay-diorama stage: renderer, soft lighting, tray, orbit controls, labels, camera tweening.
// Used by every chapter widget. Respects prefers-reduced-motion (render-on-demand, no autorotate, instant camera).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { THEMES, Mats, lighten, darken, mute } from './clay.js';

export const isMobile = () => matchMedia('(pointer:coarse)').matches || innerWidth < 720;
export const prefersReduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || new URLSearchParams(location.search).get('rm') === '1';

export function webglOK() {
  if (webglOK.v !== undefined) return webglOK.v;
  try { const c = document.createElement('canvas'); webglOK.v = !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); }
  catch (e) { webglOK.v = false; }
  if (new URLSearchParams(location.search).get('nogl') === '1') webglOK.v = false;
  return webglOK.v;
}

export function rrect(w, d, r) {
  const s = new THREE.Shape(); const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2;
  s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1);
  s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); return s;
}

export function createStage(container, o = {}) {
  const reduced = o.reduced ?? prefersReduced();
  const mobile = o.mobile ?? isMobile();
  const T = THEMES.A;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2));
  renderer.shadowMap.enabled = !mobile; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', o.label || 'Interactive 3D illustration. Drag to rotate. The same information is in the text beside it.');
  canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;';
  container.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(o.fov || 30, 1, .5, 220);
  const hemi = new THREE.HemisphereLight(T.sky, T.gnd, T.hemi); const sun = new THREE.DirectionalLight(T.sun, T.sunI);
  sun.position.set(-7, 14, 9); sun.castShadow = !mobile; sun.shadow.mapSize.set(mobile ? 512 : 2048, mobile ? 512 : 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 11, bottom: -11, near: 2, far: 45 }); sun.shadow.bias = -.0004; sun.shadow.radius = 8;
  scene.add(hemi, sun);
  const root = new THREE.Group(); scene.add(root);
  const mats = new Mats(T);
  let tray = null;
  if (o.tray !== false) {
    const t = o.tray || {};
    tray = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(t.w || 16, t.d || 12, t.r || .5), { depth: .22, bevelEnabled: true, bevelThickness: .035, bevelSize: .05, bevelSegments: 1, curveSegments: 8 }), mats.clay(T.ground));
    tray.rotation.x = -Math.PI / 2; tray.position.set(t.x || 0, -.32, t.z || 0); tray.receiveShadow = true; root.add(tray);
  }
  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, { enableDamping: !reduced, dampingFactor: .09, enablePan: false, minDistance: o.minDist || 5, maxDistance: o.maxDist || 40, minPolarAngle: o.polar?.[0] ?? .35, maxPolarAngle: o.polar?.[1] ?? 1.28, enableZoom: !mobile && o.zoom !== false, rotateSpeed: .7, autoRotate: false, autoRotateSpeed: o.autoSpeed || .55 });
  if (o.azimuth) { controls.minAzimuthAngle = o.azimuth[0]; controls.maxAzimuthAngle = o.azimuth[1]; }

  let size = { w: 1, h: 1 }, dirty = true, visible = true, tween = null, last = performance.now(), time = 0, autoWanted = !!o.autoRotate, autoPause = 0, userMoved = false, curView = null, dead = false;
  const updaters = [], labels = [];
  const labelLayer = document.createElement('div'); labelLayer.className = 'eco-labels'; container.appendChild(labelLayer);
  const v3 = new THREE.Vector3();

  const offset = () => { if (o.shiftRight && !mobile) camera.setViewOffset(size.w, size.h, -size.w * (o.shiftX ?? .15), 0, size.w, size.h); else camera.clearViewOffset(); camera.updateProjectionMatrix(); };
  function goal(v) {
    const cur = camera.position.clone().sub(controls.target); const az = v.azimuth ?? Math.atan2(cur.x, cur.z);
    return new THREE.Vector3(Math.sin(az) * Math.cos(v.pitch), Math.sin(v.pitch), Math.cos(az) * Math.cos(v.pitch)).multiplyScalar(v.dist).add(v.target);
  }
  // fit: half extents (hw,hd) around center => distance that keeps them in frame
  function fit(center, hw, hd, pitch = .93) {
    const aspect = size.w / size.h, th = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const shift = o.shiftRight && !mobile ? (o.shiftScale ?? .74) : 1;
    const dist = Math.max(hw / (th * aspect * shift), (hd * Math.sin(pitch) + 1.1) / th) * 1.04;
    return { target: center.clone(), dist: Math.max(dist, o.minFit || 7), pitch };
  }
  function view(v, opt = {}) {
    curView = { v, opt }; userMoved = false;
    const p = goal(v);
    if (reduced || opt.instant) { camera.position.copy(p); controls.target.copy(v.target); controls.update(); tween = null; dirty = true; return; }
    tween = { p, t: v.target.clone() }; dirty = true;
  }
  function resize() {
    const r = container.getBoundingClientRect(); const w = Math.max(2, Math.round(r.width)), h = Math.max(2, Math.round(r.height));
    if (w === size.w && h === size.h) return; size = { w, h }; renderer.setSize(w, h, false); camera.aspect = w / h; offset(); dirty = true;
    if (o.refit && !userMoved) { const v = o.refit(); if (v) view(v, { instant: true }); }
  }
  new ResizeObserver(resize).observe(container);
  size = { w: container.clientWidth || 800, h: container.clientHeight || 600 }; renderer.setSize(size.w, size.h, false); camera.aspect = size.w / size.h; offset();
  controls.addEventListener('start', () => { tween = null; userMoved = true; dirty = true; autoPause = performance.now() + 5000; });
  controls.addEventListener('change', () => { dirty = true; });
  new IntersectionObserver(es => { visible = es[0].isIntersecting; dirty = true; }, { threshold: 0 }).observe(container);

  function addLabel(getPos, html, opt = {}) {
    const b = document.createElement(opt.onClick ? 'button' : 'div'); b.className = 'nlabel ' + (opt.cls || ''); if (opt.onClick) { b.type = 'button'; b.addEventListener('click', e => { e.stopPropagation(); opt.onClick(); }); }
    b.innerHTML = html; labelLayer.appendChild(b); const L = { el: b, getPos, anchor: opt.anchor || 'below' }; labels.push(L); return L;
  }

  function frame(now) {
    if (dead) return; requestAnimationFrame(frame);
    const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now;
    if (!visible || document.hidden) return;
    if (!reduced) time += dt; let moving = false;
    if (tween) { const k = 1 - Math.exp(-dt * 2.6); camera.position.lerp(tween.p, k); controls.target.lerp(tween.t, k); if (camera.position.distanceTo(tween.p) < .02 && controls.target.distanceTo(tween.t) < .02) tween = null; moving = true; }
    controls.autoRotate = autoWanted && !reduced && !tween && now > autoPause; if (controls.autoRotate) moving = true;
    if (controls.update()) moving = true;
    const smooth = reduced ? 1 : 1 - Math.exp(-dt * 6);
    for (const f of updaters) if (f(dt, time, smooth)) moving = true;
    const hw = size.w / 2, hh = size.h / 2;
    for (const L of labels) { if (L.el.hidden) continue; const p = L.getPos(); v3.copy(p).project(camera); L.el.style.transform = `translate(${(v3.x * hw + hw).toFixed(1)}px,${(-v3.y * hh + hh).toFixed(1)}px) ${L.anchor === 'right' ? 'translate(14px,-50%)' : L.anchor === 'left' ? 'translate(calc(-100% - 14px),-50%)' : `translate(-50%,${L.anchor === 'above' ? '-100%' : '0'})`}`; }
    if (!reduced || dirty || moving) { renderer.render(scene, camera); dirty = false; }
  }
  requestAnimationFrame(frame);

  const api = {
    THREE, scene, camera, controls, T, mats, root, tray, renderer, canvas, container, reduced, mobile,
    get size() { return size; }, get time() { return time; },
    onFrame(f) { updaters.push(f); }, markDirty() { dirty = true; }, addLabel, view, fit, autoRotate(b) { autoWanted = b; },
    clearLabels() { labels.length = 0; labelLayer.innerHTML = ''; },
    dispose() { dead = true; try { renderer.dispose(); renderer.forceContextLoss(); } catch (e) {} container.innerHTML = ''; },
  };
  container.__stage = api; return api;
}

/* generic helpers for widgets */
export function clayMesh(stage, geo, hex, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, cast = true, parent } = {}) {
  const m = new THREE.Mesh(geo, stage.mats.clay(hex)); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = cast; m.receiveShadow = true; (parent || stage.root).add(m); return m;
}
export const smoothTo = (o, k, target, s) => { const d = target - o[k]; if (Math.abs(d) > .002) { o[k] += d * s; return true; } o[k] = target; return false; };
export { THREE, lighten, darken, THEMES, mute };
