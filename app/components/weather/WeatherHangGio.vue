<template>
  <!-- Hàng GIỜ: số đậm mỗi 3 tiếng, nền tím khi đêm. -->
  <div class="flex h-[22px] items-center">
    <div
      v-for="c in cot"
      :key="c.g.gio"
      :style="{ width: `${w}px` }"
      :class="[
        'h-full shrink-0 pt-1 text-center font-bold',
        w <= 40 ? 'text-[10px]' : 'text-[11px]',
        c.dem ? 'bg-indigo-50' : '',
        c.dau ? 'border-l-2 border-slate-300' : '',
        c.h % 3 === 0 ? 'text-slate-800' : 'text-slate-400'
      ]"
    >
      {{ c.g.gio.slice(11, 13) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Cot } from '~/utils/weather'
defineProps<{ cot: Cot[]; w: number }>()
</script>
