import type { PageInfo, Pagination } from '@/types/api'

export interface ListParams {
  page?: number
  perPage?: number
  authorId?: number | string | null
  year?: number | string | null
  search?: string | null
}

export type ListQuery = Record<string, string | number>

const LIST_PARAM_NAMES: Record<keyof ListParams, string> = {
  page: 'page',
  perPage: 'per-page', // да, через дефис — book.yaml:52
  authorId: 'author_id',
  year: 'year',
  search: 'search',
}

export function toListQuery(params: ListParams = {}): ListQuery {
  const query: ListQuery = {}
  for (const key of Object.keys(LIST_PARAM_NAMES) as (keyof ListParams)[]) {
    const value = params[key]
    if (value === '' || value === null || value === undefined) continue
    query[LIST_PARAM_NAMES[key]] = value
  }
  return query
}

export function fromPagination(pagination?: Pagination | null): PageInfo {
  return {
    total: pagination?.total ?? 0,
    page: pagination?.page ?? 1,
    perPage: pagination?.per_page ?? 0,
    totalPages: pagination?.total_pages ?? 0,
  }
}
