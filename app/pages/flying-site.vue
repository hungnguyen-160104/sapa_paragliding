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
  getOgLocale
} from '~/utils/seo'

const { locale, t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()

// SEO Meta Tags by Locale
const getFlyingSiteSeoMeta = () => {
  const localeMetaMap: Record<string, any> = {
    vi: {
      title: 'Điểm Bay Dù Lượn Sa Pa: Thung Lũng Mường Hoa & Bản Lao Chải',
      description: 'Khám phá điểm bay dù lượn Sa Pa: điểm cất cánh chuẩn an toàn cao nhất Việt Nam, hạ cánh tại bản Lao Chải giữa thung lũng Mường Hoa. Đẹp nhất mùa lúa chín 9-10 và mùa nước đổ 5-6.'
    },
    en: {
      title: 'Sapa Paragliding Flying Site: Muong Hoa Valley & Lao Chai',
      description: "Discover Sapa's paragliding site: a takeoff built to Vietnam's highest safety standard, landing at Lao Chai village in Muong Hoa Valley. Best seasons: Sep-Oct golden rice and May-Jun."
    },
    fr: {
      title: 'Site de Vol en Parapente à Sapa : Vallée de Muong Hoa',
      description: "Découvrez le site de vol de Sapa : décollage aux normes de sécurité les plus élevées du Vietnam, atterrissage au village de Lao Chai dans la vallée de Muong Hoa. Meilleures saisons : sept.-oct. et mai-juin."
    },
    ru: {
      title: 'Место полётов на параплане в Сапе: долина Мыонг Хоа',
      description: 'Место полётов в Сапе: точка взлёта по высшим стандартам безопасности Вьетнама, посадка в деревне Лао Чай в долине Мыонг Хоа. Лучшие сезоны: сентябрь-октябрь и май-июнь.'
    },
    zh: {
      title: '沙坝滑翔伞飞行点：芒花谷与 Lao Chai 村 | Sapa Paragliding',
      description: '探索沙坝滑翔伞飞行点：按越南最高安全标准建造的起飞点，降落在芒花谷 Lao Chai 村。最佳季节：9-10月金色梯田、5-6月灌水季。'
    },
    hi: {
      title: 'सापा पैराग्लाइडिंग उड़ान स्थल: मुओंग होआ घाटी और Lao Chai',
      description: 'सापा उड़ान स्थल: वियतनाम के उच्चतम सुरक्षा मानक वाला टेकऑफ़, मुओंग होआ घाटी के Lao Chai गाँव में लैंडिंग। सबसे अच्छा समय: सित.-अक्टू. और मई-जून।'
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
</script>
