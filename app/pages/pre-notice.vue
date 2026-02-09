<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Video Header Section -->
    <div class="relative h-[400px] md:h-[500px] overflow-hidden">
      <!-- Background Video -->
      <!-- Background Image -->
      <div class="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style="background-image: url('/images/pilot_background.jpeg');"></div>
      <!-- Video asset missing in public/videos/header, keep only the background image to avoid build-time resolution errors. -->
<video autoplay loop muted playsinline class="absolute inset-0 w-full h-full object-contain">
        <source src="/videos/header/about_new.mp4" type="video/mp4">
      </video>
      <!-- Overlay -->
    </div>

    <!-- Main Content with Background -->
    <div class="relative py-8 md:py-12 min-h-[calc(100vh-400px)]">
      <!-- Background Image -->
      <div class="absolute inset-0 bg-cover bg-center bg-fixed"
        style="background-image: url('/images/pilot_background.jpeg');">
        <div class="absolute inset-0 bg-black/50"></div>
      </div>

      <div class="relative z-10 container-custom">
        <div class="max-w-6xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">{{ $t('preNotice.title') }}</h1>
            <p class="text-lg text-white/90 drop-shadow-md">{{ $t('preNotice.subtitle') }}</p>
          </div>

          <!-- Tabs Navigation -->
          <div class="mb-8">
            <div class="grid grid-cols-5 gap-3 md:gap-4 max-w-5xl mx-auto">
              <button v-for="(tab, index) in tabs" :key="tab.key" @click="activeTab = tab.key" :class="[
                'flex flex-col items-center justify-center px-3 py-5 md:px-6 md:py-6 rounded-2xl transition-all duration-300',
                activeTab === tab.key
                  ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-xl shadow-red-500/30 scale-105'
                  : 'bg-white/10 backdrop-blur-sm text-white/60 hover:bg-white/20 hover:text-white/80 border border-white/10'
              ]">
                <component :is="tab.icon"
                  :class="['w-7 h-7 md:w-10 md:h-10 mb-2 md:mb-3', activeTab === tab.key ? 'text-white' : 'text-white/60']" />
                <span class="text-xs md:text-base font-semibold text-center leading-tight">{{
                  $t(`preNotice.tabs.${tab.key}.title`) }}</span>
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div class="glass-card rounded-2xl p-6 md:p-10 max-w-5xl mx-auto">
            <transition name="fade" mode="out-in">
              <div :key="activeTab" class="tab-content">
                <!-- Content Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
                  <div v-for="(item, itemIndex) in getActiveTabContent()" :key="itemIndex"
                    class="flex gap-5 p-5 md:p-6 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors duration-300 items-start">
                    <div
                      class="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-xl flex items-center justify-center">
                      <component :is="item.icon" class="w-6 h-6 md:w-7 md:h-7 text-red-400" />
                    </div>
                    <div class="flex-1">
                      <h3 class="font-bold text-white mb-2 text-base md:text-lg">{{ $t(item.titleKey) }}</h3>
                      <p class="text-white/70 text-sm md:text-base leading-relaxed mb-3">{{ $t(item.descKey) }}</p>
                      
                      <!-- Flight Location Links -->
                      <div v-if="activeTab === 'flyingSpot'" class="mt-3">
                        <a 
                          v-if="item.titleKey.includes('takeoff')"
                          href="https://maps.app.goo.gl/bGtKFTuxyZvJhsJZ9" 
                          target="_blank"
                          class="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-colors text-sm font-medium"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          Xem vị trí cất cánh
                        </a>
                        
                        <a 
                          v-if="item.titleKey.includes('landing')"
                          href="https://maps.app.goo.gl/mYnh4KJVk3aQZLYC6" 
                          target="_blank"
                          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 hover:text-blue-200 rounded-lg transition-colors text-sm font-medium"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          Xem vị trí hạ cánh
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- CTA Button -->
          <div class="text-center mt-6">
            <button @click="localizedNavigateTo('/booking')"
              class="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              {{ $t('buttons.book') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'

const router = useRouter()
const { locale } = useI18n()

