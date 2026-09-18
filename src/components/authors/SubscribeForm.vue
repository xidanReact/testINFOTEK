<script setup lang="ts">
import { ref, watch } from 'vue'
import { subscriptionsApi } from '@/api/subscriptions'
import { ApiError } from '@/api/ApiError'
import { isValidPhone, toE164 } from '@/utils/phone'
import BaseAlert from '@/components/ui/BaseAlert.vue'
import PhoneInput from '@/components/ui/PhoneInput.vue'

// Форма видна всем: по заданию подписка — право гостя, и у пользователя
// его никто не отнимает.
const props = defineProps<{ authorId: number }>()

const phone = ref('')
const error = ref('')
const sending = ref(false)
// Повторная подписка — не ошибка ввода, поэтому у неё своя ветка и свой тон.
const result = ref<'done' | 'exists' | null>(null)

watch(phone, () => {
  error.value = ''
})

async function submit(): Promise<void> {
  if (!isValidPhone(phone.value)) {
    error.value = 'Нужен российский номер: 11 цифр, начиная с 7 или 8'
    return
  }

  sending.value = true
  error.value = ''
  result.value = null

  try {
    await subscriptionsApi.subscribe(props.authorId, toE164(phone.value))
    result.value = 'done'
    phone.value = ''
  } catch (failure) {
    apply(failure)
  } finally {
    sending.value = false
  }
}

function apply(failure: unknown): void {
  if (!(failure instanceof ApiError)) {
    error.value = 'Не удалось оформить подписку, попробуйте позже'
    return
  }

  if (failure.isConflict) {
    result.value = 'exists'
    return
  }

  if (failure.isValidation) {
    error.value = failure.fieldErrors.phone ?? failure.commonErrors[0] ?? failure.message
    return
  }

  error.value = failure.message
}
</script>

<template>
  <div>
    <BaseAlert v-if="result === 'done'" variant="success" class="mb-3">
      Подписка оформлена, пришлём SMS о новых книгах.
    </BaseAlert>

    <BaseAlert v-else-if="result === 'exists'" variant="info" class="mb-3">
      Этот номер уже подписан на автора.
    </BaseAlert>

    <form novalidate @submit.prevent="submit">
      <PhoneInput
        v-model="phone"
        class="mb-3"
        label="Телефон"
        hint="Только для уведомлений о новых книгах"
        :error="error"
        required
      />

      <button class="btn btn-primary w-100" type="submit" :disabled="sending">
        <span v-if="sending" class="spinner-border spinner-border-sm me-2" aria-hidden="true" />
        Подписаться на новые книги
      </button>
    </form>
  </div>
</template>
