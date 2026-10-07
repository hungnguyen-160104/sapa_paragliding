<template>
  <div :class="['min-h-screen font-sans', isV2 ? 'post-v2 v2-edge-3' : 'bg-gray-50']">
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

        <!-- Bố cục hiện hành: căn trái, tiêu đề chữ hẹp viết hoa, ba ô thông
             tin, ảnh bìa nằm bên phải phần mở đầu. (?layout=old → bố cục cũ) -->
        <header v-if="isV2" class="v2-header">
          <p class="v2-eyebrow">Sapa Paragliding · {{ displayCategory }}</p>
          <h1 class="v2-title">{{ displayTitle }}</h1>
          <p v-if="displayExcerpt" class="v2-lead">{{ displayExcerpt }}</p>

          <div class="v2-chips">
            <div class="v2-chip">
              <strong>{{ readingMinutes }} {{ v2Labels.min }}</strong>
              <span>{{ v2Labels.read }}</span>
            </div>
            <div class="v2-chip">
              <strong>{{ formatDateShort(post.date) }}</strong>
              <span>{{ v2Labels.updated }}</span>
            </div>
            <div class="v2-chip">
              <strong>{{ displayCategory }}</strong>
              <span>{{ v2Labels.category }}</span>
            </div>
          </div>

          <div class="mt-6">
            <ShareButtons variant="article" :title="displayTitle" />
          </div>
        </header>

        <header v-else class="mx-auto mb-16 max-w-3xl text-center">
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
                <NuxtImg
                  src="https://ui-avatars.com/api/?name=Admin&background=000000&color=fff"
                  alt="Author"
                  class="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                  format="webp"
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

          <!-- chia sẻ bài viết — ngay dưới hàng tác giả/ngày, giống mebayluon.com -->
          <div class="mt-5 flex justify-center">
            <ShareButtons variant="article" :title="displayTitle" />
          </div>
        </header>

        <div v-if="!isV2" class="relative mb-16 overflow-hidden rounded-3xl border border-gray-100 shadow-2xl shadow-gray-200">
          <div class="aspect-video w-full bg-gray-100">
            <NuxtImg
              v-if="post.image || post.thumbnailUrl"
              :src="cloudinaryImage(post.image || post.thumbnailUrl, 1200)"
              :alt="displayTitle"
              class="h-full w-full object-cover"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              format="webp"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-sm text-gray-400">
              No cover image
            </div>
          </div>
        </div>

        <div
          :class="isV2
            ? 'v2-content'
            : 'prose prose-lg prose-slate mx-auto max-w-4xl prose-a:text-red-600 prose-img:rounded-2xl prose-img:shadow-lg prose-headings:font-bold prose-headings:tracking-tight hover:prose-a:text-red-700'"
        >
          <figure v-if="isV2 && (post.image || post.thumbnailUrl)" class="v2-cover">
            <span class="post-img-paper block">
              <NuxtImg
                :src="cloudinaryImage(post.image || post.thumbnailUrl, 1200)"
                :alt="displayTitle"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                format="webp"
              />
            </span>
          </figure>
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
                <!-- v-html an toàn: renderInlineMarkup escape toàn bộ trước rồi
                     chỉ chèn lại <strong> và <em> -->
                <p
                  class="whitespace-pre-line leading-relaxed text-gray-700"
                  v-html="renderInlineMarkup(block.data?.text)"
                />
              </template>

              <template v-else-if="block.type === 'table'">
                <div class="my-6 overflow-x-auto rounded-xl border border-gray-200">
                  <table class="w-full border-collapse text-left text-sm">
                    <thead v-if="normalizeTableData(block.data).hasHeader">
                      <tr class="bg-gray-50">
                        <th
                          v-for="(cell, col) in normalizeTableData(block.data).headers"
                          :key="`th-${col}`"
                          class="border-b border-gray-200 px-4 py-3 font-bold text-gray-900"
                          v-html="renderInlineMarkup(cell)"
                        />
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(row, rowIndex) in normalizeTableData(block.data).rows"
                        :key="`tr-${rowIndex}`"
                        class="even:bg-gray-50/60"
                      >
                        <td
                          v-for="(cell, col) in row"
                          :key="`td-${rowIndex}-${col}`"
                          class="border-b border-gray-100 px-4 py-3 text-gray-700"
                          v-html="renderInlineMarkup(cell)"
                        />
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>

              <template v-else-if="block.type === 'image'">
                <figure class="my-8">
                  <!-- span bọc ảnh: bố cục mới cần một lớp ngoài để đổ bóng theo
                       mép giấy xé (mask đặt trên ảnh sẽ cắt mất bóng của chính nó) -->
                  <span v-if="block.data?.url" class="post-img-wrap block">
                    <span class="post-img-paper block">
                      <NuxtImg
                        :src="block.data.url"
                        :alt="block.data?.alt || displayTitle"
                        class="w-full rounded-2xl shadow-lg"
                        loading="lazy"
                        decoding="async"
                        format="webp"
                      />
                    </span>
                  </span>
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
                  <!-- renderInlineMarkup như đoạn văn: bài có **đậm** trong danh sách,
                       in thô thì khách thấy nguyên dấu ** -->
                  <li
                    v-for="(item, itemIdx) in block.data?.items || []"
                    :key="itemIdx"
                    class="text-gray-700"
                    v-html="renderInlineMarkup(item)"
                  />
                </ul>
              </template>

              <template v-else-if="block.type === 'divider'">
                <hr class="my-8 border-gray-200" />
              </template>

              <template v-else-if="block.type === 'video'">
                <div class="not-prose my-8">
                  <div v-if="getVideoEmbedUrl(block.data?.url)" class="relative aspect-video overflow-hidden rounded-2xl shadow-lg">
                    <iframe
                      :src="getVideoEmbedUrl(block.data?.url)!"
                      class="h-full w-full"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen
                      loading="lazy"
                    />
                  </div>
                  <p v-if="block.data?.caption" class="mt-3 text-center text-sm text-gray-500 italic">
                    {{ block.data.caption }}
                  </p>
                </div>
              </template>

              <template v-else-if="block.type === 'linkCard'">
                <div class="not-prose my-6">
                  <a
                    :href="block.data?.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-red-300 hover:shadow-md"
                  >
                    <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500">
                      <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <div class="min-w-0 flex-1">
                      <p v-if="block.data?.title" class="truncate font-semibold text-gray-900">{{ block.data.title }}</p>
                      <p v-if="block.data?.description" class="mt-1 line-clamp-2 text-sm text-gray-500">{{ block.data.description }}</p>
                      <p class="mt-1 truncate text-xs text-red-500">{{ block.data?.url }}</p>
                    </div>
                    <svg class="h-5 w-5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
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
              <NuxtImg
                :src="image.url"
                :alt="image.caption || displayTitle"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                decoding="async"
                format="webp"
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
                <NuxtImg
                  :src="cloudinaryImage(relatedPost.image || relatedPost.thumbnailUrl, 400) || '/images/placeholder.jpg'"
                  :alt="getLocalizedPostTitle(relatedPost)"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  format="webp"
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
                <NuxtImg
                  :src="cloudinaryImage(latestPost.image || latestPost.thumbnailUrl, 400) || '/images/placeholder.jpg'"
                  :alt="getLocalizedPostTitle(latestPost)"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  format="webp"
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
import { normalizeTableData } from '~/stores/postsAdmin'
import { renderInlineMarkup } from '~/utils/inlineMarkup'
import { buildBlogPostingJsonLD, buildBreadcrumbJsonLD, buildHreflangLinks, buildLocalizedUrl, getOgLocale, truncateMetaDescription, POST_LOCALES, POST_SOURCE_LOCALE, type SupportedLocale } from '~/utils/seo'

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