const localizedNavigateTo = (path: string) => {
  const currentLocale = locale.value || 'vi'
  const fullPath = currentLocale === 'vi' ? path : `/${currentLocale}${path}`
  router.push(fullPath)
}

// Active tab state
const activeTab = ref('requirements')

// Icon components as render functions
const UserIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' })
])

const TicketIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' })
])

const XCircleIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const CloudIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' })
])

const ShirtIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' })
])

const ClockIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const CarIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7h8m-8 5h8m-4-9l-4 4h8l-4-4zM5 21h14a2 2 0 002-2v-5a2 2 0 00-2-2H5a2 2 0 00-2 2v5a2 2 0 002 2z' })
])

const MapPinIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' }),
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 11a3 3 0 11-6 0 3 3 0 016 0z' })
])

const PlaneIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 19l9 2-9-18-9 18 9-2zm0 0v-8' })
])

const QuestionIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })
])

const CheckIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 13l4 4L19 7' })
])

const WeightIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3' })
])

const HeartIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' })
])

const CalendarIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' })
])

const CreditCardIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' })
])

const PhoneIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' })
])

const RefreshIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' })
])

const SunIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z' })
])

const WindIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M14 5a2 2 0 012 2m0 0a2 2 0 01-2 2H6m10-2a2 2 0 012 2m0 0a2 2 0 01-2 2H4m14-2a2 2 0 012 2v1a2 2 0 01-2 2H8' })
])

const ShoeIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })
])

const EyeIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' }),
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' })
])

const MailIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' })
])

const UsersIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
])

const ParkingIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })
])

const ShieldIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })
])

const RunIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 10V3L4 14h7v7l9-11h-7z' })
])

const BagIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' })
])

const ChatIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' })
])

const LandingIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 14l-7 7m0 0l-7-7m7 7V3' })
])

// Tabs configuration
const tabs = [
  { key: 'requirements', icon: UserIcon },
  { key: 'booking', icon: TicketIcon },
  { key: 'cancellation', icon: XCircleIcon },
  { key: 'weather', icon: CloudIcon },
  { key: 'clothing', icon: ShirtIcon },
  { key: 'schedule', icon: ClockIcon },
  { key: 'transport', icon: CarIcon },
  { key: 'meetingPoint', icon: MapPinIcon },
  { key: 'flyingSpot', icon: PlaneIcon },
  { key: 'faq', icon: QuestionIcon }
]

