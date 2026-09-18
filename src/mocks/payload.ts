import { db } from './db'
import type { ErrorItem } from '@/types/api'


export interface BookFields {
  title?: string
  year?: number
  description?: string
  isbn?: string
  author_ids?: number[]
}

const MIN_YEAR = 1500
const MAX_YEAR = new Date().getFullYear() + 1

export async function readBookForm(request: Request): Promise<{
  fields: BookFields
  cover: File | null
}> {
  const form = await request.formData()
  const cover = form.get('cover')

  return {
    fields: {
      title: readString(form.get('title')),
      year: Number(form.get('year')),
      description: readString(form.get('description')),
      isbn: readString(form.get('isbn')),
      author_ids: form.getAll('author_ids[]').map(Number),
    },
    cover: cover instanceof File ? cover : null,
  }
}

export async function readBookJson(request: Request): Promise<BookFields> {
  const body = (await request.json()) as Record<string, unknown>
  const fields: BookFields = {}

  if (typeof body.title === 'string') fields.title = body.title
  if (body.year !== undefined) fields.year = Number(body.year)
  if (typeof body.description === 'string') fields.description = body.description
  if (typeof body.isbn === 'string') fields.isbn = body.isbn
  if (Array.isArray(body.author_ids)) fields.author_ids = body.author_ids.map(Number)

  return fields
}

export function validateBookFields(fields: BookFields, requireAll: boolean): ErrorItem[] {
  const errors: ErrorItem[] = []

  if (requireAll || fields.title !== undefined) {
    if (!fields.title?.trim()) errors.push({ field: 'title', message: 'Укажите название' })
  }

  if (requireAll || fields.year !== undefined) {
    const year = fields.year ?? Number.NaN
    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
      errors.push({ field: 'year', message: `Год должен быть между ${MIN_YEAR} и ${MAX_YEAR}` })
    }
  }

  if (requireAll || fields.author_ids !== undefined) {
    const ids = fields.author_ids ?? []
    if (!ids.length) {
      errors.push({ field: 'author_ids', message: 'Выберите хотя бы одного автора' })
    } else if (ids.some((id) => !db.authors.some((author) => author.id === id))) {
      errors.push({ field: 'author_ids', message: 'Такого автора нет в справочнике' })
    }
  }

  return errors
}

export function validateFullName(value: unknown): ErrorItem[] {
  if (typeof value !== 'string' || !value.trim()) {
    return [{ field: 'full_name', message: 'Укажите ФИО автора' }]
  }
  if (value.trim().length < 3) {
    return [{ field: 'full_name', message: 'ФИО не короче трёх символов' }]
  }
  return []
}

export function normalizePhone(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const digits = value.replace(/\D/g, '').replace(/^8/, '7')
  return /^7\d{10}$/.test(digits) ? `+${digits}` : null
}

export async function fileToDataUrl(file: File): Promise<string> {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const chunkSize = 0x8000
  let binary = ''

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + chunkSize))
  }

  return `data:${file.type};base64,${btoa(binary)}`
}

function readString(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value : ''
}
