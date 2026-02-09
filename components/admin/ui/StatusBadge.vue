<template>
  <span :class="badgeClass" class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold">
    <slot />
  </span>
</template>

<script setup lang="ts">
const props = defineProps<{ tone?: 'success' | 'warning' | 'danger' | 'info' }>()

const palette: Record<NonNullable<typeof props.tone>, string> = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-slate-100 text-slate-700'
}

const badgeClass = computed(() => palette[props.tone || 'info'])
</script>
