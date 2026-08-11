<template>
  <!-- max-w-2xl: vé trước đây giãn theo cả bề ngang trang nên trên màn rộng
       nó phình quá khổ, tràn bố cục bước 5. Bó về khổ vé thật rồi căn giữa. -->
  <div class="mx-auto w-full max-w-2xl space-y-4">
    <!-- ============================================================
         VÉ BAY — kiểu thẻ lên máy bay, tông trời xanh chuyển nắng ấm.
           • Không dùng nền đen: khối giá nền kem ấm, đỡ tốn mực khi in.
           • Cuống vé xanh chứa đủ: tên vé, mã đặt chỗ (góc phải) và
             hàng ngày/giờ/số khách/điểm cất cánh — nhìn cuống là đủ bay.
         ============================================================ -->
    <div
      ref="ticketRef"
      data-ticket-root
      class="overflow-hidden rounded-2xl border border-sky-200 bg-white shadow-xl"
    >
      <!-- ---------- CUỐNG VÉ ----------
           pb-0: hàng thông tin bay nằm SÁT đáy cuống, chạm luôn đường răng
           cưa — nhìn như dải tóm tắt gắn liền mép vé chứ không lửng lơ. -->
      <div class="relative bg-gradient-to-br from-[#194d9b] via-[#2b6fd4] to-[#5aa9e6] px-5 pb-0 pt-5 text-white sm:px-6">
        <!-- Mây trang trí: vòng tròn mờ, thuần CSS nên html2canvas dựng lại được -->
        <div class="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/10"></div>
        <div class="pointer-events-none absolute -bottom-12 left-16 h-28 w-28 rounded-full bg-white/10"></div>

        <!-- Hàng trên: logo + tên vé bên trái, mã đặt chỗ góc PHẢI.
             Chữ hai bên đều nhỏ lại so với bản cũ nên cùng hàng không vỡ nữa:
             ô mã ~150px, còn ~170px cho tên vé trên màn 390px — đủ hai dòng. -->
        <div class="relative flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-center gap-3">
            <!-- Logo nền trong suốt, KHÔNG bọc hộp trắng như bản cũ -->
            <img
              src="/images/Sapa_logo.png"
              alt="Sapa Paragliding"
              class="h-12 w-12 flex-shrink-0 object-contain drop-shadow-lg sm:h-16 sm:w-16"
            />
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-sky-100">
                {{ $t('booking.ticket.boardingPass') }}
              </p>
              <h1 class="mt-0.5 break-words text-[15px] font-black leading-tight tracking-tight sm:text-xl">
                {{ $t('booking.ticket.title') }}
              </h1>
              <p class="mt-1 hidden text-xs font-medium text-sky-100 sm:block">
                🪂 {{ $t('booking.ticket.slogan') }}
              </p>
            </div>
          </div>

          <div class="flex-shrink-0 rounded-lg bg-white/15 px-2.5 py-1.5 text-right backdrop-blur-sm sm:px-3 sm:py-2">
            <p class="text-[9px] font-semibold uppercase tracking-wider text-sky-100">
              {{ $t('booking.ticket.bookingId') }}
            </p>
            <p class="mt-0.5 whitespace-nowrap font-mono text-[11px] font-black leading-snug tracking-tight sm:text-base sm:tracking-wide">
              {{ bookingData.bookingId || 'PENDING' }}
            </p>
          </div>
        </div>

        <!-- Dải tóm tắt chuyến bay, sát đáy cuống vé.
             Nền trắng đục 30% (đậm gấp đôi mức 15% cũ) để nổi hẳn khỏi nền
             xanh chuyển sắc — ở góc phải cuống vé nền sáng màu, mức 15% gần
             như tàng hình. Chữ nhỏ lại: nhãn 8px, giá trị 11px. -->
        <div class="relative -mx-5 mt-4 grid grid-cols-2 gap-px overflow-hidden bg-white/10 sm:-mx-6 sm:grid-cols-4">
          <div class="bg-white/30 px-2 py-1.5 text-center">
            <p class="text-[8px] font-bold uppercase tracking-wider text-white/80">
              {{ $t('booking.step5Details.date') }}
            </p>
            <p class="whitespace-nowrap text-[11px] font-black leading-tight">{{ formatDate(bookingData.preferredDate) }}</p>
          </div>
          <div class="bg-white/30 px-2 py-1.5 text-center">
            <p class="text-[8px] font-bold uppercase tracking-wider text-white/80">
              {{ $t('booking.step5Details.time') }}
            </p>
            <p class="whitespace-nowrap text-[11px] font-black leading-tight">
              {{ bookingData.preferredTime || $t('booking.step4Details.flexible') }}
            </p>
          </div>
          <div class="bg-white/30 px-2 py-1.5 text-center">
            <p class="text-[8px] font-bold uppercase tracking-wider text-white/80">
              {{ $t('booking.step5Details.passengers') }}
            </p>
            <p class="text-[11px] font-black leading-tight">{{ bookingData.numberOfPassengers }}</p>
          </div>
          <!-- "Bản Hang Đá, Sa Pa" phải nằm MỘT dòng: nowrap + cỡ 10.5px là
               vừa khít ô nửa màn hình 390px, không để rớt chữ như bản cũ. -->
          <div class="bg-white/30 px-2 py-1.5 text-center">
            <p class="text-[8px] font-bold uppercase tracking-wider text-white/80">
              {{ $t('booking.ticket.takeoffPoint') }}
            </p>
            <p class="whitespace-nowrap text-[10.5px] font-black leading-tight">{{ TAKEOFF_NAME }}</p>
          </div>
        </div>
      </div>

      <!-- ---------- ĐƯỜNG RĂNG CƯA ---------- -->
      <div class="relative h-6 bg-white">
        <div class="absolute -left-3 top-0 h-6 w-6 rounded-full border border-sky-200 bg-sky-50"></div>
        <div class="absolute -right-3 top-0 h-6 w-6 rounded-full border border-sky-200 bg-sky-50"></div>
        <div class="absolute left-6 right-6 top-3 border-t-2 border-dashed border-sky-200"></div>
      </div>

      <!-- ---------- THÂN VÉ ---------- -->
      <div class="space-y-2.5 px-5 pb-4 sm:px-6">
        <!-- Chuyến bay + liên hệ -->
        <div class="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <div class="rounded-xl border border-slate-200 p-4">
            <h3 class="mb-2.5 text-xs font-black uppercase tracking-wider text-[#194d9b]">
              {{ $t('booking.ticket.flightDetails') }}
            </h3>
            <div class="space-y-1.5">
              <div class="flex justify-between gap-3">
                <span class="text-sm text-slate-500">{{ $t('booking.step5Details.service') }}</span>
                <span class="text-right text-sm font-bold text-slate-900">{{ $t('booking.step1Details.serviceName') }}</span>
              </div>
              <div v-if="bookingData.selectedOptions?.includes('hotel-transfer')" class="flex justify-between gap-3">
                <span class="text-sm text-slate-500">{{ $t('booking.step4Details.pickupLocation') }}</span>
                <span class="text-right text-sm font-bold text-slate-900">
                  {{ bookingData.pickupLocation || $t('booking.ticket.notProvided') }}
                </span>
              </div>
              <div v-if="bookingData.selectedOptions?.includes('hotel-transfer')" class="flex justify-between gap-3">
                <span class="text-sm text-slate-500">{{ $t('booking.step4Details.pickupTime') }}</span>
                <span class="text-right text-sm font-bold text-slate-900">
                  {{ $t('booking.step4Details.pickupTimeDefault') }}
                </span>
              </div>
            </div>
          </div>

          <!-- Nhãn và giá trị CÙNG DÒNG — bản cũ xếp nhãn một dòng, giá trị
               một dòng nên riêng khối liên hệ đã cao gấp đôi cần thiết. -->
          <div class="rounded-xl border border-slate-200 p-4">
            <h3 class="mb-2.5 text-xs font-black uppercase tracking-wider text-[#194d9b]">
              {{ $t('booking.ticket.passengerInfo') }}
            </h3>
            <div class="space-y-1.5">
              <div class="flex items-baseline justify-between gap-3">
                <span class="flex-shrink-0 text-[13px] text-slate-500">{{ $t('booking.step2Details.contactName') }}</span>
                <span class="truncate text-right text-sm font-bold text-slate-900">{{ bookingData.contactName }}</span>
              </div>
              <div class="flex items-baseline justify-between gap-3">
                <span class="flex-shrink-0 text-[13px] text-slate-500">{{ $t('booking.step2Details.email') }}</span>
                <span class="truncate text-right text-sm font-semibold text-slate-900">{{ bookingData.email }}</span>
              </div>
              <div class="flex items-baseline justify-between gap-3">
                <span class="flex-shrink-0 text-[13px] text-slate-500">{{ phoneLabel }}</span>
                <span class="whitespace-nowrap text-right text-sm font-bold text-slate-900">{{ bookingData.phone }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Danh sách khách bay — mỗi khách gói trong HAI dòng: tên đậm,
             dưới là chuỗi thông tin ngăn bằng chấm giữa. Bản cũ mỗi khách là
             một thẻ lớn có lưới 5 ô, nhóm 4 khách chiếm gần nửa tấm vé. -->
        <div v-if="bookingData.passengers.length > 0" class="rounded-xl border border-slate-200 p-4">
          <div class="mb-2 flex items-center justify-between">
            <h3 class="text-xs font-black uppercase tracking-wider text-[#194d9b]">
              {{ $t('booking.ticket.passengersList') }}
            </h3>
            <span class="rounded-full bg-[#f02424] px-2.5 py-0.5 text-xs font-black text-white">
              {{ bookingData.passengers.length }}
            </span>
          </div>

          <div class="divide-y divide-slate-100">
            <div
              v-for="(passenger, idx) in bookingData.passengers"
              :key="idx"
              class="flex items-start gap-2.5 py-1.5 first:pt-0 last:pb-0"
            >
              <span class="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#194d9b] text-[10px] font-black text-white">
                {{ idx + 1 }}
              </span>
              <div class="min-w-0">
                <p class="text-sm font-black leading-tight text-slate-900">{{ passenger.fullName }}</p>
                <p class="mt-0.5 text-xs leading-snug text-slate-500">
                  {{ passenger.dateOfBirth }}
                  <span class="mx-1 text-slate-300">•</span>{{ genderText(passenger.gender) }}
                  <span class="mx-1 text-slate-300">•</span>{{ passenger.weight }}kg
                  <span class="mx-1 text-slate-300">•</span>{{ passenger.nationality }}
                  <span class="mx-1 text-slate-300">•</span>{{ passenger.passportOrId }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Giá + mã QR đứng CÙNG một hàng: trước đây là hai khối chồng
             nhau, riêng khối QR đã ăn 148px chiều cao mà nửa bên phải bỏ
             trống. Ghép lại tiết kiệm đúng chiều cao một khối. -->
        <div class="grid grid-cols-1 gap-2.5 md:grid-cols-2">
        <div class="rounded-xl border-2 border-amber-200 bg-amber-50 p-3">
          <div class="mb-2 flex items-center justify-between border-b border-amber-200 pb-2">
            <p class="text-xs font-black uppercase tracking-wider text-amber-800">
              {{ $t('booking.step5Details.total') }}
            </p>
            <p class="text-xl font-black text-[#f02424]">{{ formatPriceVND(totalPriceComputed) }}</p>
          </div>

          <div class="space-y-1">
            <div
              v-for="(line, idx) in priceBreakdownLines"
              :key="idx"
              class="flex items-start justify-between gap-4"
            >
              <div class="min-w-0">
                <p class="text-[13px] font-medium leading-snug" :class="line.type === 'discount' ? 'text-emerald-700' : 'text-slate-700'">
                  {{ line.label }}
                </p>
                <p v-if="line.detail" class="break-words text-[11px] leading-snug text-slate-500">{{ line.detail }}</p>
              </div>
              <span
                class="whitespace-nowrap text-sm font-black"
                :class="line.type === 'discount' ? 'text-emerald-700' : 'text-slate-900'"
              >
                {{ line.amountText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Điểm bay + mã QR: khách quét là mở thẳng ghim Google Maps của
             ĐIỂM CẤT CÁNH (không phải địa chỉ văn phòng), khỏi phải gõ tay
             hay hỏi đường sáng hôm bay. -->
        <div class="flex items-center gap-3 rounded-xl border-2 border-sky-200 bg-sky-50 p-3">
          <img
            v-if="takeoffQr"
            :src="takeoffQr"
            alt="QR điểm cất cánh"
            class="h-20 w-20 flex-shrink-0 rounded-lg bg-white p-1"
          />
          <div class="min-w-0">
            <h3 class="text-[11px] font-black uppercase tracking-wider text-[#194d9b]">
              {{ $t('booking.ticket.takeoffPoint') }}
            </h3>
            <p class="mt-0.5 text-sm font-black leading-snug text-slate-900">{{ TAKEOFF_NAME }}</p>
            <p class="mt-1 text-[11px] font-semibold leading-snug text-[#194d9b]">
              📍 {{ $t('booking.ticket.scanForDirections') }}
            </p>
          </div>
        </div>
        </div>

        <!-- Chuẩn bị trước khi bay — khối dài nhất thân vé (271px, chiếm
             hơn 1/5 tấm vé). Chia HAI CỘT trên màn rộng và hạ xuống 12px:
             cùng ngần ấy chữ nhưng chỉ còn quá nửa chiều cao, đủ để vé một
             hai khách gói gọn trong một tờ A4. -->
        <div class="rounded-xl border border-slate-200 p-3">
          <h3 class="mb-1.5 text-xs font-black uppercase tracking-wider text-[#194d9b]">
            {{ $t('booking.ticket.preFlightInfo.title') }}
          </h3>
          <div class="space-y-1 text-xs leading-snug text-slate-700 sm:columns-2 sm:gap-4 sm:space-y-0">
            <div class="mb-1 flex break-inside-avoid items-start gap-1.5"><span class="flex-shrink-0 text-[#f02424]">✓</span><p>{{ $t('booking.ticket.preFlightInfo.pickup') }}</p></div>
            <div class="mb-1 flex break-inside-avoid items-start gap-1.5"><span class="flex-shrink-0 text-[#f02424]">✓</span><p>{{ $t('booking.ticket.preFlightInfo.clothing') }}</p></div>
            <div class="mb-1 flex break-inside-avoid items-start gap-1.5"><span class="flex-shrink-0 text-[#f02424]">✓</span><p>{{ $t('booking.ticket.preFlightInfo.storage') }}</p></div>
            <div class="mb-1 flex break-inside-avoid items-start gap-1.5"><span class="flex-shrink-0 text-[#f02424]">✓</span><p>{{ $t('booking.ticket.preFlightInfo.belongings') }}</p></div>
            <div class="mb-1 flex break-inside-avoid items-start gap-1.5"><span class="flex-shrink-0 text-[#f02424]">✓</span><p>{{ $t('booking.ticket.preFlightInfo.transport') }}</p></div>
          </div>
        </div>

        <!-- Chân vé -->
        <div class="rounded-xl bg-gradient-to-r from-sky-50 to-amber-50 p-3 text-center">
          <p class="text-sm font-black text-[#194d9b]">🪂 {{ $t('booking.ticket.enjoy') }}</p>
          <p class="mt-1 text-[11px] leading-snug text-slate-500">
            {{ $t('booking.ticket.footer') }}
          </p>
          <p class="mt-1 text-[10px] text-slate-400">
            {{ $t('booking.ticket.validationDate') }}: {{ formatDate(new Date().toISOString()) }}
            <span class="mx-1.5">•</span>
            www.paraglidingsapa.com
            <span class="mx-1.5">•</span>
            +84 386 887 489
          </p>
        </div>
      </div>
    </div>

    <!-- Nút tải -->
    <div class="flex gap-2">
      <button
        @click="downloadTicketPDF"
        :disabled="isExporting"
        class="btn-primary flex flex-1 items-center justify-center gap-1.5 py-2 text-sm disabled:opacity-60"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ isExporting ? '…' : $t('booking.ticket.downloadPDF') }}
      </button>

      <button
        @click="downloadTicketImage"
        :disabled="isExporting"
        class="btn-secondary flex flex-1 items-center justify-center gap-1.5 py-2 text-sm disabled:opacity-60"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ isExporting ? '…' : $t('booking.ticket.downloadImage') }}
      </button>

      <p v-if="exportError" class="basis-full text-center text-xs font-semibold text-red-600">
        {{ $t('booking.ticket.exportFailed') }} — {{ exportError }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
import { TAKEOFF_MAP_URL, TAKEOFF_NAME } from '~~/shared/flying-site'
import { localeToHreflang, type SupportedLocale } from '~/utils/seo'

const { locale, t } = useI18n()

/**
 * Giới tính lưu là mã 'male'/'female' cho khỏi phụ thuộc ngôn ngữ; ra màn hình
 * mới dịch. Trước đây in thẳng mã ra nên khách nào cũng thấy chữ "male".
 */
/**
 * Nhãn ô điện thoại.
 *
 * Nhãn cũ "Số Điện Thoại/Whatsapp/Zalo" dài 27 ký tự, cộng với số điện thoại
 * bên phải là tràn khỏi ô. Rút còn "SĐT" rồi ghép thêm kênh nhắn tin.
 *
 * Zalo chỉ ghép khi số là số Việt Nam: khách nước ngoài gần như không dùng
 * Zalo, in lên vé chỉ tổ khiến họ tưởng phải cài thêm ứng dụng mới liên lạc
 * được.
 */
const phoneLabel = computed(() => {
  const isVietnamese = /^\+?84\b/.test(String(bookingData.value.phone ?? '').trim())
  return `${t('booking.ticket.phoneShort')}/WhatsApp${isVietnamese ? '/Zalo' : ''}`
})

const genderText = (raw: string): string => {
  const value = String(raw ?? '').trim().toLowerCase()
  if (value === 'male') return t('booking.fields.male')
  if (value === 'female') return t('booking.fields.female')
  return raw || ''
}


type PriceLine = {
  label: string
  detail?: string
  amountText: string
  type?: 'normal' | 'discount'
}

const bookingStore = useBookingStore()
const bookingData = computed(() => bookingStore.bookingData)
const ticketRef = ref<HTMLElement | null>(null)

const companyName = 'SAPA PARAGLIDING'
const companyInfo = 'Experience the dream of flying'

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  // Định dạng ngày theo ĐÚNG ngôn ngữ đang xem — trước đây ghim 'en-US' nên
  // bản tiếng Việt vẫn hiện "Aug 29, 2026".
  const tag = localeToHreflang[locale.value as SupportedLocale] || 'en-US'
  return date.toLocaleDateString(tag, { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatPriceVND = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

// ✅ count add-on giống Step4
const getSelectedOptionsCount = (option: string) => {
  if (!bookingData.value.selectedOptions.includes(option)) return 0
  if (option === 'hotel-transfer') return bookingData.value.numberOfPassengers
  const qty = bookingData.value.serviceQuantities?.[option] || 1
  return Math.min(qty, bookingData.value.numberOfPassengers)
}

// Giá fixed
const getTransferUnitPrice = () => 100000
const getDroneUnitPrice = () => 300000
const getCamera360UnitPrice = () => 500000

const priceBreakdownLines = computed<PriceLine[]>(() => {
  const lines: PriceLine[] = []
  const pax = bookingData.value.numberOfPassengers || 1
  const { t } = useI18n()

  // Flight
  const flightUnit = bookingData.value.servicePrice || 0
  const flightSubtotal = flightUnit * pax
  lines.push({
    label: `${t('booking.step4Details.flightCost') || 'Flight'}`,
    detail: `${formatPriceVND(flightUnit)} × ${pax}`,
    amountText: formatPriceVND(flightSubtotal),
    type: 'normal'
  })

  // Hotel transfer
  if (bookingData.value.selectedOptions.includes('hotel-transfer')) {
    const unit = getTransferUnitPrice()
    const qty = pax
    const sub = unit * qty
    lines.push({
      label: `${t('booking.step4Details.transferCost') || 'Hotel transfer'}`,
      detail: `${formatPriceVND(unit)} × ${qty}`,
      amountText: formatPriceVND(sub),
      type: 'normal'
    })
  }

  // Camera360
  if (bookingData.value.selectedOptions.includes('camera360')) {
    const unit = getCamera360UnitPrice()
    const qty = getSelectedOptionsCount('camera360')
    const sub = unit * qty
    lines.push({
      label: `${t('booking.step4Details.camera360Cost') || 'Camera 360'}`,
      detail: `${formatPriceVND(unit)} × ${qty}`,
      amountText: formatPriceVND(sub),
      type: 'normal'
    })
  }

  // Drone
  if (bookingData.value.selectedOptions.includes('drone')) {
    const unit = getDroneUnitPrice()
    const qty = getSelectedOptionsCount('drone')
    const sub = unit * qty
    lines.push({
      label: `${t('booking.step4Details.droneCost') || 'Drone'}`,
      detail: `${formatPriceVND(unit)} × ${qty}`,
      amountText: formatPriceVND(sub),
      type: 'normal'
    })
  }

  // Discount
  const discountPerPax = bookingData.value.discount || 0
  if (discountPerPax > 0) {
    const discountTotal = discountPerPax * pax
    lines.push({
      label: `${t('booking.step4Details.groupDiscount') || 'Group discount'}`,
      detail: `-${formatPriceVND(discountPerPax)} × ${pax}`,
      amountText: `-${formatPriceVND(discountTotal)}`,
      type: 'discount'
    })
  }

  return lines
})

const totalPriceComputed = computed(() => {
  const pax = bookingData.value.numberOfPassengers || 1
  const flight = (bookingData.value.servicePrice || 0) * pax

  const transfer = bookingData.value.selectedOptions.includes('hotel-transfer')
    ? getTransferUnitPrice() * pax
    : 0

  const cam = bookingData.value.selectedOptions.includes('camera360')
    ? getCamera360UnitPrice() * getSelectedOptionsCount('camera360')
    : 0

  const drone = bookingData.value.selectedOptions.includes('drone')
    ? getDroneUnitPrice() * getSelectedOptionsCount('drone')
    : 0

  const discount = (bookingData.value.discount || 0) * pax

  return flight + transfer + cam + drone - discount
})

const isExporting = ref(false)

/**
 * Mã QR trỏ tới ghim Google Maps của điểm cất cánh.
 *
 * Sinh tại trình duyệt thành ảnh data URL — KHÔNG dùng dịch vụ QR bên ngoài:
 * html2canvas không chụp được ảnh từ tên miền khác (CORS) nên vé tải về sẽ
 * mất chỗ mã QR.
 */
const takeoffQr = ref('')

onMounted(async () => {
  try {
    const QRCode = (await import('qrcode')).default
    takeoffQr.value = await QRCode.toDataURL(TAKEOFF_MAP_URL, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#194d9b', light: '#ffffff' }
    })
  } catch (error) {
    // Không có QR thì vé vẫn dùng được bình thường (v-if ẩn khối ảnh).
    console.error('Không tạo được mã QR điểm bay:', error)
  }

  // Vẽ sẵn ảnh vé sau khi QR đã vào DOM, để cú bấm tải chỉ còn việc lưu file.
  await nextTick()
  warmUp()
})


/**
 * Dựng ảnh vé bằng html2canvas.
 *
 * scale 2 (bản cũ) cho ảnh 2× rồi PNG hoá — PNG không nén mất dữ liệu nên
 * một tấm vé dài ra vài MB. scale 1.8 vẫn nét trên màn hình retina và khi in
 * A4, mà dữ liệu ít hơn hẳn.
 */
/**
 * Bề ngang cố định khi dựng ảnh vé, tính bằng px.
 *
 * KHÔNG chụp theo bề ngang màn hình khách. Trên điện thoại vé chỉ rộng 358px
 * mà cao gần 1800px — tỉ lệ 5:1, nhồi kiểu gì cũng phải cắt làm ba trang A4.
 * Ép về khổ máy tính thì khách dùng điện thoại vẫn nhận đúng tấm vé một
 * trang như người tải trên máy tính.
 *
 * Vùng in A4 sau khi chừa lề 10mm là 190 × 277mm, tức vé vừa một trang khi
 * cao/rộng ≤ 1,46 — với 672px thì trần chiều cao là 980px.
 */
const TICKET_RENDER_WIDTH = 672

async function renderTicketCanvas(): Promise<HTMLCanvasElement | null> {
  if (!ticketRef.value) return null
  const html2canvas = (await import('html2canvas')).default
  return html2canvas(ticketRef.value, {
    scale: 1.8,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    // windowWidth: để bản sao dùng đúng các quy tắc màn rộng (sm:, md:) —
    // thiếu nó thì bản chụp trên điện thoại vẫn là bố cục một cột.
    windowWidth: 1024,
    width: TICKET_RENDER_WIDTH,
    onclone: (doc: Document) => {
      const clone = doc.querySelector('[data-ticket-root]') as HTMLElement | null
      if (clone) {
        clone.style.width = `${TICKET_RENDER_WIDTH}px`
        clone.style.maxWidth = 'none'
      }
    }
  })
}

/**
 * Vẽ sẵn ảnh vé ngay khi mở trang, KHÔNG đợi khách bấm nút.
 *
 * Đây là chỗ làm hỏng chức năng tải vé trên điện thoại: bấm nút xong mới đi
 * tải thư viện rồi vẽ ảnh mất vài giây, mà Safari trên iPhone chỉ cho phép
 * lưu file trong vài trăm mili-giây ngay sau cú chạm. Quá hạn đó thì trình
 * duyệt chặn thẳng, không báo lỗi gì — khách bấm nút thấy im lìm.
 *
 * Vẽ trước rồi giữ lại thì lúc bấm chỉ còn việc đóng gói và lưu, kịp trong
 * cùng cú chạm.
 */
const cachedCanvas = shallowRef<HTMLCanvasElement | null>(null)
let warmUpPromise: Promise<HTMLCanvasElement | null> | null = null

const warmUp = () => {
  if (warmUpPromise) return warmUpPromise
  warmUpPromise = (async () => {
    try {
      // Nạp sẵn cả hai thư viện để đường bấm nút không còn chờ mạng.
      await Promise.all([import('html2canvas'), import('jspdf')])
      const canvas = await renderTicketCanvas()
      cachedCanvas.value = canvas
      return canvas
    } catch (error) {
      console.error('Không dựng sẵn được ảnh vé:', error)
      return null
    }
  })()
  return warmUpPromise
}

const getCanvas = async (): Promise<HTMLCanvasElement | null> =>
  cachedCanvas.value ?? (await warmUp())

/**
 * Đưa file tới khách.
 *
 * Trên iPhone/iPad, thẻ <a download> với blob nhiều khi mở tab trắng rồi
 * thôi; bảng chia sẻ của hệ điều hành là đường lưu file đáng tin nhất —
 * khách chọn "Lưu vào Tệp" hoặc gửi thẳng cho bạn bè.
 *
 * NHƯNG chỉ trên máy CẢM ỨNG. Safari trên máy Mac cũng có navigator.share,
 * nên nếu chỉ kiểm canShare thì khách bấm "Tải PDF" trên máy tính lại bật
 * bảng AirDrop/Mail/Notes — trông như nút tải bị hỏng. Máy tính tải thẳng
 * bằng <a download> như mọi trang web bình thường; maxTouchPoints phân đúng
 * hai đường: Mac = 0, iPhone/iPad/Android > 0.
 */
async function deliverFile(blob: Blob, filename: string, mime: string) {
  const isTouchDevice = (navigator.maxTouchPoints ?? 0) > 0

  try {
    const file = new File([blob], filename, { type: mime })
    if (isTouchDevice && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename })
      return
    }
  } catch (error) {
    // Khách bấm huỷ bảng chia sẻ thì thôi, không cần tải ép.
    if ((error as Error)?.name === 'AbortError') return
    // Lỗi khác: rơi xuống cách tải thông thường bên dưới.
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.rel = 'noopener'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

const exportError = ref('')

const downloadTicketImage = async () => {
  if (isExporting.value) return
  isExporting.value = true
  exportError.value = ''
  try {
    const canvas = await getCanvas()
    if (!canvas) throw new Error('Không dựng được ảnh vé')

    // Ảnh giữ PNG: khách hay lưu vào điện thoại rồi phóng to xem, nét quan
    // trọng hơn dung lượng. Chỉ bản PDF mới cần gọn để gửi kèm email.
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('Không tạo được tệp ảnh')

    await deliverFile(blob, `SapaParagliding.booking.${bookingData.value.bookingId || 'draft'}.png`, 'image/png')
  } catch (error) {
    console.error('Error generating ticket image:', error)
    exportError.value = (error as Error)?.message || String(error)
  } finally {
    isExporting.value = false
  }
}

/**
 * Xuất PDF.
 *
 *   • JPEG chất lượng 0.82 thay PNG — ảnh vé là nền phẳng + chữ, JPEG nén
 *     tốt hơn nhiều lần mà nhìn không khác.
 *   • Chừa lề 10mm mỗi bên nên vé không dính mép giấy.
 *   • Vé hơi dài hơn trang giấy thì THU NHỎ cho vừa một trang; dài hẳn mới
 *     cắt sang trang tiếp.
 */
const downloadTicketPDF = async () => {
  if (isExporting.value) return
  isExporting.value = true
  exportError.value = ''
  try {
    const { jsPDF } = await import('jspdf')
    const canvas = await getCanvas()
    if (!canvas) throw new Error('Không dựng được ảnh vé')

    const imgData = canvas.toDataURL('image/jpeg', 0.82)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true })

    const PAGE_W = 210
    const PAGE_H = 297
    const MARGIN = 10
    const imgWidth = PAGE_W - MARGIN * 2
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    const usableH = PAGE_H - MARGIN * 2

    /**
     * Mức thu nhỏ tối thiểu còn chấp nhận được. Dưới ngưỡng này thì chữ trên
     * giấy bắt đầu khó đọc, thà cắt hai trang còn hơn.
     */
    const MIN_SHRINK = 0.72

    if (imgHeight <= usableH) {
      pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN, imgWidth, imgHeight, undefined, 'FAST')
    } else if (usableH / imgHeight >= MIN_SHRINK) {
      /**
       * Thu vừa một trang.
       *
       * Vé một hai khách chỉ dài hơn vùng in đúng vài milimét — đủ để bị đẩy
       * sang trang thứ hai chỉ chứa một mẩu chân vé, trông như in hỏng. Thu
       * nhỏ vài phần trăm rồi căn giữa thì mắt thường không nhận ra, mà vé
       * gọn đúng một tờ. Đông khách hơn, vé dài hẳn ra thì rơi xuống nhánh
       * cắt trang bên dưới.
       */
      const shrink = usableH / imgHeight
      const drawW = imgWidth * shrink
      pdf.addImage(imgData, 'JPEG', (PAGE_W - drawW) / 2, MARGIN, drawW, usableH, undefined, 'FAST')
    } else {
      // Vé dài hơn một trang: dịch ảnh lên theo từng trang rồi cắt bằng
      // vùng in của trang đó.
      let remaining = imgHeight
      let offset = 0
      while (remaining > 0) {
        pdf.addImage(imgData, 'JPEG', MARGIN, MARGIN - offset, imgWidth, imgHeight, undefined, 'FAST')
        remaining -= usableH
        offset += usableH
        if (remaining > 0) pdf.addPage()
      }
    }

    await deliverFile(
      pdf.output('blob'),
      `SapaParagliding.booking.${bookingData.value.bookingId || 'draft'}.pdf`,
      'application/pdf'
    )
  } catch (error) {
    console.error('Error generating PDF:', error)
    exportError.value = (error as Error)?.message || String(error)
  } finally {
    isExporting.value = false
  }
}
</script>
