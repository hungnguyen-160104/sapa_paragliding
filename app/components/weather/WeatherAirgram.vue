<template>
  <!--
    AIRGRAM — gió theo độ cao, theo giờ: mỗi hàng một mực, từ ~3.000m xuống bãi
    cất rồi bãi hạ. Nhìn dọc một giờ là thấy gió tăng theo độ cao hay đổi hướng
    ở tầng nào (gió đứt) — thứ bảng mặt đất không hiện.
  -->
  <div v-if="cot.length >= 2" class="mt-2 rounded-xl border border-slate-200 bg-white">
    <div ref="khung" class="overflow-x-auto overscroll-x-contain" @scroll="onScroll">
      <div class="flex" :style="{ width: `${wNhan + rong}px` }">
        <div data-truc class="sticky left-0 z-20 shrink-0 border-r border-slate-200 bg-white" :style="{ width: `${wNhan}px` }">
          <div class="flex h-[22px] items-center border-b border-slate-200 bg-slate-50 px-1 text-[9px] font-bold text-slate-400">{{ nhan.amsl }}</div>
          <div :class="['h-[22px]', nhanTrai]">{{ nhan.gio }}</div>
          <div v-for="m in muc" :key="m.ten" :style="{ height: `${CAO}px` }" :class="[nhanTrai, 'leading-tight']">{{ m.ten }}</div>
        </div>
        <div :style="{ width: `${rong}px` }">
          <WeatherHangNgay :cot="cot" :w="W" />
          <WeatherHangGio :cot="cot" :w="W" />
          <div v-for="m in muc" :key="m.ten" class="relative border-t border-white">
            <WeatherHangGioMuc :cot="cot" :lay="m.lay" :lay-huong="m.layHuong" :cao="CAO" :w="W" :hep="hep" :nguong="nguong" />
            <!-- Nhiệt độ mực đó, chữ nhỏ góc phải — để thấy nghịch nhiệt (trên ấm hơn dưới). -->
            <div class="pointer-events-none absolute inset-0 flex">
              <div v-for="c in cot" :key="c.g.gio" :style="{ width: `${W}px` }" class="shrink-0 pr-1 pt-0.5 text-right text-[9px] font-semibold text-slate-700/80">
                {{ m.t(c.g) === undefined ? '' : `${Math.round(m.t(c.g) as number)}°` }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-100 px-2 py-1 text-[10px] leading-snug text-slate-500">{{ nhan.vuot }}</div>
  </div>
</template>

<script setup lang="ts">
import { dungCot, noiSuyGio, type GioTT, type NgayTT, type NguongMau } from '~/utils/weather'
import { useCuonTheoNgay, useManHinhHep } from '~/composables/useCuonTheoNgay'
import type { NhanMeteogram } from './WeatherMeteogram.vue'

const props = withDefaults(defineProps<{
  ngay: NgayTT[]
  nguong?: NguongMau | null
  altBai?: number
  altHa?: number
  altCat2?: number
  tuGio?: number
  denGio?: number
  ngayChon?: string | null
  nhan: NhanMeteogram
}>(), { altBai: 0, tuGio: 4, denGio: 21, ngayChon: null, nguong: null })
const emit = defineEmits<{ ngayHien: [ngay: string] }>()

const CAO = 46
const hep = useManHinhHep()
const W = computed(() => (hep.value ? 26 : 56))
const wNhan = computed(() => (hep.value ? 36 : 54))
const cot = computed(() => dungCot(props.ngay, hep.value ? Math.max(props.tuGio, 7) : props.tuGio, hep.value ? Math.min(props.denGio, 17) : props.denGio))
const rong = computed(() => cot.value.length * W.value)
const nhanTrai = computed(() => 'pt-1 font-bold text-slate-400 ' + (hep.value ? 'text-[9px] leading-tight' : 'text-[10px]'))
const ngayChonRef = computed(() => props.ngayChon)
const { khung, onScroll } = useCuonTheoNgay(ngayChonRef, (d) => emit('ngayHien', d))

type MucVe = { ten: string; lay: (g: GioTT) => number | undefined; layHuong: (g: GioTT) => number | undefined; t: (g: GioTT) => number | undefined }

/**
 * Airgram phủ đúng đường bay, TỪ BÃI HẠ LÊN: hàng dưới cùng là bãi hạ (gió 10m
 * mô hình), kế là bãi cất (nội suy đúng độ cao ấy), trên nữa là các mực mô
 * hình nằm CAO HƠN bãi cất — mực nào thấp hơn thì bỏ.
 */
const muc = computed<MucVe[]>(() => {
  const cs = cot.value
  const h925 = cs.map((c) => c.g.h925).find((x): x is number => typeof x === 'number')
  const h850 = cs.map((c) => c.g.h850).find((x): x is number => typeof x === 'number')
  const cao925 = h925 ?? 750
  const cao850 = h850 ?? 1500
  const altHa = props.altHa ?? 0
  const alt = props.altBai
  const tatCa: Array<MucVe & { cao: number }> = [
    { cao: 3000, ten: '~3000m', lay: (g) => g.gio700, layHuong: (g) => g.huong700, t: (g) => g.t700 },
    { cao: cao850, ten: `~${Math.round(cao850 / 50) * 50}m`, lay: (g) => g.gio850, layHuong: (g) => g.huong850, t: (g) => g.t850 },
    { cao: cao925, ten: `~${Math.round(cao925 / 50) * 50}m`, lay: (g) => g.gio925, layHuong: (g) => g.huong925, t: (g) => g.t925 }
  ]
  const tren: MucVe[] = tatCa.filter((m) => (alt ? m.cao > alt + 80 : true))
  const bai: MucVe[] = []
  if (alt) {
    bai.push({ ten: `${props.nhan.batDau} ${alt}m`, lay: (g) => noiSuyGio(g, alt, 'gio', altHa, cao925, cao850), layHuong: (g) => noiSuyGio(g, alt, 'huong', altHa, cao925, cao850), t: (g) => g.nhietDo })
  }
  if (props.altCat2) {
    const c2 = props.altCat2
    bai.push({ ten: `${props.nhan.batDau} ${c2}m`, lay: (g) => noiSuyGio(g, c2, 'gio', altHa, cao925, cao850), layHuong: (g) => noiSuyGio(g, c2, 'huong', altHa, cao925, cao850), t: (g) => g.nhietDo })
  }
  return [
    ...tren,
    ...bai,
    { ten: props.altHa !== undefined ? `${props.nhan.haCanh} ${props.altHa}m` : props.nhan.matDat, lay: (g) => g.gio10m, layHuong: (g) => g.huong, t: (g) => g.nhietDo }
  ]
})
</script>
