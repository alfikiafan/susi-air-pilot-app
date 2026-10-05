import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
import { ErrorResponseDto } from '../common/errors/api-error.js';
import { AuthService } from './auth.service.js';
import { LoginDto, LoginResponseDto } from './dto/login.dto.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange pilot credentials for an access token' })
  @ApiOkResponse({ type: LoginResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'code: INVALID_CREDENTIALS',
  })
  login(@Body() body: LoginDto): Promise<LoginResponseDto> {
    return this.auth.login(body);
  }
}
