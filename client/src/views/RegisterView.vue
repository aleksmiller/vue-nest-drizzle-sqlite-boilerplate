<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 animate-gradient flex items-center justify-center px-4 py-12 relative overflow-hidden"
  >
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute top-20 left-10 w-96 h-96 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float"
      ></div>
      <div
        class="absolute bottom-20 right-10 w-96 h-96 bg-indigo-300 dark:bg-indigo-900 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-xl opacity-30 animate-float"
        style="animation-delay: 2s"
      ></div>
    </div>
    <div class="w-full max-w-md relative z-10">
      <AuthForm mode="register" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthForm from '../components/AuthForm.vue'
</script>
