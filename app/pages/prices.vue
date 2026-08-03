<template>
  <main class="min-h-screen bg-gray-50">
    <div class="container-custom mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-20">
      <!-- Header -->
      <div class="mb-12 max-w-3xl">
        <h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          {{ $t('pricingPage.title') }}<span class="text-red-600">.</span>
        </h1>
        <p class="mb-4 text-xl font-medium text-gray-700">{{ $t('pricingPage.subtitle') }}</p>
        <p class="text-lg leading-relaxed text-gray-500">{{ $t('pricingPage.intro') }}</p>
      </div>

      <!-- Packages -->
      <section class="mb-14">
        <h2 class="mb-8 text-2xl font-bold text-gray-900 md:text-3xl">{{ $t('pricingPage.packagesTitle') }}</h2>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div
            v-for="pkg in packages"
            :key="pkg.key"
            :class="[
              'relative flex flex-col rounded-2xl border p-6 md:p-8 transition-shadow duration-300 hover:shadow-2xl',
              pkg.card
            ]"
          >
            <span
              v-if="pkg.highlight"
              class="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-red-600 px-4 py-1 text-xs font-bold uppercase tracking-wide text-white"
            >
              {{ $t('pricing.packages.standard.badge') }}
            </span>

            <h3 class="mb-2 text-xl font-bold text-gray-900">{{ $t(`pricing.packages.${pkg.key}.name`) }}</h3>
            <div class="mb-1 text-3xl font-extrabold text-red-600">
              {{ $t(`pricing.packages.${pkg.key}.price`) }}
            </div>
            <div class="mb-6 text-sm font-medium text-gray-500">
              {{ $t(`pricing.packages.${pkg.key}.priceUsd`) }}
            </div>

            <p class="mb-3 text-sm font-semibold text-gray-700">{{ $t(`pricing.packages.${pkg.key}.included`) }}</p>
            <ul class="mb-6 flex-grow space-y-2.5">
              <li v-for="item in pkg.items" :key="item" class="flex items-start gap-2 text-sm text-gray-600">
                <svg class="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ $t(`pricing.packages.${pkg.key}.items.${item}`) }}</span>
              </li>
            </ul>

            <!-- Kèm ?package= để trang đặt vé tự tick sẵn các dịch vụ của gói
                 này, khách không phải chọn lại. Xem PACKAGE_OPTIONS trong
                 components/booking/Step1ServiceSelection.vue -->
            <NuxtLink
              :to="{ path: localePath('/booking'), query: { package: pkg.key } }"
              :class="[
                'mt-auto inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold transition-all duration-300',
                pkg.button
              ]"
            >
              {{ $t('buttons.book') }}
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Notes -->
      <section class="mb-14 max-w-3xl">
        <h2 class="mb-5 text-2xl font-bold text-gray-900">{{ $t('pricingPage.notesTitle') }}</h2>
        <ul class="space-y-3">
          <li v-for="note in noteKeys" :key="note" class="flex items-start gap-3 text-gray-600">
            <svg class="mt-1 h-4 w-4 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ $t(`pricingPage.notes.${note}`) }}</span>
          </li>
        </ul>
      </section>

      <!-- FAQ -->
      <section class="mb-14 max-w-3xl">
        <h2 class="mb-6 text-2xl font-bold text-gray-900">{{ $t('pricingPage.faqTitle') }}</h2>
        <div class="space-y-4">
          <div v-for="faq in faqKeys" :key="faq" class="rounded-2xl border border-gray-200 bg-white p-6">
            <h3 class="mb-2 font-bold text-gray-900">{{ $t(`pricingPage.faq.${faq}.q`) }}</h3>
            <p class="leading-relaxed text-gray-600">{{ $t(`pricingPage.faq.${faq}.a`) }}</p>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          :to="localePath('/booking')"
          class="inline-flex items-center rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:from-red-600 hover:to-red-700 hover:shadow-xl"
        >
          <svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {{ $t('pricingPage.cta') }}
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  buildBreadcrumbJsonLD,
  buildFAQPageJsonLD,
  buildHreflangLinks,
  buildLocalizedUrl,
  getCanonicalUrl,
  getDefaultOgImage,
  getOgLocale
} from '~/utils/seo'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

/**
 * Ba gói phân biệt bằng màu nền và độ đổ bóng tăng dần theo mức cao cấp:
 * xám bạc -> đỏ thương hiệu -> vàng kim, bóng md -> xl -> 2xl.
 *
 * Nền chỉ dùng tông 50-100 nên chữ xám sẵn có vẫn đủ tương phản, không phải
 * đổi màu chữ theo từng thẻ.
 */
