<template>
  <div
    class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 md:p-10 border border-white/20 dark:border-slate-700/50 animate-fade-in-up"
  >
    <div class="flex justify-between items-center mb-8 flex-wrap gap-4">
      <div>
        <h1
          class="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
        >
          User Profile
        </h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">Manage your account information</p>
      </div>
      <button
        v-if="!isEditing"
        @click="isEditing = true"
        class="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-xl glow-indigo"
      >
        ✏️ Edit Profile
      </button>
    </div>

    <div
      v-if="serverError"
      class="mb-6 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800 animate-fade-in-up"
    >
      {{ serverError }}
    </div>
    <div
      v-if="successMessage"
      class="mb-6 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800 animate-fade-in-up"
    >
      ✅ {{ successMessage }}
    </div>

    <div
      v-if="user"
      class="bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700"
    >
      <div class="space-y-4 text-base sm:text-lg">
        <div class="flex items-center gap-3">
          <span class="text-2xl">👤</span>
          <div>
            <strong class="font-semibold text-slate-700 dark:text-slate-300 block">Username</strong>
            <span class="text-indigo-600 dark:text-indigo-400 font-medium">{{
              user.username
            }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-2xl">📧</span>
          <div>
            <strong class="font-semibold text-slate-700 dark:text-slate-300 block">Email</strong>
            <span class="text-indigo-600 dark:text-indigo-400 font-medium">{{ user.email }}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-2xl">📅</span>
          <div>
            <strong class="font-semibold text-slate-700 dark:text-slate-300 block">Joined</strong>
            <span class="text-indigo-600 dark:text-indigo-400 font-medium">{{ userDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <form v-if="isEditing" @submit.prevent="handleSubmit" class="mt-8 space-y-6 animate-fade-in-up">
      <div>
        <label
          for="firstName"
          class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          First Name
        </label>
        <input
          id="firstName"
          v-model="formData.firstName"
          type="text"
          placeholder="Enter your first name"
          class="block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 transition-all hover:border-indigo-300 dark:hover:border-indigo-500"
        />
        <p v-if="fieldErrors?.firstName" class="mt-2 text-xs text-red-600 dark:text-red-400">
          {{ fieldErrors.firstName[0] }}
        </p>
      </div>
      <div>
        <label
          for="lastName"
          class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Last Name
        </label>
        <input
          id="lastName"
          v-model="formData.lastName"
          type="text"
          placeholder="Enter your last name"
          class="block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 transition-all hover:border-indigo-300 dark:hover:border-indigo-500"
        />
        <p v-if="fieldErrors?.lastName" class="mt-2 text-xs text-red-600 dark:text-red-400">
          {{ fieldErrors.lastName[0] }}
        </p>
      </div>
      <div>
        <label
          for="bio"
          class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
        >
          Bio
        </label>
        <textarea
          id="bio"
          v-model="formData.bio"
          rows="4"
          placeholder="Tell us about yourself..."
          class="block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 transition-all hover:border-indigo-300 dark:hover:border-indigo-500 resize-none"
        />
        <p v-if="fieldErrors?.bio" class="mt-2 text-xs text-red-600 dark:text-red-400">
          {{ fieldErrors.bio[0] }}
        </p>
      </div>
      <div class="flex items-center gap-4 pt-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-70 font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        >
          <span v-if="isSubmitting" class="flex items-center gap-2">
            <svg
              class="animate-spin h-5 w-5"
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
            Saving...
          </span>
          <span v-else>💾 Save Changes</span>
        </button>
        <button
          type="button"
          @click="handleCancel"
          class="px-6 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg border-2 border-slate-200 dark:border-slate-600"
        >
          Cancel
        </button>
      </div>
    </form>

    <div v-else class="mt-8 animate-fade-in-up">
      <h2
        class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-2"
      >
        <span>📋</span> Profile Details
      </h2>
      <div
        class="bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700 space-y-4"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl">👤</span>
          <div>
            <strong class="font-semibold text-slate-700 dark:text-slate-300 block mb-1"
              >First Name</strong
            >
            <span
              v-if="profile?.firstName"
              class="text-indigo-600 dark:text-indigo-400 font-medium"
              >{{ profile.firstName }}</span
            >
            <span v-else class="italic text-slate-500 dark:text-slate-400">Not set</span>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="text-xl">👤</span>
          <div>
            <strong class="font-semibold text-slate-700 dark:text-slate-300 block mb-1"
              >Last Name</strong
            >
            <span
              v-if="profile?.lastName"
              class="text-indigo-600 dark:text-indigo-400 font-medium"
              >{{ profile.lastName }}</span
            >
            <span v-else class="italic text-slate-500 dark:text-slate-400">Not set</span>
          </div>
        </div>
        <div class="flex items-start gap-3">
          <span class="text-xl">📝</span>
          <div>
            <strong class="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Bio</strong>
            <span v-if="profile?.bio" class="text-indigo-600 dark:text-indigo-400 font-medium">{{
              profile.bio
            }}</span>
            <span v-else class="italic text-slate-500 dark:text-slate-400">Not set</span>
          </div>
        </div>
        <div v-if="profile?.updatedAt" class="pt-4 border-t border-slate-200 dark:border-slate-700">
          <p class="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span>🕒</span> Last updated: <span class="font-medium">{{ profileDate }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'
import { parseApiError, type ProfileUpdateData } from '../api/user'
import { profileUpdateDataSchema } from '../api/schemas'
import { safeParse } from '../utils/validation'

const authStore = useAuthStore()
const userStore = useUserStore()

const isEditing = ref(false)
const serverError = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const isSubmitting = ref(false)
const fieldErrors = ref<Record<string, string[]> | null>(null)

const user = computed(() => authStore.user)
const profile = computed(() => user.value?.profile || null)

const formData = ref<ProfileUpdateData>({
  firstName: null,
  lastName: null,
  bio: null,
})

// Initialize form data from profile
const initializeFormData = () => {
  if (profile.value) {
    formData.value = {
      firstName: profile.value.firstName || null,
      lastName: profile.value.lastName || null,
      bio: profile.value.bio || null,
    }
  }
}

// Watch for profile changes and update form data
watch(
  profile,
  () => {
    initializeFormData()
  },
  { immediate: true },
)

// Format dates
const userDate = computed(() => {
  if (!user.value?.createdAt) return null
  return new Date(user.value.createdAt).toLocaleDateString()
})

const profileDate = computed(() => {
  if (!profile.value?.updatedAt) return null
  return new Date(profile.value.updatedAt).toLocaleDateString()
})

// Fetch profile on mount
onMounted(async () => {
  if (authStore.isAuthenticated && !user.value) {
    await authStore.checkAuth()
  }
  if (authStore.isAuthenticated) {
    await userStore.fetchProfile()
  }
})

const handleSubmit = async () => {
  serverError.value = null
  successMessage.value = null
  fieldErrors.value = null
  isSubmitting.value = true

  try {
    // Prepare update data - convert empty strings to null, keep undefined as undefined
    const updateData: Record<string, string | null | undefined> = {}

    if (formData.value.firstName !== undefined) {
      updateData.firstName = formData.value.firstName?.trim() || null
    }
    if (formData.value.lastName !== undefined) {
      updateData.lastName = formData.value.lastName?.trim() || null
    }
    if (formData.value.bio !== undefined) {
      updateData.bio = formData.value.bio?.trim() || null
    }

    // Validate client-side before submitting
    const validation = safeParse(profileUpdateDataSchema, updateData)

    if (!validation.success) {
      fieldErrors.value = validation.errors
      serverError.value = 'Please fix the errors below.'
      return
    }

    await userStore.updateProfile(validation.data)
    successMessage.value = 'Profile updated successfully!'
    isEditing.value = false
  } catch (error: unknown) {
    const apiError = parseApiError(error)
    serverError.value = apiError.message || 'Failed to update profile.'
    if (apiError.details) {
      fieldErrors.value = apiError.details as Record<string, string[]>
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleCancel = () => {
  isEditing.value = false
  initializeFormData()
  serverError.value = null
  successMessage.value = null
  fieldErrors.value = null
}
</script>
