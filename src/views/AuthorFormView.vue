<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authorsApi } from '@/api/authors'
import { ApiError } from '@/api/ApiError'
import { useToast } from '@/composables/useToast'
import AuthorForm from '@/components/authors/AuthorForm.vue'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import type { Author } from '@/types/api'

const props = defineProps<{ id?: string }>()

const router = useRouter()
const toast = useToast()

const author = ref<Author | null>(null)
const loading = ref(false)
const error = ref<ApiError | null>(null)

const editing = computed(() => Boolean(props.id))

watch(() => props.id, load, { immediate: true })

async function load(): Promise<void> {
  if (!props.id) {
    author.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    author.value = await authorsApi.get(Number(props.id))
  } catch (failure) {
    author.value = null
    error.value =
      failure instanceof ApiError
        ? failure
        : new ApiError({ message: 'Не удалось загрузить автора' })
  } finally {
    loading.value = false
  }
}

async function save(fullName: string): Promise<void> {
  const current = author.value

  const saved = current
    ? await authorsApi.update(current.id, fullName)
    : await authorsApi.create(fullName)

  toast.success(current ? 'Автор обновлён' : 'Автор добавлен')
  await router.push({ name: 'author', params: { id: saved.id } })
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12 col-md-8 col-lg-6">
      <h1 class="h3 mb-4">{{ editing ? 'Редактирование автора' : 'Новый автор' }}</h1>

      <BaseSpinner v-if="loading" center label="Загружаем автора" />

      <div v-else-if="error?.isNotFound" class="text-center py-5">
        <p class="display-6 mb-3">Автор не найден</p>
        <p class="text-body-secondary">Редактировать нечего — возможно, его уже удалили.</p>
        <RouterLink class="btn btn-primary mt-2" :to="{ name: 'authors' }">
          К списку авторов
        </RouterLink>
      </div>

      <BaseAlert v-else-if="error" title="Не удалось открыть автора">
        {{ error.message }}
        <template #action>
          <button class="btn btn-outline-danger" type="button" @click="load">Повторить</button>
        </template>
      </BaseAlert>

      <AuthorForm v-else :key="author?.id ?? 'new'" :initial="author" :save="save">
        <template #cancel>
          <RouterLink
            class="btn btn-outline-secondary"
            :to="author ? { name: 'author', params: { id: author.id } } : { name: 'authors' }"
          >
            Отмена
          </RouterLink>
        </template>
      </AuthorForm>
    </div>
  </div>
</template>
