<template>
  <div class="language-switcher-horizontal">
    <div class="flex gap-1 items-center">
      <button v-for="locale in availableLocales" :key="locale.code" @click="switchLanguage(locale.code)" :class="[
        'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
        currentLocale === locale.code
          ? 'bg-red-600 text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100'
      ]" :title="locale.name">
        {{ locale.code.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const router = useRouter()

const availableLocales = computed(() => locales.value)
const currentLocale = computed(() => locale.value)

const switchLanguage = async (code: string) => {
  try {
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
.language-switcher-horizontal {
  display: flex;
  align-items: center;
}
</style>
