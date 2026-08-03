<template>
  <div class="language-switcher-horizontal">
    <!-- flex-nowrap: ép cả 6 nút trên MỘT hàng, không xuống dòng. Trên điện
         thoại nút phải rất gọn (px-1 text-[11px]) vì còn chia chỗ với logo,
         chữ thương hiệu 1 hàng và nút menu. Từ lg nới ra vì có nhiều chỗ hơn. -->
    <div class="flex flex-nowrap justify-end gap-0.5 2xl:gap-1 items-center">
      <button
        v-for="localeItem in availableLocales"
        :key="localeItem.code"
        @click="switchLanguage(localeItem.code)"
        :class="[
          // Điện thoại: nút rất gọn để 6 nút vừa 1 hàng. Từ lg nới lại.
          'shrink-0 px-1 py-1 text-[11px] lg:px-1.5 lg:text-[13px] 2xl:px-2.5 2xl:py-1.5 rounded-md font-medium transition-all duration-200',
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