import { describe, it, expect } from 'vitest';
import { has, VERSIONS } from './versions.js';

describe('roadmap', () => {
  it('has five versions in order', () => {
    expect(VERSIONS.map((v) => v.name)).toEqual(['V0', 'V1', 'V2', 'V3', 'V4']);
  });
  it('turns features on in the right version', () => {
    expect(has(0, 'agent')).toBe(false);
    expect(has(1, 'agent')).toBe(true);
    expect(has(1, 'autoQuote')).toBe(false);
    expect(has(3, 'materials')).toBe(true);
    expect(has(3, 'voice')).toBe(false);
  });
});