// Content items for each tab
const tabContents: Record<string, { icon: any; titleKey: string; descKey: string }[]> = {
  requirements: [
    { icon: WeightIcon, titleKey: 'preNotice.tabs.requirements.items.weight.title', descKey: 'preNotice.tabs.requirements.items.weight.desc' },
    { icon: HeartIcon, titleKey: 'preNotice.tabs.requirements.items.health.title', descKey: 'preNotice.tabs.requirements.items.health.desc' },
    { icon: CalendarIcon, titleKey: 'preNotice.tabs.requirements.items.age.title', descKey: 'preNotice.tabs.requirements.items.age.desc' }
  ],
  booking: [
    { icon: PhoneIcon, titleKey: 'preNotice.tabs.booking.items.method.title', descKey: 'preNotice.tabs.booking.items.method.desc' },
    { icon: CreditCardIcon, titleKey: 'preNotice.tabs.booking.items.payment.title', descKey: 'preNotice.tabs.booking.items.payment.desc' },
    { icon: ClockIcon, titleKey: 'preNotice.tabs.booking.items.confirmation.title', descKey: 'preNotice.tabs.booking.items.confirmation.desc' }
  ],
  cancellation: [
    { icon: ShieldIcon, titleKey: 'preNotice.tabs.cancellation.items.byUs.title', descKey: 'preNotice.tabs.cancellation.items.byUs.desc' },
    { icon: XCircleIcon, titleKey: 'preNotice.tabs.cancellation.items.byCustomer.title', descKey: 'preNotice.tabs.cancellation.items.byCustomer.desc' },
    { icon: RefreshIcon, titleKey: 'preNotice.tabs.cancellation.items.reschedule.title', descKey: 'preNotice.tabs.cancellation.items.reschedule.desc' }
  ],
  weather: [
    { icon: WindIcon, titleKey: 'preNotice.tabs.weather.items.condition.title', descKey: 'preNotice.tabs.weather.items.condition.desc' },
    { icon: CloudIcon, titleKey: 'preNotice.tabs.weather.items.cancel.title', descKey: 'preNotice.tabs.weather.items.cancel.desc' }
  ],
  clothing: [
    { icon: ShirtIcon, titleKey: 'preNotice.tabs.clothing.items.clothes.title', descKey: 'preNotice.tabs.clothing.items.clothes.desc' },
    { icon: ShoeIcon, titleKey: 'preNotice.tabs.clothing.items.shoes.title', descKey: 'preNotice.tabs.clothing.items.shoes.desc' },
    { icon: EyeIcon, titleKey: 'preNotice.tabs.clothing.items.glasses.title', descKey: 'preNotice.tabs.clothing.items.glasses.desc' }
  ],
  schedule: [
    { icon: ClockIcon, titleKey: 'preNotice.tabs.schedule.items.duration.title', descKey: 'preNotice.tabs.schedule.items.duration.desc' },
    { icon: MailIcon, titleKey: 'preNotice.tabs.schedule.items.contact.title', descKey: 'preNotice.tabs.schedule.items.contact.desc' },
    { icon: UsersIcon, titleKey: 'preNotice.tabs.schedule.items.spectators.title', descKey: 'preNotice.tabs.schedule.items.spectators.desc' },
    { icon: ParkingIcon, titleKey: 'preNotice.tabs.schedule.items.parking.title', descKey: 'preNotice.tabs.schedule.items.parking.desc' }
  ],
  transport: [
    { icon: CarIcon, titleKey: 'preNotice.tabs.transport.items.shuttle.title', descKey: 'preNotice.tabs.transport.items.shuttle.desc' },
    { icon: UsersIcon, titleKey: 'preNotice.tabs.transport.items.companion.title', descKey: 'preNotice.tabs.transport.items.companion.desc' }
  ],
  meetingPoint: [
    { icon: MapPinIcon, titleKey: 'preNotice.tabs.meetingPoint.items.center.title', descKey: 'preNotice.tabs.meetingPoint.items.center.desc' },
    { icon: MapPinIcon, titleKey: 'preNotice.tabs.meetingPoint.items.hotel.title', descKey: 'preNotice.tabs.meetingPoint.items.hotel.desc' }
  ],
  flyingSpot: [
    { icon: PlaneIcon, titleKey: 'preNotice.tabs.flyingSpot.items.takeoff.title', descKey: 'preNotice.tabs.flyingSpot.items.takeoff.desc' },
    { icon: LandingIcon, titleKey: 'preNotice.tabs.flyingSpot.items.landing.title', descKey: 'preNotice.tabs.flyingSpot.items.landing.desc' }
  ],
  faq: [
    { icon: ChatIcon, titleKey: 'preNotice.tabs.faq.items.meet.title', descKey: 'preNotice.tabs.faq.items.meet.desc' },
    { icon: BagIcon, titleKey: 'preNotice.tabs.faq.items.baggage.title', descKey: 'preNotice.tabs.faq.items.baggage.desc' },
    { icon: RunIcon, titleKey: 'preNotice.tabs.faq.items.takeoff.title', descKey: 'preNotice.tabs.faq.items.takeoff.desc' },
    { icon: ShieldIcon, titleKey: 'preNotice.tabs.faq.items.safety.title', descKey: 'preNotice.tabs.faq.items.safety.desc' }
  ]
}

// Helper functions
const getActiveTabIcon = () => {
  const tab = tabs.find(t => t.key === activeTab.value)
  return tab ? tab.icon : UserIcon
}

const getActiveTabContent = () => {
  return tabContents[activeTab.value] || []
}

// SEO
useHead({
  title: 'Pre-Flight Notice - Sapa Paragliding',
  meta: [
    { name: 'description', content: 'Important information and requirements before your paragliding flight in Sapa' }
  ]
})
</script>

<style scoped>
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>
