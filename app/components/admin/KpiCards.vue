<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div 
      v-for="card in cards" 
      :key="card.label"
      class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
    >
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-500">{{ card.label }}</p>
          <p class="mt-1 text-2xl font-bold" :class="card.color || 'text-gray-900'">
            {{ formatValue(card.value, card.format) }}
          </p>
          <p v-if="card.subtext" class="mt-1 text-xs text-gray-400">{{ card.subtext }}</p>
        </div>
        <div 
          class="w-12 h-12 rounded-full flex items-center justify-center"
          :class="card.bgColor || 'bg-gray-100'"
        >
          <component :is="card.icon" class="w-6 h-6" :class="card.iconColor || 'text-gray-600'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface KpiCard {
  label: string
  value: number | string
  format?: 'number' | 'currency' | 'percent'
  color?: string
  bgColor?: string
  iconColor?: string
  icon?: any
  subtext?: string
}

defineProps<{
  cards: KpiCard[]
}>()

const formatValue = (value: number | string, format?: string) => {
  if (typeof value === 'string') return value
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('vi-VN', { 
        style: 'currency', 
        currency: 'VND',
        maximumFractionDigits: 0
      }).format(value)
    case 'percent':
      return `${value.toFixed(1)}%`
    default:
      return new Intl.NumberFormat('vi-VN').format(value)
  }
}
</script>
