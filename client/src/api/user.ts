import {
  apiErrorSchema,
  type UserProfile,
  type ProfileUpdateData,
  type ProfileUpdateResponse,
  type ApiError,
} from './schemas'

// Re-export types for convenience
export type { UserProfile, ProfileUpdateData, ProfileUpdateResponse, ApiError }

/**
 * Parse and validate an API error into a consistent shape.
 */
export function parseApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null) {
    try {
      return apiErrorSchema.parse(error)
    } catch {
      return {
        status: (error as { status?: number }).status ?? null,
        message: (error as { message?: string }).message || 'An unexpected error occurred',
        details: (error as { details?: Record<string, string[]> }).details || null,
      }
    }
  }
  return {
    status: null,
    message: String(error) || 'An unexpected error occurred',
    details: null,
  }
}
