import { createPinia, setActivePinia } from 'pinia'

/**
 * Setup Pinia for testing
 */
export function setupPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
  return pinia
}

/**
 * Reset Pinia stores between tests
 */
export function resetPinia() {
  const pinia = createPinia()
  setActivePinia(pinia)
}
