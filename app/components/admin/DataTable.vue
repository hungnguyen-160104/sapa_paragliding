<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              :class="column.class"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="(row, index) in data" 
            :key="row.id || index"
            class="hover:bg-gray-50 transition-colors"
          >
            <td 
              v-for="column in columns" 
              :key="column.key"
              class="px-6 py-4 whitespace-nowrap text-sm"
              :class="column.cellClass"
            >
              <slot :name="`cell-${column.key}`" :row="row" :value="getNestedValue(row, column.key)">
                {{ getNestedValue(row, column.key) }}
              </slot>
            </td>
          </tr>
          
          <!-- Empty State -->
          <tr v-if="!data || data.length === 0">
            <td :colspan="columns.length" class="px-6 py-12 text-center">
              <div class="flex flex-col items-center">
                <svg class="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p class="text-gray-500 font-medium">{{ emptyText }}</p>
                <p class="text-gray-400 text-sm mt-1">{{ emptySubtext }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div class="text-sm text-gray-500">
        Hiển thị {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, total) }} / {{ total }} kết quả
      </div>
      <div class="flex items-center space-x-2">
        <button 
          @click="$emit('page-change', currentPage - 1)"
          :disabled="currentPage <= 1"
          class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Trước
        </button>
        
        <template v-for="page in visiblePages" :key="page">
          <span v-if="page === '...'" class="px-2 text-gray-400">...</span>
          <button 
            v-else
            @click="$emit('page-change', page)"
            class="px-3 py-1 rounded border text-sm"
            :class="page === currentPage ? 'bg-red-600 text-white border-red-600' : 'hover:bg-gray-50'"
          >
            {{ page }}
          </button>
        </template>
        
        <button 
          @click="$emit('page-change', currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1 rounded border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Sau
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column {
  key: string
  label: string
  class?: string
  cellClass?: string
}

const props = withDefaults(defineProps<{
  columns: Column[]
  data: any[]
  loading?: boolean
  currentPage?: number
  pageSize?: number
  total?: number
  emptyText?: string
  emptySubtext?: string
}>(), {
  loading: false,
  currentPage: 1,
  pageSize: 10,
  total: 0,
  emptyText: 'Không có dữ liệu',
  emptySubtext: 'Thử thay đổi bộ lọc hoặc thêm mới'
})

defineEmits<{
  'page-change': [page: number]
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const current = props.currentPage
  const total = totalPages.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    
    if (current > 3) pages.push('...')
    
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    
    for (let i = start; i <= end; i++) pages.push(i)
    
    if (current < total - 2) pages.push('...')
    
    pages.push(total)
  }
  
  return pages
})

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc?.[part], obj)
}
</script>
