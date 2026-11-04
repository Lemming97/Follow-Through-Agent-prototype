import { describe, it, expect } from 'vitest';
import { reducer, initialState, getMartin } from './cases.js';

const sent = reducer(initialState, { type: 'SEND_QUOTE', from: 'patient' });

describe('patient actions update the practice side', () => {
  it('moves Mrs Martin to Accepted and gives Camille a slot to confirm', () => {
    const s = reducer(sent, { type: 'PATIENT_REQUEST_SLOT', slot: 'Thu 19 Nov 17:40', pms: 'PMS B' });
    expect(getMartin(s).status).toBe('accepted');
    expect(s.tasks.at(-1).text).toContain('Thu 19 Nov 17:40');
  });

  it('counts the reason when she says not now', () => {
    const s = reducer(sent, { type: 'PATIENT_NOT_NOW', reason: 'second', patientShare: 0 });
    expect(s.reasons.second).toBe(initialState.reasons.second + 1);
  });

  it('flags a cost worry when she has nothing to pay', () => {
    const s = reducer(sent, { type: 'PATIENT_NOT_NOW', reason: 'cost', patientShare: 0 });
    expect(s.tasks.at(-1).text).toContain('mutuelle covers it');
  });
});
