<template>
  <div ref="rootRef" class="relative">
    <input
      ref="inputRef"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :value="text"
      :required="required"
      :aria-invalid="invalid || undefined"
      class="input-field pr-11"
      :class="invalid ? 'border-red-500 focus:border-red-500' : ''"
      placeholder="dd/mm/yyyy"
      maxlength="10"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
    />

    <button
      type="button"
      tabindex="-1"
      :aria-label="$t('booking.fields.openCalendar')"
      :aria-expanded="open"
      class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-400 transition-colors hover:text-[#194d9b]"
      :class="open ? 'text-[#194d9b]' : ''"
      @click="toggle"
    >
      <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path stroke-linecap="round" d="M8 3v4M16 3v4M3 10h18" />
      </svg>
    </button>

    <!--
      Lịch treo thẳng vào <body> bằng Teleport và định vị theo toạ độ thật của ô.
      Nếu để trong luồng, nó bị cắt cụt bởi khung cuộn của bước đặt bay
      (overflow-y-auto) — lịch mở ra chỉ thấy hai hàng đầu.
    -->
    <Teleport to="body">
      <div
        v-if="open"
        ref="panelRef"
        class="fixed z-[70] w-[286px] rounded-xl border border-gray-200 bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
        :style="{ top: `${panelTop}px`, left: `${panelLeft}px` }"
      >
        <!-- Chọn thẳng tháng và năm: ngày sinh mà bấm mũi tên lùi từng tháng
             thì tới năm 1990 phải bấm hơn 400 lần. -->
        <div class="mb-2 flex items-center gap-1.5">
          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            :aria-label="'<'"
            @click="shiftMonth(-1)"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <select
            v-model.number="viewMonth"
            class="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-1.5 py-1.5 text-[13px] font-semibold text-gray-800 outline-none focus:border-[#194d9b]"
          >
            <option v-for="(name, i) in monthNames" :key="i" :value="i">{{ name }}</option>
          </select>

          <select
            v-model.number="viewYear"
            class="w-[74px] shrink-0 rounded-lg border border-gray-200 bg-white px-1.5 py-1.5 text-[13px] font-semibold text-gray-800 outline-none focus:border-[#194d9b]"
          >
            <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
          </select>

          <button
            type="button"
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
            :aria-label="'>'"
            @click="shiftMonth(1)"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div class="mb-1 grid grid-cols-7 gap-0.5">
          <div
            v-for="(day, i) in weekdayNames"
            :key="i"
            class="py-1 text-center text-[11px] font-bold uppercase text-gray-400"
          >
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-0.5">
          <div v-for="n in leadingBlanks" :key="`b${n}`" />
          <button
            v-for="cell in dayCells"
            :key="cell.iso"
            type="button"
            :disabled="cell.disabled"
            class="h-9 rounded-lg text-[13px] font-semibold transition-colors"
            :class="cellClass(cell)"
            @click="pick(cell.iso)"
          >
            {{ cell.day }}
          </button>
        </div>

        <button
          type="button"
          class="mt-2 w-full rounded-lg bg-gray-50 py-2 text-[12px] font-bold text-[#194d9b] hover:bg-gray-100"
          @click="pickToday"
        >
          {{ $t('booking.fields.today') }}
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
/**
 * Ô nhập ngày: gõ số trực tiếp HOẶC chọn từ lịch xổ xuống.
 *
 * Bản đầu đổi qua lại type="text"/type="date" rồi gọi showPicker() nên cú bấm
 * nào cũng bật lịch, muốn gõ số phải chạm trúng từng ô ngày/tháng/năm của
 * trình duyệt. Bản sau bỏ hẳn lịch thì ngày gần lại gõ chậm hơn chọn.
 *
 * Nên giờ tự vẽ lịch thay vì mượn của trình duyệt: ô type="date" nguyên bản
 * không cho gõ tự do, và trên điện thoại nó bung bánh xe cuộn toàn màn hình
 * chứ không phải lịch xổ xuống. Tự vẽ thì máy tính và điện thoại giống nhau,
 * tháng/năm chọn thẳng bằng hộp xổ (ngày sinh mà bấm lùi từng tháng tới 1990
 * là hơn 400 lần bấm), và tên tháng theo đúng ngôn ngữ khách đang xem.
 *
 * Ra ngoài vẫn là chuỗi ISO yyyy-mm-dd như cũ.
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

const { locale } = useI18n()

const rootRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
const panelRef = ref<HTMLElement | null>(null)

/** Những gì khách đang thấy trong ô, dạng dd/mm/yyyy dở dang cũng được. */
const text = ref('')
const invalid = ref(false)

// ---------------------------------------------------------------- gõ tay ---

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

const pad = (n: number) => String(n).padStart(2, '0')

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

  const iso = `${yyyy}-${pad(mm)}-${pad(dd)}`
  if (props.min && iso < props.min) return ''
  if (props.max && iso > props.max) return ''
  return iso
}

const iso = computed(() => toIso(text.value.replace(/\D/g, '')))

const onInput = (event: Event) => {
  const el = event.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 8)

  text.value = formatDigits(digits)
  // Ô là :value nên Vue chỉ vẽ lại khi giá trị đổi; gán tay để ký tự lạ (chữ,
  // dấu cách) biến mất ngay chứ không đứng lại trong ô một nhịp.
  el.value = text.value

  const next = toIso(digits)
  invalid.value = digits.length === 8 && !next
  emit('update:modelValue', next)

  // Gõ đủ ngày thì lịch nhảy theo, mở ra là đúng tháng đang nhập.
  if (next) syncViewTo(next)
}

