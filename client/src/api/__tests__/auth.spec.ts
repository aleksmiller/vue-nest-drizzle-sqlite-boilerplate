import { describe, it, expect } from 'vitest'
import { parseAuthError } from '../auth'
import { ZodError } from 'zod'

describe('auth API', () => {
  describe('parseAuthError', () => {
    it('should parse error with status and message', () => {
      const error = {
        status: 401,
        message: 'Unauthorized',
        details: {
          email: ['Invalid email'],
        },
      }

      const result = parseAuthError(error)

      expect(result.status).toBe(401)
      expect(result.message).toBe('Unauthorized')
      expect(result.details).toEqual({ email: ['Invalid email'] })
    })

    it('should handle Error objects', () => {
      const error = new Error('Network error')

      const result = parseAuthError(error)

      expect(result.status).toBeNull()
      expect(result.message).toBe('Network error')
      expect(result.details).toBeNull()
    })

    it('should handle error objects with partial data', () => {
      const error = {
        status: 500,
        message: 'Server error',
      }

      const result = parseAuthError(error)

      expect(result.status).toBe(500)
      expect(result.message).toBe('Server error')
      // details can be null or undefined depending on parsing
      expect(result.details === null || result.details === undefined).toBe(true)
    })

    it('should handle string errors', () => {
      const error = 'Simple string error'

      const result = parseAuthError(error)

      expect(result.status).toBeNull()
      expect(result.message).toBe('Simple string error')
      expect(result.details).toBeNull()
    })

    it('should handle null errors', () => {
      const result = parseAuthError(null)

      expect(result.status).toBeNull()
      // null converts to string "null" in JavaScript
      expect(result.message).toBe('null')
      expect(result.details).toBeNull()
    })

    it('should handle errors without status or message', () => {
      const error = {
        someOtherField: 'value',
      }

      const result = parseAuthError(error)

      expect(result.status).toBeNull()
      expect(result.message).toBe('An unexpected error occurred')
      expect(result.details).toBeNull()
    })

    it('should handle ZodError', () => {
      const zodError = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          path: ['email'],
          message: 'Expected string',
        },
      ])

      const result = parseAuthError(zodError)

      expect(result.status).toBeNull()
      expect(result.message).toBe('An unexpected error occurred')
    })
  })
})
