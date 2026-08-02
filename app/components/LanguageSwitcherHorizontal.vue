<template>
  <div class="language-switcher-horizontal">
    <!-- 6 nút ngôn ngữ chiếm 266px ở cỡ cũ, quá rộng cho header điện thoại.
         Nén lại ở màn hẹp, chỉ nới ra từ xl. flex-wrap là lưới an toàn:
         màn cực hẹp thì xuống hàng thay vì tràn ra ngoài. -->
    <div class="flex flex-wrap justify-end gap-0.5 sm:gap-1 items-center">
      <button
        v-for="localeItem in availableLocales"
        :key="localeItem.code"
        @click="switchLanguage(localeItem.code)"
        :class="[
          'px-1.5 sm:px-2 xl:px-3 py-1 xl:py-1.5 rounded-md text-xs xl:text-sm font-medium transition-all duration-200',
          currentLocale === localeItem.code
            ? 'bg-red-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gray-100'
        ]"
        :title="localeItem.name"
      >
        {{ localeItem.code.toUpperCase() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
type LocaleCode = 'vi' | 'en'

type LocaleItem = {
  code: LocaleCode
  name: string
}

const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const availableLocales = computed<LocaleItem[]>(() => {
  return (locales.value as Array<{ code: string; name?: string }>).map((item) => ({
    code: item.code as LocaleCode,
    name: item.name ?? item.code.toUpperCase()
  }))
})

const currentLocale = computed<LocaleCode>(() => locale.value as LocaleCode)

const switchLanguage = async (code: LocaleCode) => {
  try {
    const path = switchLocalePath(code)

    if (path) {
      await navigateTo(path)
      return
    }

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