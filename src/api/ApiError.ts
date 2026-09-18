import { mapErrors } from './envelope'
import type { ErrorItem } from '@/types/api'

export interface ApiErrorInit {
  status?: number
  message: string
  errors?: ErrorItem[]
}

export class ApiError extends Error {
  readonly status?: number
  readonly fieldErrors: Record<string, string>
  readonly commonErrors: string[]

  constructor({ status, message, errors = [] }: ApiErrorInit) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    const { byField, common } = mapErrors(errors)
    this.fieldErrors = byField
    this.commonErrors = common
  }

  get isValidation(): boolean {
    return this.status === 422
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  get isConflict(): boolean {
    return this.status === 409
  }
}
