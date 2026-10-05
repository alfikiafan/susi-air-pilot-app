import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
  username: string;
}

/** The pilot attached to the request by AuthGuard. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser =>
    ctx.switchToHttp().getRequest<{ user: AuthUser }>().user,
);
