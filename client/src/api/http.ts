import { createFetch } from '@vueuse/core'

// Tracks an in-flight redirect to /login so concurrent 401s don't each trigger
// their own navigation. Reset once the navigation settles.
let redirectingToLogin = false

/**
 * Pre-configured VueUse fetch instance for the backend API.
 *
 * - `baseUrl` + `credentials: 'include'` so the session cookie is sent.
 * - A global `onFetchError` handles 401s: it clears auth state and redirects to
 *   /login once, except for auth endpoints (which surface their own errors) and
 *   when the user is already on a guest page.
 *
 * Usage (reactive): `const { data, error, isFetching } = useApi('/api/...').json()`
 * Usage (imperative): `const { execute, statusCode } = useApi(url, { immediate: false }).post(body).json()`
 */
export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  // A per-call `onFetchError` overrides the global one below (rather than chaining),
  // so deliberate auth probes (checkAuth) can opt out of the redirect.
  combination: 'overwrite',
  fetchOptions: {
    credentials: 'include',
  },
  options: {
    // Keep the parsed error body available on `data` for 4xx responses.
    updateDataOnError: true,
    async onFetchError(ctx) {
      const status = ctx.response?.status
      const url = ctx.context.url

      const isAuthEndpoint = url.includes('/api/auth/login') || url.includes('/api/auth/register')

      if (status === 401 && !isAuthEndpoint) {
        // Dynamic imports avoid a circular dependency (store/router import the API).
        const [{ useAuthStore }, { default: router }] = await Promise.all([
          import('../stores/auth'),
          import('../router'),
        ])

        useAuthStore().clearAuth()

        const currentPath = router.currentRoute.value.path
        const onGuestPage = currentPath === '/login' || currentPath === '/register'

        if (!redirectingToLogin && !onGuestPage) {
          redirectingToLogin = true
          router
            .replace({
              path: '/login',
              query: { redirect: router.currentRoute.value.fullPath },
            })
            .catch(() => {
              // Ignore navigation errors (e.g. a navigation already in progress).
            })
            .finally(() => {
              redirectingToLogin = false
            })
        }
      }

      return ctx
    },
  },
})
