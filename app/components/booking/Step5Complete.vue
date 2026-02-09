<template>
    <div class="h-full flex flex-col">
        <!-- Success Header: Compact -->
        <div class="flex-shrink-0 text-center py-4 border-b border-gray-200">
            <div class="flex items-center justify-center gap-3 mb-2">
                <div class="w-12 h-12 bg-green-100 border-2 border-green-600 flex items-center justify-center">
                    <svg class="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="text-left">
                    <h2 class="text-xl font-bold text-gray-900">{{ $t('booking.bookingComplete') }}</h2>
                    <p class="text-sm text-gray-600">{{ $t('booking.thankYou') }}</p>
                </div>
            </div>

            <div v-if="bookingData.bookingId"
                class="inline-flex items-center gap-2 bg-gray-100 px-4 py-2 border-l-4 border-red-600">
                <span class="text-xs text-gray-500 uppercase">{{ $t('booking.step5Details.bookingId') }}</span>
                <span class="text-sm font-mono font-bold text-gray-900">{{ bookingData.bookingId }}</span>
            </div>
        </div>

        <!-- Main Content: Scrollable -->
        <div class="flex-1 overflow-y-auto py-4 space-y-4 min-h-0">
            <!-- Booking Ticket -->
            <BookingTicket />

            <!-- Contact Section: Grid with QR codes -->
            <div class="bg-gradient-to-br from-red-50 to-orange-50 p-4 border border-red-200">
                <h3 class="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    {{ $t('booking.contactUs') }}
                </h3>
                <p class="text-xs text-gray-600 mb-4">{{ $t('booking.scanQR') }}</p>

                <div class="grid grid-cols-2 gap-4">
                    <!-- Zalo -->
                    <div class="bg-white p-3 text-center border-t-4 border-blue-500 shadow-sm">
                        <div class="w-24 h-24 mx-auto bg-gray-100 mb-2">
                            <img src="/images/contacts/qr-zl.png" alt="Zalo" class="w-full h-full object-contain">
                        </div>
                        <p class="font-semibold text-gray-900 text-sm">Zalo</p>
                        <a :href="config.public.zaloUrl" target="_blank" rel="noopener noreferrer"
                            class="text-blue-600 hover:underline text-xs font-medium">
                            {{ $t('booking.step5Details.openZalo') }}
                        </a>
                    </div>

                    <!-- WhatsApp -->
                    <div class="bg-white p-3 text-center border-t-4 border-green-500 shadow-sm">
                        <div class="w-24 h-24 mx-auto bg-gray-100 mb-2">
                            <img src="/images/contacts/qr-wa.png" alt="WhatsApp" class="w-full h-full object-contain">
                        </div>
                        <p class="font-semibold text-gray-900 text-sm">WhatsApp</p>
                        <a :href="config.public.whatsappUrl" target="_blank" rel="noopener noreferrer"
                            class="text-green-600 hover:underline text-xs font-medium">
                            {{ $t('booking.step5Details.openWhatsApp') }}
                        </a>
                    </div>
                </div>
            </div>

            <!-- Next Steps: Compact -->
            <div class="bg-white border border-gray-200 p-4">
                <h3 class="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
                    {{ $t('booking.step5Details.whatsNext') }}
                </h3>
                <div class="space-y-2">
                    <div class="flex items-start gap-3">
                        <span
                            class="w-5 h-5 bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                        <p class="text-sm text-gray-700">{{ $t('booking.step5Details.step2') }}</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span
                            class="w-5 h-5 bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                        <p class="text-sm text-gray-700">{{ $t('booking.step5Details.step3') }}</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span
                            class="w-5 h-5 bg-red-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                        <p class="text-sm text-gray-700">{{ $t('booking.step5Details.step4') }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer: Fixed Actions -->
        <div class="flex-shrink-0 pt-4 border-t border-gray-200">
            <div class="flex gap-3">
                <button @click="localizedNavigateTo('/')" class="btn-primary flex-1 text-center">
                    {{ $t('booking.step5Details.backToHome') }}
                </button>
                <button @click="handleNewBooking" class="btn-secondary flex-1">
                    {{ $t('booking.step5Details.makeAnother') }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

const bookingStore = useBookingStore()
const config = useRuntimeConfig()
const router = useRouter()
const { locale } = useI18n()

const bookingData = computed(() => bookingStore.bookingData)

const localizedNavigateTo = (path: string) => {
    const currentLocale = locale.value || 'vi'
    const fullPath = currentLocale === 'vi' ? path : `/${currentLocale}${path}`

    nextTick(() => {
        router.push(fullPath)
    })
}

const handleNewBooking = () => {
    bookingStore.resetBooking()
    localizedNavigateTo('/booking')
}
</script>
