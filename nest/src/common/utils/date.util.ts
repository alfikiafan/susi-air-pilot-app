/**
 * Calendar-date helpers. All dates are ISO `YYYY-MM-DD` strings handled in UTC,
 * so results never shift with the server's timezone.
 */
const DAY_MS = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Parses `YYYY-MM-DD` to a UTC timestamp; returns null for malformed or impossible dates (e.g. 2026-02-30). */
export function parseIsoDate(value: string): number | null {
  if (!ISO_DATE.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  if (Number.isNaN(time)) return null;
  return toIsoDate(time) === value ? time : null;
}

export function isValidIsoDate(value: string): boolean {
  return parseIsoDate(value) !== null;
}

export function toIsoDate(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

export function addDays(date: string, days: number): string {
  return toIsoDate(requireDate(date) + days * DAY_MS);
}

/** Whole days from `from` to `to` (positive when `to` is later). */
export function diffDays(from: string, to: string): number {
  return Math.round((requireDate(to) - requireDate(from)) / DAY_MS);
}

/** Inclusive list of dates from `from` to `to`. */
export function eachDay(from: string, to: string): string[] {
  const days: string[] = [];
  for (let date = from; date <= to; date = addDays(date, 1)) days.push(date);
  return days;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function requireDate(date: string): number {
  const time = parseIsoDate(date);
  if (time === null) throw new Error(`Invalid ISO date: ${date}`);
  return time;
}
