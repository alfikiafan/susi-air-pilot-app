import { HttpStatus } from '@nestjs/common';
import type { ClockService } from '../core/clock.service.js';
import type { DataService } from '../core/data/data.service.js';
import { indexFlightHours } from '../core/data/data.service.js';
import type { FlightHoursFile } from '../core/data/data.types.js';
import { ApiException } from '../common/errors/api-error.js';
import { FlightHoursService, limitStatus } from './flight-hours.service.js';

const bound = (limit: number, max: number, windowDays: number) => ({
  limit,
  max,
  windowDays,
  displayRangeDays: 7,
});

/** A tiny dataset: 2h every day from 05-01 to 05-20, so every number below is easy to check by hand. */
function makeService(today = '2026-05-10') {
  const rows = Array.from({ length: 20 }, (_, i) => ({
    date: `2026-05-${String(i + 1).padStart(2, '0')}`,
    hours: 2,
  }));
  const flightHours: FlightHoursFile = {
    pilot: { name: 'Test Pilot', totalFlightHours: 40 },
    limits: { daily: 8, weekly: 40, monthly: 100, annual: 1050 },
    chartBounds: {
      '1w': bound(10, 15, 7),
      '1m': bound(100, 125, 30),
      '3m': bound(300, 325, 90),
      '6m': bound(600, 625, 180),
      '1y': bound(1050, 1200, 365),
    },
    flightHours: rows,
  };
  const data = {
    flightHours,
    hoursByDate: indexFlightHours(rows),
    firstFlightDate: '2026-05-01',
  } as unknown as DataService;
  const clock = { today: () => today } as ClockService;
  return new FlightHoursService(data, clock);
}

describe('FlightHoursService', () => {
  describe('getSummary', () => {
    it('returns 15 points centred on today', () => {
      const { points } = makeService().getSummary('1w');
      expect(points).toHaveLength(15);
      expect(points[0].date).toBe('2026-05-03');
      expect(points[7]).toMatchObject({ date: '2026-05-10', isToday: true });
      expect(points[14].date).toBe('2026-05-17');
      expect(points.filter((p) => p.isToday)).toHaveLength(1);
    });

    it('flags windows that start before the first record', () => {
      const { points } = makeService().getSummary('1w');
      // 05-03 window covers 04-27..05-03: only 3 days of data.
      expect(points[0]).toMatchObject({ value: 6, partialWindow: true });
      // 05-07 window covers 05-01..05-07: complete.
      expect(points[4]).toMatchObject({ value: 14, partialWindow: false });
    });

    it('marks future dates as projected and still computes them', () => {
      const { points } = makeService().getSummary('1w');
      const future = points.filter((p) => p.projected);
      expect(future.map((p) => p.date)).toEqual([
        '2026-05-11',
        '2026-05-12',
        '2026-05-13',
        '2026-05-14',
        '2026-05-15',
        '2026-05-16',
        '2026-05-17',
      ]);
      expect(future.every((p) => p.value === 14)).toBe(true);
    });

    it('flags values above the limit and reports the peak', () => {
      const summary = makeService().getSummary('1w');
      expect(summary.limit).toBe(10);
      expect(summary.yMax).toBe(15);
      expect(summary.peak).toBe(14);
      expect(summary.points.find((p) => p.value === 10)?.exceedsLimit).toBe(
        false,
      );
      expect(summary.points.find((p) => p.value === 12)?.exceedsLimit).toBe(
        true,
      );
    });

    it('builds the four limit cards as of today', () => {
      const cards = makeService().getSummary('1w').cards;
      expect(cards.map((c) => [c.key, c.hours])).toEqual([
        ['daily', 2],
        ['weekly', 14],
        ['monthly', 20],
        ['annual', 20],
      ]);
      expect(cards[1]).toMatchObject({
        limit: 40,
        remaining: 26,
        percentUsed: 35,
        status: 'ok',
      });
    });
  });

  describe('findRange', () => {
    it('fills gaps with 0 and totals the range', () => {
      const result = makeService().findRange('2026-04-29', '2026-05-02');
      expect(result.days.map((d) => d.hours)).toEqual([0, 0, 2, 2]);
      expect(result.totalHours).toBe(4);
    });

    it('rejects from after to', () => {
      expect(() => makeService().findRange('2026-05-02', '2026-05-01')).toThrow(
        ApiException,
      );
    });

    it('rejects ranges longer than a year', () => {
      try {
        makeService().findRange('2025-01-01', '2026-01-02');
        expect.fail('should have thrown');
      } catch (error) {
        expect((error as ApiException).getStatus()).toBe(
          HttpStatus.BAD_REQUEST,
        );
      }
    });
  });
});

describe('limitStatus', () => {
  it.each([
    [0, 'ok'],
    [31.9, 'ok'],
    [32, 'warning'],
    [40, 'warning'],
    [40.1, 'exceeded'],
  ] as const)('%d of 40 -> %s', (hours, expected) => {
    expect(limitStatus(hours, 40)).toBe(expected);
  });
});
