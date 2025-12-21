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

@Controller('api/user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@User() user: { id: string }) {
    return await this.userService.getProfile(user.id);
  }

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

