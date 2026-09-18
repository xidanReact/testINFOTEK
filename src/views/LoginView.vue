<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/api/ApiError'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const commonErrors = ref<string[]>([])

async function submit() {
  loading.value = true
  fieldErrors.value = {}
  commonErrors.value = []

  try {
    await auth.login(username.value, password.value)
    await router.replace(redirectTarget())
  } catch (error) {
    if (error instanceof ApiError) {
      fieldErrors.value = error.fieldErrors
      commonErrors.value = error.commonErrors.length ? error.commonErrors : [error.message]
    } else {
      commonErrors.value = ['Не удалось войти, попробуйте ещё раз']
    }
  } finally {
    loading.value = false
  }
}

// Редирект берём только относительный: чужой абсолютный адрес из query —
// это открытый редирект.
function redirectTarget(): string {
  const redirect = route.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/books'
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12 col-sm-10 col-md-6 col-lg-5">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h1 class="h4 mb-4">Вход</h1>

          <BaseAlert v-for="message in commonErrors" :key="message" class="mb-3">
            {{ message }}
          </BaseAlert>

          <form novalidate @submit.prevent="submit">
            <BaseInput
              v-model.trim="username"
              class="mb-3"
              label="Логин"
              autocomplete="username"
              :error="fieldErrors.username"
              required
            />

            <BaseInput
              v-model="password"
              class="mb-4"
              label="Пароль"
              type="password"
              autocomplete="current-password"
              :error="fieldErrors.password"
              required
            />

            <button class="btn btn-primary w-100" type="submit" :disabled="loading">
              <span
                v-if="loading"
                class="spinner-border spinner-border-sm me-2"
                aria-hidden="true"
              />
              Войти
            </button>
          </form>

          <p class="text-body-secondary small mt-4 mb-0">
            Тестовая учётная запись: <code>user</code> / <code>password</code>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
