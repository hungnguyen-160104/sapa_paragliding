<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import servicesData from '~/data/services.json'
import galleryData from '~/data/gallery.json'
import { usePostsStore } from '~/stores/posts'

const { locale, t } = useI18n()
const router = useRouter()
const postsStore = usePostsStore()

const currentLocale = computed(() => locale.value || 'vi')
const dbPosts = ref<any[]>([])
const currentPostIndex = ref(0)

const basicItemKeys = ['flight', 'photoVideo', 'insurance', 'drinks', 'certificate']
const standardItemKeys = ['flight', 'photoVideo', 'insurance', 'certificate', 'drinks', 'hotelTransfer']
const premiumItemKeys = ['flight', 'photoVideo', 'insurance', 'certificate', 'hotelTransfer', 'drone', 'drinks', 'camera360']

const latestPosts = computed(() => {
  const posts = dbPosts.value.length > 0 ? dbPosts.value : postsStore.latestPosts
  return posts
    .filter(p => p.published || p.status === 'PUBLISHED')
    .sort((a, b) => new Date(b.date || b.updatedAt).getTime() - new Date(a.date || a.updatedAt).getTime())
    .slice(0, 6)
})

const fetchPostsFromDB = async () => {
  try {
    const response = await $fetch<any>('/api/admin/posts')
    if (response?.success && response?.posts) {
      dbPosts.value = response.posts
    }
  } catch (error) {
    console.error('Error fetching posts from database:', error)
  }
}

const localizedNavigateTo = (path: string) => {
  const currentLocale = locale.value || 'vi'
  const fullPath = currentLocale === 'vi' ? path : `/${currentLocale}${path}`
  router.push(fullPath)
}

const nextPost = () => {
  const maxIndex = Math.ceil(latestPosts.value.length / 3) - 1
  if (currentPostIndex.value < maxIndex) {
    currentPostIndex.value++
  }
}

const previousPost = () => {
  if (currentPostIndex.value > 0) {
    currentPostIndex.value--
  }
}

const gallery = ref(galleryData)

// Locale suffix mapping for gallery items
const localeSuffixMap: Record<string, string> = {
  vi: 'Vi',
  en: 'En',
  fr: 'Fr',
  ru: 'Ru'
}

const getGalleryTitle = (item: any) => {
  const suffix = localeSuffixMap[currentLocale.value] || 'En'
  return item[`title${suffix}`] || item.titleEn
}

const getGalleryDescription = (item: any) => {
  const suffix = localeSuffixMap[currentLocale.value] || 'En'
  return item[`description${suffix}`] || item.descriptionEn
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/800x600?text=Sapa+Paragliding'
}

const formatPostDate = (date: string) => {
  return new Date(date).toLocaleDateString(currentLocale.value === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const navigateToPost = (id: string) => {
  localizedNavigateTo(`/posts/${id}`)
}

const scrollToAbout = () => {
  const aboutSection = document.querySelector('#about')
  if (aboutSection) {
    aboutSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// Fetch posts and setup scroll reveal animation
onMounted(() => {
  fetchPostsFromDB()

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.getAttribute('data-delay') || '0'
        setTimeout(() => {
          entry.target.classList.add('revealed')
        }, parseInt(delay))
        observer.unobserve(entry.target)
      }
    })
  }, observerOptions)

  const elements = document.querySelectorAll('.scroll-reveal')
  elements.forEach(el => observer.observe(el))
})

// SEO
useHead({
  title: 'Sapa Paragliding',
  meta: [
    { name: 'description', content: 'Experience the dream of flying in Sapa - Book your paragliding adventure today' }
  ]
})
</script>

