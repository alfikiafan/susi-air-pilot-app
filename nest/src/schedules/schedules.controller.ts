import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/errors/api-error.js';
import { SchedulesQueryDto } from './dto/schedules-query.dto.js';
import { SchedulesResponseDto } from './dto/schedules-response.dto.js';
import { SchedulesService } from './schedules.service.js';

@ApiTags('schedules')
@ApiBearerAuth()
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedules: SchedulesService) {}

  @Get()
  @ApiOperation({ summary: 'Schedule entries and duty legend for one month' })
  @ApiOkResponse({ type: SchedulesResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  findByMonth(@Query() query: SchedulesQueryDto): SchedulesResponseDto {
    return this.schedules.findByMonth(query);
  }
}
