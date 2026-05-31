import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  registerSchema,
  loginSchema,
  type RegisterInput,
  type LoginInput,
} from '../../lib/validators';
import { lucia } from '../../lib/lucia';

/**
 * Controller handling authentication endpoints
 */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * @param body - Registration data
   * @param res - Express response object
   * @returns Registration result with session cookie
   */
  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body(new ZodValidationPipe(registerSchema)) body: RegisterInput,
    @Res() res: Response,
  ) {
    const result = await this.authService.register(body);

    // Set session cookie
    const sessionCookie = lucia.createSessionCookie(result.sessionId);
    res.cookie(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return res.json({
      message: result.message,
      userId: result.userId,
    });
  }

  /**
   * Login with email and password
   * @param body - Login credentials
   * @param res - Express response object
   * @returns Login result with session cookie
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Res() res: Response,
  ) {
    const result = await this.authService.login(body);

    // Set session cookie
    const sessionCookie = lucia.createSessionCookie(result.sessionId);
    res.cookie(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return res.json({
      message: result.message,
      userId: result.userId,
    });
  }

  /**
   * Sign out the current user
   * @param req - Express request object
   * @param res - Express response object
   * @returns Sign out confirmation with cleared session cookie
   */
  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@Req() req: Request, @Res() res: Response) {
    const sessionId =
      req.cookies?.[lucia.sessionCookieName] ||
      req.signedCookies?.[lucia.sessionCookieName] ||
      null;

    if (!sessionId) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.authService.signOut(sessionId);

    // Clear session cookie
    const sessionCookie = lucia.createBlankSessionCookie();
    res.cookie(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    );

    return res.json({
      message: 'Signed out successfully',
    });
  }
}
