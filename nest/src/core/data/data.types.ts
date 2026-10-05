/** Shapes of the provided mock JSON files, as they are on disk. */

export type RangeKey = '1w' | '1m' | '3m' | '6m' | '1y';
export const RANGE_KEYS: readonly RangeKey[] = ['1w', '1m', '3m', '6m', '1y'];

export interface ChartBound {
  limit: number;
  max: number;
  windowDays: number;
  displayRangeDays: number;
}

export interface FlightHoursFile {
  pilot: { name: string; totalFlightHours: number };
  limits: { daily: number; weekly: number; monthly: number; annual: number };
  chartBounds: Record<RangeKey, ChartBound>;
  flightHours: { date: string; hours: number }[];
}

export interface DocumentsFile {
  today: string;
  thresholds: { warningDays: number };
  documents: { id: string; label: string; expiryDate: string }[];
}

export interface ScheduleRecord {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
}

export interface LegendRecord {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesFile {
  today: string;
  legend: LegendRecord[];
  schedules: ScheduleRecord[];
}
