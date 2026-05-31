import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../auth'
import { useApi } from '../../api/http'

// Mock the fetch instance
vi.mock('../../api/http', () => ({ useApi: vi.fn() }))

/** Build a fake chainable useFetch return value backed by real refs. */
function fetchResult({
  data = null,
  statusCode = 200,
  error = null,
}: {
  data?: unknown
  statusCode?: number | null
  error?: unknown
} = {}) {
  const obj = {
    data: ref(data),
    error: ref(error),
    statusCode: ref(statusCode),
    isFetching: ref(false),
    execute: vi.fn().mockResolvedValue(undefined),
  } as Record<string, unknown>
  obj.json = () => obj
  obj.post = () => obj
  obj.put = () => obj
  obj.get = () => obj
  return obj
}

const mockProfile = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  createdAt: new Date(),
  profile: null,
}

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have null user initially', () => {
      const store = useAuthStore()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(store.isLoggedIn).toBe(false)
    })

    it('should not be checking auth initially', () => {
      const store = useAuthStore()
      expect(store.isCheckingAuth).toBe(false)
      expect(store.initialized).toBe(false)
    })
  })

  describe('checkAuth', () => {
    it('should set authenticated state when profile fetch succeeds', async () => {
      vi.mocked(useApi).mockReturnValue(
        fetchResult({ data: mockProfile, statusCode: 200 }) as unknown as ReturnType<typeof useApi>,
      )

      const store = useAuthStore()
      const result = await store.checkAuth()

      expect(result).toBe(true)
      expect(store.isAuthenticated).toBe(true)
      expect(store.user).toEqual(mockProfile)
      expect(store.isLoggedIn).toBe(true)
      expect(store.initialized).toBe(true)
    })

    it('should set unauthenticated state when profile fetch returns 401', async () => {
      vi.mocked(useApi).mockReturnValue(
        fetchResult({ statusCode: 401, error: new Error('Unauthorized') }) as unknown as ReturnType<
          typeof useApi
        >,
      )

      const store = useAuthStore()
      const result = await store.checkAuth()

      expect(result).toBe(false)
      expect(store.isAuthenticated).toBe(false)
      expect(store.user).toBeNull()
      expect(store.isLoggedIn).toBe(false)
    })
  })

  describe('isLoggedIn', () => {
    it('should return true when authenticated and user exists', async () => {
      vi.mocked(useApi).mockReturnValue(
        fetchResult({ data: mockProfile, statusCode: 200 }) as unknown as ReturnType<typeof useApi>,
      )

      const store = useAuthStore()
      await store.checkAuth()

      expect(store.isLoggedIn).toBe(true)
    })

    it('should return false when not authenticated', () => {
      const store = useAuthStore()
      expect(store.isLoggedIn).toBe(false)
    })
  })
})
