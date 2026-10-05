import { ApiProperty } from '@nestjs/swagger';

export class PilotProfileDto {
  @ApiProperty({ example: 'johndoe' })
  username: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 1444.5 })
  totalFlightHours: number;

  @ApiProperty({ example: 'https://ui-avatars.com/api/?name=John+Doe' })
  avatarUrl: string;

  @ApiProperty({
    example: '2026-05-15',
    description:
      "The server's reference date, so clients never derive today from the device clock",
  })
  today: string;
}
