<template>
  <div :class="['min-h-screen font-sans', isV2 ? 'post-v2' : 'bg-gray-50']">
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

        <!-- BỐ CỤC MỚI (xem thử: thêm ?layout=new vào địa chỉ bài). Căn trái,
             tiêu đề chữ hẹp viết hoa, ba ô thông tin, ảnh bìa nằm bên phải
             phần mở đầu. Chưa bật mặc định — chờ chủ duyệt. -->
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
            <NuxtImg
              :src="cloudinaryImage(post.image || post.thumbnailUrl, 1200)"
              :alt="displayTitle"
              loading="eager"
              fetchpriority="high"
              decoding="async"
              format="webp"
            />
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
                    <NuxtImg
                      :src="block.data.url"
                      :alt="block.data?.alt || displayTitle"
                      class="w-full rounded-2xl shadow-lg"
                      loading="lazy"
                      decoding="async"
                      format="webp"
                    />
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

/** Bố cục mới — chỉ bật khi địa chỉ có ?layout=new (bản xem thử cho chủ). */
const isV2 = computed(() => route.query.layout === 'new')

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
      // Font của bố cục mới — chỉ nạp khi đang xem thử (?layout=new)
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
/* ===== Bố cục bài viết kiểu mới (?layout=new) ===== */
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
  max-width: 18ch;
  margin-bottom: 1.25rem;
  color: var(--v2-ink);
  font-family: 'Saira Condensed', 'Arial Narrow', 'Lexend', sans-serif;
  font-size: clamp(2.5rem, 7.2vw, 5rem);
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
  font-size: clamp(1.8rem, 3.6vw, 2.6rem);
  font-weight: 700;
  line-height: 1.05;
  text-transform: uppercase;
}
.post-v2 .v2-content h3 {
  margin: 2rem 0 0.6rem;
  color: var(--v2-ink);
  font-family: 'Saira Condensed', 'Arial Narrow', sans-serif;
  font-size: 1.6rem;
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
   hình nhìn không hết). Mép ảnh kiểu GIẤY XÉ (chủ 06/10): mask SVG làm mép
   lởm chởm không đều; bóng đổ đặt ở lớp bọc ngoài (figure / .post-img-wrap)
   vì mask trên ảnh sẽ cắt mất bóng của chính nó. Ba mẫu mép xoay vòng để
   các ảnh trong cùng bài không xé giống hệt nhau. */
