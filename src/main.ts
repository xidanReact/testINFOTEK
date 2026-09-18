import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/assets/scss/main.scss'

import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

async function startMocks() {
  if (import.meta.env.VITE_USE_MOCKS === 'false') return

  const { worker } = await import('@/mocks/browser')
  await worker.start({ onUnhandledRequest: 'bypass' })
}

async function bootstrap() {
  await startMocks()

  const app = createApp(App)
  const pinia = createPinia()

  app.use(pinia)
  useAuthStore(pinia).restore()

  app.use(router)
  app.mount('#app')
}

bootstrap()
