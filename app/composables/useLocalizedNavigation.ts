export const useLocalizedNavigation = () => {
  const router = useRouter()
  const { locale } = useI18n()

  const localizedNavigateTo = (path: string) => {
    const currentLocale = locale.value || 'vi'
    const fullPath = currentLocale === 'vi' ? path : `/${currentLocale}${path}`
    
    // Use nextTick to ensure navigation happens after event handler completes
    // This prevents DOM errors when components are being unmounted during navigation
    nextTick(() => {
      router.push(fullPath)
    })
  }

  return {
    localizedNavigateTo
  }
}
