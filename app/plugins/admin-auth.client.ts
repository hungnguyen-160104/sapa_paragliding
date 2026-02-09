import { useAdminAuthStore } from '~/stores/adminAuth'

export default defineNuxtPlugin(() => {
  const router = useRouter()
  
  router.beforeEach((to) => {
    // Only run on client
    if (typeof window === 'undefined') return
    
    // Skip non-admin routes
    if (!to.path.includes('/admin')) return
    
    const authStore = useAdminAuthStore()
    authStore.hydrate()
    
    const hasToken = authStore.isAuthenticated || !!localStorage.getItem('adminToken')
    
    // Get locale from path
    const parts = to.path.split('/')
    const locales = ['en', 'fr', 'ru', 'vi']
    const locale = parts[1] && locales.includes(parts[1]) ? parts[1] : 'vi'
    const prefix = `/${locale}`
    
    // If on login page and has token, redirect to dashboard
    if (to.path.includes('/admin/login')) {
      if (hasToken) {
        return `${prefix}/admin/dashboard`
      }
      return // Allow access to login page
    }
    
    // If not on login page and no token, redirect to login
    if (!hasToken) {
      return `${prefix}/admin/login`
    }
  })
})
