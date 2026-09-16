<template>
  <!-- Hàng gió ở MỘT MỰC: mũi tên + tốc độ trên nền màu theo ngưỡng của điểm. -->
  <div class="flex items-stretch" :style="{ height: `${cao}px` }">
    <div
      v-for="c in cot"
      :key="c.g.gio"
      :style="styleO(c)"
      :class="['flex shrink-0 flex-col items-center justify-center', c.dau ? 'border-l-2 border-slate-300' : '']"
      :title="tooltip(c)"
    >
      <WeatherWindArrow v-if="layHuong(c.g) !== undefined && lay(c.g) !== undefined" :deg="layHuong(c.g) as number" :size-class="hep ? 'h-[16px] w-[16px]' : 'h-[20px] w-[20px]'" />
      <div :class="[hep ? 'text-[10px]' : 'text-[12px]', 'font-black leading-tight']">{{ lay(c.g) === undefined ? '–' : (lay(c.g) as number).toFixed(1) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { chuTrenNen, mauGio, type Cot, type GioTT, type NguongMau } from '~/utils/weather'
import { useWeatherI18n } from '~/composables/useWeatherI18n'

const props = defineProps<{
  cot: Cot[]
  lay: (g: GioTT) => number | undefined
  layHuong: (g: GioTT) => number | undefined
  cao: number
  w: number
  hep: boolean
  nguong?: NguongMau | null
}>()
const { tenHuong } = useWeatherI18n()

const styleO = (c: Cot) => {
  const v = props.lay(c.g)
  const bg = v === undefined ? '#f8fafc' : mauGio(v, props.nguong)
  return { width: `${props.w}px`, background: bg, color: chuTrenNen(bg) }
}
const tooltip = (c: Cot) => {
  const v = props.lay(c.g)
  const hd = props.layHuong(c.g)
  return v === undefined ? undefined : `${v.toFixed(1)} m/s${hd !== undefined ? ` · ${tenHuong(hd)}` : ''}`
}
</script>
