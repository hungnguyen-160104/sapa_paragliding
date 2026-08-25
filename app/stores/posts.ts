import { defineStore } from 'pinia'

export interface GalleryImage {
  url: string
  publicId?: string
  caption?: string
}

export interface ContentBlock {
  id: string
  type: 'heading' | 'paragraph' | 'image' | 'quote' | 'bulletList' | 'divider' | 'cta'
  data: any
}

export interface Post {
  id: string
  title: string
  titleVi: string
  excerpt: string
  excerptVi: string
  content?: string
  contentVi?: string
  contentBlocks?: ContentBlock[]
  image: string
  author: string
  date: string
  category: string
  published: boolean
  slug?: string
  gallery?: GalleryImage[]
}

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [] as Post[],
    isLoading: false,
    error: null as string | null,
    currentUser: {
      username: '',
      role: ''
    } as { username: string; role: string }
  }),

  getters: {
    publishedPosts: (state) => {
      return state.posts.filter(p => p.published)
    },
    latestPosts: (state) => {
      return state.posts
        .filter(p => p.published)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
    },
    getPostById: (state) => (id: string) => {
      return state.posts.find(p => p.id === id)
    },
    isAdmin: (state) => {
      return state.currentUser.role === 'admin'
    }
  },

  actions: {
    /**
     * Thử lại một lần trước khi bỏ cuộc.
     *
     * Một lần /api/posts trả 500 lúc instance vừa khởi động là đủ để HTML của
     * /posts và trang chủ mất sạch link bài — đo được 4/6 request đồng thời
     * rơi vào cảnh đó. Kết nối lúc ấy đã sẵn sàng nên lần thử thứ hai gần như
     * luôn thành công.
     *
     * Hai lần thử là con số CŨ chứ không phải mới: ofetch vốn tự thử lại một
     * lần khi gặp 500. Vòng lặp này chỉ chuyển quyền quyết định về đây để
     * khống chế được thời gian — xem retry: 0 bên dưới.
     */
    async fetchPosts() {
      this.isLoading = true
      this.error = null

      const ATTEMPTS = 2

      for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
        try {
          // retry: 0 — ofetch mặc định TỰ thử lại một lần khi gặp 500. Để
          // nguyên thì cộng với vòng lặp này thành 4 lần kết nối database, đo
          // được 20,4 giây cho một request hỏng: quá lâu, Vercel cắt hàm trước
          // khi 503 kịp trả về. Tắt đi rồi tự đếm thì còn 8,4 giây.
          const response = await $fetch<{ data: Post[] }>('/api/posts', { retry: 0 })
          this.posts = response.data || []
          this.error = null
          this.isLoading = false
          return
        } catch (err) {
          this.error = err instanceof Error ? err.message : 'Failed to fetch posts'

          if (attempt < ATTEMPTS) {
            await new Promise((resolve) => setTimeout(resolve, 400))
            continue
          }

          console.error('Error fetching posts:', err)
          this.posts = []
        }
      }

      this.isLoading = false
    },


    login(username: string, password: string) {
      // Simple authentication (in production, use proper backend authentication)
      if (username === 'admin' && password === 'admin123') {
        this.currentUser = { username: 'admin', role: 'admin' }
        return true
      }
      return false
    },

    logout() {
      this.currentUser = {
        username: '',
        role: ''
      }
    }
  }
})
