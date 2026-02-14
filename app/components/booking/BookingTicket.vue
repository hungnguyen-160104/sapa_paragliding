<template>
  <div class="space-y-3">
    <!-- Ticket Preview -->
    <div
      ref="ticketRef"
      class="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-lg overflow-hidden border border-red-200"
    >
      <!-- Header -->
      <div class="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img
              src="/images/Sapa_logo.png"
              alt="Sapa Paragliding Logo"
              class="w-10 h-10 object-contain bg-white rounded p-1"
            />
            <div>
              <h1 class="text-lg font-bold leading-tight">{{ $t('booking.ticket.title') }}</h1>
              <p class="text-red-100 text-xs">{{ $t('booking.ticket.subtitle') }}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-xs text-red-100">{{ $t('booking.ticket.bookingId') }}</p>
            <p class="text-sm font-mono font-bold">{{ bookingData.bookingId || 'PENDING' }}</p>
          </div>
        </div>

        <!-- Company Info -->
        <div class="border-t border-red-400/50 pt-2 mt-2 flex items-center justify-between text-xs">
          <div>
            <span class="font-semibold">{{ companyName }}</span>
            <span class="text-red-200 mx-1">•</span>
            <span class="text-red-100">{{ companyInfo }}</span>
          </div>
          <div class="text-red-100">
            <a href="tel:+84386887489" class="hover:underline">+84 386 887 489</a>
          </div>
        </div>
      </div>

      <!-- Body -->
      <div class="p-4 space-y-3">
        <!-- Two Column Layout -->
        <div class="grid grid-cols-2 gap-3">
          <!-- Flight Details -->
          <div class="bg-white rounded p-3 border border-gray-100">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              {{ $t('booking.ticket.flightDetails') }}
            </h3>
            <div class="space-y-1.5 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-500 text-xs">{{ $t('booking.step5Details.service') }}</span>
                <span class="font-semibold text-gray-900 text-xs">{{ $t('booking.step1Details.serviceName') }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-xs">{{ $t('booking.step5Details.date') }}</span>
                <span class="font-semibold text-gray-900 text-xs">{{ formatDate(bookingData.preferredDate) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-xs">{{ $t('booking.step5Details.time') }}</span>
                <span class="font-semibold text-gray-900 text-xs">
                  {{ bookingData.preferredTime || $t('booking.step4Details.flexible') }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-500 text-xs">{{ $t('booking.step5Details.passengers') }}</span>
                <span class="font-semibold text-gray-900 text-xs">{{ bookingData.numberOfPassengers }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="bg-white rounded p-3 border border-gray-100">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              {{ $t('booking.ticket.passengerInfo') }}
            </h3>
            <div class="space-y-1.5">
              <div>
                <p class="text-[10px] text-gray-400 uppercase">{{ $t('booking.step2Details.contactName') }}</p>
                <p class="font-semibold text-gray-900 text-xs break-words">{{ bookingData.contactName }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase">{{ $t('booking.step2Details.email') }}</p>
                <p class="font-mono text-xs text-gray-900 break-all">{{ bookingData.email }}</p>
              </div>
              <div>
                <p class="text-[10px] text-gray-400 uppercase">{{ $t('booking.step2Details.phone') }}</p>
                <p class="font-mono text-xs text-gray-900">{{ bookingData.phone }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Passengers -->
        <div v-if="bookingData.passengers.length > 0" class="bg-white rounded p-3 border border-gray-100">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide">
              {{ $t('booking.ticket.passengersList') }}
            </h3>
            <span class="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 font-bold">
              {{ bookingData.passengers.length }}
            </span>
          </div>

          <div class="space-y-2">
            <div
              v-for="(passenger, idx) in bookingData.passengers"
              :key="idx"
              class="bg-gray-50 rounded p-2 border border-gray-200"
            >
              <div class="flex items-center gap-2 mb-1.5">
                <span
                  class="w-5 h-5 bg-red-600 text-white flex items-center justify-center text-[10px] font-bold rounded-full flex-shrink-0"
                >
                  {{ idx + 1 }}
                </span>
                <span class="font-semibold text-gray-900 text-xs">{{ passenger.fullName }}</span>
              </div>

              <div class="grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-gray-600 pl-7">
                <div>
                  <span class="font-medium">{{ $t('booking.step4Details.dateOfBirth') }}</span>
                  <span class="ml-1 text-gray-900">{{ passenger.dateOfBirth }}</span>
                </div>
                <div>
                  <span class="font-medium">{{ $t('booking.step4Details.gender') }}</span>
                  <span class="ml-1 text-gray-900 capitalize">{{ passenger.gender }}</span>
                </div>
                <div>
                  <span class="font-medium">{{ $t('booking.step4Details.idNumber') }}</span>
                  <span class="ml-1 text-gray-900">{{ passenger.passportOrId }}</span>
                </div>
                <div>
                  <span class="font-medium">{{ $t('booking.step4Details.nationality') }}</span>
                  <span class="ml-1 text-gray-900">{{ passenger.nationality }}</span>
                </div>
                <div>
                  <span class="font-medium">{{ $t('booking.step4Details.weight') }}</span>
                  <span class="ml-1 text-gray-900">{{ passenger.weight }}kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ✅ Pricing (GIỐNG Step 4: đơn giá × SL = thành tiền) -->
        <div class="bg-gray-900 text-white rounded p-3">
          <div class="flex items-center justify-between mb-2">
            <p class="text-[10px] text-gray-400 uppercase">{{ $t('booking.step5Details.total') }}</p>
            <p class="text-lg font-bold text-white">{{ formatPriceVND(totalPriceComputed) }}</p>
          </div>

          <div class="space-y-1.5 text-xs">
            <div
              v-for="(line, idx) in priceBreakdownLines"
              :key="idx"
              class="flex items-start justify-between gap-3"
              :class="line.type === 'discount' ? 'text-red-300' : 'text-gray-200'"
            >
              <div class="min-w-0">
                <p class="break-words">{{ line.label }}</p>
                <p v-if="line.detail" class="text-[10px] text-gray-400 break-words">{{ line.detail }}</p>
              </div>
              <span class="font-semibold whitespace-nowrap" :class="line.type === 'discount' ? 'text-red-300' : 'text-white'">
                {{ line.amountText }}
              </span>
            </div>
          </div>
        </div>

        <!-- Pre-flight Information -->
        <div class="bg-white rounded p-3 border border-gray-100">
          <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            {{ $t('booking.ticket.preFlightInfo.title') }}
          </h3>
          <div class="space-y-1.5 text-xs text-gray-700">
            <div class="flex items-start gap-1.5"><span class="text-red-500 mt-0.5 flex-shrink-0">•</span><p>{{ $t('booking.ticket.preFlightInfo.pickup') }}</p></div>
            <div class="flex items-start gap-1.5"><span class="text-red-500 mt-0.5 flex-shrink-0">•</span><p>{{ $t('booking.ticket.preFlightInfo.clothing') }}</p></div>
            <div class="flex items-start gap-1.5"><span class="text-red-500 mt-0.5 flex-shrink-0">•</span><p>{{ $t('booking.ticket.preFlightInfo.storage') }}</p></div>
            <div class="flex items-start gap-1.5"><span class="text-red-500 mt-0.5 flex-shrink-0">•</span><p>{{ $t('booking.ticket.preFlightInfo.belongings') }}</p></div>
            <div class="flex items-start gap-1.5"><span class="text-red-500 mt-0.5 flex-shrink-0">•</span><p>{{ $t('booking.ticket.preFlightInfo.launchLanding') }}</p></div>
            <div class="flex items-start gap-1.5"><span class="text-red-500 mt-0.5 flex-shrink-0">•</span><p>{{ $t('booking.ticket.preFlightInfo.transport') }}</p></div>
          </div>
        </div>

        <!-- Footer -->
        <div class="text-center text-[10px] text-gray-500 pt-2 border-t border-gray-200">
          <span>{{ $t('booking.ticket.validationDate') }}: {{ formatDate(new Date().toISOString()) }}</span>
          <span class="mx-2">•</span>
          <span>{{ $t('booking.ticket.footer') }}</span>
        </div>
      </div>
    </div>

    <!-- Download Buttons -->
    <div class="flex gap-2">
      <button
        @click="downloadTicketPDF"
        class="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ $t('booking.ticket.downloadPDF') }}
      </button>

      <button
        @click="downloadTicketImage"
        class="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        {{ $t('booking.ticket.downloadImage') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

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
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
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

const downloadTicketImage = async () => {
  if (!ticketRef.value) return
  try {
    const html2canvasLib = (await import('html2canvas')).default
    const canvas = await html2canvasLib(ticketRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `SapaParagliding.booking.${bookingData.value.bookingId || 'draft'}.png`
    link.click()
  } catch (error) {
    console.error('Error generating image:', error)
    alert('Failed to download ticket image')
  }
}

const downloadTicketPDF = async () => {
  if (!ticketRef.value) return
  try {
    const html2canvas = (await import('html2canvas')).default
    const { jsPDF } = await import('jspdf')

    const canvas = await html2canvas(ticketRef.value, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`SapaParagliding.booking.${bookingData.value.bookingId || 'draft'}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Failed to download ticket PDF')
  }
}
</script>
