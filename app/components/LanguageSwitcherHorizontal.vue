<template>
  <div class="language-switcher-horizontal">
    <!-- Điện thoại (<sm): lưới 4 cột, 7 nút thành hai hàng 4 + 3. Một hàng 7
         nút rộng ~154px, ở máy 360px đẩy chữ thương hiệu co còn "SA…"; hai
         hàng chỉ ~88px và vẫn nằm gọn trong header cao 80px.
         Từ sm trở lên: flex-nowrap, tất cả trên MỘT hàng như trước. -->
    <div class="grid grid-cols-4 gap-0.5 sm:flex sm:flex-nowrap sm:justify-end 2xl:gap-1 items-center">
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