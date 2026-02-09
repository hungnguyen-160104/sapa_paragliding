<template>
  <div class="min-h-screen bg-gradient-to-b from-slate-50 to-white relative">
    <!-- Page Background Image (fixed, covers entire page) -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <img src="/images/pilot_background.jpeg" alt="Background" class="w-full h-full object-cover" />
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
              {{ currentLocale === 'vi' ? 'Đội ngũ chuyên nghiệp' : 'Professional Team' }}
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
              <p class="text-4xl font-black text-red-400">10+</p>
              <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">
                {{ currentLocale === 'vi' ? 'Phi công' : 'Pilots' }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-4xl font-black text-red-400">15K+</p>
              <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">
                {{ currentLocale === 'vi' ? 'Chuyến bay' : 'Flights' }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-4xl font-black text-red-400">100%</p>
              <p class="text-sm text-slate-400 uppercase tracking-wider mt-1">
                {{ currentLocale === 'vi' ? 'An toàn' : 'Safety' }}
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
                {{ currentLocale === 'vi' ? 'Gặp gỡ đội ngũ' : 'Meet The Team' }}
              </h2>
              <p class="text-slate-500">{{ totalPilots }} {{ currentLocale === 'vi' ? 'phi công chuyên nghiệp' :
                'professional pilots' }}</p>
            </div>
          </div>
        </div>

        <!-- Pilots Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <PilotCard v-for="pilot in totalPilots" :key="pilot" :pilotId="pilot" />
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16 lg:py-24 bg-gradient-to-r from-red-600 to-orange-600 relative z-10">
      <div class="container mx-auto px-6 lg:px-12 text-center">
        <h2 class="text-3xl lg:text-4xl font-black text-white mb-4">
          {{ currentLocale === 'vi' ? 'Sẵn sàng trải nghiệm?' : 'Ready for Your Adventure?' }}
        </h2>
        <p class="text-red-100 text-lg mb-8 max-w-2xl mx-auto">
          {{ currentLocale === 'vi' ?
            'Đặt lịch bay ngay hôm nay và tận hưởng trải nghiệm dù lượn tuyệt vời cùng đội ngũ phi công chuyên nghiệp của chúng tôi' :
          'Book your flight today and enjoy an amazing paragliding experience with our professional pilot team' }}
        </p>
        <button @click="navigateToBooking"
          class="px-10 py-4 bg-white text-red-600 font-bold uppercase tracking-wider hover:bg-slate-100 transition-all duration-300 shadow-lg">
          {{ currentLocale === 'vi' ? 'Đặt lịch ngay' : 'Book Now' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { locale } = useI18n()
const router = useRouter()

const currentLocale = computed(() => locale.value || 'vi')
const totalPilots = 14

const navigateToBooking = () => {
  const path = currentLocale.value === 'vi' ? '/booking' : `/${currentLocale.value}/booking`
  router.push(path)
}

// SEO
useHead({
  title: computed(() => currentLocale.value === 'vi' ? 'Đội ngũ phi công - Dù lượn Sapa' : 'Our Expert Pilots - Sapa Paragliding'),
  meta: [
    { name: 'description', content: 'Meet our professional team of certified paragliding pilots in Sapa' }
  ]
})
</script>
