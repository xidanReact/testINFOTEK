import { http } from './http'
import type { Subscription } from '@/types/api'

export const subscriptionsApi = {
  subscribe: (authorId: number, phone: string) =>
    http.post<Subscription>(`/authors/${authorId}/subscriptions`, { phone }),
}
