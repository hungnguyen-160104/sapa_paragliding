import { useAdminAuthStore } from '~/stores/adminAuth'

function getLocaleFromPath(path: string): string {
  const parts = path.split('/')
  const locales = ['en', 'fr', 'ru', 'vi']
  if (parts[1] && locales.includes(parts[1])) {
    return parts[1]
  }
  return 'vi'
}

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.server) {
    return
  }

  if (!to.path.includes('/admin')) {
    return
  }

  const authStore = useAdminAuthStore()
  authStore.hydrate()

  const hasToken = authStore.isAuthenticated ||
    (typeof window !== 'undefined' && !!localStorage.getItem('adminToken'))

  const locale = getLocaleFromPath(to.path)
  const prefix = `/${locale}`

  if (to.path.includes('/admin/login')) {
    if (hasToken) {
      return navigateTo(`${prefix}/admin/dashboard`)
    }
    return
  }

  if (!hasToken) {
    return navigateTo(`${prefix}/admin/login`)
  }
})
