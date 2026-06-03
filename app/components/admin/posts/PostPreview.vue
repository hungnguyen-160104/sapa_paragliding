<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div>
        <p class="text-sm font-semibold text-slate-900">Chế độ xem trước</p>
        <p class="text-xs text-slate-500">Tiếng Việt dùng field <code>...Vi</code>, mọi ngôn ngữ khác dùng English</p>
      </div>

      <div class="inline-flex rounded-lg border border-slate-200 bg-white p-1">
        <button
          class="rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="previewLocale === 'vi' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
          @click="previewLocale = 'vi'"
        >
          Tiếng Việt
        </button>
        <button
          class="rounded-md px-3 py-1.5 text-sm font-medium transition"
          :class="previewLocale === 'en' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'"
          @click="previewLocale = 'en'"
        >
          English / Other locales
        </button>
      </div>
    </div>

    <article class="max-w-none">
      <div v-if="post.thumbnailUrl" class="mb-6 overflow-hidden rounded-xl">
        <img :src="post.thumbnailUrl" :alt="displayTitle" class="aspect-video w-full object-cover" />
      </div>

      <div v-if="post.categoryId" class="mb-3">
        <span class="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
          {{ getCategoryLabel(post.categoryId) }}
        </span>
      </div>

      <h1 class="mb-4 text-3xl font-bold text-slate-900">
        {{ displayTitle || (previewLocale === 'vi' ? 'Tiêu đề tiếng Việt' : 'English title') }}
      </h1>

      <p v-if="displayExcerpt" class="mb-6 text-lg leading-relaxed text-slate-600">
        {{ displayExcerpt }}
      </p>

      <hr class="my-6 border-slate-200" />

      <div class="prose prose-slate max-w-none">
        <template v-if="displayBlocks.length > 0">
          <template v-for="block in displayBlocks" :key="block.id">
            <component
              v-if="block.type === 'heading'"
              :is="`h${block.data?.level || 2}`"
              class="font-bold text-slate-900"
            >
              {{ block.data?.text || '' }}
            </component>

            <p v-else-if="block.type === 'paragraph'" class="whitespace-pre-line leading-relaxed text-slate-700">
              {{ block.data?.text || '' }}
            </p>

            <figure v-else-if="block.type === 'image' && block.data?.url" class="my-6">
              <img :src="block.data.url" :alt="block.data?.alt || displayTitle" class="w-full rounded-lg" />
              <figcaption v-if="block.data?.caption" class="mt-2 text-center text-sm text-slate-500">
                {{ block.data.caption }}
              </figcaption>
            </figure>

            <blockquote v-else-if="block.type === 'quote'" class="my-6 border-l-4 border-red-500 pl-4 italic">
              <p class="text-slate-700">{{ block.data?.text || '' }}</p>
              <cite v-if="block.data?.author" class="not-italic text-sm text-slate-500">— {{ block.data.author }}</cite>
            </blockquote>

            <ul v-else-if="block.type === 'bulletList'" class="my-4 list-inside list-disc space-y-1">
              <li v-for="(item, i) in block.data?.items || []" :key="i" class="text-slate-700">
                {{ item }}
              </li>
            </ul>

            <hr v-else-if="block.type === 'divider'" class="my-8 border-slate-300" />

            <div v-else-if="block.type === 'video'" class="my-6">
              <div v-if="getVideoEmbedUrl(block.data?.url)" class="aspect-video overflow-hidden rounded-xl bg-black">
                <iframe :src="getVideoEmbedUrl(block.data?.url)!" class="h-full w-full" frameborder="0" allowfullscreen />
              </div>
              <div v-else class="flex aspect-video items-center justify-center rounded-xl bg-slate-100 text-slate-400 text-sm">
                ▶ Dán link YouTube / Vimeo để xem preview
              </div>
              <p v-if="block.data?.caption" class="mt-2 text-center text-xs text-slate-500 italic">{{ block.data.caption }}</p>
            </div>

            <div v-else-if="block.type === 'linkCard'" class="my-4">
              <div class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 text-lg">🔗</div>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-sm font-semibold text-slate-800">{{ block.data?.title || block.data?.url || 'Link Card' }}</p>
                  <p v-if="block.data?.description" class="truncate text-xs text-slate-500">{{ block.data.description }}</p>
                  <p class="truncate text-xs text-red-400">{{ block.data?.url }}</p>
                </div>
              </div>
            </div>

            <div v-else-if="block.type === 'cta'" class="my-6 rounded-xl bg-red-50 p-6 text-center">
              <a
                :href="block.data?.link || '#'"
                class="inline-block rounded-lg bg-red-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-700"
              >
                {{ block.data?.text || (previewLocale === 'vi' ? 'Nút CTA' : 'CTA button') }}
              </a>
            </div>
          </template>
        </template>

        <div v-else class="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
          Chưa có block nội dung cho ngôn ngữ này.
        </div>
      </div>

      <div v-if="normalizedGallery.length > 0" class="mt-8">
        <h3 class="mb-4 text-xl font-bold text-slate-900">
          {{ previewLocale === 'vi' ? '📷 Thư viện ảnh' : '📷 Gallery' }}
        </h3>

        <div class="grid grid-cols-2 gap-3 md:grid-cols-3">
          <div
            v-for="(image, index) in normalizedGallery"
            :key="`${image.url}-${index}`"
            class="aspect-square overflow-hidden rounded-lg"
          >
            <img :src="image.url" :alt="image.caption || displayTitle" class="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

