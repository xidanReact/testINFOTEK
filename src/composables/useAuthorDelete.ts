import { computed, ref } from 'vue'
import { authorsApi } from '@/api/authors'
import { ApiError } from '@/api/ApiError'
import { useToast } from './useToast'
import type { AuthorShort } from '@/types/api'

export function useAuthorDelete(onRemoved: (author: AuthorShort) => void | Promise<void>) {
  const toast = useToast()

  const target = ref<AuthorShort | null>(null)
  const removing = ref(false)

  const open = computed({
    get: () => Boolean(target.value),
    set: (value: boolean) => {
      if (!value) target.value = null
    },
  })

  function ask(author: AuthorShort): void {
    target.value = author
  }

  async function confirm(): Promise<void> {
    const author = target.value
    if (!author) return

    removing.value = true

    try {
      await authorsApi.remove(author.id)
      target.value = null
      toast.success('Автор удалён')
      await onRemoved(author)
    } catch (failure) {
      toast.error(failure instanceof ApiError ? failure.message : 'Не удалось удалить автора')
    } finally {
      removing.value = false
    }
  }

  return { target, open, removing, ask, confirm }
}
