<template>
  <div class="space-y-5">
    <!-- Header + Passenger Count Row -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('booking.selectService') }}</h2>

      <!-- Compact Passenger Selector -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span class="text-sm font-medium text-gray-600">
            {{ $t('booking.step1Details.numberOfPassengers') }}
          </span>
        </div>

        <div class="flex items-center bg-white border-2 border-gray-200 rounded-lg">
          <button
            @click="decreasePassengers"
            :disabled="numberOfPassengers <= 1"
            class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold"
          >−</button>

          <span class="px-3 font-bold text-red-600">{{ numberOfPassengers }}</span>

          <!-- ✅ bỏ giới hạn 20 -->
          <button
            @click="increasePassengers"
            class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 font-bold"
          >+</button>
        </div>
      </div>
    </div>

    <!-- Price Display Card -->
    <div class="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">
            {{ $t('booking.step1Details.flightPrice') }}
          </p>
          <p class="text-lg font-bold text-gray-900">{{ formatPriceVND(basePrice) }}</p>
        </div>

        <div v-if="activeDiscount > 0">
          <p class="text-xs text-green-600 uppercase tracking-wide">
            {{ $t('booking.step1Details.groupDiscount') }}
          </p>
          <p class="text-lg font-bold text-green-600">
            -{{ formatPriceVND(activeDiscount) }}/{{ $t('booking.step1Details.people') }}
          </p>
        </div>

        <div v-if="optionalServicesTotal > 0">
          <p class="text-xs text-gray-500 uppercase tracking-wide">
            {{ $t('booking.step1Details.optionalServicesTotal') }}
          </p>
          <p class="text-lg font-bold text-gray-700">+{{ formatPriceVND(optionalServicesTotal) }}</p>
        </div>

        <div class="col-span-2 md:col-span-1 text-right">
          <p class="text-xs text-gray-500 uppercase tracking-wide">{{ $t('booking.step1Details.total') }}</p>
          <p class="text-2xl font-bold text-red-600">{{ formatPriceVND(totalPrice) }}</p>
          <p class="text-sm text-gray-500">({{ formatPriceUSD(totalPriceUSD) }})</p>
        </div>
      </div>
    </div>

    <!-- Optional Services -->
    <div class="bg-white border border-gray-200 rounded-xl p-4">
      <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center">
        <svg class="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
            clip-rule="evenodd" />
        </svg>
        {{ $t('booking.step1Details.optionalServices') }}
      </h3>

      <div class="space-y-3">
        <!-- Hotel Transfer -->
        <div class="flex items-center gap-3">
          <button @click="toggleOption('hotel-transfer')" :class="[
            'flex-1 text-left px-4 py-3 rounded-lg text-sm font-medium transition-all border-2',
            selectedOptionsView.includes('hotel-transfer')
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
          ]">
            <span>{{ $t('booking.step1Details.optionalItems.hotelTransfer.name') }}</span>
            <span class="ml-1 opacity-80">+{{ formatPriceVND(100000) }}/pax</span>
          </button>
        </div>

        <!-- Drone -->
        <div class="flex items-center gap-3">
          <button @click="toggleOption('drone')" :class="[
            'flex-1 text-left px-4 py-3 rounded-lg text-sm font-medium transition-all border-2',
            selectedOptionsView.includes('drone')
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
          ]">
            <span>{{ $t('booking.step1Details.optionalItems.drone.name') }}</span>
            <span class="ml-1 opacity-80">+{{ formatPriceVND(300000) }}/pax</span>
          </button>

          <div v-if="selectedOptionsView.includes('drone')"
            class="flex items-center bg-white border-2 border-gray-200 rounded-lg flex-shrink-0">
            <button
              @click.stop="decreaseServiceQuantity('drone')"
              :disabled="(serviceQuantitiesView['drone'] ?? 1) <= 1"
              class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold"
            >−</button>

            <span class="px-2 font-bold text-red-600 text-sm min-w-[24px] text-center">
              {{ serviceQuantitiesView['drone'] ?? 1 }}
            </span>

            <button
              @click.stop="increaseServiceQuantity('drone')"
              :disabled="(serviceQuantitiesView['drone'] ?? 1) >= numberOfPassengers"
              class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold"
            >+</button>
          </div>
        </div>

        <!-- Camera 360 -->
        <div class="flex items-center gap-3">
          <button @click="toggleOption('camera360')" :class="[
            'flex-1 text-left px-4 py-3 rounded-lg text-sm font-medium transition-all border-2',
            selectedOptionsView.includes('camera360')
              ? 'bg-red-600 text-white border-red-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
          ]">
            <span>{{ $t('booking.step1Details.optionalItems.camera360.name') }}</span>
            <span class="ml-1 opacity-80">+{{ formatPriceVND(500000) }}/pax</span>
          </button>

          <div v-if="selectedOptionsView.includes('camera360')"
            class="flex items-center bg-white border-2 border-gray-200 rounded-lg flex-shrink-0">
            <button
              @click.stop="decreaseServiceQuantity('camera360')"
              :disabled="(serviceQuantitiesView['camera360'] ?? 1) <= 1"
              class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold"
            >−</button>

            <span class="px-2 font-bold text-red-600 text-sm min-w-[24px] text-center">
              {{ serviceQuantitiesView['camera360'] ?? 1 }}
            </span>

            <button
              @click.stop="increaseServiceQuantity('camera360')"
              :disabled="(serviceQuantitiesView['camera360'] ?? 1) >= numberOfPassengers"
              class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold"
            >+</button>
          </div>
        </div>

        <div class="px-4 py-3 rounded-lg text-sm text-gray-500 bg-gray-50 border border-gray-200">
          {{ $t('booking.step1Details.optionalItems.gopro') }}
        </div>
      </div>
    </div>

