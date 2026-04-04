<template>
  <div class="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
    <div class="sticky top-0 z-10 border-b border-slate-200 bg-white p-4">
      <div class="flex items-start gap-3">
        <button
          class="rounded-lg p-2 transition-colors hover:bg-slate-100"
          title="Đóng"
          @click="handleClose"
        >
          <svg class="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="grid flex-1 gap-3 md:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Tiêu đề tiếng Việt <span class="text-red-500">*</span>
            </label>
            <input
              v-model="draft.titleVi"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg font-semibold outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
              :class="{ 'border-red-500': validationErrors.titleVi }"
              placeholder="Nhập tiêu đề tiếng Việt..."
            />
          </div>

          <div>
            <label class="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Title (English) <span class="text-red-500">*</span>
            </label>
            <input
              v-model="draft.title"
              type="text"
              class="w-full rounded-lg border border-slate-300 px-4 py-3 text-lg font-semibold outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100"
              :class="{ 'border-red-500': validationErrors.title }"
              placeholder="Enter English title..."
              @blur="autoGenerateSlug"
            />
          </div>
        </div>
      </div>

      <div class="mt-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <span v-if="store.saving" class="flex items-center gap-1">
            <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang lưu...
          </span>
          <span v-else-if="store.lastSavedAt">✓ Đã lưu lúc {{ formatTime(store.lastSavedAt) }}</span>
          <span v-if="store.dirty && !store.saving" class="text-orange-500">• Chưa lưu</span>
        </div>

        <div class="flex items-center gap-2">
          <button class="btn-secondary py-1.5 text-sm" :disabled="store.saving" @click="handleSaveDraft">
            💾 Lưu
          </button>

          <button class="btn-secondary py-1.5 text-sm" @click="showPreview = true">
            👁 Xem trước
          </button>

          <button
            class="btn-primary py-1.5 text-sm"
            :disabled="!canPublish || store.saving"
            :title="!canPublish ? 'Cần điền đủ tiêu đề, mô tả, danh mục và ảnh bìa cho cả 2 ngôn ngữ' : ''"
            @click="handlePublish"
          >
            {{ draft.status === 'PUBLISHED' ? '🔄 Cập nhật' : '🚀 Xuất bản' }}
          </button>
        </div>
      </div>
    </div>

    <div ref="editorBodyRef" class="flex-1 space-y-6 overflow-y-auto p-6">
      <div v-if="store.editorError" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {{ store.editorError }}
      </div>

      <div v-if="Object.keys(validationErrors).length > 0" class="rounded-lg border border-red-200 bg-red-50 p-4">
        <h4 class="mb-2 font-medium text-red-800">Vui lòng sửa các lỗi sau:</h4>
        <ul class="list-inside list-disc space-y-1 text-sm text-red-600">
          <li v-for="(error, key) in validationErrors" :key="key">{{ error }}</li>
        </ul>
      </div>

      <div>
        <label class="form-label">Đường dẫn (Slug)</label>
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-400">/posts/</span>
          <input
            v-model="draft.slug"
            type="text"
            class="input-field flex-1"
            :class="{ 'border-red-500': validationErrors.slug }"
            placeholder="duong-dan-bai-viet"
          />
          <button class="btn-secondary px-3 py-2 text-sm" title="Tạo lại từ title tiếng Anh" @click="generateSlugFromDraft">
            🔄
          </button>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <label class="form-label">Mô tả ngắn tiếng Việt <span class="text-red-500">*</span></label>
          <textarea
            v-model="draft.excerptVi"
            rows="3"
            class="input-field resize-none"
            :class="{ 'border-red-500': validationErrors.excerptVi }"
            placeholder="Mô tả ngắn tiếng Việt hiển thị ở danh sách..."
            maxlength="220"
          />
          <p class="mt-1 text-xs text-slate-400">{{ draft.excerptVi.length }}/220 ký tự</p>
        </div>

        <div>
          <label class="form-label">Short description (English) <span class="text-red-500">*</span></label>
          <textarea
            v-model="draft.excerpt"
            rows="3"
            class="input-field resize-none"
            :class="{ 'border-red-500': validationErrors.excerpt }"
            placeholder="Short English description shown in the list..."
            maxlength="220"
          />
          <p class="mt-1 text-xs text-slate-400">{{ draft.excerpt.length }}/220 characters</p>
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label class="form-label">Danh mục <span class="text-red-500">*</span></label>
          <select
            v-model="draft.categoryId"
            class="input-field"
            :class="{ 'border-red-500': validationErrors.categoryId }"
          >
            <option value="">Chọn danh mục</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="form-label">Trạng thái</label>
          <select v-model="draft.status" class="input-field">
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
            <option value="SCHEDULED">Hẹn giờ</option>
          </select>
        </div>

        <div v-if="draft.status === 'SCHEDULED'">
          <label class="form-label">Thời gian xuất bản</label>
          <input v-model="scheduledAtInput" type="datetime-local" class="input-field" />
        </div>
      </div>

      <div>
        <label class="form-label">Ảnh bìa <span class="text-red-500">*</span></label>
        <input ref="coverInputRef" type="file" accept="image/*" class="hidden" @change="handleCoverUpload" />

        <div
          class="rounded-xl border-2 border-dashed p-6 text-center transition-colors"
          :class="[
            validationErrors.thumbnailUrl ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400',
            store.uploading.cover ? 'pointer-events-none opacity-75' : ''
          ]"
        >
          <template v-if="!draft.thumbnailUrl">
            <button class="btn-secondary" @click="coverInputRef?.click()">📷 Tải ảnh bìa lên</button>
            <p class="mt-2 text-xs text-slate-400">Hoặc dán URL Cloudinary</p>
            <input
              v-model="coverUrlInput"
              type="url"
              class="input-field mt-2 text-sm"
              placeholder="https://res.cloudinary.com/..."
              @blur="handleCoverUrlInput"
            />
          </template>

          <template v-else>
            <div class="relative inline-block">
              <img :src="draft.thumbnailUrl" alt="Cover" class="mx-auto max-h-48 rounded-lg" />
              <div class="absolute right-2 top-2 flex gap-1">
                <button
                  class="rounded-lg bg-white/90 p-1.5 shadow transition-colors hover:bg-white"
                  title="Thay ảnh"
                  @click="coverInputRef?.click()"
                >
                  🔄
                </button>
                <button
                  class="rounded-lg bg-white/90 p-1.5 shadow transition-colors hover:bg-red-100"
                  title="Xóa ảnh"
                  @click="removeCover"
                >
                  ✕
                </button>
              </div>
            </div>
          </template>

          <div v-if="store.uploading.cover" class="mt-4">
            <div class="h-2 overflow-hidden rounded-full bg-slate-200">
              <div class="h-full bg-red-600 transition-all duration-300" :style="{ width: store.uploadProgress.cover + '%' }" />
            </div>
            <p class="mt-1 text-xs text-slate-500">Đang tải... {{ store.uploadProgress.cover }}%</p>
          </div>
        </div>
      </div>

      <div>
        <label class="form-label">Nội dung bài viết song ngữ</label>
        <PostContentBlocks />
      </div>

      <div>
        <label class="form-label">Thư viện ảnh (cuối bài)</label>
        <PostGalleryManager />
      </div>

      <details class="rounded-xl border border-slate-200">
        <summary class="cursor-pointer p-4 font-medium hover:bg-slate-50">
          🔍 Cài đặt SEO song ngữ (tùy chọn)
        </summary>

        <div class="space-y-4 p-4 pt-0">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="form-label">Meta Title tiếng Việt</label>
              <input
                v-model="draft.seo.titleVi"
                type="text"
                class="input-field"
                placeholder="Để trống = dùng tiêu đề tiếng Việt"
                maxlength="60"
              />
              <p class="mt-1 text-xs text-slate-400">{{ draft.seo.titleVi.length }}/60</p>
            </div>

            <div>
              <label class="form-label">Meta Title English</label>
              <input
                v-model="draft.seo.title"
                type="text"
                class="input-field"
                placeholder="Leave empty = use English title"
                maxlength="60"
              />
              <p class="mt-1 text-xs text-slate-400">{{ draft.seo.title.length }}/60</p>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="form-label">Meta Description tiếng Việt</label>
              <textarea
                v-model="draft.seo.descriptionVi"
                rows="3"
                class="input-field resize-none"
                placeholder="Để trống = dùng mô tả tiếng Việt"
                maxlength="160"
              />
              <p class="mt-1 text-xs text-slate-400">{{ draft.seo.descriptionVi.length }}/160</p>
            </div>

            <div>
              <label class="form-label">Meta Description English</label>
              <textarea
                v-model="draft.seo.description"
                rows="3"
                class="input-field resize-none"
                placeholder="Leave empty = use English description"
                maxlength="160"
              />
              <p class="mt-1 text-xs text-slate-400">{{ draft.seo.description.length }}/160</p>
            </div>
          </div>

          <div>
            <label class="form-label">OG Image URL</label>
            <input
              v-model="draft.seo.ogImage"
              type="url"
              class="input-field"
              placeholder="Để trống = dùng ảnh bìa"
            />
          </div>
        </div>
      </details>
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showPreview"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          @click.self="showPreview = false"
        >
          <div class="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white">
            <div class="flex items-center justify-between border-b border-slate-200 p-4">
              <h3 class="text-lg font-semibold">Xem trước bài viết</h3>
              <button class="rounded-lg p-2 hover:bg-slate-100" @click="showPreview = false">✕</button>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
              <PostPreview :post="draft" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <ConfirmModal
      :open="showUnsavedConfirm"
      title="Thay đổi chưa lưu"
      description="Bạn có muốn lưu trước khi đóng?"
      @cancel="discardAndClose"
      @confirm="saveAndClose"
    >
      <template #actions>
        <button class="btn-secondary" @click="showUnsavedConfirm = false">Hủy</button>
        <button class="btn-secondary text-red-600" @click="discardAndClose">Bỏ thay đổi</button>
        <button class="btn-primary" @click="saveAndClose">Lưu</button>
      </template>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { usePostsAdminStore } from '~/stores/postsAdmin'
