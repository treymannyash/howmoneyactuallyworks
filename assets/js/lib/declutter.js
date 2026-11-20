// Label de-collision for HTML labels projected over a 3D stage.
// After a stage writes each label's transform, call declutter(): labels are measured, then (highest priority first)
// nudged to the nearest free spot that does not overlap another label, a UI obstacle (step card, legend, caption, nav)
// or the stage edge. Nothing is hidden: every label stays visible and clickable, only moved a few pixels.
const OFFS = (() => { const a = []; for (let dy = -240; dy <= 240; dy += 8) for (let dx = -240; dx <= 240; dx += 8) a.push([dx, dy, Math.hypot(dx, dy * 1.15)]); return a.sort((p, q) => p[2] - q[2]); })();
const OBST = '.step.on .card,.caption,.hint3d,.flow-legend,.cnav,.rail,.stage-btns,.dock';
const hit = (a, b, m = 3) => a.l < b.r + m && a.r > b.l - m && a.t < b.b + m && a.b > b.t - m;
const vis = el => { const r = el.getBoundingClientRect(); return r.width > 2 && r.height > 2 ? r : null; };

export function declutter(container, entries) {
  // entries: [{ el, base (the transform string just applied), pri }]; lower pri number = placed first
  const cr = container.getBoundingClientRect(); if (cr.width < 2) return;
  const live = entries.filter(e => !e.el.hidden && !e.el.classList.contains('hide'));
  const items = live.map(e => { const r = e.el.getBoundingClientRect(); return { e, r: { l: r.left, t: r.top, r: r.right, b: r.bottom }, w: r.width, h: r.height }; }).filter(i => i.w > 2);
  if (!items.length) return;
  const obst = []; document.querySelectorAll(OBST).forEach(o => { if (container.contains(o) && o.closest('.nlabel')) return; const r = vis(o); if (r) obst.push({ l: r.left, t: r.top, r: r.right, b: r.bottom }); });
  const inside = r => r.l >= cr.left + 2 && r.r <= cr.right - 2 && r.t >= cr.top + 2 && r.b <= cr.bottom - 2;
  // quick exit: nothing collides
  let bad = false;
  for (let i = 0; i < items.length && !bad; i++) { if (!inside(items[i].r)) bad = true; for (const o of obst) if (hit(items[i].r, o)) bad = true; for (let j = i + 1; j < items.length && !bad; j++) if (hit(items[i].r, items[j].r)) bad = true; }
  for (const i of items) { i.e.dx = 0; i.e.dy = 0; }
  if (!bad) { for (const i of items) if (i.e.applied) { i.e.el.style.transform = i.e.base; i.e.applied = false; } return; }
  items.sort((a, b) => (a.e.pri - b.e.pri));
  const placed = [];
  for (const it of items) {
    const base = it.r; let best = null;
    for (const [dx, dy] of OFFS) {
      const r = { l: base.l + dx, t: base.t + dy, r: base.r + dx, b: base.b + dy };
      if (!inside(r)) continue; let ok = true;
      for (const o of obst) if (hit(r, o)) { ok = false; break; }
      if (ok) for (const p of placed) if (hit(r, p)) { ok = false; break; }
      if (ok) { best = [dx, dy, r]; break; }
    }
    if (best) { placed.push(best[2]); it.e.dx = best[0]; it.e.dy = best[1]; } else placed.push(base);
    if (it.e.dx || it.e.dy) { it.e.el.style.transform = `translate(${it.e.dx}px,${it.e.dy}px) ${it.e.base}`; it.e.applied = true; }
    else if (it.e.applied) { it.e.el.style.transform = it.e.base; it.e.applied = false; }
  }
}
