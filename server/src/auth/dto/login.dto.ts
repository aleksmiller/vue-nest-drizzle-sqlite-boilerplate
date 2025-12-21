import { z } from 'zod';
import { loginSchema } from '../../../lib/validators';

export class LoginDto {
  email: string;
  password: string;

  static fromZod(data: z.infer<typeof loginSchema>): LoginDto {
    const dto = new LoginDto();
    dto.email = data.email;
    dto.password = data.password;
    return dto;
  }
}
