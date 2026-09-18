import { http } from 'msw'
import { db, nextId, paginate, serializeAuthor, serializeBook } from './db'
import { CREDENTIALS, TOKEN, fail, lag, noContent, notFound, ok, requireAuth } from './responses'
import {
  fileToDataUrl,
  normalizePhone,
  readBookForm,
  readBookJson,
  validateBookFields,
  validateFullName,
} from './payload'
import type { BookFields } from './payload'
import type { BookRecord } from './fixtures'

const BASE = '/api/v1'

const DAY_MS = 86_400_000

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await lag()
    const body = (await request.json()) as Record<string, unknown>

    if (body.username !== CREDENTIALS.username || body.password !== CREDENTIALS.password) {
      return fail(401, [{ message: 'Неверный логин или пароль' }])
    }

    return ok({
      token: TOKEN,
      expires_at: new Date(Date.now() + DAY_MS).toISOString(),
      user: { id: 1, username: CREDENTIALS.username, role: 'user' },
    })
  }),

  http.get(`${BASE}/books`, async ({ request }) => {
    await lag()
    const url = new URL(request.url)
    const authorId = url.searchParams.get('author_id')
    const year = url.searchParams.get('year')
    const search = url.searchParams.get('search')?.trim().toLowerCase()

    let found = db.books
    if (authorId) found = found.filter((book) => book.author_ids.includes(Number(authorId)))
    if (year) found = found.filter((book) => book.year === Number(year))
    if (search) found = found.filter((book) => book.title.toLowerCase().includes(search))

    const page = paginate(
      found,
      Number(url.searchParams.get('page') ?? 1),
      Number(url.searchParams.get('per-page') ?? 20),
    )

    return ok({ items: page.items.map(serializeBook), pagination: page.pagination })
  }),

  http.get(`${BASE}/books/:id`, async ({ params }) => {
    await lag()
    const book = findBook(params.id)

    return book ? ok(serializeBook(book)) : notFound('Книга не найдена')
  }),

  http.post(`${BASE}/books`, async ({ request }) => {
    await lag()
    const denied = requireAuth(request)
    if (denied) return denied

    const { fields, cover } = await readBookForm(request)
    const errors = validateBookFields(fields, true)
    if (!cover) errors.push({ field: 'cover', message: 'Загрузите обложку' })
    if (errors.length) return fail(422, errors)

    const book: BookRecord = {
      id: nextId(db.books),
      title: fields.title?.trim() ?? '',
      year: fields.year ?? 0,
      description: fields.description?.trim() ?? '',
      isbn: fields.isbn?.trim() ?? '',
      cover_url: cover ? await fileToDataUrl(cover) : '',
      author_ids: fields.author_ids ?? [],
    }

    db.books.unshift(book)
    return ok(serializeBook(book), 201)
  }),

  http.put(`${BASE}/books/:id`, async ({ request, params }) => {
    await lag()
    const denied = requireAuth(request)
    if (denied) return denied

    const book = findBook(params.id)
    if (!book) return notFound('Книга не найдена')

    const { fields, cover } = await readBookForm(request)
    const errors = validateBookFields(fields, true)
    if (!cover) errors.push({ field: 'cover', message: 'Загрузите обложку' })
    if (errors.length) return fail(422, errors)

    applyFields(book, fields, cover ? await fileToDataUrl(cover) : undefined)
    return ok(serializeBook(book))
  }),

  http.patch(`${BASE}/books/:id`, async ({ request, params }) => {
    await lag()
    const denied = requireAuth(request)
    if (denied) return denied

    const book = findBook(params.id)
    if (!book) return notFound('Книга не найдена')

    const fields = await readBookJson(request)
    const errors = validateBookFields(fields, false)
    if (errors.length) return fail(422, errors)

    applyFields(book, fields)
    return ok(serializeBook(book))
  }),

  http.delete(`${BASE}/books/:id`, async ({ request, params }) => {
    await lag()
    const denied = requireAuth(request)
    if (denied) return denied

    const index = db.books.findIndex((book) => book.id === Number(params.id))
    if (index === -1) return notFound('Книга не найдена')

    db.books.splice(index, 1)
    return noContent()
  }),

  http.get(`${BASE}/authors`, async ({ request }) => {
    await lag()
    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.trim().toLowerCase()

    const found = search
      ? db.authors.filter((author) => author.full_name.toLowerCase().includes(search))
      : db.authors

    const page = paginate(
      found,
      Number(url.searchParams.get('page') ?? 1),
      Number(url.searchParams.get('per-page') ?? 20),
    )

    return ok({
      items: page.items.map(({ id, full_name }) => ({ id, full_name })),
      pagination: page.pagination,
    })
  }),

  http.post(`${BASE}/authors`, async ({ request }) => {
    await lag()
    const denied = requireAuth(request)
    if (denied) return denied

    const body = (await request.json()) as Record<string, unknown>
    const errors = validateFullName(body.full_name)
    if (errors.length) return fail(422, errors)

    const author = { id: nextId(db.authors), full_name: String(body.full_name).trim() }
    db.authors.push(author)

    return ok(serializeAuthor(author), 201)
  }),

  http.get(`${BASE}/authors/:id`, async ({ params }) => {
    await lag()
    const author = db.authors.find((item) => item.id === Number(params.id))

    return author ? ok(serializeAuthor(author)) : notFound('Автор не найден')
  }),

  http.put(`${BASE}/authors/:id`, async ({ request, params }) => {
    await lag()
    const denied = requireAuth(request)
    if (denied) return denied

    const author = db.authors.find((item) => item.id === Number(params.id))
    if (!author) return notFound('Автор не найден')

    const body = (await request.json()) as Record<string, unknown>
    const errors = validateFullName(body.full_name)
    if (errors.length) return fail(422, errors)

    author.full_name = String(body.full_name).trim()
    return ok(serializeAuthor(author))
  }),

  http.delete(`${BASE}/authors/:id`, async ({ request, params }) => {
    await lag()
    const denied = requireAuth(request)
    if (denied) return denied

    const id = Number(params.id)
    const index = db.authors.findIndex((author) => author.id === id)
    if (index === -1) return notFound('Автор не найден')

    db.authors.splice(index, 1)
    for (const book of db.books) {
      book.author_ids = book.author_ids.filter((authorId) => authorId !== id)
    }
    db.subscriptions = db.subscriptions.filter((item) => item.author_id !== id)

    return noContent()
  }),

  http.get(`${BASE}/reports/top-authors`, async ({ request }) => {
    await lag()
    const year = Number(new URL(request.url).searchParams.get('year'))
    if (!year) return fail(400, [{ field: 'year', message: 'Укажите год' }])

    const counts = new Map<number, number>()
    for (const book of db.books.filter((item) => item.year === year)) {
      for (const authorId of book.author_ids) {
        counts.set(authorId, (counts.get(authorId) ?? 0) + 1)
      }
    }

    const items = [...counts.entries()]
      .map(([authorId, booksCount]) => ({
        author_id: authorId,
        full_name: db.authors.find((author) => author.id === authorId)?.full_name ?? '',
        books_count: booksCount,
      }))
      .sort((a, b) => b.books_count - a.books_count || a.full_name.localeCompare(b.full_name))
      .slice(0, 10)
      .map((item, index) => ({ rank: index + 1, ...item }))

    return ok({ year, items })
  }),

  http.post(`${BASE}/authors/:id/subscriptions`, async ({ request, params }) => {
    await lag()
    const author = db.authors.find((item) => item.id === Number(params.id))
    if (!author) return notFound('Автор не найден')

    const body = (await request.json()) as Record<string, unknown>
    const phone = normalizePhone(body.phone)
    if (!phone) {
      return fail(422, [{ field: 'phone', message: 'Телефон в формате +7 (999) 999-99-99' }])
    }

    const exists = db.subscriptions.some(
      (item) => item.author_id === author.id && item.phone === phone,
    )
    if (exists) {
      return fail(409, [{ message: 'Этот номер уже подписан на автора' }])
    }

    const subscription = {
      id: nextId(db.subscriptions),
      author_id: author.id,
      phone,
      created_at: new Date().toISOString(),
    }
    db.subscriptions.push(subscription)

    return ok(subscription, 201)
  }),
]

function findBook(id: string | readonly string[] | undefined): BookRecord | undefined {
  return db.books.find((book) => book.id === Number(id))
}

function applyFields(book: BookRecord, fields: BookFields, coverUrl?: string): void {
  if (fields.title !== undefined) book.title = fields.title.trim()
  if (fields.year !== undefined) book.year = fields.year
  if (fields.description !== undefined) book.description = fields.description.trim()
  if (fields.isbn !== undefined) book.isbn = fields.isbn.trim()
  if (fields.author_ids !== undefined) book.author_ids = fields.author_ids
  if (coverUrl) book.cover_url = coverUrl
}
