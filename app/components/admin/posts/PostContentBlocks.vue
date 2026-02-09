<template>
  <div class="space-y-3">
    <!-- Blocks List -->
    <div 
      v-for="(block, index) in store.draft.contentBlocks" 
      :key="block.id"
      class="group relative border border-slate-200 rounded-xl bg-white hover:border-slate-300 transition-colors"
    >
      <!-- Block Controls -->
      <div class="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <button 
          class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
          :disabled="index === 0"
          title="Di chuyển lên"
          @click="store.moveBlock(block.id, 'up')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button 
          class="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
          :disabled="index === store.draft.contentBlocks.length - 1"
          title="Di chuyển xuống"
          @click="store.moveBlock(block.id, 'down')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <!-- Block Header -->
      <div class="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50 rounded-t-xl">
        <span class="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {{ getBlockLabel(block.type) }}
        </span>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            class="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
            title="Nhân bản"
            @click="store.duplicateBlock(block.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          <button 
            class="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600"
            title="Xóa"
            @click="store.removeBlock(block.id)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Block Content -->
      <div class="p-4">
        <!-- Heading Block -->
        <template v-if="block.type === 'heading'">
          <div class="flex items-center gap-3">
            <select 
              :value="block.data.level"
              class="input-field w-20 text-sm py-1.5"
              @change="updateBlockData(block.id, { level: Number(($event.target as HTMLSelectElement).value) })"
            >
              <option :value="1">H1</option>
              <option :value="2">H2</option>
              <option :value="3">H3</option>
            </select>
            <input 
              :value="block.data.text"
              type="text"
              class="input-field flex-1"
              :class="{
                'text-2xl font-bold': block.data.level === 1,
                'text-xl font-semibold': block.data.level === 2,
                'text-lg font-medium': block.data.level === 3
              }"
              placeholder="Nhập tiêu đề..."
              @input="updateBlockData(block.id, { text: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </template>
        
        <!-- Paragraph Block -->
        <template v-else-if="block.type === 'paragraph'">
          <textarea 
            :value="block.data.text"
            rows="3"
            class="input-field resize-none"
            placeholder="Nhập nội dung đoạn văn..."
            @input="updateBlockData(block.id, { text: ($event.target as HTMLTextAreaElement).value })"
          />
        </template>
        
        <!-- Image Block -->
        <template v-else-if="block.type === 'image'">
          <div v-if="!block.data.url" class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
            <input 
              :ref="el => imageInputRefs[block.id] = el as HTMLInputElement"
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageUpload($event, block.id)"
            />
            <button class="btn-secondary" @click="imageInputRefs[block.id]?.click()">
              📷 Tải ảnh lên
            </button>
            <p class="text-xs text-slate-400 mt-2">Hoặc dán URL</p>
            <input 
              type="url"
              class="input-field mt-2 text-sm"
              placeholder="https://res.cloudinary.com/..."
              @blur="handleImageUrlInput($event, block.id)"
            />
          </div>
          <div v-else class="space-y-3">
            <div class="relative inline-block">
              <img :src="block.data.url" alt="" class="max-h-60 rounded-lg" />
              <button 
                class="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-100 rounded-lg shadow"
                @click="updateBlockData(block.id, { url: '', caption: '', alt: '' })"
              >
                ✕
              </button>
            </div>
            <input 
              :value="block.data.caption"
              type="text"
              class="input-field text-sm"
              placeholder="Chú thích ảnh (tùy chọn)"
              @input="updateBlockData(block.id, { caption: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </template>
        
        <!-- Quote Block -->
        <template v-else-if="block.type === 'quote'">
          <div class="border-l-4 border-red-500 pl-4 space-y-2">
            <textarea 
              :value="block.data.text"
              rows="2"
              class="input-field resize-none italic"
              placeholder="Nội dung trích dẫn..."
              @input="updateBlockData(block.id, { text: ($event.target as HTMLTextAreaElement).value })"
            />
            <input 
              :value="block.data.author"
              type="text"
              class="input-field text-sm"
              placeholder="— Tác giả (tùy chọn)"
              @input="updateBlockData(block.id, { author: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </template>
        
        <!-- Bullet List Block -->
        <template v-else-if="block.type === 'bulletList'">
          <div class="space-y-2">
            <div 
              v-for="(item, itemIndex) in block.data.items" 
              :key="itemIndex"
              class="flex items-center gap-2"
            >
              <span class="text-slate-400">•</span>
              <input 
                :value="item"
                type="text"
                class="input-field flex-1"
                placeholder="Mục trong danh sách..."
                @input="updateListItem(block.id, Number(itemIndex), ($event.target as HTMLInputElement).value)"
              />
              <button 
                v-if="block.data.items.length > 1"
                class="p-1 hover:bg-red-100 rounded text-slate-400 hover:text-red-600"
                @click="removeListItem(block.id, Number(itemIndex))"
              >
                ✕
              </button>
            </div>
            <button 
              class="text-sm text-red-600 hover:underline"
              @click="addListItem(block.id)"
            >
              + Thêm mục
            </button>
          </div>
        </template>
        
        <!-- Divider Block -->
        <template v-else-if="block.type === 'divider'">
          <div class="flex items-center justify-center py-2">
            <hr class="flex-1 border-slate-300" />
            <span class="px-3 text-slate-400 text-xs">PHÂN CÁCH</span>
            <hr class="flex-1 border-slate-300" />
          </div>
        </template>
        
        <!-- CTA Block -->
        <template v-else-if="block.type === 'cta'">
          <div class="bg-red-50 rounded-lg p-4 space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-xs font-medium text-slate-500">Loại CTA</label>
                <select 
                  :value="block.data.type"
                  class="input-field text-sm mt-1"
                  @change="updateBlockData(block.id, { type: ($event.target as HTMLSelectElement).value })"
                >
                  <option value="booking">Đặt bay</option>
                  <option value="tour">Đặt tour</option>
                  <option value="contact">Liên hệ</option>
                </select>
              </div>
              <div>
                <label class="text-xs font-medium text-slate-500">Link</label>
                <input 
                  :value="block.data.link"
                  type="text"
                  class="input-field text-sm mt-1"
                  placeholder="/booking"
                  @input="updateBlockData(block.id, { link: ($event.target as HTMLInputElement).value })"
                />
              </div>
            </div>
            <div>
              <label class="text-xs font-medium text-slate-500">Nội dung nút</label>
              <input 
                :value="block.data.text"
                type="text"
                class="input-field text-sm mt-1"
                placeholder="Đặt bay ngay"
                @input="updateBlockData(block.id, { text: ($event.target as HTMLInputElement).value })"
              />
            </div>
          </div>
        </template>
      </div>
      
      <!-- Add Block Button (between blocks) -->
      <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          class="p-1.5 bg-white border border-slate-300 rounded-full shadow-sm hover:bg-slate-50 hover:border-red-400"
          @click="showAddMenu(index)"
        >
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Add First/Last Block Button -->
    <button 
      class="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-red-400 hover:text-red-600 transition-colors"
      @click="showAddMenu(store.draft.contentBlocks.length - 1)"
    >
      + Thêm block mới
    </button>
    
    <!-- Add Block Menu -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div 
          v-if="addMenuVisible"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          @click.self="addMenuVisible = false"
        >
          <div class="bg-white rounded-xl shadow-xl w-full max-w-sm p-4">
            <h4 class="font-semibold text-slate-900 mb-3">Thêm block</h4>
            <div class="grid grid-cols-2 gap-2">
              <button 
                v-for="blockType in blockTypes" 
                :key="blockType.type"
                class="flex items-center gap-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-red-300 transition-colors text-left"
                @click="addBlock(blockType.type)"
              >
                <span class="text-lg">{{ blockType.icon }}</span>
                <span class="text-sm font-medium">{{ blockType.label }}</span>
              </button>
            </div>
            <button 
              class="mt-4 w-full py-2 text-sm text-slate-500 hover:text-slate-700"
              @click="addMenuVisible = false"
            >
              Hủy
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { usePostsAdminStore, type ContentBlock } from '~/stores/postsAdmin'
import { useCloudinaryUpload } from '~/composables/useCloudinaryUpload'

