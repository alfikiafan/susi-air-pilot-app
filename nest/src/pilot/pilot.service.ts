import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../common/decorators/current-user.decorator.js';
import { ClockService } from '../core/clock.service.js';
import { DataService } from '../core/data/data.service.js';
import type { PilotProfileDto } from './dto/pilot-profile.dto.js';

@Injectable()
export class PilotService {
  constructor(
    private readonly data: DataService,
    private readonly clock: ClockService,
  ) {}

  getProfile(user: AuthUser): PilotProfileDto {
    const { name, totalFlightHours } = this.data.flightHours.pilot;
    return {
      username: user.username,
      name,
      totalFlightHours,
      avatarUrl: avatarUrlFor(name),
      today: this.clock.today(),
    };
  }
}

/** The mock data has no photo, so the avatar is an initials image in brand colours. */
function avatarUrlFor(name: string): string {
  const params = new URLSearchParams({
    name,
    background: '0E2138',
    color: 'FFFFFF',
    size: '128',
    bold: 'true',
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}
