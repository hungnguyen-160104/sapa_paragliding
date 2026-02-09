<template>
  <div class="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
    <div class="flex flex-wrap gap-4 items-end">
      <!-- Search -->
      <div v-if="showSearch" class="flex-1 min-w-[200px]">
        <label class="block text-xs font-medium text-gray-500 mb-1">Tìm kiếm</label>
        <div class="relative">
          <input 
            :value="filters.search"
            @input="handleSearchInput"
            type="text"
            :placeholder="searchPlaceholder"
            class="input-field pl-10"
          >
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <!-- Status Filter -->
      <div v-if="statusOptions.length > 0" class="w-40">
        <label class="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
        <select 
          :value="filters.status"
          @change="$emit('update:filters', { ...filters, status: ($event.target as HTMLSelectElement).value, page: 1 })"
          class="input-field"
        >
          <option value="">Tất cả</option>
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <!-- Category Filter -->
      <div v-if="categoryOptions.length > 0" class="w-40">
        <label class="block text-xs font-medium text-gray-500 mb-1">Danh mục</label>
        <select 
          :value="filters.categoryId"
          @change="$emit('update:filters', { ...filters, categoryId: ($event.target as HTMLSelectElement).value, page: 1 })"
          class="input-field"
        >
          <option value="">Tất cả</option>
          <option v-for="opt in categoryOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <!-- Location Filter -->
      <div v-if="locationOptions.length > 0" class="w-40">
        <label class="block text-xs font-medium text-gray-500 mb-1">Địa điểm</label>
        <select 
          :value="filters.location"
          @change="$emit('update:filters', { ...filters, location: ($event.target as HTMLSelectElement).value, page: 1 })"
          class="input-field"
        >
          <option value="">Tất cả</option>
          <option v-for="opt in locationOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <!-- Sort -->
      <div v-if="sortOptions.length > 0" class="w-40">
        <label class="block text-xs font-medium text-gray-500 mb-1">Sắp xếp</label>
        <select 
          :value="filters.sort"
          @change="$emit('update:filters', { ...filters, sort: ($event.target as HTMLSelectElement).value })"
          class="input-field"
        >
          <option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      
      <!-- Action Button -->
      <div v-if="showAddButton">
        <button 
          @click="$emit('add')"
          class="btn-primary flex items-center space-x-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ addButtonText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterOption {
  value: string
  label: string
}

const props = withDefaults(defineProps<{
  filters: Record<string, any>
  showSearch?: boolean
  searchPlaceholder?: string
  statusOptions?: FilterOption[]
  categoryOptions?: FilterOption[]
  locationOptions?: FilterOption[]
  sortOptions?: FilterOption[]
  showAddButton?: boolean
  addButtonText?: string
}>(), {
  showSearch: true,
  searchPlaceholder: 'Tìm kiếm...',
  statusOptions: () => [],
  categoryOptions: () => [],
  locationOptions: () => [],
  sortOptions: () => [],
  showAddButton: false,
  addButtonText: 'Thêm mới'
})

const emit = defineEmits<{
  'update:filters': [filters: Record<string, any>]
  'add': []
}>()

// Debounce search input
let searchTimeout: ReturnType<typeof setTimeout>
const handleSearchInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    emit('update:filters', { ...props.filters, search: value, page: 1 })
  }, 300)
}
</script>
