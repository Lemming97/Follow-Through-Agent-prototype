import { ACTS, SECU_RATE, MUTUELLE_FREE_PRICE_CAP } from './acts.js';

// Pure functions: the "brain" of the quote. Same logic whatever PMS the practice uses.

export function quoteLine(actId) {
  const act = ACTS[actId];
  if (!act || act.pricing === 'none') return null;

  if (act.pricing === 'regulated') {
    const secu = Math.round(act.fee * SECU_RATE);
    return { fee: act.fee, secu, mutuelle: act.fee - secu, patient: 0 };
  }

  const secu = Math.round(act.base * SECU_RATE);
  if (act.pricing === 'sante100') {
    // 100% Santé basket: fee is capped, mutuelle covers the rest.
    return { fee: act.fee, secu, mutuelle: act.fee - secu, patient: 0 };
  }

  // Free price: mutuelle pays up to its cap, the patient pays what is left.
  const mutuelleMax = Math.round(act.base * MUTUELLE_FREE_PRICE_CAP) - secu;
  const mutuelle = Math.min(act.fee - secu, mutuelleMax);
  return { fee: act.fee, secu, mutuelle, patient: act.fee - secu - mutuelle };
}

export function buildQuote(plan) {
  const lines = plan
    .map((item) => ({ item, line: quoteLine(item.act) }))
    .filter((x) => x.line)
    .map(({ item, line }) => ({ tooth: item.tooth, act: item.act, label: ACTS[item.act].label, ...line }));
  const sum = (k) => lines.reduce((s, l) => s + l[k], 0);
  return { lines, total: { fee: sum('fee'), secu: sum('secu'), mutuelle: sum('mutuelle'), patient: sum('patient') } };
}

// Visit sequence: fillings first in one visit, then two visits per crown.
export function visitPlan(plan) {
  const fillings = plan.filter((p) => ACTS[p.act].family === 'filling');
  const crowns = plan.filter((p) => ACTS[p.act].family === 'crown');
  const visits = [];
  if (fillings.length) {
    const minutes = fillings.reduce((s, p) => s + ACTS[p.act].minutes, 0);
    visits.push({ label: `Fillings ${fillings.map((p) => p.tooth).join(', ')}`, minutes: Math.min(minutes, 60) });
  }
  crowns.forEach((p) => {
    visits.push({ label: `Crown preparation ${p.tooth}`, minutes: 60 });
    visits.push({ label: `Crown fitting ${p.tooth}`, minutes: 30, weeksAfterPrevious: 2 });
  });
  return visits;
}

export const euro = (cents) =>
  '€' + (cents / 100).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
