<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { authorsApi } from '@/api/authors'
import { ApiError } from '@/api/ApiError'
import { useAuthStore } from '@/stores/auth'
import { useAuthorDelete } from '@/composables/useAuthorDelete'
import SubscribeForm from '@/components/authors/SubscribeForm.vue'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseSpinner from '@/components/ui/BaseSpinner.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import type { Author } from '@/types/api'

const props = defineProps<{ id: string }>()

const router = useRouter()
const auth = useAuthStore()

const author = ref<Author | null>(null)
const loading = ref(true)
const error = ref<ApiError | null>(null)

const {
  target: pending,
  open: confirming,
  removing,
  ask,
  confirm,
} = useAuthorDelete(async () => {
  await router.replace({ name: 'authors' })
})

watch(() => props.id, load, { immediate: true })

async function load(): Promise<void> {
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
</script>

<template>
  <div>
    <BaseSpinner v-if="loading" center label="Загружаем автора" />

    <div v-else-if="error?.isNotFound" class="text-center py-5">
      <p class="display-6 mb-3">Автор не найден</p>
      <p class="text-body-secondary">Возможно, его удалили из справочника.</p>
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

    <template v-else-if="author">
      <RouterLink class="link-secondary small d-inline-block mb-3" :to="{ name: 'authors' }">
        &larr; К списку авторов
      </RouterLink>

      <div class="d-flex flex-wrap gap-3 align-items-start justify-content-between mb-4">
        <div>
          <h1 class="h3 mb-1">{{ author.full_name }}</h1>
          <p class="text-body-secondary mb-0">Книг в каталоге: {{ author.books.length }}</p>
        </div>

        <div v-if="auth.isAuthenticated" class="d-flex flex-wrap gap-2">
          <RouterLink
            class="btn btn-outline-primary"
            :to="{ name: 'author-edit', params: { id: author.id } }"
          >
            Редактировать
          </RouterLink>
          <button class="btn btn-outline-danger" type="button" @click="ask(author)">Удалить</button>
        </div>
      </div>

      <div class="row g-4">
        <div class="col-12 col-lg-8">
          <h2 class="h5 mb-3">Книги</h2>

          <p v-if="!author.books.length" class="text-body-secondary">
            Книг этого автора в каталоге пока нет.
          </p>

          <div v-else class="row row-cols-1 row-cols-sm-2 g-3">
            <div v-for="book in author.books" :key="book.id" class="col">
              <article class="card h-100 shadow-sm">
                <div class="card-body">
                  <h3 class="h6 card-title mb-1">
                    <RouterLink
                      class="stretched-link author-books__title"
                      :to="{ name: 'book', params: { id: book.id } }"
                    >
                      {{ book.title }}
                    </RouterLink>
                  </h3>
                  <p class="text-body-secondary small mb-0">{{ book.year }}</p>
                </div>
              </article>
            </div>
          </div>
        </div>

        <aside class="col-12 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <h2 class="h6 mb-2">Новые книги автора</h2>
              <p class="text-body-secondary small mb-3">
                Пришлём SMS, когда в каталоге появится новая книга.
              </p>

              <SubscribeForm :author-id="author.id" />
            </div>
          </div>
        </aside>
      </div>

      <ConfirmDialog
        v-model="confirming"
        title="Удалить автора?"
        :message="`${pending?.full_name ?? 'Автор'} исчезнет из справочника и из своих книг. Книги останутся в каталоге.`"
        :loading="removing"
        @confirm="confirm"
      />
    </template>
  </div>
</template>

<style scoped>
.author-books__title:hover {
  color: var(--bs-primary);
}
</style>
