<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white relative">
    <!-- Page Background Image (fixed, covers entire page) -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <NuxtImg src="/images/pilot_background.jpeg" alt="" width="1920" height="1080" format="webp" class="w-full h-full object-cover" />
    </div>
    <!-- Hero Section -->
    <section class="relative py-24 lg:py-32 overflow-hidden">
      <!-- Blur overlay -->
      <div class="absolute inset-0 bg-slate-900/80 backdrop-blur-md opacity-50"></div>

      <div class="container mx-auto px-6 lg:px-12 relative z-10">
        <div class="max-w-4xl mx-auto text-center">
          <!-- Badge -->
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 mb-8">
            <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
            <span class="text-red-300 text-sm font-medium uppercase tracking-wider">
              {{ $t('pilotPage.professionalTeam') }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            {{ $t('pilots.title') }}
          </h1>

          <!-- Subtitle -->
          <p class="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {{ $t('pilots.subtitle') }}
          </p>

          <!-- Stats Row -->
          <div class="grid grid-cols-3 gap-6 mt-12 max-w-2xl mx-auto">
            <div class="text-center">
              <p class="text-4xl font-black text-red-400">13+</p>
              <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">
                {{ $t('homePage.statsPilots') }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-4xl font-black text-red-400">50K+</p>
              <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">
                {{ $t('homePage.statsFlights') }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-4xl font-black text-red-400">100%</p>
              <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">
                {{ $t('homePage.statsSafety') }}
              </p>
            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- Pilots Grid Section -->
    <section class="py-16 lg:py-24 relative z-10">
      <div class="container mx-auto px-6 lg:px-12">
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl lg:text-3xl font-black text-slate-900">
                {{ $t('pilotPage.meetTheTeam') }}
              </h2>
              <!-- Dấu "+" cho khớp với con số 13+ dùng ở mọi nơi khác trên
                   site: đội bay còn phi công cộng tác không có hồ sơ riêng. -->
              <p class="text-slate-500">{{ totalPilots }}+ {{ $t('pilotPage.professionalPilots') }}</p>
            </div>
          </div>
        </div>

        <!-- Pilots Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PilotCard v-for="pilot in visiblePilotIds" :key="pilot" :pilotId="pilot" />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 lg:py-24 bg-gradient-to-r from-red-600 to-orange-600 relative z-10">
      <div class="container mx-auto px-6 lg:px-12 text-center">
        <h2 class="text-3xl lg:text-4xl font-black text-white mb-4">
          {{ $t('pilotPage.readyToExperience') }}
        </h2>
        <p class="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
          {{ $t('pilotPage.ctaDescription') }}
        </p>
        <NuxtLink :to="localePath('/booking')"
          class="px-10 py-4 bg-white text-red-600 font-bold uppercase tracking-wider hover:bg-slate-100 transition-all duration-300 shadow-lg inline-block">
          {{ $t('pilotPage.bookNow') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { buildBreadcrumbJsonLD, buildHreflangLinks, buildLocalizedUrl, getCanonicalUrl, getDefaultOgImage, getOgLocale } from '~/utils/seo'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

const currentLocale = computed(() => locale.value || 'vi')

/**
 * Phi công đã nghỉ, không hiển thị nữa.
 * pilot8 = Tuấn Nguyễn (Nhị ca) — đã chuyển sang công ty khác.
 * Giữ dữ liệu trong i18n và ảnh trong public/ để không phá link cũ nếu ai
 * đã lưu; chỉ bỏ khỏi danh sách.
 */
const HIDDEN_PILOT_IDS = [8]

const visiblePilotIds = Array.from({ length: 14 }, (_, index) => index + 1).filter(
  (id) => !HIDDEN_PILOT_IDS.includes(id)
)

const totalPilots = visiblePilotIds.length

// SEO Meta Tags by Locale
const getPilotsSeoMeta = () => {
  const localeMetaMap: Record<string, any> = {
    vi: {
      title: 'Phi Công Dù Lượn Sa Pa: 13+ Phi Công Chứng Chỉ Quốc Tế',
      description: 'Gặp gỡ đội ngũ phi công được cấp chứng chỉ quốc tế của chúng tôi. 13+ phi công chuyên nghiệp với nhiều năm kinh nghiệm bay an toàn.'
    },
    en: {
      title: 'Sapa Paragliding Pilots: 13+ Certified Tandem Pilots',
      description: 'Meet our professional team of certified paragliding pilots in Sapa. 13+ experienced pilots ready to guide your adventure.'
    },
    fr: {
      title: 'Pilotes de Parapente à Sapa : 13+ Pilotes Tandem Certifiés',
      description: 'Rencontrez notre équipe professionnelle de pilotes de parachutisme certifiés à Sapa.'
    },
    ru: {
      title: 'Пилоты парапланов в Сапе: 13+ сертифицированных пилотов',
      description: 'Встречайте нашу профессиональную команду сертифицированных пилотов параплана в Сапе.'
    },
    zh: {
      title: '沙坝滑翔伞飞行员：13+名国际认证双人飞行员 | Sapa Paragliding',
      description: '见面我们在沙坝认证滑翔伞飞行员的专业团队。'
    },
    hi: {
      title: 'सापा पैराग्लाइडिंग पायलट: 13+ प्रमाणित टैंडम पायलट',
      description: 'सापा में हमारी पेशेवर प्रमाणित पैराग्लाइडिंग पायलटों की टीम से मिलें।'
    }
  }
  return localeMetaMap[locale.value] || localeMetaMap.en
}

const seoData = computed(() => getPilotsSeoMeta())
const canonicalUrl = computed(() => getCanonicalUrl(route, currentLocale.value))
const hreflangLinks = computed(() => buildHreflangLinks('/pilots', currentLocale.value))

const ogImage = getDefaultOgImage()

// Trang duy nhat con thieu JSON-LD — cac trang khac deu co BreadcrumbList.
const breadcrumbJsonLd = computed(() =>
  buildBreadcrumbJsonLD([
    { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
    { name: t('menu.pilots'), item: canonicalUrl.value }
  ])
)

useHead(() => ({
  title: seoData.value.title,
  meta: [
    { name: 'description', content: seoData.value.description },
    { property: 'og:title', content: seoData.value.title },
    { property: 'og:description', content: seoData.value.description },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: getOgLocale(currentLocale.value) },
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
      innerHTML: JSON.stringify(breadcrumbJsonLd.value)
    }
  ]
}))

</script>
