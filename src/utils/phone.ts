const digits = (value: string | null | undefined): string => String(value ?? '').replace(/\D/g, '')

// Маска в поле — не проверка: номер можно вставить из буфера мимо неё. Поэтому
// валидация живёт отдельно и работает по цифрам, а не по виду строки.
// Российский номер: 11 цифр, начинается с 7 или 8.
export function isValidPhone(value: string): boolean {
  return /^[78]\d{10}$/.test(digits(value))
}

// Отправитель SMS ждёт E.164 — шлём с плюсом и всегда с семёркой.
export function toE164(value: string): string {
  return `+7${digits(value).slice(1)}`
}
