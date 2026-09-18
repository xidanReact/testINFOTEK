import { readonly, ref } from 'vue'

export type ToastVariant = 'success' | 'danger' | 'info'

export interface Toast {
  id: number
  text: string
  variant: ToastVariant
}

const TIMEOUT = 4000

const items = ref<Toast[]>([])
let lastId = 0

function push(text: string, variant: ToastVariant): number {
  const id = ++lastId
  items.value.push({ id, text, variant })
  setTimeout(() => dismiss(id), TIMEOUT)
  return id
}

function dismiss(id: number): void {
  items.value = items.value.filter((toast) => toast.id !== id)
}

export function useToast() {
  return {
    items: readonly(items),
    success: (text: string) => push(text, 'success'),
    error: (text: string) => push(text, 'danger'),
    info: (text: string) => push(text, 'info'),
    dismiss,
  }
}
