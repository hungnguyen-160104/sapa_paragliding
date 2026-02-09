<template>
  <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ label }}</p>
        <p class="mt-1 text-2xl font-bold text-slate-900">
          {{ formattedValue }}
        </p>
        <p v-if="subtext" class="mt-1 text-xs text-slate-400">{{ subtext }}</p>
      </div>
      <div 
        v-if="icon"
        class="w-12 h-12 rounded-full flex items-center justify-center bg-red-50"
      >
        <component :is="icon" class="w-6 h-6 text-red-500" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string
  value: number | string
  format?: 'number' | 'currency' | 'percent'
  icon?: any
  subtext?: string
}>()

const formattedValue = computed(() => {
  const val = props.value
  if (typeof val === 'string') return val
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(val)
    case 'percent':
      return `${val.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('vi-VN').format(val)
  }
})
</script>