<template>
  <div class="min-h-screen">

    <section class="relative min-h-screen flex items-center justify-center overflow-hidden py-16 md:py-14">
      <div class="absolute inset-0">
        <video poster="/images/pilot_background.jpeg" autoplay muted loop playsinline preload="metadata"
          class="w-full h-full object-cover">
          <source src="/videos/header/header_720p_new.mp4" type="video/mp4">
        </video>
        <div class="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/70"></div>
      </div> 




      <!-- Hero Content -->
      <div class="relative z-10 text-center text-white px-6 w-full max-w-5xl mx-auto">
        <!-- Badge -->
        <div
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 mb-6 animate-fade-in">
          <div class="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          <span class="text-red-300 text-sm font-medium uppercase tracking-wider">
            {{ currentLocale === 'vi' ? 'Trải nghiệm dù lượn tuyệt vời' : 'Amazing Paragliding Experience' }}
          </span>
        </div>

        <!-- Main Title -->
        <h1
          class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-5 animate-fade-in uppercase tracking-wider">
          {{ $t('hero.title') }}
        </h1>

        <!-- Subtitle -->
        <p class="text-base md:text-lg mb-8 text-slate-200 max-w-4xl mx-auto leading-relaxed animate-fade-in-delay">
          {{ $t('hero.subtitle') }}
        </p>


        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-delay-2">
          <button @click="localizedNavigateTo('/booking')"
            class="px-8 py-3 bg-red-500 text-white font-bold uppercase tracking-wider hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/30">
            {{ $t('hero.bookNow') }}
          </button>
          <button @click="scrollToAbout"
            class="px-8 py-3 border-2 border-white/40 text-white font-bold uppercase tracking-wider hover:bg-white/10 transition-all duration-300">
            {{ $t('buttons.learnMore') }}
          </button>
        </div>

        <!-- Stats Row -->
        <div class="grid grid-cols-3 gap-6 mt-8 max-w-2xl mx-auto animate-fade-in-delay-2">
          <div class="text-center">
            <p class="text-3xl font-black text-red-400">10+</p>
            <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">{{ currentLocale === 'vi' ? 'Phi công' :
              'Pilots' }}</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-black text-red-400">15K+</p>
            <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">{{ currentLocale === 'vi' ? 'Chuyến bay' :
              'Flights' }}</p>
          </div>
          <div class="text-center">
            <p class="text-3xl font-black text-red-400">100%</p>
            <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">{{ currentLocale === 'vi' ? 'An toàn' :
              'Safety' }}</p>
          </div>
        </div>
      </div>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce text-white/60">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>

    <!-- Gallery Section -->
    <section id="about" class="py-12 lg:py-16 bg-gradient-to-b from-slate-50 to-white">
      <div class="container mx-auto px-6 lg:px-10">
        <!-- Section Header -->
        <div class="flex items-center gap-4 mb-6 scroll-reveal">
          <div class="w-12 h-12 flex items-center justify-center">
            <img src="/images/Sapa_logo.png" class="w-full h-full object-contain" alt="Sapa Logo">
          </div>
          <div>
            <h2 class="text-2xl lg:text-3xl font-black text-slate-900">
              {{ $t('gallery.title') }}
            </h2>
            <p class="text-slate-500">{{ $t('gallery.subtitle') }}</p>
          </div>
        </div>

        <!-- Gallery Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="(item, index) in gallery" :key="item.id"
            class="relative group overflow-hidden cursor-pointer aspect-square scroll-reveal"
            :data-delay="(index % 4) * 50">
            <img :src="`${item.image}`" :alt="getGalleryTitle(item)"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy"
              @error="handleImageError" />
            <!-- Overlay -->
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 class="font-bold text-lg">{{ getGalleryTitle(item) }}</h3>
                <p class="text-sm text-slate-300">{{ getGalleryDescription(item) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="py-12 lg:py-16 bg-slate-900 relative overflow-hidden ">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-5">
        <div class="absolute inset-0"
          style="background-image: url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E');">
        </div>
      </div>

      <div class="container mx-auto px-6 lg:px-10 relative z-10">
        <!-- Section Header -->
        <div class="text-center mb-10 scroll-reveal">
          <div class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 mb-6">
            <span class="text-red-300 text-sm font-medium uppercase tracking-wider">{{ $t('pricing.title') }}</span>
          </div>
          <h2 class="text-3xl lg:text-4xl font-black text-white mb-3">
            {{ currentLocale === 'vi' ? 'Bảng Giá Dịch Vụ' : 'Our Pricing Plans' }}
          </h2>
          <p class="text-lg text-slate-400 max-w-2xl mx-auto">{{ $t('pricing.subtitle') }}</p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">
          <!-- Basic Package -->
          <div class="bg-white border border-slate-200 shadow-xl p-6 scroll-reveal flex flex-col" data-delay="100">
            <div class="mb-4">
              <h3 class="text-xl font-bold text-slate-900 mb-2">{{ $t('pricing.packages.basic.name') }}</h3>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black text-red-600">{{ $t('pricing.packages.basic.price') }}</span>
              </div>
              <p class="text-sm text-slate-500 mt-1">{{ $t('pricing.packages.basic.priceUsd') }}</p>
            </div>

            <div class="border-t border-slate-200 pt-4 mb-4">
              <p class="text-sm font-semibold text-slate-700 mb-2">{{ $t('pricing.packages.basic.duration') }}</p>
              <p class="text-xs text-slate-500">{{ $t('pricing.packages.basic.weatherNote') }}</p>
            </div>

            <div class="flex-grow mb-4">
              <p class="text-sm font-semibold text-slate-700 mb-3">{{ $t('pricing.packages.basic.included') }}</p>
              <ul class="space-y-2">
                <li v-for="key in basicItemKeys" :key="key" class="flex items-start gap-2 text-sm text-slate-600">
                  <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ $t(`pricing.packages.basic.items.${key}`) }}
                </li>
              </ul>
            </div>

            <button @click="localizedNavigateTo('/booking')"
              class="w-full py-3 border-2 border-red-500 text-red-600 font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300">
              {{ $t('buttons.book') }}
            </button>
          </div>

          <!-- Standard Package (Featured) -->
          <div class="bg-red-600 shadow-2xl p-6 scroll-reveal flex flex-col relative" data-delay="200">
            <!-- Popular Badge -->
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span class="px-4 py-2 bg-amber-400 text-slate-900 text-xs font-bold uppercase tracking-wider">
                {{ $t('pricing.packages.standard.badge') }}
              </span>
            </div>

            <div class="mb-4">
              <h3 class="text-xl font-bold text-white mb-2">{{ $t('pricing.packages.standard.name') }}</h3>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black text-white">{{ $t('pricing.packages.standard.price') }}</span>
              </div>
              <p class="text-sm text-red-200 mt-1">{{ $t('pricing.packages.standard.priceUsd') }}</p>
            </div>

            <div class="border-t border-red-500 pt-4 mb-4">
              <p class="text-sm font-semibold text-white mb-2">{{ $t('pricing.packages.standard.duration') }}</p>
              <p class="text-xs text-red-200">{{ $t('pricing.packages.standard.weatherNote') }}</p>
            </div>

            <div class="flex-grow mb-4">
              <p class="text-sm font-semibold text-white mb-3">{{ $t('pricing.packages.standard.included') }}</p>
              <ul class="space-y-2">
                <li v-for="key in standardItemKeys" :key="key" class="flex items-start gap-2 text-sm text-red-100">
                  <svg class="w-5 h-5 text-white flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ $t(`pricing.packages.standard.items.${key}`) }}
                </li>
              </ul>
            </div>

            <button @click="localizedNavigateTo('/booking')"
              class="w-full py-3 bg-white text-red-600 font-bold uppercase tracking-wider hover:bg-slate-100 transition-all duration-300">
              {{ $t('buttons.book') }}
            </button>
          </div>

          <!-- Premium Package -->
          <div class="bg-white border border-slate-200 shadow-xl p-6 scroll-reveal flex flex-col" data-delay="300">
            <div class="mb-4">
              <h3 class="text-xl font-bold text-slate-900 mb-2">{{ $t('pricing.packages.premium.name') }}</h3>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black text-red-600">{{ $t('pricing.packages.premium.price') }}</span>
              </div>
              <p class="text-sm text-slate-500 mt-1">{{ $t('pricing.packages.premium.priceUsd') }}</p>
            </div>

            <div class="border-t border-slate-200 pt-4 mb-4">
              <p class="text-sm font-semibold text-slate-700 mb-2">{{ $t('pricing.packages.premium.duration') }}</p>
              <p class="text-xs text-slate-500">{{ $t('pricing.packages.premium.weatherNote') }}</p>
            </div>

            <div class="flex-grow mb-4">
              <p class="text-sm font-semibold text-slate-700 mb-3">{{ $t('pricing.packages.premium.included') }}</p>
              <ul class="space-y-2">
                <li v-for="key in premiumItemKeys" :key="key" class="flex items-start gap-2 text-sm text-slate-600">
                  <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ $t(`pricing.packages.premium.items.${key}`) }}
                </li>
              </ul>
            </div>

            <button @click="localizedNavigateTo('/booking')"
              class="w-full py-3 border-2 border-red-500 text-red-600 font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300">
              {{ $t('buttons.book') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog Section -->
    <section class="py-12 lg:py-18 bg-gradient-to-b from-slate-50 to-white">
      <div class="container mx-auto px-6 lg:px-12">
        <!-- Section Header -->
        <div class="flex items-center justify-between mb-6 scroll-reveal">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h2 class="text-3xl lg:text-4xl font-black text-slate-900">{{ $t('posts.latestPosts') }}</h2>
              <p class="text-slate-500">{{ $t('posts.latestPostsDescription') }}</p>
            </div>
          </div>
        </div>

        <!-- Posts Grid -->
        <div class="relative">
          <div class="overflow-hidden">
            <div class="flex transition-transform duration-500 ease-out gap-4"
              :style="{ transform: `translateX(-${currentPostIndex * 100}%)` }">
              <div v-for="(post, index) in latestPosts" :key="post.id" class="w-full md:w-1/3 flex-shrink-0">
                <div @click="navigateToPost(post.id)"
                  class="bg-white border border-slate-200 shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group h-full">
                  <!-- Image -->
                  <div class="relative aspect-[16/10] overflow-hidden">
                    <img :src="post.image" :alt="currentLocale === 'vi' ? post.titleVi : post.title"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <!-- Category Badge -->
                    <div class="absolute top-4 right-4">
                      <span class="px-3 py-1.5 text-xs font-bold text-white bg-red-600">
                        {{ post.category }}
                      </span>
                    </div>
                    <!-- New Badge -->
                    <div v-if="index === 0" class="absolute top-4 left-4">
                      <span class="px-3 py-1.5 text-xs font-bold text-white bg-amber-500 animate-pulse">
                        {{ currentLocale === 'vi' ? 'MỚI' : 'NEW' }}
                      </span>
                    </div>
                  </div>

                  <!-- Content -->
                  <div class="p-6">
                    <!-- Date -->
                    <div class="flex items-center text-sm text-slate-500 mb-3">
                      <svg class="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="font-medium">{{ formatPostDate(post.date) }}</span>
                    </div>

                    <!-- Title -->
                    <h3
                      class="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors">
                      {{ currentLocale === 'vi' ? post.titleVi : post.title }}
                    </h3>

                    <!-- Excerpt -->
                    <p class="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {{ currentLocale === 'vi' ? post.excerptVi : post.excerpt }}
                    </p>

                    <!-- Read More -->
                    <div
                      class="flex items-center text-red-600 font-bold text-sm group-hover:text-red-700 transition-colors">
                      {{ $t('posts.readMore') }}
                      <svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div v-if="latestPosts.length > 3" class="flex justify-center items-center gap-4 mt-4">
            <button @click="previousPost"
              class="w-12 h-12 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="currentPostIndex === 0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div class="flex gap-2">
              <button v-for="(_, index) in Math.ceil(latestPosts.length / 3)" :key="index"
                @click="currentPostIndex = index" :class="[
                  'h-2 transition-all duration-300',
                  currentPostIndex === index ? 'w-8 bg-red-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                ]" />
            </div>

            <button @click="nextPost"
              class="w-12 h-12 flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="currentPostIndex >= Math.ceil(latestPosts.length / 3) - 1">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Info Section -->
    <section class="py-10 lg:py-16 bg-gradient-to-br from-slate-100 via-white to-slate-50">
      <div class="container mx-auto px-6 lg:px-12">
        <!-- Section Header -->
        <div class="text-center mb-6 scroll-reveal">
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-400/20 rounded-full mb-4">
            <span class="text-red-500 text-sm font-medium uppercase tracking-wider">
              {{ currentLocale === 'vi' ? 'Liên hệ' : 'Contact' }}
            </span>
          </div>
          <h2 class="text-2xl lg:text-3xl font-black text-slate-900 mb-2">
            {{ currentLocale === 'vi' ? 'Thông Tin Liên Hệ' : 'Contact Information' }}
          </h2>
          <p class="text-slate-500 max-w-xl mx-auto">
            {{ currentLocale === 'vi' ?
              'Kết nối với chúng tôi qua các kênh sau' :
              'Connect with us through these channels' }}
          </p>
        </div>

        <!-- Row 1: Social Media - 5 cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-3">
          <!-- Zalo -->
          <div
            class="contact-card bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 scroll-reveal group"
            data-delay="0">
            <div
              class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M12 0C5.373 0 0 4.925 0 11c0 2.882 1.157 5.527 3.058 7.55C2.725 20.36 1.92 22.09 1.92 22.09s2.63-.78 4.67-2.01C8.35 21.01 10.13 22 12 22c6.627 0 12-4.925 12-11S18.627 0 12 0z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-900 text-center mb-1">Zalo</h3>
            <p class="text-slate-400 text-xs text-center mb-3">{{ currentLocale === 'vi' ?
              'Chat trực tiếp' :
              'Direct chat' }}</p>
            <a href="https://zalo.me/84386887489" target="_blank" rel="noopener noreferrer"
              class="block w-full py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold text-center rounded-lg transition-colors">
              {{ currentLocale === 'vi' ? 'Nhắn tin' : 'Message' }}
            </a>
          </div>

          <!-- Facebook -->
          <div
            class="contact-card bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 scroll-reveal group"
            data-delay="50">
            <div
              class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-900 text-center mb-1">Facebook</h3>
            <p class="text-slate-400 text-xs text-center mb-3">{{ currentLocale === 'vi' ? 'Fanpage chính thức' :
              'Official fanpage' }}</p>
            <a href="https://www.facebook.com/bayduluonsapa/" target="_blank" rel="noopener noreferrer"
              class="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold text-center rounded-lg transition-colors">
              {{ currentLocale === 'vi' ? 'Theo dõi' : 'Follow' }}
            </a>
          </div>

          <!-- TikTok -->
          <div
            class="contact-card bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 scroll-reveal group"
            data-delay="100">
            <div
              class="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-900 text-center mb-1">TikTok</h3>
            <p class="text-slate-400 text-xs text-center mb-3">{{ currentLocale === 'vi' ?
              'Video bay lượn' : 'Flying videos' }}</p>
            <a href="https://www.tiktok.com/@sapa_paragliding" target="_blank" rel="noopener noreferrer"
              class="block w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold text-center rounded-lg transition-colors">
              {{ currentLocale === 'vi' ? 'Theo dõi' : 'Follow' }}
            </a>
          </div>

          <!-- YouTube -->
          <div
            class="contact-card bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 scroll-reveal group"
            data-delay="150">
            <div
              class="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-900 text-center mb-1">YouTube</h3>
            <p class="text-slate-400 text-xs text-center mb-3">{{ currentLocale === 'vi' ?
              'Kênh chính thức' : 'Official channel' }}</p>
            <a href="https://www.youtube.com/@sapa.paragliding" target="_blank" rel="noopener noreferrer"
              class="block w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold text-center rounded-lg transition-colors">
              {{ currentLocale === 'vi' ? 'Đăng ký' : 'Subscribe' }}
            </a>
          </div>

          <!-- Instagram -->
          <div
            class="contact-card bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 scroll-reveal group col-span-2 sm:col-span-1"
            data-delay="200">
            <div
              class="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </div>
            <h3 class="text-sm font-bold text-slate-900 text-center mb-1">Instagram</h3>
            <p class="text-slate-400 text-xs text-center mb-3">{{ currentLocale === 'vi' ?
              'Ảnh đẹp mỗi ngày' : 'Daily photos' }}</p>
            <a href="https://www.instagram.com/SAPA_PARAGLIDING" target="_blank" rel="noopener noreferrer"
              class="block w-full py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 hover:opacity-90 text-white text-xs font-semibold text-center rounded-lg transition-colors">
              {{ currentLocale === 'vi' ? 'Theo dõi' : 'Follow' }}
            </a>
          </div>
        </div>

        <!-- Row 2: Contact Details - 4 cards (larger) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <!-- Hotline -->
          <div
            class="contact-card bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 scroll-reveal"
            data-delay="250">
            <div class="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 text-center mb-3">
              {{ currentLocale === 'vi' ? 'Hotline 24/7' : 'Hotline 24/7' }}
            </h3>
            <div class="space-y-2 text-center">
              <a href="tel:+84386887489" class="block text-slate-600 text-sm hover:text-green-600 transition-colors">
                <span class="font-medium">Ms. Judy:</span> +84 386 887 489
              </a>
              <a href="tel:+84776499562" class="block text-slate-600 text-sm hover:text-green-600 transition-colors">
                <span class="font-medium">Ms. Linh:</span> +84 776 499 562
              </a>
            </div>
          </div>

          <!-- Email -->
          <a href="mailto:sapa.paragliding@gmail.com"
            class="contact-card bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 scroll-reveal"
            data-delay="300">
            <div class="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 text-center mb-3">Email</h3>
            <p class="text-slate-600 text-sm text-center break-all">sapa.paragliding@gmail.com</p>
          </a>

          <!-- Office Address -->
          <div
            class="contact-card bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 scroll-reveal"
            data-delay="350">
            <div class="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 text-center mb-3">
              {{ currentLocale === 'vi' ? 'Địa chỉ' : 'Address' }}
            </h3>
            <p class="text-slate-600 text-sm text-center">Sapa, Lao Cai, Vietnam</p>
          </div>

          <!-- Working Hours -->
          <div
            class="contact-card bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 scroll-reveal"
            data-delay="400">
            <div class="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-base font-bold text-slate-900 text-center mb-3">
              {{ currentLocale === 'vi' ? 'Giờ bay' : 'Flight Hours' }}
            </h3>
            <p class="text-slate-600 text-sm text-center">7:00 AM - 6:00 PM</p>
            <p class="text-slate-400 text-xs text-center mt-1">
              {{ currentLocale === 'vi' ? '(Tùy thời tiết)' : '(Weather dependent)' }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="pt-16 pb-12 bg-gray-50"
      style="background-image: url('/images/svg/hero-shape-short.svg'); background-size: cover; background-position: center; background-repeat: no-repeat;">
      <div class="container mx-auto px-6 lg:px-12 text-center scroll-reveal">
        <h2 class="text-3xl lg:text-4xl font-black text-white mb-5">
          {{ currentLocale === 'vi' ? 'Sẵn Sàng Cho Cuộc Phiêu Lưu?' : 'Ready for Your Adventure?' }}
        </h2>
        <p class="text-lg text-red-100 mb-8 max-w-2xl mx-auto">
          {{ currentLocale === 'vi' ?
            'Đặt lịch bay ngay hôm nay và tạo nên những kỷ niệm đáng nhớ' :
            'Book your paragliding experience today and create memories that will last a lifetime' }}
        </p>
        <button @click="localizedNavigateTo('/booking')"
          class="px-10 py-4 bg-white text-red-600 font-bold uppercase tracking-wider hover:bg-slate-100 transition-all duration-300 shadow-lg">
          {{ $t('hero.bookNow') }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 1s ease-out;
}

.animate-fade-in-delay {
  animation: fade-in 1s ease-out 0.3s both;
}

.animate-fade-in-delay-2 {
  animation: fade-in 1s ease-out 0.6s both;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.scroll-reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
</style>
