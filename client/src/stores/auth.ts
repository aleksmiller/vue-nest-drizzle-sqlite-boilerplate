import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import * as authApi from '../api/auth';
import * as userApi from '../api/user';
import type { UserProfile } from '../api/user';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<UserProfile | null>(null);
  const session = ref<{ id: string } | null>(null);
  const isAuthenticated = ref(false);
  const isCheckingAuth = ref(false);

  // Getters
  const isLoggedIn = computed(() => isAuthenticated.value && user.value !== null);

  // Actions
  async function register(data: authApi.RegisterData) {
    try {
      const response = await authApi.register(data);
      // After successful registration, fetch user profile
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        // If checkAuth fails (e.g., 401), throw an error
        throw new Error('Failed to authenticate after registration. Please try logging in.');
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  async function login(credentials: authApi.LoginCredentials) {
    try {
      const response = await authApi.login(credentials);
      // After successful login, fetch user profile
      const isAuthenticated = await checkAuth();
      if (!isAuthenticated) {
        // If checkAuth fails (e.g., 401), throw an error
        throw new Error('Failed to authenticate after login. Please try again.');
      }
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear authentication state without calling the API
   * Useful for handling 401 errors or forced logouts
   */
  function clearAuth() {
    user.value = null;
    session.value = null;
    isAuthenticated.value = false;
  }

  async function logout() {
    try {
      await authApi.signOut();
    } catch (error) {
      // Continue with logout even if server call fails
      console.error('Error during sign-out:', error);
    } finally {
      // Always clear state
      clearAuth();
    }
  }

  async function checkAuth() {
    // Prevent multiple simultaneous auth checks
    if (isCheckingAuth.value) {
      return isAuthenticated.value;
    }

    isCheckingAuth.value = true;
    try {
      // Try to fetch user profile - if successful, user is authenticated
      const profile = await userApi.getProfile();
      user.value = profile;
      isAuthenticated.value = true;
      session.value = { id: 'active' };
      return true;
    } catch (error) {
      // If we get a 401, user is not authenticated
      const apiError = error as { status?: number };
      if (apiError.status === 401) {
        clearAuth();
        return false;
      }
      // For other errors, rethrow
      throw error;
    } finally {
      isCheckingAuth.value = false;
    }
  }

  return {
    // State
    user,
    session,
    isAuthenticated,
    // Getters
    isLoggedIn,
    // Actions
    register,
    login,
    logout,
    checkAuth,
    clearAuth,
  };
});

