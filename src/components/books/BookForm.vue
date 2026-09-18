<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from '@/composables/useForm'
import type { FormErrors } from '@/composables/useForm'
import AuthorSelect from '@/components/ui/AuthorSelect.vue'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import ImageUpload from '@/components/ui/ImageUpload.vue'
import type { Book } from '@/types/api'
import type { BookPayload } from '@/api/bookRequest'

const MIN_YEAR = 1500
const MAX_YEAR = new Date().getFullYear() + 1

const props = defineProps<{
  // Запрос делает вью: она же решает, куда уйти после успеха. Форма только
  // ждёт результат, чтобы показать 422 под полями.
  save: (payload: BookPayload, cover: File | null) => Promise<unknown>
  initial?: Book | null
}>()

const form = useForm(
  {
    title: props.initial?.title ?? '',
    year: props.initial?.year ? String(props.initial.year) : '',
    isbn: props.initial?.isbn ?? '',
    description: props.initial?.description ?? '',
    authorIds: props.initial?.authors.map((author) => author.id) ?? [],
    cover: null as File | null,
  },
  { aliases: { author_ids: 'authorIds' } },
)

const { values, errors, commonErrors, submitting } = form

// Обложка обязательна только при создании (book.yaml:478-482). При
// редактировании нетронутый файл означает PATCH без обложки.
const editing = computed(() => Boolean(props.initial))

const authorIds = computed<number | number[] | null>({
  get: () => values.authorIds,
  set: (value) => {
    values.authorIds = Array.isArray(value) ? value : []
  },
})

async function onSubmit(): Promise<void> {
  const invalid = validate()
  if (Object.keys(invalid).length) {
    form.setErrors(invalid)
    return
  }

  await form.submit(() => props.save(payload(), values.cover))
}

// Проверяем только очевидное — пустое обязательное поле и год вне разумного
// диапазона. Остальное проверит сервер, его 422 покажем под полями.
function validate(): FormErrors {
  const invalid: FormErrors = {}

  if (!values.title.trim()) invalid.title = 'Укажите название'

  const year = Number(values.year)
  if (!values.year.trim()) {
    invalid.year = 'Укажите год'
  } else if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    invalid.year = `Год должен быть между ${MIN_YEAR} и ${MAX_YEAR}`
  }

  if (!values.authorIds.length) invalid.authorIds = 'Выберите хотя бы одного автора'
  if (!editing.value && !values.cover) invalid.cover = 'Загрузите обложку'

  return invalid
}

function payload(): BookPayload {
  return {
    title: values.title.trim(),
    year: Number(values.year),
    description: values.description.trim() || undefined,
    isbn: values.isbn.trim() || undefined,
    authorIds: [...values.authorIds],
  }
}
</script>

<template>
  <form novalidate @submit.prevent="onSubmit">
    <BaseAlert v-for="message in commonErrors" :key="message" class="mb-3">
      {{ message }}
    </BaseAlert>

    <div class="row g-3">
      <div class="col-12">
        <BaseInput v-model="values.title" label="Название" :error="errors.title" required />
      </div>

      <div class="col-6 col-sm-4">
        <BaseInput
          v-model="values.year"
          label="Год издания"
          type="number"
          :error="errors.year"
          required
        />
      </div>

      <div class="col-12 col-sm-8">
        <BaseInput
          v-model="values.isbn"
          label="ISBN"
          :error="errors.isbn"
          hint="Необязательно, как на обороте титула"
        />
      </div>

      <div class="col-12">
        <AuthorSelect
          v-model="authorIds"
          label="Авторы"
          :error="errors.authorIds"
          :options="initial?.authors"
          multiple
          required
        />
      </div>

      <div class="col-12">
        <BaseTextarea
          v-model="values.description"
          label="Описание"
          :error="errors.description"
          :rows="5"
        />
      </div>

      <div class="col-12">
        <ImageUpload
          v-model="values.cover"
          :error="errors.cover"
          :initial-url="initial?.cover_url"
          :required="!editing"
        />
        <p v-if="editing" class="form-text">
          Файл можно не менять — тогда обложка останется прежней.
        </p>
      </div>
    </div>

    <div class="d-flex flex-wrap gap-2 mt-4">
      <button class="btn btn-primary" type="submit" :disabled="submitting">
        <span v-if="submitting" class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        {{ editing ? 'Сохранить' : 'Добавить книгу' }}
      </button>

      <slot name="cancel" />
    </div>
  </form>
</template>
