<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '@/composables/useForm'
import type { FormErrors } from '@/composables/useForm'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import type { Author } from '@/types/api'

const props = defineProps<{
  save: (fullName: string) => Promise<unknown>
  initial?: Author | null
}>()

const form = useForm(
  { fullName: props.initial?.full_name ?? '' },
  { aliases: { full_name: 'fullName' } },
)

const { values, errors, commonErrors, submitting } = form

const editing = computed(() => Boolean(props.initial))

async function onSubmit(): Promise<void> {
  const invalid = validate()
  if (Object.keys(invalid).length) {
    form.setErrors(invalid)
    return
  }

  await form.submit(() => props.save(values.fullName.trim()))
}

function validate(): FormErrors {
  return values.fullName.trim() ? {} : { fullName: 'Укажите ФИО автора' }
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <BaseAlert v-for="message in commonErrors" :key="message" class="mb-3">
      {{ message }}
    </BaseAlert>

    <BaseInput
      v-model="values.fullName"
      class="mb-4"
      label="ФИО"
      placeholder="Фамилия Имя Отчество"
      hint="Как на обложке: сначала фамилия"
      :error="errors.fullName"
      required
    />

    <div class="d-flex flex-wrap gap-2">
      <button class="btn btn-primary" type="submit" :disabled="submitting">
        <span v-if="submitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        {{ editing ? 'Сохранить' : 'Добавить автора' }}
      </button>

      <slot name="cancel" />
    </div>
  </form>
</template>
