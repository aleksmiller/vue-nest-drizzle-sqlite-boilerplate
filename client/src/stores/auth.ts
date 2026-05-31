import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useApi } from '../api/http'
import {
  userProfileSchema,
  type UserProfile,
  type LoginCredentials,
  type RegisterData,
  type AuthResponse,
  type AuthError,
} from '../api/schemas'

/** Build the normalized `{ status, message, details }` error shape from a response body. */
function toAuthError(status: number | null, body: unknown): AuthError {
  const b = (body ?? {}) as {
    message?: string
    error?: string
    details?: Record<string, string[]>
  }
  return {
    status,
    message: b.message || b.error || 'An error occurred',
    details: b.details || null,
  }
}

/**
 * Authentication store.
 *
 * The single source of truth is `user`: it is non-null exactly when the user
 * is authenticated. `initialized` records whether we have checked the session
 * with the server at least once, so guards can avoid redundant network calls.
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const initialized = ref(false)
  const isCheckingAuth = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isLoggedIn = isAuthenticated

  /**
   * Verify the session against the server and refresh `user`.
   * Returns whether the user is authenticated. A 401 clears the user;
   * any other error propagates to the caller.
   */
  async function checkAuth(): Promise<boolean> {
    isCheckingAuth.value = true
    try {
      // checkAuth resolves auth state itself; opt out of the global 401 redirect
      // so a guest probe (e.g. on the login/register pages) isn't bounced away.
      const { data, error, statusCode, execute } = useApi('/api/user/profile', {
        immediate: false,
        onFetchError: (ctx) => ctx,
      }).json<unknown>()
      await execute()

      if (statusCode.value === 401) {
        user.value = null
        return false
      }
      if (error.value) {
        throw error.value
      }
      user.value = userProfileSchema.parse(data.value)
      return true
    } finally {
      initialized.value = true
      isCheckingAuth.value = false
    }
  }

  /**
   * Clear authentication state locally, without calling the API.
   * Used by the http layer when the server reports a 401.
   */
  function clearAuth() {
    user.value = null
    initialized.value = true
  }

  async function register(data: RegisterData): Promise<AuthResponse> {
    const {
      data: body,
      error,
      statusCode,
      execute,
    } = useApi('/api/auth/register', { immediate: false }).post(data).json<AuthResponse>()
    await execute()

    if (error.value || (statusCode.value ?? 0) >= 400) {
      throw toAuthError(statusCode.value ?? null, body.value)
    }

    await checkAuth()
    if (!isAuthenticated.value) {
      throw new Error('Failed to authenticate after registration. Please try logging in.')
    }
    return body.value as AuthResponse
  }

  async function login(credentials: LoginCredentials): Promise<AuthResponse> {
    const {
      data: body,
      error,
      statusCode,
      execute,
    } = useApi('/api/auth/login', { immediate: false }).post(credentials).json<AuthResponse>()
    await execute()

    if (error.value || (statusCode.value ?? 0) >= 400) {
      throw toAuthError(statusCode.value ?? null, body.value)
    }

    await checkAuth()
    if (!isAuthenticated.value) {
      throw new Error('Failed to authenticate after login. Please try again.')
    }
    return body.value as AuthResponse
  }

  async function logout() {
    try {
      const { execute } = useApi('/api/auth/sign-out', { immediate: false }).post().json()
      await execute()
    } catch (error) {
      // Continue with logout even if the server call fails.
      console.error('Error during sign-out:', error)
    }
    clearAuth()
  }

  return {
    // State
    user,
    initialized,
    isCheckingAuth,
    // Getters
    isAuthenticated,
    isLoggedIn,
    // Actions
    register,
    login,
    logout,
    checkAuth,
    clearAuth,
  }
})
