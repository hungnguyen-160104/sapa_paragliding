<template>
  <div class="min-h-screen bg-gray-50 font-sans">

    <main class="py-12 md:py-20 px-4 sm:px-6">
      <article v-if="post" class="container-custom max-w-4xl mx-auto">

        <!-- Navigation -->
        <nav class="flex justify-between items-center mb-12">
          <button @click="goBack"
            class="group inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300">
            <svg class="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none"
              stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {{ $t('buttons.back') }}
          </button>
        </nav>

        <!-- Post Header -->
        <header class="max-w-3xl mx-auto text-center mb-16">
          <div class="inline-flex items-center justify-center mb-6">
            <span
              class="px-3 py-1 text-xs font-bold tracking-wide text-gray-900 bg-white border border-gray-200 rounded-full shadow-sm uppercase">
              {{ post.category }}
            </span>
          </div>

          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
            {{ currentLocale === 'vi' ? post.titleVi : post.title }}
          </h1>

          <div class="flex items-center justify-center space-x-2">
            <div class="flex items-center p-1 pr-4 bg-white rounded-full border border-gray-200 shadow-sm">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin&background=000000&color=fff" alt="Author"
                  class="w-full h-full object-cover" />
              </div>
              <div class="flex flex-col text-left">
                <span class="text-xs font-bold text-gray-900 leading-none">{{ post.author }}</span>
                <span class="text-[10px] text-gray-500 font-medium pt-0.5">Author</span>
              </div>
            </div>

            <div
              class="hidden sm:flex items-center px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm text-xs font-medium text-gray-500">
              <svg class="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ formatDate(post.date) }}
            </div>
          </div>
        </header>

        <!-- Featured Image -->
        <div class="mb-16 relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-200 border border-gray-100">
          <div class="aspect-video w-full bg-gray-100">
            <img :src="post.image" :alt="currentLocale === 'vi' ? post.titleVi : post.title"
              class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- Post Content -->
        <div
          class="prose prose-lg prose-slate max-w-prose mx-auto prose-headings:font-bold prose-headings:tracking-tight prose-a:text-red-600 hover:prose-a:text-red-700 prose-img:rounded-2xl prose-img:shadow-lg">
          
          <!-- Render contentBlocks if available -->
          <template v-if="post.contentBlocks && post.contentBlocks.length > 0">
            <div v-for="block in post.contentBlocks" :key="block.id" class="mb-6">
              <!-- Heading -->
              <template v-if="block.type === 'heading'">
                <h2 v-if="block.data.level === 2" class="text-2xl font-bold mt-8 mb-4">{{ block.data.text }}</h2>
                <h3 v-else-if="block.data.level === 3" class="text-xl font-bold mt-6 mb-3">{{ block.data.text }}</h3>
                <h4 v-else class="text-lg font-bold mt-4 mb-2">{{ block.data.text }}</h4>
              </template>
              
              <!-- Paragraph -->
              <template v-else-if="block.type === 'paragraph'">
                <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ block.data.text }}</p>
              </template>
              
              <!-- Image -->
              <template v-else-if="block.type === 'image'">
                <figure class="my-8">
                  <img 
                    :src="block.data.url" 
                    :alt="block.data.caption || 'Image'"
                    class="w-full rounded-2xl shadow-lg"
                  />
                  <figcaption v-if="block.data.caption" class="text-center text-sm text-gray-500 mt-3">
                    {{ block.data.caption }}
                  </figcaption>
                </figure>
              </template>
              
              <!-- Quote -->
              <template v-else-if="block.type === 'quote'">
                <blockquote class="border-l-4 border-red-500 pl-6 py-2 my-6 bg-gray-50 rounded-r-lg">
                  <p class="text-lg italic text-gray-700">{{ block.data.text }}</p>
                  <cite v-if="block.data.author" class="text-sm text-gray-500 mt-2 block">— {{ block.data.author }}</cite>
                </blockquote>
              </template>
              
              <!-- Bullet List -->
              <template v-else-if="block.type === 'bulletList'">
                <ul class="list-disc list-inside space-y-2 my-4">
                  <li v-for="(item, idx) in block.data.items" :key="idx" class="text-gray-700">{{ item }}</li>
                </ul>
              </template>
              
              <!-- Divider -->
              <template v-else-if="block.type === 'divider'">
                <hr class="my-8 border-gray-200" />
              </template>
              
              <!-- CTA Button -->
              <template v-else-if="block.type === 'cta'">
                <div class="my-8 text-center">
                  <a 
                    :href="block.data.url"
                    target="_blank"
                    class="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors shadow-lg"
                  >
                    {{ block.data.text }}
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </template>
            </div>
          </template>
          
          <!-- Fallback to legacy content -->
          <template v-else-if="post.content || post.contentVi">
            <div v-html="currentLocale === 'vi' ? post.contentVi : post.content"></div>
          </template>
          
          <!-- No content -->
          <template v-else>
            <p class="text-gray-500 italic">Bài viết chưa có nội dung.</p>
          </template>
        </div>
        
        <!-- Gallery Section -->
        <section v-if="postGallery && postGallery.length > 0" class="max-w-5xl mx-auto mt-16">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">📷 {{ $t('postPage.gallery') }}</h2>
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div 
              v-for="(image, idx) in postGallery" 
              :key="idx"
              class="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group cursor-pointer"
              @click="openLightbox(idx)"
            >
              <img 
                :src="image.url" 
                :alt="image.caption || `Gallery image ${idx + 1}`"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div v-if="image.caption" class="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {{ image.caption }}
              </div>
            </div>
          </div>
        </section>

        <hr class="my-16 border-gray-200 max-w-3xl mx-auto" />

        <!-- Related Posts -->
        <section v-if="relatedPosts.length > 0" class="max-w-5xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
              {{ $t('postPage.relatedPosts') }}
            </h2>
            <button @click="localizedNavigateTo('/posts')"
              class="text-sm font-semibold text-red-600 hover:text-red-700">
              {{ $t('postPage.viewAll') }} &rarr;
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="relatedPost in relatedPosts" :key="relatedPost.id" @click="navigateToPost(relatedPost.slug || relatedPost.id)"
              class="group cursor-pointer">
              <!-- Simple Card for Related -->
              <div
                class="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-200 group-hover:shadow-lg transition-all duration-300">
                <img 
                  :src="relatedPost.image || (relatedPost as any).coverImage || '/images/placeholder.jpg'" 
                  :alt="relatedPost.titleVi || relatedPost.title"
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                {{ relatedPost.titleVi || relatedPost.title }}
              </h3>
              <p class="text-sm text-gray-500 line-clamp-2">
                {{ relatedPost.excerptVi || relatedPost.excerpt }}
              </p>
            </div>
          </div>
        </section>
        
        <!-- No Related Posts - Show Latest -->
        <section v-else-if="latestPosts.length > 0" class="max-w-5xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <h2 class="text-2xl font-bold text-gray-900 tracking-tight">
              {{ $t('postPage.latestPosts') }}
            </h2>
            <button @click="localizedNavigateTo('/posts')"
              class="text-sm font-semibold text-red-600 hover:text-red-700">
              {{ $t('postPage.viewAll') }} &rarr;
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="latestPost in latestPosts" :key="latestPost.id" @click="navigateToPost(latestPost.slug || latestPost.id)"
              class="group cursor-pointer">
              <div
                class="relative aspect-[16/10] bg-gray-100 rounded-xl overflow-hidden mb-4 border border-gray-200 group-hover:shadow-lg transition-all duration-300">
                <img 
                  :src="latestPost.image || (latestPost as any).coverImage || '/images/placeholder.jpg'" 
                  :alt="latestPost.titleVi || latestPost.title"
                  class="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <h3 class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                {{ latestPost.titleVi || latestPost.title }}
              </h3>
              <p class="text-sm text-gray-500 line-clamp-2">
                {{ latestPost.excerptVi || latestPost.excerpt }}
              </p>
            </div>
          </div>
        </section>
      </article>

      <!-- Post Not Found -->
      <div v-else class="flex flex-col items-center justify-center py-32 text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-4">{{ $t('posts.notFound') }}</h2>
        <button @click="goBack"
          class="px-6 py-3 rounded-full bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
          {{ $t('buttons.back') }}
        </button>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
