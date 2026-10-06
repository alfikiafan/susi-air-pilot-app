import { roundHours, windowStart } from './rolling-sum.js';

describe('windowStart', () => {
  it('finds the first day of a window', () => {
    expect(windowStart('2026-05-15', 7)).toBe('2026-05-09');
    expect(windowStart('2026-05-15', 1)).toBe('2026-05-15');
  });
});

describe('roundHours', () => {
  it('rounds away floating-point drift', () => {
    expect(roundHours(0.1 + 0.2)).toBe(0.3);
  });
});
