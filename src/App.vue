<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

// Интерцептор http.ts о роутере не знает и просто кидает событие — уводим
// на логин здесь.
function handleExpired() {
  auth.clear()

  const current = router.currentRoute.value
  if (current.name === 'login') return

  router.push({ name: 'login', query: { redirect: current.fullPath, reason: 'expired' } })
}

onMounted(() => window.addEventListener('auth:expired', handleExpired))
onUnmounted(() => window.removeEventListener('auth:expired', handleExpired))
</script>

<template>
  <main class="container py-4">
    <RouterView />
  </main>
</template>
