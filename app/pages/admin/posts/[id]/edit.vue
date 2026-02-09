<template>
  <section>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.3em] text-slate-400">Posts</p>
        <h2 class="text-3xl font-semibold">Edit Post</h2>
      </div>
      <NuxtLink :to="localePath('/admin/posts')" class="btn-secondary">Back to list</NuxtLink>
    </div>

    <div v-if="pending" class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      Loading...
    </div>

    <div v-else-if="post" class="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <PostForm :value="post" :categories="categories" @submit="handleSubmit" @cancel="cancel" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, type Ref } from 'vue'
import PostForm from '~~/components/admin/posts/PostForm.vue'
import { fetchPostById, updatePost } from '~~/services/posts'
import type { PostPayload } from '~~/services/posts'

const localePath = useLocalePath()
const router = useRouter()
const route = useRoute()
const id = route.params.id as string

definePageMeta({
  layout: 'admin'
})

const categories = [
  { id: 'adventure', label: 'Adventure' },
  { id: 'safety', label: 'Safety' },
  { id: 'tips', label: 'Tips' },
  { id: 'guide', label: 'Guide' },
  { id: 'news', label: 'News' }
]

type PostDetailResponse = Awaited<ReturnType<typeof fetchPostById>>

const { data, pending } = useAsyncData<PostDetailResponse>(
  `admin-post-${id}`,
  () => fetchPostById(id),
  { server: false }
)

const post = computed(() => data.value?.data)

const handleSubmit = async (payload: PostPayload) => {
  await updatePost(id, payload)
  await router.push(localePath('/admin/posts'))
}

const cancel = () => router.push(localePath('/admin/posts'))
</script>
