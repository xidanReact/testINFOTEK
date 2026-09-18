<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: 'sm' | 'md'
    label?: string
    center?: boolean
  }>(),
  { size: 'md', label: 'Загрузка' },
)
</script>

<template>
  <div :class="center ? 'd-flex justify-content-center py-4' : 'd-inline-flex'">
    <div
      class="spinner-border text-primary"
      :class="{ 'spinner-border-sm': size === 'sm' }"
      role="status"
    >
      <span class="visually-hidden">{{ label }}</span>
    </div>
  </div>
</template>
