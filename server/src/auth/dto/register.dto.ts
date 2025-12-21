import { z } from 'zod';
import { registerSchema } from '../../../lib/validators';

export class RegisterDto {
  username: string;
  email: string;
  password: string;

  static fromZod(data: z.infer<typeof registerSchema>): RegisterDto {
    const dto = new RegisterDto();
    dto.username = data.username;
    dto.email = data.email;
    dto.password = data.password;
    return dto;
  }
}
