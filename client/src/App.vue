<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();

// Check authentication status on app mount
onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<template>
  <router-view />
</template>

<style scoped></style>
