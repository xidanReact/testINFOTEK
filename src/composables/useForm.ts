import { reactive, ref, watch } from 'vue'
import { ApiError } from '@/api/ApiError'

export type FormErrors = Record<string, string>

export interface FormOptions {
  aliases?: FormErrors
}

export function useForm<T extends Record<string, unknown>>(initial: T, options: FormOptions = {}) {
  const values = reactive({ ...initial }) as T
  const errors = ref<FormErrors>({})
  const commonErrors = ref<string[]>([])
  const submitting = ref(false)

  for (const key of Object.keys(initial)) {
    watch(
      () => values[key],
      () => clearError(key),
    )
  }

  async function submit<R>(action: () => Promise<R>): Promise<R | null> {
    if (submitting.value) return null

    submitting.value = true
    errors.value = {}
    commonErrors.value = []

    try {
      return await action()
    } catch (failure) {
      applyFailure(failure)
      return null
    } finally {
      submitting.value = false
    }
  }

  function applyFailure(failure: unknown): void {
    if (!(failure instanceof ApiError)) {
      commonErrors.value = ['Не удалось сохранить, попробуйте ещё раз']
      return
    }

    if (failure.isValidation) errors.value = rename(failure.fieldErrors, options.aliases ?? {})

    if (Object.keys(errors.value).length) return

    commonErrors.value = failure.commonErrors.length ? failure.commonErrors : [failure.message]
  }

  function setErrors(next: FormErrors): void {
    errors.value = next
  }

  function clearError(field: string): void {
    if (!(field in errors.value)) return

    const next = { ...errors.value }
    delete next[field]
    errors.value = next
  }

  return { values, errors, commonErrors, submitting, submit, setErrors, clearError }
}

function rename(fieldErrors: FormErrors, aliases: FormErrors): FormErrors {
  const result: FormErrors = {}
  for (const [field, message] of Object.entries(fieldErrors)) {
    result[aliases[field] ?? field] = message
  }
  return result
}
