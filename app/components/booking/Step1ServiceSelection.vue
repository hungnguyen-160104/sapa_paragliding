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
                    <span class="text-sm font-medium text-gray-600">{{ $t('booking.step1Details.numberOfPassengers')
                        }}</span>
                </div>
                <div class="flex items-center bg-white border-2 border-gray-200 rounded-lg">
                    <button @click="decreasePassengers" :disabled="numberOfPassengers <= 1"
                        class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold">−</button>
                    <span class="px-3 font-bold text-red-600">{{ numberOfPassengers }}</span>
                    <button @click="increasePassengers" :disabled="numberOfPassengers >= 20"
                        class="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 font-bold">+</button>
                </div>
            </div>
        </div>

        <!-- Price Display Card -->
        <div class="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-4">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide">{{ $t('booking.step1Details.flightPrice')
                        }}</p>
                    <p class="text-lg font-bold text-gray-900">{{ formatPriceVND(basePrice) }}</p>
                </div>
                <div v-if="activeDiscount > 0">
                    <p class="text-xs text-green-600 uppercase tracking-wide">{{
                        $t('booking.step1Details.groupDiscount') }}</p>
                    <p class="text-lg font-bold text-green-600">-{{ formatPriceVND(activeDiscount) }}/{{
                        $t('booking.step1Details.people') }}</p>
                </div>
                <div v-if="optionalServicesTotal > 0">
                    <p class="text-xs text-gray-500 uppercase tracking-wide">{{
                        $t('booking.step1Details.optionalServicesTotal') }}</p>
                    <p class="text-lg font-bold text-gray-700">+{{ formatPriceVND(optionalServicesTotal) }}</p>
                </div>
                <div class="col-span-2 md:col-span-1 text-right">
                    <p class="text-xs text-gray-500 uppercase tracking-wide">{{ $t('booking.step1Details.total') }}</p>
                    <p class="text-2xl font-bold text-red-600">{{ formatPriceVND(totalPrice) }}</p>
                    <p class="text-sm text-gray-500">({{ formatPriceUSD(totalPriceUSD) }})</p>
                </div>
            </div>
        </div>

        <!-- Optional Services - Compact Chips -->
        <div class="bg-white border border-gray-200 rounded-xl p-4">
            <h3 class="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <svg class="w-4 h-4 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clip-rule="evenodd" />
                </svg>
                {{ $t('booking.step1Details.optionalServices') }}
            </h3>
            <div class="flex flex-wrap gap-2">
                <button v-for="option in optionalServices" :key="option.id" @click="toggleOption(option.id)" :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
                    selectedOptions.includes(option.id)
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-red-400'
                ]">
                    <span>{{ option.name }}</span>
                    <span class="ml-1 opacity-80">+{{ formatPriceVND(option.priceVND) }}</span>
                </button>
            </div>

            <!-- Quantity selectors for selected services -->
            <div v-if="selectedOptions.includes('drone') || selectedOptions.includes('camera360')"
                class="mt-3 pt-3 border-t border-gray-100">
                <div v-for="serviceId in ['drone', 'camera360']" :key="serviceId">
                    <div v-if="selectedOptions.includes(serviceId)" class="flex items-center justify-between py-2">
                        <span class="text-sm text-gray-600">{{ getServiceName(serviceId) }} × {{
                            $t('booking.step1Details.numberOfPeople') }}:</span>
                        <div class="flex items-center bg-gray-100 rounded-lg">
                            <button @click.prevent="decreaseServiceQuantity(serviceId)"
                                :disabled="(serviceQuantities[serviceId] ?? 1) <= 1"
                                class="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 font-bold rounded-l-lg">−</button>
                            <span class="px-3 font-bold text-red-600 text-sm">{{ serviceQuantities[serviceId] ?? 1
                                }}</span>
                            <button @click.prevent="increaseServiceQuantity(serviceId)"
                                :disabled="(serviceQuantities[serviceId] ?? 1) >= numberOfPassengers"
                                class="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 disabled:opacity-40 font-bold rounded-r-lg">+</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Collapsible Sections -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Included Services Accordion -->
            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button @click="showIncluded = !showIncluded"
                    class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                    <span class="font-bold text-gray-900 flex items-center">
                        <svg class="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        {{ $t('booking.step1Details.included') }}
                    </span>
                    <svg :class="['w-5 h-5 text-gray-500 transition-transform', showIncluded ? 'rotate-180' : '']"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div v-if="showIncluded" class="px-4 pb-4">
                    <ul class="space-y-1 text-sm text-gray-600">
                        <li v-for="(item, index) in includedServices" :key="index" class="flex items-start">
                            <svg class="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor"
                                viewBox="0 0 20 20">
                                <path fill-rule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clip-rule="evenodd" />
                            </svg>
                            <span>{{ item }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- Promotions Accordion -->
            <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <button @click="showPromos = !showPromos"
                    class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                    <span class="font-bold text-gray-900 flex items-center">
                        <svg class="w-5 h-5 text-orange-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        {{ $t('booking.step1Details.promotionInfo') }}
                        <span v-if="activeDiscount > 0"
                            class="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-bold">
                            -{{ formatPriceVND(activeDiscount * numberOfPassengers) }}
                        </span>
                    </span>
                    <svg :class="['w-5 h-5 text-gray-500 transition-transform', showPromos ? 'rotate-180' : '']"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                <div v-if="showPromos" class="px-4 pb-4">
                    <ul class="space-y-2 text-sm">
                        <li v-for="promo in promotions" :key="promo.minPeople"
                            :class="['flex items-center justify-between p-2 rounded-lg', numberOfPassengers >= promo.minPeople ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600']">
                            <span>{{ promo.text }}</span>
                            <span>-{{ formatPriceVND(promo.discountVND) }}/{{ $t('booking.step1Details.people')
                                }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Locations - Inline -->
        <div class="flex flex-wrap gap-4 text-sm">
            <a href="https://maps.app.goo.gl/bGtKFTuxyZvJhsJZ9" target="_blank"
                class="flex items-center text-red-600 hover:text-red-700 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                {{ $t('booking.step1Details.takeoffPoint') }} →
            </a>
            <a href="https://maps.app.goo.gl/mYnh4KJVk3aQZLYC6" target="_blank"
                class="flex items-center text-blue-600 hover:text-blue-700 transition-colors">
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                {{ $t('booking.step1Details.landingPoint') }} →
            </a>
        </div>

        <!-- Navigation -->
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

// UI State
const showIncluded = ref(false)
const showPromos = ref(false)

// Base pricing
const basePrice = 2090000 // VND
const basePriceUSD = 80 // USD

// Number of passengers
const numberOfPassengers = ref(bookingStore.bookingData.numberOfPassengers || 1)

const { t } = useI18n()

// Included services
const includedServices = computed(() => [
    t('booking.step1Details.includedItems.flight'),
    t('booking.step1Details.includedItems.photoVideo'),
    t('booking.step1Details.includedItems.drinks'),
    t('booking.step1Details.includedItems.insurance'),
    t('booking.step1Details.includedItems.certificate'),
    t('booking.step1Details.includedItems.equipment'),
    t('booking.step1Details.includedItems.reschedulePolicy')
])

// Optional services
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

const selectedOptions = ref<string[]>(bookingStore.bookingData.selectedOptions || [])

// Track quantity for services that require per-person pricing
const serviceQuantities = ref<Record<string, number>>(
    bookingStore.bookingData.serviceQuantities || {
        'drone': 1,
        'camera360': 1
    }
)

// Promotions
const promotions = computed(() => [
    { minPeople: 2, text: t('booking.step1Details.promotions.group2'), discountVND: 50000, discountUSD: 2 },
    { minPeople: 3, text: t('booking.step1Details.promotions.group3'), discountVND: 70000, discountUSD: 3 },
    { minPeople: 4, text: t('booking.step1Details.promotions.group4'), discountVND: 100000, discountUSD: 4 },
    { minPeople: 6, text: t('booking.step1Details.promotions.group6'), discountVND: 150000, discountUSD: 6 }
])

// Calculate active discount
const activeDiscount = computed(() => {
    for (let i = promotions.value.length - 1; i >= 0; i--) {
        const promo = promotions.value[i]
        if (promo && numberOfPassengers.value >= promo.minPeople) {
            return promo.discountVND
        }
    }
    return 0
})

const activeDiscountUSD = computed(() => {
    for (let i = promotions.value.length - 1; i >= 0; i--) {
        const promo = promotions.value[i]
        if (promo && numberOfPassengers.value >= promo.minPeople) {
            return promo.discountUSD
        }
    }
    return 0
})

// Calculate optional services total
const optionalServicesTotal = computed(() => {
    let total = 0
    selectedOptions.value.forEach(optionId => {
        const service = optionalServices.value.find((s: OptionalService) => s.id === optionId)
        if (service) {
            if (service.id === 'hotel-transfer') {
                total += service.priceVND * numberOfPassengers.value
            } else if (service.id === 'drone' || service.id === 'camera360') {
                const quantity = serviceQuantities.value[service.id] || 1
                total += service.priceVND * quantity
            } else {
                total += service.priceVND
            }
        }
    })
    return total
})

const optionalServicesTotalUSD = computed(() => {
    let total = 0
    selectedOptions.value.forEach(optionId => {
        const service = optionalServices.value.find((s: OptionalService) => s.id === optionId)
        if (service) {
            if (service.id === 'hotel-transfer') {
                total += service.priceUSD * numberOfPassengers.value
            } else if (service.id === 'drone' || service.id === 'camera360') {
                const quantity = serviceQuantities.value[service.id] || 1
                total += service.priceUSD * quantity
            } else {
                total += service.priceUSD
            }
        }
    })
    return total
})

// Calculate total price
const totalPrice = computed(() => {
    const base = basePrice * numberOfPassengers.value
    const discount = activeDiscount.value * numberOfPassengers.value
    const optional = optionalServicesTotal.value
    return base - discount + optional
})

const totalPriceUSD = computed(() => {
    const base = basePriceUSD * numberOfPassengers.value
    const discount = activeDiscountUSD.value * numberOfPassengers.value
    const optional = optionalServicesTotalUSD.value
    return base - discount + optional
})

// Format functions
const formatPriceVND = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price)
}

