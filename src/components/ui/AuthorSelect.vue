<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { authorsApi } from '@/api/authors'
import type { AuthorShort } from '@/types/api'

const DEBOUNCE = 400

const model = defineModel<number | number[] | null>({ default: null })

const props = withDefaults(
  defineProps<{
    label?: string
    error?: string
    hint?: string
    placeholder?: string
    multiple?: boolean
    required?: boolean
    options?: AuthorShort[]
  }>(),
  { placeholder: 'Начните вводить фамилию', options: () => [] },
)

const id = useId()
const listId = `${id}-list`
const query = ref('')
const results = ref<AuthorShort[]>([])
const loading = ref(false)
const failed = ref(false)
const expanded = ref(false)
const activeIndex = ref(-1)
const names = ref(new Map<number, string>())

let timer: ReturnType<typeof setTimeout> | undefined

watch(
  () => props.options,
  (options) => options.forEach((author) => names.value.set(author.id, author.full_name)),
  { immediate: true },
)

watch(query, () => {
  clearTimeout(timer)
  timer = setTimeout(load, DEBOUNCE)
})

const selectedIds = computed<number[]>(() => {
  if (Array.isArray(model.value)) return model.value
  return typeof model.value === 'number' ? [model.value] : []
})

const available = computed(() => results.value.filter((a) => !selectedIds.value.includes(a.id)))

async function load() {
  loading.value = true
  failed.value = false

  try {
    const { items } = await authorsApi.list({ search: query.value.trim() || null, perPage: 20 })
    results.value = items
    items.forEach((author) => names.value.set(author.id, author.full_name))
  } catch {
    results.value = []
    failed.value = true
  } finally {
    loading.value = false
    activeIndex.value = -1
  }
}

function open() {
  expanded.value = true
  if (!results.value.length && !loading.value) load()
}

function select(author: AuthorShort) {
  names.value.set(author.id, author.full_name)

  if (props.multiple) {
    model.value = [...selectedIds.value, author.id]
    query.value = ''
  } else {
    model.value = author.id
    expanded.value = false
  }
}

function remove(authorId: number) {
  model.value = props.multiple ? selectedIds.value.filter((id) => id !== authorId) : null
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    expanded.value = false
    return
  }

  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    expanded.value = true
    const step = event.key === 'ArrowDown' ? 1 : -1
    const count = available.value.length
    if (count) activeIndex.value = (activeIndex.value + step + count) % count
    return
  }

  if (event.key === 'Enter') {
    const author = available.value[activeIndex.value]
    if (!author) return
    event.preventDefault()
    select(author)
  }
}
</script>

<template>
  <div>
    <label v-if="label" class="form-label" :for="id">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <div v-if="selectedIds.length" class="d-flex flex-wrap gap-2 mb-2">
      <span v-for="authorId in selectedIds" :key="authorId" class="badge text-bg-light border p-2">
        {{ names.get(authorId) ?? `Автор №${authorId}` }}
        <button
          type="button"
          class="btn-close btn-close-sm ms-2 align-middle"
          :aria-label="`Убрать ${names.get(authorId) ?? 'автора'}`"
          @click="remove(authorId)"
        />
      </span>
    </div>

    <div class="position-relative">
      <input
        :id="id"
        v-model="query"
        class="form-control"
        :class="{ 'is-invalid': error }"
        type="search"
        role="combobox"
        autocomplete="off"
        :placeholder="placeholder"
        :aria-expanded="expanded"
        :aria-controls="listId"
        @focus="open"
        @blur="expanded = false"
        @keydown="onKeydown"
      />

      <ul
        v-if="expanded"
        :id="listId"
        class="list-group position-absolute w-100 mt-1 shadow-sm author-select__list"
        role="listbox"
      >
        <li v-if="loading" class="list-group-item text-body-secondary">Ищем авторов…</li>
        <li v-else-if="failed" class="list-group-item text-danger">Не удалось загрузить авторов</li>
        <li v-else-if="!available.length" class="list-group-item text-body-secondary">
          Ничего не нашлось
        </li>
        <template v-else>
          <li
            v-for="(author, index) in available"
            :key="author.id"
            role="option"
            :aria-selected="index === activeIndex"
          >
            <button
              type="button"
              class="list-group-item list-group-item-action w-100 text-start"
              :class="{ active: index === activeIndex }"
              @mousedown.prevent="select(author)"
            >
              {{ author.full_name }}
            </button>
          </li>
        </template>
      </ul>
    </div>

    <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
    <div v-else-if="hint" class="form-text">{{ hint }}</div>
  </div>
</template>

<style scoped lang="scss">
.author-select__list {
  z-index: 1000;
  max-height: 16rem;
  overflow-y: auto;
}
</style>
