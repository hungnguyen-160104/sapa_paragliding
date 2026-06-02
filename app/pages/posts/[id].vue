<template>
  <div class="min-h-screen bg-gray-50 font-sans">
    <main class="px-4 py-12 sm:px-6 md:py-20">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 text-center">
        <div class="relative mb-8">
          <div class="loading-glow"></div>

          <div class="relative h-20 w-20">
            <div class="absolute inset-0 rounded-full border-4 border-gray-200"></div>
            <div class="loading-spinner absolute inset-0 rounded-full border-4 border-transparent border-r-red-400 border-t-red-500"></div>

            <div class="absolute inset-0 flex items-center justify-center">
              <div class="flex items-center gap-1.5">
                <span class="loading-dot loading-dot-1"></span>
                <span class="loading-dot loading-dot-2"></span>
                <span class="loading-dot loading-dot-3"></span>
              </div>
            </div>
          </div>
        </div>

        <div class="max-w-md rounded-2xl border border-gray-200 bg-white/95 px-6 py-4 shadow-xl shadow-gray-200/60 backdrop-blur">
          <h2 class="mb-2 text-xl font-bold text-gray-900 md:text-2xl">
            {{ $t('posts.loadingArticle') }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ $t('posts.loadingArticleSub') }}
          </p>
        </div>

        <div class="loading-bar mt-8">
          <span class="loading-bar-inner"></span>
        </div>
      </div>

      <article v-else-if="post" class="container-custom mx-auto max-w-5xl">
        <nav class="mb-12 flex items-center justify-between">
          <button
            class="group inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-500 shadow-sm transition-colors hover:border-gray-300 hover:text-gray-900 hover:shadow-md"
            @click="goBack"
          >
            <svg class="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ $t('buttons.back') }}
          </button>
        </nav>

        <header class="mx-auto mb-16 max-w-3xl text-center">
          <div class="mb-6 inline-flex items-center justify-center">
            <span class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-gray-900 shadow-sm">
              {{ displayCategory }}
            </span>
          </div>

          <h1 class="mb-8 text-4xl font-black leading-tight tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            {{ displayTitle }}
          </h1>

          <p v-if="displayExcerpt" class="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-gray-500">
            {{ displayExcerpt }}
          </p>

          <div class="flex items-center justify-center space-x-2">
            <div class="flex items-center rounded-full border border-gray-200 bg-white p-1 pr-4 shadow-sm">
              <div class="mr-3 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                <img
                  src="https://ui-avatars.com/api/?name=Admin&background=000000&color=fff"
                  alt="Author"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div class="flex flex-col text-left">
                <span class="text-xs font-bold leading-none text-gray-900">{{ post.author || 'Admin' }}</span>
                <span class="pt-0.5 text-[10px] font-medium text-gray-500">Author</span>
              </div>
            </div>

            <div class="hidden items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-medium text-gray-500 shadow-sm sm:flex">
              <svg class="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formatDate(post.date) }}
            </div>
          </div>
        </header>

        <div class="relative mb-16 overflow-hidden rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200">
          <div class="aspect-video w-full bg-gray-100">
            <img
              v-if="post.image || post.thumbnailUrl"
              :src="post.image || post.thumbnailUrl"
              :alt="displayTitle"
              class="h-full w-full object-cover"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No cover image
            </div>
          </div>
        </div>

        <div class="prose prose-lg prose-slate mx-auto max-w-4xl prose-a:text-red-600 prose-img:rounded-2xl prose-img:shadow-lg prose-headings:font-bold prose-headings:tracking-tight hover:prose-a:text-red-700">
          <template v-if="displayBlocks.length > 0">
            <div v-for="block in displayBlocks" :key="block.id" class="mb-6">
              <template v-if="block.type === 'heading'">
                <h2 v-if="Number(block.data?.level || 2) === 2" class="mb-4 mt-8 text-2xl font-bold">
                  {{ block.data?.text }}
                </h2>
                <h3 v-else-if="Number(block.data?.level || 2) === 3" class="mb-3 mt-6 text-xl font-bold">
                  {{ block.data?.text }}
                </h3>
                <h4 v-else class="mb-2 mt-4 text-lg font-bold">
                  {{ block.data?.text }}
                </h4>
              </template>

              <template v-else-if="block.type === 'paragraph'">
                <p class="whitespace-pre-line leading-relaxed text-gray-700">{{ block.data?.text }}</p>
              </template>

              <template v-else-if="block.type === 'image'">
                <figure class="my-8">
                  <img
                    v-if="block.data?.url"
                    :src="block.data.url"
                    :alt="block.data?.alt || displayTitle"
                    class="w-full rounded-2xl shadow-lg"
                    loading="lazy"
                    decoding="async"
                  />
                  <figcaption v-if="block.data?.caption" class="mt-3 text-center text-sm text-gray-500">
                    {{ block.data.caption }}
                  </figcaption>
                </figure>
              </template>

              <template v-else-if="block.type === 'quote'">
                <blockquote class="my-6 rounded-r-lg border-l-4 border-red-500 bg-gray-50 py-2 pl-6">
                  <p class="text-lg italic text-gray-700">{{ block.data?.text }}</p>
                  <cite v-if="block.data?.author" class="mt-2 block text-sm text-gray-500">— {{ block.data.author }}</cite>
                </blockquote>
              </template>

              <template v-else-if="block.type === 'bulletList'">
                <ul class="my-4 list-inside list-disc space-y-2">
                  <li v-for="(item, itemIdx) in block.data?.items || []" :key="itemIdx" class="text-gray-700">
                    {{ item }}
                  </li>
                </ul>
              </template>

              <template v-else-if="block.type === 'divider'">
                <hr class="my-8 border-gray-200" />
              </template>

              <template v-else-if="block.type === 'cta'">
                <div class="not-prose my-8 text-center">
                  <a
                    :href="block.data?.link || block.data?.url || '#contact'"
                    class="inline-flex items-center rounded-full bg-red-600 px-6 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-red-700"
                  >
                    {{ block.data?.text }}
                    <svg class="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </template>
            </div>
          </template>

          <template v-else-if="displayHtml">
            <div v-html="displayHtml"></div>
          </template>

          <template v-else>
            <p class="italic text-gray-500">{{ $t('posts.noContentYet') }}</p>
          </template>
        </div>

        <section v-if="displayGallery.length > 0" class="mx-auto mt-16 max-w-5xl">
          <h2 class="mb-6 text-2xl font-bold text-gray-900">📷 {{ $t('postPage.gallery') }}</h2>

          <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            <div
              v-for="(image, idx) in displayGallery"
              :key="`${image.url}-${idx}`"
              class="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                :src="image.url"
                :alt="image.caption || displayTitle"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
              />
              <div
                v-if="image.caption"
                class="absolute bottom-0 left-0 right-0 bg-black/50 p-2 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                {{ image.caption }}
              </div>
            </div>
          </div>
        </section>

        <hr class="mx-auto my-16 max-w-3xl border-gray-200" />

        <section v-if="relatedPosts.length > 0" class="mx-auto max-w-5xl">
          <div class="mb-8 flex items-center justify-between">
            <h2 class="text-2xl font-bold tracking-tight text-gray-900">
              {{ $t('postPage.relatedPosts') }}
            </h2>
            <button class="text-sm font-semibold text-red-600 hover:text-red-700" @click="localizedNavigateTo('/posts')">
              {{ $t('postPage.viewAll') }} &rarr;
            </button>
          </div>

          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div
              v-for="relatedPost in relatedPosts"
              :key="String(relatedPost.id)"
              class="group cursor-pointer"
              @click="navigateToPost(relatedPost.slug || relatedPost.id)"
            >
              <div class="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 transition-all duration-300 group-hover:shadow-lg">
                <img
                  :src="relatedPost.image || relatedPost.thumbnailUrl || '/images/placeholder.jpg'"
                  :alt="getLocalizedPostTitle(relatedPost)"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 class="mb-2 line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-red-600">
                {{ getLocalizedPostTitle(relatedPost) }}
              </h3>
              <p class="line-clamp-2 text-sm text-gray-500">
                {{ getLocalizedPostExcerpt(relatedPost) }}
              </p>
            </div>
          </div>
        </section>

        <section v-else-if="latestPosts.length > 0" class="mx-auto max-w-5xl">
          <div class="mb-8 flex items-center justify-between">
            <h2 class="text-2xl font-bold tracking-tight text-gray-900">
              {{ $t('postPage.latestPosts') }}
            </h2>
            <button class="text-sm font-semibold text-red-600 hover:text-red-700" @click="localizedNavigateTo('/posts')">
              {{ $t('postPage.viewAll') }} &rarr;
            </button>
          </div>

          <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div
              v-for="latestPost in latestPosts"
              :key="String(latestPost.id)"
              class="group cursor-pointer"
              @click="navigateToPost(latestPost.slug || latestPost.id)"
            >
              <div class="relative mb-4 aspect-[16/10] overflow-hidden rounded-xl border border-gray-200 bg-gray-100 transition-all duration-300 group-hover:shadow-lg">
                <img
                  :src="latestPost.image || latestPost.thumbnailUrl || '/images/placeholder.jpg'"
                  :alt="getLocalizedPostTitle(latestPost)"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <h3 class="mb-2 line-clamp-2 font-bold text-gray-900 transition-colors group-hover:text-red-600">
                {{ getLocalizedPostTitle(latestPost) }}
              </h3>
              <p class="line-clamp-2 text-sm text-gray-500">
                {{ getLocalizedPostExcerpt(latestPost) }}
              </p>
            </div>
          </div>
        </section>
      </article>

      <div v-else class="flex flex-col items-center justify-center py-32 text-center">
        <div class="max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-gray-200/60">
          <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-6 4h3m5 4H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>

          <h2 class="mb-3 text-2xl font-bold text-gray-900">
            {{ $t('posts.unavailableTitle') }}
          </h2>

          <p class="mb-6 text-gray-500">
            {{ errorMessage }}
          </p>

          <button
            class="rounded-full bg-gray-900 px-6 py-3 font-medium text-white shadow-lg shadow-gray-900/20 transition-colors hover:bg-gray-800"
            @click="goBack"
          >
            {{ $t('buttons.back') }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { usePostsStore } from '~/stores/posts'
import { buildBlogPostingJsonLD, buildBreadcrumbJsonLD, buildHreflangLinks, buildLocalizedUrl } from '~/utils/seo'

type ContentBlock = {
  id: string | number
  type: string
  data?: {
    level?: number | string
    text?: string
    link?: string
    url?: string
    caption?: string
    alt?: string
    author?: string
    items?: string[]
    type?: string
  }
}

type GalleryItem = {
  url: string
  caption?: string
  publicId?: string
}

type PostWithExtras = {
  id: string | number
  slug?: string | number
  title?: string
  titleVi?: string
  excerpt?: string
  excerptVi?: string
  content?: string
  contentVi?: string
  contentHtml?: string
  contentHtmlVi?: string
  image?: string
  thumbnailUrl?: string
  author?: string
  date?: string
  category?: string
  categoryId?: string
  gallery?: GalleryItem[]
  galleryUrls?: GalleryItem[]
  contentBlocks?: ContentBlock[]
  contentBlocksVi?: ContentBlock[]
  seo?: {
    title?: string
    titleVi?: string
    description?: string
    descriptionVi?: string
    ogImage?: string
  }
}

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const localePath = useLocalePath()
const postsStore = usePostsStore()

const currentLocale = computed(() => locale.value || 'vi')
const isVietnamese = computed(() => String(currentLocale.value).toLowerCase().startsWith('vi'))
const postId = computed(() => String(route.params.id ?? ''))

const categoryLabels: Record<string, { vi: string; en: string }> = {
  news: { vi: 'Tin tức', en: 'News' },
  guide: { vi: 'Hướng dẫn', en: 'Guide' },
  experience: { vi: 'Trải nghiệm', en: 'Experience' },
  promotion: { vi: 'Khuyến mãi', en: 'Promotion' },
  adventure: { vi: 'Phiêu lưu', en: 'Adventure' },
  safety: { vi: 'An toàn', en: 'Safety' },
  tips: { vi: 'Mẹo hay', en: 'Tips' }
}

const {
  data: post,
  pending: isLoading,
  error
} = await useAsyncData<PostWithExtras | null>(
  'post-detail',
  async () => {
    const response = await $fetch<{ success: boolean; data: PostWithExtras }>(`/api/posts/${postId.value}`)
    return response?.data ?? null
  },
  {
    watch: [postId],
    default: () => null
  }
)

onMounted(async () => {
  if (postsStore.posts.length === 0) {
    try {
      await postsStore.fetchPosts()
    } catch (err) {
      console.error('Error fetching posts store:', err)
    }
  }
})

function getLocalizedPostTitle(item: PostWithExtras): string {
  if (isVietnamese.value) {
    return item.titleVi || item.title || ''
  }
  return item.title || item.titleVi || ''
}

function getLocalizedPostExcerpt(item: PostWithExtras): string {
  if (isVietnamese.value) {
    return item.excerptVi || item.excerpt || ''
  }
  return item.excerpt || item.excerptVi || ''
}

const displayTitle = computed(() => {
  if (!post.value) return ''
  return getLocalizedPostTitle(post.value)
})

const displayExcerpt = computed(() => {
  if (!post.value) return ''
  return getLocalizedPostExcerpt(post.value)
})

const displayHtml = computed(() => {
  if (!post.value) return ''
  if (isVietnamese.value) {
    return post.value.contentHtmlVi || post.value.contentVi || post.value.contentHtml || post.value.content || ''
  }
  return post.value.contentHtml || post.value.content || post.value.contentHtmlVi || post.value.contentVi || ''
})

const displayBlocks = computed<ContentBlock[]>(() => {
  if (!post.value) return []

  const preferred = isVietnamese.value ? post.value.contentBlocksVi : post.value.contentBlocks
  const fallback = isVietnamese.value ? post.value.contentBlocks : post.value.contentBlocksVi

  if (Array.isArray(preferred) && preferred.length) return preferred
  if (Array.isArray(fallback) && fallback.length) return fallback
  return []
})

const displayGallery = computed<GalleryItem[]>(() => {
  const raw = post.value?.galleryUrls?.length ? post.value.galleryUrls : post.value?.gallery || []
  return Array.isArray(raw) ? raw : []
})

const displayCategory = computed(() => {
  const key = String(post.value?.categoryId || post.value?.category || 'news')
  const labels = categoryLabels[key]
  if (!labels) return key
  return isVietnamese.value ? labels.vi : labels.en
})

const seoTitle = computed(() => {
  if (!post.value) return ''
  if (isVietnamese.value) {
    return post.value.seo?.titleVi || displayTitle.value
  }
  return post.value.seo?.title || displayTitle.value
})

const seoDescription = computed(() => {
  if (!post.value) return ''
  if (isVietnamese.value) {
    return post.value.seo?.descriptionVi || displayExcerpt.value
  }
  return post.value.seo?.description || displayExcerpt.value
})

const errorMessage = computed(() => {
  if (error.value instanceof Error && error.value.message) {
    return error.value.message
  }
  return t('posts.unavailableDescription')
})

function normalizeId(value: string | number | undefined) {
  return String(value ?? '')
}

function normalizeCategory(value: string | number | undefined) {
  return String(value ?? '')
}

const relatedPosts = computed<PostWithExtras[]>(() => {
  if (!post.value) return []

  const currentCategory = normalizeCategory(post.value.categoryId || post.value.category)

  return (postsStore.publishedPosts as PostWithExtras[])
    .filter((item) => {
      const itemCategory = normalizeCategory(item.categoryId || item.category)
      return normalizeId(item.id) !== normalizeId(post.value?.id) && itemCategory === currentCategory
    })
    .slice(0, 3)
})

const latestPosts = computed<PostWithExtras[]>(() => {
  if (!post.value) return []

  return (postsStore.publishedPosts as PostWithExtras[])
    .filter((item) => normalizeId(item.id) !== normalizeId(post.value?.id))
    .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime())
    .slice(0, 3)
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
    month: 'long',
    day: 'numeric'
  })
}

