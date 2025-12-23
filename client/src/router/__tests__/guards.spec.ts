import { describe, it, expect, beforeEach, vi } from 'vitest'
import { authGuard, guestGuard } from '../guards'
import { useAuthStore } from '../../stores/auth'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'

// Mock auth store
vi.mock('../../stores/auth', () => ({
  useAuthStore: vi.fn(),
}))

describe('router guards', () => {
  let mockNext: NavigationGuardNext
  let mockTo: RouteLocationNormalized
  let mockFrom: RouteLocationNormalized
  let mockAuthStore: ReturnType<typeof useAuthStore>

  beforeEach(() => {
    mockNext = vi.fn()
    mockTo = {
      fullPath: '/profile',
      path: '/profile',
    } as RouteLocationNormalized
    mockFrom = {
      path: '/',
    } as RouteLocationNormalized

    mockAuthStore = {
      isAuthenticated: false,
      user: null,
      checkAuth: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
  })

  describe('authGuard', () => {
    it('should allow access when user is authenticated', async () => {
      mockAuthStore.isAuthenticated = true

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(mockAuthStore.checkAuth).not.toHaveBeenCalled()
    })

    it('should check auth and allow access when checkAuth succeeds', async () => {
      mockAuthStore.isAuthenticated = false
      // Mock checkAuth to update isAuthenticated when called
      vi.mocked(mockAuthStore.checkAuth).mockImplementation(async () => {
        mockAuthStore.isAuthenticated = true
        return true
      })

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should redirect to login when user is not authenticated', async () => {
      mockAuthStore.isAuthenticated = false
      vi.mocked(mockAuthStore.checkAuth).mockResolvedValue(false)

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/profile' },
      })
    })

    it('should preserve redirect query param', async () => {
      mockTo.fullPath = '/protected/route?param=value'
      mockAuthStore.isAuthenticated = false
      vi.mocked(mockAuthStore.checkAuth).mockResolvedValue(false)

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/protected/route?param=value' },
      })
    })
  })

  describe('guestGuard', () => {
    it('should redirect to home when user is already authenticated', async () => {
      mockAuthStore.isAuthenticated = true

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({ path: '/' })
      expect(mockAuthStore.checkAuth).not.toHaveBeenCalled()
    })

    it('should allow access when user is definitely not authenticated', async () => {
      mockAuthStore.isAuthenticated = false
      mockAuthStore.user = null

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(mockAuthStore.checkAuth).not.toHaveBeenCalled()
    })

    it('should check auth and redirect if authenticated', async () => {
      mockAuthStore.isAuthenticated = false
      mockAuthStore.user = {
        id: 'user-123',
        username: 'test',
        email: 'test@test.com',
        createdAt: new Date(),
        profile: null,
      } // Uncertain state (not null, but not authenticated)
      // Mock checkAuth to update isAuthenticated when called
      vi.mocked(mockAuthStore.checkAuth).mockImplementation(async () => {
        mockAuthStore.isAuthenticated = true
        return true
      })

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith({ path: '/' })
    })

    it('should allow access if checkAuth fails', async () => {
      mockAuthStore.isAuthenticated = false
      mockAuthStore.user = {
        id: 'user-123',
        username: 'test',
        email: 'test@test.com',
        createdAt: new Date(),
        profile: null,
      } // Uncertain state
      vi.mocked(mockAuthStore.checkAuth).mockRejectedValue(new Error('401'))

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow access if checkAuth returns false', async () => {
      mockAuthStore.isAuthenticated = false
      mockAuthStore.user = {
        id: 'user-123',
        username: 'test',
        email: 'test@test.com',
        createdAt: new Date(),
        profile: null,
      } // Uncertain state
      vi.mocked(mockAuthStore.checkAuth).mockResolvedValue(false)

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })
  })
})
