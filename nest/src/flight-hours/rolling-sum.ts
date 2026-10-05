import { addDays } from '../common/utils/date.util.js';

/**
 * Rolling-sum math, kept free of Nest so it can be unit-tested directly.
 *
 * The rolling sum for a date D over a window of N days is the total hours
 * flown from D-(N-1) to D inclusive. Rules for the edge cases in the brief:
 * - A day with no record counts as 0, it is never skipped, so a window always spans N calendar days.
 * - Days before the first record count as 0 too (no flying is on record), and the
 *   point is flagged `partialWindow` so a client can say the history is incomplete.
 * - Future dates (after today) are summed the same way, using the hours already in
 *   the dataset for those days, which we read as planned flying. The point is
 *   flagged `projected`, so the chart shows where the current plan will take the pilot.
 */

/** Sums hours for the `windowDays` days ending on `endDate`, rounded to 0.1 h to avoid float drift. */
export function rollingSum(
  hoursByDate: ReadonlyMap<string, number>,
  endDate: string,
  windowDays: number,
): number {
  let total = 0;
  for (let offset = 0; offset < windowDays; offset++) {
    total += hoursByDate.get(addDays(endDate, -offset)) ?? 0;
  }
  return roundHours(total);
}

/** First date covered by the window that ends on `endDate`. */
export function windowStart(endDate: string, windowDays: number): string {
  return addDays(endDate, -(windowDays - 1));
}

export function roundHours(hours: number): number {
  return Math.round(hours * 10) / 10;
}
