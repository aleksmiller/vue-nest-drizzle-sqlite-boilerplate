import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { z, ZodError, type ZodType } from 'zod';

/**
 * Validates and parses an incoming request body against a Zod schema.
 * On failure it throws a BadRequestException shaped as
 * `{ error: 'Invalid input', details: { field: [messages] } }`,
 * matching the format the client expects.
 *
 * Usage: `@Body(new ZodValidationPipe(registerSchema)) body: RegisterInput`
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          error: 'Invalid input',
          details: z.flattenError(error).fieldErrors,
        });
      }
      throw error;
    }
  }
}
