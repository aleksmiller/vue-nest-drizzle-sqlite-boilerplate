<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 animate-gradient relative overflow-hidden">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-20 left-10 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float"></div>
      <div class="absolute top-40 right-10 w-72 h-72 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float" style="animation-delay: 2s;"></div>
      <div class="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float" style="animation-delay: 4s;"></div>
    </div>

    <div class="container mx-auto px-4 py-16 relative z-10">
      <div class="max-w-4xl mx-auto text-center">
        <!-- Hero Section -->
        <div class="animate-fade-in-up">
          <h1 class="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 leading-tight">
            Welcome to Vue + NestJS
          </h1>
          <p class="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-12 font-light">
            A modern full-stack application with Vue 3, NestJS, Drizzle ORM, and SQLite
          </p>
        </div>

        <!-- Auth Card -->
        <div v-if="authStore.isLoggedIn" class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-12 border border-white/20 dark:border-slate-700/50 hover-lift animate-fade-in-up" style="animation-delay: 0.2s;">
          <p class="text-xl text-slate-700 dark:text-slate-200 mb-6">
            Hello, <strong class="text-indigo-600 dark:text-indigo-400">{{ authStore.user?.username }}</strong>! 👋
          </p>
          <div class="flex gap-4 justify-center flex-wrap">
            <router-link
              to="/profile"
              class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl glow-indigo"
            >
              View Profile
            </router-link>
            <SignOutButton />
          </div>
        </div>

        <div v-else class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl p-8 mb-12 border border-white/20 dark:border-slate-700/50 hover-lift animate-fade-in-up" style="animation-delay: 0.2s;">
          <p class="text-xl text-slate-700 dark:text-slate-200 mb-6">
            Get started by creating an account or logging in 🚀
          </p>
          <div class="flex gap-4 justify-center flex-wrap">
            <router-link
              to="/register"
              class="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl glow-indigo"
            >
              Sign Up
            </router-link>
            <router-link
              to="/login"
              class="px-8 py-3 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all transform hover:scale-105 shadow-lg border border-slate-200 dark:border-slate-600"
            >
              Sign In
            </router-link>
          </div>
        </div>

        <!-- Feature Cards -->
        <div class="grid md:grid-cols-3 gap-8 mt-16">
          <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 dark:border-slate-700/50 hover-lift animate-fade-in-up group" style="animation-delay: 0.3s;">
            <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg">
              <span class="text-3xl">⚡</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Vue 3
            </h2>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
              Modern reactive framework with Composition API
            </p>
          </div>

          <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 dark:border-slate-700/50 hover-lift animate-fade-in-up group" style="animation-delay: 0.4s;">
            <div class="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg">
              <span class="text-3xl">🚀</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              NestJS
            </h2>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
              Scalable backend with TypeScript
            </p>
          </div>

          <div class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 dark:border-slate-700/50 hover-lift animate-fade-in-up group" style="animation-delay: 0.5s;">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform shadow-lg">
              <span class="text-3xl">💾</span>
            </div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              Drizzle ORM
            </h2>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
              Type-safe database queries
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth';
import SignOutButton from '../components/SignOutButton.vue';

const authStore = useAuthStore();
// Auth state is managed by router guards and axios interceptor
// No need to check auth here
</script>

