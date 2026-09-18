
export interface BookPayload {
  title: string
  year: number
  description?: string
  isbn?: string
  authorIds?: number[]
}

export interface BookJsonBody {
  title: string
  year: number
  author_ids: number[]
  description?: string
  isbn?: string
}

export interface BookRequest {
  method: 'post' | 'put' | 'patch'
  url: string
  data: FormData | BookJsonBody
}

function toFormData(payload: BookPayload, cover?: File | null): FormData {
  const form = new FormData()
  form.append('title', payload.title)
  form.append('year', String(payload.year))
  if (payload.description) form.append('description', payload.description)
  if (payload.isbn) form.append('isbn', payload.isbn)
  for (const id of payload.authorIds ?? []) form.append('author_ids[]', String(id))
  if (cover) form.append('cover', cover)
  return form
}

function toJson(payload: BookPayload): BookJsonBody {
  const body: BookJsonBody = {
    title: payload.title,
    year: payload.year,
    author_ids: payload.authorIds ?? [],
  }
  if (payload.description) body.description = payload.description
  if (payload.isbn) body.isbn = payload.isbn
  return body
}

export function buildCreateRequest(payload: BookPayload, cover: File): BookRequest {
  return { method: 'post', url: '/books', data: toFormData(payload, cover) }
}

export function buildUpdateRequest(
  id: number,
  payload: BookPayload,
  cover?: File | null,
): BookRequest {
  if (cover) {
    return { method: 'put', url: `/books/${id}`, data: toFormData(payload, cover) }
  }
  return { method: 'patch', url: `/books/${id}`, data: toJson(payload) }
}
