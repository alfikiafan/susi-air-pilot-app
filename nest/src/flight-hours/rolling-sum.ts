import { addDays } from '../common/utils/date.util.js';

/** First date covered by the window that ends on `endDate`. */
export function windowStart(endDate: string, windowDays: number): string {
  return addDays(endDate, -(windowDays - 1));
}

export function roundHours(hours: number): number {
  return Math.round(hours * 10) / 10;
}
