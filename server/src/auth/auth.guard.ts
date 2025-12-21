import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { validateRequest } from '../../lib/lucia';
import { Request, Response } from 'express';

/**
 * Guard to protect routes that require authentication
 * Validates session and attaches user to request
 */
@Injectable()
export class AuthGuard implements CanActivate {
  /**
   * Check if the request has a valid authenticated session
   * @param context - Execution context containing request and response
   * @returns true if authenticated, throws UnauthorizedException otherwise
   */
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
