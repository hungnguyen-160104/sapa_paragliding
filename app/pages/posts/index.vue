<template>
  <div class="min-h-screen bg-gray-50 font-sans selection:bg-red-100 selection:text-red-900">
    <main class="container-custom mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 md:py-20">
      <div class="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
        <div class="max-w-2xl">
          <h1 class="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            {{ $t('posts.latestPosts') }}<span class="text-red-600">.</span>
          </h1>
          <p class="text-lg leading-relaxed text-gray-500">
            {{ $t('posts.latestPostsDescription') }}
          </p>
        </div>
      </div>

      <div class="sticky top-0 z-10 mb-12 flex flex-col items-start justify-between gap-6 bg-gray-50 py-4 lg:flex-row lg:items-center md:static md:bg-transparent md:py-0">
        <div class="flex flex-wrap items-center gap-2">
          <button
            :class="tabClass(selectedCategory === null)"
            @click="selectedCategory = null"
          >
            {{ $t('postPage.all') }}
          </button>

          <button
            v-for="category in categoryOptions"
            :key="category"
            :class="tabClass(selectedCategory === category)"
            @click="selectedCategory = category"
          >
            {{ getCategoryLabel(category) }}
          </button>
        </div>

        <div class="relative w-full lg:w-auto">
          <select
            v-model="sortBy"
            class="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-900 lg:w-48"
          >
            <option value="newest">{{ $t('postPage.newest') }}</option>
            <option value="oldest">{{ $t('postPage.oldest') }}</option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-gray-200 border-b-gray-900"></div>
        <p class="text-sm font-medium text-gray-500">{{ $t('postPage.loading') }}</p>
      </div>

      <div v-else-if="filteredPosts.length > 0" class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <!-- NuxtLink chứ không phải div + @click: bot cần thẻ <a href> thật mới
             lần được tới bài. Dùng slug vì canonical của bài là slug, link bằng
             id sẽ tạo đường dẫn thứ hai không canonical. -->
        <NuxtLink
          v-for="post in filteredPosts"
          :key="String(post.id)"
          :to="localePath(`/posts/${post.slug || post.id}`)"
          class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="relative aspect-[16/10] overflow-hidden border-b border-gray-100 bg-gray-100">
            <!-- Ảnh bìa qua cloudinaryImage(): trang này hiện 44 ảnh, để URL
                 gốc thì tải ~28 MB mỗi lần mở. loading="lazy" để ảnh ngoài
                 màn hình không tải cho tới khi cuộn tới. -->
            <img
              :src="cloudinaryImage(post.image || post.thumbnailUrl, 600) || '/images/placeholder.jpg'"
              :alt="getPostTitle(post)"
              loading="lazy"
              decoding="async"
              class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div class="absolute left-4 top-4">
              <span class="inline-flex items-center rounded-md border border-gray-200/50 bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm backdrop-blur">
                {{ getCategoryLabel(getPostCategory(post)) }}
              </span>
            </div>
          </div>

          <div class="flex flex-grow flex-col p-6">
            <div class="mb-3 flex items-center gap-3 text-xs font-medium text-gray-500">
              <time :datetime="post.date">{{ formatDate(post.date) }}</time>
              <span class="h-1 w-1 rounded-full bg-gray-300"></span>
              <span>{{ post.author || 'Admin' }}</span>
            </div>

            <h2 class="mb-3 line-clamp-2 bg-gradient-to-r from-red-600 to-red-600 bg-[length:0%_2px] bg-left-bottom bg-no-repeat text-xl font-bold text-gray-900 transition-[background-size] duration-300 group-hover:bg-[length:100%_2px] group-hover:text-red-600">
              {{ getPostTitle(post) }}
            </h2>

            <p class="mb-6 flex-grow line-clamp-3 text-sm leading-relaxed text-gray-500">
              {{ getPostExcerpt(post) }}
            </p>

            <div class="mt-auto flex items-center text-sm font-semibold text-gray-900 transition-colors group-hover:text-red-600">
              <span>{{ $t('postPage.readMore') }}</span>
              <svg class="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
        <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
          <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 class="mb-1 text-lg font-medium text-gray-900">{{ $t('postPage.noPosts') }}</h2>
        <p class="mx-auto max-w-sm text-gray-500">{{ $t('postPage.noPostsDesc') }}</p>
        <button v-if="selectedCategory" class="mt-6 text-sm font-medium text-red-600 hover:text-red-700" @click="selectedCategory = null">
          {{ $t('postPage.clearFilters') }}
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { usePostsStore } from '~/stores/posts'

const localePath = useLocalePath()
import { getCanonicalUrl, buildHreflangLinks, getDefaultOgImage } from '~/utils/seo'

