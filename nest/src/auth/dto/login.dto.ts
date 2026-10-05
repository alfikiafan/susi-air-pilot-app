import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'johndoe' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  username: string;

  @ApiProperty({ example: 'susiairtest' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: 'Bearer';

  @ApiProperty({ example: 43200, description: 'Token lifetime in seconds' })
  expiresIn: number;
}
