import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { validateRequest } from '../../lib/lucia';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { user, session } = await validateRequest(request, response);

    if (!user || !session) {
      throw new UnauthorizedException('Unauthorized');
    }

    // Attach user and session to request for use in controllers
    (request as any).user = user;
    (request as any).session = session;

    return true;
  }
}

