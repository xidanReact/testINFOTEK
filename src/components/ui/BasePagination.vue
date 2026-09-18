<script setup lang="ts">
import { computed } from 'vue'

type Slot = number | 'gap'

const props = defineProps<{
  page: number
  totalPages: number
}>()

const emit = defineEmits<{ 'update:page': [page: number] }>()

const slots = computed<Slot[]>(() => {
  const { page, totalPages } = props
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const first = Math.max(2, page - 1)
  const last = Math.min(totalPages - 1, page + 1)
  const result: Slot[] = [1]

  if (first > 2) result.push('gap')
  for (let current = first; current <= last; current += 1) result.push(current)
  if (last < totalPages - 1) result.push('gap')
  result.push(totalPages)

  return result
})

function go(page: number) {
  if (page < 1 || page > props.totalPages || page === props.page) return
  emit('update:page', page)
}
</script>

<template>
  <nav v-if="totalPages > 1" aria-label="Страницы каталога">
    <ul class="pagination mb-0">
      <li class="page-item" :class="{ disabled: page <= 1 }">
        <button class="page-link" type="button" :disabled="page <= 1" @click="go(page - 1)">
          <span aria-hidden="true">&laquo;</span>
          <span class="visually-hidden">Предыдущая страница</span>
        </button>
      </li>

      <li
        v-for="(slot, index) in slots"
        :key="slot === 'gap' ? `gap-${index}` : slot"
        class="page-item"
        :class="{ active: slot === page, disabled: slot === 'gap' }"
      >
        <span v-if="slot === 'gap'" class="page-link">…</span>
        <button
          v-else
          class="page-link"
          type="button"
          :aria-current="slot === page ? 'page' : undefined"
          @click="go(slot)"
        >
          {{ slot }}
        </button>
      </li>

      <li class="page-item" :class="{ disabled: page >= totalPages }">
        <button
          class="page-link"
          type="button"
          :disabled="page >= totalPages"
          @click="go(page + 1)"
        >
          <span aria-hidden="true">&raquo;</span>
          <span class="visually-hidden">Следующая страница</span>
        </button>
      </li>
    </ul>
  </nav>
</template>
