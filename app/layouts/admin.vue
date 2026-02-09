<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Left: Logo & Title -->
          <div class="flex items-center space-x-4">
            <NuxtLink :to="localePath('/')" class="flex items-center space-x-2 text-gray-600 hover:text-red-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span class="text-sm">Về Trang Chủ</span>
            </NuxtLink>
            <div class="h-6 w-px bg-gray-300"></div>
            <h1 class="text-lg font-bold text-gray-900">Bảng Điều Khiển Admin</h1>
          </div>

          <!-- Right: User & Logout -->
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600">
              Xin chào, <span class="font-medium">{{ authStore.username || 'Admin' }}</span>
            </span>
            <button 
              @click="handleLogout"
              class="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              ĐĂNG XUẤT
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs - Always Visible -->
    <nav class="bg-white border-b border-gray-200">
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex space-x-2 py-3 overflow-x-auto">
          <!-- Bookings -->
          <NuxtLink 
            :to="localePath('/admin/bookings')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border"
            :class="isActive('/admin/bookings') 
              ? 'bg-red-600 text-white border-red-600 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100 border-gray-200'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Đặt Bay
          </NuxtLink>

          <!-- Posts -->
          <NuxtLink 
            :to="localePath('/admin/posts')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border"
            :class="isActive('/admin/posts') 
              ? 'bg-red-600 text-white border-red-600 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100 border-gray-200'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Bài Viết
          </NuxtLink>

          <!-- Statistics -->
          <NuxtLink 
            :to="localePath('/admin/statistics')"
            class="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors border"
            :class="isActive('/admin/statistics') 
              ? 'bg-red-600 text-white border-red-600 shadow-sm' 
              : 'text-gray-600 hover:bg-gray-100 border-gray-200'"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Thống Kê
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="py-6">
      <div class="px-4 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAdminAuthStore } from '~/stores/adminAuth'

const route = useRoute()
const authStore = useAdminAuthStore()

// Dùng useLocalePath từ @nuxtjs/i18n (auto-import)
const localePath = useLocalePath()

const isActive = (path: string) => {
  return route.path.includes(path)
}

const handleLogout = () => {
  authStore.logout()
  navigateTo(localePath('/admin/login'))
}
</script>
