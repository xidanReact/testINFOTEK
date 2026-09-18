import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'
import { SESSION_KEYS, clearSession } from '@/api/session'
import type { SessionUser } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem(SESSION_KEYS.token))
  const user = ref<SessionUser | null>(readUser())
  const expiresAt = ref<string | null>(localStorage.getItem(SESSION_KEYS.expiresAt))

  const isAuthenticated = computed(() => Boolean(token.value))
  const isGuest = computed(() => !isAuthenticated.value)

  // Протухший токен отбрасываем на старте: иначе гость увидит интерфейс
  // пользователя, а первое же действие вернёт 401.
  function restore(): void {
    if (expiresAt.value && new Date(expiresAt.value) <= new Date()) clear()
  }

  async function login(username: string, password: string): Promise<void> {
    const data = await authApi.login(username, password)

    token.value = data.token
    user.value = data.user
    expiresAt.value = data.expires_at

    localStorage.setItem(SESSION_KEYS.token, data.token)
    localStorage.setItem(SESSION_KEYS.user, JSON.stringify(data.user))
    localStorage.setItem(SESSION_KEYS.expiresAt, data.expires_at)
  }

  function clear(): void {
    token.value = null
    user.value = null
    expiresAt.value = null
    clearSession()
  }

  // В спеке нет /auth/logout, поэтому выход чисто клиентский.
  return {
    token,
    user,
    expiresAt,
    isAuthenticated,
    isGuest,
    restore,
    login,
    logout: clear,
    clear,
  }
})

function readUser(): SessionUser | null {
  const raw = localStorage.getItem(SESSION_KEYS.user)
  if (!raw) return null

  try {
    return JSON.parse(raw) as SessionUser
  } catch {
    return null
  }
}
