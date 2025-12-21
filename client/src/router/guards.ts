import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import { useAuthStore } from '../stores/auth';

/**
 * Route guard that redirects to login if user is not authenticated
 * Preserves the intended destination in query params for redirect after login
 */
export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    const isAuthenticated = await authStore.checkAuth();

    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  next();
}

/**
 * Route guard that redirects to home if user is already authenticated
 * Prevents logged-in users from accessing login/register pages
 */
export async function guestGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated) {
    await authStore.checkAuth();
  }

  if (authStore.isAuthenticated) {
    next({ path: '/' });
    return;
  }

  next();
}

