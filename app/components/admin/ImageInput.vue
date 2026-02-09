<template>
  <div class="space-y-2">
    <div class="flex items-center space-x-2">
      <input 
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        type="url"
        :placeholder="placeholder"
        class="input-field flex-1"
        :class="{ 'border-red-500': error }"
      >
      <button 
        v-if="modelValue"
        type="button"
        @click="$emit('update:modelValue', '')"
        class="p-2 text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    
    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
    
    <!-- Preview -->
    <div v-if="modelValue && isValidUrl" class="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
      <img 
        :src="modelValue" 
        :alt="alt"
        class="max-h-48 mx-auto object-contain"
        @error="handleImageError"
        @load="handleImageLoad"
      >
      <div v-if="imageLoading" class="absolute inset-0 flex items-center justify-center bg-gray-100">
        <svg class="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    </div>
    
    <p v-if="modelValue && !isValidUrl" class="text-sm text-yellow-600">
      URL không hợp lệ. Vui lòng nhập URL ảnh Cloudinary hợp lệ.
    </p>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  alt?: string
  error?: string
}>(), {
  placeholder: 'https://res.cloudinary.com/...',
  alt: 'Preview'
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const imageLoading = ref(false)
const imageError = ref(false)

const isValidUrl = computed(() => {
  if (!props.modelValue) return false
  try {
    const url = new URL(props.modelValue)
    return url.protocol === 'https:' && /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url.pathname)
  } catch {
    return false
  }
})

const handleImageLoad = () => {
  imageLoading.value = false
  imageError.value = false
}

const handleImageError = () => {
  imageLoading.value = false
  imageError.value = true
}

watch(() => props.modelValue, () => {
  if (isValidUrl.value) {
    imageLoading.value = true
  }
})
</script>
