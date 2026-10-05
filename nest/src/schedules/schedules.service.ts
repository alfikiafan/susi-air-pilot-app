import { Injectable } from '@nestjs/common';
import { ClockService } from '../core/clock.service.js';
import { DataService } from '../core/data/data.service.js';
import type { ScheduleRecord } from '../core/data/data.types.js';
import type { SchedulesQueryDto } from './dto/schedules-query.dto.js';
import type {
  ScheduleEntryDto,
  SchedulesResponseDto,
} from './dto/schedules-response.dto.js';

@Injectable()
export class SchedulesService {
  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  findByMonth({ year, month }: SchedulesQueryDto): SchedulesResponseDto {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    const schedules = this.data.schedules.schedules
      .filter((entry) => entry.duty_date.startsWith(prefix))
      .map(toEntryDto);

    return {
      year,
      month,
      today: this.clock.today(),
      schedules,
      legend: this.data.schedules.legend,
    };
  }
}

function toEntryDto(record: ScheduleRecord): ScheduleEntryDto {
  const remaining = Math.max(record.count_schedules - record.count_logbooks, 0);
  return { ...record, remaining, is_complete: remaining === 0 };
}
