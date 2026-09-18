import { authors as seedAuthors, books as seedBooks } from './fixtures'
import type { AuthorRecord, BookRecord } from './fixtures'
import type { Author, Book, ListData, Pagination } from '@/types/api'

export interface SubscriptionRecord {
  id: number
  author_id: number
  phone: string
  created_at: string
}

interface Identified {
  id: number
}

export const db = {
  authors: seedAuthors.map((author) => ({ ...author })) as AuthorRecord[],
  books: seedBooks.map((book) => ({ ...book, author_ids: [...book.author_ids] })) as BookRecord[],
  subscriptions: [] as SubscriptionRecord[],
}

export function nextId(items: Identified[]): number {
  return Math.max(0, ...items.map((item) => item.id)) + 1
}

export function serializeBook(book: BookRecord): Book {
  return {
    id: book.id,
    title: book.title,
    year: book.year,
    description: book.description,
    isbn: book.isbn,
    cover_url: book.cover_url,
    authors: book.author_ids
      .map((id) => db.authors.find((author) => author.id === id))
      .filter((author): author is AuthorRecord => Boolean(author))
      .map(({ id, full_name }) => ({ id, full_name })),
  }
}

export function serializeAuthor(author: AuthorRecord): Author {
  return {
    id: author.id,
    full_name: author.full_name,
    books: db.books
      .filter((book) => book.author_ids.includes(author.id))
      .map(({ id, title, year }) => ({ id, title, year })),
  }
}

export function paginate<T>(items: T[], page = 1, perPage = 20): ListData<T> {
  const safePerPage = clamp(perPage, 1, 100)
  const totalPages = Math.ceil(items.length / safePerPage) || 1
  const safePage = clamp(page, 1, totalPages)
  const start = (safePage - 1) * safePerPage

  const pagination: Pagination = {
    total: items.length,
    page: safePage,
    per_page: safePerPage,
    total_pages: totalPages,
  }

  return { items: items.slice(start, start + safePerPage), pagination }
}

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.min(Math.max(Math.trunc(value), min), max)
}
