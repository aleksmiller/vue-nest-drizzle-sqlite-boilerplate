import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '../stores/auth'

/**
 * Ensure the auth state has been resolved with the server at least once.
 * Subsequent navigations reuse the cached result instead of re-fetching.
 */
async function ensureAuthChecked() {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated && !authStore.initialized) {
    // A failed check (e.g. 401) simply leaves the user unauthenticated.
    await authStore.checkAuth().catch(() => false)
  }
  return authStore
}

/**
 * Route guard for protected routes: redirects to login (preserving the
 * intended destination) when the user is not authenticated.
 */
export async function authGuard(
  to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = await ensureAuthChecked()

  if (!authStore.isAuthenticated) {
    next({ path: '/login', query: { redirect: to.fullPath } })
    return
  }

  next()
}

/**
 * Route guard for guest-only routes (login/register): redirects authenticated
 * users to the home page.
 */
export async function guestGuard(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = await ensureAuthChecked()

  if (authStore.isAuthenticated) {
    next({ path: '/' })
    return
  }

  next()
}
