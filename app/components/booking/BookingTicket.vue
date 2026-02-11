<template>
    <div class="space-y-3">
        <!-- Ticket Preview: Compact -->
        <div ref="ticketRef"
            class="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg shadow-lg overflow-hidden border border-red-200">
            <!-- Ticket Header: Compact -->
            <div class="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-3">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <img src="/images/Sapa_logo.png" alt="Sapa Paragliding Logo"
                            class="w-10 h-10 object-contain bg-white rounded p-1" />
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

                <!-- Company Info: Inline -->
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

            <!-- Ticket Body: Compact Grid -->
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
                                <span class="font-semibold text-gray-900 text-xs">{{
                                    formatDate(bookingData.preferredDate) }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500 text-xs">{{ $t('booking.step5Details.time') }}</span>
                                <span class="font-semibold text-gray-900 text-xs">{{ bookingData.preferredTime ||
                                    $t('booking.step4Details.flexible') }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500 text-xs">{{ $t('booking.step5Details.passengers') }}</span>
                                <span class="font-semibold text-gray-900 text-xs">{{ bookingData.numberOfPassengers
                                }}</span>
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
                                <p class="text-[10px] text-gray-400 uppercase">{{ $t('booking.step2Details.contactName')
                                }}</p>
                                <p class="font-semibold text-gray-900 text-xs break-words">{{ bookingData.contactName }}
                                </p>
                            </div>
                            <div>
                                <p class="text-[10px] text-gray-400 uppercase">{{ $t('booking.step2Details.email') }}
                                </p>
                                <p class="font-mono text-xs text-gray-900 break-all">{{ bookingData.email }}</p>
                            </div>
                            <div>
                                <p class="text-[10px] text-gray-400 uppercase">{{ $t('booking.step2Details.phone') }}
                                </p>
                                <p class="font-mono text-xs text-gray-900">{{ bookingData.phone }}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Passengers List: Inline -->
                <div v-if="bookingData.passengers.length > 0" class="bg-white rounded p-3 border border-gray-100">
                    <div class="flex items-center justify-between mb-2">
                        <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wide">
                            {{ $t('booking.ticket.passengersList') }}
                        </h3>
                        <span class="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 font-bold">
                            {{ bookingData.passengers.length }}
                        </span>
                    </div>
                    <div class="flex flex-wrap gap-1.5">
                        <div v-for="(passenger, idx) in bookingData.passengers" :key="idx"
                            class="bg-gray-50 rounded px-2 py-1 text-xs border border-gray-200">
                            <span class="font-bold text-gray-500">{{ idx + 1 }}.</span>
                            <span class="text-gray-900 ml-1">{{ passenger.fullName }}</span>
                        </div>
                    </div>
                </div>

                <!-- Pricing: Compact Bar -->
                <div class="bg-gray-900 text-white rounded p-3 flex items-center justify-between">
                    <div class="flex flex-wrap items-center gap-4 text-xs">
                        <div>
                            <span class="text-gray-400">{{ $t('booking.step1Details.flightPrice') }}:</span>
                            <span class="ml-1">{{ formatPrice(bookingData.servicePrice) }} × {{
                                bookingData.numberOfPassengers }}</span>
                        </div>
                        <div v-if="bookingData.discount > 0" class="text-red-400">
                            <span>{{ $t('booking.step1Details.discount') }}:</span>
                            <span class="ml-1">-{{ formatPrice(bookingData.discount *
                                bookingData.numberOfPassengers) }}</span>
                        </div>
                        <div v-if="optionalServicesTotal > 0" class="text-green-400">
                            <span>{{ $t('booking.step1Details.optionalServicesTotal') }}:</span>
                            <span class="ml-1">+{{ formatPrice(optionalServicesTotal) }}</span>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-[10px] text-gray-400 uppercase">{{ $t('booking.step5Details.total') }}</p>
                        <p class="text-lg font-bold text-white">{{ formatPrice(bookingData.totalPrice) }}</p>
                    </div>
                </div>

                <!-- Footer: Inline -->
                <div class="text-center text-[10px] text-gray-500 pt-2 border-t border-gray-200">
                    <span>{{ $t('booking.ticket.validationDate') }}: {{ formatDate(new Date().toISOString()) }}</span>
                    <span class="mx-2">•</span>
                    <span>{{ $t('booking.ticket.footer') }}</span>
                </div>
            </div>
        </div>

        <!-- Download Buttons: Compact -->
        <div class="flex gap-2">
            <button @click="downloadTicketPDF"
                class="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ $t('booking.ticket.downloadPDF') }}
            </button>
            <button @click="downloadTicketImage"
                class="flex-1 btn-secondary py-2 text-sm flex items-center justify-center gap-1.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {{ $t('booking.ticket.downloadImage') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'

const bookingStore = useBookingStore()
const bookingData = computed(() => bookingStore.bookingData)
const optionalServicesTotal = computed(() => bookingStore.optionalServicesTotal)
const ticketRef = ref<HTMLElement | null>(null)

const companyName = 'SAPA PARAGLIDING'
const companyInfo = 'Experience the dream of flying'

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
        link.download = `booking-ticket-${bookingData.value.bookingId || 'draft'}.png`
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
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        })

        const imgWidth = 210 // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        pdf.save(`booking-ticket-${bookingData.value.bookingId || 'draft'}.pdf`)
    } catch (error) {
        console.error('Error generating PDF:', error)
        alert('Failed to download ticket PDF')
    }
}
</script>