import { useCloudinaryUpload } from '~/composables/useCloudinaryUpload'
import PostContentBlocks from './PostContentBlocks.vue'
import PostGalleryManager from './PostGalleryManager.vue'
import PostPreview from './PostPreview.vue'
import ConfirmModal from '~/components/admin/ui/ConfirmModal.vue'

type SeoDraft = {
  title: string
  titleVi: string
  description: string
  descriptionVi: string
  ogImage: string
}

type GalleryItem = string | { url: string; publicId?: string; caption?: string }

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
  data: BlockData
}

type DraftStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED'

type DraftModel = {
  title: string
  titleVi: string
  slug: string
  excerpt: string
  excerptVi: string
  contentHtml: string
  contentHtmlVi: string
  contentBlocks: ContentBlock[]
  contentBlocksVi: ContentBlock[]
  categoryId: string
  status: DraftStatus
  thumbnailUrl: string
  thumbnailPublicId?: string
  galleryUrls: GalleryItem[]
  tags: string[]
  seo: SeoDraft
  scheduledAt?: string | Date | null
}

type PostsAdminStore = ReturnType<typeof usePostsAdminStore> & {
  draft: Partial<DraftModel>
  saving: boolean
  dirty: boolean
  lastSavedAt?: Date | string | null
  validationErrors?: Record<string, string>
  uploading: {
    cover: boolean
  }
  uploadProgress: {
    cover: number
  }
  saveDraft: () => Promise<boolean>
  publish: () => Promise<boolean>
  closeEditor: (force?: boolean) => void
}

