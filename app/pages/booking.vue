<template>
  <main class="min-h-screen bg-gray-50 py-12">
    <div class="container-custom">
      <div class="max-w-4xl mx-auto">
        <!-- H1 for SEO -->
        <h1 class="text-3xl font-bold text-center text-slate-800 mb-8">{{ $t('menu.booking') }}</h1>

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
  </main>
</template>

<script setup lang="ts">
import { useBookingStore } from '~/stores/booking'
import {
  buildBreadcrumbJsonLD,
  buildHreflangLinks,
  buildLocalizedUrl,
  getCanonicalUrl,
  getDefaultOgImage,
  getOgLocale
} from '~/utils/seo'

const bookingStore = useBookingStore()
const currentStep = computed(() => bookingStore.currentStep)
const { locale, t } = useI18n()
const route = useRoute()

// SEO Meta Tags by Locale
const getBookingSeoMeta = () => {
  const localeMetaMap: Record<string, any> = {
    vi: {
      title: 'Đặt Vé Bay Dù Lượn Sa Pa: Giá Trọn Gói, Xác Nhận Nhanh',
      description: 'Đặt chuyến bay lượn tại Sapa một cách dễ dàng. Thanh toán trực tuyến, xác nhận tức thì. Giá tốt nhất, an toàn 100%.'
    },
    en: {
      title: 'Book Paragliding in Sapa: Best Price, Instant Confirmation',
      description: 'Easy online paragliding booking in Sapa with instant confirmation. Secure payment, best prices, 100% safe.'
    },
    fr: {
      title: 'Réserver un Vol en Parapente à Sapa : Confirmation Immédiate',
      description: 'Réservation facile de parachutisme en ligne à Sapa avec confirmation instantanée. Paiement sécurisé, meilleurs tarifs.'
    },
    ru: {
      title: 'Бронирование полёта на параплане в Сапе: лучшая цена онлайн',
      description: 'Легкое онлайн-бронирование полетов на параплане в Сапе с мгновенным подтверждением. Безопасный платеж, лучшие цены.'
    },
    zh: {
      title: '预订沙坝滑翔伞飞行：最优价格，即时确认 | Sapa Paragliding',
      description: '在沙坝在线预订滑翔伞飞行，即时确认。安全支付，最优惠的价格，100% 安全。'
    },
    hi: {
      title: 'सापा में पैराग्लाइडिंग बुक करें: तुरंत पुष्टि, सर्वोत्तम कीमत',
      description: 'सापा में आसान ऑनलाइन पैराग्लाइडिंग बुकिंग तत्काल पुष्टि के साथ। सुरक्षित भुगतान, सर्वोत्तम कीमतें, 100% सुरक्षा।'
    }
  }
  return localeMetaMap[locale.value] || localeMetaMap.en
}

const seoData = computed(() => getBookingSeoMeta())
const canonicalUrl = computed(() => getCanonicalUrl(route, locale.value))
const hreflangLinks = computed(() => buildHreflangLinks(route.path, locale.value))
const ogImage = getDefaultOgImage()
const breadcrumbJsonLd = computed(() =>
  buildBreadcrumbJsonLD([
    { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
    { name: t('menu.booking'), item: canonicalUrl.value }
  ])
)


// SEO
useHead(() => ({
  title: seoData.value.title,
  meta: [
    { name: 'description', content: seoData.value.description },
    { property: 'og:title', content: seoData.value.title },
    { property: 'og:description', content: seoData.value.description },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: getOgLocale(locale.value) },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: seoData.value.title },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoData.value.title },
    { name: 'twitter:description', content: seoData.value.description },
    { name: 'twitter:image', content: ogImage }
  ],
  link: [
    { rel: 'canonical', href: canonicalUrl.value },
    ...hreflangLinks.value
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify(breadcrumbJsonLd.value)
    }
  ]
}))

// Reset to step 1 when entering booking page (optional)
onMounted(() => {
  // Uncomment if you want to reset booking on page load
  // bookingStore.resetBooking()
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
