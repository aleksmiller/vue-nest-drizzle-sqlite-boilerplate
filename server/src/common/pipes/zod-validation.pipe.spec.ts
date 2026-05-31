import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
  });
  const pipe = new ZodValidationPipe(schema);

  it('returns the parsed value for valid input', () => {
    const value = { email: 'test@example.com', password: 'password123' };
    expect(pipe.transform(value)).toEqual(value);
  });

  it('strips unknown keys', () => {
    const result = pipe.transform({
      email: 'test@example.com',
      password: 'password123',
      role: 'admin',
    });
    expect(result).not.toHaveProperty('role');
  });

  it('throws BadRequestException for invalid input', () => {
    expect(() =>
      pipe.transform({ email: 'not-an-email', password: '123' }),
    ).toThrow(BadRequestException);
  });

  it('exposes field errors in the expected shape', () => {
    try {
      pipe.transform({ email: 'not-an-email', password: '123' });
      fail('expected the pipe to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        error: string;
        details: Record<string, string[]>;
      };
      expect(response.error).toBe('Invalid input');
      expect(response.details.email).toBeDefined();
      expect(response.details.password).toBeDefined();
    }
  });
});
