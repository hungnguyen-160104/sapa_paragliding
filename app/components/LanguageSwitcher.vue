<template>
  <div class="language-switcher-container relative" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
    <div
      class="bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
      <div class="flex flex-col gap-2">
        <!-- Current Language (Always Visible) -->
        <button class="p-2 rounded-full bg-red-500 shadow-md scale-110 ring-1 ring-red-300 transition-all duration-200"
          :title="currentLocaleName">
          <component :is="getFlagSvg(currentLocale)" class="w-6 h-6" />
        </button>

        <!-- Dropdown Other Languages (Slide Down on Hover) -->
        <Transition name="slide-down">
          <div v-if="isOpen" class="flex flex-col gap-2">
            <button v-for="locale in otherLocales" :key="locale.code" @click="switchLanguage(locale.code)"
              class="p-2 rounded-full transition-all duration-200 hover:scale-110 opacity-60 hover:opacity-100"
              :title="locale.name">
              <component :is="getFlagSvg(locale.code)" class="w-6 h-6" />
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'

const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

// Reactive state for dropdown
const isOpen = ref(false)

const availableLocales = computed(() => locales.value)
const currentLocale = computed(() => locale.value)

// Get current locale name
const currentLocaleName = computed(() => {
  const current = availableLocales.value.find(l => l.code === currentLocale.value)
  return current?.name || ''
})

// Get other locales (excluding current) - for dropdown
const otherLocales = computed(() => {
  return availableLocales.value.filter(l => l.code !== currentLocale.value)
})

// SVG flag components
const getFlagSvg = (code: string) => {
  const flags: Record<string, any> = {
    vi: () => h('svg', { viewBox: '0 0 30 20', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { width: '30', height: '20', fill: '#DA251D' }),
      h('polygon', {
        points: '15,4 16.5,9.5 22,9.5 17.5,13 19,18.5 15,15 11,18.5 12.5,13 8,9.5 13.5,9.5',
        fill: '#FFFF00'
      })
    ]),
    en: () => h('svg', { viewBox: '0 0 60 30', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { width: '60', height: '30', fill: '#012169' }),
      h('path', { d: 'M0,0 L60,30 M60,0 L0,30', stroke: '#FFF', 'stroke-width': '6' }),
      h('path', { d: 'M0,0 L60,30 M60,0 L0,30', stroke: '#C8102E', 'stroke-width': '4' }),
      h('path', { d: 'M30,0 L30,30 M0,15 L60,15', stroke: '#FFF', 'stroke-width': '10' }),
      h('path', { d: 'M30,0 L30,30 M0,15 L60,15', stroke: '#C8102E', 'stroke-width': '6' })
    ]),
    fr: () => h('svg', { viewBox: '0 0 30 20', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { width: '10', height: '20', fill: '#002395' }),
      h('rect', { x: '10', width: '10', height: '20', fill: '#FFFFFF' }),
      h('rect', { x: '20', width: '10', height: '20', fill: '#ED2939' })
    ]),
    ru: () => h('svg', { viewBox: '0 0 30 20', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { width: '30', height: '6.67', fill: '#FFFFFF' }),
      h('rect', { y: '6.67', width: '30', height: '6.67', fill: '#0039A6' }),
      h('rect', { y: '13.33', width: '30', height: '6.67', fill: '#D52B1E' })
    ]),
    zh: () => h('svg', { viewBox: '0 0 30 20', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { width: '30', height: '20', fill: '#DE2910' }),
      h('polygon', {
        points: '5,3 6,5.5 8.5,5.5 6.5,7 7.5,9.5 5,8 2.5,9.5 3.5,7 1.5,5.5 4,5.5',
        fill: '#FFDE00'
      }),
      h('polygon', {
        points: '10,1.5 10.3,2.2 11,2.2 10.5,2.7 10.8,3.4 10,3 9.2,3.4 9.5,2.7 9,2.2 9.7,2.2',
        fill: '#FFDE00'
      }),
      h('polygon', {
        points: '12,3 12.3,3.7 13,3.7 12.5,4.2 12.8,4.9 12,4.5 11.2,4.9 11.5,4.2 11,3.7 11.7,3.7',
        fill: '#FFDE00'
      }),
      h('polygon', {
        points: '12,6 12.3,6.7 13,6.7 12.5,7.2 12.8,7.9 12,7.5 11.2,7.9 11.5,7.2 11,6.7 11.7,6.7',
        fill: '#FFDE00'
      }),
      h('polygon', {
        points: '10,8.5 10.3,9.2 11,9.2 10.5,9.7 10.8,10.4 10,10 9.2,10.4 9.5,9.7 9,9.2 9.7,9.2',
        fill: '#FFDE00'
      })
    ])
  }

  return flags[code] || (() => h('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, [
    h('circle', { cx: '12', cy: '12', r: '10', fill: '#4A5568' }),
    h('text', { x: '12', y: '16', 'text-anchor': 'middle', fill: '#FFF', 'font-size': '12' }, '🌐')
  ]))
}

const switchLanguage = async (code: string) => {
  try {
    // Close dropdown
    isOpen.value = false

    // Get the path for the new locale
    const path = switchLocalePath(code)

    // Navigate to the new locale path
    await navigateTo(path)

    // Set the locale
    await setLocale(code)
  } catch (error) {
    console.error('Error switching language:', error)
  }
}
</script>

<style scoped>
/* Slide down animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
