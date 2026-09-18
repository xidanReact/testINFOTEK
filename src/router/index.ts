import { defineComponent, h } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Временная заглушка: настоящие маршруты каталога появляются на этапе 6.
    {
      path: '/',
      component: defineComponent({ render: () => h('p', 'Каркас проекта готов') }),
    },
  ],
})

export default router
