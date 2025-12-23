import { describe, it, expect, beforeEach, vi } from 'vitest'
import { register, login, signOut, parseAuthError } from '../auth'
import apiClient from '../axios'
import { ZodError } from 'zod'

// Mock axios client
vi.mock('../axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        data: {
          message: 'User registered successfully',
          userId: 'user-123',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await register(registerData)

      expect(result).toEqual(mockResponse.data)
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', registerData)
    })

    it('should throw error for invalid data', async () => {
      const invalidData = {
        username: '',
        email: 'invalid-email',
        password: '12',
      }

      await expect(
        register(invalidData as { username: string; email: string; password: string }),
      ).rejects.toThrow()
    })
  })

  describe('login', () => {
    it('should login successfully', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      }

      const mockResponse = {
        data: {
          message: 'Logged in successfully',
          userId: 'user-123',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await login(loginData)

      expect(result).toEqual(mockResponse.data)
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', loginData)
    })

    it('should throw error for invalid credentials format', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '',
      }

      await expect(login(invalidData as { email: string; password: string })).rejects.toThrow()
    })
  })

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Signed out successfully',
        },
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await signOut()

      expect(result).toEqual(mockResponse.data)
      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/sign-out')
    })
  })

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
          received: 'number',
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
