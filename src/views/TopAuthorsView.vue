<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { reportsApi } from '@/api/reports'
import { ApiError } from '@/api/ApiError'
import { useListQuery } from '@/composables/useListQuery'
import { yearOptions } from '@/utils/years'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import type { TopAuthor } from '@/types/api'

const DEFAULT_YEAR = 1964
const SKELETON_ROWS = 5
const LEADERS = 3

const { filters } = useListQuery({ year: String(DEFAULT_YEAR) })

const items = ref<TopAuthor[]>([])
const reportYear = ref(DEFAULT_YEAR)
const loading = ref(false)
const error = ref<ApiError | null>(null)

const years = yearOptions()

const year = computed<string | number | null>({
  get: () => filters.year || null,
  set: (value) => {
    filters.year = String(value ?? DEFAULT_YEAR)
  },
})

let lastRequest = 0

watch(() => filters.year, load, { immediate: true })

async function load(): Promise<void> {
  const request = (lastRequest += 1)
  loading.value = true
  error.value = null

  try {
    const data = await reportsApi.topAuthors(Number(filters.year))
    if (request !== lastRequest) return

    items.value = data.items
    reportYear.value = data.year
  } catch (failure) {
    if (request !== lastRequest) return

    items.value = []
    error.value =
      failure instanceof ApiError ? failure : new ApiError({ message: 'Не удалось собрать отчёт' })
  } finally {
    if (request === lastRequest) loading.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="h3 mb-1">ТОП-10 авторов</h1>
    <p class="text-body-secondary">
      Кто выпустил больше всего книг за выбранный год. Отчёт открыт всем, включая гостей.
    </p>

    <div class="row g-3 mb-4">
      <div class="col-8 col-sm-4 col-md-3">
        <BaseSelect v-model="year" label="Год выпуска" :options="years" />
      </div>
    </div>

    <BaseAlert v-if="error" title="Отчёт не собрался">
      {{ error.fieldErrors.year ?? error.message }}
      <template #action>
        <button class="btn btn-outline-danger" type="button" @click="load">Повторить</button>
      </template>
    </BaseAlert>

    <p v-else-if="!loading && !items.length" class="text-body-secondary py-4">
      За {{ reportYear }} год книг не найдено. Выберите другой год.
    </p>

    <div v-else class="table-responsive">
      <table class="table table-hover align-middle mb-0">
        <caption class="visually-hidden">
          Авторы с наибольшим числом книг за
          {{
            reportYear
          }}
          год
        </caption>
        <thead>
          <tr>
            <th scope="col" class="col-1">Место</th>
            <th scope="col">ФИО</th>
            <th scope="col" class="text-end">Книг за год</th>
          </tr>
        </thead>

        <tbody v-if="loading" class="placeholder-glow">
          <tr v-for="index in SKELETON_ROWS" :key="index" aria-hidden="true">
            <td><span class="placeholder col-4"></span></td>
            <td><span class="placeholder col-7"></span></td>
            <td class="text-end"><span class="placeholder col-2"></span></td>
          </tr>
        </tbody>

        <tbody v-else>
          <tr
            v-for="author in items"
            :key="author.author_id"
            :class="{ 'top-authors__leader': author.rank <= LEADERS }"
          >
            <td class="fw-semibold">{{ author.rank }}</td>
            <td>
              <RouterLink
                class="link-primary"
                :to="{ name: 'author', params: { id: author.author_id } }"
              >
                {{ author.full_name }}
              </RouterLink>
            </td>
            <td class="text-end">{{ author.books_count }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.top-authors__leader {
  --bs-table-bg: var(--bs-warning-bg-subtle);
}
</style>