import { usePostsStore } from '~/stores/posts'
import type { Post } from '~/stores/posts'

const { locale } = useI18n()
const route = useRoute()
const router = useRouter()
const postsStore = usePostsStore()

const currentLocale = computed(() => locale.value || 'vi')
const postId = route.params.id as string
const post = ref<Post | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

// Fetch single post by ID on mount
onMounted(async () => {
  isLoading.value = true
  error.value = null
  try {
    const response = await $fetch<{ success: boolean; data: any }>(`/api/posts/${postId}`)
    post.value = response.data
    console.log('Fetched post:', response.data)
    console.log('Gallery:', response.data?.gallery)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load post'
    console.error('Error fetching post:', err)
  } finally {
    isLoading.value = false
  }
})

// Fetch related posts from store
onMounted(async () => {
  if (postsStore.posts.length === 0) {
    await postsStore.fetchPosts()
  }
})

const relatedPosts = computed(() => {
  if (!post.value) return []
  const currentCategory = (post.value as any).category || (post.value as any).categoryId
  return postsStore.publishedPosts
    .filter(p => {
      const postCategory = p.category || (p as any).categoryId
      return p.id !== post.value?.id && postCategory === currentCategory
    })
    .slice(0, 3)
})

// Gallery computed property
const postGallery = computed(() => {
  if (!post.value) return []
  const gallery = (post.value as any).gallery
  console.log('postGallery computed:', gallery)
  return gallery || []
})

// Latest posts (fallback when no related posts)
const latestPosts = computed(() => {
  if (!post.value) return []
  return postsStore.publishedPosts
    .filter(p => p.id !== post.value?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
})

// Lightbox for gallery
const lightboxIndex = ref(-1)
const openLightbox = (idx: number) => {
  lightboxIndex.value = idx
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString(currentLocale.value === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const localizedNavigateTo = (path: string) => {
  const fullPath = currentLocale.value === 'vi' ? path : `/${currentLocale.value}${path}`
  router.push(fullPath)
}

const goBack = () => {
  router.back()
}

const navigateToPost = (id: string) => {
  localizedNavigateTo(`/posts/${id}`)
}

// Set page title
useHead({
  title: computed(() => post.value ? (currentLocale.value === 'vi' ? post.value.titleVi : post.value.title) : 'Post Not Found')
})
</script>

<style scoped>
/* Customize typography plugin defaults if needed */
.prose {
  --tw-prose-body: #4b5563;
  --tw-prose-headings: #111827;
  --tw-prose-links: #dc2626;
  --tw-prose-bold: #111827;
}
</style>