type LocalizedPost = {
  id: string | number
  slug?: string | number
  title?: string
  titleVi?: string
  excerpt?: string
  excerptVi?: string
  image?: string
  thumbnailUrl?: string
  author?: string
  date?: string
  category?: string
  categoryId?: string
  published?: boolean
}

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const currentLocale = computed(() => locale.value || 'vi')
const isVietnamese = computed(() => currentLocale.value === 'vi')
const isLoading = ref(false)
const selectedCategory = ref<string | null>(null)
const sortBy = ref<'newest' | 'oldest'>('newest')

const categoryLabels: Record<string, { vi: string; en: string }> = {
  news: { vi: 'Tin tức', en: 'News' },
  guide: { vi: 'Hướng dẫn', en: 'Guide' },
  experience: { vi: 'Trải nghiệm', en: 'Experience' },
  promotion: { vi: 'Khuyến mãi', en: 'Promotion' },
  adventure: { vi: 'Phiêu lưu', en: 'Adventure' },
  safety: { vi: 'An toàn', en: 'Safety' },
  tips: { vi: 'Mẹo hay', en: 'Tips' }
}

// Phải nạp bằng useAsyncData chứ không phải onMounted: onMounted chỉ chạy
// trên trình duyệt, nên HTML server trả về là trang rỗng "No posts found" —
// bot không chạy JS sẽ không thấy bài nào và không có link nội bộ nào tới bài.
//
// Chỉ await KHI ĐANG KẾT XUẤT PHÍA SERVER:
//   - Trên server PHẢI chờ, nếu không HTML mất sạch 44 link (đã đo: 172KB
//     xuống 72KB, 0 link). Thêm `lazy: true` cũng không cứu được.
//   - Trên trình duyệt KHÔNG được chờ: await ở cấp cao nhất biến <script setup>
//     thành component bất đồng bộ, Vue bọc trong Suspense, nên khi bấm chuyển
//     trang nội dung KHÔNG hiện cho tới khi /api/posts trả về — mà API này mất
//     1–5 giây, người dùng chỉ thấy header và footer trong suốt thời gian đó.
const postsRequest = useAsyncData('posts-list', async () => {
  if (postsStore.posts.length === 0) {
    await postsStore.fetchPosts()
  }
  return postsStore.posts.length
})

const { pending } = postsRequest

if (import.meta.server) {
  await postsRequest
}

watchEffect(() => {
  isLoading.value = pending.value
})

function tabClass(active: boolean) {
  return [
    'rounded-lg border px-4 py-2 text-sm font-medium transition-all duration-200',
    active
      ? 'border-gray-900 bg-gray-900 text-white shadow-sm'
      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
  ]
}

function getPostTitle(post: LocalizedPost): string {
  if (isVietnamese.value) {
    return post.titleVi || post.title || ''
  }
  return post.title || post.titleVi || ''
}

function getPostExcerpt(post: LocalizedPost): string {
  if (isVietnamese.value) {
    return post.excerptVi || post.excerpt || ''
  }
  return post.excerpt || post.excerptVi || ''
}

function getPostCategory(post: LocalizedPost): string {
  return String(post.categoryId || post.category || 'news')
}

function getCategoryLabel(category: string): string {
  const labels = categoryLabels[category]
  if (!labels) return category
  return isVietnamese.value ? labels.vi : labels.en
}

const categoryOptions = computed(() => {
  const categories = new Set<string>()
  ;(postsStore.publishedPosts as LocalizedPost[]).forEach((post) => {
    const category = getPostCategory(post)
    if (category) categories.add(category)
  })
  return Array.from(categories).sort()
})

const filteredPosts = computed<LocalizedPost[]>(() => {
  let posts = [...((postsStore.publishedPosts as LocalizedPost[]) || [])]

  if (selectedCategory.value) {
    posts = posts.filter((post) => getPostCategory(post) === selectedCategory.value)
  }

  posts.sort((a, b) => {
    const timeA = new Date(a.date || 0).getTime()
    const timeB = new Date(b.date || 0).getTime()
    return sortBy.value === 'newest' ? timeB - timeA : timeA - timeB
  })

  return posts
})

function formatDate(date?: string) {
  if (!date) return ''

  const localeMap: Record<string, string> = {
    vi: 'vi-VN',
    en: 'en-US',
    fr: 'fr-FR',
    ru: 'ru-RU',
    zh: 'zh-CN',
    hi: 'hi-IN'
  }

  return new Date(date).toLocaleDateString(localeMap[currentLocale.value] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function localizedNavigateTo(path: string) {
  const fullPath = isVietnamese.value ? path : `/${currentLocale.value}${path}`
  router.push(fullPath)
}

function navigateToPost(id: string | number | undefined) {
  if (!id) return
  localizedNavigateTo(`/posts/${String(id)}`)
}

useHead(() => {
  const title = `${t('posts.latestPosts')} | Sapa Paragliding`
  const description = t('posts.latestPostsDescription')
  const canonical = getCanonicalUrl(route, locale.value)
  const ogImage = getDefaultOgImage()

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: canonical },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: ogImage },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ],
    link: [
      { rel: 'canonical', href: canonical },
      ...buildHreflangLinks(route.path, locale.value)
    ]
  }
})
</script>