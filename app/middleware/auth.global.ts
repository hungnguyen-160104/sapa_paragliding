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
  // Skip on server
  if (import.meta.server) {
    return
  }

  // Only handle admin routes
  if (!to.path.includes('/admin')) {
    return
  }

  const authStore = useAdminAuthStore()
  authStore.hydrate()

  const hasToken = authStore.isAuthenticated ||
    (typeof window !== 'undefined' && !!localStorage.getItem('adminToken'))

  const locale = getLocaleFromPath(to.path)
  const prefix = `/${locale}`

  // If on login page and has token, redirect to dashboard
  if (to.path.includes('/admin/login')) {
    if (hasToken) {
      return navigateTo(`${prefix}/admin/dashboard`)
    }
    return
  }

  // If not authenticated, redirect to login
  if (!hasToken) {
    return navigateTo(`${prefix}/admin/login`)
  }
})
