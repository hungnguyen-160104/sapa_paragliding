<template>
  <article class="max-w-none">
    <!-- Cover Image -->
    <div v-if="post.thumbnailUrl" class="mb-6 rounded-xl overflow-hidden">
      <img 
        :src="post.thumbnailUrl" 
        :alt="post.title"
        class="w-full aspect-video object-cover"
      />
    </div>
    
    <!-- Category Badge -->
    <div v-if="post.categoryId" class="mb-3">
      <span class="inline-block px-3 py-1 bg-red-100 text-red-700 text-sm font-medium rounded-full">
        {{ getCategoryLabel(post.categoryId) }}
      </span>
    </div>
    
    <!-- Title -->
    <h1 class="text-3xl font-bold text-slate-900 mb-4">
      {{ post.title || 'Tiêu đề bài viết' }}
    </h1>
    
    <!-- Excerpt -->
    <p v-if="post.excerpt" class="text-lg text-slate-600 mb-6 leading-relaxed">
      {{ post.excerpt }}
    </p>
    
    <hr class="my-6 border-slate-200" />
    
    <!-- Content Blocks -->
    <div class="prose prose-slate max-w-none">
      <template v-for="block in post.contentBlocks" :key="block.id">
        <!-- Heading -->
        <component 
          v-if="block.type === 'heading'"
          :is="'h' + (block.data.level || 2)"
          class="font-bold text-slate-900"
        >
          {{ block.data.text }}
        </component>
        
        <!-- Paragraph -->
        <p v-else-if="block.type === 'paragraph'" class="text-slate-700 leading-relaxed">
          {{ block.data.text }}
        </p>
        
        <!-- Image -->
        <figure v-else-if="block.type === 'image' && block.data.url" class="my-6">
          <img 
            :src="block.data.url" 
            :alt="block.data.alt || ''"
            class="rounded-lg w-full"
          />
          <figcaption v-if="block.data.caption" class="text-center text-sm text-slate-500 mt-2">
            {{ block.data.caption }}
          </figcaption>
        </figure>
        
        <!-- Quote -->
        <blockquote v-else-if="block.type === 'quote'" class="border-l-4 border-red-500 pl-4 italic my-6">
          <p class="text-slate-700">{{ block.data.text }}</p>
          <cite v-if="block.data.author" class="text-sm text-slate-500 not-italic">
            — {{ block.data.author }}
          </cite>
        </blockquote>
        
        <!-- Bullet List -->
        <ul v-else-if="block.type === 'bulletList'" class="list-disc list-inside space-y-1 my-4">
          <li v-for="(item, i) in block.data.items" :key="i" class="text-slate-700">
            {{ item }}
          </li>
        </ul>
        
        <!-- Divider -->
        <hr v-else-if="block.type === 'divider'" class="my-8 border-slate-300" />
        
        <!-- CTA -->
        <div v-else-if="block.type === 'cta'" class="my-6 p-6 bg-red-50 rounded-xl text-center">
          <a 
            :href="block.data.link"
            class="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            {{ block.data.text }}
          </a>
        </div>
      </template>
    </div>
    
    <!-- Gallery -->
    <div v-if="post.galleryUrls && post.galleryUrls.length > 0" class="mt-8">
      <h3 class="text-xl font-bold text-slate-900 mb-4">📷 Thư viện ảnh</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div 
          v-for="(image, index) in post.galleryUrls" 
          :key="index"
          class="aspect-square rounded-lg overflow-hidden"
        >
          <img 
            :src="typeof image === 'string' ? image : image.url" 
            :alt="typeof image === 'string' ? '' : image.caption"
            class="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PostDraft } from '~/stores/postsAdmin'

defineProps<{
  post: PostDraft
}>()

const categories: Record<string, string> = {
  news: 'Tin tức',
  guide: 'Hướng dẫn',
  experience: 'Trải nghiệm',
  promotion: 'Khuyến mãi',
  adventure: 'Phiêu lưu',
  safety: 'An toàn',
  tips: 'Mẹo hay'
}

function getCategoryLabel(id: string): string {
  return categories[id] || id
}
</script>
