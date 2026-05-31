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
  let mockAuthStore: {
    isAuthenticated: boolean
    initialized: boolean
    checkAuth: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    mockNext = vi.fn()
    mockTo = { fullPath: '/profile', path: '/profile' } as RouteLocationNormalized
    mockFrom = { path: '/' } as RouteLocationNormalized

    mockAuthStore = {
      isAuthenticated: false,
      initialized: false,
      checkAuth: vi.fn().mockResolvedValue(false),
    }

    vi.mocked(useAuthStore).mockReturnValue(
      mockAuthStore as unknown as ReturnType<typeof useAuthStore>,
    )
  })

  describe('authGuard', () => {
    it('should allow access when already authenticated without re-checking', async () => {
      mockAuthStore.isAuthenticated = true

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(mockAuthStore.checkAuth).not.toHaveBeenCalled()
    })

    it('should check auth once when not initialized, then allow on success', async () => {
      mockAuthStore.checkAuth.mockImplementation(async () => {
        mockAuthStore.isAuthenticated = true
        return true
      })

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should redirect to login when not authenticated', async () => {
      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/profile' },
      })
    })

    it('should preserve the redirect query param', async () => {
      mockTo.fullPath = '/protected/route?param=value'

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/protected/route?param=value' },
      })
    })

    it('should not re-check once initialized', async () => {
      mockAuthStore.initialized = true

      await authGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).not.toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/profile' },
      })
    })
  })

  describe('guestGuard', () => {
    it('should redirect to home when already authenticated', async () => {
      mockAuthStore.isAuthenticated = true

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith({ path: '/' })
      expect(mockAuthStore.checkAuth).not.toHaveBeenCalled()
    })

    it('should allow access when not authenticated and already initialized', async () => {
      mockAuthStore.initialized = true

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockNext).toHaveBeenCalledWith()
      expect(mockAuthStore.checkAuth).not.toHaveBeenCalled()
    })

    it('should check auth when uninitialized and redirect if authenticated', async () => {
      mockAuthStore.checkAuth.mockImplementation(async () => {
        mockAuthStore.isAuthenticated = true
        return true
      })

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith({ path: '/' })
    })

    it('should allow access if the auth check fails', async () => {
      mockAuthStore.checkAuth.mockRejectedValue(new Error('401'))

      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })

    it('should allow access if the auth check returns false', async () => {
      await guestGuard(mockTo, mockFrom, mockNext)

      expect(mockAuthStore.checkAuth).toHaveBeenCalled()
      expect(mockNext).toHaveBeenCalledWith()
    })
  })
})
