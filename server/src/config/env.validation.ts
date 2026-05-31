import { z } from 'zod';

/**
 * Schema for the environment variables the server depends on.
 * Unknown variables are passed through untouched; known ones are validated
 * and given sensible defaults.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_PATH: z.string().min(1, 'DATABASE_PATH is required'),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * ConfigModule `validate` hook — fails fast at boot if env is misconfigured.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const issues = z.flattenError(parsed.error).fieldErrors;
    throw new Error(`Invalid environment variables: ${JSON.stringify(issues)}`);
  }
  // Keep unknown vars, overlay the validated/coerced known ones.
  return { ...config, ...parsed.data };
}
