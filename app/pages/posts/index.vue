<template>
  <div class="min-h-screen bg-gray-50 font-sans selection:bg-red-100 selection:text-red-900">
    <!-- Main Content -->
    <main class="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">

      <!-- Header Section -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
            {{ $t('posts.latestPosts') }}<span class="text-red-600">.</span>
          </h1>
          <p class="text-lg text-gray-500 leading-relaxed">
            {{ $t('posts.latestPostsDescription') }}
          </p>
        </div>
      </div>

      <!-- Controls & Filters -->
      <div
        class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-12 sticky top-0 md:static z-10 bg-gray-50 md:bg-transparent py-4 md:py-0">
        <!-- Category Tabs -->
        <div class="flex flex-wrap items-center gap-2">
          <button @click="selectedCategory = null" :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border',
            selectedCategory === null
              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          ]">
            {{ currentLocale === 'vi' ? 'Tất cả' : 'All' }}
          </button>

          <button v-for="category in categories" :key="category" @click="selectedCategory = category" :class="[
            'px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border',
            selectedCategory === category
              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          ]">
            {{ category }}
          </button>
        </div>

        <!-- Sort Dropdown -->
        <div class="relative w-full lg:w-auto">
          <select v-model="sortBy"
            class="w-full lg:w-48 appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all cursor-pointer">
            <option value="newest">{{ currentLocale === 'vi' ? 'Mới nhất' : 'Newest' }}</option>
            <option value="oldest">{{ currentLocale === 'vi' ? 'Cũ nhất' : 'Oldest' }}</option>
          </select>
          <div class="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-b-gray-900 mb-4"></div>
        <p class="text-sm font-medium text-gray-500">{{ currentLocale === 'vi' ? 'Đang tải...' : 'Loading...' }}</p>
      </div>

      <!-- Posts Grid -->
      <div v-else-if="filteredPosts.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <article v-for="post in filteredPosts" :key="post.id" @click="navigateToPost(post.id)"
          class="group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-300">

          <!-- Image -->
          <div class="relative aspect-[16/10] overflow-hidden bg-gray-100 border-b border-gray-100">
            <img :src="post.image" :alt="currentLocale === 'vi' ? post.titleVi : post.title"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />

            <!-- Category Badge -->
            <div class="absolute top-4 left-4">
              <span
                class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 backdrop-blur text-gray-900 shadow-sm border border-gray-200/50">
                {{ post.category }}
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="flex flex-col flex-grow p-6">
            <!-- Meta -->
            <div class="flex items-center gap-3 text-xs font-medium text-gray-500 mb-3">
              <time :datetime="post.date">{{ formatDate(post.date) }}</time>
              <span class="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{{ post.author }}</span>
            </div>

            <!-- Title -->
            <h2
              class="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 bg-gradient-to-r from-red-600 to-red-600 group-hover:bg-[length:100%_2px]">
              {{ currentLocale === 'vi' ? post.titleVi : post.title }}
            </h2>

            <!-- Excerpt -->
            <p class="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
              {{ currentLocale === 'vi' ? post.excerptVi : post.excerpt }}
            </p>

            <!-- Footer -->
            <div
              class="flex items-center text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors mt-auto">
              <span>{{ currentLocale === 'vi' ? 'Đọc tiếp' : 'Read article' }}</span>
              <svg class="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none"
                stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </article>
      </div>

      <!-- No Posts Found -->
      <div v-else
        class="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-gray-300">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">
          {{ currentLocale === 'vi' ? 'Không có bài viết' : 'No posts found' }}
        </h3>
        <p class="text-gray-500 max-w-sm mx-auto">
          {{ currentLocale === 'vi'
            ? 'Thử điều chỉnh bộ lọc hoặc quay lại sau để xem các bài viết mới.'
            : 'Try adjusting your search or filters to find what you\'re looking for.' }}
        </p>
        <button @click="selectedCategory = null" v-if="selectedCategory"
          class="mt-6 text-sm font-medium text-red-600 hover:text-red-700">
          {{ currentLocale === 'vi' ? 'Xóa bộ lọc' : 'Clear filters' }}
        </button>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { usePostsStore } from '~/stores/posts'
import type { Post } from '~/stores/posts'

const { locale, t } = useI18n()
const router = useRouter()
const postsStore = usePostsStore()

const currentLocale = computed(() => locale.value || 'vi')
const isLoading = ref(false)
const selectedCategory = ref<string | null>(null)
const sortBy = ref<'newest' | 'oldest'>('newest')

// Fetch posts on mount
onMounted(async () => {
  isLoading.value = true
  try {
    if (postsStore.posts.length === 0) {
      await postsStore.fetchPosts()
    }
  } catch (err) {
    console.error('Error fetching posts:', err)
  } finally {
    isLoading.value = false
  }
})

// Get unique categories
const categories = computed(() => {
  const cats = new Set<string>()
  postsStore.publishedPosts.forEach(post => {
    if (post.category) {
      cats.add(post.category)
    }
  })
  return Array.from(cats).sort()
})

// Filter and sort posts
const filteredPosts = computed(() => {
  let posts = [...postsStore.publishedPosts]

  // Filter by category
  if (selectedCategory.value) {
    posts = posts.filter(p => p.category === selectedCategory.value)
  }

  // Sort
  if (sortBy.value === 'newest') {
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } else {
    posts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  return posts
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(currentLocale.value === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const localizedNavigateTo = (path: string) => {
  const fullPath = currentLocale.value === 'vi' ? path : `/${currentLocale.value}${path}`
  router.push(fullPath)
}

const navigateToPost = (id: string) => {
  localizedNavigateTo(`/posts/${id}`)
}

// Set page title
useHead({
  title: computed(() => t('posts.latestPosts'))
})
</script>
