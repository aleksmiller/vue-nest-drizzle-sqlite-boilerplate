import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ProfileUpdateDto } from './dto/profile-update.dto';
import { profileUpdateSchema } from '../../lib/validators';
import { ZodError } from 'zod';
import { AuthGuard } from '../auth/auth.guard';
import { User } from '../auth/decorators/user.decorator';

/**
 * Controller handling user profile endpoints
 * All routes are protected with AuthGuard
 */
@Controller('api/user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Get the current user's profile
   * @param user - Authenticated user from @User() decorator
   * @returns User profile data
   */
  @Get('profile')
  async getProfile(@User() user: { id: string }) {
    return await this.userService.getProfile(user.id);
  }

  /**
   * Update the current user's profile
   * @param body - Profile update data
   * @param user - Authenticated user from @User() decorator
   * @returns Updated profile data
   */
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Body() body: unknown, @User() user: { id: string }) {
    try {
      const parsedBody = profileUpdateSchema.parse(body);
      const profileUpdateDto = ProfileUpdateDto.fromZod(parsedBody);
      return await this.userService.updateProfile(user.id, profileUpdateDto);
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
}

