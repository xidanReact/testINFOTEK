import { http } from './http'
import type { TopAuthorsData } from '@/types/api'

export const reportsApi = {
  topAuthors: (year: number) =>
    http.get<TopAuthorsData>('/reports/top-authors', { params: { year } }),
}
