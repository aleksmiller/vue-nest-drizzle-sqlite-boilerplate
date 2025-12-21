<template>
  <button
    @click="handleSignOut"
    :disabled="isLoading"
    class="px-3 py-1.5 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-70 dark:focus:ring-offset-slate-800"
  >
    {{ isLoading ? 'Signing Out...' : 'Sign Out' }}
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);

const handleSignOut = async () => {
  isLoading.value = true;
  try {
    await authStore.logout();
    // Redirect to login page
    router.push('/login');
  } catch (error) {
    console.error('Sign out error:', error);
    // Still redirect even if there's an error
    router.push('/login');
  } finally {
    isLoading.value = false;
  }
};
</script>

