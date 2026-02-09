<template>
  <div class="flex flex-col h-full">
    <!-- Search & Filters -->
    <div class="bg-white rounded-xl border border-slate-200 p-4 mb-4">
      <div class="flex flex-wrap items-end gap-3">
        <!-- Search -->
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-medium text-slate-500 mb-1">Tìm kiếm</label>
          <div class="relative">
            <input 
              v-model="store.filters.search"
              type="text" 
              class="input-field pl-9 w-full"
              placeholder="Tìm theo tiêu đề..."
              @input="debouncedSearch"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <!-- Category -->
        <div class="w-36">
          <label class="block text-xs font-medium text-slate-500 mb-1">Danh mục</label>
          <select v-model="store.filters.categoryId" class="input-field w-full" @change="handleFilterChange">
            <option value="">Tất cả</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.label }}
            </option>
          </select>
        </div>
        
        <!-- Status -->
        <div class="w-32">
          <label class="block text-xs font-medium text-slate-500 mb-1">Trạng thái</label>
          <select v-model="store.filters.status" class="input-field w-full" @change="handleFilterChange">
            <option value="">Tất cả</option>
            <option value="DRAFT">Nháp</option>
            <option value="PUBLISHED">Đã xuất bản</option>
          </select>
        </div>
        
        <!-- Create Button -->
        <button 
          class="btn-primary whitespace-nowrap"
          @click="$emit('create')"
        >
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tạo bài viết
        </button>
      </div>
    </div>
    
    <!-- Posts List -->
    <div class="flex-1 overflow-auto bg-white rounded-xl border border-slate-200">
      <!-- Loading -->
      <div v-if="store.listLoading" class="p-4 space-y-3">
        <div v-for="i in 5" :key="i" class="animate-pulse flex gap-4 p-3 border-b border-slate-100">
          <div class="w-20 h-14 bg-slate-200 rounded-lg shrink-0" />
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-slate-200 rounded w-3/4" />
            <div class="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
      </div>
      
      <!-- Error -->
      <div v-else-if="store.listError" class="p-8 text-center">
        <p class="text-red-500">{{ store.listError }}</p>
        <button class="btn-secondary mt-4" @click="store.fetchPosts">Thử lại</button>
      </div>
      
      <!-- Empty -->
      <div v-else-if="store.posts.length === 0" class="p-8 text-center">
        <span class="text-5xl">📝</span>
        <p class="mt-4 text-slate-500">Chưa có bài viết nào</p>
        <button class="btn-primary mt-4" @click="$emit('create')">
          + Tạo bài viết đầu tiên
        </button>
      </div>
      
      <!-- Post Items -->
      <div v-else class="divide-y divide-slate-100">
        <div 
          v-for="post in store.posts" 
          :key="post.id"
          class="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
          :class="{ 
            'bg-red-50 border-l-4 border-red-600': store.selectedPostId === post.id 
          }"
          @click="$emit('select', post.id)"
        >
          <!-- Thumbnail -->
          <div class="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
            <img 
              v-if="post.thumbnailUrl" 
              :src="getThumbnailUrl(post.thumbnailUrl)" 
              :alt="post.title"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-slate-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-slate-900 truncate">{{ post.title }}</h4>
            <div class="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span class="truncate">/{{ post.slug }}</span>
              <span>•</span>
              <span>{{ getCategoryLabel(post.categoryId) }}</span>
              <span>•</span>
              <span>{{ formatDate(post.updatedAt) }}</span>
            </div>
          </div>
          
          <!-- Status Badge -->
          <div class="shrink-0">
            <span 
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="post.status === 'PUBLISHED' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'"
            >
              {{ post.status === 'PUBLISHED' ? 'Đã xuất bản' : 'Nháp' }}
            </span>
          </div>
          
          <!-- Actions Menu -->
          <div class="shrink-0 relative" @click.stop>
            <button 
              class="p-2 hover:bg-slate-200 rounded-lg transition-colors"
              @click="toggleMenu(post.id)"
            >
              <svg class="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
            
            <!-- Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div 
                v-if="openMenuId === post.id"
                class="absolute right-0 top-10 z-20 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1"
              >
                <button 
                  class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  @click="handleToggleStatus(post)"
                >
                  <span>{{ post.status === 'PUBLISHED' ? '📝 Chuyển nháp' : '✅ Xuất bản' }}</span>
                </button>
                <button 
                  class="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  @click="handleDuplicate(post.id)"
                >
                  <span>📋 Nhân bản</span>
                </button>
                <hr class="my-1 border-slate-100" />
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  @click="handleDelete(post)"
                >
                  <span>🗑️ Xóa</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div v-if="store.posts.length > 0" class="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
        <p class="text-sm text-slate-500">
          Hiển thị {{ (store.pagination.page - 1) * store.pagination.pageSize + 1 }}–{{ Math.min(store.pagination.page * store.pagination.pageSize, store.pagination.total) }} / {{ store.pagination.total }}
        </p>
        <div class="flex items-center gap-2">
          <button 
            class="btn-secondary text-sm py-1.5 px-3"
            :disabled="store.pagination.page === 1"
            @click="store.changePage(store.pagination.page - 1)"
          >
            ← Trước
          </button>
          <button 
            class="btn-secondary text-sm py-1.5 px-3"
            :disabled="!store.hasMore"
            @click="store.changePage(store.pagination.page + 1)"
          >
            Sau →
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Confirm Modal -->
    <ConfirmModal
      :open="!!postToDelete"
      title="Xóa bài viết"
      description="Hành động này không thể hoàn tác."
      @cancel="postToDelete = null"
      @confirm="confirmDelete"
    >
      <p class="text-sm text-slate-600">
        Bạn có chắc muốn xóa <strong>{{ postToDelete?.title }}</strong>?
      </p>
    </ConfirmModal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePostsAdminStore, type PostSummary } from '~/stores/postsAdmin'
