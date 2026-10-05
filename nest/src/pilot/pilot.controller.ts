import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  type AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator.js';
import { PilotProfileDto } from './dto/pilot-profile.dto.js';
import { PilotService } from './pilot.service.js';

@ApiTags('pilot')
@ApiBearerAuth()
@Controller('pilot')
export class PilotController {
  constructor(private readonly pilot: PilotService) {}

  @Get('me')
  @ApiOperation({ summary: 'Profile of the signed-in pilot' })
  @ApiOkResponse({ type: PilotProfileDto })
  me(@CurrentUser() user: AuthUser): PilotProfileDto {
    return this.pilot.getProfile(user);
  }
}
