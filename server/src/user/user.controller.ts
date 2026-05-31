import {
  Controller,
  Get,
  Put,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  profileUpdateSchema,
  type ProfileUpdateInput,
} from '../../lib/validators';
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
  async updateProfile(
    @Body(new ZodValidationPipe(profileUpdateSchema)) body: ProfileUpdateInput,
    @User() user: { id: string },
  ) {
    return await this.userService.updateProfile(user.id, body);
  }
}
