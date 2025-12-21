import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserSchema } from '../../../db/schema';

/**
 * Custom decorator to extract authenticated user from request
 * Use with @User() in controller methods
 * Requires AuthGuard to be applied to the route
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserSchema => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

