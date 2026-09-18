<script setup lang="ts">
import { computed, useId } from 'vue'

export interface SelectOption {
  value: string | number
  label: string
}

const model = defineModel<string | number | null>({ default: null })

const props = defineProps<{
  options: SelectOption[]
  label?: string
  error?: string
  hint?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}>()

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

    <select
      :id="id"
      v-model="model"
      class="form-select"
      :class="{ 'is-invalid': error }"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
    >
      <option v-if="placeholder" :value="null">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>

    <div v-if="error" :id="errorId" class="invalid-feedback">{{ error }}</div>
    <div v-else-if="hint" :id="hintId" class="form-text">{{ hint }}</div>
  </div>
</template>