const packages = [
  {
    key: 'basic',
    highlight: false,
    card: 'border-slate-200 bg-gradient-to-b from-slate-50 to-slate-200/70 shadow-md',
    button: 'border border-slate-400 text-slate-900 hover:bg-slate-900 hover:text-white',
    items: ['flight', 'photoVideo', 'drinks', 'insurance', 'certificate']
  },
  {
    key: 'standard',
    highlight: true,
    card: 'border-red-400 bg-gradient-to-b from-red-50 to-rose-200/70 shadow-xl',
    button: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:from-red-600 hover:to-red-700',
    items: ['flight', 'photoVideo', 'drinks', 'insurance', 'certificate', 'hotelTransfer']
  },
  {
    key: 'premium',
    highlight: false,
    card: 'border-amber-400 bg-gradient-to-b from-amber-50 to-amber-200/80 shadow-2xl',
    button: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg hover:from-amber-600 hover:to-amber-700',
    items: ['flight', 'photoVideo', 'drinks', 'insurance', 'certificate', 'hotelTransfer', 'drone', 'camera360']
  }
]

const noteKeys = ['deposit', 'payment', 'weather', 'group']
const faqKeys = ['included', 'deposit', 'cancel']

// SEO Meta Tags by Locale
const getPricesSeoMeta = () => {
  const localeMetaMap: Record<string, any> = {
    vi: {
      title: 'Giá Bay Dù Lượn Sa Pa: Trọn Gói Từ 2.090.000đ, Không Đặt Cọc',
      description: 'Bảng giá bay dù lượn Sa Pa mới nhất: 3 gói trọn gói từ 2.090.000đ (82 USD) gồm bảo hiểm, quay GoPro, đồ uống tại điểm bay. Không đặt cọc, hủy do thời tiết hoàn tiền 100%.'
    },
    en: {
      title: 'Sapa Paragliding Prices: All-Inclusive From 2,090,000 VND',
      description: 'Latest Sapa paragliding prices: 3 all-inclusive packages from 2,090,000 VND (82 USD) with insurance, GoPro video and drinks. No deposit, 100% refund on weather cancellation.'
    },
    fr: {
      title: 'Tarifs Parapente à Sapa : Tout Compris Dès 2 090 000 VND',
      description: "Tarifs du parapente à Sapa : 3 forfaits tout compris dès 2 090 000 VND (82 USD) avec assurance, vidéo GoPro et boissons. Sans acompte, remboursement à 100% si annulation météo."
    },
    ru: {
      title: 'Цены на параплан в Сапе: всё включено от 2 090 000 VND',
      description: 'Цены на полёты в Сапе: 3 пакета всё включено от 2 090 000 VND (82 USD) — страховка, GoPro, напитки. Без депозита, 100% возврат при отмене из-за погоды.'
    },
    zh: {
      title: '沙坝滑翔伞价格：全包套餐 2,090,000 越南盾起',
      description: '沙坝滑翔伞最新价格：3 种全包套餐 2,090,000 越南盾（80 美元）起，含保险、GoPro 拍摄和饮品。无需订金，因天气取消全额退款。'
    },
    hi: {
      title: 'सापा पैराग्लाइडिंग कीमतें: 2,090,000 VND से ऑल-इन्क्लूसिव',
      description: 'सापा पैराग्लाइडिंग कीमतें: 2,090,000 VND (82 USD) से 3 ऑल-इन्क्लूसिव पैकेज — बीमा, GoPro वीडियो और पेय शामिल। कोई जमा नहीं, मौसम रद्दीकरण पर 100% रिफंड।'
    }
  }
  return localeMetaMap[locale.value] || localeMetaMap.en
}

const seoData = computed(() => getPricesSeoMeta())
const canonicalUrl = computed(() => getCanonicalUrl(route, locale.value))
const hreflangLinks = computed(() => buildHreflangLinks(route.path, locale.value))
const ogImage = getDefaultOgImage()

const breadcrumbJsonLd = computed(() =>
  buildBreadcrumbJsonLD([
    { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
    { name: t('menu.prices'), item: canonicalUrl.value }
  ])
)

const faqJsonLd = computed(() =>
  buildFAQPageJsonLD(
    faqKeys.map((key) => ({
      question: t(`pricingPage.faq.${key}.q`),
      answer: t(`pricingPage.faq.${key}.a`)
    }))
  )
)

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
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify(faqJsonLd.value)
    }
  ]
}))
</script>
