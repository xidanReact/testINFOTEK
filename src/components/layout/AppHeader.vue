<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const sections = [
  { label: 'Книги', to: { name: 'books' }, prefix: '/books' },
  { label: 'Авторы', to: { name: 'authors' }, prefix: '/authors' },
  { label: 'Отчёт', to: { name: 'top-authors' }, prefix: '/reports' },
] as const

const menuOpen = ref(false)

watch(() => route.fullPath, close)

function isActive(prefix: string): boolean {
  return route.path === prefix || route.path.startsWith(`${prefix}/`)
}

function close(): void {
  menuOpen.value = false
}

async function logout(): Promise<void> {
  auth.logout()
  close()
  toast.success('Вы вышли из аккаунта')

  if (route.meta.requiresAuth) await router.push({ name: 'books' })
}
</script>

<template>
  <header class="bg-white border-bottom">
    <nav class="navbar navbar-expand-md container py-2" aria-label="Основная навигация">
      <RouterLink class="navbar-brand fw-semibold" :to="{ name: 'books' }">Каталог книг</RouterLink>

      <button
        class="navbar-toggler"
        type="button"
        aria-controls="app-nav"
        aria-label="Меню"
        :aria-expanded="menuOpen"
        @click="menuOpen = !menuOpen"
      >
        <span class="navbar-toggler-icon" />
      </button>

      <div id="app-nav" class="collapse navbar-collapse" :class="{ show: menuOpen }">
        <ul class="navbar-nav me-auto mb-2 mb-md-0">
          <li v-for="section in sections" :key="section.prefix" class="nav-item">
            <RouterLink
              class="nav-link"
              :class="{ active: isActive(section.prefix) }"
              :aria-current="isActive(section.prefix) ? 'page' : undefined"
              :to="section.to"
            >
              {{ section.label }}
            </RouterLink>
          </li>
        </ul>

        <div v-if="auth.isAuthenticated" class="d-flex align-items-center gap-3">
          <span class="text-body-secondary small">{{ auth.user?.username }}</span>
          <button class="btn btn-outline-secondary btn-sm" type="button" @click="logout">
            Выйти
          </button>
        </div>

        <RouterLink v-else class="btn btn-primary btn-sm" :to="{ name: 'login' }">Войти</RouterLink>
      </div>
    </nav>
  </header>
</template>
