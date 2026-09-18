import { http } from './http'

export const subscriptionsApi = {
  subscribe: (authorId: number, phone: string) =>
    http.post<null>(`/authors/${authorId}/subscriptions`, { phone }),
}
