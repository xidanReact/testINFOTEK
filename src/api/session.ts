export const SESSION_KEYS = {
  token: 'auth.token',
  user: 'auth.user',
  expiresAt: 'auth.expiresAt',
} as const

export function readToken(): string | null {
  return localStorage.getItem(SESSION_KEYS.token)
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEYS.token)
  localStorage.removeItem(SESSION_KEYS.user)
  localStorage.removeItem(SESSION_KEYS.expiresAt)
}
