import { db } from './db'
import type { BookRecord } from './fixtures'
import { useToast } from '@/composables/useToast'

const ENDPOINT = 'https://smspilot.ru/api.php'
const EMULATOR_KEY = 'XXXXXXXXXXXXYYYYYYYYYYYYZZZZZZZZXXXXXXXXXXXXYYYYYYYYYYYYZZZZZZZZ'

const LIMIT = 70

interface SendResult {
  phone: string
  status: string
  error_ru?: string
}

interface SmsPilotResponse {
  send?: SendResult[]
  error?: { code: number; description?: string; description_ru?: string }
}

export async function notifySubscribers(book: BookRecord): Promise<void> {
  const phones = subscriberPhones(book)
  if (!phones.length) return

  const key = import.meta.env.VITE_SMSPILOT_KEY ?? EMULATOR_KEY
  if (!key) return

  const toast = useToast()

  try {
    const answer = await send(key, phones, message(book))

    if (answer.error) {
      const reason = answer.error.description_ru ?? answer.error.description ?? 'ошибка smspilot'
      toast.error(`SMS не отправлены: ${reason}`)
      return
    }

    report(answer.send ?? [])
  } catch {
    toast.error('SMS не отправлены: smspilot недоступен')
  }
}

function report(results: SendResult[]): void {
  const toast = useToast()
  const accepted = results.filter((item) => Number(item.status) >= 0)
  const rejected = results.length - accepted.length

  if (!accepted.length) {
    const reason = results[0]?.error_ru ?? 'номера не приняты оператором'
    toast.error(`SMS не отправлены: ${reason}`)
    return
  }

  const tail = rejected ? `, не приняты: ${rejected}` : ''
  toast.info(`Подписчикам отправлено SMS: ${accepted.length}${tail}`)
}

async function send(key: string, phones: string[], text: string): Promise<SmsPilotResponse> {
  const query = new URLSearchParams({
    apikey: key,
    to: phones.join(','),
    send: text,
    format: 'json',
  })

  const response = await fetch(`${ENDPOINT}?${query}`)
  return (await response.json()) as SmsPilotResponse
}

function subscriberPhones(book: BookRecord): string[] {
  const phones = db.subscriptions
    .filter((item) => book.author_ids.includes(item.author_id))
    .map((item) => item.phone)

  // Один номер, подписанный на двух авторов книги, получает одно сообщение.
  return [...new Set(phones)]
}

function message(book: BookRecord): string {
  const prefix = `Новинка у ${authorName(book)}: `
  const room = LIMIT - prefix.length - 2

  return `${prefix}«${cut(book.title, Math.max(room, 12))}»`
}

function authorName(book: BookRecord): string {
  const names = book.author_ids
    .map((id) => db.authors.find((author) => author.id === id)?.full_name)
    .filter((name): name is string => Boolean(name))

  const [first, ...rest] = names
  if (!first) return 'автора из каталога'

  return rest.length ? `${first} и др.` : first
}

function cut(value: string, limit: number): string {
  return value.length <= limit ? value : `${value.slice(0, limit - 1).trimEnd()}…`
}
