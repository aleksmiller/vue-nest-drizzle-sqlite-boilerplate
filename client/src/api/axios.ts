import axios from 'axios';
import router from '../router';

// Flag to prevent infinite loops when handling 401 errors
let isHandling401 = false;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  withCredentials: true, // Important for cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Prevent infinite loops - if we're already handling a 401, don't do it again
        if (isHandling401) {
          return Promise.reject({
            status,
            message: data.error || data.message || 'Unauthorized',
            details: data.details || null,
          });
        }

        const currentPath = router.currentRoute.value.path;
        const requestUrl = error.config?.url || '';

        // Don't handle 401 for auth endpoints (login/register) - let them handle their own errors
        if (requestUrl.includes('/api/auth/login') || requestUrl.includes('/api/auth/register')) {
          return Promise.reject({
            status,
            message: data.error || data.message || 'Unauthorized',
            details: data.details || null,
          });
        }

        // Always clear auth state on 401 (except for auth endpoints)
        // This ensures auth state is cleared even if we're on login/register pages
        isHandling401 = true;
        console.error('Unauthorized - session may have expired');

        try {
          // Clear auth state by importing store dynamically to avoid circular dependency
          const { useAuthStore } = await import('../stores/auth');
          const authStore = useAuthStore();

          // Clear authentication state (without calling API to avoid recursion)
          authStore.clearAuth();

          // Only redirect if we're not already on login/register pages
          // If we're on login/register, the error will be handled by the form
          // Use nextTick to avoid conflicts with ongoing navigation
          if (currentPath !== '/login' && currentPath !== '/register') {
            // Use replace instead of push to avoid adding to history
            router.replace({
              path: '/login',
              query: { redirect: router.currentRoute.value.fullPath },
            }).catch(() => {
              // Ignore navigation errors (e.g., if navigation is already in progress)
            });
          }
        } finally {
          // Reset flag after a short delay to allow navigation to complete
          setTimeout(() => {
            isHandling401 = false;
          }, 1000);
        }
      }

      // Handle server error format: { error: string, details?: Record<string, string[]> }
      // Also handle NestJS exception format: { message: string, ... }
      const errorMessage = data.error || data.message || 'An error occurred';
      const errorDetails = data.details || null;

      return Promise.reject({
        status,
        message: errorMessage,
        details: errorDetails,
      });
    } else if (error.request) {
      return Promise.reject({
        status: null,
        message: 'Network error - please check your connection',
        details: null,
      });
    } else {
      return Promise.reject({
        status: null,
        message: error.message || 'An unexpected error occurred',
        details: null,
      });
    }
  }
);

export default apiClient;

