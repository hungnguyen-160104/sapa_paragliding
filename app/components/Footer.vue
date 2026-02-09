<template>
  <footer class="bg-gray-900 text-white py-12 relative z-10">
    <div class="container-custom">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Contact Information -->
        <div>
          <h3 class="text-xl font-bold mb-4">{{ $t('footer.contact') }}</h3>
          <div class="space-y-3">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <p class="text-sm text-gray-400">{{ $t('footer.email') }}</p>
                <a href="mailto:sapa.paragliding@gmail.com" class="hover:text-red-400 transition-colors">
                  sapa.paragliding@gmail.com
                </a>
              </div>
            </div>

            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div class="space-y-3">
                <p class="text-sm text-gray-400">
                  {{ contactData.title }}
                </p>

                <ul class="space-y-2 text-sm text-gray-700">
                  <li v-for="(item, index) in contactData.list" :key="index">
                    <span class="font-semibold">{{ item.name }}</span>
                    – {{ item.role }}:
                    <a :href="`tel:${item.phone.replace(/\s+/g, '')}`"
                      class="text-red-600 hover:text-red-500 transition-colors">
                      {{ item.phone }}
                    </a>
                    <span v-if="item.note" class="text-gray-500">
                      {{ item.note }}
                    </span>
                  </li>
                </ul>
              </div>

            </div>

            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p class="text-sm text-gray-400">{{ $t('footer.address') }}</p>
                <p>Sapa, Lao Cai, Vietnam</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h3 class="text-xl font-bold mb-4">{{ $t('footer.quickLinks') }}</h3>
          <ul class="space-y-2">
            <li v-for="item in menuItems" :key="item.path">
              <button @click="localizedNavigateTo(item.path)"
                class="hover:text-red-400 transition-colors inline-block cursor-pointer bg-none border-none p-0 text-left">
                {{ $t(item.label) }}
              </button>
            </li>
          </ul>
        </div>

        <!-- Social Media & Newsletter -->
        <div class="relative">
          <h3 class="text-xl font-bold mb-4">{{ $t('footer.followUs') }}</h3>
          <div class="flex flex-wrap gap-3 mb-6 max-w-[200px]">
            <!-- YouTube -->
            <a href="https://www.youtube.com/@sapa.paragliding" target="_blank" rel="noopener noreferrer"
              class="bg-gray-800 hover:bg-red-600 w-11 h-11 rounded-full transition-colors flex items-center justify-center"
              aria-label="YouTube">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>

            <!-- WhatsApp -->
            <a href="https://wa.me/84386887489" target="_blank" rel="noopener noreferrer"
              class="bg-gray-800 hover:bg-red-500 w-11 h-11 rounded-full transition-colors flex items-center justify-center"
              aria-label="WhatsApp">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </a>

            <!-- Zalo -->
            <a href="https://zalo.me/84386887489" target="_blank" rel="noopener noreferrer"
              class="bg-gray-800 hover:bg-blue-500 w-11 h-11 rounded-full transition-colors flex items-center justify-center"
              aria-label="Zalo">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 50 50">
                <path fill="white"
                  d="M 9 4 C 6.2504839 4 4 6.2504839 4 9 L 4 41 C 4 43.749516 6.2504839 46 9 46 L 41 46 C 43.749516 46 46 43.749516 46 41 L 46 9 C 46 6.2504839 43.749516 4 41 4 L 9 4 z M 9 6 L 15.580078 6 C 12.00899 9.7156859 10 14.518083 10 19.5 C 10 24.66 12.110156 29.599844 15.910156 33.339844 C 16.030156 33.549844 16.129922 34.579531 15.669922 35.769531 C 15.379922 36.519531 14.799687 37.499141 13.679688 37.869141 C 13.249688 38.009141 12.97 38.430859 13 38.880859 C 13.03 39.330859 13.360781 39.710781 13.800781 39.800781 C 16.670781 40.370781 18.529297 39.510078 20.029297 38.830078 C 21.379297 38.210078 22.270625 37.789609 23.640625 38.349609 C 26.440625 39.439609 29.42 40 32.5 40 C 36.593685 40 40.531459 39.000731 44 37.113281 L 44 41 C 44 42.668484 42.668484 44 41 44 L 9 44 C 7.3315161 44 6 42.668484 6 41 L 6 9 C 6 7.3315161 7.3315161 6 9 6 z M 33 15 C 33.55 15 34 15.45 34 16 L 34 25 C 34 25.55 33.55 26 33 26 C 32.45 26 32 25.55 32 25 L 32 16 C 32 15.45 32.45 15 33 15 z M 18 16 L 23 16 C 23.36 16 23.700859 16.199531 23.880859 16.519531 C 24.050859 16.829531 24.039609 17.219297 23.849609 17.529297 L 19.800781 24 L 23 24 C 23.55 24 24 24.45 24 25 C 24 25.55 23.55 26 23 26 L 18 26 C 17.64 26 17.299141 25.800469 17.119141 25.480469 C 16.949141 25.170469 16.960391 24.780703 17.150391 24.470703 L 21.199219 18 L 18 18 C 17.45 18 17 17.55 17 17 C 17 16.45 17.45 16 18 16 z M 27.5 19 C 28.11 19 28.679453 19.169219 29.189453 19.449219 C 29.369453 19.189219 29.65 19 30 19 C 30.55 19 31 19.45 31 20 L 31 25 C 31 25.55 30.55 26 30 26 C 29.65 26 29.369453 25.810781 29.189453 25.550781 C 28.679453 25.830781 28.11 26 27.5 26 C 25.57 26 24 24.43 24 22.5 C 24 20.57 25.57 19 27.5 19 z M 38.5 19 C 40.43 19 42 20.57 42 22.5 C 42 24.43 40.43 26 38.5 26 C 36.57 26 35 24.43 35 22.5 C 35 20.57 36.57 19 38.5 19 z M 27.5 21 C 27.39625 21 27.29502 21.011309 27.197266 21.03125 C 27.001758 21.071133 26.819727 21.148164 26.660156 21.255859 C 26.500586 21.363555 26.363555 21.500586 26.255859 21.660156 C 26.148164 21.819727 26.071133 22.001758 26.03125 22.197266 C 26.011309 22.29502 26 22.39625 26 22.5 C 26 22.60375 26.011309 22.70498 26.03125 22.802734 C 26.051191 22.900488 26.079297 22.994219 26.117188 23.083984 C 26.155078 23.17375 26.202012 23.260059 26.255859 23.339844 C 26.309707 23.419629 26.371641 23.492734 26.439453 23.560547 C 26.507266 23.628359 26.580371 23.690293 26.660156 23.744141 C 26.819727 23.851836 27.001758 23.928867 27.197266 23.96875 C 27.29502 23.988691 27.39625 24 27.5 24 C 27.60375 24 27.70498 23.988691 27.802734 23.96875 C 28.487012 23.82916 29 23.22625 29 22.5 C 29 21.67 28.33 21 27.5 21 z M 38.5 21 C 38.39625 21 38.29502 21.011309 38.197266 21.03125 C 38.099512 21.051191 38.005781 21.079297 37.916016 21.117188 C 37.82625 21.155078 37.739941 21.202012 37.660156 21.255859 C 37.580371 21.309707 37.507266 21.371641 37.439453 21.439453 C 37.303828 21.575078 37.192969 21.736484 37.117188 21.916016 C 37.079297 22.005781 37.051191 22.099512 37.03125 22.197266 C 37.011309 22.29502 37 22.39625 37 22.5 C 37 22.60375 37.011309 22.70498 37.03125 22.802734 C 37.051191 22.900488 37.079297 22.994219 37.117188 23.083984 C 37.155078 23.17375 37.202012 23.260059 37.255859 23.339844 C 37.309707 23.419629 37.371641 23.492734 37.439453 23.560547 C 37.507266 23.628359 37.580371 23.690293 37.660156 23.744141 C 37.739941 23.797988 37.82625 23.844922 37.916016 23.882812 C 38.005781 23.920703 38.099512 23.948809 38.197266 23.96875 C 38.29502 23.988691 38.39625 24 38.5 24 C 38.60375 24 38.70498 23.988691 38.802734 23.96875 C 39.487012 23.82916 40 23.22625 40 22.5 C 40 21.67 39.33 21 38.5 21 z" />
              </svg>
            </a>

            <!-- TikTok -->
            <a href="https://www.tiktok.com/@sapa_paragliding" target="_blank" rel="noopener noreferrer"
              class="bg-gray-800 hover:bg-pink-600 w-11 h-11 rounded-full transition-colors flex items-center justify-center"
              aria-label="TikTok">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
              </svg>
            </a>

            <!-- Facebook -->
            <a href="https://www.facebook.com/bayduluonsapa/" target="_blank" rel="noopener noreferrer"
              class="bg-gray-800 hover:bg-blue-600 w-11 h-11 rounded-full transition-colors flex items-center justify-center"
              aria-label="Facebook">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            <!-- Instagram -->
            <a href="https://www.instagram.com/SAPA_PARAGLIDING" target="_blank" rel="noopener noreferrer"
              class="bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 w-11 h-11 rounded-full transition-colors flex items-center justify-center"
              aria-label="Instagram">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>

          <p class="text-sm text-gray-400 leading-relaxed mb-6">
            {{ $t('hero.subtitle') }}
          </p>

          <!-- Logo - Absolute positioned, hidden on mobile -->
          <img src="/images/Sapa_logo.png" alt="Sapa Paragliding Logo"
            class="hidden md:block absolute w-32 h-32 object-contain opacity-60 pointer-events-none"
            style="right: 0; top: 0;" />
        </div>
      </div>

      <!-- Copyright -->
      <div class="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
        <p class="whitespace-pre-line">{{ $t('footer.copyright') }}</p>
        <button @click="localizedNavigateTo('/admin/login')"
          class="mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors">
          Admin
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const router = useRouter()

