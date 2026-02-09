import type { NavigationGuard } from 'vue-router'

declare module 'nuxt/app' {
  interface PageMeta {
    layout?: string | false
    middleware?: string | NavigationGuard | Array<string | NavigationGuard>
  }
}
