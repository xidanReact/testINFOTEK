<script setup lang="ts">
import BaseModal from './BaseModal.vue'

const open = defineModel<boolean>({ default: false })

withDefaults(
  defineProps<{
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
  }>(),
  {
    title: 'Подтвердите действие',
    confirmText: 'Удалить',
    cancelText: 'Отмена',
  },
)

const emit = defineEmits<{ confirm: []; cancel: [] }>()

function cancel() {
  open.value = false
  emit('cancel')
}
</script>

<template>
  <BaseModal v-model="open" :title="title" size="sm" @close="emit('cancel')">
    <slot>
      <p class="mb-0">{{ message }}</p>
    </slot>

    <template #footer>
      <button type="button" class="btn btn-outline-secondary" :disabled="loading" @click="cancel">
        {{ cancelText }}
      </button>
      <button type="button" class="btn btn-danger" :disabled="loading" @click="emit('confirm')">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        {{ confirmText }}
      </button>
    </template>
  </BaseModal>
</template>
