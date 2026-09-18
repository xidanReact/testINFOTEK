
export interface ApiEnvelope<T> {
  success: boolean
  data: T
}

export interface ErrorItem {
  field?: string
  message?: string
}

export interface ApiErrorEnvelope {
  success: boolean
  errors: ErrorItem[]
}

export interface MappedErrors {
  byField: Record<string, string>
  common: string[]
}

export interface AuthorShort {
  id: number
  full_name: string
}

export interface BookShort {
  id: number
  title: string
  year: number
}

export interface Book {
  id: number
  title: string
  year: number
  description?: string
  isbn?: string
  cover_url?: string
  authors: AuthorShort[]
}

export interface Author extends AuthorShort {
  books: BookShort[]
}

export interface TopAuthor {
  rank: number
  author_id: number
  full_name: string
  books_count: number
}

export interface Pagination {
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface PageInfo {
  total: number
  page: number
  perPage: number
  totalPages: number
}

export interface ListData<T> {
  items: T[]
  pagination: Pagination
}

export interface SessionUser {
  id: number
  username: string
  role: string
}

export interface LoginData {
  token: string
  expires_at: string
  user: SessionUser
}
