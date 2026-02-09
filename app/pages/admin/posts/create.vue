<template>
  <section>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Posts</p>
        <h2 class="text-3xl font-semibold">Create Post</h2>
      </div>
      <NuxtLink :to="localePath('/admin/posts')" class="btn-secondary">Back to list</NuxtLink>
    </div>

    <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <PostForm :categories="categories" @submit="handleSubmit" @cancel="cancel" />
    </div>
  </section>
</template>

<script setup lang="ts">
import PostForm from '~~/components/admin/posts/PostForm.vue'
import { createPost } from '~~/services/posts'
import type { PostPayload } from '~~/services/posts'
import { useRouter } from '#app'

const localePath = useLocalePath()

definePageMeta({
  layout: 'admin'
})

const router = useRouter()

const categories = [
  { id: 'adventure', label: 'Adventure' },
  { id: 'safety', label: 'Safety' },
  { id: 'tips', label: 'Tips' },
  { id: 'guide', label: 'Guide' },
  { id: 'news', label: 'News' }
]

const handleSubmit = async (payload: PostPayload) => {
  await createPost(payload)
  router.push(localePath('/admin/posts'))
}

const cancel = () => router.push(localePath('/admin/posts'))
</script>
