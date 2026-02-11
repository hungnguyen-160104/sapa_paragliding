<template>
    <div class="h-full flex flex-col">
        <!-- Header: Compact -->
        <div class="flex-shrink-0 pb-3 border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">{{ $t('booking.step4') }}</h2>
            <p class="text-sm text-gray-600">{{ $t('booking.confirmDetails') }}</p>
        </div>

        <!-- Main Content: Scrollable -->
        <div class="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
            <!-- Summary Cards Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Service Details Card -->
                <div class="bg-gradient-to-br from-red-50 to-orange-50 p-4 border-l-4 border-red-600">
                    <h3 class="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                        {{ $t('booking.step4Details.serviceDetails') }}
                    </h3>
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p class="text-gray-500 text-xs">{{ $t('booking.step4Details.service') }}</p>
                            <p class="font-semibold text-gray-900">{{ $t('booking.step1Details.serviceName') }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-xs">{{ $t('booking.step4Details.passengers') }}</p>
                            <p class="font-semibold text-gray-900">{{ bookingData.numberOfPassengers }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-xs">{{ $t('booking.step4Details.date') }}</p>
                            <p class="font-semibold text-gray-900">{{ formatDate(bookingData.preferredDate) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-500 text-xs">{{ $t('booking.step4Details.time') }}</p>
                            <p class="font-semibold text-gray-900">
                                {{ bookingData.preferredTime || $t('booking.step4Details.flexible') }}
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Contact Information Card -->
                <div class="bg-white p-4 border border-gray-200">
                    <h3 class="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                        {{ $t('booking.step4Details.contactInformation') }}
                    </h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-500">{{ $t('booking.step4Details.name') }}</span>
                            <span class="font-semibold text-gray-900">{{ bookingData.contactName }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">{{ $t('booking.step4Details.email') }}</span>
                            <span class="font-semibold text-gray-900 truncate ml-2 max-w-[150px]">{{ bookingData.email
                            }}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">{{ $t('booking.step4Details.phone') }}</span>
                            <span class="font-semibold text-gray-900">{{ bookingData.phone }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Passengers Section: Collapsible -->
            <div class="bg-white border border-gray-200">
                <button @click="showPassengers = !showPassengers"
                    class="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                    <div class="flex items-center gap-2">
                        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wide">
                            {{ $t('booking.step4Details.passengerInformation') }}
                        </h3>
                        <span class="bg-red-600 text-white text-xs px-2 py-0.5 font-semibold">{{
                            bookingData.passengers.length }}</span>
                    </div>
                    <svg class="w-5 h-5 text-gray-500 transition-transform duration-200"
                        :class="showPassengers ? 'rotate-180' : ''" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                <Transition name="collapse">
                    <div v-if="showPassengers" class="border-t border-gray-200 max-h-48 overflow-y-auto">
                        <div v-for="(passenger, index) in bookingData.passengers" :key="index"
                            class="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                            <div class="flex items-center gap-3">
                                <div
                                    class="w-7 h-7 bg-red-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                                    {{ index + 1 }}
                                </div>
                                <div class="flex-1 min-w-0">
                                    <p class="font-semibold text-gray-900 text-sm truncate">{{ passenger.fullName }}</p>
                                    <div class="flex items-center gap-3 text-xs text-gray-500">
                                        <span>{{ passenger.nationality }}</span>
                                        <span>•</span>
                                        <span>{{ passenger.weight }}kg</span>
                                        <span>•</span>
                                        <span class="capitalize">{{ passenger.gender }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Transition>
            </div>

            <!-- Special Requests (if any) -->
            <div v-if="bookingData.specialRequests" class="bg-yellow-50 border border-yellow-200 p-3">
                <p class="text-xs text-yellow-800 font-semibold mb-1">{{ $t('booking.step4Details.specialRequests') }}
                </p>
                <p class="text-sm text-yellow-900">{{ bookingData.specialRequests }}</p>
            </div>

            <!-- Price Summary: Compact -->
            <div class="bg-gray-900 text-white p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-gray-400 uppercase tracking-wide">{{
                            $t('booking.step4Details.priceSummary') }}</p>
                        <div class="flex items-baseline gap-2 mt-1">
                            <span class="text-2xl font-bold">{{ formatPrice(bookingData.totalPrice) }}</span>
                            <span v-if="bookingData.discount > 0" class="text-xs text-red-400 line-through">
                                {{ formatPrice(bookingData.servicePrice * bookingData.numberOfPassengers) }}
                            </span>
                        </div>
                    </div>
                    <div v-if="bookingData.discount > 0"
                        class="bg-red-600 text-white px-3 py-1 text-xs font-bold uppercase">
                        -{{ Math.round(bookingData.discount / 10000) }}%
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer: Fixed -->
        <div class="flex-shrink-0 pt-4 border-t border-gray-200 space-y-3">
            <!-- Terms Checkbox -->
            <div class="flex items-start gap-3 bg-red-50 p-3 border border-red-200">
                <input id="terms" v-model="agreedToTerms" type="checkbox"
                    class="w-4 h-4 mt-0.5 text-red-600 border-gray-300 focus:ring-red-500 flex-shrink-0" />
                <label for="terms" class="text-xs text-gray-700 leading-relaxed">
                    {{ $t('booking.terms.agree') }}
                    <a href="/Mien tru trach nhiem bay doi 2025 Sapa.pdf" target="_blank" rel="noopener noreferrer"
                        class="text-red-600 hover:underline font-semibold">{{ $t('booking.terms.termsAndConditions')
                        }}</a>
                    {{ $t('booking.terms.and') }}
                    <a href="/Mien tru trach nhiem bay doi 2025 Sapa.pdf" target="_blank" rel="noopener noreferrer"
                        class="text-red-600 hover:underline font-semibold">{{ $t('booking.terms.privacyPolicy') }}</a>
                </label>
            </div>

            <!-- Turnstile CAPTCHA -->
            <div class="bg-white p-3 border border-gray-200 flex flex-col items-center">
                <p class="text-xs text-gray-600 mb-2">{{ $t('booking.captcha.verify') }}</p>
                <ClientOnly>
                    <TurnstileCaptcha 
                        ref="turnstileRef"
                        @verify="onCaptchaVerify" 
                        @expire="onCaptchaExpire"
                        @error="onCaptchaError"
                    />
                    <template #fallback>
                        <div class="h-16 flex items-center justify-center">
                            <span class="text-gray-400 text-sm">Loading verification...</span>
                        </div>
                    </template>
                </ClientOnly>
                <p v-if="captchaError" class="text-red-500 text-xs mt-2">{{ captchaError }}</p>
            </div>

            <!-- Payment Notice: Inline -->
            <div
                class="flex items-center gap-2 text-xs text-yellow-800 bg-yellow-50 px-3 py-2 border border-yellow-200">
                <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clip-rule="evenodd" />
                </svg>
                <span>{{ $t('booking.step4Details.paymentInfo') }}: {{ $t('booking.step4Details.paymentText') }}</span>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex gap-3">
                <button type="button" @click="handleBack" class="btn-secondary flex-1">
                    {{ $t('buttons.back') }}
                </button>
                <button type="button" @click="handleSubmit" :disabled="!agreedToTerms || !captchaToken || isSubmitting"
                    class="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed">
                    <span v-if="!isSubmitting">{{ $t('buttons.confirm') }}</span>
                    <span v-else class="flex items-center justify-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                            fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        {{ $t('booking.step4Details.processing') }}
                    </span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

const bookingStore = useBookingStore()
const bookingData = computed(() => bookingStore.bookingData)

const agreedToTerms = ref(bookingStore.bookingData.agreedToTerms)
const isSubmitting = ref(false)
const showPassengers = ref(false)

// Turnstile CAPTCHA
const turnstileRef = ref<{ reset: () => void } | null>(null)
const captchaToken = ref<string | null>(null)
const captchaError = ref<string | null>(null)

const onCaptchaVerify = (token: string) => {
    captchaToken.value = token
    captchaError.value = null
}

const onCaptchaExpire = () => {
    captchaToken.value = null
}

const onCaptchaError = (error: string) => {
    captchaToken.value = null
    captchaError.value = 'Captcha verification failed. Please try again.'
}

const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price)
}

const handleBack = () => {
    bookingStore.previousStep()
}

const handleSubmit = async () => {
    if (!agreedToTerms.value) return
    
    // Check if captcha is verified
    if (!captchaToken.value) {
        captchaError.value = 'Please complete the verification.'
        return
    }

    isSubmitting.value = true
    bookingStore.setTermsAgreement(agreedToTerms.value)

    try {
        // Verify captcha token on server
        const verifyResponse = await $fetch('/api/verify-turnstile', {
            method: 'POST',
            body: { token: captchaToken.value }
        })

        if (!verifyResponse.success) {
            captchaError.value = 'Verification failed. Please try again.'
            turnstileRef.value?.reset()
            captchaToken.value = null
            isSubmitting.value = false
            return
        }

        const result = await bookingStore.submitBooking()

        if (result.success) {
            // Move to step 5 (completion)
        } else {
            alert('Booking submission failed. Please try again.')
            turnstileRef.value?.reset()
            captchaToken.value = null
        }
    } catch (error) {
        console.error('Booking error:', error)
        alert('An error occurred. Please try again.')
        turnstileRef.value?.reset()
        captchaToken.value = null
    } finally {
        isSubmitting.value = false
    }
}

watch(agreedToTerms, (newValue) => {
    bookingStore.setTermsAgreement(newValue)
})
</script>

<style scoped>
/* Collapse transition */
.collapse-enter-active,
.collapse-leave-active {
    transition: all 0.25s ease-out;
    overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
    opacity: 0;
    max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
    opacity: 1;
    max-height: 200px;
}
</style>
