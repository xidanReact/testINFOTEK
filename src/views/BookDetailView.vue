<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { booksApi } from '@/api/books'
import { ApiError } from '@/api/ApiError'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { Book } from '@/types/api'

const props = defineProps<{ id: string }>()

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const book = ref<Book | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)
const confirming = ref(false)
const removing = ref(false)

// Со страницы автора можно перейти с одной книги на другую — маршрут тот же,
// компонент переиспользуется, поэтому следим за параметром, а не грузим в onMounted.
watch(() => props.id, load, { immediate: true })

async function load(): Promise<void> {
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

async function remove(): Promise<void> {
  removing.value = true

  try {
    // DELETE отвечает 204 без тела (book.yaml:200-201) — результата тут нет.
    await booksApi.remove(Number(props.id))
    toast.success('Книга удалена')
    await router.replace({ name: 'books' })
  } catch (failure) {
    confirming.value = false
    toast.error(failure instanceof ApiError ? failure.message : 'Не удалось удалить книгу')
  } finally {
    removing.value = false
  }
}
</script>

<template>
  <div>
    <BaseSpinner v-if="loading" center label="Загружаем книгу" />

    <div v-else-if="error?.isNotFound" class="text-center py-5">
      <p class="display-6 mb-3">Книга не найдена</p>
      <p class="text-body-secondary">Возможно, её удалили из каталога.</p>
      <RouterLink class="btn btn-primary mt-2" :to="{ name: 'books' }">К списку книг</RouterLink>
    </div>

    <BaseAlert v-else-if="error" title="Не удалось открыть книгу">
      {{ error.message }}
      <template #action>
        <button class="btn btn-outline-danger" type="button" @click="load">Повторить</button>
      </template>
    </BaseAlert>

    <template v-else-if="book">
      <RouterLink class="link-secondary small d-inline-block mb-3" :to="{ name: 'books' }">
        &larr; К списку книг
      </RouterLink>

      <div class="row g-4">
        <div class="col-8 col-sm-5 col-md-4 col-lg-3">
          <img
            v-if="book.cover_url"
            class="cover-thumb rounded shadow-sm"
            :src="book.cover_url"
            :alt="`Обложка книги «${book.title}»`"
          />
          <div v-else class="cover-thumb rounded cover-thumb--empty">Нет обложки</div>
        </div>

        <div class="col-12 col-md-8 col-lg-9">
          <h1 class="h3 mb-3">{{ book.title }}</h1>

          <dl class="row mb-3">
            <dt class="col-4 col-sm-3 text-body-secondary fw-normal">Год</dt>
            <dd class="col-8 col-sm-9 mb-2">{{ book.year }}</dd>

            <template v-if="book.isbn">
              <dt class="col-4 col-sm-3 text-body-secondary fw-normal">ISBN</dt>
              <dd class="col-8 col-sm-9 mb-2">{{ book.isbn }}</dd>
            </template>

            <dt class="col-4 col-sm-3 text-body-secondary fw-normal">
              {{ book.authors.length > 1 ? 'Авторы' : 'Автор' }}
            </dt>
            <dd class="col-8 col-sm-9 mb-0">
              <template v-if="book.authors.length">
                <template v-for="(author, index) in book.authors" :key="author.id">
                  <RouterLink
                    class="link-primary"
                    :to="{ name: 'author', params: { id: author.id } }"
                  >
                    {{ author.full_name }}
                  </RouterLink>
                  <span v-if="index < book.authors.length - 1" class="text-body-secondary">, </span>
                </template>
              </template>
              <span v-else class="text-body-secondary">не указан</span>
            </dd>
          </dl>

          <p v-if="book.description" class="mb-4">{{ book.description }}</p>

          <div v-if="auth.isAuthenticated" class="d-flex flex-wrap gap-2">
            <RouterLink
              class="btn btn-outline-primary"
              :to="{ name: 'book-edit', params: { id: book.id } }"
            >
              Редактировать
            </RouterLink>
            <button class="btn btn-outline-danger" type="button" @click="confirming = true">
              Удалить
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        v-model="confirming"
        title="Удалить книгу?"
        :message="`«${book.title}» исчезнет из каталога. Действие необратимо.`"
        :loading="removing"
        @confirm="remove"
      />
    </template>
  </div>
</template>
