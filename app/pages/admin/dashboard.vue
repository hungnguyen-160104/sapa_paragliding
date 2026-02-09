<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header removed - Using Admin Layout -->

  <!-- Main Content -->
    <main class="container-custom py-8">
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-gray-900">{{ $t('admin.dashboard.managePosts') }}</h2>
        <button @click="showAddModal = true" class="btn-primary">
          <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('admin.dashboard.addPost') }}
        </button>
      </div>

      <!-- Posts Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-gray-500 text-sm font-medium">Bài viết đã xuất bản</div>
          <div class="text-3xl font-bold text-red-600">{{ publishedCount }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-gray-500 text-sm font-medium">Bài viết nháp</div>
          <div class="text-3xl font-bold text-gray-600">{{ draftCount }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-gray-500 text-sm font-medium">Danh mục</div>
          <div class="text-3xl font-bold text-blue-600">{{ uniqueCategories }}</div>
        </div>
      </div>

      <!-- Search and Filter -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input v-model="searchQuery" type="text" placeholder="Tìm kiếm bài viết..." class="input-field w-full" />
          </div>
          <div>
            <select v-model="filterCategory" class="input-field w-full">
              <option value="">Tất cả danh mục</option>
              <option value="Adventure">Adventure</option>
              <option value="Safety">Safety</option>
              <option value="Tips">Tips</option>
              <option value="Guide">Guide</option>
              <option value="News">News</option>
            </select>
          </div>
          <div>
            <select v-model="filterStatus" class="input-field w-full">
              <option value="">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Nháp</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Posts Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiêu đề
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tác giả
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ngày
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredPosts.length === 0" class="text-center">
              <td colspan="6" class="px-6 py-8 text-gray-500">
                Không có bài viết nào
              </td>
            </tr>
            <tr v-for="post in filteredPosts" :key="post.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ post.titleVi }}</div>
                <div class="text-xs text-gray-500">{{ post.title }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ post.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ post.author }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(post.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="post.published ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ post.published ? 'Đã xuất bản' : 'Nháp' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button @click="togglePublish(post.id)" :title="post.published ? 'Hủy xuất bản' : 'Xuất bản'"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button @click="editPost(post)" title="Chỉnh sửa"
                    class="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="deletePost(post.id)" title="Xóa"
                    class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingPost"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-bold">
            {{ editingPost ? $t('admin.dashboard.editPost') : $t('admin.dashboard.addPost') }}
          </h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="savePost" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.titleEn')
                }}</label>
              <input v-model="formData.title" type="text" required class="input-field" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.titleVi')
                }}</label>
              <input v-model="formData.titleVi" type="text" required class="input-field" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.excerptEn')
                }}</label>
              <textarea v-model="formData.excerpt" rows="3" required class="input-field"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.excerptVi')
                }}</label>
              <textarea v-model="formData.excerptVi" rows="3" required class="input-field"></textarea>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.contentEn')
                }}</label>
              <textarea v-model="formData.content" rows="8" required class="input-field"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.contentVi')
                }}</label>
              <textarea v-model="formData.contentVi" rows="8" required class="input-field"></textarea>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.image') }}</label>
              <input v-model="formData.image" type="url" required class="input-field" placeholder="https://..." />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.category')
                }}</label>
              <select v-model="formData.category" required class="input-field">
                <option value="Adventure">Adventure</option>
                <option value="Safety">Safety</option>
                <option value="Tips">Tips</option>
                <option value="Guide">Guide</option>
                <option value="News">News</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">{{ $t('admin.dashboard.form.author')
                }}</label>
              <input v-model="formData.author" type="text" required class="input-field" />
            </div>
          </div>

          <div class="flex items-center">
            <input v-model="formData.published" type="checkbox" id="published" class="mr-2" />
            <label for="published" class="text-sm font-medium text-gray-700">
              {{ $t('admin.dashboard.form.published') }}
            </label>
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button type="button" @click="closeModal" class="btn-secondary">
              {{ $t('buttons.cancel') }}
            </button>
            <button type="submit" class="btn-primary">
              {{ $t('buttons.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { usePostsStore } from '~/stores/posts'
import type { Post } from '~/stores/posts'

definePageMeta({
  layout: 'admin'
})

const { locale } = useI18n()
const router = useRouter()
const postsStore = usePostsStore()

const showAddModal = ref(false)
const editingPost = ref<Post | null>(null)
const searchQuery = ref('')
const filterCategory = ref('')
const filterStatus = ref('')
const loading = ref(false)
const posts = ref<Post[]>([])

const formData = ref({
  title: '',
  titleVi: '',
  excerpt: '',
  excerptVi: '',
  content: '',
  contentVi: '',
  image: '',
  author: '',
  category: 'Adventure',
  date: new Date().toISOString().split('T')[0],
  published: false
})

// Computed properties for stats
const publishedCount = computed(() =>
  posts.value.filter(p => p.published).length
)

const draftCount = computed(() =>
  posts.value.filter(p => !p.published).length
)

const uniqueCategories = computed(() =>
  new Set(posts.value.map(p => p.category)).size
)

// Filtered posts based on search and filters
const filteredPosts = computed(() => {
  return posts.value.filter(post => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      post.titleVi.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesCategory = !filterCategory.value || post.category === filterCategory.value

    const matchesStatus = !filterStatus.value ||
      (filterStatus.value === 'published' ? post.published : !post.published)

    return matchesSearch && matchesCategory && matchesStatus
  })
})

// Fetch posts from MongoDB
const fetchPosts = async () => {
  loading.value = true
  try {
    const response = await $fetch<any>('/api/admin/posts')
    if (response?.success) {
      posts.value = response.posts
    }
  } catch (error) {
    console.error('Error fetching posts:', error)
  } finally {
    loading.value = false
  }
}

const localizedNavigateTo = (path: string) => {
  const currentLocale = locale.value || 'vi'
  const fullPath = currentLocale === 'vi' ? path : `/${currentLocale}${path}`

  nextTick(() => {
    router.push(fullPath)
  })
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const handleLogout = () => {
  postsStore.logout()
  localizedNavigateTo('/admin/login')
}

const editPost = (post: Post) => {
  editingPost.value = post
  formData.value = { ...post }
}

const closeModal = () => {
  showAddModal.value = false
  editingPost.value = null
  formData.value = {
    title: '',
    titleVi: '',
    excerpt: '',
    excerptVi: '',
    content: '',
    contentVi: '',
    image: '',
    author: '',
    category: 'Adventure',
    date: new Date().toISOString().split('T')[0],
    published: false
  }
}

const savePost = async () => {
  const postDate = formData.value.date || new Date().toISOString().split('T')[0]
  const postData = {
    title: formData.value.title,
    titleVi: formData.value.titleVi,
    excerpt: formData.value.excerpt,
    excerptVi: formData.value.excerptVi,
    content: formData.value.content,
    contentVi: formData.value.contentVi,
    image: formData.value.image,
    author: formData.value.author,
    category: formData.value.category,
    date: postDate,
    published: formData.value.published
  }

  try {
    if (editingPost.value) {
      // Update existing post
      const response = await $fetch<any>(`/api/admin/posts/${editingPost.value.id}`, {
        method: 'PUT',
        body: postData
      })
      if (response?.success) {
        await fetchPosts()
      }
    } else {
      // Create new post
      const response = await $fetch<any>('/api/admin/posts', {
        method: 'POST',
        body: postData
      })
      if (response?.success) {
        await fetchPosts()
      }
    }
    closeModal()
  } catch (error) {
    console.error('Error saving post:', error)
  }
}

const togglePublish = async (id: string) => {
  const post = posts.value.find(p => p.id === id)
  if (post) {
    try {
      const response = await $fetch<any>(`/api/admin/posts/${id}`, {
        method: 'PUT',
        body: {
          ...post,
          published: !post.published
        }
      })
      if (response?.success) {
        await fetchPosts()
      }
    } catch (error) {
      console.error('Error toggling publish:', error)
    }
  }
}

const deletePost = async (id: string) => {
  const post = posts.value.find(p => p.id === id)
  if (post && confirm(`Are you sure you want to delete "${post.titleVi}"? This action cannot be undone.`)) {
    try {
      const response = await $fetch<any>(`/api/admin/posts/${id}`, {
        method: 'DELETE'
      })
      if (response?.success) {
        await fetchPosts()
      }
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }
}

// Protect route - redirect if not admin and fetch posts
onMounted(() => {
  if (!postsStore.isAdmin) {
    localizedNavigateTo('/admin/login')
  }
  // Fetch posts from MongoDB
  fetchPosts()
})
</script>
