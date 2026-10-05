import { describe, expect, it } from 'vitest';
import {
  daysInMonth,
  formatDate,
  formatDayNumber,
  formatLongDate,
  formatMonthYear,
  formatWeekdayShort,
  isIsoDate,
  shiftMonth,
  toIsoDate,
  weekdayIndex,
  yearMonthOf,
} from './date';

describe('isIsoDate', () => {
  it('accepts real calendar dates only', () => {
    expect(isIsoDate('2026-05-15')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
    expect(isIsoDate('2026-02-29')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('2026-5-1')).toBe(false);
    expect(isIsoDate('not-a-date')).toBe(false);
    expect(isIsoDate(undefined)).toBe(false);
  });
});

describe('shiftMonth', () => {
  it('moves within a year', () => {
    expect(shiftMonth({ year: 2026, month: 5 }, 1)).toEqual({
      year: 2026,
      month: 6,
    });
    expect(shiftMonth({ year: 2026, month: 5 }, -1)).toEqual({
      year: 2026,
      month: 4,
    });
  });

  it('rolls over year boundaries in both directions', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({
      year: 2027,
      month: 1,
    });
    expect(shiftMonth({ year: 2026, month: 1 }, -1)).toEqual({
      year: 2025,
      month: 12,
    });
  });

  it('handles larger steps', () => {
    expect(shiftMonth({ year: 2026, month: 5 }, 12)).toEqual({
      year: 2027,
      month: 5,
    });
    expect(shiftMonth({ year: 2026, month: 5 }, -17)).toEqual({
      year: 2024,
      month: 12,
    });
  });
});

describe('calendar helpers', () => {
  it('knows month lengths, including leap years', () => {
    expect(daysInMonth({ year: 2026, month: 2 })).toBe(28);
    expect(daysInMonth({ year: 2024, month: 2 })).toBe(29);
    expect(daysInMonth({ year: 2026, month: 4 })).toBe(30);
    expect(daysInMonth({ year: 2026, month: 5 })).toBe(31);
  });

  it('numbers weekdays from Monday = 0', () => {
    expect(weekdayIndex('2026-05-04')).toBe(0); // Monday
    expect(weekdayIndex('2026-05-15')).toBe(4); // Friday
    expect(weekdayIndex('2026-05-17')).toBe(6); // Sunday
  });

  it('builds and splits ISO dates', () => {
    expect(toIsoDate(2026, 5, 4)).toBe('2026-05-04');
    expect(yearMonthOf('2026-05-15')).toEqual({ year: 2026, month: 5 });
  });
});

describe('formatting', () => {
  it('formats dates the same regardless of the device timezone', () => {
    expect(formatDate('2026-05-15')).toBe('15 May 2026');
    expect(formatLongDate('2026-05-15')).toBe('Fri, 15 May 2026');
    expect(formatMonthYear({ year: 2026, month: 5 })).toBe('May 2026');
    expect(formatWeekdayShort('2026-05-15')).toBe('Fri');
    expect(formatDayNumber('2026-05-05')).toBe('5');
  });
});
