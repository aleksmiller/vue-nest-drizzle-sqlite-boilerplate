import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user'
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
  profile: {
    userId: 'user-123',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Test bio',
    updatedAt: new Date(),
  },
}

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have null profile initially', () => {
      const store = useUserStore()
      expect(store.profile).toBeNull()
    })
  })

  describe('fetchProfile', () => {
    it('should fetch and set user profile', async () => {
      vi.mocked(useApi).mockReturnValue(
        fetchResult({ data: mockProfile, statusCode: 200 }) as unknown as ReturnType<typeof useApi>,
      )

      const store = useUserStore()
      const result = await store.fetchProfile()

      expect(result).toEqual(mockProfile)
      expect(store.profile).toEqual(mockProfile)
      expect(useApi).toHaveBeenCalledWith('/api/user/profile', { immediate: false })
    })

    it('should return null on 401', async () => {
      vi.mocked(useApi).mockReturnValue(
        fetchResult({ statusCode: 401, error: new Error('Unauthorized') }) as unknown as ReturnType<
          typeof useApi
        >,
      )

      const store = useUserStore()
      const result = await store.fetchProfile()

      expect(result).toBeNull()
      expect(store.profile).toBeNull()
    })
  })

  describe('updateProfile', () => {
    it('should throw a normalized error on a 400 response', async () => {
      vi.mocked(useApi).mockReturnValue(
        fetchResult({
          statusCode: 400,
          error: new Error('Bad Request'),
          data: { message: 'Invalid input', details: { bio: ['Bio too long'] } },
        }) as unknown as ReturnType<typeof useApi>,
      )

      const store = useUserStore()

      await expect(store.updateProfile({ bio: 'x' })).rejects.toMatchObject({
        status: 400,
        message: 'Invalid input',
        details: { bio: ['Bio too long'] },
      })
    })
  })
})
