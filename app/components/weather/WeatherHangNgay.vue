<template>
  <!-- Dải TIÊU ĐỀ NGÀY: nhãn dính trong ô ngày, chấm màu mức, tổng mưa, mọc/lặn. -->
  <div class="flex h-[22px] items-center border-b border-slate-200 bg-slate-50">
    <div
      v-for="(nh, k) in nhom"
      :key="nh.ngay.ngay"
      :data-ngay="nh.ngay.ngay"
      :style="{ width: `${nh.n * w}px` }"
      :class="['relative h-full shrink-0 overflow-hidden', k > 0 ? 'border-l-2 border-slate-300' : '']"
    >
      <div class="sticky left-0 inline-flex h-full items-center gap-1.5 whitespace-nowrap px-1.5 text-[11px] font-bold text-slate-800">
        <span class="inline-block h-2 w-2 rounded-full" :style="{ background: CHAM_NGAY[nh.ngay.muc] }" aria-hidden="true" />
        {{ nhanNgayHienThi(nh.ngay.ngay) }}
        <span v-if="nh.mua >= MUA_BAY" class="rounded bg-blue-600 px-1 text-[10px] font-black text-white">{{ nh.mua.toFixed(1) }}mm</span>
        <span v-if="nh.ngay.matTroi" class="text-[10px] font-medium text-amber-700">☀ {{ nh.ngay.matTroi.moc }}–{{ nh.ngay.matTroi.lan }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MUA_BAY, type Cot, type MucDo, type NgayTT } from '~/utils/weather'
import { useWeatherI18n } from '~/composables/useWeatherI18n'

const props = defineProps<{ cot: Cot[]; w: number }>()
const { nhanNgayHienThi } = useWeatherI18n()
const CHAM_NGAY: Record<MucDo, string> = { xanh: '#16a34a', vang: '#eab308', do: '#e11d48' }

const nhom = computed(() => {
  const ra: Array<{ ngay: NgayTT; n: number; mua: number }> = []
  for (const c of props.cot) {
    const cuoi = ra[ra.length - 1]
    if (cuoi && cuoi.ngay.ngay === c.ngay.ngay) cuoi.n++
    else ra.push({ ngay: c.ngay, n: 1, mua: c.ngay.muaTong ?? c.ngay.gio.reduce((t, g) => t + (g.mua >= MUA_BAY ? g.mua : 0), 0) })
  }
  return ra
})
</script>
