import {
  authErrorSchema,
  type LoginCredentials,
  type RegisterData,
  type AuthResponse,
  type AuthError,
} from './schemas'

// Re-export types for convenience
export type { LoginCredentials, RegisterData, AuthResponse, AuthError }

/**
 * Parse and validate an auth error from the API into a consistent shape.
 * Accepts the `{ status, message, details }` objects thrown by the auth store.
 */
export function parseAuthError(error: unknown): AuthError {
  if (typeof error === 'object' && error !== null) {
    // Already in the expected shape.
    if ('status' in error && 'message' in error) {
      try {
        return authErrorSchema.parse(error)
      } catch {
        return {
          status: (error as { status?: number }).status ?? null,
          message: (error as { message?: string }).message || 'An unexpected error occurred',
          details: (error as { details?: Record<string, string[]> }).details || null,
        }
      }
    }

    // Native Error objects (e.g. thrown by the store on failed re-auth).
    if (error instanceof Error) {
      return {
        status: null,
        message: error.message || 'An unexpected error occurred',
        details: null,
      }
    }

    try {
      return authErrorSchema.parse(error)
    } catch {
      return {
        status: null,
        message: 'An unexpected error occurred',
        details: null,
      }
    }
  }

  return {
    status: null,
    message: String(error) || 'An unexpected error occurred',
    details: null,
  }
}