const isDesktop = ref(false)

const menuItems = [
  { path: '/', label: 'menu.home' },
  { path: '/booking', label: 'menu.booking' },
  { path: '/pilots', label: 'menu.pilots' },
  { path: '/posts', label: 'menu.posts' },
  { path: '/pre-notice', label: 'menu.preNotice' },
  { path: '/about', label: 'menu.about' }
]

const contactData = computed(() => {
  const currentLocale = locale.value || 'vi' // mặc định là vi

  if (currentLocale === 'vi') {
    return {
      title: 'Hotline / WhatsApp / Zalo (Hỗ trợ 24/7)',
      list: [
        {
          name: 'Ms. Judy',
          role: 'Nhân viên Chăm sóc Khách hàng',
          phone: '+84 386 887 489',
          note: '(Đặt bay)'
        },
        {
          name: 'Ms. Linh Lee',
          role: 'Nhân viên Chăm sóc Khách hàng',
          phone: '+84 776 499 562',
          note: '(Đặt bay)'
        },
        {
          name: 'Mr. Mỹ',
          role: 'Phi công trưởng',
          phone: '+84 964 073 555'
        },
        {
          name: 'Mr. Trường',
          role: 'Điều phối bay',
          phone: '+84 336 233 789'
        }
      ]
    }
  }

  return {
    title: 'Hotline / WhatsApp / Zalo (Available 24/7)',
    list: [
      {
        name: 'Ms. Judy',
        role: 'Customer Service',
        phone: '+84 386 887 489',
        note: '(Paragliding bookings)'
      },
      {
        name: 'Ms. Linh Lee',
        role: 'Customer Service',
        phone: '+84 776 499 562',
        note: '(Paragliding bookings)'
      },
      {
        name: 'Mr. My',
        role: 'Chief Pilot',
        phone: '+84 964 073 555'
      },
      {
        name: 'Mr. Truong',
        role: 'Flight Coordinator',
        phone: '+84 336 233 789'
      }
    ]
  }
})

const localizedNavigateTo = (path: string) => {
  const currentLocale = locale.value || 'vi' // mặc định là vi
  // Nếu ngôn ngữ là vi thì không thêm prefix
  const fullPath = currentLocale === 'vi' ? path : `/${currentLocale}${path}`

  // Use nextTick to ensure navigation happens after event handler completes
  // This prevents DOM errors when component is being unmounted
  nextTick(() => {
    router.push(fullPath)
  })
}

// Detect screen size
const checkScreenSize = () => {
  isDesktop.value = window.innerWidth >= 768 // md breakpoint
}

onMounted(() => {
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkScreenSize)
})
</script>