<!-- ✅ Added: Included + Discount panels (2 columns like screenshot) -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Included -->
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
      @click="showIncluded = !showIncluded"
    >
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
          <svg class="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd" />
          </svg>
        </span>

        <!-- ✅ dùng i18n -->
        <span class="font-bold text-gray-900">{{ $t('booking.step1Details.included') }}</span>
      </div>

      <svg class="w-5 h-5 text-gray-500 transition-transform"
        :class="showIncluded ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="showIncluded" class="px-4 pb-4">
      <ul class="space-y-2 text-sm text-gray-700">
        <li v-for="(item, idx) in includedServices" :key="idx" class="flex gap-2">
          <span class="text-green-600 mt-0.5">✓</span>
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>
  </div>

  <!-- Discount -->
  <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50"
      @click="showPromos = !showPromos"
    >
      <div class="flex items-center gap-2">
        <span class="w-5 h-5 rounded bg-orange-100 flex items-center justify-center">
          <span class="w-2 h-2 bg-orange-500 rounded-sm"></span>
        </span>

        <!-- ✅ dùng i18n -->
        <span class="font-bold text-gray-900">
          {{ $t('booking.step1Details.promotionInfo') }}
        </span>

        <span
          v-if="activeDiscount > 0"
          class="ml-2 text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
        >
          -{{ formatPriceVND(activeDiscount * numberOfPassengers) }}
        </span>
      </div>

      <svg class="w-5 h-5 text-gray-500 transition-transform"
        :class="showPromos ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="showPromos" class="px-4 pb-4">
      <div class="space-y-3 text-sm">
        <!-- ✅ dùng promo.text đã lấy từ i18n -->
        <div v-for="(p, idx) in promotions" :key="idx" class="flex justify-between text-gray-700">
          <span>{{ p.text }}</span>
          <span class="font-medium">
            -{{ formatPriceVND(p.discountVND) }}/{{ $t('booking.step1Details.people') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</div>


    <div class="flex justify-end pt-2">
      <button @click="handleNext" class="btn-primary text-lg px-10 py-3">
        {{ $t('booking.step1Details.continue') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

interface OptionalService {
  id: string
  name: string
  description: string
  priceVND: number
  priceUSD: number
  unit: string
}

const bookingStore = useBookingStore()

const showIncluded = ref(false)
const showPromos = ref(false)

const basePrice = 2090000
const basePriceUSD = 80

const numberOfPassengers = ref(bookingStore.bookingData?.numberOfPassengers ?? 1)

const { t } = useI18n()

const includedServices = computed(() => [
  t('booking.step1Details.includedItems.flight'),
  t('booking.step1Details.includedItems.photoVideo'),
  t('booking.step1Details.includedItems.drinks'),
  t('booking.step1Details.includedItems.insurance'),
  t('booking.step1Details.includedItems.certificate'),
  t('booking.step1Details.includedItems.equipment'),
  t('booking.step1Details.includedItems.reschedulePolicy')
])

const optionalServices = computed(() => [
  {
    id: 'hotel-transfer',
    name: t('booking.step1Details.optionalItems.hotelTransfer.name'),
    description: t('booking.step1Details.optionalItems.hotelTransfer.description'),
    priceVND: 100000,
    priceUSD: 5,
    unit: t('booking.step1Details.people')
  },
  {
    id: 'drone',
    name: t('booking.step1Details.optionalItems.drone.name'),
    description: t('booking.step1Details.optionalItems.drone.description'),
    priceVND: 300000,
    priceUSD: 12,
    unit: t('booking.step1Details.perFlight').replace('/', '')
  },
  {
    id: 'camera360',
    name: t('booking.step1Details.optionalItems.camera360.name'),
    description: t('booking.step1Details.optionalItems.camera360.description'),
    priceVND: 500000,
    priceUSD: 20,
    unit: t('booking.step1Details.perFlight').replace('/', '')
  }
])

const selectedOptions = ref<string[]>(bookingStore.bookingData?.selectedOptions ?? [])
const serviceQuantities = ref<Record<string, number>>(
  bookingStore.bookingData?.serviceQuantities ?? { drone: 1, camera360: 1 }
)

/**
 * ✅ Quan trọng: tạo "view" computed để template không bị lỗi `.includes` / `[]`
 * (vì selectedOptions & serviceQuantities là ref)
 */
const selectedOptionsView = computed(() => selectedOptions.value)
const serviceQuantitiesView = computed(() => serviceQuantities.value)

const promotions = computed(() => [
  { minPeople: 2, text: t('booking.step1Details.promotions.group2'), discountVND: 50000, discountUSD: 2 },
  { minPeople: 3, text: t('booking.step1Details.promotions.group3'), discountVND: 70000, discountUSD: 3 },
  { minPeople: 4, text: t('booking.step1Details.promotions.group4'), discountVND: 100000, discountUSD: 4 },
  { minPeople: 6, text: t('booking.step1Details.promotions.group6'), discountVND: 150000, discountUSD: 6 }
])

const activeDiscount = computed(() => {
  for (let i = promotions.value.length - 1; i >= 0; i--) {
    const promo = promotions.value[i]
    if (promo && numberOfPassengers.value >= promo.minPeople) return promo.discountVND
  }
  return 0
})

const activeDiscountUSD = computed(() => {
  for (let i = promotions.value.length - 1; i >= 0; i--) {
    const promo = promotions.value[i]
    if (promo && numberOfPassengers.value >= promo.minPeople) return promo.discountUSD
  }
  return 0
})

const optionalServicesTotal = computed(() => {
  let total = 0
  selectedOptions.value.forEach(optionId => {
    const service = optionalServices.value.find((s: OptionalService) => s.id === optionId)
    if (!service) return

    if (service.id === 'hotel-transfer') {
      total += service.priceVND * numberOfPassengers.value
    } else {
      const qty = serviceQuantities.value[service.id] ?? 1
      total += service.priceVND * qty
    }
  })
  return total
})

const optionalServicesTotalUSD = computed(() => {
  let total = 0
  selectedOptions.value.forEach(optionId => {
    const service = optionalServices.value.find((s: OptionalService) => s.id === optionId)
    if (!service) return

    if (service.id === 'hotel-transfer') {
      total += service.priceUSD * numberOfPassengers.value
    } else {
      const qty = serviceQuantities.value[service.id] ?? 1
      total += service.priceUSD * qty
    }
  })
  return total
})

const totalPrice = computed(() => {
  const base = basePrice * numberOfPassengers.value
  const discount = activeDiscount.value * numberOfPassengers.value
  return base - discount + optionalServicesTotal.value
})

const totalPriceUSD = computed(() => {
  const base = basePriceUSD * numberOfPassengers.value
  const discount = activeDiscountUSD.value * numberOfPassengers.value
  return base - discount + optionalServicesTotalUSD.value
})

const formatPriceVND = (price: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)

const formatPriceUSD = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)

const toggleOption = (optionId: string) => {
  const index = selectedOptions.value.indexOf(optionId)
  if (index > -1) selectedOptions.value.splice(index, 1)
  else selectedOptions.value.push(optionId)
}

// ✅ bỏ cap 20
const increasePassengers = () => {
  numberOfPassengers.value++
}

const decreasePassengers = () => {
  if (numberOfPassengers.value > 1) numberOfPassengers.value--
}

const handleNext = () => {
  bookingStore.setService('paragliding-standard', t('booking.step1Details.serviceName'), basePrice)
  bookingStore.setNumberOfPassengers(numberOfPassengers.value)
  bookingStore.setSelectedOptions(selectedOptions.value)
  bookingStore.setServiceQuantities(serviceQuantities.value)
  bookingStore.nextStep()
}

// qty dịch vụ: min 1, max pax
const increaseServiceQuantity = (serviceId: string) => {
  serviceQuantities.value[serviceId] = serviceQuantities.value[serviceId] ?? 1
  if (serviceQuantities.value[serviceId] < numberOfPassengers.value) serviceQuantities.value[serviceId]++
}

const decreaseServiceQuantity = (serviceId: string) => {
  serviceQuantities.value[serviceId] = serviceQuantities.value[serviceId] ?? 1
  if (serviceQuantities.value[serviceId] > 1) serviceQuantities.value[serviceId]--
}

watch(numberOfPassengers, (newVal) => {
  for (const key of Object.keys(serviceQuantities.value)) {
    const k = key as string
    if ((serviceQuantities.value[k] ?? 1) > newVal) {
      serviceQuantities.value[k] = newVal
    }
  }
})
</script>
