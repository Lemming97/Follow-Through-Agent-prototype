import { describe, it, expect } from 'vitest';
import { buildQuote, quoteLine, visitPlan } from './quote.js';

const martin = [
  { tooth: '16', act: 'comp2' },
  { tooth: '36', act: 'comp1' },
  { tooth: '46', act: 'crownZr' },
];

describe('quote engine', () => {
  it('prices Mrs Martin at 2026 fees with nothing left to pay', () => {
    const q = buildQuote(martin);
    expect(q.total).toEqual({ fee: 53250, secu: 11958, mutuelle: 41292, patient: 0 });
  });

  it('leaves the patient a share on a free price crown', () => {
    expect(quoteLine('crownMC')).toEqual({ fee: 65000, secu: 7200, mutuelle: 22800, patient: 35000 });
  });

  it('drops a tooth the dentist chooses to monitor', () => {
    const q = buildQuote([{ tooth: '16', act: 'monitor' }, ...martin.slice(1)]);
    expect(q.lines.map((l) => l.tooth)).toEqual(['36', '46']);
  });

  it('sequences fillings before the two crown visits', () => {
    expect(visitPlan(martin).map((v) => v.label)).toEqual(['Fillings 16, 36', 'Crown preparation 46', 'Crown fitting 46']);
  });
});
