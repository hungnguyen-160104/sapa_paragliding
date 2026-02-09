<template>
  <Teleport to="body">
    <Transition name="modal">
      <div 
        v-if="open" 
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="$emit('cancel')"
      >
        <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
          <!-- Header -->
          <div class="flex items-start gap-4">
            <div 
              class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              :class="iconBgClass"
            >
              <svg v-if="variant === 'danger'" class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg v-else-if="variant === 'warning'" class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg v-else class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-slate-900">{{ title }}</h3>
              <p v-if="description" class="mt-1 text-sm text-slate-500">{{ description }}</p>
            </div>
          </div>
          
          <!-- Content -->
          <div v-if="$slots.default" class="mt-4">
            <slot />
          </div>
          
          <!-- Actions -->
          <div class="mt-6 flex justify-end gap-3">
            <button 
              type="button"
              class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
              @click="$emit('cancel')"
            >
              {{ cancelText }}
            </button>
            <button 
              type="button"
              class="px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2"
              :class="confirmButtonClass"
              @click="$emit('confirm')"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  open: boolean
  title: string
  description?: string
  variant?: 'danger' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
}>(), {
  variant: 'danger',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy'
})

defineEmits<{
  cancel: []
  confirm: []
}>()

const iconBgClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'bg-red-100'
    case 'warning': return 'bg-yellow-100'
    case 'info': return 'bg-blue-100'
    default: return 'bg-red-100'
  }
})

const confirmButtonClass = computed(() => {
  switch (props.variant) {
    case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    case 'warning': return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    case 'info': return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    default: return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
