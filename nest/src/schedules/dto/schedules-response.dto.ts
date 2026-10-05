import { ApiProperty } from '@nestjs/swagger';

/**
 * Field names are kept as in mock-schedules.json (snake_case), since the brief
 * refers to them by name. `remaining` and `is_complete` are added by the API.
 */
export class ScheduleEntryDto {
  @ApiProperty({ example: '97000' })
  id: string;

  @ApiProperty({ example: '2026-05-04' })
  duty_date: string;

  @ApiProperty({
    example: 2,
    description: '1 = pending/upcoming, 2 = completed/verified',
  })
  status: number;

  @ApiProperty({
    example: 'MKW',
    description: 'Short code shown under the day number',
  })
  base_name: string;

  @ApiProperty({
    example: '#10B981',
    description: 'Fill colour for the day cell',
  })
  base_color: string;

  @ApiProperty({ example: 'DTY', description: 'Matches a legend code' })
  duty_type: string;

  @ApiProperty({ example: 4 })
  count_schedules: number;

  @ApiProperty({ example: 2 })
  count_logbooks: number;

  @ApiProperty({
    example: 2,
    description: 'count_schedules - count_logbooks, never below 0',
  })
  remaining: number;

  @ApiProperty({
    example: false,
    description: 'True when count_logbooks equals count_schedules: show a tick',
  })
  is_complete: boolean;
}

export class LegendItemDto {
  @ApiProperty({ example: 'DTY' })
  code: string;

  @ApiProperty({ example: 'On Duty' })
  label: string;

  @ApiProperty({ example: '#10B981' })
  color: string;
}

export class SchedulesResponseDto {
  @ApiProperty({ example: 2026 })
  year: number;

  @ApiProperty({ example: 5 })
  month: number;

  @ApiProperty({ example: '2026-05-15' })
  today: string;

  @ApiProperty({
    type: [ScheduleEntryDto],
    description: 'Sorted by date; empty for months with no data',
  })
  schedules: ScheduleEntryDto[];

  @ApiProperty({ type: [LegendItemDto] })
  legend: LegendItemDto[];
}
