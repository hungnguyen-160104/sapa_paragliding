<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="show" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="handleCancel"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/50" @click="handleCancel"></div>
        
        <!-- Modal -->
        <div class="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6 transform transition-all">
          <!-- Icon -->
          <div 
            class="mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4"
            :class="iconBgClass"
          >
            <svg v-if="type === 'danger'" class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <svg v-else-if="type === 'warning'" class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg v-else class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <!-- Content -->
          <div class="text-center">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ title }}</h3>
            <p class="text-sm text-gray-500">{{ message }}</p>
          </div>
          
          <!-- Actions -->
          <div class="mt-6 flex space-x-3">
            <button 
              @click="handleCancel"
              class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              :disabled="loading"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="handleConfirm"
              class="flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              :class="confirmBtnClass"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang xử lý...
              </span>
              <span v-else>{{ confirmText }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  show: boolean
  title: string
  message: string
  type?: 'danger' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  loading?: boolean
}>(), {
  type: 'danger',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  loading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const iconBgClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'bg-red-100'
    case 'warning': return 'bg-yellow-100'
    default: return 'bg-blue-100'
  }
})

const confirmBtnClass = computed(() => {
  switch (props.type) {
    case 'danger': return 'bg-red-600 text-white hover:bg-red-700'
    case 'warning': return 'bg-yellow-600 text-white hover:bg-yellow-700'
    default: return 'bg-blue-600 text-white hover:bg-blue-700'
  }
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  if (!props.loading) {
    emit('cancel')
  }
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
