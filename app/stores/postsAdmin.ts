/**
 * Posts Admin Store
 * Quản lý state cho trang admin bài viết với 2-pane layout
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed, watch } from 'vue'

// Types
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED'
export type PostCategory = 'news' | 'guide' | 'experience' | 'promotion' | 'adventure' | 'safety' | 'tips'

export interface PostSummary {
  id: string
  title: string
  slug: string
  excerpt?: string
  categoryId: string
  status: PostStatus
  updatedAt?: string
  thumbnailUrl?: string
  views?: number
}

export interface ContentBlock {
  id: string
  type: 'heading' | 'paragraph' | 'image' | 'gallery' | 'quote' | 'bulletList' | 'divider' | 'cta'
  data: any
}

export interface GalleryImage {
  url: string
  publicId?: string
  caption?: string
}

export interface PostDraft {
  id?: string
  title: string
  slug: string
  excerpt: string
  categoryId: string
  tags: string[]
  status: PostStatus
  scheduledAt?: string
  thumbnailUrl: string
  thumbnailPublicId?: string
  contentBlocks: ContentBlock[]
  galleryUrls: GalleryImage[]
  seo: {
    title: string
    description: string
    ogImage: string
  }
  // Legacy support
  contentHtml?: string
}

export interface PostStats {
  total: number
  published: number
  draft: number
  scheduled: number
  categories: number
}

const createEmptyDraft = (): PostDraft => ({
  title: '',
  slug: '',
  excerpt: '',
  categoryId: '',
  tags: [],
  status: 'DRAFT',
  thumbnailUrl: '',
  contentBlocks: [
    { id: crypto.randomUUID(), type: 'paragraph', data: { text: '' } }
  ],
  galleryUrls: [],
  seo: {
    title: '',
    description: '',
    ogImage: ''
  }
})

export const usePostsAdminStore = defineStore('postsAdmin', () => {
  // ============================================
  // LIST STATE
  // ============================================
  const filters = reactive({
    search: '',
    categoryId: '',
    status: '',
    sort: 'newest' as 'newest' | 'updated' | 'views'
  })
  
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0
  })
  
  const posts = ref<PostSummary[]>([])
  const stats = ref<PostStats>({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    categories: 0
  })
  
  const listLoading = ref(false)
  const listError = ref<string | null>(null)

  // ============================================
  // EDITOR STATE
  // ============================================
  const selectedPostId = ref<string | null>(null)
  const editorMode = ref<'closed' | 'create' | 'edit'>('closed')
  const draft = ref<PostDraft>(createEmptyDraft())
  const originalDraft = ref<string>('')
  
  const dirty = computed(() => {
    if (editorMode.value === 'closed') return false
    return JSON.stringify(draft.value) !== originalDraft.value
  })
  
  const saving = ref(false)
  const lastSavedAt = ref<Date | null>(null)
  const editorLoading = ref(false)
  
  const uploading = reactive({
    cover: false,
    content: false,
    gallery: false
  })
  
  const uploadProgress = reactive({
    cover: 0,
    content: 0,
    gallery: 0
  })
  
  const validationErrors = ref<Record<string, string>>({})

  // ============================================
  // COMPUTED
  // ============================================
  const hasMore = computed(() => pagination.page * pagination.pageSize < pagination.total)
  
  const canPublish = computed(() => {
    const d = draft.value
    return d.title.trim().length >= 3 &&
           d.excerpt.trim().length > 0 &&
           d.categoryId !== '' &&
           d.thumbnailUrl !== ''
  })

  // ============================================
  // LIST ACTIONS
  // ============================================
  async function fetchPosts() {
    listLoading.value = true
    listError.value = null
    
    try {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.categoryId) params.set('categoryId', filters.categoryId)
      if (filters.status) params.set('status', filters.status)
      params.set('page', pagination.page.toString())
      params.set('pageSize', pagination.pageSize.toString())
      
      const response = await $fetch<{
        success: boolean
        data: PostSummary[]
        total: number
      }>(`/api/admin/posts?${params.toString()}`)
      
      if (response.success) {
        posts.value = response.data
        pagination.total = response.total
      } else {
        listError.value = 'Không thể tải danh sách bài viết'
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      listError.value = 'Lỗi kết nối server'
    } finally {
      listLoading.value = false
    }
  }

  async function fetchStats() {
    try {
      const response = await $fetch<{
        success: boolean
        data: PostStats
      }>('/api/admin/posts/stats')
      
      if (response.success && response.data) {
        stats.value = response.data
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  function resetFilters() {
    filters.search = ''
    filters.categoryId = ''
    filters.status = ''
    filters.sort = 'newest'
    pagination.page = 1
  }

  function changePage(newPage: number) {
    pagination.page = Math.max(1, newPage)
    fetchPosts()
  }

  // ============================================
  // EDITOR ACTIONS
  // ============================================
  function openCreateEditor() {
    selectedPostId.value = null
    editorMode.value = 'create'
    draft.value = createEmptyDraft()
    originalDraft.value = JSON.stringify(draft.value)
    validationErrors.value = {}
    lastSavedAt.value = null
  }

  async function openEditEditor(postId: string): Promise<boolean> {
    editorLoading.value = true
    
    try {
      const response = await $fetch<{
        success: boolean
        data: any
      }>(`/api/admin/posts/${postId}`)
      
      if (response.success && response.data) {
        const post = response.data
        selectedPostId.value = postId
        editorMode.value = 'edit'
        
        // Map API response to draft format
        draft.value = {
          id: post.id,
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          categoryId: post.categoryId || '',
          tags: post.tags || [],
          status: post.status || 'DRAFT',
          scheduledAt: post.scheduledAt,
          thumbnailUrl: post.thumbnailUrl || '',
          contentBlocks: post.contentBlocks || [
            { id: crypto.randomUUID(), type: 'paragraph', data: { text: '' } }
          ],
          galleryUrls: (post.galleryUrls || []).map((url: string | GalleryImage) => 
            typeof url === 'string' ? { url, caption: '' } : url
          ),
          seo: post.seo || { title: '', description: '', ogImage: '' },
          contentHtml: post.contentHtml || ''
        }
        
        originalDraft.value = JSON.stringify(draft.value)
        validationErrors.value = {}
        lastSavedAt.value = post.updatedAt ? new Date(post.updatedAt) : null
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error loading post:', error)
      return false
    } finally {
      editorLoading.value = false
    }
  }

  function closeEditor(force = false): boolean {
    if (!force && dirty.value) {
      return false // Caller should show confirm dialog
    }
    
    selectedPostId.value = null
    editorMode.value = 'closed'
    draft.value = createEmptyDraft()
    originalDraft.value = ''
    validationErrors.value = {}
    lastSavedAt.value = null
    
    return true
  }

  function validateDraft(): boolean {
    const errors: Record<string, string> = {}
    
    if (!draft.value.title.trim()) {
      errors.title = 'Tiêu đề không được để trống'
    } else if (draft.value.title.length < 3) {
      errors.title = 'Tiêu đề phải có ít nhất 3 ký tự'
    }
    
    if (!draft.value.slug.trim()) {
      errors.slug = 'Slug không được để trống'
    }
    
    if (draft.value.status === 'PUBLISHED') {
      if (!draft.value.excerpt.trim()) {
        errors.excerpt = 'Cần mô tả ngắn để xuất bản'
      }
      if (!draft.value.categoryId) {
        errors.categoryId = 'Chọn danh mục để xuất bản'
      }
      if (!draft.value.thumbnailUrl) {
        errors.thumbnailUrl = 'Cần ảnh bìa để xuất bản'
      }
    }
    
    validationErrors.value = errors
    return Object.keys(errors).length === 0
  }

  async function saveDraft(): Promise<boolean> {
    if (!validateDraft()) return false
    
    saving.value = true
    
    try {
      // Convert contentBlocks to HTML for legacy support
      const contentHtml = blocksToHtml(draft.value.contentBlocks)
      
      const payload = {
        title: draft.value.title,
        slug: draft.value.slug,
        excerpt: draft.value.excerpt,
        categoryId: draft.value.categoryId,
        status: 'DRAFT',
        thumbnailUrl: draft.value.thumbnailUrl,
        galleryUrls: draft.value.galleryUrls.map(g => g.url).filter(Boolean),
        contentHtml,
        contentBlocks: draft.value.contentBlocks,
        tags: draft.value.tags,
        seo: draft.value.seo,
        scheduledAt: draft.value.scheduledAt
      }
      
      let response: any
      
      if (editorMode.value === 'edit' && selectedPostId.value) {
        response = await $fetch(`/api/admin/posts/${selectedPostId.value}`, {
          method: 'PUT' as 'PUT',
          body: payload
        } as any)
      } else {
        response = await $fetch('/api/admin/posts', {
          method: 'POST' as 'POST',
          body: payload
        } as any)
        
        if (response.success && response.post) {
          selectedPostId.value = response.post.id
          draft.value.id = response.post.id
          editorMode.value = 'edit'
        }
      }
      
      if (response.success) {
        lastSavedAt.value = new Date()
        originalDraft.value = JSON.stringify(draft.value)
        fetchPosts()
        fetchStats()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error saving draft:', error)
      return false
    } finally {
      saving.value = false
    }
  }

  async function publish(): Promise<boolean> {
    draft.value.status = 'PUBLISHED'
    
    if (!validateDraft()) {
      draft.value.status = 'DRAFT'
      return false
    }
    
    saving.value = true
    
    try {
      const contentHtml = blocksToHtml(draft.value.contentBlocks)
      
      const payload = {
        title: draft.value.title,
        slug: draft.value.slug,
        excerpt: draft.value.excerpt,
        categoryId: draft.value.categoryId,
        status: 'PUBLISHED',
        thumbnailUrl: draft.value.thumbnailUrl,
        galleryUrls: draft.value.galleryUrls.map(g => g.url).filter(Boolean),
        contentHtml,
        contentBlocks: draft.value.contentBlocks,
        tags: draft.value.tags,
        seo: draft.value.seo
      }
      
      let response: any
      
      if (editorMode.value === 'edit' && selectedPostId.value) {
        response = await $fetch(`/api/admin/posts/${selectedPostId.value}`, {
          method: 'PUT' as 'PUT',
          body: payload
        } as any)
      } else {
        response = await $fetch('/api/admin/posts', {
          method: 'POST' as 'POST',
          body: payload
        } as any)
        
        if (response.success && response.post) {
          selectedPostId.value = response.post.id
          draft.value.id = response.post.id
          editorMode.value = 'edit'
        }
      }
      
      if (response.success) {
        lastSavedAt.value = new Date()
        originalDraft.value = JSON.stringify(draft.value)
        fetchPosts()
        fetchStats()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error publishing:', error)
      draft.value.status = 'DRAFT'
      return false
    } finally {
      saving.value = false
    }
  }

  async function togglePublishStatus(postId: string): Promise<boolean> {
    const post = posts.value.find(p => p.id === postId)
    if (!post) return false
    
    const newStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    const originalStatus = post.status
    
    // Optimistic update
    post.status = newStatus
    
    try {
      const response = await $fetch<{ success: boolean }>(`/api/admin/posts/${postId}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      })
      
      if (response.success) {
        fetchStats()
        return true
      }
      
      post.status = originalStatus
      return false
    } catch (error) {
      post.status = originalStatus
      console.error('Error toggling status:', error)
      return false
    }
  }

  async function duplicatePost(postId: string): Promise<boolean> {
    try {
      const response = await $fetch<{ success: boolean }>(`/api/admin/posts/${postId}/duplicate`, {
        method: 'POST'
      })
      
      if (response.success) {
        fetchPosts()
        fetchStats()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error duplicating post:', error)
      return false
    }
  }

  async function deletePost(postId: string): Promise<boolean> {
    try {
      const response = await $fetch<{ success: boolean }>(`/api/admin/posts/${postId}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        // Close editor if deleting current post
        if (selectedPostId.value === postId) {
          closeEditor(true)
        }
        
        fetchPosts()
        fetchStats()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Error deleting post:', error)
      return false
    }
  }

  // ============================================
  // CONTENT BLOCK ACTIONS
  // ============================================
  function addBlock(type: ContentBlock['type'], afterIndex?: number) {
    const newBlock: ContentBlock = {
      id: crypto.randomUUID(),
      type,
      data: getDefaultBlockData(type)
    }
    
    if (afterIndex !== undefined && afterIndex >= 0) {
      draft.value.contentBlocks.splice(afterIndex + 1, 0, newBlock)
    } else {
      draft.value.contentBlocks.push(newBlock)
    }
  }

  function removeBlock(blockId: string) {
    const index = draft.value.contentBlocks.findIndex(b => b.id === blockId)
    if (index > -1) {
      draft.value.contentBlocks.splice(index, 1)
    }
    
    // Ensure at least one block
    if (draft.value.contentBlocks.length === 0) {
      addBlock('paragraph')
    }
  }

  function moveBlock(blockId: string, direction: 'up' | 'down') {
    const index = draft.value.contentBlocks.findIndex(b => b.id === blockId)
    if (index === -1) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= draft.value.contentBlocks.length) return
    
    const blocks = [...draft.value.contentBlocks]
    const removed = blocks.splice(index, 1)[0]
    if (removed) {
      blocks.splice(newIndex, 0, removed)
      draft.value.contentBlocks = blocks
    }
  }

  function duplicateBlock(blockId: string) {
    const index = draft.value.contentBlocks.findIndex(b => b.id === blockId)
    if (index === -1) return
    
    const original = draft.value.contentBlocks[index]
    if (!original) return
    
    const duplicate: ContentBlock = {
      id: crypto.randomUUID(),
      type: original.type,
      data: JSON.parse(JSON.stringify(original.data))
    }
    
    draft.value.contentBlocks.splice(index + 1, 0, duplicate)
  }

  function updateBlockData(blockId: string, data: any) {
    const block = draft.value.contentBlocks.find(b => b.id === blockId)
    if (block) {
      block.data = { ...block.data, ...data }
    }
  }

  // ============================================
  // GALLERY ACTIONS
  // ============================================
  function addGalleryImage(image: GalleryImage) {
    draft.value.galleryUrls.push(image)
  }

  function removeGalleryImage(index: number) {
    draft.value.galleryUrls.splice(index, 1)
  }

  function reorderGallery(fromIndex: number, toIndex: number) {
    const gallery = [...draft.value.galleryUrls]
    const removed = gallery.splice(fromIndex, 1)[0]
    if (removed) {
      gallery.splice(toIndex, 0, removed)
      draft.value.galleryUrls = gallery
    }
  }

  function updateGalleryCaption(index: number, caption: string) {
    if (draft.value.galleryUrls[index]) {
      draft.value.galleryUrls[index].caption = caption
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  function getDefaultBlockData(type: ContentBlock['type']): any {
    switch (type) {
      case 'heading':
        return { level: 2, text: '' }
      case 'paragraph':
        return { text: '' }
      case 'image':
        return { url: '', caption: '', alt: '' }
      case 'gallery':
        return { images: [], layout: 'grid' }
      case 'quote':
        return { text: '', author: '' }
      case 'bulletList':
        return { items: [''] }
      case 'divider':
        return {}
      case 'cta':
        return { type: 'booking', text: 'Đặt bay ngay', link: '/booking' }
      default:
        return {}
    }
  }

  function blocksToHtml(blocks: ContentBlock[]): string {
    return blocks.map(block => {
      switch (block.type) {
        case 'heading':
          const tag = `h${block.data.level || 2}`
          return `<${tag}>${escapeHtml(block.data.text)}</${tag}>`
        case 'paragraph':
          return `<p>${escapeHtml(block.data.text)}</p>`
        case 'image':
          return `<figure><img src="${block.data.url}" alt="${escapeHtml(block.data.alt || '')}" />${block.data.caption ? `<figcaption>${escapeHtml(block.data.caption)}</figcaption>` : ''}</figure>`
        case 'quote':
          return `<blockquote><p>${escapeHtml(block.data.text)}</p>${block.data.author ? `<cite>${escapeHtml(block.data.author)}</cite>` : ''}</blockquote>`
        case 'bulletList':
          return `<ul>${(block.data.items || []).map((item: string) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        case 'divider':
          return '<hr />'
        case 'cta':
          return `<div class="cta-block"><a href="${block.data.link}" class="btn-primary">${escapeHtml(block.data.text)}</a></div>`
        case 'gallery':
          const images = block.data.images || []
          return `<div class="gallery-grid">${images.map((img: any) => `<img src="${img.url}" alt="${escapeHtml(img.caption || '')}" />`).join('')}</div>`
        default:
          return ''
      }
    }).join('\n')
  }

  function escapeHtml(text: string): string {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  function normalizeSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  function generateSlug() {
    if (draft.value.title) {
      draft.value.slug = normalizeSlug(draft.value.title)
    }
  }

  // ============================================
  // AUTOSAVE
  // ============================================
  let autosaveTimer: ReturnType<typeof setInterval> | null = null

  function startAutosave() {
    if (autosaveTimer) clearInterval(autosaveTimer)
    
    autosaveTimer = setInterval(async () => {
      if (dirty.value && !saving.value && editorMode.value !== 'closed') {
        await saveDraft()
      }
    }, 30000) // 30 seconds
  }

  function stopAutosave() {
    if (autosaveTimer) {
      clearInterval(autosaveTimer)
      autosaveTimer = null
    }
  }

  // Watch editor mode changes
  watch(editorMode, (mode) => {
    if (mode !== 'closed') {
      startAutosave()
    } else {
      stopAutosave()
    }
  })

  return {
    // List state
    filters,
    pagination,
    posts,
    stats,
    listLoading,
    listError,
    hasMore,
    
    // Editor state
    selectedPostId,
    editorMode,
    draft,
    dirty,
    saving,
    lastSavedAt,
    editorLoading,
    uploading,
    uploadProgress,
    validationErrors,
    canPublish,
    
    // List actions
    fetchPosts,
    fetchStats,
    resetFilters,
    changePage,
    
    // Editor actions
    openCreateEditor,
    openEditEditor,
    closeEditor,
    saveDraft,
    publish,
    togglePublishStatus,
    duplicatePost,
    deletePost,
    validateDraft,
    generateSlug,
    
    // Block actions
    addBlock,
    removeBlock,
    moveBlock,
    duplicateBlock,
    updateBlockData,
    
    // Gallery actions
    addGalleryImage,
    removeGalleryImage,
    reorderGallery,
    updateGalleryCaption,
    
    // Helpers
    normalizeSlug,
    blocksToHtml
  }
})
