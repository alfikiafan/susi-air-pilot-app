/** Response shapes of the Nest API. Kept in step with the DTOs in /nest. */

export type RangeKey = '1w' | '1m' | '3m' | '6m' | '1y';
export const RANGE_KEYS: readonly RangeKey[] = ['1w', '1m', '3m', '6m', '1y'];

export interface ApiError {
  statusCode: number;
  code: string;
  message: string;
  details?: string[];
  path: string;
  timestamp: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface PilotProfile {
  username: string;
  name: string;
  totalFlightHours: number;
  avatarUrl: string;
  /** The server's reference date; the app never reads "today" from the device clock. */
  today: string;
}

export type LimitStatus = 'ok' | 'warning' | 'exceeded';

export interface LimitCard {
  key: 'daily' | 'weekly' | 'monthly' | 'annual';
  label: string;
  windowDays: number;
  hours: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  status: LimitStatus;
}

export interface SummaryPoint {
  date: string;
  value: number;
  isToday: boolean;
  projected: boolean;
  exceedsLimit: boolean;
  partialWindow: boolean;
}

export interface FlightHoursSummary {
  range: RangeKey;
  today: string;
  windowDays: number;
  limit: number;
  yMax: number;
  peak: number;
  points: SummaryPoint[];
  cards: LimitCard[];
}

export type DocumentStatus = 'expired' | 'soon' | 'safe';

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
}

export interface DocumentsResponse {
  today: string;
  warningDays: number;
  documents: PilotDocument[];
}

/** Field names follow mock-schedules.json (snake_case), as the API returns them. */
export interface ScheduleEntry {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
  remaining: number;
  is_complete: boolean;
}

export interface LegendItem {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesResponse {
  year: number;
  month: number;
  today: string;
  schedules: ScheduleEntry[];
  legend: LegendItem[];
}
