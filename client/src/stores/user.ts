import { computed } from 'vue'
import { defineStore } from 'pinia'
import { useQuery, useMutation } from '@pinia/colada'
import * as userApi from '../api/user'
import type { ProfileUpdateData } from '../api/user'

export const useUserStore = defineStore('user', () => {
  // Use Pinia Colada query for fetching user profile
  // This automatically handles caching, deduplication, and loading states
  const profileQuery = useQuery({
    key: ['user', 'profile'],
    query: userApi.getProfile,
    // Don't auto-fetch if user is not authenticated
    enabled: false,
  })

  // Computed state derived from the query
  const profile = computed(() => profileQuery.data.value ?? null)

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutation: userApi.updateProfile,
    onSuccess: async () => {
      // Refresh profile after successful update
      await profileQuery.refetch()
    },
  })

  // Wrapper functions for backward compatibility
  async function fetchProfile() {
    await profileQuery.refetch()
    return profile.value
  }

  async function updateProfile(data: ProfileUpdateData) {
    return updateProfileMutation.mutate(data)
  }

  return {
    // State (computed from query)
    profile,
    // Actions
    fetchProfile,
    updateProfile,
    // Expose query and mutation for advanced usage (e.g., accessing loading/error states)
    profileQuery,
    updateProfileMutation,
  }
})
