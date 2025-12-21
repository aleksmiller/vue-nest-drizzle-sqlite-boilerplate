import apiClient from './axios'
import {
  userProfileSchema,
  profileUpdateDataSchema,
  profileUpdateResponseSchema,
  apiErrorSchema,
  type UserProfile,
  type ProfileUpdateData,
  type ProfileUpdateResponse,
  type ApiError,
} from './schemas'

// Re-export types for convenience
export type { UserProfile, ProfileUpdateData, ProfileUpdateResponse, ApiError }

/**
 * Get the current user's profile
 */
export async function getProfile(): Promise<UserProfile> {
  const response = await apiClient.get('/api/user/profile')

  // Validate response
  return userProfileSchema.parse(response.data)
}

/**
 * Update the current user's profile
 */
export async function updateProfile(data: ProfileUpdateData): Promise<ProfileUpdateResponse> {
  // Validate input data
  const validatedData = profileUpdateDataSchema.parse(data)

  const response = await apiClient.put('/api/user/profile', validatedData)

  // Validate response
  return profileUpdateResponseSchema.parse(response.data)
}

/**
 * Parse and validate an API error from the API
 */
export function parseApiError(error: unknown): ApiError {
  if (typeof error === 'object' && error !== null) {
    try {
      return apiErrorSchema.parse(error)
    } catch {
      // If parsing fails, return a default error structure
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
