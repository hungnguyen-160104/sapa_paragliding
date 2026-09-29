<template>
  <div class="language-switcher-container relative" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
    <div
      class="bg-white/10 backdrop-blur-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
      <div class="flex flex-col gap-2">
        <!-- Current Language (Always Visible) -->
        <button
          class="p-2 rounded-full bg-red-500 shadow-md scale-110 ring-1 ring-red-300 transition-all duration-200"
          :title="currentLocaleName"
        >
          <component :is="getFlagSvg(currentLocale)" class="w-6 h-6" />
        </button>

        <!-- Dropdown Other Languages (Slide Down on Hover) -->
        <Transition name="slide-down">
          <div v-if="isOpen" class="flex flex-col gap-2">
            <button
              v-for="l in otherLocales"
              :key="l.code"
              @click="onPickLocale(l.code)"
              class="p-2 rounded-full transition-all duration-200 hover:scale-110 opacity-60 hover:opacity-100"
              :title="l.name"
            >
              <component :is="getFlagSvg(l.code)" class="w-6 h-6" />
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed, onMounted, watch } from 'vue'

/** ✅ Khai báo đúng union type locale code để TS không báo lỗi */
const SUPPORTED_LOCALES = ['vi', 'en', 'fr', 'ru', 'zh', 'hi', 'ko', 'de'] as const
type LocaleCode = typeof SUPPORTED_LOCALES[number]

const isLocaleCode = (code: string): code is LocaleCode =>
  (SUPPORTED_LOCALES as readonly string[]).includes(code)

const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// Cookie nuxt-i18n thường dùng để nhớ ngôn ngữ
const langCookie = useCookie<LocaleCode>('i18n_redirected')

// Reactive state for dropdown
const isOpen = ref(false)

/** ✅ Ép locales về dạng object list để dùng thống nhất */
type LocaleItem = { code: string; name?: string }
const availableLocales = computed<LocaleItem[]>(() => locales.value as unknown as LocaleItem[])

/** currentLocale luôn là LocaleCode (fallback về 'vi' nếu lạ) */
const currentLocale = computed<LocaleCode>(() => (isLocaleCode(locale.value) ? locale.value : 'vi'))

// Get current locale name
const currentLocaleName = computed(() => {
  const current = availableLocales.value.find(l => l.code === currentLocale.value)
  return current?.name || currentLocale.value.toUpperCase()
})

// Get other locales (excluding current)
const otherLocales = computed(() => availableLocales.value.filter(l => l.code !== currentLocale.value))

/** ✅ Đồng bộ cookie mỗi khi locale thay đổi */
watch(
  () => currentLocale.value,
  (val) => {
    langCookie.value = val
  },
  { immediate: true }
)

/** ✅ Khi mở trang: nếu cookie có locale khác hiện tại -> điều hướng đúng route */
onMounted(async () => {
  const saved = langCookie.value
  if (saved && saved !== currentLocale.value) {
    const path = switchLocalePath(saved)
    if (path) await navigateTo(path)
  }
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
      })
    ]),
    /** ✅ Hindi = India flag */
    hi: () => h('svg', { viewBox: '0 0 30 20', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { width: '30', height: '6.67', y: '0', fill: '#FF9933' }),
      h('rect', { width: '30', height: '6.67', y: '6.67', fill: '#FFFFFF' }),
      h('rect', { width: '30', height: '6.67', y: '13.33', fill: '#138808' }),
      h('circle', { cx: '15', cy: '10', r: '2.2', fill: 'none', stroke: '#000080', 'stroke-width': '0.6' }),
      h('circle', { cx: '15', cy: '10', r: '0.2', fill: '#000080' })
    ]),
    de: () => h('svg', { viewBox: '0 0 30 20', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { width: '30', height: '6.67', fill: '#000000' }),
      h('rect', { y: '6.67', width: '30', height: '6.67', fill: '#DD0000' }),
      h('rect', { y: '13.33', width: '30', height: '6.67', fill: '#FFCE00' })
    ]),
    /** Cờ Hàn Quốc (giản lược cho cỡ 24px) */
    ko: () => h('svg', { viewBox: '0 0 30 20', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('rect', { width: '30', height: '20', fill: '#FFFFFF' }),
      h('g', { transform: 'rotate(33.7 15 10)' }, [
        h('path', { d: 'M10 10 A5 5 0 0 1 20 10 Z', fill: '#CD2E3A' }),
        h('path', { d: 'M10 10 A5 5 0 0 0 20 10 Z', fill: '#0047A0' }),
        h('circle', { cx: '12.5', cy: '10', r: '2.5', fill: '#CD2E3A' }),
        h('circle', { cx: '17.5', cy: '10', r: '2.5', fill: '#0047A0' })
      ]),
      h('g', { transform: 'rotate(-33.7 6 4)' }, [
        h('rect', { x: '3.5', y: '2.00', width: '5', height: '1', fill: '#000' }),
        h('rect', { x: '3.5', y: '3.50', width: '5', height: '1', fill: '#000' }),
        h('rect', { x: '3.5', y: '5.00', width: '5', height: '1', fill: '#000' })
      ]),
      h('g', { transform: 'rotate(-33.7 24 16)' }, [
        h('rect', { x: '21.5', y: '14.00', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '24.3', y: '14.00', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '21.5', y: '15.50', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '24.3', y: '15.50', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '21.5', y: '17.00', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '24.3', y: '17.00', width: '2.2', height: '1', fill: '#000' })
      ]),
      h('g', { transform: 'rotate(33.7 24 4)' }, [
        h('rect', { x: '21.5', y: '2.00', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '24.3', y: '2.00', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '21.5', y: '3.50', width: '5', height: '1', fill: '#000' }),
        h('rect', { x: '21.5', y: '5.00', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '24.3', y: '5.00', width: '2.2', height: '1', fill: '#000' })
      ]),
      h('g', { transform: 'rotate(33.7 6 16)' }, [
        h('rect', { x: '3.5', y: '14.00', width: '5', height: '1', fill: '#000' }),
        h('rect', { x: '3.5', y: '15.50', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '6.3', y: '15.50', width: '2.2', height: '1', fill: '#000' }),
        h('rect', { x: '3.5', y: '17.00', width: '5', height: '1', fill: '#000' })
      ])
    ])
  }

  return flags[code] || (() =>
    h('svg', { viewBox: '0 0 24 24', xmlns: 'http://www.w3.org/2000/svg' }, [
      h('circle', { cx: '12', cy: '12', r: '10', fill: '#4A5568' }),
      h('text', { x: '12', y: '16', 'text-anchor': 'middle', fill: '#FFF', 'font-size': '12' }, '🌐')
    ])
  )
}

/** ✅ Click handler: ép code về LocaleCode an toàn */
const onPickLocale = (code: string) => {
  if (!isLocaleCode(code)) return
  switchLanguage(code)
}

/** ✅ Chỉ nhận LocaleCode => hết lỗi TS */
const switchLanguage = async (code: LocaleCode) => {
  try {
    isOpen.value = false

    // Lưu cookie để đồng bộ
    langCookie.value = code

    // Nuxt-i18n: chỉ cần navigate sang switchLocalePath là đồng bộ locale
    const path = switchLocalePath(code)
    if (path) await navigateTo(path)

    // (Optional) đảm bảo locale state
    await setLocale(code)
  } catch (error) {
    console.error('Error switching language:', error)
  }
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}
.slide-down-enter-from,
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
