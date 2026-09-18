import { http } from './http'
import { toListQuery, fromPagination } from './params'
import type { ListParams } from './params'
import type { Author, AuthorShort, ListData, ListResult } from '@/types/api'

export const authorsApi = {
  async list(params: ListParams = {}): Promise<ListResult<AuthorShort>> {
    const data = await http.get<ListData<AuthorShort>>('/authors', { params: toListQuery(params) })
    return { items: data.items, pagination: fromPagination(data.pagination) }
  },

  get: (id: number) => http.get<Author>(`/authors/${id}`),

  create: (fullName: string) => http.post<Author>('/authors', { full_name: fullName }),

  update: (id: number, fullName: string) =>
    http.put<Author>(`/authors/${id}`, { full_name: fullName }),

  remove: (id: number) => http.delete(`/authors/${id}`),
}
