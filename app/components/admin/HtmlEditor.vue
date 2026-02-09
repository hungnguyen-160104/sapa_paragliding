<template>
  <div class="space-y-4">
    <!-- Editor Toolbar -->
    <div class="flex flex-wrap gap-1 p-2 bg-gray-50 rounded-lg border border-gray-200">
      <button 
        v-for="btn in toolbarButtons" 
        :key="btn.action"
        type="button"
        @click="execCommand(btn.action, btn.value)"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        :title="btn.title"
      >
        <span v-html="btn.icon"></span>
      </button>
      
      <div class="w-px bg-gray-300 mx-1"></div>
      
      <!-- Insert Link -->
      <button 
        type="button"
        @click="showLinkModal = true"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        title="Chèn link"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>
      
      <!-- Insert Image -->
      <button 
        type="button"
        @click="showImageModal = true"
        class="p-2 rounded hover:bg-gray-200 transition-colors"
        title="Chèn ảnh từ URL"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      
      <div class="w-px bg-gray-300 mx-1"></div>
      
      <!-- Toggle Preview -->
      <button 
        type="button"
        @click="showPreview = !showPreview"
        class="px-3 py-1 rounded text-sm font-medium transition-colors"
        :class="showPreview ? 'bg-red-100 text-red-700' : 'hover:bg-gray-200'"
      >
        {{ showPreview ? 'Ẩn Preview' : 'Preview' }}
      </button>
    </div>
    
    <!-- Editor Area -->
    <div class="grid gap-4" :class="showPreview ? 'md:grid-cols-2' : 'grid-cols-1'">
      <!-- Editor -->
      <div>
        <div 
          ref="editorRef"
          contenteditable="true"
          class="min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none prose prose-sm max-w-none"
          @input="handleInput"
          @paste="handlePaste"
        ></div>
      </div>
      
      <!-- Preview -->
      <div v-if="showPreview">
        <div class="min-h-[300px] p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p class="text-xs text-gray-500 mb-2 font-medium">PREVIEW</p>
          <div 
            class="prose prose-sm max-w-none"
            v-html="sanitizedHtml"
          ></div>
        </div>
      </div>
    </div>
    
    <!-- Link Modal -->
    <Teleport to="body">
      <div v-if="showLinkModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="showLinkModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold mb-4">Chèn link</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Text hiển thị</label>
              <input v-model="linkText" type="text" class="input-field" placeholder="Nhập text...">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input v-model="linkUrl" type="url" class="input-field" placeholder="https://...">
            </div>
          </div>
          <div class="mt-6 flex space-x-3">
            <button @click="showLinkModal = false" class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
            <button @click="insertLink" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Chèn</button>
          </div>
        </div>
      </div>
    </Teleport>
    
    <!-- Image Modal -->
    <Teleport to="body">
      <div v-if="showImageModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="showImageModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          <h3 class="text-lg font-semibold mb-4">Chèn ảnh từ URL</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">URL ảnh (Cloudinary)</label>
              <input v-model="imageUrl" type="url" class="input-field" placeholder="https://res.cloudinary.com/...">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Alt text</label>
              <input v-model="imageAlt" type="text" class="input-field" placeholder="Mô tả ảnh...">
            </div>
            <!-- Preview -->
            <div v-if="imageUrl && isValidImageUrl(imageUrl)" class="border rounded-lg p-2">
              <img :src="imageUrl" :alt="imageAlt" class="max-h-40 mx-auto rounded">
            </div>
          </div>
          <div class="mt-6 flex space-x-3">
            <button @click="showImageModal = false" class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Hủy</button>
            <button @click="insertImage" :disabled="!isValidImageUrl(imageUrl)" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">Chèn</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLElement | null>(null)
const showPreview = ref(false)
const showLinkModal = ref(false)
const showImageModal = ref(false)

const linkText = ref('')
const linkUrl = ref('')
const imageUrl = ref('')
const imageAlt = ref('')

