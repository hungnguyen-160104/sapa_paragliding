<template>
  <!-- Mũi tên chỉ chiều gió ĐANG ĐI (hướng khí tượng là hướng thổi tới từ đâu → xoay thêm 180°). -->
  <svg viewBox="0 0 24 24" :class="['inline-block', sizeClass]" :style="{ transform: `rotate(${goc + 180}deg)` }" aria-hidden="true" focusable="false">
    <path d="M12 2 L20 12 H15.5 V22 H8.5 V12 H4 Z" fill="currentColor" />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ deg: number; sizeClass?: string }>(), { sizeClass: 'h-5 w-5' })
const goc = computed(() => (((props.deg ?? 0) % 360) + 360) % 360)
</script>