const store = usePostsAdminStore()
const { uploadImage } = useCloudinaryUpload()

const addMenuVisible = ref(false)
const addMenuAfterIndex = ref(-1)
const imageInputRefs = reactive<Record<string, HTMLInputElement | null>>({})

const blockTypes = [
  { type: 'heading', label: 'Tiêu đề', icon: 'H' },
  { type: 'paragraph', label: 'Đoạn văn', icon: '¶' },
  { type: 'image', label: 'Hình ảnh', icon: '🖼️' },
  { type: 'quote', label: 'Trích dẫn', icon: '❝' },
  { type: 'bulletList', label: 'Danh sách', icon: '•' },
  { type: 'divider', label: 'Phân cách', icon: '─' },
  { type: 'cta', label: 'Nút CTA', icon: '🎫' }
] as const

function getBlockLabel(type: string): string {
  return blockTypes.find(b => b.type === type)?.label || type
}

function showAddMenu(afterIndex: number) {
  addMenuAfterIndex.value = afterIndex
  addMenuVisible.value = true
}

function addBlock(type: ContentBlock['type']) {
  store.addBlock(type, addMenuAfterIndex.value)
  addMenuVisible.value = false
}

function updateBlockData(blockId: string, data: any) {
  store.updateBlockData(blockId, data)
}

// List item helpers
function addListItem(blockId: string) {
  const block = store.draft.contentBlocks.find(b => b.id === blockId)
  if (block && block.type === 'bulletList') {
    block.data.items = [...(block.data.items || []), '']
  }
}

function removeListItem(blockId: string, index: number) {
  const block = store.draft.contentBlocks.find(b => b.id === blockId)
  if (block && block.type === 'bulletList') {
    block.data.items.splice(index, 1)
  }
}

function updateListItem(blockId: string, index: number, value: string) {
  const block = store.draft.contentBlocks.find(b => b.id === blockId)
  if (block && block.type === 'bulletList') {
    block.data.items[index] = value
  }
}

// Image upload
async function handleImageUpload(event: Event, blockId: string) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  
  try {
    const result = await uploadImage(file, { folder: 'posts/content' })
    updateBlockData(blockId, { url: result.url })
  } catch (error: any) {
    alert(error.message || 'Lỗi tải ảnh')
  }
}

function handleImageUrlInput(event: Event, blockId: string) {
  const url = (event.target as HTMLInputElement).value
  if (url && url.startsWith('http')) {
    updateBlockData(blockId, { url })
    ;(event.target as HTMLInputElement).value = ''
  }
}
</script>
