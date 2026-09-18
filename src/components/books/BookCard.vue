<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Book } from '@/types/api'

const props = defineProps<{ book: Book }>()

const to = computed(() => ({ name: 'book', params: { id: props.book.id } }))
</script>

<template>
  <article class="card h-100 shadow-sm">
    <img
      v-if="book.cover_url"
      class="cover-thumb card-img-top"
      :src="book.cover_url"
      alt=""
      loading="lazy"
    />
    <div v-else class="cover-thumb card-img-top cover-thumb--empty">Нет обложки</div>

    <div class="card-body d-flex flex-column">
      <h2 class="h6 card-title mb-1">
        <RouterLink class="stretched-link book-card__title" :to="to">{{ book.title }}</RouterLink>
      </h2>

      <p class="text-body-secondary small mb-2">{{ book.year }}</p>

      <p v-if="book.authors.length" class="small mb-0 mt-auto">
        <template v-for="(author, index) in book.authors" :key="author.id">
          <RouterLink
            class="link-primary book-card__author"
            :to="{ name: 'author', params: { id: author.id } }"
          >
            {{ author.full_name }}
          </RouterLink>
          <span v-if="index < book.authors.length - 1" class="text-body-secondary">, </span>
        </template>
      </p>
    </div>
  </article>
</template>

<style scoped lang="scss">
.book-card__title:hover {
  color: var(--bs-primary);
}

.book-card__author {
  position: relative;
  z-index: 2;
}
</style>
