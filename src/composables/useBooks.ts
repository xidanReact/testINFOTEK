import { booksApi } from '@/api/books'
import { useList } from './useList'
import type { ListParams } from '@/api/params'

export function useBooks(params: () => ListParams) {
  return useList((query) => booksApi.list(query), params, 'Не удалось загрузить книги')
}
