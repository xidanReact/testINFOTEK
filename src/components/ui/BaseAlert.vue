<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'danger' | 'warning' | 'success' | 'info'
    title?: string
    dismissible?: boolean
  }>(),
  { variant: 'danger' },
)

const emit = defineEmits<{ dismiss: [] }>()
</script>

<template>
  <div
    class="alert d-flex flex-wrap gap-3 align-items-center"
    :class="`alert-${variant}`"
    role="alert"
  >
    <div class="flex-grow-1">
      <p v-if="title" class="fw-semibold mb-1">{{ title }}</p>
      <slot />
    </div>

    <slot name="action" />

    <button
      v-if="dismissible"
      type="button"
      class="btn-close ms-auto"
      aria-label="Закрыть"
      @click="emit('dismiss')"
    />
  </div>
</template>
