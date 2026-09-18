<script setup lang="ts">
import { computed, useId } from 'vue'
import { vMaska } from 'maska/vue'

const MASK = '+7 (###) ###-##-##'

const model = defineModel<string>({ default: '' })

const props = defineProps<{
  label?: string
  error?: string
  hint?: string
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

    <input
      :id="id"
      v-model="model"
      v-maska="MASK"
      class="form-control"
      :class="{ 'is-invalid': error }"
      type="tel"
      inputmode="tel"
      autocomplete="tel"
      placeholder="+7 (999) 123-45-67"
      :required="required"
      :disabled="disabled"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="describedBy"
    />

    <div v-if="error" :id="errorId" class="invalid-feedback">{{ error }}</div>
    <div v-else-if="hint" :id="hintId" class="form-text">{{ hint }}</div>
  </div>
</template>
