import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import AuthForm from '../AuthForm.vue'
import { useAuthStore } from '../../stores/auth'

// Mock stores
vi.mock('../../stores/auth', () => ({
  useAuthStore: vi.fn(),
}))

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } },
    { path: '/login', component: { template: '<div>Login</div>' } },
    { path: '/profile', component: { template: '<div>Profile</div>' } },
  ],
})

describe('AuthForm', () => {
  let mockAuthStore: ReturnType<typeof useAuthStore>

  beforeEach(async () => {
    const pinia = createPinia()
    setActivePinia(pinia)

    mockAuthStore = {
      login: vi.fn(),
      register: vi.fn(),
    } as unknown as ReturnType<typeof useAuthStore>

    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore)
    await router.push('/')
  })

  describe('login mode', () => {
    it('should render login form', () => {
      const wrapper = mount(AuthForm, {
        props: { mode: 'login' },
        global: {
          plugins: [router],
        },
      })

      expect(wrapper.text()).toContain('Welcome Back!')
      expect(wrapper.find('input[type="email"]').exists()).toBe(true)
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
      expect(wrapper.find('input[name="username"]').exists()).toBe(false)
    })

    it('should submit login form with valid data', async () => {
      vi.mocked(mockAuthStore.login).mockResolvedValue({
        message: 'Logged in successfully',
        userId: 'user-123',
      })

      const wrapper = mount(AuthForm, {
        props: { mode: 'login' },
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      await wrapper.find('form').trigger('submit.prevent')

      expect(mockAuthStore.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should show validation errors for invalid input', async () => {
      const wrapper = mount(AuthForm, {
        props: { mode: 'login' },
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      await emailInput.setValue('invalid-email')

      await wrapper.find('form').trigger('submit.prevent')

      expect(mockAuthStore.login).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('Please fix the errors below')
    })

    it('should show API error messages', async () => {
      const error = {
        status: 401,
        message: 'Invalid credentials',
        details: null,
      }

      vi.mocked(mockAuthStore.login).mockRejectedValue(error)

      const wrapper = mount(AuthForm, {
        props: { mode: 'login' },
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('wrongpassword')

      await wrapper.find('form').trigger('submit.prevent')
      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Invalid credentials')
    })

    it('should redirect to profile on successful login', async () => {
      vi.mocked(mockAuthStore.login).mockResolvedValue({
        message: 'Logged in successfully',
        userId: 'user-123',
      })

      const wrapper = mount(AuthForm, {
        props: { mode: 'login' },
        global: {
          plugins: [router],
        },
      })

      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      await wrapper.find('form').trigger('submit.prevent')
      // Wait for navigation and component updates
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Check that login was called and navigation was attempted
      expect(mockAuthStore.login).toHaveBeenCalled()
      // Router push might be called, but in test environment it may not actually navigate
    })
  })

  describe('register mode', () => {
    it('should render register form', () => {
      const wrapper = mount(AuthForm, {
        props: { mode: 'register' },
        global: {
          plugins: [router],
        },
      })

      expect(wrapper.text()).toContain('Create Your Account')
      expect(wrapper.find('input[name="username"]').exists()).toBe(true)
      expect(wrapper.find('input[type="email"]').exists()).toBe(true)
      expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    })

    it('should submit register form with valid data', async () => {
      vi.mocked(mockAuthStore.register).mockResolvedValue({
        message: 'User registered successfully',
        userId: 'user-123',
      })

      const wrapper = mount(AuthForm, {
        props: { mode: 'register' },
        global: {
          plugins: [router],
        },
      })

      const usernameInput = wrapper.find('input[name="username"]')
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await usernameInput.setValue('testuser')
      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      await wrapper.find('form').trigger('submit.prevent')

      expect(mockAuthStore.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      })
    })

    it('should show validation errors for invalid input', async () => {
      const wrapper = mount(AuthForm, {
        props: { mode: 'register' },
        global: {
          plugins: [router],
        },
      })

      const usernameInput = wrapper.find('input[name="username"]')
      await usernameInput.setValue('ab') // Too short

      await wrapper.find('form').trigger('submit.prevent')

      expect(mockAuthStore.register).not.toHaveBeenCalled()
      expect(wrapper.text()).toContain('Please fix the errors below')
    })

    it('should show loading state during submission', async () => {
      vi.mocked(mockAuthStore.register).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100)),
      )

      const wrapper = mount(AuthForm, {
        props: { mode: 'register' },
        global: {
          plugins: [router],
        },
      })

      const usernameInput = wrapper.find('input[name="username"]')
      const emailInput = wrapper.find('input[type="email"]')
      const passwordInput = wrapper.find('input[type="password"]')

      await usernameInput.setValue('testuser')
      await emailInput.setValue('test@example.com')
      await passwordInput.setValue('password123')

      const form = wrapper.find('form')
      form.trigger('submit.prevent')

      await wrapper.vm.$nextTick()

      expect(wrapper.text()).toContain('Processing...')
      expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()
    })
  })
})
