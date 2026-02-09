<template>
  <div>
    <!-- Horizontal Header Bar (static, part of page) -->
    <header class="relative bg-white/95 backdrop-blur-md shadow-lg" style="position: relative; z-index: 60;">
      <div class="container-custom flex items-center justify-between py-4">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/images/Sapa_logo.png" alt="Sapa Paragliding Logo" class="h-12 w-12 object-contain"
            @error="handleLogoError" />
          <span class="hidden sm:inline text-stroke-sapa">{{ $t('hero.title')
            }}</span>
        </NuxtLink>

        <!-- Menu Items (Desktop) -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink v-for="item in menuItems" :key="item.path" :to="getLocalizedPath(item.path)"
            class="uppercase text-gray-700 hover:text-red-600 font-medium transition-colors"
            active-class="text-red-600">
            {{ $t(item.label) }}
          </NuxtLink>
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-3">
          <!-- Menu Button (Mobile) -->
          <button @click.stop="toggleMenu"
            class="md:hidden bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg transition-all duration-300"
            aria-label="Toggle menu">
            <svg v-if="!isMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <!-- Language Switcher -->
          <LanguageSwitcherHorizontal />
        </div>
      </div>
    </header>

    <!-- Floating Icons (visible only when scrolled down) -->
    <div v-if="!isAtTop" class="fixed top-0 left-0 right-0 z-50">
      <!-- Logo in top-left corner -->
      <div class="fixed top-2 sm:top-4 left-2 sm:left-4 z-50">
        <NuxtLink to="/"
          class="flex items-center justify-center bg-white/10 backdrop-blur-sm p-2 sm:p-4 rounded-full hover:shadow-xl transition-all duration-300 hover:scale-110">
          <img src="/images/Sapa_logo.png" alt="Sapa Paragliding Logo" class="h-12 sm:h-20 w-12 sm:w-20 object-contain"
            @error="handleLogoError" />
        </NuxtLink>
      </div>

      <!-- Floating Menu Button and Language Switcher (top-right) -->
      <div class="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 flex flex-col items-center gap-2 sm:gap-3">
        <!-- Menu Button -->
        <button @click.stop="toggleMenu"
          class="bg-white hover:bg-gray-100 text-red-600 p-2.5 sm:p-4 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
          aria-label="Toggle menu">
          <svg v-if="!isMenuOpen" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Language Switcher -->
        <LanguageSwitcher />
      </div>
    </div>

    <!-- Overlay (always available, independent of scroll position) -->
    <Transition name="fade">
      <div v-if="isMenuOpen" @click="closeMenu" class="fixed inset-0 bg-black/50 z-[9998]" />
    </Transition>

    <!-- Slide-out Menu (always available, independent of scroll position) -->
    <Transition name="slide">
      <nav v-if="isMenuOpen"
        class="fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-2xl overflow-y-auto z-[9999]">
        <div class="p-4 sm:p-8">
          <!-- Close Button -->
          <div class="flex justify-end mb-4">
            <button @click="closeMenu" class="text-gray-600 hover:text-gray-900 p-2" aria-label="Close menu">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Logo/Title -->
          <div class="mb-6 sm:mb-8">
            <h2 class="text-xl sm:text-2xl font-bold text-red-600">{{ $t('hero.title') }}</h2>
          </div>

          <!-- Menu Items -->
          <ul class="space-y-2 sm:space-y-4 mb-6 sm:mb-8">
            <li v-for="item in menuItems" :key="item.path">
              <NuxtLink :to="getLocalizedPath(item.path)" @click="closeMenu"
                class="uppercase block py-2.5 sm:py-3 px-3 sm:px-4 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-200 font-medium text-sm sm:text-base"
                active-class="bg-red-100 text-red-600">
                {{ $t(item.label) }}
              </NuxtLink>
            </li>
          </ul>

          <!-- Social Links -->
          <div class="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
            <p class="text-xs sm:text-sm text-gray-600 mb-3">{{ $t('footer.followUs') }}</p>
            <div class="flex space-x-4">
              <a href="https://facebook.com/sapaparagliding" target="_blank" rel="noopener noreferrer"
                class="text-gray-600 hover:text-red-600 transition-colors" aria-label="Facebook">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a href="https://instagram.com/sapaparagliding" target="_blank" rel="noopener noreferrer"
                class="text-gray-600 hover:text-red-600 transition-colors" aria-label="Instagram">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://tiktok.com/@sapaparagliding" target="_blank" rel="noopener noreferrer"
                class="text-gray-600 hover:text-red-600 transition-colors" aria-label="TikTok">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </nav>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const localePath = useLocalePath()
const switchLocalePath = useSwitchLocalePath()

const isMenuOpen = ref(false)
const isAtTop = ref(true)

const menuItems = [
  { path: '/', label: 'menu.home' },
  { path: '/booking', label: 'menu.booking' },
  { path: '/pilots', label: 'menu.pilots' },
  { path: '/posts', label: 'menu.posts' },
  { path: '/pre-notice', label: 'menu.preNotice' },
  { path: '/about', label: 'menu.about' }
]

// Get localized path for menu items - use @nuxtjs/i18n composable
const getLocalizedPath = (path: string) => {
  return localePath(path)
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// Handle logo error (fallback to text-only)
const handleLogoError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.style.display = 'none'
}

// Close menu on route change
const route = useRoute()
watch(() => route.path, () => {
  closeMenu()
})

// Detect scroll position
const handleScroll = () => {
  isAtTop.value = window.scrollY < 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
