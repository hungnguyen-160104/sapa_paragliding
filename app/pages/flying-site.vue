<template>
  <main class="min-h-screen bg-gray-50">
    <div class="container-custom mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 md:py-20">
      <!-- Header -->
      <div class="mb-12 max-w-3xl">
        <h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          {{ $t('flyingSite.title') }}
        </h1>
        <p class="mb-4 text-xl font-medium text-gray-700">{{ $t('flyingSite.subtitle') }}</p>
        <p class="text-lg leading-relaxed text-gray-500">{{ $t('flyingSite.intro') }}</p>
      </div>

      <!-- Takeoff / Landing -->
      <div class="mb-12 grid grid-cols-1 gap-8 md:grid-cols-2">
        <section class="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 class="mb-3 text-2xl font-bold text-gray-900">{{ $t('flyingSite.takeoff.title') }}</h2>
          <p class="mb-5 leading-relaxed text-gray-600">{{ $t('flyingSite.takeoff.desc') }}</p>
          <a
            href="https://maps.app.goo.gl/bGtKFTuxyZvJhsJZ9"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ $t('flyingSite.takeoff.mapLabel') }}
          </a>
        </section>

        <section class="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <h2 class="mb-3 text-2xl font-bold text-gray-900">{{ $t('flyingSite.landing.title') }}</h2>
          <p class="mb-5 leading-relaxed text-gray-600">{{ $t('flyingSite.landing.desc') }}</p>
          <a
            href="https://maps.app.goo.gl/mYnh4KJVk3aQZLYC6"
            target="_blank"
            rel="noopener"
            class="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {{ $t('flyingSite.landing.mapLabel') }}
          </a>
        </section>
      </div>

      <!-- Valley / Best time / Getting there -->
      <section class="mb-10 max-w-3xl">
        <h2 class="mb-3 text-2xl font-bold text-gray-900">{{ $t('flyingSite.valley.title') }}</h2>
        <p class="leading-relaxed text-gray-600">{{ $t('flyingSite.valley.desc') }}</p>
      </section>

      <section class="mb-10 max-w-3xl">
        <h2 class="mb-3 text-2xl font-bold text-gray-900">{{ $t('flyingSite.bestTime.title') }}</h2>
        <p class="leading-relaxed text-gray-600">{{ $t('flyingSite.bestTime.desc') }}</p>
      </section>

      <section class="mb-12 max-w-3xl">
        <h2 class="mb-3 text-2xl font-bold text-gray-900">{{ $t('flyingSite.gettingThere.title') }}</h2>
        <p class="leading-relaxed text-gray-600">{{ $t('flyingSite.gettingThere.desc') }}</p>
        <!-- Bản đồ Sa Pa (điểm check-in, cung trek, điểm cất/hạ cánh). Nhãn đặt
             tại chỗ vì trang bản đồ chỉ có nội dung vi/en. -->
        <NuxtLink :to="localePath('/sapa-map')" class="mt-4 inline-flex items-center font-semibold text-red-600 hover:text-red-700">
          {{ locale === 'vi' ? 'Xem bản đồ du lịch Sa Pa: điểm check-in, cung trek và điểm bay' : 'See the Sapa travel map: checkpoints, treks and the flying site' }} →
        </NuxtLink>
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
          {{ $t('flyingSite.cta') }}
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import {
  buildBreadcrumbJsonLD,
  buildHreflangLinks,
  buildLocalizedUrl,
  getCanonicalUrl,
  getDefaultOgImage,
  getOgLocale,
  truncateMetaDescription
} from '~/utils/seo'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// SEO Meta Tags by Locale
const getFlyingSiteSeoMeta = () => {
  const localeMetaMap: Record<string, any> = {
    vi: {
      title: 'Điểm Bay Dù Lượn Sa Pa: Thung Lũng Mường Hoa & Bản Lao Chải',
      description: 'Điểm bay dù lượn Sa Pa: cất cánh chuẩn an toàn cao nhất Việt Nam, hạ cánh bản Lao Chải, thung lũng Mường Hoa. Đẹp nhất: nước đổ 5-6, lúa xanh 7-8, lúa chín 9, mùa thu 10-12.'
    },
    en: {
      title: 'Sapa Paragliding Flying Site: Muong Hoa Valley & Lao Chai',
      description: "Sapa's paragliding site: takeoff built to Vietnam's highest safety standard, landing at Lao Chai in Muong Hoa Valley. Best: May-Jun, Jul-Aug, Sep golden rice, Oct-Dec autumn."
    },
    fr: {
      title: 'Site de Vol en Parapente à Sapa : Vallée de Muong Hoa',
      description: "Site de vol de Sapa : décollage aux normes de sécurité les plus élevées du Vietnam, atterrissage à Lao Chai. Idéal : mai-juin, juil.-août, sept. (riz doré), oct.-déc. (automne)."
    },
    ru: {
      title: 'Место полётов на параплане в Сапе: долина Мыонг Хоа',
      description: 'Место полётов в Сапе: взлёт по высшим стандартам безопасности Вьетнама, посадка в Лао Чай. Лучшее время: май-июнь, июль-август, сентябрь (золотой рис), октябрь-декабрь (осень).'
    },
    zh: {
      title: '沙坝滑翔伞飞行点：芒花谷与 Lao Chai 村 | Sapa Paragliding',
      description: '探索沙坝滑翔伞飞行点：按越南最高安全标准建造的起飞点，降落在芒花谷 Lao Chai 村。最佳：5-6月灌水季、7-8月青稻、9月金色稻田、10-12月秋季。'
    },
    hi: {
      title: 'सापा पैराग्लाइडिंग उड़ान स्थल: मुओंग होआ घाटी और Lao Chai',
      description: 'सापा उड़ान स्थल: वियतनाम के उच्चतम सुरक्षा मानक वाला टेकऑफ़, Lao Chai में लैंडिंग। सबसे अच्छा: मई-जून, जुलाई-अगस्त, सितंबर (सुनहरा धान), अक्टू.-दिस. (शरद)।'
    },
    ko: {
      title: '사파 패러글라이딩 비행장: 므엉호아 계곡과 라오짜이',
      description: '베트남 최고 수준의 안전 기준으로 만든 사파 이륙장과 라오짜이 마을 착륙장. 추천 시기: 5–6월, 7–8월, 9월 황금 들판, 10–12월 가을.'
    },
    de: {
      title: 'Paragliding Sapa: Fluggebiet Muong-Hoa-Tal & Lao Chai',
      description: 'Fluggebiet Sapa: Startplatz nach Vietnams höchstem Sicherheitsstandard, Landung in Lao Chai. Beste Zeit: Mai–Juni, Juli–Aug., Sept. (goldener Reis), Okt.–Dez. (Herbst).'
    }
  }
  return localeMetaMap[locale.value] || localeMetaMap.en
}

const seoData = computed(() => getFlyingSiteSeoMeta())
const canonicalUrl = computed(() => getCanonicalUrl(route, locale.value))
const hreflangLinks = computed(() => buildHreflangLinks(route.path, locale.value))
const ogImage = getDefaultOgImage()

const breadcrumbJsonLd = computed(() =>
  buildBreadcrumbJsonLD([
    { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
    { name: t('menu.flyingSite'), item: canonicalUrl.value }
  ])
)

useHead(() => ({
  title: seoData.value.title,
  meta: [
    { name: 'description', content: truncateMetaDescription(seoData.value.description) },
    { property: 'og:title', content: seoData.value.title },
    { property: 'og:description', content: truncateMetaDescription(seoData.value.description) },
    { property: 'og:url', content: canonicalUrl.value },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: getOgLocale(locale.value) },
    { property: 'og:image', content: ogImage },
    { property: 'og:image:alt', content: seoData.value.title },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seoData.value.title },
    { name: 'twitter:description', content: truncateMetaDescription(seoData.value.description) },
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
