<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 px-4 py-12">
    <div class="container mx-auto max-w-4xl">
      <div class="mb-6 flex items-center justify-between">
        <router-link
          to="/"
          class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
        >
          ← Back to Home
        </router-link>
        <SignOutButton />
      </div>
      <UserProfile />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useUserStore } from '../stores/user';
import UserProfile from '../components/UserProfile.vue';
import SignOutButton from '../components/SignOutButton.vue';

const authStore = useAuthStore();
const userStore = useUserStore();

// Ensure user is loaded
onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.checkAuth();
  }
  if (authStore.isAuthenticated && !userStore.profile) {
    await userStore.fetchProfile();
  }
});
</script>

