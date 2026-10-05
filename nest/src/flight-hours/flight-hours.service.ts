import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException, ErrorCode } from '../common/errors/api-error.js';
import { addDays, diffDays, eachDay } from '../common/utils/date.util.js';
import { ClockService } from '../core/clock.service.js';
import { DataService } from '../core/data/data.service.js';
import type { RangeKey } from '../core/data/data.types.js';
import type {
  FlightHoursResponseDto,
  FlightHoursSummaryDto,
  LimitCardDto,
  LimitStatus,
  SummaryPointDto,
} from './dto/flight-hours-response.dto.js';
import { roundHours, rollingSum, windowStart } from './rolling-sum.js';

/** Longest range /flight-hours will return in one call. */
export const MAX_RANGE_DAYS = 366;
/** A limit card turns amber from this share of its limit. */
export const WARNING_RATIO = 0.8;

const CARDS: { key: LimitCardDto['key']; label: string; windowDays: number }[] =
  [
    { key: 'daily', label: 'Daily', windowDays: 1 },
    { key: 'weekly', label: 'Weekly', windowDays: 7 },
    { key: 'monthly', label: 'Monthly', windowDays: 30 },
    { key: 'annual', label: 'Annual', windowDays: 365 },
  ];

@Injectable()
export class FlightHoursService {
  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  findRange(from: string, to: string): FlightHoursResponseDto {
    if (from > to) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.ValidationError,
        'Validation failed',
        ['from must not be after to'],
      );
    }
    if (diffDays(from, to) + 1 > MAX_RANGE_DAYS) {
      throw new ApiException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.ValidationError,
        'Validation failed',
        [`range must not exceed ${MAX_RANGE_DAYS} days`],
      );
    }

    const today = this.clock.today();
    const days = eachDay(from, to).map((date) => ({
      date,
      hours: this.data.hoursByDate.get(date) ?? 0,
      projected: date > today,
    }));
    const totalHours = roundHours(
      days.reduce((sum, day) => sum + day.hours, 0),
    );

    return { from, to, today, totalHours, days };
  }

  getSummary(range: RangeKey): FlightHoursSummaryDto {
    const today = this.clock.today();
    const { limit, max, windowDays, displayRangeDays } =
      this.data.flightHours.chartBounds[range];
    const firstRecord = this.data.firstFlightDate;

    const points: SummaryPointDto[] = eachDay(
      addDays(today, -displayRangeDays),
      addDays(today, displayRangeDays),
    ).map((date) => {
      const value = rollingSum(this.data.hoursByDate, date, windowDays);
      return {
        date,
        value,
        isToday: date === today,
        projected: date > today,
        exceedsLimit: value > limit,
        partialWindow: windowStart(date, windowDays) < firstRecord,
      };
    });

    return {
      range,
      today,
      windowDays,
      limit,
      yMax: max,
      peak: Math.max(...points.map((point) => point.value)),
      points,
      cards: this.getLimitCards(today),
    };
  }

  private getLimitCards(today: string): LimitCardDto[] {
    const limits = this.data.flightHours.limits;
    return CARDS.map(({ key, label, windowDays }) => {
      const hours = rollingSum(this.data.hoursByDate, today, windowDays);
      const limit = limits[key];
      return {
        key,
        label,
        windowDays,
        hours,
        limit,
        remaining: roundHours(Math.max(limit - hours, 0)),
        percentUsed: Math.round((hours / limit) * 100),
        status: limitStatus(hours, limit),
      };
    });
  }
}

export function limitStatus(hours: number, limit: number): LimitStatus {
  if (hours > limit) return 'exceeded';
  if (hours >= limit * WARNING_RATIO) return 'warning';
  return 'ok';
}