import { useCloudinaryUpload } from '~/composables/useCloudinaryUpload'
import ConfirmModal from '~/components/admin/ui/ConfirmModal.vue'

const emit = defineEmits<{
  create: []
  select: [id: string]
}>()

const store = usePostsAdminStore()
const { getThumbnailUrl } = useCloudinaryUpload()

const openMenuId = ref<string | null>(null)
const postToDelete = ref<PostSummary | null>(null)

const categories = [
  { id: 'news', label: 'Tin tức' },
  { id: 'guide', label: 'Hướng dẫn' },
  { id: 'experience', label: 'Trải nghiệm' },
  { id: 'promotion', label: 'Khuyến mãi' },
  { id: 'adventure', label: 'Phiêu lưu' },
  { id: 'safety', label: 'An toàn' },
  { id: 'tips', label: 'Mẹo hay' }
]

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout> | null = null
function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.pagination.page = 1
    store.fetchPosts()
  }, 300)
}

function handleFilterChange() {
  store.pagination.page = 1
  store.fetchPosts()
}

function getCategoryLabel(id: string): string {
  return categories.find(c => c.id === id)?.label || id
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

function toggleMenu(postId: string) {
  openMenuId.value = openMenuId.value === postId ? null : postId
}

// Close menu when clicking outside
function handleClickOutside(e: MouseEvent) {
  if (openMenuId.value && !(e.target as Element).closest('.relative')) {
    openMenuId.value = null
  }
}

async function handleToggleStatus(post: PostSummary) {
  openMenuId.value = null
  await store.togglePublishStatus(post.id)
}

async function handleDuplicate(postId: string) {
  openMenuId.value = null
  await store.duplicatePost(postId)
}

function handleDelete(post: PostSummary) {
  openMenuId.value = null
  postToDelete.value = post
}

async function confirmDelete() {
  if (postToDelete.value) {
    await store.deletePost(postToDelete.value.id)
    postToDelete.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (searchTimeout) clearTimeout(searchTimeout)
})
</script>
