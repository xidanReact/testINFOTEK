<script setup lang="ts">
import { computed, useId } from 'vue'

const model = defineModel<string>({ default: '' })

const props = withDefaults(
  defineProps<{
    label?: string
    error?: string
    hint?: string
    placeholder?: string
    rows?: number
    required?: boolean
    disabled?: boolean
  }>(),
  { rows: 4 },
)

const id = useId()
const errorId = `${id}-error`
const hintId = `${id}-hint`

const describedBy = computed(() => {
  if (props.error) return errorId
  return props.hint ? hintId : undefined
})
</script>

<template>
  <div>
    <label v-if="label" class="form-label" :for="id">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <textarea
      :id="id"
      v-model="model"
      class="form-control"
      :class="{ 'is-invalid': error }"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
    />

    <div v-if="error" :id="errorId" class="invalid-feedback">{{ error }}</div>
    <div v-else-if="hint" :id="hintId" class="form-text">{{ hint }}</div>
  </div>
</template>