type BlockData = {
  level?: number
  text?: string
  url?: string
  caption?: string
  alt?: string
  author?: string
  items?: string[]
  type?: string
  link?: string
}

type ContentBlock = {
  id: string | number
  type: string
  data?: BlockData
}

type GalleryObject = {
  url: string
  caption?: string
}

type GalleryItem = string | GalleryObject

type NormalizedGalleryItem = {
  url: string
  caption: string
}

type PreviewPost = {
  title?: string
  titleVi?: string
  excerpt?: string
  excerptVi?: string
  thumbnailUrl?: string
  categoryId?: string
  contentBlocks?: ContentBlock[]
  contentBlocksVi?: ContentBlock[]
  galleryUrls?: GalleryItem[]
}

const props = defineProps<{
  post: PreviewPost
}>()

const previewLocale = ref<'vi' | 'en'>('vi')

function getVideoEmbedUrl(url?: string): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([^&\n?#]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

const categories: Record<string, { vi: string; en: string }> = {
  news: { vi: 'Tin tức', en: 'News' },
  guide: { vi: 'Hướng dẫn', en: 'Guide' },
  experience: { vi: 'Trải nghiệm', en: 'Experience' },
  promotion: { vi: 'Khuyến mãi', en: 'Promotion' },
  adventure: { vi: 'Phiêu lưu', en: 'Adventure' },
  safety: { vi: 'An toàn', en: 'Safety' },
  tips: { vi: 'Mẹo hay', en: 'Tips' }
}

watchEffect(() => {
  if (!props.post?.titleVi && props.post?.title) {
    previewLocale.value = 'en'
  }
})

const displayTitle = computed(() => {
  if (previewLocale.value === 'vi') {
    return props.post.titleVi || props.post.title || ''
  }

  return props.post.title || props.post.titleVi || ''
})

const displayExcerpt = computed(() => {
  if (previewLocale.value === 'vi') {
    return props.post.excerptVi || props.post.excerpt || ''
  }

  return props.post.excerpt || props.post.excerptVi || ''
})

const displayBlocks = computed<ContentBlock[]>(() => {
  if (previewLocale.value === 'vi') {
    if (Array.isArray(props.post.contentBlocksVi) && props.post.contentBlocksVi.length > 0) {
      return props.post.contentBlocksVi
    }

    if (Array.isArray(props.post.contentBlocks)) {
      return props.post.contentBlocks
    }

    return []
  }

  if (Array.isArray(props.post.contentBlocks) && props.post.contentBlocks.length > 0) {
    return props.post.contentBlocks
  }

  if (Array.isArray(props.post.contentBlocksVi)) {
    return props.post.contentBlocksVi
  }

  return []
})

const normalizedGallery = computed<NormalizedGalleryItem[]>(() => {
  const rawGallery = Array.isArray(props.post.galleryUrls) ? props.post.galleryUrls : []

  return rawGallery
    .map((item): NormalizedGalleryItem | null => {
      if (typeof item === 'string') {
        return {
          url: item,
          caption: ''
        }
      }

      if (item && typeof item === 'object' && typeof item.url === 'string') {
        return {
          url: item.url,
          caption: item.caption ?? ''
        }
      }

      return null
    })
    .filter((item): item is NormalizedGalleryItem => item !== null)
})

function getCategoryLabel(id: string): string {
  const labels = categories[id]

  if (!labels) {
    return id
  }

  return previewLocale.value === 'vi' ? labels.vi : labels.en
}
</script>