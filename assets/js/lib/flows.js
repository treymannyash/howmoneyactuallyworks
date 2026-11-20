// Flow families for Chapter II: one signature light colour per kind of flow (colour = light, not paint).
export const FLOW = {
  money:      { c: '#34D1E6', l: 'Money & spending' },
  credit:     { c: '#6C95FF', l: 'Credit' },
  reserves:   { c: '#3DDC97', l: 'Reserves & public' },
  collateral: { c: '#F2B13C', l: 'Collateral & markets' },
  external:   { c: '#A3ACB6', l: 'External' },
};
export const NODE_FLOW = { households: 'money', firms: 'money', banks: 'credit', consumers_credit: 'credit', fed: 'reserves', treasury: 'reserves', government: 'reserves', repo: 'collateral', moneymkt: 'collateral', oil: 'external', fx: 'external', foreign: 'external' };
const CREDIT = new Set(['banks_firms', 'banks_households', 'banks_consumers_credit', 'consumers_credit_households']);
export function flowType(from, to) {
  const s = [from, to];
  if (s.some(x => ['oil', 'fx', 'foreign'].includes(x))) return 'external';
  if (s.some(x => ['repo', 'moneymkt'].includes(x))) return 'collateral';
  if (s.some(x => ['fed', 'treasury', 'government'].includes(x))) return 'reserves';
  if (CREDIT.has(from + '_' + to)) return 'credit';
  return 'money';
}
export const flowColor = (from, to) => FLOW[flowType(from, to)].c;
export function legendEl() {
  const d = document.createElement('div'); d.className = 'flow-legend'; d.setAttribute('aria-label', 'Flow colour legend');
  d.innerHTML = '<span class="fl-h">Flows</span>' + Object.values(FLOW).map(f => `<span class="fl"><i style="background:${f.c}"></i>${f.l}</span>`).join('') + '<span class="fl stress"><i></i>Stress</span>';
  return d;
}
