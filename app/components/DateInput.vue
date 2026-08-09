<template>
  <input
    ref="inputRef"
    type="text"
    inputmode="numeric"
    autocomplete="off"
    :value="text"
    :required="required"
    :aria-invalid="invalid || undefined"
    class="input-field"
    :class="invalid ? 'border-red-500 focus:border-red-500' : ''"
    placeholder="dd/mm/yyyy"
    maxlength="10"
    @input="onInput"
    @keydown="onKeydown"
    @blur="onBlur"
  />
</template>

<script setup lang="ts">
/**
 * Ô nhập ngày: chạm vào là gõ số được ngay.
 *
 * Bản cũ đổi qua lại giữa type="text" và type="date" rồi gọi showPicker(): trên
 * điện thoại khách bị bật lịch cuộn, muốn gõ số phải chạm trúng từng ô ngày /
 * tháng / năm của trình duyệt — nhiều khách bấm mãi không nhập được. Ngày sinh
 * thì lịch càng vô dụng vì phải cuộn ngược mấy chục năm.
 *
 * Giờ chỉ là ô text với inputmode="numeric" (điện thoại bật sẵn bàn phím số),
 * gõ 8 chữ số là tự chèn dấu "/" thành dd/mm/yyyy. Ra ngoài vẫn là chuỗi ISO
 * yyyy-mm-dd như cũ nên chỗ nào đang dùng cũng không phải sửa.
 */
const props = defineProps<{
  modelValue: string | number
  /** yyyy-mm-dd */
  min?: string
  /** yyyy-mm-dd */
  max?: string
  required?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [string] }>()

const inputRef = ref<HTMLInputElement | null>(null)

/** Những gì khách đang thấy trong ô, dạng dd/mm/yyyy dở dang cũng được. */
const text = ref('')
const invalid = ref(false)

const isoToText = (iso: string): string => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : ''
}

/** Chèn dấu "/" theo số chữ số đã gõ, không ép khách tự gõ dấu. */
const formatDigits = (digits: string): string => {
  const d = digits.slice(0, 8)
  if (d.length <= 2) return d
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`
}

/**
 * Ngày có thật hay không. Dựng Date rồi so lại từng phần: chặn được 31/02 —
 * kiểu ngày mà JavaScript lặng lẽ đẩy thành 03/03.
 */
const toIso = (digits: string): string => {
  if (digits.length !== 8) return ''
  const dd = Number(digits.slice(0, 2))
  const mm = Number(digits.slice(2, 4))
  const yyyy = Number(digits.slice(4, 8))
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900) return ''

  const date = new Date(Date.UTC(yyyy, mm - 1, dd))
  if (date.getUTCFullYear() !== yyyy || date.getUTCMonth() !== mm - 1 || date.getUTCDate() !== dd) return ''

  const iso = `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
  if (props.min && iso < props.min) return ''
  if (props.max && iso > props.max) return ''
  return iso
}

const onInput = (event: Event) => {
  const el = event.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 8)

  text.value = formatDigits(digits)
  // Ô là :value nên Vue chỉ vẽ lại khi giá trị đổi; gán tay để ký tự lạ (chữ,
  // dấu cách) biến mất ngay chứ không đứng lại trong ô một nhịp.
  el.value = text.value

  const iso = toIso(digits)
  invalid.value = digits.length === 8 && !iso
  emit('update:modelValue', iso)
}

/**
 * Xoá lùi khi con trỏ đứng ngay sau dấu "/" thì xoá luôn cả chữ số trước đó —
 * nếu không, khách bấm xoá một cái thấy ô không đổi gì (dấu "/" bị đặt lại
 * ngay lập tức) và tưởng bàn phím hỏng.
 */
const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'Backspace') return
  const el = event.target as HTMLInputElement
  const pos = el.selectionStart ?? 0
  if (pos !== el.selectionEnd || pos < 1) return
  if (el.value[pos - 1] !== '/') return

  event.preventDefault()
  const digits = (el.value.slice(0, pos - 2) + el.value.slice(pos)).replace(/\D/g, '')
  text.value = formatDigits(digits)
  el.value = text.value
  emit('update:modelValue', toIso(digits))
}

const onBlur = () => {
  const digits = text.value.replace(/\D/g, '')
  invalid.value = digits.length > 0 && !toIso(digits)
}

// Giá trị đổi từ bên ngoài (nạp lại từ store, đổi ngôn ngữ, reset form) thì vẽ
// lại ô — nhưng bỏ qua lúc khách đang gõ dở, không thì con trỏ bị nhảy.
watch(
  () => props.modelValue,
  (value) => {
    const iso = String(value ?? '')
    if (iso === toIso(text.value.replace(/\D/g, ''))) return
    text.value = isoToText(iso)
    invalid.value = false
  },
  { immediate: true }
)
</script>
