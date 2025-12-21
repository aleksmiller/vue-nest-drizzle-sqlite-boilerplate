<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6">
          Welcome to Vue + NestJS Boilerplate
        </h1>
        <p class="text-xl text-slate-600 dark:text-slate-300 mb-8">
          A modern full-stack application with Vue 3, NestJS, Drizzle ORM, and SQLite
        </p>

        <div v-if="authStore.isLoggedIn" class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
          <p class="text-lg text-slate-700 dark:text-slate-200 mb-4">
            Hello, <strong>{{ authStore.user?.username }}</strong>!
          </p>
          <div class="flex gap-4 justify-center">
            <router-link
              to="/profile"
              class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              View Profile
            </router-link>
            <SignOutButton />
          </div>
        </div>

        <div v-else class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6 mb-8">
          <p class="text-lg text-slate-700 dark:text-slate-200 mb-4">
            Get started by creating an account or logging in
          </p>
          <div class="flex gap-4 justify-center">
            <router-link
              to="/register"
              class="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Sign Up
            </router-link>
            <router-link
              to="/login"
              class="px-6 py-3 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
            >
              Sign In
            </router-link>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-6 mt-12">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Vue 3
            </h2>
            <p class="text-slate-600 dark:text-slate-300">
              Modern reactive framework with Composition API
            </p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              NestJS
            </h2>
            <p class="text-slate-600 dark:text-slate-300">
              Scalable backend with TypeScript
            </p>
          </div>
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Drizzle ORM
            </h2>
            <p class="text-slate-600 dark:text-slate-300">
              Type-safe database queries
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import SignOutButton from '../components/SignOutButton.vue';

const authStore = useAuthStore();

// Check auth status on mount
onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await authStore.checkAuth();
  }
});
</script>