.post-v2 .v2-content figure { text-align: center; }
.post-v2 .v2-content figure .post-img-wrap {
  display: inline-block;
  max-width: 100%;
  filter: drop-shadow(0 7px 9px rgba(19, 36, 28, 0.32));
}
.post-v2 .v2-content figure img {
  display: inline-block;
  width: auto;
  max-width: 100%;
  max-height: min(66vh, 560px);
  object-fit: cover;
  border-radius: 0;
  box-shadow: none;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='none'%3E%3Cfilter%20id='t'%20x='-10%25'%20y='-10%25'%20width='120%25'%20height='120%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.11'%20numOctaves='3'%20seed='7'%20result='n'/%3E%3CfeDisplacementMap%20in='SourceGraphic'%20in2='n'%20scale='5'%20xChannelSelector='R'%20yChannelSelector='G'/%3E%3C/filter%3E%3Crect%20x='3'%20y='3'%20width='94'%20height='94'%20fill='black'%20filter='url%28%23t%29'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='none'%3E%3Cfilter%20id='t'%20x='-10%25'%20y='-10%25'%20width='120%25'%20height='120%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.11'%20numOctaves='3'%20seed='7'%20result='n'/%3E%3CfeDisplacementMap%20in='SourceGraphic'%20in2='n'%20scale='5'%20xChannelSelector='R'%20yChannelSelector='G'/%3E%3C/filter%3E%3Crect%20x='3'%20y='3'%20width='94'%20height='94'%20fill='black'%20filter='url%28%23t%29'/%3E%3C/svg%3E");
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}
.post-v2 .v2-content > div:nth-child(3n) figure img {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='none'%3E%3Cfilter%20id='t'%20x='-10%25'%20y='-10%25'%20width='120%25'%20height='120%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.09'%20numOctaves='3'%20seed='23'%20result='n'/%3E%3CfeDisplacementMap%20in='SourceGraphic'%20in2='n'%20scale='5.5'%20xChannelSelector='R'%20yChannelSelector='G'/%3E%3C/filter%3E%3Crect%20x='3'%20y='3'%20width='94'%20height='94'%20fill='black'%20filter='url%28%23t%29'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='none'%3E%3Cfilter%20id='t'%20x='-10%25'%20y='-10%25'%20width='120%25'%20height='120%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.09'%20numOctaves='3'%20seed='23'%20result='n'/%3E%3CfeDisplacementMap%20in='SourceGraphic'%20in2='n'%20scale='5.5'%20xChannelSelector='R'%20yChannelSelector='G'/%3E%3C/filter%3E%3Crect%20x='3'%20y='3'%20width='94'%20height='94'%20fill='black'%20filter='url%28%23t%29'/%3E%3C/svg%3E");
}
.post-v2 .v2-content > div:nth-child(3n + 1) figure img {
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='none'%3E%3Cfilter%20id='t'%20x='-10%25'%20y='-10%25'%20width='120%25'%20height='120%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.1'%20numOctaves='3'%20seed='41'%20result='n'/%3E%3CfeDisplacementMap%20in='SourceGraphic'%20in2='n'%20scale='5'%20xChannelSelector='R'%20yChannelSelector='G'/%3E%3C/filter%3E%3Crect%20x='3'%20y='3'%20width='94'%20height='94'%20fill='black'%20filter='url%28%23t%29'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='none'%3E%3Cfilter%20id='t'%20x='-10%25'%20y='-10%25'%20width='120%25'%20height='120%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.1'%20numOctaves='3'%20seed='41'%20result='n'/%3E%3CfeDisplacementMap%20in='SourceGraphic'%20in2='n'%20scale='5'%20xChannelSelector='R'%20yChannelSelector='G'/%3E%3C/filter%3E%3Crect%20x='3'%20y='3'%20width='94'%20height='94'%20fill='black'%20filter='url%28%23t%29'/%3E%3C/svg%3E");
}
.post-v2 .v2-content figure.v2-cover { filter: drop-shadow(0 8px 10px rgba(19, 36, 28, 0.32)); }
.post-v2 .v2-content figure.v2-cover img {
  display: block;
  width: 100%;
  max-height: 62vh;
  aspect-ratio: 4 / 3;
  -webkit-mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='none'%3E%3Cfilter%20id='t'%20x='-10%25'%20y='-10%25'%20width='120%25'%20height='120%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.09'%20numOctaves='3'%20seed='23'%20result='n'/%3E%3CfeDisplacementMap%20in='SourceGraphic'%20in2='n'%20scale='5.5'%20xChannelSelector='R'%20yChannelSelector='G'/%3E%3C/filter%3E%3Crect%20x='3'%20y='3'%20width='94'%20height='94'%20fill='black'%20filter='url%28%23t%29'/%3E%3C/svg%3E");
  mask-image: url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%20preserveAspectRatio='none'%3E%3Cfilter%20id='t'%20x='-10%25'%20y='-10%25'%20width='120%25'%20height='120%25'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.09'%20numOctaves='3'%20seed='23'%20result='n'/%3E%3CfeDisplacementMap%20in='SourceGraphic'%20in2='n'%20scale='5.5'%20xChannelSelector='R'%20yChannelSelector='G'/%3E%3C/filter%3E%3Crect%20x='3'%20y='3'%20width='94'%20height='94'%20fill='black'%20filter='url%28%23t%29'/%3E%3C/svg%3E");
}
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
