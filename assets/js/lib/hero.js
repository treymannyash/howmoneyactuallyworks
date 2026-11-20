// Living-map hero as a 3D clay diorama: the four chapters + the Detour on a winding route.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { THEMES, hueOf, Mats, makeChapterIcon, lighten, darken } from './clay.js';

const STN = [
  { key: 'ideas',  pos: [-5.2, 3.0],  legacy: '#f5a623' },
  { key: 'machine',pos: [-1.5, 1.2],   legacy: '#4db8ff' },
  { key: 'trap',   pos: [2.6, -.7],  legacy: '#f87171' },
  { key: 'exit',   pos: [6.2, -2.7],  legacy: '#ff7043' },
  { key: 'detour', pos: [-.8, 4.3],  legacy: '#00e5a0' },
];
export function createHero(container, opts = {}) {
  const reduced = !!opts.reduced, mobile = innerWidth < 720 || matchMedia('(pointer:coarse)').matches;
  const T = THEMES[opts.theme || 'A'];
  let renderer; try { renderer = new THREE.WebGLRenderer({ antialias: !mobile, alpha: true }); } catch (e) { container.classList.add('no-webgl'); return null; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.5 : 2)); renderer.shadowMap.enabled = !mobile; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement; canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:pan-y;';
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'Decorative 3D map of the four chapters and the Detour. Use the labelled links to navigate.');
  container.appendChild(canvas);
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(30, 1, .5, 200);
  scene.add(new THREE.HemisphereLight(T.sky, T.gnd, T.hemi));
  const sun = new THREE.DirectionalLight(T.sun, T.sunI); sun.position.set(-7, 14, 9); sun.castShadow = !mobile; sun.shadow.mapSize.set(mobile ? 512 : 2048, mobile ? 512 : 2048);
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 10, bottom: -10, near: 2, far: 40 }); sun.shadow.radius = 5; scene.add(sun);
  const mats = new Mats(T);
  const rrect = (w, d, r) => { const s = new THREE.Shape(); const x0 = -w / 2, x1 = w / 2, y0 = -d / 2, y1 = d / 2;
    s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1); s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); return s; };
  const tray = new THREE.Mesh(new THREE.ExtrudeGeometry(rrect(19.4, 11.2, 2.2), { depth: .22, bevelEnabled: true, bevelThickness: .1, bevelSize: .12, bevelSegments: 3, curveSegments: 12 }), mats.clay(T.ground));
  tray.rotation.x = -Math.PI / 2; tray.position.set(-.2, -.32, 1.5); tray.receiveShadow = true; scene.add(tray);

  const P = STN.map(s => new THREE.Vector3(s.pos[0], 0, s.pos[1]));
  const main = P.slice(0, 4);
  const routeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7.2, 0, 3.5), main[0], new THREE.Vector3(-3.4, 0, 2.6), main[1], new THREE.Vector3(.5, 0, .6), main[2], new THREE.Vector3(4.5, 0, -2.2), main[3]
  ].map(v => v.setY(.1)), false, 'catmullrom', .5);
  // coloured route segments
  const segCols = ['#f5a623', '#4db8ff', '#f87171', '#ff7043'];
  const route = new THREE.Group(); scene.add(route);
  const N = 180, pts = routeCurve.getSpacedPoints(N);
  // find nearest index of each station
  const idxs = main.map(m => pts.reduce((bi, p, i) => (p.distanceTo(m) < pts[bi].distanceTo(m) ? i : bi), 0));
  for (let s = 0; s < 3; s++) {
    const seg = new THREE.CatmullRomCurve3(pts.slice(idxs[s], idxs[s + 1] + 1));
    const c0 = new THREE.Color(hueOf(T, segCols[s])), c1 = new THREE.Color(hueOf(T, segCols[s + 1]));
    const g = new THREE.TubeGeometry(seg, 60, .14, 10, false); const cols = []; const pc = g.attributes.position.count;
    for (let i = 0; i < pc; i++) { const u = Math.floor(i / 11) / 61; const c = c0.clone().lerp(c1, u); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: T.rough })); m.scale.y = .55; m.position.y = .04; m.castShadow = m.receiveShadow = true; route.add(m);
  }
  if (idxs[0] > 3) { const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.slice(0, idxs[0] + 1)), 20, .14, 10); const m = new THREE.Mesh(g, mats.clay(hueOf(T, '#f5a623'))); m.scale.y = .55; m.position.y = .04; route.add(m); }
  // detour: dotted green branch
  const dCurve = new THREE.CatmullRomCurve3([main[0].clone().setY(.12), new THREE.Vector3(-4.0, .12, 4.3), new THREE.Vector3(-2.3, .12, 4.5), P[4].clone().setY(.12)]);
  const dotGeo = new THREE.SphereGeometry(.1, 10, 8), dotMat = mats.clay(hueOf(T, '#00e5a0'));
  for (let i = 0; i <= 14; i++) { const d = new THREE.Mesh(dotGeo, dotMat); d.position.copy(dCurve.getPoint(i / 14)); d.position.y = .13; d.castShadow = true; scene.add(d); }

  const stations = {};
  STN.forEach((s, i) => {
    const hue = hueOf(T, s.legacy); const g = new THREE.Group(); g.position.copy(P[i]); scene.add(g);
    const r = s.key === 'detour' ? .72 : .95;
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.08, .2, 40), mats.clay(lighten(hue, .2))); ped.castShadow = ped.receiveShadow = true; g.add(ped);
    const top = new THREE.Mesh(new THREE.CylinderGeometry(r * .88, r * .88, .05, 40), mats.clay(lighten(hue, .6))); top.position.y = .12; top.receiveShadow = true; g.add(top);
    const ic = makeChapterIcon(s.key, hue, T, mats); ic.scale.setScalar(r / .5 * (s.key === 'detour' ? .85 : .95)); ic.position.y = .02; g.add(ic);
    stations[s.key] = { g, ic, r };
  });
  // travelling orb along the route
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.2, 20, 14), new THREE.MeshStandardMaterial({ color: T.cream, emissive: hueOf(T, '#f5a623'), emissiveIntensity: .55, roughness: .3 })); orb.castShadow = true; scene.add(orb);
  const halo = new THREE.Mesh(new THREE.SphereGeometry(.34, 20, 14), new THREE.MeshBasicMaterial({ color: hueOf(T, '#f5a623'), transparent: true, opacity: .22 })); orb.add(halo);

  // labels (real links)
  const layer = document.createElement('div'); layer.className = 'eco-labels hero-labels'; container.appendChild(layer);
  const LAB = {
    ideas: ['I.', 'The Ideas', 'Where the doctrine came from', '#ch-ideas'], machine: ['II.', 'The Machine', 'How money actually moves', '#chamber-machine'],
    trap: ['III.', 'The Trap', 'What the plumbing does in a crisis', '#ch-trap'], exit: ['IV.', 'The Exit', 'Rails built outside the system', '#ch-exit'], detour: ['◆', 'The Detour', 'School of Salamanca, 1544–1605', '#ch-detour']
  };
  const AX = mobile ? {} : { ideas: '-70%', detour: '-12%' }, AY = mobile ? {} : { ideas: '-6px', detour: '4px' }; /* keep neighbouring labels from colliding */
  const labels = {};
  for (const k in LAB) { const a = document.createElement('a'); a.href = (opts.hrefs && opts.hrefs[k]) || LAB[k][3]; a.className = 'stn-label ' + k; a.innerHTML = `<span class="num">${LAB[k][0]}</span> <b>${LAB[k][1]}</b><small>${LAB[k][2]}</small>`; layer.appendChild(a); labels[k] = a; }

  const controls = new OrbitControls(camera, canvas);
  Object.assign(controls, { enableDamping: !reduced, dampingFactor: .08, enablePan: false, enableZoom: false, rotateSpeed: .5, minPolarAngle: .62, maxPolarAngle: 1.0, minAzimuthAngle: -.5, maxAzimuthAngle: .5 });
  let size = { w: 1, h: 1 }, dirty = true, visible = true, time = 0, last = performance.now(), elastic = 1, uPhase = 0;
  function place() {
    const aspect = size.w / size.h; const th = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const dist = Math.max((mobile ? 12 : 10.4) / (th * aspect), 7.4 / th) * 1.0 + (mobile ? 0 : 0);
    const pitch = .86; controls.target.set(-.2, 0, 1.2);
    camera.position.set(controls.target.x, Math.sin(pitch) * dist, controls.target.z + Math.cos(pitch) * dist);
    camera.clearViewOffset(); /* stage is its own framed box: centre the map in it */
    camera.aspect = aspect; camera.updateProjectionMatrix(); controls.update(); dirty = true;
  }
  const ro = new ResizeObserver(() => { const r = container.getBoundingClientRect(); size = { w: Math.max(2, r.width | 0), h: Math.max(2, r.height | 0) }; renderer.setSize(size.w, size.h, false); place(); }); ro.observe(container);
  controls.addEventListener('change', () => dirty = true);
  new IntersectionObserver(es => visible = es[0].isIntersecting).observe(container);
  const v = new THREE.Vector3();
  function frame(now) {
    requestAnimationFrame(frame); const dt = Math.max(0, Math.min(.05, (now - last) / 1000)); last = now; if (!visible || document.hidden) return;
    if (!reduced) time += dt; let moving = false;
    uPhase += reduced ? 0 : dt * .045 * (elastic ? 1.7 : .6); const u = reduced ? idxs[1] / N : uPhase % 1; orb.position.copy(routeCurve.getPointAt(u)); orb.position.y = .5 + (reduced ? 0 : Math.sin(time * 3) * .04);
    if (!reduced) { for (const k in stations) { const ud = stations[k].ic.userData; ud.spin.forEach(([o, s]) => o.rotation.y += dt * s); ud.bob.forEach(([o, a]) => o.position.y = (o.userData.y0 ??= o.position.y) + Math.sin(time * 2) * a); } moving = true; }
    if (controls.update()) moving = true;
    const hw = size.w / 2, hh = size.h / 2;
    for (const k in stations) { const g = stations[k].g; v.set(g.position.x, 0, g.position.z + stations[k].r + .18).project(camera); labels[k].style.transform = `translate(${(v.x * hw + hw).toFixed(1)}px,${(-v.y * hh + hh).toFixed(1)}px) translate(${AX[k] || '-50%'},${AY[k] || '0px'})`; }
    if (!reduced || dirty || moving) { renderer.render(scene, camera); dirty = false; }
  }
  requestAnimationFrame(frame);
  return { renderer, camera, controls, setElastic(b) { elastic = b ? 1 : 0; halo.scale.setScalar(b ? 1.5 : .8); dirty = true; } };
}
