import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

/**
 * Route guard that redirects to login if user is not authenticated
 * Preserves the intended destination in query params for redirect after login
 */
export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    const isAuthenticated = await authStore.checkAuth()

    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      })
      return
    }
  }

  next()
}

/**
 * Route guard that redirects to home if user is already authenticated
 * Prevents logged-in users from accessing login/register pages
 */
export async function guestGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore()

  // If user is already marked as authenticated, redirect to home
  if (authStore.isAuthenticated) {
    next({ path: '/' })
    return
  }

  // Only check auth if we have a user but not authenticated flag
  // This prevents unnecessary API calls for unauthenticated users
  // If user is null and isAuthenticated is false, we know they're not logged in
  if (authStore.user === null && !authStore.isAuthenticated) {
    // User is definitely not authenticated, allow access to guest pages
    next()
    return
  }

  // Only check auth if we're in an uncertain state
  // This should rarely happen, but handles edge cases
  try {
    await authStore.checkAuth()
    // If checkAuth succeeds, redirect to home
    if (authStore.isAuthenticated) {
      next({ path: '/' })
      return
    }
  } catch {
    // If checkAuth fails (e.g., 401), user is not authenticated
    // This is fine for guest pages - just continue
  }

  next()
}
