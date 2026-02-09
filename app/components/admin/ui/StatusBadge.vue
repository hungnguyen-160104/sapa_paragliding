<template>
  <span 
    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
    :class="badgeClasses"
  >
    <slot>{{ displayLabel }}</slot>
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{
  tone?: 'success' | 'warning' | 'error' | 'info' | 'default'
  status?: string
  type?: 'post' | 'booking' | 'contact'
}>()

const badgeClasses = computed(() => {
  // If tone is provided directly, use it
  if (props.tone) {
    switch (props.tone) {
      case 'success':
        return 'bg-green-100 text-green-800'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }
  
  // Otherwise derive from status and type
  const type = props.type || 'booking'
  
  if (type === 'post') {
    switch (props.status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-800'
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }
  
  if (type === 'contact') {
    switch (props.status) {
      case 'CONTACTED':
        return 'bg-blue-100 text-blue-800'
      case 'NOT_CONTACTED':
        return 'bg-slate-100 text-slate-800'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }
  
  // booking status
  switch (props.status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800'
    case 'CONFIRMED':
      return 'bg-blue-100 text-blue-800'
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-slate-100 text-slate-800'
  }
})

const displayLabel = computed(() => {
  if (!props.status) return ''
  
  const type = props.type || 'booking'
  
  if (type === 'post') {
    switch (props.status) {
      case 'PUBLISHED': return 'Đã xuất bản'
      case 'DRAFT': return 'Bản nháp'
      default: return props.status
    }
  }
  
  if (type === 'contact') {
    switch (props.status) {
      case 'CONTACTED': return 'Đã liên hệ'
      case 'NOT_CONTACTED': return 'Chưa liên hệ'
      default: return props.status
    }
  }
  
  switch (props.status) {
    case 'PENDING': return 'Chờ xác nhận'
    case 'CONFIRMED': return 'Đã xác nhận'
    case 'COMPLETED': return 'Hoàn thành'
    default: return props.status
  }
})
</script>
