<template>
  <div class="border border-slate-200 rounded-xl p-4">
    <!-- Upload Zone -->
    <div 
      class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center mb-4 transition-colors"
      :class="{ 'border-red-400 bg-red-50': isDragging }"
      @dragover.prevent="isDragging = true"
      @dragleave="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input 
        ref="galleryInputRef"
        type="file"
        multiple
        accept="image/*"
        class="hidden"
        @change="handleFilesSelect"
      />
      
      <div class="space-y-2">
        <p class="text-slate-500">
          <button class="text-red-600 font-medium hover:underline" @click="galleryInputRef?.click()">
            Chọn ảnh
          </button>
          hoặc kéo thả vào đây
        </p>
        <p class="text-xs text-slate-400">Tối đa 12 ảnh, mỗi ảnh tối đa 5MB</p>
      </div>
      
      <!-- URL Input -->
      <div class="mt-4">
        <input 
          v-model="urlInput"
          type="url"
          class="input-field text-sm"
          placeholder="Hoặc dán URL Cloudinary và nhấn Enter"
          @keydown.enter="addFromUrl"
        />
      </div>
    </div>
    
    <!-- Uploading Progress -->
    <div v-if="uploading" class="mb-4 p-3 bg-slate-50 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm text-slate-600">Đang tải {{ uploadingCount }} ảnh...</span>
        <span class="text-sm text-slate-500">{{ uploadProgress }}%</span>
      </div>
      <div class="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          class="h-full bg-red-600 transition-all duration-300"
          :style="{ width: uploadProgress + '%' }"
        />
      </div>
    </div>
    
    <!-- Gallery Grid -->
    <div v-if="store.draft.galleryUrls.length > 0" class="grid grid-cols-3 sm:grid-cols-4 gap-3">
      <div 
        v-for="(image, index) in store.draft.galleryUrls" 
        :key="index"
        class="relative group aspect-square rounded-lg overflow-hidden bg-slate-100"
      >
        <img 
          :src="getGalleryThumbUrl(image.url)" 
          :alt="image.caption || ''"
          class="w-full h-full object-cover"
        />
        
        <!-- Overlay -->
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <!-- Move Left -->
          <button 
            v-if="index > 0"
            class="p-1.5 bg-white/90 rounded-lg hover:bg-white"
            title="Di chuyển trái"
            @click="moveImage(index, index - 1)"
          >
            ←
          </button>
          
          <!-- Move Right -->
          <button 
            v-if="index < store.draft.galleryUrls.length - 1"
            class="p-1.5 bg-white/90 rounded-lg hover:bg-white"
            title="Di chuyển phải"
            @click="moveImage(index, index + 1)"
          >
            →
          </button>
          
          <!-- Delete -->
          <button 
            class="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
            title="Xóa"
            @click="store.removeGalleryImage(index)"
          >
            ✕
          </button>
        </div>
        
        <!-- Index Badge -->
        <div class="absolute top-1 left-1 w-5 h-5 bg-black/60 text-white text-xs rounded flex items-center justify-center">
          {{ index + 1 }}
        </div>
      </div>
    </div>
    
    <!-- Empty State -->
    <div v-else class="text-center py-4 text-slate-400 text-sm">
      Chưa có ảnh trong thư viện
    </div>
    
    <!-- Captions Editor -->
    <div v-if="store.draft.galleryUrls.length > 0" class="mt-4 pt-4 border-t border-slate-200">
      <p class="text-sm font-medium text-slate-600 mb-3">Chú thích ảnh (tùy chọn)</p>
      <div class="space-y-2 max-h-40 overflow-y-auto">
        <div 
          v-for="(image, index) in store.draft.galleryUrls" 
          :key="index"
          class="flex items-center gap-2"
        >
          <span class="text-xs text-slate-400 w-6">#{{ index + 1 }}</span>
          <input 
            :value="image.caption"
            type="text"
            class="input-field text-sm flex-1 py-1.5"
            placeholder="Chú thích..."
            @input="store.updateGalleryCaption(index, ($event.target as HTMLInputElement).value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePostsAdminStore } from '~/stores/postsAdmin'
import { useCloudinaryUpload } from '~/composables/useCloudinaryUpload'

const store = usePostsAdminStore()
const { uploadImage, getGalleryThumbUrl } = useCloudinaryUpload()

const galleryInputRef = ref<HTMLInputElement | null>(null)
const urlInput = ref('')
const isDragging = ref(false)
const uploading = ref(false)
const uploadingCount = ref(0)
const uploadProgress = ref(0)

async function handleFilesSelect(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (files) {
    await uploadFiles(Array.from(files))
  }
  // Reset input
  if (galleryInputRef.value) galleryInputRef.value.value = ''
}

async function handleDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (files) {
    await uploadFiles(Array.from(files))
  }
}

async function uploadFiles(files: File[]) {
  // Validate count
  const remaining = 12 - store.draft.galleryUrls.length
  if (remaining <= 0) {
    alert('Đã đạt giới hạn 12 ảnh')
    return
  }
  
  const toUpload = files.slice(0, remaining)
  
  // Validate size
  const validFiles = toUpload.filter(f => {
    if (f.size > 5 * 1024 * 1024) {
      alert(`Ảnh ${f.name} quá lớn (>5MB)`)
      return false
    }
    return true
  })
  
  if (validFiles.length === 0) return
  
  uploading.value = true
  uploadingCount.value = validFiles.length
  uploadProgress.value = 0
  
  try {
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      if (!file) continue
      
      const result = await uploadImage(file, {
        folder: 'posts/gallery',
        onProgress: (p) => {
          // Calculate overall progress
          const baseProgress = (i / validFiles.length) * 100
          const fileProgress = (p / validFiles.length)
          uploadProgress.value = Math.round(baseProgress + fileProgress)
        }
      })
      
      store.addGalleryImage({
        url: result.url,
        publicId: result.publicId,
        caption: ''
      })
    }
    
    uploadProgress.value = 100
  } catch (error: any) {
    alert(error.message || 'Lỗi tải ảnh')
  } finally {
    uploading.value = false
    uploadingCount.value = 0
    uploadProgress.value = 0
  }
}

function addFromUrl() {
  if (!urlInput.value || !urlInput.value.startsWith('http')) return
  
  if (store.draft.galleryUrls.length >= 12) {
    alert('Đã đạt giới hạn 12 ảnh')
    return
  }
  
  store.addGalleryImage({
    url: urlInput.value,
    caption: ''
  })
  
  urlInput.value = ''
}

function moveImage(fromIndex: number, toIndex: number) {
  store.reorderGallery(fromIndex, toIndex)
}
</script>
