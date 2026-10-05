/**
 * Calendar helpers on ISO `YYYY-MM-DD` strings, evaluated in UTC so the device
 * timezone can never shift a date. "Today" always comes from the API.
 */

export interface YearMonth {
  year: number;
  month: number; // 1-12
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function yearMonthOf(isoDate: string): YearMonth {
  return {
    year: Number(isoDate.slice(0, 4)),
    month: Number(isoDate.slice(5, 7)),
  };
}

export function shiftMonth(
  { year, month }: YearMonth,
  delta: number,
): YearMonth {
  const index = year * 12 + (month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

export function daysInMonth({ year, month }: YearMonth): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** 0 = Monday … 6 = Sunday. */
export function weekdayIndex(isoDate: string): number {
  return (new Date(`${isoDate}T00:00:00Z`).getUTCDay() + 6) % 7;
}

const utc = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

export const formatMonthYear = ({ year, month }: YearMonth) =>
  new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));

/** "15 May 2026" */
export const formatDate = (isoDate: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utc(isoDate));

/** "Fri, 15 May 2026" */
export const formatLongDate = (isoDate: string) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utc(isoDate));

/** "15" for chart axes */
export const formatDayNumber = (isoDate: string) =>
  String(Number(isoDate.slice(8, 10)));

/** "Fri" */
export const formatWeekdayShort = (isoDate: string) =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(utc(isoDate));