const toolbarButtons = [
  { action: 'bold', title: 'Bold', icon: '<strong class="text-sm">B</strong>' },
  { action: 'italic', title: 'Italic', icon: '<em class="text-sm">I</em>' },
  { action: 'underline', title: 'Underline', icon: '<u class="text-sm">U</u>' },
  { action: 'formatBlock', value: 'h1', title: 'Heading 1', icon: '<span class="text-xs font-bold">H1</span>' },
  { action: 'formatBlock', value: 'h2', title: 'Heading 2', icon: '<span class="text-xs font-bold">H2</span>' },
  { action: 'formatBlock', value: 'h3', title: 'Heading 3', icon: '<span class="text-xs font-bold">H3</span>' },
  { action: 'insertUnorderedList', title: 'Bullet list', icon: '•' },
  { action: 'insertOrderedList', title: 'Number list', icon: '1.' },
  { action: 'formatBlock', value: 'blockquote', title: 'Quote', icon: '"' },
]

// Sanitize HTML for XSS protection
const sanitizedHtml = computed(() => {
  return sanitizeHtml(props.modelValue)
})

// Simple HTML sanitizer (in production use DOMPurify)
const sanitizeHtml = (html: string): string => {
  if (!html) return ''
  
  // Create a temporary element
  const temp = document.createElement('div')
  temp.innerHTML = html
  
  // Allowed tags
  const allowedTags = ['p', 'a', 'img', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'b', 'i', 'u', 'br', 'blockquote', 'div', 'span']
  const allowedAttrs = ['href', 'src', 'alt', 'target', 'rel', 'class']
  
  // Process all elements
  const processNode = (node: Element) => {
    // Remove disallowed tags but keep content
    if (!allowedTags.includes(node.tagName.toLowerCase())) {
      const parent = node.parentNode
      while (node.firstChild) {
        parent?.insertBefore(node.firstChild, node)
      }
      parent?.removeChild(node)
      return
    }
    
    // Remove disallowed attributes
    const attrs = Array.from(node.attributes)
    attrs.forEach(attr => {
      if (!allowedAttrs.includes(attr.name)) {
        node.removeAttribute(attr.name)
      }
    })
    
    // Add security attributes to links
    if (node.tagName.toLowerCase() === 'a') {
      const href = node.getAttribute('href') || ''
      if (href.startsWith('http') && !href.includes(window.location.hostname)) {
        node.setAttribute('target', '_blank')
        node.setAttribute('rel', 'noopener noreferrer')
      }
    }
    
    // Process children
    Array.from(node.children).forEach(processNode)
  }
  
  Array.from(temp.children).forEach(processNode)
  
  return temp.innerHTML
}

const execCommand = (command: string, value?: string) => {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  updateContent()
}

const handleInput = () => {
  updateContent()
}

const handlePaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const text = e.clipboardData?.getData('text/plain') || ''
  document.execCommand('insertText', false, text)
  updateContent()
}

const updateContent = () => {
  if (editorRef.value) {
    emit('update:modelValue', editorRef.value.innerHTML)
  }
}

const insertLink = () => {
  if (linkUrl.value) {
    const html = `<a href="${linkUrl.value}" target="_blank" rel="noopener noreferrer">${linkText.value || linkUrl.value}</a>`
    document.execCommand('insertHTML', false, html)
    updateContent()
  }
  showLinkModal.value = false
  linkText.value = ''
  linkUrl.value = ''
}

const insertImage = () => {
  if (imageUrl.value && isValidImageUrl(imageUrl.value)) {
    const html = `<img src="${imageUrl.value}" alt="${imageAlt.value || ''}" class="max-w-full rounded-lg my-4">`
    document.execCommand('insertHTML', false, html)
    updateContent()
  }
  showImageModal.value = false
  imageUrl.value = ''
  imageAlt.value = ''
}

const isValidImageUrl = (url: string): boolean => {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(parsed.pathname)
  } catch {
    return false
  }
}

// Initialize editor content
onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }
})

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  if (editorRef.value && editorRef.value.innerHTML !== newVal) {
    editorRef.value.innerHTML = newVal
  }
})
</script>
