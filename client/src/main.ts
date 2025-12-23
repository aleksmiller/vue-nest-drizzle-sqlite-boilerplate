import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'

import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PiniaColada, {
  // Global options: cache for 5 minutes
  queryOptions: { gcTime: 300000 },
})
app.use(router)

app.mount('#app')
