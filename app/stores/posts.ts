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
    async fetchPosts() {
      this.isLoading = true
      this.error = null
      try {
        const response = await $fetch<{ data: Post[] }>('/api/posts')
        this.posts = response.data || []
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Failed to fetch posts'
        console.error('Error fetching posts:', err)
        this.posts = []
      } finally {
        this.isLoading = false
      }
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
