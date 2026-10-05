import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../common/errors/api-error.js';
import {
  FlightHoursQueryDto,
  FlightHoursSummaryQueryDto,
} from './dto/flight-hours-query.dto.js';
import {
  FlightHoursResponseDto,
  FlightHoursSummaryDto,
} from './dto/flight-hours-response.dto.js';
import { FlightHoursService } from './flight-hours.service.js';

@ApiTags('flight-hours')
@ApiBearerAuth()
@ApiBadRequestResponse({ type: ErrorResponseDto })
@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHours: FlightHoursService) {}

  @Get()
  @ApiOperation({ summary: 'Daily flight hours between two dates (inclusive)' })
  @ApiOkResponse({ type: FlightHoursResponseDto })
  findRange(
    @Query() { from, to }: FlightHoursQueryDto,
  ): FlightHoursResponseDto {
    return this.flightHours.findRange(from, to);
  }

  @Get('summary')
  @ApiOperation({
    summary:
      'Rolling-sum series for the trend chart, plus the four limit cards',
    description: 'All rolling sums are computed here on the server.',
  })
  @ApiOkResponse({ type: FlightHoursSummaryDto })
  getSummary(
    @Query() { range }: FlightHoursSummaryQueryDto,
  ): FlightHoursSummaryDto {
    return this.flightHours.getSummary(range);
  }
}
