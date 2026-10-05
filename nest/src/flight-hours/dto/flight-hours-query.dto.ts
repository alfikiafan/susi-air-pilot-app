import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { IsIsoDate } from '../../common/validators/is-iso-date.validator.js';
import { RANGE_KEYS, type RangeKey } from '../../core/data/data.types.js';

export class FlightHoursQueryDto {
  @ApiProperty({ example: '2026-05-01', description: 'Inclusive start date' })
  @IsIsoDate()
  from: string;

  @ApiProperty({
    example: '2026-05-15',
    description: 'Inclusive end date; must not be before `from`',
  })
  @IsIsoDate()
  to: string;
}

export class FlightHoursSummaryQueryDto {
  @ApiPropertyOptional({ enum: RANGE_KEYS, default: '1w' })
  @IsOptional()
  @IsIn(RANGE_KEYS)
  range: RangeKey = '1w';
}
