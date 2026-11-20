import { SC } from './data.js';
export const BANK_LEVELS = [.72, .52, .4, .3, .24, .2];   // illustrative tank levels for the bank-run shock only
export function shockFrames(key) {
  const out = [], nodes = {}, edges = {};
  SC[key].steps.forEach((s, i) => {
    s.n.forEach(n => nodes[n] = s.t); s.e.forEach(([a, b]) => edges[a + '_' + b] = s.t);
    out.push({ nodes: { ...nodes }, edges: { ...edges }, step: s, bank: key === 'bank' ? BANK_LEVELS[i] : 1 });
  });
  return out;
}
export const SHOCK_ORDER = ['bank', 'oil', 'credit', 'treasury', 'fed', 'fx'];
