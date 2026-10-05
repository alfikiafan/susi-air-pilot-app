import { timingSafeEqual } from 'node:crypto';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiException, ErrorCode } from '../common/errors/api-error.js';
import type { AuthUser } from '../common/decorators/current-user.decorator.js';
import type { AppConfig } from '../config/app.config.js';
import { APP_CONFIG } from '../core/config.token.js';
import type { LoginDto, LoginResponseDto } from './dto/login.dto.js';

/** The single hardcoded pilot account required by the brief. */
const PILOT_ACCOUNT = { username: 'johndoe', password: 'susiairtest' };

interface TokenPayload {
  sub: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  async login({ username, password }: LoginDto): Promise<LoginResponseDto> {
    // Check both fields even when the username is wrong, so timing does not reveal which one failed.
    const userOk = safeEqual(username, PILOT_ACCOUNT.username);
    const passOk = safeEqual(password, PILOT_ACCOUNT.password);
    if (!userOk || !passOk) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.InvalidCredentials,
        'Invalid username or password',
      );
    }

    const payload: TokenPayload = { sub: PILOT_ACCOUNT.username };
    return {
      accessToken: await this.jwt.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn: this.config.jwtExpiresIn,
    };
  }

  /** Returns the user for a valid token, or null for a missing, malformed, expired or forged one. */
  async verify(token: string): Promise<AuthUser | null> {
    try {
      const { sub } = await this.jwt.verifyAsync<TokenPayload>(token);
      return sub === PILOT_ACCOUNT.username ? { username: sub } : null;
    } catch {
      return null;
    }
  }
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
