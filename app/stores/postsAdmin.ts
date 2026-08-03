/**
 * Posts Admin Store
 * Đồng bộ schema song ngữ:
 * - title = English
 * - titleVi = Vietnamese
 * - excerpt = English
 * - excerptVi = Vietnamese
 * - contentBlocks = English
 * - contentBlocksVi = Vietnamese
 */
import { defineStore } from 'pinia'
import { ref, reactive, computed, watch } from 'vue'

// Types
export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED'
export type PostCategory =
  | 'news'
  | 'guide'
  | 'experience'
  | 'promotion'
  | 'adventure'
  | 'safety'
  | 'tips'

export interface PostSummary {
  id: string
  title: string
  titleVi?: string
  slug: string
  excerpt?: string
  excerptVi?: string
  categoryId: string
  status: PostStatus
  updatedAt?: string
  thumbnailUrl?: string
  views?: number
}

export interface ContentBlock {
  id: string
  type: 'heading' | 'paragraph' | 'image' | 'gallery' | 'quote' | 'bulletList' | 'divider' | 'cta' | 'video' | 'linkCard' | 'table'
  data: Record<string, any>
}

export interface GalleryImage {
  url: string
  publicId?: string
  caption?: string
}

export interface PostDraft {
  id?: string
  title: string
  titleVi: string
  slug: string
  excerpt: string
  excerptVi: string
  categoryId: string
  tags: string[]
  status: PostStatus
  scheduledAt?: string | null
  thumbnailUrl: string
  thumbnailPublicId?: string
  contentBlocks: ContentBlock[]
  contentBlocksVi: ContentBlock[]
  galleryUrls: GalleryImage[]
  seo: {
    title: string
    titleVi: string
    description: string
    descriptionVi: string
    ogImage: string
  }
  contentHtml?: string
  contentHtmlVi?: string
}

export interface PostStats {
  total: number
  published: number
  draft: number
  scheduled: number
  categories: number
}

type SavePayload = {
  title: string
  titleVi: string
  slug: string
  excerpt: string
  excerptVi: string
  categoryId: string
  status: PostStatus
  thumbnailUrl: string
  galleryUrls: GalleryImage[]
  contentHtml: string
  contentHtmlVi: string
  contentBlocks: ContentBlock[]
  contentBlocksVi: ContentBlock[]
  tags: string[]
  seo: {
    title: string
    titleVi: string
    description: string
    descriptionVi: string
    ogImage: string
  }
  scheduledAt: string | null
}

function createId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

