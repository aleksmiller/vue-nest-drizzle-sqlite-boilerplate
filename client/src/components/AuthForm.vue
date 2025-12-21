<template>
  <div class="bg-white dark:bg-slate-800 shadow-xl rounded-lg p-8">
    <h2 class="text-2xl font-bold text-center text-slate-900 dark:text-white mb-6">
      {{ mode === 'login' ? 'Welcome Back!' : 'Create Your Account' }}
    </h2>
    <div v-if="error" class="mb-4 text-center text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded">
      {{ error }}
    </div>
    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div v-if="mode === 'register'">
        <label
          for="username"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Username
        </label>
        <input
          id="username"
          v-model="username"
          name="username"
          type="text"
          required
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
        />
        <p v-if="getFieldError('username')" class="mt-1 text-xs text-red-500">
          {{ getFieldError('username') }}
        </p>
      </div>

      <div>
        <label
          for="email"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Email address
        </label>
        <input
          id="email"
          v-model="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
        />
        <p v-if="getFieldError('email')" class="mt-1 text-xs text-red-500">
          {{ getFieldError('email') }}
        </p>
      </div>

      <div>
        <label
          for="password"
          class="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Password
        </label>
        <input
          id="password"
          v-model="password"
          name="password"
          type="password"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          required
          class="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700"
        />
        <p v-if="getFieldError('password')" class="mt-1 text-xs text-red-500">
          {{ getFieldError('password') }}
        </p>
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800"
        >
          {{ isLoading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Sign Up' }}
        </button>
      </div>
      <div class="text-sm text-center">
        <p v-if="mode === 'login'" class="text-slate-600 dark:text-slate-400">
          No account?
          <router-link
            to="/register"
            class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Register here
          </router-link>
        </p>
        <p v-else class="text-slate-600 dark:text-slate-400">
          Already have an account?
          <router-link
            to="/login"
            class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Login here
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import type { RegisterData, LoginCredentials } from '../api/auth';

interface Props {
  mode: 'login' | 'register';
}

const props = defineProps<Props>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const username = ref('');
const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const fieldErrors = ref<Record<string, string[] | undefined> | null>(null);
const isLoading = ref(false);

const getFieldError = (field: string): string | undefined => {
  return fieldErrors.value?.[field]?.[0];
};

const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;
  fieldErrors.value = null;

  try {
    if (props.mode === 'login') {
      const credentials: LoginCredentials = { email: email.value, password: password.value };
      await authStore.login(credentials);
    } else {
      const registerData: RegisterData = {
        username: username.value,
        email: email.value,
        password: password.value,
      };
      await authStore.register(registerData);
    }
    // Redirect to profile or return URL on success
    const redirect = (route.query.redirect as string) || '/profile';
    router.push(redirect);
  } catch (err: unknown) {
    const apiError = err as { message?: string; details?: Record<string, string[]> };
    error.value = apiError.message || `An error occurred during ${props.mode}.`;
    if (apiError.details) {
      fieldErrors.value = apiError.details;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

