import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'
import { useUserStore } from '../user'
import * as userApi from '../../api/user'

// Mock API module
vi.mock('../../api/user', () => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}))

describe('useUserStore', () => {
  beforeEach(() => {
    const pinia = createPinia()
    pinia.use(PiniaColada)
    setActivePinia(pinia)
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

      vi.mocked(userApi.getProfile).mockResolvedValue(mockProfile)

      const store = useUserStore()
      const result = await store.fetchProfile()

      expect(result).toEqual(mockProfile)
      expect(store.profile).toEqual(mockProfile)
      expect(userApi.getProfile).toHaveBeenCalled()
    })
  })
})
