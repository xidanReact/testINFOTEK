import axios from 'axios'
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { unwrap } from './envelope'
import { ApiError } from './ApiError'
import { clearSession, readToken } from './session'
import type { ApiErrorEnvelope } from '@/types/api'

export interface HttpClient {
  <T = unknown>(config: AxiosRequestConfig): Promise<T>
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T = null>(url: string, config?: AxiosRequestConfig): Promise<T>
}

const instance = axios.create({
  baseURL: '/api/v1', // book.yaml:10
  headers: { Accept: 'application/json' },
})

instance.interceptors.request.use((config) => {
  const token = readToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

instance.interceptors.response.use(
  (response) => unwrap(response.data) as unknown as AxiosResponse,
  (error: AxiosError<ApiErrorEnvelope>) => {
    const status = error.response?.status
    const body = error.response?.data

    if (status === 401) {
      clearSession()
      window.dispatchEvent(new CustomEvent('auth:expired'))
    }

    return Promise.reject(
      new ApiError({
        status,
        message: statusMessage(status),
        errors: body?.errors ?? [],
      }),
    )
  },
)

function statusMessage(status?: number): string {
  switch (status) {
    case 401:
      return 'Сессия истекла, войдите заново'
    case 403:
      return 'Недостаточно прав для этого действия'
    case 404:
      return 'Не найдено'
    case 409:
      return 'Конфликт данных'
    case 422:
      return 'Проверьте правильность заполнения полей'
    case undefined:
      return 'Сервис недоступен, проверьте соединение'
    default:
      return 'Что-то пошло не так, попробуйте позже'
  }
}

export const http = instance as unknown as HttpClient
