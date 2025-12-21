import { z } from 'zod';
import { profileUpdateSchema } from '../../../lib/validators';

export class ProfileUpdateDto {
  firstName?: string | null;
  lastName?: string | null;
  bio?: string | null;

  static fromZod(data: z.infer<typeof profileUpdateSchema>): ProfileUpdateDto {
    const dto = new ProfileUpdateDto();
    dto.firstName = data.firstName;
    dto.lastName = data.lastName;
    dto.bio = data.bio;
    return dto;
  }
}

