<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <label class="form-label">Title</label>
        <input v-model="form.title" type="text" class="input-field" required />
      </div>
      <div>
        <label class="form-label">Slug</label>
        <input v-model="form.slug" type="text" class="input-field" required />
      </div>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <label class="form-label">Category</label>
        <select v-model="form.categoryId" class="input-field" required>
          <option disabled value="">Select category</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.label }}
          </option>
        </select>
      </div>
      <div>
        <label class="form-label">Status</label>
        <select v-model="form.status" class="input-field">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </div>
    </div>

    <div>
      <label class="form-label">Excerpt</label>
      <textarea v-model="form.excerpt" rows="3" class="input-field"></textarea>
    </div>

    <div>
      <label class="form-label">HTML Content</label>
      <PostHtmlEditor v-model="form.contentHtml" />
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div>
        <label class="form-label">Thumbnail URL (Cloudinary)</label>
        <input v-model="form.thumbnailUrl" type="url" class="input-field" :required="form.status === 'PUBLISHED'" />
        <div v-if="form.thumbnailUrl" class="mt-3 rounded-md border bg-slate-50 p-3">
          <p class="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
          <img :src="form.thumbnailUrl" alt="thumbnail" class="mt-2 w-full rounded-md object-cover" />
        </div>
      </div>
      <div>
        <label class="form-label">Gallery URLs</label>
        <div class="space-y-3">
          <div v-for="(url, index) in form.galleryUrls" :key="index" class="flex items-center gap-2">
            <input v-model="form.galleryUrls[index]" type="url" class="input-field flex-1" placeholder="https://cloudinary.com/..." />
            <button type="button" class="rounded-md border border-slate-200 px-3 py-2 text-sm" @click="removeGalleryUrl(index)">
              Remove
            </button>
          </div>
          <button type="button" class="text-sm font-semibold text-red-600" @click="addGalleryUrl">+ Add URL</button>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button type="button" class="btn-secondary" @click="$emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary">Save Draft</button>
      <button type="button" class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white" @click="publish">
        Publish
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PostPayload } from '~/services/posts'

interface CategoryOption {
  id: string
  label: string
}

type PostFormState = PostPayload & { galleryUrls: string[] }

const props = defineProps<{ value?: Partial<PostFormState>; categories: CategoryOption[] }>()

const emit = defineEmits(['submit', 'cancel'])

const baseForm: PostFormState = {
  title: '',
  slug: '',
  excerpt: '',
  contentHtml: '',
  categoryId: '',
  status: 'DRAFT',
  thumbnailUrl: '',
  galleryUrls: [] as string[]
}

const form = ref<PostFormState>({ ...baseForm })

const normalizeSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

watch(
  () => props.value,
  (val) => {
    if (val) {
      form.value = {
        ...baseForm,
        ...val,
        galleryUrls: [...(val.galleryUrls || [])]
      }
      return
    }
    form.value = { ...baseForm }
  },
  { immediate: true }
)

watch(
  () => form.value.title,
  (title: string) => {
    if (!props.value) {
      const fallback = `post-${Date.now()}`
      form.value.slug = normalizeSlug(title).trim() || fallback
    }
  }
)

const addGalleryUrl = () => {
  form.value.galleryUrls.push('')
}

const removeGalleryUrl = (index: number) => {
  form.value.galleryUrls.splice(index, 1)
}

const handleSubmit = () => {
  emit('submit', { ...form.value, status: 'DRAFT' } as PostPayload)
}

const publish = () => {
  if (!form.value.thumbnailUrl) {
    alert('Thumbnail URL is required to publish')
    return
  }
  emit('submit', { ...form.value, status: 'PUBLISHED' } as PostPayload)
}
</script>
