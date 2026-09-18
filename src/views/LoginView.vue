<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/api/ApiError'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const fieldErrors = ref<Record<string, string>>({})
const commonErrors = ref<string[]>([])

const expired = computed(() => route.query.reason === 'expired')

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

          <div v-if="expired" class="alert alert-warning" role="alert">
            Сессия истекла, войдите заново.
          </div>

          <div v-for="message in commonErrors" :key="message" class="alert alert-danger">
            {{ message }}
          </div>

          <form novalidate @submit.prevent="submit">
            <div class="mb-3">
              <label class="form-label" for="username">Логин</label>
              <input
                id="username"
                v-model.trim="username"
                class="form-control"
                :class="{ 'is-invalid': fieldErrors.username }"
                autocomplete="username"
                required
              />
              <div v-if="fieldErrors.username" class="invalid-feedback">
                {{ fieldErrors.username }}
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label" for="password">Пароль</label>
              <input
                id="password"
                v-model="password"
                type="password"
                class="form-control"
                :class="{ 'is-invalid': fieldErrors.password }"
                autocomplete="current-password"
                required
              />
              <div v-if="fieldErrors.password" class="invalid-feedback">
                {{ fieldErrors.password }}
              </div>
            </div>

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
