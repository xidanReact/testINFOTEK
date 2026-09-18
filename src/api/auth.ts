import { http } from './http'
import type { LoginData } from '@/types/api'

export const authApi = {
  login: (username: string, password: string) =>
    http.post<LoginData>('/auth/login', { username, password }),
}
