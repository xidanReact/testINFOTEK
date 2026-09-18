const digits = (value: string | null | undefined): string => String(value ?? '').replace(/\D/g, '')

export function isValidPhone(value: string): boolean {
  return /^[78]\d{10}$/.test(digits(value))
}

export function toE164(value: string): string {
  return `+7${digits(value).slice(1)}`
}
