import { authorsApi } from '@/api/authors'
import { useList } from './useList'
import type { ListParams } from '@/api/params'

export function useAuthors(params: () => ListParams) {
  return useList((query) => authorsApi.list(query), params, 'Не удалось загрузить авторов')
}
