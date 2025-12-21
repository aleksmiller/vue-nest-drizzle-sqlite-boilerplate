import { ref } from 'vue'
import { defineStore } from 'pinia'
import * as userApi from '../api/user'
import type { UserProfile, ProfileUpdateData } from '../api/user'

export const useUserStore = defineStore('user', () => {
  // State
  const profile = ref<UserProfile | null>(null)

  // Actions
  async function fetchProfile() {
    try {
      const userProfile = await userApi.getProfile()
      profile.value = userProfile
      return userProfile
    } catch (error) {
      // Clear profile on error
      profile.value = null
      throw error
    }
  }

  async function updateProfile(data: ProfileUpdateData) {
    try {
      const response = await userApi.updateProfile(data)
      // Refresh profile after update
      await fetchProfile()
      return response
    } catch (error) {
      throw error
    }
  }

  return {
    // State
    profile,
    // Actions
    fetchProfile,
    updateProfile,
  }
})
