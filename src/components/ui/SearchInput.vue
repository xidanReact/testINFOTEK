<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import BaseInput from './BaseInput.vue'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    label?: string
    placeholder?: string
    debounce?: number
  }>(),
  { debounce: 400 },
)

const text = ref(model.value)
let timer: ReturnType<typeof setTimeout> | undefined

watch(text, (value) => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    model.value = value.trim()
  }, props.debounce)
})

watch(model, (value) => {
  if (value === text.value.trim()) return
  clearTimeout(timer)
  text.value = value
})

onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <BaseInput v-model="text" :label="label" :placeholder="placeholder" type="search" />
</template>
