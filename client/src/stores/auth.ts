import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useQuery, useMutation } from '@pinia/colada'
import * as authApi from '../api/auth'
import * as userApi from '../api/user'
import type { UserProfile } from '../api/user'

export const useAuthStore = defineStore('auth', () => {
  // Use Pinia Colada query for checking authentication
  // This automatically handles caching, deduplication, and loading states
  const authQuery = useQuery({
    key: ['auth', 'check'],
    query: async () => {
      try {
        const profile = await userApi.getProfile()
        return { profile, authenticated: true }
      } catch (error) {
        const apiError = error as { status?: number }
        if (apiError.status === 401) {
          return { profile: null, authenticated: false }
        }
        throw error
      }
    },
    // Don't auto-refetch on mount, we'll call it manually when needed
    enabled: false,
  })

  // Computed state derived from the query
  const user = computed(() => authQuery.data.value?.profile ?? null)
  const session = computed(() => (authQuery.data.value?.authenticated ? { id: 'active' } : null))
  const isAuthenticated = computed(() => authQuery.data.value?.authenticated ?? false)
  const isCheckingAuth = computed(() => authQuery.asyncStatus.value === 'loading')

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null)

  // Register mutation
  const registerMutation = useMutation({
    mutation: async (data: authApi.RegisterData) => {
      const response = await authApi.register(data)
      // After successful registration, refresh auth state
      await authQuery.refetch()
      if (!isAuthenticated.value) {
        throw new Error('Failed to authenticate after registration. Please try logging in.')
      }
      return response
    },
  })

  // Login mutation
  const loginMutation = useMutation({
    mutation: async (credentials: authApi.LoginCredentials) => {
      const response = await authApi.login(credentials)
      // After successful login, refresh auth state
      await authQuery.refetch()
      if (!isAuthenticated.value) {
        throw new Error('Failed to authenticate after login. Please try again.')
      }
      return response
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutation: async () => {
      try {
        await authApi.signOut()
      } catch (error) {
        // Continue with logout even if server call fails
        console.error('Error during sign-out:', error)
      }
      // Always clear auth state
      authQuery.data.value = { profile: null, authenticated: false }
    },
  })

  /**
   * Clear authentication state without calling the API
   * Useful for handling 401 errors or forced logouts
   */
  function clearAuth() {
    authQuery.data.value = { profile: null, authenticated: false }
  }

  // Wrapper functions for backward compatibility
  async function register(data: authApi.RegisterData) {
    return registerMutation.mutate(data)
  }

  async function login(credentials: authApi.LoginCredentials) {
    return loginMutation.mutate(credentials)
  }

  async function logout() {
    return logoutMutation.mutate()
  }

  async function checkAuth() {
    await authQuery.refetch()
    return isAuthenticated.value
  }

  return {
    // State (computed from query)
    user,
    session,
    isAuthenticated,
    isCheckingAuth,
    // Getters
    isLoggedIn,
    // Actions
    register,
    login,
    logout,
    checkAuth,
    clearAuth,
    // Expose mutations for advanced usage (e.g., accessing loading/error states)
    registerMutation,
    loginMutation,
    logoutMutation,
    authQuery,
  }
})
