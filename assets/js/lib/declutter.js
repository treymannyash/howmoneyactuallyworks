// Label de-collision for HTML labels projected over a 3D stage.
// After a stage writes each label's transform, call declutter(): labels are measured, then (highest priority first)
// nudged to the nearest free spot that does not overlap another label, a UI obstacle (step card, legend, caption, nav)
// or the stage edge. Nothing is hidden: every label stays visible and clickable, only moved a few pixels.
const OFFS = (() => { const a = []; for (let dy = -240; dy <= 240; dy += 8) for (let dx = -240; dx <= 240; dx += 8) a.push([dx, dy, Math.hypot(dx, dy * 1.15)]); return a.sort((p, q) => p[2] - q[2]); })();
const OBST = '.step.on .card,.caption,.hint3d,.flow-legend,.cnav,.rail,.stage-btns,.dock';
const hit = (a, b, m = 3) => a.l < b.r + m && a.r > b.l - m && a.t < b.b + m && a.b > b.t - m;
const vis = el => { const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity < .05) return null; const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? r : null; };

export function declutter(container, entries) {
  // entries: [{ el, base (the transform string just applied), pri }]; lower pri number = placed first
  const cr = container.getBoundingClientRect(); if (cr.width < 2) return;
  const live = entries.filter(e => !e.el.hidden && !e.el.classList.contains('hide'));
  const items = live.map(e => { const r = e.el.getBoundingClientRect(); return { e, r: { l: r.left, t: r.top, r: r.right, b: r.bottom }, w: r.width, h: r.height }; }).filter(i => i.w > 2).filter(i => { const cx = (i.r.l + i.r.r) / 2, cy = (i.r.t + i.r.b) / 2; const on = cx > cr.left && cx < cr.right && cy > cr.top && cy < cr.bottom; i.e.el.style.visibility = on ? '' : 'hidden'; if (!on) { i.e.dx = i.e.dy = i.e.sx = i.e.sy = 0; } return on; }); // labels whose object is off-screen stay with their object
  if (!items.length) return;
  const obst = []; document.querySelectorAll(OBST).forEach(o => { if (container.contains(o) && o.closest('.nlabel')) return; const r = vis(o); if (r) obst.push({ l: r.left, t: r.top, r: r.right, b: r.bottom }); });
  const inside = r => r.l >= cr.left + 2 && r.r <= cr.right - 2 && r.t >= cr.top + 2 && r.b <= cr.bottom - 2;
  // quick exit: nothing collides
  let bad = false;
  for (let i = 0; i < items.length && !bad; i++) { if (!inside(items[i].r)) bad = true; for (const o of obst) if (hit(items[i].r, o)) bad = true; for (let j = i + 1; j < items.length && !bad; j++) if (hit(items[i].r, items[j].r)) bad = true; }
  const settling = items.some(i => i.e.sx || i.e.sy);
  if (!bad && !settling) return;
  const now = performance.now(); const dt = Math.min(.1, Math.max(.001, (now - (container.__dt || now - 16)) / 1000)); container.__dt = now; const kk = 1 - Math.exp(-dt * 18);
  const ease = e => { // glide the shown offset toward the target so labels never jump
    e.sx = (e.sx || 0) + (e.dx - (e.sx || 0)) * kk; e.sy = (e.sy || 0) + (e.dy - (e.sy || 0)) * kk;
    if (Math.abs(e.sx - e.dx) < .5 && Math.abs(e.sy - e.dy) < .5) { e.sx = e.dx; e.sy = e.dy; }
    e.el.style.transform = (e.sx || e.sy) ? `translate(${e.sx.toFixed(1)}px,${e.sy.toFixed(1)}px) ${e.base}` : e.base;
  };
  items.sort((a, b) => (a.e.pri - b.e.pri));
  const placed = [];
  const free = (r, placedList) => { if (!inside(r)) return false; for (const o of obst) if (hit(r, o)) return false; for (const p of placedList) if (hit(r, p)) return false; return true; };
  for (const it of items) {
    const base = it.r; // callers reset the transform to its natural value just before calling, so this is the un-nudged box
    const at = (dx, dy) => ({ l: base.l + dx, t: base.t + dy, r: base.r + dx, b: base.b + dy });
    let best = null;
    if (free(at(0, 0), placed)) best = [0, 0];
    else if (it.e.dx || it.e.dy) { if (free(at(it.e.dx, it.e.dy), placed)) best = [it.e.dx, it.e.dy]; }  // hysteresis: keep last spot if still valid
    if (!best) for (const [dx, dy] of OFFS) { if (free(at(dx, dy), placed)) { best = [dx, dy]; break; } }
    if (!best) { // nothing fully free nearby: at least keep it inside the stage
      let dx = 0, dy = 0; if (base.l < cr.left + 2) dx = cr.left + 2 - base.l; else if (base.r > cr.right - 2) dx = cr.right - 2 - base.r; if (base.t < cr.top + 2) dy = cr.top + 2 - base.t; else if (base.b > cr.bottom - 2) dy = cr.bottom - 2 - base.b; best = [dx, dy]; }
    it.e.dx = best[0]; it.e.dy = best[1];
    placed.push(at(it.e.dx, it.e.dy));
    ease(it.e);
  }
}
