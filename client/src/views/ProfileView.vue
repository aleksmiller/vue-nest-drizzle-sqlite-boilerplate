<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 animate-gradient px-4 py-12 relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-float"></div>
      <div class="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-20 animate-float" style="animation-delay: 2s;"></div>
    </div>
    <div class="container mx-auto max-w-4xl relative z-10">
      <div class="mb-8 flex items-center justify-between flex-wrap gap-4">
        <router-link
          to="/"
          class="px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-semibold transition-all hover:scale-105 shadow-lg border border-white/20 dark:border-slate-700/50"
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