function normalizeSlug(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function escapeHtml(text: string): string {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function getDefaultBlockData(type: ContentBlock['type'], locale: 'en' | 'vi' = 'en'): Record<string, any> {
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
    case 'video':
      return { url: '', caption: '' }
    case 'linkCard':
      return { url: '', title: '', description: '' }
    case 'table':
      // headers: hàng tiêu đề; rows: mảng các hàng, mỗi hàng là mảng ô.
      // Số cột luôn bằng headers.length — bảo đảm bởi normalizeTableData().
      return { headers: ['', ''], rows: [['', ''], ['', '']], hasHeader: true }
    case 'cta':
      return {
        type: 'booking',
        text: locale === 'vi' ? 'Đặt ngay' : 'Book now',
        link: '/booking'
      }
    default:
      return {}
  }
}

export interface TableData {
  headers: string[]
  rows: string[][]
  hasHeader: boolean
}

/**
 * Ép dữ liệu bảng về đúng hình dạng: mọi hàng có số ô bằng số cột.
 * Dữ liệu cũ hoặc bị sửa tay ngoài trình soạn thảo có thể lệch cột, nếu
 * không chuẩn hoá thì lúc render sẽ vỡ bảng.
 */
export function normalizeTableData(data: unknown): TableData {
  const raw = (data ?? {}) as Record<string, unknown>

  const rawHeaders = Array.isArray(raw.headers) ? raw.headers : []
  const headers = rawHeaders.length > 0
    ? rawHeaders.map((cell) => String(cell ?? ''))
    : ['', '']

  const columnCount = headers.length
  const rawRows = Array.isArray(raw.rows) ? raw.rows : []
  const rows = rawRows.map((row) => {
    const cells = Array.isArray(row) ? row : []
    return Array.from({ length: columnCount }, (_, index) => String(cells[index] ?? ''))
  })

  return {
    headers,
    rows: rows.length > 0 ? rows : [Array.from({ length: columnCount }, () => '')],
    hasHeader: raw.hasHeader !== false
  }
}

function createBlock(type: ContentBlock['type'], locale: 'en' | 'vi' = 'en', id = createId()): ContentBlock {
  return {
    id,
    type,
    data: getDefaultBlockData(type, locale)
  }
}

function normalizeBlocks(value: unknown): ContentBlock[] {
  if (!Array.isArray(value)) return []

  const output: ContentBlock[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') continue

    const raw = item as Record<string, any>
    output.push({
      id: String(raw.id || createId()),
      type: raw.type || 'paragraph',
      data: raw.data && typeof raw.data === 'object' ? raw.data : {}
    })
  }

  return output
}

function normalizeGallery(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return []

  const output: GalleryImage[] = []

  for (const item of value) {
    if (typeof item === 'string') {
      const url = item.trim()
      if (url) {
        output.push({ url, caption: '' })
      }
      continue
    }

    if (item && typeof item === 'object') {
      const raw = item as Record<string, unknown>
      const url = typeof raw.url === 'string' ? raw.url.trim() : ''
      if (!url) continue

      output.push({
        url,
        publicId: typeof raw.publicId === 'string' ? raw.publicId : undefined,
        caption: typeof raw.caption === 'string' ? raw.caption : ''
      })
    }
  }

  return output
}

function buildVietnameseBlockFromEnglish(block: ContentBlock): ContentBlock {
  const vi = cloneDeep(block)

  switch (vi.type) {
    case 'heading':
    case 'paragraph':
      vi.data.text = vi.data?.text || ''
      break
    case 'image':
      vi.data.url = vi.data?.url || ''
      vi.data.caption = vi.data?.caption || ''
      vi.data.alt = vi.data?.alt || ''
      break
    case 'quote':
      vi.data.text = vi.data?.text || ''
      vi.data.author = vi.data?.author || ''
      break
    case 'bulletList':
      vi.data.items = Array.isArray(vi.data?.items) ? vi.data.items : ['']
      break
    case 'cta':
      vi.data.type = vi.data?.type || 'booking'
      vi.data.link = vi.data?.link || '/booking'
      vi.data.text = vi.data?.text || 'Đặt ngay'
      break
    case 'gallery':
      vi.data.images = Array.isArray(vi.data?.images) ? vi.data.images : []
      vi.data.layout = vi.data?.layout || 'grid'
      break
    case 'video':
      vi.data.url = vi.data?.url || ''
      vi.data.caption = vi.data?.caption || ''
      break
    case 'linkCard':
      vi.data.url = vi.data?.url || ''
      vi.data.title = vi.data?.title || ''
      vi.data.description = vi.data?.description || ''
      break
    case 'table':
      vi.data = normalizeTableData(vi.data)
      break
    default:
      break
  }

  return vi
}

function ensureBilingualBlocks(
  enBlocks: ContentBlock[],
  viBlocks: ContentBlock[]
): { en: ContentBlock[]; vi: ContentBlock[] } {
  const normalizedEn = normalizeBlocks(enBlocks)
  const normalizedVi = normalizeBlocks(viBlocks)

  if (!normalizedEn.length) {
    const id = createId()
    return {
      en: [createBlock('paragraph', 'en', id)],
      vi: [createBlock('paragraph', 'vi', id)]
    }
  }

  const viMap = new Map<string, ContentBlock>()
  for (const block of normalizedVi) {
    viMap.set(block.id, block)
  }

  const nextVi: ContentBlock[] = normalizedEn.map((enBlock) => {
    const existingVi = viMap.get(enBlock.id)

    if (!existingVi || existingVi.type !== enBlock.type) {
      return buildVietnameseBlockFromEnglish(enBlock)
    }

    const mergedVi = cloneDeep(existingVi)
    mergedVi.id = enBlock.id
    mergedVi.type = enBlock.type
    mergedVi.data = mergedVi.data || {}

    switch (enBlock.type) {
      case 'heading':
        mergedVi.data.level = enBlock.data?.level || 2
        break
      case 'image':
        mergedVi.data.url = enBlock.data?.url || ''
        break
      case 'quote':
        mergedVi.data.author = enBlock.data?.author || ''
        break
      case 'bulletList': {
        const enItems = Array.isArray(enBlock.data?.items) ? enBlock.data.items : []
        const viItems = Array.isArray(mergedVi.data?.items) ? mergedVi.data.items : []
        mergedVi.data.items = enItems.map((_: string, index: number) => viItems[index] || '')
        break
      }
      case 'cta':
        mergedVi.data.type = enBlock.data?.type || 'booking'
        mergedVi.data.link = enBlock.data?.link || '/booking'
        break
      case 'gallery':
        mergedVi.data.images = Array.isArray(enBlock.data?.images) ? enBlock.data.images : []
        mergedVi.data.layout = enBlock.data?.layout || 'grid'
        break
      case 'table': {
        // Khung bảng (số hàng, số cột, có hàng tiêu đề hay không) lấy theo bản
        // tiếng Anh; chữ trong ô giữ nguyên của bản tiếng Việt nếu đã nhập.
        const enTable = normalizeTableData(enBlock.data)
        const viTable = normalizeTableData(mergedVi.data)

        mergedVi.data = {
          hasHeader: enTable.hasHeader,
          headers: enTable.headers.map((_, index) => viTable.headers[index] ?? ''),
          rows: enTable.rows.map((row, rowIndex) =>
            row.map((_, colIndex) => viTable.rows[rowIndex]?.[colIndex] ?? '')
          )
        }
        break
      }
      default:
        break
    }

    return mergedVi
  })

  return {
    en: normalizedEn,
    vi: nextVi
  }
}

function createEmptyDraft(): PostDraft {
  const id = createId()

  return {
    title: '',
    titleVi: '',
    slug: '',
    excerpt: '',
    excerptVi: '',
    categoryId: '',
    tags: [],
    status: 'DRAFT',
    scheduledAt: null,
    thumbnailUrl: '',
    thumbnailPublicId: '',
    contentBlocks: [{ id, type: 'paragraph', data: { text: '' } }],
    contentBlocksVi: [{ id, type: 'paragraph', data: { text: '' } }],
    galleryUrls: [],
    seo: {
      title: '',
      titleVi: '',
      description: '',
      descriptionVi: '',
      ogImage: ''
    },
    contentHtml: '',
    contentHtmlVi: ''
  }
}

function normalizeDraftFromApi(post: any): PostDraft {
  const englishBlocks = normalizeBlocks(post?.contentBlocks)
  const vietnameseBlocks = normalizeBlocks(post?.contentBlocksVi)
  const normalizedBlocks = ensureBilingualBlocks(englishBlocks, vietnameseBlocks)

  return {
    id: post?.id || '',
    title: post?.title || '',
    titleVi: post?.titleVi || post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    excerptVi: post?.excerptVi || post?.excerpt || '',
    categoryId: post?.categoryId || '',
    tags: Array.isArray(post?.tags) ? post.tags : [],
    status: (post?.status || 'DRAFT') as PostStatus,
    scheduledAt: post?.scheduledAt || null,
    thumbnailUrl: post?.thumbnailUrl || '',
    thumbnailPublicId: post?.thumbnailPublicId || '',
    contentBlocks: normalizedBlocks.en,
    contentBlocksVi: normalizedBlocks.vi,
    galleryUrls: normalizeGallery(post?.galleryUrls),
    seo: {
      title: post?.seo?.title || '',
      titleVi: post?.seo?.titleVi || '',
      description: post?.seo?.description || '',
      descriptionVi: post?.seo?.descriptionVi || '',
      ogImage: post?.seo?.ogImage || post?.thumbnailUrl || ''
    },
    contentHtml: post?.contentHtml || '',
    contentHtmlVi: post?.contentHtmlVi || ''
  }
}

function blocksToHtml(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      switch (block.type) {
        case 'heading': {
          const tag = `h${block.data?.level || 2}`
          return `<${tag}>${escapeHtml(block.data?.text || '')}</${tag}>`
        }
        case 'paragraph':
          return `<p>${escapeHtml(block.data?.text || '')}</p>`
        case 'image':
          return `<figure><img src="${block.data?.url || ''}" alt="${escapeHtml(block.data?.alt || '')}" />${
            block.data?.caption ? `<figcaption>${escapeHtml(block.data.caption)}</figcaption>` : ''
          }</figure>`
        case 'quote':
          return `<blockquote><p>${escapeHtml(block.data?.text || '')}</p>${
            block.data?.author ? `<cite>${escapeHtml(block.data.author)}</cite>` : ''
          }</blockquote>`
        case 'bulletList':
          return `<ul>${(block.data?.items || [])
            .map((item: string) => `<li>${escapeHtml(item)}</li>`)
            .join('')}</ul>`
        case 'divider':
          return '<hr />'
        case 'cta':
          return `<div class="cta-block"><a href="${block.data?.link || '#'}" class="btn-primary">${escapeHtml(
            block.data?.text || ''
          )}</a></div>`
        case 'gallery': {
          const images = Array.isArray(block.data?.images) ? block.data.images : []
          return `<div class="gallery-grid">${images
            .map((img: any) => `<img src="${img?.url || ''}" alt="${escapeHtml(img?.caption || '')}" />`)
            .join('')}</div>`
        }
        case 'video':
          return block.data?.url
            ? `<div class="video-embed"><iframe src="${block.data.url}" frameborder="0" allowfullscreen></iframe></div>`
            : ''
        case 'linkCard':
          return block.data?.url
            ? `<div class="link-card"><a href="${block.data.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(block.data.title || block.data.url)}</a></div>`
            : ''
        default:
          return ''
      }
    })
    .join('\n')
}

function extractRequestErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    data?: { error?: string; message?: string }
    statusMessage?: string
    message?: string
  }

  if (err?.data?.error) return err.data.error
  if (err?.data?.message) return err.data.message
  if (err?.statusMessage) return err.statusMessage
  if (err?.message) return err.message

  return fallback
}

export const usePostsAdminStore = defineStore('postsAdmin', () => {
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
  const editorError = ref<string | null>(null)

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

  const hasMore = computed(() => pagination.page * pagination.pageSize < pagination.total)

  const canPublish = computed(() => {
    const d = draft.value
    return (
      d.title.trim().length >= 3 &&
      d.titleVi.trim().length >= 3 &&
      d.excerpt.trim().length > 0 &&
      d.excerptVi.trim().length > 0 &&
      d.categoryId !== '' &&
      d.thumbnailUrl !== ''
    )
  })

  function syncDraftShape() {
    const normalized = normalizeDraftFromApi(draft.value)
    Object.assign(draft.value, normalized)
  }

  function buildPayload(statusOverride?: PostStatus): SavePayload {
    syncDraftShape()

    const status = statusOverride || draft.value.status
    const contentHtml = blocksToHtml(draft.value.contentBlocks)
    const contentHtmlVi = blocksToHtml(draft.value.contentBlocksVi)

    return {
      title: draft.value.title,
      titleVi: draft.value.titleVi,
      slug: draft.value.slug,
      excerpt: draft.value.excerpt,
      excerptVi: draft.value.excerptVi,
      categoryId: draft.value.categoryId,
      status,
      thumbnailUrl: draft.value.thumbnailUrl,
      galleryUrls: draft.value.galleryUrls
        .filter((item) => Boolean(item?.url))
        .map((item) => ({
          url: item.url,
          publicId: item.publicId,
          caption: item.caption || ''
        })),
      contentHtml,
      contentHtmlVi,
      contentBlocks: draft.value.contentBlocks,
      contentBlocksVi: draft.value.contentBlocksVi,
      tags: draft.value.tags,
      seo: {
        title: draft.value.seo.title,
        titleVi: draft.value.seo.titleVi,
        description: draft.value.seo.description,
        descriptionVi: draft.value.seo.descriptionVi,
        ogImage: draft.value.seo.ogImage || draft.value.thumbnailUrl
      },
      scheduledAt: draft.value.scheduledAt || null
    }
  }

  async function createPostRequest(payload: SavePayload) {
    return await $fetch<any>('/api/admin/posts', {
      method: 'POST',
      body: payload
    } as any)
  }

  async function updatePostRequest(postId: string, payload: SavePayload) {
    const url = `/api/admin/posts/${postId}`
    return await $fetch<any>(url as any, {
      method: 'PUT',
      body: payload
    } as any)
  }

  async function updateStatusRequest(postId: string, status: PostStatus) {
    const url = `/api/admin/posts/${postId}/status`
    return await $fetch<{ success: boolean }>(url as any, {
      method: 'PATCH',
      body: { status }
    } as any)
  }

  async function duplicatePostRequest(postId: string) {
    const url = `/api/admin/posts/${postId}/duplicate`
    return await $fetch<{ success: boolean }>(url as any, {
      method: 'POST'
    } as any)
  }

  async function deletePostRequest(postId: string) {
    const url = `/api/admin/posts/${postId}`
    return await $fetch<{ success: boolean }>(url as any, {
      method: 'DELETE'
    } as any)
  }

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

  function openCreateEditor() {
    selectedPostId.value = null
    editorMode.value = 'create'
    draft.value = createEmptyDraft()
    originalDraft.value = JSON.stringify(draft.value)
    validationErrors.value = {}
    editorError.value = null
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
        selectedPostId.value = postId
        editorMode.value = 'edit'
        draft.value = normalizeDraftFromApi(response.data)
        originalDraft.value = JSON.stringify(draft.value)
        validationErrors.value = {}
        editorError.value = null
        lastSavedAt.value = response.data.updatedAt ? new Date(response.data.updatedAt) : null
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
    if (!force && dirty.value) return false

    selectedPostId.value = null
    editorMode.value = 'closed'
    draft.value = createEmptyDraft()
    originalDraft.value = ''
    validationErrors.value = {}
    editorError.value = null
    lastSavedAt.value = null

    return true
  }

  function validateDraft(mode: 'draft' | 'publish' = 'draft'): boolean {
    syncDraftShape()

    const errors: Record<string, string> = {}

    const hasAnyTitle = draft.value.title.trim() || draft.value.titleVi.trim()
    if (!hasAnyTitle) {
      errors.title = 'Cần ít nhất một tiêu đề'
    }

    if (!draft.value.slug.trim()) {
      generateSlug()
    }

    if (!draft.value.slug.trim()) {
      errors.slug = 'Slug không được để trống'
    }

    if (!draft.value.categoryId) {
      errors.categoryId = 'Chọn danh mục'
    }

    if (mode === 'publish') {
      if (!draft.value.title.trim()) {
        errors.title = 'Cần tiêu đề tiếng Anh để xuất bản'
      } else if (draft.value.title.trim().length < 3) {
        errors.title = 'Tiêu đề tiếng Anh phải có ít nhất 3 ký tự'
      }

      if (!draft.value.titleVi.trim()) {
        errors.titleVi = 'Cần tiêu đề tiếng Việt để xuất bản'
      } else if (draft.value.titleVi.trim().length < 3) {
        errors.titleVi = 'Tiêu đề tiếng Việt phải có ít nhất 3 ký tự'
      }

      if (!draft.value.excerpt.trim()) {
        errors.excerpt = 'Cần mô tả ngắn tiếng Anh để xuất bản'
      }

      if (!draft.value.excerptVi.trim()) {
        errors.excerptVi = 'Cần mô tả ngắn tiếng Việt để xuất bản'
      }

      if (!draft.value.thumbnailUrl) {
        errors.thumbnailUrl = 'Cần ảnh bìa để xuất bản'
      }

      if (draft.value.status === 'SCHEDULED' && !draft.value.scheduledAt) {
        errors.scheduledAt = 'Cần thời gian hẹn giờ'
      }
    }

    validationErrors.value = errors
    if (Object.keys(errors).length > 0) {
      editorError.value =
        mode === 'publish'
          ? 'Không thể cập nhật/xuất bản. Vui lòng kiểm tra các trường bắt buộc.'
          : 'Không thể lưu bài viết. Vui lòng kiểm tra các trường bắt buộc.'
    } else {
      editorError.value = null
    }

    return Object.keys(errors).length === 0
  }

  async function persistPost(targetStatus: PostStatus, mode: 'draft' | 'publish'): Promise<boolean> {
    draft.value.status = targetStatus

    if (!validateDraft(mode)) return false

    saving.value = true
    editorError.value = null

    try {
      const payload = buildPayload(targetStatus)
      let response: any

      if (editorMode.value === 'edit' && selectedPostId.value) {
        response = await updatePostRequest(selectedPostId.value, payload)
      } else {
        response = await createPostRequest(payload)

        if (response.success && response.post) {
          selectedPostId.value = response.post.id
          draft.value.id = response.post.id
          editorMode.value = 'edit'
        }
      }

      if (response.success) {
        draft.value.contentHtml = payload.contentHtml
        draft.value.contentHtmlVi = payload.contentHtmlVi
        lastSavedAt.value = new Date()
        originalDraft.value = JSON.stringify(draft.value)
        await Promise.all([fetchPosts(), fetchStats()])
        return true
      }

      editorError.value = response?.error || 'Không thể lưu bài viết. Vui lòng thử lại.'
      return false
    } catch (error) {
      console.error('Error saving post:', error)
      editorError.value = extractRequestErrorMessage(error, 'Lỗi kết nối khi lưu bài viết')
      return false
    } finally {
      saving.value = false
    }
  }

  async function saveDraft(): Promise<boolean> {
    const currentStatus: PostStatus =
      draft.value.status === 'PUBLISHED' || draft.value.status === 'SCHEDULED'
        ? draft.value.status
        : 'DRAFT'

    const validationMode: 'draft' | 'publish' = currentStatus === 'DRAFT' ? 'draft' : 'publish'

    return await persistPost(currentStatus, validationMode)
  }

  async function publish(): Promise<boolean> {
    const targetStatus: PostStatus = draft.value.status === 'SCHEDULED' ? 'SCHEDULED' : 'PUBLISHED'
    return await persistPost(targetStatus, 'publish')
  }

  async function togglePublishStatus(postId: string): Promise<boolean> {
    const post = posts.value.find((p) => p.id === postId)
    if (!post) return false

    const newStatus: PostStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED'
    const originalStatus = post.status
    post.status = newStatus

    try {
      const response = await updateStatusRequest(postId, newStatus)

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
      const response = await duplicatePostRequest(postId)

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
      const response = await deletePostRequest(postId)

      if (response.success) {
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

  function addBlock(type: ContentBlock['type'], afterIndex?: number) {
    const id = createId()
    const enBlock = createBlock(type, 'en', id)
    const viBlock = createBlock(type, 'vi', id)

    if (afterIndex !== undefined && afterIndex >= 0) {
      draft.value.contentBlocks.splice(afterIndex + 1, 0, enBlock)
      draft.value.contentBlocksVi.splice(afterIndex + 1, 0, viBlock)
    } else {
      draft.value.contentBlocks.push(enBlock)
      draft.value.contentBlocksVi.push(viBlock)
    }
  }

  function removeBlock(blockId: string) {
    const indexEn = draft.value.contentBlocks.findIndex((b) => b.id === blockId)
    if (indexEn > -1) {
      draft.value.contentBlocks.splice(indexEn, 1)
    }

    const indexVi = draft.value.contentBlocksVi.findIndex((b) => b.id === blockId)
    if (indexVi > -1) {
      draft.value.contentBlocksVi.splice(indexVi, 1)
    }

    if (draft.value.contentBlocks.length === 0) {
      const id = createId()
      draft.value.contentBlocks = [{ id, type: 'paragraph', data: { text: '' } }]
      draft.value.contentBlocksVi = [{ id, type: 'paragraph', data: { text: '' } }]
    }
  }

  function moveBlock(blockId: string, direction: 'up' | 'down') {
    const index = draft.value.contentBlocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= draft.value.contentBlocks.length) return

    const enBlocks = [...draft.value.contentBlocks]
    const viBlocks = [...draft.value.contentBlocksVi]

    const removedEn = enBlocks.splice(index, 1)[0]
    const removedVi = viBlocks.splice(index, 1)[0]

    if (removedEn && removedVi) {
      enBlocks.splice(newIndex, 0, removedEn)
      viBlocks.splice(newIndex, 0, removedVi)
      draft.value.contentBlocks = enBlocks
      draft.value.contentBlocksVi = viBlocks
    }
  }

  function duplicateBlock(blockId: string) {
    const index = draft.value.contentBlocks.findIndex((b) => b.id === blockId)
    if (index === -1) return

    const originalEn = draft.value.contentBlocks[index]
    const originalVi = draft.value.contentBlocksVi[index]
    if (!originalEn || !originalVi) return

    const newId = createId()

    draft.value.contentBlocks.splice(index + 1, 0, {
      id: newId,
      type: originalEn.type,
      data: cloneDeep(originalEn.data)
    })

    draft.value.contentBlocksVi.splice(index + 1, 0, {
      id: newId,
      type: originalVi.type,
      data: cloneDeep(originalVi.data)
    })
  }

  function updateBlockData(blockId: string, data: Record<string, any>, locale: 'en' | 'vi' = 'en') {
    const target = locale === 'vi' ? draft.value.contentBlocksVi : draft.value.contentBlocks
    const block = target.find((b) => b.id === blockId)
    if (block) {
      block.data = { ...block.data, ...data }
    }
  }

  function addGalleryImage(image: GalleryImage) {
    if (!image?.url) return
    draft.value.galleryUrls.push({
      url: image.url,
      publicId: image.publicId,
      caption: image.caption || ''
    })
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

  function generateSlug() {
    const base = draft.value.title || draft.value.titleVi
    if (base) {
      draft.value.slug = normalizeSlug(base)
    }
  }

  let autosaveTimer: ReturnType<typeof setInterval> | null = null

  function startAutosave() {
    if (autosaveTimer) clearInterval(autosaveTimer)

    autosaveTimer = setInterval(async () => {
      if (dirty.value && !saving.value && editorMode.value !== 'closed') {
        await saveDraft()
      }
    }, 30000)
  }

  function stopAutosave() {
    if (autosaveTimer) {
      clearInterval(autosaveTimer)
      autosaveTimer = null
    }
  }

  watch(editorMode, (mode) => {
    if (mode !== 'closed') {
      startAutosave()
    } else {
      stopAutosave()
    }
  })

  return {
    filters,
    pagination,
    posts,
    stats,
    listLoading,
    listError,
    hasMore,

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
    editorError,
    canPublish,

    fetchPosts,
    fetchStats,
    resetFilters,
    changePage,

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

    addBlock,
    removeBlock,
    moveBlock,
    duplicateBlock,
    updateBlockData,

    addGalleryImage,
    removeGalleryImage,
    reorderGallery,
    updateGalleryCaption,

    normalizeSlug,
    blocksToHtml
  }
})