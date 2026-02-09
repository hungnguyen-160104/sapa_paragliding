<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8">
    <div class="w-full max-w-lg rounded-lg bg-white shadow-xl">
      <div class="border-b px-6 py-4">
        <h3 class="text-lg font-semibold">{{ title }}</h3>
        <p class="text-sm text-slate-500">{{ description }}</p>
      </div>
      <div class="px-6 py-4">
        <slot />
      </div>
      <div class="flex justify-end gap-3 border-t px-6 py-4">
        <button
          class="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button
          class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          @click="$emit('confirm')"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  open: Boolean,
  title: {
    type: String,
    default: 'Confirm action'
  },
  description: {
    type: String,
    default: ''
  }
})

defineEmits(['confirm', 'cancel'])
</script>
