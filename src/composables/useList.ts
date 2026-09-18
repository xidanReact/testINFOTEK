import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { ApiError } from '@/api/ApiError'
import { fromPagination } from '@/api/params'
import type { ListParams } from '@/api/params'
import type { ListResult, PageInfo } from '@/types/api'

export function useList<T>(
  load: (params: ListParams) => Promise<ListResult<T>>,
  params: () => ListParams,
  failureMessage: string,
) {
  const items = ref([]) as Ref<T[]>
  const pagination = ref<PageInfo>(fromPagination())
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  let lastRequest = 0

  async function reload(): Promise<void> {
    const request = (lastRequest += 1)
    loading.value = true
    error.value = null

    try {
      const result = await load(params())
      if (request !== lastRequest) return

      items.value = result.items
      pagination.value = result.pagination
    } catch (failure) {
      if (request !== lastRequest) return

      items.value = []
      error.value =
        failure instanceof ApiError ? failure : new ApiError({ message: failureMessage })
    } finally {
      if (request === lastRequest) loading.value = false
    }
  }

  watch(params, reload, { immediate: true })

  return { items, pagination, loading, error, reload }
}
