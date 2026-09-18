<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import ToastContainer from '@/components/ui/ToastContainer.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

// Интерцептор http.ts о роутере не знает и просто кидает событие — уводим
// на логин здесь.
function handleExpired() {
  auth.clear()
  toast.error('Сессия истекла, войдите заново')

  const current = router.currentRoute.value
  if (current.name === 'login') return

  router.push({ name: 'login', query: { redirect: current.fullPath } })
}

onMounted(() => window.addEventListener('auth:expired', handleExpired))
onUnmounted(() => window.removeEventListener('auth:expired', handleExpired))
</script>

<template>
  <main class="container py-4">
    <RouterView />
  </main>

  <ToastContainer />
</template>