const emit = defineEmits<{
  close: []
}>()

const store = usePostsAdminStore() as PostsAdminStore
const { uploadImage } = useCloudinaryUpload()
const draft = computed(() => store.draft as DraftModel)

const coverInputRef = ref<HTMLInputElement | null>(null)
const editorBodyRef = ref<HTMLElement | null>(null)
const coverUrlInput = ref('')
const showPreview = ref(false)
const showUnsavedConfirm = ref(false)
const showLocalValidation = ref(false)
const scheduledAtInput = ref('')

const categories = [
  { id: 'news', label: 'Tin tức' },
  { id: 'guide', label: 'Hướng dẫn' },
  { id: 'experience', label: 'Trải nghiệm' },
  { id: 'promotion', label: 'Khuyến mãi' },
  { id: 'adventure', label: 'Phiêu lưu' },
  { id: 'safety', label: 'An toàn' },
  { id: 'tips', label: 'Mẹo hay' }
] as const

function normalizeSlug(value: string): string {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function createVietnameseBlockFallback(block: ContentBlock): ContentBlock {
  const clone = deepClone(block)
  clone.data = clone.data || {}

  switch (clone.type) {
    case 'heading':
    case 'paragraph':
      clone.data.text = clone.data.text || ''
      break
    case 'quote':
      clone.data.text = clone.data.text || ''
      clone.data.author = clone.data.author || ''
      break
    case 'bulletList':
      clone.data.items = Array.isArray(clone.data.items) ? clone.data.items : ['']
      break
    case 'image':
      clone.data.url = clone.data.url || ''
      clone.data.caption = clone.data.caption || ''
      clone.data.alt = clone.data.alt || ''
      break
    case 'cta':
      clone.data.type = clone.data.type || 'booking'
      clone.data.link = clone.data.link || ''
      clone.data.text = clone.data.text || ''
      break
    default:
      break
  }

  return clone
}

function ensureDraftShape() {
  draft.value.title = draft.value.title || ''
  draft.value.titleVi = draft.value.titleVi || ''
  draft.value.slug = draft.value.slug || ''
  draft.value.excerpt = draft.value.excerpt || ''
  draft.value.excerptVi = draft.value.excerptVi || ''
  draft.value.contentHtml = draft.value.contentHtml || ''
  draft.value.contentHtmlVi = draft.value.contentHtmlVi || ''
  draft.value.contentBlocks = Array.isArray(draft.value.contentBlocks) ? draft.value.contentBlocks : []
  draft.value.contentBlocksVi = Array.isArray(draft.value.contentBlocksVi)
    ? draft.value.contentBlocksVi
    : draft.value.contentBlocks.map(createVietnameseBlockFallback)
  draft.value.galleryUrls = Array.isArray(draft.value.galleryUrls) ? draft.value.galleryUrls : []
  draft.value.tags = Array.isArray(draft.value.tags) ? draft.value.tags : []
  draft.value.categoryId = draft.value.categoryId || ''
  draft.value.status = draft.value.status || 'DRAFT'
  draft.value.thumbnailUrl = draft.value.thumbnailUrl || ''
  draft.value.thumbnailPublicId = draft.value.thumbnailPublicId || ''

  const currentSeo = draft.value.seo || {}
  draft.value.seo = {
    title: currentSeo.title || '',
    titleVi: currentSeo.titleVi || '',
    description: currentSeo.description || '',
    descriptionVi: currentSeo.descriptionVi || '',
    ogImage: currentSeo.ogImage || ''
  }

  if (!draft.value.contentBlocksVi.length && draft.value.contentBlocks.length) {
    draft.value.contentBlocksVi = draft.value.contentBlocks.map(createVietnameseBlockFallback)
  }

  if (!draft.value.seo.ogImage && draft.value.thumbnailUrl) {
    draft.value.seo.ogImage = draft.value.thumbnailUrl
  }
}

watchEffect(() => {
  ensureDraftShape()
})

watch(
  () => draft.value.scheduledAt,
  (value) => {
    if (!value) {
      scheduledAtInput.value = ''
      return
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      scheduledAtInput.value = ''
      return
    }

    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    scheduledAtInput.value = local.toISOString().slice(0, 16)
  },
  { immediate: true }
)

watch(scheduledAtInput, (value) => {
  if (draft.value.status !== 'SCHEDULED') return
  draft.value.scheduledAt = value ? new Date(value).toISOString() : null
})

watch(
  () => draft.value.status,
  (status) => {
    if (status !== 'SCHEDULED') {
      scheduledAtInput.value = ''
      draft.value.scheduledAt = null
    }
  }
)

const localValidationErrors = computed<Record<string, string>>(() => {
  const errors: Record<string, string> = {}

  if (!draft.value.titleVi.trim()) errors.titleVi = 'Vui lòng nhập tiêu đề tiếng Việt'
  if (!draft.value.title.trim()) errors.title = 'Vui lòng nhập tiêu đề tiếng Anh'
  if (!draft.value.excerptVi.trim()) errors.excerptVi = 'Vui lòng nhập mô tả ngắn tiếng Việt'
  if (!draft.value.excerpt.trim()) errors.excerpt = 'Vui lòng nhập mô tả ngắn tiếng Anh'
  if (!draft.value.categoryId) errors.categoryId = 'Vui lòng chọn danh mục'
  if (!draft.value.thumbnailUrl) errors.thumbnailUrl = 'Vui lòng chọn ảnh bìa'
  if (draft.value.status === 'SCHEDULED' && !scheduledAtInput.value) {
    errors.scheduledAt = 'Vui lòng chọn thời gian xuất bản'
  }

  return errors
})

const validationErrors = computed<Record<string, string>>(() => ({
  ...(store.validationErrors || {}),
  ...(showLocalValidation.value ? localValidationErrors.value : {})
}))

const canPublish = computed(() => Object.keys(localValidationErrors.value).length === 0)

function formatTime(date: Date | string): string {
  const parsed = typeof date === 'string' ? new Date(date) : date
  return parsed.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function generateSlugFromDraft() {
  const base = draft.value.title.trim() || draft.value.titleVi.trim()
  if (!base) return
  draft.value.slug = normalizeSlug(base)
}

function autoGenerateSlug() {
  if (!draft.value.slug.trim()) {
    generateSlugFromDraft()
  }
}

async function handleCoverUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    alert('Ảnh quá lớn. Tối đa 5MB')
    return
  }

  store.uploading.cover = true
  store.uploadProgress.cover = 0

  try {
    const result = await uploadImage(file, {
      folder: 'posts/covers',
      onProgress: (progress: number) => {
        store.uploadProgress.cover = progress
      }
    })

    draft.value.thumbnailUrl = result.url
    draft.value.thumbnailPublicId = result.publicId

    if (!draft.value.seo.ogImage) {
      draft.value.seo.ogImage = result.url
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Lỗi tải ảnh'
    alert(message)
  } finally {
    store.uploading.cover = false
    if (coverInputRef.value) coverInputRef.value.value = ''
  }
}

function handleCoverUrlInput() {
  if (!coverUrlInput.value || !coverUrlInput.value.startsWith('http')) return

  draft.value.thumbnailUrl = coverUrlInput.value

  if (!draft.value.seo.ogImage) {
    draft.value.seo.ogImage = coverUrlInput.value
  }

  coverUrlInput.value = ''
}

function removeCover() {
  draft.value.thumbnailUrl = ''
  draft.value.thumbnailPublicId = ''
}

function scrollToTopOnError() {
  editorBodyRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleSaveDraft() {
  ensureDraftShape()
  showLocalValidation.value = false
  const success = await store.saveDraft()
  if (!success) {
    scrollToTopOnError()
  }
}

async function handlePublish() {
  ensureDraftShape()
  showLocalValidation.value = true

  if (!canPublish.value) {
    return
  }

  draft.value.status = draft.value.status === 'SCHEDULED' ? 'SCHEDULED' : 'PUBLISHED'
  const success = await store.publish()
  if (!success) {
    scrollToTopOnError()
  }
}

function handleClose() {
  if (store.dirty) {
    showUnsavedConfirm.value = true
    return
  }

  store.closeEditor(true)
  emit('close')
}

function discardAndClose() {
  showUnsavedConfirm.value = false
  store.closeEditor(true)
  emit('close')
}

async function saveAndClose() {
  showUnsavedConfirm.value = false
  const success = await store.saveDraft()
  if (success) {
    store.closeEditor(true)
    emit('close')
  }
}
</script>