type PostTranslation = {
  title?: string
  excerpt?: string
  contentBlocks?: ContentBlock[]
  seo?: { title?: string; description?: string }
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
  /** Bản dịch fr/ru/zh/hi — chỉ có ở những bài đã dịch thật */
  translations?: Partial<Record<string, PostTranslation>>
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

/**
 * Bố cục bài viết hiện hành (chủ duyệt 07/10/2026): căn trái, tiêu đề chữ hẹp
 * viết hoa, ba ô thông tin, ảnh mép giấy xé mảnh. Bố cục cũ vẫn xem lại được
 * bằng ?layout=old để so sánh.
 */
const isV2 = computed(() => route.query.layout !== 'old')

const V2_LABELS: Record<string, { min: string; read: string; updated: string; category: string }> = {
  vi: { min: 'phút', read: 'thời gian đọc', updated: 'ngày đăng', category: 'chuyên mục' },
  en: { min: 'min', read: 'reading time', updated: 'published', category: 'category' },
  fr: { min: 'min', read: 'temps de lecture', updated: 'publié le', category: 'rubrique' },
  ru: { min: 'мин', read: 'время чтения', updated: 'опубликовано', category: 'рубрика' },
  zh: { min: '分钟', read: '阅读时间', updated: '发布日期', category: '栏目' },
  hi: { min: 'मिनट', read: 'पढ़ने का समय', updated: 'प्रकाशित', category: 'श्रेणी' },
  ko: { min: '분', read: '읽는 시간', updated: '게시일', category: '카테고리' },
  de: { min: 'Min.', read: 'Lesezeit', updated: 'veröffentlicht', category: 'Rubrik' }
}
const v2Labels = computed(() => V2_LABELS[currentLocale.value] ?? V2_LABELS.en!)
const isVietnamese = computed(() => String(currentLocale.value).toLowerCase().startsWith('vi'))
const postId = computed(() => String(route.params.id ?? ''))

const categoryLabels: Record<string, { vi: string; en: string; fr?: string; ko?: string; de?: string }> = {
  news: { vi: 'Tin tức', en: 'News', fr: 'Actualités', ko: '소식', de: 'Aktuelles' },
  guide: { vi: 'Hướng dẫn', en: 'Guide', fr: 'Guide', ko: '가이드', de: 'Ratgeber' },
  experience: { vi: 'Trải nghiệm', en: 'Experience', fr: 'Expérience', ko: '체험', de: 'Erlebnis' },
  promotion: { vi: 'Khuyến mãi', en: 'Promotion', fr: 'Promotion', ko: '프로모션', de: 'Angebot' },
  adventure: { vi: 'Phiêu lưu', en: 'Adventure', fr: 'Aventure', ko: '모험', de: 'Abenteuer' },
  safety: { vi: 'An toàn', en: 'Safety', fr: 'Sécurité', ko: '안전', de: 'Sicherheit' },
  tips: { vi: 'Mẹo hay', en: 'Tips', fr: 'Conseils', ko: '팁', de: 'Tipps' }
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

/**
 * Bài không tồn tại phải trả 404 THẬT.
 *
 * API /api/posts/<id> đã trả đúng 404, nhưng trang nuốt mất: post = null thì
 * vẫn render khung "đang tải" và trả 200, kèm robots: index, follow và
 * canonical trỏ về chính nó. Với Google đó là một trang hợp lệ — nên mọi URL
 * /posts/<gì-cũng-được> đều thành trang có thể index (soft 404), sinh vô hạn
 * trang rác mang tiêu đề là khoá dịch thô "posts.loadingArticle".
 */
if (error.value) {
  // Lỗi hạ tầng KHÔNG được biến thành 404: database chập chờn mà trả 404 thì
  // Google hiểu là bài đã bị xoá thật. Chỉ 404 khi API xác nhận không có bài.
  const status = (error.value as { statusCode?: number }).statusCode
  throw createError({
    statusCode: status === 404 ? 404 : 500,
    statusMessage: status === 404 ? 'Post not found' : 'Failed to load post',
    fatal: true
  })
}

if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Post not found', fatal: true })
}

onMounted(async () => {
  if (postsStore.posts.length === 0) {
    try {
      await postsStore.fetchPosts()
    } catch (err) {
      console.error('Error fetching posts store:', err)
    }
  }
})

/** Bản dịch của ngôn ngữ đang xem (fr/ru/zh/hi), nếu bài có. */
function getTranslation(item?: PostWithExtras | null): PostTranslation | null {
  if (!item || isVietnamese.value || locale.value === 'en') return null
  const tr = item.translations?.[locale.value]
  return tr?.title ? tr : null
}

const translation = computed(() => getTranslation(post.value))

function getLocalizedPostTitle(item: PostWithExtras): string {
  const tr = getTranslation(item)
  if (tr?.title) return tr.title
  if (isVietnamese.value) {
    return item.titleVi || item.title || ''
  }
  return item.title || item.titleVi || ''
}

function getLocalizedPostExcerpt(item: PostWithExtras): string {
  const tr = getTranslation(item)
  if (tr?.excerpt) return tr.excerpt
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

  const translated = translation.value?.contentBlocks
  if (Array.isArray(translated) && translated.length) return translated

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
  if (locale.value === 'fr' && labels.fr) return labels.fr
  if (locale.value === 'ko' && labels.ko) return labels.ko
  if (locale.value === 'de' && labels.de) return labels.de
  return isVietnamese.value ? labels.vi : labels.en
})

const seoTitle = computed(() => {
  if (!post.value) return ''
  if (translation.value) {
    return translation.value.seo?.title || displayTitle.value
  }
  if (isVietnamese.value) {
    return post.value.seo?.titleVi || displayTitle.value
  }
  return post.value.seo?.title || displayTitle.value
})

