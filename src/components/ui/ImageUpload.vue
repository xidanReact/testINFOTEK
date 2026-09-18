<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'

const MAX_SIZE = 5 * 1024 * 1024

const model = defineModel<File | null>({ default: null })

const props = withDefaults(
  defineProps<{
    label?: string
    error?: string
    initialUrl?: string
    required?: boolean
  }>(),
  { label: 'Обложка' },
)

const id = useId()
const input = ref<HTMLInputElement | null>(null)
const dragging = ref(false)
const localError = ref('')
const objectUrl = ref('')

const preview = computed(() => objectUrl.value || props.initialUrl || '')
const message = computed(() => localError.value || props.error || '')

watch(model, (file) => {
  releasePreview()
  if (file) objectUrl.value = URL.createObjectURL(file)
})

onBeforeUnmount(releasePreview)

function releasePreview() {
  if (!objectUrl.value) return
  URL.revokeObjectURL(objectUrl.value)
  objectUrl.value = ''
}

function accept(file: File | undefined) {
  if (!file) return

  if (!file.type.startsWith('image/')) {
    localError.value = 'Нужен файл изображения: JPEG, PNG или WebP'
    return
  }

  if (file.size > MAX_SIZE) {
    localError.value = 'Файл больше 5 МБ — выберите изображение полегче'
    return
  }

  localError.value = ''
  model.value = file
}

function onChange(event: Event) {
  accept((event.target as HTMLInputElement).files?.[0])
}

function onDrop(event: DragEvent) {
  dragging.value = false
  accept(event.dataTransfer?.files?.[0])
}

function clear() {
  model.value = null
  localError.value = ''
  if (input.value) input.value.value = ''
}
</script>

<template>
  <div>
    <span class="form-label d-block">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </span>

    <div
      class="image-upload border rounded p-3 d-flex flex-wrap align-items-center gap-3"
      :class="{ 'image-upload--dragging': dragging, 'border-danger': message }"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="onDrop"
    >
      <img v-if="preview" :src="preview" alt="" class="image-upload__preview rounded" />

      <div class="flex-grow-1">
        <p class="mb-2">Перетащите обложку сюда или выберите файл.</p>
        <p class="text-body-secondary small mb-3">JPEG, PNG или WebP, не больше 5 МБ.</p>

        <div class="d-flex gap-2">
          <label class="btn btn-outline-primary mb-0" :for="id">Выбрать файл</label>
          <button v-if="model" type="button" class="btn btn-link" @click="clear">Убрать</button>
        </div>

        <input
          :id="id"
          ref="input"
          class="visually-hidden"
          type="file"
          accept="image/*"
          @change="onChange"
        />
      </div>
    </div>

    <div v-if="message" class="invalid-feedback d-block">{{ message }}</div>
  </div>
</template>

<style scoped lang="scss">
.image-upload {
  background-color: #fff;

  &--dragging {
    border-color: var(--bs-primary);
    background-color: var(--bs-primary-bg-subtle);
  }

  &__preview {
    width: 6rem;
    height: 9rem;
    object-fit: cover;
  }
}
</style>
