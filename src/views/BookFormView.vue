<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { booksApi } from '@/api/books'
import { ApiError } from '@/api/ApiError'
import { useToast } from '@/composables/useToast'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import BookForm from '@/components/books/BookForm.vue'
import type { Book } from '@/types/api'
import type { BookPayload } from '@/api/bookRequest'

const props = defineProps<{ id?: string }>()

const router = useRouter()
const toast = useToast()

const book = ref<Book | null>(null)
const loading = ref(false)
const error = ref<ApiError | null>(null)

const editing = computed(() => Boolean(props.id))

watch(() => props.id, load, { immediate: true })

async function load(): Promise<void> {
  if (!props.id) {
    book.value = null
    return
  }

  loading.value = true
  error.value = null

  try {
    book.value = await booksApi.get(Number(props.id))
  } catch (failure) {
    book.value = null
    error.value =
      failure instanceof ApiError
        ? failure
        : new ApiError({ message: 'Не удалось загрузить книгу' })
  } finally {
    loading.value = false
  }
}

async function save(payload: BookPayload, cover: File | null): Promise<void> {
  const current = book.value

  if (current) {
    const updated = await booksApi.update(current.id, payload, cover)
    toast.success('Книга обновлена')
    await router.push({ name: 'book', params: { id: updated.id } })
    return
  }

  if (!cover) {
    throw new ApiError({
      status: 422,
      message: 'Загрузите обложку',
      errors: [{ field: 'cover', message: 'Загрузите обложку' }],
    })
  }

  await booksApi.create(payload, cover)
  toast.success('Книга добавлена')
  await router.push({ name: 'books' })
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-12 col-lg-9 col-xl-8">
      <h1 class="h3 mb-4">{{ editing ? 'Редактирование книги' : 'Новая книга' }}</h1>

      <BaseSpinner v-if="loading" center label="Загружаем книгу" />

      <div v-else-if="error?.isNotFound" class="text-center py-5">
        <p class="display-6 mb-3">Книга не найдена</p>
        <p class="text-body-secondary">Редактировать нечего — возможно, её уже удалили.</p>
        <RouterLink class="btn btn-primary mt-2" :to="{ name: 'books' }">К списку книг</RouterLink>
      </div>

      <BaseAlert v-else-if="error" title="Не удалось открыть книгу">
        {{ error.message }}
        <template #action>
          <button class="btn btn-outline-danger" type="button" @click="load">Повторить</button>
        </template>
      </BaseAlert>

      <BookForm v-else :key="book?.id ?? 'new'" :initial="book" :save="save">
        <template #cancel>
          <RouterLink
            class="btn btn-outline-secondary"
            :to="book ? { name: 'book', params: { id: book.id } } : { name: 'books' }"
          >
            Отмена
          </RouterLink>
        </template>
      </BookForm>
    </div>
  </div>
</template>
