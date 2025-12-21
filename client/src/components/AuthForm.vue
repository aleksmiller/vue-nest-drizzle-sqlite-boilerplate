<template>
  <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 md:p-10 border border-white/20 dark:border-slate-700/50 animate-fade-in-up">
    <div class="text-center mb-8">
      <div class="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <span class="text-4xl">{{ mode === 'login' ? '🔐' : '✨' }}</span>
      </div>
      <h2 class="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        {{ mode === 'login' ? 'Welcome Back!' : 'Create Your Account' }}
      </h2>
    </div>
    <div v-if="error" class="mb-6 text-center text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800 animate-fade-in-up">
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
          class="mt-2 block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 transition-all hover:border-indigo-300 dark:hover:border-indigo-500"
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
          class="mt-2 block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 transition-all hover:border-indigo-300 dark:hover:border-indigo-500"
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
          class="mt-2 block w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-slate-700 transition-all hover:border-indigo-300 dark:hover:border-indigo-500"
        />
        <p v-if="getFieldError('password')" class="mt-1 text-xs text-red-500">
          {{ getFieldError('password') }}
        </p>
      </div>

      <div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-lg text-base font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed dark:focus:ring-offset-slate-800 transition-all transform hover:scale-[1.02] active:scale-[0.98] glow-indigo relative overflow-hidden"
        >
          <span v-if="isLoading" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
          <span v-else>{{ mode === 'login' ? 'Sign In' : 'Sign Up' }}</span>
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
import { loginCredentialsSchema, registerDataSchema } from '../api/schemas';
import { parseAuthError } from '../api/auth';
import { safeParse } from '../utils/validation';

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
const fieldErrors = ref<Record<string, string[]> | null>(null);
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
      // Validate client-side before submitting
      const validation = safeParse(loginCredentialsSchema, {
        email: email.value,
        password: password.value,
      });

      if (!validation.success) {
        fieldErrors.value = validation.errors;
        error.value = 'Please fix the errors below.';
        return;
      }

      await authStore.login(validation.data);
    } else {
      // Validate client-side before submitting
      const validation = safeParse(registerDataSchema, {
        username: username.value,
        email: email.value,
        password: password.value,
      });

      if (!validation.success) {
        fieldErrors.value = validation.errors;
        error.value = 'Please fix the errors below.';
        return;
      }

      await authStore.register(validation.data);
    }
    // Redirect to profile or return URL on success
    const redirect = (route.query.redirect as string) || '/profile';
    router.push(redirect);
  } catch (err: unknown) {
    const apiError = parseAuthError(err);
    error.value = apiError.message || `An error occurred during ${props.mode}.`;
    if (apiError.details) {
      fieldErrors.value = apiError.details;
    }
  } finally {
    isLoading.value = false;
  }
};
</script>

