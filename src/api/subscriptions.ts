import { http } from './http'
import type { Subscription } from '@/types/api'

export const subscriptionsApi = {
  // Телефон уходит в E.164 — приводит его src/utils/phone.ts.
  subscribe: (authorId: number, phone: string) =>
    http.post<Subscription>(`/authors/${authorId}/subscriptions`, { phone }),
}
