import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import UserProfile from '../UserProfile.vue'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '../../stores/user'

// Mock stores
vi.mock('../../stores/auth', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('../../stores/user', () => ({
  useUserStore: vi.fn(),
}))

describe('UserProfile', () => {
  let mockAuthStore: {
    user: {
      id: string
      username: string
      email: string
      createdAt: Date
      profile: {
        userId: string
        firstName: string | null
        lastName: string | null
        bio: string | null
        updatedAt: Date | null
      } | null
    } | null
    isAuthenticated: boolean
    checkAuth: ReturnType<typeof vi.fn>
  }
  let mockUserStore: {
    profile: {
      userId: string
      firstName: string | null
      lastName: string | null
      bio: string | null
      updatedAt: Date | null
    } | null
    fetchProfile: ReturnType<typeof vi.fn>
    updateProfile: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)

    mockAuthStore = {
      user: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
        profile: null,
      },
      isAuthenticated: true,
      checkAuth: vi.fn(),
    }

    mockUserStore = {
      profile: null,
      fetchProfile: vi.fn(),
      updateProfile: vi.fn(),
    }

    vi.mocked(useAuthStore).mockReturnValue(
      mockAuthStore as unknown as ReturnType<typeof useAuthStore>,
    )
    vi.mocked(useUserStore).mockReturnValue(
      mockUserStore as unknown as ReturnType<typeof useUserStore>,
    )
  })

  it('should render user information', () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    expect(wrapper.text()).toContain('User Profile')
    expect(wrapper.text()).toContain('testuser')
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('should show edit button when not editing', () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    expect(wrapper.text()).toContain('Edit Profile')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('should show edit form when edit button is clicked', async () => {
    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    const editButton = wrapper.find('button')
    await editButton.trigger('click')

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('input[id="firstName"]').exists()).toBe(true)
    expect(wrapper.find('input[id="lastName"]').exists()).toBe(true)
    expect(wrapper.find('textarea[id="bio"]').exists()).toBe(true)
  })

  it('should display profile information when available', () => {
    Object.assign(mockAuthStore, {
      user: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
        profile: {
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Test bio',
          updatedAt: new Date('2024-01-02'),
        },
      },
    })

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    expect(wrapper.text()).toContain('John')
    expect(wrapper.text()).toContain('Doe')
    expect(wrapper.text()).toContain('Test bio')
  })

  it('should show "Not set" for missing profile fields', () => {
    Object.assign(mockAuthStore, {
      user: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
        profile: {
          userId: 'user-123',
          firstName: null,
          lastName: null,
          bio: null,
          updatedAt: null,
        },
      },
    })

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    expect(wrapper.text()).toContain('Not set')
  })

  it('should submit profile update form', async () => {
    vi.mocked(mockUserStore.updateProfile).mockResolvedValue(undefined)

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    // Click edit button
    await wrapper.find('button').trigger('click')

    // Fill form
    const firstNameInput = wrapper.find('input[id="firstName"]')
    const lastNameInput = wrapper.find('input[id="lastName"]')
    const bioTextarea = wrapper.find('textarea[id="bio"]')

    await firstNameInput.setValue('Jane')
    await lastNameInput.setValue('Smith')
    await bioTextarea.setValue('Updated bio')

    // Submit form
    const form = wrapper.find('form')
    await form.trigger('submit.prevent')

    expect(mockUserStore.updateProfile).toHaveBeenCalled()
  })

  it('should show success message after successful update', async () => {
    vi.mocked(mockUserStore.updateProfile).mockResolvedValue(undefined)

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.find('input[id="firstName"]').setValue('Jane')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Profile updated successfully')
  })

  it('should show error message on update failure', async () => {
    const error = {
      status: 400,
      message: 'Update failed',
      details: null,
    }

    vi.mocked(mockUserStore.updateProfile).mockRejectedValue(error)

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.find('input[id="firstName"]').setValue('Jane')
    await wrapper.find('form').trigger('submit.prevent')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Update failed')
  })

  it('should cancel editing and reset form', async () => {
    Object.assign(mockAuthStore, {
      user: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date('2024-01-01'),
        profile: {
          userId: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          bio: 'Original bio',
          updatedAt: new Date(),
        },
      },
    })

    const wrapper = mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    await wrapper.find('button').trigger('click')
    await wrapper.find('input[id="firstName"]').setValue('Changed')
    await wrapper.find('button[type="button"]').trigger('click')

    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain('Edit Profile')
  })

  it('should fetch profile on mount if authenticated', async () => {
    mount(UserProfile, {
      global: {
        plugins: [],
      },
    })

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(mockUserStore.fetchProfile).toHaveBeenCalled()
  })
})
