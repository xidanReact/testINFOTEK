<script setup lang="ts">
// Список отдаёт только AuthorShort — id и full_name (book.yaml:622-636).
// Колонки «книг в каталоге» здесь быть не может: количество живёт в /authors/{id}
// и в отчёте ТОП-10. Это ограничение контракта, а не недоделанная колонка.
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAuthors } from '@/composables/useAuthors'
import { useAuthorDelete } from '@/composables/useAuthorDelete'
import { useListQuery } from '@/composables/useListQuery'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import SearchInput from '@/components/ui/SearchInput.vue'

const PER_PAGE = 20
const SKELETON_ROWS = 6

const auth = useAuthStore()

const { filters, page, isDirty, reset } = useListQuery({ search: '' })

const { items, pagination, loading, error, reload } = useAuthors(() => ({
  page: page.value,
  perPage: PER_PAGE,
  search: filters.search,
}))

const {
  target: pending,
  open: confirming,
  removing,
  ask,
  confirm,
} = useAuthorDelete(() => reload())
</script>

<template>
  <div>
    <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h3 mb-0">Авторы</h1>
        <p v-if="!loading && !error" class="text-body-secondary small mb-0">
          Найдено: {{ pagination.total }}
        </p>
      </div>

      <RouterLink
        v-if="auth.isAuthenticated"
        class="btn btn-primary"
        :to="{ name: 'author-create' }"
      >
        Добавить автора
      </RouterLink>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-md-6">
        <SearchInput v-model="filters.search" label="ФИО" placeholder="Например, Стругацкий" />
      </div>

      <div v-if="isDirty" class="col-12 col-md-2 align-self-end">
        <button class="btn btn-outline-secondary w-100" type="button" @click="reset">
          Сбросить
        </button>
      </div>
    </div>

    <BaseAlert v-if="error" title="Не удалось загрузить авторов">
      {{ error.message }}
      <template #action>
        <button class="btn btn-outline-danger" type="button" @click="reload">Повторить</button>
      </template>
    </BaseAlert>

    <div v-else-if="!loading && !items.length" class="text-center text-body-secondary py-5">
      <p class="mb-3">Ничего не найдено.</p>
      <button v-if="isDirty" class="btn btn-outline-secondary" type="button" @click="reset">
        Сбросить поиск
      </button>
    </div>

    <template v-else>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <caption class="visually-hidden">
            Авторы каталога
          </caption>
          <thead>
            <tr>
              <th scope="col">ФИО</th>
              <th v-if="auth.isAuthenticated" scope="col" class="text-end">Действия</th>
            </tr>
          </thead>

          <tbody v-if="loading" class="placeholder-glow">
            <tr v-for="index in SKELETON_ROWS" :key="index" aria-hidden="true">
              <td><span class="placeholder col-6"></span></td>
              <td v-if="auth.isAuthenticated" class="text-end">
                <span class="placeholder col-4"></span>
              </td>
            </tr>
          </tbody>

          <tbody v-else>
            <tr v-for="author in items" :key="author.id">
              <td>
                <RouterLink
                  class="link-primary"
                  :to="{ name: 'author', params: { id: author.id } }"
                >
                  {{ author.full_name }}
                </RouterLink>
              </td>

              <td v-if="auth.isAuthenticated" class="text-end text-nowrap">
                <RouterLink
                  class="btn btn-sm btn-outline-primary"
                  :to="{ name: 'author-edit', params: { id: author.id } }"
                >
                  Редактировать
                </RouterLink>
                <button
                  class="btn btn-sm btn-outline-danger ms-2"
                  type="button"
                  @click="ask(author)"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="d-flex justify-content-center mt-4">
        <BasePagination v-model:page="page" :total-pages="pagination.totalPages" />
      </div>
    </template>

    <ConfirmDialog
      v-model="confirming"
      title="Удалить автора?"
      :message="`${pending?.full_name ?? 'Автор'} исчезнет из справочника и из своих книг. Книги останутся в каталоге.`"
      :loading="removing"
      @confirm="confirm"
    />
  </div>
</template>
