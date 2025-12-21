import { z } from 'zod';

// Auth schemas
export const loginCredentialsSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'), // Basic check, more on server
});

export const registerDataSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
});

export const authResponseSchema = z.object({
  message: z.string(),
  userId: z.string(),
});

// Server returns errors in format: { error: string, details?: Record<string, string[]> }
// We normalize this to a consistent format
export const authErrorSchema = z.object({
  status: z.number().nullable(),
  message: z.string(),
  details: z.record(z.string(), z.array(z.string())).nullable().optional(),
});

// User schemas
export const userProfileSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string().email(),
  createdAt: z.union([z.string(), z.date()]),
  profile: z
    .object({
      userId: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      bio: z.string().nullable(),
      updatedAt: z.union([z.string(), z.date()]).nullable(),
    })
    .nullable(),
});

export const profileUpdateDataSchema = z
  .object({
    firstName: z.string().max(50, 'First name too long').optional().nullable(),
    lastName: z.string().max(50, 'Last name too long').optional().nullable(),
    bio: z.string().max(500, 'Bio too long').optional().nullable(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided for update.',
  });

export const profileUpdateResponseSchema = z.object({
  message: z.string(),
  profile: z
    .object({
      userId: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      bio: z.string().nullable(),
      updatedAt: z.union([z.string(), z.date()]).nullable(),
    })
    .nullable(),
});

export const apiErrorSchema = z.object({
  status: z.number().nullable(),
  message: z.string(),
  details: z.record(z.string(), z.array(z.string())).nullable().optional(),
});

// Type exports inferred from schemas
export type LoginCredentials = z.infer<typeof loginCredentialsSchema>;
export type RegisterData = z.infer<typeof registerDataSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
export type AuthError = z.infer<typeof authErrorSchema>;
export type UserProfile = z.infer<typeof userProfileSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateDataSchema>;
export type ProfileUpdateResponse = z.infer<typeof profileUpdateResponseSchema>;
export type ApiError = z.infer<typeof apiErrorSchema>;

