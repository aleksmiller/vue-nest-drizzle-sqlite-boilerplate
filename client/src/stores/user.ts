import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '../api/http'
import { useAuthStore } from './auth'
import {
  userProfileSchema,
  profileUpdateResponseSchema,
  type UserProfile,
  type ProfileUpdateData,
  type ProfileUpdateResponse,
} from '../api/schemas'

export const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)

  /** Fetch the current user's profile and cache it. Returns null on 401. */
  async function fetchProfile(): Promise<UserProfile | null> {
    const { data, error, statusCode, execute } = useApi('/api/user/profile', {
      immediate: false,
    }).json<unknown>()
    await execute()

    if (statusCode.value === 401) {
      profile.value = null
      return null
    }
    if (error.value) {
      throw error.value
    }
    profile.value = userProfileSchema.parse(data.value)
    return profile.value
  }

  /** Update the profile, then refresh the canonical auth user so views update. */
  async function updateProfile(payload: ProfileUpdateData): Promise<ProfileUpdateResponse> {
    const { data, error, statusCode, execute } = useApi('/api/user/profile', {
      immediate: false,
    })
      .put(payload)
      .json<unknown>()
    await execute()

    if (error.value || (statusCode.value ?? 0) >= 400) {
      const body = (data.value ?? {}) as {
        message?: string
        error?: string
        details?: Record<string, string[]>
      }
      throw {
        status: statusCode.value ?? null,
        message: body.message || body.error || 'An error occurred',
        details: body.details || null,
      }
    }

    const parsed = profileUpdateResponseSchema.parse(data.value)
    await useAuthStore().checkAuth()
    return parsed
  }

  return {
    profile,
    fetchProfile,
    updateProfile,
  }
})
