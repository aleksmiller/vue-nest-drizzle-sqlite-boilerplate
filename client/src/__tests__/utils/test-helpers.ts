import { createPinia, setActivePinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'

/**
 * Setup Pinia with Pinia Colada for testing
 */
export function setupPinia() {
  const pinia = createPinia()
  pinia.use(PiniaColada)
  setActivePinia(pinia)
  return pinia
}

/**
 * Reset Pinia stores between tests
 */
export function resetPinia() {
  const pinia = createPinia()
  pinia.use(PiniaColada)
  setActivePinia(pinia)
}
