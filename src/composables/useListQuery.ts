import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { LocationQuery, LocationQueryRaw } from 'vue-router'

export type QueryFilters = Record<string, string>

export function useListQuery<T extends QueryFilters>(defaults: T) {
  const route = useRoute()
  const router = useRouter()

  const filters = reactive(read(route.query)) as T
  const page = ref(readPage(route.query))

  let applying = false

  watch(filters, () => {
    if (applying) return
    if (page.value !== 1) {
      page.value = 1
      return
    }
    sync()
  })

  watch(page, () => {
    if (applying) return
    sync()
  })

  watch(
    () => route.query,
    async (query) => {
      applying = true
      apply(query)
      await nextTick()
      applying = false
    },
  )

  const isDirty = computed(() => Object.values(filters).some(Boolean))

  function reset(): void {
    Object.assign(filters, defaults)
  }

  function sync(): void {
    router.replace({ query: toQuery() })
  }

  function apply(query: LocationQuery): void {
    const next = read(query)
    for (const key of Object.keys(defaults)) {
      if (filters[key] !== next[key]) Object.assign(filters, { [key]: next[key] })
    }

    const nextPage = readPage(query)
    if (page.value !== nextPage) page.value = nextPage
  }

  function read(query: LocationQuery): T {
    const result = { ...defaults }
    for (const key of Object.keys(defaults)) {
      Object.assign(result, { [key]: single(query[key]) ?? defaults[key] })
    }
    return result
  }

  function toQuery(): LocationQueryRaw {
    const query: LocationQueryRaw = {}
    for (const [key, value] of Object.entries(filters)) {
      if (value) query[key] = value
    }
    if (page.value > 1) query.page = String(page.value)
    return query
  }

  return { filters, page, isDirty, reset }
}

function single(value: LocationQuery[string] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value
  return raw ?? undefined
}

function readPage(query: LocationQuery): number {
  const value = Number(single(query.page))
  return Number.isInteger(value) && value > 0 ? value : 1
}
