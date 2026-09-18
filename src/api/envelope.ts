import type { ApiEnvelope, ErrorItem, MappedErrors } from '@/types/api'

/**
 * Спека заворачивает все ответы в { success, data } либо { success, errors }
 * (book.yaml:509-557, 599-616). Разворачиваем ровно здесь, чтобы остальной код
 * про конверт не знал.
 */
export function unwrap<T>(body: unknown): T | null {
  if (!body) return null
  if (typeof body === 'object' && 'data' in body) {
    return (body as ApiEnvelope<T>).data ?? null
  }
  return body as T
}

/**
 * 422 приходит массивом { field, message } (book.yaml:610-616).
 * Раскладываем по полям — форма подставит сообщение под нужный инпут.
 * Ошибки без field показываются алертом над формой.
 */
export function mapErrors(errors: ErrorItem[] = []): MappedErrors {
  const byField: Record<string, string> = {}
  const common: string[] = []

  for (const error of errors) {
    if (!error?.message) continue
    if (error.field) {
      // если бэк прислал несколько ошибок на поле — показываем первую
      if (!(error.field in byField)) byField[error.field] = error.message
    } else {
      common.push(error.message)
    }
  }

  return { byField, common }
}
