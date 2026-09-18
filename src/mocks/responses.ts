import { HttpResponse, delay } from 'msw'
import type { ErrorItem } from '@/types/api'

export const TOKEN = 'mock-jwt-token'

export const CREDENTIALS = { username: 'user', password: 'password' }

export const ok = <T>(data: T, status = 200) =>
  HttpResponse.json({ success: true, data }, { status })

export const fail = (status: number, errors: ErrorItem[]) =>
  HttpResponse.json({ success: false, errors }, { status })

export const noContent = () => new HttpResponse(null, { status: 204 })

export const notFound = (message: string) => fail(404, [{ message }])

export const lag = () => delay(300 + Math.random() * 300)

export function requireAuth(request: Request) {
  if (request.headers.get('Authorization') !== `Bearer ${TOKEN}`) {
    return fail(401, [{ message: 'Требуется авторизация' }])
  }
  return null
}