const seoDescription = computed(() => {
  if (!post.value) return ''
  // truncateMetaDescription: excerpt viết cho thẻ bài nên hay dài 190–220 ký
  // tự, Google cắt cụt ở ~160 — cắt chủ động tại ranh giới từ cho gọn.
  // Excerpt hiển thị trên trang không bị ảnh hưởng.
  if (translation.value) {
    return truncateMetaDescription(translation.value.seo?.description || displayExcerpt.value)
  }
  if (isVietnamese.value) {
    return truncateMetaDescription(post.value.seo?.descriptionVi || displayExcerpt.value)
  }
  return truncateMetaDescription(post.value.seo?.description || displayExcerpt.value)
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

/** Số phút đọc ước lượng: ~200 từ/phút; chữ Hán/Hàn không có dấu cách nên tính ~500 ký tự/phút. */
const readingMinutes = computed(() => {
  const text = displayBlocks.value
    .map((b) => [b.data?.text, ...(b.data?.items || [])].filter(Boolean).join(' '))
    .join(' ')
  const cjk = (text.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length
  const words = text.replace(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200 + cjk / 500))
})

function formatDateShort(date?: string) {
  if (!date) return ''
  return new Date(date).toLocaleDateString(currentLocale.value === 'vi' ? 'vi-VN' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function formatDate(date?: string) {
  if (!date) return ''

  const localeMap: Record<string, string> = {
    vi: 'vi-VN',
    en: 'en-US',
    fr: 'fr-FR',
    ru: 'ru-RU',
    zh: 'zh-CN',
    hi: 'hi-IN',
    ko: 'ko-KR',
    de: 'de-DE'
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

function getVideoEmbedUrl(url?: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
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

  /**
   * Bài chỉ có bản tiếng Anh và tiếng Việt. Bốn địa chỉ /fr /ru /zh /hi vẫn
   * mở được cho khách bấm từ nút đổi ngôn ngữ, nhưng nội dung y hệt bản tiếng
   * Anh — nên với Google phải khai chúng là bản sao, canonical trỏ về bản gốc.
   *
   * Trước đây mỗi bản sao tự nhận canonical chính nó, tức mỗi bài xuất hiện
   * sáu lần với cùng một nội dung. Google xử lý đúng như dự đoán: chọn giùm
   * một bản chính tắc và bỏ lập chỉ mục phần còn lại.
   */
  // Ngôn ngữ có bản dịch thật cho RIÊNG bài này (post.translations) cũng là
  // trang riêng — cùng điều kiện với getPostLocales trong server/utils/sitemap.ts.
  const postLocales: SupportedLocale[] = [
    ...POST_LOCALES,
    ...(Object.keys(post.value?.translations || {}) as SupportedLocale[])
      .filter((lc) => !POST_LOCALES.includes(lc) && post.value?.translations?.[lc]?.title && post.value?.translations?.[lc]?.contentBlocks?.length)
  ]
  const hasOwnTranslation = postLocales.includes(locale.value as SupportedLocale)
  const canonicalUrl = hasOwnTranslation
    ? postUrl
    : buildLocalizedUrl(`/posts/${slug}`, POST_SOURCE_LOCALE)
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
      // Không khai báo kích thước thì Facebook/Zalo phải tự tải ảnh về đo
      // trước khi render — lần chia sẻ đầu thường bỏ qua ảnh và chỉ hiện
      // link trần. Khai báo sẵn để hiện preview ngay lần đầu.
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: title },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: postUrl },
      // Cho mạng xã hội biết bài đang ở ngôn ngữ nào (fr_FR, vi_VN...)
      { property: 'og:locale', content: getOgLocale(locale.value) },
      { property: 'og:site_name', content: 'Sapa Paragliding' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image }
    ],
    link: [
      // Font của bố cục bài viết (Saira Condensed cho tiêu đề, Lexend cho nội dung)
      ...(isV2.value
        ? [
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
            { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600&family=Saira+Condensed:wght@600;700;800&display=swap' }
          ]
        : []),
      { rel: 'canonical', href: canonicalUrl },
      ...buildHreflangLinks(`/posts/${slug}`, locale.value, postLocales)
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
<style>
/* ===== Bố cục bài viết (mặc định từ 07/10/2026; ?layout=old để xem bản cũ) ===== */
.post-v2 {
  --v2-ink: #13241c;
  --v2-green: #1e5b45;
  --v2-red: #d1343f;
  --v2-muted: #5d6d65;
  --v2-line: #dfe6e3;
  background: #f2f5f5;
  color: #2a3a33;
  font-family: 'Lexend', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
}
.post-v2 .v2-header { margin-bottom: 3rem; }
.post-v2 .v2-eyebrow {
  margin-bottom: 1rem;
  color: var(--v2-red);
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.post-v2 .v2-title {
  /* Không bó bề ngang (bó 18ch làm tiêu đề xuống 3–4 dòng). Cỡ chữ: tiêu đề
     thường 2 dòng, tiêu đề dài 3 dòng — chủ không muốn ép nhỏ để vừa 2 dòng. */
  max-width: 100%;
  margin-bottom: 1.25rem;
  color: var(--v2-ink);
  font-family: 'Saira Condensed', 'Arial Narrow', 'Lexend', sans-serif;
  font-size: clamp(2.1rem, 4.8vw, 3.6rem);
  font-weight: 800;
  /* 1.1 chứ không phải 1: dấu tiếng Việt chồng (Ể, Ồ) cao hơn chữ Latin,
     line-height 1 làm dấu chạm dòng nhãn phía trên và dòng chữ kề trên. */
  line-height: 1.1;
  letter-spacing: 0.005em;
  text-transform: uppercase;
  text-wrap: balance;
  word-break: keep-all; /* tiếng Hàn: không ngắt giữa từ */
}
.post-v2 .v2-lead {
  max-width: 44rem;
  font-size: 1.1rem;
  font-weight: 300;
  line-height: 1.75;
}
.post-v2 .v2-chips { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
.post-v2 .v2-chip {
  display: flex;
  flex-direction: column;
  padding: 0.6rem 1rem 0.7rem;
  border: 1px solid var(--v2-line);
  border-radius: 0.5rem;
  background: #fff;
}
.post-v2 .v2-chip strong {
  color: var(--v2-green);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1.15;
}
.post-v2 .v2-chip span { color: var(--v2-muted); font-size: 0.8rem; font-weight: 300; }

/* Nội dung */
.post-v2 .v2-content { max-width: 60rem; }
.post-v2 .v2-content::after { content: ''; display: block; clear: both; }
.post-v2 .v2-cover { float: right; width: 48%; margin: 0.5rem 0 1.5rem 2.5rem; }

@media (max-width: 1023px) {
  .post-v2 .v2-cover { float: none; width: 100%; margin: 0 0 2rem; }
}
.post-v2 .v2-content h2,
.post-v2 section > div > h2,
.post-v2 section > h2 {
  margin: 3rem 0 1rem;
  color: var(--v2-green);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif;
  font-size: clamp(1.55rem, 3vw, 2.2rem);
  font-weight: 700;
  line-height: 1.05;
  text-transform: uppercase;
}
.post-v2 .v2-content h3 {
  margin: 2rem 0 0.6rem;
  color: var(--v2-ink);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1.15;
}
.post-v2 .v2-content h4 { color: var(--v2-ink); font-weight: 600; }
.post-v2 .v2-content p { color: #2a3a33; font-size: 1.05rem; font-weight: 300; line-height: 1.8; }
.post-v2 .v2-content strong { color: var(--v2-ink); font-weight: 600; }
.post-v2 .v2-content ul { list-style: none; padding-left: 0; }
.post-v2 .v2-content ul li {
  position: relative;
  padding-left: 1.4rem;
  color: #2a3a33;
  font-weight: 300;
  line-height: 1.75;
}
.post-v2 .v2-content ul li::before {
  content: '';
  position: absolute;
  left: 0.15rem;
  top: 0.7em;
  width: 0.45rem;
  height: 0.45rem;
  background: var(--v2-green);
}
/* Ảnh trong bài: không cao quá ~2/3 màn hình (chủ: ảnh to quá, một màn
   hình nhìn không hết). Mép ảnh kiểu GIẤY XÉ, răng cưa sắc bằng clip-path
   (bản mask nhiễu trước đó mép to và nhão, chủ chê xấu). Bóng đổ đặt ở lớp ngoài (.post-img-wrap / figure.v2-cover)
   vì clip-path cắt mất bóng của chính phần tử. */
.post-v2 .v2-content figure { text-align: center; }
.post-v2 .v2-content figure .post-img-wrap {
  display: inline-block;
  max-width: 100%;
  filter: drop-shadow(0 6px 7px rgba(19, 36, 28, 0.3));
}
.post-v2 .v2-content figure.v2-cover { filter: drop-shadow(0 7px 8px rgba(19, 36, 28, 0.3)); }
.post-v2 .v2-content .post-img-paper { display: block; }
.post-v2 .v2-content figure img {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: min(66vh, 560px);
  object-fit: cover;
  border-radius: 0;
  box-shadow: none;
}
.post-v2 .v2-content figure.v2-cover img { width: 100%; max-height: 62vh; aspect-ratio: 4 / 3; }

/* Mép giấy xé mảnh (kiểu 3 — chủ chọn 07/10) */
.post-v2.v2-edge-3 .v2-content .post-img-paper { clip-path: polygon(0.00% 0.48%, 1.06% 0.55%, 2.07% 0.52%, 2.59% 0.26%, 3.76% 0.36%, 4.89% 0.08%, 5.71% 0.18%, 6.59% 0.39%, 7.10% 0.22%, 7.80% 0.64%, 8.84% 0.28%, 9.89% 0.33%, 10.83% 0.37%, 11.33% 0.81%, 11.97% 0.48%, 13.16% 0.89%, 13.86% 0.96%, 14.74% 0.82%, 15.38% 0.97%, 16.37% 0.98%, 17.49% 0.59%, 18.25% 0.50%, 18.85% 0.42%, 19.56% 0.68%, 20.06% 0.70%, 20.80% 0.46%, 21.87% 0.49%, 22.59% 0.45%, 23.59% 0.17%, 24.77% 0.09%, 25.79% 0.50%, 26.31% 0.46%, 27.06% 0.33%, 27.57% 0.03%, 28.20% 0.53%, 28.83% 0.42%, 29.98% 0.54%, 30.72% 0.24%, 31.59% 0.50%, 32.17% 0.51%, 33.23% 0.63%, 33.75% 0.71%, 34.32% 0.40%, 35.24% 0.77%, 35.98% 0.82%, 36.86% 0.52%, 37.58% 0.48%, 38.14% 0.49%, 39.12% 0.98%, 39.73% 0.47%, 40.92% 0.74%, 41.71% 0.57%, 42.62% 0.88%, 43.44% 0.63%, 43.98% 0.88%, 44.51% 0.63%, 45.59% 0.37%, 46.60% 0.77%, 47.55% 0.63%, 48.12% 0.40%, 48.73% 0.59%, 49.43% 0.34%, 50.63% 0.51%, 51.81% 0.26%, 52.66% 0.40%, 53.49% 0.16%, 54.27% 0.09%, 55.04% 0.57%, 56.21% 0.41%, 57.06% 0.28%, 57.62% 0.27%, 58.67% 0.66%, 59.42% 0.65%, 60.46% 0.66%, 61.43% 0.75%, 62.18% 0.75%, 62.88% 0.66%, 63.92% 0.81%, 64.62% 0.96%, 65.58% 0.77%, 66.09% 0.75%, 66.76% 0.81%, 67.59% 0.87%, 68.54% 0.83%, 69.28% 0.72%, 70.30% 0.77%, 71.05% 0.74%, 72.15% 0.59%, 73.34% 0.68%, 74.20% 0.40%, 74.82% 0.54%, 75.97% 0.30%, 76.96% 0.41%, 77.97% 0.09%, 79.01% 0.32%, 79.98% 0.25%, 80.92% 0.48%, 81.86% 0.48%, 82.38% 0.20%, 83.19% 0.51%, 83.84% 0.57%, 84.79% 0.27%, 85.62% 0.41%, 86.15% 0.39%, 86.88% 0.45%, 87.51% 0.40%, 88.34% 0.62%, 89.27% 0.76%, 89.93% 0.94%, 90.43% 0.67%, 91.13% 0.67%, 91.71% 0.90%, 92.47% 0.45%, 93.40% 0.45%, 94.28% 0.55%, 95.19% 0.85%, 96.26% 0.50%, 97.33% 0.56%, 98.09% 0.24%, 99.00% 0.43%, 100.00% 0.48%, 99.72% 0.00%, 99.96% 1.13%, 99.67% 1.70%, 99.92% 2.63%, 99.51% 3.57%, 99.76% 4.34%, 99.82% 4.99%, 99.74% 6.17%, 99.40% 7.35%, 99.72% 8.26%, 99.52% 9.45%, 99.57% 10.24%, 99.41% 11.43%, 99.39% 12.13%, 99.28% 12.72%, 99.43% 13.53%, 99.11% 14.57%, 99.26% 15.08%, 99.04% 15.78%, 99.42% 16.82%, 99.48% 17.51%, 99.44% 18.70%, 99.37% 19.63%, 99.35% 20.58%, 99.67% 21.60%, 99.63% 22.63%, 99.66% 23.51%, 99.59% 24.21%, 99.72% 25.04%, 99.63% 26.06%, 99.83% 26.59%, 99.49% 27.40%, 99.70% 28.53%, 99.57% 29.04%, 99.67% 29.84%, 99.62% 30.83%, 99.43% 31.67%, 99.69% 32.44%, 99.74% 33.53%, 99.35% 34.24%, 99.32% 34.79%, 99.48% 35.77%, 99.25% 36.47%, 99.55% 37.61%, 99.29% 38.45%, 99.39% 39.30%, 99.24% 39.90%, 99.51% 40.97%, 99.10% 41.63%, 99.20% 42.69%, 99.18% 43.20%, 99.07% 44.39%, 99.64% 45.38%, 99.61% 46.47%, 99.26% 47.42%, 99.76% 48.42%, 99.37% 49.13%, 99.57% 49.73%, 99.85% 50.52%, 99.95% 51.46%, 99.77% 52.03%, 99.96% 52.58%, 99.59% 53.48%, 99.92% 54.60%, 99.80% 55.40%, 99.68% 56.32%, 99.69% 57.48%, 99.49% 58.02%, 99.49% 58.62%, 99.29% 59.48%, 99.40% 60.37%, 99.40% 61.05%, 99.26% 61.73%, 99.56% 62.59%, 99.40% 63.25%, 99.47% 64.27%, 99.19% 65.27%, 99.18% 65.83%, 99.48% 66.39%, 99.43% 67.31%, 99.32% 68.42%, 99.18% 69.15%, 99.24% 69.67%, 99.58% 70.21%, 99.35% 71.37%, 99.69% 72.03%, 99.46% 73.21%, 99.80% 74.28%, 99.73% 75.22%, 99.77% 75.89%, 99.79% 76.82%, 99.92% 77.59%, 99.64% 78.67%, 99.75% 79.73%, 99.68% 80.83%, 99.62% 81.74%, 99.67% 82.76%, 99.84% 83.33%, 99.80% 83.97%, 99.50% 85.09%, 99.70% 86.12%, 99.17% 86.95%, 99.38% 87.89%, 99.53% 88.71%, 99.48% 89.32%, 99.35% 90.08%, 99.47% 91.20%, 99.40% 91.88%, 99.41% 92.49%, 99.31% 93.16%, 99.09% 93.68%, 99.11% 94.44%, 99.30% 95.42%, 99.19% 96.25%, 99.38% 96.83%, 99.41% 97.53%, 99.75% 98.54%, 99.86% 99.19%, 99.86% 99.85%, 99.51% 100.00%, 100.00% 99.43%, 99.17% 99.48%, 98.16% 99.29%, 97.55% 99.59%, 96.57% 99.26%, 95.62% 99.59%, 94.44% 99.89%, 93.90% 99.49%, 93.11% 99.92%, 92.23% 99.43%, 91.36% 99.80%, 90.80% 99.96%, 89.67% 99.73%, 88.51% 99.95%, 87.84% 99.93%, 87.06% 99.89%, 86.39% 99.67%, 85.67% 99.83%, 85.15% 99.30%, 84.52% 99.52%, 83.74% 99.46%, 83.18% 99.55%, 82.60% 99.39%, 81.46% 99.31%, 80.36% 99.48%, 79.85% 99.28%, 79.01% 99.25%, 78.24% 99.21%, 77.23% 99.05%, 76.52% 99.32%, 75.44% 99.47%, 74.86% 99.44%, 74.30% 99.21%, 73.22% 99.51%, 72.63% 99.67%, 71.96% 99.71%, 71.16% 99.48%, 70.49% 99.80%, 69.50% 99.86%, 68.86% 99.76%, 68.10% 99.89%, 67.30% 99.80%, 66.28% 99.69%, 65.15% 99.64%, 64.12% 99.67%, 63.31% 99.52%, 62.35% 99.41%, 61.34% 99.51%, 60.65% 99.41%, 59.89% 99.75%, 59.34% 99.70%, 58.66% 99.38%, 57.96% 99.68%, 56.92% 99.35%, 56.40% 99.61%, 55.81% 99.41%, 54.71% 99.05%, 53.78% 99.43%, 52.98% 99.35%, 52.25% 99.55%, 51.34% 99.11%, 50.33% 99.54%, 49.46% 99.53%, 48.46% 99.43%, 47.31% 99.30%, 46.72% 99.59%, 45.58% 99.58%, 44.78% 99.63%, 43.74% 99.41%, 42.87% 99.42%, 41.95% 99.92%, 40.88% 99.77%, 40.35% 99.46%, 39.82% 99.68%, 38.98% 99.50%, 38.21% 99.85%, 37.52% 99.84%, 36.62% 99.71%, 35.60% 99.73%, 34.85% 99.68%, 33.66% 99.29%, 32.57% 99.35%, 31.79% 99.57%, 30.71% 99.34%, 30.18% 99.50%, 29.61% 99.18%, 28.48% 99.44%, 27.42% 99.37%, 26.44% 99.09%, 25.51% 99.15%, 24.74% 99.61%, 23.89% 99.33%, 23.26% 99.47%, 22.53% 99.71%, 21.82% 99.55%, 20.98% 99.42%, 20.20% 99.31%, 19.13% 99.40%, 18.15% 99.58%, 17.27% 99.53%, 16.52% 99.66%, 15.54% 99.71%, 14.84% 99.96%, 14.28% 99.80%, 13.38% 99.56%, 12.38% 99.77%, 11.23% 99.74%, 10.22% 99.80%, 9.20% 99.41%, 8.03% 99.22%, 7.05% 99.21%, 6.03% 99.28%, 5.38% 99.31%, 4.25% 99.43%, 3.07% 99.25%, 2.30% 99.55%, 1.52% 99.46%, 0.57% 99.09%, 0.00% 99.69%, 0.43% 100.00%, 0.63% 99.02%, 0.48% 98.02%, 0.33% 96.90%, 0.32% 96.18%, 0.61% 95.25%, 0.44% 94.63%, 0.17% 93.59%, 0.34% 93.05%, 0.49% 91.97%, 0.23% 90.96%, 0.29% 90.16%, 0.19% 89.03%, 0.38% 88.33%, 0.20% 87.15%, 0.18% 86.63%, 0.50% 85.74%, 0.30% 85.11%, 0.61% 84.19%, 0.71% 83.21%, 0.60% 82.67%, 0.91% 81.58%, 0.88% 80.86%, 0.94% 79.91%, 0.83% 79.25%, 0.71% 78.16%, 0.55% 77.59%, 0.49% 76.98%, 0.76% 76.37%, 0.82% 75.80%, 0.81% 74.79%, 0.70% 73.72%, 0.78% 72.58%, 0.73% 71.64%, 0.22% 71.07%, 0.25% 70.52%, 0.35% 69.76%, 0.47% 68.78%, 0.26% 68.22%, 0.22% 67.34%, 0.33% 66.76%, 0.38% 66.00%, 0.53% 65.15%, 0.06% 63.99%, 0.46% 62.96%, 0.15% 62.25%, 0.32% 61.42%, 0.69% 60.40%, 0.39% 59.63%, 0.66% 58.78%, 0.65% 57.73%, 0.55% 57.02%, 0.69% 55.93%, 0.65% 55.40%, 0.80% 54.73%, 0.59% 54.18%, 0.71% 53.61%, 0.74% 52.42%, 0.94% 51.65%, 0.61% 51.09%, 0.38% 50.02%, 0.52% 48.98%, 0.44% 48.47%, 0.46% 47.65%, 0.23% 46.79%, 0.70% 46.14%, 0.39% 45.33%, 0.25% 44.77%, 0.43% 43.60%, 0.05% 42.74%, 0.44% 41.97%, 0.33% 41.16%, 0.36% 40.03%, 0.04% 39.09%, 0.46% 38.57%, 0.55% 37.78%, 0.62% 36.70%, 0.70% 35.94%, 0.70% 34.91%, 0.67% 34.30%, 0.82% 33.51%, 0.47% 32.31%, 0.53% 31.52%, 0.57% 30.69%, 0.51% 29.72%, 0.70% 29.10%, 0.66% 28.55%, 0.93% 27.42%, 0.44% 26.79%, 0.93% 25.71%, 0.44% 24.79%, 0.84% 24.12%, 0.29% 22.97%, 0.47% 22.34%, 0.61% 21.65%, 0.58% 20.89%, 0.41% 20.28%, 0.46% 19.10%, 0.11% 18.54%, 0.23% 17.59%, 0.27% 16.83%, 0.53% 15.92%, 0.32% 15.25%, 0.31% 14.57%, 0.11% 13.56%, 0.46% 12.72%, 0.51% 12.21%, 0.40% 11.42%, 0.61% 10.49%, 0.48% 9.95%, 0.45% 9.43%, 0.29% 8.68%, 0.56% 7.98%, 0.87% 7.02%, 0.68% 6.26%, 0.94% 5.26%, 0.99% 4.09%, 0.54% 3.38%, 0.48% 2.23%, 0.83% 1.42%, 0.61% 0.55%, 0.15% 0.00%); }
.post-v2.v2-edge-3 .v2-content > div:nth-child(3n) .post-img-paper { clip-path: polygon(0.00% 0.64%, 1.17% 0.29%, 2.21% 0.47%, 3.17% 0.10%, 3.69% 0.24%, 4.71% 0.15%, 5.56% 0.17%, 6.66% 0.53%, 7.44% 0.57%, 7.98% 0.48%, 9.09% 0.16%, 10.09% 0.43%, 11.26% 0.30%, 12.13% 0.72%, 13.08% 0.46%, 13.64% 0.83%, 14.47% 0.91%, 15.07% 0.83%, 16.14% 0.93%, 16.65% 0.64%, 17.19% 0.86%, 17.94% 0.98%, 18.70% 0.87%, 19.81% 0.56%, 20.70% 0.93%, 21.56% 0.57%, 22.25% 0.78%, 22.89% 0.64%, 23.78% 0.57%, 24.37% 0.59%, 25.51% 0.34%, 26.24% 0.63%, 27.14% 0.23%, 27.65% 0.48%, 28.40% 0.29%, 29.09% 0.37%, 30.10% 0.17%, 30.65% 0.54%, 31.79% 0.02%, 32.68% 0.40%, 33.46% 0.45%, 34.63% 0.42%, 35.41% 0.25%, 36.08% 0.26%, 36.66% 0.32%, 37.75% 0.56%, 38.82% 0.83%, 39.88% 0.40%, 41.03% 0.47%, 42.07% 0.90%, 43.03% 0.67%, 43.58% 0.50%, 44.53% 0.57%, 45.40% 0.56%, 46.02% 0.56%, 47.02% 0.62%, 47.80% 0.58%, 48.69% 0.55%, 49.50% 0.76%, 50.52% 0.29%, 51.25% 0.23%, 52.00% 0.11%, 53.02% 0.36%, 53.82% 0.52%, 54.55% 0.33%, 55.70% 0.31%, 56.63% 0.21%, 57.83% 0.45%, 58.54% 0.25%, 59.45% 0.38%, 60.32% 0.24%, 61.22% 0.57%, 62.26% 0.49%, 63.07% 0.56%, 63.95% 0.59%, 64.45% 0.50%, 65.65% 0.86%, 66.47% 0.84%, 67.12% 0.59%, 67.98% 0.83%, 68.50% 0.71%, 69.64% 0.77%, 70.83% 0.46%, 71.97% 0.82%, 72.49% 0.63%, 73.52% 0.40%, 74.47% 0.69%, 75.53% 0.40%, 76.07% 0.43%, 76.70% 0.40%, 77.39% 0.27%, 78.27% 0.49%, 79.45% 0.23%, 79.96% 0.42%, 80.69% 0.42%, 81.78% 0.03%, 82.79% 0.19%, 83.51% 0.24%, 84.39% 0.22%, 85.24% 0.28%, 85.82% 0.30%, 86.80% 0.38%, 87.44% 0.45%, 88.09% 0.83%, 89.14% 0.42%, 89.85% 0.61%, 90.72% 0.62%, 91.58% 0.85%, 92.19% 0.75%, 92.81% 0.74%, 93.53% 0.89%, 94.64% 0.96%, 95.43% 0.76%, 96.05% 0.79%, 97.09% 0.59%, 97.82% 0.73%, 98.84% 0.70%, 99.54% 0.36%, 100.00% 0.10%, 99.70% 0.00%, 99.48% 0.84%, 99.45% 1.97%, 99.12% 2.59%, 99.42% 3.14%, 99.40% 4.17%, 99.14% 5.35%, 99.08% 6.06%, 99.28% 7.21%, 99.51% 7.81%, 99.12% 8.88%, 99.22% 9.84%, 99.57% 10.89%, 99.25% 11.54%, 99.55% 12.63%, 99.79% 13.32%, 99.37% 14.10%, 99.73% 14.75%, 99.61% 15.27%, 99.58% 15.81%, 99.74% 16.66%, 99.82% 17.34%, 99.48% 18.46%, 99.88% 19.49%, 99.78% 20.14%, 99.43% 21.25%, 99.58% 21.91%, 99.64% 22.68%, 99.46% 23.31%, 99.29% 24.36%, 99.51% 25.20%, 99.63% 26.15%, 99.22% 27.27%, 99.40% 27.93%, 99.12% 28.77%, 99.43% 29.75%, 99.04% 30.92%, 99.29% 32.02%, 99.35% 32.85%, 99.34% 34.03%, 99.56% 35.21%, 99.43% 35.73%, 99.58% 36.37%, 99.68% 36.89%, 99.75% 37.70%, 99.50% 38.41%, 99.70% 39.09%, 99.76% 39.85%, 99.52% 40.75%, 99.67% 41.27%, 99.48% 42.14%, 99.85% 43.14%, 99.50% 44.07%, 99.56% 45.23%, 99.76% 45.81%, 99.76% 46.65%, 99.62% 47.68%, 99.83% 48.86%, 99.71% 49.93%, 99.64% 50.79%, 99.35% 51.56%, 99.60% 52.73%, 99.54% 53.50%, 99.49% 54.52%, 99.11% 55.16%, 99.06% 55.69%, 99.00% 56.38%, 99.50% 56.96%, 99.40% 57.79%, 99.43% 58.74%, 99.62% 59.47%, 99.65% 60.03%, 99.21% 60.86%, 99.56% 61.73%, 99.37% 62.55%, 99.80% 63.66%, 99.73% 64.62%, 99.55% 65.77%, 99.61% 66.68%, 99.96% 67.71%, 99.98% 68.44%, 99.49% 69.05%, 99.88% 69.95%, 99.74% 70.65%, 99.51% 71.21%, 99.89% 71.98%, 99.66% 72.84%, 99.69% 73.87%, 99.52% 74.54%, 99.68% 75.32%, 99.22% 76.34%, 99.28% 77.42%, 99.17% 78.25%, 99.53% 78.90%, 99.28% 79.54%, 99.32% 80.19%, 99.21% 81.26%, 99.49% 81.90%, 99.53% 82.40%, 99.19% 83.08%, 99.40% 84.16%, 99.33% 84.69%, 99.68% 85.86%, 99.19% 86.80%, 99.46% 87.53%, 99.48% 88.59%, 99.44% 89.21%, 99.56% 90.12%, 99.50% 91.04%, 99.47% 91.94%, 99.98% 92.52%, 99.72% 93.12%, 99.49% 94.12%, 99.99% 94.63%, 99.62% 95.39%, 99.80% 96.17%, 99.54% 96.81%, 99.37% 97.74%, 99.59% 98.47%, 99.40% 99.64%, 99.64% 100.00%, 100.00% 99.65%, 99.43% 99.46%, 98.71% 99.63%, 97.70% 99.69%, 96.89% 99.59%, 96.38% 99.46%, 95.69% 99.84%, 94.83% 99.84%, 94.31% 99.91%, 93.78% 99.79%, 93.05% 99.88%, 92.43% 99.54%, 91.53% 99.66%, 91.02% 99.48%, 90.50% 99.55%, 89.54% 99.72%, 88.81% 99.62%, 87.90% 99.41%, 87.36% 99.79%, 86.42% 99.63%, 85.52% 99.53%, 84.99% 99.26%, 84.36% 99.49%, 83.34% 99.13%, 82.24% 99.08%, 81.52% 99.44%, 80.70% 99.10%, 79.74% 99.21%, 78.75% 99.44%, 77.85% 99.34%, 76.74% 99.45%, 75.85% 99.31%, 74.86% 99.28%, 73.84% 99.69%, 72.66% 99.81%, 71.65% 99.72%, 71.08% 99.71%, 70.50% 99.82%, 69.32% 99.53%, 68.56% 99.72%, 67.64% 99.82%, 67.05% 99.76%, 65.96% 99.46%, 65.03% 99.52%, 64.24% 99.50%, 63.17% 99.39%, 62.54% 99.56%, 61.99% 99.50%, 61.15% 99.45%, 60.28% 99.54%, 59.68% 99.52%, 58.64% 99.49%, 57.46% 99.13%, 56.78% 99.33%, 55.72% 99.55%, 54.68% 99.33%, 53.71% 99.56%, 52.75% 99.55%, 52.05% 99.27%, 51.11% 99.45%, 50.43% 99.48%, 49.72% 99.59%, 49.04% 99.48%, 48.02% 99.36%, 47.24% 99.33%, 46.50% 99.43%, 45.43% 99.52%, 44.29% 99.64%, 43.18% 99.85%, 42.32% 99.69%, 41.45% 99.96%, 40.77% 99.63%, 40.01% 99.57%, 39.00% 99.62%, 38.41% 99.65%, 37.26% 99.66%, 36.70% 99.38%, 35.94% 99.65%, 35.08% 99.21%, 34.19% 99.55%, 33.68% 99.41%, 33.00% 99.09%, 31.88% 99.04%, 30.74% 99.40%, 29.79% 99.25%, 28.92% 99.26%, 28.27% 99.48%, 27.73% 99.20%, 27.11% 99.13%, 26.16% 99.47%, 25.03% 99.65%, 24.39% 99.30%, 23.63% 99.28%, 22.79% 99.82%, 21.64% 99.34%, 20.82% 99.53%, 19.84% 99.90%, 18.81% 99.72%, 17.83% 100.00%, 17.04% 99.89%, 15.89% 99.97%, 15.37% 99.79%, 14.30% 99.83%, 13.33% 99.46%, 12.41% 99.63%, 11.39% 99.72%, 10.70% 99.28%, 10.05% 99.57%, 9.45% 99.39%, 8.30% 99.55%, 7.44% 99.10%, 6.88% 99.31%, 6.17% 99.26%, 5.01% 99.03%, 4.28% 99.44%, 3.42% 99.05%, 2.75% 99.43%, 1.98% 99.09%, 1.27% 99.53%, 0.49% 99.37%, 0.00% 99.61%, 0.73% 100.00%, 0.93% 99.25%, 0.70% 98.07%, 0.66% 97.29%, 0.50% 96.35%, 0.54% 95.82%, 0.55% 94.92%, 0.63% 94.31%, 0.79% 93.14%, 0.34% 92.46%, 0.65% 91.49%, 0.43% 90.90%, 0.64% 90.18%, 0.19% 89.02%, 0.10% 87.85%, 0.52% 87.17%, 0.53% 86.43%, 0.35% 85.52%, 0.42% 84.38%, 0.27% 83.65%, 0.20% 82.91%, 0.49% 82.18%, 0.17% 81.38%, 0.57% 80.31%, 0.58% 79.17%, 0.74% 78.43%, 0.67% 77.44%, 0.60% 76.52%, 0.43% 75.82%, 0.72% 75.02%, 0.96% 74.40%, 0.63% 73.26%, 0.49% 72.66%, 0.84% 71.72%, 0.83% 70.92%, 0.55% 70.25%, 0.36% 69.59%, 0.81% 69.08%, 0.34% 68.48%, 0.42% 67.53%, 0.20% 66.65%, 0.42% 66.11%, 0.19% 64.94%, 0.49% 64.34%, 0.32% 63.32%, 0.19% 62.31%, 0.18% 61.65%, 0.31% 60.95%, 0.45% 59.92%, 0.14% 58.96%, 0.20% 57.96%, 0.33% 57.37%, 0.37% 56.17%, 0.63% 55.20%, 0.35% 54.25%, 0.68% 53.30%, 0.41% 52.61%, 0.75% 52.06%, 0.42% 50.92%, 0.87% 50.14%, 0.87% 49.04%, 0.64% 48.43%, 0.66% 47.89%, 0.57% 46.87%, 0.54% 45.69%, 0.66% 44.84%, 0.71% 43.98%, 0.71% 43.12%, 0.74% 42.21%, 0.65% 41.13%, 0.46% 39.97%, 0.16% 39.17%, 0.31% 38.50%, 0.28% 37.47%, 0.16% 36.93%, 0.10% 36.05%, 0.18% 34.93%, 0.52% 34.35%, 0.16% 33.53%, 0.35% 32.96%, 0.29% 31.81%, 0.63% 31.05%, 0.64% 30.10%, 0.71% 29.60%, 0.52% 28.41%, 0.43% 27.34%, 0.89% 26.66%, 0.62% 26.01%, 0.51% 25.28%, 0.49% 24.15%, 0.63% 22.99%, 0.62% 22.02%, 0.74% 21.32%, 0.72% 20.17%, 0.68% 19.52%, 0.83% 18.55%, 0.75% 17.77%, 0.75% 16.95%, 0.31% 16.06%, 0.61% 15.06%, 0.28% 14.46%, 0.55% 13.62%, 0.15% 12.49%, 0.36% 11.53%, 0.03% 10.64%, 0.51% 9.84%, 0.54% 9.15%, 0.28% 8.11%, 0.20% 7.45%, 0.48% 6.34%, 0.43% 5.26%, 0.43% 4.32%, 0.54% 3.70%, 0.58% 3.06%, 0.45% 2.32%, 0.88% 1.60%, 0.90% 0.49%, 0.23% 0.00%); }
.post-v2.v2-edge-3 .v2-content > div:nth-child(3n + 1) .post-img-paper { clip-path: polygon(0.00% 0.66%, 0.60% 0.57%, 1.57% 0.79%, 2.39% 0.67%, 2.90% 0.65%, 3.66% 0.90%, 4.55% 0.86%, 5.35% 0.55%, 6.44% 0.89%, 7.21% 0.48%, 8.07% 0.67%, 9.11% 0.68%, 9.96% 0.63%, 10.73% 0.30%, 11.27% 0.76%, 12.36% 0.34%, 13.48% 0.41%, 14.05% 0.56%, 14.96% 0.57%, 15.93% 0.08%, 16.87% 0.44%, 18.00% 0.18%, 18.87% 0.39%, 19.49% 0.49%, 20.53% 0.08%, 21.45% 0.29%, 22.08% 0.45%, 23.26% 0.48%, 23.84% 0.49%, 24.88% 0.80%, 25.88% 0.35%, 27.06% 0.71%, 27.62% 0.47%, 28.18% 0.78%, 28.78% 0.88%, 29.36% 0.74%, 30.17% 0.47%, 30.67% 0.95%, 31.86% 0.50%, 32.87% 0.95%, 34.00% 0.85%, 34.74% 0.72%, 35.59% 0.79%, 36.58% 0.69%, 37.68% 0.37%, 38.68% 0.16%, 39.32% 0.60%, 40.11% 0.43%, 41.01% 0.17%, 41.92% 0.51%, 42.65% 0.19%, 43.28% 0.10%, 44.36% 0.41%, 45.53% 0.42%, 46.71% 0.22%, 47.34% 0.25%, 48.11% 0.72%, 48.76% 0.46%, 49.31% 0.25%, 50.19% 0.63%, 51.05% 0.84%, 52.15% 0.91%, 53.05% 0.56%, 53.64% 0.85%, 54.25% 0.45%, 55.24% 0.52%, 56.18% 0.56%, 56.97% 0.44%, 57.74% 0.59%, 58.42% 0.46%, 59.32% 0.73%, 59.96% 0.34%, 60.65% 0.66%, 61.34% 0.59%, 61.89% 0.59%, 62.49% 0.30%, 63.50% 0.38%, 64.45% 0.23%, 65.42% 0.20%, 66.26% 0.26%, 67.40% 0.42%, 68.28% 0.47%, 69.21% 0.41%, 70.07% 0.35%, 70.72% 0.57%, 71.67% 0.55%, 72.59% 0.16%, 73.17% 0.66%, 74.16% 0.73%, 75.28% 0.42%, 76.47% 0.69%, 77.48% 0.68%, 78.16% 0.68%, 78.99% 0.60%, 79.72% 0.69%, 80.41% 0.53%, 81.47% 0.64%, 82.23% 0.86%, 83.22% 0.64%, 83.94% 0.80%, 84.60% 0.59%, 85.36% 0.84%, 86.03% 0.58%, 86.90% 0.23%, 87.53% 0.66%, 88.58% 0.23%, 89.20% 0.60%, 90.12% 0.44%, 91.25% 0.16%, 92.10% 0.51%, 92.73% 0.14%, 93.85% 0.47%, 94.71% 0.10%, 95.79% 0.23%, 96.82% 0.24%, 97.43% 0.52%, 98.21% 0.38%, 99.01% 0.47%, 99.84% 0.62%, 100.00% 0.34%, 99.31% 0.00%, 99.43% 0.70%, 99.45% 1.34%, 99.58% 2.32%, 99.40% 3.16%, 99.91% 3.91%, 99.95% 4.64%, 99.54% 5.76%, 99.65% 6.39%, 99.53% 7.04%, 99.96% 7.83%, 99.92% 8.77%, 99.42% 9.90%, 99.75% 10.83%, 99.81% 11.87%, 99.63% 12.45%, 99.29% 13.00%, 99.27% 13.97%, 99.54% 14.93%, 99.30% 15.62%, 99.25% 16.67%, 99.13% 17.40%, 99.21% 18.19%, 99.19% 19.28%, 99.23% 20.10%, 99.33% 20.75%, 99.33% 21.83%, 99.17% 22.34%, 99.63% 22.95%, 99.27% 23.85%, 99.48% 24.43%, 99.70% 25.26%, 99.68% 26.20%, 99.60% 27.18%, 99.79% 28.05%, 99.95% 29.08%, 99.92% 29.80%, 99.98% 30.36%, 99.96% 31.23%, 99.76% 31.81%, 99.88% 32.78%, 99.66% 33.74%, 99.48% 34.89%, 99.68% 36.08%, 99.64% 37.20%, 99.54% 37.90%, 99.35% 38.42%, 99.38% 38.98%, 99.45% 39.52%, 99.13% 40.20%, 99.42% 40.91%, 99.52% 41.62%, 99.40% 42.57%, 99.38% 43.26%, 99.11% 44.01%, 99.48% 44.66%, 99.25% 45.39%, 99.52% 46.09%, 99.07% 46.84%, 99.40% 47.97%, 99.59% 48.77%, 99.34% 49.74%, 99.43% 50.42%, 99.64% 50.99%, 99.41% 51.69%, 99.61% 52.63%, 99.63% 53.43%, 99.82% 54.27%, 99.55% 55.35%, 99.78% 56.12%, 99.99% 57.27%, 99.89% 58.31%, 99.77% 58.94%, 99.75% 59.88%, 99.61% 60.74%, 99.51% 61.88%, 99.44% 62.57%, 99.57% 63.46%, 99.68% 64.47%, 99.15% 65.66%, 99.22% 66.20%, 99.04% 66.79%, 99.16% 67.61%, 99.20% 68.29%, 99.11% 68.81%, 99.46% 69.50%, 99.28% 70.30%, 99.48% 70.84%, 99.29% 71.60%, 99.56% 72.59%, 99.48% 73.67%, 99.54% 74.86%, 99.59% 75.68%, 99.31% 76.23%, 99.46% 77.15%, 99.63% 77.75%, 99.78% 78.45%, 99.62% 79.23%, 99.60% 80.05%, 99.67% 81.24%, 99.47% 82.30%, 99.78% 83.48%, 99.56% 84.57%, 99.47% 85.08%, 99.37% 86.21%, 99.43% 86.95%, 99.52% 88.02%, 99.50% 88.97%, 99.37% 90.12%, 99.39% 90.79%, 99.38% 91.70%, 99.22% 92.43%, 99.29% 93.15%, 99.38% 93.71%, 99.29% 94.29%, 99.35% 95.02%, 99.02% 95.54%, 99.57% 96.19%, 99.59% 97.10%, 99.15% 98.00%, 99.41% 98.54%, 99.60% 99.62%, 99.97% 100.00%, 100.00% 99.57%, 99.20% 99.81%, 98.01% 99.86%, 96.95% 99.54%, 96.14% 99.53%, 95.41% 99.43%, 94.38% 99.54%, 93.30% 99.46%, 92.19% 99.57%, 91.43% 99.20%, 90.62% 99.51%, 89.56% 99.43%, 88.77% 99.28%, 88.20% 99.12%, 87.28% 99.53%, 86.71% 99.39%, 85.91% 99.11%, 84.85% 99.15%, 83.84% 99.30%, 83.28% 99.41%, 82.26% 99.63%, 81.59% 99.67%, 80.86% 99.54%, 80.02% 99.67%, 79.14% 99.75%, 78.09% 99.41%, 77.30% 99.42%, 76.33% 99.64%, 75.39% 99.73%, 74.79% 99.50%, 74.13% 99.52%, 73.36% 99.70%, 72.43% 99.79%, 71.24% 99.49%, 70.47% 99.75%, 69.35% 99.37%, 68.60% 99.77%, 67.72% 99.54%, 66.91% 99.42%, 66.40% 99.41%, 65.42% 99.37%, 64.92% 99.33%, 63.78% 99.22%, 62.92% 99.37%, 62.27% 99.31%, 61.10% 99.47%, 60.16% 99.27%, 59.60% 99.43%, 58.92% 99.53%, 58.35% 99.15%, 57.64% 99.26%, 56.80% 99.39%, 55.98% 99.69%, 55.43% 99.67%, 54.36% 99.42%, 53.18% 99.49%, 52.53% 99.58%, 51.56% 99.79%, 50.77% 99.53%, 50.13% 99.97%, 49.00% 99.81%, 48.08% 99.46%, 47.44% 99.85%, 46.71% 99.82%, 45.86% 99.94%, 44.79% 99.36%, 44.14% 99.65%, 43.38% 99.44%, 42.59% 99.31%, 41.43% 99.58%, 40.85% 99.36%, 40.30% 99.44%, 39.67% 99.18%, 38.88% 99.14%, 37.97% 99.16%, 37.00% 99.12%, 35.99% 99.11%, 35.21% 99.46%, 34.55% 99.12%, 33.97% 99.16%, 33.44% 99.59%, 32.42% 99.24%, 31.37% 99.49%, 30.39% 99.34%, 29.73% 99.71%, 29.19% 99.64%, 28.15% 99.74%, 27.06% 99.56%, 25.90% 99.81%, 24.72% 99.56%, 24.18% 99.85%, 23.60% 99.82%, 22.69% 99.46%, 21.59% 99.80%, 20.68% 99.67%, 20.17% 99.77%, 19.32% 99.60%, 18.32% 99.66%, 17.13% 99.26%, 16.42% 99.65%, 15.76% 99.49%, 14.93% 99.41%, 14.00% 99.21%, 13.50% 99.52%, 12.69% 99.29%, 11.67% 99.14%, 10.90% 99.20%, 10.19% 99.28%, 9.11% 99.17%, 8.59% 99.19%, 7.69% 99.14%, 7.15% 99.65%, 6.44% 99.15%, 5.70% 99.42%, 5.05% 99.48%, 4.01% 99.65%, 3.46% 99.52%, 2.90% 99.86%, 2.29% 99.72%, 1.68% 99.41%, 0.70% 99.55%, 0.00% 99.84%, 0.26% 100.00%, 0.49% 99.40%, 0.75% 98.53%, 0.85% 97.38%, 0.81% 96.46%, 0.96% 95.29%, 0.83% 94.35%, 0.92% 93.26%, 0.74% 92.39%, 0.54% 91.21%, 0.90% 90.48%, 0.64% 89.62%, 0.27% 88.85%, 0.66% 87.95%, 0.24% 87.14%, 0.17% 86.58%, 0.43% 85.48%, 0.50% 84.42%, 0.33% 83.90%, 0.17% 83.29%, 0.29% 82.66%, 0.05% 81.93%, 0.47% 80.87%, 0.51% 79.99%, 0.14% 79.11%, 0.39% 78.05%, 0.18% 77.28%, 0.34% 76.19%, 0.38% 75.01%, 0.64% 74.32%, 0.86% 73.33%, 0.44% 72.62%, 0.61% 71.55%, 0.60% 70.97%, 0.46% 70.23%, 0.91% 69.04%, 0.69% 68.14%, 0.73% 67.62%, 0.85% 66.88%, 0.55% 66.27%, 0.89% 65.24%, 0.48% 64.37%, 0.78% 63.39%, 0.32% 62.87%, 0.50% 62.27%, 0.31% 61.19%, 0.08% 60.11%, 0.17% 59.55%, 0.35% 58.46%, 0.39% 57.92%, 0.24% 56.81%, 0.49% 55.97%, 0.17% 55.34%, 0.18% 54.25%, 0.13% 53.22%, 0.36% 52.58%, 0.32% 51.71%, 0.24% 51.16%, 0.42% 50.07%, 0.71% 49.33%, 0.59% 48.34%, 0.63% 47.67%, 0.75% 46.58%, 0.61% 45.89%, 0.94% 44.88%, 0.69% 44.16%, 0.75% 43.50%, 0.85% 42.62%, 0.86% 41.50%, 0.63% 40.35%, 0.76% 39.78%, 0.35% 39.25%, 0.62% 38.29%, 0.32% 37.22%, 0.37% 36.21%, 0.50% 35.69%, 0.26% 34.73%, 0.11% 33.94%, 0.14% 32.87%, 0.43% 32.22%, 0.34% 31.46%, 0.28% 30.59%, 0.30% 29.66%, 0.33% 29.11%, 0.09% 28.23%, 0.64% 27.73%, 0.21% 27.00%, 0.42% 26.43%, 0.69% 25.32%, 0.69% 24.47%, 0.74% 23.49%, 0.59% 22.37%, 0.82% 21.52%, 0.89% 20.50%, 0.82% 19.94%, 0.79% 18.91%, 0.61% 17.99%, 0.55% 17.24%, 0.44% 16.73%, 0.93% 16.18%, 0.86% 15.31%, 0.67% 14.49%, 0.28% 13.47%, 0.25% 12.55%, 0.31% 11.99%, 0.53% 10.87%, 0.24% 10.28%, 0.18% 9.52%, 0.24% 8.79%, 0.53% 7.74%, 0.38% 7.10%, 0.54% 6.46%, 0.38% 5.37%, 0.22% 4.35%, 0.42% 3.81%, 0.58% 3.30%, 0.58% 2.11%, 0.22% 1.47%, 0.73% 0.48%, 0.24% 0.00%); }
.post-v2 .v2-content figcaption { color: var(--v2-muted); font-size: 0.85rem; font-weight: 300; text-align: center; }
.post-v2 .v2-content blockquote {
  border-left: 4px solid var(--v2-green);
  border-radius: 0;
  background: #fff;
}
.post-v2 .v2-content table { background: #fff; font-weight: 300; }
.post-v2 .v2-content thead tr { background: #e7efec; }
.post-v2 .v2-content th { color: var(--v2-ink); font-family: 'Saira Condensed', 'Arial Narrow', sans-serif; font-size: 1.05rem; text-transform: uppercase; }
.post-v2 .v2-content a[class*='bg-red-600'] {
  border-radius: 0.375rem;
  background: var(--v2-red);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif;
  font-size: 1.15rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  box-shadow: none;
}
.post-v2 .v2-content .not-prose.text-center { text-align: left; }
</style>
