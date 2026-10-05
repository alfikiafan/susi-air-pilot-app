import { rollingSum, windowStart } from './rolling-sum.js';

describe('rollingSum', () => {
  const hours = new Map([
    ['2026-05-01', 2],
    ['2026-05-02', 0],
    // 2026-05-03 is missing on purpose
    ['2026-05-04', 3.3],
    ['2026-05-05', 1.1],
  ]);

  it('sums the window ending on the given date, inclusive', () => {
    expect(rollingSum(hours, '2026-05-05', 2)).toBe(4.4);
    expect(rollingSum(hours, '2026-05-05', 5)).toBe(6.4);
  });

  it('counts a missing day as 0 instead of skipping it', () => {
    // 3 calendar days: 05-03 (missing), 05-04, 05-05. Skipping the gap would wrongly pull in 05-02.
    expect(rollingSum(hours, '2026-05-05', 3)).toBe(4.4);
  });

  it('counts days before the first record as 0', () => {
    expect(rollingSum(hours, '2026-05-01', 7)).toBe(2);
    expect(rollingSum(hours, '2026-04-20', 7)).toBe(0);
  });

  it('still returns a value past the last record', () => {
    expect(rollingSum(hours, '2026-05-07', 3)).toBe(1.1);
    expect(rollingSum(hours, '2026-06-30', 7)).toBe(0);
  });

  it('rounds away floating-point drift', () => {
    const drift = new Map([
      ['2026-05-01', 0.1],
      ['2026-05-02', 0.2],
    ]);
    expect(rollingSum(drift, '2026-05-02', 2)).toBe(0.3);
  });

  it('finds the first day of a window', () => {
    expect(windowStart('2026-05-15', 7)).toBe('2026-05-09');
    expect(windowStart('2026-05-15', 1)).toBe('2026-05-15');
  });
});
