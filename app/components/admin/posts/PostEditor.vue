<template>
  <div class="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
    <!-- Editor Header (Sticky) -->
    <div class="sticky top-0 z-10 bg-white border-b border-slate-200 p-4">
      <div class="flex items-center gap-3">
        <!-- Close Button -->
        <button 
          class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          title="Đóng"
          @click="handleClose"
        >
          <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <!-- Title Input -->
        <input 
          v-model="store.draft.title"
          type="text"
          class="flex-1 text-xl font-semibold border-0 focus:ring-0 placeholder-slate-300 outline-none"
          placeholder="Tiêu đề bài viết..."
          @blur="autoGenerateSlug"
        />
      </div>
      
      <!-- Actions Row -->
      <div class="flex items-center justify-between mt-3">
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <span v-if="store.saving" class="flex items-center gap-1">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang lưu...
          </span>
          <span v-else-if="store.lastSavedAt">
            ✓ Đã lưu lúc {{ formatTime(store.lastSavedAt) }}
          </span>
          <span v-if="store.dirty && !store.saving" class="text-orange-500">
            • Chưa lưu
          </span>
        </div>
        
        <div class="flex items-center gap-2">
          <button 
            class="btn-secondary text-sm py-1.5"
            :disabled="store.saving"
            @click="handleSaveDraft"
          >
            💾 Lưu nháp
          </button>
          
          <button 
            class="btn-secondary text-sm py-1.5"
            @click="showPreview = true"
          >
            👁 Xem trước
          </button>
          
          <button 
            class="btn-primary text-sm py-1.5"
            :disabled="!store.canPublish || store.saving"
            :title="!store.canPublish ? 'Cần điền đủ tiêu đề, mô tả, danh mục và ảnh bìa' : ''"
            @click="handlePublish"
          >
            {{ store.draft.status === 'PUBLISHED' ? '🔄 Cập nhật' : '🚀 Xuất bản' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Editor Content (Scrollable) -->
    <div class="flex-1 overflow-y-auto p-6 space-y-6">
      <!-- Validation Errors Alert -->
      <div v-if="Object.keys(store.validationErrors).length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 class="font-medium text-red-800 mb-2">Vui lòng sửa các lỗi sau:</h4>
        <ul class="list-disc list-inside text-sm text-red-600 space-y-1">
          <li v-for="(error, key) in store.validationErrors" :key="key">{{ error }}</li>
        </ul>
      </div>
      
      <!-- Slug -->
      <div>
        <label class="form-label">Đường dẫn (Slug)</label>
        <div class="flex items-center gap-2">
          <span class="text-slate-400 text-sm">/posts/</span>
          <input 
            v-model="store.draft.slug"
            type="text"
            class="input-field flex-1"
            :class="{ 'border-red-500': store.validationErrors.slug }"
            placeholder="duong-dan-bai-viet"
          />
          <button 
            class="btn-secondary text-sm py-2 px-3"
            title="Tạo lại từ tiêu đề"
            @click="store.generateSlug"
          >
            🔄
          </button>
        </div>
      </div>
      
      <!-- Excerpt -->
      <div>
        <label class="form-label">Mô tả ngắn <span class="text-red-500">*</span></label>
        <textarea 
          v-model="store.draft.excerpt"
          rows="2"
          class="input-field resize-none"
          :class="{ 'border-red-500': store.validationErrors.excerpt }"
          placeholder="Mô tả ngắn gọn về bài viết (hiển thị ở danh sách)..."
          maxlength="200"
        />
        <p class="text-xs text-slate-400 mt-1">{{ store.draft.excerpt.length }}/200 ký tự</p>
      </div>
      
      <!-- Category & Status -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="form-label">Danh mục <span class="text-red-500">*</span></label>
          <select 
            v-model="store.draft.categoryId"
            class="input-field"
            :class="{ 'border-red-500': store.validationErrors.categoryId }"
          >
            <option value="">Chọn danh mục</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="form-label">Trạng thái</label>
          <select v-model="store.draft.status" class="input-field">
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>
      </div>
      
      <!-- Cover Image -->
      <div>
        <label class="form-label">Ảnh bìa <span class="text-red-500">*</span></label>
        <div 
          class="border-2 border-dashed rounded-xl p-6 text-center transition-colors"
          :class="[
            store.validationErrors.thumbnailUrl ? 'border-red-400 bg-red-50' : 'border-slate-300 hover:border-slate-400',
            store.uploading.cover ? 'pointer-events-none opacity-75' : ''
          ]"
        >
          <template v-if="!store.draft.thumbnailUrl">
            <input 
              ref="coverInputRef"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleCoverUpload"
            />
            <button 
              class="btn-secondary"
              @click="coverInputRef?.click()"
            >
              📷 Tải ảnh bìa lên
            </button>
            <p class="text-xs text-slate-400 mt-2">Hoặc dán URL Cloudinary</p>
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
              <img 
                :src="store.draft.thumbnailUrl" 
                alt="Cover"
                class="max-h-48 rounded-lg mx-auto"
              />
              <div class="absolute top-2 right-2 flex gap-1">
                <button 
                  class="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow transition-colors"
                  title="Thay ảnh"
                  @click="coverInputRef?.click()"
                >
                  🔄
                </button>
                <button 
                  class="p-1.5 bg-white/90 hover:bg-red-100 rounded-lg shadow transition-colors"
                  title="Xóa ảnh"
                  @click="removeCover"
                >
                  ✕
                </button>
              </div>
            </div>
          </template>
          
          <!-- Upload Progress -->
          <div v-if="store.uploading.cover" class="mt-4">
            <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                class="h-full bg-red-600 transition-all duration-300"
                :style="{ width: store.uploadProgress.cover + '%' }"
              />
            </div>
            <p class="text-xs text-slate-500 mt-1">Đang tải... {{ store.uploadProgress.cover }}%</p>
          </div>
        </div>
      </div>
      
      <!-- Content Blocks -->
      <div>
        <label class="form-label">Nội dung bài viết</label>
        <PostContentBlocks />
      </div>
      
      <!-- Gallery -->
      <div>
        <label class="form-label">Thư viện ảnh (cuối bài)</label>
        <PostGalleryManager />
      </div>
      
      <!-- SEO Section -->
      <details class="border border-slate-200 rounded-xl">
        <summary class="p-4 font-medium cursor-pointer hover:bg-slate-50">
          🔍 Cài đặt SEO (tùy chọn)
        </summary>
        <div class="p-4 pt-0 space-y-4">
          <div>
            <label class="form-label">Meta Title</label>
            <input 
              v-model="store.draft.seo.title"
              type="text"
              class="input-field"
              placeholder="Tiêu đề SEO (để trống = dùng tiêu đề bài)"
              maxlength="60"
            />
            <p class="text-xs text-slate-400 mt-1">{{ store.draft.seo.title.length }}/60</p>
          </div>
          <div>
            <label class="form-label">Meta Description</label>
            <textarea 
              v-model="store.draft.seo.description"
              rows="2"
              class="input-field resize-none"
              placeholder="Mô tả SEO (để trống = dùng mô tả ngắn)"
              maxlength="160"
            />
            <p class="text-xs text-slate-400 mt-1">{{ store.draft.seo.description.length }}/160</p>
          </div>
          <div>
            <label class="form-label">OG Image URL</label>
            <input 
              v-model="store.draft.seo.ogImage"
              type="url"
              class="input-field"
              placeholder="URL ảnh share (để trống = dùng ảnh bìa)"
            />
          </div>
        </div>
      </details>
    </div>
    
    <!-- Preview Modal -->
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
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          @click.self="showPreview = false"
        >
          <div class="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div class="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 class="font-semibold text-lg">Xem trước bài viết</h3>
              <button 
                class="p-2 hover:bg-slate-100 rounded-lg"
                @click="showPreview = false"
              >
                ✕
              </button>
            </div>
            <div class="flex-1 overflow-y-auto p-6">
              <PostPreview :post="store.draft" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
    
    <!-- Unsaved Changes Confirm Modal -->
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
        <button class="btn-primary" @click="saveAndClose">Lưu nháp</button>
      </template>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePostsAdminStore } from '~/stores/postsAdmin'