function localizedNavigateTo(path: string) {
  router.push(localePath(path))
}

function goBack() {
  if (import.meta.client && window.history.length > 1) {
    router.back()
    return
  }

  localizedNavigateTo('/posts')
}

function navigateToPost(id: string | number | undefined) {
  if (!id) return
  localizedNavigateTo(`/posts/${String(id)}`)
}

useHead(() => {
  const slug = post.value?.slug || postId.value
  const postUrl = buildLocalizedUrl(`/posts/${slug}`, locale.value)
  const title = seoTitle.value || t('posts.loadingArticle')
  const description = seoDescription.value || t('posts.unavailableDescription')
  const image = post.value?.seo?.ogImage || post.value?.image || post.value?.thumbnailUrl || ''

  const scripts = post.value
    ? [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(buildBlogPostingJsonLD({
            title,
            description,
            url: postUrl,
            image,
            datePublished: post.value.date,
            dateModified: post.value.date,
            author: post.value.author
          }))
        },
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify(buildBreadcrumbJsonLD([
            { name: t('menu.home'), item: buildLocalizedUrl('/', locale.value) },
            { name: t('menu.posts'), item: buildLocalizedUrl('/posts', locale.value) },
            { name: title, item: postUrl }
          ]))
        }
      ]
    : []

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: postUrl },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ],
    link: [
      { rel: 'canonical', href: postUrl },
      ...buildHreflangLinks(`/posts/${slug}`, locale.value)
    ],
    script: scripts
  }
})
</script>

