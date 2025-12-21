import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { registerSchema, loginSchema } from '../../lib/validators';
import { ZodError } from 'zod';
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
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: unknown, @Res() res: Response) {
    try {
      const parsedBody = registerSchema.parse(body);
      const registerDto = RegisterDto.fromZod(parsedBody);
      const result = await this.authService.register(registerDto);

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
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          error: 'Invalid input',
          details: error.flatten().fieldErrors,
        });
      }
      throw error;
    }
  }

  /**
   * Login with email and password
   * @param body - Login credentials
   * @param res - Express response object
   * @returns Login result with session cookie
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown, @Res() res: Response) {
    try {
      const parsedBody = loginSchema.parse(body);
      const loginDto = LoginDto.fromZod(parsedBody);
      const result = await this.authService.login(loginDto);

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
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          error: 'Invalid input',
          details: error.flatten().fieldErrors,
        });
      }
      throw error;
    }
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
