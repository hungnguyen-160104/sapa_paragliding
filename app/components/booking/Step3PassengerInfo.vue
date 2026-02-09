<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('booking.step3') }}</h2>
        <p class="text-sm text-gray-600">{{ $t('booking.passengerInfo') }}</p>
      </div>
      <!-- Safety Info Tooltip -->
      <div class="relative group">
        <button type="button" class="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clip-rule="evenodd" />
          </svg>
        </button>
        <div
          class="absolute right-0 top-full mt-2 w-64 p-3 bg-blue-50 border border-blue-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
          <p class="text-xs font-semibold text-blue-800 mb-1">{{ $t('booking.step3Details.safetyRequirements') }}</p>
          <ul class="text-xs text-blue-700 space-y-1">
            <li>• {{ $t('booking.step3Details.minAge') }}</li>
            <li>• {{ $t('booking.step3Details.goodHealth') }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Notice -->
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center text-sm">
      <svg class="w-4 h-4 text-yellow-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd" />
      </svg>
      <span class="text-yellow-800">{{ $t('booking.step3Details.personalInfoNotice') }}</span>
    </div>

    <!-- Passenger Forms -->
    <div class="space-y-4">
      <div v-for="(passenger, index) in passengers" :key="index"
        class="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <!-- Passenger Header -->
        <div class="px-4 py-3 bg-gray-50 flex items-center justify-between">
          <h3 class="font-semibold text-gray-900">
            {{ $t('booking.step3Details.passenger') }} {{ index + 1 }}
          </h3>
          <div class="flex items-center gap-2">
            <button v-if="index === 0" type="button" @click="fillContactInfo(index)"
              class="text-xs px-2 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700 transition-colors">
              {{ $t('booking.step3Details.fillContactInfo') || 'Auto-fill' }}
            </button>
            <button v-if="passengers.length > 2" type="button" @click="togglePassenger(index)"
              class="p-1 text-gray-500 hover:text-gray-700 transition-colors">
              <svg :class="['w-4 h-4 transition-transform', expandedPassengers.includes(index) ? 'rotate-180' : '']"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Passenger Fields - Better 2-Column Layout -->
        <div v-if="passengers.length <= 2 || expandedPassengers.includes(index)" class="p-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Row 1: Full Name (full width) -->
            <div class="md:col-span-2">
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.fullName') }} *</label>
              <input v-model="passenger.fullName" type="text" required class="input-field text-sm py-2"
                :placeholder="$t('booking.fields.fullName')" />
            </div>

            <!-- Row 2: DOB + Gender -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.dateOfBirth') }}
                *</label>
              <DateInput v-model="passenger.dateOfBirth" :max="maxDate" required class="text-sm" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.gender') }} *</label>
              <select v-model="passenger.gender" required class="input-field text-sm py-2">
                <option value="">{{ $t('booking.step3Details.selectGender') }}</option>
                <option value="male">{{ $t('booking.fields.male') }}</option>
                <option value="female">{{ $t('booking.fields.female') }}</option>
              </select>
            </div>

            <!-- Row 3: Nationality + Passport/ID -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.nationality') }}
                *</label>
              <input v-model="passenger.nationality" type="text" required class="input-field text-sm py-2"
                placeholder="Vietnam" />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.passportOrId') }}
                *</label>
              <input v-model="passenger.passportOrId" type="text" required class="input-field text-sm py-2"
                :placeholder="$t('booking.fields.passportOrIdPlaceholder')" />
            </div>

            <!-- Row 4: Weight (half width) -->
            <div>
              <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.weight') }} (kg)
                *</label>
              <input v-model.number="passenger.weight" type="number" required class="input-field text-sm py-2"
                placeholder="70" />
            </div>
          </div>
        </div>

        <!-- Collapsed Preview -->
        <div v-else class="px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
          <span class="font-medium text-gray-700">{{ passenger.fullName || '(Chưa điền)' }}</span>
          <span class="text-gray-400">•</span>
          <span>{{ passenger.nationality || '...' }}</span>
          <span v-if="passenger.weight" class="text-gray-400">• {{ passenger.weight }}kg</span>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between pt-2">
      <button type="button" @click="handleBack" class="btn-secondary">
        {{ $t('buttons.back') }}
      </button>
      <button type="button" @click="handleNext" :disabled="!isFormValid"
        class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
        {{ $t('buttons.next') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
import type { PassengerInfo } from '~/stores/booking'

const bookingStore = useBookingStore()

// Track which passengers are expanded (for accordion behavior when >2 passengers)
const expandedPassengers = ref<number[]>([0, 1])

// Initialize passengers array based on number of passengers
const passengers = ref<PassengerInfo[]>(
  bookingStore.bookingData.passengers.length > 0
    ? [...bookingStore.bookingData.passengers]
    : Array(bookingStore.bookingData.numberOfPassengers).fill(null).map(() => ({
      fullName: '',
      dateOfBirth: '',
      gender: '',
      nationality: '',
      weight: 0,
      passportOrId: ''
    }))
)

// Max date is today (no future birth dates)
const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Toggle passenger accordion
const togglePassenger = (index: number) => {
  const idx = expandedPassengers.value.indexOf(index)
  if (idx > -1) {
    expandedPassengers.value.splice(idx, 1)
  } else {
    expandedPassengers.value.push(index)
  }
}

// Validate all passenger forms
const isFormValid = computed(() => {
  return passengers.value.every(p =>
    p.fullName.trim() !== '' &&
    p.dateOfBirth !== '' &&
    p.gender !== '' &&
    p.nationality.trim() !== '' &&
    p.passportOrId.trim() !== '' &&
    p.weight <= 100
  )
})

const handleNext = () => {
  if (isFormValid.value) {
    bookingStore.setAllPassengers(passengers.value)
    bookingStore.nextStep()
  }
}

const handleBack = () => {
  bookingStore.previousStep()
}

// Fill contact info from Step 2 into first passenger
const fillContactInfo = (index: number) => {
  if (index !== 0) return
  const contactInfo = bookingStore.bookingData
  passengers.value[0] = {
    fullName: contactInfo.contactName || '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    weight: 0,
    passportOrId: ''
  }
}
</script>
