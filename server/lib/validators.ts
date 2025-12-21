import { z } from 'zod';

export const registerSchema = z.object({
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

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'), // Basic check, more on server
});

export const profileUpdateSchema = z
  .object({
    firstName: z.string().max(50, 'First name too long').optional().nullable(),
    lastName: z.string().max(50, 'Last name too long').optional().nullable(),
    bio: z.string().max(500, 'Bio too long').optional().nullable(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: 'At least one field must be provided for update.', // Ensure at least one field is being updated
  });