/**
 * Xoá lùi khi con trỏ đứng ngay sau dấu "/" thì xoá luôn cả chữ số trước đó —
 * nếu không, khách bấm xoá một cái thấy ô không đổi gì (dấu "/" bị đặt lại
 * ngay lập tức) và tưởng bàn phím hỏng.
 */
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && open.value) {
    open.value = false
    return
  }
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
    const next = String(value ?? '')
    if (next === iso.value) return
    text.value = isoToText(next)
    invalid.value = false
    if (next) syncViewTo(next)
  },
  { immediate: true }
)

// ------------------------------------------------------------------ lịch ---

const open = ref(false)
const panelTop = ref(0)
const panelLeft = ref(0)

const today = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const viewYear = ref(new Date().getFullYear())
const viewMonth = ref(new Date().getMonth())

const syncViewTo = (isoDate: string) => {
  const [y, m] = isoDate.split('-')
  if (!y || !m) return
  viewYear.value = Number(y)
  viewMonth.value = Number(m) - 1
}

/**
 * Khoảng năm cho hộp xổ, suy từ min/max của ô.
 * Ngày sinh (chỉ có max) lùi tới 1910; ngày bay (chỉ có min) tiến 2 năm.
 */
const yearOptions = computed<number[]>(() => {
  const nowYear = new Date().getFullYear()
  const from = props.min ? Number(props.min.slice(0, 4)) : 1910
  const to = props.max ? Number(props.max.slice(0, 4)) : nowYear + 2
  const years: number[] = []
  for (let y = to; y >= from; y--) years.push(y)
  return years
})

const intlLocale = computed(() => {
  const map: Record<string, string> = {
    vi: 'vi-VN', en: 'en-US', fr: 'fr-FR', ru: 'ru-RU', zh: 'zh-CN', hi: 'hi-IN'
  }
  return map[locale.value as string] || 'en-US'
})

const monthNames = computed(() => {
  const fmt = new Intl.DateTimeFormat(intlLocale.value, { month: 'short' })
  return Array.from({ length: 12 }, (_, i) => fmt.format(new Date(Date.UTC(2024, i, 1))))
})

/** Tuần bắt đầu từ thứ Hai — quy ước ở Việt Nam và châu Âu. */
const weekdayNames = computed(() => {
  const fmt = new Intl.DateTimeFormat(intlLocale.value, { weekday: 'narrow' })
  // 2024-01-01 là thứ Hai.
  return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(Date.UTC(2024, 0, 1 + i))))
})

const leadingBlanks = computed(() => {
  const firstDay = new Date(Date.UTC(viewYear.value, viewMonth.value, 1)).getUTCDay()
  // getUTCDay: 0 = Chủ nhật. Đổi sang lưới bắt đầu từ thứ Hai.
  return (firstDay + 6) % 7
})

interface DayCell {
  day: number
  iso: string
  disabled: boolean
}

const dayCells = computed<DayCell[]>(() => {
  const daysInMonth = new Date(Date.UTC(viewYear.value, viewMonth.value + 1, 0)).getUTCDate()
  return Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const value = `${viewYear.value}-${pad(viewMonth.value + 1)}-${pad(day)}`
    return {
      day,
      iso: value,
      disabled: Boolean((props.min && value < props.min) || (props.max && value > props.max))
    }
  })
})

const cellClass = (cell: DayCell): string => {
  if (cell.disabled) return 'text-gray-300 cursor-not-allowed'
  if (cell.iso === iso.value) return 'bg-[#194d9b] text-white'
  if (cell.iso === today()) return 'text-[#f02424] ring-1 ring-[#f02424]/40 hover:bg-gray-100'
  return 'text-gray-700 hover:bg-gray-100'
}

const shiftMonth = (delta: number) => {
  const next = new Date(Date.UTC(viewYear.value, viewMonth.value + delta, 1))
  viewYear.value = next.getUTCFullYear()
  viewMonth.value = next.getUTCMonth()
}

const pick = (value: string) => {
  text.value = isoToText(value)
  invalid.value = false
  emit('update:modelValue', value)
  open.value = false
  // Trả con trỏ về ô chữ để khách sửa tiếp được ngay.
  inputRef.value?.focus()
}

const pickToday = () => {
  const value = today()
  if ((props.min && value < props.min) || (props.max && value > props.max)) return
  pick(value)
}

/** Bám theo ô: lịch dùng position fixed nên phải tự tính toạ độ. */
const place = () => {
  const box = rootRef.value?.getBoundingClientRect()
  if (!box) return

  const PANEL_W = 286
  const PANEL_H = 330
  const GAP = 6

  const below = window.innerHeight - box.bottom
  panelTop.value = below < PANEL_H && box.top > PANEL_H ? box.top - PANEL_H - GAP : box.bottom + GAP

  // Ép nằm trong màn hình: trên điện thoại ô sát mép phải hay bị tràn.
  panelLeft.value = Math.max(8, Math.min(box.left, window.innerWidth - PANEL_W - 8))
}

const toggle = () => {
  open.value = !open.value
  if (!open.value) return
  if (iso.value) syncViewTo(iso.value)
  nextTick(place)
}

const onDocPointerDown = (event: PointerEvent) => {
  if (!open.value) return
  const target = event.target as Node
  if (rootRef.value?.contains(target) || panelRef.value?.contains(target)) return
  open.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown, true)
  window.addEventListener('resize', place)
  // capture: bắt cả cuộn bên trong khung cuộn của bước đặt bay, không chỉ cuộn trang.
  window.addEventListener('scroll', place, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown, true)
  window.removeEventListener('resize', place)
  window.removeEventListener('scroll', place, true)
})
</script>