<style scoped>
.prose {
  --tw-prose-body: #4b5563;
  --tw-prose-headings: #111827;
  --tw-prose-links: #dc2626;
  --tw-prose-bold: #111827;
}

.loading-glow {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  background: rgba(254, 226, 226, 0.9);
  filter: blur(28px);
  animation: pulseGlow 1.8s ease-in-out infinite;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

.loading-dot {
  display: inline-block;
  height: 10px;
  width: 10px;
  border-radius: 9999px;
  animation: bounceDot 1.2s infinite ease-in-out;
}

.loading-dot-1 {
  background: #ef4444;
  animation-delay: -0.3s;
}

.loading-dot-2 {
  background: #f87171;
  animation-delay: -0.15s;
}

.loading-dot-3 {
  background: #fca5a5;
}

.loading-bar {
  position: relative;
  height: 0.5rem;
  width: 18rem;
  overflow: hidden;
  border-radius: 9999px;
  background: #e5e7eb;
}

.loading-bar-inner {
  position: absolute;
  inset: 0 auto 0 0;
  width: 45%;
  border-radius: 9999px;
  background: linear-gradient(90deg, transparent, #f87171, transparent);
  animation: shimmerSlide 1.4s infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes shimmerSlide {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(250%);
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0.45;
    transform: scale(0.96);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.04);
  }
}

@keyframes bounceDot {
  0%,
  80%,
  100% {
    opacity: 0.75;
    transform: translateY(0) scale(1);
  }
  40% {
    opacity: 1;
    transform: translateY(-5px) scale(1.08);
  }
}
</style>