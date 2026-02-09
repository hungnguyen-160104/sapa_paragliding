<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="container-custom">
      <div class="max-w-4xl mx-auto">
        <!-- Progress Steps -->
        <div class="mb-8">
          <div class="flex items-start justify-between">
            <div v-for="step in 5" :key="step" class="flex flex-col items-center flex-1">
              <!-- Step Number and Line -->
              <div class="flex items-center w-full">
                <div class="flex-shrink-0">
                  <div :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all',
                    currentStep >= step
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  ]">
                    {{ step }}
                  </div>
                </div>
                <div v-if="step < 6" :class="[
                  'flex-1 h-1 mx-2 transition-all',
                  currentStep > step ? 'bg-red-600' : 'bg-gray-300'
                ]" />
              </div>

              <!-- Step Label -->
              <p :class="[
                'text-xs mt-2 text-center w-full px-1',
                currentStep >= step ? 'text-red-600 font-semibold' : 'text-gray-500'
              ]">
                {{ $t(`booking.step${step}`) }}
              </p>
            </div>
          </div>
        </div>

        <!-- Step Content -->
        <div class="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <Transition name="step" mode="out-in">
            <BookingStep1ServiceSelection v-if="currentStep === 1" key="step1" />
            <BookingStep2ContactInfo v-else-if="currentStep === 2" key="step2" />
            <BookingStep3PassengerInfo v-else-if="currentStep === 3" key="step3" />
            <BookingStep4Confirmation v-else-if="currentStep === 4" key="step4" />
            <BookingStep5Complete v-else-if="currentStep === 5" key="step5" />
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

const bookingStore = useBookingStore()
const currentStep = computed(() => bookingStore.currentStep)

// Reset to step 1 when entering booking page (optional)
onMounted(() => {
  // Uncomment if you want to reset booking on page load
  // bookingStore.resetBooking()
})

// SEO
useHead({
  title: 'Book Your Flight - Sapa Paragliding',
  meta: [
    { name: 'description', content: 'Book your paragliding adventure in Sapa. Easy online booking with instant confirmation.' }
  ]
})
</script>

<style scoped>
/* Step transition effects */
.step-enter-active,
.step-leave-active {
  transition: all 0.3s ease-out;
}

.step-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.step-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
