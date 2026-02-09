<template>
  <div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-sm font-medium text-slate-500">{{ label }}</p>
    <p class="mt-2 text-3xl font-semibold">{{ value }}</p>
    <p v-if="subValue" class="text-xs text-slate-400">{{ subValue }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string; value: string | number; subValue?: string }>()
</script>
