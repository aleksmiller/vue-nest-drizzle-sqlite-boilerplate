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

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  @Post('sign-out')
  @HttpCode(HttpStatus.OK)
  async signOut(@Req() req: Request, @Res() res: Response) {
    // Get session ID from cookie (cookie-parser populates req.cookies)
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

