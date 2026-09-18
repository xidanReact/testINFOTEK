import { http } from './http'
import { toListQuery, fromPagination } from './params'
import type { ListParams } from './params'
import { buildCreateRequest, buildUpdateRequest } from './bookRequest'
import type { BookPayload } from './bookRequest'
import type { Book, ListData, ListResult } from '@/types/api'

export const booksApi = {
  async list(params: ListParams = {}): Promise<ListResult<Book>> {
    const data = await http.get<ListData<Book>>('/books', { params: toListQuery(params) })
    return { items: data.items, pagination: fromPagination(data.pagination) }
  },

  get: (id: number) => http.get<Book>(`/books/${id}`),

  create: (payload: BookPayload, cover: File) => http<Book>(buildCreateRequest(payload, cover)),

  update: (id: number, payload: BookPayload, cover?: File | null) =>
    http<Book>(buildUpdateRequest(id, payload, cover)),

  remove: (id: number) => http.delete(`/books/${id}`),
}
