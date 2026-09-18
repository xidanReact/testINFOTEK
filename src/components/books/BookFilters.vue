<script setup lang="ts">
import { computed } from 'vue'
import AuthorSelect from '@/components/ui/AuthorSelect.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import { yearOptions } from '@/utils/years'

const search = defineModel<string>('search', { default: '' })
const authorId = defineModel<string>('authorId', { default: '' })
const year = defineModel<string>('year', { default: '' })

const emit = defineEmits<{ reset: [] }>()

const author = computed<number | number[] | null>({
  get: () => (authorId.value ? Number(authorId.value) : null),
  set: (value) => {
    authorId.value = typeof value === 'number' ? String(value) : ''
  },
})

const selectedYear = computed<string | number | null>({
  get: () => year.value || null,
  set: (value) => {
    year.value = value === null ? '' : String(value)
  },
})

const years = yearOptions()

const hasFilters = computed(() => Boolean(search.value || authorId.value || year.value))
</script>

<template>
  <form class="row g-3 align-items-end mb-4" role="search" @submit.prevent>
    <div class="col-12 col-md-5">
      <SearchInput v-model="search" label="Название" placeholder="Например, Пикник" />
    </div>

    <div class="col-12 col-md-4">
      <AuthorSelect v-model="author" label="Автор" placeholder="Начните вводить фамилию" />
    </div>

    <div class="col-8 col-md-2">
      <BaseSelect v-model="selectedYear" label="Год" :options="years" placeholder="Любой" />
    </div>

    <div v-if="hasFilters" class="col-4 col-md-1">
      <button class="btn btn-outline-secondary w-100" type="button" @click="emit('reset')">
        Сбросить
      </button>
    </div>
  </form>
</template>