const formatPriceUSD = (price: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price)
}

// Get service name by ID
const getServiceName = (serviceId: string) => {
    const service = optionalServices.value.find(s => s.id === serviceId)
    return service?.name || serviceId
}

// Toggle option selection
const toggleOption = (optionId: string) => {
    const index = selectedOptions.value.indexOf(optionId)
    if (index > -1) {
        selectedOptions.value.splice(index, 1)
    } else {
        selectedOptions.value.push(optionId)
    }
}

// Passenger controls
const increasePassengers = () => {
    if (numberOfPassengers.value < 20) {
        numberOfPassengers.value++
    }
}

const decreasePassengers = () => {
    if (numberOfPassengers.value > 1) {
        numberOfPassengers.value--
    }
}

// Handle next
const handleNext = () => {
    bookingStore.setService(
        'paragliding-standard',
        'Dù lượn Sapa',
        basePrice
    )
    bookingStore.setNumberOfPassengers(numberOfPassengers.value)
    bookingStore.setSelectedOptions(selectedOptions.value)
    bookingStore.setServiceQuantities(serviceQuantities.value)
    bookingStore.nextStep()
}

// Increase/decrease service quantity
const increaseServiceQuantity = (serviceId: string) => {
    if (!serviceQuantities.value[serviceId]) {
        serviceQuantities.value[serviceId] = 1
    }
    if (serviceQuantities.value[serviceId] < numberOfPassengers.value) {
        serviceQuantities.value[serviceId]++
    }
}

const decreaseServiceQuantity = (serviceId: string) => {
    if (!serviceQuantities.value[serviceId]) {
        serviceQuantities.value[serviceId] = 1
    }
    if (serviceQuantities.value[serviceId] > 1) {
        serviceQuantities.value[serviceId]--
    }
}
</script>
