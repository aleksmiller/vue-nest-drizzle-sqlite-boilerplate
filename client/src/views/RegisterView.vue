<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <AuthForm mode="register" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AuthForm from '../components/AuthForm.vue';
</script>

