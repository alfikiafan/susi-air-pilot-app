import { ApiProperty } from '@nestjs/swagger';
import { RANGE_KEYS, type RangeKey } from '../../core/data/data.types.js';

export class DailyHoursDto {
  @ApiProperty({ example: '2026-05-15' })
  date: string;

  @ApiProperty({
    example: 6.4,
    description: '0 when nothing is on record for the day',
  })
  hours: number;

  @ApiProperty({
    example: false,
    description: 'True for dates after today: planned, not yet flown',
  })
  projected: boolean;
}

export class FlightHoursResponseDto {
  @ApiProperty({ example: '2026-05-01' })
  from: string;

  @ApiProperty({ example: '2026-05-15' })
  to: string;

  @ApiProperty({ example: '2026-05-15' })
  today: string;

  @ApiProperty({ example: 61.3 })
  totalHours: number;

  @ApiProperty({
    type: [DailyHoursDto],
    description: 'One entry per calendar day, gaps filled with 0',
  })
  days: DailyHoursDto[];
}

export type LimitStatus = 'ok' | 'warning' | 'exceeded';

export class LimitCardDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly', 'annual'] })
  key: 'daily' | 'weekly' | 'monthly' | 'annual';

  @ApiProperty({ example: 'Weekly' })
  label: string;

  @ApiProperty({ example: 7 })
  windowDays: number;

  @ApiProperty({
    example: 25.2,
    description: 'Hours flown in the window ending today',
  })
  hours: number;

  @ApiProperty({ example: 40 })
  limit: number;

  @ApiProperty({
    example: 14.8,
    description: 'Hours left before the limit, never below 0',
  })
  remaining: number;

  @ApiProperty({
    example: 63,
    description: 'hours / limit, as a whole percent (can exceed 100)',
  })
  percentUsed: number;

  @ApiProperty({
    enum: ['ok', 'warning', 'exceeded'],
    description: 'warning from 80% of the limit',
  })
  status: LimitStatus;
}

export class SummaryPointDto {
  @ApiProperty({ example: '2026-05-15' })
  date: string;

  @ApiProperty({
    example: 25.2,
    description: 'Rolling sum for the window ending on this date',
  })
  value: number;

  @ApiProperty({ example: true })
  isToday: boolean;

  @ApiProperty({
    example: false,
    description: 'Date is after today, so the value includes planned hours',
  })
  projected: boolean;

  @ApiProperty({ example: false })
  exceedsLimit: boolean;

  @ApiProperty({
    example: false,
    description:
      'Window starts before the first record; missing days counted as 0',
  })
  partialWindow: boolean;
}

export class FlightHoursSummaryDto {
  @ApiProperty({ enum: RANGE_KEYS, example: '1w' })
  range: RangeKey;

  @ApiProperty({ example: '2026-05-15' })
  today: string;

  @ApiProperty({ example: 7, description: 'Days summed for each point' })
  windowDays: number;

  @ApiProperty({ example: 40, description: 'Red limit line' })
  limit: number;

  @ApiProperty({ example: 45, description: 'Chart Y-axis maximum' })
  yMax: number;

  @ApiProperty({
    example: 44.7,
    description: 'Highest value in `points`; may exceed yMax in other datasets',
  })
  peak: number;

  @ApiProperty({
    type: [SummaryPointDto],
    description: '7 days before today, today, 7 days after',
  })
  points: SummaryPointDto[];

  @ApiProperty({
    type: [LimitCardDto],
    description: 'Daily, weekly, monthly and annual totals as of today',
  })
  cards: LimitCardDto[];
}
