<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBooks } from '@/composables/useBooks'
import { useListQuery } from '@/composables/useListQuery'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BookCard from '@/components/books/BookCard.vue'
import BookCardSkeleton from '@/components/books/BookCardSkeleton.vue'
import BookFilters from '@/components/books/BookFilters.vue'

const PER_PAGE = 12

const auth = useAuthStore()

const { filters, page, isDirty, reset } = useListQuery({ search: '', authorId: '', year: '' })

const { items, pagination, loading, error, reload } = useBooks(() => ({
  page: page.value,
  perPage: PER_PAGE,
  search: filters.search,
  authorId: filters.authorId,
  year: filters.year,
}))

const total = computed(() => pagination.value.total)
</script>

<template>
  <div>
    <div class="d-flex flex-wrap gap-3 align-items-center justify-content-between mb-3">
      <div>
        <h1 class="h3 mb-0">Книги</h1>
        <p v-if="!loading && !error" class="text-body-secondary small mb-0">Найдено: {{ total }}</p>
      </div>

      <RouterLink v-if="auth.isAuthenticated" class="btn btn-primary" :to="{ name: 'book-create' }">
        Добавить книгу
      </RouterLink>
    </div>

    <BookFilters
      v-model:search="filters.search"
      v-model:author-id="filters.authorId"
      v-model:year="filters.year"
      @reset="reset"
    />

    <!-- Скелетоны той же размерности, что и карточки: страница не прыгает,
         когда данные приезжают. -->
    <div v-if="loading" class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
      <div v-for="index in PER_PAGE" :key="index" class="col">
        <BookCardSkeleton />
      </div>
    </div>

    <BaseAlert v-else-if="error" title="Не удалось загрузить каталог">
      {{ error.message }}
      <template #action>
        <button class="btn btn-outline-danger" type="button" @click="reload">Повторить</button>
      </template>
    </BaseAlert>

    <div v-else-if="!items.length" class="text-center text-body-secondary py-5">
      <p class="mb-3">Ничего не найдено.</p>
      <button v-if="isDirty" class="btn btn-outline-secondary" type="button" @click="reset">
        Сбросить фильтры
      </button>
    </div>

    <template v-else>
      <div class="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-3">
        <div v-for="book in items" :key="book.id" class="col">
          <BookCard :book="book" />
        </div>
      </div>

      <div class="d-flex justify-content-center mt-4">
        <BasePagination v-model:page="page" :total-pages="pagination.totalPages" />
      </div>
    </template>
  </div>
</template>
