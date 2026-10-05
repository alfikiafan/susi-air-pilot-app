import {
  addDays,
  daysInMonth,
  diffDays,
  eachDay,
  isValidIsoDate,
} from './date.util.js';

describe('date.util', () => {
  it('accepts real ISO dates only', () => {
    expect(isValidIsoDate('2026-05-15')).toBe(true);
    expect(isValidIsoDate('2024-02-29')).toBe(true);
    expect(isValidIsoDate('2026-02-29')).toBe(false);
    expect(isValidIsoDate('2026-02-30')).toBe(false);
    expect(isValidIsoDate('2026-5-1')).toBe(false);
    expect(isValidIsoDate('2026-05-15T00:00:00Z')).toBe(false);
    expect(isValidIsoDate('')).toBe(false);
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-05-15', 7)).toBe('2026-05-22');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29');
  });

  it('counts days between dates', () => {
    expect(diffDays('2026-05-15', '2026-06-11')).toBe(27);
    expect(diffDays('2026-05-15', '2026-05-01')).toBe(-14);
    expect(diffDays('2026-05-15', '2026-05-15')).toBe(0);
  });

  it('lists every day of a range inclusively', () => {
    expect(eachDay('2026-04-29', '2026-05-02')).toEqual([
      '2026-04-29',
      '2026-04-30',
      '2026-05-01',
      '2026-05-02',
    ]);
    expect(eachDay('2026-05-02', '2026-05-01')).toEqual([]);
  });

  it('knows month lengths', () => {
    expect(daysInMonth(2026, 2)).toBe(28);
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 4)).toBe(30);
  });
});
