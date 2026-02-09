<template>
  <div class="space-y-5">
    <div>
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('booking.step2') }}</h2>
      <p class="text-sm text-gray-600">{{ $t('booking.contactInfo') }}</p>
    </div>

    <form @submit.prevent="handleNext" class="space-y-4">
      <!-- Row 1: Date, Time, Name -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.date') }} *</label>
          <DateInput v-model="formData.preferredDate" :min="minDate" required class="text-sm" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.time') }}</label>
          <select v-model="formData.preferredTime" class="input-field text-sm py-2">
            <option value="">{{ $t('booking.step2Details.selectTime') }}</option>
            <option v-for="time in timeSlots" :key="time.value" :value="time.value">{{ time.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.fullName') }} *</label>
          <input v-model="formData.contactName" type="text" required class="input-field text-sm py-2"
            :placeholder="$t('booking.fields.fullName')" />
        </div>
      </div>

      <!-- Row 2: Email, Phone -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.email') }} *</label>
          <input v-model="formData.email" type="email" required class="input-field text-sm py-2"
            :placeholder="$t('booking.fields.email')" />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">{{ $t('booking.fields.phone') }} *</label>
          <div class="flex gap-2">
            <select v-model="formData.countryCode" required class="input-field text-sm py-2 w-32 flex-shrink-0">
              <option value="" disabled>🌐</option>
              <option value="+84">🇻🇳 +84</option>
              <option value="+1">🇺🇸 +1</option>
              <option value="+44">🇬🇧 +44</option>
              <option value="+33">🇫🇷 +33</option>
              <option value="+49">🇩🇪 +49</option>
              <option value="+7">🇷🇺 +7</option>
              <option value="+81">🇯🇵 +81</option>
              <option value="+82">🇰🇷 +82</option>
              <option value="+86">🇨🇳 +86</option>
              <option value="+61">🇦🇺 +61</option>
              <option value="+65">🇸🇬 +65</option>
              <option value="+66">🇹🇭 +66</option>
              <option value="+91">🇮🇳 +91</option>
            </select>
            <input v-model="formData.phoneNumber" type="tel" required class="input-field text-sm py-2 flex-1"
              placeholder="123 456 789" />
          </div>
        </div>
      </div>

      <!-- Pickup Location (conditional) -->
      <Transition name="slide-down">
        <div v-if="hasHotelTransfer" class="bg-red-50 border border-red-200 rounded-lg p-3">
          <label class="block text-xs font-medium text-gray-600 mb-1 flex items-center">
            <svg class="w-4 h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {{ $t('booking.step2Details.pickupLocation') }}
          </label>
          <input v-model="formData.pickupLocation" type="text" required class="input-field text-sm py-2"
            :placeholder="$t('booking.step2Details.pickupPlaceholder')" />
        </div>
      </Transition>

      <!-- Collapsible Sections -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Special Requests Accordion -->
        <div class="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button type="button" @click="showRequests = !showRequests"
            class="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
            <span class="text-sm font-medium text-gray-700">{{ $t('booking.fields.specialRequests') }}</span>
            <svg :class="['w-4 h-4 text-gray-500 transition-transform', showRequests ? 'rotate-180' : '']" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="showRequests" class="px-3 pb-3">
            <textarea v-model="formData.specialRequests" rows="2" class="input-field text-sm resize-none"
              :placeholder="$t('booking.fields.specialRequests')" />
          </div>
        </div>

        <!-- Weather Notice Accordion -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg overflow-hidden">
          <button type="button" @click="showNotice = !showNotice"
            class="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-yellow-100 transition-colors">
            <span class="text-sm font-medium text-yellow-800 flex items-center">
              <svg class="w-4 h-4 text-yellow-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
              {{ $t('booking.step2Details.importantNotice') }}
            </span>
            <svg :class="['w-4 h-4 text-yellow-600 transition-transform', showNotice ? 'rotate-180' : '']" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="showNotice" class="px-3 pb-3">
            <ul class="space-y-1 text-xs text-yellow-800">
              <li class="flex items-start">
                <svg class="w-3 h-3 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
                <span>{{ $t('booking.step2Details.weatherNotice.item1') }}</span>
              </li>
              <li class="flex items-start">
                <svg class="w-3 h-3 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
                <span>{{ $t('booking.step2Details.weatherNotice.item2') }}</span>
              </li>
              <li class="flex items-start">
                <svg class="w-3 h-3 text-yellow-600 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd" />
                </svg>
                <span>{{ $t('booking.step2Details.weatherNotice.item3') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex justify-between pt-2">
        <button type="button" @click="handleBack" class="btn-secondary">
          {{ $t('buttons.back') }}
        </button>
        <button type="submit" class="btn-primary">
          {{ $t('buttons.next') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

const bookingStore = useBookingStore()

// UI State
const showRequests = ref(false)
const showNotice = ref(false)

// Time slots
const timeSlots = [
  { value: '06:00', label: '06:00 AM' },
  { value: '07:00', label: '07:00 AM' },
  { value: '08:00', label: '08:00 AM' },
  { value: '09:00', label: '09:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '01:00 PM' },
  { value: '14:00', label: '02:00 PM' },
  { value: '15:00', label: '03:00 PM' },
  { value: '16:00', label: '04:00 PM' },
  { value: '17:00', label: '05:00 PM' },
  { value: '18:00', label: '06:00 PM' }
]

// Parse existing phone number into country code and number
const parsePhoneNumber = (fullPhone: string) => {
  if (!fullPhone) return { countryCode: '', phoneNumber: '' }
  const match = fullPhone.match(/^(\+\d{1,4})\s*(.*)$/)
  if (match && match[1] && match[2] !== undefined) {
    return { countryCode: match[1], phoneNumber: match[2].trim() }
  }
  return { countryCode: '', phoneNumber: fullPhone }
}

const parsedPhone = parsePhoneNumber(bookingStore.bookingData.phone || '')

const formData = reactive({
  contactName: bookingStore.bookingData.contactName || '',
  email: bookingStore.bookingData.email || '',
  countryCode: parsedPhone.countryCode || '',
  phoneNumber: parsedPhone.phoneNumber || '',
  preferredDate: bookingStore.bookingData.preferredDate || '',
  preferredTime: bookingStore.bookingData.preferredTime || '',
  specialRequests: bookingStore.bookingData.specialRequests || '',
  pickupLocation: bookingStore.bookingData.pickupLocation || ''
})

// Check if hotel transfer is selected
const hasHotelTransfer = computed(() => {
  return bookingStore.bookingData.selectedOptions.includes('hotel-transfer')
})

// Set minimum date to today
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate())
  return tomorrow.toISOString().split('T')[0]
})

const handleNext = () => {
  const contactInfo = {
    contactName: formData.contactName,
    email: formData.email,
    phone: `${formData.countryCode} ${formData.phoneNumber}`.trim(),
    preferredDate: formData.preferredDate,
    preferredTime: formData.preferredTime,
    specialRequests: formData.specialRequests
  }
  bookingStore.setContactInfo(contactInfo)
  bookingStore.bookingData.pickupLocation = formData.pickupLocation
  bookingStore.nextStep()
}

const handleBack = () => {
  bookingStore.previousStep()
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
  max-height: 200px;
}
</style>
