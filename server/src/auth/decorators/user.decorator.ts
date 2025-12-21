import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserSchema } from '../../../db/schema';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserSchema => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

