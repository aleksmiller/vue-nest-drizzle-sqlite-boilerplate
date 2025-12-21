<template>
  <button
    @click="handleSignOut"
    :disabled="isLoading"
    class="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 dark:focus:ring-offset-slate-800 transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
  >
    <span v-if="isLoading" class="flex items-center gap-2">
      <svg
        class="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      Signing Out...
    </span>
    <span v-else>Sign Out</span>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isLoading = ref(false)

const handleSignOut = async () => {
  isLoading.value = true
  try {
    await authStore.logout()
    // Redirect to login page
    router.push('/login')
  } catch (error) {
    console.error('Sign out error:', error)
    // Still redirect even if there's an error
    router.push('/login')
  } finally {
    isLoading.value = false
  }
}
</script>
