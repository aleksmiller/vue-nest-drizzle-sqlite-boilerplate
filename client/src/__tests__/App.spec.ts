import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '../App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
})

describe('App', () => {
  it('mounts and renders router-view', async () => {
    await router.push('/')
    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })
    // App component just renders router-view, so we check it exists
    expect(wrapper.html()).toBeTruthy()
    expect(wrapper.exists()).toBe(true)
  })
})
