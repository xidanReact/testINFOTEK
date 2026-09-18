<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'

const open = defineModel<boolean>({ default: false })

defineProps<{
  title?: string
  size?: 'sm' | 'lg'
}>()

const emit = defineEmits<{ close: [] }>()

const content = ref<HTMLElement | null>(null)
const titleId = useId()
let opener: HTMLElement | null = null

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

watch(open, async (isOpen) => {
  if (isOpen) {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.classList.add('modal-open')
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    focusable()[0]?.focus()
    return
  }

  teardown()
  opener?.focus()
  opener = null
})

onBeforeUnmount(teardown)

function teardown() {
  document.body.classList.remove('modal-open')
  document.removeEventListener('keydown', onKeydown)
}

function focusable(): HTMLElement[] {
  return Array.from(content.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    close()
    return
  }

  if (event.key !== 'Tab') return

  const items = focusable()
  if (!items.length) return

  const first = items[0]
  const last = items.at(-1)
  if (!first || !last) return

  const active = document.activeElement

  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

function close() {
  open.value = false
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal d-block"
      tabindex="-1"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? titleId : undefined"
      @mousedown.self="close"
    >
      <div class="modal-dialog modal-dialog-centered" :class="size ? `modal-${size}` : ''">
        <div ref="content" class="modal-content">
          <div v-if="title" class="modal-header">
            <h2 :id="titleId" class="modal-title h5">{{ title }}</h2>
            <button type="button" class="btn-close" aria-label="Закрыть" @click="close" />
          </div>

          <div class="modal-body">
            <slot />
          </div>

          <div v-if="$slots.footer" class="modal-footer">
            <slot name="footer" :close="close" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="open" class="modal-backdrop show" />
  </Teleport>
</template>
