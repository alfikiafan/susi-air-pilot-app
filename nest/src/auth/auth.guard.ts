import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../common/decorators/public.decorator.js';
import { ApiException, ErrorCode } from '../common/errors/api-error.js';
import { AuthService } from './auth.service.js';

/** Registered globally: every route needs a valid Bearer token unless marked @Public(). */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    const user =
      scheme === 'Bearer' && token ? await this.auth.verify(token) : null;
    if (!user) {
      throw new ApiException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.Unauthorized,
        'Missing or invalid access token',
      );
    }

    request.user = user;
    return true;
  }
}
