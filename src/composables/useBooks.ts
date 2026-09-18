import { ref, watch } from 'vue'
import { booksApi } from '@/api/books'
import { ApiError } from '@/api/ApiError'
import { fromPagination } from '@/api/params'
import type { ListParams } from '@/api/params'
import type { Book, PageInfo } from '@/types/api'

export function useBooks(params: () => ListParams) {
  const items = ref<Book[]>([])
  const pagination = ref<PageInfo>(fromPagination())
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  // Быстрый набор в поиске отправляет несколько запросов подряд, и ответы
  // возвращаются вразнобой. Применяем только ответ на последний запрос,
  // иначе в сетке мигают устаревшие книги.
  let lastRequest = 0

  async function reload(): Promise<void> {
    const request = (lastRequest += 1)
    loading.value = true
    error.value = null

    try {
      const result = await booksApi.list(params())
      if (request !== lastRequest) return

      items.value = result.items
      pagination.value = result.pagination
    } catch (failure) {
      if (request !== lastRequest) return

      items.value = []
      error.value =
        failure instanceof ApiError
          ? failure
          : new ApiError({ message: 'Не удалось загрузить книги' })
    } finally {
      if (request === lastRequest) loading.value = false
    }
  }

  watch(params, reload, { immediate: true })

  return { items, pagination, loading, error, reload }
}
