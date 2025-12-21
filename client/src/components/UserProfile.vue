<template>
  <div class="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-6 md:p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
        User Profile
      </h1>
      <button
        v-if="!isEditing"
        @click="isEditing = true"
        class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 text-sm"
      >
        Edit Profile
      </button>
    </div>

    <div v-if="serverError" class="mb-4 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded">
      {{ serverError }}
    </div>
    <div v-if="successMessage" class="mb-4 text-sm text-green-600 bg-green-100 dark:bg-green-900/30 p-3 rounded">
      {{ successMessage }}
    </div>

    <div v-if="user" class="space-y-3 text-sm sm:text-base">
      <p>
        <strong class="font-medium text-slate-700 dark:text-slate-300">
          Username:
        </strong>
        {{ user.username }}
      </p>
      <p>
        <strong class="font-medium text-slate-700 dark:text-slate-300">
          Email:
        </strong>
        {{ user.email }}
      </p>
      <p>
        <strong class="font-medium text-slate-700 dark:text-slate-300">
          Joined:
        </strong>
        {{ userDate }}
      </p>
    </div>

    <form v-if="isEditing" @submit.prevent="handleSubmit" class="mt-8 space-y-6">
      <div>
        <label
          for="firstName"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          First Name
        </label>
        <input
          id="firstName"
          v-model="formData.firstName"
          type="text"
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
        />
        <p v-if="fieldErrors?.firstName" class="mt-1 text-xs text-red-500">
          {{ fieldErrors.firstName[0] }}
        </p>
      </div>
      <div>
        <label
          for="lastName"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Last Name
        </label>
        <input
          id="lastName"
          v-model="formData.lastName"
          type="text"
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
        />
        <p v-if="fieldErrors?.lastName" class="mt-1 text-xs text-red-500">
          {{ fieldErrors.lastName[0] }}
        </p>
      </div>
      <div>
        <label
          for="bio"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Bio
        </label>
        <textarea
          id="bio"
          v-model="formData.bio"
          rows="3"
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
        />
        <p v-if="fieldErrors?.bio" class="mt-1 text-xs text-red-500">
          {{ fieldErrors.bio[0] }}
        </p>
      </div>
      <div class="flex items-center gap-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-70 text-sm"
        >
          {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
        </button>
        <button
          type="button"
          @click="handleCancel"
          class="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 focus:outline-none text-sm"
        >
          Cancel
        </button>
      </div>
    </form>

    <div v-else class="mt-8 space-y-3 text-sm sm:text-base">
      <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-3">
        Profile Details
      </h2>
      <p>
        <strong class="font-medium text-slate-700 dark:text-slate-300">
          First Name:
        </strong>
        <span v-if="profile?.firstName">{{ profile.firstName }}</span>
        <span v-else class="italic text-slate-500 dark:text-slate-400">
          Not set
        </span>
      </p>
      <p>
        <strong class="font-medium text-slate-700 dark:text-slate-300">
          Last Name:
        </strong>
        <span v-if="profile?.lastName">{{ profile.lastName }}</span>
        <span v-else class="italic text-slate-500 dark:text-slate-400">
          Not set
        </span>
      </p>
      <p>
        <strong class="font-medium text-slate-700 dark:text-slate-300">
          Bio:
        </strong>
        <span v-if="profile?.bio">{{ profile.bio }}</span>
        <span v-else class="italic text-slate-500 dark:text-slate-400">
          Not set
        </span>
      </p>
      <p v-if="profile?.updatedAt" class="text-xs text-slate-500 dark:text-slate-400 mt-2">
        Last updated: {{ profileDate }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import type { ProfileUpdateData } from '../api/user';

const authStore = useAuthStore();
const userStore = useUserStore();

const isEditing = ref(false);
const serverError = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const isSubmitting = ref(false);
const fieldErrors = ref<Record<string, string[]> | null>(null);

const user = computed(() => authStore.user);
const profile = computed(() => user.value?.profile || null);

const formData = ref<ProfileUpdateData>({
  firstName: null,
  lastName: null,
  bio: null,
});

// Initialize form data from profile
const initializeFormData = () => {
  if (profile.value) {
    formData.value = {
      firstName: profile.value.firstName || null,
      lastName: profile.value.lastName || null,
      bio: profile.value.bio || null,
    };
  }
};

// Watch for profile changes and update form data
watch(profile, () => {
  initializeFormData();
}, { immediate: true });

// Format dates
const userDate = computed(() => {
  if (!user.value?.createdAt) return null;
  return new Date(user.value.createdAt).toLocaleDateString();
});

const profileDate = computed(() => {
  if (!profile.value?.updatedAt) return null;
  return new Date(profile.value.updatedAt).toLocaleDateString();
});

// Fetch profile on mount
onMounted(async () => {
  if (authStore.isAuthenticated && !user.value) {
    await authStore.checkAuth();
  }
  if (authStore.isAuthenticated) {
    await userStore.fetchProfile();
  }
});

const handleSubmit = async () => {
  serverError.value = null;
  successMessage.value = null;
  fieldErrors.value = null;
  isSubmitting.value = true;

  try {
    // Filter out empty strings and convert to null
    const updateData: ProfileUpdateData = {
      firstName: formData.value.firstName?.trim() || null,
      lastName: formData.value.lastName?.trim() || null,
      bio: formData.value.bio?.trim() || null,
    };

    await userStore.updateProfile(updateData);
    successMessage.value = 'Profile updated successfully!';
    isEditing.value = false;
  } catch (error: unknown) {
    const apiError = error as { message?: string; details?: Record<string, string[]> };
    serverError.value = apiError.message || 'Failed to update profile.';
    if (apiError.details) {
      fieldErrors.value = apiError.details;
    }
  } finally {
    isSubmitting.value = false;
  }
};

const handleCancel = () => {
  isEditing.value = false;
  initializeFormData();
  serverError.value = null;
  successMessage.value = null;
  fieldErrors.value = null;
};
</script>

