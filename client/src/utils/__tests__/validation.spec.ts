import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { formatZodErrors, safeParse } from '../validation'

describe('validation utilities', () => {
  describe('formatZodErrors', () => {
    it('should format zod errors into record format', () => {
      const schema = z.object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        email: z.string().email('Invalid email'),
        age: z.number().min(18, 'Must be 18 or older'),
      })

      const result = schema.safeParse({
        username: 'ab',
        email: 'invalid',
        age: 16,
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const formatted = formatZodErrors(result.error)

      expect(formatted).toHaveProperty('username')
      expect(formatted).toHaveProperty('email')
      expect(formatted).toHaveProperty('age')
      expect(formatted.username).toContain('Username must be at least 3 characters')
      expect(formatted.email).toContain('Invalid email')
      expect(formatted.age).toContain('Must be 18 or older')
    })

    it('should handle nested paths', () => {
      const schema = z.object({
        user: z.object({
          name: z.string().min(1, 'Name is required'),
        }),
      })

      const result = schema.safeParse({
        user: {
          name: '',
        },
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const formatted = formatZodErrors(result.error)
      expect(formatted).toHaveProperty('user.name')
      expect(formatted['user.name']).toContain('Name is required')
    })

    it('should handle multiple errors for same field', () => {
      const schema = z.object({
        password: z
          .string()
          .min(8, 'Password must be at least 8 characters')
          .regex(/[A-Z]/, 'Password must contain uppercase letter'),
      })

      const result = schema.safeParse({
        password: 'short',
      })

      expect(result.success).toBe(false)
      if (result.success) return
      const formatted = formatZodErrors(result.error)
      expect(formatted.password?.length ?? 0).toBeGreaterThan(1)
    })
  })

  describe('safeParse', () => {
    it('should return success with data when validation passes', () => {
      const schema = z.object({
        username: z.string(),
        email: z.string().email(),
      })

      const data = {
        username: 'testuser',
        email: 'test@example.com',
      }

      const result = safeParse(schema, data)

      expect(result.success).toBe(true)
      expect(result.success ? result.data : result.errors).toEqual(data)
    })

    it('should return errors when validation fails', () => {
      const schema = z.object({
        username: z.string().min(3, 'Username too short'),
        email: z.string().email('Invalid email'),
      })

      const data = {
        username: 'ab',
        email: 'invalid',
      }

      const result = safeParse(schema, data)

      expect(result.success).toBe(false)
      expect(result.success ? result.data : result.errors).toHaveProperty('username')
      expect(result.success ? result.data : result.errors).toHaveProperty('email')
      expect(result.success ? result.data : (result.errors.username as string[])).toContain(
        'Username too short',
      )
      expect(result.success ? result.data : (result.errors.email as string[])).toContain(
        'Invalid email',
      )
    })

    it('should handle empty object', () => {
      const schema = z.object({
        username: z.string(),
      })

      const result = safeParse(schema, {})

      expect(result.success).toBe(false)
      expect(result.success ? result.data : result.errors).toHaveProperty('username')
    })

    it('should handle null values', () => {
      const schema = z.object({
        username: z.string().nullable(),
      })

      const result = safeParse(schema, { username: null })

      expect(result.success).toBe(true)
      expect(result.success ? result.data.username : null).toBeNull()
    })
  })
})
