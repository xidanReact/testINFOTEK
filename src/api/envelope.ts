import type { ApiEnvelope, ErrorItem, MappedErrors } from '@/types/api'

export function unwrap<T>(body: unknown): T | null {
  if (!body) return null
  if (typeof body === 'object' && 'data' in body) {
    return (body as ApiEnvelope<T>).data ?? null
  }
  return body as T
}

export function mapErrors(errors: ErrorItem[] = []): MappedErrors {
  const byField: Record<string, string> = {}
  const common: string[] = []

  for (const error of errors) {
    if (!error?.message) continue
    if (error.field) {
      if (!(error.field in byField)) byField[error.field] = error.message
    } else {
      common.push(error.message)
    }
  }

  return { byField, common }
}