import { useCloudinaryUpload } from '~/composables/useCloudinaryUpload'
import PostContentBlocks from './PostContentBlocks.vue'
import PostGalleryManager from './PostGalleryManager.vue'
import PostPreview from './PostPreview.vue'
import ConfirmModal from '~/components/admin/ui/ConfirmModal.vue'

const emit = defineEmits<{
  close: []
}>()

const store = usePostsAdminStore()
const { uploadImage } = useCloudinaryUpload()

const coverInputRef = ref<HTMLInputElement | null>(null)
const coverUrlInput = ref('')
const showPreview = ref(false)
const showUnsavedConfirm = ref(false)

const categories = [
  { id: 'news', label: 'Tin tức' },
  { id: 'guide', label: 'Hướng dẫn' },
  { id: 'experience', label: 'Trải nghiệm' },
  { id: 'promotion', label: 'Khuyến mãi' },
  { id: 'adventure', label: 'Phiêu lưu' },
  { id: 'safety', label: 'An toàn' },
  { id: 'tips', label: 'Mẹo hay' }
]

function formatTime(date: Date): string {
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

function autoGenerateSlug() {
  if (!store.draft.slug && store.draft.title) {
    store.generateSlug()
  }
}

async function handleCoverUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  // Validate
  if (file.size > 5 * 1024 * 1024) {
    alert('Ảnh quá lớn. Tối đa 5MB')
    return
  }
  
  store.uploading.cover = true
  store.uploadProgress.cover = 0
  
  try {
    const result = await uploadImage(file, {
      folder: 'posts/covers',
      onProgress: (p) => { store.uploadProgress.cover = p }
    })
    
    store.draft.thumbnailUrl = result.url
    store.draft.thumbnailPublicId = result.publicId
  } catch (error: any) {
    alert(error.message || 'Lỗi tải ảnh')
  } finally {
    store.uploading.cover = false
    // Reset input
    if (coverInputRef.value) coverInputRef.value.value = ''
  }
}

function handleCoverUrlInput() {
  if (coverUrlInput.value && coverUrlInput.value.startsWith('http')) {
    store.draft.thumbnailUrl = coverUrlInput.value
    coverUrlInput.value = ''
  }
}

function removeCover() {
  store.draft.thumbnailUrl = ''
  store.draft.thumbnailPublicId = ''
}

async function handleSaveDraft() {
  const success = await store.saveDraft()
  if (success) {
    // Optional: show toast
  }
}

async function handlePublish() {
  const success = await store.publish()
  if (success) {
    // Optional: show toast
  }
}

function handleClose() {
  if (store.dirty) {
    showUnsavedConfirm.value = true
  } else {
    store.closeEditor(true)
    emit('close')
  }
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
